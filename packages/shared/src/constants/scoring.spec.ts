import {
  getBaseOrderScore,
  BASE_ORDER_SCORES,
  CLAIM_BOOST,
  CONCENTRATION_WEIGHTS,
  RANK_SCORE_WEIGHTS,
  SENSITIVITY_PENALTIES,
} from './scoring';

describe('Scoring Constants', () => {
  describe('getBaseOrderScore', () => {
    it('should return top5 score for ranks 1-5', () => {
      for (let rank = 1; rank <= 5; rank++) {
        expect(getBaseOrderScore(rank)).toBe(1.0);
      }
    });

    it('should return mid score for ranks 6-10', () => {
      for (let rank = 6; rank <= 10; rank++) {
        expect(getBaseOrderScore(rank)).toBe(0.7);
      }
    });

    it('should return low score for ranks 11+', () => {
      expect(getBaseOrderScore(11)).toBe(0.4);
      expect(getBaseOrderScore(25)).toBe(0.4);
      expect(getBaseOrderScore(100)).toBe(0.4);
    });
  });

  describe('CLAIM_BOOST', () => {
    it('should have highlighted > normal', () => {
      expect(CLAIM_BOOST.HIGHLIGHTED).toBeGreaterThan(CLAIM_BOOST.NORMAL);
    });

    it('should have NORMAL = 1.0 (no boost)', () => {
      expect(CLAIM_BOOST.NORMAL).toBe(1.0);
    });
  });

  describe('CONCENTRATION_WEIGHTS', () => {
    it('should decrease from high to trace', () => {
      expect(CONCENTRATION_WEIGHTS.high).toBeGreaterThan(CONCENTRATION_WEIGHTS.medium);
      expect(CONCENTRATION_WEIGHTS.medium).toBeGreaterThan(CONCENTRATION_WEIGHTS.low);
      expect(CONCENTRATION_WEIGHTS.low).toBeGreaterThan(CONCENTRATION_WEIGHTS.trace);
    });

    it('should have unknown between low and medium', () => {
      expect(CONCENTRATION_WEIGHTS.unknown).toBeGreaterThan(CONCENTRATION_WEIGHTS.low);
      expect(CONCENTRATION_WEIGHTS.unknown).toBeLessThanOrEqual(CONCENTRATION_WEIGHTS.medium);
    });
  });

  describe('RANK_SCORE_WEIGHTS', () => {
    it('should sum to 1.0', () => {
      const sum = Object.values(RANK_SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0);
    });

    it('should have need compatibility as highest weight', () => {
      const max = Math.max(...Object.values(RANK_SCORE_WEIGHTS));
      expect(RANK_SCORE_WEIGHTS.PRODUCT_NEED_COMPATIBILITY).toBe(max);
    });
  });

  describe('SENSITIVITY_PENALTIES', () => {
    it('should all be between 0 and 1', () => {
      for (const [key, value] of Object.entries(SENSITIVITY_PENALTIES)) {
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('fragrance should be the highest penalty (lowest multiplier)', () => {
      expect(SENSITIVITY_PENALTIES.fragrance).toBeLessThanOrEqual(
        SENSITIVITY_PENALTIES.alcohol,
      );
    });
  });

  describe('IngredientStrengthScore formula validation', () => {
    it('should compute correctly: BaseOrder × ClaimBoost × ConcentrationWeight', () => {
      // Top5 ingredient, highlighted, high concentration
      const score1 = getBaseOrderScore(1) * CLAIM_BOOST.HIGHLIGHTED * CONCENTRATION_WEIGHTS.high;
      expect(score1).toBeCloseTo(1.1);

      // Low ingredient, normal, trace concentration
      const score2 = getBaseOrderScore(15) * CLAIM_BOOST.NORMAL * CONCENTRATION_WEIGHTS.trace;
      expect(score2).toBeCloseTo(0.08);

      // Mid ingredient, normal, unknown concentration
      const score3 = getBaseOrderScore(8) * CLAIM_BOOST.NORMAL * CONCENTRATION_WEIGHTS.unknown;
      expect(score3).toBeCloseTo(0.42);
    });
  });
});
