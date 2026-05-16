import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac, randomBytes } from 'crypto';
import { AppUser, Payment, PaymentPlanCode } from '@database/entities';

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
    } catch (err: any) {
      if (err instanceof ServiceUnavailableException) throw err;
      this.logger.error(`PayTR HTTP failed: ${err.message}`);
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
        await this.users.save(user);
        this.logger.log(`Premium granted: user=${user.user_id} until=${newExp.toISOString()} plan=${existing.plan_code}`);
      }
    }

    return { ok: true };
  }

  /** Kullanıcının aktif Premium durumu — JWT claim'e koymak için */
  async getPremiumStatus(userId: number): Promise<{ premium: boolean; premium_until: string | null }> {
    const user = await this.users.findOne({ where: { user_id: userId } });
    if (!user || !user.premium_until) return { premium: false, premium_until: null };
    const active = user.premium_until.getTime() > Date.now();
    return {
      premium: active,
      premium_until: user.premium_until.toISOString(),
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
}
