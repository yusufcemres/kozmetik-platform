import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, UnknownScan, ScanHistory } from '@database/entities';
import { SmartScanController } from './smart-scan.controller';
import { SmartScanService } from './smart-scan.service';
import { VisionService } from './vision.service';
import { MatchService } from './match.service';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, UnknownScan, ScanHistory]),
    UserAuthModule,
  ],
  controllers: [SmartScanController],
  providers: [SmartScanService, VisionService, MatchService],
  exports: [SmartScanService],
})
export class SmartScanModule {}
