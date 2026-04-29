/**
 * Sekate sitemap'indeki takviye ürünleriyle DB'yi karşılaştır,
 * DB'de olmayan adayları listele.
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

// 1) Sekate sitemap (sadece supplement marka URL'leri)
const r = await fetch('https://www.sekate.com.tr/sitemap/products/1.xml', { headers: { 'User-Agent': UA } });
const xml = await r.text();
const allUrls = (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g,'').trim());

// 4 supplement brand kategorisindeki URL'ler
const supplementBrands = ['nutraxin', 'ocean', 'orzax', 'voonka'];
const sekateSupplements = allUrls.filter(u => {
  const slug = u.replace('https://www.sekate.com.tr/','').toLowerCase();
  return supplementBrands.some(b => slug.startsWith(b + '-') || slug === b);
});
console.log(`Sekate'de toplam supplement URL: ${sekateSupplements.length}`);

// Brand bazında dağılım
const byBrand = {};
for (const u of sekateSupplements) {
  const slug = u.replace('https://www.sekate.com.tr/','');
  for (const b of supplementBrands) {
    if (slug.startsWith(b + '-') || slug === b) {
      byBrand[b] = (byBrand[b] || 0) + 1;
      break;
    }
  }
}
console.log('Brand dağılımı:', byBrand);

// 2) DB'deki mevcut takviye slug'ları
const existing = await c.query(`SELECT product_slug FROM products WHERE domain_type='supplement'`);
const existingSlugs = new Set(existing.rows.map(r => r.product_slug.toLowerCase()));
console.log(`DB'de supplement: ${existing.rowCount}`);

// 3) Token-based eşleştirme (her sekate URL için DB'de yakın slug var mı)
function tokenize(s) {
  return s.toLowerCase().replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİI]/g,'i').replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(t=>t.length>=2);
}
function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b); const i = [...sA].filter(x=>sB.has(x)).length; const u = new Set([...sA,...sB]).size;
  return u>0?i/u:0;
}

const candidates = [];
const matchedExisting = [];
for (const u of sekateSupplements) {
  const sekateSlug = u.replace('https://www.sekate.com.tr/','');
  const sekateTokens = tokenize(sekateSlug);
  // En iyi DB eşleşmesi
  let best = { score: 0, slug: null };
  for (const existing of existingSlugs) {
    const score = jaccard(sekateTokens, tokenize(existing));
    if (score > best.score) best = { score, slug: existing };
  }
  if (best.score >= 0.45) {
    matchedExisting.push({ sekate: sekateSlug, db: best.slug, score: best.score });
  } else {
    candidates.push({ sekate_url: u, sekate_slug: sekateSlug, best_db: best.slug, best_score: best.score });
  }
}

console.log(`\nDB'de muhtemelen var (jaccard >= 0.45): ${matchedExisting.length}`);
console.log(`DB'de YOK (yeni eklenebilir adaylar): ${candidates.length}`);

console.log('\n## YENİ EKLENEBİLİR ADAYLAR (top 40):');
for (const c of candidates.slice(0, 40)) {
  console.log(`  ${c.sekate_slug.padEnd(60)} | best_db: ${c.best_db?.slice(0, 35) || 'none'} (${c.best_score.toFixed(2)})`);
}

await c.end();
