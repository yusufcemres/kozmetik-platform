/**
 * Image fix:
 * 1) Yanlış eşleşen 81 image_id'i sil (jaccard < 0.30, sekate alt_text)
 * 2) Sekate'den re-scrape ile og:image kullanarak doğru img URL al
 * 3) Re-insert
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
  return s.toLowerCase()
    .replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİI]/g,'i')
    .replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u')
    .replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)
    .filter(t => t.length >= 3 && !/^(60|90|30|120|tablet|kapsul|kapsule|gida|takviye|edici|vitamin|mineral|ml|mg|gr|adet|sw\d+|sh\d+)$/.test(t));
}
function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b);
  const i = [...sA].filter(x => sB.has(x)).length;
  const u = new Set([...sA, ...sB]).size;
  return u > 0 ? i/u : 0;
}

// 1) Tüm Sekate image'lerini al + ürün slug'ı ile eşleştir
const imgs = await c.query(`
  SELECT i.image_id, i.product_id, i.image_url, p.product_slug, p.product_name
  FROM product_images i
  JOIN products p ON p.product_id = i.product_id
  WHERE p.domain_type='supplement' AND i.alt_text LIKE '%sekate%'
`);

console.log(`[1] Toplam Sekate image: ${imgs.rowCount}`);

// İmage URL'den slug parse
function imgSlug(url) {
  const m = url.match(/\/p\/([^/]+?)(?:-\d+)?-sw\d+sh\d+\.\w+$/);
  return m ? m[1] : null;
}

const wrongIds = [];
const correctIds = [];
for (const row of imgs.rows) {
  const iSlug = imgSlug(row.image_url);
  if (!iSlug) continue;
  const score = jaccard(tokenize(row.product_slug), tokenize(iSlug));
  if (score < 0.30) wrongIds.push(row.image_id);
  else correctIds.push(row.image_id);
}

console.log(`[2] Yanlış: ${wrongIds.length}, Doğru: ${correctIds.length}`);

// 2) Yanlış image_id'leri sil
if (wrongIds.length > 0) {
  await c.query(`DELETE FROM product_images WHERE image_id = ANY($1::int[])`, [wrongIds]);
  console.log(`[3] ${wrongIds.length} yanlış image silindi`);
}

// 3) Etkilenen product_id'ler için Sekate'den og:image ile re-scrape
const affectedProducts = await c.query(`
  SELECT DISTINCT p.product_id, p.product_slug, p.product_name
  FROM products p
  WHERE p.domain_type='supplement' AND p.status='published'
    AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)
  ORDER BY p.product_slug
`);
console.log(`[4] Re-scrape gereken ürün: ${affectedProducts.rowCount}`);

// Sekate sitemap'inden URL listesi al
const r = await fetch('https://www.sekate.com.tr/sitemap/products/1.xml', { headers: { 'User-Agent': UA } });
const xml = await r.text();
const sekateUrls = (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g,'').trim());

console.log(`[5] Sekate sitemap URL: ${sekateUrls.length}`);

// Fuzzy match for each affected product
async function fetchOgImage(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const html = await r.text();
    // og:image meta tag ana ürün img'ini taşır
    const m = html.match(/<meta\s+[^>]*property="og:image"\s+content="([^"]+)"/);
    return m ? m[1] : null;
  } catch { return null; }
}

let inserted = 0, noMatch = 0, noImg = 0;
let i = 0;
for (const p of affectedProducts.rows) {
  i++;
  if (i % 10 === 0) console.log(`  [${i}/${affectedProducts.rowCount}] inserted=${inserted} noMatch=${noMatch} noImg=${noImg}`);

  // Match ile Sekate URL bul
  const productTokens = tokenize(p.product_slug);
  let bestUrl = null, bestScore = 0;
  for (const u of sekateUrls) {
    const slug = u.replace('https://www.sekate.com.tr/', '');
    const score = jaccard(productTokens, tokenize(slug));
    if (score > bestScore) { bestScore = score; bestUrl = u; }
  }

  if (bestScore < 0.45 || !bestUrl) { noMatch++; continue; }

  const img = await fetchOgImage(bestUrl);
  if (!img) { noImg++; continue; }

  // og:image URL'inden slug parse + product slug ile karşılaştır (sanity check)
  const iSlug = imgSlug(img);
  if (iSlug) {
    const verifyScore = jaccard(productTokens, tokenize(iSlug));
    if (verifyScore < 0.30) {
      noMatch++;
      console.log(`  REJECT [${p.product_slug.slice(0,40)}] vs og:image="${iSlug.slice(0,40)}" score=${verifyScore.toFixed(2)}`);
      continue;
    }
  }

  await c.query(
    `INSERT INTO product_images (product_id, image_url, sort_order, alt_text)
     VALUES ($1, $2, 0, $3) ON CONFLICT DO NOTHING`,
    [p.product_id, img, `${p.product_name.slice(0,90)} (kaynak: sekate-og)`]
  );
  inserted++;

  await new Promise(r => setTimeout(r, 200));
}

console.log(`\n[6] Final: ${inserted} insert, ${noMatch} no match, ${noImg} no og:image`);

const finalCount = await c.query(`SELECT COUNT(*) AS pub, COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=products.product_id)) AS with_img FROM products WHERE domain_type='supplement' AND status='published'`);
console.log(`Total published supplement: ${finalCount.rows[0].pub}, with image: ${finalCount.rows[0].with_img}`);

await c.end();
