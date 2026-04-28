import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 029 — Need (ihtiyaç) zenginleştirme alanları.
 *
 * `needs` tablosuna:
 *  - `faq_json JSONB`                 — [{q, a}] formatında 3-5 FAQ
 *  - `skin_type_affinity JSONB`       — {dry: 0-100, oily: 0-100, ...}
 *  - `interaction_warnings JSONB`     — [{ingredient_a, ingredient_b, warning}]
 *  - `confused_with_json JSONB`       — [{name, difference}] sık karıştırılan ihtiyaçlar
 *
 * Frontend `ihtiyaclar/[slug]` sayfasında FAQ + cilt tipi matrisi + ayırt edici notlar.
 */
export class NeedEnrichment1700000000029 implements MigrationInterface {
  name = 'NeedEnrichment1700000000029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE needs
        ADD COLUMN IF NOT EXISTS faq_json JSONB,
        ADD COLUMN IF NOT EXISTS skin_type_affinity JSONB,
        ADD COLUMN IF NOT EXISTS interaction_warnings JSONB,
        ADD COLUMN IF NOT EXISTS confused_with_json JSONB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE needs
        DROP COLUMN IF EXISTS confused_with_json,
        DROP COLUMN IF EXISTS interaction_warnings,
        DROP COLUMN IF EXISTS skin_type_affinity,
        DROP COLUMN IF EXISTS faq_json
    `);
  }
}
