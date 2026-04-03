import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SearchQueryDto, SuggestQueryDto } from './dto/search.dto';
import { CacheService } from '@common/cache/cache.service';

type SearchIntent = 'product' | 'ingredient' | 'need' | 'mixed';

export interface SearchResultItem {
  type: 'product' | 'ingredient' | 'need';
  id: number;
  name: string;
  slug: string;
  score: number;
  extra?: Record<string, any>;
}

const SEARCH_CACHE_TTL = 300;    // 5 dakika
const SUGGEST_CACHE_TTL = 900;   // 15 dakika

@Injectable()
export class SearchService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cache: CacheService,
  ) {}

  async search(dto: SearchQueryDto) {
    const { q, page = 1, limit = 20 } = dto;

    // Cache key from all search params
    const cacheKey = `search:${JSON.stringify(dto)}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const intent = this.detectIntent(q);
    const offset = (page - 1) * limit;

    const results: SearchResultItem[] = [];

    if (intent === 'product' || intent === 'mixed') {
      const products = await this.searchProducts(q, dto, limit);
      results.push(...products);
    }

    if (intent === 'ingredient' || intent === 'mixed') {
      const ingredients = await this.searchIngredients(q, limit);
      results.push(...ingredients);
    }

    if (intent === 'need' || intent === 'mixed') {
      const needs = await this.searchNeeds(q, limit);
      results.push(...needs);
    }

    // Sort by composite score and paginate
    results.sort((a, b) => b.score - a.score);
    const paginated = results.slice(offset, offset + limit);

    const response = {
      data: paginated,
      meta: {
        total: results.length,
        page,
        limit,
        totalPages: Math.ceil(results.length / limit),
        intent,
      },
    };

    await this.cache.set(cacheKey, response, SEARCH_CACHE_TTL);
    return response;
  }

  async suggest(dto: SuggestQueryDto) {
    const { q, limit = 8 } = dto;
    const term = q.toLowerCase().trim();
    if (term.length < 2) return [];

    const cacheKey = `suggest:${term}:${limit}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const suggestions: Array<{ type: string; name: string; slug: string }> = [];

    // Products
    const products = await this.dataSource.query(
      `SELECT product_name as name, product_slug as slug
       FROM products
       WHERE status != 'archived'
         AND product_name ILIKE $1
       ORDER BY product_name ASC
       LIMIT $2`,
      [`%${term}%`, Math.ceil(limit / 3)],
    );
    suggestions.push(...products.map((p: any) => ({ type: 'product', ...p })));

    // Ingredients
    const ingredients = await this.dataSource.query(
      `SELECT DISTINCT i.inci_name as name, i.ingredient_slug as slug
       FROM ingredients i
       LEFT JOIN ingredient_aliases a ON a.ingredient_id = i.ingredient_id
       WHERE i.is_active = true
         AND (i.inci_name ILIKE $1 OR i.common_name ILIKE $1 OR a.alias_name ILIKE $1)
       ORDER BY i.inci_name ASC
       LIMIT $2`,
      [`%${term}%`, Math.ceil(limit / 3)],
    );
    suggestions.push(...ingredients.map((i: any) => ({ type: 'ingredient', ...i })));

    // Needs
    const needs = await this.dataSource.query(
      `SELECT need_name as name, need_slug as slug
       FROM needs
       WHERE is_active = true AND (need_name ILIKE $1 OR user_friendly_label ILIKE $1)
       ORDER BY need_name ASC
       LIMIT $2`,
      [`%${term}%`, Math.ceil(limit / 3)],
    );
    suggestions.push(...needs.map((n: any) => ({ type: 'need', ...n })));

    const result = suggestions.slice(0, limit);
    await this.cache.set(cacheKey, result, SUGGEST_CACHE_TTL);
    return result;
  }

  private detectIntent(query: string): SearchIntent {
    const q = query.toLowerCase();

    // Ingredient patterns: chemical names, INCI names
    const ingredientPatterns = [
      /acid\b/, /niacinamide/, /retinol/, /hyaluronic/, /vitamin\s?[a-e]/,
      /glycerin/, /ceramide/, /salicylic/, /glycolic/, /panthenol/,
    ];
    const isIngredient = ingredientPatterns.some((p) => p.test(q));

    // Need patterns: Turkish skin concern keywords
    const needPatterns = [
      /sivilce/, /akne/, /leke/, /kuru/, /yağlı/, /hassas/, /kırışık/,
      /yaşlanma/, /gözenek/, /nemlen/, /bariyer/, /güneş/,
    ];
    const isNeed = needPatterns.some((p) => p.test(q));

    // Supplement patterns
    const supplementPatterns = [
      /tablet/, /kapsül/, /vitamin/, /mineral/, /probiyotik/, /omega/,
      /takviye/, /supplement/, /d3/, /b12/, /magnezyum/, /çinko/, /demir/,
    ];
    const isSupplement = supplementPatterns.some((p) => p.test(q));

    // Product patterns: brand names, product type labels
    const productPatterns = [
      /serum/, /krem/, /tonik/, /temizleyici/, /nemlendirici/, /spf/,
    ];
    const isProduct = productPatterns.some((p) => p.test(q));

    if (isIngredient && !isProduct && !isNeed) return 'ingredient';
    if (isNeed && !isProduct && !isIngredient) return 'need';
    if (isProduct && !isIngredient && !isNeed) return 'product';
    return 'mixed';
  }

  private async searchProducts(
    q: string,
    filters: SearchQueryDto,
    limit: number,
  ): Promise<SearchResultItem[]> {
    let sql = `
      SELECT p.product_id, p.product_name, p.product_slug, p.domain_type, b.brand_name,
             similarity(LOWER(p.product_name), LOWER($1)) as sim
      FROM products p
      JOIN brands b ON b.brand_id = p.brand_id
      WHERE p.status != 'archived'
        AND (p.product_name ILIKE $2 OR b.brand_name ILIKE $2)
    `;
    const params: any[] = [q, `%${q}%`];
    let paramIdx = 3;

    if (filters.domain_type) {
      sql += ` AND p.domain_type = $${paramIdx++}`;
      params.push(filters.domain_type);
    }

    if (filters.brand_id) {
      sql += ` AND p.brand_id = $${paramIdx++}`;
      params.push(filters.brand_id);
    }
    if (filters.category_id) {
      sql += ` AND p.category_id = $${paramIdx++}`;
      params.push(filters.category_id);
    }
    if (filters.fragrance_free) {
      sql += ` AND p.product_id NOT IN (
        SELECT pi.product_id FROM product_ingredients pi
        JOIN ingredients i ON i.ingredient_id = pi.ingredient_id
        WHERE i.fragrance_flag = true
      )`;
    }
    if (filters.allergen_free) {
      sql += ` AND p.product_id NOT IN (
        SELECT pi.product_id FROM product_ingredients pi
        JOIN ingredients i ON i.ingredient_id = pi.ingredient_id
        WHERE i.allergen_flag = true
      )`;
    }

    sql += ` ORDER BY sim DESC LIMIT $${paramIdx}`;
    params.push(limit);

    try {
      const rows = await this.dataSource.query(sql, params);
      return rows.map((r: any) => ({
        type: 'product' as const,
        id: r.product_id,
        name: r.product_name,
        slug: r.product_slug,
        score: parseFloat(r.sim) || 0.5,
        extra: { brand_name: r.brand_name },
      }));
    } catch {
      return [];
    }
  }

  private async searchIngredients(q: string, limit: number): Promise<SearchResultItem[]> {
    try {
      const rows = await this.dataSource.query(
        `SELECT DISTINCT i.ingredient_id, i.inci_name, i.ingredient_slug, i.common_name,
                GREATEST(
                  similarity(LOWER(i.inci_name), LOWER($1)),
                  COALESCE(similarity(LOWER(i.common_name), LOWER($1)), 0)
                ) as sim
         FROM ingredients i
         LEFT JOIN ingredient_aliases a ON a.ingredient_id = i.ingredient_id
         WHERE i.is_active = true
           AND (i.inci_name ILIKE $2 OR i.common_name ILIKE $2 OR a.alias_name ILIKE $2)
         ORDER BY sim DESC
         LIMIT $3`,
        [q, `%${q}%`, limit],
      );
      return rows.map((r: any) => ({
        type: 'ingredient' as const,
        id: r.ingredient_id,
        name: r.inci_name,
        slug: r.ingredient_slug,
        score: parseFloat(r.sim) || 0.5,
        extra: { common_name: r.common_name },
      }));
    } catch {
      return [];
    }
  }

  private async searchNeeds(q: string, limit: number): Promise<SearchResultItem[]> {
    try {
      const rows = await this.dataSource.query(
        `SELECT need_id, need_name, need_slug, user_friendly_label,
                similarity(LOWER(need_name), LOWER($1)) as sim
         FROM needs
         WHERE is_active = true
           AND (need_name ILIKE $2 OR user_friendly_label ILIKE $2)
         ORDER BY sim DESC
         LIMIT $3`,
        [q, `%${q}%`, limit],
      );
      return rows.map((r: any) => ({
        type: 'need' as const,
        id: r.need_id,
        name: r.need_name,
        slug: r.need_slug,
        score: parseFloat(r.sim) || 0.5,
        extra: { label: r.user_friendly_label },
      }));
    } catch {
      return [];
    }
  }
}
