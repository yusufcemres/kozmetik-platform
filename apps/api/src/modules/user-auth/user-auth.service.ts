import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { AppUser, MagicLinkToken } from '@database/entities';

const TOKEN_TTL_MINUTES = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 per minute per email

@Injectable()
export class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);
  private readonly recentRequests = new Map<string, number>();

  constructor(
    @InjectRepository(AppUser) private readonly users: Repository<AppUser>,
    @InjectRepository(MagicLinkToken) private readonly tokens: Repository<MagicLinkToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async requestMagicLink(rawEmail: string, ip?: string): Promise<{ sent: boolean; devToken?: string }> {
    const email = this.normalizeEmail(rawEmail);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Geçersiz e-posta adresi');
    }

    const last = this.recentRequests.get(email);
    if (last && Date.now() - last < RATE_LIMIT_WINDOW_MS) {
      throw new BadRequestException('Çok hızlı istek. Lütfen 1 dakika bekleyin.');
    }
    this.recentRequests.set(email, Date.now());

    // Clean expired tokens opportunistically
    await this.tokens.delete({ expires_at: LessThan(new Date()) });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expires = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await this.tokens.save(this.tokens.create({
      token_hash: tokenHash,
      email,
      expires_at: expires,
      ip: ip ?? null,
    }));

    const webUrl = this.config.get<string>('WEB_URL', 'http://localhost:3000');
    const link = `${webUrl}/giris/dogrula?token=${rawToken}`;

    const resendKey = this.config.get<string>('RESEND_API_KEY');
    if (resendKey) {
      await this.sendViaResend(email, link, resendKey);
    } else {
      this.logger.warn(`[MAGIC LINK DEV MODE] ${email} → ${link}`);
    }

    // Dev convenience: return token when not in production
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    return { sent: true, devToken: isProd ? undefined : rawToken };
  }

  private async sendViaResend(email: string, link: string, apiKey: string): Promise<void> {
    try {
      const from = this.config.get<string>('MAIL_FROM', 'REVELA <no-reply@revela.com.tr>');
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: 'REVELA giriş bağlantın',
          html: `
            <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
              <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.02em;margin:0 0 8px">REVELA</h1>
              <p style="color:#6b6b6b;font-size:14px;margin:0 0 24px">Kozmetik · Takviye · Bakım Analizi</p>
              <h2 style="font-size:18px;margin:0 0 12px">Giriş bağlantın hazır</h2>
              <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 20px">
                Aşağıdaki butona tıklayarak REVELA hesabına giriş yapabilirsin. Bağlantı <strong>20 dakika</strong> geçerli.
              </p>
              <a href="${link}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">Giriş Yap</a>
              <p style="font-size:12px;color:#9a9a9a;margin:32px 0 0">Bu e-postayı sen istemediysen yok sayabilirsin.</p>
            </div>
          `,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Resend error: ${res.status} ${text}`);
      }
    } catch (err: any) {
      this.logger.error(`Resend send failed: ${err.message}`);
    }
  }

  async verifyMagicLink(rawToken: string): Promise<{ token: string; user: { user_id: number; email: string; display_name: string | null } }> {
    if (!rawToken || rawToken.length < 16) {
      throw new UnauthorizedException('Geçersiz bağlantı');
    }
    const tokenHash = this.hashToken(rawToken);
    const record = await this.tokens.findOne({ where: { token_hash: tokenHash } });
    if (!record) {
      throw new UnauthorizedException('Bağlantı bulunamadı veya kullanılmış');
    }
    if (record.used_at) {
      throw new UnauthorizedException('Bu bağlantı daha önce kullanılmış');
    }
    if (record.expires_at.getTime() < Date.now()) {
      throw new UnauthorizedException('Bağlantının süresi dolmuş');
    }

    record.used_at = new Date();
    await this.tokens.save(record);

    let user = await this.users.findOne({ where: { email: record.email } });
    if (!user) {
      user = await this.users.save(this.users.create({ email: record.email, is_active: true }));
    }
    user.last_login_at = new Date();
    await this.users.save(user);

    const jwtToken = await this.jwt.signAsync(
      { sub: user.user_id, email: user.email, kind: 'app' },
      { expiresIn: '30d' },
    );

    return {
      token: jwtToken,
      user: { user_id: user.user_id, email: user.email, display_name: user.display_name },
    };
  }

  async getUserById(userId: number): Promise<AppUser | null> {
    return this.users.findOne({ where: { user_id: userId, is_active: true } });
  }
}
