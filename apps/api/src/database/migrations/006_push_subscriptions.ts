import { MigrationInterface, QueryRunner } from 'typeorm';

export class PushSubscriptions1700000000006 implements MigrationInterface {
  name = 'PushSubscriptions1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        subscription_id SERIAL PRIMARY KEY,
        user_id INT,
        endpoint VARCHAR(500) NOT NULL UNIQUE,
        p256dh VARCHAR(200) NOT NULL,
        auth VARCHAR(100) NOT NULL,
        user_agent VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        last_notified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id) WHERE user_id IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_push_active ON push_subscriptions(is_active) WHERE is_active = TRUE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS push_subscriptions`);
  }
}
