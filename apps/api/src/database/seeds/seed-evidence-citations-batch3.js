/**
 * Evidence & Citation Seed — BATCH 3: 11 ingredients used by REVELA's actual
 * supplement catalog but still missing evidence_grade.
 *
 * Context: Batch-1 populated generic slugs (magnesium, zinc, vitamin-d3).
 * REVELA's 12 supplement products link to specific form slugs instead
 * (magnesium-citrate, zinc-gluconate, cholecalciferol, etc.), so batch-1
 * never touched them. This batch closes that gap.
 *
 * Populates: evidence_grade, evidence_citations (JSONB),
 *            effective_dose_min, effective_dose_max, effective_dose_unit, ul_dose
 *
 * Run:  node seed-evidence-citations-batch3.js [--dry-run]
 *
 * Idempotent: UPDATE existing rows by ingredient_slug.
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// BATCH 3 — 11 ingredients used by Solgar/Dynavit supplement products
// ---------------------------------------------------------------------------

const INGREDIENTS = [
  // ── OMEGA-3 FORMS ─────────────────────────────────────────────────────────
  {
    slug: 'dha',
    evidence_grade: 'A',
    effective_dose_min: 250, effective_dose_max: 1000, effective_dose_unit: 'mg', ul_dose: 3000,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'EFSA', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/2815', title: 'EFSA scientific opinion on DHA dietary reference values', year: 2012 },
      { source: 'PubMed', pmid: '30103553', doi: '10.1002/14651858.CD003177.pub5', title: 'Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease — Cochrane', year: 2018 },
    ],
  },
  {
    slug: 'epa',
    evidence_grade: 'A',
    effective_dose_min: 250, effective_dose_max: 1000, effective_dose_unit: 'mg', ul_dose: 3000,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '31793284', doi: '10.1016/j.mayocp.2020.08.034', title: 'EPA and cardiovascular outcomes — meta-analysis of RCTs', year: 2021 },
      { source: 'PubMed', pmid: '30103553', doi: '10.1002/14651858.CD003177.pub5', title: 'Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease — Cochrane', year: 2018 },
    ],
  },
  {
    slug: 'fish-oil',
    evidence_grade: 'A',
    effective_dose_min: 1000, effective_dose_max: 4000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '30103553', doi: '10.1002/14651858.CD003177.pub5', title: 'Omega-3 fatty acids for cardiovascular disease — Cochrane review', year: 2018 },
      { source: 'PubMed', pmid: '28900017', doi: '10.1161/CIR.0000000000000482', title: 'Omega-3 PUFA for prevention of clinical cardiovascular disease — AHA Advisory', year: 2017 },
    ],
  },
  {
    slug: 'alpha-linolenic-acid',
    evidence_grade: 'B',
    effective_dose_min: 1100, effective_dose_max: 1600, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '22332096', doi: '10.1111/j.1365-2362.2011.02632.x', title: 'Alpha-linolenic acid and cardiovascular disease — meta-analysis', year: 2012 },
    ],
  },

  // ── PROBİYOTİK STRAIN'LER ─────────────────────────────────────────────────
  {
    slug: 'lactobacillus-acidophilus',
    // Probiotic doses expressed in billions of CFU (unit: B_CFU) to fit DECIMAL(10,2)
    evidence_grade: 'B',
    effective_dose_min: 1, effective_dose_max: 10, effective_dose_unit: 'B_CFU', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '30396155', doi: '10.3389/fmicb.2018.01953', title: 'Lactobacillus acidophilus — health benefits and mechanisms', year: 2018 },
      { source: 'PubMed', pmid: '30463527', doi: '10.3390/nu10111723', title: 'Probiotics for GI health — systematic review', year: 2018 },
      { source: 'WHO_FAO', url: 'https://www.who.int/foodsafety/publications/fs_management/en/probiotics.pdf', title: 'Guidelines for the Evaluation of Probiotics in Food', year: 2002 },
    ],
  },
  {
    slug: 'bifidobacterium-lactis',
    // Probiotic doses expressed in billions of CFU (unit: B_CFU) to fit DECIMAL(10,2)
    evidence_grade: 'B',
    effective_dose_min: 1, effective_dose_max: 10, effective_dose_unit: 'B_CFU', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '29324356', doi: '10.1017/S0007114517003749', title: 'Bifidobacterium animalis subsp. lactis — effects on gut immunity', year: 2018 },
      { source: 'PubMed', pmid: '25574151', doi: '10.1186/s12937-014-0095-y', title: 'B. lactis for constipation — meta-analysis', year: 2014 },
    ],
  },

  // ── VİTAMİN / MİNERAL SPESİFİK FORMLAR ───────────────────────────────────
  {
    slug: 'cholecalciferol',
    evidence_grade: 'A',
    effective_dose_min: 600, effective_dose_max: 2000, effective_dose_unit: 'IU', ul_dose: 4000,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '21646368', doi: '10.1210/jc.2011-0385', title: 'Endocrine Society clinical practice guideline on vitamin D', year: 2011 },
      { source: 'PubMed', pmid: '29083578', doi: '10.1136/bmj.j5435', title: 'Vitamin D supplementation to prevent acute respiratory infections — systematic review', year: 2017 },
    ],
  },
  {
    slug: 'magnesium-citrate',
    evidence_grade: 'A',
    effective_dose_min: 310, effective_dose_max: 420, effective_dose_unit: 'mg', ul_dose: 350,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '2407766', doi: '10.1007/BF01375617', title: 'Magnesium citrate bioavailability vs oxide — comparative PK', year: 1990 },
      { source: 'PubMed', pmid: '14596323', doi: '10.1291/hypres.26.531', title: 'Magnesium citrate vs placebo — RCT', year: 2003 },
    ],
  },
  {
    slug: 'zinc-gluconate',
    evidence_grade: 'A',
    effective_dose_min: 8, effective_dose_max: 40, effective_dose_unit: 'mg', ul_dose: 40,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'Cochrane', url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD001364.pub5', title: 'Zinc for the common cold — Cochrane review', year: 2015 },
      { source: 'PubMed', pmid: '28515951', doi: '10.3390/nu9060624', title: 'Zinc bioavailability — form comparison', year: 2017 },
    ],
  },

  // ── BOTANİK ÖZÜT / DİĞER ──────────────────────────────────────────────────
  {
    slug: 'curcuma-longa-extract',
    evidence_grade: 'B',
    effective_dose_min: 500, effective_dose_max: 2000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '27533649', doi: '10.1089/jmf.2016.3705', title: 'Curcumin for osteoarthritis — meta-analysis', year: 2016 },
      { source: 'PubMed', pmid: '31961765', doi: '10.1002/ptr.6552', title: 'Curcuma longa extract — systematic review of clinical trials', year: 2020 },
      { source: 'PubMed', pmid: '27213821', doi: '10.1016/j.phrs.2016.02.022', title: 'Piperine-enhanced curcumin bioavailability', year: 2016 },
    ],
  },
  {
    slug: 'hydrolyzed-collagen',
    evidence_grade: 'B',
    effective_dose_min: 2500, effective_dose_max: 10000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '31627309', doi: '10.3390/nu11102494', title: 'Oral collagen supplementation — systematic review (skin)', year: 2019 },
      { source: 'PubMed', pmid: '30681787', doi: '10.1089/jmf.2018.0022', title: 'Collagen peptides for joint pain — RCT meta-analysis', year: 2019 },
      { source: 'PubMed', pmid: '26345370', doi: '10.1159/000437203', title: 'Hydrolyzed collagen bioavailability and mechanism', year: 2015 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  const client = new Client({
    connectionString: DB_URL,
    ssl: DB_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  const stats = { updated: 0, not_found: 0, total: INGREDIENTS.length };
  const notFound = [];

  try {
    for (const ing of INGREDIENTS) {
      const { rows } = await client.query(
        `SELECT ingredient_id, ingredient_slug, common_name, domain_type FROM ingredients
         WHERE ingredient_slug = $1 LIMIT 1`,
        [ing.slug],
      );

      if (!rows.length) {
        stats.not_found++;
        notFound.push(ing.slug);
        console.log(`  [NOT FOUND] ${ing.slug}`);
        continue;
      }

      const row = rows[0];

      if (DRY) {
        console.log(`  [DRY] would update ${ing.slug} (id=${row.ingredient_id}, domain=${row.domain_type}) → grade=${ing.evidence_grade}, dose=${ing.effective_dose_min}-${ing.effective_dose_max} ${ing.effective_dose_unit}, UL=${ing.ul_dose ?? 'N/A'}`);
        stats.updated++;
        continue;
      }

      await client.query(
        `UPDATE ingredients SET
           evidence_grade       = $1,
           evidence_citations   = $2,
           effective_dose_min   = $3,
           effective_dose_max   = $4,
           effective_dose_unit  = $5,
           ul_dose              = $6
         WHERE ingredient_id = $7`,
        [
          ing.evidence_grade,
          JSON.stringify(ing.evidence_citations),
          ing.effective_dose_min,
          ing.effective_dose_max,
          ing.effective_dose_unit,
          ing.ul_dose,
          row.ingredient_id,
        ],
      );

      stats.updated++;
      console.log(`  [OK] ${ing.slug} (id=${row.ingredient_id}, domain=${row.domain_type}) → grade=${ing.evidence_grade}`);
    }

    console.log('\n=== Summary (batch 3) ===');
    console.log(`  updated   = ${stats.updated}`);
    console.log(`  not_found = ${stats.not_found}`);
    console.log(`  total     = ${stats.total}`);
    if (notFound.length) {
      console.log('\n  Not found slugs:');
      notFound.forEach((s) => console.log(`    - ${s}`));
    }
    if (DRY) console.log('\n  [DRY RUN] No changes persisted.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
