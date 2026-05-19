import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac, randomBytes } from 'crypto';
import { AppUser, Payment, PaymentPlanCode } from '@database/entities';
import { MailService } from '@common/mail/mail.service';

/**
 * PayTR Subscription + Linkle Ödeme entegrasyonu (Faz 3 başlangıcı, 2026-05-17).
 *
 * Akış:
 *  1. Frontend POST /payments/checkout (auth) → user_id + plan_code
 *  2. Bu service merchant_oid üretir, PayTR API'den iframe token alır
 *  3. payments tablosuna status=pending kayıt yazar
 *  4. Frontend iframe yükler, kullanıcı ödemeyi yapar
 *  5. PayTR backend'imize IPN callback atar → /payments/ipn endpoint
 *  6. handleIpn() hash doğrular → status='success' + AppUser.premium_until güncellenir
 *
 * PayTR merchant onayı evrak süreci — bu service ENV vars set edilince çalışır.
 * Vars yoksa checkout 503 döner (graceful degradation, deploy crash etmez).
 *
 * Env vars (Render set):
 *   PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT
 *   PAYTR_TEST_MODE=1 (geliştirme) / 0 (canlı)
 */

const PLAN_PRICING: Record<PaymentPlanCode, { amount_kurus: number; duration_days: number | 'lifetime' }> = {
  '29_one_time': { amount_kurus: 2900, duration_days: 'lifetime' }, // karşılaştırma feature lifetime
  '49_monthly':  { amount_kurus: 4900, duration_days: 30 },         // Premium aylık
  '490_yearly':  { amount_kurus: 49000, duration_days: 365 },        // Premium yıllık
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token';
  private readonly PAYTR_TIMEOUT_MS = 10_000;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(AppUser) private readonly users: Repository<AppUser>,
    private readonly mail: MailService,
  ) {}

  /**
   * Checkout — PayTR iframe token üretir + payments tablosuna pending kayıt yazar.
   * Frontend dönen iframe_token'ı PayTR iframe URL'sine koyar.
   */
  async createCheckout(params: {
    user_id: number;
    email: string;
    plan_code: PaymentPlanCode;
    ip: string;
    user_agent?: string;
  }): Promise<{ iframe_token: string; merchant_oid: string }> {
    const pricing = PLAN_PRICING[params.plan_code];
    if (!pricing) {
      throw new BadRequestException('Geçersiz plan kodu');
    }

    const merchantId = this.config.get<string>('PAYTR_MERCHANT_ID');
    const merchantKey = this.config.get<string>('PAYTR_MERCHANT_KEY');
    const merchantSalt = this.config.get<string>('PAYTR_MERCHANT_SALT');
    const testMode = this.config.get<string>('PAYTR_TEST_MODE', '1');

    if (!merchantId || !merchantKey || !merchantSalt) {
      this.logger.warn('PayTR env vars eksik — checkout 503');
      throw new ServiceUnavailableException(
        'Ödeme servisi henüz yapılandırılmadı. Birkaç gün içinde aktif olacak.',
      );
    }

    // merchant_oid: alfanümerik max 64 karakter, unique. user_id + timestamp + random.
    const merchant_oid = `R${params.user_id}T${Date.now()}${randomBytes(8).toString('hex')}`.slice(0, 64);
    const siteUrl = this.config.get<string>('SITE_URL', 'https://kozmetik-platform.vercel.app').replace(/\/+$/, '');
    const successUrl = `${siteUrl}/odeme/sonuc?oid=${merchant_oid}&status=success`;
    const failUrl = `${siteUrl}/odeme/sonuc?oid=${merchant_oid}&status=failed`;

    const user_basket = Buffer.from(
      JSON.stringify([[`REVELA ${params.plan_code}`, (pricing.amount_kurus / 100).toFixed(2), 1]]),
    ).toString('base64');

    // PayTR hash: SHA256(HMAC) over concatenated fields, then base64
    // Order: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt
    const hashStr =
      merchantId +
      params.ip +
      merchant_oid +
      params.email +
      String(pricing.amount_kurus) +
      user_basket +
      '0' + // no_installment
      '0' + // max_installment
      'TL' +
      testMode +
      merchantSalt;
    const paytr_token = createHmac('sha256', merchantKey).update(hashStr).digest('base64');

    const body = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: params.ip,
      merchant_oid,
      email: params.email,
      payment_amount: String(pricing.amount_kurus),
      paytr_token,
      user_basket,
      debug_on: '0',
      no_installment: '0',
      max_installment: '0',
      user_name: `User ${params.user_id}`,
      user_address: 'Türkiye',
      user_phone: '0000000000',
      merchant_ok_url: successUrl,
      merchant_fail_url: failUrl,
      timeout_limit: '30',
      currency: 'TL',
      test_mode: testMode,
    });

    let iframeToken: string;
    try {
      const res = await fetch(this.PAYTR_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(this.PAYTR_TIMEOUT_MS),
      });
      const json = (await res.json()) as { status?: string; token?: string; reason?: string };
      if (json.status !== 'success' || !json.token) {
        this.logger.error(`PayTR token failed: ${json.reason || JSON.stringify(json)}`);
        throw new ServiceUnavailableException(json.reason || 'PayTR token alınamadı');
      }
      iframeToken = json.token;
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`PayTR HTTP failed: ${message}`);
      throw new ServiceUnavailableException('PayTR servisine ulaşılamadı');
    }

    // Pending kayıt
    await this.payments.save(
      this.payments.create({
        user_id: params.user_id,
        merchant_oid,
        plan_code: params.plan_code,
        amount_kurus: pricing.amount_kurus,
        currency: 'TL',
        status: 'pending',
        ip: params.ip,
        user_agent: params.user_agent?.slice(0, 255) ?? null,
      }),
    );

    return { iframe_token: iframeToken, merchant_oid };
  }

  /**
   * IPN callback handler — PayTR ödeme sonucunu buraya POST'lar.
   * Hash doğrulanmalı, idempotent olmalı (aynı IPN 2x gelebilir), DB güncellenir.
   *
   * PayTR IPN beklenen yanıt: "OK" plain text 200. Aksi halde PayTR retry eder.
   */
  async handleIpn(body: Record<string, string>): Promise<{ ok: true }> {
    const merchantKey = this.config.get<string>('PAYTR_MERCHANT_KEY');
    const merchantSalt = this.config.get<string>('PAYTR_MERCHANT_SALT');
    if (!merchantKey || !merchantSalt) {
      this.logger.error('IPN geldi ama PAYTR env yok — DROP');
      // Yine "OK" dön ki PayTR retry etmesin, ama log'da kalıcı kanıt
      return { ok: true };
    }

    const merchant_oid = body['merchant_oid'];
    const status = body['status']; // "success" | "failed"
    const total_amount = body['total_amount'];
    const incomingHash = body['hash'];

    if (!merchant_oid || !status || !total_amount || !incomingHash) {
      this.logger.warn(`IPN missing fields: ${JSON.stringify(body)}`);
      return { ok: true }; // PayTR'a OK dön, retry istemiyoruz
    }

    // Hash: HMAC-SHA256(merchant_oid + merchant_salt + status + total_amount, merchant_key) → base64
    const computedHash = createHmac('sha256', merchantKey)
      .update(merchant_oid + merchantSalt + status + total_amount)
      .digest('base64');

    if (computedHash !== incomingHash) {
      this.logger.error(`IPN hash mismatch: oid=${merchant_oid} expected=${computedHash.slice(0, 10)}… got=${incomingHash.slice(0, 10)}…`);
      return { ok: true }; // Yine OK dön (PayTR retry yapmasın), audit log'da kayıtlı
    }

    // Idempotent: önceden success ise tekrar premium_until'i uzatma
    const existing = await this.payments.findOne({ where: { merchant_oid } });
    if (!existing) {
      this.logger.warn(`IPN merchant_oid not found in DB: ${merchant_oid}`);
      return { ok: true };
    }
    if (existing.status === 'success' && status === 'success') {
      this.logger.log(`IPN duplicate (already success): ${merchant_oid}`);
      return { ok: true };
    }

    // Update payment kaydı
    existing.status = status === 'success' ? 'success' : 'failed';
    existing.ipn_received_at = new Date();
    existing.failure_reason = status !== 'success' ? (body['failed_reason_msg'] || null) : null;
    existing.raw_payload = body;
    await this.payments.save(existing);

    // Success → user premium_until güncellenir
    if (status === 'success' && existing.user_id) {
      const pricing = PLAN_PRICING[existing.plan_code];
      const user = await this.users.findOne({ where: { user_id: existing.user_id } });
      if (user && pricing) {
        const now = new Date();
        const currentExp = user.premium_until && user.premium_until > now ? user.premium_until : now;
        let newExp: Date;
        if (pricing.duration_days === 'lifetime') {
          newExp = new Date('2099-12-31T23:59:59Z');
        } else {
          newExp = new Date(currentExp.getTime() + pricing.duration_days * 24 * 60 * 60 * 1000);
        }
        user.premium_until = newExp;
        // Yeni period başladı → reminder flag'ı sıfırla, yaklaşan bitişte tekrar uyarı
        user.premium_reminder_sent_at = null;
        // Son satın alınan plan kodunu sakla (auto-renew tekrar mail için)
        user.last_plan_code = existing.plan_code;
        await this.users.save(user);
        this.logger.log(`Premium granted: user=${user.user_id} until=${newExp.toISOString()} plan=${existing.plan_code}`);
      }
    }

    return { ok: true };
  }

  /** Kullanıcının aktif Premium durumu — JWT claim'e koymak için */
  async getPremiumStatus(userId: number): Promise<{
    premium: boolean;
    premium_until: string | null;
    auto_renew_enabled: boolean;
    last_plan_code: string | null;
  }> {
    const user = await this.users.findOne({ where: { user_id: userId } });
    if (!user || !user.premium_until) {
      return {
        premium: false,
        premium_until: null,
        auto_renew_enabled: user?.auto_renew_enabled ?? false,
        last_plan_code: user?.last_plan_code ?? null,
      };
    }
    const active = user.premium_until.getTime() > Date.now();
    return {
      premium: active,
      premium_until: user.premium_until.toISOString(),
      auto_renew_enabled: user.auto_renew_enabled,
      last_plan_code: user.last_plan_code,
    };
  }

  /**
   * Kullanıcının ödeme geçmişi — /premium dashboard için.
   * Pending kayıtlar dahil (iptal/iade hatası geriye dönük görülsün).
   */
  async getMyPayments(userId: number, limit = 50): Promise<Array<{
    payment_id: number;
    merchant_oid: string;
    plan_code: PaymentPlanCode;
    amount_kurus: number;
    status: string;
    created_at: string;
    ipn_received_at: string | null;
    failure_reason: string | null;
  }>> {
    const rows = await this.payments.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: Math.min(Math.max(limit, 1), 100),
    });
    return rows.map((r) => ({
      payment_id: Number(r.payment_id),
      merchant_oid: r.merchant_oid,
      plan_code: r.plan_code,
      amount_kurus: r.amount_kurus,
      status: r.status,
      created_at: r.created_at.toISOString(),
      ipn_received_at: r.ipn_received_at?.toISOString() ?? null,
      failure_reason: r.failure_reason,
    }));
  }

  // ── ADMIN AUDIT ─────────────────────────────────────────────────────────

  /**
   * Admin: tüm ödemeler — filtre + paginate.
   * Faz 5 Madde 25b (Admin payment audit panel).
   */
  async adminGetPayments(opts: {
    status?: string;
    plan_code?: string;
    email?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    items: Array<{
      payment_id: number;
      user_id: number;
      email: string | null;
      merchant_oid: string;
      plan_code: PaymentPlanCode;
      amount_kurus: number;
      status: string;
      created_at: string;
      ipn_received_at: string | null;
      failure_reason: string | null;
    }>;
    total: number;
  }> {
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const offset = Math.max(opts.offset ?? 0, 0);

    const qb = this.payments
      .createQueryBuilder('p')
      .leftJoin(AppUser, 'u', 'u.user_id = p.user_id')
      .select([
        'p.payment_id AS payment_id',
        'p.user_id AS user_id',
        'u.email AS email',
        'p.merchant_oid AS merchant_oid',
        'p.plan_code AS plan_code',
        'p.amount_kurus AS amount_kurus',
        'p.status AS status',
        'p.created_at AS created_at',
        'p.ipn_received_at AS ipn_received_at',
        'p.failure_reason AS failure_reason',
      ])
      .orderBy('p.created_at', 'DESC');

    if (opts.status) qb.andWhere('p.status = :status', { status: opts.status });
    if (opts.plan_code) qb.andWhere('p.plan_code = :plan_code', { plan_code: opts.plan_code });
    if (opts.email) qb.andWhere('LOWER(u.email) LIKE :email', { email: `%${opts.email.toLowerCase()}%` });

    const total = await qb.getCount();
    const rows = await qb.limit(limit).offset(offset).getRawMany();

    return {
      items: rows.map((r) => ({
        payment_id: Number(r.payment_id),
        user_id: Number(r.user_id),
        email: r.email ?? null,
        merchant_oid: r.merchant_oid,
        plan_code: r.plan_code,
        amount_kurus: Number(r.amount_kurus),
        status: r.status,
        created_at: new Date(r.created_at).toISOString(),
        ipn_received_at: r.ipn_received_at ? new Date(r.ipn_received_at).toISOString() : null,
        failure_reason: r.failure_reason,
      })),
      total,
    };
  }

  /**
   * Admin: manuel iade — status='refunded' işaretler ve premium_until'ı revoke eder.
   * PayTR'ye gerçek iade isteği gönderilmez (manuel banka iadesi sonrası kayıt güncellemesi).
   */
  async adminRefund(paymentId: number, adminUserId: number, reason: string): Promise<{
    payment_id: number;
    status: string;
    user_premium_until: string | null;
  }> {
    const payment = await this.payments.findOne({ where: { payment_id: String(paymentId) } });
    if (!payment) throw new BadRequestException(`Payment ${paymentId} bulunamadı`);
    if (payment.status === 'refunded') {
      throw new BadRequestException(`Payment ${paymentId} zaten iade edilmiş`);
    }

    payment.status = 'refunded';
    payment.failure_reason = `[REFUND admin=${adminUserId}] ${reason || 'manuel iade'}`;
    await this.payments.save(payment);

    let user: AppUser | null = null;
    if (payment.user_id != null) {
      user = await this.users.findOne({ where: { user_id: payment.user_id } });
      if (user) {
        user.premium_until = null;
        await this.users.save(user);
      }
    }

    this.logger.warn(`Manual refund: payment_id=${paymentId} admin=${adminUserId} user=${payment.user_id}`);

    return {
      payment_id: paymentId,
      status: 'refunded',
      user_premium_until: user?.premium_until?.toString() ?? null,
    };
  }

  /**
   * Admin: manuel premium grant — kullanıcıya premium_until override.
   * Test, kampanya, müşteri hizmetleri kompensasyonu için.
   */
  async adminGrantPremium(userId: number, days: number, adminUserId: number, reason: string): Promise<{
    user_id: number;
    premium_until: string;
  }> {
    if (days < 1 || days > 3650) {
      throw new BadRequestException('days 1-3650 arasında olmalı');
    }
    const user = await this.users.findOne({ where: { user_id: userId } });
    if (!user) throw new BadRequestException(`User ${userId} bulunamadı`);

    const base = user.premium_until && user.premium_until > new Date()
      ? user.premium_until
      : new Date();
    const newUntil = new Date(base.getTime() + days * 86_400_000);
    user.premium_until = newUntil;
    user.premium_reminder_sent_at = null;
    await this.users.save(user);

    this.logger.warn(`Manual premium grant: user=${userId} +${days}d admin=${adminUserId} reason=${reason}`);

    return {
      user_id: userId,
      premium_until: newUntil.toISOString(),
    };
  }

  /**
   * Admin: dashboard özet — toplam gelir, kullanıcı, iade.
   */
  async adminSummary(): Promise<{
    total_revenue_kurus: number;
    total_payments_success: number;
    total_payments_pending: number;
    total_payments_failed: number;
    total_payments_refunded: number;
    total_premium_users: number;
    last_30d_revenue_kurus: number;
  }> {
    const [summary] = await this.payments.manager.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount_kurus ELSE 0 END), 0)::bigint AS total_revenue_kurus,
        COUNT(*) FILTER (WHERE status = 'success')::int AS total_payments_success,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS total_payments_pending,
        COUNT(*) FILTER (WHERE status = 'failed')::int AS total_payments_failed,
        COUNT(*) FILTER (WHERE status = 'refunded')::int AS total_payments_refunded,
        COALESCE(SUM(CASE WHEN status = 'success' AND created_at > NOW() - INTERVAL '30 days' THEN amount_kurus ELSE 0 END), 0)::bigint AS last_30d_revenue_kurus
      FROM payments
    `);
    const [premiumUsers] = await this.users.manager.query(
      `SELECT COUNT(*)::int AS n FROM app_users WHERE premium_until > NOW()`,
    );
    return {
      total_revenue_kurus: Number(summary.total_revenue_kurus),
      total_payments_success: summary.total_payments_success,
      total_payments_pending: summary.total_payments_pending,
      total_payments_failed: summary.total_payments_failed,
      total_payments_refunded: summary.total_payments_refunded,
      total_premium_users: premiumUsers.n,
      last_30d_revenue_kurus: Number(summary.last_30d_revenue_kurus),
    };
  }

  // ── PREMIUM ENDING REMINDER ──────────────────────────────────────────

  /**
   * Premium bitmesine 7 gün veya daha az kalan + henüz uyarılmamış kullanıcılara
   * "Yakında bitiyor" hatırlatma maili gönderir.
   *
   * Cron: daily 09:00 TR (PaymentsCronService).
   * Idempotent: premium_reminder_sent_at güncellenir → 2. mail gönderilmez.
   *
   * Strateji:
   *  - premium_until BETWEEN NOW() AND NOW() + INTERVAL '7 days'
   *  - premium_reminder_sent_at IS NULL OR < premium_until - INTERVAL '7 days'
   *    (yeni period için tekrar uyarı verilebilsin)
   *
   * @returns { sent, failed, skipped } sayıları
   */
  async sendPremiumEndingReminders(): Promise<{ sent: number; failed: number; skipped: number }> {
    const dueUsers = await this.users
      .createQueryBuilder('u')
      .where('u.premium_until IS NOT NULL')
      .andWhere(`u.premium_until BETWEEN NOW() AND NOW() + INTERVAL '7 days'`)
      .andWhere(`(u.premium_reminder_sent_at IS NULL OR u.premium_reminder_sent_at < u.premium_until - INTERVAL '8 days')`)
      .andWhere('u.is_active = true')
      .limit(100)
      .getMany();

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const user of dueUsers) {
      if (!user.email) {
        skipped++;
        continue;
      }
      const daysLeft = Math.max(
        0,
        Math.ceil(((user.premium_until?.getTime() ?? 0) - Date.now()) / 86_400_000),
      );
      const ok = await this.mail.send({
        to: user.email,
        subject: user.auto_renew_enabled
          ? `REVELA Premium ${daysLeft} gün sonra yenilenecek`
          : `REVELA Premium ${daysLeft} gün sonra sona eriyor`,
        html: this.buildReminderHtml(
          user.email,
          daysLeft,
          user.premium_until!,
          user.auto_renew_enabled,
          user.last_plan_code,
        ),
      });
      if (ok) {
        user.premium_reminder_sent_at = new Date();
        await this.users.save(user);
        sent++;
      } else {
        failed++;
      }
    }

    if (sent > 0 || failed > 0) {
      this.logger.log(`Premium reminder run: sent=${sent} failed=${failed} skipped=${skipped}`);
    }
    return { sent, failed, skipped };
  }

  private buildReminderHtml(
    email: string,
    daysLeft: number,
    premiumUntil: Date,
    autoRenew: boolean,
    lastPlanCode: string | null,
  ): string {
    const trDate = premiumUntil.toLocaleString('tr-TR', { dateStyle: 'long' });
    const siteUrl = this.config.get<string>('SITE_URL', 'https://revela.com.tr');
    // Auto-renew kapalıysa standart "yenile" CTA, açıksa "tek-tıkla yenile" + plan koduyla deep link
    const checkoutUrl = autoRenew && lastPlanCode
      ? `${siteUrl}/odeme?plan=${encodeURIComponent(lastPlanCode)}`
      : `${siteUrl}/odeme`;
    const headline = autoRenew
      ? 'Premium üyeliğin yakında yenilenecek'
      : 'Premium üyeliğin yakında bitiyor';
    const ctaLabel = autoRenew ? 'Tek Tıkla Yenile' : 'Aboneliği Yenile';
    const intro = autoRenew
      ? `Otomatik yenileme tercihini açtın. Premium üyeliğin <strong>${daysLeft} gün</strong> sonra (${trDate}) sona eriyor — aşağıdaki bağlantı seni doğrudan ödeme sayfasına götürür, plan seçimi yapılı.`
      : `REVELA Premium üyeliğin <strong>${daysLeft} gün</strong> sonra sona eriyor (${trDate}).`;
    const footnote = autoRenew
      ? `Auto-renew tercihini kapatmak istersen <a href="${siteUrl}/premium" style="color:#666;">Premium panelinden</a> kapatabilirsin.`
      : `Yenilemezsen Premium özellikleri (karşılaştırma, trend, AI Cilt Danışmanı) ${trDate} itibariyle pasif olur. Cilt analizlerin ve verilerin kayıtlı kalmaya devam eder.`;

    return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1F1F1F;">
  <h2 style="font-size:20px;font-weight:600;margin-bottom:16px;">${headline}</h2>
  <p>Merhaba,</p>
  <p>${intro}</p>
  <p style="margin:24px 0;">
    <a href="${checkoutUrl}" style="display:inline-block;padding:12px 24px;background:#1F1F1F;color:white;text-decoration:none;border-radius:4px;font-weight:500;">${ctaLabel}</a>
  </p>
  <p style="color:#666;font-size:13px;">${footnote}</p>
  <hr style="border:none;border-top:1px solid #e0e0e0;margin:32px 0;"/>
  <p style="color:#999;font-size:11px;">Bu mail ${email} adresine REVELA Premium üyeliğin için gönderildi.</p>
</body>
</html>`;
  }

  /**
   * Auto-renew tercihi güncelle (kullanıcı /premium panelinden açar/kapatır).
   */
  async setAutoRenew(userId: number, enabled: boolean): Promise<{ user_id: number; auto_renew_enabled: boolean }> {
    const user = await this.users.findOne({ where: { user_id: userId } });
    if (!user) throw new BadRequestException(`User ${userId} bulunamadı`);
    user.auto_renew_enabled = enabled;
    await this.users.save(user);
    this.logger.log(`Auto-renew ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
    return { user_id: userId, auto_renew_enabled: enabled };
  }
}
