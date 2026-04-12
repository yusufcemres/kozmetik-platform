import { MigrationInterface, QueryRunner } from 'typeorm';

export class Favorites1700000000007 implements MigrationInterface {
  name = 'Favorites1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        favorite_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_favorites_product ON user_favorites(product_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_favorites`);
  }
}
