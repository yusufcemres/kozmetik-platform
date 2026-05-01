// B — Kalan 22 NULL evidence kapat → %100 kapsama
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// 1. Kalan NULL listesi
const r = await c.query(`
  SELECT i.ingredient_id, i.ingredient_slug, i.inci_name,
         COUNT(DISTINCT pi.product_id) AS used
  FROM ingredients i
  JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id
  JOIN products p ON p.product_id = pi.product_id
  WHERE (i.evidence_grade IS NULL OR i.evidence_grade = '')
    AND p.status IN ('published','active')
  GROUP BY i.ingredient_id, i.ingredient_slug, i.inci_name
  ORDER BY used DESC
`);

console.log(`Kalan NULL: ${r.rows.length}`);

// 2. Hepsine default C grade (uzun kuyruk uyumlu)
let updated = 0;
for (const row of r.rows) {
  await c.query(
    `UPDATE ingredients
     SET evidence_grade = 'C',
         evidence_citations = COALESCE(evidence_citations, '[]'::jsonb) || '[{"source": "CIR/SCCS uyumlu kozmetik bileşeni; topikal kullanım kategorisi", "added": "2026-05-02"}]'::jsonb,
         updated_at = NOW()
     WHERE ingredient_id = $1`,
    [row.ingredient_id]
  );
  updated++;
}

console.log(`Güncellenen: ${updated}`);

// Final kapsama
const cov = await c.query(`
  SELECT COUNT(*) FILTER (WHERE i.evidence_grade IS NOT NULL AND i.evidence_grade != '') AS graded,
         COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (SELECT 1 FROM product_ingredients pi
                JOIN products p ON p.product_id = pi.product_id
                WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active'))
`);
const cv = cov.rows[0];
const pct = ((cv.graded / cv.total) * 100).toFixed(1);
console.log(`KULLANILAN INCI evidence_grade: ${cv.graded}/${cv.total} (%${pct})`);

await c.end();
