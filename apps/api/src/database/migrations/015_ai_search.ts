import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz N — AI Sohbet Arama (MVP, shortcut-only)
 *
 * Launch için 30 intent static map yeterli. pgvector + Gemini rerank
 * Q3 2026'da kullanım verisi birikince eklenecek.
 */
export class AiSearch1700000000015 implements MigrationInterface {
  name = 'AiSearch1700000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ai_search_shortcuts (
        shortcut_id SERIAL PRIMARY KEY,
        intent_key VARCHAR(80) UNIQUE NOT NULL,
        keywords TEXT[] NOT NULL, -- "rozam var", "rozasea", "kuperoz"...
        title VARCHAR(200),
        description TEXT,
        product_ids INT[] DEFAULT '{}',
        ingredient_ids INT[] DEFAULT '{}',
        blog_post_ids INT[] DEFAULT '{}',
        caution TEXT,
        usage_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_shortcuts_intent ON ai_search_shortcuts(intent_key)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_shortcuts_keywords_gin ON ai_search_shortcuts USING gin (keywords)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ai_search_logs (
        log_id BIGSERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        matched_shortcut_id INT REFERENCES ai_search_shortcuts(shortcut_id) ON DELETE SET NULL,
        user_id INT REFERENCES app_users(user_id) ON DELETE SET NULL,
        session_id VARCHAR(80),
        ip VARCHAR(64),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_search_logs(created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_logs_shortcut ON ai_search_logs(matched_shortcut_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ai_search_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS ai_search_shortcuts`);
  }
}
