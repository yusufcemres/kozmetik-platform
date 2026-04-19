/**
 * Stage 2.5 — DRY-RUN DIFF PREVIEW.
 *
 * Renders what the pipeline is about to write to the DB. Honors:
 *  - --dry-run  : render + exit (no prompt)
 *  - --yes      : render + continue (no prompt)
 *  - default    : render + y/N prompt
 *
 * Returns true if the orchestrator should proceed to Stage 3.
 */
import type { PipelineContext } from '../context';
import { slugify } from '../slug';
import * as readline from 'readline';

function writePad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function renderIngredientSummary(ctx: PipelineContext): string[] {
  const lines: string[] = [];
  if (ctx.resolved.ingredients_to_create.length === 0) return lines;
  lines.push(`  + ingredients        : CREATE ${ctx.resolved.ingredients_to_create.length}`);
  for (const ing of ctx.resolved.ingredients_to_create) {
    const doseStr = ing.effective_dose_unit
      ? `${ing.effective_dose_min}-${ing.effective_dose_max}${ing.effective_dose_unit}`
      : '—';
    const elem = ing.elemental_ratio != null ? ` elemental=${ing.elemental_ratio}` : '';
    const bioav = ing.bioavailability_score != null ? ` bioav=${ing.bioavailability_score}` : '';
    lines.push(
      `       - ${writePad(ing.ingredient_slug, 32)} grade=${ing.evidence_grade} dose=${doseStr}${elem}${bioav}`,
    );
  }
  return lines;
}

function renderPlan(ctx: PipelineContext): void {
  const { doc, resolved, plan } = ctx;
  const productSlug = slugify(doc.product.product_name);
  resolved.product_slug = productSlug;

  const lines: string[] = [];
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  PIPELINE PLAN (Stage 3 bu değişiklikleri tek transactionda yazacak)');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`  Ürün: ${doc.product.product_name}`);
  lines.push(`  Slug: ${productSlug}`);
  lines.push(`  Brand: ${doc.product.brand_slug} (${plan.create_brand ? 'YENİ' : `id=${resolved.brand_id}`})`);
  lines.push(`  Category: ${doc.product.category_slug} (${plan.create_category ? 'YENİ' : `id=${resolved.category_id}`})`);
  lines.push('');
  lines.push('  Yazılacak satırlar:');
  if (plan.create_brand) lines.push(plan.summary_lines.find((l) => l.includes('brands')) ?? '');
  if (plan.create_category) lines.push(plan.summary_lines.find((l) => l.includes('categories')) ?? '');
  lines.push(`  + products           : 1 satır (status='draft')`);
  lines.push(`  + supplement_details : 1 satır (form=${doc.product.supplement_detail.form})`);
  lines.push(`  + supplement_ingred. : ${doc.product.ingredients.length} satır (ilk 3 is_highlighted=true)`);
  lines.push(`  + affiliate_links    : 1 satır (${resolved.affiliate_verification_status})`);
  lines.push(`  + product_images     : ${resolved.image_url ? '1 satır' : '0 (image_url yok)'}`);
  lines.push(...renderIngredientSummary(ctx));

  if (resolved.alias_translations.length > 0) {
    lines.push('');
    lines.push('  Alias çevirileri:');
    for (const a of resolved.alias_translations) lines.push(`    ${a.input} → ${a.canonical}`);
  }

  if (resolved.warnings.length + resolved.affiliate_warnings.length > 0) {
    lines.push('');
    lines.push('  ⚠️  Uyarılar:');
    [...resolved.warnings, ...resolved.affiliate_warnings].forEach((w) => lines.push(`    - ${w}`));
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  console.log(lines.join('\n'));
}

function promptYesNo(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (ans) => {
      rl.close();
      resolve(/^y(es)?$/i.test(ans.trim()));
    });
  });
}

export async function runDiffPreview(ctx: PipelineContext): Promise<boolean> {
  ctx.logger.section('DRY-RUN DIFF PREVIEW');
  renderPlan(ctx);

  if (ctx.flags.dryRun) {
    ctx.logger.info('2.5', "DRY-RUN modu: DB'ye yazılmayacak, çıkılıyor.");
    return false;
  }
  if (ctx.flags.yes) {
    ctx.logger.ok('2.5', '--yes flag aktif, onay atlandı.');
    return true;
  }
  // Interactive onay
  const ok = await promptYesNo('Devam edilsin mi? (y/N) ');
  if (!ok) ctx.logger.warn('2.5', 'Kullanıcı onaylamadı.');
  return ok;
}
