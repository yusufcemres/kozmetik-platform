/**
 * Stage 2.5 (cosmetic) — DRY-RUN DIFF PREVIEW.
 *
 * Parallel to diff-preview.ts (supplement). Renders the cosmetic-specific
 * plan: inci_order_rank list + concentration_percent where declared +
 * CIR/CMR flags on newly-created ingredients.
 */
import type { CosmeticPipelineContext } from '../context-cosmetic';
import { slugify } from '../slug';
import * as readline from 'readline';

function writePad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function renderIngredientSummary(ctx: CosmeticPipelineContext): string[] {
  const lines: string[] = [];
  if (ctx.resolved.ingredients_to_create.length === 0) return lines;
  lines.push(`  + ingredients        : CREATE ${ctx.resolved.ingredients_to_create.length}`);
  for (const ing of ctx.resolved.ingredients_to_create) {
    const conc =
      ing.efficacy_conc_min != null && ing.efficacy_conc_max != null
        ? ` conc=${ing.efficacy_conc_min}-${ing.efficacy_conc_max}%`
        : '';
    const cir = ing.cir_status ? ` cir=${ing.cir_status}` : '';
    const cmr = ing.cmr_class && ing.cmr_class !== 'none' ? ` cmr=${ing.cmr_class}` : '';
    lines.push(
      `       - ${writePad(ing.ingredient_slug, 32)} group=${ing.ingredient_group ?? '—'}${conc}${cir}${cmr}`,
    );
  }
  return lines;
}

function renderPlan(ctx: CosmeticPipelineContext): void {
  const { doc, resolved, plan } = ctx;
  const productSlug = slugify(doc.product.product_name);
  resolved.product_slug = productSlug;

  const lines: string[] = [];
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  COSMETIC PIPELINE PLAN (Stage 3 bu değişiklikleri tek tx yazacak)');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`  Ürün: ${doc.product.product_name}`);
  lines.push(`  Slug: ${productSlug}`);
  lines.push(`  Brand: ${doc.product.brand_slug} (${plan.create_brand ? 'YENİ' : `id=${resolved.brand_id}`})`);
  lines.push(`  Category: ${doc.product.category_slug} (${plan.create_category ? 'YENİ' : `id=${resolved.category_id}`})`);
  lines.push(`  Type: ${doc.product.product_type_label ?? '—'}  Area: ${doc.product.target_area ?? '—'}`);
  lines.push('');
  lines.push('  Yazılacak satırlar:');
  if (plan.create_brand) lines.push(plan.summary_lines.find((l) => l.includes('brands')) ?? '');
  if (plan.create_category) lines.push(plan.summary_lines.find((l) => l.includes('categories')) ?? '');
  lines.push(`  + products           : 1 satır (domain_type='cosmetic', status='draft')`);
  lines.push(`  + product_ingred.    : ${doc.product.ingredients.length} satır (inci_order_rank 1..N)`);
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

export async function runCosmeticDiffPreview(ctx: CosmeticPipelineContext): Promise<boolean> {
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
  const ok = await promptYesNo('Devam edilsin mi? (y/N) ');
  if (!ok) ctx.logger.warn('2.5', 'Kullanıcı onaylamadı.');
  return ok;
}
