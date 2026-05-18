import { BadRequestException, Body, Controller, Get, Headers, Ip, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import type { PaymentPlanCode } from '@database/entities';

/**
 * PayTR + Premium endpoint'leri (Faz 3 başlangıcı).
 */
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  /**
   * Frontend POST → backend PayTR iframe token + merchant_oid döner.
   * Frontend bunu iframe URL'sine koyar.
   */
  @Post('checkout')
  @UseGuards(AppJwtGuard)
  @Throttle({ public: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'PayTR iframe token üret (Premium plan satın al)' })
  async checkout(
    @Req() req: any,
    @Body() body: { plan_code?: PaymentPlanCode },
    @Ip() ip: string,
    @Headers('user-agent') ua?: string,
  ) {
    const validPlans: PaymentPlanCode[] = ['29_one_time', '49_monthly', '490_yearly'];
    if (!body?.plan_code || !validPlans.includes(body.plan_code)) {
      throw new BadRequestException(`plan_code zorunlu, geçerli: ${validPlans.join(', ')}`);
    }
    return this.service.createCheckout({
      user_id: req.user.user_id,
      email: req.user.email,
      plan_code: body.plan_code,
      ip,
      user_agent: ua,
    });
  }

  /**
   * PayTR IPN callback — public endpoint, hash ile doğrulanır.
   * Throttle yok (PayTR retry yapabilir; rate-limit IPN drop'una sebep olur).
   */
  @Post('ipn')
  @ApiOperation({ summary: 'PayTR IPN webhook — ödeme sonucu callback' })
  async ipn(@Body() body: Record<string, string>) {
    await this.service.handleIpn(body);
    // PayTR plain "OK" bekler — Nest default JSON yerine raw string için interceptor
    // basit çözüm: { ok: true } JSON. PayTR çoğu durumda HTTP 200 + body'yi parse etmiyor,
    // ama spesifikasyonda "OK" string isteniyor — bu noktada @Header + response.send düşünülebilir.
    return 'OK';
  }

  /**
   * Kullanıcının premium durumu — frontend'de "Premium aktif" rozeti için.
   */
  @Get('me/status')
  @UseGuards(AppJwtGuard)
  @ApiOperation({ summary: 'Kullanıcının Premium durumu' })
  async myStatus(@Req() req: any) {
    return this.service.getPremiumStatus(req.user.user_id);
  }

  /**
   * Kullanıcının ödeme geçmişi — Premium dashboard sayfası için.
   */
  @Get('me/history')
  @UseGuards(AppJwtGuard)
  @Throttle({ public: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Kullanıcının ödeme geçmişi' })
  async myHistory(@Req() req: any) {
    return this.service.getMyPayments(req.user.user_id);
  }

  /**
   * Auto-renew opt-in toggle (Migration 035, 2026-05-19).
   * Açıksa premium_until yaklaşırken "tek-tıkla yenile" maili gelir
   * (linki /odeme?plan=last_plan_code). Tam auto-charge PayTR Subscription
   * onayında aktive edilecek.
   */
  @Post('me/auto-renew')
  @UseGuards(AppJwtGuard)
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Auto-renew tercihini aç/kapat' })
  async setAutoRenew(
    @Req() req: any,
    @Body() body: { enabled?: boolean },
  ) {
    if (typeof body?.enabled !== 'boolean') {
      throw new BadRequestException('enabled (boolean) zorunlu');
    }
    return this.service.setAutoRenew(req.user.user_id, body.enabled);
  }

  // ── ADMIN ──────────────────────────────────────────────────────────────

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: tüm ödemeler (filtreli, paginate)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'success', 'failed', 'refunded'] })
  @ApiQuery({ name: 'plan_code', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async adminList(
    @Query('status') status?: string,
    @Query('plan_code') plan_code?: string,
    @Query('email') email?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.adminGetPayments({
      status: status || undefined,
      plan_code: plan_code || undefined,
      email: email || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('admin/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: ödeme özet metrik' })
  async adminSummary() {
    return this.service.adminSummary();
  }

  @Post('admin/:paymentId/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: manuel iade (status=refunded + premium revoke)' })
  async adminRefund(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    return this.service.adminRefund(paymentId, req.user?.admin_user_id ?? 0, body?.reason ?? 'manuel iade');
  }

  @Post('admin/users/:userId/grant-premium')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: kullanıcıya manuel premium gün ekle' })
  async adminGrantPremium(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { days?: number; reason?: string },
    @Req() req: any,
  ) {
    if (!body?.days) throw new BadRequestException('days zorunlu');
    return this.service.adminGrantPremium(userId, body.days, req.user?.admin_user_id ?? 0, body?.reason ?? 'manuel grant');
  }
}
