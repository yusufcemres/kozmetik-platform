/**
 * IAffiliateProvider — Faz 3 Çoklu Affiliate Platform
 *
 * Farklı e-ticaret platformlarından fiyat çekme, link oluşturma,
 * ve stok kontrolü.
 */

export interface AffiliatePrice {
  platform: string;
  price: number;
  currency: string; // 'TRY'
  in_stock: boolean;
  url: string;
  last_checked: Date;
}

export interface AffiliateLinkParams {
  product_name: string;
  barcode?: string;
  brand_name?: string;
}

export interface IAffiliateProvider {
  /**
   * Platform adı (trendyol, hepsiburada, amazon_tr, vb.)
   */
  readonly platformName: string;

  /**
   * Ürün fiyatını çeker (scraping veya API)
   */
  fetchPrice(params: AffiliateLinkParams): Promise<AffiliatePrice | null>;

  /**
   * Tracking parametreli affiliate link oluşturur
   */
  generateAffiliateUrl(productUrl: string): string;

  /**
   * Stok durumunu kontrol eder
   */
  checkStock(params: AffiliateLinkParams): Promise<boolean>;

  /**
   * Toplu fiyat güncelleme (cron job)
   */
  batchUpdatePrices(productIds: number[]): Promise<AffiliatePrice[]>;
}
