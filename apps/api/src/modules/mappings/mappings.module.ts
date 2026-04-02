import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientNeedMapping } from '@database/entities';
import { MappingsController } from './mappings.controller';
import { MappingsService } from './mappings.service';

@Module({
  imports: [TypeOrmModule.forFeature([IngredientNeedMapping])],
  controllers: [MappingsController],
  providers: [MappingsService],
  exports: [MappingsService],
})
export class MappingsModule {}
