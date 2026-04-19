import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Product, SupplementDetail, SupplementIngredient, Ingredient,
  IngredientInteraction, ProductScore,
} from '@database/entities';
import { CacheService } from '@common/cache/cache.service';

// ── Types ────────────────────────────────────────────────────────

export interface ExplanationItem {
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

export interface SupplementScoreBreakdown {
  form_quality: number;
  dose_efficacy: number;
  evidence_grade: number;
  third_party_testing: number;
  interaction_safety: number;
  transparency_and_tier: number;
}

export interface SupplementScoreResult {
  product_id: number;
  algorithm_version: string;
  overall_score: number;
  grade: string;
  breakdown: SupplementScoreBreakdown;
  explanation: ExplanationItem[];
  flags: { proprietary_blends: string[]; ul_exceeded: string[]; harmful_interactions: string[] };
  floor_cap_applied?: string;
  calculated_at: string;
}

// ── Constants ────────────────────────────────────────────────────

const ALGO_VERSION = 'supplement-v2';

const WEIGHTS = {
  form_quality: 0.25,
  dose_efficacy: 0.25,
  evidence_grade: 0.15,
  third_party_testing: 0.15,
  interaction_safety: 0.10,
  transparency_and_tier: 0.10,
};

const EVIDENCE_SCORE: Record<string, number> = { A: 100, B: 80, C: 60, D: 40, E: 20 };
const INTERACTION_DELTA: Record<string, number> = {
  synergistic: 8, none: 0, mild: -5, moderate: -12, severe: -20, contraindicated: -30,
};
const CERT_BONUS: Record<string, number> = {
  USP_VERIFIED: 25, NSF_CERTIFIED: 20, NSF_SPORT: 20,
  CONSUMERLAB_PASS: 15, LABDOOR_A: 15, INFORMED_SPORT: 10,
  GMP: 5, PHARMA_GRADE: 5,
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
export class SupplementScoringService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(SupplementDetail)
    private readonly detailRepo: Repository<SupplementDetail>,
    @InjectRepository(SupplementIngredient)
    private readonly suppIngRepo: Repository<SupplementIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    @InjectRepository(IngredientInteraction)
    private readonly interactionRepo: Repository<IngredientInteraction>,
    @InjectRepository(ProductScore)
    private readonly scoreRepo: Repository<ProductScore>,
    private readonly cache: CacheService,
  ) {}

