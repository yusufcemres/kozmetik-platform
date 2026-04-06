/**
 * Scrapes real product images from affiliate URLs (Trendyol/Hepsiburada)
 * Extracts og:image meta tag and updates product_images table
 *
 * Run: node apps/api/src/database/seeds/scrape-product-images.js
 */
const { Client } = require('pg');
const https = require('https');
const http = require('http');

const DB = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      timeout: 10000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirect = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return fetchUrl(redirect, maxRedirects - 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractOgImage(html) {
  // Try og:image first
  const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (ogMatch) return ogMatch[1];

  // Try twitter:image
  const twMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  if (twMatch) return twMatch[1];

  // Try JSON-LD image
  const ldMatch = html.match(/"image"\s*:\s*"([^"]+)"/);
  if (ldMatch && ldMatch[1].startsWith('http')) return ldMatch[1];

  return null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const client = new Client(DB);
  await client.connect();
  console.log('Connected.');

  // Get all products with DiceBear images + their affiliate links
  const products = await client.query(`
    SELECT DISTINCT p.product_id, p.product_name, p.product_slug,
           pi.image_id, pi.image_url as current_image,
           (SELECT al.affiliate_url FROM affiliate_links al
            WHERE al.product_id = p.product_id AND al.platform = 'trendyol'
            LIMIT 1) as trendyol_url,
           (SELECT al.affiliate_url FROM affiliate_links al
            WHERE al.product_id = p.product_id AND al.platform = 'hepsiburada'
            LIMIT 1) as hepsiburada_url
    FROM products p
    JOIN product_images pi ON pi.product_id = p.product_id
    WHERE pi.image_url LIKE '%dicebear%'
    AND pi.image_id = (SELECT MIN(pi2.image_id) FROM product_images pi2 WHERE pi2.product_id = p.product_id AND pi2.image_url LIKE '%dicebear%')
    ORDER BY p.product_id
  `);

  console.log(`Found ${products.rows.length} products with DiceBear images`);

  let updated = 0;
  let failed = 0;
  let noImage = 0;

  for (let i = 0; i < products.rows.length; i++) {
    const row = products.rows[i];
    const url = row.trendyol_url || row.hepsiburada_url;

    if (!url) {
      failed++;
      continue;
    }

    try {
      const html = await fetchUrl(url);
      const imageUrl = extractOgImage(html);

      if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('placeholder') && !imageUrl.includes('default')) {
        await client.query(
          'UPDATE product_images SET image_url = $1 WHERE image_id = $2',
          [imageUrl, row.image_id]
        );
        updated++;
        if (updated % 50 === 0) {
          console.log(`  Progress: ${updated} updated, ${failed} failed, ${noImage} no-image (${i + 1}/${products.rows.length})`);
        }
      } else {
        noImage++;
      }
    } catch (e) {
      failed++;
    }

    // Rate limit: 300ms between requests
    await sleep(300);
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Updated: ${updated}`);
  console.log(`No image found: ${noImage}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total processed: ${products.rows.length}`);

  // Verify
  const stats = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%') as dicebear,
      COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%') as real_images,
      COUNT(*) as total
    FROM product_images
  `);
  console.log(`\nFinal image stats:`, stats.rows[0]);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
