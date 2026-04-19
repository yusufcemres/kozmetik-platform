import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * V2.B.12 — Product reviews + ratings.
 *
 * One row per (user, product) — a user can have at most one active review
 * per product (uniqueness enforced at DB level, not just API). Rating is
 * 1-5 integer, body/title optional (empty star-only reviews are valid —
 * they still contribute to AggregateRating).
 *
 * `status` column keeps moderation affordance open ('visible' | 'hidden' |
 * 'pending'). MVP treats everything as 'visible' on insert; moderation
 * surface lands in a later iteration (admin UI).
 *
 * denormalized `helpful_count` gets incremented/decremented by a separate
 * reaction endpoint. Kept in-row for cheap ORDER BY — would migrate to a
 * side-table only if we introduce per-user reactions history.
 */
export class ProductReviews1700000000024 implements MigrationInterface {
  name = 'ProductReviews1700000000024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        review_id       SERIAL PRIMARY KEY,
        product_id      INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        user_id         INTEGER NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
        rating          SMALLINT NOT NULL,
        title           VARCHAR(200),
        body            TEXT,
        status          VARCHAR(20) NOT NULL DEFAULT 'visible',
        helpful_count   INTEGER NOT NULL DEFAULT 0,
        verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      ALTER TABLE product_reviews
        DROP CONSTRAINT IF EXISTS product_reviews_rating_check
    `);
    await queryRunner.query(`
      ALTER TABLE product_reviews
        ADD CONSTRAINT product_reviews_rating_check
        CHECK (rating BETWEEN 1 AND 5)
    `);
    await queryRunner.query(`
      ALTER TABLE product_reviews
        DROP CONSTRAINT IF EXISTS product_reviews_status_check
    `);
    await queryRunner.query(`
      ALTER TABLE product_reviews
        ADD CONSTRAINT product_reviews_status_check
        CHECK (status IN ('visible','hidden','pending'))
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_product_reviews_user_product
        ON product_reviews (user_id, product_id)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_reviews_product_status
        ON product_reviews (product_id, status, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_reviews_user
        ON product_reviews (user_id, created_at DESC)
    `);
    await queryRunner.query(`
      COMMENT ON TABLE product_reviews IS
        'User star ratings + free-text reviews. One row per (user,product). Powers AggregateRating JSON-LD.'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_reviews_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_reviews_product_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_product_reviews_user_product`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_reviews`);
  }
}
