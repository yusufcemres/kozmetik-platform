import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 034 — Premium üyelik bitiş hatırlatma maili (Faz 3 polish, 2026-05-19).
 *
 * Eklenenler:
 * - app_users.premium_reminder_sent_at TIMESTAMPTZ NULL
 *   Cron her gün 09:00 TR'de premium_until - 7 gün <= NOW() < premium_until
 *   olan kullanıcılara mail atar. Reminder gönderildiyse bu kolona timestamp
 *   yazılır → aynı period için 2. mail gönderilmez. premium_until update'inde
 *   manuel olarak NULL'a çekilir (yeni period için tekrar uyarı verilebilsin).
 */
export class PremiumReminder1700000000034 implements MigrationInterface {
  name = 'PremiumReminder1700000000034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE app_users
        ADD COLUMN IF NOT EXISTS premium_reminder_sent_at TIMESTAMPTZ
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_app_users_premium_reminder
      ON app_users(premium_until, premium_reminder_sent_at)
      WHERE premium_until IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_app_users_premium_reminder`);
    await queryRunner.query(`ALTER TABLE app_users DROP COLUMN IF EXISTS premium_reminder_sent_at`);
  }
}
