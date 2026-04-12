import { MigrationInterface, QueryRunner } from 'typeorm';

export class SmartScan1700000000005 implements MigrationInterface {
  name = 'SmartScan1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // pg_trgm for fuzzy brand/product name matching
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // Barcode lookup index
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)
      WHERE barcode IS NOT NULL
    `);

    // Trigram indexes for fuzzy name search
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name_trgm
      ON products USING gin (product_name gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_brands_name_trgm
      ON brands USING gin (brand_name gin_trgm_ops)
    `);

    // Unknown scans queue (user submitted images that didn't match)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS unknown_scans (
        scan_id SERIAL PRIMARY KEY,
        user_id INT,
        barcode VARCHAR(50),
        detected_brand VARCHAR(200),
        detected_name VARCHAR(300),
        ocr_text TEXT,
        image_hash VARCHAR(64),
        ip VARCHAR(64),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_unknown_scans_status ON unknown_scans(status)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_unknown_scans_created ON unknown_scans(created_at DESC)
    `);

    // Scan history (per user)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS scan_history (
        history_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT,
        method VARCHAR(20) NOT NULL,
        confidence DECIMAL(4,3),
        raw_barcode VARCHAR(50),
        raw_query TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id, created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS scan_history`);
    await queryRunner.query(`DROP TABLE IF EXISTS unknown_scans`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_brands_name_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_name_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_barcode`);
  }
}
