import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, In } from 'typeorm';
import {
  Product, ProductLabel, ProductImage, ProductMaster, ProductVariant,
  AffiliateLink, AffiliateClick, FormulaRevision, PriceHistory, Category,
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
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(AffiliateClick)
    private readonly clickRepo: Repository<AffiliateClick>,
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

  async findAll(query: PaginationDto & {
    brand_id?: number; category_id?: number; status?: string;
    target_area?: string; usage_time?: string; product_type?: string; need_id?: number;
    domain_type?: string; ingredient_slug?: string; target_gender?: string;
  }) {
    const { page, limit, search, brand_id, category_id, status, target_area, usage_time, product_type, need_id, domain_type, ingredient_slug, target_gender } = query;
    const where: any = {};
    if (search) where.product_name = ILike(`%${search}%`);
    if (brand_id) where.brand_id = Number(brand_id);
    if (status) where.status = status;
    if (target_area) where.target_area = target_area;
    if (usage_time) where.usage_time_hint = usage_time;
    if (product_type) where.product_type_label = ILike(`%${product_type}%`);
    if (domain_type) where.domain_type = domain_type;
    if (target_gender) where.target_gender = target_gender;

    // Category filter: include child categories for parent
    if (category_id) {
      const catId = Number(category_id);
      const children = await this.categoryRepo.find({
        where: { parent_category_id: catId },
        select: ['category_id'],
      });
      const ids = [catId, ...children.map(c => c.category_id)];
      where.category_id = In(ids);
    }

    // Ingredient slug filter requires a join — use QueryBuilder
    if (ingredient_slug) {
      const qb = this.repo.createQueryBuilder('p')
        .innerJoin('p.ingredients', 'pi')
        .innerJoin('pi.ingredient', 'ing', 'ing.ingredient_slug = :slug', { slug: ingredient_slug })
        .leftJoinAndSelect('p.brand', 'b')
        .leftJoinAndSelect('p.category', 'cat')
        .leftJoinAndSelect('p.label', 'lbl')
        .leftJoinAndSelect('p.images', 'img');

      if (search) qb.andWhere('p.product_name ILIKE :search', { search: `%${search}%` });
      if (brand_id) qb.andWhere('p.brand_id = :bid', { bid: Number(brand_id) });
      if (domain_type) qb.andWhere('p.domain_type = :dt', { dt: domain_type });
      if (target_area) qb.andWhere('p.target_area = :ta', { ta: target_area });

      qb.orderBy('pi.inci_order_rank', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [data, total] = await qb.getManyAndCount();
      return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // Need filter requires a join — use QueryBuilder
    if (need_id) {
      const qb = this.repo.createQueryBuilder('p')
        .innerJoin('p.need_scores', 'ns', 'ns.need_id = :nid', { nid: Number(need_id) })
        .leftJoinAndSelect('p.brand', 'b')
        .leftJoinAndSelect('p.category', 'cat')
        .leftJoinAndSelect('p.label', 'lbl')
        .leftJoinAndSelect('p.images', 'img');

      if (search) qb.andWhere('p.product_name ILIKE :search', { search: `%${search}%` });
      if (brand_id) qb.andWhere('p.brand_id = :bid', { bid: Number(brand_id) });
      if (category_id) qb.andWhere('p.category_id IN (:...cids)', { cids: where.category_id?.value || [Number(category_id)] });
      if (target_area) qb.andWhere('p.target_area = :ta', { ta: target_area });
      if (usage_time) qb.andWhere('p.usage_time_hint = :ut', { ut: usage_time });
      if (product_type) qb.andWhere('p.product_type_label ILIKE :pt', { pt: `%${product_type}%` });

      qb.orderBy('ns.compatibility_score', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [data, total] = await qb.getManyAndCount();
      return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

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

  async findTopScored(limit = 6, brandId?: number) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoin('p.need_scores', 'ns')
      .where('p.status = :status', { status: 'published' })
      .addSelect('AVG(ns.compatibility_score)', 'avg_score')
      .groupBy('p.product_id')
      .addGroupBy('b.brand_id')
      .addGroupBy('img.image_id')
      .addGroupBy('cat.category_id')
      .having('COUNT(ns.product_need_score_id) > 0')
      .orderBy('avg_score', 'DESC')
      .limit(limit);

    if (brandId) {
      qb.andWhere('p.brand_id = :brandId', { brandId });
    }

    return qb.getMany();
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

  // === Similar Products ===

  async findSimilar(productId: number, limit = 4, domainType?: string) {
    // Get source product with relations
    const source = await this.repo.findOne({
      where: { product_id: productId },
      relations: ['ingredients', 'ingredients.ingredient', 'need_scores', 'need_scores.need', 'affiliate_links'],
    });
    if (!source) throw new NotFoundException('Ürün bulunamadı');

    const sourceKeyIngredients = (source.ingredients || [])
      .filter((pi: any) => pi.is_key_ingredient)
      .map((pi: any) => ({
        ingredient_id: pi.ingredient_id,
        name: pi.ingredient?.inci_name || pi.ingredient?.ingredient_name || '',
      }));

    const sourceNeeds = (source.need_scores || []).map((ns: any) => ({
      need_id: ns.need_id,
      name: ns.need?.need_name || '',
      score: Number(ns.compatibility_score) || 0,
    }));

    const sourcePrice = this.getLowestPrice(source);

    // Find candidates: same domain_type, not archived, not self
    let candidateQuery = `
      SELECT p.product_id, p.product_name, p.product_slug, p.category_id,
             p.domain_type, p.product_type_label,
             b.brand_name, b.brand_slug
      FROM products p
      JOIN brands b ON b.brand_id = p.brand_id
      WHERE p.product_id != $1
        AND p.status != 'archived'
    `;
    const params: any[] = [productId];
    let paramIdx = 2;

    if (domainType) {
      candidateQuery += ` AND p.domain_type = $${paramIdx++}`;
      params.push(domainType);
    } else if (source.domain_type) {
      candidateQuery += ` AND p.domain_type = $${paramIdx++}`;
      params.push(source.domain_type);
    }

    candidateQuery += ` LIMIT 200`;
    const candidates: any[] = await this.repo.manager.query(candidateQuery, params);
    if (!candidates.length) return [];

    const candidateIds = candidates.map((c) => c.product_id);

    // Batch fetch key ingredients for all candidates
    const candidateIngredients: any[] = await this.repo.manager.query(
      `SELECT pi.product_id, pi.ingredient_id, i.inci_name
       FROM product_ingredients pi
       JOIN ingredients i ON i.ingredient_id = pi.ingredient_id
       WHERE pi.product_id = ANY($1) AND pi.is_key_ingredient = true`,
      [candidateIds],
    );

    // Batch fetch need scores for all candidates
    const candidateNeedScores: any[] = await this.repo.manager.query(
      `SELECT pns.product_id, pns.need_id, n.need_name, pns.compatibility_score
       FROM product_need_scores pns
       JOIN needs n ON n.need_id = pns.need_id
       WHERE pns.product_id = ANY($1)`,
      [candidateIds],
    );

    // Batch fetch lowest prices
    const candidatePrices: any[] = await this.repo.manager.query(
      `SELECT DISTINCT ON (al.product_id) al.product_id, al.price_snapshot
       FROM affiliate_links al
       WHERE al.product_id = ANY($1) AND al.is_active = true AND al.price_snapshot IS NOT NULL
       ORDER BY al.product_id, al.price_snapshot ASC`,
      [candidateIds],
    );

    // Batch fetch images
    const candidateImages: any[] = await this.repo.manager.query(
      `SELECT DISTINCT ON (pi.product_id) pi.product_id, pi.image_url
       FROM product_images pi
       WHERE pi.product_id = ANY($1)
       ORDER BY pi.product_id, pi.sort_order ASC`,
      [candidateIds],
    );

    // Index by product_id
    const ingByProduct = new Map<number, { ingredient_id: number; name: string }[]>();
    for (const row of candidateIngredients) {
      if (!ingByProduct.has(row.product_id)) ingByProduct.set(row.product_id, []);
      ingByProduct.get(row.product_id)!.push({ ingredient_id: row.ingredient_id, name: row.inci_name });
    }

    const needByProduct = new Map<number, { need_id: number; name: string; score: number }[]>();
    for (const row of candidateNeedScores) {
      if (!needByProduct.has(row.product_id)) needByProduct.set(row.product_id, []);
      needByProduct.get(row.product_id)!.push({
        need_id: row.need_id,
        name: row.need_name,
        score: Number(row.compatibility_score) || 0,
      });
    }

    const priceByProduct = new Map<number, number>();
    for (const row of candidatePrices) {
      priceByProduct.set(row.product_id, Number(row.price_snapshot));
    }

    const imageByProduct = new Map<number, string>();
    for (const row of candidateImages) {
      imageByProduct.set(row.product_id, row.image_url);
    }

    // Calculate similarity scores
    const sourceIngIds = new Set(sourceKeyIngredients.map((i) => i.ingredient_id));
    const sourceNeedIds = new Set(sourceNeeds.map((n) => n.need_id));

    const scored = candidates.map((c) => {
      const cIngredients = ingByProduct.get(c.product_id) || [];
      const cNeeds = needByProduct.get(c.product_id) || [];
      const cPrice = priceByProduct.get(c.product_id);

      // Category similarity (0.3)
      const categoryScore = (source.category_id && c.category_id === source.category_id) ? 1 : 0;

      // Shared ingredients (0.4) — Jaccard-like
      const cIngIds = new Set(cIngredients.map((i) => i.ingredient_id));
      const sharedIngIds = [...sourceIngIds].filter((id) => cIngIds.has(id));
      const unionSize = new Set([...sourceIngIds, ...cIngIds]).size;
      const ingredientScore = unionSize > 0 ? sharedIngIds.length / unionSize : 0;

      // Shared needs (0.2) — cosine-like on top needs
      const cNeedIds = new Set(cNeeds.map((n) => n.need_id));
      const sharedNeedIds = [...sourceNeedIds].filter((id) => cNeedIds.has(id));
      const needUnion = new Set([...sourceNeedIds, ...cNeedIds]).size;
      const needScore = needUnion > 0 ? sharedNeedIds.length / needUnion : 0;

      // Price similarity (0.1) — within ±30%
      let priceScore = 0.5; // default if no price data
      if (sourcePrice && cPrice) {
        const ratio = Math.min(sourcePrice, cPrice) / Math.max(sourcePrice, cPrice);
        priceScore = ratio >= 0.7 ? ratio : ratio * 0.5;
      }

      const totalScore = Math.round(
        (categoryScore * 0.3 + ingredientScore * 0.4 + needScore * 0.2 + priceScore * 0.1) * 100,
      );

      // Shared ingredient names
      const sharedIngredients = sourceKeyIngredients
        .filter((i) => cIngIds.has(i.ingredient_id))
        .map((i) => i.name);

      // Shared need names
      const sharedNeeds = sourceNeeds
        .filter((n) => cNeedIds.has(n.need_id))
        .map((n) => n.name);

      // Price comparison
      let priceComparison: 'cheaper' | 'similar' | 'expensive' | null = null;
      if (sourcePrice && cPrice) {
        const diff = (cPrice - sourcePrice) / sourcePrice;
        if (diff < -0.1) priceComparison = 'cheaper';
        else if (diff > 0.1) priceComparison = 'expensive';
        else priceComparison = 'similar';
      }

      return {
        product: {
          product_id: c.product_id,
          product_name: c.product_name,
          product_slug: c.product_slug,
          domain_type: c.domain_type,
          brand_name: c.brand_name,
          brand_slug: c.brand_slug,
          image_url: imageByProduct.get(c.product_id) || null,
          price: cPrice || null,
        },
        similarity_score: totalScore,
        shared_ingredients: sharedIngredients,
        shared_needs: sharedNeeds,
        price_comparison: priceComparison,
      };
    });

    // Sort by similarity desc, take top N
    scored.sort((a, b) => b.similarity_score - a.similarity_score);
    return scored.slice(0, limit);
  }

  private getLowestPrice(product: any): number | null {
    const links = product.affiliate_links || [];
    const prices = links
      .filter((l: any) => l.is_active && l.price_snapshot)
      .map((l: any) => Number(l.price_snapshot));
    return prices.length ? Math.min(...prices) : null;
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

  // === Affiliate Click Tracking ===

  async trackClick(data: { affiliate_link_id: number; source_page?: string; ip_hash?: string; user_agent?: string }) {
    const entity = this.clickRepo.create(data);
    return this.clickRepo.save(entity);
  }

  async getAffiliateHealth() {
    const stats = await this.affiliateRepo
      .createQueryBuilder('al')
      .select('al.verification_status', 'status')
      .addSelect('al.platform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .groupBy('al.verification_status')
      .addGroupBy('al.platform')
      .getRawMany();

    const total = stats.reduce((s, r) => s + parseInt(r.count), 0);
    const byStatus: Record<string, number> = {};
    const byPlatform: Record<string, Record<string, number>> = {};

    for (const row of stats) {
      const st = row.status || 'unverified';
      byStatus[st] = (byStatus[st] || 0) + parseInt(row.count);
      if (!byPlatform[row.platform]) byPlatform[row.platform] = {};
      byPlatform[row.platform][st] = parseInt(row.count);
    }

    return { total, byStatus, byPlatform };
  }
}
