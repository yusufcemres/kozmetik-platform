/**
 * ROLLBACK: 20 supplement pilot were enriched with category-template INCI data
 * and set to status='published' before realizing this is fabrication.
 * This script reverts them to status='draft' and clears the templated data so
 * they're not visible on the public site.
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ROLLBACK_IDS = [2680, 2667, 2668, 2675, 2671, 2684, 2682, 2678, 2676, 2679, 2683, 2677, 2669, 2670, 2672, 2685, 2681, 2686, 2674, 2673];

async function main() {
  const apply = process.argv.includes('--apply');
  const url = process.env.DATABASE_URL;
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  if (!apply) {
    const r = await client.query(`SELECT product_id, product_name, status FROM products WHERE product_id = ANY($1::int[])`, [ROLLBACK_IDS]);
    console.log(`Will rollback ${r.rows.length} products to status='draft' and clear templated INCI/labels:`);
    for (const row of r.rows) console.log(`  [${row.product_id}] (now=${row.status}) ${row.product_name}`);
    console.log('\n--apply ekleyerek calistir.');
    await client.end();
    return;
  }

  await client.query('BEGIN');
  try {
    await client.query(`DELETE FROM product_need_scores WHERE product_id = ANY($1::int[])`, [ROLLBACK_IDS]);
    await client.query(`DELETE FROM product_ingredients WHERE product_id = ANY($1::int[])`, [ROLLBACK_IDS]);
    await client.query(`DELETE FROM product_labels WHERE product_id = ANY($1::int[])`, [ROLLBACK_IDS]);
    await client.query(`DELETE FROM product_images WHERE product_id = ANY($1::int[])`, [ROLLBACK_IDS]);
    await client.query(
      `UPDATE products SET status='draft', short_description=NULL, net_content_value=NULL, net_content_unit=NULL, product_type_label=NULL, top_need_name=NULL, top_need_score=NULL, updated_at=NOW() WHERE product_id = ANY($1::int[])`,
      [ROLLBACK_IDS],
    );
    await client.query('COMMIT');
    console.log(`OK: rolled back ${ROLLBACK_IDS.length} products to status='draft', cleared templated data`);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('FAIL:', e.message);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
