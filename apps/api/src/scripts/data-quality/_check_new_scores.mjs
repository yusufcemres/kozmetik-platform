import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const newIds = [2691,2692,2693,2694,2695,2696,2697,2698,2699,2700,2701,2702,2703,2704,2705,2706,2707,2708,2709,2710,2711,2712,2713,2714,2715,2716,2717];
const r = await c.query(`
  SELECT p.product_id, p.product_name, p.top_need_name, p.top_need_score,
    (SELECT COUNT(*) FROM product_need_scores pns WHERE pns.product_id = p.product_id) as need_scores,
    (SELECT COUNT(*) FROM product_scores ps WHERE ps.product_id = p.product_id) as overall_scores,
    (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id = p.product_id AND pi.ingredient_id IS NOT NULL) as matched_inci
  FROM products p WHERE p.product_id = ANY($1::int[])
  ORDER BY p.product_id
`, [newIds]);
console.log('product_id | matched_INCI | need_scores | overall_scores | top_need');
for (const row of r.rows) {
  console.log(`${row.product_id} | ${row.matched_inci} | ${row.need_scores} | ${row.overall_scores} | ${row.top_need_name || 'YOK'} ${row.top_need_score || ''} | ${row.product_name.slice(0,40)}`);
}
await c.end();
