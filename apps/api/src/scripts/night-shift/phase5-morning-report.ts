/**
 * Night Shift — Phase 5: Morning Report Generator
 *
 * Reads phase1-4 summary JSONs + MD snippets, assembles consolidated
 * MORNING_REPORT_REVELA_YYYYMMDD.md in AGENTS root.
 *
 * Does NOT send TG itself — orchestrator handles 07:00 scheduling.
 */
import * as fs from 'fs';
import * as path from 'path';

function readJson(p: string): any {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function readFile(p: string): string {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function main() {
  const args = process.argv.slice(2);
  const reportDirArg = args.find((a) => a.startsWith('--report-dir='));
  const outArg = args.find((a) => a.startsWith('--out='));
  const dateStr = new Date().toISOString().slice(0, 10);

  const reportDir =
    reportDirArg?.split('=')[1] ||
    path.resolve(process.cwd(), '../../night-shift-reports', dateStr);

  const dateCompact = dateStr.replace(/-/g, '');
  const outPath =
    outArg?.split('=')[1] ||
    path.resolve(
      'c:/Users/Yusuf Cemre/OneDrive/Desktop/AGENTS',
      `MORNING_REPORT_REVELA_${dateCompact}.md`,
    );

  const p1 = readJson(path.join(reportDir, 'phase1_summary.json'));
  const p2 = readJson(path.join(reportDir, 'phase2_summary.json'));
  const p3 = readJson(path.join(reportDir, 'phase3_summary.json'));
  const p4 = readJson(path.join(reportDir, 'phase4_summary.json'));

  let md = `# Revela Gece Vardiyası — Sabah Raporu ${dateStr}\n\n`;
  md += `**Rapor dizini:** \`${reportDir}\`\n`;
  md += `**Çalıştı:** ${new Date().toISOString()}\n\n`;
  md += `---\n\n`;

  md += `## Özet\n\n`;
  md += `| Faz | Durum | Ana Metrik |\n|---|---|---|\n`;
  md += `| 1 · Affiliate audit | ${p1 ? '✅' : '⚠️ yok'} | ${
    p1 ? `cohort=${p1.cohort_size ?? '?'}, checked=${p1.checked ?? '?'}, dead=${p1.flagged_dead ?? '?'}, recovered=${p1.recovered ?? '?'}` : '—'
  } |\n`;
  md += `| 2 · Image health | ${p2 ? '✅' : '⚠️ yok'} | ${
    p2 ? `checked=${p2.checked ?? '?'}, broken=${p2.broken_count ?? '?'}, upgraded=${p2.url_upgrade_applied ?? '?'}` : '—'
  } |\n`;
  md += `| 3 · Price intel | ${p3 ? '✅' : '⚠️ yok'} | ${
    p3 ? `drift=${p3.drift_events ?? 0}, dead_brand_count=${p3.brands_with_dead_links ?? 0}` : '—'
  } |\n`;
  md += `| 4 · Data quality | ${p4 ? '✅' : '⚠️ yok'} | ${
    p4
      ? `dup=${p4.duplicate_candidates ?? 0}, missing_inci=${p4.missing_inci_cosmetic ?? 0}, orphan_ing=${p4.orphan_ingredients ?? 0}`
      : '—'
  } |\n\n`;

  md += `---\n\n## 1 · Affiliate Audit\n\n`;
  if (p1) {
    md += `- Cohort (failing link sayısı): **${p1.cohort_size ?? 0}**\n`;
    md += `- Re-check edilen: **${p1.checked ?? 0}**\n`;
    md += `- Dead flag: **${p1.flagged_dead ?? 0}** (verification_status='dead' olarak işaretlendi)\n`;
    md += `- Kurtarılan: **${p1.recovered ?? 0}**\n`;
    md += `- Hâlâ failing: **${p1.still_failing ?? 0}**\n`;
    md += `- Süre: ${p1.duration_s ?? '?'} s\n\n`;
    const deadMd = readFile(path.join(reportDir, 'dead_link_analysis.md'));
    if (deadMd) md += `\n<details><summary>Dead link detay</summary>\n\n${deadMd}\n\n</details>\n\n`;
    const covMd = readFile(path.join(reportDir, 'merchant_coverage.md'));
    if (covMd) md += `\n<details><summary>Merchant coverage</summary>\n\n${covMd}\n\n</details>\n\n`;
  } else {
    md += `_Faz 1 özeti bulunamadı._\n\n`;
  }

  md += `---\n\n## 2 · Image Health\n\n`;
  if (p2) {
    md += `- Kontrol edilen görsel: **${p2.checked ?? 0}** / ${p2.cohort_total ?? '?'}\n`;
    md += `- Bozuk (broken_404/403/5xx/timeout): **${p2.broken_count ?? 0}**\n`;
    md += `- Tiny (boyut bayrak): **${p2.tiny_count ?? 0}**\n`;
    md += `- URL upgrade aday / uygulanan: **${p2.url_upgrade_candidates ?? 0}** / **${p2.url_upgrade_applied ?? 0}**\n`;
    md += `- Süre: ${p2.duration_s ?? '?'} s\n\n`;
    if (p2.outcome_counts) {
      md += `**Outcome breakdown:**\n\n`;
      for (const [k, v] of Object.entries(p2.outcome_counts)) md += `- ${k}: ${v}\n`;
      md += `\n`;
    }
  } else {
    md += `_Faz 2 özeti bulunamadı._\n\n`;
  }

  md += `---\n\n## 3 · Price Intelligence\n\n`;
  const priceMd = readFile(path.join(reportDir, 'price_intelligence.md'));
  if (priceMd) {
    md += priceMd.split('\n').slice(2).join('\n');
    md += `\n\n`;
  } else {
    md += `_Faz 3 raporu bulunamadı._\n\n`;
  }

  md += `---\n\n## 4 · Data Quality\n\n`;
  const dqMd = readFile(path.join(reportDir, 'data_quality.md'));
  if (dqMd) {
    md += dqMd.split('\n').slice(2).join('\n');
    md += `\n\n`;
  } else {
    md += `_Faz 4 raporu bulunamadı._\n\n`;
  }

  md += `---\n\n## Aksiyon Önerileri\n\n`;
  const actions: string[] = [];
  if (p1?.flagged_dead > 0) actions.push(`${p1.flagged_dead} ölü link işaretlendi — frontend'de filtrelenmeli`);
  if (p1?.still_failing > 0) actions.push(`${p1.still_failing} link hâlâ failing — provider/selector kontrol`);
  if (p2?.broken_count > 0) actions.push(`${p2.broken_count} bozuk görsel tespit edildi — fallback/yeniden scrape gerekli`);
  if (p2?.tiny_count > 0) actions.push(`${p2.tiny_count} düşük kaliteli görsel (tiny) — upgrade dalgasında bir sonraki gece yeniden dene`);
  if (p3?.drift_events > 0) actions.push(`${p3.drift_events} fiyat driftli ürün — anormal fiyatlama kontrolü`);
  if (p4?.duplicate_candidates > 0) actions.push(`${p4.duplicate_candidates} duplicate aday — manuel merge kararı`);
  if (p4?.missing_inci_cosmetic > 0) actions.push(`${p4.missing_inci_cosmetic} kozmetik ürün INCI'siz — enrichment kuyruğu`);
  if (actions.length === 0) actions.push('Kritik aksiyon yok. Baseline sağlıklı.');
  for (const a of actions) md += `- ${a}\n`;
  md += `\n`;

  md += `---\n\n_Trigger: "Revela için gece vardiyasına başla" · Spec: knowledge/brands/revela/NIGHT_SHIFT_ROUTINE.md_\n`;

  fs.writeFileSync(outPath, md);
  console.log(`[phase5] wrote ${outPath}`);

  // state snapshot
  const stateDir = path.resolve(reportDir, '..', 'state');
  fs.mkdirSync(stateDir, { recursive: true });
  const state = {
    last_run: new Date().toISOString(),
    last_report_dir: reportDir,
    last_morning_report: outPath,
    phase1: p1,
    phase2: p2
      ? { total_checked: p2.total_checked, broken: p2.broken, upgraded: p2.upgraded }
      : null,
    phase3: p3 ? { drift_events: p3.drift_events } : null,
    phase4: p4,
  };
  fs.writeFileSync(
    path.join(stateDir, 'revela-night-state.json'),
    JSON.stringify(state, null, 2),
  );
  console.log(`[phase5] state snapshot updated`);
}

main();
