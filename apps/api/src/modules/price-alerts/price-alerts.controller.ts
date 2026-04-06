import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PriceAlertsService } from './price-alerts.service';

@ApiTags('Price Alerts')
@Controller('price-alerts')
export class PriceAlertsController {
  constructor(private readonly service: PriceAlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Fiyat alarmı oluştur (push subscription)' })
  create(@Body() body: { product_id: number; push_subscription: Record<string, unknown>; target_price?: number }) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Ürüne ait aktif alarmlar' })
  findByProduct(@Query('product_id', ParseIntPipe) productId: number) {
    return this.service.findByProduct(productId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Fiyat alarmını iptal et' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
