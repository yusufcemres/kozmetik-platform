import { NotFoundException } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { ScoringService } from './scoring.service';
import {
  Product,
  ProductIngredient,
  ProductNeedScore,
  IngredientNeedMapping,
  ScoringConfig,
  UserSkinProfile,
} from '@database/entities';

/**
 * ScoringService unit testleri (2026-05-19).
 *
 * Coverage hedefi: calculateScores edge cases + getPersonalScore sensitivity
 * penalty davranışları + getNeedScores/getConfig basit query'leri.
 *
 * Full DB integration için ayrı e2e gerekir; bu spec mock'lu birim seviyesi.
 */
describe('ScoringService', () => {
  let service: ScoringService;
  let productRepo: jest.Mocked<Repository<Product>>;
  let piRepo: jest.Mocked<Repository<ProductIngredient>>;
  let scoreRepo: jest.Mocked<Repository<ProductNeedScore>>;
  let mappingRepo: jest.Mocked<Repository<IngredientNeedMapping>>;
  let configRepo: jest.Mocked<Repository<ScoringConfig>>;
  let profileRepo: jest.Mocked<Repository<UserSkinProfile>>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    productRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Product>>;
    piRepo = {
      find: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<Repository<ProductIngredient>>;
    scoreRepo = {
      find: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue({ affected: 0 }),
      save: jest.fn(),
      create: jest.fn((x) => x),
    } as unknown as jest.Mocked<Repository<ProductNeedScore>>;
    mappingRepo = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<IngredientNeedMapping>)),
    } as unknown as jest.Mocked<Repository<IngredientNeedMapping>>;
    configRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<ScoringConfig>>;
    profileRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserSkinProfile>>;
    dataSource = {} as jest.Mocked<DataSource>;

    service = new ScoringService(
      productRepo,
      piRepo,
      scoreRepo,
      mappingRepo,
      configRepo,
      profileRepo,
      dataSource,
    );
  });

  describe('calculateScores', () => {
    it('ürün yoksa NotFoundException', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(service.calculateScores(999)).rejects.toThrow(NotFoundException);
    });

    it('ürün INCI listesi boşsa scores=[] + uyarı mesajı', async () => {
      productRepo.findOne.mockResolvedValue({ product_id: 1 } as Product);
      piRepo.find.mockResolvedValue([]);
      const result = await service.calculateScores(1);
      expect(result).toEqual({
        product_id: 1,
        scores: [],
        message: 'Ürünün ingredient listesi yok',
      });
    });

    it('eşleşmiş ingredient yoksa scores=[] + uyarı', async () => {
      productRepo.findOne.mockResolvedValue({ product_id: 1 } as Product);
      piRepo.find.mockResolvedValue([
        { product_ingredient_id: 1, product_id: 1, ingredient_id: null, inci_order_rank: 1 } as unknown as ProductIngredient,
      ]);
      const result = await service.calculateScores(1);
      expect(result.message).toBe('Eşleşmiş ingredient yok');
      expect(result.scores).toEqual([]);
    });

    it('positive effect mapping → totalScore artar (compatibility ≥ 0)', async () => {
      productRepo.findOne.mockResolvedValue({ product_id: 1 } as Product);
      piRepo.find.mockResolvedValue([
        {
          product_ingredient_id: 1,
          product_id: 1,
          ingredient_id: 10,
          inci_order_rank: 1,
          is_highlighted_in_claims: false,
          concentration_band: 'high',
        } as unknown as ProductIngredient,
      ]);
      const qb = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { ingredient_id: 10, need_id: 5, effect_type: 'positive', relevance_score: 80 },
        ]),
      };
      mappingRepo.createQueryBuilder.mockReturnValue(qb as unknown as SelectQueryBuilder<IngredientNeedMapping>);
      scoreRepo.save.mockResolvedValue({} as unknown as ProductNeedScore);

      const result = await service.calculateScores(1);
      expect(result.scores).toHaveLength(1);
      expect(result.scores[0].compatibility_score).toBeGreaterThan(0);
      expect(result.scores[0].confidence_level).toBe('medium'); // 1 match → medium
    });

    it('confidence_level: 3+ match = high, 1-2 = medium, 0 = low', async () => {
      productRepo.findOne.mockResolvedValue({ product_id: 1 } as Product);
      const ingredients = [10, 11, 12].map(
        (id, idx) =>
          ({
            product_ingredient_id: idx,
            product_id: 1,
            ingredient_id: id,
            inci_order_rank: idx + 1,
            is_highlighted_in_claims: false,
            concentration_band: 'high',
          }) as unknown as ProductIngredient,
      );
      piRepo.find.mockResolvedValue(ingredients);
      const qb = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { ingredient_id: 10, need_id: 5, effect_type: 'positive', relevance_score: 80 },
          { ingredient_id: 11, need_id: 5, effect_type: 'positive', relevance_score: 80 },
          { ingredient_id: 12, need_id: 5, effect_type: 'positive', relevance_score: 80 },
        ]),
      };
      mappingRepo.createQueryBuilder.mockReturnValue(qb as unknown as SelectQueryBuilder<IngredientNeedMapping>);
      scoreRepo.save.mockResolvedValue({} as unknown as ProductNeedScore);

      const result = await service.calculateScores(1);
      expect(result.scores[0].confidence_level).toBe('high');
    });

    it('negative effect → score düşer (0.5x katkı çıkarılır)', async () => {
      productRepo.findOne.mockResolvedValue({ product_id: 1 } as Product);
      piRepo.find.mockResolvedValue([
        {
          product_ingredient_id: 1,
          product_id: 1,
          ingredient_id: 10,
          inci_order_rank: 1,
          is_highlighted_in_claims: false,
          concentration_band: 'high',
        } as unknown as ProductIngredient,
      ]);
      const qb = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { ingredient_id: 10, need_id: 5, effect_type: 'negative', relevance_score: 80 },
        ]),
      };
      mappingRepo.createQueryBuilder.mockReturnValue(qb as unknown as SelectQueryBuilder<IngredientNeedMapping>);
      scoreRepo.save.mockResolvedValue({} as unknown as ProductNeedScore);

      const result = await service.calculateScores(1);
      // Total = -0.5 × strength, normalized = max(0, ...) = 0
      expect(result.scores[0].compatibility_score).toBe(0);
    });
  });

  describe('getPersonalScore', () => {
    it('profil yoksa NotFoundException', async () => {
      profileRepo.findOne.mockResolvedValue(null);
      await expect(service.getPersonalScore(1, 'anon-x')).rejects.toThrow(NotFoundException);
    });

    it('fragrance hassasiyet + ürün fragrance flag → warning + multiplier 0.6', async () => {
      profileRepo.findOne.mockResolvedValue({
        anonymous_id: 'anon-1',
        concerns: [],
        sensitivities: { fragrance: true },
      } as unknown as UserSkinProfile);
      scoreRepo.find.mockResolvedValue([
        { need_id: 1, compatibility_score: 80 } as unknown as ProductNeedScore,
      ]);
      piRepo.find.mockResolvedValue([
        { ingredient: { fragrance_flag: true }, ingredient_display_name: 'Parfum' } as unknown as ProductIngredient,
      ]);

      const result = await service.getPersonalScore(1, 'anon-1');
      expect(result.warnings).toContain('Parfüm hassasiyetin var, bu ürün parfüm içeriyor');
      expect(result.sensitivity_multiplier).toBe(0.6);
      expect(result.personal_score).toBeLessThan(result.general_score);
    });

    it('hassasiyet yoksa multiplier 1.0 + personal=general', async () => {
      profileRepo.findOne.mockResolvedValue({
        anonymous_id: 'anon-1',
        concerns: [1],
        sensitivities: {},
      } as unknown as UserSkinProfile);
      scoreRepo.find.mockResolvedValue([
        { need_id: 1, compatibility_score: 70 } as unknown as ProductNeedScore,
      ]);
      piRepo.find.mockResolvedValue([]);

      const result = await service.getPersonalScore(1, 'anon-1');
      expect(result.sensitivity_multiplier).toBe(1.0);
      expect(result.warnings).toEqual([]);
      expect(result.personal_score).toBe(70);
    });

    it('userNeeds boş → tüm need score ortalaması alınır', async () => {
      profileRepo.findOne.mockResolvedValue({
        anonymous_id: 'anon-1',
        concerns: null,
        sensitivities: {},
      } as unknown as UserSkinProfile);
      scoreRepo.find.mockResolvedValue([
        { need_id: 1, compatibility_score: 60 } as unknown as ProductNeedScore,
        { need_id: 2, compatibility_score: 80 } as unknown as ProductNeedScore,
      ]);
      piRepo.find.mockResolvedValue([]);

      const result = await service.getPersonalScore(1, 'anon-1');
      expect(result.general_score).toBe(70); // (60 + 80) / 2
      expect(result.matched_needs).toBe(2);
    });
  });

  describe('updateConfig', () => {
    it('config bulunamazsa NotFoundException', async () => {
      configRepo.findOne.mockResolvedValue(null);
      await expect(service.updateConfig('UNKNOWN_KEY', 1.5)).rejects.toThrow(NotFoundException);
    });

    it('config bulunduğunda value güncellenir', async () => {
      const entity = { config_key: 'X', config_value: 1.0 } as unknown as ScoringConfig;
      configRepo.findOne.mockResolvedValue(entity);
      configRepo.save.mockResolvedValue({ ...entity, config_value: 2.5 } as ScoringConfig);

      const result = await service.updateConfig('X', 2.5);
      expect(entity.config_value).toBe(2.5);
      expect(configRepo.save).toHaveBeenCalledWith(entity);
      expect(result.config_value).toBe(2.5);
    });
  });
});
