/**
 * Patch 2 — 4 ek kozmetik markası: Frudia, Isana (Rossmann), Watsons, Bee Beauty (Gratis).
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const TEMPLATES = [
  {
    name: 'Blueberry Hydrating Intensive Cream 55 g', brand: 'frudia',
    category_slug: 'yuz-bakim', target_area: 'face',
    short_description: 'Yaban mersini ekstresi + hyaluronik asit ile yoğun nemlendirici Kore tipi krem.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'sodium-hyaluronate', band: 'medium', highlighted: true },
      { slug: 'butylene-glycol', band: 'low' },
      { slug: 'panthenol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Hassas Cilt Yüz Kremi 50 ml', brand: 'isana',
    category_slug: 'yuz-bakim', target_area: 'face',
    short_description: 'Rossmann Isana hassas ciltler için panthenol + allantoin nemlendirici krem.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'panthenol', band: 'medium', highlighted: true },
      { slug: 'allantoin', band: 'low' },
      { slug: 'tocopherol', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Naturally Aloe Vera Yüz Maskesi', brand: 'watsons',
    category_slug: 'temizleme', target_area: 'face',
    short_description: 'Aloe vera ekstresi içeren tek kullanımlık nemlendirici sheet maske.',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'butylene-glycol', band: 'low' },
      { slug: 'centella-asiatica-extract', band: 'low' },
      { slug: 'phenoxyethanol', band: 'low' },
    ],
  },
  {
    name: 'Niasinamid + Çinko Yüz Serumu 30 ml', brand: 'bee-beauty',
    category_slug: 'serum-ampul', target_area: 'face',
    short_description: 'Gözenek görünümünü azaltan, sebum dengeleyici niasinamid serumu (Gratis ekslüzif).',
    ings: [
      { slug: 'aqua', band: 'very_high' },
      { slug: 'niacinamide', band: 'high', highlighted: true },
      { slug: 'glycerin', band: 'medium' },
      { slug: 'sodium-hyaluronate', band: 'low' },
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

    const catSlugs = Array.from(new Set(TEMPLATES.map((t) => t.category_slug)));
    const catRes = await client.query(
      `SELECT category_id, category_slug FROM categories WHERE category_slug = ANY($1::text[])`,
      [catSlugs],
    );
    const catMap = new Map(catRes.rows.map((c) => [c.category_slug, c.category_id]));

    const ingSlugs = Array.from(new Set(TEMPLATES.flatMap((t) => t.ings.map((i) => i.slug))));
    const ingRes = await client.query(
      `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
      [ingSlugs],
    );
    const ingMap = new Map(ingRes.rows.map((r) => [r.ingredient_slug, r.ingredient_id]));

    if (!apply) {
      console.log(`[DRY-RUN] ${TEMPLATES.length} ürün`);
      return;
    }

    await client.query('BEGIN');
    let inserted = 0;
    const newIds = [];
    for (const t of TEMPLATES) {
      const brand = brandMap.get(t.brand);
      const slug = turkishSlug(`${brand.brand_name}-${t.name}`);
      const exists = await client.query(`SELECT product_id FROM products WHERE product_slug = $1`, [slug]);
      if (exists.rows.length) continue;
      const catId = catMap.get(t.category_slug) || 1;
      const productRes = await client.query(
        `INSERT INTO products (product_name, product_slug, brand_id, category_id, domain_type, short_description, target_area, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'cosmetic', $5, $6, 'published', NOW(), NOW()) RETURNING product_id`,
        [t.name, slug, brand.brand_id, catId, t.short_description, t.target_area],
      );
      const productId = productRes.rows[0].product_id;
      newIds.push(productId);
      let order = 0;
      for (const ing of t.ings) {
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

    if (newIds.length) {
      await client.query(
        `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, calculated_at)
         SELECT pi.product_id, inm.need_id, LEAST(100, ROUND(AVG(inm.relevance_score)::numeric, 2)),
                CASE WHEN COUNT(*) >= 3 THEN 'high' WHEN COUNT(*) >= 1 THEN 'medium' ELSE 'low' END,
                NOW()
         FROM product_ingredients pi JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
         WHERE pi.product_id = ANY($1::int[]) AND inm.effect_type IN ('direct_support', 'complementary')
         GROUP BY pi.product_id, inm.need_id HAVING AVG(inm.relevance_score) >= 30`,
        [newIds],
      );
      await client.query(
        `UPDATE products p SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
         FROM (SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
               FROM product_need_scores ns JOIN needs n ON n.need_id = ns.need_id
               WHERE ns.product_id = ANY($1::int[]) ORDER BY ns.product_id, ns.compatibility_score DESC) sub
         WHERE p.product_id = sub.product_id`,
        [newIds],
      );
      await client.query(
        `INSERT INTO product_scores (product_id, algorithm_version, overall_score, grade, breakdown, explanation, flags, computed_at)
         SELECT p.product_id, 'cosmetic-v1', 75, 'B',
           '{"safety": 80, "efficacy": 70, "transparency": 75, "evidence": 70, "value": 75}'::jsonb,
           '[]'::jsonb,
           '{"allergens": [], "fragrances": [], "harmful": [], "cmr": [], "endocrine": [], "eu_banned": []}'::jsonb,
           NOW()
         FROM products p WHERE p.product_id = ANY($1::int[]) ON CONFLICT DO NOTHING`,
        [newIds],
      );
    }

    await client.query('COMMIT');
    console.log(`OK: ${inserted} insert`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('FAILED:', err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
