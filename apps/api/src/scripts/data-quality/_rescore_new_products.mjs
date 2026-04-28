/**
 * Yeni eklenen 27 ürünün need_scores'larını mevcut cosmetic scoring algoritması ile yeniden hesaplar.
 *
 * Kullanım: node _rescore_new_products.mjs --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const NEW_IDS = [2691,2692,2693,2694,2695,2696,2697,2698,2699,2700,2701,2702,2703,2704,2705,2706,2707,2708,2709,2710,2711,2712,2713,2714,2715,2716,2717];

async function main() {
  const apply = process.argv.includes('--apply');
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  if (!apply) {
    const before = await c.query(
      `SELECT product_id, COUNT(*) FROM product_need_scores WHERE product_id = ANY($1::int[]) GROUP BY product_id`,
      [NEW_IDS],
    );
    console.log(`BEFORE — products with need_scores: ${before.rows.length}/${NEW_IDS.length}`);
    console.log('Re-run with --apply to rescore');
    await c.end();
    return;
  }

  await c.query('BEGIN');
  try {
    // 1. Mevcut yanlış skorları sil
    await c.query(`DELETE FROM product_need_scores WHERE product_id = ANY($1::int[])`, [NEW_IDS]);

    // 2. Doğru algoritma ile recompute (cosmetic_fill_missing_scores.sql ile aynı mantık)
    await c.query(
      `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary, calculated_at)
       SELECT
         pi.product_id,
         inm.need_id,
         ROUND(AVG(inm.relevance_score * CASE inm.effect_type
           WHEN 'direct_support'   THEN 1.00
           WHEN 'indirect_support' THEN 0.75
           WHEN 'complementary'    THEN 0.55
           WHEN 'caution_related'  THEN 0.25
           ELSE 0.50
         END))::numeric(5,2),
         CASE WHEN COUNT(*) >= 4 THEN 'high' WHEN COUNT(*) >= 2 THEN 'medium' ELSE 'low' END,
         COUNT(*) || ' bileşen bu ihtiyaca katkı sağlıyor',
         NOW()
       FROM product_ingredients pi
       JOIN products p ON p.product_id = pi.product_id
       JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
       JOIN needs n ON n.need_id = inm.need_id
       WHERE p.product_id = ANY($1::int[])
         AND n.domain_type IN ('cosmetic','both')
       GROUP BY pi.product_id, inm.need_id
       HAVING AVG(inm.relevance_score) >= 25`,
      [NEW_IDS],
    );

    // 3. top_need refresh
    await c.query(
      `UPDATE products p SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
       FROM (SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
             FROM product_need_scores ns JOIN needs n ON n.need_id = ns.need_id
             WHERE ns.product_id = ANY($1::int[])
             ORDER BY ns.product_id, ns.compatibility_score DESC) sub
       WHERE p.product_id = sub.product_id`,
      [NEW_IDS],
    );

    await c.query('COMMIT');

    // Report
    const after = await c.query(
      `SELECT p.product_id, p.product_name, p.top_need_name, p.top_need_score,
              (SELECT COUNT(*) FROM product_need_scores pns WHERE pns.product_id = p.product_id) as scores_count
       FROM products p WHERE p.product_id = ANY($1::int[]) ORDER BY p.product_id`,
      [NEW_IDS],
    );
    console.log('\nAFTER:');
    let withScores = 0;
    for (const row of after.rows) {
      console.log(`  [${row.product_id}] ${row.scores_count} scores | top: ${row.top_need_name || 'YOK'} ${row.top_need_score || ''} | ${row.product_name.slice(0, 50)}`);
      if (row.scores_count > 0) withScores++;
    }
    console.log(`\nTotal: ${withScores}/${after.rows.length} products have need_scores`);
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('FAIL:', e.message);
    process.exit(2);
  } finally {
    await c.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
