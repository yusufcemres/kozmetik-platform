import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SkinAnalysisResult, UserAction, Ingredient } from '@database/entities';
import { SkinAnalysisController } from './skin-analysis.controller';
import { SkinAnalysisService } from './skin-analysis.service';
import { SkinAnalysisCronService } from './skin-analysis.cron';
import { SkinCoachService } from './skin-coach.service';
import { SkinComboService } from './skin-combo.service';
import { VisionService } from '../smart-scan/vision.service';
import { MailModule } from '../../common/mail/mail.module';
import { PaymentsModule } from '../payments/payments.module';

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
    TypeOrmModule.forFeature([SkinAnalysisResult, UserAction, Ingredient]),
    ConfigModule,
    MailModule,
    PaymentsModule,
  ],
  controllers: [SkinAnalysisController],
  providers: [SkinAnalysisService, VisionService, SkinAnalysisCronService, SkinCoachService, SkinComboService],
  exports: [SkinAnalysisService],
})
export class SkinAnalysisModule {}
