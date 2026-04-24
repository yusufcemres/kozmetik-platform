/**
 * Morning report generator — reads ingest logs + DB + verify results → single MD file.
 *
 * Usage:
 *   ./run-prod.sh src/scripts/night-shift/supplement-ingest-report.ts
 *
 * Output:
 *   - night-shift/logs/supplement-sprint/MORNING_REPORT_SUPPLEMENT_INGEST_<DATE>.md
 *   - kozmetik-platform/MORNING_REPORT_SUPPLEMENT_INGEST_<DATE>.md (top-level copy)
 *   - tg-message.txt (plaintext body for Telegram send)
 */
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../../..');
const LOG_DIR = path.join(ROOT, 'night-shift/logs/supplement-sprint');

async function main() {
  const since = process.argv.slice(2).find((a) => a.startsWith('--since='))?.split('=').slice(1).join('=')
    || '2026-04-23 18:00';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // Pre-shift baseline
  const baseline = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM products WHERE domain_type='supplement' AND created_at < $1`,
    [since],
  );

  // Inserted supplements
  const inserted = await client.query(
    `SELECT p.product_id, p.product_name, p.status, b.brand_slug, b.brand_name,
            ps.overall_score AS score, ps.grade,
            (SELECT COUNT(*) FROM product_images pim WHERE pim.product_id=p.product_id)::int AS img_count,
            (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id=p.product_id)::int AS ing_count
     FROM products p JOIN brands b ON b.brand_id=p.brand_id
     LEFT JOIN product_scores ps ON ps.product_id=p.product_id
     WHERE p.domain_type='supplement' AND p.created_at >= $1
     ORDER BY p.created_at`,
    [since],
  );

  const total = inserted.rowCount ?? 0;
  const active = inserted.rows.filter((r) => r.status === 'published').length;
  const drafts = total - active;

  // Score buckets
  const buckets: Record<string, number> = { '80-100': 0, '60-79': 0, '50-59': 0, '40-49': 0, '<40': 0, 'null': 0 };
  let scoreSum = 0;
  let scoreN = 0;
  for (const r of inserted.rows) {
    const s = r.score != null ? Number(r.score) : null;
    if (s == null) buckets['null']++;
    else if (s >= 80) buckets['80-100']++;
    else if (s >= 60) buckets['60-79']++;
    else if (s >= 50) buckets['50-59']++;
    else if (s >= 40) buckets['40-49']++;
    else buckets['<40']++;
    if (s != null) {
      scoreSum += s;
      scoreN++;
    }
  }
  const avg = scoreN > 0 ? (scoreSum / scoreN).toFixed(1) : 'n/a';

  // Brand breakdown
  const byBrand: Record<string, { total: number; active: number; avg: number }> = {};
  for (const r of inserted.rows) {
    const b = r.brand_slug;
    if (!byBrand[b]) byBrand[b] = { total: 0, active: 0, avg: 0 };
    byBrand[b].total++;
    if (r.status === 'published') byBrand[b].active++;
    if (r.score != null) byBrand[b].avg += Number(r.score);
  }
  for (const b of Object.keys(byBrand)) {
    if (byBrand[b].total > 0) byBrand[b].avg = Math.round(byBrand[b].avg / byBrand[b].total);
  }

  // Read ingest + verify summaries
  const ingestSummaryPath = path.join(LOG_DIR, 'ingest-summary.json');
  const verifyReportPath = path.join(LOG_DIR, 'verify-report.json');
  const onboardLogPath = path.join(LOG_DIR, 'onboard-summary.json');
  const ingestSummary = fs.existsSync(ingestSummaryPath)
    ? JSON.parse(fs.readFileSync(ingestSummaryPath, 'utf8'))
    : null;
  const verifyReport = fs.existsSync(verifyReportPath)
    ? JSON.parse(fs.readFileSync(verifyReportPath, 'utf8'))
    : null;
  const onboardSummary = fs.existsSync(onboardLogPath)
    ? JSON.parse(fs.readFileSync(onboardLogPath, 'utf8'))
    : null;

  const topScored = [...inserted.rows]
    .filter((r) => r.score != null)
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 10);

  const lowScored = [...inserted.rows]
    .filter((r) => r.score != null && Number(r.score) < 60)
    .sort((a, b) => Number(a.score) - Number(b.score))
    .slice(0, 10);

  const md: string[] = [];
  md.push(`# MORNING REPORT — REVELA Supplement Ingest Sprint`);
  md.push(`**Tarih:** ${new Date().toISOString().slice(0, 10)}`);
  md.push(`**Vardiya başlangıcı:** ${since}`);
  md.push(``);
  md.push(`## Özet`);
  md.push(``);
  md.push(`| Metrik | Değer |`);
  md.push(`|---|---|`);
  md.push(`| Başlangıç takviye sayısı | ${baseline.rows[0].cnt} |`);
  md.push(`| Sprint sonu eklenen (aktif) | **${active}** |`);
  md.push(`| Draft / pasif | ${drafts} |`);
  md.push(`| Toplam eklenen | ${total} |`);
  md.push(`| Ortalama skor | ${avg} |`);
  if (ingestSummary) {
    md.push(`| Claude-gen ready | ${ingestSummary.ready ?? '—'} |`);
    md.push(`| Claude-gen rejected | ${ingestSummary.rejected ?? '—'} |`);
    md.push(`| Duplicate skip | ${ingestSummary.duplicate ?? '—'} |`);
  }
  if (onboardSummary) {
    md.push(`| Onboard success | ${onboardSummary.success ?? '—'} |`);
    md.push(`| Onboard fail | ${onboardSummary.fail ?? '—'} |`);
  }
  md.push(``);

  md.push(`## Skor dağılımı`);
  md.push(``);
  md.push(`| Bucket | Sayı |`);
  md.push(`|---|---|`);
  for (const [k, v] of Object.entries(buckets)) md.push(`| ${k} | ${v} |`);
  md.push(``);

  md.push(`## Marka kırılımı`);
  md.push(``);
  md.push(`| Marka | Toplam | Aktif | Ort skor |`);
  md.push(`|---|---|---|---|`);
  for (const [b, v] of Object.entries(byBrand)) {
    md.push(`| ${b} | ${v.total} | ${v.active} | ${v.avg || '—'} |`);
  }
  md.push(``);

  if (topScored.length > 0) {
    md.push(`## En yüksek skorlu 10`);
    md.push(``);
    for (const r of topScored) {
      md.push(`- **${Number(r.score).toFixed(0)}** — ${r.brand_slug}: ${r.product_name} (${r.grade || '?'})`);
    }
    md.push(``);
  }

  if (lowScored.length > 0) {
    md.push(`## Gözden geçirilmesi gereken (<60)`);
    md.push(``);
    for (const r of lowScored) {
      md.push(`- **${Number(r.score).toFixed(0)}** — ${r.brand_slug}: ${r.product_name}`);
    }
    md.push(``);
  }

  if (verifyReport && verifyReport.issue_list && verifyReport.issue_list.length > 0) {
    md.push(`## ⚠️ Verify eksikleri`);
    md.push(``);
    for (const i of verifyReport.issue_list) {
      md.push(`- ${i.brand}: ${i.product_name} — \`${i.issue}\``);
    }
    md.push(``);
  }

  md.push(`## Sabah manual check — 5 dk`);
  md.push(``);
  md.push(`1. Rastgele 5 aktif ürünü Vercel preview'da aç (görsel + ingredient tablosu + skor)`);
  md.push(`2. Düşük skor listesinde manual inceleme gerekenleri işaretle`);
  md.push(`3. Verify eksikleri listesindekiler otomatik deactive — DB'de kalıyor, frontend'de yok`);
  md.push(`4. Sonraki sprint öncesi prompt tuning gerekiyorsa feedback memory'ye ekle`);
  md.push(``);
  md.push(`---`);
  md.push(`_Generated ${new Date().toISOString()}_`);

  const reportMd = md.join('\n');
  const outPath1 = path.join(LOG_DIR, `MORNING_REPORT_SUPPLEMENT_INGEST_${date}.md`);
  const outPath2 = path.join(ROOT, `MORNING_REPORT_SUPPLEMENT_INGEST_${date}.md`);
  fs.writeFileSync(outPath1, reportMd);
  fs.writeFileSync(outPath2, reportMd);

  // TG plain message
  const tgBody = [
    `🌅 REVELA Supplement Sprint — ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `✅ Aktif: ${active}`,
    `📝 Draft: ${drafts}`,
    `📊 Ortalama skor: ${avg}`,
    ``,
    `Marka:`,
    ...Object.entries(byBrand).map(([b, v]) => `  ${b}: ${v.total} (${v.active} aktif, skor ${v.avg})`),
    ``,
    `Skor:`,
    ...Object.entries(buckets).map(([k, v]) => `  ${k}: ${v}`),
    ``,
    ingestSummary
      ? `Claude: ${ingestSummary.ready} ready, ${ingestSummary.rejected} rej, ${ingestSummary.duplicate} dup`
      : '',
    onboardSummary ? `Onboard: ${onboardSummary.success} OK, ${onboardSummary.fail} fail` : '',
    verifyReport ? `Verify: ${verifyReport.issues} eksik` : '',
    ``,
    `Rapor: MORNING_REPORT_SUPPLEMENT_INGEST_${date}.md`,
  ]
    .filter(Boolean)
    .join('\n');
  fs.writeFileSync(path.join(LOG_DIR, 'tg-message.txt'), tgBody);

  console.log(`[report] Written: ${outPath1}`);
  console.log(`[report] TG message: ${path.join(LOG_DIR, 'tg-message.txt')}`);
  await client.end();
}
main().catch((e) => {
  console.error('[report] FATAL', e);
  process.exit(1);
});
