/**
 * Night Shift — Phase 3: Price Intelligence
 * Read-only SQL aggregates: drift, OOS concentration, coverage.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import * as fs from 'fs';
import * as path from 'path';

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
  console.log(`[phase3] START ${new Date().toISOString()}`);

  // 3a. Price drift — son 7 gün >%20 değişim (product_price_history tablosu varsayımı)
  let drift: any[] = [];
  try {
    drift = await ds.query(`
      WITH recent AS (
        SELECT product_id, platform, price, recorded_at,
               LAG(price) OVER (PARTITION BY product_id, platform ORDER BY recorded_at) AS prev_price,
               LAG(recorded_at) OVER (PARTITION BY product_id, platform ORDER BY recorded_at) AS prev_at
        FROM product_price_history
        WHERE recorded_at > NOW() - INTERVAL '7 days'
      )
      SELECT product_id, platform, price, prev_price,
             CASE WHEN prev_price > 0 THEN ROUND(((price - prev_price) / prev_price * 100)::numeric, 1) ELSE NULL END AS pct_change,
             recorded_at, prev_at
      FROM recent
      WHERE prev_price IS NOT NULL
        AND prev_price > 0
        AND ABS((price - prev_price) / prev_price) > 0.20
      ORDER BY ABS((price - prev_price) / prev_price) DESC
      LIMIT 200
    `);
  } catch (e: any) {
    console.log(`[phase3] price drift query failed: ${e?.message}`);
  }

  // 3b. OOS concentration — affiliate_links with verification_status='dead' or last_error 'oos'
  const oosByBrand: any[] = await ds.query(`
    SELECT b.brand_name, b.brand_id,
      COUNT(*) FILTER (WHERE al.verification_status = 'dead') AS dead_links,
      COUNT(*) AS total_links,
      ROUND(COUNT(*) FILTER (WHERE al.verification_status = 'dead')::numeric / GREATEST(COUNT(*),1) * 100, 1) AS dead_pct
    FROM affiliate_links al
    JOIN products p ON p.product_id = al.product_id
    JOIN brands b ON b.brand_id = p.brand_id
    WHERE al.is_active = TRUE
    GROUP BY b.brand_id, b.brand_name
    HAVING COUNT(*) >= 5
    ORDER BY dead_pct DESC, dead_links DESC
    LIMIT 30
  `);

  // 3c. Price coverage — how many products have fresh prices
  const coverage: any[] = await ds.query(`
    SELECT
      COUNT(DISTINCT p.product_id) FILTER (WHERE p.status IN ('published','active')) AS total_products,
      COUNT(DISTINCT al.product_id) FILTER (WHERE al.price_updated_at > NOW() - INTERVAL '1 day') AS fresh_1d,
      COUNT(DISTINCT al.product_id) FILTER (WHERE al.price_updated_at > NOW() - INTERVAL '7 days') AS fresh_7d,
      COUNT(DISTINCT al.product_id) FILTER (WHERE al.price_updated_at > NOW() - INTERVAL '30 days') AS fresh_30d,
      COUNT(DISTINCT al.product_id) FILTER (WHERE al.price_snapshot IS NULL) AS never_priced
    FROM products p
    LEFT JOIN affiliate_links al ON al.product_id = p.product_id AND al.is_active = TRUE
  `);

  const platformCoverage: any[] = await ds.query(`
    SELECT platform,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE price_updated_at > NOW() - INTERVAL '1 day') AS fresh_1d,
      COUNT(*) FILTER (WHERE price_updated_at > NOW() - INTERVAL '7 days') AS fresh_7d,
      ROUND((COUNT(*) FILTER (WHERE price_updated_at > NOW() - INTERVAL '7 days'))::numeric / GREATEST(COUNT(*),1) * 100, 1) AS fresh_7d_pct
    FROM affiliate_links
    WHERE is_active = TRUE
    GROUP BY platform
    ORDER BY total DESC
  `);

  // Write report
  const dateStr = new Date().toISOString().slice(0, 10);
  let md = `# Price Intelligence — ${dateStr}\n\n`;
  md += `Run at: ${new Date().toISOString()}\n\n`;

  md += `## 3a. Price drift > 20% in 7 days (top 30)\n\n`;
  if (drift.length === 0) {
    md += `_No drift data (product_price_history may not have enough data yet)._\n\n`;
  } else {
    md += `| product_id | platform | prev_price | price | pct_change | recorded_at |\n|---|---|---|---|---|---|\n`;
    for (const d of drift.slice(0, 30)) {
      md += `| ${d.product_id} | ${d.platform} | ${d.prev_price} | ${d.price} | ${d.pct_change}% | ${new Date(d.recorded_at).toISOString()} |\n`;
    }
    md += `\n_Total drift events (>20%): ${drift.length} (top 200 captured)_\n\n`;
  }

  md += `## 3b. Dead-link concentration by brand (top 30)\n\n`;
  md += `| Brand | Dead | Total | Dead% |\n|---|---|---|---|\n`;
  for (const r of oosByBrand) {
    md += `| ${r.brand_name} | ${r.dead_links} | ${r.total_links} | ${r.dead_pct}% |\n`;
  }

  md += `\n## 3c. Price coverage overview\n\n`;
  const c = coverage[0];
  md += `- Total published/active products: **${c.total_products}**\n`;
  md += `- With fresh price (1 day): **${c.fresh_1d}**\n`;
  md += `- With fresh price (7 days): **${c.fresh_7d}**\n`;
  md += `- With fresh price (30 days): **${c.fresh_30d}**\n`;
  md += `- Never priced: **${c.never_priced}**\n\n`;

  md += `## Platform freshness\n\n`;
  md += `| Platform | Total | Fresh 1d | Fresh 7d | Fresh 7d% |\n|---|---|---|---|---|\n`;
  for (const r of platformCoverage) {
    md += `| ${r.platform} | ${r.total} | ${r.fresh_1d} | ${r.fresh_7d} | ${r.fresh_7d_pct}% |\n`;
  }

  const mdPath = path.join(reportDir, 'price_intelligence.md');
  fs.writeFileSync(mdPath, md);
  console.log(`[phase3] wrote ${mdPath}`);

  const summary = {
    phase: 'phase3',
    run_at: new Date().toISOString(),
    duration_s: Math.round((Date.now() - startedAt) / 1000),
    drift_events: drift.length,
    brands_with_dead_links: oosByBrand.length,
    coverage,
    platform_coverage: platformCoverage,
  };
  fs.writeFileSync(path.join(reportDir, 'phase3_summary.json'), JSON.stringify(summary, null, 2));
  console.log(`[phase3] DONE in ${Math.round((Date.now() - startedAt) / 1000)}s`);

  await app.close();
}

main().catch((err) => {
  console.error('[phase3] FATAL:', err);
  process.exit(1);
});
