import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Dead-link quarantine: ardışık başarısızlık sayacı + son hata kategorisi
 * sütunları. 3+ ardışık fail olan link `verification_status='needs_review'`
 * flag'ine alınır; admin tekrar doğrulayana kadar frontend bu linki gizler.
 *
 * Idempotent — var olan değerlere dokunmaz, yalnızca kolon ekler.
 */
export class AffiliateQuarantine1700000000026 implements MigrationInterface {
  name = 'AffiliateQuarantine1700000000026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE affiliate_links
        ADD COLUMN IF NOT EXISTS consecutive_failures INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_error_type VARCHAR(30),
        ADD COLUMN IF NOT EXISTS last_error_message TEXT,
        ADD COLUMN IF NOT EXISTS last_attempted_at TIMESTAMP
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_aff_links_needs_review
        ON affiliate_links(verification_status)
        WHERE verification_status = 'needs_review'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_aff_links_needs_review`);
    await queryRunner.query(`
      ALTER TABLE affiliate_links
        DROP COLUMN IF EXISTS consecutive_failures,
        DROP COLUMN IF EXISTS last_error_type,
        DROP COLUMN IF EXISTS last_error_message,
        DROP COLUMN IF EXISTS last_attempted_at
    `);
  }
}
