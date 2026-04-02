import {
  Controller, Get, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { B2bExportService } from './b2b-export.service';

@ApiTags('B2B Export API')
@Controller('b2b/v1')
@UseGuards(ApiKeyGuard)
@ApiHeader({ name: 'X-API-Key', required: true, description: 'B2B API key' })
export class B2bExportController {
  constructor(private readonly exportService: B2bExportService) {}

  @Get('products')
  @ApiOperation({ summary: 'Ürün verisi (bulk)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
  ) {
    return this.exportService.exportProducts({
      page: page ? parseInt(page) : 1,
      limit: Math.min(limit ? parseInt(limit) : 50, 100),
      category,
      brand,
    });
  }

  @Get('ingredients')
  @ApiOperation({ summary: 'İçerik maddesi verisi (bulk)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getIngredients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.exportService.exportIngredients({
      page: page ? parseInt(page) : 1,
      limit: Math.min(limit ? parseInt(limit) : 50, 200),
    });
  }

  @Get('products/prices')
  @ApiOperation({ summary: 'Ürün fiyat verisi' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getProductPrices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.exportService.exportPrices({
      page: page ? parseInt(page) : 1,
      limit: Math.min(limit ? parseInt(limit) : 50, 100),
    });
  }

  @Get('needs')
  @ApiOperation({ summary: 'İhtiyaç/concern verisi' })
  getNeeds() {
    return this.exportService.exportNeeds();
  }

  @Get('product-scores')
  @ApiOperation({ summary: 'Ürün-ihtiyaç skorları' })
  @ApiQuery({ name: 'product_id', required: false })
  getProductScores(@Query('product_id') productId?: string) {
    return this.exportService.exportProductScores(productId ? parseInt(productId) : undefined);
  }
}
