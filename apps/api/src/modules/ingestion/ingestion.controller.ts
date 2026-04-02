import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { IngestInciDto, BulkIngestDto } from './dto/ingest.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Ingestion')
@Controller('ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IngestionController {
  constructor(private readonly service: IngestionService) {}

  @Post('ingest')
  @Roles('super_admin', 'content_editor', 'taxonomy_editor')
  @ApiOperation({ summary: 'INCI metni parse et ve eşleştir' })
  ingest(@Body() dto: IngestInciDto) {
    return this.service.ingest(dto);
  }

  @Post('bulk-csv')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Toplu CSV import (product_id,inci_text)' })
  bulkCsv(@Body() dto: BulkIngestDto) {
    return this.service.bulkIngestCsv(dto.csv_content);
  }
}
