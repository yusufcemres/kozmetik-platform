/**
 * Elemental ratio enrichment.
 *
 * Background: chelated/compound mineral forms (magnesium-bisglycinate etc.)
 * carry non-mineral weight. Scoring compares serving_dose × elemental_ratio
 * vs UL/effective_dose which are elemental (NIH ODS norm). Without the ratio
 * we get false-positive UL_EXCEEDED floor caps (Mg D=50 bug, 2026-04-19).
 *
 * Strategy:
 *  1. If payload already has elemental_ratio → trust it.
 *  2. Look up ingredient_slug in hardcoded KNOWN_RATIOS table (5 pre-seeded).
 *  3. If slug ends with a chelated token but isn't in the table → ERR. User
 *     must add a PubChem MW-derived ratio to KNOWN_RATIOS or to the payload.
 *  4. Pure ingredient (no chelated token) → leave NULL (scorer treats as 1.0).
 */

const CHELATED_FORM_RE = /(bisglycinate|gluconate|picolinate|citrate|malate|carbonate|oxide|ascorbate|orotate|fumarate|sulfate|chloride|aspartate|lactate)/i;

// Seeded via migration 021 + seed-elemental-ratios.js on 2026-04-19.
// Any new chelated form must be added here (or in the payload JSON).
const KNOWN_RATIOS: Record<string, number> = {
  'magnesium-bisglycinate': 0.1083,
  'magnesium-citrate': 0.1617,
  'iron-bisglycinate': 0.2133,
  'zinc-picolinate': 0.2112,
  'zinc-gluconate': 0.1435,
};

export type ElementalDetectResult =
  | { action: 'kept'; ratio: number; source: 'payload' | 'known-table' }
  | { action: 'none'; reason: string }
  | { action: 'missing'; reason: string };

export function detectElementalRatio(ingredient: {
  ingredient_slug: string;
  inci_name: string;
  elemental_ratio?: number | null;
}): ElementalDetectResult {
  if (ingredient.elemental_ratio != null && !Number.isNaN(Number(ingredient.elemental_ratio))) {
    return { action: 'kept', ratio: Number(ingredient.elemental_ratio), source: 'payload' };
  }
  const known = KNOWN_RATIOS[ingredient.ingredient_slug];
  if (known != null) {
    return { action: 'kept', ratio: known, source: 'known-table' };
  }
  const hay = `${ingredient.inci_name ?? ''} ${ingredient.ingredient_slug ?? ''}`;
  if (CHELATED_FORM_RE.test(hay)) {
    return {
      action: 'missing',
      reason: `Chelated/compound form tespit edildi (regex match) ama KNOWN_RATIOS tablosunda yok. PubChem'den molecular_weight çek, ratio = atomic_weight/MW formülüyle hesapla ve payload'a 'elemental_ratio' olarak ekle (veya enrichers/elemental-detect.ts KNOWN_RATIOS listesine kalıcı ekle).`,
    };
  }
  return { action: 'none', reason: 'Saf ingredient — ratio gerekmez (scorer 1.0 kabul eder).' };
}

export const _test = { KNOWN_RATIOS, CHELATED_FORM_RE };
