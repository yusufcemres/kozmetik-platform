/**
 * Faz 7 — CeraVe TR resmi sitesinden 9 eksik kozmetik görseli backfill.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0';

function tokenize(s) {
  return s.toLowerCase().replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİI]/g,'i').replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(t=>t.length>=2);
}
function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b); const i = [...sA].filter(x=>sB.has(x)).length; const u = new Set([...sA,...sB]).size;
  return u>0?i/u:0;
}

// 1) CeraVe sitemap'inden ürün URL'lerini al
const r = await fetch('https://www.cerave.com.tr/sitemap.xml', { headers: { 'User-Agent': UA } });
const xml = await r.text();
const allUrls = (xml.match(/<loc>https:\/\/www\.cerave\.com\.tr\/cilt-bakimi\/[^<]+<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g,'').trim());
const productUrls = allUrls.filter(u => !u.endsWith('/cilt-bakimi') && !u.includes('/yuz-nemlendiricileri') && !u.includes('/vucut-') && !u.includes('/cilt-yenileme') && !u.includes('/spf-yuz-kremleri') && !u.includes('/yuz-temizleyicileri'));
console.log(`CeraVe ürün URL: ${productUrls.length}`);

// 2) DB'deki eksik CeraVe kozmetikler
const missing = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='cosmetic' AND p.status='published' AND b.brand_slug='cerave'
    AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)
`);
console.log(`Eksik CeraVe: ${missing.rowCount}`);

// 3) Her DB ürün için en yakın CeraVe URL bul
async function fetchImg(productUrl) {
  try {
    const r = await fetch(productUrl, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const html = await r.text();
    // OG image öncelik
    const og = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
    if (og) return og[1];
    // CeraVe images.contentstack-prod URL pattern
    const imgs = (html.match(/https?:\/\/[^"'\s]*?(?:images\.contentstack|cerave\.com\.tr|loreal\.com)[^"'\s]+\.(?:webp|png|jpg|jpeg)/gi) || []);
    const productImgs = imgs.filter(u => !u.includes('logo') && !u.includes('icon') && !u.includes('hero'));
    return productImgs[0] || imgs[0] || null;
  } catch { return null; }
}

let inserted = 0, skipped = 0;
for (const m of missing.rows) {
  const cleanName = m.product_name.toLowerCase().replace(/cerave/gi, '').trim();
  const queryTokens = tokenize(cleanName);
  let best = { score: 0, url: null };
  for (const u of productUrls) {
    const slug = u.replace('https://www.cerave.com.tr/cilt-bakimi/', '');
    const score = jaccard(queryTokens, tokenize(slug));
    if (score > best.score) best = { score, url: u };
  }
  if (best.score < 0.20) {
    skipped++;
    console.log(`  SKIP ${m.product_name.slice(0,55)} score=${best.score.toFixed(2)}`);
    continue;
  }

  const img = await fetchImg(best.url);
  if (!img) {
    skipped++;
    console.log(`  NO_IMG ${m.product_name.slice(0,55)}`);
    continue;
  }

  await c.query(
    `INSERT INTO product_images (product_id, image_url, sort_order, alt_text)
     VALUES ($1, $2, 0, $3) ON CONFLICT DO NOTHING`,
    [m.product_id, img, `${m.product_name.slice(0,90)} (kaynak: cerave.com.tr)`]
  );
  inserted++;
  console.log(`  OK [${m.product_id}] ${m.product_name.slice(0,40)} → ${img.slice(0,80)}`);

  await new Promise(r => setTimeout(r, 250));
}

console.log(`\nFinal: ${inserted}/${missing.rowCount} insert, ${skipped} skip`);
await c.end();
