/**
 * Affiliate failure audit.
 *
 * Prod DB'deki aktif affiliate_links'ın güncellenme durumunu platform + error_type
 * bazında kategorize eder. Son 100 başarısız linkten 10 örnek alıp canlı fetch
 * denemesi yapar; hataları taxonomy'ye göre sayar.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/scripts/audit/check-affiliate-failure-reasons.ts
 *   npx ts-node ... --sample=20             # canlı fetch örnek sayısı
 *   npx ts-node ... --platform=trendyol     # tek platform
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { AffiliateService } from '../../modules/affiliate/affiliate.service';
import { TrendyolProvider } from '../../modules/affiliate/providers/trendyol.provider';
import { HepsiburadaProvider } from '../../modules/affiliate/providers/hepsiburada.provider';
import { AmazonTrProvider } from '../../modules/affiliate/providers/amazon.provider';
import { BaseAffiliateProvider } from '../../modules/affiliate/providers/base-provider';

interface PlatformRow {
  platform: string;
  total: string;
  with_price: string;
  stale_7d: string;
  never_updated: string;
  needs_review: string;
}

async function main() {
  const args = process.argv.slice(2);
  const sampleArg = args.find((a) => a.startsWith('--sample='));
  const sampleSize = sampleArg ? parseInt(sampleArg.split('=')[1], 10) : 10;
  const platformArg = args.find((a) => a.startsWith('--platform='));
  const onlyPlatform = platformArg ? platformArg.split('=')[1] : null;

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);

  console.log('=== AFFILIATE FAILURE AUDIT ===');
  console.log(`Run at: ${new Date().toISOString()}`);
  if (onlyPlatform) console.log(`Platform filter: ${onlyPlatform}`);
  console.log();

  // Platform bazında durum
  const platformRows: PlatformRow[] = await ds.query(
    `
    SELECT
      al.platform,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE al.price_snapshot IS NOT NULL) AS with_price,
      COUNT(*) FILTER (WHERE al.price_updated_at IS NULL OR al.price_updated_at < NOW() - INTERVAL '7 days') AS stale_7d,
      COUNT(*) FILTER (WHERE al.price_updated_at IS NULL) AS never_updated,
      COUNT(*) FILTER (WHERE al.verification_status = 'needs_review') AS needs_review
    FROM affiliate_links al
    WHERE al.is_active = TRUE
      ${onlyPlatform ? 'AND al.platform = $1' : ''}
    GROUP BY al.platform
    ORDER BY total DESC
  `,
    onlyPlatform ? [onlyPlatform] : [],
  );

  console.log('## Platform breakdown');
  console.log('Platform        | Total | w/Price | Stale 7d | Never | NeedsReview');
  console.log('----------------|-------|---------|----------|-------|------------');
  let sumTotal = 0;
  let sumWithPrice = 0;
  for (const r of platformRows) {
    const total = parseInt(r.total, 10);
    const wp = parseInt(r.with_price, 10);
    sumTotal += total;
    sumWithPrice += wp;
    const pct = total > 0 ? ((wp / total) * 100).toFixed(1) : '0.0';
    console.log(
      `${r.platform.padEnd(16)}| ${String(total).padStart(5)} | ${String(wp).padStart(7)} (${pct}%) | ${String(r.stale_7d).padStart(8)} | ${String(r.never_updated).padStart(5)} | ${String(r.needs_review).padStart(10)}`,
    );
  }
  const overallPct = sumTotal > 0 ? ((sumWithPrice / sumTotal) * 100).toFixed(1) : '0.0';
  console.log();
  console.log(`OVERALL: ${sumWithPrice}/${sumTotal} (${overallPct}%)`);
  console.log();

  // Error type breakdown (son 24 saatte toplanan hatalar)
  const errorRows: Array<{ error_type: string; count: string }> = await ds.query(`
    SELECT
      COALESCE(last_error_type, 'no_error_recorded') AS error_type,
      COUNT(*) AS count
    FROM affiliate_links
    WHERE is_active = TRUE
      AND (price_snapshot IS NULL OR price_updated_at < NOW() - INTERVAL '2 days')
    GROUP BY last_error_type
    ORDER BY count DESC
  `);

  console.log('## Error type breakdown (failed links)');
  console.log('Error Type         | Count');
  console.log('-------------------|------');
  for (const e of errorRows) {
    console.log(`${e.error_type.padEnd(19)}| ${e.count}`);
  }
  console.log();

  // Sample failed links + canlı re-fetch
  console.log(`## Live re-fetch sample (n=${sampleSize})`);
  const sampleQuery = `
    SELECT al.affiliate_link_id, al.platform, al.affiliate_url,
           al.last_error_type, al.last_error_message, al.consecutive_failures
    FROM affiliate_links al
    WHERE al.is_active = TRUE
      AND al.price_snapshot IS NULL
      ${onlyPlatform ? 'AND al.platform = $1' : ''}
    ORDER BY al.consecutive_failures DESC NULLS LAST, al.affiliate_link_id DESC
    LIMIT ${sampleSize}
  `;
  const samples: Array<{
    affiliate_link_id: number;
    platform: string;
    affiliate_url: string;
    last_error_type: string | null;
    last_error_message: string | null;
    consecutive_failures: number | null;
  }> = await ds.query(sampleQuery, onlyPlatform ? [onlyPlatform] : []);

  const providers: Record<string, BaseAffiliateProvider> = {
    trendyol: new TrendyolProvider(),
    hepsiburada: new HepsiburadaProvider(),
    amazon_tr: new AmazonTrProvider(),
  };

  const liveBreakdown: Record<string, number> = {};
  console.log('LinkID | Platform    | Old Err         | Live Attempt Result');
  console.log('-------|-------------|-----------------|--------------------');
  for (const s of samples) {
    const provider = providers[s.platform];
    if (!provider) {
      console.log(`${String(s.affiliate_link_id).padStart(6)} | ${s.platform.padEnd(11)} | ${(s.last_error_type || '-').padEnd(15)} | NO_PROVIDER`);
      continue;
    }
    try {
      const r = await provider.fetchPrice(s.affiliate_url);
      const outcome = r.price != null ? `OK price=${r.price}` : `FAIL ${r.error_type || 'unknown'}: ${(r.error || '').slice(0, 40)}`;
      const key = r.price != null ? 'ok' : r.error_type || 'unknown';
      liveBreakdown[key] = (liveBreakdown[key] || 0) + 1;
      console.log(`${String(s.affiliate_link_id).padStart(6)} | ${s.platform.padEnd(11)} | ${(s.last_error_type || '-').padEnd(15)} | ${outcome}`);
    } catch (err: any) {
      liveBreakdown['exception'] = (liveBreakdown['exception'] || 0) + 1;
      console.log(`${String(s.affiliate_link_id).padStart(6)} | ${s.platform.padEnd(11)} | ${(s.last_error_type || '-').padEnd(15)} | EXCEPTION ${err?.message}`);
    }
  }

  console.log();
  console.log('## Live re-fetch breakdown');
  for (const [k, v] of Object.entries(liveBreakdown).sort((a, b) => b[1] - a[1])) {
    console.log(`${k.padEnd(15)}: ${v}`);
  }

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
