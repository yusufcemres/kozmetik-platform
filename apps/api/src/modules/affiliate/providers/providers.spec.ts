import { TrendyolProvider } from './trendyol.provider';
import { HepsiburadaProvider } from './hepsiburada.provider';
import { AmazonTrProvider } from './amazon.provider';

describe('Affiliate Providers', () => {
  describe('TrendyolProvider', () => {
    const provider = new TrendyolProvider();

    it('should have correct platform info', () => {
      expect(provider.platformName).toBe('Trendyol');
      expect(provider.platformSlug).toBe('trendyol');
    });

    it('should return placeholder price result', async () => {
      const result = await provider.fetchPrice('https://www.trendyol.com/product/123');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('in_stock');
      expect(result).toHaveProperty('currency', 'TRY');
      expect(result).toHaveProperty('fetched_at');
    });

    it('should generate tracking URL with boutiqueId', () => {
      const url = provider.generateTrackingUrl({
        baseUrl: 'https://www.trendyol.com/product/123',
        trackingId: 'abc123',
      });
      expect(url).toContain('boutiqueId=abc123');
      expect(url).toContain('merchantId=abc123');
    });

    it('should generate tracking URL without tracking params when no ID', () => {
      const url = provider.generateTrackingUrl({
        baseUrl: 'https://www.trendyol.com/product/123',
      });
      expect(url).not.toContain('boutiqueId');
    });
  });

  describe('HepsiburadaProvider', () => {
    const provider = new HepsiburadaProvider();

    it('should have correct platform info', () => {
      expect(provider.platformName).toBe('Hepsiburada');
      expect(provider.platformSlug).toBe('hepsiburada');
    });

    it('should return placeholder price result', async () => {
      const result = await provider.fetchPrice('https://www.hepsiburada.com/product/123');
      expect(result.currency).toBe('TRY');
      expect(result.fetched_at).toBeInstanceOf(Date);
    });

    it('should generate tracking URL', () => {
      const url = provider.generateTrackingUrl({
        baseUrl: 'https://www.hepsiburada.com/product/123',
        trackingId: 'track456',
      });
      expect(url).toContain('wt_af=track456');
    });
  });

  describe('AmazonTrProvider', () => {
    const provider = new AmazonTrProvider();

    it('should have correct platform info', () => {
      expect(provider.platformName).toBe('Amazon TR');
      expect(provider.platformSlug).toBe('amazon_tr');
    });

    it('should return placeholder price result', async () => {
      const result = await provider.fetchPrice('https://www.amazon.com.tr/dp/B123');
      expect(result.currency).toBe('TRY');
    });

    it('should generate tracking URL with tag param', () => {
      const url = provider.generateTrackingUrl({
        baseUrl: 'https://www.amazon.com.tr/dp/B123',
        trackingId: 'mytag-20',
      });
      expect(url).toContain('tag=mytag-20');
    });
  });

  describe('checkStock (inherited)', () => {
    it('should derive stock status from fetchPrice', async () => {
      const provider = new TrendyolProvider();
      const inStock = await provider.checkStock('https://example.com');
      expect(typeof inStock).toBe('boolean');
    });
  });
});
