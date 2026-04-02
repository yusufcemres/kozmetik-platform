// IngredientStrengthScore weights
export const BASE_ORDER_SCORES: Record<string, number> = {
  'top5': 1.0,    // INCI sırası 1-5
  'mid': 0.7,     // INCI sırası 6-10
  'low': 0.4,     // INCI sırası 11+
};

export function getBaseOrderScore(rank: number): number {
  if (rank <= 5) return BASE_ORDER_SCORES.top5;
  if (rank <= 10) return BASE_ORDER_SCORES.mid;
  return BASE_ORDER_SCORES.low;
}

// Claim boost
export const CLAIM_BOOST = {
  HIGHLIGHTED: 1.1,
  NORMAL: 1.0,
};

// Concentration band weights
export const CONCENTRATION_WEIGHTS: Record<string, number> = {
  high: 1.0,
  medium: 0.8,
  low: 0.5,
  trace: 0.2,
  unknown: 0.6,
};

// ProductRankScore composite weights
export const RANK_SCORE_WEIGHTS = {
  PRODUCT_NEED_COMPATIBILITY: 0.50,
  INGREDIENT_STRENGTH_MEAN: 0.20,
  LABEL_CONSISTENCY: 0.15,
  CONTENT_COMPLETENESS: 0.15,
};

// SearchScore weights
export const SEARCH_SCORE_WEIGHTS = {
  TEXT_MATCH: 0.40,
  INTENT_MATCH: 0.25,
  RELEVANCE: 0.20,
  POPULARITY: 0.15,
};

// Sensitivity penalty multipliers (for personal score)
export const SENSITIVITY_PENALTIES: Record<string, number> = {
  fragrance: 0.6,
  alcohol: 0.7,
  paraben: 0.8,
  essential_oils: 0.75,
};
