import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Sprint 5 (#14) — Tartışmalı içerikler için güvenlik narrative'i.
 *
 * `ingredients` tablosuna 2 yeni alan:
 *  - `safety_narrative TEXT` — markdown formatında: neden tartışmalı,
 *    regülasyon durumu, kanıt özeti. İçerik detay sayfasında
 *    "Güvenlik & Tartışma" bölümünde render edilir.
 *  - `controversy_summary TEXT` — 1-2 cümlelik özet; kart önizlemelerinde
 *    kullanılır ("Bu içerik neden TARTIŞMALI etiketi aldı?" için).
 */
export class IngredientSafetyNarrative1700000000027 implements MigrationInterface {
  name = 'IngredientSafetyNarrative1700000000027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ingredients
        ADD COLUMN IF NOT EXISTS safety_narrative TEXT,
        ADD COLUMN IF NOT EXISTS controversy_summary TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ingredients
        DROP COLUMN IF EXISTS controversy_summary,
        DROP COLUMN IF EXISTS safety_narrative
    `);
  }
}
