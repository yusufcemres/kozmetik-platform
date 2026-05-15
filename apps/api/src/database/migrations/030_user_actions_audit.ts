import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 030 — KVKK + denetim için kullanıcı aksiyon audit log tablosu.
 *
 * 2026-05-15 audit (Madde 8) ile eklendi. KVKK Madde 11 (kullanıcı erişim hakkı) +
 * Madde 7 (silme hakkı) + Madde 12 (veri güvenliği) için kanıt zinciri sağlar.
 *
 * Kaydedilen aksiyon türleri:
 *   - LOGIN_REQUEST       — magic link talep edildi
 *   - LOGIN_SUCCESS       — token doğrulandı, session başladı
 *   - LOGIN_FAILED        — geçersiz/expired token denemesi
 *   - LOGIN_RATE_LIMITED  — IP veya email rate limit aşıldı
 *   - DATA_EXPORT         — kullanıcı kişisel verilerini export etti
 *   - ACCOUNT_DELETE      — kullanıcı hesabını sildi (cascade öncesi log)
 *   - CONSENT_UPDATE      — çerez/veri işleme rızası güncellendi
 *   - PROFILE_UPDATE      — display_name veya başka bir kişisel alan değişti
 *
 * `user_id` nullable: anonim login_request veya rate_limited durumda kayıt yapılır
 * (IP ve email saklanır, KVKK Madde 5 — meşru menfaat).
 *
 * `details JSONB` opsiyonel ek bilgi (örn. fail reason, IP, user-agent kısmi).
 */
export class UserActionsAudit1700000000030 implements MigrationInterface {
  name = 'UserActionsAudit1700000000030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_actions (
        action_id BIGSERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES app_users(user_id) ON DELETE SET NULL,
        action_type VARCHAR(40) NOT NULL,
        email_hash VARCHAR(64),
        ip VARCHAR(45),
        user_agent VARCHAR(255),
        details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id) WHERE user_id IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_actions_type_created ON user_actions(action_type, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_actions_email_hash ON user_actions(email_hash) WHERE email_hash IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_actions_ip ON user_actions(ip) WHERE ip IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_actions_ip`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_actions_email_hash`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_actions_type_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_actions_user_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_actions`);
  }
}
