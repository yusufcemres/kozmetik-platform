import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 035 — Premium auto-renew flag (Faz 3 polish, 2026-05-19).
 *
 * Eklenenler:
 * - app_users.auto_renew_enabled BOOLEAN DEFAULT false
 *   Kullanıcı /premium sayfasından açar. Cron premium_until yaklaşırken
 *   farklı mail atar: standart "yenile" yerine "tek tıkla yenile" + direkt
 *   /odeme?plan=X linki.
 *
 *   GERÇEK auto-charge (kullanıcı müdahalesi olmadan) PayTR Subscription
 *   API onayı geldikten sonra eklenir — şu an "soft auto-renew" yani
 *   tek-tıkla ödeme linki gönderiyor.
 *
 * - app_users.last_plan_code VARCHAR(30) NULL
 *   Son satın alınan plan kodu (29_one_time / 49_monthly / 490_yearly).
 *   Reminder mail'inde aynı plan tekrar önerilir.
 */
export class AutoRenew1700000000035 implements MigrationInterface {
  name = 'AutoRenew1700000000035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE app_users
        ADD COLUMN IF NOT EXISTS auto_renew_enabled BOOLEAN DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE app_users
        ADD COLUMN IF NOT EXISTS last_plan_code VARCHAR(30)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE app_users DROP COLUMN IF EXISTS last_plan_code`);
    await queryRunner.query(`ALTER TABLE app_users DROP COLUMN IF EXISTS auto_renew_enabled`);
  }
}
