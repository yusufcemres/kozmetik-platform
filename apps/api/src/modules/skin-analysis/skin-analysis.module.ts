import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SkinAnalysisResult } from '@database/entities';
import { SkinAnalysisController } from './skin-analysis.controller';
import { SkinAnalysisService } from './skin-analysis.service';
import { SkinAnalysisCronService } from './skin-analysis.cron';
import { VisionService } from '../smart-scan/vision.service';
import { MailModule } from '../../common/mail/mail.module';

/**
 * Skin Analysis (Foto-bazlı Cilt Analizi) modülü.
 *
 * Gün 1: modül iskelet (vision smart-scan'dan reuse).
 * Gün 8: enriched recommendations (REVELA INCI + ürün eşleştirme).
 * Gün 9: email funnel (opt-in welcome + 28-gün reminder cron).
 *
 * @nestjs/schedule global olarak affiliate.module'de forRoot() ile aktif —
 * burada sadece cron provider'ı ekleniyor.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SkinAnalysisResult]),
    ConfigModule,
    MailModule,
  ],
  controllers: [SkinAnalysisController],
  providers: [SkinAnalysisService, VisionService, SkinAnalysisCronService],
  exports: [SkinAnalysisService],
})
export class SkinAnalysisModule {}
