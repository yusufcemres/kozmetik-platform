import {
  Body, Controller, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { SupplementScoringService } from './supplement-scoring.service';
import { CosmeticScoringService } from './cosmetic-scoring.service';
import { CacheService } from '@common/cache/cache.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Scoring')
@Controller()
export class ScoringController {
  constructor(
    private readonly service: ScoringService,
    private readonly supplementScoring: SupplementScoringService,
    private readonly cosmeticScoring: CosmeticScoringService,
    private readonly cache: CacheService,
  ) {}

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

  @Get('scoring/needs/:needId/top-products')
  @ApiOperation({ summary: 'İhtiyaç için en uyumlu ürünler' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'gender', required: false, description: 'female | male' })
  @ApiQuery({ name: 'domain_type', required: false, description: 'cosmetic | supplement | all' })
  getTopProductsByNeed(
    @Param('needId', ParseIntPipe) needId: number,
    @Query('limit') limit?: string,
    @Query('gender') gender?: string,
    @Query('domain_type') domain_type?: string,
  ) {
    return this.service.getTopProductsByNeed(
      needId,
      limit ? parseInt(limit) : 12,
      { gender, domain_type },
    );
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

  @Put('admin/scoring-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Scoring konfigürasyonu toplu güncelle' })
  updateConfigBulk(
    @Body() data: { weights?: Record<string, number>; penalties?: Record<string, number> },
  ) {
    return this.service.updateConfigBulk(data);
  }

  @Put('admin/scoring-config/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Scoring konfigürasyonu tek key güncelle' })
  updateConfig(
    @Param('key') key: string,
    @Body('value') value: number,
  ) {
    return this.service.updateConfig(key, value);
  }

  // ── Supplement Evidence-Based Scoring (v2) ─────────────────────

  @Get('supplements/:id/score')
  @ApiOperation({ summary: 'Takviye evidence-based skoru (v2)' })
  getSupplementScore(@Param('id', ParseIntPipe) id: number) {
    return this.supplementScoring.calculateScore(id);
  }

  @Post('admin/supplements/:id/recalculate-score')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Takviye skorunu yeniden hesapla' })
  async recalculateSupplementScore(@Param('id', ParseIntPipe) id: number) {
    await this.cache.del(`score:${id}:supplement-v2`);
    return this.supplementScoring.calculateScore(id, true);
  }

  @Get('supplements/top-by-nutrient/:slug')
  @ApiOperation({ summary: 'Besine göre en iyi takviyeler' })
  @ApiQuery({ name: 'limit', required: false })
  getTopByNutrient(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ) {
    return this.supplementScoring.getTopByNutrient(slug, limit ? parseInt(limit) : 10);
  }

  // ── Cosmetic Evidence-Based Scoring (v1) ───────────────────────

  @Get('products/:id/cosmetic-score')
  @ApiOperation({ summary: 'Kozmetik evidence-based skoru (v1)' })
  getCosmeticScore(@Param('id', ParseIntPipe) id: number) {
    return this.cosmeticScoring.calculateScore(id);
  }

  @Post('admin/products/:id/recalculate-cosmetic-score')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kozmetik skorunu yeniden hesapla' })
  async recalculateCosmeticScore(@Param('id', ParseIntPipe) id: number) {
    await this.cache.del(`score:${id}:cosmetic-v1`);
    return this.cosmeticScoring.calculateScore(id, true);
  }

  @Get('products/top-by-concern/:slug')
  @ApiOperation({ summary: 'Cilt sorununa göre en iyi ürünler' })
  @ApiQuery({ name: 'limit', required: false })
  getTopByConcern(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ) {
    return this.cosmeticScoring.getTopByConcern(slug, limit ? parseInt(limit) : 10);
  }

  // ── Bulk recalculate (evidence-based v2) ───────────────────────

  @Post('admin/scoring/recalculate-supplements-v2')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tüm takviye ürünlerini supplement-v2 ile toplu hesapla',
    description: 'product_scores cache tablosunu doldurur. Chunk 20, Promise.allSettled.',
  })
  recalculateAllSupplementsV2() {
    return this.supplementScoring.recalculateAll();
  }

  @Post('admin/scoring/recalculate-cosmetics-v1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tüm kozmetik ürünlerini cosmetic-v1 ile toplu hesapla',
    description: 'product_scores cache tablosunu doldurur. Chunk 20, Promise.allSettled.',
  })
  recalculateAllCosmeticsV1() {
    return this.cosmeticScoring.recalculateAll();
  }

  @Post('admin/scoring/recalculate-evidence-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Hem takviye hem kozmetik ürünlerini sırayla yeniden hesapla',
    description: 'Sabah morning job için tek endpoint. Supplement → cosmetic sırayla.',
  })
  async recalculateAllEvidence() {
    const supplement = await this.supplementScoring.recalculateAll();
    const cosmetic = await this.cosmeticScoring.recalculateAll();
    return {
      supplement,
      cosmetic,
      total_duration_ms: supplement.duration_ms + cosmetic.duration_ms,
    };
  }
}
