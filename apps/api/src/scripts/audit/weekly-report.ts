/**
 * V2.A.6 — Weekly audit reporter.
 *
 * Orchestrator: runs the three supplement-catalog audits in-process and
 * emits a single Telegram summary. Designed for a Sunday cron — if something
 * regresses mid-week (score drop, new NULL, drift added by a missed PR) we
 * see it by Sunday evening instead of next batch cycle.
 *
 * Sections:
 *   1. Schema drift — any payload/entity desync
 *   2. Missing ingredient data — NULL common_name / EN summary / etc
 *   3. Score regressions — >=15pt drops in the last 7 days
 *   4. Onboarding activity — runs, success rate, failures-by-stage (V2.A.7)
 *
 * Env:
 *   DATABASE_URL          (mandatory)
 *   TELEGRAM_BOT_TOKEN    (optional — dry-run if missing)
 *   TELEGRAM_CHAT_ID
 *
 * Usage:
 *   ts-node weekly-report.ts                 # stdout only
 *   ts-node weekly-report.ts --notify        # also Telegram
 *   ts-node weekly-report.ts --since-days=14 # custom regression window
 */
import { execFileSync } from 'child_process';
import * as path from 'path';
import { newClient } from '../onboarding/db';

type Section = { title: string; lines: string[]; count: number };

const AUDIT_DIR = __dirname;
const NODE = process.execPath;
const TS_NODE = path.resolve(__dirname, '../../../node_modules/.bin/ts-node');

function runTsNode(script: string, args: string[] = []): string {
  try {
    const out = execFileSync(TS_NODE, [path.join(AUDIT_DIR, script), ...args], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
    return out;
  } catch (e: any) {
    const stdout = e?.stdout ?? '';
    const stderr = e?.stderr ?? '';
    return `${stdout}\n${stderr}`.trim();
  }
}

function schemaDriftSection(): Section {
  const raw = runTsNode('schema-drift-check.ts');
  const driftLineRe = /^\s*•\s+(\S+)\s+—/gm;
  const items: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = driftLineRe.exec(raw)) !== null) items.push(m[1]);
  return {
    title: 'Schema drift',
    count: items.length,
    lines: items.length === 0 ? ['✅ drift yok'] : items.map((x) => `• ${x}`),
  };
}

function extractLastJsonArray(raw: string): string | null {
  // dotenvx prints a banner with `['.env.local', '.env']` to stdout before the
  // script runs, so scan backward from the last `]` and balance-count brackets
  // until we hit the matching `[` at depth 0.
  const end = raw.lastIndexOf(']');
  if (end === -1) return null;
  let depth = 0;
  for (let i = end; i >= 0; i--) {
    const c = raw[i];
    if (c === ']') depth++;
    else if (c === '[') {
      depth--;
      if (depth === 0) return raw.slice(i, end + 1);
    }
  }
  return null;
}

function missingDataSection(): Section {
  const raw = runTsNode('find-missing-ingredient-data.ts', ['--json']);
  const json = extractLastJsonArray(raw);
  let parsed: Array<{ slug: string; problems: string[]; product_count: number }> = [];
  try {
    parsed = json ? JSON.parse(json) : [];
  } catch {
    return { title: 'Missing ingredient data', count: -1, lines: ['⚠️  JSON parse fail — manuel kontrol et'] };
  }
  if (parsed.length === 0) return { title: 'Missing ingredient data', count: 0, lines: ['✅ hepsi dolu'] };
  const top = parsed.slice(0, 8).map(
    (i) => `• ${i.slug} (${i.product_count} ürün): ${i.problems.slice(0, 2).join(', ')}${i.problems.length > 2 ? ', …' : ''}`,
  );
  if (parsed.length > 8) top.push(`… +${parsed.length - 8} daha`);
  return { title: 'Missing ingredient data', count: parsed.length, lines: top };
}

function regressionSection(sinceDays: number): Section {
  const sinceIso = new Date(Date.now() - sinceDays * 86400 * 1000).toISOString();
  const raw = runTsNode('score-regression-check.ts', [`--since=${sinceIso}`]);
  // Parse table rows: `  <id>  <score>→<newscore> (-<delta>)  ...`
  const rowRe = /^\s*(\d+)\s+(\d+)→(\d+)\s+\(-(\d+)\)/gm;
  const rows: Array<{ id: string; old: string; new: string; delta: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(raw)) !== null) {
    rows.push({ id: m[1], old: m[2], new: m[3], delta: m[4] });
  }
  if (rows.length === 0) {
    return { title: `Score regressions (${sinceDays}g)`, count: 0, lines: ['✅ düşüş yok'] };
  }
  const top = rows
    .slice(0, 8)
    .map((r) => `• #${r.id}: ${r.old}→${r.new} (-${r.delta})`);
  if (rows.length > 8) top.push(`… +${rows.length - 8} daha`);
  return { title: `Score regressions (${sinceDays}g)`, count: rows.length, lines: top };
}

