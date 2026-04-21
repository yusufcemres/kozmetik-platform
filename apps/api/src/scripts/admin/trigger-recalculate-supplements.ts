/**
 * One-shot: iterate ALL supplement products (status published|active) and
 * call calculateScores — populates product_need_scores for supplements.
 * scoring.service.recalculateAll() only covers 'published' which excludes the
 * 33 supplement rows that are stored with status='active'. Patched upstream in
 * follow-up PR but this unblocks need-matching coverage tonight.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { ScoringService } from '../../modules/scoring/scoring.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const ds = app.get(DataSource);
  const svc = app.get(ScoringService);

  const rows: Array<{ product_id: number; status: string; domain_type: string }> = await ds.query(
    `SELECT product_id, status, domain_type FROM products
     WHERE domain_type = 'supplement' AND status IN ('published', 'active')
     ORDER BY product_id ASC`,
  );
  console.log(`Recalculating ${rows.length} supplement products...`);

  let ok = 0, skipped = 0, failed = 0;
  for (let i = 0; i < rows.length; i++) {
    const p = rows[i];
    try {
      const result = await svc.calculateScores(p.product_id);
      if (result.scores?.length) ok++;
      else skipped++;
      if ((i + 1) % 10 === 0 || i === rows.length - 1) {
        process.stdout.write(`  ${i + 1}/${rows.length}  ok=${ok} skipped=${skipped} failed=${failed}\n`);
      }
    } catch (err) {
      failed++;
      console.error(`  #${p.product_id} failed:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Done: total=${rows.length} ok=${ok} skipped=${skipped} failed=${failed}`);
  await app.close();
}

main().catch((err) => {
  console.error('Supplement recalc failed:', err);
  process.exit(1);
});
