import * as cheerio from 'cheerio';
import { BaseAffiliateProvider, PriceFetchResult, AffiliateUrlParams } from './base-provider';

export class TrendyolProvider extends BaseAffiliateProvider {
  readonly platformName = 'Trendyol';
  readonly platformSlug = 'trendyol';

  async fetchPrice(productUrl: string): Promise<PriceFetchResult> {
    try {
      const res = await fetch(productUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'tr-TR,tr;q=0.9',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return {
          price: null,
          in_stock: false,
          currency: 'TRY',
          fetched_at: new Date(),
          error: `HTTP ${res.status}`,
        };
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // Try JSON-LD structured data first (most reliable)
      let price: number | null = null;
      let inStock = true;

      const jsonLd = $('script[type="application/ld+json"]');
      jsonLd.each((_, el) => {
        try {
          const data = JSON.parse($(el).text());
          const extractFromProduct = (item: any) => {
            if (item?.['@type'] === 'Product' && item.offers) {
              const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              if (offers.price) price = parseFloat(offers.price);
              if (offers.availability) inStock = offers.availability.includes('InStock');
            }
          };
          extractFromProduct(data);
          if (data['@graph'] && Array.isArray(data['@graph'])) {
            data['@graph'].forEach(extractFromProduct);
          }
        } catch {
          // skip malformed JSON-LD
        }
      });

      // Fallback: parse price from HTML selectors
      if (price === null) {
        const priceText = $('.prc-dsc').first().text()
          || $('[data-testid="product-price"]').text()
          || $('.product-price-container .prc-slg').text();

        if (priceText) {
          const cleaned = priceText.replace(/[^\d,.]/g, '').replace(',', '.');
          const parsed = parseFloat(cleaned);
          if (!isNaN(parsed)) {
            price = parsed;
          }
        }
      }

      // Check out of stock indicators
      if ($('.out-of-stock-btn').length || $('.sold-out').length) {
        inStock = false;
      }

      return {
        price,
        in_stock: inStock,
        currency: 'TRY',
        fetched_at: new Date(),
        error: price === null ? 'Fiyat HTML\'den çıkarılamadı' : undefined,
      };
    } catch (err: any) {
      return {
        price: null,
        in_stock: false,
        currency: 'TRY',
        fetched_at: new Date(),
        error: err.message || 'Bağlantı hatası',
      };
    }
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
