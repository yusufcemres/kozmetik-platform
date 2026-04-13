import { MigrationInterface, QueryRunner } from 'typeorm';

export class IngredientsEnrichment1700000000009 implements MigrationInterface {
  name = 'IngredientsEnrichment1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ingredients
        ADD COLUMN IF NOT EXISTS is_paraben BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_silicone BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_sulfate BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_peg BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_mineral_oil BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_animal_derived BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_eu26_allergen BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_alcohol_drying BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS comedogenic_score SMALLINT,
        ADD COLUMN IF NOT EXISTS ingredient_function VARCHAR(120),
        ADD COLUMN IF NOT EXISTS enrichment_source VARCHAR(60)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_paraben ON ingredients(is_paraben) WHERE is_paraben = true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_silicone ON ingredients(is_silicone) WHERE is_silicone = true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_sulfate ON ingredients(is_sulfate) WHERE is_sulfate = true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_eu26 ON ingredients(is_eu26_allergen) WHERE is_eu26_allergen = true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_comedogenic ON ingredients(comedogenic_score) WHERE comedogenic_score IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_comedogenic`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_eu26`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_sulfate`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_silicone`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_paraben`);
    await queryRunner.query(`
      ALTER TABLE ingredients
        DROP COLUMN IF EXISTS enrichment_source,
        DROP COLUMN IF EXISTS ingredient_function,
        DROP COLUMN IF EXISTS comedogenic_score,
        DROP COLUMN IF EXISTS is_alcohol_drying,
        DROP COLUMN IF EXISTS is_eu26_allergen,
        DROP COLUMN IF EXISTS is_animal_derived,
        DROP COLUMN IF EXISTS is_mineral_oil,
        DROP COLUMN IF EXISTS is_peg,
        DROP COLUMN IF EXISTS is_sulfate,
        DROP COLUMN IF EXISTS is_silicone,
        DROP COLUMN IF EXISTS is_paraben
    `);
  }
}
