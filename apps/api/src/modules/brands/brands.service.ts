import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Brand } from '@database/entities';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { turkishSlug } from '@common/utils/turkish-slug';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto) {
    const slug = turkishSlug(dto.brand_name);
    const exists = await this.repo.findOne({ where: { brand_slug: slug } });
    if (exists) {
      throw new ConflictException(`"${dto.brand_name}" zaten mevcut`);
    }
    const entity = this.repo.create({ ...dto, brand_slug: slug });
    return this.repo.save(entity);
  }

  async findAll(query: PaginationDto) {
    const { page, limit, search } = query;
    const where: any = {};
    if (search) {
      where.brand_name = Like(`%${search}%`);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { brand_name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({ where: { brand_id: id } });
    if (!entity) throw new NotFoundException('Marka bulunamadı');
    return entity;
  }

  async findBySlug(slug: string) {
    const entity = await this.repo.findOne({ where: { brand_slug: slug } });
    if (!entity) throw new NotFoundException('Marka bulunamadı');
    return entity;
  }

  async update(id: number, dto: UpdateBrandDto) {
    const entity = await this.findOne(id);
    if (dto.brand_name) {
      entity.brand_slug = turkishSlug(dto.brand_name);
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
