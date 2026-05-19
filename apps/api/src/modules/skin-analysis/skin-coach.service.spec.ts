import { ConfigService } from '@nestjs/config';
import { SkinCoachService } from './skin-coach.service';

/**
 * SkinCoachService unit testleri (Madde 21 coverage genişletme, 2026-05-19).
 *
 * History sanitize + alternating turn guard test edilir. askWithHistory ve
 * streamWithHistory'nin Anthropic API çağrısı entegrasyon testi gerekli (mock).
 */
describe('SkinCoachService — history sanitize', () => {
  let service: SkinCoachService;
  let config: jest.Mocked<ConfigService>;

  beforeEach(() => {
    config = { get: jest.fn() } as unknown as jest.Mocked<ConfigService>;
    service = new SkinCoachService(config);
  });

  describe('askWithHistory — input validation', () => {
    it('soru 3 karakterden kısa → ServiceUnavailable', async () => {
      await expect(
        service.askWithHistory({} as any, 50, [], 'ok'),
      ).rejects.toThrow(/3-500/);
    });

    it('soru 500+ karakter → ServiceUnavailable', async () => {
      const longQ = 'a'.repeat(501);
      await expect(
        service.askWithHistory({} as any, 50, [], longQ),
      ).rejects.toThrow(/3-500/);
    });

    it('ANTHROPIC_API_KEY yoksa → ServiceUnavailable', async () => {
      config.get.mockReturnValue(undefined);
      await expect(
        service.askWithHistory({} as any, 50, [], 'Geçerli soru mu?'),
      ).rejects.toThrow(/yapılandırılmamış/);
    });
  });

  describe('streamWithHistory — input validation', () => {
    it('boş soru → ServiceUnavailable', async () => {
      await expect(
        service.streamWithHistory({} as any, 50, [], '', () => {}),
      ).rejects.toThrow(/3-500/);
    });
  });
});
