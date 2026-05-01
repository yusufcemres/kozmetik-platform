// 23 takviye için supplement_ingredients (besin değerleri) bulk insert
// Memory feedback_revela_supplement_pitfalls: pg Client + DV% noRdaPatterns + target_audience enum dikkat
// Format: { product_id, ingredients: [ { slug, amount, unit, dv_pct, sort_order } ] }

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

// Ürün → bileşen mapping (etiket bilgilerine göre standart Türk RDA + DV%)
// DV% null = no RDA defined (noRdaPatterns: bromelain, ginkgo, hyaluronic, glucosamine, omega-3, CLA, probiotic, herbal extract)
// DV% 0 = sayılmaz, frontend'de düzgün gösterilsin diye 0 ekleyelim

const PRODUCTS = [
  // === Nutraxin (20) ===
  { id: 2753, name: 'A-Oxi Formula', ingredients: [
    { slug: 'tocopherol', amount: 30, unit: 'mg', dv: 200, order: 1 },
    { slug: 'beta-carotene', amount: 5, unit: 'mg', dv: 100, order: 2 },
    { slug: 'ascorbic-acid', amount: 100, unit: 'mg', dv: 125, order: 3 },
    { slug: 'selenium', amount: 50, unit: 'mcg', dv: 91, order: 4 },
    { slug: 'zinc', amount: 10, unit: 'mg', dv: 100, order: 5 },
  ]},
  { id: 2763, name: 'Artroflex (Glukozamin)', ingredients: [
    { slug: 'glucosamine', amount: 1500, unit: 'mg', dv: 0, order: 1 },
    { slug: 'chondroitin', amount: 800, unit: 'mg', dv: 0, order: 2 },
    { slug: 'hyaluronic-acid', amount: 50, unit: 'mg', dv: 0, order: 3 },
  ]},
  { id: 2752, name: 'B-One Formula (Kemik)', ingredients: [
    { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 500, order: 1 }, // 1000 IU
    { slug: 'menaquinone', amount: 75, unit: 'mcg', dv: 100, order: 2 },
    { slug: 'magnesium', amount: 200, unit: 'mg', dv: 53, order: 3 },
    { slug: 'zinc', amount: 5, unit: 'mg', dv: 50, order: 4 },
  ]},
  { id: 2730, name: 'Biotin 5000 mcg', ingredients: [
    { slug: 'biotin', amount: 5000, unit: 'mcg', dv: 16667, order: 1 },
  ]},
  { id: 2744, name: 'Biotin Forte', ingredients: [
    { slug: 'biotin', amount: 10000, unit: 'mcg', dv: 33333, order: 1 },
  ]},
  { id: 2735, name: 'Bromelain 500mg', ingredients: [
    { slug: 'bromelain', amount: 500, unit: 'mg', dv: 0, order: 1 }, // no RDA
  ]},
  { id: 2731, name: 'Chromium Picolinate', ingredients: [
    { slug: 'chromium-picolinate', amount: 200, unit: 'mcg', dv: 571, order: 1 },
  ]},
  { id: 2755, name: 'Efervesan C-D-Zinc', ingredients: [
    { slug: 'ascorbic-acid', amount: 1000, unit: 'mg', dv: 1250, order: 1 },
    { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 500, order: 2 }, // 1000 IU
    { slug: 'zinc', amount: 10, unit: 'mg', dv: 100, order: 3 },
  ]},
  { id: 2722, name: 'Folic Acid 400 Mcg', ingredients: [
    { slug: 'folic-acid', amount: 400, unit: 'mcg', dv: 200, order: 1 },
  ]},
  { id: 2728, name: 'Ginkgo Biloba 120mg', ingredients: [
    { slug: 'ginkgo-biloba-leaf-extract', amount: 120, unit: 'mg', dv: 0, order: 1 },
  ]},
  { id: 2748, name: 'Hyaluronik Asit', ingredients: [
    { slug: 'hyaluronic-acid', amount: 100, unit: 'mg', dv: 0, order: 1 },
  ]},
  { id: 2760, name: 'Magnesium Daily', ingredients: [
    { slug: 'magnesium', amount: 350, unit: 'mg', dv: 93, order: 1 },
  ]},
  { id: 2727, name: 'Pregnancy Formula', ingredients: [
    { slug: 'folic-acid', amount: 800, unit: 'mcg', dv: 400, order: 1 },
    { slug: 'iron', amount: 27, unit: 'mg', dv: 193, order: 2 },
    { slug: 'cholecalciferol', amount: 15, unit: 'mcg', dv: 300, order: 3 }, // 600 IU
    { slug: 'vitamin-b12', amount: 8, unit: 'mcg', dv: 320, order: 4 },
    { slug: 'vitamin-b6', amount: 2, unit: 'mg', dv: 143, order: 5 },
    { slug: 'iodine', amount: 150, unit: 'mcg', dv: 100, order: 6 },
  ]},
  { id: 2738, name: 'Probiota Advanced', ingredients: [
    { slug: 'lactobacillus-acidophilus', amount: 5, unit: 'milyar CFU', dv: 0, order: 1 },
    { slug: 'bifidobacterium-lactis', amount: 5, unit: 'milyar CFU', dv: 0, order: 2 },
  ]},
  { id: 2721, name: 'Quick Slim CLA 1300mg', ingredients: [
    { slug: 'conjugated-linoleic-acid', amount: 1300, unit: 'mg', dv: 0, order: 1 },
  ]},
  { id: 2732, name: 'Selenium', ingredients: [
    { slug: 'selenium', amount: 100, unit: 'mcg', dv: 182, order: 1 },
  ]},
  { id: 2750, name: 'Ultra Men', ingredients: [
    { slug: 'zinc', amount: 15, unit: 'mg', dv: 150, order: 1 },
    { slug: 'panax-ginseng-root-extract', amount: 100, unit: 'mg', dv: 0, order: 2 },
    { slug: 'vitamin-b6', amount: 2, unit: 'mg', dv: 143, order: 3 },
    { slug: 'vitamin-b12', amount: 5, unit: 'mcg', dv: 200, order: 4 },
    { slug: 'magnesium', amount: 100, unit: 'mg', dv: 27, order: 5 },
  ]},
  { id: 2747, name: 'Vitamin D3 K2 (30ml)', ingredients: [
    { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 500, order: 1 }, // 1000 IU
    { slug: 'menaquinone', amount: 100, unit: 'mcg', dv: 133, order: 2 },
  ]},
  { id: 2736, name: 'Vitamin D3 K2 (120 tablet)', ingredients: [
    { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 500, order: 1 },
    { slug: 'menaquinone', amount: 75, unit: 'mcg', dv: 100, order: 2 },
  ]},
  { id: 2761, name: 'Zinc Sulphate', ingredients: [
    { slug: 'zinc', amount: 50, unit: 'mg', dv: 500, order: 1 },
  ]},

  // === Orzax Ocean (3) ===
  { id: 2743, name: 'Ocean Bromelain', ingredients: [
    { slug: 'bromelain', amount: 750, unit: 'mg', dv: 0, order: 1 },
  ]},
  { id: 2725, name: 'Ocean 500mg (omega-3)', ingredients: [
    { slug: 'fish-oil', amount: 500, unit: 'mg', dv: 0, order: 1 },
    { slug: 'epa', amount: 90, unit: 'mg', dv: 0, order: 2 },
    { slug: 'dha', amount: 60, unit: 'mg', dv: 0, order: 3 },
  ]},
  { id: 2759, name: 'Ocean Plus Saf Balık Yağı 1200mg', ingredients: [
    { slug: 'fish-oil', amount: 1200, unit: 'mg', dv: 0, order: 1 },
    { slug: 'epa', amount: 360, unit: 'mg', dv: 0, order: 2 },
    { slug: 'dha', amount: 240, unit: 'mg', dv: 0, order: 3 },
  ]},
];

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Slug → ingredient_id mapping
const slugMap = new Map();
const allSlugs = new Set();
for (const p of PRODUCTS) for (const ing of p.ingredients) allSlugs.add(ing.slug);

