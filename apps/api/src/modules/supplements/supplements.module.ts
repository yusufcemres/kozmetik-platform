import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplementDetail, SupplementIngredient, Product } from '@database/entities';
import { SupplementsController } from './supplements.controller';
import { SupplementsService } from './supplements.service';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplementDetail, SupplementIngredient, Product]),
    ScoringModule,
  ],
  controllers: [SupplementsController],
  providers: [SupplementsService],
  exports: [SupplementsService],
})
export class SupplementsModule {}
