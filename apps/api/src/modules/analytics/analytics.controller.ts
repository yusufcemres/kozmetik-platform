import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { BatchEventsDto } from './dto/batch-events.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ public: { ttl: 60000, limit: 10 } })
  async ingestEvents(
    @Body() dto: BatchEventsDto,
    @Req() req: Request,
  ): Promise<void> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    await this.analyticsService.ingestBatch(dto.events, ip);
  }

  @Get('summary')
  async getSummary(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getSummary(Math.min(days, 90));
  }
}
