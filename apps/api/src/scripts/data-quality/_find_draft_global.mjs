import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const r = await client.query(`
  SELECT p.product_id, p.product_name, p.status, b.brand_slug, b.brand_name,
         (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id = p.product_id) as inci_count
  FROM products p JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.status = 'draft' OR p.status = 'archived'
  ORDER BY p.status, b.brand_slug, p.product_id
`);
console.log(`Draft/archived products: ${r.rows.length}\n`);
let prevBrand = null;
for (const row of r.rows) {
  if (row.brand_slug !== prevBrand) { console.log(`\n[${row.status}] ${row.brand_slug}`); prevBrand = row.brand_slug; }
  console.log(`  [${row.product_id}] ${row.product_name.slice(0,60)} | inci:${row.inci_count}`);
}
await client.end();
