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

const missing = await c.query(`SELECT p.product_id, p.product_slug, p.product_name, b.brand_slug FROM products p JOIN brands b ON b.brand_id=p.brand_id WHERE p.domain_type='cosmetic' AND p.status='published' AND b.brand_slug='cerave' AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id)`);
console.log(`Eksik CeraVe: ${missing.rowCount}`);

// Sekate sitemap'inden tüm CeraVe URL'lerini çek
const r = await fetch('https://www.sekate.com.tr/sitemap/products/1.xml', { headers: { 'User-Agent': UA } });
const xml = await r.text();
const allUrls = (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g,'').trim()).filter(u => u.includes('/cerave'));
console.log(`Sekate'de CeraVe URL: ${allUrls.length}`);

let inserted = 0;
for (const m of missing.rows) {
  const queryTokens = tokenize(m.product_name.replace(/cerave/gi,''));
  let best = { score: 0, url: null };
  for (const u of allUrls) {
    const slug = u.replace('https://www.sekate.com.tr/','').replace(/^cerave-/,'');
    const score = jaccard(queryTokens, tokenize(slug));
    if (score > best.score) best = { score, url: u };
  }
  if (best.score < 0.20) { console.log(`  SKIP ${m.product_name.slice(0,60)} score=${best.score.toFixed(2)}`); continue; }
  // Ürün sayfasından img extract
  try {
    const r2 = await fetch(best.url, { headers: { 'User-Agent': UA } });
    if (!r2.ok) continue;
    const html = await r2.text();
    const imgs = (html.match(/https:\/\/percdn\.com\/f\/[^"'\\s]+\.(?:webp|png|jpg|jpeg)/g) || []).filter(u => u.includes('/p/') && !u.includes('logo'));
    imgs.sort((a,b) => parseInt((b.match(/sw(\d+)/)||[0,0])[1]) - parseInt((a.match(/sw(\d+)/)||[0,0])[1]));
    const img = imgs[0];
    if (img) {
      await c.query(`INSERT INTO product_images (product_id, image_url, sort_order, alt_text) VALUES ($1, $2, 0, $3) ON CONFLICT DO NOTHING`, [m.product_id, img, 'Ürün görseli (kaynak: sekate)']);
      inserted++;
      console.log(`  OK [${m.product_id}] ${m.product_name.slice(0,50)} → ${img.slice(0,80)}`);
    }
  } catch (e) { console.log(`  ERR ${m.product_id}: ${e.message}`); }
  await new Promise(r=>setTimeout(r, 200));
}
console.log(`\nFinal: ${inserted}/${missing.rowCount}`);
await c.end();
