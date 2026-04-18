/**
 * Neon DB üzerinde 019 + 020 migration'larını doğrudan SQL ile uygular
 * ve migrations tablosuna işler. 016 (affiliate_tracking) bu DB'de ters sırada
 * uygulandığından atlanıyor — mevcut affiliate_clicks tablosu farklı şema ile
 * zaten var; bu scope dışında.
 */
const { Client } = require('pg');

async function runMigration(client, name, timestamp, sqlChunks) {
  const check = await client.query('SELECT 1 FROM migrations WHERE name = $1', [name]);
  if (check.rowCount > 0) {
    console.log(`skip ${name} (already applied)`);
    return;
  }
  console.log(`applying ${name}...`);
  await client.query('BEGIN');
  try {
    for (const chunk of sqlChunks) {
      await client.query(chunk);
    }
    await client.query(
      'INSERT INTO migrations (timestamp, name) VALUES ($1, $2)',
      [timestamp, name],
    );
    await client.query('COMMIT');
    console.log(`  ok ${name}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

async function main() {
  const client = new Client({
    host: 'ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech',
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_0KZrPGQxqH5d',
    database: 'neondb',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // ── 019 EvidenceLayer ──────────────────────────────────────────
    await runMigration(
      client,
      'EvidenceLayer1700000000019',
      1700000000019,
      [
        `ALTER TABLE ingredients
           ADD COLUMN IF NOT EXISTS evidence_grade VARCHAR(1)
             CHECK (evidence_grade IN ('A','B','C','D','E')),
           ADD COLUMN IF NOT EXISTS evidence_citations JSONB,
           ADD COLUMN IF NOT EXISTS effective_dose_min DECIMAL(10,2),
           ADD COLUMN IF NOT EXISTS effective_dose_max DECIMAL(10,2),
           ADD COLUMN IF NOT EXISTS effective_dose_unit VARCHAR(10),
           ADD COLUMN IF NOT EXISTS ul_dose DECIMAL(10,2),
           ADD COLUMN IF NOT EXISTS efficacy_conc_min DECIMAL(5,2),
           ADD COLUMN IF NOT EXISTS efficacy_conc_max DECIMAL(5,2),
           ADD COLUMN IF NOT EXISTS eu_annex_iii_limit DECIMAL(5,2),
           ADD COLUMN IF NOT EXISTS cir_status VARCHAR(30),
           ADD COLUMN IF NOT EXISTS sccs_opinion_ref VARCHAR(50),
           ADD COLUMN IF NOT EXISTS cmr_class VARCHAR(10),
           ADD COLUMN IF NOT EXISTS iarc_group VARCHAR(5),
           ADD COLUMN IF NOT EXISTS endocrine_flag BOOLEAN DEFAULT false,
           ADD COLUMN IF NOT EXISTS eu_banned BOOLEAN DEFAULT false,
           ADD COLUMN IF NOT EXISTS eu_restricted BOOLEAN DEFAULT false`,
        `CREATE INDEX IF NOT EXISTS idx_ingredients_evidence_grade
           ON ingredients(evidence_grade) WHERE evidence_grade IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_ingredients_eu_banned
           ON ingredients(eu_banned) WHERE eu_banned = true`,
        `CREATE INDEX IF NOT EXISTS idx_ingredients_cmr
           ON ingredients(cmr_class) WHERE cmr_class IS NOT NULL`,
        `ALTER TABLE ingredient_interactions
           ADD COLUMN IF NOT EXISTS citation_source VARCHAR(100),
           ADD COLUMN IF NOT EXISTS citation_url TEXT,
           ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(1)
             CHECK (evidence_level IN ('A','B','C','D'))`,
        `CREATE TABLE IF NOT EXISTS product_scores (
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
         )`,
        `CREATE INDEX IF NOT EXISTS idx_product_scores_product ON product_scores(product_id)`,
        `CREATE INDEX IF NOT EXISTS idx_product_scores_version ON product_scores(algorithm_version)`,
        `INSERT INTO certification_types (cert_code, name_tr, category, legal_risk, note)
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
         ON CONFLICT (cert_code) DO NOTHING`,
      ],
    );

    // ── 020 ProductConcentration ───────────────────────────────────
    await runMigration(
      client,
      'ProductConcentration1700000000020',
      1700000000020,
      [
        `ALTER TABLE product_ingredients
           ADD COLUMN IF NOT EXISTS concentration_percent DECIMAL(5,2),
           ADD COLUMN IF NOT EXISTS concentration_source VARCHAR(20)
             CHECK (concentration_source IN ('manufacturer','estimated','unknown'))`,
      ],
    );

    console.log('\nDone.');
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
