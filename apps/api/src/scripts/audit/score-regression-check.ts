/**
 * Score regression detector.
 *
 * Compares the two most recent `product_scores` rows per product. If the
 * newer row's overall_score dropped by >= threshold (default 15) vs the
 * older one, it's flagged as a regression.
 *
 * Catches silent breakage after seed batches / migrations — e.g. the
 * Mg D(50) UL_EXCEEDED false-positive that silently pulled multiple mag
 * products to grade D until we noticed manually.
 *
 * Usage:
 *   ts-node score-regression-check.ts              # all products, threshold=15
 *   ts-node score-regression-check.ts --product=123
 *   ts-node score-regression-check.ts --threshold=10
 *   ts-node score-regression-check.ts --since=2026-04-01T00:00:00Z
 *   ts-node score-regression-check.ts --notify-telegram
 *
 * Exit:
 *   0 — no regressions (or successfully reported)
 *   1 — DB error
 *   2 — regressions detected AND --fail-on-regression passed
 *
 * Env:
 *   DATABASE_URL          (zorunlu)
 *   TELEGRAM_BOT_TOKEN    (opsiyonel, --notify-telegram için)
 *   TELEGRAM_CHAT_ID
 */
import { newClient } from '../onboarding/db';

type Args = {
  productId?: number;
  threshold: number;
  since?: string;
  notifyTelegram: boolean;
  failOnRegression: boolean;
};

type Regression = {
  product_id: number;
  product_name: string;
  product_slug: string;
  old_score: number;
  new_score: number;
  delta: number;
  old_grade: string;
  new_grade: string;
  old_at: string;
  new_at: string;
  floor_cap: string | null;
};

function parseArgs(argv: string[]): Args {
  const get = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
  return {
    productId: get('product') ? Number(get('product')) : undefined,
    threshold: get('threshold') ? Number(get('threshold')) : 15,
    since: get('since'),
    notifyTelegram: argv.includes('--notify-telegram'),
    failOnRegression: argv.includes('--fail-on-regression'),
  };
}

async function findRegressions(client: any, args: Args): Promise<Regression[]> {
  // For each product, pick two most recent product_scores rows.
  // LATERAL subquery keeps it a single round-trip.
  const sql = `
    WITH ranked AS (
      SELECT
        s.product_id,
        s.overall_score,
        s.grade,
        s.floor_cap_applied,
        s.computed_at,
        ROW_NUMBER() OVER (PARTITION BY s.product_id ORDER BY s.computed_at DESC) AS rn
      FROM product_scores s
      WHERE ($1::int IS NULL OR s.product_id = $1)
        AND ($2::timestamptz IS NULL OR s.computed_at >= $2)
    )
    SELECT
      p.product_id,
      p.product_name,
      p.product_slug,
      n.overall_score AS new_score,
      n.grade         AS new_grade,
      n.floor_cap_applied AS floor_cap,
      n.computed_at   AS new_at,
      o.overall_score AS old_score,
      o.grade         AS old_grade,
      o.computed_at   AS old_at
    FROM ranked n
    JOIN ranked o ON n.product_id = o.product_id
    JOIN products p ON p.product_id = n.product_id
    WHERE n.rn = 1 AND o.rn = 2
      AND (o.overall_score - n.overall_score) >= $3
    ORDER BY (o.overall_score - n.overall_score) DESC;
  `;
  const res = await client.query(sql, [
    args.productId ?? null,
    args.since ?? null,
    args.threshold,
  ]);
  return res.rows.map((r: any) => ({
    product_id: r.product_id,
    product_name: r.product_name,
    product_slug: r.product_slug,
    old_score: r.old_score,
    new_score: r.new_score,
    delta: r.old_score - r.new_score,
    old_grade: r.old_grade,
    new_grade: r.new_grade,
    old_at: new Date(r.old_at).toISOString(),
    new_at: new Date(r.new_at).toISOString(),
    floor_cap: r.floor_cap,
  }));
}

function formatTable(regs: Regression[]): string {
  if (regs.length === 0) return '  (none)';
  const lines: string[] = [];
  lines.push(`  ${'ID'.padEnd(6)} ${'Score'.padEnd(16)} ${'Grade'.padEnd(9)} ${'Floor'.padEnd(14)} Name`);
  lines.push(`  ${'-'.repeat(60)}`);
  for (const r of regs) {
    const scoreCol = `${r.old_score}→${r.new_score} (-${r.delta})`.padEnd(16);
    const gradeCol = `${r.old_grade}→${r.new_grade}`.padEnd(9);
    const floorCol = (r.floor_cap ?? '—').padEnd(14);
    lines.push(`  ${String(r.product_id).padEnd(6)} ${scoreCol} ${gradeCol} ${floorCol} ${r.product_name}`);
  }
  return lines.join('\n');
}

async function notifyTelegram(regs: Regression[]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN/CHAT_ID yok — Telegram bildirimi atlandı.');
    return;
  }
  const head = `🚨 *Score regression* — ${regs.length} ürün skoru düştü`;
  const body = regs
    .slice(0, 10)
    .map((r) => `• #${r.product_id} ${r.product_name}: ${r.old_score}→${r.new_score} (\\-${r.delta}) ${r.floor_cap ? `[${r.floor_cap}]` : ''}`)
    .join('\n');
  const more = regs.length > 10 ? `\n…ve ${regs.length - 10} diğer` : '';
  const text = `${head}\n\n${body}${more}`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: 'MarkdownV2' }),
  });
  if (!res.ok) {
    console.warn(`⚠️  Telegram gönderimi başarısız (${res.status}): ${(await res.text()).slice(0, 160)}`);
    return;
  }
  console.log(`✅ Telegram bildirimi gönderildi (${regs.length} ürün).`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  console.log(`🔎 Score regression check — threshold=${args.threshold}${args.productId ? ` product=${args.productId}` : ''}${args.since ? ` since=${args.since}` : ''}\n`);

  const client = newClient();
  await client.connect();
  let regs: Regression[] = [];
  try {
    regs = await findRegressions(client, args);
  } finally {
    await client.end().catch(() => undefined);
  }

  if (regs.length === 0) {
    console.log('✅ Regresyon yok.');
    return;
  }

  console.log(`⚠️  ${regs.length} ürün skoru düştü:\n`);
  console.log(formatTable(regs));

  if (args.notifyTelegram) {
    await notifyTelegram(regs);
  }

  if (args.failOnRegression) {
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(`❌ ${e?.stack ?? e?.message ?? e}`);
  process.exit(1);
});
