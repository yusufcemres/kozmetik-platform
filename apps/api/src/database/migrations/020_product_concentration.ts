import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MODÜL 0/3 — product_ingredients tablosuna konsantrasyon alanları.
 *
 * Kozmetik scoring: aktif maddenin dermal etkinlik eşiği vs gerçek konsantrasyon.
 * Üretici beyanıysa 'manufacturer', tahmini ise 'estimated'.
 */
export class ProductConcentration1700000000020 implements MigrationInterface {
  name = 'ProductConcentration1700000000020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE product_ingredients
        ADD COLUMN IF NOT EXISTS concentration_percent DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS concentration_source VARCHAR(20)
          CHECK (concentration_source IN ('manufacturer','estimated','unknown'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE product_ingredients
        DROP COLUMN IF EXISTS concentration_source,
        DROP COLUMN IF EXISTS concentration_percent
    `);
  }
}
