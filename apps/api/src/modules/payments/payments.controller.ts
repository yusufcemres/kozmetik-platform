import { BadRequestException, Body, Controller, Get, Headers, Ip, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';
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
}
