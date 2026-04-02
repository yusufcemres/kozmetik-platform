import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AffiliateLink, PriceHistory } from '@database/entities';
import { BaseAffiliateProvider } from './providers';
import { TrendyolProvider } from './providers/trendyol.provider';
import { HepsiburadaProvider } from './providers/hepsiburada.provider';
import { AmazonTrProvider } from './providers/amazon.provider';

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

  /**
   * Tüm aktif linklerin fiyatını güncelle (cron job tarafından çağrılır)
   */
  async batchUpdatePrices(): Promise<{
    total: number;
    updated: number;
    errors: number;
  }> {
    const activeLinks = await this.linkRepo.find({
      where: { is_active: true },
    });

    let updated = 0;
    let errors = 0;

    for (const link of activeLinks) {
      try {
        const provider = this.providers.get(link.platform);
        if (!provider) continue;

        const result = await provider.fetchPrice(link.affiliate_url);

        if (result.price != null) {
          // Save price history
          await this.priceRepo.save(
            this.priceRepo.create({
              affiliate_link_id: link.affiliate_link_id,
              price: result.price,
              in_stock: result.in_stock,
              currency: result.currency,
            }),
          );

          // Update snapshot
          link.price_snapshot = result.price;
          link.price_updated_at = new Date();
          await this.linkRepo.save(link);
          updated++;
        }
      } catch (err) {
        this.logger.error(`Price update failed for link ${link.affiliate_link_id}`, err);
        errors++;
      }
    }

    this.logger.log(`Price update complete: ${updated}/${activeLinks.length} updated, ${errors} errors`);
    return { total: activeLinks.length, updated, errors };
  }

  /**
   * Tek bir linkin fiyatını güncelle
   */
  async updateSinglePrice(linkId: number) {
    const link = await this.linkRepo.findOne({ where: { affiliate_link_id: linkId } });
    if (!link) return null;

    const provider = this.providers.get(link.platform);
    if (!provider) return { error: 'Bu platform için provider yok' };

    const result = await provider.fetchPrice(link.affiliate_url);

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
      link.price_updated_at = new Date();
      await this.linkRepo.save(link);
    }

    return result;
  }

  /**
   * Fiyat geçmişi getir (grafik için)
   */
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

  /**
   * Fiyat düşüş tespiti — belirli bir ürünün en düşük fiyatı
   */
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

  /**
   * Admin dashboard metrikleri
   */
  async getAffiliateMetrics() {
    const totalLinks = await this.linkRepo.count({ where: { is_active: true } });
    const linksWithPrice = await this.linkRepo.count({
      where: { is_active: true },
    });

    // Platform breakdown
    const platformStats = await this.linkRepo
      .createQueryBuilder('al')
      .select('al.platform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .where('al.is_active = true')
      .groupBy('al.platform')
      .getRawMany();

    // Stale prices (> 7 days old)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const staleCount = await this.linkRepo
      .createQueryBuilder('al')
      .where('al.is_active = true')
      .andWhere('(al.price_updated_at IS NULL OR al.price_updated_at < :date)', { date: sevenDaysAgo })
      .getCount();

    return {
      total_links: totalLinks,
      links_with_price: linksWithPrice,
      stale_prices: staleCount,
      platform_breakdown: platformStats,
    };
  }
}
