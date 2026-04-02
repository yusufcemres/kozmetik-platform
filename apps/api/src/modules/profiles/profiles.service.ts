import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSkinProfile } from '@database/entities';
import { CreateSkinProfileDto } from './dto/create-profile.dto';
import { UpdateSkinProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(UserSkinProfile)
    private readonly repo: Repository<UserSkinProfile>,
  ) {}

  async create(dto: CreateSkinProfileDto) {
    const exists = await this.repo.findOne({
      where: { anonymous_id: dto.anonymous_id },
    });
    if (exists) {
      throw new ConflictException('Bu profil zaten mevcut');
    }
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findByAnonymousId(anonymousId: string) {
    const entity = await this.repo.findOne({
      where: { anonymous_id: anonymousId },
    });
    if (!entity) throw new NotFoundException('Profil bulunamadı');
    return entity;
  }

  async update(anonymousId: string, dto: UpdateSkinProfileDto) {
    const entity = await this.findByAnonymousId(anonymousId);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
