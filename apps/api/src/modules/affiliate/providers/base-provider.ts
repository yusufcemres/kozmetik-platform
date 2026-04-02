/**
 * Base affiliate provider — tüm platform sağlayıcıları bu interface'i implement eder.
 *
 * NOT: Gerçek scraping/API entegrasyonu Faz 3'ün ilerleyen aşamalarında eklenecek.
 * Şimdilik yapı hazır, provider'lar placeholder response döner.
 */

export interface PriceFetchResult {
  price: number | null;
  in_stock: boolean;
  currency: string;
  fetched_at: Date;
  error?: string;
}

export interface AffiliateUrlParams {
  baseUrl: string;
  trackingId?: string;
}

export abstract class BaseAffiliateProvider {
  abstract readonly platformName: string;
  abstract readonly platformSlug: string;

  /**
   * Ürün fiyatını çeker (scraping veya API)
   */
  abstract fetchPrice(productUrl: string): Promise<PriceFetchResult>;

  /**
   * Tracking parametreli affiliate URL oluşturur
   */
  abstract generateTrackingUrl(params: AffiliateUrlParams): string;

  /**
   * Stok durumunu kontrol eder
   */
  async checkStock(productUrl: string): Promise<boolean> {
    const result = await this.fetchPrice(productUrl);
    return result.in_stock;
  }
}
