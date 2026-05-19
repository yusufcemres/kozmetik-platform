import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentsService } from './payments.service';

/**
 * Premium üyelik bitiş hatırlatma cron'u (Faz 3 polish, 2026-05-19).
 *
 * Her sabah 09:30 TR'de çalışır → premium_until bitmesine 7 gün veya daha az
 * kalmış, henüz uyarılmamış kullanıcılara "Yakında bitiyor" maili atar.
 *
 * 09:30 seçimi: skin-analysis 28-gün reminder 09:00'da çalışıyor → çakışmadan
 * kaçınmak için 30dk sonra (her ikisi DB'ye paralel hit yapmasın).
 */
@Injectable()
export class PaymentsCronService {
  private readonly logger = new Logger(PaymentsCronService.name);

  constructor(private readonly service: PaymentsService) {}

  @Cron('30 9 * * *', { name: 'premium_ending_reminder', timeZone: 'Europe/Istanbul' })
  async sendReminders(): Promise<void> {
    try {
      const result = await this.service.sendPremiumEndingReminders();
      if (result.sent > 0 || result.failed > 0) {
        this.logger.log(
          `Daily premium reminder run: sent=${result.sent} failed=${result.failed} skipped=${result.skipped}`,
        );
      }
    } catch (err) {
      this.logger.error(`Premium reminder cron failed: ${err instanceof Error ? err.message : err}`);
    }
  }
}
