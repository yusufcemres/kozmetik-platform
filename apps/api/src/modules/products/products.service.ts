import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  Product, ProductLabel, ProductImage, ProductMaster, ProductVariant,
  AffiliateLink, FormulaRevision, PriceHistory,
} from '@database/entities';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateAffiliateLinkDto } from './dto/create-affiliate-link.dto';
import { UpdateAffiliateLinkDto } from './dto/update-affiliate-link.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { turkishSlug } from '@common/utils/turkish-slug';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(ProductLabel)
    private readonly labelRepo: Repository<ProductLabel>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductMaster)
    private readonly masterRepo: Repository<ProductMaster>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(AffiliateLink)
    private readonly affiliateRepo: Repository<AffiliateLink>,
    @InjectRepository(FormulaRevision)
    private readonly revisionRepo: Repository<FormulaRevision>,
    @InjectRepository(PriceHistory)
    private readonly priceHistoryRepo: Repository<PriceHistory>,
  ) {}

  async create(dto: CreateProductDto) {
    const slug = turkishSlug(dto.product_name);
    const exists = await this.repo.findOne({ where: { product_slug: slug } });
    if (exists) {
      throw new ConflictException(`"${dto.product_name}" zaten mevcut`);
    }

    const { label, images, ...productData } = dto;
    const entity = this.repo.create({ ...productData, product_slug: slug });
    const saved = await this.repo.save(entity);

    if (label) {
      const labelEntity = this.labelRepo.create({
        ...label,
        product_id: saved.product_id,
      });
      await this.labelRepo.save(labelEntity);
    }

    if (images?.length) {
      const imageEntities = images.map((img) =>
        this.imageRepo.create({ ...img, product_id: saved.product_id }),
      );
      await this.imageRepo.save(imageEntities);
    }

    return this.findOne(saved.product_id);
  }

  async findAll(query: PaginationDto & { brand_id?: number; category_id?: number; status?: string }) {
    const { page, limit, search, brand_id, category_id, status } = query;
    const where: any = {};
    if (search) where.product_name = Like(`%${search}%`);
    if (brand_id) where.brand_id = brand_id;
    if (category_id) where.category_id = category_id;
    if (status) where.status = status;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['brand', 'category', 'label', 'images'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findTopScored(limit = 6) {
    const products = await this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoin('p.need_scores', 'ns')
      .where('p.status = :status', { status: 'published' })
      .addSelect('AVG(ns.compatibility_score)', 'avg_score')
      .groupBy('p.product_id')
      .addGroupBy('b.brand_id')
      .addGroupBy('img.product_image_id')
      .addGroupBy('cat.category_id')
      .having('COUNT(ns.product_need_score_id) > 0')
      .orderBy('avg_score', 'DESC')
      .limit(limit)
      .getMany();
    return products;
  }

  async findByIngredient(ingredientId: number, limit = 20) {
    return this.repo
      .createQueryBuilder('p')
      .innerJoin('p.ingredients', 'pi', 'pi.ingredient_id = :iid', { iid: ingredientId })
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.category', 'cat')
      .where('p.status = :status', { status: 'published' })
      .orderBy('pi.inci_order_rank', 'ASC')
      .limit(limit)
      .getMany();
  }

  async findByIds(ids: number[]) {
    if (!ids.length) return [];
    return this.repo.find({
      where: ids.map((id) => ({ product_id: id })),
      relations: [
        'brand', 'category', 'images', 'affiliate_links',
        'ingredients', 'ingredients.ingredient',
        'need_scores', 'need_scores.need',
      ],
      order: { ingredients: { inci_order_rank: 'ASC' } },
    });
  }

  async findPopularBrands(limit = 12) {
    const brands = await this.repo
      .createQueryBuilder('p')
      .innerJoin('p.brand', 'b')
      .select('b.brand_id', 'brand_id')
      .addSelect('b.brand_name', 'brand_name')
      .addSelect('b.brand_slug', 'brand_slug')
      .addSelect('COUNT(p.product_id)', 'product_count')
      .where('p.status = :status', { status: 'published' })
      .groupBy('b.brand_id')
      .addGroupBy('b.brand_name')
      .addGroupBy('b.brand_slug')
      .orderBy('product_count', 'DESC')
      .limit(limit)
      .getRawMany();
    return brands;
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({
      where: { product_id: id },
      relations: [
        'brand', 'category', 'variant', 'label', 'images', 'affiliate_links',
        'ingredients', 'ingredients.ingredient',
        'need_scores', 'need_scores.need',
      ],
      order: { ingredients: { inci_order_rank: 'ASC' }, need_scores: { compatibility_score: 'DESC' } },
    });
    if (!entity) throw new NotFoundException('Ürün bulunamadı');
    return entity;
  }

  async findBySlug(slug: string) {
    const entity = await this.repo.findOne({
      where: { product_slug: slug },
      relations: [
        'brand', 'category', 'variant', 'label', 'images', 'affiliate_links',
        'ingredients', 'ingredients.ingredient',
        'need_scores', 'need_scores.need',
      ],
      order: { ingredients: { inci_order_rank: 'ASC' }, need_scores: { compatibility_score: 'DESC' } },
    });
    if (!entity) throw new NotFoundException('Ürün bulunamadı');
    return entity;
  }

  async update(id: number, dto: UpdateProductDto) {
    const entity = await this.findOne(id);
    const { label, images, ...productData } = dto;

    if (productData.product_name) {
      entity.product_slug = turkishSlug(productData.product_name);
    }
    Object.assign(entity, productData);
    await this.repo.save(entity);

    if (label) {
      if (entity.label) {
        Object.assign(entity.label, label);
        await this.labelRepo.save(entity.label);
      } else {
        const labelEntity = this.labelRepo.create({
          ...label,
          product_id: id,
        });
        await this.labelRepo.save(labelEntity);
      }
    }

    if (images !== undefined) {
      await this.imageRepo.delete({ product_id: id });
      if (images.length) {
        const imageEntities = images.map((img) =>
          this.imageRepo.create({ ...img, product_id: id }),
        );
        await this.imageRepo.save(imageEntities);
      }
    }

    return this.findOne(id);
  }

  async updateStatus(id: number, status: string) {
    const entity = await this.findOne(id);
    entity.status = status;
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    entity.status = 'archived';
    return this.repo.save(entity);
  }

  // === Affiliate Links ===

  async createAffiliateLink(productId: number, dto: CreateAffiliateLinkDto) {
    await this.findOne(productId); // verify product exists
    const entity = this.affiliateRepo.create({
      ...dto,
      product_id: productId,
      price_updated_at: dto.price_snapshot ? new Date() : undefined,
    });
    return this.affiliateRepo.save(entity);
  }

  async getAffiliateLinks(productId: number) {
    return this.affiliateRepo.find({
      where: { product_id: productId, is_active: true },
      order: { platform: 'ASC' },
    });
  }

  async updateAffiliateLink(linkId: number, dto: UpdateAffiliateLinkDto) {
    const link = await this.affiliateRepo.findOne({
      where: { affiliate_link_id: linkId },
    });
    if (!link) throw new NotFoundException('Affiliate link bulunamadı');

    if (dto.price_snapshot !== undefined) {
      link.price_updated_at = new Date();
    }
    Object.assign(link, dto);
    return this.affiliateRepo.save(link);
  }

  async removeAffiliateLink(linkId: number) {
    const link = await this.affiliateRepo.findOne({
      where: { affiliate_link_id: linkId },
    });
    if (!link) throw new NotFoundException('Affiliate link bulunamadı');
    return this.affiliateRepo.remove(link);
  }

  // === Formula Revisions ===

  async addFormulaRevision(
    productId: number,
    data: { previous_inci_text: string; new_inci_text: string; change_summary?: string; changed_by?: string },
  ) {
    await this.findOne(productId);
    const entity = this.revisionRepo.create({ ...data, product_id: productId });
    return this.revisionRepo.save(entity);
  }

  async getFormulaRevisions(productId: number) {
    return this.revisionRepo.find({
      where: { product_id: productId },
      order: { created_at: 'DESC' },
    });
  }

  // === Masters & Variants ===

  async createMaster(data: { brand_id: number; category_id: number; master_name: string; domain_type?: string }) {
    const entity = this.masterRepo.create(data);
    return this.masterRepo.save(entity);
  }

  async createVariant(data: { master_id: number; region?: string; size_label?: string }) {
    const entity = this.variantRepo.create(data);
    return this.variantRepo.save(entity);
  }

  // === Price History ===

  async getPriceHistory(productId: number, days = 90) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.priceHistoryRepo
      .createQueryBuilder('ph')
      .innerJoin('ph.affiliate_link', 'al')
      .select('al.platform', 'platform')
      .addSelect('ph.price', 'price')
      .addSelect('ph.recorded_at', 'recorded_at')
      .where('al.product_id = :productId', { productId })
      .andWhere('al.is_active = true')
      .andWhere('ph.recorded_at >= :since', { since })
      .orderBy('ph.recorded_at', 'ASC')
      .getRawMany();

    // Group by platform
    const byPlatform: Record<string, { date: string; price: number }[]> = {};
    for (const row of rows) {
      const p = row.platform;
      if (!byPlatform[p]) byPlatform[p] = [];
      byPlatform[p].push({
        date: new Date(row.recorded_at).toISOString().slice(0, 10),
        price: parseFloat(row.price),
      });
    }

    // Compute stats per platform
    const platforms = Object.entries(byPlatform).map(([platform, points]) => {
      const prices = points.map((p) => p.price);
      return {
        platform,
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
        current: prices[prices.length - 1],
        points,
      };
    });

    // Global stats
    const allPrices = rows.map((r: any) => parseFloat(r.price));
    return {
      period_days: days,
      global_min: allPrices.length ? Math.min(...allPrices) : 0,
      global_max: allPrices.length ? Math.max(...allPrices) : 0,
      global_avg: allPrices.length ? Math.round((allPrices.reduce((a: number, b: number) => a + b, 0) / allPrices.length) * 100) / 100 : 0,
      platforms,
    };
  }
}
