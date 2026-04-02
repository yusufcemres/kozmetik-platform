import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EvidenceLevel, ApprovedWording } from '@database/entities';
import { PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class MethodologyService {
  constructor(
    @InjectRepository(EvidenceLevel)
    private readonly evidenceRepo: Repository<EvidenceLevel>,
    @InjectRepository(ApprovedWording)
    private readonly wordingRepo: Repository<ApprovedWording>,
  ) {}

  // === Evidence Levels ===

  async getEvidenceLevels() {
    return this.evidenceRepo.find({ order: { rank_order: 'ASC' } });
  }

  async updateEvidenceLevel(id: number, data: Partial<EvidenceLevel>) {
    const entity = await this.evidenceRepo.findOne({ where: { evidence_level_id: id } });
    if (!entity) throw new NotFoundException('Kanıt seviyesi bulunamadı');
    Object.assign(entity, data);
    return this.evidenceRepo.save(entity);
  }

  // === Approved Wordings ===

  async getApprovedWordings(query: PaginationDto & { category?: string }) {
    const { page, limit, search, category } = query;
    const where: any = {};
    if (search) where.approved_text = Like(`%${search}%`);
    if (category) where.category = category;

    const [data, total] = await this.wordingRepo.findAndCount({
      where,
      order: { category: 'ASC', approved_text: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createWording(data: Partial<ApprovedWording>) {
    const entity = this.wordingRepo.create(data);
    return this.wordingRepo.save(entity);
  }

  async updateWording(id: number, data: Partial<ApprovedWording>) {
    const entity = await this.wordingRepo.findOne({ where: { wording_id: id } });
    if (!entity) throw new NotFoundException('İfade bulunamadı');
    Object.assign(entity, data);
    return this.wordingRepo.save(entity);
  }

  async removeWording(id: number) {
    const entity = await this.wordingRepo.findOne({ where: { wording_id: id } });
    if (!entity) throw new NotFoundException('İfade bulunamadı');
    entity.is_active = false;
    return this.wordingRepo.save(entity);
  }
}
