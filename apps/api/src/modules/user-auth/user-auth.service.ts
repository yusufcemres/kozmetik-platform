import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import {
  AppUser,
  MagicLinkToken,
  UserFavorite,
  ScanHistory,
  PushSubscription,
  UserAction,
  UserActionType,
} from '@database/entities';

// Audit hardening 2026-05-15: token TTL 20→10 dk, IP rate 5→2/min
// SHA256 hash + 32 byte random = 256-bit entropy. 2 deneme/dk × 10 dk = 20 brute force penceresi (yeterli).
const TOKEN_TTL_MINUTES = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 per minute per email
const IP_RATE_LIMIT_MAX = 2; // 2 requests per minute per IP
const IP_RATE_LIMIT_WINDOW_MS = 60 * 1000;

@Injectable()
export class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);
  private readonly recentRequests = new Map<string, number>();
  private readonly ipRequests = new Map<string, number[]>();

  constructor(
    @InjectRepository(AppUser) private readonly users: Repository<AppUser>,
    @InjectRepository(MagicLinkToken) private readonly tokens: Repository<MagicLinkToken>,
    @InjectRepository(UserFavorite) private readonly favorites: Repository<UserFavorite>,
    @InjectRepository(ScanHistory) private readonly scanHistory: Repository<ScanHistory>,
    @InjectRepository(PushSubscription) private readonly pushSubs: Repository<PushSubscription>,
    @InjectRepository(UserAction) private readonly userActions: Repository<UserAction>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * KVKK + denetim audit log — Madde 8 (2026-05-15) ile eklendi.
   * Tüm log yazımları best-effort: hata olursa silent (login/silme akışı kesilmesin).
   */
  private async audit(
    action_type: UserActionType,
    params: { user_id?: number | null; email?: string; ip?: string; user_agent?: string; details?: Record<string, unknown> } = {},
  ): Promise<void> {
    try {
      const email_hash = params.email
        ? createHash('sha256').update(this.normalizeEmail(params.email)).digest('hex')
        : null;
      await this.userActions.save(
        this.userActions.create({
          user_id: params.user_id ?? null,
          action_type,
          email_hash,
          ip: params.ip ?? null,
          user_agent: params.user_agent ? params.user_agent.slice(0, 255) : null,
          details: params.details ?? null,
        }),
      );
    } catch (err: any) {
      this.logger.warn(`audit log failed: ${err.message}`);
    }
  }

  private checkIpRateLimit(ip: string | undefined, email?: string): void {
    if (!ip) return;
    const now = Date.now();
    const windowStart = now - IP_RATE_LIMIT_WINDOW_MS;
    const recent = (this.ipRequests.get(ip) || []).filter((t) => t > windowStart);
    if (recent.length >= IP_RATE_LIMIT_MAX) {
      // Audit log (best-effort, fire-and-forget)
      void this.audit('LOGIN_RATE_LIMITED', { ip, email, details: { recent_count: recent.length } });
      throw new BadRequestException('Çok fazla istek. Lütfen biraz bekleyin.');
    }
    recent.push(now);
    this.ipRequests.set(ip, recent);
  }

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

    this.checkIpRateLimit(ip, email);

    const last = this.recentRequests.get(email);
    if (last && Date.now() - last < RATE_LIMIT_WINDOW_MS) {
      void this.audit('LOGIN_RATE_LIMITED', { ip, email, details: { source: 'email_throttle' } });
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

    // Audit log: anonim, user_id yok (token doğrulanana kadar bilinmez)
    void this.audit('LOGIN_REQUEST', { email, ip });

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

  async verifyMagicLink(rawToken: string, ip?: string): Promise<{ token: string; user: { user_id: number; email: string; display_name: string | null } }> {
    if (!rawToken || rawToken.length < 16) {
      void this.audit('LOGIN_FAILED', { ip, details: { reason: 'invalid_token_format' } });
      throw new UnauthorizedException('Geçersiz bağlantı');
    }
    const tokenHash = this.hashToken(rawToken);
    const record = await this.tokens.findOne({ where: { token_hash: tokenHash } });
    if (!record) {
      void this.audit('LOGIN_FAILED', { ip, details: { reason: 'token_not_found' } });
      throw new UnauthorizedException('Bağlantı bulunamadı veya kullanılmış');
    }
    if (record.used_at) {
      void this.audit('LOGIN_FAILED', { ip, email: record.email, details: { reason: 'token_already_used' } });
      throw new UnauthorizedException('Bu bağlantı daha önce kullanılmış');
    }
    if (record.expires_at.getTime() < Date.now()) {
      void this.audit('LOGIN_FAILED', { ip, email: record.email, details: { reason: 'token_expired' } });
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

    void this.audit('LOGIN_SUCCESS', { user_id: user.user_id, email: user.email, ip });

    return {
      token: jwtToken,
      user: { user_id: user.user_id, email: user.email, display_name: user.display_name },
    };
  }

  async getUserById(userId: number): Promise<AppUser | null> {
    return this.users.findOne({ where: { user_id: userId, is_active: true } });
  }

  /**
   * Kullanıcının tarama geçmişi — product JOIN ile ürün bilgisi dahil.
   * Tek kart bir ürün gösterirse listede son tarama gözükür.
   */
  async getScanHistory(userId: number, limit = 50): Promise<Array<{
    history_id: number;
    method: string;
    confidence: number | null;
    raw_barcode: string | null;
    raw_query: string | null;
    created_at: Date;
    product: {
      product_id: number;
      product_name: string;
      product_slug: string;
      brand_name: string | null;
      image_url: string | null;
      top_need_name: string | null;
    } | null;
  }>> {
    const rows = await this.scanHistory.manager.query(
      `SELECT
        sh.history_id, sh.method, sh.confidence, sh.raw_barcode, sh.raw_query, sh.created_at,
        p.product_id, p.product_name, p.product_slug, p.top_need_name,
        b.brand_name,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.sort_order ASC LIMIT 1) AS image_url
      FROM scan_history sh
      LEFT JOIN products p ON p.product_id = sh.product_id
      LEFT JOIN brands b ON b.brand_id = p.brand_id
      WHERE sh.user_id = $1
      ORDER BY sh.created_at DESC
      LIMIT $2`,
      [userId, limit],
    );
    return rows.map((r: any) => ({
      history_id: r.history_id,
      method: r.method,
      confidence: r.confidence != null ? Number(r.confidence) : null,
      raw_barcode: r.raw_barcode,
      raw_query: r.raw_query,
      created_at: r.created_at,
      product: r.product_id ? {
        product_id: r.product_id,
        product_name: r.product_name,
        product_slug: r.product_slug,
        brand_name: r.brand_name,
        image_url: r.image_url,
        top_need_name: r.top_need_name,
      } : null,
    }));
  }

  /** Kullanıcının tarama özeti — toplam, bu ay, eşsiz ürün, eşsiz marka, Pionér count */
  async getScanStats(userId: number): Promise<{
    total: number;
    this_month: number;
    unique_products: number;
    unique_brands: number;
    pionér_count: number;
  }> {
    const rows = await this.scanHistory.manager.query(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE sh.created_at > date_trunc('month', NOW()))::int AS this_month,
        COUNT(DISTINCT sh.product_id) FILTER (WHERE sh.product_id IS NOT NULL)::int AS unique_products,
        COUNT(DISTINCT p.brand_id) FILTER (WHERE p.brand_id IS NOT NULL)::int AS unique_brands,
        COUNT(*) FILTER (WHERE sh.method IN ('vision','vision_fuzzy') AND sh.product_id IS NULL)::int AS pionér_count
       FROM scan_history sh
       LEFT JOIN products p ON p.product_id = sh.product_id
       WHERE sh.user_id = $1`,
      [userId],
    );
    return rows[0] || { total: 0, this_month: 0, unique_products: 0, unique_brands: 0, pionér_count: 0 };
  }

  /** Tek scan geçmişini sil (kullanıcı kendi taramasını gizlemek isterse) */
  async deleteScan(userId: number, historyId: number): Promise<{ deleted: boolean }> {
    const r = await this.scanHistory.delete({ user_id: userId, history_id: historyId });
    return { deleted: (r.affected ?? 0) > 0 };
  }

  async exportUserData(userId: number, ip?: string): Promise<Record<string, unknown>> {
    const user = await this.users.findOne({ where: { user_id: userId } });
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı');

    const [favorites, scans, pushes] = await Promise.all([
      this.favorites.find({ where: { user_id: userId } }),
      this.scanHistory.find({ where: { user_id: userId } }),
      this.pushSubs.find({ where: { user_id: userId } }),
    ]);

    void this.audit('DATA_EXPORT', {
      user_id: userId,
      email: user.email,
      ip,
      details: { favorites: favorites.length, scans: scans.length, pushes: pushes.length },
    });

    return {
      exported_at: new Date().toISOString(),
      user: {
        user_id: user.user_id,
        email: user.email,
        display_name: user.display_name,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
      },
      favorites: favorites.map((f) => ({
        product_id: f.product_id,
        created_at: f.created_at,
      })),
      scan_history: scans,
      push_subscriptions: pushes.map((p) => ({
        endpoint: p.endpoint,
        user_agent: p.user_agent,
        is_active: p.is_active,
        created_at: p.created_at,
      })),
    };
  }

  async deleteAccount(userId: number, ip?: string): Promise<{ deleted: boolean }> {
    const user = await this.users.findOne({ where: { user_id: userId } });
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı');

    // Audit log ÖNCE — user_id silindikten sonra FK SET NULL devreye girer,
    // ama bu kayıtta cascade öncesi bilgi saklanır (KVKK Madde 7 kanıtı).
    await this.audit('ACCOUNT_DELETE', {
      user_id: userId,
      email: user.email,
      ip,
      details: { display_name: user.display_name, deleted_at: new Date().toISOString() },
    });

    // Cascade delete user-owned records. ScanHistory uses user_id FK (nullable); null out or delete.
    await this.favorites.delete({ user_id: userId });
    await this.scanHistory.delete({ user_id: userId });
    await this.pushSubs.delete({ user_id: userId });
    await this.tokens.delete({ email: user.email });
    await this.users.delete({ user_id: userId });

    return { deleted: true };
  }
}
