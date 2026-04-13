import { Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PublishGateService } from './publish-gate.service';

@Controller('tag-validator')
export class TagValidatorController {
  constructor(private readonly gate: PublishGateService) {}

  @Post('check/:id')
  check(@Param('id', ParseIntPipe) id: number) {
    return this.gate.check(id);
  }

  @Post('bulk')
  bulk(@Query('limit') limit?: string) {
    return this.gate.runBulk(limit ? Number(limit) : 500);
  }
}
