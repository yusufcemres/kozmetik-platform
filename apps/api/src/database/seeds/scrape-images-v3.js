/**
 * Product Image Scraper v3 — Yandex Image Search (optimized)
 * Single query per product, 5s delay, smart query construction.
 *
 * Run from apps/api: node src/database/seeds/scrape-images-v3.js
 */
const { Client } = require('pg');
const https = require('https');

const DB = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// ─── Rotate User-Agents ───
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

let uaIndex = 0;
function getUA() { return USER_AGENTS[uaIndex++ % USER_AGENTS.length]; }

// ─── HTTPS fetch ───
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': getUA(),
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8',
        'Accept-Encoding': 'identity',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redir = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return fetchHtml(redir).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ─── Extract images from Yandex HTML ───
function extractYandexImages(html) {
  const images = new Set();

  // origUrl from embedded JSON
  const origUrls = html.matchAll(/"origUrl"\s*:\s*"([^"]+)"/g);
  for (const m of origUrls) images.add(m[1]);

  // img_href from data
  const imgHrefs = html.matchAll(/"img_href"\s*:\s*"([^"]+)"/g);
  for (const m of imgHrefs) images.add(m[1]);

  // Direct CDN URLs as fallback
  if (images.size === 0) {
    const cdnUrls = html.matchAll(/https?:\/\/cdn\.dsmcdn\.com\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp)/gi);
    for (const m of cdnUrls) images.add(m[0]);
    const hbUrls = html.matchAll(/https?:\/\/productimages\.hepsiburada\.net\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp)/gi);
    for (const m of hbUrls) images.add(m[0]);
  }

  return [...images].filter(url => {
    if (!url.startsWith('http')) return false;
    if (url.includes('logo') || url.includes('favicon') || url.includes('banner')) return false;
    if (url.includes('placeholder') || url.includes('noimage')) return false;
    if (url.includes('dicebear')) return false;
    return true;
  });
}

// ─── Score image quality ───
function scoreImage(url) {
  let s = 0;
  if (url.includes('dsmcdn.com')) s += 10;
  if (url.includes('hepsiburada.net')) s += 8;
  if (url.includes('org_zoom')) s += 5;
  if (url.includes('_org')) s += 3;
  if (/\/1[_.]/.test(url)) s += 2;
  if (url.includes('mnresize')) s -= 1;
  return s;
}

// ─── Search Yandex Images ───
async function searchYandex(query) {
  const url = 'https://yandex.com.tr/gorsel/search?text=' + encodeURIComponent(query) + '&nomisspell=1&noreask=1';
  const html = await fetchHtml(url);
  const images = extractYandexImages(html);
  if (images.length === 0) return null;
  images.sort((a, b) => scoreImage(b) - scoreImage(a));
  return images[0];
}

// ─── Build single best query ───
function buildQuery(brandName, productName) {
  // Remove size info for better search matching
  const cleaned = productName
    .replace(/\d+\s*(ml|g|gr|oz|fl\.?\s*oz)\b/gi, '')
    .replace(/[()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${brandName} ${cleaned}`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(min, max) { return min + Math.random() * (max - min); }

async function main() {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected.\n');

  const products = await client.query(`
    SELECT p.product_id, p.product_name, p.product_slug, b.brand_name,
           pi.image_id, pi.image_url as current_image
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    JOIN product_images pi ON pi.product_id = p.product_id
    WHERE (pi.image_url LIKE '%dicebear%' OR pi.image_url LIKE '%placehold.co%')
    AND pi.image_id = (
      SELECT MIN(pi2.image_id) FROM product_images pi2
      WHERE pi2.product_id = p.product_id AND (pi2.image_url LIKE '%dicebear%' OR pi2.image_url LIKE '%placehold.co%')
    )
    ORDER BY b.brand_name, p.product_id
  `);

  const total = products.rows.length;
  console.log(`Found ${total} products with DiceBear images\n`);

  // Test
  console.log('Testing Yandex...');
  try {
    const test = await searchYandex('CeraVe Moisturizing Cream');
    console.log(test ? `OK: ${test.slice(0, 80)}...\n` : 'WARNING: no test result\n');
  } catch (e) {
    console.log(`WARNING: test error: ${e.message}\n`);
  }

  let updated = 0, noImage = 0, errors = 0;
  let consecutiveFails = 0;
  const startTime = Date.now();

  for (let i = 0; i < total; i++) {
    const row = products.rows[i];
    const query = buildQuery(row.brand_name, row.product_name);
    let imageUrl = null;

    try {
      imageUrl = await searchYandex(query);
      if (imageUrl) {
        await client.query('UPDATE product_images SET image_url = $1 WHERE image_id = $2', [imageUrl, row.image_id]);
        updated++;
        consecutiveFails = 0;
      } else {
        noImage++;
        consecutiveFails++;
      }
    } catch (e) {
      errors++;
      consecutiveFails++;
    }

    // If blocked, longer pause
    if (consecutiveFails >= 15) {
      console.log(`  ⚠ 15 fails — pausing 90s...`);
      await sleep(90000);
      consecutiveFails = 0;
    }

    // Progress every 25
    if ((i + 1) % 25 === 0 || i === total - 1) {
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      const rate = ((updated / (i + 1)) * 100).toFixed(0);
      const eta = ((total - i - 1) * (Date.now() - startTime) / (i + 1) / 60000).toFixed(0);
      console.log(`  [${i + 1}/${total}] updated: ${updated} (${rate}%) | noImg: ${noImage} | err: ${errors} | ${elapsed}min elapsed | ~${eta}min left`);
    }

    // 4-7 second random delay between requests
    await sleep(rand(4000, 7000));
  }

  console.log(`\n═══ FINAL RESULTS ═══`);
  console.log(`Updated: ${updated} / ${total}`);
  console.log(`No image: ${noImage}`);
  console.log(`Errors: ${errors}`);
  console.log(`Success rate: ${(updated / total * 100).toFixed(1)}%`);
  console.log(`Time: ${((Date.now() - startTime) / 60000).toFixed(1)} minutes`);

  const verify = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%') as dicebear,
      COUNT(*) FILTER (WHERE image_url LIKE '%dsmcdn%') as trendyol_cdn,
      COUNT(*) FILTER (WHERE image_url LIKE '%hepsiburada%') as hepsiburada_cdn,
      COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%') as real_total,
      COUNT(*) as total
    FROM product_images
  `);
  console.log('Final image stats:', verify.rows[0]);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
