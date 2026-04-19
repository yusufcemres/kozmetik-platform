/**
 * V2.A.7 — Onboarding telemetry reader.
 *
 * Quick CLI summary of onboarding_log. Purpose is to answer four
 * questions fast, without opening a SQL client:
 *   1. How many runs this window, and what was the success rate?
 *   2. What's the median/p95 pipeline duration? (regression spotter)
 *   3. Which stage fails most often, and on which slugs?
 *   4. What recent runs should I look at first?
 *
 * Usage:
 *   ts-node onboarding-telemetry.ts                # last 30 days summary
 *   ts-node onboarding-telemetry.ts --days=7       # custom window
 *   ts-node onboarding-telemetry.ts --runs         # list individual runs too
 *   ts-node onboarding-telemetry.ts --json         # machine-readable output
 */
import { newClient } from '../onboarding/db';

type Row = {
  log_id: number;
  product_id: number | null;
  product_slug: string | null;
  // pg returns TIMESTAMPTZ as Date; we coerce to ISO string at display time.
  started_at: Date | string;
  duration_ms: number | null;
  status: 'success' | 'failed' | 'dry_run';
  failed_stage: string | null;
  error_message: string | null;
};

function toIso(v: Date | string): string {
  return v instanceof Date ? v.toISOString() : String(v);
}

function parseArgs() {
  const daysArg = process.argv.find((a) => a.startsWith('--days='));
  const days = daysArg ? Number(daysArg.split('=')[1]) : 30;
  const showRuns = process.argv.includes('--runs');
  const asJson = process.argv.includes('--json');
  return { days, showRuns, asJson };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function main(): Promise<void> {
  const { days, showRuns, asJson } = parseArgs();
  const c = newClient();
  await c.connect();
  try {
    const { rows } = await c.query<Row>(
      `SELECT log_id, product_id, product_slug, started_at, duration_ms,
              status, failed_stage, error_message
         FROM onboarding_log
        WHERE started_at >= NOW() - ($1 || ' days')::interval
        ORDER BY started_at DESC`,
      [String(days)],
    );

    const total = rows.length;
    const success = rows.filter((r) => r.status === 'success').length;
    const failed = rows.filter((r) => r.status === 'failed').length;
    const dry = rows.filter((r) => r.status === 'dry_run').length;

    const successDurations = rows
      .filter((r) => r.status === 'success' && r.duration_ms != null)
      .map((r) => r.duration_ms!)
      .sort((a, b) => a - b);
    const median = percentile(successDurations, 50);
    const p95 = percentile(successDurations, 95);

    const byStage: Record<string, number> = {};
    for (const r of rows.filter((x) => x.status === 'failed' && x.failed_stage)) {
      byStage[r.failed_stage!] = (byStage[r.failed_stage!] ?? 0) + 1;
    }

    if (asJson) {
      console.log(
        JSON.stringify(
          { window_days: days, total, success, failed, dry_run: dry, median_ms: median, p95_ms: p95, failures_by_stage: byStage, rows: showRuns ? rows : undefined },
          null,
          2,
        ),
      );
      return;
    }

    console.log(`\n📊 Onboarding telemetry — last ${days}g`);
    console.log(`   total     : ${total}`);
    console.log(`   success   : ${success}  (${total ? Math.round((success / total) * 100) : 0}%)`);
    console.log(`   failed    : ${failed}`);
    console.log(`   dry_run   : ${dry}`);
    console.log(`   median dur: ${median} ms  (success only)`);
    console.log(`   p95 dur   : ${p95} ms`);

    if (Object.keys(byStage).length > 0) {
      console.log(`\n   Failures by stage:`);
      for (const [stage, count] of Object.entries(byStage).sort((a, b) => b[1] - a[1])) {
        console.log(`     • ${stage.padEnd(20)} ${count}`);
      }
    }

    if (showRuns) {
      console.log(`\n   Runs:`);
      for (const r of rows.slice(0, 50)) {
        const icon = r.status === 'success' ? '✅' : r.status === 'failed' ? '❌' : '👀';
        const ms = r.duration_ms != null ? `${r.duration_ms}ms` : '—';
        const slug = (r.product_slug ?? '').slice(0, 40).padEnd(40);
        const extra = r.failed_stage ? ` → ${r.failed_stage}` : '';
        console.log(`     ${icon} ${toIso(r.started_at).slice(0, 19)}  ${slug}  ${ms.padStart(7)}${extra}`);
      }
      if (rows.length > 50) console.log(`     … +${rows.length - 50} daha`);
    }

    console.log('');
  } finally {
    await c.end().catch(() => undefined);
  }
}

main().catch((e) => {
  console.error(`❌ ${e?.stack ?? e?.message ?? e}`);
  process.exit(1);
});
