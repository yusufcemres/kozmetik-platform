import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceAlert } from '@database/entities';

@Injectable()
export class PriceAlertsService {
  constructor(
    @InjectRepository(PriceAlert)
    private readonly repo: Repository<PriceAlert>,
  ) {}

  async create(data: { product_id: number; push_subscription: Record<string, unknown>; target_price?: number }) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findByProduct(productId: number) {
    return this.repo.find({
      where: { product_id: productId, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async remove(alertId: number) {
    const entity = await this.repo.findOne({ where: { alert_id: alertId } });
    if (!entity) throw new NotFoundException('Alert bulunamadı');
    entity.is_active = false;
    return this.repo.save(entity);
  }

  async getActiveAlerts() {
    return this.repo.find({
      where: { is_active: true },
      relations: ['product'],
    });
  }
}
