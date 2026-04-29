import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log('## En çok kullanılan INCI bileşenleri (detailed_description henüz yazılmamış)');
console.log('Top 60 — kullanım sıklığı (product_ingredients ürün sayısı)\n');

const r = await c.query(`
  SELECT
    i.ingredient_id,
    i.ingredient_slug,
    i.inci_name,
    i.common_name,
    i.evidence_grade,
    COUNT(DISTINCT pi.product_id) AS used_in_products
  FROM ingredients i
  JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id
  JOIN products p ON p.product_id = pi.product_id
  WHERE (i.detailed_description IS NULL OR i.detailed_description = '')
    AND p.status IN ('published','active')
  GROUP BY i.ingredient_id, i.ingredient_slug, i.inci_name, i.common_name, i.evidence_grade
  ORDER BY used_in_products DESC
  LIMIT 60
`);

for (const row of r.rows) {
  const cn = row.common_name ? ` · ${row.common_name}` : '';
  const ev = row.evidence_grade || '-';
  console.log(`  ${String(row.used_in_products).padStart(4)} | [${ev}] ${row.ingredient_slug.padEnd(35)} | ${row.inci_name}${cn}`);
}

await c.end();
