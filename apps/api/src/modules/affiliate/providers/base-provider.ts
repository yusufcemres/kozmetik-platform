/**
 * Base affiliate provider — tüm platform sağlayıcıları bu interface'i implement eder.
 *
 * Error taxonomy (B.3): provider'lar başarısız olan fetch'in sebebini
 * kategorize eder; service tarafı retry policy + quarantine kararları için
 * kullanır.
 */

export type AffiliateErrorType =
  | 'http_403' // Cloudflare / bot block — rate-limit benzeri
  | 'http_404' // dead link
  | 'http_5xx' // provider downtime
  | 'http_other' // unexpected response code
  | 'timeout' // AbortSignal timeout
  | 'network' // DNS / TCP / TLS failure
  | 'dom_mismatch' // HTML geldi ama selector/JSON-LD eşleşmedi
  | 'parse_error' // price string bulundu ama number'a çevrilemedi
  | 'oos' // out of stock — HTML'de açık flag
  | 'unknown';

export interface PriceFetchResult {
  price: number | null;
  in_stock: boolean;
  currency: string;
  fetched_at: Date;
  error?: string;
  error_type?: AffiliateErrorType;
}

export interface AffiliateUrlParams {
  baseUrl: string;
  trackingId?: string;
}

export abstract class BaseAffiliateProvider {
  abstract readonly platformName: string;
  abstract readonly platformSlug: string;

  abstract fetchPrice(productUrl: string): Promise<PriceFetchResult>;

  abstract generateTrackingUrl(params: AffiliateUrlParams): string;

  async checkStock(productUrl: string): Promise<boolean> {
    const result = await this.fetchPrice(productUrl);
    return result.in_stock;
  }

  /** Exception → error_type eşlemesi (provider'lar kendi fetch'inde kullanır). */
  protected classifyNetworkError(err: any): AffiliateErrorType {
    const name = err?.name || '';
    const code = err?.code || '';
    const msg = String(err?.message || '').toLowerCase();
    if (name === 'TimeoutError' || name === 'AbortError' || msg.includes('timeout')) return 'timeout';
    if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'ECONNRESET' || msg.includes('fetch failed')) return 'network';
    return 'unknown';
  }

  /** HTTP status → error_type eşlemesi. */
  protected classifyHttpStatus(status: number): AffiliateErrorType {
    if (status === 403 || status === 429) return 'http_403';
    if (status === 404 || status === 410) return 'http_404';
    if (status >= 500 && status < 600) return 'http_5xx';
    return 'http_other';
  }
}

/** Retry policy: hangi error_type'lar tekrar denenebilir. */
export const RETRYABLE_ERROR_TYPES: ReadonlySet<AffiliateErrorType> = new Set([
  'http_403',
  'http_5xx',
  'timeout',
  'network',
]);
