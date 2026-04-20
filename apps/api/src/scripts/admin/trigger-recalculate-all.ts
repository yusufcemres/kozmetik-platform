/**
 * Trigger POST /scoring/recalculate-all internally (no HTTP + no JWT needed).
 * Bootstraps NestFactory app context and calls ScoringService.recalculateAll().
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ScoringService } from '../../modules/scoring/scoring.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const svc = app.get(ScoringService);
  const started = Date.now();
  console.log('recalculateAll: starting...');
  const result = await svc.recalculateAll();
  console.log(`recalculateAll: done in ${Date.now() - started}ms`);
  console.log(JSON.stringify(result, null, 2));
  await app.close();
}

main().catch((err) => {
  console.error('recalculateAll failed:', err);
  process.exit(1);
});
