import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product, ProductIngredient, ProductNeedScore,
  IngredientNeedMapping, ScoringConfig, UserSkinProfile,
} from '@database/entities';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, ProductIngredient, ProductNeedScore,
      IngredientNeedMapping, ScoringConfig, UserSkinProfile,
    ]),
  ],
  controllers: [ScoringController],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
