import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { AffiliateLink, PriceHistory } from '@database/entities';
import { BaseAffiliateProvider, PriceFetchResult, RETRYABLE_ERROR_TYPES } from './providers';
import { TrendyolProvider } from './providers/trendyol.provider';
import { HepsiburadaProvider } from './providers/hepsiburada.provider';
import { AmazonTrProvider } from './providers/amazon.provider';

const MAX_RETRIES = 2; // total attempts = 1 + 2 retries = 3
const QUARANTINE_THRESHOLD = 3; // ardışık başarısızlık sayısı
const BACKOFF_BASE_MS = 1500;

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);
  private readonly providers: Map<string, BaseAffiliateProvider>;

  constructor(
    @InjectRepository(AffiliateLink)
    private readonly linkRepo: Repository<AffiliateLink>,
    @InjectRepository(PriceHistory)
    private readonly priceRepo: Repository<PriceHistory>,
  ) {
    this.providers = new Map<string, BaseAffiliateProvider>([
      ['trendyol', new TrendyolProvider()],
      ['hepsiburada', new HepsiburadaProvider()],
      ['amazon_tr', new AmazonTrProvider()],
    ]);
  }

  private async fetchWithRetry(
    provider: BaseAffiliateProvider,
    url: string,
  ): Promise<{ result: PriceFetchResult; attempts: number }> {
    let attempts = 0;
    let lastResult: PriceFetchResult | null = null;
    for (let i = 0; i <= MAX_RETRIES; i++) {
      attempts++;
      const result = await provider.fetchPrice(url);
      lastResult = result;
      if (result.price != null) return { result, attempts };
      if (!result.error_type || !RETRYABLE_ERROR_TYPES.has(result.error_type)) {
        return { result, attempts };
      }
      if (i < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, BACKOFF_BASE_MS * Math.pow(2, i)));
      }
    }
    return { result: lastResult!, attempts };
  }

  /**
   * Tüm aktif linklerin fiyatını güncelle. Her link için:
   *  - 3 deneme (retryable error_type'lar için exponential backoff)
   *  - Başarıda: consecutive_failures=0, verification_status='valid'
   *  - Başarısızlıkta: consecutive_failures++, eşiğe ulaşırsa 'needs_review'
   *  - Structured JSON log per link
   */
  async batchUpdatePrices(): Promise<{
    total: number;
    updated: number;
    errors: number;
    quarantined: number;
    error_breakdown: Record<string, number>;
  }> {
    const activeLinks = await this.linkRepo.find({
      where: { is_active: true },
    });

    let updated = 0;
    let errors = 0;
    let quarantined = 0;
    const errorBreakdown: Record<string, number> = {};

    for (const link of activeLinks) {
      const provider = this.providers.get(link.platform);
      if (!provider) continue;

      try {
        const { result, attempts } = await this.fetchWithRetry(provider, link.affiliate_url);
        const now = new Date();

        if (result.price != null) {
          await this.priceRepo.save(
            this.priceRepo.create({
              affiliate_link_id: link.affiliate_link_id,
              price: result.price,
              in_stock: result.in_stock,
              currency: result.currency,
            }),
          );
          link.price_snapshot = result.price;
          link.price_updated_at = now;
          link.last_attempted_at = now;
          link.consecutive_failures = 0;
          link.last_error_type = null;
          link.last_error_message = null;
          if (link.verification_status === 'unverified' || link.verification_status === 'needs_review') {
            link.verification_status = 'valid';
          }
          await this.linkRepo.save(link);
          updated++;
          this.logger.log(
            JSON.stringify({
              event: 'price_update',
              link_id: link.affiliate_link_id,
              platform: link.platform,
              status: 'ok',
              attempts,
              price: result.price,
              in_stock: result.in_stock,
            }),
          );
        } else {
          const errorType = result.error_type || 'unknown';
          errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1;
          link.last_attempted_at = now;
          link.consecutive_failures = (link.consecutive_failures || 0) + 1;
          link.last_error_type = errorType;
          link.last_error_message = result.error || null;
          if (
            link.consecutive_failures >= QUARANTINE_THRESHOLD &&
            link.verification_status !== 'needs_review' &&
            link.verification_status !== 'dead'
          ) {
            link.verification_status = 'needs_review';
            quarantined++;
          }
          await this.linkRepo.save(link);
          errors++;
          this.logger.warn(
            JSON.stringify({
              event: 'price_update',
              link_id: link.affiliate_link_id,
              platform: link.platform,
              status: 'fail',
              attempts,
              error_type: errorType,
              error: result.error,
              consecutive_failures: link.consecutive_failures,
              quarantined: link.verification_status === 'needs_review',
            }),
          );
        }
      } catch (err: any) {
        errors++;
        errorBreakdown['exception'] = (errorBreakdown['exception'] || 0) + 1;
        this.logger.error(
          JSON.stringify({
            event: 'price_update',
            link_id: link.affiliate_link_id,
            platform: link.platform,
            status: 'exception',
            error: err?.message,
          }),
        );
      }
    }

    this.logger.log(
      JSON.stringify({
        event: 'batch_update_summary',
        total: activeLinks.length,
        updated,
        errors,
        quarantined,
        error_breakdown: errorBreakdown,
      }),
    );

    return {
      total: activeLinks.length,
      updated,
      errors,
      quarantined,
      error_breakdown: errorBreakdown,
    };
  }

  async updateSinglePrice(linkId: number) {
    const link = await this.linkRepo.findOne({ where: { affiliate_link_id: linkId } });
    if (!link) return null;

    const provider = this.providers.get(link.platform);
    if (!provider) return { error: 'Bu platform için provider yok' };

    const { result, attempts } = await this.fetchWithRetry(provider, link.affiliate_url);
    const now = new Date();

    if (result.price != null) {
      await this.priceRepo.save(
        this.priceRepo.create({
          affiliate_link_id: linkId,
          price: result.price,
          in_stock: result.in_stock,
          currency: result.currency,
        }),
      );
      link.price_snapshot = result.price;
      link.price_updated_at = now;
      link.last_attempted_at = now;
      link.consecutive_failures = 0;
      link.last_error_type = null;
      link.last_error_message = null;
      if (link.verification_status === 'unverified' || link.verification_status === 'needs_review') {
        link.verification_status = 'valid';
      }
      await this.linkRepo.save(link);
    } else {
      link.last_attempted_at = now;
      link.consecutive_failures = (link.consecutive_failures || 0) + 1;
      link.last_error_type = result.error_type || 'unknown';
      link.last_error_message = result.error || null;
      if (
        link.consecutive_failures >= QUARANTINE_THRESHOLD &&
        link.verification_status !== 'needs_review' &&
        link.verification_status !== 'dead'
      ) {
        link.verification_status = 'needs_review';
      }
      await this.linkRepo.save(link);
    }

    return { ...result, attempts };
  }

  /**
   * Quarantine'deki linki yeniden doğrula (admin action).
   * Başarı: consecutive_failures=0, verification_status='valid'
   * Başarısızlık: consecutive_failures++ (eşiği aşarsa yine needs_review)
   */
  async reverifyLink(linkId: number) {
    return this.updateSinglePrice(linkId);
  }

  /**
   * Quarantine'e düşmüş linkleri listele (admin panelinde görünecek).
   */
  async listQuarantinedLinks(limit = 100) {
    return this.linkRepo.find({
      where: { verification_status: 'needs_review', is_active: true },
      order: { last_attempted_at: 'DESC' },
      take: limit,
    });
  }

  async getPriceHistory(linkId: number, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.priceRepo.find({
      where: {
        affiliate_link_id: linkId,
        recorded_at: LessThan(new Date()) as any,
      },
      order: { recorded_at: 'ASC' },
    });
  }

  async detectPriceDrops(productId: number) {
    const links = await this.linkRepo.find({
      where: { product_id: productId, is_active: true },
    });

    const drops: Array<{
      platform: string;
      current_price: number | null;
      lowest_price: number | null;
      is_lowest: boolean;
    }> = [];

    for (const link of links) {
      const history = await this.priceRepo
        .createQueryBuilder('ph')
        .where('ph.affiliate_link_id = :id', { id: link.affiliate_link_id })
        .orderBy('ph.price', 'ASC')
        .limit(1)
        .getOne();

      const currentPrice = link.price_snapshot ? Number(link.price_snapshot) : null;
      const lowestPrice = history ? Number(history.price) : null;

      drops.push({
        platform: link.platform,
        current_price: currentPrice,
        lowest_price: lowestPrice,
        is_lowest: currentPrice != null && lowestPrice != null && currentPrice <= lowestPrice,
      });
    }

    return drops;
  }

  async getRecentPriceDropAlerts(thresholdPercent: number = 5) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentHistory = await this.priceRepo.find({
      where: { recorded_at: MoreThan(oneDayAgo) },
      order: { recorded_at: 'DESC' },
    });

    const linkIds = [...new Set(recentHistory.map((h) => h.affiliate_link_id))];
    const alerts: Array<{
      affiliate_link_id: number;
      platform: string;
      product_id: number;
      old_price: number;
      new_price: number;
      drop_percent: number;
    }> = [];

    for (const linkId of linkIds) {
      const link = await this.linkRepo.findOne({ where: { affiliate_link_id: linkId } });
      if (!link) continue;

      const prices = recentHistory
        .filter((h) => h.affiliate_link_id === linkId)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

      if (prices.length < 2) continue;

      const oldPrice = Number(prices[0].price);
      const newPrice = Number(prices[prices.length - 1].price);
      if (oldPrice <= 0) continue;

      const dropPercent = ((oldPrice - newPrice) / oldPrice) * 100;

      if (dropPercent >= thresholdPercent) {
        alerts.push({
          affiliate_link_id: linkId,
          platform: link.platform,
          product_id: link.product_id,
          old_price: oldPrice,
          new_price: newPrice,
          drop_percent: Math.round(dropPercent * 10) / 10,
        });
      }
    }

    return alerts.sort((a, b) => b.drop_percent - a.drop_percent);
  }

  async getAffiliateMetrics() {
    const totalLinks = await this.linkRepo.count({ where: { is_active: true } });
    const linksWithPrice = await this.linkRepo.count({
      where: { is_active: true },
    });

    const platformStats = await this.linkRepo
      .createQueryBuilder('al')
      .select('al.platform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .where('al.is_active = true')
      .groupBy('al.platform')
      .getRawMany();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const staleCount = await this.linkRepo
      .createQueryBuilder('al')
      .where('al.is_active = true')
      .andWhere('(al.price_updated_at IS NULL OR al.price_updated_at < :date)', { date: sevenDaysAgo })
      .getCount();

    const quarantinedCount = await this.linkRepo.count({
      where: { is_active: true, verification_status: 'needs_review' },
    });

    const errorBreakdown = await this.linkRepo
      .createQueryBuilder('al')
      .select('al.last_error_type', 'error_type')
      .addSelect('COUNT(*)', 'count')
      .where('al.is_active = true')
      .andWhere('al.last_error_type IS NOT NULL')
      .groupBy('al.last_error_type')
      .getRawMany();

    return {
      total_links: totalLinks,
      links_with_price: linksWithPrice,
      stale_prices: staleCount,
      quarantined: quarantinedCount,
      error_breakdown: errorBreakdown,
      platform_breakdown: platformStats,
    };
  }
}
