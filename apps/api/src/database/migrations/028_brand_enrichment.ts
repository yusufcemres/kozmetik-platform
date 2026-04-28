import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 028 — Brand zenginleştirme alanları.
 *
 * `brands` tablosuna 4 yeni alan:
 *  - `brand_description TEXT`        — 150-300 kelimelik markdown açıklama (about/mission)
 *  - `founded_year INT`              — kuruluş yılı
 *  - `signature_categories TEXT[]`   — markanın öne çıkan ürün kategorileri (örn ["güneş kremi","SPF"])
 *  - `tagline VARCHAR(160)`          — kısa marka sloganı
 *
 * Hedef: markalar/[slug] sayfasının zengin header + intro paragrafı için.
 */
export class BrandEnrichment1700000000028 implements MigrationInterface {
  name = 'BrandEnrichment1700000000028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE brands
        ADD COLUMN IF NOT EXISTS brand_description TEXT,
        ADD COLUMN IF NOT EXISTS founded_year INTEGER,
        ADD COLUMN IF NOT EXISTS signature_categories TEXT[],
        ADD COLUMN IF NOT EXISTS tagline VARCHAR(160)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE brands
        DROP COLUMN IF EXISTS tagline,
        DROP COLUMN IF EXISTS signature_categories,
        DROP COLUMN IF EXISTS founded_year,
        DROP COLUMN IF EXISTS brand_description
    `);
  }
}
