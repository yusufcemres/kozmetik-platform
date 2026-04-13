import { Module } from '@nestjs/common';
import { TitckController } from './titck.controller';
import { TitckService } from './titck.service';

@Module({
  controllers: [TitckController],
  providers: [TitckService],
  exports: [TitckService],
})
export class TitckModule {}
