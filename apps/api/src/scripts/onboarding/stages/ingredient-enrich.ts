/**
 * Stage 1 — INGREDIENT_CHECK + ENRICH.
 *
 * For every ingredient queued in ctx.resolved.ingredients_to_create:
 *  - Fill elemental_ratio from KNOWN_RATIOS table if missing (chelated forms).
 *  - Fill bioavailability_score from form_type lookup if missing.
 *  - Run the per-ingredient validator (re-validation after enrichment so ERRs
 *    include the auto-filled values — single source of truth for failure).
 *
 * Existing ingredients (already in DB) are not touched.
 */
import type { PipelineContext } from '../context';
import { PipelineError } from '../context';
import { validateIngredient, formatErrors } from '../validators';
import { detectElementalRatio } from '../enrichers/elemental-detect';
import { lookupBioavailabilityScore } from '../enrichers/bioavailability-map';

export async function runIngredientEnrich(ctx: PipelineContext): Promise<void> {
  const { resolved, logger } = ctx;
  logger.section('INGREDIENT_CHECK + ENRICH');

  const all = resolved.ingredients_to_create;
  if (all.length === 0) {
    logger.ok(1, 'Yeni ingredient yok, enrichment atlandı.');
    return;
  }

  const errs: string[] = [];

  all.forEach((ing, idx) => {
    // Default domain_type to supplement if absent — this pipeline is supplement-only.
    if (!ing.domain_type) ing.domain_type = 'supplement';

    // Elemental ratio auto-fill
    const el = detectElementalRatio(ing);
    if (el.action === 'kept') {
      if (ing.elemental_ratio == null) {
        ing.elemental_ratio = el.ratio;
        logger.info(1, `[${ing.ingredient_slug}] elemental_ratio=${el.ratio} (${el.source})`);
      }
    } else if (el.action === 'missing') {
      errs.push(`[${ing.ingredient_slug}] ${el.reason}`);
    }

    // Bioavailability score auto-fill
    if (ing.bioavailability_score == null && ing.form_type) {
      const score = lookupBioavailabilityScore(ing.form_type);
      if (score != null) {
        ing.bioavailability_score = score;
        logger.info(1, `[${ing.ingredient_slug}] bioavailability_score=${score} (form_type=${ing.form_type})`);
      } else {
        ctx.resolved.warnings.push(
          `[${ing.ingredient_slug}] form_type='${ing.form_type}' mapping'te yok, bioavailability_score default (60) olacak.`,
        );
      }
    }

    // Re-validate with enrichment applied
    const ingErrs = validateIngredient(ing, idx);
    if (ingErrs.length > 0) {
      errs.push(formatErrors(ingErrs));
    }
  });

  if (errs.length > 0) {
    throw new PipelineError('Stage 1', `Ingredient validation başarısız:\n${errs.join('\n')}`);
  }

  logger.ok(1, `${all.length} ingredient enrichment tamam, hepsi validator geçti.`);
}
