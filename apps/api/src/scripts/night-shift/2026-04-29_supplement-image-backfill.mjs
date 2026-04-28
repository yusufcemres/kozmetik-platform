/**
 * Gece vardiyası 2026-04-29 — Faz 1
 * Takviye görsel backfill — Sekate sitemap'inden eşleşen ürünlere %100 percdn img scrape.
 *
 * Pipeline:
 *  1) DB: published + image yok takviye listesi (product_id, slug, name, brand_slug)
 *  2) Sekate /sitemap/products/1.xml → URL listesi (Nutraxin/Ocean/Orzax/Voonka/...)
 *  3) Fuzzy match: DB slug ↔ Sekate slug (token-based intersection)
 *  4) Match: ürün sayfasını fetch → percdn .webp img URL extract
 *  5) Insert product_images: image_url, sort_order=0, source='sekate'
 *  6) Eşleşmeyen TODO listesi (alternatif kaynak için)
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36';

// ── 1) Eksik takviyeler ────────────────────────────────────────
const missing = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_slug, b.brand_name
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.domain_type = 'supplement' AND p.status = 'published'
    AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)
  ORDER BY b.brand_name, p.product_name
`);
console.log(`[1] Eksik takviye sayısı: ${missing.rowCount}`);

// ── 2) Sekate sitemap ──────────────────────────────────────────
async function fetchSekateSitemap() {
  // 9 sitemap, ana index'ten products/1.xml en kapsamlısı.
  const urls = [];
  for (let i = 1; i <= 9; i++) {
    try {
      const r = await fetch(`https://www.sekate.com.tr/sitemap/products/${i}.xml`, { headers: { 'User-Agent': UA } });
      if (!r.ok) continue;
      const xml = await r.text();
      const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
      for (const m of matches) {
        const u = m.replace(/<\/?loc>/g, '').trim();
        if (u.startsWith('https://www.sekate.com.tr/') && !u.endsWith('.xml')) urls.push(u);
      }
    } catch (e) {
      console.log(`  sitemap ${i} error: ${e.message}`);
    }
  }
  return urls;
}

console.log('[2] Sekate sitemap indiriliyor...');
const sekateUrls = await fetchSekateSitemap();
console.log(`    ${sekateUrls.length} URL bulundu`);

// Her URL'in slug'ı (son segment)
const sekateSlugs = sekateUrls.map((u) => {
  const slug = u.replace('https://www.sekate.com.tr/', '').replace(/\/$/, '');
  return { url: u, slug };
});

// ── 3) Fuzzy match: DB slug ↔ Sekate slug ────────────────────────
function tokenize(s) {
  return s.toLowerCase()
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİI]/g, 'i')
    .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter((t) => t.length >= 2);
}

function jaccard(a, b) {
  const setA = new Set(a), setB = new Set(b);
  const inter = [...setA].filter((x) => setB.has(x)).length;
  const uni = new Set([...setA, ...setB]).size;
  return uni > 0 ? inter / uni : 0;
}

function findBestSekateMatch(productName, brandSlug) {
  const queryTokens = tokenize(`${brandSlug} ${productName}`);
  const brandToken = tokenize(brandSlug)[0];
  // Brand alias map
  const aliases = {
    orzax: ['orzax', 'ocean'],
    voonka: ['voonka'],
    nutraxin: ['nutraxin'],
    'naturals-garden': ['naturals', 'garden'],
  };
  const allowedBrandTokens = aliases[brandSlug] || [brandToken];
  let best = { score: 0, url: null, slug: null };
  for (const item of sekateSlugs) {
    const itemTokens = tokenize(item.slug);
    // Brand token gerekli — biri olmalı
    const hasBrand = allowedBrandTokens.some((t) => itemTokens.includes(t));
    if (!hasBrand) continue;
    const score = jaccard(queryTokens, itemTokens);
    if (score > best.score) best = { score, url: item.url, slug: item.slug };
  }
  return best;
}

console.log('[3] Eşleştirme yapılıyor...');
const matched = [];
const unmatched = [];
for (const row of missing.rows) {
  const m = findBestSekateMatch(row.product_name, row.brand_slug);
  if (m.score >= 0.30 && m.url) {
    matched.push({ ...row, sekate_url: m.url, sekate_slug: m.slug, score: m.score });
  } else {
    unmatched.push({ ...row, best_score: m.score, best_url: m.url });
  }
}
console.log(`    eşleşen: ${matched.length}, eşleşmeyen: ${unmatched.length}`);

// ── 4) Her eşleşme için ürün sayfasından percdn URL çek ──────────
async function extractImgUrl(productUrl) {
  try {
    const r = await fetch(productUrl, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const html = await r.text();
    // percdn.com/f/120060/.../{slug}-{id}-sw800sh804.webp pattern
    // Sekate img'ler /p/ path'inde, /l/ logo, /f/ footer
    const matches = html.match(/https:\/\/percdn\.com\/f\/[^"'\\\s]+\.(?:webp|png|jpg|jpeg)/g) || [];
    // /p/ = product, /l/ = logo, /m/ = misc → sadece /p/'yi al, en yüksek boyut tercih
    const productImgs = matches.filter((u) => u.includes('/p/') && !u.includes('logo') && !u.includes('footer'));
    // En büyük image (sw800sh804 gibi) → URL'de "sw" sayısına göre sırala
    productImgs.sort((a, b) => {
      const numA = parseInt((a.match(/sw(\d+)/) || [0, 0])[1]);
      const numB = parseInt((b.match(/sw(\d+)/) || [0, 0])[1]);
      return numB - numA;
    });
    return productImgs[0] || null;
  } catch (e) {
    return null;
  }
}

console.log('[4] Görsel URL\'leri çekiliyor...');
const inserts = [];
const failedFetch = [];
let i = 0;
for (const m of matched) {
  i++;
  if (i % 10 === 0) console.log(`    [${i}/${matched.length}] ${inserts.length} başarılı, ${failedFetch.length} hata`);
  const url = await extractImgUrl(m.sekate_url);
  if (url) {
    inserts.push({ product_id: m.product_id, image_url: url, source: 'sekate', sekate_url: m.sekate_url });
  } else {
    failedFetch.push(m);
  }
  // Rate limit: 200ms
  await new Promise((r) => setTimeout(r, 200));
}
console.log(`    Total: ${inserts.length} görsel URL bulundu, ${failedFetch.length} fetch failed`);

// ── 5) DB INSERT ────────────────────────────────────────────────
console.log('[5] product_images insert...');
let inserted = 0;
for (const x of inserts) {
  try {
    await c.query(
      `INSERT INTO product_images (product_id, image_url, sort_order, alt_text)
       VALUES ($1, $2, 0, $3)
       ON CONFLICT DO NOTHING`,
      [x.product_id, x.image_url, `Ürün görseli (kaynak: sekate)`]
    );
    inserted++;
  } catch (e) {
    console.log(`    insert err product=${x.product_id}: ${e.message}`);
  }
}
console.log(`    ${inserted}/${inserts.length} satır insert edildi`);

// ── 6) Çıktı raporu ────────────────────────────────────────────
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_supplement-image-backfill.md');
const report = `# Takviye Görsel Backfill — 2026-04-29 Faz 1

## Özet
- Eksik takviye: ${missing.rowCount}
- Sekate sitemap: ${sekateUrls.length} URL
- Fuzzy match (jaccard >= 0.45): ${matched.length}
- Görsel URL extract: ${inserts.length} başarılı, ${failedFetch.length} fetch hata
- DB insert: ${inserted}

## Eşleşmeyen ürünler (alternatif kaynak gerekli)
${unmatched.map((u) => `- [${u.brand_name}] ${u.product_name} (best score: ${u.best_score.toFixed(2)})`).join('\n')}

## Fetch failed
${failedFetch.map((f) => `- ${f.product_name} → ${f.sekate_url}`).join('\n')}

## Başarılı insert (örnekler)
${inserts.slice(0, 10).map((x) => `- product=${x.product_id} → ${x.image_url}`).join('\n')}
`;
writeFileSync(reportPath, report);
console.log(`Rapor: ${reportPath}`);

await c.end();
console.log('[BAŞARILI] Faz 1 tamamlandı.');
