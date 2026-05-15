import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SkinAnalysisResult } from '@database/entities';
import { SkinAnalysisController } from './skin-analysis.controller';
import { SkinAnalysisService } from './skin-analysis.service';
import { VisionService } from '../smart-scan/vision.service';

/**
 * Skin Analysis (Foto-bazlı Cilt Analizi) modülü.
 *
 * 2026-05-16 Faz 1 Gün 1 — modül iskelet (vision service smart-scan'dan reuse).
 * Gün 2'de skin-specific vision prompt eklenecek.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SkinAnalysisResult]),
    ConfigModule,
  ],
  controllers: [SkinAnalysisController],
  providers: [SkinAnalysisService, VisionService],
  exports: [SkinAnalysisService],
})
export class SkinAnalysisModule {}
