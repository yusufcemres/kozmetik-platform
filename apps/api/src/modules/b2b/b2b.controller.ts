import {
  Controller, Get, Post, Delete, Body, Param, ParseIntPipe,
  UseGuards, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { B2bService } from './b2b.service';

@ApiTags('B2B API Management')
@Controller('admin/b2b')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@ApiBearerAuth()
export class B2bController {
  constructor(private readonly service: B2bService) {}

  // ─── API Keys ───

  @Post('api-keys')
  @ApiOperation({ summary: 'Yeni API key oluştur' })
  createApiKey(@Body() body: {
    company_name: string;
    contact_email: string;
    allowed_endpoints?: string[];
    rate_limit_per_hour?: number;
    rate_limit_per_day?: number;
    expires_at?: string;
  }) {
    return this.service.createApiKey({
      ...body,
      expires_at: body.expires_at ? new Date(body.expires_at) : undefined,
    });
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'Tüm API key\'leri listele' })
  listApiKeys() {
    return this.service.listApiKeys();
  }

  @Get('api-keys/:id/stats')
  @ApiOperation({ summary: 'API key kullanım istatistikleri' })
  getApiKeyStats(@Param('id', ParseIntPipe) id: number) {
    return this.service.getApiKeyStats(id);
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'API key iptal et' })
  revokeApiKey(@Param('id', ParseIntPipe) id: number) {
    return this.service.revokeApiKey(id);
  }

  // ─── Webhooks ───

  @Post('api-keys/:id/webhooks')
  @ApiOperation({ summary: 'Webhook oluştur' })
  createWebhook(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { url: string; events: string[] },
  ) {
    return this.service.createWebhook(id, body);
  }

  @Get('api-keys/:id/webhooks')
  @ApiOperation({ summary: 'API key\'e ait webhook\'ları listele' })
  listWebhooks(@Param('id', ParseIntPipe) id: number) {
    return this.service.listWebhooks(id);
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Webhook sil' })
  deleteWebhook(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteWebhook(id);
  }

  // ─── Metrics ───

  @Get('metrics')
  @ApiOperation({ summary: 'B2B metrikleri' })
  getMetrics() {
    return this.service.getB2bMetrics();
  }
}
