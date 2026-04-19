/**
 * Seed `is_highlighted_in_claims` for product_ingredients.
 *
 * Context: findSimilar returns shared_ingredients=[] for most products because
 * the boolean flag is rarely populated. Heuristic: for each product that has
 * NO highlighted ingredients yet, mark the top 3 by inci_order_rank (ASC =
 * appear first on the INCI label = dominant actives).
 *
 * Idempotent: only updates products where zero ingredients are currently
 * highlighted — products that already have manual curation are untouched.
 *
 * Run:  node seed-highlight-key-ingredients.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const candidates = await client.query(`
      SELECT p.product_id
      FROM products p
      WHERE p.status IN ('active','published')
        AND NOT EXISTS (
          SELECT 1 FROM product_ingredients pi
          WHERE pi.product_id = p.product_id AND pi.is_highlighted_in_claims = true
        )
        AND EXISTS (
          SELECT 1 FROM product_ingredients pi2
          WHERE pi2.product_id = p.product_id
        )
    `);
    const ids = candidates.rows.map((r) => r.product_id);
    console.log(`Candidate products (no highlights yet): ${ids.length}`);

    if (DRY) {
      console.log(`[DRY] Would mark top-3 ingredients as highlighted for ${ids.length} products.`);
      return;
    }

    // Single UPDATE using a window function — applies to all candidates at once.
    const res = await client.query(`
      WITH ranked AS (
        SELECT pi.product_ingredient_id,
               ROW_NUMBER() OVER (PARTITION BY pi.product_id ORDER BY pi.inci_order_rank ASC, pi.product_ingredient_id ASC) AS rn
        FROM product_ingredients pi
        WHERE pi.product_id = ANY($1::int[])
      )
      UPDATE product_ingredients pi
         SET is_highlighted_in_claims = true,
             updated_at = now()
        FROM ranked r
       WHERE pi.product_ingredient_id = r.product_ingredient_id
         AND r.rn <= 3
    `, [ids]);
    console.log(`Updated rows (is_highlighted_in_claims=true): ${res.rowCount}`);

    const verify = await client.query(`
      SELECT COUNT(*) FILTER (WHERE is_highlighted_in_claims = true) AS highlighted,
             COUNT(*) AS total
        FROM product_ingredients
    `);
    console.log(`\nDB state after run:`);
    console.log(`  highlighted / total = ${verify.rows[0].highlighted} / ${verify.rows[0].total}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
