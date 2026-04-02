import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product, Ingredient, Need, AffiliateLink, ProductNeedScore, ProductIngredient,
} from '@database/entities';

interface PaginationParams {
  page: number;
  limit: number;
  category?: string;
  brand?: string;
}

@Injectable()
export class B2bExportService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    @InjectRepository(Need)
    private readonly needRepo: Repository<Need>,
    @InjectRepository(AffiliateLink)
    private readonly affiliateRepo: Repository<AffiliateLink>,
    @InjectRepository(ProductNeedScore)
    private readonly scoreRepo: Repository<ProductNeedScore>,
    @InjectRepository(ProductIngredient)
    private readonly piRepo: Repository<ProductIngredient>,
  ) {}

  async exportProducts(params: PaginationParams) {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.status = :status', { status: 'published' });

    if (params.category) {
      qb.andWhere('c.category_slug = :cat', { cat: params.category });
    }
    if (params.brand) {
      qb.andWhere('b.brand_slug = :brand', { brand: params.brand });
    }

    const [items, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return {
      data: items.map((p) => ({
        product_id: p.product_id,
        name: p.product_name,
        slug: p.product_slug,
        brand: p.brand?.brand_name || null,
        category: p.category?.category_name || null,
        description: p.short_description,
        status: p.status,
        domain_type: p.domain_type,
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        total_pages: Math.ceil(total / params.limit),
      },
    };
  }

  async exportIngredients(params: { page: number; limit: number }) {
    const [items, total] = await this.ingredientRepo.findAndCount({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      order: { inci_name: 'ASC' },
    });

    return {
      data: items.map((i) => ({
        ingredient_id: i.ingredient_id,
        inci_name: i.inci_name,
        common_name: i.common_name,
        slug: i.ingredient_slug,
        group: i.ingredient_group,
        origin_type: i.origin_type,
        function_summary: i.function_summary,
        allergen_flag: i.allergen_flag,
        fragrance_flag: i.fragrance_flag,
        evidence_level: i.evidence_level,
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        total_pages: Math.ceil(total / params.limit),
      },
    };
  }

  async exportPrices(params: { page: number; limit: number }) {
    const [items, total] = await this.affiliateRepo.findAndCount({
      where: { is_active: true },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      order: { product_id: 'ASC' },
    });

    return {
      data: items.map((al) => ({
        product_id: al.product_id,
        platform: al.platform,
        price: al.price_snapshot ? Number(al.price_snapshot) : null,
        price_updated_at: al.price_updated_at,
        affiliate_url: al.affiliate_url,
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        total_pages: Math.ceil(total / params.limit),
      },
    };
  }

  async exportNeeds() {
    const needs = await this.needRepo.find({ order: { need_name: 'ASC' } });
    return {
      data: needs.map((n) => ({
        need_id: n.need_id,
        name: n.need_name,
        slug: n.need_slug,
        group: n.need_group,
        description: n.short_description,
        user_friendly_label: n.user_friendly_label,
      })),
    };
  }

  async exportProductScores(productId?: number) {
    const qb = this.scoreRepo.createQueryBuilder('ps')
      .leftJoinAndSelect('ps.need', 'n');

    if (productId) {
      qb.where('ps.product_id = :pid', { pid: productId });
    }

    const scores = await qb.take(500).getMany();

    return {
      data: scores.map((s) => ({
        product_id: s.product_id,
        need_id: s.need_id,
        need_name: s.need?.need_name || null,
        compatibility_score: s.compatibility_score,
        confidence_level: s.confidence_level,
      })),
    };
  }
}
