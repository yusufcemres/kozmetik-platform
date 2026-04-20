import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Prod DB drift fix — migration 004 registered `display_name` on the
 * `app_users` entity but the column is missing in prod (the table was
 * likely created via `synchronize: true` in an earlier era, so migration
 * 004 was never executed against this database). Idempotent ADD COLUMN
 * IF NOT EXISTS restores parity so the reviews list query
 * (`u.display_name AS user_display_name`) stops 500-ing.
 */
export class AppUsersDisplayNameEnsure1700000000025 implements MigrationInterface {
  name = 'AppUsersDisplayNameEnsure1700000000025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE app_users
        ADD COLUMN IF NOT EXISTS display_name VARCHAR(100)
    `);
  }

  public async down(): Promise<void> {
    // No-op — never drop a column that may hold user-entered data.
  }
}
