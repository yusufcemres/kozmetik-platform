import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApiKey, Webhook, Product, Ingredient, Need,
  AffiliateLink, ProductNeedScore, ProductIngredient,
} from '@database/entities';
import { B2bService } from './b2b.service';
import { B2bController } from './b2b.controller';
import { B2bExportController } from './b2b-export.controller';
import { B2bExportService } from './b2b-export.service';
import { ApiKeyGuard } from '@common/guards/api-key.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiKey, Webhook, Product, Ingredient, Need,
      AffiliateLink, ProductNeedScore, ProductIngredient,
    ]),
  ],
  controllers: [B2bController, B2bExportController],
  providers: [B2bService, B2bExportService, ApiKeyGuard],
  exports: [B2bService],
})
export class B2bModule {}
