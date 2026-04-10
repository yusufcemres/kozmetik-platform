/**
 * Export Trendyol affiliate URLs for products with placeholder images.
 * Output: trendyol-urls.json — array of { productId, imageId, url } for Apify input.
 *
 * Run from apps/api: node src/database/seeds/export-trendyol-urls.js
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected.\n');

  // Products with placeholder images that have Trendyol affiliate links
  const { rows } = await client.query(`
    SELECT p.product_id, p.product_name, b.brand_name,
           pi.image_id,
           al.affiliate_link_id, al.affiliate_url, al.verification_status
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    JOIN product_images pi ON pi.product_id = p.product_id
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.platform = 'trendyol' AND al.is_active = true
    WHERE (pi.image_url LIKE '%dicebear%' OR pi.image_url LIKE '%placehold.co%')
    AND pi.image_id = (
      SELECT MIN(pi2.image_id) FROM product_images pi2
      WHERE pi2.product_id = p.product_id AND (pi2.image_url LIKE '%dicebear%' OR pi2.image_url LIKE '%placehold.co%')
    )
    ORDER BY al.verification_status DESC, b.brand_name
  `);

  console.log(`Found ${rows.length} placeholder products with Trendyol links\n`);

  // Status breakdown
  const statusCounts = {};
  rows.forEach(r => {
    statusCounts[r.verification_status] = (statusCounts[r.verification_status] || 0) + 1;
  });
  console.log('Verification status breakdown:', statusCounts);

  // Export URLs for Apify (just the URLs, one per line for easy input)
  const urlList = rows.map(r => r.affiliate_url);
  const detailed = rows.map(r => ({
    productId: r.product_id,
    imageId: r.image_id,
    brandName: r.brand_name,
    productName: r.product_name,
    affiliateLinkId: r.affiliate_link_id,
    url: r.affiliate_url,
    status: r.verification_status,
  }));

  // Write files
  const urlsPath = path.join(__dirname, 'trendyol-urls.txt');
  const detailedPath = path.join(__dirname, 'trendyol-urls-detailed.json');

  fs.writeFileSync(urlsPath, urlList.join('\n'), 'utf8');
  fs.writeFileSync(detailedPath, JSON.stringify(detailed, null, 2), 'utf8');

  console.log(`\nWritten ${urlList.length} URLs to trendyol-urls.txt`);
  console.log(`Written detailed data to trendyol-urls-detailed.json`);

  // Also export HepsiBurada URLs for Katman 3
  const { rows: hbRows } = await client.query(`
    SELECT p.product_id, p.product_name, b.brand_name,
           pi.image_id,
           al.affiliate_link_id, al.affiliate_url
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    JOIN product_images pi ON pi.product_id = p.product_id
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.platform = 'hepsiburada' AND al.is_active = true
    WHERE (pi.image_url LIKE '%dicebear%' OR pi.image_url LIKE '%placehold.co%')
    AND pi.image_id = (
      SELECT MIN(pi2.image_id) FROM product_images pi2
      WHERE pi2.product_id = p.product_id AND (pi2.image_url LIKE '%dicebear%' OR pi2.image_url LIKE '%placehold.co%')
    )
    ORDER BY b.brand_name
  `);

  const hbUrlsPath = path.join(__dirname, 'hepsiburada-urls.txt');
  fs.writeFileSync(hbUrlsPath, hbRows.map(r => r.affiliate_url).join('\n'), 'utf8');
  console.log(`Written ${hbRows.length} HepsiBurada URLs to hepsiburada-urls.txt`);

  // Stats
  const verify = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%' OR image_url LIKE '%placehold.co%') as placeholder,
      COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%' AND image_url NOT LIKE '%placehold.co%') as real_total,
      COUNT(*) as total
    FROM product_images
  `);
  console.log('\nCurrent image stats:', verify.rows[0]);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
