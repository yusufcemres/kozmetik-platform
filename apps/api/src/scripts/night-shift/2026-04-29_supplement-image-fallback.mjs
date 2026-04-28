/**
 * Faz 1.2 — Voonka + Nutraxin resmi sitelerinden fallback image scrape.
 * Sekate match'lemeyenler için.
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

// ── 1) Hala görselsiz takviyeleri al ─────────────────────────────
const missing = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_slug, b.brand_name
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.domain_type = 'supplement' AND p.status = 'published'
    AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)
  ORDER BY b.brand_name, p.product_name
`);
console.log(`[1] Hala görseli yok: ${missing.rowCount} ürün`);

// Marka bazında dağılım
const byBrand = {};
for (const r of missing.rows) {
  byBrand[r.brand_slug] = (byBrand[r.brand_slug] || 0) + 1;
}
console.log('    marka dağılımı:', byBrand);

// ── 2) Voonka sitemap parse ──────────────────────────────────────
async function fetchVoonkaSitemap() {
  const r = await fetch('https://www.voonka.com/sitemap.xml', { headers: { 'User-Agent': UA } });
  if (!r.ok) return [];
  const xml = await r.text();
  // <url><loc>...</loc>...<image:loc>...</image:loc>...</url>
  const items = [];
  const blocks = xml.split('<url>').slice(1);
  for (const block of blocks) {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    const imgMatch = block.match(/<image:loc>([^<]+)<\/image:loc>/);
    if (locMatch && imgMatch) {
      const url = locMatch[1].trim();
      const img = imgMatch[1].trim();
      // Slug = URL son kısım
      const slug = url.replace('https://www.voonka.com/', '').replace(/\/$/, '');
      items.push({ url, img, slug });
    }
  }
  return items;
}

// ── 3) Nutraxin sitemap parse + her ürün sayfasından img extract ─
async function fetchNutraxinSitemap() {
  const r = await fetch('https://www.nutraxin.com.tr/product-sitemap.xml', { headers: { 'User-Agent': UA } });
  if (!r.ok) return [];
  const xml = await r.text();
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return matches.map((m) => {
    const url = m.replace(/<\/?loc>/g, '').trim();
    const slug = url.replace('https://www.nutraxin.com.tr/urunler/', '');
    return { url, slug };
  });
}
async function fetchNutraxinImg(productUrl) {
  try {
    const r = await fetch(productUrl, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const html = await r.text();
    // nx-{slug}.webp pattern (ana ürün görseli)
    const matches = html.match(/https?:\/\/[^"'\s]*nutraxin\.com\.tr\/storage\/uploads\/[^"'\s]+\.(?:webp|png|jpg|jpeg)/g) || [];
    // nx- prefix öncelikli (ana product img), konsept değil
    const primary = matches.filter((u) => u.includes('/nx-') || (!u.includes('konsept') && !u.includes('logo')));
    return primary[0] || matches[0] || null;
  } catch (e) {
    return null;
  }
}

console.log('[2] Voonka sitemap...');
const voonka = await fetchVoonkaSitemap();
console.log(`    ${voonka.length} Voonka ürün`);

console.log('[3] Nutraxin sitemap...');
const nutraxin = await fetchNutraxinSitemap();
console.log(`    ${nutraxin.length} Nutraxin ürün`);

// ── 4) Match + insert ────────────────────────────────────────────
const inserts = [];
const failed = [];

for (const row of missing.rows) {
  let img = null, source = null, matchedUrl = null;

  // Brand-specific routing
  if (row.brand_slug === 'voonka') {
    // Strategy 1: DB product_slug ↔ sitemap slug substring match (en güvenilir)
    const dbSlug = (row.product_slug || '').toLowerCase();
    const dbCleanSlug = dbSlug.replace(/^voonka-/, '');
    let bestStr = null;
    if (dbCleanSlug.length >= 6) {
      // En uzun ortak substring olan'ı bul
      bestStr = voonka.find((item) => {
        const sSlug = item.slug.replace(/^voonka-/, '').toLowerCase();
        return sSlug === dbCleanSlug || sSlug.startsWith(dbCleanSlug) || dbCleanSlug.startsWith(sSlug);
      });
    }
    if (bestStr) {
      img = bestStr.img;
      source = 'voonka.com';
      matchedUrl = bestStr.url;
    } else {
      // Strategy 2: token jaccard
      const cleanName = row.product_name.replace(/voonka/gi, '').trim();
      const queryTokens = tokenize(cleanName);
      let best = { score: 0, item: null };
      for (const item of voonka) {
        const cleanSlug = item.slug.replace(/^voonka-/, '');
        const itemTokens = tokenize(cleanSlug);
        const score = jaccard(queryTokens, itemTokens);
        if (score > best.score) best = { score, item };
      }
      if (best.score >= 0.15 && best.item) {
        img = best.item.img;
        source = 'voonka.com';
        matchedUrl = best.item.url;
      }
    }
  } else if (row.brand_slug === 'nutraxin') {
    const queryTokens = tokenize(row.product_name);
    let best = { score: 0, item: null };
    for (const item of nutraxin) {
      const itemTokens = tokenize(item.slug);
      const score = jaccard(queryTokens, itemTokens);
      if (score > best.score) best = { score, item };
    }
    if (best.score >= 0.30 && best.item) {
      const fetched = await fetchNutraxinImg(best.item.url);
      if (fetched) {
        img = fetched;
        source = 'nutraxin.com.tr';
        matchedUrl = best.item.url;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  if (img) {
    inserts.push({ product_id: row.product_id, image_url: img, source, matched_url: matchedUrl, name: row.product_name });
  } else {
    failed.push({ ...row });
  }
}

console.log(`[4] Eşleşme: ${inserts.length} bulundu, ${failed.length} hala yok`);

// ── 5) Insert ────────────────────────────────────────────────────
let inserted = 0;
for (const x of inserts) {
  try {
    await c.query(
      `INSERT INTO product_images (product_id, image_url, sort_order, alt_text)
       VALUES ($1, $2, 0, $3)
       ON CONFLICT DO NOTHING`,
      [x.product_id, x.image_url, `Ürün görseli (kaynak: ${x.source})`]
    );
    inserted++;
  } catch (e) {
    console.log(`    insert err ${x.product_id}: ${e.message}`);
  }
}
console.log(`[5] ${inserted}/${inserts.length} insert`);

// ── 6) Rapor ─────────────────────────────────────────────────────
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_supplement-fallback.md');
const report = `# Takviye Görsel Fallback — 2026-04-29 Faz 1.2

## Özet
- Hala eksik: ${missing.rowCount}
- Voonka sitemap: ${voonka.length} ürün
- Nutraxin sitemap: ${nutraxin.length} ürün
- Match + img bulunan: ${inserts.length}
- Insert edilen: ${inserted}
- Hala görseli yok: ${failed.length}

## Marka dağılımı (öncesi)
${Object.entries(byBrand).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Başarılı insert (örnekler)
${inserts.slice(0, 15).map((x) => `- [${x.source}] product=${x.product_id} ${x.name.slice(0, 50)} → ${x.image_url}`).join('\n')}

## Hala görseli yok (alternatif kaynak gerekli)
${failed.slice(0, 50).map((f) => `- [${f.brand_name}] ${f.product_name}`).join('\n')}
`;
writeFileSync(reportPath, report);
console.log(`Rapor: ${reportPath}`);

await c.end();
console.log('[BAŞARILI] Faz 1.2 tamamlandı.');
