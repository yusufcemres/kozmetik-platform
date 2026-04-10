/**
 * Update product images from Apify scraper output.
 * Reads apify-output.json (Trendyol/HB scraper results), matches to products, updates DB.
 *
 * Apify Trendyol scraper output format (expected):
 *   { url, title, images: [url1, url2, ...], ... }
 *
 * Run from apps/api: node src/database/seeds/update-images-from-apify.js [filename]
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Pick best image from array
function pickBestImage(images) {
  if (!images || images.length === 0) return null;

  // Score each image
  const scored = images.map(url => {
    let s = 0;
    if (typeof url !== 'string') return { url: '', score: -999 };
    // Prefer high-res
    if (url.includes('org_zoom')) s += 10;
    if (url.includes('_org')) s += 5;
    // Prefer CDN
    if (url.includes('dsmcdn.com')) s += 8;
    if (url.includes('hepsiburada.net')) s += 6;
    // Prefer first/main image
    if (/\/1[_.]/.test(url) || url.includes('/1_')) s += 3;
    // Penalize thumbnails
    if (url.includes('mnresize') || url.includes('thumb')) s -= 5;
    if (url.includes('50x50') || url.includes('100x100')) s -= 10;
    // Penalize non-product
    if (url.includes('logo') || url.includes('banner') || url.includes('placeholder')) s -= 20;
    return { url, score: s };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.url || null;
}

// Extract product ID from Trendyol URL
function extractTrendyolId(url) {
  const match = url.match(/-p-(\d+)/);
  return match ? match[1] : null;
}

async function main() {
  const inputFile = process.argv[2] || 'apify-output.json';
  const inputPath = path.join(__dirname, inputFile);

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    console.log('\nUsage: node update-images-from-apify.js [filename.json]');
    console.log('Expected Apify output format: [{ url, images: [...], ... }, ...]');
    process.exit(1);
  }

  const apifyData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Loaded ${apifyData.length} items from ${inputFile}\n`);

  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to DB.\n');

  // Load mapping: affiliate URL → (product_id, image_id)
  const { rows: mapping } = await client.query(`
    SELECT p.product_id, pi.image_id, al.affiliate_url, al.platform
    FROM products p
    JOIN product_images pi ON pi.product_id = p.product_id
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.is_active = true
    WHERE (pi.image_url LIKE '%dicebear%' OR pi.image_url LIKE '%placehold.co%')
    AND pi.image_id = (
      SELECT MIN(pi2.image_id) FROM product_images pi2
      WHERE pi2.product_id = p.product_id AND (pi2.image_url LIKE '%dicebear%' OR pi2.image_url LIKE '%placehold.co%')
    )
  `);

  // Build lookup maps
  const urlToProduct = new Map();
  const trendyolIdToProduct = new Map();
  for (const row of mapping) {
    urlToProduct.set(row.affiliate_url, row);
    // Also index by Trendyol product ID
    const tyId = extractTrendyolId(row.affiliate_url);
    if (tyId) trendyolIdToProduct.set(tyId, row);
  }

  console.log(`Loaded ${mapping.length} placeholder products for matching\n`);

  let updated = 0, noImage = 0, noMatch = 0;

  for (const item of apifyData) {
    // Try to match by URL
    const itemUrl = item.url || item.productUrl || item.link || '';
    let product = urlToProduct.get(itemUrl);

    // Fallback: match by Trendyol product ID
    if (!product) {
      const tyId = extractTrendyolId(itemUrl);
      if (tyId) product = trendyolIdToProduct.get(tyId);
    }

    if (!product) {
      noMatch++;
      continue;
    }

    // Extract images — Apify actors use various field names
    const images = item.images || item.imageUrls || item.productImages || item.gallery || [];
    // Some actors return single image field
    const singleImage = item.image || item.imageUrl || item.mainImage || item.thumbnailUrl || null;

    const allImages = Array.isArray(images) ? images : [];
    if (singleImage && typeof singleImage === 'string') allImages.unshift(singleImage);

    const bestImage = pickBestImage(allImages);

    if (!bestImage || !bestImage.startsWith('http')) {
      noImage++;
      continue;
    }

    await client.query(
      'UPDATE product_images SET image_url = $1 WHERE image_id = $2',
      [bestImage, product.image_id]
    );
    updated++;

    if (updated % 50 === 0) {
      console.log(`  ${updated} updated...`);
    }
  }

  console.log(`\n═══ RESULTS ═══`);
  console.log(`Apify items: ${apifyData.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`No image found: ${noImage}`);
  console.log(`No product match: ${noMatch}`);

  // Final stats
  const verify = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%' OR image_url LIKE '%placehold.co%') as placeholder,
      COUNT(*) FILTER (WHERE image_url LIKE '%dsmcdn%') as trendyol_cdn,
      COUNT(*) FILTER (WHERE image_url LIKE '%hepsiburada%') as hepsiburada_cdn,
      COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%' AND image_url NOT LIKE '%placehold.co%') as real_total,
      COUNT(*) as total
    FROM product_images
  `);
  console.log('\nFinal image stats:', verify.rows[0]);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
