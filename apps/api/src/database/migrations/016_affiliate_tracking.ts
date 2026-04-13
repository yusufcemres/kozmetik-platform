import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz O — Affiliate Minimum Viable
 *
 * affiliate_clicks: click tracking (conversion analytics + future A/B)
 * product_price_history: launch'ta tohumlanır, Fiyat Düşüşü Bildirimi için veri
 */
export class AffiliateTracking1700000000016 implements MigrationInterface {
  name = 'AffiliateTracking1700000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        click_id BIGSERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        platform VARCHAR(30) NOT NULL, -- trendyol | hepsiburada | amazon | other
        affiliate_link_id INT REFERENCES affiliate_links(affiliate_link_id) ON DELETE SET NULL,
        user_id INT REFERENCES app_users(user_id) ON DELETE SET NULL,
        session_id VARCHAR(80),
        ip VARCHAR(64),
        user_agent VARCHAR(500),
        referrer VARCHAR(500),
        utm JSONB,
        clicked_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_aff_clicks_product ON affiliate_clicks(product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_aff_clicks_platform ON affiliate_clicks(platform)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_aff_clicks_date ON affiliate_clicks(clicked_at DESC)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_price_history (
        history_id BIGSERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        platform VARCHAR(30) NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'TRY',
        observed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_price_history_product ON product_price_history(product_id, observed_at DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_price_history`);
    await queryRunner.query(`DROP TABLE IF EXISTS affiliate_clicks`);
  }
}
