import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz O — Affiliate Minimum Viable
 *
 * - affiliate_clicks: mevcut yasadigi sema korunur (click_id, affiliate_link_id,
 *   source_page, ip_hash, user_agent, clicked_at). Migrations tablosunda kayit
 *   yoktu; bu versiyon idempotent (IF NOT EXISTS) sekilde indekslemeleri toplar.
 * - product_price_history: Fiyat Dususu bildirim besleme kaynagi.
 *
 * Not: Eski tur sema (product_id, platform, ip, utm, user_id vb.) entity ile
 * uyumsuzdu; o plan iptal. AffiliateClick entity alan isimlerine guven.
 */
export class AffiliateTracking1700000000016 implements MigrationInterface {
  name = 'AffiliateTracking1700000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // affiliate_clicks: mevcut sema korunur, sadece gereksiz ise ek indeks.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        click_id SERIAL PRIMARY KEY,
        affiliate_link_id INT NOT NULL REFERENCES affiliate_links(affiliate_link_id) ON DELETE CASCADE,
        source_page VARCHAR(100),
        ip_hash VARCHAR(64),
        user_agent TEXT,
        clicked_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_aff_clicks_link ON affiliate_clicks(affiliate_link_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_aff_clicks_date ON affiliate_clicks(clicked_at DESC)`,
    );

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
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_price_history_product ON product_price_history(product_id, observed_at DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_price_history`);
    // affiliate_clicks migration'dan once de vardi — drop etmiyoruz.
  }
}
