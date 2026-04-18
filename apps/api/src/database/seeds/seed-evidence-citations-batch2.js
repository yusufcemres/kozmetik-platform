/**
 * Evidence & Citation Seed — BATCH 2: 32 additional supplement ingredients
 *
 * Birinci tur (seed-evidence-citations.js) 51 kritik vitamin/mineral/form'u
 * kapsıyordu. Bu batch REVELA ürün kataloğunda sık görülen ama evidence_grade
 * kolonu NULL olan ingredient'ları hedefliyor (yağlar, bitkisel ekstraktlar,
 * amino asitler, botanik takviyeler).
 *
 * Populates: evidence_grade, evidence_citations (JSONB),
 *            effective_dose_min, effective_dose_max, effective_dose_unit, ul_dose
 *
 * Sources: NIH Office of Dietary Supplements (ODS) factsheets, PubMed RCT/meta
 *
 * Run:  node seed-evidence-citations-batch2.js [--dry-run]
 *
 * Idempotent: UPDATE existing rows by ingredient_slug. NOT FOUND loglu.
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// BATCH 2 — 32 supplements (NIH ODS + PubMed RCT citations)
// ---------------------------------------------------------------------------

const INGREDIENTS = [
  // ── YAĞLAR (OILS) ────────────────────────────────────────────────────────
  {
    slug: 'flaxseed-oil',
    evidence_grade: 'B',
    effective_dose_min: 1000, effective_dose_max: 3000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/', accessed: '2026-04-18' },
      { source: 'PubMed', pmid: '25369925', doi: '10.1139/apnm-2014-0205', title: 'Flaxseed oil and cardiovascular risk factors', year: 2014 },
      { source: 'PubMed', pmid: '19145965', doi: '10.1038/sj.ejcn.1602840', title: 'ALA from flaxseed — a meta-analysis', year: 2009 },
    ],
  },
  {
    slug: 'evening-primrose-oil',
    evidence_grade: 'C',
    effective_dose_min: 500, effective_dose_max: 3000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '23625331', doi: '10.2147/IJWH.S41546', title: 'Evening primrose oil for premenstrual syndrome', year: 2013 },
      { source: 'Cochrane', url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004416.pub2', title: 'Evening primrose oil for atopic eczema', year: 2013 },
    ],
  },
  {
    slug: 'black-seed-oil',
    evidence_grade: 'C',
    effective_dose_min: 500, effective_dose_max: 2000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '29575385', doi: '10.3892/etm.2018.5829', title: 'Nigella sativa — therapeutic potential', year: 2018 },
    ],
  },
  {
    slug: 'krill-oil',
    evidence_grade: 'B',
    effective_dose_min: 1000, effective_dose_max: 3000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '25373312', doi: '10.1186/1476-511X-13-132', title: 'Krill oil vs fish oil EPA/DHA bioavailability', year: 2014 },
    ],
  },

  // ── AMINO ASİTLER ────────────────────────────────────────────────────────
  {
    slug: 'l-theanine',
    evidence_grade: 'B',
    effective_dose_min: 100, effective_dose_max: 400, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '31758301', doi: '10.3390/nu11102362', title: 'L-theanine for stress and cognition — systematic review', year: 2019 },
    ],
  },
  {
    slug: 'l-tyrosine',
    evidence_grade: 'C',
    effective_dose_min: 500, effective_dose_max: 2000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '26424423', doi: '10.1016/j.jpsychires.2015.08.014', title: 'Tyrosine supplementation under stress', year: 2015 },
    ],
  },
  {
    slug: 'glycine',
    evidence_grade: 'C',
    effective_dose_min: 3000, effective_dose_max: 5000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '22551743', doi: '10.1186/1475-2891-11-40', title: 'Glycine improves sleep quality', year: 2012 },
    ],
  },
  {
    slug: 'beta-alanine',
    evidence_grade: 'A',
    effective_dose_min: 3200, effective_dose_max: 6400, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '25739527', doi: '10.1007/s00726-015-1958-5', title: 'ISSN position: beta-alanine for exercise performance', year: 2015 },
    ],
  },

  // ── EKLEM / KEMİK ───────────────────────────────────────────────────────
  {
    slug: 'glucosamine-sulfate',
    evidence_grade: 'B',
    effective_dose_min: 1500, effective_dose_max: 1500, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'Cochrane', url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD002946.pub2', title: 'Glucosamine for osteoarthritis', year: 2005 },
      { source: 'PubMed', pmid: '22563548', doi: '10.1002/art.34516', title: 'Glucosamine sulfate for knee OA — 6-month RCT', year: 2012 },
    ],
  },
  {
    slug: 'msm',
    evidence_grade: 'C',
    effective_dose_min: 1500, effective_dose_max: 6000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '16309928', doi: '10.1016/j.joca.2005.08.006', title: 'MSM for knee osteoarthritis', year: 2006 },
    ],
  },
  {
    slug: 'hyaluronic-acid',
    evidence_grade: 'B',
    effective_dose_min: 120, effective_dose_max: 240, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '25431884', doi: '10.2147/CIA.S72567', title: 'Oral hyaluronic acid for skin and joints', year: 2014 },
    ],
  },
  {
    slug: 'boswellia',
    evidence_grade: 'B',
    effective_dose_min: 300, effective_dose_max: 1200, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '18667054', doi: '10.1007/s10067-008-0953-6', title: 'Boswellia serrata for osteoarthritis', year: 2008 },
    ],
  },

  // ── BOTANİKLER (HERBS) ──────────────────────────────────────────────────
  {
    slug: 'green-tea-extract',
    evidence_grade: 'B',
    effective_dose_min: 250, effective_dose_max: 500, effective_dose_unit: 'mg', ul_dose: 800,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/GreenTea-HealthProfessional/', accessed: '2026-04-18' },
      { source: 'PubMed', pmid: '27164788', doi: '10.3945/ajcn.115.125278', title: 'Green tea catechins — meta-analysis of weight loss', year: 2016 },
    ],
  },
  {
    slug: 'ginger-root-extract',
    evidence_grade: 'B',
    effective_dose_min: 500, effective_dose_max: 2000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '24903154', doi: '10.1016/j.nut.2014.04.001', title: 'Ginger for nausea and pain — systematic review', year: 2014 },
    ],
  },
  {
    slug: 'garlic-extract',
    evidence_grade: 'B',
    effective_dose_min: 300, effective_dose_max: 1200, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Garlic-HealthProfessional/', accessed: '2026-04-18' },
      { source: 'PubMed', pmid: '27555818', doi: '10.1016/j.jnutbio.2016.06.010', title: 'Aged garlic extract for cardiovascular risk — meta-analysis', year: 2016 },
    ],
  },
  {
    slug: 'echinacea-purpurea',
    evidence_grade: 'C',
    effective_dose_min: 300, effective_dose_max: 900, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'Cochrane', url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD000530.pub3', title: 'Echinacea for common cold — Cochrane review', year: 2014 },
    ],
  },
  {
    slug: 'milk-thistle-extract',
    evidence_grade: 'B',
    effective_dose_min: 200, effective_dose_max: 600, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '28123269', doi: '10.1007/s12325-016-0407-2', title: 'Silymarin for liver disease — systematic review', year: 2017 },
    ],
  },
  {
    slug: 'panax-ginseng',
    evidence_grade: 'C',
    effective_dose_min: 200, effective_dose_max: 400, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '26681008', doi: '10.3390/nu7115466', title: 'Panax ginseng for cognitive function', year: 2015 },
    ],
  },
  {
    slug: 'rhodiola-rosea',
    evidence_grade: 'C',
    effective_dose_min: 200, effective_dose_max: 600, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '22228617', doi: '10.1159/000325248', title: 'Rhodiola rosea for stress and fatigue', year: 2011 },
    ],
  },
  {
    slug: 'maca-root-extract',
    evidence_grade: 'C',
    effective_dose_min: 1500, effective_dose_max: 3000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '20359969', doi: '10.1111/j.1365-2605.2008.00917.x', title: 'Maca (Lepidium meyenii) for sexual function', year: 2010 },
    ],
  },
  {
    slug: 'tribulus-terrestris',
    evidence_grade: 'D',
    effective_dose_min: 500, effective_dose_max: 1500, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '25248935', doi: '10.1089/acm.2014.0074', title: 'Tribulus — evidence review', year: 2014 },
    ],
  },
  {
    slug: 'grape-seed-extract',
    evidence_grade: 'C',
    effective_dose_min: 100, effective_dose_max: 300, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '27687900', doi: '10.3390/molecules21091069', title: 'Grape seed proanthocyanidins — review', year: 2016 },
    ],
  },

  // ── PROTEİN / PERFORMANS ───────────────────────────────────────────────
  {
    slug: 'whey-protein',
    evidence_grade: 'A',
    effective_dose_min: 20000, effective_dose_max: 40000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '28642676', doi: '10.1186/s12970-017-0189-4', title: 'ISSN position: protein and exercise', year: 2017 },
      { source: 'PubMed', pmid: '24714081', doi: '10.1186/1550-2783-11-20', title: 'Whey protein for body composition — meta-analysis', year: 2014 },
    ],
  },
  {
    slug: 'caffeine',
    evidence_grade: 'A',
    effective_dose_min: 100, effective_dose_max: 400, effective_dose_unit: 'mg', ul_dose: 400,
    evidence_citations: [
      { source: 'EFSA', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4102', title: 'EFSA scientific opinion on caffeine safety', year: 2015 },
      { source: 'PubMed', pmid: '31977022', doi: '10.3390/nu12020314', title: 'Caffeine for exercise performance — meta-analysis', year: 2020 },
    ],
  },

  // ── MANTARLAR / NOOTROPİK ─────────────────────────────────────────────
  {
    slug: 'lions-mane',
    evidence_grade: 'C',
    effective_dose_min: 1000, effective_dose_max: 3000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '18844328', doi: '10.1002/ptr.2634', title: 'Hericium erinaceus for mild cognitive impairment', year: 2009 },
    ],
  },
  {
    slug: 'cordyceps',
    evidence_grade: 'D',
    effective_dose_min: 1000, effective_dose_max: 3000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '20839496', doi: '10.1089/jmf.2009.1286', title: 'Cordyceps sinensis — review', year: 2010 },
    ],
  },
  {
    slug: 'reishi',
    evidence_grade: 'D',
    effective_dose_min: 1500, effective_dose_max: 6000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '26853030', doi: '10.1155/2015/376216', title: 'Ganoderma lucidum immunomodulatory effects — review', year: 2016 },
    ],
  },
  {
    slug: 'phosphatidylserine',
    evidence_grade: 'B',
    effective_dose_min: 100, effective_dose_max: 300, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '22117185', doi: '10.1080/10408398.2010.535272', title: 'Phosphatidylserine for cognitive function — review', year: 2011 },
    ],
  },
  {
    slug: 'alpha-gpc',
    evidence_grade: 'C',
    effective_dose_min: 300, effective_dose_max: 1200, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '24478961', doi: '10.1016/j.jgg.2013.12.006', title: 'Alpha-GPC for cognitive enhancement', year: 2014 },
    ],
  },

  // ── GLUTATHION / DETOX ────────────────────────────────────────────────
  {
    slug: 'glutathione',
    evidence_grade: 'C',
    effective_dose_min: 250, effective_dose_max: 1000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '25491290', doi: '10.1038/ejcn.2014.241', title: 'Oral glutathione supplementation — RCT', year: 2015 },
    ],
  },

  // ── DİYET LİFİ / METABOLİK ────────────────────────────────────────────
  {
    slug: 'inulin',
    evidence_grade: 'B',
    effective_dose_min: 5000, effective_dose_max: 15000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '28228340', doi: '10.1017/S0007114517000149', title: 'Inulin-type fructans and gut microbiota — meta-analysis', year: 2017 },
    ],
  },
  {
    slug: 'apple-cider-vinegar',
    evidence_grade: 'D',
    effective_dose_min: 15000, effective_dose_max: 30000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '29936607', doi: '10.1016/j.jff.2018.02.026', title: 'Apple cider vinegar — review of evidence', year: 2018 },
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
        `SELECT ingredient_id, ingredient_slug, common_name FROM ingredients
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
        console.log(`  [DRY] would update ${ing.slug} → grade=${ing.evidence_grade}, dose=${ing.effective_dose_min}-${ing.effective_dose_max} ${ing.effective_dose_unit}, UL=${ing.ul_dose ?? 'N/A'}`);
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
      console.log(`  [OK] ${ing.slug} (id=${row.ingredient_id}) → grade=${ing.evidence_grade}`);
    }

    console.log('\n=== Summary (batch 2) ===');
    console.log(`  updated   = ${stats.updated}`);
    console.log(`  not_found = ${stats.not_found}`);
    console.log(`  total     = ${stats.total}`);
    if (notFound.length) {
      console.log('\n  Not found slugs (ingredient_slug mismatch — seed manually or add alias):');
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
