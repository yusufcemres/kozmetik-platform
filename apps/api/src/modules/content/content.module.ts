import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ContentArticle, ProductRelatedArticle,
  IngredientRelatedArticle, NeedRelatedArticle,
  SponsorshipDisclosure,
} from '@database/entities';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentArticle, ProductRelatedArticle,
      IngredientRelatedArticle, NeedRelatedArticle,
      SponsorshipDisclosure,
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
