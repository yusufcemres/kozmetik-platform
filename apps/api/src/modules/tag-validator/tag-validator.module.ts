import { Module } from '@nestjs/common';
import { TagDeriverService } from './tag-deriver.service';
import { TagCertifierService } from './tag-certifier.service';
import { TagConflictDetectorService } from './tag-conflict-detector.service';
import { PublishGateService } from './publish-gate.service';
import { TagValidatorController } from './tag-validator.controller';

@Module({
  controllers: [TagValidatorController],
  providers: [TagDeriverService, TagCertifierService, TagConflictDetectorService, PublishGateService],
  exports: [TagDeriverService, TagCertifierService, TagConflictDetectorService, PublishGateService],
})
export class TagValidatorModule {}
