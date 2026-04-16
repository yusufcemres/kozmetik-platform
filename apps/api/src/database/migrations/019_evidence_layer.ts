import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MODÜL 0 — Kanıt Temelli Skorlama Altyapısı
 *
 * ingredients tablosuna:
 *  - evidence_grade (A-E): Sistematik derleme → uzman görüşü hiyerarşisi
 *  - evidence_citations JSONB: [{source, url, pmid?, doi?, title?, year?}]
 *  - Takviye dozaj: effective_dose_min/max, effective_dose_unit, ul_dose
 *  - Kozmetik konsantrasyon: efficacy_conc_min/max, eu_annex_iii_limit
 *  - Regülasyon: cir_status, sccs_opinion_ref, cmr_class, iarc_group,
 *                endocrine_flag, eu_banned, eu_restricted
 *
 * ingredient_interactions tablosuna:
 *  - citation_source, citation_url, evidence_level
 *
 * Yeni tablo: product_scores — skor cache + history
 */
export class EvidenceLayer1700000000019 implements MigrationInterface {
  name = 'EvidenceLayer1700000000019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── ingredients: kanıt katmanı ──────────────────────────────
    await queryRunner.query(`
      ALTER TABLE ingredients
        ADD COLUMN IF NOT EXISTS evidence_grade VARCHAR(1)
          CHECK (evidence_grade IN ('A','B','C','D','E')),
        ADD COLUMN IF NOT EXISTS evidence_citations JSONB,

        -- Takviye dozaj kanıtı
        ADD COLUMN IF NOT EXISTS effective_dose_min DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS effective_dose_max DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS effective_dose_unit VARCHAR(10),
        ADD COLUMN IF NOT EXISTS ul_dose DECIMAL(10,2),

        -- Kozmetik konsantrasyon kanıtı
        ADD COLUMN IF NOT EXISTS efficacy_conc_min DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS efficacy_conc_max DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS eu_annex_iii_limit DECIMAL(5,2),

        -- Regülasyon durumu (kozmetik)
        ADD COLUMN IF NOT EXISTS cir_status VARCHAR(30),
        ADD COLUMN IF NOT EXISTS sccs_opinion_ref VARCHAR(50),
        ADD COLUMN IF NOT EXISTS cmr_class VARCHAR(10),
        ADD COLUMN IF NOT EXISTS iarc_group VARCHAR(5),
        ADD COLUMN IF NOT EXISTS endocrine_flag BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS eu_banned BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS eu_restricted BOOLEAN DEFAULT false
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_evidence_grade
        ON ingredients(evidence_grade) WHERE evidence_grade IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_eu_banned
        ON ingredients(eu_banned) WHERE eu_banned = true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_cmr
        ON ingredients(cmr_class) WHERE cmr_class IS NOT NULL
    `);

    // ── ingredient_interactions: atıf alanları ──────────────────
    await queryRunner.query(`
      ALTER TABLE ingredient_interactions
        ADD COLUMN IF NOT EXISTS citation_source VARCHAR(100),
        ADD COLUMN IF NOT EXISTS citation_url TEXT,
        ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(1)
          CHECK (evidence_level IN ('A','B','C','D'))
    `);

