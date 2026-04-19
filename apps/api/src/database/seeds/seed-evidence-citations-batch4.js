/**
 * Evidence & Citation Seed — BATCH 4
 * For catalog expansion (Nutraxin/Voonka/Naturals Garden pilots).
 *
 * Two groups:
 *   NEW INSERT (3): ashwagandha, maca-root, ginkgo-biloba
 *   UPDATE (5 NULL-grade rows):
 *     iron-bisglycinate, magnesium-bisglycinate, marine-collagen,
 *     methylcobalamin, zinc-picolinate
 *
 * Run:  node seed-evidence-citations-batch4.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// NEW: botanical ingredients to INSERT
// ---------------------------------------------------------------------------
const NEW_INGREDIENTS = [
  {
    slug: 'ashwagandha',
    inci_name: 'Withania Somnifera Root Extract',
    common_name: 'Ashwagandha',
    ingredient_group: 'adaptogen',
    origin_type: 'natural',
    function_summary: 'Adaptogenic herb; reduces cortisol and stress biomarkers, improves sleep quality in RCTs.',
    domain_type: 'supplement',
    evidence_grade: 'B',
    effective_dose_min: 300, effective_dose_max: 600, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '31991080', doi: '10.7759/cureus.5797', title: 'Ashwagandha — efficacy and safety in chronic stress: an 8-week RCT', year: 2019 },
      { source: 'PubMed', pmid: '31728244', doi: '10.1177/2515690X19875174', title: 'Withania somnifera on sleep and mental alertness — RCT', year: 2019 },
      { source: 'Examine', url: 'https://examine.com/supplements/ashwagandha/' },
    ],
  },
  {
    slug: 'maca-root',
    inci_name: 'Lepidium Meyenii Root Extract',
    common_name: 'Maca Root',
    ingredient_group: 'adaptogen',
    origin_type: 'natural',
    function_summary: 'Andean root; associated with improved sexual well-being and mood in RCTs, evidence grade B.',
    domain_type: 'supplement',
    evidence_grade: 'B',
    effective_dose_min: 1500, effective_dose_max: 3000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '20579313', doi: '10.1002/ptr.3183', title: 'Maca (Lepidium meyenii) for improvement of sexual function — systematic review', year: 2010 },
      { source: 'PubMed', pmid: '26421049', doi: '10.3390/nu7115457', title: 'Maca root and reproductive health — updated review', year: 2015 },
      { source: 'Examine', url: 'https://examine.com/supplements/maca/' },
    ],
  },
  {
    slug: 'ginkgo-biloba',
    inci_name: 'Ginkgo Biloba Leaf Extract',
    common_name: 'Ginkgo Biloba',
    ingredient_group: 'cognitive',
    origin_type: 'natural',
    function_summary: 'Standardized leaf extract (EGb 761); modest effect on cognitive symptoms of dementia per Cochrane.',
    domain_type: 'supplement',
    evidence_grade: 'B',
    effective_dose_min: 120, effective_dose_max: 240, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '19160216', doi: '10.1002/14651858.CD003120.pub3', title: 'Ginkgo biloba for cognitive impairment and dementia — Cochrane review', year: 2009 },
      { source: 'NIH_NCCIH', url: 'https://www.nccih.nih.gov/health/ginkgo', accessed: '2026-04-19' },
      { source: 'EMA', url: 'https://www.ema.europa.eu/en/medicines/herbal/ginkgonis-folium', title: 'EMA community monograph — Ginkgo leaf dry extract' },
    ],
  },
];

// ---------------------------------------------------------------------------
// UPDATE: existing rows with NULL evidence_grade
// ---------------------------------------------------------------------------
const UPDATES = [
  {
    slug: 'iron-bisglycinate',
    evidence_grade: 'A',
    effective_dose_min: 14, effective_dose_max: 65, effective_dose_unit: 'mg', ul_dose: 45,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '25744411', doi: '10.1017/S0007114515000070', title: 'Iron bisglycinate bioavailability vs ferrous sulfate — systematic review', year: 2015 },
      { source: 'PubMed', pmid: '24932784', doi: '10.3945/ajcn.114.084319', title: 'Iron absorption from chelated iron — comparative study', year: 2014 },
    ],
  },
  {
    slug: 'magnesium-bisglycinate',
    evidence_grade: 'A',
    effective_dose_min: 310, effective_dose_max: 420, effective_dose_unit: 'mg', ul_dose: 350,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '28392498', doi: '10.3390/nu9080813', title: 'Magnesium — absorption and bioavailability of different forms', year: 2017 },
      { source: 'PubMed', pmid: '29679349', doi: '10.3390/nu10040384', title: 'Bisglycinate vs oxide magnesium — comparative bioavailability', year: 2018 },
    ],
  },
  {
    slug: 'marine-collagen',
    evidence_grade: 'B',
    effective_dose_min: 2500, effective_dose_max: 10000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '31627309', doi: '10.1111/jocd.13435', title: 'Oral collagen peptide supplementation for skin aging — meta-analysis of RCTs', year: 2019 },
      { source: 'PubMed', pmid: '30144789', doi: '10.1111/jocd.12729', title: 'Marine collagen peptides on skin hydration — RCT', year: 2018 },
    ],
  },
  {
    slug: 'methylcobalamin',
    evidence_grade: 'A',
    effective_dose_min: 500, effective_dose_max: 1000, effective_dose_unit: 'mcg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '18655403', doi: '10.1016/j.ejim.2008.02.003', title: 'Methylcobalamin vs cyanocobalamin — clinical comparison', year: 2008 },
      { source: 'PubMed', pmid: '23451874', doi: '10.3390/nu5020503', title: 'Vitamin B12 forms — bioavailability review', year: 2013 },
    ],
  },
  {
    slug: 'zinc-picolinate',
    evidence_grade: 'A',
    effective_dose_min: 8, effective_dose_max: 40, effective_dose_unit: 'mg', ul_dose: 40,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/', accessed: '2026-04-19' },
      { source: 'PubMed', pmid: '3630857', title: 'Comparative absorption of zinc picolinate, citrate and gluconate', year: 1987 },
      { source: 'PubMed', pmid: '31925443', doi: '10.3390/nu11010068', title: 'Zinc supplementation — updated evidence review', year: 2019 },
    ],
  },
];

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  let inserted = 0, updated = 0, skipped = 0;
  try {
    // Resync sequence first (in case of prior manual inserts)
    if (!DRY) {
      await client.query(`SELECT setval(pg_get_serial_sequence('ingredients','ingredient_id'), (SELECT MAX(ingredient_id) FROM ingredients))`);
    }

    // --- INSERT new ingredients ---
    for (const ing of NEW_INGREDIENTS) {
      const exists = await client.query(`SELECT ingredient_id FROM ingredients WHERE ingredient_slug = $1`, [ing.slug]);
      if (exists.rowCount > 0) {
        console.log(`  [SKIP EXISTS] ${ing.slug} → id=${exists.rows[0].ingredient_id}`);
        skipped++;
        continue;
      }
      if (DRY) { console.log(`  [DRY INSERT] ${ing.slug}`); continue; }
      const res = await client.query(
        `INSERT INTO ingredients
          (domain_type, inci_name, common_name, ingredient_slug, ingredient_group, origin_type,
           function_summary, evidence_grade, evidence_citations,
           effective_dose_min, effective_dose_max, effective_dose_unit, ul_dose, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,true)
         RETURNING ingredient_id`,
        [
          ing.domain_type, ing.inci_name, ing.common_name, ing.slug, ing.ingredient_group, ing.origin_type,
          ing.function_summary, ing.evidence_grade, JSON.stringify(ing.evidence_citations),
          ing.effective_dose_min, ing.effective_dose_max, ing.effective_dose_unit, ing.ul_dose,
        ],
      );
      console.log(`  [NEW] ${ing.slug} → id=${res.rows[0].ingredient_id} grade=${ing.evidence_grade}`);
      inserted++;
    }

    // --- UPDATE existing NULL-grade rows ---
    for (const u of UPDATES) {
      if (DRY) { console.log(`  [DRY UPDATE] ${u.slug} grade=${u.evidence_grade}`); continue; }
      const res = await client.query(
        `UPDATE ingredients
           SET evidence_grade = $1,
               evidence_citations = $2::jsonb,
               effective_dose_min = $3,
               effective_dose_max = $4,
               effective_dose_unit = $5,
               ul_dose = $6,
               updated_at = now()
         WHERE ingredient_slug = $7
         RETURNING ingredient_id, domain_type`,
        [u.evidence_grade, JSON.stringify(u.evidence_citations), u.effective_dose_min, u.effective_dose_max, u.effective_dose_unit, u.ul_dose, u.slug],
      );
      if (res.rowCount === 0) {
        console.log(`  [NOT FOUND] ${u.slug}`);
      } else {
        const row = res.rows[0];
        console.log(`  [UPD] ${u.slug} (id=${row.ingredient_id}, domain=${row.domain_type}) → grade=${u.evidence_grade}`);
        updated++;
      }
    }
  } finally {
    await client.end();
  }
  console.log(`\n=== Summary (batch 4) ===\n  inserted = ${inserted}\n  updated  = ${updated}\n  skipped  = ${skipped}\n  total planned = ${NEW_INGREDIENTS.length + UPDATES.length}`);
}

main().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
