/**
 * Faz 6.5 — Faz 6 ürünleri için product_need_scores hesapla.
 * supplement_ingredients → ingredient_need_mappings → product_need_scores
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Faz 6 ürünleri ki supplement_ingredients dolu, need_scores boş
const targets = await c.query(`
  SELECT DISTINCT p.product_id
  FROM products p
  WHERE p.domain_type='supplement' AND p.status='published'
    AND EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id=p.product_id)
    AND NOT EXISTS (SELECT 1 FROM product_need_scores pns WHERE pns.product_id=p.product_id)
`);
console.log(`Need-scores boş Faz 6 ürün: ${targets.rowCount}`);
const ids = targets.rows.map(r => r.product_id);
if (ids.length === 0) { console.log('İşlenecek ürün yok'); await c.end(); process.exit(0); }

await c.query('BEGIN');
try {
  // INSERT product_need_scores
  // supplement_ingredients'tan ingredient_id alınıp ingredient_need_mappings ile join
  // n.domain_type IN ('supplement','both')
  const ins = await c.query(
    `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary, calculated_at)
     SELECT
       si.product_id,
       inm.need_id,
       ROUND(AVG(inm.relevance_score * CASE inm.effect_type
         WHEN 'direct_support'   THEN 1.00
         WHEN 'indirect_support' THEN 0.75
         WHEN 'complementary'    THEN 0.55
         WHEN 'caution_related'  THEN 0.25
         ELSE 0.50
       END))::numeric(5,2),
       CASE WHEN COUNT(*) >= 4 THEN 'high' WHEN COUNT(*) >= 2 THEN 'medium' ELSE 'low' END,
       COUNT(*) || ' bileşen bu ihtiyaca katkı sağlıyor',
       NOW()
     FROM supplement_ingredients si
     JOIN ingredient_need_mappings inm ON inm.ingredient_id = si.ingredient_id
     JOIN needs n ON n.need_id = inm.need_id
     WHERE si.product_id = ANY($1::int[])
       AND n.domain_type IN ('supplement','both')
     GROUP BY si.product_id, inm.need_id
     HAVING AVG(inm.relevance_score) >= 25
     RETURNING product_id, need_id, compatibility_score`,
    [ids]
  );
  console.log(`Insert edilen product_need_score satırı: ${ins.rowCount}`);

  // top_need_name + top_need_score güncelle
  await c.query(
    `UPDATE products p SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
     FROM (SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
           FROM product_need_scores ns JOIN needs n ON n.need_id = ns.need_id
           WHERE ns.product_id = ANY($1::int[])
           ORDER BY ns.product_id, ns.compatibility_score DESC) sub
     WHERE p.product_id = sub.product_id`,
    [ids]
  );

  await c.query('COMMIT');

  // Final
  const after = await c.query(
    `SELECT p.product_id, p.product_slug, p.top_need_name, p.top_need_score,
            (SELECT COUNT(*) FROM product_need_scores pns WHERE pns.product_id = p.product_id) AS cnt
     FROM products p WHERE p.product_id = ANY($1::int[]) ORDER BY p.product_id`,
    [ids]
  );
  let withScores = 0;
  for (const r of after.rows) {
    console.log(`  ${r.product_id} | ${r.product_slug.slice(0,40).padEnd(40)} | ${r.cnt} need-score | top: ${r.top_need_name || 'YOK'} ${r.top_need_score || ''}`);
    if (r.cnt > 0) withScores++;
  }
  console.log(`\nFinal: ${withScores}/${after.rowCount} ürün need-scores aldı`);
} catch (e) {
  await c.query('ROLLBACK');
  console.error('FAIL:', e.message);
}

await c.end();
