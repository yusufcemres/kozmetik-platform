import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz B — Tag provenance (minimal şema)
 *
 * Her tag atamasının kanıtını saklar. Marka itirazında:
 *   "Dimethicone içerikte 3. sırada (marka resmi sayfa, 2026-04-13)"
 * gibi gerekçe gösterilir.
 *
 * İleri alanlar (confidence, verified_by, verified_at) ihtiyaç oluşunca
 * ALTER TABLE ile eklenir — şu an minimal tutuluyor.
 */
export class TagProvenance1700000000011 implements MigrationInterface {
  name = 'TagProvenance1700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_tag_provenance (
        provenance_id BIGSERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        tag_key VARCHAR(80) NOT NULL,
        tag_value VARCHAR(120),
        source_type VARCHAR(40) NOT NULL, -- inci_deterministic | certification_db | brand_claim | llm_extracted | brand_portal | admin | titck
        source_url VARCHAR(500),
        source_quote TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ptp_product ON product_tag_provenance(product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ptp_tag_key ON product_tag_provenance(tag_key)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ptp_source ON product_tag_provenance(source_type)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_tag_provenance`);
  }
}
