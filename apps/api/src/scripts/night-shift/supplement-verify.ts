/**
 * Post-insert verification — detects partially-inserted supplement products.
 *
 * Checks every supplement created after --since and reports:
 *   - Missing primary_image_url
 *   - 0 ingredients
 *   - Missing score
 *   - Score < threshold
 *
 * Flags incomplete products with is_active=FALSE so they don't show on site.
 *
 * Usage:
 *   ./run-prod.sh src/scripts/night-shift/supplement-verify.ts --since="2026-04-23 18:00" [--fix-inactive]
 */
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../../..');
const REPORT_DIR = path.join(ROOT, 'night-shift/logs/supplement-sprint');

interface Issue {
  product_id: string;
  product_name: string;
  brand: string;
  issue: string;
  score: number | null;
}

async function main() {
  const args = process.argv.slice(2);
  const sinceArg = args.find((a) => a.startsWith('--since='));
  const since = sinceArg ? sinceArg.split('=').slice(1).join('=') : '2026-04-23 00:00';
  const fixInactive = args.includes('--fix-inactive');
  const minScore = parseInt(
    args.find((a) => a.startsWith('--min-score='))?.split('=')[1] || '50',
    10,
  );

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log(`[verify] Checking supplements inserted after ${since}`);

  // Inserted supplements
  const products = await client.query(
    `SELECT p.product_id, p.product_name, p.status,
            b.brand_name, b.brand_slug,
            ps.overall_score AS score,
            (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id=p.product_id)::int AS ing_count,
            (SELECT COUNT(*) FROM product_images pim WHERE pim.product_id=p.product_id)::int AS img_count
     FROM products p
     JOIN brands b ON b.brand_id=p.brand_id
     LEFT JOIN product_scores ps ON ps.product_id=p.product_id
     WHERE p.domain_type='supplement' AND p.created_at >= $1
     ORDER BY p.created_at`,
    [since],
  );

  console.log(`[verify] ${products.rowCount} supplements found`);

  const issues: Issue[] = [];
  const toDeactivate: string[] = [];

  for (const p of products.rows) {
    const problems: string[] = [];
    if (!p.img_count || p.img_count === 0) problems.push('no-image');
    if (p.ing_count === 0) problems.push('no-ingredients');
    if (p.score == null) problems.push('no-score');
    else if (Number(p.score) < minScore) problems.push(`score<${minScore}(${p.score})`);

    if (problems.length > 0) {
      issues.push({
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.brand_name,
        issue: problems.join(','),
        score: p.score ? Number(p.score) : null,
      });
      if (p.status === 'published' && (problems.includes('no-image') || problems.includes('no-ingredients'))) {
        toDeactivate.push(p.product_id);
      }
    }
  }

  console.log(`[verify] ${issues.length} products with issues`);
  issues.forEach((i) =>
    console.log(`  ${i.brand}: ${i.product_name} — ${i.issue} (score ${i.score ?? 'null'})`),
  );

  if (fixInactive && toDeactivate.length > 0) {
    const result = await client.query(
      `UPDATE products SET status='draft', updated_at=NOW() WHERE product_id = ANY($1::int[])`,
      [toDeactivate.map((id) => parseInt(id, 10))],
    );
    console.log(`[verify] Reverted ${result.rowCount} published-but-incomplete products to draft`);
  } else if (toDeactivate.length > 0) {
    console.log(`[verify] ${toDeactivate.length} would be reverted to draft (pass --fix-inactive to apply)`);
  }

  // Category breakdown
  const byBrand = await client.query(
    `SELECT b.brand_slug, COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE p.status='published')::int AS published,
            AVG(ps.overall_score)::numeric(5,1) AS avg_score
     FROM products p JOIN brands b ON b.brand_id=p.brand_id
     LEFT JOIN product_scores ps ON ps.product_id=p.product_id
     WHERE p.domain_type='supplement' AND p.created_at >= $1
     GROUP BY b.brand_slug
     ORDER BY total DESC`,
    [since],
  );

  const summary = {
    since,
    total_inserted: products.rowCount,
    issues: issues.length,
    deactivated: fixInactive ? toDeactivate.length : 0,
    by_brand: byBrand.rows,
    issue_list: issues,
    min_score_threshold: minScore,
    generated_at: new Date().toISOString(),
  };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORT_DIR, 'verify-report.json'), JSON.stringify(summary, null, 2));
  console.log(`[verify] Report saved: ${path.join(REPORT_DIR, 'verify-report.json')}`);

  await client.end();
}
main().catch((e) => {
  console.error('[verify] FATAL', e);
  process.exit(1);
});
