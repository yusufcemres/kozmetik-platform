import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenceLevel, ApprovedWording } from '@database/entities';
import { MethodologyController } from './methodology.controller';
import { MethodologyService } from './methodology.service';

@Module({
  imports: [TypeOrmModule.forFeature([EvidenceLevel, ApprovedWording])],
  controllers: [MethodologyController],
  providers: [MethodologyService],
  exports: [MethodologyService],
})
export class MethodologyModule {}
