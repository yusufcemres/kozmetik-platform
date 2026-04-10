/**
 * Product Image Scraper — Bing Image Search (HTML scraping)
 * No API key needed. Searches "brand + product name + trendyol" on Bing Images.
 * 3-5s delay between requests to avoid rate limiting.
 *
 * Run from apps/api: node src/database/seeds/scrape-images-bing.js [--limit=100]
 */
const { Client } = require('pg');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DB = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const LIMIT = parseInt((process.argv.find(a => a.startsWith('--limit=')) || '--limit=1500').split('=')[1]);

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
];
let uaIdx = 0;
function getUA() { return USER_AGENTS[uaIdx++ % USER_AGENTS.length]; }

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': getUA(),
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
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

function extractBingImages(html) {
  const images = [];

  // Bing embeds image URLs in "murl" parameter (media URL)
  const murlMatches = html.matchAll(/murl[&quot;:]*"?(https?:\/\/[^"&]+\.(?:jpg|jpeg|png|webp))/gi);
  for (const m of murlMatches) {
    const url = decodeURIComponent(m[1]);
    images.push(url);
  }

  // Also check for "imgurl" pattern
  const imgUrlMatches = html.matchAll(/imgurl:(https?:\/\/[^&"]+)/gi);
  for (const m of imgUrlMatches) {
    images.push(decodeURIComponent(m[1]));
  }

  // Direct CDN pattern matches
  const cdnPatterns = [
    /https?:\/\/cdn\.dsmcdn\.com\/[^\s"'<>&]+?\.(?:jpg|jpeg|png|webp)/gi,
    /https?:\/\/productimages\.hepsiburada\.net\/[^\s"'<>&]+?\.(?:jpg|jpeg|png|webp)/gi,
    /https?:\/\/m\.media-amazon\.com\/images\/[^\s"'<>&]+?\.(?:jpg|jpeg|png|webp)/gi,
  ];
  for (const pat of cdnPatterns) {
    for (const m of html.matchAll(pat)) {
      images.push(m[0]);
    }
  }

  // Deduplicate
  const unique = [...new Set(images)];

  // Filter
  return unique.filter(url => {
    if (!url.startsWith('http')) return false;
    if (url.includes('bing.com') || url.includes('microsoft.com')) return false;
    if (url.includes('logo') || url.includes('favicon') || url.includes('banner')) return false;
    if (url.includes('placeholder') || url.includes('noimage') || url.includes('dicebear')) return false;
    if (url.length < 30) return false;
    return true;
  });
}

function scoreImage(url) {
  let s = 0;
  if (url.includes('dsmcdn.com')) s += 15;
  if (url.includes('hepsiburada.net')) s += 12;
  if (url.includes('media-amazon.com')) s += 10;
  if (url.includes('org_zoom')) s += 5;
  if (url.includes('_org')) s += 3;
  if (/\/1[_.]/.test(url)) s += 2;
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
    LIMIT $1
  `, [LIMIT]);

  const total = products.length;
  console.log(`Found ${total} products (limit: ${LIMIT})\n`);

  // Test
  console.log('Testing Bing...');
  try {
    const test = await searchBing('CeraVe Moisturizing Cream trendyol');
    console.log(test ? `OK: ${test.slice(0, 80)}...\n` : 'WARNING: no test result\n');
  } catch (e) {
    console.log(`WARNING: test error: ${e.message}\n`);
  }

  let updated = 0, noImage = 0, errors = 0;
  let consecutiveFails = 0;
  const startTime = Date.now();

  for (let i = 0; i < total; i++) {
    const row = products[i];
    // Search with brand + product name (cleaned) + "trendyol" for better results
    const cleaned = row.product_name
      .replace(/\d+\s*(ml|g|gr|oz|fl\.?\s*oz)\b/gi, '')
      .replace(/[()[\]{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const query = `${row.brand_name} ${cleaned} trendyol`;

    let imageUrl = null;
    try {
      imageUrl = await searchBing(query);
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

    // Rate limit protection
    if (consecutiveFails >= 20) {
      console.log(`  ⚠ 20 consecutive fails — pausing 120s...`);
      await sleep(120000);
      consecutiveFails = 0;
    }

    // Progress every 25
    if ((i + 1) % 25 === 0 || i === total - 1) {
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      const rate = ((updated / (i + 1)) * 100).toFixed(0);
      const eta = ((total - i - 1) * (Date.now() - startTime) / (i + 1) / 60000).toFixed(0);
      console.log(`  [${i + 1}/${total}] updated: ${updated} (${rate}%) | noImg: ${noImage} | err: ${errors} | ${elapsed}min | ~${eta}min left`);
    }

    // 3-6 second delay
    await sleep(rand(3000, 6000));
  }

  console.log(`\n═══ FINAL RESULTS ═══`);
  console.log(`Updated: ${updated} / ${total}`);
  console.log(`No image: ${noImage}`);
  console.log(`Errors: ${errors}`);
  console.log(`Success rate: ${(updated / total * 100).toFixed(1)}%`);
  console.log(`Time: ${((Date.now() - startTime) / 60000).toFixed(1)} minutes`);

  const verify = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%' OR image_url LIKE '%placehold.co%') as placeholder,
      COUNT(*) FILTER (WHERE image_url LIKE '%dsmcdn%') as trendyol_cdn,
      COUNT(*) FILTER (WHERE image_url LIKE '%hepsiburada%') as hepsiburada_cdn,
      COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%' AND image_url NOT LIKE '%placehold.co%') as real_total,
      COUNT(*) as total
    FROM product_images
  `);
  console.log('Final image stats:', verify.rows[0]);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
