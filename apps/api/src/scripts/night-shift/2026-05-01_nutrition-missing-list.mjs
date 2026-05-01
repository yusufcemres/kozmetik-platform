import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_slug
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id = p.product_id)
  ORDER BY b.brand_slug, p.product_name
`);

console.log(`Eksik: ${r.rows.length}\n`);
for (const row of r.rows) {
  console.log(`${row.product_id}|${row.brand_slug}|${row.product_slug}|${row.product_name}`);
}

await c.end();
