import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(`
  SELECT i.ingredient_slug, i.common_name, LENGTH(i.detailed_description) AS len,
         (SELECT COUNT(DISTINCT pi.product_id) FROM product_ingredients pi
          JOIN products p ON p.product_id = pi.product_id
          WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active')) AS used
  FROM ingredients i
  WHERE i.detailed_description IS NOT NULL
    AND LENGTH(i.detailed_description) BETWEEN 300 AND 1499
  ORDER BY used DESC
`);

console.log('## Partial INCI detail (300-1499 char)');
for (const row of r.rows) {
  console.log(`  ${String(row.used).padStart(4)} | ${String(row.len).padStart(4)} char | ${row.ingredient_slug.padEnd(40)} | ${row.common_name || '-'}`);
}

await c.end();
