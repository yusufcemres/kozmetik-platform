import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCorrection, AuditLog, BatchImport } from '@database/entities';
import { PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(UserCorrection)
    private readonly correctionRepo: Repository<UserCorrection>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(BatchImport)
    private readonly importRepo: Repository<BatchImport>,
  ) {}

  // === User Corrections ===

  async createCorrection(data: {
    entity_type: string;
    entity_id: number;
    correction_text: string;
    reporter_email?: string;
  }) {
    const entity = this.correctionRepo.create(data);
    return this.correctionRepo.save(entity);
  }

  async getCorrections(query: PaginationDto & { status?: string }) {
    const { page, limit, status } = query;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.correctionRepo.findAndCount({
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

  async updateCorrectionStatus(id: number, status: string, adminNote?: string) {
    const entity = await this.correctionRepo.findOne({ where: { correction_id: id } });
    if (!entity) throw new NotFoundException('Düzeltme bulunamadı');
    entity.status = status;
    if (adminNote) entity.admin_note = adminNote;
    return this.correctionRepo.save(entity);
  }

  // === Audit Logs ===

  async getAuditLogs(query: PaginationDto & { entity_type?: string }) {
    const { page, limit, entity_type } = query;
    const where: any = {};
    if (entity_type) where.entity_type = entity_type;

    const [data, total] = await this.auditRepo.findAndCount({
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

  async createAuditLog(data: {
    entity_type: string;
    entity_id: number;
    action: string;
    changes?: any;
    admin_user_id?: number;
    admin_email?: string;
  }) {
    const entity = this.auditRepo.create(data);
    return this.auditRepo.save(entity);
  }

  // === Batch Imports ===

  async getBatchImports(query: PaginationDto) {
    const { page, limit } = query;
    const [data, total] = await this.importRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
