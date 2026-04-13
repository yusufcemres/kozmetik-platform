import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz J — Derinleştirilmiş Quiz + Kişiselleştirme (v1)
 *
 * user_profiles: her app_user için çok-boyutlu profil (quiz'ten türetilir)
 * quiz_sessions: her testin ham cevapları + profil snapshot (retest için)
 */
export class UserProfilesExtended1700000000013 implements MigrationInterface {
  name = 'UserProfilesExtended1700000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        profile_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE REFERENCES app_users(user_id) ON DELETE CASCADE,
        skin_type_detailed VARCHAR(40), -- yağlı | kuru | karma | hassas | normal | karma_yağlı | karma_kuru
        skin_concerns TEXT[], -- akne, leke, rozasea, kırışıklık, gözenek, donukluk...
        allergy_ingredient_ids INT[], -- ingredient_id referansı
        pregnancy_status VARCHAR(30), -- none | pregnant | breastfeeding | trying
        age_group VARCHAR(20), -- under_20 | 20s | 30s | 40s | 50_plus
        climate_preference VARCHAR(30), -- dry_hot | dry_cold | humid_hot | humid_cold | temperate
        budget_tier VARCHAR(20), -- economic | mid | premium
        ethical_preferences JSONB DEFAULT '{}'::jsonb, -- { vegan, cruelty_free, halal }
        routine_complexity VARCHAR(20), -- minimal | moderate | extensive
        hair_type VARCHAR(40),
        supplement_goals TEXT[], -- uyku, stres, enerji, sindirim, immün
        last_quiz_at TIMESTAMP,
        quiz_version VARCHAR(10) DEFAULT 'v1',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS quiz_sessions (
        session_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES app_users(user_id) ON DELETE SET NULL,
        anonymous_key VARCHAR(80), -- login'siz kullanıcı için session_id
        quiz_version VARCHAR(10) NOT NULL,
        raw_answers JSONB NOT NULL,
        profile_snapshot JSONB NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS quiz_sessions`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_profiles`);
  }
}
