import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
// Faz 6 ürünleri ki supplement_ingredients var, product_need_scores var mı?
const r = await c.query(`
  SELECT p.product_id, p.product_slug,
    (SELECT COUNT(*) FROM supplement_ingredients si WHERE si.product_id=p.product_id) AS sup_ing,
    (SELECT overall_score FROM product_scores ps WHERE ps.product_id=p.product_id LIMIT 1) AS score,
    (SELECT COUNT(*) FROM product_need_scores pns WHERE pns.product_id=p.product_id) AS need_count
  FROM products p
  WHERE p.domain_type='supplement' AND p.status='published'
    AND EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id=p.product_id)
  ORDER BY p.product_id DESC LIMIT 15`);
for (const x of r.rows) console.log(`  ${x.product_id} | ${x.product_slug.slice(0,40).padEnd(40)} | sup_ing:${x.sup_ing} score:${x.score} need:${x.need_count}`);
await c.end();
