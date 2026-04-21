import * as cheerio from 'cheerio';
import { BaseAffiliateProvider, PriceFetchResult, AffiliateUrlParams, AffiliateErrorType } from './base-provider';

export class AmazonTrProvider extends BaseAffiliateProvider {
  readonly platformName = 'Amazon TR';
  readonly platformSlug = 'amazon_tr';

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

      // Amazon bot-check gate detection
      if (/Enter the characters you see below|api-services-support@amazon|To discuss automated access/i.test(html.slice(0, 3000))) {
        return {
          price: null,
          in_stock: false,
          currency: 'TRY',
          fetched_at: fetchedAt,
          error: 'Amazon bot-check gate',
          error_type: 'http_403',
        };
      }

      const $ = cheerio.load(html);

      let price: number | null = null;
      let inStock = true;

      // JSON-LD (nadir ama ilk tercih)
      const jsonLd = $('script[type="application/ld+json"]');
      jsonLd.each((_, el) => {
        try {
          const data = JSON.parse($(el).text());
          if (data?.['@type'] === 'Product' && data.offers) {
            const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
            if (offers.price && price === null) price = parseFloat(offers.price);
            if (offers.availability) inStock = String(offers.availability).includes('InStock');
          }
        } catch {
          // skip
        }
      });

      // Fallback: Amazon-specific selectors (en stabil: a-offscreen)
      if (price === null) {
        const selectors = [
          'span.a-price[data-a-size="xl"] .a-offscreen',
          '#corePrice_feature_div .a-offscreen',
          '#corePriceDisplay_desktop_feature_div .a-offscreen',
          '#apex_desktop .a-offscreen',
          'span.a-price .a-offscreen',
          '#priceblock_ourprice',
          '#priceblock_dealprice',
          '#priceblock_saleprice',
          '[data-a-color="price"] .a-offscreen',
        ];
        for (const sel of selectors) {
          const txt = $(sel).first().text().trim();
          const parsed = this.parsePriceString(txt);
          if (parsed !== null) {
            price = parsed;
            break;
          }
        }
      }

      // Stok kontrolü
      const availability = $('#availability span').first().text().trim().toLowerCase();
      if (/stokta yok|currently unavailable|out of stock|mevcut değil/i.test(availability)) {
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

  private parsePriceString(txt: string): number | null {
    if (!txt) return null;
    const cleaned = txt.replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}(?:,|$))/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  generateTrackingUrl(params: AffiliateUrlParams): string {
    const url = new URL(params.baseUrl);
    if (params.trackingId) {
      url.searchParams.set('tag', params.trackingId);
    }
    return url.toString();
  }
}
