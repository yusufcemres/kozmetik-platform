import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * V2.B.13 — Age-adjusted UL support for anne-bebek catalogue.
 *
 * 1) products.target_audience — which group the SKU is formulated for.
 *    Scoring reads this and picks the matching UL tier from the ingredient.
 *    Default 'adult' keeps pre-existing rows' scoring behavior identical.
 *
 * 2) ingredients.ul_by_audience — optional JSONB keyed by the same audience
 *    enum. When present, overrides ul_dose for that audience. NULL/missing key
 *    falls back to ul_dose (current behavior). Example:
 *      { "adult": 4000, "infant_0_12m": 1000, "child_1_3y": 2500 } (Vitamin D IU)
 *
 * Seeding age-specific ULs is deferred — they're populated per-ingredient on
 * demand when a bebek product is onboarded. Until then adult UL applies.
 */
export class TargetAudienceAndAgeUl1700000000022 implements MigrationInterface {
  name = 'TargetAudienceAndAgeUl1700000000022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS target_audience VARCHAR(30) NOT NULL DEFAULT 'adult'
    `);
    await queryRunner.query(`
      ALTER TABLE products
        DROP CONSTRAINT IF EXISTS products_target_audience_check
    `);
    await queryRunner.query(`
      ALTER TABLE products
        ADD CONSTRAINT products_target_audience_check
        CHECK (target_audience IN ('adult','pregnant','breastfeeding','infant_0_12m','child_1_3y','child_4_12y'))
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN products.target_audience IS
        'Intended consumer age/life-stage group. Scoring picks matching UL from ingredients.ul_by_audience; falls back to ul_dose.'
    `);

    await queryRunner.query(`
      ALTER TABLE ingredients
        ADD COLUMN IF NOT EXISTS ul_by_audience JSONB
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN ingredients.ul_by_audience IS
        'Optional per-audience UL overrides. Keys match products.target_audience enum. NULL or missing key = fallback to ul_dose.'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ingredients DROP COLUMN IF EXISTS ul_by_audience`);
    await queryRunner.query(`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_target_audience_check`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS target_audience`);
  }
}
