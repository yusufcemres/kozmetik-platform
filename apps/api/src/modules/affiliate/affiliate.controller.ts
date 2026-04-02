import {
  Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Affiliate & Pricing')
@Controller()
export class AffiliateController {
  constructor(private readonly service: AffiliateService) {}

  // === Public ===

  @Get('products/:productId/price-drops')
  @ApiOperation({ summary: 'Ürün fiyat düşüş bilgisi (public)' })
  getPriceDrops(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.detectPriceDrops(productId);
  }

  @Get('affiliate-links/:linkId/price-history')
  @ApiOperation({ summary: 'Fiyat geçmişi (grafik için)' })
  @ApiQuery({ name: 'days', required: false })
  getPriceHistory(
    @Param('linkId', ParseIntPipe) linkId: number,
    @Query('days') days?: string,
  ) {
    return this.service.getPriceHistory(linkId, days ? parseInt(days) : 30);
  }

  // === Admin ===

  @Post('admin/affiliate/update-prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm fiyatları güncelle (batch)' })
  batchUpdate() {
    return this.service.batchUpdatePrices();
  }

  @Post('admin/affiliate/update-price/:linkId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tek link fiyatı güncelle' })
  updateSingle(@Param('linkId', ParseIntPipe) linkId: number) {
    return this.service.updateSinglePrice(linkId);
  }

  @Get('admin/affiliate/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Affiliate metrikleri' })
  getMetrics() {
    return this.service.getAffiliateMetrics();
  }
}
