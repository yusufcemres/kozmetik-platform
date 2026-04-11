/**
 * Bing Image Scraper — Batch 8 products only
 * Searches for images of newly added products (ID >= 1882)
 */
const { Client } = require('pg');
const https = require('https');

const DB = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
];
let uaIdx = 0;
function getUA() { return USER_AGENTS[uaIdx++ % USER_AGENTS.length]; }

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': getUA(), 'Accept': 'text/html,*/*', 'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8', 'Accept-Encoding': 'identity' },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractBingImages(html) {
  const images = [];
  for (const m of html.matchAll(/murl[&quot;:]*"?(https?:\/\/[^"&]+\.(?:jpg|jpeg|png|webp))/gi)) {
    images.push(decodeURIComponent(m[1]));
  }
  for (const m of html.matchAll(/imgurl:(https?:\/\/[^&"]+)/gi)) {
    images.push(decodeURIComponent(m[1]));
  }
  const cdnPatterns = [
    /https?:\/\/cdn\.dsmcdn\.com\/[^\s"'<>&]+?\.(?:jpg|jpeg|png|webp)/gi,
    /https?:\/\/productimages\.hepsiburada\.net\/[^\s"'<>&]+?\.(?:jpg|jpeg|png|webp)/gi,
    /https?:\/\/m\.media-amazon\.com\/images\/[^\s"'<>&]+?\.(?:jpg|jpeg|png|webp)/gi,
  ];
  for (const pat of cdnPatterns) for (const m of html.matchAll(pat)) images.push(m[0]);
  return [...new Set(images)].filter(url =>
    url.startsWith('http') && !url.includes('bing.com') && !url.includes('microsoft.com') &&
    !url.includes('logo') && !url.includes('favicon') && !url.includes('placeholder') &&
    !url.includes('dicebear') && url.length >= 30
  );
}

function scoreImage(url) {
  let s = 0;
  if (url.includes('dsmcdn.com')) s += 15;
  if (url.includes('hepsiburada.net')) s += 12;
  if (url.includes('media-amazon.com')) s += 10;
  if (url.includes('org_zoom')) s += 5;
  if (url.includes('_org')) s += 3;
  if (url.includes('mnresize') || url.includes('thumb')) s -= 3;
  if (url.includes('50x50') || url.includes('100x100')) s -= 10;
  return s;
}

async function searchBing(query) {
  const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&qft=+filterui:photo-photo&FORM=IRFLTR&first=1';
  const html = await fetchHtml(url);
  const images = extractBingImages(html);
  if (images.length === 0) return null;
  images.sort((a, b) => scoreImage(b) - scoreImage(a));
  return images[0];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(min, max) { return min + Math.random() * (max - min); }

async function main() {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected.\n');

  const { rows: products } = await client.query(`
    SELECT p.product_id, p.product_name, b.brand_name, pi.image_id
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    JOIN product_images pi ON pi.product_id = p.product_id
    WHERE p.product_id >= 1882
    AND (pi.image_url LIKE '%placehold%' OR pi.image_url LIKE '%dicebear%')
    ORDER BY p.product_id
  `);

  console.log(`Found ${products.length} batch8 products to scrape\n`);

  let updated = 0, noImage = 0, errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < products.length; i++) {
    const row = products[i];
    const cleaned = row.product_name.replace(/\d+\s*(ml|g|gr|oz)\b/gi, '').replace(/[()[\]{}]/g, '').trim();
    const query = `${row.brand_name} ${cleaned} trendyol`;

    try {
      const imageUrl = await searchBing(query);
      if (imageUrl) {
        await client.query('UPDATE product_images SET image_url = $1 WHERE image_id = $2', [imageUrl, row.image_id]);
        updated++;
      } else {
        noImage++;
      }
    } catch (e) {
      errors++;
    }

    if ((i + 1) % 10 === 0 || i === products.length - 1) {
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      console.log(`  [${i + 1}/${products.length}] updated: ${updated} | noImg: ${noImage} | err: ${errors} | ${elapsed}min`);
    }

    await sleep(rand(3000, 6000));
  }

  console.log(`\n═══ BATCH 8 RESULTS ═══`);
  console.log(`Updated: ${updated} / ${products.length}`);
  console.log(`No image: ${noImage}`);
  console.log(`Errors: ${errors}`);
  console.log(`Time: ${((Date.now() - startTime) / 60000).toFixed(1)} minutes`);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
