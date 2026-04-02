import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientNeedMapping } from '@database/entities';
import { CreateIngredientNeedMappingDto } from './dto/create-mapping.dto';
import { UpdateIngredientNeedMappingDto } from './dto/update-mapping.dto';
import { PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class MappingsService {
  constructor(
    @InjectRepository(IngredientNeedMapping)
    private readonly repo: Repository<IngredientNeedMapping>,
  ) {}

  async create(dto: CreateIngredientNeedMappingDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(query: PaginationDto & { ingredient_id?: number; need_id?: number }) {
    const { page, limit, ingredient_id, need_id } = query;
    const where: any = {};
    if (ingredient_id) where.ingredient_id = ingredient_id;
    if (need_id) where.need_id = need_id;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['ingredient', 'need'],
      order: { relevance_score: 'DESC' },
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
      where: { ingredient_need_mapping_id: id },
      relations: ['ingredient', 'need'],
    });
    if (!entity) throw new NotFoundException('Eşleşme bulunamadı');
    return entity;
  }

  async findByIngredient(ingredientId: number) {
    return this.repo.find({
      where: { ingredient_id: ingredientId },
      relations: ['need'],
      order: { relevance_score: 'DESC' },
    });
  }

  async findByNeed(needId: number) {
    return this.repo.find({
      where: { need_id: needId },
      relations: ['ingredient'],
      order: { relevance_score: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateIngredientNeedMappingDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    return this.repo.remove(entity);
  }
}
