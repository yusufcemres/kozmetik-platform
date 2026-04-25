/**
 * ingredient_need_mappings için boşluk doldurma seed.
 *
 * Sorun: 100 yeni supplement seed sonrası 39'unda top_need_name NULL — bunların
 * kullandığı core ingredient'ların (vitamin-c, vitamin-d, vitamin-k2, b12,
 * magnesium-citrate, omega-3, glucosamine vb.) ingredient_need_mappings
 * tablosunda 'direct_support' veya 'complementary' kayıt yok ya da eksik.
 *
 * Bu script: bilimsel evidence'lı core mapping'leri ekler. Mevcut kayıtları
 * dokunmaz (idempotent — composite key (ingredient_id, need_id) ile UPSERT'siz,
 * sadece yoksa INSERT).
 *
 * Kullanım:
 *   node src/scripts/data-quality/seed-ingredient-need-mappings.mjs --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

// Mapping kuralları: ingredient_slug → [{ need_slug, relevance, effect, evidence }]
// relevance 0-100, evidence: 'A' (RCT/sistematik derleme), 'B' (vaka-kontrol), 'C' (uzman görüşü)
const MAPPINGS = {
  // === Vitaminler ===
  'vitamin-c': [
    { need: 'bagisiklik-destegi', relevance: 90, effect: 'direct_support', evidence: 'A' },
    { need: 'inflamasyon-azaltma', relevance: 60, effect: 'complementary', evidence: 'B' },
    { need: 'enerji-canlilik', relevance: 55, effect: 'complementary', evidence: 'B' },
  ],
  'cholecalciferol': [
    { need: 'bagisiklik-destegi', relevance: 85, effect: 'direct_support', evidence: 'A' },
    { need: 'kemik-eklem', relevance: 95, effect: 'direct_support', evidence: 'A' },
    { need: 'hormonal-denge', relevance: 60, effect: 'complementary', evidence: 'B' },
  ],
  'vitamin-d': [
    { need: 'bagisiklik-destegi', relevance: 85, effect: 'direct_support', evidence: 'A' },
    { need: 'kemik-eklem', relevance: 95, effect: 'direct_support', evidence: 'A' },
    { need: 'hormonal-denge', relevance: 60, effect: 'complementary', evidence: 'B' },
  ],
  'vitamin-e': [
    { need: 'kalp-damar-sagligi', relevance: 70, effect: 'complementary', evidence: 'B' },
    { need: 'inflamasyon-azaltma', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'vitamin-k2': [
    { need: 'kemik-eklem', relevance: 85, effect: 'direct_support', evidence: 'A' },
    { need: 'kalp-damar-sagligi', relevance: 70, effect: 'complementary', evidence: 'B' },
  ],
  'vitamin-b12': [
    { need: 'enerji-canlilik', relevance: 90, effect: 'direct_support', evidence: 'A' },
    { need: 'beyin-bilissel-fonksiyon', relevance: 75, effect: 'direct_support', evidence: 'B' },
  ],
  'vitamin-b6': [
    { need: 'uyku-stres-yonetimi', relevance: 75, effect: 'direct_support', evidence: 'B' },
    { need: 'enerji-canlilik', relevance: 65, effect: 'complementary', evidence: 'B' },
    { need: 'hormonal-denge', relevance: 60, effect: 'complementary', evidence: 'B' },
  ],
  'vitamin-b1': [
    { need: 'enerji-canlilik', relevance: 80, effect: 'direct_support', evidence: 'A' },
    { need: 'beyin-bilissel-fonksiyon', relevance: 60, effect: 'complementary', evidence: 'B' },
  ],
  'vitamin-b2': [
    { need: 'enerji-canlilik', relevance: 80, effect: 'direct_support', evidence: 'A' },
  ],
  'pantothenic-acid': [
    { need: 'enerji-canlilik', relevance: 75, effect: 'direct_support', evidence: 'A' },
  ],
  'niacin': [
    { need: 'kalp-damar-sagligi', relevance: 80, effect: 'direct_support', evidence: 'A' },
    { need: 'enerji-canlilik', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'folic-acid': [
    { need: 'enerji-canlilik', relevance: 70, effect: 'direct_support', evidence: 'B' },
    { need: 'hormonal-denge', relevance: 60, effect: 'complementary', evidence: 'B' },
  ],
  'biotin': [
    { need: 'sac-tirnak', relevance: 90, effect: 'direct_support', evidence: 'A' },
  ],

  // === Mineraller ===
  'zinc': [
    { need: 'bagisiklik-destegi', relevance: 85, effect: 'direct_support', evidence: 'A' },
    { need: 'sac-tirnak', relevance: 70, effect: 'complementary', evidence: 'B' },
    { need: 'hormonal-denge', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'iron-bisglycinate': [
    { need: 'enerji-canlilik', relevance: 95, effect: 'direct_support', evidence: 'A' },
  ],
  'calcium-citrate': [
    { need: 'kemik-eklem', relevance: 90, effect: 'direct_support', evidence: 'A' },
  ],
  'iodine': [
    { need: 'hormonal-denge', relevance: 90, effect: 'direct_support', evidence: 'A' },
    { need: 'enerji-canlilik', relevance: 55, effect: 'complementary', evidence: 'B' },
  ],
  'manganese': [
    { need: 'kemik-eklem', relevance: 70, effect: 'direct_support', evidence: 'B' },
  ],
  'molybdenum': [
    { need: 'enerji-canlilik', relevance: 50, effect: 'complementary', evidence: 'C' },
  ],
  'selenium': [
    { need: 'bagisiklik-destegi', relevance: 75, effect: 'direct_support', evidence: 'A' },
    { need: 'hormonal-denge', relevance: 75, effect: 'direct_support', evidence: 'A' },
  ],
  'magnesium-citrate': [
    { need: 'uyku-stres-yonetimi', relevance: 80, effect: 'direct_support', evidence: 'A' },
    { need: 'kas-performans', relevance: 75, effect: 'direct_support', evidence: 'A' },
    { need: 'kalp-damar-sagligi', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'magnesium-bisglycinate': [
    { need: 'uyku-stres-yonetimi', relevance: 85, effect: 'direct_support', evidence: 'A' },
    { need: 'kas-performans', relevance: 80, effect: 'direct_support', evidence: 'A' },
  ],
  'magnesium-threonate': [
    { need: 'beyin-bilissel-fonksiyon', relevance: 75, effect: 'direct_support', evidence: 'B' },
    { need: 'uyku-stres-yonetimi', relevance: 70, effect: 'complementary', evidence: 'B' },
  ],
  'magnesium-oxide': [
    { need: 'kas-performans', relevance: 50, effect: 'complementary', evidence: 'C' },
  ],

  // === Yağ asitleri & antioksidanlar ===
  'omega-3': [
    { need: 'kalp-damar-sagligi', relevance: 95, effect: 'direct_support', evidence: 'A' },
    { need: 'beyin-bilissel-fonksiyon', relevance: 80, effect: 'direct_support', evidence: 'A' },
    { need: 'inflamasyon-azaltma', relevance: 80, effect: 'direct_support', evidence: 'A' },
    { need: 'goz-sagligi', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'coenzyme-q10': [
    { need: 'kalp-damar-sagligi', relevance: 85, effect: 'direct_support', evidence: 'A' },
    { need: 'enerji-canlilik', relevance: 75, effect: 'direct_support', evidence: 'B' },
  ],
  'coq10': [
    { need: 'kalp-damar-sagligi', relevance: 85, effect: 'direct_support', evidence: 'A' },
    { need: 'enerji-canlilik', relevance: 75, effect: 'direct_support', evidence: 'B' },
  ],
  'resveratrol': [
    { need: 'kalp-damar-sagligi', relevance: 70, effect: 'direct_support', evidence: 'B' },
    { need: 'inflamasyon-azaltma', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'quercetin': [
    { need: 'bagisiklik-destegi', relevance: 70, effect: 'direct_support', evidence: 'B' },
    { need: 'inflamasyon-azaltma', relevance: 70, effect: 'direct_support', evidence: 'B' },
  ],

  // === Eklem & kemik ===
  'glucosamine': [
    { need: 'kemik-eklem', relevance: 85, effect: 'direct_support', evidence: 'A' },
  ],
  'chondroitin': [
    { need: 'kemik-eklem', relevance: 80, effect: 'direct_support', evidence: 'A' },
  ],
  'msm': [
    { need: 'kemik-eklem', relevance: 75, effect: 'direct_support', evidence: 'B' },
    { need: 'inflamasyon-azaltma', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'hydrolyzed-collagen': [
    { need: 'kemik-eklem', relevance: 75, effect: 'direct_support', evidence: 'B' },
    { need: 'sac-tirnak', relevance: 70, effect: 'complementary', evidence: 'B' },
  ],
  'collagen': [
    { need: 'kemik-eklem', relevance: 70, effect: 'direct_support', evidence: 'B' },
    { need: 'sac-tirnak', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'hyaluronic-acid': [
    { need: 'kemik-eklem', relevance: 65, effect: 'direct_support', evidence: 'B' },
  ],

  // === Beyin & stres ===
  'ginkgo-biloba': [
    { need: 'beyin-bilissel-fonksiyon', relevance: 80, effect: 'direct_support', evidence: 'A' },
  ],
  'panax-ginseng-extract': [
    { need: 'enerji-canlilik', relevance: 75, effect: 'direct_support', evidence: 'B' },
    { need: 'beyin-bilissel-fonksiyon', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'ashwagandha-extract': [
    { need: 'uyku-stres-yonetimi', relevance: 85, effect: 'direct_support', evidence: 'A' },
    { need: 'hormonal-denge', relevance: 70, effect: 'complementary', evidence: 'B' },
  ],
  'rhodiola': [
    { need: 'uyku-stres-yonetimi', relevance: 75, effect: 'direct_support', evidence: 'B' },
    { need: 'enerji-canlilik', relevance: 70, effect: 'complementary', evidence: 'B' },
  ],
  'melatonin': [
    { need: 'uyku-stres-yonetimi', relevance: 95, effect: 'direct_support', evidence: 'A' },
  ],

  // === Sindirim ===
  'probiotics': [
    { need: 'sindirim-sagligi', relevance: 90, effect: 'direct_support', evidence: 'A' },
    { need: 'bagisiklik-destegi', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],

  // === Karaciğer / Detoks ===
  'silymarin': [
    { need: 'inflamasyon-azaltma', relevance: 60, effect: 'complementary', evidence: 'B' },
  ],
  'milk-thistle-extract': [
    { need: 'inflamasyon-azaltma', relevance: 60, effect: 'complementary', evidence: 'B' },
  ],
  'curcumin': [
    { need: 'inflamasyon-azaltma', relevance: 85, effect: 'direct_support', evidence: 'A' },
  ],

  // === Bağışıklık & antioksidan bitkisel ===
  'propolis': [
    { need: 'bagisiklik-destegi', relevance: 75, effect: 'direct_support', evidence: 'B' },
  ],
  'royal-jelly': [
    { need: 'enerji-canlilik', relevance: 60, effect: 'complementary', evidence: 'C' },
  ],
  'beta-glucan': [
    { need: 'bagisiklik-destegi', relevance: 80, effect: 'direct_support', evidence: 'B' },
  ],
  'spirulina-platensis-extract': [
    { need: 'enerji-canlilik', relevance: 60, effect: 'complementary', evidence: 'B' },
    { need: 'bagisiklik-destegi', relevance: 55, effect: 'complementary', evidence: 'B' },
  ],
  'green-tea-extract': [
    { need: 'inflamasyon-azaltma', relevance: 60, effect: 'complementary', evidence: 'B' },
    { need: 'kalp-damar-sagligi', relevance: 55, effect: 'complementary', evidence: 'B' },
    { need: 'yag-kontrolu', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],

  // === Aminoasitler & performans ===
  'l-arginine': [
    { need: 'kalp-damar-sagligi', relevance: 75, effect: 'direct_support', evidence: 'B' },
    { need: 'kas-performans', relevance: 75, effect: 'direct_support', evidence: 'B' },
  ],
  'l-carnitine': [
    { need: 'kas-performans', relevance: 80, effect: 'direct_support', evidence: 'A' },
    { need: 'enerji-canlilik', relevance: 70, effect: 'complementary', evidence: 'B' },
    { need: 'kalp-damar-sagligi', relevance: 65, effect: 'complementary', evidence: 'B' },
  ],
  'whey-protein': [
    { need: 'kas-performans', relevance: 90, effect: 'direct_support', evidence: 'A' },
  ],

  // === Erkek sağlığı ===
  'saw-palmetto-extract': [
    { need: 'hormonal-denge', relevance: 70, effect: 'direct_support', evidence: 'B' },
    { need: 'sac-tirnak', relevance: 60, effect: 'complementary', evidence: 'B' },
  ],

  // === Göz ===
  'lutein': [
    { need: 'goz-sagligi', relevance: 90, effect: 'direct_support', evidence: 'A' },
  ],
  'zeaxanthin': [
    { need: 'goz-sagligi', relevance: 85, effect: 'direct_support', evidence: 'A' },
  ],
  'luteolin': [
    { need: 'inflamasyon-azaltma', relevance: 55, effect: 'complementary', evidence: 'C' },
  ],
};

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
    // Lookup ingredient_ids
    const ingSlugs = Object.keys(MAPPINGS);
    const ingRes = await client.query(
      `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
      [ingSlugs],
    );
    const ingMap = new Map(ingRes.rows.map((r) => [r.ingredient_slug, r.ingredient_id]));

    // Lookup need_ids
    const needSlugs = Array.from(new Set(Object.values(MAPPINGS).flatMap((arr) => arr.map((m) => m.need))));
    const needRes = await client.query(
      `SELECT need_id, need_slug FROM needs WHERE need_slug = ANY($1::text[])`,
      [needSlugs],
    );
    const needMap = new Map(needRes.rows.map((r) => [r.need_slug, r.need_id]));

    console.log(`Ingredients: ${ingMap.size}/${ingSlugs.length}, Needs: ${needMap.size}/${needSlugs.length}`);

    const plan = [];
    for (const [ingSlug, mappings] of Object.entries(MAPPINGS)) {
      const ingId = ingMap.get(ingSlug);
      if (!ingId) {
        console.warn(`  SKIP ingredient slug not found: ${ingSlug}`);
        continue;
      }
      for (const m of mappings) {
        const needId = needMap.get(m.need);
        if (!needId) {
          console.warn(`  SKIP need slug not found: ${m.need}`);
          continue;
        }
        plan.push({
          ingredient_id: ingId,
          ingredient_slug: ingSlug,
          need_id: needId,
          need_slug: m.need,
          relevance: m.relevance,
          effect: m.effect,
          evidence: m.evidence,
        });
      }
    }

    console.log(`Plan: ${plan.length} mappings`);

    if (!apply) {
      console.log('\n[DRY-RUN] First 5:');
      for (const p of plan.slice(0, 5)) {
        console.log(`  ${p.ingredient_slug} → ${p.need_slug} (${p.relevance}, ${p.effect}, ${p.evidence})`);
      }
      console.log('Re-run with --apply to write.');
      return;
    }

    await client.query('BEGIN');
    let inserted = 0;
    let skipped = 0;
    for (const p of plan) {
      // INSERT only if (ingredient_id, need_id) doesn't exist
      const exists = await client.query(
        `SELECT 1 FROM ingredient_need_mappings WHERE ingredient_id = $1 AND need_id = $2`,
        [p.ingredient_id, p.need_id],
      );
      if (exists.rows.length > 0) {
        skipped++;
        continue;
      }
      await client.query(
        `INSERT INTO ingredient_need_mappings (ingredient_id, need_id, relevance_score, effect_type, evidence_level, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [p.ingredient_id, p.need_id, p.relevance, p.effect, p.evidence],
      );
      inserted++;
    }
    await client.query('COMMIT');
    console.log(`OK: ${inserted} inserted, ${skipped} already existed`);

    // Now re-compute need_scores for products that have NULL top_need (last 24h supplements)
    console.log('\nRecomputing need_scores for new supplements with NULL top_need...');
    const targetRes = await client.query(
      `SELECT DISTINCT p.product_id
       FROM products p
       WHERE p.domain_type = 'supplement' AND p.created_at >= '2026-04-25T08:30:00Z'`,
    );
    const targetIds = targetRes.rows.map((r) => r.product_id);
    console.log(`Target products: ${targetIds.length}`);

    if (targetIds.length > 0) {
      // DELETE existing need_scores for these products (so we re-aggregate fresh)
      await client.query(
        `DELETE FROM product_need_scores WHERE product_id = ANY($1::int[])`,
        [targetIds],
      );

      // Re-aggregate using direct_support + complementary
      const inserted2 = await client.query(
        `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, calculated_at)
         SELECT
           pi.product_id,
           inm.need_id,
           LEAST(100, ROUND(AVG(inm.relevance_score)::numeric, 2)) AS compatibility_score,
           CASE WHEN COUNT(*) >= 3 THEN 'high' WHEN COUNT(*) >= 1 THEN 'medium' ELSE 'low' END AS confidence_level,
           NOW()
         FROM product_ingredients pi
         JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
         WHERE pi.product_id = ANY($1::int[])
           AND inm.effect_type IN ('direct_support', 'complementary')
         GROUP BY pi.product_id, inm.need_id
         HAVING AVG(inm.relevance_score) >= 30
         RETURNING product_id`,
        [targetIds],
      );
      console.log(`product_need_scores: ${inserted2.rowCount} rows`);

      // Refresh top_need_name + top_need_score
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
        [targetIds],
      );

      const after = await client.query(
        `SELECT COUNT(*) FILTER (WHERE top_need_name IS NULL) AS null_count,
                COUNT(*) FILTER (WHERE top_need_name IS NOT NULL) AS filled_count
         FROM products WHERE product_id = ANY($1::int[])`,
        [targetIds],
      );
      console.log(`After: ${after.rows[0].filled_count} filled, ${after.rows[0].null_count} still NULL`);
    }
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
