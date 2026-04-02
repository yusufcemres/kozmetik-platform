import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SupplementDetail,
  SupplementIngredient,
  Product,
} from '@database/entities';
import { PaginationDto } from '@common/dto/pagination.dto';
import { CreateSupplementDetailDto, UpdateSupplementDetailDto } from './dto/create-supplement.dto';

@Injectable()
export class SupplementsService {
  constructor(
    @InjectRepository(SupplementDetail)
    private readonly detailRepo: Repository<SupplementDetail>,
    @InjectRepository(SupplementIngredient)
    private readonly ingredientRepo: Repository<SupplementIngredient>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // === Supplement Details ===

  async create(dto: CreateSupplementDetailDto) {
    // Verify product exists and is supplement type
    const product = await this.productRepo.findOne({ where: { product_id: dto.product_id } });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    if (product.domain_type !== 'supplement') {
      throw new BadRequestException('Bu ürün supplement tipinde değil. Önce domain_type=supplement yapın.');
    }

    // Check if detail already exists
    const existing = await this.detailRepo.findOne({ where: { product_id: dto.product_id } });
    if (existing) throw new BadRequestException('Bu ürünün supplement detayı zaten var');

    const { ingredients, ...detailData } = dto;
    const detail = await this.detailRepo.save(this.detailRepo.create(detailData));

    // Save nutrition facts
    if (ingredients && ingredients.length > 0) {
      const items = ingredients.map((ing, i) =>
        this.ingredientRepo.create({
          product_id: dto.product_id,
          ingredient_id: ing.ingredient_id,
          amount_per_serving: ing.amount_per_serving,
          unit: ing.unit,
          daily_value_percentage: ing.daily_value_percentage,
          is_proprietary_blend: ing.is_proprietary_blend ?? false,
          sort_order: ing.sort_order ?? i,
        }),
      );
      await this.ingredientRepo.save(items);
    }

    return this.findByProductId(dto.product_id);
  }

  async findByProductId(productId: number) {
    const detail = await this.detailRepo.findOne({
      where: { product_id: productId },
      relations: ['product'],
    });
    if (!detail) throw new NotFoundException('Supplement detayı bulunamadı');

    const ingredients = await this.ingredientRepo.find({
      where: { product_id: productId },
      relations: ['ingredient'],
      order: { sort_order: 'ASC' },
    });

    return { ...detail, nutrition_facts: ingredients };
  }

  async update(productId: number, dto: UpdateSupplementDetailDto) {
    const detail = await this.detailRepo.findOne({ where: { product_id: productId } });
    if (!detail) throw new NotFoundException('Supplement detayı bulunamadı');

    Object.assign(detail, dto);
    await this.detailRepo.save(detail);
    return this.findByProductId(productId);
  }

  async remove(productId: number) {
    const detail = await this.detailRepo.findOne({ where: { product_id: productId } });
    if (!detail) throw new NotFoundException('Supplement detayı bulunamadı');

    await this.ingredientRepo.delete({ product_id: productId });
    await this.detailRepo.remove(detail);
    return { deleted: true };
  }

  // === Nutrition Facts (Supplement Ingredients) ===

  async addNutritionFact(productId: number, data: {
    ingredient_id: number;
    amount_per_serving?: number;
    unit?: string;
    daily_value_percentage?: number;
    is_proprietary_blend?: boolean;
    sort_order?: number;
  }) {
    const detail = await this.detailRepo.findOne({ where: { product_id: productId } });
    if (!detail) throw new NotFoundException('Supplement detayı bulunamadı');

    const item = this.ingredientRepo.create({ product_id: productId, ...data });
    return this.ingredientRepo.save(item);
  }

  async updateNutritionFact(id: number, data: Partial<SupplementIngredient>) {
    const item = await this.ingredientRepo.findOne({ where: { supplement_ingredient_id: id } });
    if (!item) throw new NotFoundException('Besin bilgisi bulunamadı');

    Object.assign(item, data);
    return this.ingredientRepo.save(item);
  }

  async removeNutritionFact(id: number) {
    const item = await this.ingredientRepo.findOne({ where: { supplement_ingredient_id: id } });
    if (!item) throw new NotFoundException('Besin bilgisi bulunamadı');

    await this.ingredientRepo.remove(item);
    return { deleted: true };
  }

  // === Supplement Products Listing ===

  async findAllSupplements(query: PaginationDto) {
    const { page, limit, search } = query;
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .where('p.domain_type = :domain', { domain: 'supplement' });

    if (search) {
      qb.andWhere('p.product_name ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('p.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
