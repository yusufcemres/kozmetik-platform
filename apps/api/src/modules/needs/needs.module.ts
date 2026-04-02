import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from '@database/entities';
import { NeedsController } from './needs.controller';
import { NeedsService } from './needs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Need])],
  controllers: [NeedsController],
  providers: [NeedsService],
  exports: [NeedsService],
})
export class NeedsModule {}
