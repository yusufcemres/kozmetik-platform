/**
 * Draft INCI>=5 ürünler için Tavily Search ile gerçek ürün sayfası bul,
 * ardından og:image scrape et. 1 Tavily credit per product.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const TAVILY_KEY = process.env.TAVILY_API_KEY;
if (!TAVILY_KEY) { console.error('TAVILY_API_KEY required'); process.exit(1); }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36';
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '200');
const PARALLEL = 3;

const client = new Client({ connectionString: process.env.DATABASE_URL });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tavilySearch(brand, name) {
  const queries = [
    `site:trendyol.com "${brand}" "${name.substring(0, 40)}"`,
    `site:hepsiburada.com "${brand}" "${name.substring(0, 40)}"`,
  ];
  for (const q of queries) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TAVILY_KEY}` },
        body: JSON.stringify({ query: q, max_results: 5, search_depth: 'basic' }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const r of (data.results || [])) {
        const u = r.url || '';
        if (/trendyol\.com\/[^/]+\/[^?]+-p-\d+/.test(u)) return u.split('?')[0];
        if (/hepsiburada\.com\/[^/?]+-p-HB[A-Z0-9]+/.test(u)) return u.split('?')[0];
      }
    } catch {}
    await sleep(200);
  }
  return null;
}

async function scrapeOgImage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'tr-TR,tr;q=0.9' },
      signal: AbortSignal.timeout(10000),
    });
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
  SELECT p.product_id, p.product_name, b.brand_name
  FROM products p
  LEFT JOIN brands b ON b.brand_id = p.brand_id
  LEFT JOIN (
    SELECT product_id, COUNT(*) as inci_count FROM product_ingredients GROUP BY product_id
  ) ici ON ici.product_id = p.product_id
  WHERE p.status = 'draft'
    AND (ici.inci_count >= 5)
    AND NOT EXISTS (SELECT 1 FROM product_images pim WHERE pim.product_id = p.product_id)
  ORDER BY ici.inci_count DESC, p.product_id DESC
  LIMIT $1
`, [LIMIT]);

console.log(`Tavily image search targets: ${targets.length}\n`);

let found_url = 0, found_img = 0, no_url = 0;

for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (p) => {
    const brand = p.brand_name || '';
    const name = p.product_name || '';

    const productUrl = await tavilySearch(brand, name);
    if (!productUrl) return { id: p.product_id, name: name.substring(0, 35), stage: 'no_url' };

    // Update affiliate_link with real URL
    await client.query(`
      UPDATE affiliate_links
      SET affiliate_url = $1, updated_at = NOW()
      WHERE product_id = $2 AND is_active = true
      LIMIT 1
    `, [productUrl, p.product_id]).catch(() => {});
    // Also insert if none exists
    const platform = productUrl.includes('trendyol') ? 'trendyol' : 'hepsiburada';
    await client.query(`
      INSERT INTO affiliate_links (product_id, platform, affiliate_url, is_active, verification_status, created_at, updated_at)
      VALUES ($1, $2, $3, true, 'unverified', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, [p.product_id, platform, productUrl]).catch(() => {});

    await sleep(300);
    const img = await scrapeOgImage(productUrl);
    if (!img) return { id: p.product_id, name: name.substring(0, 35), stage: 'no_img', url: productUrl };

    await client.query(`
      INSERT INTO product_images (product_id, image_url, alt_text, sort_order, created_at)
      VALUES ($1, $2, $3, 0, NOW())
      ON CONFLICT DO NOTHING
    `, [p.product_id, img.slice(0, 500), name.slice(0, 200)]);

    return { id: p.product_id, name: name.substring(0, 35), stage: 'ok' };
  }));

  for (const r of results) {
    if (r.status === 'fulfilled') {
      if (r.value.stage === 'ok') { found_img++; console.log(`✓ #${r.value.id} ${r.value.name}`); }
      else if (r.value.stage === 'no_img') { found_url++; }
      else { no_url++; }
    }
  }

  if ((i + PARALLEL) % 30 === 0) {
    console.log(`  [${i + PARALLEL}/${targets.length}] img:${found_img} url:${found_url} miss:${no_url}`);
  }
  await sleep(500);
}

console.log(`\n=== Done: ${found_img} images, ${found_url} url-only, ${no_url} no match ===`);
await client.end();
