import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Ingredient, IngredientAlias, IngredientEvidenceLink } from '@database/entities';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { turkishSlug } from '@common/utils/turkish-slug';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly repo: Repository<Ingredient>,
    @InjectRepository(IngredientAlias)
    private readonly aliasRepo: Repository<IngredientAlias>,
    @InjectRepository(IngredientEvidenceLink)
    private readonly evidenceRepo: Repository<IngredientEvidenceLink>,
  ) {}

  async create(dto: CreateIngredientDto) {
    const slug = turkishSlug(dto.inci_name);
    const exists = await this.repo.findOne({ where: { ingredient_slug: slug } });
    if (exists) {
      throw new ConflictException(`"${dto.inci_name}" zaten mevcut`);
    }

    const { aliases, evidence_links, ...ingredientData } = dto;
    const entity = this.repo.create({ ...ingredientData, ingredient_slug: slug });
    const saved = await this.repo.save(entity);

    if (aliases?.length) {
      const aliasEntities = aliases.map((a) =>
        this.aliasRepo.create({ ...a, ingredient_id: saved.ingredient_id }),
      );
      await this.aliasRepo.save(aliasEntities);
    }

    if (evidence_links?.length) {
      const linkEntities = evidence_links.map((l) =>
        this.evidenceRepo.create({ ...l, ingredient_id: saved.ingredient_id }),
      );
      await this.evidenceRepo.save(linkEntities);
    }

    return this.findOne(saved.ingredient_id);
  }

  async findAll(query: PaginationDto) {
    const { page, limit, search } = query;
    const where: any = {};
    if (search) {
      where.inci_name = Like(`%${search}%`);
    }

    // 2026-05-15 audit (Madde 18): list endpoint için aliases + evidence_links
    // eager-load kaldırıldı. Detay endpoint (findOne / findBySlug) yine eager.
    // 5K+ alias + evidence_link kayıt list response payload'unu ~3x büyütüyordu.
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { inci_name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({
      where: { ingredient_id: id },
      relations: ['aliases', 'evidence_links'],
    });
    if (!entity) throw new NotFoundException('İçerik maddesi bulunamadı');
    return entity;
  }

  async findBySlug(slug: string) {
    const entity = await this.repo.findOne({
      where: { ingredient_slug: slug },
      relations: ['aliases', 'evidence_links'],
    });
    if (!entity) throw new NotFoundException('İçerik maddesi bulunamadı');
    return entity;
  }

  async update(id: number, dto: UpdateIngredientDto) {
    const entity = await this.findOne(id);
    const { aliases, evidence_links, ...ingredientData } = dto;

    if (ingredientData.inci_name) {
      entity.ingredient_slug = turkishSlug(ingredientData.inci_name);
    }
    Object.assign(entity, ingredientData);
    await this.repo.save(entity);

    if (aliases !== undefined) {
      await this.aliasRepo.delete({ ingredient_id: id });
      if (aliases.length) {
        const aliasEntities = aliases.map((a) =>
          this.aliasRepo.create({ ...a, ingredient_id: id }),
        );
        await this.aliasRepo.save(aliasEntities);
      }
    }

    if (evidence_links !== undefined) {
      await this.evidenceRepo.delete({ ingredient_id: id });
      if (evidence_links.length) {
        const linkEntities = evidence_links.map((l) =>
          this.evidenceRepo.create({ ...l, ingredient_id: id }),
        );
        await this.evidenceRepo.save(linkEntities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    entity.is_active = false;
    return this.repo.save(entity);
  }

  async suggest(term: string, limit = 10) {
    const q = (term || '').trim();
    if (!q) return [];

    // pg_trgm fuzzy match over inci_name, common_name, and alias_name (union via subquery)
    // Threshold 0.2 catches typos; ORDER BY similarity DESC returns best matches first.
    const rows: Array<{ ingredient_id: number; score: number }> = await this.repo.query(
      `
      WITH matches AS (
        SELECT i.ingredient_id,
               GREATEST(
                 similarity(i.inci_name, $1),
                 similarity(COALESCE(i.common_name, ''), $1),
                 COALESCE((
                   SELECT MAX(similarity(a.alias_name, $1))
                   FROM ingredient_aliases a
                   WHERE a.ingredient_id = i.ingredient_id
                 ), 0)
               ) AS score
        FROM ingredients i
        WHERE i.is_active = true
      )
      SELECT ingredient_id, score
      FROM matches
      WHERE score > 0.2
      ORDER BY score DESC
      LIMIT $2
      `,
      [q, limit],
    );

    if (rows.length === 0) {
      // Fallback to ILIKE (handles very short terms under trgm threshold)
      return this.repo
        .createQueryBuilder('i')
        .leftJoinAndSelect('i.aliases', 'a')
        .where(
          `(i.inci_name ILIKE :like OR i.common_name ILIKE :like OR a.alias_name ILIKE :like)`,
          { like: `%${q}%` },
        )
        .andWhere('i.is_active = true')
        .orderBy('i.inci_name', 'ASC')
        .take(limit)
        .getMany();
    }

    const ids = rows.map((r) => r.ingredient_id);
    const ingredients = await this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.aliases', 'a')
      .where('i.ingredient_id IN (:...ids)', { ids })
      .getMany();

    // Preserve similarity order
    const orderMap = new Map(ids.map((id, idx) => [id, idx]));
    return ingredients.sort(
      (a, b) => (orderMap.get(a.ingredient_id) ?? 0) - (orderMap.get(b.ingredient_id) ?? 0),
    );
  }

  /**
   * INCI listesi yapıştır → bileşen bileşen analiz et.
   * Kullanıcı ürün etiketinden kopyala-yapıştır metni atar, biz parse + fuzzy match + skor döner.
   *
   * Skor heuristik (0-100):
   *   100 - 6 × (alerjen sayısı) - 12 × (CMR / EU banned / Kathon) - 4 × (eşleşmeyen)
   *   + bonus: aktif (evidence A/B), zararlı yoksa
   */
  async analyzeInciList(rawText: string) {
    const cleaned = (rawText || '').trim();
    if (!cleaned) return { tokens: [], summary: { total: 0 } };

    // Parse: virgül, nokta, satır sonu ile böl
    const tokens = cleaned
      .replace(/[\(\[].*?[\)\]]/g, '')
      .split(/[,;.\n]+/)
      .map((t) => t.trim().replace(/^["'`]+|["'`]+$/g, ''))
      .filter((t) => t.length > 1 && t.length < 120)
      .slice(0, 80);

    if (tokens.length === 0) return { tokens: [], summary: { total: 0 } };

    // Her token için tek SQL'de en iyi eşleşmeyi bul (pg_trgm)
    const placeholders = tokens.map((_, i) => `$${i + 1}`).join(', ');
    const rows: Array<{ token: string; ingredient_id: number; score: number }> = await this.repo.query(
      `
      WITH input_tokens AS (
        SELECT unnest(ARRAY[${placeholders}]::text[]) AS token
      ),
      best_matches AS (
        SELECT it.token, i.ingredient_id,
               GREATEST(
                 similarity(LOWER(i.inci_name), LOWER(it.token)),
                 similarity(LOWER(COALESCE(i.common_name, '')), LOWER(it.token))
               ) AS score,
               ROW_NUMBER() OVER (
                 PARTITION BY it.token
                 ORDER BY GREATEST(
                   similarity(LOWER(i.inci_name), LOWER(it.token)),
                   similarity(LOWER(COALESCE(i.common_name, '')), LOWER(it.token))
                 ) DESC
               ) AS rn
        FROM input_tokens it
        JOIN ingredients i ON i.is_active = true
        WHERE GREATEST(
          similarity(LOWER(i.inci_name), LOWER(it.token)),
          similarity(LOWER(COALESCE(i.common_name, '')), LOWER(it.token))
        ) > 0.35
      )
      SELECT token, ingredient_id, score FROM best_matches WHERE rn = 1
      `,
      tokens,
    );

    const matchMap = new Map(rows.map((r) => [r.token, { ingredient_id: r.ingredient_id, score: Number(r.score) }]));
    const ids = rows.map((r) => r.ingredient_id);
    const ingredients = ids.length > 0
      ? await this.repo
          .createQueryBuilder('i')
          .where('i.ingredient_id IN (:...ids)', { ids })
          .getMany()
      : [];
    const ingMap = new Map(ingredients.map((i) => [i.ingredient_id, i]));

    // Per-token sonuç
    let allergens = 0, fragrances = 0, cmr = 0, banned = 0, kathon = 0, matched = 0;
    const goodActives = new Set(['niacinamide', 'hyaluronic-acid', 'sodium-hyaluronate', 'panthenol', 'tocopherol', 'centella-asiatica', 'glycerin', 'retinol', 'ascorbic-acid', 'salicylic-acid']);
    let activeBonus = 0;

    const results = tokens.map((token, idx) => {
      const match = matchMap.get(token);
      const ing = match ? ingMap.get(match.ingredient_id) : null;
      if (!ing) {
        return { rank: idx + 1, raw: token, matched: false };
      }
      matched++;
      if (ing.allergen_flag) allergens++;
      if (ing.fragrance_flag) fragrances++;
      if (ing.cmr_class) cmr++;
      if (ing.eu_banned) banned++;
      const lowerInci = (ing.inci_name || '').toLowerCase();
      if (lowerInci.includes('methylisothiazolinone') || lowerInci.includes('methylchloroisothiazolinone')) kathon++;
      if (ing.ingredient_slug && goodActives.has(ing.ingredient_slug)) activeBonus += 4;
      return {
        rank: idx + 1,
        raw: token,
        matched: true,
        confidence: Math.round((match!.score) * 100) / 100,
        ingredient: {
          ingredient_id: ing.ingredient_id,
          inci_name: ing.inci_name,
          common_name: ing.common_name,
          ingredient_slug: ing.ingredient_slug,
          function_summary: ing.function_summary,
          evidence_grade: ing.evidence_grade,
          safety_class: ing.safety_class,
          allergen_flag: ing.allergen_flag,
          fragrance_flag: ing.fragrance_flag,
          eu_banned: ing.eu_banned,
          cmr_class: ing.cmr_class,
        },
      };
    });

    // Skor hesabı
    const unmatched = tokens.length - matched;
    let score = 100 - allergens * 6 - cmr * 18 - banned * 25 - kathon * 12 - unmatched * 3 + Math.min(activeBonus, 12);
    score = Math.max(0, Math.min(100, score));

    return {
      tokens: results,
      summary: {
        total: tokens.length,
        matched,
        unmatched,
        allergens,
        fragrances,
        cmr,
        eu_banned: banned,
        kathon,
        score,
        verdict: score >= 80 ? 'çok iyi' : score >= 60 ? 'iyi' : score >= 40 ? 'orta' : score >= 20 ? 'riskli' : 'tehlikeli',
      },
    };
  }
}
