import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Faz C1 — Sertifika DB (manuel kurasyon)
 *
 * brand_certifications: Leaping Bunny, PETA, Vegan Society, Ecocert, GIMDES...
 * Yıllık 1x manuel güncelleme. Kaynak: seeds/certifications.json
 */
export class BrandCertifications1700000000017 implements MigrationInterface {
  name = 'BrandCertifications1700000000017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS certification_types (
        cert_code VARCHAR(60) PRIMARY KEY,
        name_tr VARCHAR(150) NOT NULL,
        category VARCHAR(40) NOT NULL,
        legal_risk BOOLEAN DEFAULT true,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS brand_certifications (
        brand_cert_id SERIAL PRIMARY KEY,
        brand_id INT NOT NULL REFERENCES brands(brand_id) ON DELETE CASCADE,
        cert_code VARCHAR(60) NOT NULL REFERENCES certification_types(cert_code) ON DELETE CASCADE,
        source_url VARCHAR(500),
        verified_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        UNIQUE (brand_id, cert_code)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_brand_certs_brand ON brand_certifications(brand_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_brand_certs_code ON brand_certifications(cert_code)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS brand_certifications`);
    await queryRunner.query(`DROP TABLE IF EXISTS certification_types`);
  }
}
