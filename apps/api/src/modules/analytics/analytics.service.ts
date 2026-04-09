import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AnalyticsEvent } from '../../database/entities/analytics-event.entity';
import { EventDto, ALLOWED_EVENT_TYPES } from './dto/batch-events.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly repo: Repository<AnalyticsEvent>,
  ) {}

  async ingestBatch(events: EventDto[], ip: string): Promise<number> {
    const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16);

    const validEvents = events.filter((e) =>
      ALLOWED_EVENT_TYPES.includes(e.event_type),
    );

    if (validEvents.length === 0) return 0;

    const entities = validEvents.map((e) => ({
      visitor_id: e.visitor_id,
      session_id: e.session_id || undefined,
      event_type: e.event_type,
      product_id: e.product_id || undefined,
      brand_id: e.brand_id || undefined,
      page_path: e.page_path || undefined,
      properties: e.properties || undefined,
      device_type: e.device_type || undefined,
      ip_hash: ipHash,
    }));

    await this.repo
      .createQueryBuilder()
      .insert()
      .into(AnalyticsEvent)
      .values(entities)
      .execute();

    return validEvents.length;
  }

  async getSummary(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [byType, byDay, topProducts] = await Promise.all([
      // Event count by type
      this.repo
        .createQueryBuilder('e')
        .select('e.event_type', 'event_type')
        .addSelect('COUNT(*)::int', 'count')
        .where('e.created_at >= :since', { since })
        .groupBy('e.event_type')
        .orderBy('count', 'DESC')
        .getRawMany(),

      // Daily totals
      this.repo
        .createQueryBuilder('e')
        .select("DATE(e.created_at)", 'date')
        .addSelect('COUNT(*)::int', 'count')
        .addSelect('COUNT(DISTINCT e.visitor_id)::int', 'unique_visitors')
        .where('e.created_at >= :since', { since })
        .groupBy('date')
        .orderBy('date', 'DESC')
        .getRawMany(),

      // Top 10 most viewed products
      this.repo
        .createQueryBuilder('e')
        .select('e.product_id', 'product_id')
        .addSelect('COUNT(*)::int', 'views')
        .addSelect('COUNT(DISTINCT e.visitor_id)::int', 'unique_visitors')
        .where('e.created_at >= :since', { since })
        .andWhere('e.event_type = :type', { type: 'product_view' })
        .andWhere('e.product_id IS NOT NULL')
        .groupBy('e.product_id')
        .orderBy('views', 'DESC')
        .limit(10)
        .getRawMany(),
    ]);

    return { days, since, by_type: byType, by_day: byDay, top_products: topProducts };
  }
}