async function telemetrySection(sinceDays: number): Promise<Section> {
  // Queries onboarding_log directly (populated by onboard-supplement.ts hook).
  // Kept separate from the execFileSync audits because this one talks to DB,
  // not to a subprocess — the count we surface here is *failed runs*, so a
  // clean week shows 0.
  const c = newClient();
  try {
    await c.connect();
    const { rows } = await c.query<{
      status: 'success' | 'failed' | 'dry_run';
      count: string;
    }>(
      `SELECT status, COUNT(*)::int AS count
         FROM onboarding_log
        WHERE started_at >= NOW() - ($1 || ' days')::interval
        GROUP BY status`,
      [String(sinceDays)],
    );
    const by: Record<string, number> = { success: 0, failed: 0, dry_run: 0 };
    for (const r of rows) by[r.status] = Number(r.count);
    const total = by.success + by.failed + by.dry_run;

    if (total === 0) {
      return {
        title: `Onboarding activity (${sinceDays}g)`,
        count: 0,
        lines: ['✅ çalışma yok (pipeline hiç tetiklenmedi)'],
      };
    }

    const lines = [
      `• total: ${total} (✅ ${by.success} / ❌ ${by.failed} / 👀 ${by.dry_run})`,
    ];

    if (by.failed > 0) {
      const stageRes = await c.query<{ failed_stage: string; count: string }>(
        `SELECT failed_stage, COUNT(*)::int AS count
           FROM onboarding_log
          WHERE status='failed'
            AND failed_stage IS NOT NULL
            AND started_at >= NOW() - ($1 || ' days')::interval
          GROUP BY failed_stage
          ORDER BY count DESC
          LIMIT 5`,
        [String(sinceDays)],
      );
      for (const row of stageRes.rows) {
        lines.push(`• ${row.failed_stage}: ${row.count} fail`);
      }
    }

    return {
      title: `Onboarding activity (${sinceDays}g)`,
      // count reflects *failures* — that's what the header icon reacts to.
      count: by.failed,
      lines,
    };
  } catch (e: any) {
    return {
      title: `Onboarding activity (${sinceDays}g)`,
      count: -1,
      lines: [`⚠️  onboarding_log sorgu hatası: ${e?.message ?? e}`],
    };
  } finally {
    await c.end().catch(() => undefined);
  }
}

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN/CHAT_ID yok — bildirim atlandı.');
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
  });
  if (!res.ok) {
    console.warn(`⚠️  Telegram gönderimi başarısız (${res.status}): ${(await res.text()).slice(0, 200)}`);
    return;
  }
  console.log('✅ Telegram bildirimi gönderildi.');
}

async function main(): Promise<void> {
  const notify = process.argv.includes('--notify');
  const sinceArg = process.argv.find((a) => a.startsWith('--since-days='));
  const sinceDays = sinceArg ? Number(sinceArg.split('=')[1]) : 7;

  console.log(`🗓️  Weekly catalog audit — ${new Date().toISOString().slice(0, 10)} (window: ${sinceDays}g)\n`);

  const sections = [
    schemaDriftSection(),
    missingDataSection(),
    regressionSection(sinceDays),
    await telemetrySection(sinceDays),
  ];

  for (const s of sections) {
    console.log(`── ${s.title} (${s.count}) ──`);
    for (const l of s.lines) console.log(`  ${l}`);
    console.log('');
  }

  const totalFlags = sections.reduce((a, s) => a + (s.count > 0 ? s.count : 0), 0);
  const head = totalFlags === 0
    ? `🟢 REVELA haftalık audit — temiz (${new Date().toISOString().slice(0, 10)})`
    : `🟠 REVELA haftalık audit — ${totalFlags} bulgu (${new Date().toISOString().slice(0, 10)})`;
  const body = sections
    .map((s) => `\n${s.title}: ${s.count}\n${s.lines.map((l) => `  ${l}`).join('\n')}`)
    .join('\n');
  const text = `${head}\n${body}`;

  if (notify) {
    await sendTelegram(text);
  } else {
    console.log('ℹ️  --notify verilmedi, Telegram atlandı.');
  }
}

main().catch((e) => {
  console.error(`❌ ${e?.stack ?? e?.message ?? e}`);
  process.exit(1);
});
