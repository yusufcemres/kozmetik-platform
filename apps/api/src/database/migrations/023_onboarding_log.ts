import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * V2.A.7 — Onboarding telemetry.
 *
 * One row per pipeline invocation. Captures whether the run succeeded,
 * which stage blew up (if any), how long it took, and the flags used.
 * Goal is to spot regressions and speed loss over time without trawling
 * through stdout logs — a weekly glance at `onboarding_log` should be
 * enough to see that Stage 2 (product-research) is newly flaky or that
 * Stage 5 (vercel-qa) is timing out more often.
 *
 * product_id is nullable because failures before Stage 3 don't have one
 * yet; product_slug captures what the doc *would* have been so we can
 * correlate failed runs to their queue JSON.
 */
export class OnboardingLog1700000000023 implements MigrationInterface {
  name = 'OnboardingLog1700000000023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS onboarding_log (
        log_id         SERIAL PRIMARY KEY,
        product_id     INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
        product_slug   VARCHAR(255),
        started_at     TIMESTAMPTZ NOT NULL,
        completed_at   TIMESTAMPTZ,
        duration_ms    INTEGER,
        status         VARCHAR(20) NOT NULL,
        failed_stage   VARCHAR(50),
        error_message  TEXT,
        warnings       JSONB,
        flags          JSONB,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      ALTER TABLE onboarding_log
        DROP CONSTRAINT IF EXISTS onboarding_log_status_check
    `);
    await queryRunner.query(`
      ALTER TABLE onboarding_log
        ADD CONSTRAINT onboarding_log_status_check
        CHECK (status IN ('success','failed','dry_run'))
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_onboarding_log_started_at
        ON onboarding_log (started_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_onboarding_log_status
        ON onboarding_log (status, started_at DESC)
    `);
    await queryRunner.query(`
      COMMENT ON TABLE onboarding_log IS
        'One row per onboard-supplement.ts run. Tracks duration, status, failed stage, warnings.'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_onboarding_log_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_onboarding_log_started_at`);
    await queryRunner.query(`DROP TABLE IF EXISTS onboarding_log`);
  }
}
