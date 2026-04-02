import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient, IngredientAlias, IngredientEvidenceLink } from '@database/entities';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient, IngredientAlias, IngredientEvidenceLink]),
  ],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
