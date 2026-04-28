import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../../..');
dotenv.config({ path: path.join(ROOT, '.env') });

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  // All orzax products + score + status
  const res = await c.query(`
    SELECT p.product_id, p.product_name, p.product_slug, p.status, p.created_at,
           ps.overall_score, ps.grade
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN product_scores ps ON ps.product_id = p.product_id
    WHERE b.brand_slug='orzax'
    ORDER BY p.created_at DESC
    LIMIT 50
  `);
  console.log(`Latest ${res.rowCount} orzax products:`);
  for (const r of res.rows) {
    console.log(`  [${r.product_id}] ${r.status.padEnd(10)} score=${r.overall_score ?? 'null'} ${r.grade ?? '-'} | ${r.product_name}`);
  }

  const counts = await c.query(`
    SELECT p.status, COUNT(*) cnt
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    WHERE b.brand_slug='orzax'
    GROUP BY p.status
  `);
  console.log(`\nOrzax by status:`);
  counts.rows.forEach((r: any) => console.log(`  ${r.status}: ${r.cnt}`));

  await c.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
