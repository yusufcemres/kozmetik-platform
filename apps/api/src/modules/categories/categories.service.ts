import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Category } from '@database/entities';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { turkishSlug } from '@common/utils/turkish-slug';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const slug = turkishSlug(dto.category_name);
    const exists = await this.repo.findOne({ where: { category_slug: slug } });
    if (exists) {
      throw new ConflictException(`"${dto.category_name}" zaten mevcut`);
    }

    const entity = this.repo.create({ ...dto, category_slug: slug });
    return this.repo.save(entity);
  }

  async findAll(query: PaginationDto) {
    const { page, limit, search } = query;
    const where: any = {};
    if (search) {
      where.category_name = Like(`%${search}%`);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['parent'],
      order: { sort_order: 'ASC', category_name: 'ASC' },
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
      where: { category_id: id },
      relations: ['parent'],
    });
    if (!entity) throw new NotFoundException('Kategori bulunamadı');
    return entity;
  }

  async findBySlug(slug: string) {
    const entity = await this.repo.findOne({
      where: { category_slug: slug },
      relations: ['parent'],
    });
    if (!entity) throw new NotFoundException('Kategori bulunamadı');
    return entity;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const entity = await this.findOne(id);
    if (dto.category_name) {
      entity.category_slug = turkishSlug(dto.category_name);
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    entity.is_active = false;
    return this.repo.save(entity);
  }

  async getTree() {
    const all = await this.repo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });

    const roots = all.filter((c) => !c.parent_category_id);
    const buildChildren = (parentId: number): any[] =>
      all
        .filter((c) => c.parent_category_id === parentId)
        .map((c) => ({ ...c, children: buildChildren(c.category_id) }));

    return roots.map((r) => ({ ...r, children: buildChildren(r.category_id) }));
  }
}
