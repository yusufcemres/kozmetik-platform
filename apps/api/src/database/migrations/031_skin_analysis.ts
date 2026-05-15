import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 031 — Foto analiz (cilt sağlığı) sonuç tablosu.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 1 ile eklendi.
 * Skor JSON + 6-boyut breakdown + opt-in foto saklama (KVKK biyometrik veri).
 */
export class SkinAnalysisResults1700000000031 implements MigrationInterface {
  name = 'SkinAnalysisResults1700000000031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS skin_analysis_results (
        analysis_id BIGSERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES app_users(user_id) ON DELETE CASCADE,
        anonymous_email VARCHAR(64),
        scores JSONB NOT NULL,
        overall_score SMALLINT NOT NULL,
        recommendations JSONB,
        guard_score SMALLINT,
        model_version VARCHAR(50) NOT NULL,
        photo_blob TEXT,
        ip VARCHAR(45),
        user_agent VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_skin_analysis_user_created
      ON skin_analysis_results(user_id, created_at DESC)
      WHERE user_id IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_skin_analysis_email_created
      ON skin_analysis_results(anonymous_email, created_at DESC)
      WHERE anonymous_email IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_skin_analysis_created
      ON skin_analysis_results(created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skin_analysis_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skin_analysis_email_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skin_analysis_user_created`);
    await queryRunner.query(`DROP TABLE IF EXISTS skin_analysis_results`);
  }
}
