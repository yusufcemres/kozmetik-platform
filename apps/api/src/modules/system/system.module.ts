import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserCorrection, AuditLog, BatchImport,
  Product, ProductVariant, ProductIngredient, ProductNeedScore,
  Ingredient, IngredientNeedMapping, IngredientEvidenceLink,
  AffiliateLink, ContentArticle, Category, Brand, Need,
} from '@database/entities';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { QcController } from './qc.controller';
import { QcService } from './qc.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCorrection, AuditLog, BatchImport,
      Product, ProductVariant, ProductIngredient, ProductNeedScore,
      Ingredient, IngredientNeedMapping, IngredientEvidenceLink,
      AffiliateLink, ContentArticle, Category, Brand, Need,
    ]),
  ],
  controllers: [SystemController, QcController],
  providers: [SystemService, QcService],
  exports: [SystemService, QcService],
})
export class SystemModule {}
