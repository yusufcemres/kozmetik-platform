import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Product, SupplementDetail, SupplementIngredient, Ingredient,
  IngredientInteraction,
} from '@database/entities';

export interface SupplementScoreBreakdown {
  form_quality: number;
  dosage_adequacy: number;
  interaction_score: number;
  transparency: number;
  certification: number;
}

export interface SupplementScoreResult {
  product_id: number;
  overall_score: number;
  breakdown: SupplementScoreBreakdown;
  explanation: string[];
  calculated_at: string;
}

const DEFAULT_BIOAVAILABILITY = 50;
const INTERACTION_DELTA: Record<string, number> = {
  synergistic: 10,
  none: 0,
  mild: -5,
  moderate: -10,
  severe: -20,
  contraindicated: -30,
};
const CERT_BONUS: Record<string, number> = { GMP: 5, NSF: 5, USP: 10 };

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
  ) {}

  async calculateScore(productId: number): Promise<SupplementScoreResult> {
    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    if (product.domain_type !== 'supplement') {
      throw new BadRequestException('Ürün supplement değil');
    }

    const detail = await this.detailRepo.findOne({ where: { product_id: productId } });
    const facts = await this.suppIngRepo.find({
      where: { product_id: productId },
      relations: ['ingredient'],
    });

    const explanation: string[] = [];

    // 1. Form quality — bioavailability ağırlıklı ortalama
    const formQuality = this.calcFormQuality(facts, explanation);

    // 2. Dosage adequacy — daily_value_percentage
    const dosageAdequacy = this.calcDosageAdequacy(facts, explanation);

    // 3. Interaction score — ingredient_interactions
    const interactionScore = await this.calcInteractionScore(facts, explanation);

    // 4. Transparency — proprietary blend cezası
    const transparency = this.calcTransparency(facts, explanation);

    // 5. Certification — GMP/NSF/USP
    const certification = this.calcCertification(detail?.certification ?? null, explanation);

    // Weighted overall (form quality ve dosage en ağır)
    const overall = clamp(
      Math.round(
        formQuality * 0.35 +
        dosageAdequacy * 0.30 +
        interactionScore * 0.15 +
        transparency * 0.10 +
        certification * 0.10,
      ),
    );

    return {
      product_id: productId,
      overall_score: overall,
      breakdown: {
        form_quality: Math.round(formQuality),
        dosage_adequacy: Math.round(dosageAdequacy),
        interaction_score: Math.round(interactionScore),
        transparency: Math.round(transparency),
        certification: Math.round(certification),
      },
      explanation,
      calculated_at: new Date().toISOString(),
    };
  }

  async getTopByNutrient(ingredientSlug: string, limit = 10) {
    const ingredient = await this.ingredientRepo.findOne({
      where: { ingredient_slug: ingredientSlug },
    });
    if (!ingredient) throw new NotFoundException('İçerik bulunamadı');

    // Parent + child (formlar) ingredient id setini bul
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

    const facts = await this.suppIngRepo.find({
      where: { ingredient_id: In(relatedIds) },
    });
    const productIds = Array.from(new Set(facts.map((f) => f.product_id)));
    if (!productIds.length) return [];

    const products = await this.productRepo.find({
      where: { product_id: In(productIds), domain_type: 'supplement', status: 'published' },
      relations: ['brand', 'category', 'images'],
    });

    // Her ürün için skor hesapla
    const scored = await Promise.all(
      products.map(async (p) => ({
        product: p,
        score: await this.calculateScore(p.product_id).catch(() => null),
      })),
    );

    return scored
      .filter((x) => x.score !== null)
      .sort((a, b) => (b.score!.overall_score - a.score!.overall_score))
      .slice(0, limit)
      .map((x) => ({ ...x.product, supplement_score: x.score }));
  }

  // --- Component calculators -------------------------------------------

  private calcFormQuality(facts: SupplementIngredient[], explanation: string[]): number {
    if (!facts.length) return 50;
    const scored = facts
      .map((f) => f.ingredient?.bioavailability_score)
      .filter((s): s is number => s != null && !isNaN(Number(s)))
      .map(Number);

    if (!scored.length) {
      explanation.push('Form biyoyararlanım verisi yok — nötr puan (50).');
      return 50;
    }
    const avg = scored.reduce((a, b) => a + b, 0) / scored.length;
    explanation.push(
      `Form kalitesi: ${scored.length} içerikte ortalama biyoyararlanım ${avg.toFixed(0)}/100.`,
    );
    return avg;
  }

  private calcDosageAdequacy(facts: SupplementIngredient[], explanation: string[]): number {
    const withDv = facts.filter((f) => f.daily_value_percentage != null);
    if (!withDv.length) {
      explanation.push('Dozaj (%RDA) bilgisi yok — nötr puan (50).');
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
    explanation.push(
      `Dozaj yeterliliği: ${withDv.length} içerikte ortalama ${avg.toFixed(0)}/100 (ideal 80-150% GRD).`,
    );
    return avg;
  }

  private async calcInteractionScore(
    facts: SupplementIngredient[],
    explanation: string[],
  ): Promise<number> {
    const ingIds = facts.map((f) => f.ingredient_id).filter(Boolean);
    if (ingIds.length < 2) return 80;

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
    }
    score = clamp(score);

    if (interactions.length) {
      const synergistic = interactions.filter((i) => i.severity === 'synergistic').length;
      const negative = interactions.length - synergistic;
      explanation.push(
        `Etkileşim: ${synergistic} sinerjistik, ${negative} antagonist — skor ${score}/100.`,
      );
    } else {
      explanation.push('Etkileşim bulunamadı — baz skor 80/100.');
    }
    return score;
  }

  private calcTransparency(facts: SupplementIngredient[], explanation: string[]): number {
    const propBlends = facts.filter((f) => f.is_proprietary_blend).length;
    if (!propBlends) {
      explanation.push('Tüm içerik dozajları şeffaf.');
      return 100;
    }
    const penalty = Math.min(propBlends * 25, 80);
    explanation.push(`${propBlends} proprietary blend var — şeffaflık cezası -${penalty}.`);
    return clamp(100 - penalty);
  }

  private calcCertification(cert: string | null, explanation: string[]): number {
    if (!cert) {
      explanation.push('Sertifika bilgisi yok — nötr puan (50).');
      return 50;
    }
    const upper = cert.toUpperCase();
    let bonus = 50;
    const found: string[] = [];
    for (const [key, val] of Object.entries(CERT_BONUS)) {
      if (upper.includes(key)) {
        bonus += val * 2; // her sertifika 10-20 puan ekler
        found.push(key);
      }
    }
    bonus = clamp(bonus);
    if (found.length) {
      explanation.push(`Sertifika: ${found.join(', ')} — puan ${bonus}/100.`);
    } else {
      explanation.push('Tanınan sertifika yok — nötr puan (50).');
    }
    return bonus;
  }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}
