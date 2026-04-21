import * as cheerio from 'cheerio';
import { BaseAffiliateProvider, PriceFetchResult, AffiliateUrlParams, AffiliateErrorType } from './base-provider';

export class HepsiburadaProvider extends BaseAffiliateProvider {
  readonly platformName = 'Hepsiburada';
  readonly platformSlug = 'hepsiburada';

  async fetchPrice(productUrl: string): Promise<PriceFetchResult> {
    const fetchedAt = new Date();
    try {
      const res = await fetch(productUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        },
        signal: AbortSignal.timeout(15000),
        redirect: 'follow',
      });

      if (!res.ok) {
        const errorType: AffiliateErrorType = this.classifyHttpStatus(res.status);
        return {
          price: null,
          in_stock: false,
          currency: 'TRY',
          fetched_at: fetchedAt,
          error: `HTTP ${res.status}`,
          error_type: errorType,
        };
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      let price: number | null = null;
      let inStock = true;

      // JSON-LD (primary)
      const jsonLd = $('script[type="application/ld+json"]');
      jsonLd.each((_, el) => {
        try {
          const data = JSON.parse($(el).text());
          const extractFromProduct = (item: any) => {
            if (item?.['@type'] === 'Product' && item.offers) {
              const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              if (offers.price && price === null) price = parseFloat(offers.price);
              if (offers.availability) inStock = String(offers.availability).includes('InStock');
            }
          };
          extractFromProduct(data);
          if (data['@graph'] && Array.isArray(data['@graph'])) {
            data['@graph'].forEach(extractFromProduct);
          }
        } catch {
          // skip
        }
      });

      // Fallback: genişletilmiş selectors
      if (price === null) {
        const selectors = [
          '[data-testid="price-current-price"]',
          '[data-test-id="price-current-price"]',
          '.product-price',
          '.price-value',
          'span.product-price-value',
          'div.priceContainer span',
          '[class*="priceValue"]',
          '[itemprop="price"]',
        ];
        for (const sel of selectors) {
          const el = $(sel).first();
          const txt = el.attr('content') || el.text().trim();
          const parsed = this.parsePriceString(txt);
          if (parsed !== null) {
            price = parsed;
            break;
          }
        }
      }

      if (/tükendi|stokta yok|ürün bulunamadı/i.test($('body').text().slice(0, 5000))) {
        inStock = false;
      }

      if (price === null) {
        return {
          price: null,
          in_stock: inStock,
          currency: 'TRY',
          fetched_at: fetchedAt,
          error: 'Fiyat HTML\'den çıkarılamadı',
          error_type: inStock ? 'dom_mismatch' : 'oos',
        };
      }

      return {
        price,
        in_stock: inStock,
        currency: 'TRY',
        fetched_at: fetchedAt,
      };
    } catch (err: any) {
      return {
        price: null,
        in_stock: false,
        currency: 'TRY',
        fetched_at: fetchedAt,
        error: err?.message || 'Bağlantı hatası',
        error_type: this.classifyNetworkError(err),
      };
    }
  }

  private parsePriceString(txt: string | undefined): number | null {
    if (!txt) return null;
    const cleaned = String(txt).replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}(?:,|$))/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  generateTrackingUrl(params: AffiliateUrlParams): string {
    const url = new URL(params.baseUrl);
    if (params.trackingId) {
      url.searchParams.set('wt_af', params.trackingId);
    }
    return url.toString();
  }
}
