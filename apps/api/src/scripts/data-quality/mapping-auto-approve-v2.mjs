/**
 * Mapping proposals threshold 50 ile auto-approve.
 * Onceki tur 65 ile 451 onayladi. Bu tur 50-64 arasi 193 daha ekler.
 * Onaylanan her mapping -> product_need_scores yeniden hesap.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const THRESHOLD = parseInt(process.argv.find(a => a.startsWith('--threshold='))?.split('=')[1] || '50');

const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

// 1. Approve pending proposals >= threshold
const { rows: approved } = await client.query(`
  UPDATE ingredient_need_mapping_proposals
  SET status = 'approved', reviewed_at = NOW()
  WHERE status = 'pending' AND relevance_score >= $1
  RETURNING ingredient_id, need_id, relevance_score, effect_type
`, [THRESHOLD]);

console.log(`Approved ${approved.length} proposals (>= score ${THRESHOLD})\n`);

// 2. Insert approved into ingredient_need_mappings (if not already there)
let inserted = 0, skipped = 0;
for (const row of approved) {
  try {
    await client.query(`
      INSERT INTO ingredient_need_mappings
        (ingredient_id, need_id, relevance_score, effect_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (ingredient_id, need_id) DO UPDATE
        SET relevance_score = GREATEST(ingredient_need_mappings.relevance_score, EXCLUDED.relevance_score),
            updated_at = NOW()
    `, [row.ingredient_id, row.need_id, row.relevance_score, row.effect_type || 'positive']);
    inserted++;
  } catch (_) { skipped++; }
}
console.log(`Mappings: ${inserted} inserted/updated, ${skipped} skip\n`);

// 3. Recompute product_need_scores for affected products
const affectedIngredients = [...new Set(approved.map(r => r.ingredient_id))];
console.log(`Recomputing need scores for products using ${affectedIngredients.length} newly mapped ingredients...`);

let scores_added = 0;
for (const iid of affectedIngredients) {
  const { rows: products } = await client.query(`
    SELECT DISTINCT pi.product_id
    FROM product_ingredients pi
    JOIN products p ON p.product_id = pi.product_id
    WHERE pi.ingredient_id = $1
      AND p.status IN ('published', 'active', 'draft')
  `, [iid]);

  for (const { product_id } of products) {
    // Compute weighted need score from all mappings
    const { rows: needScores } = await client.query(`
      SELECT
        inm.need_id,
        SUM(inm.relevance_score * CASE WHEN inm.effect_type = 'positive' THEN 1 ELSE -0.5 END) as raw_score,
        COUNT(*) as ingredient_count
      FROM product_ingredients pi
      JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
      WHERE pi.product_id = $1
      GROUP BY inm.need_id
      HAVING SUM(inm.relevance_score) > 0
    `, [product_id]);

    for (const ns of needScores) {
      const normalizedScore = Math.min(100, Math.max(0, Math.round(ns.raw_score)));
      try {
        await client.query(`
          INSERT INTO product_need_scores (product_id, need_id, score, ingredient_count, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (product_id, need_id) DO UPDATE
            SET score = EXCLUDED.score, ingredient_count = EXCLUDED.ingredient_count, updated_at = NOW()
        `, [product_id, ns.need_id, normalizedScore, ns.ingredient_count]);
        scores_added++;
      } catch (_) {}
    }
  }
}

console.log(`\n=== Done: ${approved.length} proposals approved, ${inserted} mappings active, ${scores_added} need scores updated ===`);
await client.end();
