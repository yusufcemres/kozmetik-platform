import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SmartScanRequestDto } from './scan.dto';

/**
 * SmartScanRequestDto validation testleri.
 *
 * 2026-05-15 Madde 21 (test coverage) ile eklendi.
 * Covers Madde 1: barcode regex, image_base64 boyut + MIME whitelist, image_mime enum.
 */
describe('SmartScanRequestDto', () => {
  async function validateDto(input: Record<string, unknown>) {
    const dto = plainToInstance(SmartScanRequestDto, input);
    return validate(dto);
  }

  describe('barcode', () => {
    it("8 hane EAN'ı kabul eder", async () => {
      const errors = await validateDto({ barcode: '12345678' });
      expect(errors).toHaveLength(0);
    });

    it("13 hane EAN'ı kabul eder", async () => {
      const errors = await validateDto({ barcode: '8690000000001' });
      expect(errors).toHaveLength(0);
    });

    it('7 haneli barkodu reddeder', async () => {
      const errors = await validateDto({ barcode: '1234567' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('15 haneli barkodu reddeder', async () => {
      const errors = await validateDto({ barcode: '123456789012345' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('harf içeren barkodu reddeder', async () => {
      const errors = await validateDto({ barcode: 'ABC1234567' });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('image_base64', () => {
    const valid = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';

    it("ham base64'ü kabul eder", async () => {
      const errors = await validateDto({ image_base64: valid, image_mime: 'image/png' });
      expect(errors).toHaveLength(0);
    });

    it("data URI prefix'li base64'ü kabul eder (jpeg)", async () => {
      const errors = await validateDto({ image_base64: `data:image/jpeg;base64,${valid}`, image_mime: 'image/jpeg' });
      expect(errors).toHaveLength(0);
    });

    it("data URI prefix'li base64'ü kabul eder (webp)", async () => {
      const errors = await validateDto({ image_base64: `data:image/webp;base64,${valid}`, image_mime: 'image/webp' });
      expect(errors).toHaveLength(0);
    });

    it('boyut limitini aşan base64 reddeder', async () => {
      const huge = 'a'.repeat(7_000_001);
      const errors = await validateDto({ image_base64: huge, image_mime: 'image/jpeg' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it("data URI prefix'i image/gif olan base64 reddeder", async () => {
      const errors = await validateDto({ image_base64: `data:image/gif;base64,${valid}`, image_mime: 'image/jpeg' });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('image_mime', () => {
    const valid = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';

    it("image/jpeg'i kabul eder", async () => {
      const errors = await validateDto({ image_base64: valid, image_mime: 'image/jpeg' });
      expect(errors).toHaveLength(0);
    });

    it("image/png'yi kabul eder", async () => {
      const errors = await validateDto({ image_base64: valid, image_mime: 'image/png' });
      expect(errors).toHaveLength(0);
    });

    it('image/gif reddeder', async () => {
      const errors = await validateDto({ image_base64: valid, image_mime: 'image/gif' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('image_base64 varsa image_mime zorunludur', async () => {
      const errors = await validateDto({ image_base64: valid });
      expect(errors.length).toBeGreaterThan(0);
    });

    it("image_base64 yoksa image_mime'a ihtiyaç yoktur", async () => {
      const errors = await validateDto({ barcode: '8690000000001' });
      expect(errors).toHaveLength(0);
    });
  });

  describe('empty body', () => {
    it('hiçbir alan olmadan validation geçer (controller-level BadRequestException)', async () => {
      // Note: "at least one of barcode/image_base64" kuralı controller-seviyesinde
      // BadRequestException ile enforce edilir, DTO seviyesinde değil.
      const errors = await validateDto({});
      expect(errors).toHaveLength(0);
    });
  });
});
