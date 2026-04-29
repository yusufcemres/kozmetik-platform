/**
 * Faz 6 — Sekate kataloğundan DB'de olmayan takviyeleri ekle.
 * Conservative ingest: status='draft' (admin review için), basic fields only.
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

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0';

// Brand mapping (slug → brand_id)
const BRAND_IDS = { nutraxin: 121, orzax: 124, ocean: 124, voonka: 122 };

// Category default — vitamin-mineral en güvenli
const CATEGORY_DEFAULTS = {
  'omega': 12, 'balik-yagi': 12, 'fish-oil': 12, 'krill': 12,
  'probiyotik': 10, 'probiotic': 10, 'probiota': 10, 'biotic': 10,
  'multivitamin': 9, 'vitamin': 9, 'mineral': 9, 'magnesium': 9, 'calcium': 9,
  'milk-thistle': 11, 'ginkgo': 11, 'turmeric': 11, 'curcumin': 11, 'echinacea': 11, 'saw-palmetto': 11,
  'biotin': 9, 'kolajen': 9, 'collagen': 9, 'iron': 9, 'demir': 9,
  'cinko': 9, 'zinc': 9, 'selenium': 9, 'selenyum': 9, 'chromium': 9,
  'kids': 152, 'cocuk': 152, 'pregnancy': 149, 'gebelik': 149,
};

function tokenize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(t=>t.length>=2);
}

function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b); const i = [...sA].filter(x=>sB.has(x)).length; const u = new Set([...sA,...sB]).size;
  return u>0?i/u:0;
}

function detectCategory(slug) {
  for (const [kw, catId] of Object.entries(CATEGORY_DEFAULTS)) {
    if (slug.includes(kw)) return catId;
  }
  return 9; // vitamin-mineral default
}

function detectBrand(sekateSlug) {
  const lower = sekateSlug.toLowerCase();
  if (lower.startsWith('nutraxin-')) return BRAND_IDS.nutraxin;
  if (lower.startsWith('voonka-')) return BRAND_IDS.voonka;
  if (lower.startsWith('orzax-')) return BRAND_IDS.orzax;
  if (lower.startsWith('ocean-')) return BRAND_IDS.ocean;
  return null;
}

async function fetchSekateProduct(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const html = await r.text();

    // Title: <title> tag
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const rawTitle = titleMatch ? titleMatch[1].trim() : null;
    // "Ürün Adı | Sekate" formatından "Sekate" kısmını çıkar
    const title = rawTitle ? rawTitle.replace(/\s*\|.*$/, '').replace(/\s*-\s*Sekate.*$/i, '').trim() : null;

    // OG description / meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    const summary = descMatch ? descMatch[1].trim() : null;

    // Image: percdn /p/ pattern
    const imgs = (html.match(/https:\/\/percdn\.com\/f\/[^"'\\\s]+\.(?:webp|png|jpg|jpeg)/g) || []).filter(u => u.includes('/p/') && !u.includes('logo'));
    imgs.sort((a,b) => parseInt((b.match(/sw(\d+)/)||[0,0])[1]) - parseInt((a.match(/sw(\d+)/)||[0,0])[1]));
    const imageUrl = imgs[0] || null;

    return { title, summary, imageUrl };
  } catch (e) {
    return null;
  }
}

// 1) Sekate sitemap
console.log('[1] Sekate sitemap...');
const r = await fetch('https://www.sekate.com.tr/sitemap/products/1.xml', { headers: { 'User-Agent': UA } });
const xml = await r.text();
const allUrls = (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g,'').trim());
const supplementBrands = ['nutraxin', 'ocean', 'orzax', 'voonka'];
const sekateSupplements = allUrls.filter(u => {
  const slug = u.replace('https://www.sekate.com.tr/','').toLowerCase();
  return supplementBrands.some(b => slug.startsWith(b + '-'));
});
console.log(`  ${sekateSupplements.length} supplement URL`);

// 2) DB existing
const existing = await c.query(`SELECT product_slug FROM products WHERE domain_type='supplement'`);
const existingSlugs = new Set(existing.rows.map(r => r.product_slug.toLowerCase()));

// 3) Filter: yeni adaylar (jaccard < 0.45)
console.log('[2] Yeni aday filtreleme...');
const candidates = [];
for (const u of sekateSupplements) {
  const sekateSlug = u.replace('https://www.sekate.com.tr/','');
  const sekateTokens = tokenize(sekateSlug);
  let bestScore = 0;
  for (const ex of existingSlugs) {
    const score = jaccard(sekateTokens, tokenize(ex));
    if (score > bestScore) bestScore = score;
  }
  if (bestScore < 0.45) {
    candidates.push({ url: u, slug: sekateSlug });
  }
}
console.log(`  ${candidates.length} yeni aday`);

// 4) Her aday için Sekate sayfasını fetch + DB'ye insert (status='draft')
console.log('[3] Ingest başlıyor (status=draft)...');
const inserts = [];
const skipped = [];
let i = 0;
for (const cand of candidates) {
  i++;
  if (i % 5 === 0) console.log(`  [${i}/${candidates.length}] inserted=${inserts.length} skipped=${skipped.length}`);

  const data = await fetchSekateProduct(cand.url);
  if (!data || !data.title || !data.imageUrl) {
    skipped.push({ ...cand, reason: 'fetch fail veya title/image yok' });
    continue;
  }

  const brandId = detectBrand(cand.slug);
  if (!brandId) {
    skipped.push({ ...cand, reason: 'brand resolve fail' });
    continue;
  }

  const categoryId = detectCategory(cand.slug);

  // Slug "sekate-" prefix ile çakışma önle
  const dbSlug = cand.slug.length > 100 ? cand.slug.slice(0, 100) : cand.slug;

  // Slug dup check (bazı edge case)
  if (existingSlugs.has(dbSlug.toLowerCase())) {
    skipped.push({ ...cand, reason: 'slug çakışması' });
    continue;
  }

  try {
    // Insert product
    const pres = await c.query(
      `INSERT INTO products (domain_type, product_name, product_slug, brand_id, category_id, short_description, status, created_at, updated_at)
       VALUES ('supplement', $1, $2, $3, $4, $5, 'draft', NOW(), NOW())
       ON CONFLICT (product_slug) DO NOTHING
       RETURNING product_id`,
      [data.title.slice(0, 250), dbSlug, brandId, categoryId, data.summary?.slice(0, 500) || null]
    );

    if (pres.rowCount === 0) {
      skipped.push({ ...cand, reason: 'insert döndü 0' });
      continue;
    }

    const pid = pres.rows[0].product_id;
    existingSlugs.add(dbSlug.toLowerCase());

    // Insert image
    await c.query(
      `INSERT INTO product_images (product_id, image_url, sort_order, alt_text)
       VALUES ($1, $2, 0, $3)
       ON CONFLICT DO NOTHING`,
      [pid, data.imageUrl, `${data.title.slice(0, 100)} (kaynak: sekate)`]
    );

    inserts.push({
      product_id: pid,
      title: data.title,
      slug: dbSlug,
      brand_id: brandId,
      sekate_url: cand.url,
      image_url: data.imageUrl,
    });
  } catch (e) {
    skipped.push({ ...cand, reason: `insert err: ${e.message.slice(0, 80)}` });
  }

  await new Promise(r => setTimeout(r, 250));
}
console.log(`\n[4] Final: ${inserts.length} insert (status=draft), ${skipped.length} skipped`);

// 5) Rapor
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_faz6-new-supplement-ingest.md');
const report = `# Faz 6 — Yeni Takviye İngest — 2026-04-29

## Özet
- Sekate kataloğunda toplam: ${sekateSupplements.length}
- Yeni aday: ${candidates.length}
- **DB insert (status=draft): ${inserts.length}**
- Skipped: ${skipped.length}

Tüm yeni ürünler **status='draft'** ile eklendi — admin panelinden review + publish gerekli.

## Insert edilenler
${inserts.map(x => `- [${x.product_id}] ${x.title.slice(0, 70)} → ${x.slug}`).join('\n')}

## Skipped
${skipped.map(x => `- ${x.slug.slice(0, 60)} — ${x.reason}`).join('\n')}

## Sonraki adım
1. Admin paneli → Products → status=draft filtre
2. Her ürünü review et:
   - INCI list ekle (manuel veya scrape)
   - Variant + price + serving size
   - Category recheck
3. Hazır olanları status=published yap
4. Score recalc çalıştır (need_scores tablosu için)
`;
writeFileSync(reportPath, report);
console.log(`Rapor: ${reportPath}`);

await c.end();
console.log('[BAŞARILI] Faz 6 tamamlandı.');
