import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product, ProductIngredient, ProductNeedScore,
  IngredientNeedMapping, ScoringConfig, UserSkinProfile,
  SupplementDetail, SupplementIngredient, Ingredient, IngredientInteraction,
} from '@database/entities';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { SupplementScoringService } from './supplement-scoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, ProductIngredient, ProductNeedScore,
      IngredientNeedMapping, ScoringConfig, UserSkinProfile,
      SupplementDetail, SupplementIngredient, Ingredient, IngredientInteraction,
    ]),
  ],
  controllers: [ScoringController],
  providers: [ScoringService, SupplementScoringService],
  exports: [ScoringService, SupplementScoringService],
})
export class ScoringModule {}
