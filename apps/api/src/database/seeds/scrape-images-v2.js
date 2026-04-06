/**
 * Product Image Scraper v2 — Aggressive multi-strategy approach
 * 1. Brand CDN patterns (guaranteed quality)
 * 2. Trendyol direct product pages (og:image)
 * 3. Hepsiburada product pages (og:image)
 * 4. Trendyol search results (first result image)
 *
 * Run: node apps/api/src/database/seeds/scrape-images-v2.js
 */
const { Client } = require('pg');
const https = require('https');
const http = require('http');

const DB = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// ─── Brand CDN Patterns ───
// For brands with known CDN structures, generate image URLs from product slug
const BRAND_CDN = {
  'The Ordinary': (slug) => `https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dw/${slug}.jpg`,
  // These brands use Trendyol's CDN — we'll catch them via scraping
};

// ─── HTTP Fetch with browser-like headers ───
function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
      timeout: 12000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirect = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return fetchUrl(redirect, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ─── Image extraction strategies ───
function extractOgImage(html) {
  // og:image
  const og = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (og && og[1].startsWith('http') && !og[1].includes('logo') && !og[1].includes('favicon')) return og[1];
  return null;
}

function extractTrendyolImage(html) {
  // Trendyol stores product images in JSON-LD or specific img tags
  // Try JSON-LD first
  const jsonLd = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLd) {
    for (const block of jsonLd) {
      const content = block.replace(/<\/?script[^>]*>/gi, '');
      try {
        const data = JSON.parse(content);
        if (data.image) {
          const img = Array.isArray(data.image) ? data.image[0] : data.image;
          if (typeof img === 'string' && img.startsWith('http')) return img;
          if (img?.url) return img.url;
        }
      } catch {}
    }
  }

  // Try Trendyol CDN pattern in img tags
  const tyCdn = html.match(/https:\/\/cdn\.dsmcdn\.com\/[^"'\s]+(?:\.jpg|\.jpeg|\.png|\.webp)/i);
  if (tyCdn) return tyCdn[0];

  // Try product gallery image
  const gallery = html.match(/<img[^>]*class="[^"]*product[^"]*"[^>]*src="([^"]+)"/i)
    || html.match(/<img[^>]*data-src="(https:\/\/cdn[^"]+)"/i);
  if (gallery) return gallery[1];

  return null;
}

function extractHepsiburadaImage(html) {
  // Hepsiburada CDN
  const hbCdn = html.match(/https:\/\/productimages\.hepsiburada\.net\/[^"'\s]+(?:\.jpg|\.jpeg|\.png|\.webp)/i);
  if (hbCdn) return hbCdn[0];

  return extractOgImage(html);
}

function extractSearchResultImage(html) {
  // For Trendyol search results, find the first product card image
  const searchImg = html.match(/https:\/\/cdn\.dsmcdn\.com\/ty\d+\/prod[^"'\s]+(?:\.jpg|\.jpeg|\.png|\.webp)/i);
  if (searchImg) return searchImg[0];
  return null;
}

function isValidImage(url) {
  if (!url) return false;
  if (!url.startsWith('http')) return false;
  if (url.includes('placeholder') || url.includes('default') || url.includes('noimage')) return false;
  if (url.includes('logo') || url.includes('favicon') || url.includes('banner')) return false;
  if (url.includes('dicebear')) return false;
  return true;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tryFetchImage(url, extractFn) {
  try {
    const html = await fetchUrl(url);
    const img = extractFn(html);
    if (isValidImage(img)) return img;
    // Fallback to og:image
    const og = extractOgImage(html);
    if (isValidImage(og)) return og;
  } catch {}
  return null;
}

async function main() {
  const client = new Client(DB);
  await client.connect();
  console.log('Connected.');

  // Get all products with DiceBear images + their affiliate links
  const products = await client.query(`
    SELECT p.product_id, p.product_name, p.product_slug, b.brand_name,
           pi.image_id, pi.image_url as current_image,
           (SELECT al.affiliate_url FROM affiliate_links al
            WHERE al.product_id = p.product_id AND al.platform = 'trendyol'
            LIMIT 1) as trendyol_url,
           (SELECT al.affiliate_url FROM affiliate_links al
            WHERE al.product_id = p.product_id AND al.platform = 'hepsiburada'
            LIMIT 1) as hepsiburada_url
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    JOIN product_images pi ON pi.product_id = p.product_id
    WHERE pi.image_url LIKE '%dicebear%'
    AND pi.image_id = (
      SELECT MIN(pi2.image_id) FROM product_images pi2
      WHERE pi2.product_id = p.product_id AND pi2.image_url LIKE '%dicebear%'
    )
    ORDER BY b.brand_name, p.product_id
  `);

  console.log(`Found ${products.rows.length} products with DiceBear images\n`);

  let updated = 0, failed = 0, noImage = 0;
  const stats = { trendyol_direct: 0, trendyol_search: 0, hepsiburada: 0 };

  for (let i = 0; i < products.rows.length; i++) {
    const row = products.rows[i];
    let imageUrl = null;

    // Strategy 1: Trendyol direct product URL (not search)
    if (!imageUrl && row.trendyol_url && !row.trendyol_url.includes('/sr?')) {
      imageUrl = await tryFetchImage(row.trendyol_url, extractTrendyolImage);
      if (imageUrl) stats.trendyol_direct++;
      await sleep(200);
    }

    // Strategy 2: Hepsiburada URL
    if (!imageUrl && row.hepsiburada_url && !row.hepsiburada_url.includes('/ara?')) {
      imageUrl = await tryFetchImage(row.hepsiburada_url, extractHepsiburadaImage);
      if (imageUrl) stats.hepsiburada++;
      await sleep(200);
    }

    // Strategy 3: Trendyol search URL (extract first result image)
    if (!imageUrl && row.trendyol_url && row.trendyol_url.includes('/sr?')) {
      imageUrl = await tryFetchImage(row.trendyol_url, extractSearchResultImage);
      if (imageUrl) stats.trendyol_search++;
      await sleep(200);
    }

    if (imageUrl) {
      await client.query(
        'UPDATE product_images SET image_url = $1 WHERE image_id = $2',
        [imageUrl, row.image_id]
      );
      updated++;
    } else {
      noImage++;
    }

    // Progress every 100
    if ((i + 1) % 100 === 0) {
      console.log(`  [${i + 1}/${products.rows.length}] updated: ${updated} | no-image: ${noImage} | ty-direct: ${stats.trendyol_direct} | hb: ${stats.hepsiburada} | ty-search: ${stats.trendyol_search}`);
    }
  }

  console.log(`\n═══ FINAL RESULTS ═══`);
  console.log(`Updated: ${updated}`);
  console.log(`No image: ${noImage}`);
  console.log(`Source breakdown: Trendyol direct=${stats.trendyol_direct}, Hepsiburada=${stats.hepsiburada}, Trendyol search=${stats.trendyol_search}`);

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
