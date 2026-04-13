import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz C2 — TİTCK Entegrasyonu
 *
 * products: bildirim numarası + durum + doğrulama tarihi
 * titck_banned_ingredients: Sağlık Bakanlığı yasaklı madde listesi
 * products.badges: birleşik rozet JSONB (titck_verified, vegan_certified, ecocert vb.)
 */
export class Titck1700000000012 implements MigrationInterface {
  name = 'Titck1700000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS titck_notification_no VARCHAR(80),
        ADD COLUMN IF NOT EXISTS titck_status VARCHAR(30) DEFAULT 'not_checked',
          -- not_checked | verified | not_found | expired | banned
        ADD COLUMN IF NOT EXISTS titck_verified_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS titck_banned_reason TEXT,
        ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_titck_status ON products(titck_status)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_badges_gin ON products USING gin (badges)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS titck_banned_ingredients (
        banned_id SERIAL PRIMARY KEY,
        inci_name VARCHAR(250) NOT NULL,
        inci_slug VARCHAR(250) NOT NULL,
        ban_reason TEXT,
        ban_category VARCHAR(60), -- carcinogen | endocrine_disruptor | unapproved_colorant | other
        regulation_ref VARCHAR(250),
        banned_at DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (inci_slug)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_titck_banned_slug ON titck_banned_ingredients(inci_slug)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS titck_banned_ingredients`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_badges_gin`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_titck_status`);
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN IF EXISTS badges,
        DROP COLUMN IF EXISTS titck_banned_reason,
        DROP COLUMN IF EXISTS titck_verified_at,
        DROP COLUMN IF EXISTS titck_status,
        DROP COLUMN IF EXISTS titck_notification_no
    `);
  }
}
