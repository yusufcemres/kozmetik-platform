import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IngredientInteraction, ProductIngredient } from '@database/entities';
import { PaginationDto } from '@common/dto/pagination.dto';
import { CreateInteractionDto, UpdateInteractionDto } from './dto/create-interaction.dto';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(IngredientInteraction)
    private readonly repo: Repository<IngredientInteraction>,
    @InjectRepository(ProductIngredient)
    private readonly piRepo: Repository<ProductIngredient>,
  ) {}

  async create(dto: CreateInteractionDto) {
    const entity = this.repo.create({
      ...dto,
      domain_type: dto.domain_type || 'both',
      interaction_context: dto.interaction_context || 'ingredient',
    });
    return this.repo.save(entity);
  }

  async findAll(query: PaginationDto & { severity?: string; domain_type?: string }) {
    const { page, limit, search, severity, domain_type } = query;
    const qb = this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.ingredient_a', 'a')
      .leftJoinAndSelect('i.ingredient_b', 'b')
      .where('i.is_active = true');

    if (severity) qb.andWhere('i.severity = :severity', { severity });
    if (domain_type) qb.andWhere('i.domain_type IN (:...dt)', { dt: [domain_type, 'both'] });
    if (search) {
      qb.andWhere('(a.inci_name ILIKE :s OR b.inci_name ILIKE :s OR i.description ILIKE :s)', { s: `%${search}%` });
    }

    qb.orderBy('i.severity', 'DESC').addOrderBy('i.created_at', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({
      where: { interaction_id: id },
      relations: ['ingredient_a', 'ingredient_b'],
    });
    if (!entity) throw new NotFoundException('Etkileşim bulunamadı');
    return entity;
  }

  async update(id: number, dto: UpdateInteractionDto) {
    const entity = await this.repo.findOne({ where: { interaction_id: id } });
    if (!entity) throw new NotFoundException('Etkileşim bulunamadı');
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.repo.findOne({ where: { interaction_id: id } });
    if (!entity) throw new NotFoundException('Etkileşim bulunamadı');
    await this.repo.remove(entity);
    return { deleted: true };
  }

  /**
   * Bir ingredient'ın tüm etkileşimlerini getir
   */
  async findByIngredient(ingredientId: number) {
    return this.repo.find({
      where: [
        { ingredient_a_id: ingredientId, is_active: true },
        { ingredient_b_id: ingredientId, is_active: true },
      ],
      relations: ['ingredient_a', 'ingredient_b'],
      order: { severity: 'DESC' },
    });
  }

  /**
   * Birden fazla ürün arasındaki ingredient etkileşimlerini kontrol et
   * (Rutin oluşturucu ve karşılaştırma için)
   */
  async checkProductInteractions(productIds: number[]) {
    // Get all ingredient IDs from these products
    const productIngredients = await this.piRepo.find({
      where: { product_id: In(productIds) },
      relations: ['ingredient'],
    });

    const ingredientIds = [...new Set(productIngredients.map((pi) => pi.ingredient_id))];
    if (ingredientIds.length < 2) return [];

    // Find interactions between these ingredients
    const interactions = await this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.ingredient_a', 'a')
      .leftJoinAndSelect('i.ingredient_b', 'b')
      .where('i.is_active = true')
      .andWhere('i.ingredient_a_id IN (:...ids)', { ids: ingredientIds })
      .andWhere('i.ingredient_b_id IN (:...ids)', { ids: ingredientIds })
      .orderBy('i.severity', 'DESC')
      .getMany();

    return interactions.map((inter) => ({
      interaction_id: inter.interaction_id,
      ingredient_a: inter.ingredient_a?.inci_name,
      ingredient_b: inter.ingredient_b?.inci_name,
      severity: inter.severity,
      description: inter.description,
      recommendation: inter.recommendation,
    }));
  }
}
