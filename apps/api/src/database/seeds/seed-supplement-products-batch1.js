/**
 * Supplement Products — catalog expansion BATCH 1 (Nutraxin/Voonka/Naturals Garden)
 *
 * Adds 18 TR-local supplement products with:
 *   - products row (status='active', domain_type='supplement')
 *   - supplement_details (form, serving size, certification)
 *   - supplement_ingredients rows (each ingredient with dose)
 *   - product_images (placeholder; admin updates with real Trendyol CDN URL later)
 *   - affiliate_links (Trendyol search URL, verification_status='search_only')
 *
 * Idempotent: UPSERT by product_slug — re-running is safe.
 *
 * Run:  node seed-supplement-products-batch1.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// Category slugs: vitamin-mineral(9), probiyotik(10), bitkisel-takviye(11), omega-yag-asitleri(12)
const TRENDYOL_SEARCH = (q) => `https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`;
const HB_SEARCH = (q) => `https://www.hepsiburada.com/ara?q=${encodeURIComponent(q)}`;
const IMG_PLACEHOLDER = (label) => `https://placehold.co/400x400/f4f4f5/52525b?text=${encodeURIComponent(label)}`;

const PRODUCTS = [
  // ───────────────────────── NUTRAXIN (6) ─────────────────────────
  {
    slug: 'nutraxin-magnesium-bisglycinate-400',
    name: 'Nutraxin Magnesium Bisglycinate 400mg',
    brand: 'nutraxin', category: 'vitamin-mineral',
    short_description: 'Yüksek biyoyararlanımlı bisglisinat formunda magnezyum. 60 tablet.',
    net_content: [60, 'tablet'],
    detail: { form: 'tablet', serving_size: 1, serving_unit: 'tablet', servings: 60, certification: 'GMP' },
    ingredients: [{ slug: 'magnesium-bisglycinate', amount: 400, unit: 'mg', dv: 95, highlight: true }],
  },
  {
    slug: 'nutraxin-zinc-picolinate-25',
    name: 'Nutraxin Zinc Picolinate 25mg',
    brand: 'nutraxin', category: 'vitamin-mineral',
    short_description: 'Yüksek emilimli pikolinat formunda çinko. 60 tablet.',
    net_content: [60, 'tablet'],
    detail: { form: 'tablet', serving_size: 1, serving_unit: 'tablet', servings: 60, certification: 'GMP' },
    ingredients: [{ slug: 'zinc-picolinate', amount: 25, unit: 'mg', dv: 227, highlight: true }],
  },
  {
    slug: 'nutraxin-vitamin-d3-1000',
    name: 'Nutraxin Vitamin D3 1000 IU',
    brand: 'nutraxin', category: 'vitamin-mineral',
    short_description: 'Kolesistiferol (D3) formunda günlük bakım dozu. 60 softgel.',
    net_content: [60, 'softgel'],
    detail: { form: 'softgel', serving_size: 1, serving_unit: 'softgel', servings: 60, certification: 'GMP' },
    ingredients: [{ slug: 'cholecalciferol', amount: 1000, unit: 'IU', dv: 250, highlight: true }],
  },
  {
    slug: 'nutraxin-omega-3-1200',
    name: 'Nutraxin Omega-3 1200mg',
    brand: 'nutraxin', category: 'omega-yag-asitleri',
    short_description: 'Balık yağından elde edilen EPA+DHA. 60 softgel.',
    net_content: [60, 'softgel'],
    detail: { form: 'softgel', serving_size: 1, serving_unit: 'softgel', servings: 60, certification: 'GMP' },
    ingredients: [
      { slug: 'fish-oil', amount: 1200, unit: 'mg', dv: null, highlight: true, sort: 1 },
      { slug: 'epa', amount: 180, unit: 'mg', dv: null, highlight: false, sort: 2 },
      { slug: 'dha', amount: 120, unit: 'mg', dv: null, highlight: false, sort: 3 },
    ],
  },
  {
    slug: 'nutraxin-curcumin-piperine',
    name: 'Nutraxin Curcumin + Piperine',
    brand: 'nutraxin', category: 'bitkisel-takviye',
    short_description: 'Kurkumin ekstresi, piperin ile emilim artırılmıştır. 60 kapsül.',
    net_content: [60, 'kapsül'],
    detail: { form: 'capsule', serving_size: 1, serving_unit: 'kapsül', servings: 60, certification: 'GMP' },
    ingredients: [
      { slug: 'curcumin', amount: 500, unit: 'mg', dv: null, highlight: true, sort: 1 },
      { slug: 'piperine', amount: 5, unit: 'mg', dv: null, highlight: false, sort: 2 },
    ],
  },
  {
    slug: 'nutraxin-probiotic-10-milyar',
    name: 'Nutraxin Probiyotik 10 Milyar CFU',
    brand: 'nutraxin', category: 'probiyotik',
    short_description: 'İki suş içeren günlük probiyotik. 30 kapsül.',
    net_content: [30, 'kapsül'],
    detail: { form: 'capsule', serving_size: 1, serving_unit: 'kapsül', servings: 30, certification: 'GMP' },
    ingredients: [
      { slug: 'lactobacillus-acidophilus', amount: 5, unit: 'B_CFU', dv: null, highlight: true, sort: 1 },
      { slug: 'bifidobacterium-lactis', amount: 5, unit: 'B_CFU', dv: null, highlight: true, sort: 2 },
    ],
  },

  // ───────────────────────── VOONKA (6) ─────────────────────────
  {
    slug: 'voonka-vitamin-c-1000-zinc',
    name: 'Voonka Vitamin C 1000 + Çinko',
    brand: 'voonka', category: 'vitamin-mineral',
    short_description: 'Yüksek doz C vitamini, çinko ile takviye. 30 efervesan tablet.',
    net_content: [30, 'tablet'],
    detail: { form: 'tablet', serving_size: 1, serving_unit: 'efervesan tablet', servings: 30, certification: 'GMP' },
    ingredients: [
      { slug: 'vitamin-c', amount: 1000, unit: 'mg', dv: 1111, highlight: true, sort: 1 },
      { slug: 'zinc', amount: 15, unit: 'mg', dv: 136, highlight: true, sort: 2 },
    ],
  },
  {
    slug: 'voonka-beauty-collagen',
    name: 'Voonka Beauty Collagen Complex',
    brand: 'voonka', category: 'bitkisel-takviye',
    short_description: 'Deniz kaynaklı hidrolize kolajen + C vitamini. 30 saşe.',
    net_content: [30, 'saşe'],
    detail: { form: 'powder', serving_size: 1, serving_unit: 'saşe', servings: 30, certification: 'GMP' },
    ingredients: [
      { slug: 'marine-collagen', amount: 5000, unit: 'mg', dv: null, highlight: true, sort: 1 },
      { slug: 'hydrolyzed-collagen', amount: 2500, unit: 'mg', dv: null, highlight: false, sort: 2 },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 89, highlight: false, sort: 3 },
    ],
  },
  {
    slug: 'voonka-iron-bisglycinate-25',
    name: 'Voonka Iron Bisglycinate 25mg',
    brand: 'voonka', category: 'vitamin-mineral',
    short_description: 'Bisglisinat formunda demir, emilim yüksek. 30 kapsül.',
    net_content: [30, 'kapsül'],
    detail: { form: 'capsule', serving_size: 1, serving_unit: 'kapsül', servings: 30, certification: 'GMP' },
    ingredients: [{ slug: 'iron-bisglycinate', amount: 25, unit: 'mg', dv: 139, highlight: true }],
  },
  {
    slug: 'voonka-coq10-100',
    name: 'Voonka Coenzyme Q10 100mg',
    brand: 'voonka', category: 'vitamin-mineral',
    short_description: 'Hücresel enerji desteği için ubikinon formu. 30 softgel.',
    net_content: [30, 'softgel'],
    detail: { form: 'softgel', serving_size: 1, serving_unit: 'softgel', servings: 30, certification: 'GMP' },
    ingredients: [{ slug: 'coenzyme-q10', amount: 100, unit: 'mg', dv: null, highlight: true }],
  },
  {
    slug: 'voonka-magnesium-marine',
    name: 'Voonka Magnesium Marine',
    brand: 'voonka', category: 'vitamin-mineral',
    short_description: 'Deniz kaynaklı magnezyum, günlük ihtiyaç için. 30 tablet.',
    net_content: [30, 'tablet'],
    detail: { form: 'tablet', serving_size: 1, serving_unit: 'tablet', servings: 30, certification: 'GMP' },
    ingredients: [{ slug: 'magnesium', amount: 375, unit: 'mg', dv: 100, highlight: true }],
  },
  {
    slug: 'voonka-multi-probiotic',
    name: 'Voonka Multi Probiyotik',
    brand: 'voonka', category: 'probiyotik',
    short_description: 'İki suş kombine probiyotik, günlük bağırsak sağlığı. 30 kapsül.',
    net_content: [30, 'kapsül'],
    detail: { form: 'capsule', serving_size: 1, serving_unit: 'kapsül', servings: 30, certification: 'GMP' },
    ingredients: [
      { slug: 'lactobacillus-acidophilus', amount: 4, unit: 'B_CFU', dv: null, highlight: true, sort: 1 },
      { slug: 'bifidobacterium-lactis', amount: 4, unit: 'B_CFU', dv: null, highlight: true, sort: 2 },
    ],
  },

  // ───────────────────────── NATURALS GARDEN (6) ─────────────────────────
  {
    slug: 'naturals-garden-ashwagandha-ksm66',
    name: 'Naturals Garden Ashwagandha KSM-66 500mg',
    brand: 'naturals-garden', category: 'bitkisel-takviye',
    short_description: 'Standardize KSM-66 ekstresi, adaptojen. 60 kapsül.',
    net_content: [60, 'kapsül'],
    detail: { form: 'capsule', serving_size: 1, serving_unit: 'kapsül', servings: 60, certification: 'GMP' },
    ingredients: [{ slug: 'ashwagandha', amount: 500, unit: 'mg', dv: null, highlight: true }],
  },
  {
    slug: 'naturals-garden-b12-methylcobalamin-1000',
    name: 'Naturals Garden Vitamin B12 Methylcobalamin 1000mcg',
    brand: 'naturals-garden', category: 'vitamin-mineral',
    short_description: 'Aktif metilkobalamin formunda B12. 60 tablet.',
    net_content: [60, 'tablet'],
    detail: { form: 'tablet', serving_size: 1, serving_unit: 'tablet', servings: 60, certification: 'GMP' },
    ingredients: [{ slug: 'methylcobalamin', amount: 1000, unit: 'mcg', dv: 41667, highlight: true }],
  },
  {
    slug: 'naturals-garden-maca-1500',
    name: 'Naturals Garden Maca Root 1500mg',
    brand: 'naturals-garden', category: 'bitkisel-takviye',
    short_description: 'And dağlarına özgü maca kökü ekstresi. 60 kapsül.',
    net_content: [60, 'kapsül'],
    detail: { form: 'capsule', serving_size: 2, serving_unit: 'kapsül', servings: 30, certification: 'GMP' },
    ingredients: [{ slug: 'maca-root', amount: 1500, unit: 'mg', dv: null, highlight: true }],
  },
  {
    slug: 'naturals-garden-ginkgo-biloba-120',
    name: 'Naturals Garden Ginkgo Biloba 120mg',
    brand: 'naturals-garden', category: 'bitkisel-takviye',
    short_description: 'Standardize yaprak ekstresi, kognitif destek. 60 kapsül.',
    net_content: [60, 'kapsül'],
    detail: { form: 'capsule', serving_size: 1, serving_unit: 'kapsül', servings: 60, certification: 'GMP' },
    ingredients: [{ slug: 'ginkgo-biloba', amount: 120, unit: 'mg', dv: null, highlight: true }],
  },
  {
    slug: 'naturals-garden-melatonin-3',
    name: 'Naturals Garden Melatonin 3mg',
    brand: 'naturals-garden', category: 'bitkisel-takviye',
    short_description: 'Uyku kalitesi için melatonin tableti. 60 tablet.',
    net_content: [60, 'tablet'],
    detail: { form: 'tablet', serving_size: 1, serving_unit: 'tablet', servings: 60, certification: 'GMP' },
    ingredients: [{ slug: 'melatonin', amount: 3, unit: 'mg', dv: null, highlight: true }],
  },
  {
    slug: 'naturals-garden-biotin-5000',
    name: 'Naturals Garden Biotin 5000mcg',
    brand: 'naturals-garden', category: 'vitamin-mineral',
    short_description: 'Saç, tırnak ve cilt sağlığı için yüksek doz biyotin. 60 tablet.',
    net_content: [60, 'tablet'],
    detail: { form: 'tablet', serving_size: 1, serving_unit: 'tablet', servings: 60, certification: 'GMP' },
    ingredients: [{ slug: 'biotin', amount: 5000, unit: 'mcg', dv: 16667, highlight: true }],
  },
];

async function lookupId(client, sql, param, label) {
  const r = await client.query(sql, [param]);
  if (r.rowCount === 0) throw new Error(`lookup failed: ${label} = ${param}`);
  return r.rows[0];
}

async function upsertProduct(client, p) {
  const brand = await lookupId(client, `SELECT brand_id FROM brands WHERE brand_slug = $1`, p.brand, 'brand');
  const cat = await lookupId(client, `SELECT category_id FROM categories WHERE category_slug = $1`, p.category, 'category');

  // resolve ingredient ids up-front; any missing → abort (don't insert half a product)
  const resolvedIngs = [];
  for (const i of p.ingredients) {
    const row = await client.query(`SELECT ingredient_id FROM ingredients WHERE ingredient_slug = $1`, [i.slug]);
    if (row.rowCount === 0) throw new Error(`ingredient_slug not found: ${i.slug} (product ${p.slug})`);
    resolvedIngs.push({ ...i, ingredient_id: row.rows[0].ingredient_id });
  }

  // UPSERT product
  const upsert = await client.query(
    `INSERT INTO products
       (brand_id, category_id, domain_type, product_name, product_slug, short_description,
        net_content_value, net_content_unit, status)
     VALUES ($1,$2,'supplement',$3,$4,$5,$6,$7,'active')
     ON CONFLICT (product_slug) DO UPDATE SET
       product_name = EXCLUDED.product_name,
       short_description = EXCLUDED.short_description,
       net_content_value = EXCLUDED.net_content_value,
       net_content_unit = EXCLUDED.net_content_unit,
       brand_id = EXCLUDED.brand_id,
       category_id = EXCLUDED.category_id,
       status = EXCLUDED.status,
       updated_at = now()
     RETURNING product_id, (xmax = 0) AS inserted`,
    [brand.brand_id, cat.category_id, p.name, p.slug, p.short_description, p.net_content[0], p.net_content[1]],
  );
  const productId = upsert.rows[0].product_id;
  const wasInserted = upsert.rows[0].inserted;

  // supplement_details
  await client.query(
    `INSERT INTO supplement_details
       (product_id, form, serving_size, serving_unit, servings_per_container, certification, manufacturer_country)
     VALUES ($1,$2,$3,$4,$5,$6,'TR')
     ON CONFLICT (product_id) DO UPDATE SET
       form = EXCLUDED.form,
       serving_size = EXCLUDED.serving_size,
       serving_unit = EXCLUDED.serving_unit,
       servings_per_container = EXCLUDED.servings_per_container,
       certification = EXCLUDED.certification,
       updated_at = now()`,
    [productId, p.detail.form, p.detail.serving_size, p.detail.serving_unit, p.detail.servings, p.detail.certification],
  );

  // supplement_ingredients — delete+insert to keep it simple
  await client.query(`DELETE FROM supplement_ingredients WHERE product_id = $1`, [productId]);
  for (let idx = 0; idx < resolvedIngs.length; idx++) {
    const i = resolvedIngs[idx];
    // daily_value_percentage column is DECIMAL(5,1) — max 9999.9. Clamp extreme NRV values.
    const dvClamped = i.dv == null ? null : Math.min(i.dv, 9999.9);
    await client.query(
      `INSERT INTO supplement_ingredients
         (product_id, ingredient_id, amount_per_serving, unit, daily_value_percentage, is_proprietary_blend, sort_order)
       VALUES ($1,$2,$3,$4,$5,false,$6)`,
      [productId, i.ingredient_id, i.amount, i.unit, dvClamped, i.sort ?? (idx + 1)],
    );
  }

  // mirror "highlight" flag into product_ingredients (used by findSimilar + data quality)
  await client.query(`DELETE FROM product_ingredients WHERE product_id = $1`, [productId]);
  for (let idx = 0; idx < resolvedIngs.length; idx++) {
    const i = resolvedIngs[idx];
    // fetch display name from ingredients table (required NOT NULL column)
    const nameRow = await client.query(
      `SELECT COALESCE(common_name, inci_name) AS display_name FROM ingredients WHERE ingredient_id = $1`,
      [i.ingredient_id],
    );
    const displayName = nameRow.rows[0].display_name;
    await client.query(
      `INSERT INTO product_ingredients
         (product_id, ingredient_id, ingredient_display_name, inci_order_rank, is_highlighted_in_claims, match_status)
       VALUES ($1,$2,$3,$4,$5,'manual')`,
      [productId, i.ingredient_id, displayName, idx + 1, !!i.highlight],
    );
  }

  // product_images — single primary placeholder (admin will update with real CDN URL)
  await client.query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
  await client.query(
    `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text)
     VALUES ($1,$2,'primary',1,$3)`,
    [productId, IMG_PLACEHOLDER(p.name.slice(0, 40)), p.name],
  );

  // affiliate_links — Trendyol + Hepsiburada search URLs (search_only)
  await client.query(
    `INSERT INTO affiliate_links (product_id, platform, affiliate_url, verification_status, is_active)
     VALUES ($1,'trendyol',$2,'search_only',true)
     ON CONFLICT (product_id, platform) DO UPDATE SET
       affiliate_url = EXCLUDED.affiliate_url,
       verification_status = EXCLUDED.verification_status,
       updated_at = now()`,
    [productId, TRENDYOL_SEARCH(p.name)],
  );
  await client.query(
    `INSERT INTO affiliate_links (product_id, platform, affiliate_url, verification_status, is_active)
     VALUES ($1,'hepsiburada',$2,'search_only',true)
     ON CONFLICT (product_id, platform) DO UPDATE SET
       affiliate_url = EXCLUDED.affiliate_url,
       verification_status = EXCLUDED.verification_status,
       updated_at = now()`,
    [productId, HB_SEARCH(p.name)],
  );

  return { productId, wasInserted };
}

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  let inserted = 0, updated = 0, failed = 0;
  try {
    // resync sequences (safe no-op if already aligned)
    if (!DRY) {
      for (const t of ['products', 'supplement_details', 'supplement_ingredients', 'product_ingredients', 'product_images', 'affiliate_links']) {
        const pk = t === 'products' ? 'product_id'
          : t === 'supplement_details' ? 'supplement_detail_id'
          : t === 'supplement_ingredients' ? 'supplement_ingredient_id'
          : t === 'product_ingredients' ? 'product_ingredient_id'
          : t === 'product_images' ? 'image_id'
          : 'affiliate_link_id';
        const seqRes = await client.query(`SELECT pg_get_serial_sequence($1::text, $2::text) AS seq`, [t, pk]);
        const seqName = seqRes.rows[0].seq;
        if (!seqName) continue;
        await client.query(`SELECT setval('${seqName}', COALESCE((SELECT MAX(${pk}) FROM ${t}), 1))`);
      }
    }

    for (const p of PRODUCTS) {
      try {
        if (DRY) {
          console.log(`  [DRY] ${p.brand} / ${p.slug} — ${p.ingredients.length} ingredient(s)`);
          continue;
        }
        const { productId, wasInserted } = await upsertProduct(client, p);
        console.log(`  [${wasInserted ? 'NEW' : 'UPD'}] ${p.slug} → product_id=${productId}`);
        if (wasInserted) inserted++; else updated++;
      } catch (err) {
        console.error(`  [FAIL] ${p.slug}: ${err.message}`);
        failed++;
      }
    }
  } finally {
    await client.end();
  }
  console.log(`\n=== Summary (products batch 1) ===\n  inserted = ${inserted}\n  updated  = ${updated}\n  failed   = ${failed}\n  total    = ${PRODUCTS.length}`);
  if (failed > 0) process.exit(2);
}

main().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
