/**
 * Phase 1 diagnostic — explain why 1673 failing links got 0 recovered / 0 dead.
 *
 *   1. Cohort breakdown: last_error_type × platform × consecutive_failures histogram
 *   2. Live re-check 20 random sample links, log provider's new error_type
 *   3. Reveal whether Cloudflare (http_403) / timeout / dom_mismatch dominates
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/phase1-diagnose.ts
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { TrendyolProvider } from '../../modules/affiliate/providers/trendyol.provider';
import { HepsiburadaProvider } from '../../modules/affiliate/providers/hepsiburada.provider';
import { AmazonTrProvider } from '../../modules/affiliate/providers/amazon.provider';
import { BaseAffiliateProvider } from '../../modules/affiliate/providers/base-provider';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);

  console.log('=== Phase 1 Diagnostic ===\n');

  // 1. Cohort breakdown by last_error_type × platform
  const errorBreakdown: any[] = await ds.query(`
    SELECT platform, COALESCE(last_error_type,'<null>') AS err, COUNT(*)::int AS n
    FROM affiliate_links
    WHERE is_active = TRUE
      AND (
        last_error_type IN ('http_404','dom_mismatch','http_5xx','timeout','parse_error')
        OR (consecutive_failures >= 3 AND price_snapshot IS NULL)
      )
      AND verification_status NOT IN ('dead')
    GROUP BY platform, err
    ORDER BY platform, n DESC
  `);
  console.log('Cohort by platform × last_error_type:');
  for (const r of errorBreakdown) {
    console.log(`  ${r.platform.padEnd(15)} ${r.err.padEnd(15)} ${r.n}`);
  }

  // 2. Consecutive failure histogram
  const histRows: any[] = await ds.query(`
    SELECT consecutive_failures AS cf, COUNT(*)::int AS n
    FROM affiliate_links
    WHERE is_active = TRUE
      AND (
        last_error_type IN ('http_404','dom_mismatch','http_5xx','timeout','parse_error')
        OR (consecutive_failures >= 3 AND price_snapshot IS NULL)
      )
      AND verification_status NOT IN ('dead')
    GROUP BY cf
    ORDER BY cf DESC
  `);
  console.log('\nConsecutive failures histogram:');
  for (const r of histRows) {
    console.log(`  cf=${r.cf}: ${r.n} links`);
  }

  // 3. Live re-check 20 random sample across 3 platforms
  const providers: Record<string, BaseAffiliateProvider> = {
    trendyol: new TrendyolProvider(),
    hepsiburada: new HepsiburadaProvider(),
    amazon_tr: new AmazonTrProvider(),
  };

  const sample: any[] = await ds.query(`
    SELECT affiliate_link_id, platform, affiliate_url, last_error_type, consecutive_failures
    FROM affiliate_links
    WHERE is_active = TRUE
      AND platform IN ('trendyol','hepsiburada','amazon_tr')
      AND (
        last_error_type IN ('http_404','dom_mismatch','http_5xx','timeout','parse_error')
        OR (consecutive_failures >= 3 AND price_snapshot IS NULL)
      )
      AND verification_status NOT IN ('dead')
    ORDER BY RANDOM()
    LIMIT 30
  `);

  console.log(`\nLive re-check of ${sample.length} random failing links:`);
  const newOutcome: Record<string, number> = {};
  for (const link of sample) {
    const p = providers[link.platform];
    if (!p) continue;
    try {
      const r = await p.fetchPrice(link.affiliate_url);
      const outcome = r.price != null ? 'ok' : (r.error_type || 'unknown');
      newOutcome[outcome] = (newOutcome[outcome] || 0) + 1;
      console.log(`  [${link.platform}] link_id=${link.affiliate_link_id} prev=${link.last_error_type} cf=${link.consecutive_failures} → ${outcome}${r.price ? ' (price=' + r.price + ')' : ''}`);
    } catch (e: any) {
      newOutcome['exception'] = (newOutcome['exception'] || 0) + 1;
      console.log(`  [${link.platform}] link_id=${link.affiliate_link_id} → exception ${String(e?.message).slice(0, 60)}`);
    }
  }

  console.log('\nNew outcome distribution:');
  for (const [k, v] of Object.entries(newOutcome).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  await app.close();
}

main().catch((err) => {
  console.error('[diagnose] FATAL:', err);
  process.exit(1);
});
