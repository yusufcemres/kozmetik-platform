import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceAlert } from '@database/entities';
import { PriceAlertsController } from './price-alerts.controller';
import { PriceAlertsService } from './price-alerts.service';

@Module({
  imports: [TypeOrmModule.forFeature([PriceAlert])],
  controllers: [PriceAlertsController],
  providers: [PriceAlertsService],
  exports: [PriceAlertsService],
})
export class PriceAlertsModule {}
