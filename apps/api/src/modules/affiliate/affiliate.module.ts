import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AffiliateLink, PriceHistory } from '@database/entities';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { AffiliateCronService } from './affiliate.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([AffiliateLink, PriceHistory]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AffiliateController],
  providers: [AffiliateService, AffiliateCronService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
