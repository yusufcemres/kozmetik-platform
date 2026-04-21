/**
 * Trigger batchUpdatePrices internally (no HTTP + no JWT needed).
 * Fetches current prices for every active affiliate link and writes
 * one price_history row per link + updates snapshot.
 * This seeds the first data point so the chart can arm (≥2 points rule).
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AffiliateService } from '../../modules/affiliate/affiliate.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const svc = app.get(AffiliateService);
  const started = Date.now();
  console.log('batchUpdatePrices: starting...');
  const result = await svc.batchUpdatePrices();
  console.log(`batchUpdatePrices: done in ${Date.now() - started}ms`);
  console.log(JSON.stringify(result, null, 2));
  await app.close();
}

main().catch((err) => {
  console.error('batchUpdatePrices failed:', err);
  process.exit(1);
});
