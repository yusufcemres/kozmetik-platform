import { UserAuthService } from './user-auth.service';

/**
 * UserAuthService minimal unit testler (Madde 21 coverage).
 *
 * Tam mock'lu test (Repository + JwtService + MailService + ConfigService)
 * büyük scope — bu spec sadece pure helper'ları test eder. Magic link akışı,
 * OAuth verify, audit log için ileri sprint gerekli.
 */
describe('UserAuthService — helpers', () => {
  let service: UserAuthService;

  beforeEach(() => {
    // Helper-only test — repo/mail/jwt argümanları null geçilebilir,
    // normalizeEmail bunlara dokunmuyor.
    service = new UserAuthService(
      null as any, null as any, null as any, null as any, null as any, null as any,
      null as any, null as any, null as any,
    );
  });

  describe('normalizeEmail', () => {
    it('boşlukları trim eder', () => {
      expect(service.normalizeEmail('  hello@test.com  ')).toBe('hello@test.com');
    });

    it('büyük harfleri lower yapar', () => {
      expect(service.normalizeEmail('Hello@TEST.COM')).toBe('hello@test.com');
    });

    it('mixed case + boşluk birlikte', () => {
      expect(service.normalizeEmail('  Yusuf@Sololabs.TR  ')).toBe('yusuf@sololabs.tr');
    });

    it('zaten normalize ise değiştirmez', () => {
      expect(service.normalizeEmail('a@b.co')).toBe('a@b.co');
    });
  });
});
