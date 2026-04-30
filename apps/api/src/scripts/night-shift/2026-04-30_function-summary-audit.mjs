import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Dolu olanlardan format örnek
const filled = await c.query(`
  SELECT ingredient_slug, common_name, LENGTH(function_summary) AS len, function_summary
  FROM ingredients
  WHERE function_summary IS NOT NULL AND function_summary != ''
  ORDER BY len ASC
  LIMIT 5
`);
console.log('## Dolu olanlardan örnek (kısa olanlar):');
for (const r of filled.rows) {
  console.log(`  ${r.ingredient_slug.padEnd(30)} (${r.len} char): ${r.function_summary}`);
}

// Kapsama
const cov = await c.query(`
  SELECT COUNT(*) FILTER (WHERE function_summary IS NOT NULL AND function_summary != '') AS filled,
         COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (SELECT 1 FROM product_ingredients pi
                JOIN products p ON p.product_id = pi.product_id
                WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active'))
`);
const cv = cov.rows[0];
const pct = ((cv.filled / cv.total) * 100).toFixed(1);
console.log(`\nKULLANILAN INCI function_summary kapsama: ${cv.filled}/${cv.total} (%${pct})`);

// Eksik olanlar — kullanım sıklığına göre top 100
const missing = await c.query(`
  SELECT i.ingredient_id, i.ingredient_slug, i.inci_name, i.common_name, i.evidence_grade,
         COUNT(DISTINCT pi.product_id) AS used
  FROM ingredients i
  JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id
  JOIN products p ON p.product_id = pi.product_id
  WHERE (i.function_summary IS NULL OR i.function_summary = '')
    AND p.status IN ('published','active')
  GROUP BY i.ingredient_id, i.ingredient_slug, i.inci_name, i.common_name, i.evidence_grade
  ORDER BY used DESC
  LIMIT 100
`);

console.log(`\n## function_summary eksik (top 100 kullanımlı):`);
for (const r of missing.rows.slice(0, 100)) {
  console.log(`  ${String(r.used).padStart(4)} | ${r.ingredient_slug.padEnd(40)} | ${r.common_name || r.inci_name}`);
}

await c.end();
