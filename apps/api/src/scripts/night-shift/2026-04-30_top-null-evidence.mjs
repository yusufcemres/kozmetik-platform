import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(`
  SELECT i.ingredient_slug, i.inci_name, i.common_name,
         COUNT(DISTINCT pi.product_id) AS used
  FROM ingredients i
  JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id
  JOIN products p ON p.product_id = pi.product_id
  WHERE (i.evidence_grade IS NULL OR i.evidence_grade = '')
    AND p.status IN ('published','active')
  GROUP BY i.ingredient_id, i.ingredient_slug, i.inci_name, i.common_name
  ORDER BY used DESC
  LIMIT 60
`);

for (const row of r.rows) {
  console.log(`  ${String(row.used).padStart(4)} | ${row.ingredient_slug.padEnd(40)} | ${row.common_name || row.inci_name}`);
}
await c.end();
