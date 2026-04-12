import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppUsersMagicLink1700000000004 implements MigrationInterface {
  name = 'AppUsersMagicLink1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(200) NOT NULL UNIQUE,
        display_name VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS magic_link_tokens (
        token_id SERIAL PRIMARY KEY,
        token_hash VARCHAR(128) NOT NULL UNIQUE,
        email VARCHAR(200) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        ip VARCHAR(64),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_magic_link_email ON magic_link_tokens(email)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_magic_link_expires ON magic_link_tokens(expires_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS magic_link_tokens`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_users`);
  }
}
