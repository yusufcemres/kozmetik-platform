import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz K — Blog + SEO + Medical Reviewer
 *
 * reviewers: tıbbi danışma kurulu (dermatolog, eczacı)
 * authors: içerik yazarları
 * blog_posts: MDX içerik + medical_reviewer_id + SEO meta
 * blog_post_products / blog_post_ingredients: M2M ilişkileri
 * ingredients.medical_reviewer_id: ingredient sayfaları için reviewer
 */
export class Blog1700000000014 implements MigrationInterface {
  name = 'Blog1700000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reviewers (
        reviewer_id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        title VARCHAR(150),
        credentials TEXT,
        specialty VARCHAR(120),
        bio TEXT,
        avatar_url VARCHAR(500),
        license_no VARCHAR(80),
        verified_at TIMESTAMP,
        public_slug VARCHAR(120) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS authors (
        author_id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        title VARCHAR(150),
        credentials TEXT,
        bio TEXT,
        avatar_url VARCHAR(500),
        public_slug VARCHAR(120) UNIQUE NOT NULL,
        is_staff BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        post_id SERIAL PRIMARY KEY,
        slug VARCHAR(200) UNIQUE NOT NULL,
        title VARCHAR(250) NOT NULL,
        excerpt TEXT,
        content_mdx TEXT NOT NULL,
        author_id INT REFERENCES authors(author_id) ON DELETE SET NULL,
        medical_reviewer_id INT REFERENCES reviewers(reviewer_id) ON DELETE SET NULL,
        category VARCHAR(60),
        tags TEXT[],
        reading_time_min INT,
        published_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'draft', -- draft | published | archived
        og_image_url VARCHAR(500),
        seo_meta JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at) WHERE status = 'published'`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS blog_post_products (
        post_id INT NOT NULL REFERENCES blog_posts(post_id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        sort_order INT DEFAULT 0,
        PRIMARY KEY (post_id, product_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS blog_post_ingredients (
        post_id INT NOT NULL REFERENCES blog_posts(post_id) ON DELETE CASCADE,
        ingredient_id INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, ingredient_id)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE ingredients
        ADD COLUMN IF NOT EXISTS medical_reviewer_id INT REFERENCES reviewers(reviewer_id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ingredients
        DROP COLUMN IF EXISTS last_reviewed_at,
        DROP COLUMN IF EXISTS medical_reviewer_id
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS blog_post_ingredients`);
    await queryRunner.query(`DROP TABLE IF EXISTS blog_post_products`);
    await queryRunner.query(`DROP TABLE IF EXISTS blog_posts`);
    await queryRunner.query(`DROP TABLE IF EXISTS authors`);
    await queryRunner.query(`DROP TABLE IF EXISTS reviewers`);
  }
}
