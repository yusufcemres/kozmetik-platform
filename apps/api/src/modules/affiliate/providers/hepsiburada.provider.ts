import { BaseAffiliateProvider, PriceFetchResult, AffiliateUrlParams } from './base-provider';

export class HepsiburadaProvider extends BaseAffiliateProvider {
  readonly platformName = 'Hepsiburada';
  readonly platformSlug = 'hepsiburada';

  async fetchPrice(productUrl: string): Promise<PriceFetchResult> {
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
      url.searchParams.set('wt_af', params.trackingId);
    }
    return url.toString();
  }
}
