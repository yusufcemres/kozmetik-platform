import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { IngestInciDto, BulkIngestDto } from './dto/ingest.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Ingestion')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IngestionController {
  constructor(private readonly service: IngestionService) {}

  @Post('ingestion/ingest')
  @Roles('super_admin', 'content_editor', 'taxonomy_editor')
  @ApiOperation({ summary: 'INCI metni parse et ve eşleştir' })
  ingest(@Body() dto: IngestInciDto) {
    return this.service.ingest(dto);
  }

  @Post('ingestion/bulk-csv')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Toplu CSV import (product_id,inci_text)' })
  bulkCsv(@Body() dto: BulkIngestDto) {
    return this.service.bulkIngestCsv(dto.csv_content);
  }

  @Get('admin/review-queue')
  @Roles('super_admin', 'reviewer', 'taxonomy_editor')
  @ApiOperation({ summary: 'INCI eşleşme review queue' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getReviewQueue(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getReviewQueue(status || 'review_needed', page || 1, limit || 20);
  }

  @Put('admin/review-queue/:id')
  @Roles('super_admin', 'reviewer', 'taxonomy_editor')
  @ApiOperation({ summary: 'Review queue item güncelle' })
  updateReviewItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { ingredient_id?: number; match_status?: string; admin_note?: string },
  ) {
    return this.service.updateReviewItem(id, data);
  }
}
