import * as cheerio from 'cheerio';
import { BaseAffiliateProvider, PriceFetchResult, AffiliateUrlParams } from './base-provider';

export class AmazonTrProvider extends BaseAffiliateProvider {
  readonly platformName = 'Amazon TR';
  readonly platformSlug = 'amazon_tr';

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

      let price: number | null = null;
      let inStock = true;

      // Amazon price selectors
      const priceText = $('#priceblock_ourprice').text()
        || $('#priceblock_dealprice').text()
        || $('span.a-price .a-offscreen').first().text()
        || $('#corePrice_feature_div .a-offscreen').first().text();

      if (priceText) {
        const cleaned = priceText.replace(/[^\d,.]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) {
          price = parsed;
        }
      }

      // Stock check
      const availability = $('#availability span').text().trim().toLowerCase();
      if (availability.includes('stokta yok') || availability.includes('currently unavailable')) {
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
      url.searchParams.set('tag', params.trackingId);
    }
    return url.toString();
  }
}
