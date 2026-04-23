/**
 * Quick progress check: score distribution + publish candidates.
 * Usage: ./run-prod.sh src/scripts/night-shift/supplement-progress.ts
 */
import { Client } from 'pg';

async function main() {
  const c = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const since = '2026-04-22 18:00';

  const byStatus = await c.query(
    `SELECT status, COUNT(*)::int FROM products WHERE domain_type='supplement' AND created_at >= $1 GROUP BY status`,
    [since],
  );
  const dist = await c.query(
    `SELECT FLOOR(ps.overall_score/10)*10 AS bucket, COUNT(*)::int
     FROM product_scores ps JOIN products p USING(product_id)
     WHERE p.domain_type='supplement' AND p.created_at >= $1
     GROUP BY 1 ORDER BY 1`,
    [since],
  );
  const stats = await c.query(
    `SELECT MIN(ps.overall_score)::numeric(5,1) AS min,
            AVG(ps.overall_score)::numeric(5,1) AS avg,
            MAX(ps.overall_score)::numeric(5,1) AS max,
            COUNT(*) FILTER (WHERE ps.overall_score >= 50)::int AS above50,
            COUNT(*) FILTER (WHERE ps.overall_score >= 40)::int AS above40
     FROM product_scores ps JOIN products p USING(product_id)
     WHERE p.domain_type='supplement' AND p.created_at >= $1`,
    [since],
  );
  console.log('status:', byStatus.rows);
  console.log('dist  :', dist.rows);
  console.log('stats :', stats.rows[0]);
  await c.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
