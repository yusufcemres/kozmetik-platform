/**
 * Faz 6.3 — Voonka + Nutraxin için INCI/içerik scrape.
 * Faz 6'da insert edilen 45 takviye için besin değerlerini scrape et + product_ingredients'a yaz.
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

function tokenize(s) {
  return (s || '').toLowerCase()
    .replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİI]/g,'i')
    .replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u')
    .replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)
    .filter(t => t.length >= 3);
}
function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b);
  const i = [...sA].filter(x => sB.has(x)).length;
  const u = new Set([...sA, ...sB]).size;
  return u > 0 ? i/u : 0;
}

// 1) Faz 6 ürünleri (Sekate alt_text + INCI yok)
const drafts = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_slug
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='supplement' AND p.status='published'
    AND b.brand_slug IN ('voonka','nutraxin','orzax')
    AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)
    AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id AND i.alt_text LIKE '%sekate%')
`);
console.log(`[1] Faz 6 INCI'siz ürün: ${drafts.rowCount}`);

// 2) Sitemap'leri al
async function fetchVoonkaSitemap() {
  const r = await fetch('https://www.voonka.com/sitemap.xml', { headers: { 'User-Agent': UA } });
  const xml = await r.text();
  const items = [];
  const blocks = xml.split('<url>').slice(1);
  for (const b of blocks) {
    const loc = b.match(/<loc>([^<]+)<\/loc>/);
    if (!loc) continue;
    const url = loc[1].trim();
    const slug = url.replace('https://www.voonka.com/', '').replace(/\/$/, '');
    items.push({ url, slug });
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

console.log('[2] Sitemap çekiliyor...');
const voonka = await fetchVoonkaSitemap();
const nutraxin = await fetchNutraxinSitemap();
console.log(`    Voonka: ${voonka.length}, Nutraxin: ${nutraxin.length}`);

// 3) Voonka HTML parse - bdegerleri tab > div.satirlar
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

// 4) Nutraxin HTML parse - #tab-1 table
function parseNutraxinIngredients(html) {
  const tabMatch = html.match(/<div\s+id="tab-1"[\s\S]*?<\/div>\s*<\/div>/);
  if (!tabMatch) return [];
  const block = tabMatch[0];
  // Table rows: <tr><th|td><p>NAME</p></th|td>...<th|td><p>DOSE</p></th|td></tr>
  const rows = block.match(/<tr>[\s\S]*?<\/tr>/g) || [];
  const items = [];
  for (const row of rows) {
    const cells = row.match(/<(?:th|td)[^>]*>[\s\S]*?<\/(?:th|td)>/g) || [];
    if (cells.length < 2) continue;
    const cleanCell = (cell) => cell.replace(/<[^>]+>/g, '').trim();
    const name = cleanCell(cells[0]);
    // Last cell = dose (some tables have empty middle cells)
    const dose = cleanCell(cells[cells.length - 1]);
    if (name && dose && /\d/.test(dose)) items.push({ name, dose });
  }
  return items;
}

// 5) Ingredient eşleştirme: TR isim → ingredient_id
const allIngredients = await c.query(`
  SELECT ingredient_id, ingredient_slug, inci_name, common_name
  FROM ingredients
  WHERE domain_type='supplement' OR domain_type='both' OR domain_type='all'
`);
console.log(`[3] DB ingredient (supplement/both): ${allIngredients.rowCount}`);

// Map: TR name → ingredient_id (common_name + inci_name)
function findIngredient(name) {
  const tokens = tokenize(name);
  let best = { score: 0, id: null, slug: null };
  for (const ing of allIngredients.rows) {
    const candidates = [ing.common_name, ing.inci_name, ing.ingredient_slug.replace(/-/g, ' ')];
    for (const c of candidates) {
      if (!c) continue;
      const score = jaccard(tokens, tokenize(c));
      if (score > best.score) best = { score, id: ing.ingredient_id, slug: ing.ingredient_slug };
    }
  }
  return best;
}

// Concentration band tahmini
function bandFromDose(doseStr) {
  // mg/IU/mcg/μg parsing
  const m = doseStr.match(/(\d+(?:[.,]\d+)?)\s*(mg|mcg|μg|µg|iu|g|ml)/i);
  if (!m) return null;
  const num = parseFloat(m[1].replace(',', '.'));
  const unit = m[2].toLowerCase();
  // Normalize to mg
  let mg = num;
  if (unit === 'mcg' || unit === 'μg' || unit === 'µg') mg = num / 1000;
  if (unit === 'g') mg = num * 1000;
  if (mg >= 100) return 'high';
  if (mg >= 10) return 'medium';
  return 'low';
}

// 6) Process her ürünü
const inserts = [];
const failed = [];
let i = 0;
for (const p of drafts.rows) {
  i++;

  let url, html, items;
  if (p.brand_slug === 'voonka') {
    // Voonka match
    const cleanName = p.product_name.replace(/voonka/gi, '').replace(/[\s-]+\(?kaynak.+$/i, '').trim();
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
      if (!r.ok) { failed.push({ ...p, reason: `voonka HTTP ${r.status}` }); continue; }
      html = await r.text();
    } catch (e) { failed.push({ ...p, reason: 'voonka fetch fail' }); continue; }
    items = parseVoonkaIngredients(html);
  } else if (p.brand_slug === 'nutraxin') {
    const cleanName = p.product_name.replace(/nutraxin/gi, '').replace(/[\s-]+\(?kaynak.+$/i, '').trim();
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
      if (!r.ok) { failed.push({ ...p, reason: `nutraxin HTTP ${r.status}` }); continue; }
      html = await r.text();
    } catch { failed.push({ ...p, reason: 'nutraxin fetch fail' }); continue; }
    items = parseNutraxinIngredients(html);
  } else {
    // orzax - sitemap yok, atla
    failed.push({ ...p, reason: 'orzax site yok' });
    continue;
  }

  if (!items || items.length === 0) {
    failed.push({ ...p, reason: 'parse empty', url });
    continue;
  }

  // Insert each ingredient
  let rowsInserted = 0;
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const match = findIngredient(item.name);
    if (!match.id) continue; // ingredient bulunamadı, skip
    const band = bandFromDose(item.dose) || 'medium';
    try {
      await c.query(
        `INSERT INTO product_ingredients
          (product_id, ingredient_id, ingredient_display_name, listed_as_raw, inci_order_rank, concentration_band, match_status, match_confidence, concentration_source, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'matched', $7, 'voonka-nutraxin-scrape', NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [p.product_id, match.id, item.name, `${item.name} ${item.dose}`, idx + 1, band, match.score.toFixed(2)]
      );
      rowsInserted++;
    } catch (e) {
      // skip
    }
  }
  inserts.push({ product_id: p.product_id, slug: p.product_slug, brand: p.brand_slug, count: rowsInserted, source_url: url });

  await new Promise(r => setTimeout(r, 250));
  if (i % 5 === 0) console.log(`  [${i}/${drafts.rowCount}] inserts=${inserts.length} failed=${failed.length}`);
}

console.log(`\n[FINAL] ${inserts.length} ürüne ingredient eklendi, ${failed.length} skip`);

// Rapor
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_voonka-nutraxin-inci-scrape.md');
const totalIng = inserts.reduce((a, b) => a + b.count, 0);
let md = `# Faz 6.3 — Voonka/Nutraxin INCI Scrape — 2026-04-29\n\n`;
md += `## Özet\n- Hedef: ${drafts.rowCount} INCI'siz Faz 6 ürünü\n- Eşleşen + scrape: ${inserts.length}\n- Total ingredient eklendi: ${totalIng}\n- Skip: ${failed.length}\n\n`;
md += `## Başarılı insert\n\n| ID | Brand | Slug | Count | Source URL |\n|----|-------|------|-------|------------|\n`;
for (const x of inserts) md += `| ${x.product_id} | ${x.brand} | ${x.slug.slice(0,40)} | ${x.count} | ${x.source_url} |\n`;
md += `\n## Skip\n\n| ID | Brand | Slug | Reason |\n|----|-------|------|--------|\n`;
for (const f of failed) md += `| ${f.product_id} | ${f.brand_slug} | ${f.product_slug.slice(0,40)} | ${f.reason} |\n`;
writeFileSync(reportPath, md);
console.log(`Rapor: ${reportPath}`);

await c.end();
