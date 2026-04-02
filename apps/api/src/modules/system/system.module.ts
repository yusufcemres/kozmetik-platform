import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCorrection, AuditLog, BatchImport } from '@database/entities';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserCorrection, AuditLog, BatchImport])],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
