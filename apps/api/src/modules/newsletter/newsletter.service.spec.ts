import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NewsletterService } from './newsletter.service';
import { NewsletterSubscription } from '@database/entities';
import { MailService } from '@common/mail/mail.service';

/**
 * NewsletterService unit testleri (Madde 21, 2026-05-19).
 *
 * Validation + hash + tomb stone davranışları test edilir. Resend send
 * tarafı MailService.send mock'lu.
 */
describe('NewsletterService', () => {
  let service: NewsletterService;
  let subs: jest.Mocked<Repository<NewsletterSubscription>>;
  let mail: jest.Mocked<MailService>;
  let config: jest.Mocked<ConfigService>;

  beforeEach(() => {
    subs = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((dto) => dto as NewsletterSubscription),
      count: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<NewsletterSubscription>>;

    mail = { send: jest.fn().mockResolvedValue(true) } as unknown as jest.Mocked<MailService>;
    config = { get: jest.fn().mockReturnValue('https://revela.com.tr') } as unknown as jest.Mocked<ConfigService>;

    service = new NewsletterService(subs, mail, config);
  });

  describe('subscribe — input validation', () => {
    it('geçersiz email → BadRequest', async () => {
      await expect(service.subscribe('not-an-email')).rejects.toThrow(/Geçersiz/);
    });

    it('boş email → BadRequest', async () => {
      await expect(service.subscribe('   ')).rejects.toThrow(/Geçersiz/);
    });

    it('geçerli email + yeni abone → insert + welcome', async () => {
      subs.findOne.mockResolvedValue(null);
      subs.save.mockResolvedValue({
        subscription_id: '1',
        email: 'test@revela.com.tr',
        email_hash: 'a'.repeat(64),
        unsubscribe_token: 'b'.repeat(64),
        subscribed_at: new Date(),
        unsubscribed_at: null,
        source_page: null,
        last_sent_at: null,
        send_count: 0,
      } as NewsletterSubscription);

      const result = await service.subscribe('Test@REVELA.com.tr');
      expect(result.subscribed).toBe(true);
      expect(result.resubscribed).toBeUndefined();
      expect(subs.save).toHaveBeenCalled();
      // Email normalize edilmiş olmalı (lowercase + trim)
      const savedCall = (subs.save as jest.Mock).mock.calls[0][0];
      expect(savedCall.email).toBe('test@revela.com.tr');
    });

    it('zaten aktif abone → no-op (resubscribed false)', async () => {
      subs.findOne.mockResolvedValue({
        subscription_id: '1',
        email: 'test@revela.com.tr',
        unsubscribed_at: null,
      } as NewsletterSubscription);

      const result = await service.subscribe('test@revela.com.tr');
      expect(result.subscribed).toBe(true);
      expect(result.resubscribed).toBeUndefined();
      expect(subs.save).not.toHaveBeenCalled();
    });

    it('eski unsubscribe → re-subscribe path', async () => {
      const existing = {
        subscription_id: '1',
        email: '[unsubscribed]',
        unsubscribed_at: new Date(),
        send_count: 5,
      } as NewsletterSubscription;
      subs.findOne.mockResolvedValue(existing);
      subs.save.mockResolvedValue(existing);

      const result = await service.subscribe('test@revela.com.tr');
      expect(result.resubscribed).toBe(true);
      expect(subs.save).toHaveBeenCalled();
    });
  });

  describe('unsubscribeByToken', () => {
    it('geçersiz token (yanlış uzunluk) → sessiz ok (no info leak)', async () => {
      const result = await service.unsubscribeByToken('short');
      expect(result).toEqual({ ok: true });
      expect(subs.findOne).not.toHaveBeenCalled();
    });

    it('bulunmayan token → sessiz ok', async () => {
      subs.findOne.mockResolvedValue(null);
      const result = await service.unsubscribeByToken('a'.repeat(64));
      expect(result).toEqual({ ok: true });
      expect(subs.save).not.toHaveBeenCalled();
    });

    it('aktif abone → tomb stone + ok', async () => {
      const sub = {
        subscription_id: '1',
        email: 'test@revela.com.tr',
        unsubscribed_at: null,
      } as NewsletterSubscription;
      subs.findOne.mockResolvedValue(sub);
      subs.save.mockResolvedValue(sub);

      const result = await service.unsubscribeByToken('a'.repeat(64));
      expect(result).toEqual({ ok: true });
      expect(subs.save).toHaveBeenCalled();
      expect(sub.email).toBe('[unsubscribed]');
      expect(sub.unsubscribed_at).toBeInstanceOf(Date);
    });

    it('zaten unsubscribed → no-op', async () => {
      const sub = {
        subscription_id: '1',
        email: '[unsubscribed]',
        unsubscribed_at: new Date('2026-01-01'),
      } as NewsletterSubscription;
      subs.findOne.mockResolvedValue(sub);

      await service.unsubscribeByToken('a'.repeat(64));
      expect(subs.save).not.toHaveBeenCalled();
    });
  });
});
