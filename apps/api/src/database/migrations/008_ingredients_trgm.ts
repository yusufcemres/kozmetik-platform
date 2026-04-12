import { MigrationInterface, QueryRunner } from 'typeorm';

export class IngredientsTrgm1700000000008 implements MigrationInterface {
  name = 'IngredientsTrgm1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_inci_trgm
      ON ingredients USING gin (inci_name gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_common_trgm
      ON ingredients USING gin (common_name gin_trgm_ops)
      WHERE common_name IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredient_aliases_trgm
      ON ingredient_aliases USING gin (alias_name gin_trgm_ops)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredient_aliases_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_common_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_inci_trgm`);
  }
}
