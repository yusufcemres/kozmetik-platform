import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product, ProductLabel, ProductImage, ProductMaster,
  ProductVariant, AffiliateLink, FormulaRevision,
} from '@database/entities';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, ProductLabel, ProductImage,
      ProductMaster, ProductVariant,
      AffiliateLink, FormulaRevision,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
