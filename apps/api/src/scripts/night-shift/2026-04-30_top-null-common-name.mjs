import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log('## NULL common_name INCI — kullanım sıklığına göre top 120\n');

const r = await c.query(`
  SELECT
    i.ingredient_id, i.ingredient_slug, i.inci_name, i.evidence_grade,
    COUNT(DISTINCT pi.product_id) AS used_in_products
  FROM ingredients i
  JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id
  JOIN products p ON p.product_id = pi.product_id
  WHERE (i.common_name IS NULL OR i.common_name = '')
    AND p.status IN ('published','active')
  GROUP BY i.ingredient_id, i.ingredient_slug, i.inci_name, i.evidence_grade
  ORDER BY used_in_products DESC
  LIMIT 120
`);

for (const row of r.rows) {
  const ev = row.evidence_grade || '-';
  console.log(`  ${String(row.used_in_products).padStart(4)} | ${row.ingredient_slug.padEnd(45)} | ${row.inci_name}`);
}

console.log(`\nToplam: ${r.rows.length}`);
await c.end();
