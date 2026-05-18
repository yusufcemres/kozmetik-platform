import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * UserAwareThrottlerGuard — global throttle key'i kullanıcıya göre ayır.
 *
 * Default ThrottlerGuard sadece IP'ye göre track eder: aynı IP arkasındaki
 * yüzlerce kullanıcı (kurumsal NAT, public WiFi) tek havuza düşer ve
 * premium kullanıcılar anonim trafikten etkilenir.
 *
 * Bu guard:
 *  - req.user.user_id varsa (AppJwtGuard / PassportJwt sonrası) → `user:{id}` key
 *  - admin_user_id varsa (admin JWT) → `admin:{id}` key
 *  - Hiçbiri yoksa → fallback IP
 *
 * Premium tier kullanıcı için ileri sürüm: plan_code'a göre farklı limit
 * (örn. 49_monthly → 30/min, free → 10/min) eklenecek.
 *
 * 2026-05-19 — Faz 1 RELEASE_NOTES Bilinen Kısıt #4 düzeltmesi.
 */
@Injectable()
export class UserAwareThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req?.user as { user_id?: number; admin_user_id?: number; sub?: number } | undefined;
    if (user?.user_id) return `user:${user.user_id}`;
    if (user?.admin_user_id) return `admin:${user.admin_user_id}`;
    if (user?.sub) return `admin:${user.sub}`;
    // Fallback: IP (X-Forwarded-For first, sonra socket.remoteAddress)
    const xff = req.headers?.['x-forwarded-for'];
    const ip = typeof xff === 'string' ? xff.split(',')[0].trim() : req.ip || req.socket?.remoteAddress || 'unknown';
    return `ip:${ip}`;
  }
}
