import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(`SELECT product_id, product_slug, product_name, status FROM products WHERE product_slug ILIKE '%d3%' AND product_slug ILIKE '%2000%' OR product_name ILIKE '%D3%2000%'`);
console.log(`D3 2000 IU eşleşmesi: ${r.rowCount}`);
for (const x of r.rows) console.log(`  ${x.product_id} | ${x.status} | ${x.product_slug} | ${x.product_name}`);
// Tüm "Orzax D3" ürünleri
const r2 = await c.query(`SELECT product_id, product_slug, product_name, status FROM products WHERE (product_slug ILIKE '%orzax%' OR product_slug ILIKE '%ocean%') AND (product_slug ILIKE '%d3%' OR product_name ILIKE '%D3%') ORDER BY product_slug`);
console.log(`\nOrzax/Ocean D3 ürünleri (${r2.rowCount}):`);
for (const x of r2.rows) console.log(`  ${x.product_id} | ${x.status} | ${x.product_slug} | ${x.product_name.slice(0,55)}`);
await c.end();
