import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Faz 6'da insert edilen ürünler: Sekate alt_text'li image VAR + INCI list YOK
const r = await c.query(`
  UPDATE products
  SET status = 'draft', updated_at = NOW()
  WHERE domain_type='supplement'
    AND status='published'
    AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id = products.product_id)
  RETURNING product_id, product_slug
`);
console.log(`Draft'a çekilen ürün: ${r.rowCount}`);
for (const x of r.rows.slice(0, 10)) console.log(`  ${x.product_id} | ${x.product_slug}`);

const final = await c.query(`SELECT COUNT(*) FILTER (WHERE status='published') AS pub, COUNT(*) AS total FROM products WHERE domain_type='supplement'`);
console.log(`\nTotal supplement: published ${final.rows[0].pub}/${final.rows[0].total}`);
await c.end();
