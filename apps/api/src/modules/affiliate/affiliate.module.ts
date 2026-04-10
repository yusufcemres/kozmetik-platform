import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AffiliateLink, AffiliateClick, PriceHistory } from '@database/entities';
import { AffiliateController } from './affiliate.controller';
import { AffiliateRedirectController } from './affiliate-redirect.controller';
import { AffiliateService } from './affiliate.service';
import { AffiliateCronService } from './affiliate.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([AffiliateLink, AffiliateClick, PriceHistory]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AffiliateController, AffiliateRedirectController],
  providers: [AffiliateService, AffiliateCronService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
