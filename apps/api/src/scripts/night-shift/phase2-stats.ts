import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../../..');
dotenv.config({ path: path.join(ROOT, '.env') });

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  const total = await c.query(`
    SELECT COUNT(*) FROM products WHERE domain_type='supplement'
  `);
  const byStatus = await c.query(`
    SELECT status, COUNT(*) cnt FROM products WHERE domain_type='supplement' GROUP BY status
  `);
  const byBrand = await c.query(`
    SELECT b.brand_slug, p.status, COUNT(*) cnt FROM products p
    JOIN brands b ON b.brand_id=p.brand_id
    WHERE p.domain_type='supplement'
    GROUP BY b.brand_slug, p.status ORDER BY b.brand_slug, p.status
  `);
  const avgScore = await c.query(`
    SELECT ROUND(AVG(ps.overall_score)::numeric, 1) AS avg_score
    FROM product_scores ps JOIN products p ON p.product_id=ps.product_id
    WHERE p.domain_type='supplement'
  `);
  const newToday = await c.query(`
    SELECT COUNT(*) FROM products p JOIN brands b ON b.brand_id=p.brand_id
    WHERE p.domain_type='supplement' AND b.brand_slug='orzax' AND p.created_at >= '2026-04-24 00:00'
  `);
  const newAvgScore = await c.query(`
    SELECT ROUND(AVG(ps.overall_score)::numeric, 1) avg_score,
           MIN(ps.overall_score) min_score, MAX(ps.overall_score) max_score
    FROM products p
    JOIN brands b ON b.brand_id=p.brand_id
    JOIN product_scores ps ON ps.product_id=p.product_id
    WHERE p.domain_type='supplement' AND b.brand_slug='orzax' AND p.created_at >= '2026-04-24 00:00'
  `);
  const scoreDist = await c.query(`
    SELECT ps.grade, COUNT(*) cnt
    FROM products p
    JOIN brands b ON b.brand_id=p.brand_id
    JOIN product_scores ps ON ps.product_id=p.product_id
    WHERE p.domain_type='supplement' AND b.brand_slug='orzax' AND p.created_at >= '2026-04-24 00:00'
    GROUP BY ps.grade ORDER BY ps.grade
  `);

  console.log('=== SUPPLEMENT INVENTORY ===');
  console.log(`Total supplement products: ${total.rows[0].count}`);
  console.log('By status:');
  byStatus.rows.forEach((r: any) => console.log(`  ${r.status}: ${r.cnt}`));
  console.log(`\nAverage score (all supplements): ${avgScore.rows[0].avg_score}`);

  console.log('\n=== PHASE 2 (today) ===');
  console.log(`New products added today: ${newToday.rows[0].count}`);
  console.log(`  Score avg: ${newAvgScore.rows[0].avg_score}, min: ${newAvgScore.rows[0].min_score}, max: ${newAvgScore.rows[0].max_score}`);
  console.log('  Grade distribution:');
  scoreDist.rows.forEach((r: any) => console.log(`    ${r.grade}: ${r.cnt}`));

  console.log('\n=== BRAND BREAKDOWN ===');
  byBrand.rows.forEach((r: any) => console.log(`  ${r.brand_slug.padEnd(20)} ${r.status.padEnd(10)} ${r.cnt}`));

  await c.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
