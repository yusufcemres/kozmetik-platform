/**
 * Post-onboard: score every freshly-inserted supplement product (status='draft')
 * via SupplementScoringService.calculateScore, persist to product_scores, and
 * publish products whose score meets the threshold.
 *
 * Usage:
 *   ./run-prod.sh src/scripts/night-shift/supplement-score-and-publish.ts [--since="2026-04-23 18:00"] [--threshold=50]
 *
 * Default threshold = 50 (patron eşiği: "dolu dolu" ürünler yayınlanır, altı draft kalır).
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { SupplementScoringService } from '../../modules/scoring/supplement-scoring.service';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const since = args.find((a) => a.startsWith('--since='))?.split('=').slice(1).join('=') || '2026-04-23 18:00';
  const thresholdStr = args.find((a) => a.startsWith('--threshold='))?.split('=')[1];
  const threshold = thresholdStr ? parseInt(thresholdStr, 10) : 50;

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const ds = app.get(DataSource);
  const svc = app.get(SupplementScoringService);

  const rows: Array<{ product_id: number; product_slug: string; product_name: string }> = await ds.query(
    `SELECT product_id, product_slug, product_name FROM products
     WHERE domain_type = 'supplement' AND status = 'draft' AND created_at >= $1
     ORDER BY product_id ASC`,
    [since],
  );
  console.log(`Scoring ${rows.length} draft supplement products (since ${since}, threshold ≥${threshold})`);

  let published = 0;
  let stayedDraft = 0;
  let failed = 0;
  const perProduct: Array<{ id: number; slug: string; score: number | null; grade: string | null; action: string; error?: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const p = rows[i];
    try {
      const score = await svc.calculateScore(p.product_id, true);
      const overall = score.overall_score;
      const grade = score.grade;
      if (overall >= threshold) {
        await ds.query(
          `UPDATE products SET status = 'published', updated_at = NOW() WHERE product_id = $1`,
          [p.product_id],
        );
        published++;
        perProduct.push({ id: p.product_id, slug: p.product_slug, score: overall, grade, action: 'published' });
      } else {
        stayedDraft++;
        perProduct.push({ id: p.product_id, slug: p.product_slug, score: overall, grade, action: 'draft_low_score' });
      }
      if ((i + 1) % 5 === 0 || i === rows.length - 1) {
        console.log(`  ${i + 1}/${rows.length}  published=${published} draft=${stayedDraft} failed=${failed}`);
      }
    } catch (err: any) {
      failed++;
      const msg = err?.message || String(err);
      console.error(`  #${p.product_id} (${p.product_slug}) failed: ${msg.slice(0, 200)}`);
      perProduct.push({ id: p.product_id, slug: p.product_slug, score: null, grade: null, action: 'score_failed', error: msg.slice(0, 300) });
    }
  }

  const summary = {
    total: rows.length,
    published,
    stayed_draft: stayedDraft,
    failed,
    threshold,
    since,
    per_product: perProduct,
  };
  const outPath = path.resolve(__dirname, '../../../../..', 'night-shift/logs/supplement-sprint/score-summary.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`\nDone: total=${rows.length} published=${published} draft=${stayedDraft} failed=${failed}`);
  console.log(`Summary: ${outPath}`);
  await Promise.race([
    app.close(),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
  process.exit(0);
}

main().catch((err) => {
  console.error('Supplement score+publish FATAL:', err);
  process.exit(1);
});