  async calculateScore(productId: number, persist = true): Promise<SupplementScoreResult> {
    // Cache check (skip on forced recalculate = persist+force)
    const cacheKey = `score:${productId}:${ALGO_VERSION}`;
    if (persist) {
      const cached = await this.cache.get<SupplementScoreResult>(cacheKey);
      if (cached) return cached;
    }

    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    if (product.domain_type !== 'supplement') throw new BadRequestException('Ürün supplement değil');

    const detail = await this.detailRepo.findOne({ where: { product_id: productId } });
    const facts = await this.suppIngRepo.find({
      where: { product_id: productId },
      relations: ['ingredient'],
    });

    const explanation: ExplanationItem[] = [];
    const flags = { proprietary_blends: [] as string[], ul_exceeded: [] as string[], harmful_interactions: [] as string[] };

    // ── 1. Form Quality (25%) ──────────────────────────────────
    const formQuality = this.calcFormQuality(facts, explanation);

    // ── 2. Dose Efficacy (25%) ─────────────────────────────────
    const doseEfficacy = this.calcDoseEfficacy(facts, explanation, flags);

    // ── 3. Evidence Grade (15%) ────────────────────────────────
    const evidenceGrade = this.calcEvidenceGrade(facts, explanation);

    // ── 4. Third-Party Testing (15%) ───────────────────────────
    const thirdPartyTesting = this.calcThirdPartyTesting(detail, explanation);

    // ── 5. Interaction Safety (10%) ────────────────────────────
    const interactionSafety = await this.calcInteractionSafety(facts, explanation, flags);

    // ── 6. Transparency + Manufacturing Tier (10%) ─────────────
    const transparencyAndTier = this.calcTransparencyAndTier(facts, detail, explanation);

    // ── Weighted overall ───────────────────────────────────────
    let overall = Math.round(
      formQuality * WEIGHTS.form_quality +
      doseEfficacy * WEIGHTS.dose_efficacy +
      evidenceGrade * WEIGHTS.evidence_grade +
      thirdPartyTesting * WEIGHTS.third_party_testing +
      interactionSafety * WEIGHTS.interaction_safety +
      transparencyAndTier * WEIGHTS.transparency_and_tier,
    );

    // ── Floor caps ─────────────────────────────────────────────
    let floorCap: string | undefined;

    if (flags.ul_exceeded.length > 0) {
      overall = Math.min(overall, 50);
      floorCap = 'ul_exceeded';
      explanation.push({
        component: 'floor_cap', value: 50, delta: 0,
        reason: `Tolerable Upper Intake Level aşıldı (${flags.ul_exceeded.join(', ')}) — max skor 50.`,
        citation: { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/HealthInformation/Dietary-Reference-Intakes.aspx' },
      });
    }
    if (flags.harmful_interactions.length >= 2 && !floorCap) {
      overall = Math.min(overall, 45);
      floorCap = 'harmful_interactions';
      explanation.push({
        component: 'floor_cap', value: 45, delta: 0,
        reason: `≥2 zararlı etkileşim — max skor 45.`,
      });
    }
    if (evidenceGrade <= 20 && !floorCap) {
      overall = Math.min(overall, 55);
      floorCap = 'evidence_only_e';
      explanation.push({
        component: 'floor_cap', value: 55, delta: 0,
        reason: 'Tüm içerikler sadece uzman görüşü seviyesinde (E) — max skor 55.',
      });
    }

    overall = clamp(overall);
    const grade = gradeFromScore(overall);

    const result: SupplementScoreResult = {
      product_id: productId,
      algorithm_version: ALGO_VERSION,
      overall_score: overall,
      grade,
      breakdown: {
        form_quality: Math.round(formQuality),
        dose_efficacy: Math.round(doseEfficacy),
        evidence_grade: Math.round(evidenceGrade),
        third_party_testing: Math.round(thirdPartyTesting),
        interaction_safety: Math.round(interactionSafety),
        transparency_and_tier: Math.round(transparencyAndTier),
      },
      explanation,
      flags,
      floor_cap_applied: floorCap,
      calculated_at: new Date().toISOString(),
    };

    // Persist to product_scores (upsert)
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
   * Tüm supplement ürünleri için evidence-based skorları yeniden hesaplar
   * ve product_scores cache tablosuna yazar. Chunk'lı ilerler, progress log'lar.
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
      .where('p.domain_type = :d', { d: 'supplement' })
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

  async getTopByNutrient(ingredientSlug: string, limit = 10) {
    const ingredient = await this.ingredientRepo.findOne({
      where: { ingredient_slug: ingredientSlug },
    });
    if (!ingredient) throw new NotFoundException('İçerik bulunamadı');

    const relatedIds = [ingredient.ingredient_id];
    if (ingredient.parent_ingredient_id == null) {
      const children = await this.ingredientRepo.find({
        where: { parent_ingredient_id: ingredient.ingredient_id },
        select: ['ingredient_id'],
      });
      relatedIds.push(...children.map((c) => c.ingredient_id));
    } else {
      relatedIds.push(ingredient.parent_ingredient_id);
    }

    const facts = await this.suppIngRepo.find({ where: { ingredient_id: In(relatedIds) } });
    const productIds = Array.from(new Set(facts.map((f) => f.product_id)));
    if (!productIds.length) return [];

    const products = await this.productRepo.find({
      where: { product_id: In(productIds), domain_type: 'supplement', status: 'published' },
      relations: ['brand', 'category', 'images'],
    });

    const scored = await Promise.all(
      products.map(async (p) => ({
        product: p,
        score: await this.calculateScore(p.product_id, false).catch(() => null),
      })),
    );

    return scored
      .filter((x) => x.score !== null)
      .sort((a, b) => (b.score!.overall_score - a.score!.overall_score))
      .slice(0, limit)
      .map((x) => ({ ...x.product, supplement_score: x.score }));
  }

  // ═══ Component Calculators ═══════════════════════════════════

  private calcFormQuality(facts: SupplementIngredient[], explanation: ExplanationItem[]): number {
    if (!facts.length) return 50;
    const scored = facts
      .map((f) => f.ingredient?.bioavailability_score)
      .filter((s): s is number => s != null && !isNaN(Number(s)))
      .map(Number);

    if (!scored.length) {
      explanation.push({
        component: 'form_quality', value: 50, delta: 0,
        reason: 'Form biyoyararlanım verisi yok — nötr puan (50).',
      });
      return 50;
    }
    const avg = scored.reduce((a, b) => a + b, 0) / scored.length;

    // Find best citation from ingredients
    const bestIng = facts.find(f => f.ingredient?.evidence_citations?.length);
    const citation = bestIng?.ingredient?.evidence_citations?.[0];

    explanation.push({
      component: 'form_quality', value: Math.round(avg), delta: Math.round(avg - 50),
      reason: `${scored.length} içerikte ortalama biyoyararlanım ${avg.toFixed(0)}/100.`,
      citation: citation ? { source: citation.source, url: citation.url, pmid: citation.pmid } : undefined,
    });
    return avg;
  }

  private calcDoseEfficacy(
    facts: SupplementIngredient[],
    explanation: ExplanationItem[],
    flags: { ul_exceeded: string[] },
  ): number {
    // Try evidence-based dose range first
    const withEvidence = facts.filter(f =>
      f.ingredient?.effective_dose_min != null && f.ingredient?.effective_dose_max != null,
    );

    if (withEvidence.length > 0) {
      let total = 0;
      for (const f of withEvidence) {
        const ing = f.ingredient!;
        const ratio = ing.elemental_ratio != null ? Number(ing.elemental_ratio) : 1;
        const servingDose = Number(f.amount_per_serving ?? 0) * ratio;
        const doseMin = Number(ing.effective_dose_min!);
        const doseMax = Number(ing.effective_dose_max!);
        const ulDose = ing.ul_dose != null ? Number(ing.ul_dose) : null;

        let score: number;
        if (servingDose >= doseMin && servingDose <= doseMax) {
          score = 100; // Within meta-analytic range
        } else if (servingDose < doseMin) {
          score = Math.max(20, (servingDose / doseMin) * 80);
        } else if (servingDose > doseMax && (!ulDose || servingDose <= ulDose)) {
          score = Math.max(60, 100 - ((servingDose - doseMax) / doseMax) * 40);
        } else {
          score = 30; // Over UL
        }

        // Check UL (on elemental-equivalent dose)
        if (ulDose && servingDose > ulDose) {
          flags.ul_exceeded.push(ing.common_name || ing.inci_name);
        }

        total += score;
      }
      const avg = total / withEvidence.length;
      const bestIng = withEvidence.find(f => f.ingredient?.evidence_citations?.length);
      const cit = bestIng?.ingredient?.evidence_citations?.[0];

      explanation.push({
        component: 'dose_efficacy', value: Math.round(avg), delta: Math.round(avg - 50),
        reason: `${withEvidence.length} içerikte meta-analitik doz aralığına göre değerlendirildi (ort. ${avg.toFixed(0)}/100).`,
        citation: cit ? { source: cit.source, url: cit.url, pmid: cit.pmid, year: cit.year } : { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/HealthInformation/Dietary-Reference-Intakes.aspx' },
      });
      return avg;
    }

    // Fallback: use daily_value_percentage
    const withDv = facts.filter((f) => f.daily_value_percentage != null);
    if (!withDv.length) {
      explanation.push({
        component: 'dose_efficacy', value: 50, delta: 0,
        reason: 'Dozaj bilgisi yok — nötr puan (50).',
      });
      return 50;
    }
    let total = 0;
    for (const f of withDv) {
      const dv = Number(f.daily_value_percentage);
      let score: number;
      if (dv >= 80 && dv <= 150) score = 100;
      else if (dv >= 50 && dv < 80) score = 70 + ((dv - 50) * 30) / 30;
      else if (dv > 150 && dv <= 250) score = 100 - ((dv - 150) * 30) / 100;
      else if (dv < 50) score = (dv / 50) * 60;
      else score = Math.max(0, 70 - (dv - 250) / 10);
      total += score;
    }
    const avg = total / withDv.length;
    explanation.push({
      component: 'dose_efficacy', value: Math.round(avg), delta: Math.round(avg - 50),
      reason: `${withDv.length} içerikte GRD yeterliliği ort. ${avg.toFixed(0)}/100 (ideal 80-150%).`,
      citation: { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/HealthInformation/Dietary-Reference-Intakes.aspx' },
    });
    return avg;
  }

  private calcEvidenceGrade(facts: SupplementIngredient[], explanation: ExplanationItem[]): number {
    const grades = facts
      .map(f => f.ingredient?.evidence_grade)
      .filter((g): g is string => g != null && EVIDENCE_SCORE[g] != null);

    if (!grades.length) {
      explanation.push({
        component: 'evidence_grade', value: 50, delta: 0,
        reason: 'Kanıt seviyesi bilgisi yok — nötr puan (50).',
      });
      return 50;
    }

    const avg = grades.reduce((sum, g) => sum + EVIDENCE_SCORE[g], 0) / grades.length;
    const topGrade = grades.sort((a, b) => EVIDENCE_SCORE[b] - EVIDENCE_SCORE[a])[0];
    const bestIng = facts.find(f => f.ingredient?.evidence_grade === topGrade);
    const cit = bestIng?.ingredient?.evidence_citations?.[0];

    explanation.push({
      component: 'evidence_grade', value: Math.round(avg), delta: Math.round(avg - 50),
      reason: `${grades.length} içeriğin kanıt seviyesi ortalaması ${avg.toFixed(0)}/100 (en yüksek: ${topGrade}).`,
      citation: cit ? { source: cit.source, url: cit.url, pmid: cit.pmid, year: cit.year } : undefined,
    });
    return avg;
  }

  private calcThirdPartyTesting(detail: SupplementDetail | null, explanation: ExplanationItem[]): number {
    if (!detail?.certification) {
      explanation.push({
        component: 'third_party_testing', value: 40, delta: -10,
        reason: 'Bağımsız test sertifikası yok — baz puan (40).',
      });
      return 40;
    }

    const upper = detail.certification.toUpperCase();
    let bonus = 40;
    const found: string[] = [];
    for (const [key, val] of Object.entries(CERT_BONUS)) {
      if (upper.includes(key.replace('_', ' ')) || upper.includes(key)) {
        bonus += val;
        found.push(key);
      }
    }
    bonus = clamp(bonus);

    if (found.length) {
      explanation.push({
        component: 'third_party_testing', value: bonus, delta: bonus - 40,
        reason: `Sertifikalar: ${found.join(', ')} — toplam puan ${bonus}/100.`,
        citation: found.includes('USP_VERIFIED')
          ? { source: 'USP', url: 'https://www.usp.org/verification-services' }
          : found.includes('NSF_CERTIFIED')
            ? { source: 'NSF', url: 'https://www.nsf.org/consumer-resources/articles/supplement-certification' }
            : undefined,
      });
    } else {
      explanation.push({
        component: 'third_party_testing', value: 40, delta: -10,
        reason: 'Tanınan sertifika bulunamadı — baz puan (40).',
      });
    }
    return bonus;
  }

  private async calcInteractionSafety(
    facts: SupplementIngredient[],
    explanation: ExplanationItem[],
    flags: { harmful_interactions: string[] },
  ): Promise<number> {
    const ingIds = facts.map((f) => f.ingredient_id).filter(Boolean);
    if (ingIds.length < 2) {
      explanation.push({
        component: 'interaction_safety', value: 80, delta: 0,
        reason: 'Tek içerik — etkileşim riski yok.',
      });
      return 80;
    }

    const interactions = await this.interactionRepo
      .createQueryBuilder('i')
      .where('i.is_active = true')
      .andWhere('(i.domain_type = :d OR i.domain_type = :b)', { d: 'supplement', b: 'both' })
      .andWhere('i.ingredient_a_id IN (:...ids)', { ids: ingIds })
      .andWhere('i.ingredient_b_id IN (:...ids)', { ids: ingIds })
      .getMany();

    let score = 80;
    for (const i of interactions) {
      const delta = INTERACTION_DELTA[i.severity] ?? 0;
      score += delta;
      if (delta <= -20) {
        flags.harmful_interactions.push(`${i.ingredient_a_id}↔${i.ingredient_b_id}: ${i.severity}`);
      }
    }
    score = clamp(score);

    if (interactions.length) {
      const synergistic = interactions.filter((i) => i.severity === 'synergistic').length;
      const negative = interactions.length - synergistic;
      const cit = interactions.find(i => i.citation_url);

      explanation.push({
        component: 'interaction_safety', value: score, delta: score - 80,
        reason: `${synergistic} sinerjistik, ${negative} antagonist etkileşim — skor ${score}/100.`,
        citation: cit ? { source: cit.citation_source || 'PubMed', url: cit.citation_url || undefined } : undefined,
      });
    } else {
      explanation.push({
        component: 'interaction_safety', value: 80, delta: 0,
        reason: 'Bilinen etkileşim bulunamadı — baz skor 80/100.',
      });
    }
    return score;
  }

  private calcTransparencyAndTier(
    facts: SupplementIngredient[],
    detail: SupplementDetail | null,
    explanation: ExplanationItem[],
  ): number {
    let score = 80;
    const notes: string[] = [];

    // Proprietary blend penalty
    const propBlends = facts.filter((f) => f.is_proprietary_blend);
    if (propBlends.length > 0) {
      const penalty = Math.min(propBlends.length * 20, 60);
      score -= penalty;
      notes.push(`${propBlends.length} proprietary blend (-${penalty})`);
    }

    // TiO2 penalty (EFSA banned in food 2022)
    const hasTiO2 = facts.some(f => {
      const name = (f.ingredient?.inci_name || '').toLowerCase();
      return name.includes('titanium dioxide') || name.includes('e171');
    });
    if (hasTiO2) {
      score -= 10;
      notes.push('Titanium dioxide (-10)');
    }

    // Artificial color penalty
    const hasArtColor = facts.some(f => {
      const name = (f.ingredient?.inci_name || '').toLowerCase();
      return /fd&c|red \d|yellow \d|blue \d|e1\d{2}/.test(name);
    });
    if (hasArtColor) {
      score -= 5;
      notes.push('Yapay boya (-5)');
    }

    // Manufacturing tier bonus
    const cert = (detail?.certification || '').toUpperCase();
    if (cert.includes('PHARMA') || cert.includes('PHARMACEUTICAL')) {
      score += 5;
      notes.push('Pharmaceutical grade (+5)');
    } else if (cert.includes('CGMP') || cert.includes('GMP')) {
      score += 3;
      notes.push('cGMP (+3)');
    }

    score = clamp(score);
    explanation.push({
      component: 'transparency_and_tier', value: score, delta: score - 80,
      reason: notes.length ? notes.join(', ') + '.' : 'Şeffaf formülasyon, nötr üretim tier.',
      citation: hasTiO2
        ? { source: 'EFSA', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/6585', year: 2021 }
        : undefined,
    });
    return score;
  }
}
