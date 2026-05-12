/**
 * Draft ürünler için: affiliate URL'i olan ama görseli olmayan draft ürünlere
 * Trendyol/HB og:image scrape. Görsel gelince auto-publish için zemin hazırlar.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const PARALLEL = 4;
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '500');

const client = new Client({ connectionString: process.env.DATABASE_URL });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeOgImage(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (m && m[1].startsWith('http')) return m[1].split('?')[0];
    return null;
  } catch { return null; }
}

await client.connect();

const { rows: targets } = await client.query(`
  SELECT p.product_id, p.product_name, al.affiliate_url, al.platform
  FROM products p
  JOIN affiliate_links al ON al.product_id = p.product_id AND al.is_active=true
  WHERE p.status = 'draft'
    AND NOT EXISTS (SELECT 1 FROM product_images pim WHERE pim.product_id = p.product_id)
  ORDER BY p.product_id DESC
  LIMIT $1
`, [LIMIT]);

console.log(`Draft image scrape targets: ${targets.length}\n`);

let success = 0, failed = 0;
for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (p) => {
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
      if (success % 25 === 0) console.log(`  ${success} images added...`);
    } else failed++;
  }
  await sleep(150);
}

console.log(`\n=== Done: ${success} images scraped, ${failed} fail ===`);
await client.end();
