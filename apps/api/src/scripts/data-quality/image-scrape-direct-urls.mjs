/**
 * Draft ürünler için: DIRECT product URL olan affiliate_links'ten og:image çek.
 * search?q= veya /ara?q= URL'lerini atla — bunlar arama sayfası.
 * Trendyol /p/ veya HB /slug-p-HB pattern'larını hedefle.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const PARALLEL = 5;
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '2000');

const client = new Client({ connectionString: process.env.DATABASE_URL });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeOgImage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (m && m[1].startsWith('http')) return m[1].split('?')[0];
    // Also try JSON-LD image
    const jsonM = html.match(/"image"\s*:\s*"(https?:[^"]+)"/);
    if (jsonM && jsonM[1].startsWith('http')) return jsonM[1].split('?')[0];
    return null;
  } catch { return null; }
}

function isDirectProductUrl(url) {
  // Skip search/listing pages
  if (/[?&]q=|\/search|\/ara\?|\/sr\?/.test(url)) return false;
  // Skip other non-product pages
  if (/\.(css|js|png|jpg|gif)$/.test(url)) return false;
  return true;
}

await client.connect();

// Get draft products with direct (non-search) affiliate URLs, no images, INCI>=5
const { rows: targets } = await client.query(`
  SELECT DISTINCT ON (p.product_id)
    p.product_id, p.product_name, al.affiliate_url, al.platform
  FROM products p
  JOIN affiliate_links al ON al.product_id = p.product_id AND al.is_active=true
  LEFT JOIN (
    SELECT product_id, COUNT(*) as inci_count FROM product_ingredients GROUP BY product_id
  ) ici ON ici.product_id = p.product_id
  WHERE p.status = 'draft'
    AND (ici.inci_count IS NULL OR ici.inci_count >= 5)
    AND NOT EXISTS (SELECT 1 FROM product_images pim WHERE pim.product_id = p.product_id)
    AND al.affiliate_url NOT LIKE '%/sr?%'
    AND al.affiliate_url NOT LIKE '%/ara?%'
    AND al.affiliate_url NOT LIKE '%search?q=%'
    AND al.affiliate_url NOT LIKE '%/search?%'
  ORDER BY p.product_id DESC,
    CASE al.platform
      WHEN 'trendyol' THEN 1
      WHEN 'hepsiburada' THEN 2
      ELSE 3
    END
  LIMIT $1
`, [LIMIT]);

console.log(`Direct URL image scrape targets: ${targets.length}\n`);

let success = 0, failed = 0;
for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (p) => {
    if (!isDirectProductUrl(p.affiliate_url)) return { id: p.product_id, found: false };
    const img = await scrapeOgImage(p.affiliate_url);
    if (!img) return { id: p.product_id, found: false };
    try {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, created_at)
         VALUES ($1, $2, $3, 0, NOW())
         ON CONFLICT DO NOTHING`,
        [p.product_id, img.slice(0, 500), (p.product_name || '').slice(0, 200)],
      );
      return { id: p.product_id, found: true };
    } catch (e) {
      return { id: p.product_id, found: false, err: e.message };
    }
  }));
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.found) {
      success++;
      if (success % 25 === 0) console.log(`  ${success} images scraped...`);
    } else failed++;
  }
  if (i % 100 === 0 && i > 0) console.log(`  Progress: ${i}/${targets.length}`);
  await sleep(100);
}

console.log(`\n=== Done: ${success} images scraped, ${failed} fail ===`);
await client.end();
