import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Chelated/compound ingredient forms (magnesium-bisglycinate, iron-bisglycinate,
 * zinc-picolinate, etc.) carry mineral weight as part of the compound. Scoring
 * needs the elemental fraction so serving-dose (compound mg) can be converted
 * to elemental mg before comparing against UL / effective_dose (both elemental
 * per NIH ODS norms).
 *
 * Example: 400mg magnesium bisglycinate × 0.1070 = ~43mg elemental Mg.
 *
 * NULL = 1.0 (pure ingredient, e.g. ascorbic-acid, melatonin).
 */
export class IngredientElementalRatio1700000000021 implements MigrationInterface {
  name = 'IngredientElementalRatio1700000000021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ingredients
        ADD COLUMN IF NOT EXISTS elemental_ratio DECIMAL(5,4)
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN ingredients.elemental_ratio IS
        'Elemental mineral fraction of the compound form (0-1). NULL treated as 1.0 for pure ingredients.'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ingredients DROP COLUMN IF EXISTS elemental_ratio
    `);
  }
}
