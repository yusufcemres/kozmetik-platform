import { BaseAffiliateProvider, PriceFetchResult, AffiliateUrlParams } from './base-provider';

export class TrendyolProvider extends BaseAffiliateProvider {
  readonly platformName = 'Trendyol';
  readonly platformSlug = 'trendyol';

  /**
   * Trendyol fiyat çekme
   * TODO: Gerçek scraping/API entegrasyonu (Trendyol affiliate API)
   */
  async fetchPrice(productUrl: string): Promise<PriceFetchResult> {
    // Placeholder — gerçek implementasyon scraping veya Trendyol Partner API kullanacak
    return {
      price: null,
      in_stock: true,
      currency: 'TRY',
      fetched_at: new Date(),
      error: 'Fiyat çekme henüz aktif değil — manuel güncelleme kullanın',
    };
  }

  generateTrackingUrl(params: AffiliateUrlParams): string {
    const url = new URL(params.baseUrl);
    if (params.trackingId) {
      url.searchParams.set('boutiqueId', params.trackingId);
      url.searchParams.set('merchantId', params.trackingId);
    }
    return url.toString();
  }
}
