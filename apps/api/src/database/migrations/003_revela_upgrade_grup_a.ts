import { MigrationInterface, QueryRunner } from 'typeorm';

export class RevelaUpgradeGrupA1700000000003 implements MigrationInterface {
  name = 'RevelaUpgradeGrupA1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === NEED: need_category ===
    await queryRunner.query(`
      ALTER TABLE needs
      ADD COLUMN IF NOT EXISTS need_category VARCHAR(50) DEFAULT 'skin'
    `);

    // Update existing needs with correct categories
    await queryRunner.query(`
      UPDATE needs SET need_category = 'body'
      WHERE need_slug IN ('sindirim-sagligi', 'kemik-eklem')
    `);
    await queryRunner.query(`
      UPDATE needs SET need_category = 'general_health'
      WHERE need_slug IN ('enerji-canlilik', 'bagisiklik-destegi')
    `);
    // All others remain 'skin' (default)

    // === PRODUCT: target_gender, view_count, favorite_count ===
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS target_gender VARCHAR(20) DEFAULT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS favorite_count INT DEFAULT 0
    `);

    // Auto-tag gender based on product names
    await queryRunner.query(`
      UPDATE products SET target_gender = 'male'
      WHERE LOWER(product_name) SIMILAR TO '%(man |men |erkek|for men|homme)%'
    `);
    await queryRunner.query(`
      UPDATE products SET target_gender = 'female'
      WHERE LOWER(product_name) SIMILAR TO '%(woman |women |kadın|for women|femme)%'
    `);

    // === USER SKIN PROFILE: gender ===
    await queryRunner.query(`
      ALTER TABLE user_skin_profiles
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT NULL
    `);

    // === INGREDIENT: safety_class, safety_note, food_sources, daily_recommended ===
    await queryRunner.query(`
      ALTER TABLE ingredients
      ADD COLUMN IF NOT EXISTS safety_class VARCHAR(30) DEFAULT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE ingredients
      ADD COLUMN IF NOT EXISTS safety_note TEXT DEFAULT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE ingredients
      ADD COLUMN IF NOT EXISTS food_sources JSONB DEFAULT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE ingredients
      ADD COLUMN IF NOT EXISTS daily_recommended_value DECIMAL(10,2) DEFAULT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE ingredients
      ADD COLUMN IF NOT EXISTS daily_recommended_unit VARCHAR(10) DEFAULT NULL
    `);

    // === INDEXES ===
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_needs_category ON needs(need_category)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_target_gender ON products(target_gender)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_safety ON ingredients(safety_class)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_ingredients_safety');
    await queryRunner.query('DROP INDEX IF EXISTS idx_products_target_gender');
    await queryRunner.query('DROP INDEX IF EXISTS idx_needs_category');

    await queryRunner.query('ALTER TABLE ingredients DROP COLUMN IF EXISTS daily_recommended_unit');
    await queryRunner.query('ALTER TABLE ingredients DROP COLUMN IF EXISTS daily_recommended_value');
    await queryRunner.query('ALTER TABLE ingredients DROP COLUMN IF EXISTS food_sources');
    await queryRunner.query('ALTER TABLE ingredients DROP COLUMN IF EXISTS safety_note');
    await queryRunner.query('ALTER TABLE ingredients DROP COLUMN IF EXISTS safety_class');

    await queryRunner.query('ALTER TABLE user_skin_profiles DROP COLUMN IF EXISTS gender');

    await queryRunner.query('ALTER TABLE products DROP COLUMN IF EXISTS favorite_count');
    await queryRunner.query('ALTER TABLE products DROP COLUMN IF EXISTS view_count');
    await queryRunner.query('ALTER TABLE products DROP COLUMN IF EXISTS target_gender');

    await queryRunner.query('ALTER TABLE needs DROP COLUMN IF EXISTS need_category');
  }
}
