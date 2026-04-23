/**
 * Publishes every scored supplement draft whose overall_score >= threshold (default 50).
 * Standalone pg-only; no Nest bootstrap (avoids Redis hang on close).
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/supplement-publish-scored.ts [--since="2026-04-22 18:00"] [--threshold=50]
 */
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const since = args.find((a) => a.startsWith('--since='))?.split('=').slice(1).join('=') || '2026-04-22 18:00';
  const threshold = parseInt(args.find((a) => a.startsWith('--threshold='))?.split('=')[1] || '50', 10);

  const c = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const rows = await c.query<{ product_id: number; product_slug: string; overall_score: number; grade: string }>(
    `SELECT p.product_id, p.product_slug, ps.overall_score, ps.grade
     FROM products p JOIN product_scores ps USING(product_id)
     WHERE p.domain_type='supplement' AND p.created_at >= $1 AND p.status='draft'
     ORDER BY ps.overall_score DESC`,
    [since],
  );
  console.log(`Found ${rows.rowCount} scored drafts`);

  const publish: number[] = [];
  const keepDraft: Array<{ id: number; slug: string; score: number }> = [];
  const perProduct: Array<{ id: number; slug: string; score: number; grade: string; action: string }> = [];

  for (const r of rows.rows) {
    if (Number(r.overall_score) >= threshold) {
      publish.push(r.product_id);
      perProduct.push({ id: r.product_id, slug: r.product_slug, score: Number(r.overall_score), grade: r.grade, action: 'published' });
    } else {
      keepDraft.push({ id: r.product_id, slug: r.product_slug, score: Number(r.overall_score) });
      perProduct.push({ id: r.product_id, slug: r.product_slug, score: Number(r.overall_score), grade: r.grade, action: 'draft_low_score' });
    }
  }

  if (publish.length > 0) {
    const res = await c.query(
      `UPDATE products SET status='published', updated_at=NOW() WHERE product_id = ANY($1::int[])`,
      [publish],
    );
    console.log(`Published ${res.rowCount} products (score >= ${threshold})`);
  }
  console.log(`${keepDraft.length} stayed draft (score < ${threshold})`);

  const outPath = path.resolve(__dirname, '../../../../..', 'night-shift/logs/supplement-sprint/score-summary.json');
  fs.writeFileSync(outPath, JSON.stringify({
    total: rows.rowCount,
    published: publish.length,
    stayed_draft: keepDraft.length,
    failed: 0,
    threshold,
    since,
    per_product: perProduct,
  }, null, 2));
  console.log(`Summary: ${outPath}`);

  await c.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
