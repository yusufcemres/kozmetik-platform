/**
 * Published ürünlerdeki OBF (OpenBeautyFacts) kullanıcı fotoğraflarını
 * Tavily ile Trendyol/HB'den çekilen temiz ürün görselleriyle değiştir.
 * 1 Tavily credit per product. Önce en kötü markalar (en çok OBF görseli olanlar).
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
const LIMIT   = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1]   || '100');
const BRAND   = process.argv.find(a => a.startsWith('--brand='))?.split('=').slice(1).join('=');
const PARALLEL = 3;

const client = new Client({ connectionString: process.env.DATABASE_URL });
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tavilySearch(brand, name) {
  const queries = [
    `site:trendyol.com "${brand}" "${name.substring(0, 40)}"`,
    `site:hepsiburada.com "${brand}" "${name.substring(0, 40)}"`,
    `"${brand}" "${name.substring(0, 35)}" ürün görseli`,
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

let brandClause = '';
const params = [LIMIT];
if (BRAND) {
  params.push(`%${BRAND}%`);
  brandClause = `AND b.brand_name ILIKE $${params.length}`;
}

// Published ürünler, OBF görseli olanlar — TY/HB görseli ile replace edilecek
const { rows: targets } = await client.query(`
  SELECT DISTINCT ON (p.product_id)
    p.product_id, p.product_name, b.brand_name,
    pi.image_id as obf_image_id, pi.image_url as obf_image_url
  FROM products p
  LEFT JOIN brands b ON b.brand_id = p.brand_id
  JOIN product_images pi ON pi.product_id = p.product_id
    AND pi.image_url ILIKE '%openbeautyfacts.org%'
  WHERE p.status = 'published'
    AND p.domain_type = 'cosmetic'
    ${brandClause}
  ORDER BY p.product_id, pi.sort_order
  LIMIT $1
`, params);

console.log(`OBF görsel replace targets: ${targets.length}${BRAND ? ' (brand: '+BRAND+')' : ''}\n`);

let replaced = 0, url_only = 0, no_match = 0;

for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (p) => {
    const brand = p.brand_name || '';
    const name  = p.product_name || '';

    const productUrl = await tavilySearch(brand, name);
    if (!productUrl) return { id: p.product_id, stage: 'no_url', name: name.substring(0, 40) };

    await sleep(300);
    const img = await scrapeOgImage(productUrl);
    if (!img) return { id: p.product_id, stage: 'no_img', name: name.substring(0, 40), url: productUrl };

    // OBF görseli sil, yenisini ekle
    await client.query(`DELETE FROM product_images WHERE image_id = $1`, [p.obf_image_id]);
    await client.query(`
      INSERT INTO product_images (product_id, image_url, alt_text, sort_order, created_at)
      VALUES ($1, $2, $3, 0, NOW())
      ON CONFLICT DO NOTHING
    `, [p.product_id, img.slice(0, 500), name.slice(0, 200)]);

    return { id: p.product_id, stage: 'ok', name: name.substring(0, 40) };
  }));

  for (const r of results) {
    const v = r.status === 'fulfilled' ? r.value : { stage: 'error', name: '?' };
    if (v.stage === 'ok')     { replaced++;  console.log(`✓ #${v.id} ${v.name}`); }
    else if (v.stage === 'no_img') { url_only++; }
    else { no_match++; }
  }

  if ((i + PARALLEL) % 30 === 0) {
    console.log(`  [${i + PARALLEL}/${targets.length}] replaced:${replaced} url_only:${url_only} miss:${no_match}`);
  }
  await sleep(500);
}

console.log(`\n=== Done: ${replaced} replaced, ${url_only} url_only, ${no_match} no_match ===`);
await client.end();
