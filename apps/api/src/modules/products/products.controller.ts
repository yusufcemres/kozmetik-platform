import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateAffiliateLinkDto } from './dto/create-affiliate-link.dto';
import { UpdateAffiliateLinkDto } from './dto/update-affiliate-link.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün oluştur' })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Ürünleri listele' })
  @ApiQuery({ name: 'brand_id', required: false })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query() query: PaginationDto,
    @Query('brand_id') brand_id?: number,
    @Query('category_id') category_id?: number,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ ...query, brand_id, category_id, status });
  }

  @Get('top-scored')
  @ApiOperation({ summary: 'En yüksek skorlu ürünler' })
  @ApiQuery({ name: 'limit', required: false })
  findTopScored(@Query('limit') limit?: string) {
    return this.service.findTopScored(limit ? parseInt(limit) : 6);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Ürünleri karşılaştır (çoklu ID)' })
  @ApiQuery({ name: 'ids', required: true, description: 'Virgülle ayrılmış product ID\'leri' })
  compare(@Query('ids') ids: string) {
    const idArr = ids.split(',').map(Number).filter(Boolean).slice(0, 4);
    return this.service.findByIds(idArr);
  }

  @Get('popular-brands')
  @ApiOperation({ summary: 'Popüler markalar (ürün sayısına göre)' })
  @ApiQuery({ name: 'limit', required: false })
  findPopularBrands(@Query('limit') limit?: string) {
    return this.service.findPopularBrands(limit ? parseInt(limit) : 12);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ürün detay (ID)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Ürün detay (slug)' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün güncelle' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün durumunu güncelle' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün arşivle' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // === Affiliate Links ===

  @Post(':id/affiliate-links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Affiliate link ekle' })
  createAffiliateLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAffiliateLinkDto,
  ) {
    return this.service.createAffiliateLink(id, dto);
  }

  @Get(':id/affiliate-links')
  @ApiOperation({ summary: 'Ürün affiliate linkleri' })
  getAffiliateLinks(@Param('id', ParseIntPipe) id: number) {
    return this.service.getAffiliateLinks(id);
  }

  @Put('affiliate-links/:linkId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Affiliate link güncelle' })
  updateAffiliateLink(
    @Param('linkId', ParseIntPipe) linkId: number,
    @Body() dto: UpdateAffiliateLinkDto,
  ) {
    return this.service.updateAffiliateLink(linkId, dto);
  }

  @Delete('affiliate-links/:linkId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Affiliate link sil' })
  removeAffiliateLink(@Param('linkId', ParseIntPipe) linkId: number) {
    return this.service.removeAffiliateLink(linkId);
  }

  // === Formula Revisions ===

  @Get(':id/formula-revisions')
  @ApiOperation({ summary: 'Formül değişiklik geçmişi' })
  getFormulaRevisions(@Param('id', ParseIntPipe) id: number) {
    return this.service.getFormulaRevisions(id);
  }
}
