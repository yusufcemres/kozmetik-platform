import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { NewsletterSubscription } from '@database/entities';
import { MailService } from '@common/mail/mail.service';
import { buildNewsletterHtml, NewsletterMailParams } from '@common/mail/templates';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter aboneliği + admin send broadcast (Faz P, 2026-05-19).
 *
 * Akış:
 *  - subscribe(email, sourcePage) idempotent insert + welcome (best-effort)
 *  - unsubscribeByToken(token) tomb stone — no info leak
 *  - sendBroadcast(content) admin manual — batch 100, last_sent_at update
 *
 * KVKK: unsubscribe sonrası email plaintext silinir, email_hash + tomb tarih
 * kalır (re-subscribe için).
 */
@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectRepository(NewsletterSubscription) private readonly subs: Repository<NewsletterSubscription>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashEmail(email: string): string {
    return createHash('sha256').update(this.normalizeEmail(email)).digest('hex');
  }

  /**
   * Idempotent abonelik:
   *  - email_hash zaten varsa + unsubscribed_at NULL ise: no-op (zaten abone)
   *  - email_hash varsa + unsubscribed_at SET ise: re-subscribe (NULL + email yenile)
   *  - email_hash yoksa: yeni insert + welcome mail
   */
  async subscribe(rawEmail: string, sourcePage?: string): Promise<{ subscribed: boolean; resubscribed?: boolean }> {
    const email = this.normalizeEmail(rawEmail);
    if (!EMAIL_REGEX.test(email)) {
      throw new BadRequestException('Geçersiz e-posta');
    }
    const email_hash = this.hashEmail(email);

    let sub = await this.subs.findOne({ where: { email_hash } });
    let resubscribed = false;
    if (sub) {
      if (sub.unsubscribed_at) {
        // Re-subscribe
        sub.email = email;
        sub.unsubscribed_at = null;
        sub.unsubscribe_token = randomBytes(32).toString('hex');
        if (sourcePage) sub.source_page = sourcePage.slice(0, 255);
        await this.subs.save(sub);
        resubscribed = true;
      } else {
        // Zaten aktif abone
        return { subscribed: true };
      }
    } else {
      sub = await this.subs.save(
        this.subs.create({
          email,
          email_hash,
          unsubscribe_token: randomBytes(32).toString('hex'),
          source_page: sourcePage ? sourcePage.slice(0, 255) : null,
        }),
      );
    }

    // Welcome mail (best-effort)
    void this.sendWelcome(sub).catch(() => {});
    return { subscribed: true, ...(resubscribed ? { resubscribed: true } : {}) };
  }

  /**
   * Tek-tıkla unsubscribe — no info leak (geçersiz token sessiz 200).
   * KVKK: email plaintext NULL'a çekilir, hash + tomb stone tarih kalır.
   */
  async unsubscribeByToken(token: string): Promise<{ ok: true }> {
    if (!token || token.length !== 64) return { ok: true }; // Constant time no-info
    const sub = await this.subs.findOne({ where: { unsubscribe_token: token } });
    if (sub && !sub.unsubscribed_at) {
      sub.email = '[unsubscribed]';
      sub.unsubscribed_at = new Date();
      await this.subs.save(sub);
      this.logger.log(`Newsletter unsubscribe: sub_id=${sub.subscription_id}`);
    }
    return { ok: true };
  }

  /**
   * Admin: tüm aktif abonelere bülten gönderim — batch 100, last_sent_at update.
   * Resend free tier 100/gün → büyük list için iterate sonraki gün yapılır.
   */
  async sendBroadcast(content: Omit<NewsletterMailParams, 'to' | 'unsubscribeUrl' | 'siteUrl'>): Promise<{
    sent: number;
    failed: number;
    skipped: number;
  }> {
    const siteUrl = this.config.get<string>('SITE_URL', 'https://revela.com.tr');
    const active = await this.subs.find({
      where: { unsubscribed_at: IsNull() },
      take: 100, // Resend free tier daily limit
      order: { last_sent_at: 'ASC' }, // Önce en eski gönderim alanlara
    });

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    for (const sub of active) {
      if (!sub.email || sub.email === '[unsubscribed]') {
        skipped++;
        continue;
      }
      const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe/${sub.unsubscribe_token}`;
      const ok = await this.mail.send({
        to: sub.email,
        subject: `REVELA Bülten — ${content.edition}`,
        html: buildNewsletterHtml({ ...content, to: sub.email, unsubscribeUrl, siteUrl }),
      });
      if (ok) {
        sub.last_sent_at = new Date();
        sub.send_count = (sub.send_count || 0) + 1;
        await this.subs.save(sub);
        sent++;
      } else {
        failed++;
      }
    }
    this.logger.log(`Newsletter broadcast: sent=${sent} failed=${failed} skipped=${skipped}`);
    return { sent, failed, skipped };
  }

  /**
   * Admin stats — aktif/pasif abone sayısı + son broadcast.
   */
  async getStats(): Promise<{
    total_active: number;
    total_unsubscribed: number;
    last_broadcast_at: string | null;
  }> {
    const total_active = await this.subs.count({ where: { unsubscribed_at: IsNull() } });
    const total_unsubscribed = await this.subs.count({ where: { unsubscribed_at: Not(IsNull()) } });
    const lastSent = await this.subs.findOne({
      where: { last_sent_at: Not(IsNull()) },
      order: { last_sent_at: 'DESC' },
    });
    return {
      total_active,
      total_unsubscribed,
      last_broadcast_at: lastSent?.last_sent_at?.toISOString() ?? null,
    };
  }

  private async sendWelcome(sub: NewsletterSubscription): Promise<void> {
    const siteUrl = this.config.get<string>('SITE_URL', 'https://revela.com.tr');
    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe/${sub.unsubscribe_token}`;
    await this.mail.send({
      to: sub.email,
      subject: 'REVELA Bülten aboneliği aktif',
      html: `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#1F1F1F;">REVELA Bülten'e hoş geldin</h2>
        <p>Aboneliğin aktif. Aylık seçilmiş içerik, yeni INCI bulguları ve özel kampanyalar bu adrese gelecek.</p>
        <p style="font-size:13px;color:#666;">İstemiyorsan tek tıkla çıkış: <a href="${unsubscribeUrl}">${unsubscribeUrl}</a></p>
      </body></html>`,
    }).catch(() => {});
  }
}
