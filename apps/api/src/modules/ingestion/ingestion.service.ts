import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Product, ProductLabel, ProductIngredient,
  Ingredient, IngredientAlias,
} from '@database/entities';
import { parseInciText, ParsedIngredient } from './inci-parser';
import { IngestInciDto, MatchResultDto, IngestResultDto } from './dto/ingest.dto';

interface MatchResult {
  ingredient_id: number | null;
  ingredient_name: string | null;
  match_status: 'exact' | 'alias' | 'trigram' | 'unmatched';
  match_confidence: number;
}

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductIngredient)
    private readonly piRepo: Repository<ProductIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    @InjectRepository(IngredientAlias)
    private readonly aliasRepo: Repository<IngredientAlias>,
    @InjectRepository(ProductLabel)
    private readonly labelRepo: Repository<ProductLabel>,
    private readonly dataSource: DataSource,
  ) {}

  async ingest(dto: IngestInciDto): Promise<IngestResultDto> {
    const product = await this.productRepo.findOne({
      where: { product_id: dto.product_id },
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');

    // Parse INCI text
    const parsed = parseInciText(dto.inci_text);

    // Match each ingredient
    const results: MatchResultDto[] = [];
    for (const item of parsed) {
      const match = await this.matchIngredient(item);
      results.push({
        ...item,
        ...match,
      });
    }

    // Save product_ingredients
    await this.piRepo.delete({ product_id: dto.product_id });
    const entities = results.map((r) =>
      this.piRepo.create({
        product_id: dto.product_id,
        ingredient_id: r.ingredient_id ?? undefined,
        ingredient_display_name: r.raw,
        inci_order_rank: r.order,
        listed_as_raw: r.raw,
        match_status: r.match_status === 'unmatched' ? 'review' : r.match_status === 'trigram' && r.match_confidence < 0.95 ? 'suggestion' : 'auto',
        match_confidence: r.match_confidence,
        is_below_one_percent_estimate: r.order > parsed.length * 0.7,
      }),
    );
    await this.piRepo.save(entities);

    // Update or create product label with raw INCI text
    let label = await this.labelRepo.findOne({
      where: { product_id: dto.product_id },
    });
    if (label) {
      label.inci_raw_text = dto.inci_text;
      await this.labelRepo.save(label);
    } else {
      label = this.labelRepo.create({
        product_id: dto.product_id,
        inci_raw_text: dto.inci_text,
      });
      await this.labelRepo.save(label);
    }

    const autoMatched = results.filter(
      (r) => r.match_status !== 'unmatched' && r.match_confidence >= 0.95,
    ).length;
    const suggestions = results.filter(
      (r) => r.match_status !== 'unmatched' && r.match_confidence >= 0.80 && r.match_confidence < 0.95,
    ).length;
    const unmatched = results.filter(
      (r) => r.match_status === 'unmatched' || r.match_confidence < 0.80,
    ).length;

    return {
      product_id: dto.product_id,
      total_parsed: parsed.length,
      auto_matched: autoMatched,
      suggestions,
      unmatched,
      results,
    };
  }

  private async matchIngredient(item: ParsedIngredient): Promise<MatchResult> {
    const normalized = item.normalized.toLowerCase();

    // 1. Exact match on inci_name
    const exact = await this.ingredientRepo
      .createQueryBuilder('i')
      .where('LOWER(i.inci_name) = :name', { name: normalized })
      .andWhere('i.is_active = true')
      .getOne();

    if (exact) {
      return {
        ingredient_id: exact.ingredient_id,
        ingredient_name: exact.inci_name,
        match_status: 'exact',
        match_confidence: 1.0,
      };
    }

    // 2. Exact match on common_name
    const commonExact = await this.ingredientRepo
      .createQueryBuilder('i')
      .where('LOWER(i.common_name) = :name', { name: normalized })
      .andWhere('i.is_active = true')
      .getOne();

    if (commonExact) {
      return {
        ingredient_id: commonExact.ingredient_id,
        ingredient_name: commonExact.inci_name,
        match_status: 'exact',
        match_confidence: 0.98,
      };
    }

    // 3. Alias match
    const alias = await this.aliasRepo
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.ingredient', 'i')
      .where('LOWER(a.alias_name) = :name', { name: normalized })
      .andWhere('i.is_active = true')
      .getOne();

    if (alias) {
      return {
        ingredient_id: alias.ingredient.ingredient_id,
        ingredient_name: alias.ingredient.inci_name,
        match_status: 'alias',
        match_confidence: 0.96,
      };
    }

    // 4. Trigram similarity search
    try {
      const trigramResults = await this.dataSource.query(
        `SELECT i.ingredient_id, i.inci_name,
                GREATEST(
                  similarity(LOWER(i.inci_name), $1),
                  COALESCE(similarity(LOWER(i.common_name), $1), 0)
                ) as sim
         FROM ingredients i
         WHERE i.is_active = true
           AND (
             similarity(LOWER(i.inci_name), $1) > 0.3
             OR similarity(LOWER(i.common_name), $1) > 0.3
           )
         ORDER BY sim DESC
         LIMIT 1`,
        [normalized],
      );

      if (trigramResults.length > 0) {
        const best = trigramResults[0];
        const confidence = Math.min(parseFloat(best.sim), 1.0);
        return {
          ingredient_id: confidence >= 0.80 ? best.ingredient_id : null,
          ingredient_name: best.inci_name,
          match_status: 'trigram',
          match_confidence: confidence,
        };
      }
    } catch {
      // pg_trgm might not be available in test environments
    }

    // 5. No match
    return {
      ingredient_id: null,
      ingredient_name: null,
      match_status: 'unmatched',
      match_confidence: 0,
    };
  }

  async bulkIngestCsv(csvContent: string): Promise<IngestResultDto[]> {
    const lines = csvContent.split('\n').filter((l) => l.trim());
    const results: IngestResultDto[] = [];

    for (const line of lines) {
      const firstComma = line.indexOf(',');
      if (firstComma === -1) continue;

      const productId = parseInt(line.substring(0, firstComma).trim(), 10);
      const inciText = line.substring(firstComma + 1).trim();

      if (isNaN(productId) || !inciText) continue;

      try {
        const result = await this.ingest({ product_id: productId, inci_text: inciText });
        results.push(result);
      } catch {
        // Skip invalid rows
      }
    }

    return results;
  }
}
