/**
 * Product Image Scraper — Google Custom Search API (Image Search)
 * 100 free queries/day. Searches "brand + product name" and picks best image.
 *
 * Setup:
 *   1. Go to https://programmablesearchengine.google.com/ → Create search engine
 *   2. Enable "Search the entire web" + "Image search"
 *   3. Get Search Engine ID (cx)
 *   4. Go to https://console.cloud.google.com/apis/credentials → Create API key
 *   5. Enable "Custom Search API" in Google Cloud Console
 *
 * Run: GOOGLE_API_KEY=xxx GOOGLE_CX=yyy node src/database/seeds/scrape-images-google.js
 * Or:  node src/database/seeds/scrape-images-google.js --limit 100
 */
const { Client } = require('pg');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DB = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

if (!GOOGLE_API_KEY || !GOOGLE_CX) {
  console.error('Missing GOOGLE_API_KEY or GOOGLE_CX env vars.');
  console.log('\nSetup:');
  console.log('  1. https://programmablesearchengine.google.com/ → Create engine → Enable image search');
  console.log('  2. https://console.cloud.google.com/apis/credentials → Create API key');
  console.log('  3. Enable "Custom Search API" in Cloud Console');
  console.log('  4. Run: GOOGLE_API_KEY=xxx GOOGLE_CX=yyy node scrape-images-google.js');
  process.exit(1);
}

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '100');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function scoreImage(url, brandName) {
  let s = 0;
  // Prefer e-commerce CDNs
  if (url.includes('dsmcdn.com')) s += 15;
  if (url.includes('hepsiburada.net')) s += 12;
  if (url.includes('amazon.com')) s += 10;
  if (url.includes('gratis.com')) s += 8;
  if (url.includes('trendyol.com')) s += 8;
  // Prefer high-res
  if (url.includes('org_zoom') || url.includes('_org')) s += 5;
  // Prefer product images
  if (url.includes('product') || url.includes('prod')) s += 3;
  // Penalize non-product
  if (url.includes('logo') || url.includes('banner') || url.includes('icon')) s -= 20;
  if (url.includes('avatar') || url.includes('profile')) s -= 15;
  if (url.includes('placeholder') || url.includes('noimage')) s -= 20;
  // Penalize tiny images
  if (url.includes('50x50') || url.includes('100x100') || url.includes('thumb')) s -= 10;
  return s;
}

async function searchImage(brand, productName) {
  const query = `${brand} ${productName.replace(/\d+\s*(ml|g|gr|oz|fl\.?\s*oz)\b/gi, '').trim()} ürün`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&searchType=image&num=5&imgSize=large&lr=lang_tr`;

  const result = await fetchJSON(url);

  if (result.error) {
    if (result.error.code === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(result.error.message);
  }

  const items = result.items || [];
  if (items.length === 0) return null;

  // Score and pick best
  const scored = items.map(item => ({
    url: item.link,
    score: scoreImage(item.link, brand),
    title: item.title,
  }));
  scored.sort((a, b) => b.score - a.score);

  // Filter out obviously bad results
  const best = scored.find(s =>
    s.url.startsWith('http') &&
    !s.url.includes('dicebear') &&
    !s.url.includes('placehold') &&
    s.score > -5
  );

  return best ? best.url : null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected.\n');

  // Get products needing images
  const { rows: products } = await client.query(`
    SELECT p.product_id, p.product_name, b.brand_name,
           pi.image_id
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    JOIN product_images pi ON pi.product_id = p.product_id
    WHERE (pi.image_url LIKE '%dicebear%' OR pi.image_url LIKE '%placehold.co%')
    AND pi.image_id = (
      SELECT MIN(pi2.image_id) FROM product_images pi2
      WHERE pi2.product_id = p.product_id AND (pi2.image_url LIKE '%dicebear%' OR pi2.image_url LIKE '%placehold.co%')
    )
    ORDER BY b.brand_name, p.product_id
    LIMIT $1
  `, [LIMIT]);

  console.log(`Found ${products.length} products to process (limit: ${LIMIT})\n`);

  let updated = 0, noImage = 0, errors = 0, quotaHit = false;
  const startTime = Date.now();
  const logPath = path.join(__dirname, 'google-scrape-log.json');
  const results = [];

  for (let i = 0; i < products.length; i++) {
    if (quotaHit) break;

    const row = products[i];
    let imageUrl = null;

    try {
      imageUrl = await searchImage(row.brand_name, row.product_name);
      if (imageUrl) {
        await client.query('UPDATE product_images SET image_url = $1 WHERE image_id = $2', [imageUrl, row.image_id]);
        updated++;
        results.push({ productId: row.product_id, brand: row.brand_name, name: row.product_name, image: imageUrl, status: 'ok' });
      } else {
        noImage++;
        results.push({ productId: row.product_id, brand: row.brand_name, name: row.product_name, status: 'no_image' });
      }
    } catch (e) {
      if (e.message === 'QUOTA_EXCEEDED') {
        console.log(`\n⚠ Google API quota exceeded at ${i + 1}/${products.length}`);
        quotaHit = true;
        break;
      }
      errors++;
      results.push({ productId: row.product_id, brand: row.brand_name, name: row.product_name, status: 'error', error: e.message });
    }

    // Progress
    if ((i + 1) % 10 === 0 || i === products.length - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(`  [${i + 1}/${products.length}] updated: ${updated} | noImg: ${noImage} | err: ${errors} | ${elapsed}s`);
    }

    // 200ms delay to stay within rate limits
    await sleep(200);
  }

  // Save log
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2), 'utf8');

  console.log(`\n═══ RESULTS ═══`);
  console.log(`Processed: ${updated + noImage + errors}`);
  console.log(`Updated: ${updated}`);
  console.log(`No image: ${noImage}`);
  console.log(`Errors: ${errors}`);
  console.log(`Quota hit: ${quotaHit}`);
  console.log(`Time: ${((Date.now() - startTime) / 1000).toFixed(0)}s`);
  console.log(`Log: ${logPath}`);

  // Final stats
  const verify = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%' OR image_url LIKE '%placehold.co%') as placeholder,
      COUNT(*) FILTER (WHERE image_url LIKE '%dsmcdn%') as trendyol_cdn,
      COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%' AND image_url NOT LIKE '%placehold.co%') as real_total,
      COUNT(*) as total
    FROM product_images
  `);
  console.log('\nFinal image stats:', verify.rows[0]);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
