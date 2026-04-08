import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Product, ProductIngredient, ProductNeedScore,
  IngredientNeedMapping, ScoringConfig, UserSkinProfile,
} from '@database/entities';
import {
  getBaseOrderScore, CLAIM_BOOST, CONCENTRATION_WEIGHTS,
  RANK_SCORE_WEIGHTS, SENSITIVITY_PENALTIES,
} from 'shared';

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductIngredient)
    private readonly piRepo: Repository<ProductIngredient>,
    @InjectRepository(ProductNeedScore)
    private readonly scoreRepo: Repository<ProductNeedScore>,
    @InjectRepository(IngredientNeedMapping)
    private readonly mappingRepo: Repository<IngredientNeedMapping>,
    @InjectRepository(ScoringConfig)
    private readonly configRepo: Repository<ScoringConfig>,
    @InjectRepository(UserSkinProfile)
    private readonly profileRepo: Repository<UserSkinProfile>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Calculate all need scores for a product
   */
  async calculateScores(productId: number) {
    const product = await this.productRepo.findOne({
      where: { product_id: productId },
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');

    // Get product ingredients with their order and properties
    const productIngredients = await this.piRepo.find({
      where: { product_id: productId },
      order: { inci_order_rank: 'ASC' },
    });

    if (!productIngredients.length) {
      return { product_id: productId, scores: [], message: 'Ürünün ingredient listesi yok' };
    }

    // Get all mappings for these ingredients
    const ingredientIds = productIngredients
      .filter((pi) => pi.ingredient_id)
      .map((pi) => pi.ingredient_id);

    if (!ingredientIds.length) {
      return { product_id: productId, scores: [], message: 'Eşleşmiş ingredient yok' };
    }

    const mappings = await this.mappingRepo
      .createQueryBuilder('m')
      .where('m.ingredient_id IN (:...ids)', { ids: ingredientIds })
      .getMany();

    // Group mappings by need_id
    const needMap = new Map<number, typeof mappings>();
    for (const m of mappings) {
      const arr = needMap.get(m.need_id) || [];
      arr.push(m);
      needMap.set(m.need_id, arr);
    }

    // Calculate score for each need
    const scores: Array<{
      need_id: number;
      compatibility_score: number;
      explanation_logic: any;
      confidence_level: string;
    }> = [];

    for (const [needId, needMappings] of needMap) {
      let totalScore = 0;
      let maxPossible = 0;
      const explanations: any[] = [];

      for (const mapping of needMappings) {
        const pi = productIngredients.find(
          (p) => p.ingredient_id === mapping.ingredient_id,
        );
        if (!pi) continue;

        // IngredientStrengthScore = BaseOrderScore × ClaimBoost × ConcentrationBandWeight
        const baseOrder = getBaseOrderScore(pi.inci_order_rank);
        const claimBoost = pi.is_highlighted_in_claims
          ? CLAIM_BOOST.HIGHLIGHTED
          : CLAIM_BOOST.NORMAL;
        const concWeight = CONCENTRATION_WEIGHTS[pi.concentration_band] || CONCENTRATION_WEIGHTS.unknown;
        const strengthScore = baseOrder * claimBoost * concWeight;

        // Contribution = relevance × strength
        const contribution = (mapping.relevance_score / 100) * strengthScore;

        if (mapping.effect_type === 'negative' || mapping.effect_type === 'caution_related') {
          totalScore -= contribution * 0.5;
        } else {
          totalScore += contribution;
        }
        maxPossible += strengthScore;

        explanations.push({
          ingredient_id: mapping.ingredient_id,
          relevance: mapping.relevance_score,
          strength: Math.round(strengthScore * 100) / 100,
          contribution: Math.round(contribution * 100) / 100,
          effect_type: mapping.effect_type,
        });
      }

      // Normalize to 0-100
      const normalizedScore = maxPossible > 0
        ? Math.min(100, Math.max(0, (totalScore / maxPossible) * 100))
        : 0;

      const matchedCount = needMappings.filter((m) =>
        productIngredients.some((pi) => pi.ingredient_id === m.ingredient_id),
      ).length;

      scores.push({
        need_id: needId,
        compatibility_score: Math.round(normalizedScore * 100) / 100,
        explanation_logic: { ingredients: explanations, matched_count: matchedCount },
        confidence_level: matchedCount >= 3 ? 'high' : matchedCount >= 1 ? 'medium' : 'low',
      });
    }

    // Save scores
    await this.scoreRepo.delete({ product_id: productId });
    const entities = scores.map((s) =>
      this.scoreRepo.create({
        product_id: productId,
        ...s,
        calculated_at: new Date(),
      }),
    );
    await this.scoreRepo.save(entities);

    return { product_id: productId, scores };
  }

  /**
   * Calculate personal compatibility score based on user skin profile
   */
  async getPersonalScore(productId: number, profileId: string) {
    const profile = await this.profileRepo.findOne({
      where: { anonymous_id: profileId },
    });
    if (!profile) throw new NotFoundException('Profil bulunamadı');

    // Get existing need scores for this product
    const needScores = await this.scoreRepo.find({
      where: { product_id: productId },
    });

    if (!needScores.length) {
      // Auto-calculate if not yet done
      await this.calculateScores(productId);
      const freshScores = await this.scoreRepo.find({
        where: { product_id: productId },
      });
      needScores.push(...freshScores);
    }

    // Filter to user's concerns (need_ids)
    const userNeeds: number[] = (profile.concerns as any) || [];
    const relevantScores = userNeeds.length > 0
      ? needScores.filter((s) => userNeeds.includes(s.need_id))
      : needScores;

    // Average compatibility for user's needs
    const avgCompatibility = relevantScores.length > 0
      ? relevantScores.reduce((sum, s) => sum + Number(s.compatibility_score), 0) / relevantScores.length
      : 0;

    // Apply sensitivity penalties
    let sensitivityMultiplier = 1.0;
    const warnings: string[] = [];
    const sensitivities: Record<string, boolean> = (profile.sensitivities as any) || {};

    // Check product ingredients for sensitivity triggers
    const productIngredients = await this.piRepo.find({
      where: { product_id: productId },
      relations: ['ingredient'],
    });

    if (sensitivities.fragrance) {
      const hasFragrance = productIngredients.some(
        (pi) => pi.ingredient?.fragrance_flag,
      );
      if (hasFragrance) {
        sensitivityMultiplier *= SENSITIVITY_PENALTIES.fragrance;
        warnings.push('Parfüm hassasiyetin var, bu ürün parfüm içeriyor');
      }
    }

    if (sensitivities.alcohol) {
      const hasAlcohol = productIngredients.some((pi) =>
        pi.ingredient_display_name.toLowerCase().includes('alcohol denat'),
      );
      if (hasAlcohol) {
        sensitivityMultiplier *= SENSITIVITY_PENALTIES.alcohol;
        warnings.push('Alkol hassasiyetin var, bu ürün alkol içeriyor');
      }
    }

    if (sensitivities.paraben) {
      const hasParaben = productIngredients.some(
        (pi) => pi.ingredient?.preservative_flag,
      );
      if (hasParaben) {
        sensitivityMultiplier *= SENSITIVITY_PENALTIES.paraben;
        warnings.push('Paraben hassasiyetin var, bu ürün koruyucu içeriyor');
      }
    }

    if (sensitivities.essential_oils) {
      const hasEO = productIngredients.some((pi) =>
        pi.ingredient_display_name.toLowerCase().includes('oil')
        && pi.ingredient?.allergen_flag,
      );
      if (hasEO) {
        sensitivityMultiplier *= SENSITIVITY_PENALTIES.essential_oils;
        warnings.push('Esansiyel yağ hassasiyetin var');
      }
    }

    const personalScore = Math.round(avgCompatibility * sensitivityMultiplier * 100) / 100;

    return {
      product_id: productId,
      profile_id: profileId,
      general_score: Math.round(avgCompatibility * 100) / 100,
      personal_score: personalScore,
      sensitivity_multiplier: sensitivityMultiplier,
      warnings,
      matched_needs: relevantScores.length,
      total_user_needs: userNeeds.length,
    };
  }

  async getNeedScores(productId: number) {
    return this.scoreRepo.find({
      where: { product_id: productId },
      relations: ['need'],
      order: { compatibility_score: 'DESC' },
    });
  }

  async getTopProductsByNeed(needId: number, limit = 12) {
    return this.scoreRepo.find({
      where: { need_id: needId },
      relations: ['product', 'product.brand', 'product.category', 'product.images', 'product.affiliate_links'],
      order: { compatibility_score: 'DESC' },
      take: limit,
    });
  }

  async recalculateAll() {
    const products = await this.productRepo.find({
      where: { status: 'published' },
      select: ['product_id'],
    });

    const results: Array<{ product_id: number; score_count: number }> = [];
    for (const p of products) {
      const result = await this.calculateScores(p.product_id);
      results.push({
        product_id: p.product_id,
        score_count: result.scores.length,
      });
    }

    return { recalculated: results.length, details: results };
  }

  // === Scoring Config ===

  async getConfig() {
    return this.configRepo.find({ order: { config_group: 'ASC', config_key: 'ASC' } });
  }

  async updateConfigBulk(data: { weights?: Record<string, number>; penalties?: Record<string, number> }) {
    const updates: Promise<any>[] = [];
    if (data.weights) {
      for (const [key, value] of Object.entries(data.weights)) {
        updates.push(this.updateConfig(key, value));
      }
    }
    if (data.penalties) {
      for (const [key, value] of Object.entries(data.penalties)) {
        updates.push(this.updateConfig(key, value));
      }
    }
    await Promise.all(updates);
    return this.getConfig();
  }

  async updateConfig(key: string, value: number) {
    const entity = await this.configRepo.findOne({ where: { config_key: key } });
    if (!entity) throw new NotFoundException(`Config "${key}" bulunamadı`);
    entity.config_value = value;
    return this.configRepo.save(entity);
  }
}
