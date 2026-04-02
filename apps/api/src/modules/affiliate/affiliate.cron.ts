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
    this.logger.log('Starting daily price update...');
    try {
      const result = await this.affiliateService.batchUpdatePrices();
      this.logger.log(
        `Daily price update complete: ${result.updated}/${result.total} updated, ${result.errors} errors`,
      );
    } catch (err) {
      this.logger.error('Daily price update failed', err);
    }
  }

  /**
   * Her 6 saatte bir stale fiyatları kontrol et (7+ gün güncellenmemiş)
   */
  @Cron(CronExpression.EVERY_6_HOURS, { name: 'stale-price-check' })
  async handleStalePriceCheck() {
    this.logger.log('Checking for stale prices...');
    try {
      const metrics = await this.affiliateService.getAffiliateMetrics();
      if (metrics.stale_prices > 0) {
        this.logger.warn(`${metrics.stale_prices} affiliate links have stale prices (>7 days)`);
      }
    } catch (err) {
      this.logger.error('Stale price check failed', err);
    }
  }
}
