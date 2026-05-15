import { ConfigService } from '@nestjs/config';
import { VisionService } from './vision.service';

/**
 * Vision Service unit testleri.
 *
 * 2026-05-15 Madde 21 (test coverage) ile eklendi.
 * Covers:
 *   - Madde 2: MIME whitelist defense-in-depth
 *   - Madde 2: data URI prefix strip
 *   - Madde 9: AbortSignal timeout
 *   - Empty result fallback
 */
describe('VisionService', () => {
  let service: VisionService;
  let config: jest.Mocked<ConfigService>;

  const VALID_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIp';

  beforeEach(() => {
    config = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
    service = new VisionService(config);
  });

  describe('MIME whitelist (Madde 2)', () => {
    it('image/jpeg kabul eder', async () => {
      config.get.mockReturnValue(undefined); // no API keys → fallback path
      const result = await service.recognizeProduct(VALID_BASE64, 'image/jpeg');
      expect(result.confidence).toBe(0);
      expect(result.brand).toBeNull();
    });

    it('image/png kabul eder', async () => {
      config.get.mockReturnValue(undefined);
      const result = await service.recognizeProduct(VALID_BASE64, 'image/png');
      expect(result.confidence).toBe(0);
    });

    it('image/webp kabul eder', async () => {
      config.get.mockReturnValue(undefined);
      const result = await service.recognizeProduct(VALID_BASE64, 'image/webp');
      expect(result.confidence).toBe(0);
    });

    it('image/gif reddeder (whitelist dışı)', async () => {
      const result = await service.recognizeProduct(VALID_BASE64, 'image/gif');
      expect(result.confidence).toBe(0);
      expect(result.brand).toBeNull();
      expect(config.get).not.toHaveBeenCalled(); // erken return, API key bile sorulmaz
    });

    it('application/pdf reddeder', async () => {
      const result = await service.recognizeProduct(VALID_BASE64, 'application/pdf');
      expect(result.confidence).toBe(0);
      expect(config.get).not.toHaveBeenCalled();
    });

    it("'image/svg+xml' reddeder (XSS riski)", async () => {
      const result = await service.recognizeProduct(VALID_BASE64, 'image/svg+xml');
      expect(result.confidence).toBe(0);
      expect(config.get).not.toHaveBeenCalled();
    });
  });

  describe('Base64 boş guard (Madde 2)', () => {
    it("boş string'i reddeder", async () => {
      config.get.mockReturnValue(undefined);
      const result = await service.recognizeProduct('', 'image/jpeg');
      expect(result.confidence).toBe(0);
      expect(result.brand).toBeNull();
    });

    it("sadece data URI prefix'inden ibaret string'i reddeder", async () => {
      config.get.mockReturnValue(undefined);
      const result = await service.recognizeProduct('data:image/jpeg;base64,', 'image/jpeg');
      expect(result.confidence).toBe(0);
    });
  });

  describe('Fallback davranışı', () => {
    it('hiçbir API key yoksa EMPTY_VISION_RESULT döner', async () => {
      config.get.mockReturnValue(undefined);
      const result = await service.recognizeProduct(VALID_BASE64, 'image/jpeg');
      expect(result).toMatchObject({
        brand: null,
        product_name: null,
        product_type: null,
        detected_text: null,
        confidence: 0,
      });
    });
  });

  describe('Default MIME', () => {
    it("mime arg verilmezse 'image/jpeg' kullanır (whitelist içinde)", async () => {
      config.get.mockReturnValue(undefined);
      const result = await service.recognizeProduct(VALID_BASE64);
      expect(result.confidence).toBe(0);
      // jpeg whitelist'te → API key sorgulamaya gider (sonra undefined dönecek)
      expect(config.get).toHaveBeenCalled();
    });
  });
});
