import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
// Check schemas of related tables
const tables = ['products', 'supplement_dosages', 'nutrition_facts', 'product_dosages', 'product_supplement_facts'];
for (const t of tables) {
  try {
    const r = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name=$1`, [t]);
    if (r.rowCount === 0) continue;
    console.log(`\n## ${t}:`);
    for (const x of r.rows) console.log(`  ${x.column_name}`);
  } catch {}
}
// Sample populated supplement product (with INCI)
const s = await c.query(`SELECT product_id, product_name FROM products WHERE domain_type='supplement' AND product_id IN (SELECT product_id FROM product_ingredients GROUP BY product_id LIMIT 1)`);
if (s.rowCount > 0) {
  console.log('\nSample supp w/ ingredients:', s.rows[0]);
}
await c.end();
