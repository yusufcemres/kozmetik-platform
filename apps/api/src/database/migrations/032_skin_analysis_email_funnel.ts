import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 032 — Foto analiz email opt-in + 28-gün reminder kolonları.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 9 ile eklendi.
 * - subscription_email: opt-in olunca plaintext (KVKK: kullanıcı izniyle, opt-out ile silinir)
 * - welcome_email_sent_at / reminder_email_sent_at: cron idempotency
 * - unsubscribe_token: tek tıkla opt-out link (CSRF korumalı)
 * - unsubscribed_at: opt-out timestamp (subscription_email NULL'a çekilir)
 *
 * Eski `anonymous_email` (SHA256 hash) kalıyor — fingerprint olarak farklı amaç:
 * hash duplicate kontrolü + anonim analiz session match.
 */
export class SkinAnalysisEmailFunnel1700000000032 implements MigrationInterface {
  name = 'SkinAnalysisEmailFunnel1700000000032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE skin_analysis_results
        ADD COLUMN IF NOT EXISTS subscription_email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS reminder_email_sent_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(64)
    `);

    // Unsubscribe token unique (kollision koruması)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_skin_analysis_unsubscribe_token
      ON skin_analysis_results(unsubscribe_token)
      WHERE unsubscribe_token IS NOT NULL
    `);

    // Cron sorgu performansı: 28+ gün önce, subscription_email NOT NULL, reminder yollanmamış
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_skin_analysis_reminder_candidates
      ON skin_analysis_results(created_at)
      WHERE subscription_email IS NOT NULL
        AND reminder_email_sent_at IS NULL
        AND unsubscribed_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skin_analysis_reminder_candidates`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skin_analysis_unsubscribe_token`);
    await queryRunner.query(`
      ALTER TABLE skin_analysis_results
        DROP COLUMN IF EXISTS unsubscribe_token,
        DROP COLUMN IF EXISTS unsubscribed_at,
        DROP COLUMN IF EXISTS reminder_email_sent_at,
        DROP COLUMN IF EXISTS welcome_email_sent_at,
        DROP COLUMN IF EXISTS subscription_email
    `);
  }
}
