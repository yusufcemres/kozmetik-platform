/**
 * Faz 6.4 — Voonka/Nutraxin scrape'i DOĞRU tabloya yaz: supplement_ingredients
 *
 * 1) product_ingredients'tan yanlış yazılan 26 ürünün satırlarını sil
 *    (concentration_source='voonka-nutraxin-scrape')
 * 2) Aynı scrape verisini tekrarla, supplement_ingredients'a INSERT et
 *    (amount_per_serving, unit, sort_order)
 * 3) supplement-recalc tetikleme = ayrı çalıştırılır (manuel)
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

// 1) Yanlış product_ingredients satırlarını sil
const del = await c.query(`
  DELETE FROM product_ingredients
  WHERE concentration_source = 'voonka-nutraxin-scrape'
  RETURNING product_ingredient_id
`);
console.log(`[1] Silinen yanlış product_ingredients: ${del.rowCount}`);

function tokenize(s) {
  return (s || '').toLowerCase()
    .replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİI]/g,'i')
    .replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u')
    .replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(t => t.length >= 3);
}
function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b);
  const i = [...sA].filter(x => sB.has(x)).length;
  const u = new Set([...sA, ...sB]).size;
  return u > 0 ? i/u : 0;
}

// 2) Faz 6 ürünleri al
const drafts = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_slug
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='supplement' AND p.status='published'
    AND b.brand_slug IN ('voonka','nutraxin','orzax')
    AND NOT EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id=p.product_id)
    AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id AND i.alt_text LIKE '%sekate%')
`);
console.log(`[2] supplement_ingredients'i boş Faz 6 ürün: ${drafts.rowCount}`);

// 3) Sitemap çek
async function fetchVoonkaSitemap() {
  const r = await fetch('https://www.voonka.com/sitemap.xml', { headers: { 'User-Agent': UA } });
  const xml = await r.text();
  const items = [];
  const blocks = xml.split('<url>').slice(1);
  for (const b of blocks) {
    const loc = b.match(/<loc>([^<]+)<\/loc>/);
    if (!loc) continue;
    const url = loc[1].trim();
    items.push({ url, slug: url.replace('https://www.voonka.com/', '').replace(/\/$/, '') });
  }
  return items;
}
async function fetchNutraxinSitemap() {
  const r = await fetch('https://www.nutraxin.com.tr/product-sitemap.xml', { headers: { 'User-Agent': UA } });
  const xml = await r.text();
  return (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map(m => {
    const url = m.replace(/<\/?loc>/g, '').trim();
    return { url, slug: url.replace('https://www.nutraxin.com.tr/urunler/', '') };
  });
}

const voonka = await fetchVoonkaSitemap();
const nutraxin = await fetchNutraxinSitemap();
console.log(`[3] Voonka: ${voonka.length}, Nutraxin: ${nutraxin.length}`);

// 4) Parse functions
function parseVoonkaIngredients(html) {
  const tabMatch = html.match(/<div class="tab-pane[^"]*" id="bdegerleri"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
  if (!tabMatch) return [];
  const block = tabMatch[0];
  const rows = block.match(/<div class="satirlar">[\s\S]*?<\/div>/g) || [];
  const items = [];
  for (const row of rows) {
    const name = row.match(/<span class="baslik[^"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.replace(/<[^>]+>/g, '').trim();
    const dose = row.match(/<span class="deger"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.replace(/<[^>]+>/g, '').trim();
    if (name && dose) items.push({ name, dose });
  }
  return items;
}
function parseNutraxinIngredients(html) {
  const tabMatch = html.match(/<div\s+id="tab-1"[\s\S]*?<\/div>\s*<\/div>/);
  if (!tabMatch) return [];
  const rows = tabMatch[0].match(/<tr>[\s\S]*?<\/tr>/g) || [];
  const items = [];
  for (const row of rows) {
    const cells = row.match(/<(?:th|td)[^>]*>[\s\S]*?<\/(?:th|td)>/g) || [];
    if (cells.length < 2) continue;
    const cleanCell = (cell) => cell.replace(/<[^>]+>/g, '').trim();
    const name = cleanCell(cells[0]);
    const dose = cleanCell(cells[cells.length - 1]);
    if (name && dose && /\d/.test(dose)) items.push({ name, dose });
  }
  return items;
}

// 5) Parse dose: "600 mg" → { amount: 600, unit: "mg" }
function parseDose(doseStr) {
  const m = doseStr.match(/(\d+(?:[.,]\d+)?)\s*(mg|mcg|μg|µg|iu|g|ml|kcal)/i);
  if (!m) return null;
  let amount = parseFloat(m[1].replace(',', '.'));
  let unit = m[2].toLowerCase();
  // Normalize unit
  if (unit === 'μg' || unit === 'µg') unit = 'mcg';
  return { amount, unit };
}

// 6) Ingredient lookup
const allIngredients = await c.query(`
  SELECT ingredient_id, ingredient_slug, inci_name, common_name
  FROM ingredients
  WHERE domain_type='supplement' OR domain_type='both' OR domain_type='all'
`);
function findIngredient(name) {
  const tokens = tokenize(name);
  let best = { score: 0, id: null, slug: null };
  for (const ing of allIngredients.rows) {
    for (const c of [ing.common_name, ing.inci_name, ing.ingredient_slug.replace(/-/g,' ')]) {
      if (!c) continue;
      const score = jaccard(tokens, tokenize(c));
      if (score > best.score) best = { score, id: ing.ingredient_id, slug: ing.ingredient_slug };
    }
  }
  return best;
}

// 7) Process
const successProducts = [];
const failed = [];
let i = 0;
for (const p of drafts.rows) {
  i++;

  let url, html, items;
  if (p.brand_slug === 'voonka') {
    const cleanName = p.product_name.replace(/voonka/gi, '').trim();
    const tokens = tokenize(cleanName);
    let best = { score: 0, item: null };
    for (const v of voonka) {
      const score = jaccard(tokens, tokenize(v.slug.replace(/^voonka-/, '')));
      if (score > best.score) best = { score, item: v };
    }
    if (best.score < 0.20 || !best.item) { failed.push({ ...p, reason: `voonka match low ${best.score.toFixed(2)}` }); continue; }
    url = best.item.url;
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) { failed.push({ ...p, reason: `HTTP ${r.status}` }); continue; }
      html = await r.text();
    } catch { failed.push({ ...p, reason: 'fetch fail' }); continue; }
    items = parseVoonkaIngredients(html);
  } else if (p.brand_slug === 'nutraxin') {
    const cleanName = p.product_name.replace(/nutraxin/gi, '').trim();
    const tokens = tokenize(cleanName);
    let best = { score: 0, item: null };
    for (const n of nutraxin) {
      const score = jaccard(tokens, tokenize(n.slug));
      if (score > best.score) best = { score, item: n };
    }
    if (best.score < 0.30 || !best.item) { failed.push({ ...p, reason: `nutraxin match low ${best.score.toFixed(2)}` }); continue; }
    url = best.item.url;
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) { failed.push({ ...p, reason: `HTTP ${r.status}` }); continue; }
      html = await r.text();
    } catch { failed.push({ ...p, reason: 'fetch fail' }); continue; }
    items = parseNutraxinIngredients(html);
  } else {
    failed.push({ ...p, reason: 'orzax site yok' });
    continue;
  }

  if (!items || items.length === 0) {
    failed.push({ ...p, reason: 'parse empty', url });
    continue;
  }

  // Insert each ingredient to supplement_ingredients
  let inserted = 0;
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const match = findIngredient(item.name);
    if (!match.id) continue;
    const dose = parseDose(item.dose);
    if (!dose) continue;
    try {
      await c.query(
        `INSERT INTO supplement_ingredients
          (product_id, ingredient_id, amount_per_serving, unit, sort_order, is_proprietary_blend, created_at)
         VALUES ($1, $2, $3, $4, $5, false, NOW())
         ON CONFLICT DO NOTHING`,
        [p.product_id, match.id, dose.amount, dose.unit, idx + 1]
      );
      inserted++;
    } catch {}
  }
  if (inserted > 0) {
    successProducts.push({ ...p, count: inserted, source_url: url });
  } else {
    failed.push({ ...p, reason: 'no ingredient matched' });
  }

  await new Promise(r => setTimeout(r, 250));
  if (i % 5 === 0) console.log(`  [${i}/${drafts.rowCount}] success=${successProducts.length} fail=${failed.length}`);
}

console.log(`\n[FINAL] ${successProducts.length} ürün, total ${successProducts.reduce((a,b)=>a+b.count,0)} ingredient`);
console.log(`Failed: ${failed.length}`);

const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_supplement-ingredients-fix.md');
let md = `# Faz 6.4 — supplement_ingredients düzeltmesi — 2026-04-29\n\n`;
md += `## Özet\n- Yanlış product_ingredients satırları silindi: ${del.rowCount}\n- supplement_ingredients\'a yazılan ürün: ${successProducts.length}\n- Total ingredient: ${successProducts.reduce((a,b)=>a+b.count,0)}\n- Skip: ${failed.length}\n\n`;
md += `## Başarılı\n\n| ID | Brand | Slug | Count |\n|----|-------|------|-------|\n`;
for (const x of successProducts) md += `| ${x.product_id} | ${x.brand_slug} | ${x.product_slug.slice(0,40)} | ${x.count} |\n`;
md += `\n## Skip\n\n| ID | Brand | Slug | Reason |\n|----|-------|------|--------|\n`;
for (const f of failed) md += `| ${f.product_id} | ${f.brand_slug} | ${f.product_slug.slice(0,40)} | ${f.reason} |\n`;
writeFileSync(reportPath, md);
console.log(`Rapor: ${reportPath}`);

await c.end();