    // ── product_scores: skor cache + history ────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_scores (
        score_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        algorithm_version VARCHAR(20) NOT NULL,
        overall_score SMALLINT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
        grade VARCHAR(1) NOT NULL CHECK (grade IN ('A','B','C','D','F')),
        breakdown JSONB NOT NULL,
        explanation JSONB NOT NULL,
        flags JSONB,
        floor_cap_applied VARCHAR(30),
        computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (product_id, algorithm_version)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_scores_product
        ON product_scores(product_id)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_scores_version
        ON product_scores(algorithm_version)
    `);

    // ── certification_types: yeni supplement + kozmetik tipleri ──
    await queryRunner.query(`
      INSERT INTO certification_types (cert_code, name_tr, category, legal_risk, note)
      VALUES
        ('USP_VERIFIED', 'USP Verified', 'supplement', false, 'United States Pharmacopeia doğrulaması'),
        ('NSF_CERTIFIED', 'NSF Certified', 'supplement', false, 'NSF International sertifikası'),
        ('NSF_SPORT', 'NSF Certified for Sport', 'supplement', false, 'NSF spor takviyesi sertifikası'),
        ('CONSUMERLAB_PASS', 'ConsumerLab Approved', 'supplement', false, 'ConsumerLab bağımsız test geçişi'),
        ('LABDOOR_A', 'Labdoor A Grade', 'supplement', false, 'Labdoor A notu'),
        ('INFORMED_SPORT', 'Informed Sport', 'supplement', false, 'LGC Informed Sport anti-doping'),
        ('PHARMA_GRADE', 'Pharmaceutical Grade', 'supplement', false, 'İlaç kalitesi üretim standardı'),
        ('ECOCERT', 'Ecocert', 'cosmetic', false, 'Ecocert organik/doğal sertifikası'),
        ('COSMOS_ORGANIC', 'COSMOS Organic', 'cosmetic', false, 'COSMOS organik standardı'),
        ('COSMOS_NATURAL', 'COSMOS Natural', 'cosmetic', false, 'COSMOS doğal standardı'),
        ('VEGAN_SOCIETY', 'Vegan Society', 'cosmetic', false, 'The Vegan Society onaylı'),
        ('LEAPING_BUNNY', 'Leaping Bunny', 'cosmetic', false, 'CCIC hayvan deneysiz sertifikası'),
        ('PETA_CRUELTY_FREE', 'PETA Cruelty-Free', 'cosmetic', false, 'PETA hayvan deneysiz listesi'),
        ('DERMA_TESTED', 'Dermatologically Tested', 'cosmetic', true, 'Dermatolojik test — standart yok'),
        ('HYPOALLERGENIC', 'Hypoallergenic Tested', 'cosmetic', true, 'Hipoalerjenik test — yasal tanım yok')
      ON CONFLICT (cert_code) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_scores`);

    await queryRunner.query(`
      ALTER TABLE ingredient_interactions
        DROP COLUMN IF EXISTS evidence_level,
        DROP COLUMN IF EXISTS citation_url,
        DROP COLUMN IF EXISTS citation_source
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_cmr`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_eu_banned`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ingredients_evidence_grade`);

    await queryRunner.query(`
      ALTER TABLE ingredients
        DROP COLUMN IF EXISTS eu_restricted,
        DROP COLUMN IF EXISTS eu_banned,
        DROP COLUMN IF EXISTS endocrine_flag,
        DROP COLUMN IF EXISTS iarc_group,
        DROP COLUMN IF EXISTS cmr_class,
        DROP COLUMN IF EXISTS sccs_opinion_ref,
        DROP COLUMN IF EXISTS cir_status,
        DROP COLUMN IF EXISTS eu_annex_iii_limit,
        DROP COLUMN IF EXISTS efficacy_conc_max,
        DROP COLUMN IF EXISTS efficacy_conc_min,
        DROP COLUMN IF EXISTS ul_dose,
        DROP COLUMN IF EXISTS effective_dose_unit,
        DROP COLUMN IF EXISTS effective_dose_max,
        DROP COLUMN IF EXISTS effective_dose_min,
        DROP COLUMN IF EXISTS evidence_citations,
        DROP COLUMN IF EXISTS evidence_grade
    `);

    await queryRunner.query(`
      DELETE FROM certification_types WHERE cert_code IN (
        'USP_VERIFIED','NSF_CERTIFIED','NSF_SPORT','CONSUMERLAB_PASS',
        'LABDOOR_A','INFORMED_SPORT','PHARMA_GRADE',
        'ECOCERT','COSMOS_ORGANIC','COSMOS_NATURAL','VEGAN_SOCIETY',
        'LEAPING_BUNNY','PETA_CRUELTY_FREE','DERMA_TESTED','HYPOALLERGENIC'
      )
    `);
  }
}
