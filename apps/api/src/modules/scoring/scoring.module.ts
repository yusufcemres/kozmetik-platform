import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product, ProductIngredient, ProductNeedScore,
  IngredientNeedMapping, ScoringConfig, UserSkinProfile,
  SupplementDetail, SupplementIngredient, Ingredient, IngredientInteraction,
  ProductScore,
} from '@database/entities';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { SupplementScoringService } from './supplement-scoring.service';
import { CosmeticScoringService } from './cosmetic-scoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, ProductIngredient, ProductNeedScore,
      IngredientNeedMapping, ScoringConfig, UserSkinProfile,
      SupplementDetail, SupplementIngredient, Ingredient, IngredientInteraction,
      ProductScore,
    ]),
  ],
  controllers: [ScoringController],
  providers: [ScoringService, SupplementScoringService, CosmeticScoringService],
  exports: [ScoringService, SupplementScoringService, CosmeticScoringService],
})
export class ScoringModule {}
