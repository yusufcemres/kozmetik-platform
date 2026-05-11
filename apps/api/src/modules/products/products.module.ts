import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product, ProductLabel, ProductImage, ProductMaster,
  ProductVariant, AffiliateLink, AffiliateClick, FormulaRevision, PriceHistory,
  Category, ProductScore,
} from '@database/entities';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { InteractionsModule } from '../interactions/interactions.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, ProductLabel, ProductImage,
      ProductMaster, ProductVariant,
      AffiliateLink, AffiliateClick, FormulaRevision, PriceHistory,
      Category, ProductScore,
    ]),
    InteractionsModule,
    ReviewsModule,
    ScoringModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
