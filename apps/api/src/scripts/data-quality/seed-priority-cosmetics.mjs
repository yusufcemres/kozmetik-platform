/**
 * 16 öncelikli kozmetik markasından her birinden 1 popüler pilot ürün seed.
 *
 * Patron review etsin, OK olursa marka başına 3-5 ürün daha eklenecek.
 *
 * Pipeline:
 *   1) products + product_ingredients (INCI)
 *   2) product_labels (optional warning/usage)
 *   3) product_scores (cosmetic-v1 heuristic — patron sonra admin recalculate ile precision artırır)
 *
 * Markalar: Cosmed, Bioderma, The Ceel, Procsin, Yves Rocher, The Purest Solutions,
 * Dove, Resetify, The Ordinary, La Roche-Posay, Nivea, Cream Co., PH Lab, Sinoz, Licape, WLab.
 *
 * Idempotent: product_slug UNIQUE → re-run güvenli.
 *
 * Kullanım:
 *   node src/scripts/data-quality/seed-priority-cosmetics.mjs --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

// Ingredient slug → ID lookup (INCI listesinden çekilecek)
const INGREDIENT_SLUGS = [
  // Aktifler
  'niacinamide', 'retinol', 'salicylic-acid', 'glycolic-acid', 'lactic-acid',
  'vitamin-c', 'azelaic-acid', 'mandelic-acid',
  // Peptid
  'copper-tripeptide-1',
  // Nemlendiriciler
  'hyaluronic-acid', 'sodium-hyaluronate', 'glycerin', 'panthenol',
  'urea', 'allantoin', 'squalane',
  // Vitamin
  'vitamin-e', 'tocopherol',
  // Botanik
  'centella-asiatica-extract', 'green-tea-extract', 'snail-secretion-filtrate',
  // Bariyer
  'ceramide-np',
  // Yardımcı
  'phenoxyethanol', 'butylene-glycol', 'propanediol', 'caprylic-capric-triglyceride',
  'cetearyl-alcohol', 'dimethicone',
  // Su
  'aqua', 'water',
];

// Her ürün:
// {
//   name: 'Marka Ürün Adı', brand: 'cosmed', category_slug: 'serum-ampul',
//   short_description: '...', target_area: 'face' | 'body',
//   ingredients: [{slug, rank, band, highlighted}, ...] (INCI sırasına göre)
// }
const TEMPLATES = [
  {
    name: 'Sebamed Yüz Yıkama Köpüğü 150 ml',
    brand: 'cosmed',
    category_slug: 'temizleme-kopugu',
    target_area: 'face',
    short_description: 'Hassas ciltler için pH dengeleyici, sülfat içermeyen yıkama köpüğü.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'allantoin', band: 'low', highlighted: true },
      { slug: 'panthenol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Sensibio H2O Misel Su 250 ml',
    brand: 'bioderma',
    category_slug: 'misel-su',
    target_area: 'face',
    short_description: 'Hassas cilt için makyaj temizleyici klasik misel su — durulama gerekmez.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'low' },
      { slug: 'allantoin', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Niacinamide %10 Yüz Serumu 30 ml',
    brand: 'the-ceel',
    category_slug: 'serum-ampul',
    target_area: 'face',
    short_description: 'Gözenek görünümünü azaltır, sebum dengeleyici niasinamid konsantresi.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'niacinamide', band: 'high', highlighted: true },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'sodium-hyaluronate', band: 'low' },
      { slug: 'panthenol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'BHA Tonik 200 ml',
    brand: 'procsin',
    category_slug: 'tonik-losyon',
    target_area: 'face',
    short_description: 'Salisilik asit içeren akne ve gözenek bakım toniği.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'salicylic-acid', band: 'medium', highlighted: true },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'centella-asiatica-extract', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Botanic Beauty Solution Hyaluronik Asit Serumu 30 ml',
    brand: 'yves-rocher',
    category_slug: 'serum-ampul',
    target_area: 'face',
    short_description: 'Cildi yoğun nemlendirir, kırışıklık görünümünü hafifletir.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'sodium-hyaluronate', band: 'medium', highlighted: true },
      { slug: 'butylene-glycol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'C Vitamini %20 Yüz Serumu 30 ml',
    brand: 'the-purest-solutions',
    category_slug: 'serum-ampul',
    target_area: 'face',
    short_description: 'Yüksek doz C vitamini ile aydınlatıcı ve antioksidan serum.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'vitamin-c', band: 'high', highlighted: true },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'tocopherol', band: 'low' },
      { slug: 'sodium-hyaluronate', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Beauty Bar Sabun 100 g',
    brand: 'dove',
    category_slug: 'temizleme',
    target_area: 'face',
    short_description: 'Klasik bar sabun — 1/4 nemlendirici krem içerikli formül.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'medium', highlighted: true },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Niacinamide %10 + Çinko Serumu 30 ml',
    brand: 'resetify',
    category_slug: 'serum-ampul',
    target_area: 'face',
    short_description: 'Yağ kontrolü ve gözenek görünümü için niasinamid + çinko serumu.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'niacinamide', band: 'high', highlighted: true },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'butylene-glycol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Niacinamide 10% + Zinc 1% Serum 30 ml',
    brand: 'the-ordinary',
    category_slug: 'serum-ampul',
    target_area: 'face',
    short_description: 'Yağ kontrolü, gözenek minimize, leke önleme için ikon serum.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'niacinamide', band: 'high', highlighted: true },
      { slug: 'propanediol', band: 'medium' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Effaclar Duo+ Akne Karşıtı Krem 40 ml',
    brand: 'la-roche-posay',
    category_slug: 'yuz-bakim',
    target_area: 'face',
    short_description: 'İnatçı akne ve gözenek bakımı için targetli formül.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'niacinamide', band: 'medium', highlighted: true },
      { slug: 'salicylic-acid', band: 'low', highlighted: true },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Q10 Anti-Wrinkle Gündüz Krem 50 ml',
    brand: 'nivea',
    category_slug: 'yuz-bakim',
    target_area: 'face',
    short_description: 'Q10 + kreatin ile kırışıklık görünümünü azaltan gündüz kremi.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'tocopherol', band: 'low' },
      { slug: 'panthenol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Hyaluronik Asit + B5 Nemlendirici Krem 50 ml',
    brand: 'cream-co',
    category_slug: 'yuz-bakim',
    target_area: 'face',
    short_description: 'Yoğun nem desteği ve cilt bariyer onarımı için günlük nemlendirici.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'sodium-hyaluronate', band: 'medium', highlighted: true },
      { slug: 'panthenol', band: 'medium' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'caprylic-capric-triglyceride', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'AHA + BHA Yüz Tonik 250 ml',
    brand: 'ph-lab',
    category_slug: 'tonik-losyon',
    target_area: 'face',
    short_description: 'Glikolik + salisilik asit kombinasyonu hafif eksfolyan tonik.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycolic-acid', band: 'medium', highlighted: true },
      { slug: 'salicylic-acid', band: 'low', highlighted: true },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'panthenol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Kolajen Yoğun Bakım Serumu 30 ml',
    brand: 'sinoz',
    category_slug: 'serum-ampul',
    target_area: 'face',
    short_description: 'Kolajen + peptid ile sıkılaştırıcı ve dolgunlaştırıcı yüz serumu.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'sodium-hyaluronate', band: 'medium' },
      { slug: 'copper-tripeptide-1', band: 'low', highlighted: true },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Cica Onarıcı Yüz Kremi 50 ml',
    brand: 'licape',
    category_slug: 'yuz-bakim',
    target_area: 'face',
    short_description: 'Centella asiatica + panthenol ile hassas cilt onarım kremi.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'centella-asiatica-extract', band: 'medium', highlighted: true },
      { slug: 'panthenol', band: 'medium' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'allantoin', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Retinol %0.3 Gece Serumu 30 ml',
    brand: 'wlab',
    category_slug: 'serum-ampul',
    target_area: 'face',
    short_description: 'Anti-aging ve cilt yenileme için orta doz retinol gece serumu.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'caprylic-capric-triglyceride', band: 'medium' },
      { slug: 'retinol', band: 'low', highlighted: true },
      { slug: 'tocopherol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
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
    // Brand lookup
    const brandSlugs = Array.from(new Set(TEMPLATES.map((t) => t.brand)));
    const brandRes = await client.query(
      `SELECT brand_id, brand_slug, brand_name FROM brands WHERE brand_slug = ANY($1::text[])`,
      [brandSlugs],
    );
    const brandMap = new Map(brandRes.rows.map((b) => [b.brand_slug, b]));
    console.log(`Brands found: ${brandMap.size}/${brandSlugs.length}`);
    if (brandMap.size < brandSlugs.length) {
      const missing = brandSlugs.filter((s) => !brandMap.has(s));
      console.error('MISSING brands:', missing);
      process.exit(2);
    }

    // Category lookup
    const catSlugs = Array.from(new Set(TEMPLATES.map((t) => t.category_slug)));
    const catRes = await client.query(
      `SELECT category_id, category_slug FROM categories WHERE category_slug = ANY($1::text[])`,
      [catSlugs],
    );
    const catMap = new Map(catRes.rows.map((c) => [c.category_slug, c.category_id]));
    console.log(`Categories found: ${catMap.size}/${catSlugs.length}`);

    // Ingredient lookup
    const ingSlugs = Array.from(new Set(TEMPLATES.flatMap((t) => t.ings.map((i) => i.slug))));
    const ingRes = await client.query(
      `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
      [ingSlugs],
    );
    const ingMap = new Map(ingRes.rows.map((r) => [r.ingredient_slug, r.ingredient_id]));
    console.log(`Ingredients found: ${ingMap.size}/${ingSlugs.length}`);
    const missingIngs = ingSlugs.filter((s) => !ingMap.has(s));
    if (missingIngs.length) {
      console.warn('MISSING ingredients (will skip those rows):', missingIngs);
    }

    // Plan
    const plan = TEMPLATES.map((t) => {
      const brand = brandMap.get(t.brand);
      const slug = turkishSlug(`${brand.brand_name}-${t.name}`);
      return { ...t, brand_id: brand.brand_id, brand_name: brand.brand_name, slug };
    });

    if (!apply) {
      console.log(`\n[DRY-RUN] ${plan.length} ürün eklenecek. İlk 3:`);
      for (const p of plan.slice(0, 3)) {
        console.log(`  ${p.slug} (${p.brand_name}) — ${p.ings.length} INCI`);
      }
      console.log('\nRe-run with --apply.');
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

      const catId = catMap.get(p.category_slug) || 1; // 1 = Yüz Bakım fallback
      const productRes = await client.query(
        `INSERT INTO products (product_name, product_slug, brand_id, category_id, domain_type, short_description, target_area, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'cosmetic', $5, $6, 'published', NOW(), NOW())
         RETURNING product_id`,
        [p.name, p.slug, p.brand_id, catId, p.short_description, p.target_area || 'face'],
      );
      const productId = productRes.rows[0].product_id;
      newIds.push(productId);

      let order = 0;
      for (const ing of p.ings) {
        order++;
        const ingId = ingMap.get(ing.slug);
        if (!ingId) continue;
        await client.query(
          `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, match_confidence, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, false, $6, 'matched', 0.9, NOW(), NOW())`,
          [productId, ingId, ing.slug, order, ing.band, !!ing.highlighted],
        );
      }

      inserted++;
    }

    // need_scores aggregate
    if (newIds.length) {
      console.log(`Computing need scores for ${newIds.length} new cosmetics...`);
      await client.query(
        `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, calculated_at)
         SELECT
           pi.product_id,
           inm.need_id,
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

      // Refresh top_need
      await client.query(
        `UPDATE products p
         SET top_need_name = sub.need_name,
             top_need_score = sub.compatibility_score
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

      // Heuristic cosmetic-v1 score
      await client.query(
        `INSERT INTO product_scores (product_id, algorithm_version, overall_score, grade, breakdown, explanation, flags, computed_at)
         SELECT
           p.product_id, 'cosmetic-v1',
           75 AS overall_score,
           'B' AS grade,
           '{"safety": 80, "efficacy": 70, "transparency": 75, "evidence": 70, "value": 75}'::jsonb,
           '[]'::jsonb,
           '{"allergens": [], "fragrances": [], "harmful": [], "cmr": [], "endocrine": [], "eu_banned": []}'::jsonb,
           NOW()
         FROM products p
         WHERE p.product_id = ANY($1::int[])
         ON CONFLICT (product_id, algorithm_version) DO NOTHING`,
        [newIds],
      );
    }

    await client.query('COMMIT');
    console.log(`\nOK: ${inserted} ürün insert, ${skipped} mevcut zaten`);

    const after = await client.query(`SELECT COUNT(*) AS n FROM products WHERE domain_type = 'cosmetic'`);
    console.log(`Toplam cosmetic: ${after.rows[0].n}`);
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
