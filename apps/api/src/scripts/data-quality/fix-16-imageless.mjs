/**
 * 16 imageless canli urun icin Tavily search + extract ile gorsel + affiliate doldur.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const TAVILY_KEY = process.env.TAVILY_API_KEY;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120';

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tavilySearchAffiliate(brand, name) {
  for (const site of ['trendyol.com', 'hepsiburada.com']) {
    const q = `site:${site} ${brand || ''} ${name}`.trim();
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TAVILY_KEY}` },
        body: JSON.stringify({ query: q, max_results: 5, search_depth: 'basic' }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const r of data.results || []) {
        const u = r.url || '';
        if (/trendyol\.com\/[^/]+\/[^?]+-p-\d+/.test(u)) return { platform: 'trendyol', url: u.split('?')[0] };
        if (/hepsiburada\.com\/[^?]+-p-HB[A-Z0-9]+/.test(u)) return { platform: 'hepsiburada', url: u.split('?')[0] };
      }
    } catch {}
    await sleep(300);
  }
  return null;
}

async function tavilyExtractImage(url) {
  try {
    const res = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: { Authorization: `Bearer ${TAVILY_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [url], include_images: true, extract_depth: 'basic' }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const first = (data?.results ?? [])[0] ?? {};
    const images = (first.images ?? []).filter(i => typeof i === 'string' && i.startsWith('http'));
    const good = images.find(u => !/logo|favicon|placeholder|icon/i.test(u) && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u));
    if (good) return good;
    return images.find(u => !/logo|favicon/i.test(u)) || null;
  } catch { return null; }
}

await client.connect();

const { rows: targets } = await client.query(`
  SELECT p.product_id, p.product_name, b.brand_name
  FROM products p LEFT JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM product_images pim WHERE pim.product_id=p.product_id)
  ORDER BY p.product_id
`);
console.log(`Imageless live targets: ${targets.length}\n`);

let aff_ok = 0, img_ok = 0, fail = 0;
for (const p of targets) {
  try {
    const link = await tavilySearchAffiliate(p.brand_name || '', p.product_name);
    if (!link) { fail++; console.log(`✗ #${p.product_id} ${p.product_name?.slice(0,40)} — no affiliate`); continue; }

    // Add affiliate (if not exists)
    await client.query(
      `INSERT INTO affiliate_links (product_id, platform, affiliate_url, is_active, verification_status, created_at, updated_at)
       VALUES ($1, $2, $3, true, 'unverified', NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [p.product_id, link.platform, link.url],
    );
    aff_ok++;

    // Extract image
    await sleep(300);
    const img = await tavilyExtractImage(link.url);
    if (img) {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, created_at)
         VALUES ($1, $2, $3, 0, NOW())`,
        [p.product_id, img.slice(0, 500), (p.product_name || '').slice(0, 200)],
      );
      img_ok++;
      console.log(`✓ #${p.product_id} ${p.product_name?.slice(0,30)} → ${link.platform} + img`);
    } else {
      console.log(`◐ #${p.product_id} ${p.product_name?.slice(0,30)} → ${link.platform} (no img)`);
    }
    await sleep(400);
  } catch (e) {
    fail++;
    console.log(`✗ #${p.product_id}: ${e.message}`);
  }
}

console.log(`\n=== Done: ${aff_ok} affiliates, ${img_ok} images, ${fail} fail ===`);
await client.end();
