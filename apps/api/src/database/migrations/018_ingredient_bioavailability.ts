import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * BLOK B2 — Supplement scoring için biyoyararlanım alanları.
 *
 * ingredients tablosuna:
 *  - bioavailability_score: 0-100 form kalitesi puanı (Mg Bisglisinat 80 vs Oksit 4)
 *  - parent_ingredient_id: self-FK, üst ingredient ("Magnezyum") + form child kayıtları
 *  - form_type: bisglisinat | sitrat | oksit | pikolinat ...
 *  - absorption_rate: 0-100, kaba emilim oranı (bilinmeyebilir)
 *
 * Mevcut food_sources JSONB içindeki bioavailability (gıdadan emilim) ayrı konu — bu kolonlar
 * supplement formunun kendisinin biyoyararlanımı içindir.
 */
export class IngredientBioavailability1700000000018 implements MigrationInterface {
  name = 'IngredientBioavailability1700000000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ingredients
        ADD COLUMN IF NOT EXISTS bioavailability_score SMALLINT CHECK (bioavailability_score BETWEEN 0 AND 100),
        ADD COLUMN IF NOT EXISTS parent_ingredient_id INT REFERENCES ingredients(ingredient_id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS form_type VARCHAR(60),
        ADD COLUMN IF NOT EXISTS absorption_rate SMALLINT CHECK (absorption_rate BETWEEN 0 AND 100)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_parent ON ingredients(parent_ingredient_id)
      WHERE parent_ingredient_id IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_form_type ON ingredients(form_type)
      WHERE form_type IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_form_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_parent`);
    await queryRunner.query(`
      ALTER TABLE ingredients
        DROP COLUMN IF EXISTS absorption_rate,
        DROP COLUMN IF EXISTS form_type,
        DROP COLUMN IF EXISTS parent_ingredient_id,
        DROP COLUMN IF EXISTS bioavailability_score
    `);
  }
}
