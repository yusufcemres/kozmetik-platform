import {
  Body, Controller, Delete, Get, Header, Param, ParseIntPipe,
  Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateAffiliateLinkDto } from './dto/create-affiliate-link.dto';
import { UpdateAffiliateLinkDto } from './dto/update-affiliate-link.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
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
  @ApiQuery({ name: 'include_score', required: false, description: 'true ise precomputed skor eklenir' })
  async findAll(@Query() query: ProductFilterDto, @Query('include_score') includeScore?: string) {
    // Sprint 6: rich filter param normalize — comma-separated string → array
    const splitCsv = (s?: string) => s ? s.split(',').map(x => x.trim()).filter(Boolean) : undefined;
    const parseNum = (s?: string) => s != null && s !== '' ? Number(s) : undefined;

    const result = await this.service.findAll({
      ...query,
      brand_id: query.brand_id ? Number(query.brand_id) : undefined,
      category_id: query.category_id ? Number(query.category_id) : undefined,
      category_slug: query.category_slug || undefined,
      need_id: query.need_id ? Number(query.need_id) : undefined,
      ingredient_slugs: splitCsv(query.ingredient_slugs),
      need_ids: splitCsv(query.need_ids)?.map(Number).filter(n => Number.isFinite(n)),
      form: splitCsv(query.form),
      certifications: splitCsv(query.certifications),
      target_audience: splitCsv(query.target_audience),
      manufacturer_country: splitCsv(query.manufacturer_country),
      score_min: parseNum(query.score_min),
      score_max: parseNum(query.score_max),
      price_min: parseNum(query.price_min),
      price_max: parseNum(query.price_max),
      skin_type: splitCsv(query.skin_type),
      product_types: splitCsv(query.product_types),
      target_areas: splitCsv(query.target_areas),
      // Round 2: ek filter dimension'ları
      evidence_grade: splitCsv(query.evidence_grade),
      safety_flags: splitCsv(query.safety_flags),
      allergen_count_max: parseNum(query.allergen_count_max),
    });
    if (includeScore === 'true' && result.data?.length) {
      result.data = await this.service.attachScores(result.data);
    }
    return result;
  }

  @Get('filter-facets')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600')
  @ApiOperation({ summary: 'Filter sidebar için dimension count\'ları (cache 15dk edge)' })
  @ApiQuery({ name: 'domain_type', required: true, description: 'cosmetic | supplement' })
  filterFacets(@Query('domain_type') domainType: string) {
    if (!['cosmetic', 'supplement'].includes(domainType)) {
      return { error: 'domain_type cosmetic veya supplement olmalı' };
    }
    return this.service.getFilterFacets(domainType);
  }

  @Get('top-scored')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600')
  @ApiOperation({ summary: 'En yüksek skorlu ürünler' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'brand_id', required: false })
  findTopScored(@Query('limit') limit?: string, @Query('brand_id') brandId?: string) {
    const lim = Math.min(Math.max(parseInt(limit ?? '', 10) || 6, 1), 50);
    const bId = brandId ? parseInt(brandId, 10) || undefined : undefined;
    return this.service.findTopScored(lim, bId);
  }

  @Get('by-ingredient/:ingredientId')
  @ApiOperation({ summary: 'İçeriğe göre ürün listesi' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'domain_type', required: false, description: 'cosmetic veya supplement' })
  findByIngredient(
    @Param('ingredientId', ParseIntPipe) ingredientId: number,
    @Query('limit') limit?: string,
    @Query('domain_type') domainType?: string,
  ) {
    const lim = Math.min(Math.max(parseInt(limit ?? '', 10) || 20, 1), 100);
    return this.service.findByIngredient(ingredientId, lim, domainType);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Ürünleri karşılaştır (çoklu ID, skor dahil)' })
  @ApiQuery({ name: 'ids', required: true, description: 'Virgülle ayrılmış product ID\'leri' })
  compare(@Query('ids') ids: string) {
    const idArr = (ids ?? '')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 4);
    return this.service.findByIdsWithScores(idArr);
  }

  @Get('popular-brands')
  @Header('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400')
  @ApiOperation({ summary: 'Popüler markalar (ürün sayısına göre)' })
  @ApiQuery({ name: 'limit', required: false })
  findPopularBrands(@Query('limit') limit?: string) {
    const lim = Math.min(Math.max(parseInt(limit ?? '', 10) || 12, 1), 50);
    return this.service.findPopularBrands(lim);
  }

  @Get('affiliate-health')
  @ApiOperation({ summary: 'Affiliate link sağlık durumu' })
  getAffiliateHealth() {
    return this.service.getAffiliateHealth();
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Benzer ürünler' })
  @ApiQuery({ name: 'limit', required: false, description: 'Sonuç limiti (varsayılan 4)' })
  @ApiQuery({ name: 'domain_type', required: false, description: 'cosmetic veya supplement' })
  findSimilar(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('domain_type') domainType?: string,
  ) {
    const lim = Math.min(Math.max(parseInt(limit ?? '', 10) || 4, 1), 20);
    return this.service.findSimilar(id, lim, domainType || undefined);
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

  @Get('barcode/:barcode')
  @Header('Cache-Control', 'public, max-age=120, s-maxage=600')
  @ApiOperation({ summary: 'Barkodla urun bul (REVELA -> OpenBeautyFacts -> not_found)' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.service.findByBarcode(barcode);
  }

  @Get('slug/:slug/full')
  @Header('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=3600')
  @ApiOperation({ summary: 'Ürün detay (composite) — product + similar + interactions + score + reviews + supplement cross-refs tek atışta' })
  findBySlugFull(@Param('slug') slug: string) {
    return this.service.findBySlugFull(slug);
  }

  @Post('admin/cache/flush-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tum product slug Redis cache temizle (ops araci)' })
  flushProductCache() {
    return this.service.flushAllProductCache();
  }

  @Get('admin/ocr-drafts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'OCR ile eklenen draft urun review queue' })
  ocrDrafts() {
    return this.service.getOcrDrafts();
  }

  @Get('admin/inci-proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tarama ile eklenen pending INCI onerileri (admin onay)' })
  inciProposals() {
    return this.service.getInciProposals();
  }

  @Get('admin/inci-mapping-proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI ile uretilmis INCI->need mapping onerileri (admin onay)' })
  inciMappingProposals() {
    return this.service.getInciMappingProposals();
  }

  @Post('admin/inci-mapping-proposals/:proposalId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer', 'content_editor')
  @ApiBearerAuth()
  approveMappingProposal(@Param('proposalId', ParseIntPipe) proposalId: number) {
    return this.service.approveMappingProposal(proposalId);
  }

  @Delete('admin/inci-mapping-proposals/:proposalId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer', 'content_editor')
  @ApiBearerAuth()
  rejectMappingProposal(@Param('proposalId', ParseIntPipe) proposalId: number) {
    return this.service.rejectMappingProposal(proposalId);
  }

  @Post('admin/inci-proposals/:piId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'INCI onerisi onayla (pending_review -> auto_matched)' })
  approveInciProposal(@Param('piId', ParseIntPipe) piId: number) {
    return this.service.approveInciProposal(piId);
  }

  @Delete('admin/inci-proposals/:piId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'INCI onerisi reddet (sil)' })
  rejectInciProposal(@Param('piId', ParseIntPipe) piId: number) {
    return this.service.rejectInciProposal(piId);
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

  @Get(':id/price-history')
  @ApiOperation({ summary: 'Fiyat geçmişi (platform bazlı)' })
  @ApiQuery({ name: 'days', required: false, description: 'Kaç günlük geçmiş (varsayılan 90)' })
  getPriceHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('days') days?: string,
  ) {
    const d = Math.min(Math.max(parseInt(days ?? '', 10) || 90, 1), 365);
    return this.service.getPriceHistory(id, d);
  }

  // === Affiliate Click Tracking ===

  @Post('affiliate-clicks')
  @ApiOperation({ summary: 'Affiliate tıklama kaydet (fire-and-forget)' })
  trackClick(
    @Body() body: { affiliate_link_id: number; source_page?: string },
    @Req() req: Request,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const ipHash = ip ? createHash('sha256').update(ip).digest('hex').slice(0, 16) : undefined;
    return this.service.trackClick({
      affiliate_link_id: body.affiliate_link_id,
      source_page: body.source_page,
      ip_hash: ipHash,
      user_agent: req.headers['user-agent'],
    });
  }
}
