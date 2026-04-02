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

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['aliases', 'evidence_links'],
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
    // Uses trigram similarity for fuzzy matching
    const results = await this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.aliases', 'a')
      .where(
        `(i.inci_name ILIKE :like OR i.common_name ILIKE :like OR a.alias_name ILIKE :like)`,
        { like: `%${term}%` },
      )
      .andWhere('i.is_active = true')
      .orderBy('i.inci_name', 'ASC')
      .take(limit)
      .getMany();

    return results;
  }
}
