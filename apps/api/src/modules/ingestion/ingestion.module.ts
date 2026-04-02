import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product, ProductLabel, ProductIngredient,
  Ingredient, IngredientAlias,
} from '@database/entities';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, ProductLabel, ProductIngredient,
      Ingredient, IngredientAlias,
    ]),
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
