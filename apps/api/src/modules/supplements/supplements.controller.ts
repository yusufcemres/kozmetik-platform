import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupplementsService } from './supplements.service';
import { SupplementScoringService } from '../scoring/supplement-scoring.service';
import { CreateSupplementDetailDto, UpdateSupplementDetailDto, SupplementIngredientDto } from './dto/create-supplement.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Supplements')
@Controller()
export class SupplementsController {
  constructor(
    private readonly service: SupplementsService,
    private readonly scoringService: SupplementScoringService,
  ) {}

  // === Public ===

  @Get('supplements')
  @ApiOperation({ summary: 'Supplement ürün listesi (public)' })
  findAll(@Query() query: PaginationDto) {
    return this.service.findAllSupplements(query);
  }

  @Get('supplements/top-by-nutrient/:ingredientSlug')
  @ApiOperation({ summary: 'Belirli bir nutrient için en yüksek skorlu supplement ürünler' })
  topByNutrient(
    @Param('ingredientSlug') ingredientSlug: string,
    @Query('limit') limit?: string,
  ) {
    return this.scoringService.getTopByNutrient(ingredientSlug, limit ? parseInt(limit) : 10);
  }

  @Get('supplements/:productId')
  @ApiOperation({ summary: 'Supplement detay (public)' })
  findOne(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.findByProductId(productId);
  }

  @Get('supplements/:productId/score')
  @ApiOperation({ summary: 'Supplement skoru (form kalitesi + dozaj + etkileşim + şeffaflık + sertifika)' })
  getScore(@Param('productId', ParseIntPipe) productId: number) {
    return this.scoringService.calculateScore(productId);
  }

  @Post('admin/supplements/:productId/recalculate-score')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplement skorunu yeniden hesapla' })
  recalculateScore(@Param('productId', ParseIntPipe) productId: number) {
    return this.scoringService.calculateScore(productId);
  }

  // === Admin ===

  @Post('admin/supplements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplement detay oluştur (+ nutrition facts)' })
  create(@Body() dto: CreateSupplementDetailDto) {
    return this.service.create(dto);
  }

  @Put('admin/supplements/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplement detay güncelle' })
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateSupplementDetailDto,
  ) {
    return this.service.update(productId, dto);
  }

  @Delete('admin/supplements/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplement detay sil' })
  remove(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.remove(productId);
  }

  // === Nutrition Facts ===

  @Post('admin/supplements/:productId/nutrition')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Besin bilgisi ekle' })
  addNutrition(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: SupplementIngredientDto,
  ) {
    return this.service.addNutritionFact(productId, dto);
  }

  @Put('admin/supplement-nutrition/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Besin bilgisi güncelle' })
  updateNutrition(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<SupplementIngredientDto>,
  ) {
    return this.service.updateNutritionFact(id, dto);
  }

  @Delete('admin/supplement-nutrition/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Besin bilgisi sil' })
  removeNutrition(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeNutritionFact(id);
  }
}
