import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUser } from '@database/entities';

/**
 * @RequirePremium() — endpoint'i premium kullanıcılara kilitler (Faz 3, 2026-05-17).
 *
 * Kullanım:
 *   @UseGuards(AppJwtGuard, PremiumGuard)
 *   @RequirePremium()
 *   @Get('me/ai-coach-history')
 *   async coachHistory(@Req() req) { ... }
 *
 * AppJwtGuard'dan SONRA gelmeli — JWT yoksa zaten 401 atar.
 * Premium yoksa 402 Payment Required (RFC 7231) yerine 403 Forbidden döner
 * (Nest standardı). Body'de upgrade_url + plan_codes bilgisi.
 */
export const REQUIRE_PREMIUM_KEY = 'requirePremium';
export const RequirePremium = () => SetMetadata(REQUIRE_PREMIUM_KEY, true);

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(AppUser) private readonly users: Repository<AppUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<boolean>(REQUIRE_PREMIUM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const req = context.switchToHttp().getRequest();
    const userId = req?.user?.user_id;
    if (!userId) {
      throw new ForbiddenException({
        code: 'PREMIUM_REQUIRED_NO_AUTH',
        message: 'Premium endpoint için giriş yap',
      });
    }
    const user = await this.users.findOne({ where: { user_id: userId } });
    const now = Date.now();
    const active = !!(user && user.premium_until && user.premium_until.getTime() > now);
    if (!active) {
      throw new ForbiddenException({
        code: 'PREMIUM_REQUIRED',
        message: 'Bu özellik Premium üyelik gerektiriyor (49 TL/ay veya 490 TL/yıl)',
        upgrade_url: '/odeme',
        plan_codes: ['29_one_time', '49_monthly', '490_yearly'],
      });
    }
    return true;
  }
}
