import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 036 — Newsletter subscriptions (Faz P polish, 2026-05-19).
 *
 * Skin-analysis email funnel per-analysis email opt-in için, bu jenerik
 * REVELA bülten subscription. İki sistem coexist eder.
 *
 * - email_hash UNIQUE (SHA-256, KVKK Madde 11 hash-only retention)
 * - unsubscribe_token 64-char hex (single-click unsubscribe, no auth)
 * - subscribed_at default NOW, unsubscribed_at NULL while active
 * - source_page nullable (newsletter ekleme yeri: footer, blog, vs.)
 *
 * Kullanım:
 *  - POST /newsletter/subscribe → idempotent insert, welcome mail
 *  - GET /newsletter/unsubscribe/:token → tomb stone (no info leak)
 *  - Admin manual send: POST /newsletter/admin/send (sonra cron)
 */
export class NewsletterSubscriptions1700000000036 implements MigrationInterface {
  name = 'NewsletterSubscriptions1700000000036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        subscription_id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        email_hash VARCHAR(64) NOT NULL UNIQUE,
        unsubscribe_token VARCHAR(64) NOT NULL UNIQUE,
        subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        unsubscribed_at TIMESTAMPTZ,
        source_page VARCHAR(255),
        last_sent_at TIMESTAMPTZ,
        send_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_active
      ON newsletter_subscriptions(unsubscribed_at)
      WHERE unsubscribed_at IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_last_sent
      ON newsletter_subscriptions(last_sent_at)
      WHERE unsubscribed_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_newsletter_last_sent`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_newsletter_active`);
    await queryRunner.query(`DROP TABLE IF EXISTS newsletter_subscriptions`);
  }
}
