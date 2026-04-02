import {
  Body, Controller, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('System')
@Controller()
export class SystemController {
  constructor(private readonly service: SystemService) {}

  // === Public: Corrections ===

  @Post('corrections')
  @ApiOperation({ summary: 'Hata bildir (public)' })
  createCorrection(
    @Body() data: { entity_type: string; entity_id: number; correction_text: string; reporter_email?: string },
  ) {
    return this.service.createCorrection(data);
  }

  // === Admin: Corrections ===

  @Get('admin/corrections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Düzeltme bildirimleri (admin)' })
  @ApiQuery({ name: 'status', required: false })
  getCorrections(
    @Query() query: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.service.getCorrections({ ...query, status });
  }

  @Put('admin/corrections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Düzeltme durumu güncelle' })
  updateCorrection(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: string; admin_note?: string },
  ) {
    return this.service.updateCorrectionStatus(id, data.status, data.admin_note);
  }

  // === Admin: Audit Logs ===

  @Get('admin/audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Audit logları' })
  @ApiQuery({ name: 'entity_type', required: false })
  getAuditLogs(
    @Query() query: PaginationDto,
    @Query('entity_type') entity_type?: string,
  ) {
    return this.service.getAuditLogs({ ...query, entity_type });
  }

  // === Admin: Batch Imports ===

  @Get('admin/batch-imports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toplu import geçmişi' })
  getBatchImports(@Query() query: PaginationDto) {
    return this.service.getBatchImports(query);
  }
}
