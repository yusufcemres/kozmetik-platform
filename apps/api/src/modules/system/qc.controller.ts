import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QcService } from './qc.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Quality Control')
@Controller('admin/qc')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'reviewer')
@ApiBearerAuth()
export class QcController {
  constructor(private readonly qcService: QcService) {}

  @Get('report')
  @ApiOperation({ summary: 'Tam QC raporu — tüm kontroller' })
  async getFullReport() {
    return this.qcService.runFullReport();
  }

  @Get('report/csv')
  @ApiOperation({ summary: 'QC raporu CSV formatında' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=qc-report.csv')
  async getReportCsv() {
    const report = await this.qcService.runFullReport();
    return this.qcService.generateCsv(report);
  }

  @Get('products/without-ingredients')
  @ApiOperation({ summary: 'INCI analizi yapılmamış ürünler' })
  async productsWithoutIngredients() {
    return this.qcService.checkProductsWithoutIngredients();
  }

  @Get('products/without-scores')
  @ApiOperation({ summary: 'Need skoru hesaplanmamış ürünler' })
  async productsWithoutScores() {
    return this.qcService.checkProductsWithoutScores();
  }

  @Get('products/without-affiliate-links')
  @ApiOperation({ summary: 'Affiliate linki olmayan yayınlanmış ürünler' })
  async productsWithoutAffiliateLinks() {
    return this.qcService.checkProductsWithoutAffiliateLinks();
  }

  @Get('products/without-images')
  @ApiOperation({ summary: 'Görseli olmayan ürünler' })
  async productsWithoutImages() {
    return this.qcService.checkProductsWithoutImages();
  }

  @Get('products/draft')
  @ApiOperation({ summary: 'Draft durumundaki ürünler' })
  async draftProducts() {
    return this.qcService.checkDraftProducts();
  }

  @Get('ingredients/without-evidence')
  @ApiOperation({ summary: 'Kanıt bağlantısı olmayan ingredient\'lar' })
  async ingredientsWithoutEvidence() {
    return this.qcService.checkIngredientsWithoutEvidence();
  }

  @Get('ingredients/without-mappings')
  @ApiOperation({ summary: 'İhtiyaç eşleşmesi olmayan ingredient\'lar' })
  async ingredientsWithoutMappings() {
    return this.qcService.checkIngredientsWithoutMappings();
  }

  @Get('ingredients/duplicates')
  @ApiOperation({ summary: 'Duplicate INCI isimleri' })
  async duplicateIngredients() {
    return this.qcService.checkDuplicateIngredientNames();
  }

  @Get('variants/orphaned')
  @ApiOperation({ summary: 'Ürünsüz variant kayıtları' })
  async orphanedVariants() {
    return this.qcService.checkOrphanedVariants();
  }

  @Get('categories/empty')
  @ApiOperation({ summary: 'Boş kategoriler' })
  async emptyCategories() {
    return this.qcService.checkEmptyCategories();
  }

  @Get('brands/unused')
  @ApiOperation({ summary: 'Ürünsüz markalar' })
  async unusedBrands() {
    return this.qcService.checkUnusedBrands();
  }

  @Get('needs/without-mappings')
  @ApiOperation({ summary: 'Eşleşmesi olmayan ihtiyaçlar' })
  async needsWithoutMappings() {
    return this.qcService.checkNeedsWithoutMappings();
  }
}
