import { MigrationInterface, QueryRunner } from 'typeorm';

export class Faz2Faz4Tables1700000000002 implements MigrationInterface {
  name = 'Faz2Faz4Tables1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== FAZ 2: SUPPLEMENT =====

    await queryRunner.query(`
      CREATE TABLE supplement_details (
        supplement_detail_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL UNIQUE REFERENCES products(product_id) ON DELETE CASCADE,
        form VARCHAR(30) NOT NULL,
        serving_size DECIMAL(10,2),
        serving_unit VARCHAR(20),
        servings_per_container INT,
        recommended_use VARCHAR(200),
        warnings TEXT,
        requires_prescription BOOLEAN DEFAULT false,
        manufacturer_country VARCHAR(100),
        certification VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE supplement_ingredients (
        supplement_ingredient_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        ingredient_id INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
        amount_per_serving DECIMAL(10,3),
        unit VARCHAR(20),
        daily_value_percentage DECIMAL(5,1),
        is_proprietary_blend BOOLEAN DEFAULT false,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_supplement_ingredients_product ON supplement_ingredients(product_id)
    `);

    await queryRunner.query(`
      CREATE TABLE ingredient_interactions (
        interaction_id SERIAL PRIMARY KEY,
        ingredient_a_id INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
        ingredient_b_id INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
        severity VARCHAR(30) NOT NULL,
        domain_type VARCHAR(30) DEFAULT 'both',
        interaction_context VARCHAR(30) DEFAULT 'ingredient',
        description TEXT NOT NULL,
        recommendation TEXT,
        source_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_interactions_a ON ingredient_interactions(ingredient_a_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_interactions_b ON ingredient_interactions(ingredient_b_id)
    `);

    // ===== FAZ 3: PRICE TRACKING =====

    await queryRunner.query(`
      CREATE TABLE price_history (
        price_history_id SERIAL PRIMARY KEY,
        affiliate_link_id INT NOT NULL REFERENCES affiliate_links(affiliate_link_id) ON DELETE CASCADE,
        price DECIMAL(10,2) NOT NULL,
        in_stock BOOLEAN DEFAULT true,
        currency VARCHAR(10) DEFAULT 'TRY',
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_price_history_link ON price_history(affiliate_link_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_price_history_date ON price_history(recorded_at DESC)
    `);

    // ===== FAZ 4: B2B =====

    await queryRunner.query(`
      CREATE TABLE api_keys (
        api_key_id SERIAL PRIMARY KEY,
        company_name VARCHAR(100) NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        key_hash VARCHAR(64) NOT NULL UNIQUE,
        key_prefix VARCHAR(12) NOT NULL UNIQUE,
        allowed_endpoints TEXT,
        rate_limit_per_hour INT DEFAULT 1000,
        rate_limit_per_day INT DEFAULT 10000,
        total_requests BIGINT DEFAULT 0,
        last_request_at TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE webhooks (
        webhook_id SERIAL PRIMARY KEY,
        api_key_id INT NOT NULL REFERENCES api_keys(api_key_id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        events TEXT NOT NULL,
        secret_hash VARCHAR(64),
        is_active BOOLEAN DEFAULT true,
        failed_count INT DEFAULT 0,
        last_triggered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_webhooks_api_key ON webhooks(api_key_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS webhooks CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS api_keys CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS price_history CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS ingredient_interactions CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS supplement_ingredients CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS supplement_details CASCADE');
  }
}
