import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SkinAnalysisService } from './skin-analysis.service';

/**
 * Foto analiz 28-gün reminder cron'u (Faz 1 Gün 9).
 *
 * Her sabah 09:00 (TR saati) çalışır → 28+ gün önce opt-in yapılmış,
 * henüz reminder gönderilmemiş analizleri bulup hatırlatma yollar.
 *
 * 09:00 seçimi: kullanıcı kalktığında inbox'unda hazır olsun,
 * gün ortası bildirim yorgunluğu yaratmasın.
 *
 * ScheduleModule.forRoot() affiliate.module.ts'te global aktif —
 * tekrar forRoot etmeye gerek yok, sadece provider olarak ekleniyor.
 */
@Injectable()
export class SkinAnalysisCronService {
  private readonly logger = new Logger(SkinAnalysisCronService.name);

  constructor(private readonly service: SkinAnalysisService) {}

  @Cron('0 9 * * *', { name: 'skin_analysis_28day_reminder', timeZone: 'Europe/Istanbul' })
  async sendReminders(): Promise<void> {
    try {
      const result = await this.service.sendDueReminders();
      if (result.sent > 0 || result.failed > 0) {
        this.logger.log(`Daily reminder run: sent=${result.sent} failed=${result.failed}`);
      }
    } catch (err) {
      this.logger.error(`Reminder cron failed: ${err instanceof Error ? err.message : err}`);
    }
  }
}
