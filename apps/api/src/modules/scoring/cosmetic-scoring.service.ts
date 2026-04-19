import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Product, ProductIngredient, Ingredient,
  IngredientInteraction, ProductScore,
} from '@database/entities';
import { CacheService } from '@common/cache/cache.service';

// ── Types ────────────────────────────────────────────────────────

export interface CosmeticExplanationItem {
  component: string;
  value: number;
  delta: number;
  reason: string;
  citation?: {
    source: string;
    url?: string;
    pmid?: string;
    doi?: string;
    opinion_ref?: string;
    year?: number;
  };
}

export interface CosmeticScoreBreakdown {
  active_efficacy: number;
  safety_class: number;
  concentration_fit: number;
  interaction_safety: number;
  allergen_load: number;
  cmr_endocrine: number;
  transparency: number;
}

export interface CosmeticScoreResult {
  product_id: number;
  algorithm_version: string;
  overall_score: number;
  grade: string;
  breakdown: CosmeticScoreBreakdown;
  explanation: CosmeticExplanationItem[];
  flags: {
    allergens: string[];
    fragrances: string[];
    harmful: string[];
    cmr: string[];
    endocrine: string[];
    eu_banned: string[];
  };
  floor_cap_applied?: string;
  calculated_at: string;
}

// ── Constants ────────────────────────────────────────────────────

const ALGO_VERSION = 'cosmetic-v1';

const WEIGHTS = {
  active_efficacy: 0.25,
  safety_class: 0.20,
  concentration_fit: 0.15,
  interaction_safety: 0.10,
  allergen_load: 0.10,
  cmr_endocrine: 0.10,
  transparency: 0.10,
};

const CIR_SCORE: Record<string, number> = {
  safe: 100, safe_as_used: 85, insufficient_data: 50, unsafe: 0,
};

const INTERACTION_DELTA: Record<string, number> = {
  synergistic: 5, none: 0, mild: -3, moderate: -8, severe: -15, contraindicated: -25,
};

function clamp(v: number): number { return Math.max(0, Math.min(100, v)); }

