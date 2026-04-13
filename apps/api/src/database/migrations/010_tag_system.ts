import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz B — Tag sistemi (niş filtreleme altyapısı)
 *
 * tags: key/value/type/group — 80+ niş filtre için merkezi registry
 * product_tags: ürün ↔ tag M2M, her tag için kaynak source tipi
 *
 * Not: Kategori hiyerarşisi 001'de zaten parent_category_id ile mevcut.
 * Rebuild gerekmiyor — sadece taksonomi seed edilecek (seed-categories.js).
 */
export class TagSystem1700000000010 implements MigrationInterface {
  name = 'TagSystem1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tags (
        tag_id SERIAL PRIMARY KEY,
        tag_key VARCHAR(80) NOT NULL,
        tag_value VARCHAR(120),
        tag_type VARCHAR(40) NOT NULL, -- boolean | enum | numeric_range
        tag_group VARCHAR(60) NOT NULL, -- inci_free | ethics | certification | skin_type | concern | texture | timing | season | age | legal_risk
        label_tr VARCHAR(160),
        description TEXT,
        legal_risk BOOLEAN DEFAULT false, -- true ise yalnız sertifika DB onayı kabul
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (tag_key, tag_value)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tags_group ON tags(tag_group)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tags_key ON tags(tag_key)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_tags (
        product_tag_id BIGSERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        tag_id INT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
        source_type VARCHAR(40) NOT NULL, -- inci_deterministic | certification_db | brand_claim | llm_extracted | brand_portal | admin | titck
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (product_id, tag_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_tags`);
    await queryRunner.query(`DROP TABLE IF EXISTS tags`);
  }
}
