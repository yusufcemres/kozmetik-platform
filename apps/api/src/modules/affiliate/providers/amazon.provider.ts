import { BaseAffiliateProvider, PriceFetchResult, AffiliateUrlParams } from './base-provider';

export class AmazonTrProvider extends BaseAffiliateProvider {
  readonly platformName = 'Amazon TR';
  readonly platformSlug = 'amazon_tr';

  async fetchPrice(productUrl: string): Promise<PriceFetchResult> {
    // Amazon Product Advertising API 5.0 kullanılacak
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
      url.searchParams.set('tag', params.trackingId);
    }
    return url.toString();
  }
}
