/**
 * Bioavailability score lookup by form_type.
 *
 * Re-uses the same scores seeded by seed-bioavailability.js — kept in a single
 * lookup so Stage 1 can fill bioavailability_score when the payload only
 * specifies form_type (e.g. 'bisglisinat').
 *
 * If a form is not in the map, return null + warn caller. Scorer treats null
 * as the configured default (currently 60).
 */

const FORM_TO_SCORE: Record<string, number> = {
  // Magnesium
  'bisglisinat': 80,
  'glisinat': 78,
  'sitrat': 55, // averaged across Mg=30, Zn=60 use cases; caller should override
  'malat': 50,
  'treonat': 75,
  'oksit': 10,
  'sulfat': 20,
  // Zinc
  'pikolinat': 70,
  'glukonat': 50,
  // Iron
  'fumarat': 40,
  // Collagen
  'hidrolize_tip_I_III': 85,
  'tip_II': 70,
  // B12
  'metilkobalamin': 80,
  'siyanokobalamin': 50,
  'hidroksokobalamin': 70,
  'adenozilkobalamin': 75,
  // Vitamin D
  'cholecalciferol': 90,
  'ergocalciferol': 65,
  'D3': 90,
  'D2': 65,
  // Vitamin E
  'd-alpha-tocopherol': 90,
  'dl-alpha-tocopherol': 55,
  // Other common
  'chelate': 75,
  'pure': 85,
  'methylated': 85,
};

export function lookupBioavailabilityScore(formType: string | null | undefined): number | null {
  if (!formType) return null;
  return FORM_TO_SCORE[formType] ?? null;
}

export const _test = { FORM_TO_SCORE };
