import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  ContentArticle, ProductRelatedArticle,
  IngredientRelatedArticle, NeedRelatedArticle,
} from '@database/entities';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { turkishSlug } from '@common/utils/turkish-slug';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentArticle)
    private readonly repo: Repository<ContentArticle>,
    @InjectRepository(ProductRelatedArticle)
    private readonly productArticleRepo: Repository<ProductRelatedArticle>,
    @InjectRepository(IngredientRelatedArticle)
    private readonly ingredientArticleRepo: Repository<IngredientRelatedArticle>,
    @InjectRepository(NeedRelatedArticle)
    private readonly needArticleRepo: Repository<NeedRelatedArticle>,
  ) {}

  async create(dto: CreateArticleDto) {
    const { product_ids, ingredient_ids, need_ids, ...articleData } = dto;
    const slug = turkishSlug(dto.title);
    const entity = this.repo.create({ ...articleData, slug });
    const saved = await this.repo.save(entity);

    await this.saveRelations(saved.article_id, product_ids, ingredient_ids, need_ids);
    return this.findOne(saved.article_id);
  }

  async findAll(query: PaginationDto & { content_type?: string; status?: string }) {
    const { page, limit, search, content_type, status } = query;
    const where: any = {};
    if (search) where.title = Like(`%${search}%`);
    if (content_type) where.content_type = content_type;
    if (status) where.status = status;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPublished(query: PaginationDto & { content_type?: string }) {
    const { page, limit, content_type } = query;
    const where: any = { status: 'published' };
    if (content_type) where.content_type = content_type;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { published_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({ where: { article_id: id } });
    if (!entity) throw new NotFoundException('Makale bulunamadı');
    return entity;
  }

  async findBySlug(slug: string) {
    const entity = await this.repo.findOne({ where: { slug, status: 'published' } });
    if (!entity) throw new NotFoundException('Makale bulunamadı');

    const [productLinks, ingredientLinks, needLinks] = await Promise.all([
      this.productArticleRepo
        .createQueryBuilder('pa')
        .leftJoin('products', 'p', 'p.product_id = pa.product_id')
        .leftJoin('brands', 'b', 'b.brand_id = p.brand_id')
        .where('pa.article_id = :id', { id: entity.article_id })
        .select(['p.product_id AS product_id', 'p.product_name AS product_name', 'p.product_slug AS product_slug', 'b.brand_name AS brand_name'])
        .getRawMany(),
      this.ingredientArticleRepo
        .createQueryBuilder('ia')
        .leftJoin('ingredients', 'i', 'i.ingredient_id = ia.ingredient_id')
        .where('ia.article_id = :id', { id: entity.article_id })
        .select(['i.ingredient_id AS ingredient_id', 'i.inci_name AS inci_name', 'i.ingredient_slug AS ingredient_slug', 'i.common_name AS common_name'])
        .getRawMany(),
      this.needArticleRepo
        .createQueryBuilder('na')
        .leftJoin('needs', 'n', 'n.need_id = na.need_id')
        .where('na.article_id = :id', { id: entity.article_id })
        .select(['n.need_id AS need_id', 'n.need_name AS need_name', 'n.need_slug AS need_slug', 'n.user_friendly_label AS user_friendly_label'])
        .getRawMany(),
    ]);

    return {
      ...entity,
      related_products: productLinks.filter((r) => r.product_id),
      related_ingredients: ingredientLinks.filter((r) => r.ingredient_id),
      related_needs: needLinks.filter((r) => r.need_id),
    };
  }

  async getSitemap() {
    const rows = await this.repo.find({
      where: { status: 'published' },
      select: ['slug', 'updated_at'],
      order: { updated_at: 'DESC' },
    });
    return rows.map((r) => ({ slug: r.slug, updated_at: r.updated_at }));
  }

  async update(id: number, dto: UpdateArticleDto) {
    const entity = await this.findOne(id);
    const { product_ids, ingredient_ids, need_ids, ...articleData } = dto;

    if (articleData.title) {
      entity.slug = turkishSlug(articleData.title);
    }
    if (articleData.status === 'published' && !entity.published_at) {
      entity.published_at = new Date();
    }
    Object.assign(entity, articleData);
    await this.repo.save(entity);

    if (product_ids !== undefined || ingredient_ids !== undefined || need_ids !== undefined) {
      await this.saveRelations(id, product_ids, ingredient_ids, need_ids);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    entity.status = 'archived';
    return this.repo.save(entity);
  }

  private async saveRelations(
    articleId: number,
    productIds?: number[],
    ingredientIds?: number[],
    needIds?: number[],
  ) {
    if (productIds !== undefined) {
      await this.productArticleRepo.delete({ article_id: articleId });
      if (productIds.length) {
        await this.productArticleRepo.save(
          productIds.map((pid) => ({ product_id: pid, article_id: articleId })),
        );
      }
    }
    if (ingredientIds !== undefined) {
      await this.ingredientArticleRepo.delete({ article_id: articleId });
      if (ingredientIds.length) {
        await this.ingredientArticleRepo.save(
          ingredientIds.map((iid) => ({ ingredient_id: iid, article_id: articleId })),
        );
      }
    }
    if (needIds !== undefined) {
      await this.needArticleRepo.delete({ article_id: articleId });
      if (needIds.length) {
        await this.needArticleRepo.save(
          needIds.map((nid) => ({ need_id: nid, article_id: articleId })),
        );
      }
    }
  }
}
