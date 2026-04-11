import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Need } from '@database/entities';
import { CreateNeedDto } from './dto/create-need.dto';
import { UpdateNeedDto } from './dto/update-need.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { turkishSlug } from '@common/utils/turkish-slug';

@Injectable()
export class NeedsService {
  constructor(
    @InjectRepository(Need)
    private readonly repo: Repository<Need>,
  ) {}

  async create(dto: CreateNeedDto) {
    const slug = turkishSlug(dto.need_name);
    const exists = await this.repo.findOne({ where: { need_slug: slug } });
    if (exists) {
      throw new ConflictException(`"${dto.need_name}" zaten mevcut`);
    }
    const entity = this.repo.create({ ...dto, need_slug: slug });
    return this.repo.save(entity);
  }

  async findAll(query: PaginationDto & { need_category?: string; domain_type?: string }) {
    const { page, limit, search, need_category, domain_type } = query;
    const where: any = {};
    if (search) {
      where.need_name = Like(`%${search}%`);
    }
    if (need_category) {
      where.need_category = need_category;
    }
    if (domain_type) {
      where.domain_type = domain_type;
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { need_category: 'ASC', need_group: 'ASC', need_name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({ where: { need_id: id } });
    if (!entity) throw new NotFoundException('İhtiyaç bulunamadı');
    return entity;
  }

  async findBySlug(slug: string) {
    const entity = await this.repo.findOne({ where: { need_slug: slug } });
    if (!entity) throw new NotFoundException('İhtiyaç bulunamadı');
    return entity;
  }

  async update(id: number, dto: UpdateNeedDto) {
    const entity = await this.findOne(id);
    if (dto.need_name) {
      entity.need_slug = turkishSlug(dto.need_name);
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    entity.is_active = false;
    return this.repo.save(entity);
  }
}
