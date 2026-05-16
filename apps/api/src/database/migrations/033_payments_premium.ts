import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 033 — PayTR Subscription + Premium tier (Faz 3 başlangıcı, 2026-05-17).
 *
 * Eklenenler:
 * - app_users.premium_until TIMESTAMPTZ NULL — premium üyelik bitiş tarihi
 *   (NOW() ile karşılaştırılır; NULL veya geçmiş = ücretsiz tier)
 * - payments tablosu — PayTR IPN audit + her ödeme/iade kalıcı kayıt
 *   (KVKK + muhasebe + chargeback denetim için)
 *
 * Tasarım kararları:
 * - merchant_oid UNIQUE — idempotent IPN (PayTR aynı çağrıyı 2x atabilir)
 * - status: 'pending' (token alındı) | 'success' (IPN başarılı) | 'failed' (IPN fail)
 *   | 'refunded' (manuel iade)
 * - plan_code: '29_one_time' | '49_monthly' | '490_yearly' — pricing memory'den
 * - raw_payload jsonb — PayTR IPN body full, debug + denetim kanıtı
 */
export class PaymentsPremium1700000000033 implements MigrationInterface {
  name = 'PaymentsPremium1700000000033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) app_users.premium_until
    await queryRunner.query(`
      ALTER TABLE app_users
        ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_app_users_premium_until
      ON app_users(premium_until)
      WHERE premium_until IS NOT NULL
    `);

    // 2) payments tablosu
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id BIGSERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES app_users(user_id) ON DELETE SET NULL,
        merchant_oid VARCHAR(64) NOT NULL UNIQUE,
        plan_code VARCHAR(40) NOT NULL,
        amount_kurus INTEGER NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'TL',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        ipn_received_at TIMESTAMPTZ,
        failure_reason VARCHAR(255),
        raw_payload JSONB,
        ip VARCHAR(45),
        user_agent VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_user_id
      ON payments(user_id)
      WHERE user_id IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_status_created
      ON payments(status, created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_status_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_user_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_app_users_premium_until`);
    await queryRunner.query(`ALTER TABLE app_users DROP COLUMN IF EXISTS premium_until`);
  }
}