function gradeFromScore(score: number): string {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ── Service ──────────────────────────────────────────────────────

@Injectable()
export class CosmeticScoringService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductIngredient)
    private readonly piRepo: Repository<ProductIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    @InjectRepository(IngredientInteraction)
    private readonly interactionRepo: Repository<IngredientInteraction>,
    @InjectRepository(ProductScore)
    private readonly scoreRepo: Repository<ProductScore>,
    private readonly cache: CacheService,
  ) {}

  async calculateScore(productId: number, persist = true): Promise<CosmeticScoreResult> {
    // Cache check
    const cacheKey = `score:${productId}:${ALGO_VERSION}`;
    if (persist) {
      const cached = await this.cache.get<CosmeticScoreResult>(cacheKey);
      if (cached) return cached;
    }

    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    if (product.domain_type !== 'cosmetic') throw new BadRequestException('Ürün kozmetik değil');

    const pis = await this.piRepo.find({
      where: { product_id: productId },
      relations: ['ingredient'],
      order: { inci_order_rank: 'ASC' },
    });

    const ingredients = pis.map(pi => pi.ingredient).filter(Boolean) as Ingredient[];
    const explanation: CosmeticExplanationItem[] = [];
    const flags = {
      allergens: [] as string[], fragrances: [] as string[],
      harmful: [] as string[], cmr: [] as string[],
      endocrine: [] as string[], eu_banned: [] as string[],
    };

    // Collect flags first
    for (const ing of ingredients) {
      if (ing.allergen_flag) flags.allergens.push(ing.common_name || ing.inci_name);
      if (ing.fragrance_flag) flags.fragrances.push(ing.common_name || ing.inci_name);
      if (ing.safety_class === 'harmful') flags.harmful.push(ing.common_name || ing.inci_name);
      if (ing.cmr_class) flags.cmr.push(`${ing.common_name || ing.inci_name} (CMR ${ing.cmr_class})`);
      if (ing.endocrine_flag) flags.endocrine.push(ing.common_name || ing.inci_name);
      if (ing.eu_banned) flags.eu_banned.push(ing.common_name || ing.inci_name);
    }

    // ── 1. Active Efficacy (25%) ──────────────────────────────
    const activeEfficacy = this.calcActiveEfficacy(pis, explanation);

    // ── 2. Safety Class (20%) ─────────────────────────────────
    const safetyClass = this.calcSafetyClass(ingredients, explanation);

    // ── 3. Concentration Fit (15%) ────────────────────────────
    const concentrationFit = this.calcConcentrationFit(pis, explanation);

    // ── 4. Interaction Safety (10%) ───────────────────────────
    const interactionSafety = await this.calcInteractionSafety(ingredients, explanation);

    // ── 5. Allergen Load (10%) ────────────────────────────────
    const allergenLoad = this.calcAllergenLoad(ingredients, flags, explanation);

    // ── 6. CMR / Endocrine Risk (10%) ─────────────────────────
    const cmrEndocrine = this.calcCmrEndocrine(ingredients, explanation);

    // ── 7. Transparency & Certification (10%) ─────────────────
    const transparency = this.calcTransparency(ingredients, pis, explanation);

    // ── Weighted overall ───────────────────────────────────────
    let overall = Math.round(
      activeEfficacy * WEIGHTS.active_efficacy +
      safetyClass * WEIGHTS.safety_class +
      concentrationFit * WEIGHTS.concentration_fit +
      interactionSafety * WEIGHTS.interaction_safety +
      allergenLoad * WEIGHTS.allergen_load +
      cmrEndocrine * WEIGHTS.cmr_endocrine +
      transparency * WEIGHTS.transparency,
    );

    // ── Floor caps ─────────────────────────────────────────────
    let floorCap: string | undefined;

    if (flags.eu_banned.length > 0) {
      overall = Math.min(overall, 20);
      floorCap = 'eu_banned';
      explanation.push({
        component: 'floor_cap', value: 20, delta: 0,
        reason: `AB'de yasaklı içerik (Annex II): ${flags.eu_banned.join(', ')} — max skor 20.`,
        citation: { source: 'EU_1223_2009', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223' },
      });
    } else if (flags.cmr.some(c => c.includes('1A') || c.includes('1B'))) {
      overall = Math.min(overall, 30);
      floorCap = 'cmr_1ab';
      explanation.push({
        component: 'floor_cap', value: 30, delta: 0,
        reason: `CMR 1A/1B sınıflandırılmış içerik — max skor 30.`,
      });
    } else if (ingredients.some(i => i.iarc_group === '1')) {
      overall = Math.min(overall, 35);
      floorCap = 'iarc_1';
      explanation.push({
        component: 'floor_cap', value: 35, delta: 0,
        reason: 'IARC Grup 1 (kesin karsinojen) içerik — max skor 35.',
        citation: { source: 'IARC', url: 'https://monographs.iarc.who.int/list-of-classifications' },
      });
    } else if (flags.endocrine.length > 0) {
      overall = Math.min(overall, 55);
      floorCap = 'endocrine';
      explanation.push({
        component: 'floor_cap', value: 55, delta: 0,
        reason: `Endokrin bozucu içerik: ${flags.endocrine.join(', ')} — max skor 55.`,
        citation: { source: 'ANSES', url: 'https://www.anses.fr/en/content/endocrine-disruptors' },
      });
    }

    // Transparency cap: >50% unknown safety
    const unknownSafety = ingredients.filter(i => !i.safety_class).length;
    if (ingredients.length > 0 && unknownSafety / ingredients.length > 0.5 && !floorCap) {
      overall = Math.min(overall, 65);
      floorCap = 'transparency_cap';
      explanation.push({
        component: 'floor_cap', value: 65, delta: 0,
        reason: `>%50 içerik güvenlik sınıfı bilinmiyor (${unknownSafety}/${ingredients.length}) — max skor 65.`,
      });
    }

    overall = clamp(overall);
    const grade = gradeFromScore(overall);

    const result: CosmeticScoreResult = {
      product_id: productId,
      algorithm_version: ALGO_VERSION,
      overall_score: overall,
      grade,
      breakdown: {
        active_efficacy: Math.round(activeEfficacy),
        safety_class: Math.round(safetyClass),
        concentration_fit: Math.round(concentrationFit),
        interaction_safety: Math.round(interactionSafety),
        allergen_load: Math.round(allergenLoad),
        cmr_endocrine: Math.round(cmrEndocrine),
        transparency: Math.round(transparency),
      },
      explanation,
      flags,
      floor_cap_applied: floorCap,
      calculated_at: new Date().toISOString(),
    };

    if (persist) {
      await this.scoreRepo.upsert(
        {
          product_id: productId,
          algorithm_version: ALGO_VERSION,
          overall_score: overall,
          grade,
          breakdown: result.breakdown as any,
          explanation: result.explanation as any,
          flags: result.flags,
          floor_cap_applied: floorCap ?? null,
          computed_at: new Date(),
        },
        ['product_id', 'algorithm_version'],
      );
    }

    // Cache result
    await this.cache.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * Tüm kozmetik ürünleri için cosmetic-v1 skorunu yeniden hesaplar,
   * product_scores cache tablosuna yazar. Chunk'lı + progress log.
   */
  async recalculateAll(chunkSize = 20): Promise<{
    algorithm_version: string;
    total: number;
    succeeded: number;
    failed: number;
    duration_ms: number;
    errors: Array<{ product_id: number; error: string }>;
  }> {
    const started = Date.now();
    const products = await this.productRepo
      .createQueryBuilder('p')
      .select('p.product_id', 'product_id')
      .where('p.domain_type = :d', { d: 'cosmetic' })
      .andWhere('p.status IN (:...s)', { s: ['published', 'active'] })
      .getRawMany<{ product_id: number }>();

    const errors: Array<{ product_id: number; error: string }> = [];
    let succeeded = 0;

    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map(async (p) => {
          await this.cache.del(`score:${p.product_id}:${ALGO_VERSION}`);
          return this.calculateScore(p.product_id, true);
        }),
      );
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r.status === 'fulfilled') {
          succeeded++;
        } else {
          errors.push({
            product_id: chunk[j].product_id,
            error: (r.reason as Error)?.message ?? 'unknown',
          });
        }
      }
    }

    return {
      algorithm_version: ALGO_VERSION,
      total: products.length,
      succeeded,
      failed: errors.length,
      duration_ms: Date.now() - started,
      errors: errors.slice(0, 50),
    };
  }

  async getTopByConcern(needSlug: string, limit = 10) {
    // Get cached scores sorted by overall, filtered to cosmetic domain
    const scores = await this.scoreRepo.find({
      where: { algorithm_version: ALGO_VERSION },
      order: { overall_score: 'DESC' },
      take: limit * 3,
    });

    const productIds = scores.map(s => s.product_id);
    if (!productIds.length) return [];

    const products = await this.productRepo.find({
      where: { product_id: In(productIds), domain_type: 'cosmetic', status: 'published' },
      relations: ['brand', 'category', 'images'],
    });

    return products
      .map(p => {
        const score = scores.find(s => s.product_id === p.product_id);
        return { ...p, cosmetic_score: score };
      })
      .sort((a, b) => (b.cosmetic_score?.overall_score ?? 0) - (a.cosmetic_score?.overall_score ?? 0))
      .slice(0, limit);
  }

  // ═══ Component Calculators ═══════════════════════════════════

  private calcActiveEfficacy(pis: ProductIngredient[], explanation: CosmeticExplanationItem[]): number {
    const actives = pis.filter(pi => {
      const ing = pi.ingredient;
      if (!ing) return false;
      return ing.ingredient_group === 'active' || ing.bioavailability_score != null;
    });

    if (!actives.length) {
      explanation.push({
        component: 'active_efficacy', value: 50, delta: 0,
        reason: 'Aktif içerik tanımlanamadı — nötr puan (50).',
      });
      return 50;
    }

    let total = 0;
    for (const pi of actives) {
      const ing = pi.ingredient!;
      let base = ing.bioavailability_score ?? 60;

      // Concentration bonus if known
      if (pi.concentration_percent != null && ing.efficacy_conc_min != null) {
        const conc = Number(pi.concentration_percent);
        const min = Number(ing.efficacy_conc_min);
        const max = ing.efficacy_conc_max != null ? Number(ing.efficacy_conc_max) : min * 3;
        if (conc >= min && conc <= max) base = Math.min(100, base + 15);
        else if (conc < min) base = Math.max(30, base - 15);
      }

      // INCI order weighting (top 5 = stronger signal)
      if (pi.inci_order_rank <= 5) base = Math.min(100, base + 5);

      total += base;
    }
    const avg = total / actives.length;
    const bestIng = actives.find(pi => pi.ingredient?.evidence_citations?.length);
    const cit = bestIng?.ingredient?.evidence_citations?.[0];

    explanation.push({
      component: 'active_efficacy', value: Math.round(avg), delta: Math.round(avg - 50),
      reason: `${actives.length} aktif içerik, form kalitesi+konsantrasyon ort. ${avg.toFixed(0)}/100.`,
      citation: cit ? { source: cit.source, url: cit.url, pmid: cit.pmid, year: cit.year } : undefined,
    });
    return avg;
  }

  private calcSafetyClass(ingredients: Ingredient[], explanation: CosmeticExplanationItem[]): number {
    if (!ingredients.length) return 60;

    let total = 0;
    let withCir = 0;
    for (const ing of ingredients) {
      // CIR status
      if (ing.cir_status && CIR_SCORE[ing.cir_status] != null) {
        total += CIR_SCORE[ing.cir_status];
        withCir++;
      } else if (ing.safety_class) {
        const map: Record<string, number> = { beneficial: 90, neutral: 80, questionable: 50, harmful: 15 };
        total += map[ing.safety_class] ?? 60;
        withCir++;
      } else {
        total += 60; // unknown → nötr
      }
    }
    const avg = total / ingredients.length;
    const bestCir = ingredients.find(i => i.cir_status && i.sccs_opinion_ref);

    explanation.push({
      component: 'safety_class', value: Math.round(avg), delta: Math.round(avg - 60),
      reason: `${withCir}/${ingredients.length} içeriğin CIR/güvenlik sınıfı değerlendirildi, ort. ${avg.toFixed(0)}/100.`,
      citation: bestCir ? { source: 'CIR', opinion_ref: bestCir.sccs_opinion_ref || undefined, url: 'https://cir-safety.org/' } : undefined,
    });
    return avg;
  }

  private calcConcentrationFit(pis: ProductIngredient[], explanation: CosmeticExplanationItem[]): number {
    const withConc = pis.filter(pi =>
      pi.concentration_percent != null && pi.ingredient?.efficacy_conc_min != null,
    );

    if (!withConc.length) {
      explanation.push({
        component: 'concentration_fit', value: 60, delta: 0,
        reason: 'Konsantrasyon verisi yok — nötr puan (60).',
      });
      return 60;
    }

    let total = 0;
    for (const pi of withConc) {
      const ing = pi.ingredient!;
      const conc = Number(pi.concentration_percent);
      const min = Number(ing.efficacy_conc_min!);
      const max = ing.efficacy_conc_max != null ? Number(ing.efficacy_conc_max) : min * 3;
      const limit = ing.eu_annex_iii_limit != null ? Number(ing.eu_annex_iii_limit) : null;

      let score: number;
      if (conc >= min && conc <= max) {
        score = 100;
      } else if (conc < min) {
        score = Math.max(30, (conc / min) * 80);
      } else if (limit && conc > limit) {
        score = 20; // Over EU limit
      } else {
        score = Math.max(50, 100 - ((conc - max) / max) * 50);
      }
      total += score;
    }
    const avg = total / withConc.length;

    explanation.push({
      component: 'concentration_fit', value: Math.round(avg), delta: Math.round(avg - 60),
      reason: `${withConc.length} içerik konsantrasyon eşik değerlemesi, ort. ${avg.toFixed(0)}/100.`,
      citation: { source: 'EU_1223_2009_Annex_III', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223' },
    });
    return avg;
  }

  private async calcInteractionSafety(
    ingredients: Ingredient[],
    explanation: CosmeticExplanationItem[],
  ): Promise<number> {
    const ids = ingredients.map(i => i.ingredient_id);
    if (ids.length < 2) return 85;

    const interactions = await this.interactionRepo
      .createQueryBuilder('i')
      .where('i.is_active = true')
      .andWhere('(i.domain_type = :d OR i.domain_type = :b)', { d: 'cosmetic', b: 'both' })
      .andWhere('i.ingredient_a_id IN (:...ids)', { ids })
      .andWhere('i.ingredient_b_id IN (:...ids)', { ids })
      .getMany();

    let score = 85;
    for (const i of interactions) {
      score += INTERACTION_DELTA[i.severity] ?? 0;
    }
    score = clamp(score);

    if (interactions.length) {
      const syn = interactions.filter(i => i.severity === 'synergistic').length;
      const neg = interactions.length - syn;
      explanation.push({
        component: 'interaction_safety', value: score, delta: score - 85,
        reason: `${syn} sinerjistik, ${neg} antagonist kozmetik etkileşim — skor ${score}/100.`,
      });
    } else {
      explanation.push({
        component: 'interaction_safety', value: 85, delta: 0,
        reason: 'Bilinen kozmetik etkileşim yok — baz skor 85/100.',
      });
    }
    return score;
  }

  private calcAllergenLoad(
    ingredients: Ingredient[],
    flags: { allergens: string[]; fragrances: string[] },
    explanation: CosmeticExplanationItem[],
  ): number {
    const total = ingredients.length || 1;
    const allergenRatio = flags.allergens.length / total;
    const fragranceRatio = flags.fragrances.length / total;

    let score = 100;
    score -= flags.allergens.length * 10; // Her alerjen -10
    score -= flags.fragrances.length * 5; // Her parfüm -5
    score = clamp(score);

    const notes: string[] = [];
    if (flags.allergens.length === 0) notes.push('Alerjen içermiyor');
    else notes.push(`${flags.allergens.length} alerjen (-${flags.allergens.length * 10})`);
    if (flags.fragrances.length === 0) notes.push('parfümsüz');
    else notes.push(`${flags.fragrances.length} parfüm (-${flags.fragrances.length * 5})`);

    explanation.push({
      component: 'allergen_load', value: score, delta: score - 100,
      reason: notes.join(', ') + ` — skor ${score}/100.`,
      citation: { source: 'EU_1223_2009_Annex_III', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223' },
    });
    return score;
  }

  private calcCmrEndocrine(ingredients: Ingredient[], explanation: CosmeticExplanationItem[]): number {
    let score = 100;

    const cmrIngredients = ingredients.filter(i => i.cmr_class);
    const endocrineIngredients = ingredients.filter(i => i.endocrine_flag);
    const iarcIngredients = ingredients.filter(i => i.iarc_group && i.iarc_group !== '4');

    for (const ing of cmrIngredients) {
      if (ing.cmr_class === '1A' || ing.cmr_class === '1B') score -= 50;
      else if (ing.cmr_class === '2') score -= 25;
    }
    for (const ing of endocrineIngredients) {
      score -= 20;
    }
    for (const ing of iarcIngredients) {
      if (ing.iarc_group === '1') score -= 40;
      else if (ing.iarc_group === '2A') score -= 25;
      else if (ing.iarc_group === '2B') score -= 15;
    }
    score = clamp(score);

    if (score === 100) {
      explanation.push({
        component: 'cmr_endocrine', value: 100, delta: 0,
        reason: 'CMR/endokrin bozucu/IARC karsinojen içerik tespit edilmedi.',
      });
    } else {
      const notes: string[] = [];
      if (cmrIngredients.length) notes.push(`${cmrIngredients.length} CMR`);
      if (endocrineIngredients.length) notes.push(`${endocrineIngredients.length} endokrin bozucu`);
      if (iarcIngredients.length) notes.push(`${iarcIngredients.length} IARC karsinojen`);
      explanation.push({
        component: 'cmr_endocrine', value: score, delta: score - 100,
        reason: `Risk tespiti: ${notes.join(', ')} — skor ${score}/100.`,
        citation: { source: 'IARC', url: 'https://monographs.iarc.who.int/list-of-classifications' },
      });
    }
    return score;
  }

  private calcTransparency(
    ingredients: Ingredient[],
    pis: ProductIngredient[],
    explanation: CosmeticExplanationItem[],
  ): number {
    if (!ingredients.length) return 50;

    let score = 60;

    // Evidence coverage bonus
    const withEvidence = ingredients.filter(i => i.evidence_grade || i.evidence_level).length;
    const evidenceRatio = withEvidence / ingredients.length;
    score += evidenceRatio * 20; // Max +20 for full coverage

    // INCI completeness (all matched)
    const matched = pis.filter(pi => pi.match_status === 'auto' || pi.match_status === 'manual').length;
    const matchRatio = matched / (pis.length || 1);
    score += matchRatio * 10; // Max +10

    // Safety class coverage
    const withSafety = ingredients.filter(i => i.safety_class).length;
    const safetyRatio = withSafety / ingredients.length;
    score += safetyRatio * 10; // Max +10

    score = clamp(score);

    explanation.push({
      component: 'transparency', value: Math.round(score), delta: Math.round(score - 60),
      reason: `Kanıt kaplama %${(evidenceRatio * 100).toFixed(0)}, INCI eşleşme %${(matchRatio * 100).toFixed(0)}, güvenlik verisi %${(safetyRatio * 100).toFixed(0)}.`,
    });
    return score;
  }
}
