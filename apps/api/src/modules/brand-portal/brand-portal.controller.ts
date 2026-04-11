import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandPortalService } from './brand-portal.service';
import { RegisterBrandDto, LoginBrandDto, CreateQuestionDto, AnswerQuestionDto, UpdateProductInfoDto } from './dto';
import { BrandAuthGuard } from './guards/brand-auth.guard';
import { BrandPlanGuard, RequirePlan } from './guards/brand-plan.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@ApiTags('Brand Portal')
@Controller('brand-portal')
export class BrandPortalController {
  constructor(private readonly service: BrandPortalService) {}

  // ─── AUTH ──────────────────────────────────────────────────

  @Post('auth/register')
  @ApiOperation({ summary: 'Marka hesabı oluştur' })
  async register(@Body() dto: RegisterBrandDto) {
    return this.service.register(dto);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Marka girişi' })
  async login(@Body() dto: LoginBrandDto) {
    return this.service.login(dto);
  }

  // ─── DASHBOARD ─────────────────────────────────────────────

  @Get('dashboard')
  @UseGuards(BrandAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marka dashboard özeti' })
  async getDashboard(@CurrentUser() user: any) {
    return this.service.getDashboard(user.account_id, user.brand_id);
  }

  // ─── PRODUCTS ──────────────────────────────────────────────

  @Get('products')
  @UseGuards(BrandAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Markanın ürünlerini listele' })
  async getProducts(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getBrandProducts(user.brand_id, page || 1, limit || 20);
  }

  @Patch('products/:productId')
  @UseGuards(BrandAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün bilgisi güncelleme isteği (audit trail)' })
  async updateProduct(
    @CurrentUser() user: any,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductInfoDto,
  ) {
    return this.service.updateProductInfo(user.account_id, user.brand_id, productId, dto);
  }

  // ─── Q&A — PUBLIC ─────────────────────────────────────────

  @Post('questions')
  @ApiOperation({ summary: 'Markaya soru sor (public)' })
  async createQuestion(@Body() dto: CreateQuestionDto) {
    return this.service.createQuestion(dto);
  }

  @Get('questions/public/:brandId')
  @ApiOperation({ summary: 'Markanın public sorularını getir' })
  async getPublicQuestions(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('product_id') productId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getPublicQuestions(brandId, productId, page || 1, limit || 10);
  }

  // ─── Q&A — BRAND ──────────────────────────────────────────

  @Get('questions')
  @UseGuards(BrandAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marka paneli — soruları listele' })
  async getBrandQuestions(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getBrandQuestions(user.brand_id, status, page || 1, limit || 20);
  }

  @Patch('questions/:questionId/answer')
  @UseGuards(BrandAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soruyu yanıtla' })
  async answerQuestion(
    @CurrentUser() user: any,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: AnswerQuestionDto,
  ) {
    return this.service.answerQuestion(user.account_id, user.brand_id, questionId, dto);
  }

  // ─── CERTIFICATES ─────────────────────────────────────────

  @Get('certificates')
  @UseGuards(BrandAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marka sertifikalarını listele' })
  async getCertificates(@CurrentUser() user: any) {
    return this.service.getBrandCertificates(user.brand_id);
  }

  // ─── TRANSPARENCY ─────────────────────────────────────────

  @Get('transparency')
  @UseGuards(BrandAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Şeffaflık skoru' })
  async getTransparency(@CurrentUser() user: any) {
    return this.service.calculateTransparencyScore(user.brand_id);
  }

  @Get('transparency/:brandId')
  @ApiOperation({ summary: 'Markaya ait public şeffaflık skoru' })
  async getPublicTransparency(@Param('brandId', ParseIntPipe) brandId: number) {
    return this.service.calculateTransparencyScore(brandId);
  }

  // ─── ANALYTICS (Professional+) ────────────────────────────

  @Get('analytics')
  @UseGuards(BrandAuthGuard, BrandPlanGuard)
  @RequirePlan('professional', 'enterprise')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marka analitikleri (Pro+)' })
  async getAnalytics(@CurrentUser() user: any) {
    // Analytics will be expanded in FAZ 22.10
    return {
      brand_id: user.brand_id,
      plan: user.plan,
      message: 'Analitik modülü aktif',
    };
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────

  @Get('admin/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin — bekleyen marka başvuruları' })
  async getPendingApplications() {
    return this.service.getPendingApplications();
  }

  @Patch('admin/verify/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin — marka doğrula' })
  async verifyBrand(
    @CurrentUser() user: any,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body('method') method: string,
  ) {
    return this.service.verifyBrand(accountId, user.admin_user_id, method || 'manual');
  }

  @Patch('admin/reject/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin — marka reddet' })
  async rejectBrand(
    @CurrentUser() user: any,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.service.rejectBrand(accountId, user.admin_user_id);
  }

  @Get('admin/edits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin — bekleyen ürün düzenlemeleri' })
  async getPendingEdits(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getPendingEdits(page || 1, limit || 20);
  }

  @Patch('admin/edits/:editId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin — düzenleme onayla/reddet' })
  async reviewEdit(
    @CurrentUser() user: any,
    @Param('editId', ParseIntPipe) editId: number,
    @Body('approved') approved: boolean,
  ) {
    return this.service.reviewEdit(editId, user.admin_user_id, approved);
  }
}