const slugRows = await c.query(
  `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
  [[...allSlugs]]
);
for (const r of slugRows.rows) slugMap.set(r.ingredient_slug, r.ingredient_id);

// Eksik slug'ları yeni insert et (otomatik)
const missing = [...allSlugs].filter(s => !slugMap.has(s));
console.log(`DB'de bulunan slug: ${slugMap.size}/${allSlugs.size}`);
if (missing.length > 0) {
  console.log(`Eksik slug'lar yeni eklenecek: ${missing.join(', ')}`);
  for (const s of missing) {
    const inciName = s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    const ins = await c.query(
      `INSERT INTO ingredients (ingredient_slug, inci_name, common_name, function_summary, evidence_grade, evidence_citations, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, '[]'::jsonb, NOW(), NOW())
       RETURNING ingredient_id`,
      [s, inciName, inciName, 'Takviye edici gıda bileşeni; oral kullanım için.', 'C']
    );
    slugMap.set(s, ins.rows[0].ingredient_id);
    console.log(`  ✓ ${s} (id=${ins.rows[0].ingredient_id})`);
  }
}

// Bulk insert supplement_ingredients
let totalRows = 0, products = 0;
for (const p of PRODUCTS) {
  let added = 0;
  for (const ing of p.ingredients) {
    const ingId = slugMap.get(ing.slug);
    if (!ingId) { console.log(`  ✗ ${p.name} → ${ing.slug} bulunamadı, atla`); continue; }

    // DV% schema numeric(5,1) max 9999.9 — cap
    const cappedDv = ing.dv > 9999 ? 9999 : ing.dv;
    await c.query(
      `INSERT INTO supplement_ingredients (product_id, ingredient_id, amount_per_serving, unit, daily_value_percentage, is_proprietary_blend, sort_order, created_at)
       VALUES ($1, $2, $3, $4, $5, false, $6, NOW())
       ON CONFLICT DO NOTHING`,
      [p.id, ingId, ing.amount, ing.unit, cappedDv, ing.order]
    );
    added++;
    totalRows++;
  }
  if (added > 0) {
    console.log(`✓ id=${p.id} | ${p.name} → ${added} bileşen eklendi`);
    products++;
  }
}

console.log(`\nÜrün: ${products}/${PRODUCTS.length}, satır: ${totalRows}`);

// Final coverage
const cov = await c.query(`
  SELECT COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id = p.product_id)) AS with_facts,
         COUNT(*) AS total
  FROM products p
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
`);
const cv = cov.rows[0];
console.log(`Yayında takviye besin değerleri: ${cv.with_facts}/${cv.total} (${(100*cv.with_facts/cv.total).toFixed(1)}%)`);

await c.end();
