/**
 * Night Shift — Phase 1: Affiliate Link Audit
 *
 * Re-checks failing affiliate links, flags dead ones, and reports merchant coverage.
 * Strictly non-destructive: flags via verification_status='dead', never deletes.
 *
 * Output:
 *   - reports/<date>/dead_link_analysis.md
 *   - reports/<date>/merchant_coverage.md
 *   - reports/<date>/phase1_summary.json
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/phase1-affiliate-audit.ts [--report-dir=<path>]
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { TrendyolProvider } from '../../modules/affiliate/providers/trendyol.provider';
import { HepsiburadaProvider } from '../../modules/affiliate/providers/hepsiburada.provider';
import { AmazonTrProvider } from '../../modules/affiliate/providers/amazon.provider';
import { BaseAffiliateProvider } from '../../modules/affiliate/providers/base-provider';
import * as fs from 'fs';
import * as path from 'path';

interface FailingLink {
  affiliate_link_id: number;
  product_id: number;
  platform: string;
  affiliate_url: string;
  last_error_type: string | null;
  consecutive_failures: number;
  verification_status: string;
}

interface RecheckResult {
  link_id: number;
  platform: string;
  previous_error: string | null;
  previous_failures: number;
  new_outcome: string;
  new_price: number | null;
  action: 'recovered' | 'flagged_dead' | 'still_failing' | 'skipped';
  details: string;
}

async function main() {
  const args = process.argv.slice(2);
  const reportDirArg = args.find((a) => a.startsWith('--report-dir='));
  const reportDir =
    reportDirArg?.split('=')[1] ||
    path.resolve(process.cwd(), '../../night-shift-reports', new Date().toISOString().slice(0, 10));

  fs.mkdirSync(reportDir, { recursive: true });

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);

  const startedAt = Date.now();
  console.log(`[phase1] START ${new Date().toISOString()}`);
  console.log(`[phase1] report_dir=${reportDir}`);

  // ============================================================
  // 1a. Failing link cohort (http_404 + consecutive_failures>=3 + dom_mismatch)
  // ============================================================
  const failingLinks: FailingLink[] = await ds.query(`
    SELECT affiliate_link_id, product_id, platform, affiliate_url,
           last_error_type, consecutive_failures, verification_status
    FROM affiliate_links
    WHERE is_active = TRUE
      AND (
        last_error_type IN ('http_404','dom_mismatch','http_5xx','timeout','parse_error')
        OR (consecutive_failures >= 3 AND price_snapshot IS NULL)
      )
      AND verification_status NOT IN ('dead')
    ORDER BY consecutive_failures DESC NULLS LAST, affiliate_link_id DESC
  `);

  console.log(`[phase1] failing cohort: ${failingLinks.length} links`);

  const providers: Record<string, BaseAffiliateProvider> = {
    trendyol: new TrendyolProvider(),
    hepsiburada: new HepsiburadaProvider(),
    amazon_tr: new AmazonTrProvider(),
  };

  const results: RecheckResult[] = [];
  const recoveredIds: number[] = [];
  const deadIds: number[] = [];

  const maxCheck = parseInt(process.env.PHASE1_MAX_CHECK || '600', 10);
  const sample = failingLinks.slice(0, maxCheck);
  console.log(`[phase1] re-checking ${sample.length} / ${failingLinks.length} (PHASE1_MAX_CHECK=${maxCheck})`);

  let idx = 0;
  for (const link of sample) {
    idx++;
    const provider = providers[link.platform];
    if (!provider) {
      results.push({
        link_id: link.affiliate_link_id,
        platform: link.platform,
        previous_error: link.last_error_type,
        previous_failures: link.consecutive_failures,
        new_outcome: 'no_provider',
        new_price: null,
        action: 'skipped',
        details: 'Platform provider missing',
      });
      continue;
    }
    try {
      const r = await provider.fetchPrice(link.affiliate_url);
      if (r.price != null) {
        recoveredIds.push(link.affiliate_link_id);
        results.push({
          link_id: link.affiliate_link_id,
          platform: link.platform,
          previous_error: link.last_error_type,
          previous_failures: link.consecutive_failures,
          new_outcome: 'ok',
          new_price: r.price,
          action: 'recovered',
          details: `price=${r.price}`,
        });
      } else {
        const newErr = r.error_type || 'unknown';
        // Dead-flag policy (2026-04-23):
        // - http_404: definitive (product removed from catalog) → flag immediately
        // - dom_mismatch: soft-404 / HTML without price → flag if prior error was same (confirmed) OR cf>=2
        // - http_5xx/timeout/http_403/network: transient, never flag dead here
        const isHardDead =
          newErr === 'http_404' ||
          (newErr === 'dom_mismatch' &&
            (link.last_error_type === 'dom_mismatch' || link.consecutive_failures >= 2));
        if (isHardDead) {
          deadIds.push(link.affiliate_link_id);
          results.push({
            link_id: link.affiliate_link_id,
            platform: link.platform,
            previous_error: link.last_error_type,
            previous_failures: link.consecutive_failures,
            new_outcome: newErr,
            new_price: null,
            action: 'flagged_dead',
            details: (r.error || '').slice(0, 120),
          });
        } else {
          results.push({
            link_id: link.affiliate_link_id,
            platform: link.platform,
            previous_error: link.last_error_type,
            previous_failures: link.consecutive_failures,
            new_outcome: newErr,
            new_price: null,
            action: 'still_failing',
            details: (r.error || '').slice(0, 120),
          });
        }
      }
    } catch (err: any) {
      results.push({
        link_id: link.affiliate_link_id,
        platform: link.platform,
        previous_error: link.last_error_type,
        previous_failures: link.consecutive_failures,
        new_outcome: 'exception',
        new_price: null,
        action: 'still_failing',
        details: String(err?.message || err).slice(0, 120),
      });
    }
    if (idx % 25 === 0) {
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      console.log(`[phase1] progress ${idx}/${sample.length} elapsed=${elapsed}s recovered=${recoveredIds.length} flagged_dead=${deadIds.length}`);
      // DB keep-alive — Neon pooler drops idle connections after a few minutes.
      try { await ds.query('SELECT 1'); } catch { /* ignore, post-loop retry will reconnect */ }
    }
  }

  // ============================================================
  // Apply flags — flagged_dead -> verification_status='dead'
  // Also bump last_attempted_at for all checked links.
  // ============================================================
  if (deadIds.length > 0) {
    await ds.query(
      `UPDATE affiliate_links SET verification_status = 'dead', last_attempted_at = NOW() WHERE affiliate_link_id = ANY($1::int[])`,
      [deadIds],
    );
    console.log(`[phase1] flagged ${deadIds.length} link(s) as dead`);
  }
  if (recoveredIds.length > 0) {
    await ds.query(
      `UPDATE affiliate_links SET consecutive_failures = 0, verification_status = 'valid', last_verified = NOW(), last_attempted_at = NOW(), last_error_type = NULL, last_error_message = NULL WHERE affiliate_link_id = ANY($1::int[])`,
      [recoveredIds],
    );
    console.log(`[phase1] reset ${recoveredIds.length} recovered link(s)`);
  }
  // Still_failing: increment cf + persist new error type so next run's threshold logic works.
  const stillFailingByErr: Record<string, number[]> = {};
  for (const r of results) {
    if (r.action === 'still_failing') {
      (stillFailingByErr[r.new_outcome] ||= []).push(r.link_id);
    }
  }
  for (const [err, ids] of Object.entries(stillFailingByErr)) {
    await ds.query(
      `UPDATE affiliate_links
       SET consecutive_failures = consecutive_failures + 1,
           last_error_type = $1,
           last_attempted_at = NOW()
       WHERE affiliate_link_id = ANY($2::int[])`,
      [err, ids],
    );
  }
  if (Object.keys(stillFailingByErr).length > 0) {
    const total = Object.values(stillFailingByErr).reduce((a, b) => a + b.length, 0);
    console.log(`[phase1] bumped consecutive_failures on ${total} still_failing link(s)`);
  }
  const checkedIds = results.map((r) => r.link_id);
  if (checkedIds.length > 0) {
    // Bump last_attempted_at for all checked (bulk), idempotent
    await ds.query(
      `UPDATE affiliate_links SET last_attempted_at = NOW() WHERE affiliate_link_id = ANY($1::int[])`,
      [checkedIds],
    );
  }

  // ============================================================
  // 1c. Merchant coverage audit (all products)
  // ============================================================
  const coverageRows: Array<{
    link_count: string;
    product_count: string;
  }> = await ds.query(`
    SELECT link_count::text, COUNT(*)::text AS product_count FROM (
      SELECT p.product_id,
             COUNT(al.affiliate_link_id) FILTER (
               WHERE al.is_active = TRUE AND al.verification_status != 'dead'
             ) AS link_count
      FROM products p
      LEFT JOIN affiliate_links al ON al.product_id = p.product_id
      WHERE p.status IN ('published','active')
      GROUP BY p.product_id
    ) s
    GROUP BY link_count
    ORDER BY link_count ASC
  `);

  const merchantByPlatform: Array<{
    platform: string;
    total: string;
    dead: string;
    valid: string;
    unverified: string;
  }> = await ds.query(`
    SELECT platform,
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE verification_status = 'dead')::text AS dead,
      COUNT(*) FILTER (WHERE verification_status = 'valid')::text AS valid,
      COUNT(*) FILTER (WHERE verification_status = 'unverified')::text AS unverified
    FROM affiliate_links
    WHERE is_active = TRUE
    GROUP BY platform
    ORDER BY COUNT(*) DESC
  `);

  // ============================================================
  // Write reports
  // ============================================================
  const dateStr = new Date().toISOString().slice(0, 10);
  const deadPath = path.join(reportDir, 'dead_link_analysis.md');
  const mcPath = path.join(reportDir, 'merchant_coverage.md');
  const summaryPath = path.join(reportDir, 'phase1_summary.json');

  // dead_link_analysis.md
  const byAction: Record<string, number> = {};
  const byPlatform: Record<string, Record<string, number>> = {};
  for (const r of results) {
    byAction[r.action] = (byAction[r.action] || 0) + 1;
    if (!byPlatform[r.platform]) byPlatform[r.platform] = {};
    byPlatform[r.platform][r.action] = (byPlatform[r.platform][r.action] || 0) + 1;
  }

  let deadMd = `# Dead Link Analysis — ${dateStr}\n\n`;
  deadMd += `**Run at:** ${new Date().toISOString()}\n`;
  deadMd += `**Cohort size (failing):** ${failingLinks.length}\n`;
  deadMd += `**Re-checked:** ${sample.length}\n`;
  deadMd += `**Duration:** ${Math.round((Date.now() - startedAt) / 1000)}s\n\n`;
  deadMd += `## Actions taken\n\n`;
  deadMd += `| Action | Count |\n|---|---|\n`;
  for (const [a, c] of Object.entries(byAction).sort((x, y) => y[1] - x[1])) {
    deadMd += `| ${a} | ${c} |\n`;
  }
  deadMd += `\n## Platform breakdown\n\n`;
  deadMd += `| Platform | recovered | flagged_dead | still_failing | skipped |\n|---|---|---|---|---|\n`;
  for (const [p, counts] of Object.entries(byPlatform)) {
    deadMd += `| ${p} | ${counts['recovered'] || 0} | ${counts['flagged_dead'] || 0} | ${counts['still_failing'] || 0} | ${counts['skipped'] || 0} |\n`;
  }
  deadMd += `\n## Flagged dead (first 50)\n\n`;
  const deadSample = results.filter((r) => r.action === 'flagged_dead').slice(0, 50);
  for (const r of deadSample) {
    deadMd += `- link_id=${r.link_id} platform=${r.platform} error=${r.new_outcome} prev_failures=${r.previous_failures}\n`;
  }
  deadMd += `\n## Recovered (first 50)\n\n`;
  const recSample = results.filter((r) => r.action === 'recovered').slice(0, 50);
  for (const r of recSample) {
    deadMd += `- link_id=${r.link_id} platform=${r.platform} price=${r.new_price}\n`;
  }
  fs.writeFileSync(deadPath, deadMd);
  console.log(`[phase1] wrote ${deadPath}`);

  // merchant_coverage.md
  let mcMd = `# Merchant Coverage — ${dateStr}\n\n`;
  mcMd += `## Link count per product (active/non-dead links)\n\n`;
  mcMd += `| Link count | Products |\n|---|---|\n`;
  for (const r of coverageRows) mcMd += `| ${r.link_count} | ${r.product_count} |\n`;
  mcMd += `\n## Affiliate link status per platform\n\n`;
  mcMd += `| Platform | Total | Valid | Dead | Unverified |\n|---|---|---|---|---|\n`;
  for (const r of merchantByPlatform) {
    mcMd += `| ${r.platform} | ${r.total} | ${r.valid} | ${r.dead} | ${r.unverified} |\n`;
  }
  fs.writeFileSync(mcPath, mcMd);
  console.log(`[phase1] wrote ${mcPath}`);

  // summary.json
  const summary = {
    phase: 'phase1',
    run_at: new Date().toISOString(),
    duration_s: Math.round((Date.now() - startedAt) / 1000),
    cohort_size: failingLinks.length,
    checked: sample.length,
    recovered: recoveredIds.length,
    flagged_dead: deadIds.length,
    still_failing: byAction['still_failing'] || 0,
    skipped: byAction['skipped'] || 0,
    platform_breakdown: byPlatform,
    coverage_histogram: coverageRows.map((r) => ({ link_count: r.link_count, products: r.product_count })),
    merchant_status: merchantByPlatform,
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`[phase1] wrote ${summaryPath}`);

  console.log(`[phase1] DONE in ${Math.round((Date.now() - startedAt) / 1000)}s`);
  console.log(`[phase1] recovered=${recoveredIds.length} flagged_dead=${deadIds.length} still_failing=${byAction['still_failing'] || 0}`);

  await app.close();
}

main().catch((err) => {
  console.error('[phase1] FATAL:', err);
  process.exit(1);
});
