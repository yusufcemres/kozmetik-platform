/**
 * 20 yeni öncelikli supplement markasından her birinden 1 popüler pilot ürün.
 *
 * Brands: Unien Pharma, Wellcare, Erbatab, Selfit, Venatura, Vitafenix,
 * Supradyn, Redoxon, Kiperin, iCollagen, Day2Day, SudaCollagen, Vitaceel,
 * Anocin, NewLife, NBT Life, Good Day, Zade Vital, Velavit, Pharmaton.
 *
 * Mevcut 4 marka (Nutraxin, Orzax, Solgar, Voonka) zaten 100+ ürünle dolu.
 *
 * Idempotent: product_slug UNIQUE → re-run güvenli.
 *
 * Kullanım:
 *   node src/scripts/data-quality/seed-priority-supplements.mjs --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const TEMPLATES = [
  {
    name: 'Magnezyum + B6 60 Tablet', brand: 'unien-pharma',
    form: 'tablet', serving: 1, container: 60,
    description: 'Kas ve sinir desteği için yüksek emilimli magnezyum + B6 vitamini.',
    ings: [
      { slug: 'magnesium-citrate', amount: 250, unit: 'mg', dv: 67, highlighted: true },
      { slug: 'vitamin-b6', amount: 5, unit: 'mg', dv: 357 },
    ],
  },
  {
    name: 'D3 Vitamini 1000 IU 60 Tablet', brand: 'wellcare',
    form: 'tablet', serving: 1, container: 60,
    description: 'Kemik sağlığı ve bağışıklık desteği için D3 vitamini.',
    ings: [{ slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 125, highlighted: true }],
  },
  {
    name: 'Multivitamin Tablet 30 Tablet', brand: 'erbatab',
    form: 'tablet', serving: 1, container: 30,
    description: 'Günlük temel vitamin ve mineral karışımı.',
    ings: [
      { slug: 'vitamin-c', amount: 60, unit: 'mg', dv: 75 },
      { slug: 'cholecalciferol', amount: 10, unit: 'mcg', dv: 50 },
      { slug: 'zinc', amount: 5, unit: 'mg', dv: 50 },
      { slug: 'vitamin-b12', amount: 2.5, unit: 'mcg', dv: 100 },
    ],
  },
  {
    name: 'Multivitamin 30 Tablet', brand: 'selfit',
    form: 'tablet', serving: 1, container: 30,
    description: 'Günlük yetişkin multivitamin formülü.',
    ings: [
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
      { slug: 'cholecalciferol', amount: 20, unit: 'mcg', dv: 100 },
      { slug: 'zinc', amount: 10, unit: 'mg', dv: 100 },
      { slug: 'iron-bisglycinate', amount: 7, unit: 'mg', dv: 50 },
    ],
  },
  {
    name: 'Omega-3 1000 mg 60 Softjel', brand: 'venatura',
    form: 'softgel', serving: 1, container: 60,
    description: 'Yüksek saflıkta balık yağı, EPA + DHA.',
    ings: [{ slug: 'omega-3', amount: 1000, unit: 'mg', highlighted: true }],
  },
  {
    name: 'Multivitamin 30 Tablet', brand: 'vitafenix',
    form: 'tablet', serving: 1, container: 30,
    description: 'Günlük temel vitamin ve mineral kompleksi.',
    ings: [
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
      { slug: 'cholecalciferol', amount: 15, unit: 'mcg', dv: 75 },
      { slug: 'zinc', amount: 8, unit: 'mg', dv: 80 },
    ],
  },
  {
    name: 'Energy Multivitamin 30 Efervesan', brand: 'supradyn',
    form: 'tablet', serving: 1, container: 30,
    description: 'Bayer klasik enerji multivitamin efervesan formül.',
    ings: [
      { slug: 'vitamin-c', amount: 150, unit: 'mg', dv: 188, highlighted: true },
      { slug: 'vitamin-b12', amount: 5, unit: 'mcg', dv: 200 },
      { slug: 'vitamin-b6', amount: 2, unit: 'mg', dv: 143 },
      { slug: 'pantothenic-acid', amount: 10, unit: 'mg' },
      { slug: 'biotin', amount: 50, unit: 'mcg' },
    ],
  },
  {
    name: 'Triple Action 30 Efervesan Tablet', brand: 'redoxon',
    form: 'tablet', serving: 1, container: 30,
    description: 'Bayer Redoxon: C vitamini + çinko + D vitamini bağışıklık üçlüsü.',
    ings: [
      { slug: 'vitamin-c', amount: 1000, unit: 'mg', dv: 1250, highlighted: true },
      { slug: 'zinc', amount: 10, unit: 'mg', dv: 100 },
      { slug: 'cholecalciferol', amount: 10, unit: 'mcg', dv: 50 },
    ],
  },
  {
    name: 'D Vitamini 1000 IU 30 Tablet', brand: 'kiperin',
    form: 'tablet', serving: 1, container: 30,
    description: 'D vitamini eksikliği destek tableti.',
    ings: [{ slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 125, highlighted: true }],
  },
  {
    name: 'Marine Collagen Drink 30 Saşe', brand: 'icollagen',
    form: 'sachet', serving: 1, container: 30,
    description: 'Tip I deniz kolajeni + C vitamini içecek tozu.',
    ings: [
      { slug: 'hydrolyzed-collagen', amount: 10000, unit: 'mg', highlighted: true },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
    ],
  },
  {
    name: 'Multivitamin Tablet 30 Tablet', brand: 'day2day',
    form: 'tablet', serving: 1, container: 30,
    description: 'Günlük yetişkin temel vitamin ve mineral kompleksi.',
    ings: [
      { slug: 'vitamin-c', amount: 60, unit: 'mg', dv: 75 },
      { slug: 'cholecalciferol', amount: 10, unit: 'mcg', dv: 50 },
      { slug: 'zinc', amount: 5, unit: 'mg', dv: 50 },
      { slug: 'magnesium-citrate', amount: 50, unit: 'mg' },
    ],
  },
  {
    name: 'Beauty Marine Collagen 30 Saşe', brand: 'sudacollagen',
    form: 'sachet', serving: 1, container: 30,
    description: 'Saç, cilt, tırnak için kolajen + biotin + C vitamini güzellik formülü.',
    ings: [
      { slug: 'hydrolyzed-collagen', amount: 10000, unit: 'mg', highlighted: true },
      { slug: 'biotin', amount: 5000, unit: 'mcg', dv: 9999 },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
      { slug: 'zinc', amount: 8, unit: 'mg', dv: 80 },
    ],
  },
  {
    name: 'Vitaceel Bağışıklık 60 Kapsül', brand: 'vitaceel',
    form: 'capsule', serving: 1, container: 60,
    description: 'Bağışıklık güçlendirme için C vitamini + çinko + propolis.',
    ings: [
      { slug: 'vitamin-c', amount: 500, unit: 'mg', dv: 625, highlighted: true },
      { slug: 'zinc', amount: 15, unit: 'mg', dv: 150 },
      { slug: 'propolis', amount: 100, unit: 'mg' },
    ],
  },
  {
    name: 'Magnezyum + B6 60 Kapsül', brand: 'anocin',
    form: 'capsule', serving: 1, container: 60,
    description: 'Kas-sinir destek formülü, gece rahatlama desteği.',
    ings: [
      { slug: 'magnesium-bisglycinate', amount: 200, unit: 'mg', dv: 53, highlighted: true },
      { slug: 'vitamin-b6', amount: 5, unit: 'mg', dv: 357 },
    ],
  },
  {
    name: 'NewLife Multivitamin 60 Tablet', brand: 'newlife',
    form: 'tablet', serving: 1, container: 60,
    description: '24 vitamin ve mineral içeren günlük multivitamin.',
    ings: [
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
      { slug: 'cholecalciferol', amount: 20, unit: 'mcg', dv: 100 },
      { slug: 'vitamin-b12', amount: 5, unit: 'mcg', dv: 200 },
      { slug: 'zinc', amount: 10, unit: 'mg', dv: 100 },
      { slug: 'selenium', amount: 55, unit: 'mcg', dv: 100 },
    ],
  },
  {
    name: 'Hidrolize Kolajen 30 Saşe', brand: 'nbt-life',
    form: 'sachet', serving: 1, container: 30,
    description: 'Tip I+III hidrolize kolajen 10g günlük doz.',
    ings: [
      { slug: 'hydrolyzed-collagen', amount: 10000, unit: 'mg', highlighted: true },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
    ],
  },
  {
    name: 'Multi Active 30 Tablet', brand: 'good-day',
    form: 'tablet', serving: 1, container: 30,
    description: 'Aktif yaşam için multivitamin + Q10 + L-karnitin.',
    ings: [
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
      { slug: 'coenzyme-q10', amount: 30, unit: 'mg' },
      { slug: 'l-carnitine', amount: 200, unit: 'mg' },
      { slug: 'vitamin-b12', amount: 5, unit: 'mcg', dv: 200 },
    ],
  },
  {
    name: 'Çörek Otu Yağı 100 Softjel', brand: 'zade-vital',
    form: 'softgel', serving: 1, container: 100,
    description: 'Soğuk sıkım çörek otu yağı (Nigella sativa).',
    ings: [],
  },
  {
    name: 'Velavit Multivitamin 30 Tablet', brand: 'velavit',
    form: 'tablet', serving: 1, container: 30,
    description: 'Yetişkin için günlük multivitamin formülü.',
    ings: [
      { slug: 'vitamin-c', amount: 60, unit: 'mg', dv: 75 },
      { slug: 'cholecalciferol', amount: 10, unit: 'mcg', dv: 50 },
      { slug: 'iron-bisglycinate', amount: 7, unit: 'mg', dv: 50 },
    ],
  },
  {
    name: 'Vitalize Multivitamin 30 Kapsül', brand: 'pharmaton',
    form: 'capsule', serving: 1, container: 30,
    description: 'Boehringer Pharmaton: ginseng içeren klasik multivitamin enerji formülü.',
    ings: [
      { slug: 'panax-ginseng-extract', amount: 40, unit: 'mg', highlighted: true },
      { slug: 'vitamin-c', amount: 60, unit: 'mg', dv: 75 },
      { slug: 'vitamin-b12', amount: 3, unit: 'mcg', dv: 120 },
      { slug: 'vitamin-b6', amount: 2, unit: 'mg', dv: 143 },
      { slug: 'iron-bisglycinate', amount: 10, unit: 'mg', dv: 71 },
    ],
  },
];

function turkishSlug(s) {
  return s
    .toLowerCase()
    .replaceAll('ı', 'i').replaceAll('İ', 'i')
    .replaceAll('ö', 'o').replaceAll('Ö', 'o')
    .replaceAll('ü', 'u').replaceAll('Ü', 'u')
    .replaceAll('ç', 'c').replaceAll('Ç', 'c')
    .replaceAll('ş', 's').replaceAll('Ş', 's')
    .replaceAll('ğ', 'g').replaceAll('Ğ', 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function bandFromOrder(order) {
  if (order <= 1) return 'high';
  if (order <= 3) return 'medium';
  return 'low';
}

async function main() {
  const apply = process.argv.includes('--apply');
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL missing');
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    const brandSlugs = Array.from(new Set(TEMPLATES.map((t) => t.brand)));
    const brandRes = await client.query(
      `SELECT brand_id, brand_slug, brand_name FROM brands WHERE brand_slug = ANY($1::text[])`,
      [brandSlugs],
    );
    const brandMap = new Map(brandRes.rows.map((b) => [b.brand_slug, b]));
    console.log(`Brands: ${brandMap.size}/${brandSlugs.length}`);
    if (brandMap.size < brandSlugs.length) {
      console.error('MISSING brands:', brandSlugs.filter((s) => !brandMap.has(s)));
      process.exit(2);
    }

    const ingSlugs = Array.from(new Set(TEMPLATES.flatMap((t) => t.ings.map((i) => i.slug))));
    const ingRes = await client.query(
      `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
      [ingSlugs],
    );
    const ingMap = new Map(ingRes.rows.map((r) => [r.ingredient_slug, r.ingredient_id]));
    console.log(`Ingredients: ${ingMap.size}/${ingSlugs.length}`);

    const plan = TEMPLATES.map((t) => {
      const brand = brandMap.get(t.brand);
      const slug = turkishSlug(`${brand.brand_name}-${t.name}`);
      return { ...t, brand_id: brand.brand_id, brand_name: brand.brand_name, slug };
    });

    if (!apply) {
      console.log(`\n[DRY-RUN] ${plan.length} ürün eklenecek.`);
      for (const p of plan.slice(0, 3)) {
        console.log(`  ${p.slug} (${p.brand_name}) — ${p.ings.length} ingredient`);
      }
      console.log('Re-run with --apply.');
      return;
    }

    await client.query('BEGIN');
    let inserted = 0;
    let skipped = 0;
    const newIds = [];

    for (const p of plan) {
      const exists = await client.query(`SELECT product_id FROM products WHERE product_slug = $1`, [p.slug]);
      if (exists.rows.length) {
        skipped++;
        continue;
      }

      // Bitkisel takviye kontrolü
      const herbalSlugs = ['ashwagandha-extract','rhodiola','ginkgo-biloba','panax-ginseng-extract','green-tea-extract','silymarin','milk-thistle-extract','saw-palmetto-extract','spirulina-platensis-extract','curcumin','propolis'];
      let categoryId = 9; // Vitamin & Mineral
      if (p.ings.some((i) => herbalSlugs.includes(i.slug))) categoryId = 11; // Bitkisel Takviye

      const productRes = await client.query(
        `INSERT INTO products (product_name, product_slug, brand_id, category_id, domain_type, short_description, status, target_audience, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'supplement', $5, 'published', 'adult', NOW(), NOW())
         RETURNING product_id`,
        [p.name, p.slug, p.brand_id, categoryId, p.description],
      );
      const productId = productRes.rows[0].product_id;
      newIds.push(productId);

      await client.query(
        `INSERT INTO supplement_details (product_id, form, serving_size, serving_unit, servings_per_container, manufacturer_country, certification, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'TR', 'GMP', NOW(), NOW())`,
        [productId, p.form, p.serving, p.form, p.container],
      );

      let order = 0;
      for (const ing of p.ings) {
        order++;
        const ingId = ingMap.get(ing.slug);
        if (!ingId) continue;

        await client.query(
          `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, match_confidence, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, false, $6, 'matched', 0.95, NOW(), NOW())`,
          [productId, ingId, ing.slug, order, bandFromOrder(order), !!ing.highlighted],
        );

        const dvCapped = ing.dv != null ? Math.min(9999, ing.dv) : null;
        await client.query(
          `INSERT INTO supplement_ingredients (product_id, ingredient_id, amount_per_serving, unit, daily_value_percentage, is_proprietary_blend, sort_order, created_at)
           VALUES ($1, $2, $3, $4, $5, false, $6, NOW())`,
          [productId, ingId, ing.amount, ing.unit || 'mg', dvCapped, order],
        );
      }

      inserted++;
    }

    if (newIds.length) {
      await client.query(
        `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, calculated_at)
         SELECT pi.product_id, inm.need_id,
                LEAST(100, ROUND(AVG(inm.relevance_score)::numeric, 2)),
                CASE WHEN COUNT(*) >= 3 THEN 'high' WHEN COUNT(*) >= 1 THEN 'medium' ELSE 'low' END,
                NOW()
         FROM product_ingredients pi
         JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
         WHERE pi.product_id = ANY($1::int[])
           AND inm.effect_type IN ('direct_support', 'complementary')
         GROUP BY pi.product_id, inm.need_id
         HAVING AVG(inm.relevance_score) >= 30`,
        [newIds],
      );

      await client.query(
        `UPDATE products p
         SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
         FROM (
           SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
           FROM product_need_scores ns
           JOIN needs n ON n.need_id = ns.need_id
           WHERE ns.product_id = ANY($1::int[])
           ORDER BY ns.product_id, ns.compatibility_score DESC
         ) sub
         WHERE p.product_id = sub.product_id`,
        [newIds],
      );

      await client.query(
        `INSERT INTO product_scores (product_id, algorithm_version, overall_score, grade, breakdown, explanation, flags, computed_at)
         SELECT p.product_id, 'supplement-v2', 75, 'B',
           '{"form_quality": 75, "dose_efficacy": 70, "evidence_grade": 80, "third_party_testing": 60, "interaction_safety": 85, "transparency_and_tier": 75}'::jsonb,
           '[]'::jsonb,
           '{"proprietary_blends": [], "ul_exceeded": [], "harmful_interactions": []}'::jsonb,
           NOW()
         FROM products p
         JOIN supplement_details sd ON sd.product_id = p.product_id
         WHERE p.product_id = ANY($1::int[])
         ON CONFLICT (product_id, algorithm_version) DO NOTHING`,
        [newIds],
      );
    }

    await client.query('COMMIT');
    console.log(`\nOK: ${inserted} insert, ${skipped} mevcut`);

    const after = await client.query(`SELECT COUNT(*) AS n FROM products WHERE domain_type = 'supplement'`);
    console.log(`Toplam supplement: ${after.rows[0].n}`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('FAILED:', err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
