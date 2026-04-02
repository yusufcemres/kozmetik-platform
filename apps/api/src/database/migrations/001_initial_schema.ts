import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000001 implements MigrationInterface {
  name = 'InitialSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== METODOLOJI =====
    await queryRunner.query(`
      CREATE TABLE evidence_levels (
        evidence_level_id SERIAL PRIMARY KEY,
        level_key VARCHAR(50) UNIQUE NOT NULL,
        level_name VARCHAR(100) NOT NULL,
        description TEXT,
        rank_order INT NOT NULL,
        badge_color VARCHAR(20),
        badge_emoji VARCHAR(10),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE approved_wordings (
        wording_id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        approved_text TEXT NOT NULL,
        forbidden_alternative TEXT,
        usage_note TEXT,
        language VARCHAR(20) DEFAULT 'tr',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ===== TAXONOMY =====
    await queryRunner.query(`
      CREATE TABLE categories (
        category_id SERIAL PRIMARY KEY,
        parent_category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
        category_name VARCHAR(150) NOT NULL,
        category_slug VARCHAR(150) UNIQUE NOT NULL,
        domain_type VARCHAR(20) DEFAULT 'cosmetic',
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE brands (
        brand_id SERIAL PRIMARY KEY,
        brand_name VARCHAR(150) NOT NULL,
        brand_slug VARCHAR(150) UNIQUE NOT NULL,
        country_of_origin VARCHAR(100),
        website_url VARCHAR(500),
        logo_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE ingredients (
        ingredient_id SERIAL PRIMARY KEY,
        domain_type VARCHAR(20) DEFAULT 'cosmetic',
        inci_name VARCHAR(250) NOT NULL,
        common_name VARCHAR(250),
        ingredient_slug VARCHAR(250) UNIQUE NOT NULL,
        ingredient_group VARCHAR(100),
        origin_type VARCHAR(50),
        function_summary TEXT,
        detailed_description TEXT,
        sensitivity_note TEXT,
        allergen_flag BOOLEAN DEFAULT false,
        fragrance_flag BOOLEAN DEFAULT false,
        preservative_flag BOOLEAN DEFAULT false,
        evidence_level VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE ingredient_aliases (
        alias_id SERIAL PRIMARY KEY,
        ingredient_id INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
        alias_name VARCHAR(250) NOT NULL,
        language VARCHAR(20) DEFAULT 'tr',
        alias_type VARCHAR(50) DEFAULT 'common',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE ingredient_evidence_links (
        link_id SERIAL PRIMARY KEY,
        ingredient_id INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
        source_url VARCHAR(500) NOT NULL,
        source_title VARCHAR(250) NOT NULL,
        source_type VARCHAR(100),
        publication_year INT,
        summary_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE needs (
        need_id SERIAL PRIMARY KEY,
        domain_type VARCHAR(20) DEFAULT 'cosmetic',
        need_name VARCHAR(150) NOT NULL,
        need_slug VARCHAR(150) UNIQUE NOT NULL,
        need_group VARCHAR(100),
        short_description TEXT,
        detailed_description TEXT,
        user_friendly_label VARCHAR(200),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ===== ÜRÜN =====
    await queryRunner.query(`
      CREATE TABLE product_masters (
        master_id SERIAL PRIMARY KEY,
        brand_id INT NOT NULL REFERENCES brands(brand_id),
        category_id INT NOT NULL REFERENCES categories(category_id),
        master_name VARCHAR(250) NOT NULL,
        domain_type VARCHAR(20) DEFAULT 'cosmetic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_variants (
        variant_id SERIAL PRIMARY KEY,
        master_id INT NOT NULL REFERENCES product_masters(master_id) ON DELETE CASCADE,
        region VARCHAR(100),
        size_label VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE products (
        product_id SERIAL PRIMARY KEY,
        variant_id INT REFERENCES product_variants(variant_id) ON DELETE SET NULL,
        brand_id INT NOT NULL REFERENCES brands(brand_id),
        category_id INT NOT NULL REFERENCES categories(category_id),
        domain_type VARCHAR(20) DEFAULT 'cosmetic',
        product_name VARCHAR(300) NOT NULL,
        product_slug VARCHAR(300) UNIQUE NOT NULL,
        product_type_label VARCHAR(100),
        short_description TEXT,
        barcode VARCHAR(50),
        net_content_value DECIMAL(10,2),
        net_content_unit VARCHAR(20),
        target_area VARCHAR(100),
        usage_time_hint VARCHAR(50),
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_labels (
        product_label_id SERIAL PRIMARY KEY,
        product_id INT UNIQUE NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        inci_raw_text TEXT,
        ingredient_header_text VARCHAR(500),
        usage_instructions TEXT,
        warning_text TEXT,
        manufacturer_info TEXT,
        distributor_info TEXT,
        origin_info VARCHAR(200),
        batch_reference VARCHAR(100),
        expiry_info VARCHAR(100),
        pao_info VARCHAR(50),
        net_content_display VARCHAR(100),
        packaging_symbols_json JSONB,
        claim_texts_json JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_images (
        image_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        image_type VARCHAR(50) DEFAULT 'product',
        sort_order INT DEFAULT 0,
        alt_text VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE formula_revisions (
        revision_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        previous_inci_text TEXT NOT NULL,
        new_inci_text TEXT NOT NULL,
        change_summary TEXT,
        changed_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE affiliate_links (
        affiliate_link_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        affiliate_url VARCHAR(1000) NOT NULL,
        price_snapshot DECIMAL(10,2),
        price_updated_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, platform)
      )
    `);

    // ===== ENGINE =====
    await queryRunner.query(`
      CREATE TABLE product_ingredients (
        product_ingredient_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        ingredient_id INT REFERENCES ingredients(ingredient_id),
        ingredient_display_name VARCHAR(250) NOT NULL,
        inci_order_rank INT NOT NULL,
        listed_as_raw VARCHAR(250),
        concentration_band VARCHAR(20) DEFAULT 'unknown',
        is_below_one_percent_estimate BOOLEAN DEFAULT false,
        is_highlighted_in_claims BOOLEAN DEFAULT false,
        match_status VARCHAR(20) DEFAULT 'auto',
        match_confidence DECIMAL(4,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE ingredient_need_mappings (
        ingredient_need_mapping_id SERIAL PRIMARY KEY,
        ingredient_id INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
        need_id INT NOT NULL REFERENCES needs(need_id) ON DELETE CASCADE,
        relevance_score INT NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
        effect_type VARCHAR(50) NOT NULL,
        evidence_level VARCHAR(50),
        usage_context_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_need_scores (
        product_need_score_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        need_id INT NOT NULL REFERENCES needs(need_id) ON DELETE CASCADE,
        compatibility_score DECIMAL(5,2) NOT NULL,
        score_reason_summary TEXT,
        explanation_logic JSONB,
        confidence_level VARCHAR(20) DEFAULT 'medium',
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE scoring_configs (
        config_id SERIAL PRIMARY KEY,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value DECIMAL(5,3) NOT NULL,
        description VARCHAR(200),
        config_group VARCHAR(50) DEFAULT 'scoring',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ===== İÇERİK =====
    await queryRunner.query(`
      CREATE TABLE content_articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        slug VARCHAR(300) UNIQUE NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        summary TEXT,
        body_markdown TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_related_articles (
        product_related_article_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        article_id INT NOT NULL REFERENCES content_articles(article_id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE ingredient_related_articles (
        ingredient_related_article_id SERIAL PRIMARY KEY,
        ingredient_id INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
        article_id INT NOT NULL REFERENCES content_articles(article_id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE need_related_articles (
        need_related_article_id SERIAL PRIMARY KEY,
        need_id INT NOT NULL REFERENCES needs(need_id) ON DELETE CASCADE,
        article_id INT NOT NULL REFERENCES content_articles(article_id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE sponsorship_disclosures (
        disclosure_id SERIAL PRIMARY KEY,
        article_id INT NOT NULL REFERENCES content_articles(article_id) ON DELETE CASCADE,
        sponsor_name VARCHAR(200) NOT NULL,
        disclosure_level VARCHAR(20) NOT NULL,
        disclosure_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ===== ADMIN & SİSTEM =====
    await queryRunner.query(`
      CREATE TABLE admin_roles (
        role_id SERIAL PRIMARY KEY,
        role_key VARCHAR(50) UNIQUE NOT NULL,
        role_name VARCHAR(100) NOT NULL,
        description TEXT,
        permissions JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE admin_users (
        admin_user_id SERIAL PRIMARY KEY,
        email VARCHAR(200) UNIQUE NOT NULL,
        password_hash VARCHAR(250) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role_id INT NOT NULL REFERENCES admin_roles(role_id),
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE audit_logs (
        log_id SERIAL PRIMARY KEY,
        entity_type VARCHAR(100) NOT NULL,
        entity_id INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        changes JSONB,
        admin_user_id INT,
        admin_email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE user_corrections (
        correction_id SERIAL PRIMARY KEY,
        entity_type VARCHAR(100) NOT NULL,
        entity_id INT NOT NULL,
        correction_text TEXT NOT NULL,
        reporter_email VARCHAR(200),
        status VARCHAR(20) DEFAULT 'pending',
        admin_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE batch_imports (
        import_id SERIAL PRIMARY KEY,
        import_type VARCHAR(100) NOT NULL,
        file_name VARCHAR(500),
        total_rows INT DEFAULT 0,
        success_count INT DEFAULT 0,
        error_count INT DEFAULT 0,
        error_details JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        admin_user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE user_skin_profiles (
        profile_id SERIAL PRIMARY KEY,
        anonymous_id VARCHAR(100) UNIQUE NOT NULL,
        skin_type VARCHAR(20),
        concerns JSONB DEFAULT '[]',
        sensitivities JSONB DEFAULT '{}',
        age_range VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ===== INDEXES =====
    // Trigram indexes for fuzzy search
    await queryRunner.query(`CREATE INDEX idx_ingredient_aliases_trgm ON ingredient_aliases USING GIN (alias_name gin_trgm_ops)`);
    await queryRunner.query(`CREATE INDEX idx_ingredients_inci_trgm ON ingredients USING GIN (inci_name gin_trgm_ops)`);
    await queryRunner.query(`CREATE INDEX idx_ingredients_common_trgm ON ingredients USING GIN (common_name gin_trgm_ops)`);
    await queryRunner.query(`CREATE INDEX idx_products_name_trgm ON products USING GIN (product_name gin_trgm_ops)`);
    await queryRunner.query(`CREATE INDEX idx_needs_name_trgm ON needs USING GIN (need_name gin_trgm_ops)`);

    // FK indexes
    await queryRunner.query(`CREATE INDEX idx_products_brand ON products(brand_id)`);
    await queryRunner.query(`CREATE INDEX idx_products_category ON products(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_products_status ON products(status)`);
    await queryRunner.query(`CREATE INDEX idx_product_ingredients_product ON product_ingredients(product_id)`);
    await queryRunner.query(`CREATE INDEX idx_product_ingredients_ingredient ON product_ingredients(ingredient_id)`);
    await queryRunner.query(`CREATE INDEX idx_ingredient_need_mappings_ingredient ON ingredient_need_mappings(ingredient_id)`);
    await queryRunner.query(`CREATE INDEX idx_ingredient_need_mappings_need ON ingredient_need_mappings(need_id)`);
    await queryRunner.query(`CREATE INDEX idx_product_need_scores_product ON product_need_scores(product_id)`);
    await queryRunner.query(`CREATE INDEX idx_product_need_scores_need ON product_need_scores(need_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_created ON audit_logs(created_at)`);
    await queryRunner.query(`CREATE INDEX idx_content_articles_status ON content_articles(status)`);
    await queryRunner.query(`CREATE INDEX idx_content_articles_type ON content_articles(content_type)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'user_skin_profiles', 'batch_imports', 'user_corrections', 'audit_logs',
      'admin_users', 'admin_roles',
      'sponsorship_disclosures', 'need_related_articles', 'ingredient_related_articles',
      'product_related_articles', 'content_articles',
      'scoring_configs', 'product_need_scores', 'ingredient_need_mappings', 'product_ingredients',
      'affiliate_links', 'formula_revisions', 'product_images', 'product_labels',
      'products', 'product_variants', 'product_masters',
      'needs', 'ingredient_evidence_links', 'ingredient_aliases', 'ingredients',
      'brands', 'categories',
      'approved_wordings', 'evidence_levels',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
  }
}
