import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Jenerik Resend wrapper — user-auth.service.ts'teki inline Resend pattern'i
 * generalize edildi (Faz 1 Gün 9). Modüller kendi template'lerini inline HTML
 * olarak verir; HTTP/timeout/log buradan yönetilir.
 *
 * Dev mode: RESEND_API_KEY yoksa logger.warn + skip — testler/CI ortamı bozulmasın.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly DEFAULT_FROM = 'REVELA <no-reply@revela.com.tr>';
  private readonly RESEND_TIMEOUT_MS = 8_000;

  constructor(private readonly config: ConfigService) {}

  /**
   * Email gönder. Resend yoksa veya fail olursa sessizce log düşer — caller
   * email gönderiminin opportunistic olduğunu varsayabilir (welcome / reminder
   * scenario'larında fail kullanıcıyı bloke etmemeli).
   *
   * @returns true → gönderildi, false → skip/fail (dev mode veya Resend error)
   */
  async send(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
  }): Promise<boolean> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(`Resend disabled (no RESEND_API_KEY) — skipped: to=${params.to} subject="${params.subject}"`);
      return false;
    }
    const from = params.from || this.config.get<string>('MAIL_FROM', this.DEFAULT_FROM);
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.RESEND_TIMEOUT_MS),
        body: JSON.stringify({
          from,
          to: [params.to],
          subject: params.subject,
          html: params.html,
          ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Resend ${res.status} to=${params.to}: ${text.slice(0, 200)}`);
        return false;
      }
      return true;
    } catch (err: any) {
      this.logger.error(`Resend send failed to=${params.to}: ${err.message}`);
      return false;
    }
  }
}
