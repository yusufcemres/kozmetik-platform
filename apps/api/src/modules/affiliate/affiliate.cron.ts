import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AffiliateService } from './affiliate.service';

@Injectable()
export class AffiliateCronService {
  private readonly logger = new Logger(AffiliateCronService.name);

  constructor(private readonly affiliateService: AffiliateService) {}

  /**
   * Her gün saat 04:00'te tüm aktif linklerin fiyatlarını güncelle
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM, { name: 'daily-price-update' })
  async handleDailyPriceUpdate() {
    const startedAt = Date.now();
    this.logger.log(JSON.stringify({ event: 'cron.price_update.started', cron: 'daily-price-update' }));
    try {
      const result = await this.affiliateService.batchUpdatePrices();
      const duration_ms = Date.now() - startedAt;
      this.logger.log(
        JSON.stringify({
          event: 'cron.price_update.completed',
          cron: 'daily-price-update',
          total: result.total,
          updated: result.updated,
          errors: result.errors,
          quarantined: result.quarantined,
          error_breakdown: result.error_breakdown,
          duration_ms,
        }),
      );
    } catch (err) {
      const duration_ms = Date.now() - startedAt;
      this.logger.error(
        JSON.stringify({
          event: 'cron.price_update.failed',
          cron: 'daily-price-update',
          duration_ms,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  }

  /**
   * Her 6 saatte bir stale fiyatları kontrol et (7+ gün güncellenmemiş)
   */
  @Cron(CronExpression.EVERY_6_HOURS, { name: 'stale-price-check' })
  async handleStalePriceCheck() {
    const startedAt = Date.now();
    try {
      const metrics = await this.affiliateService.getAffiliateMetrics();
      const duration_ms = Date.now() - startedAt;
      this.logger.log(
        JSON.stringify({
          event: 'cron.stale_price_check.completed',
          cron: 'stale-price-check',
          stale_prices: metrics.stale_prices,
          duration_ms,
        }),
      );
      if (metrics.stale_prices > 0) {
        this.logger.warn(
          JSON.stringify({
            event: 'cron.stale_price_check.alert',
            stale_prices: metrics.stale_prices,
            threshold_days: 7,
          }),
        );
      }
    } catch (err) {
      this.logger.error(
        JSON.stringify({
          event: 'cron.stale_price_check.failed',
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  }
}
