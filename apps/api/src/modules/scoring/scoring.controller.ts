import {
  Body, Controller, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Scoring')
@Controller()
export class ScoringController {
  constructor(private readonly service: ScoringService) {}

  @Post('products/:id/calculate-scores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün skorlarını hesapla' })
  calculateScores(@Param('id', ParseIntPipe) id: number) {
    return this.service.calculateScores(id);
  }

  @Post('scoring/recalculate-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm yayınlanmış ürünleri yeniden hesapla' })
  recalculateAll() {
    return this.service.recalculateAll();
  }

  @Get('products/:id/need-scores')
  @ApiOperation({ summary: 'Ürün ihtiyaç skorları' })
  getNeedScores(@Param('id', ParseIntPipe) id: number) {
    return this.service.getNeedScores(id);
  }

  @Get('products/:id/personal-score')
  @ApiOperation({ summary: 'Kişisel uyum skoru' })
  @ApiQuery({ name: 'profile_id', required: true })
  getPersonalScore(
    @Param('id', ParseIntPipe) id: number,
    @Query('profile_id') profileId: string,
  ) {
    return this.service.getPersonalScore(id, profileId);
  }

  @Get('admin/scoring-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Scoring konfigürasyonu' })
  getConfig() {
    return this.service.getConfig();
  }

  @Put('admin/scoring-config/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Scoring konfigürasyonu güncelle' })
  updateConfig(
    @Param('key') key: string,
    @Body('value') value: number,
  ) {
    return this.service.updateConfig(key, value);
  }
}
