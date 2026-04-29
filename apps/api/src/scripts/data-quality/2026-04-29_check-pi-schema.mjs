import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='product_ingredients' ORDER BY ordinal_position`);
console.log('product_ingredients schema:');
for (const x of r.rows) console.log(`  ${x.column_name.padEnd(30)} ${x.data_type}`);
// Sample row
const sample = await c.query(`SELECT * FROM product_ingredients WHERE product_id IN (SELECT product_id FROM products WHERE domain_type='supplement' LIMIT 1) LIMIT 3`);
console.log('\nSample rows:');
for (const r of sample.rows) console.log(JSON.stringify(r, null, 2));
await c.end();
