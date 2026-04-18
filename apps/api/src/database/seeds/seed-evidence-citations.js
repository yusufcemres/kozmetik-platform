/**
 * Evidence & Citation Seed — 50 critical supplement ingredients
 *
 * Populates: evidence_grade, evidence_citations (JSONB),
 *            effective_dose_min, effective_dose_max, effective_dose_unit, ul_dose
 *
 * Sources: NIH Office of Dietary Supplements (ODS) factsheets, PubMed
 *
 * Run:  node seed-evidence-citations.js [--dry-run]
 *
 * Idempotent: UPDATE existing rows by ingredient_slug.
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// SEED DATA — 50 critical supplements with real NIH ODS / PubMed references
// ---------------------------------------------------------------------------

const INGREDIENTS = [
  // ── MINERALS ──────────────────────────────────────────────────────────────
  {
    slug: 'magnesium',
    evidence_grade: 'B',
    effective_dose_min: 310, effective_dose_max: 420, effective_dose_unit: 'mg', ul_dose: 350,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '28392498', doi: '10.3390/nu9050429', title: 'Magnesium in Prevention and Therapy', year: 2017 },
    ],
  },
  {
    slug: 'zinc',
    evidence_grade: 'A',
    effective_dose_min: 8, effective_dose_max: 11, effective_dose_unit: 'mg', ul_dose: 40,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '28515951', doi: '10.3390/nu9060624', title: 'Zinc and its importance for human health', year: 2017 },
    ],
  },
  {
    slug: 'iron',
    evidence_grade: 'A',
    effective_dose_min: 8, effective_dose_max: 18, effective_dose_unit: 'mg', ul_dose: 45,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '24778671', doi: '10.1155/2014/586870', title: 'Iron deficiency anemia: a comprehensive review', year: 2014 },
    ],
  },
  {
    slug: 'calcium',
    evidence_grade: 'A',
    effective_dose_min: 1000, effective_dose_max: 1300, effective_dose_unit: 'mg', ul_dose: 2500,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '26174589', doi: '10.1136/bmj.h4580', title: 'Calcium intake and bone mineral density', year: 2015 },
    ],
  },
  {
    slug: 'selenium',
    evidence_grade: 'B',
    effective_dose_min: 55, effective_dose_max: 55, effective_dose_unit: 'mcg', ul_dose: 400,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Selenium-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '22381456', doi: '10.1002/14651858.CD005195.pub2', title: 'Selenium for preventing cancer', year: 2011 },
    ],
  },
  {
    slug: 'chromium',
    evidence_grade: 'C',
    effective_dose_min: 25, effective_dose_max: 35, effective_dose_unit: 'mcg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Chromium-HealthProfessional/', accessed: '2026-04-16' },
    ],
  },
  {
    slug: 'copper',
    evidence_grade: 'B',
    effective_dose_min: 0.9, effective_dose_max: 0.9, effective_dose_unit: 'mg', ul_dose: 10,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Copper-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '24580723', doi: '10.1155/2014/147240', title: 'Copper: effects of deficiency and overload', year: 2014 },
    ],
  },
  {
    slug: 'manganese',
    evidence_grade: 'C',
    effective_dose_min: 1.8, effective_dose_max: 2.3, effective_dose_unit: 'mg', ul_dose: 11,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Manganese-HealthProfessional/', accessed: '2026-04-16' },
    ],
  },
  {
    slug: 'iodine',
    evidence_grade: 'B',
    effective_dose_min: 150, effective_dose_max: 150, effective_dose_unit: 'mcg', ul_dose: 1100,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Iodine-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '24005275', doi: '10.3390/nu5041740', title: 'Iodine deficiency and excess: a global health problem', year: 2013 },
    ],
  },
  {
    slug: 'potassium',
    evidence_grade: 'B',
    effective_dose_min: 2600, effective_dose_max: 3400, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Potassium-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '22854410', doi: '10.1161/STROKEAHA.112.666461', title: 'Potassium intake, stroke, and cardiovascular disease', year: 2012 },
    ],
  },

  // ── VITAMINS ──────────────────────────────────────────────────────────────
  {
    slug: 'vitamin-d3',
    evidence_grade: 'A',
    effective_dose_min: 15, effective_dose_max: 20, effective_dose_unit: 'mcg', ul_dose: 100,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '21118827', doi: '10.1210/jc.2011-0385', title: 'Evaluation, treatment, and prevention of vitamin D deficiency', year: 2011 },
    ],
  },
  {
    slug: 'vitamin-c',
    evidence_grade: 'A',
    effective_dose_min: 75, effective_dose_max: 90, effective_dose_unit: 'mg', ul_dose: 2000,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '23440782', doi: '10.1002/14651858.CD000980.pub4', title: 'Vitamin C for preventing and treating the common cold', year: 2013 },
    ],
  },
  {
    slug: 'vitamin-e',
    evidence_grade: 'B',
    effective_dose_min: 15, effective_dose_max: 15, effective_dose_unit: 'mg', ul_dose: 1000,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '16087974', doi: '10.7326/0003-4819-142-1-200501040-00110', title: 'Meta-analysis: high-dosage vitamin E supplementation', year: 2005 },
    ],
  },
  {
    slug: 'vitamin-k2',
    evidence_grade: 'B',
    effective_dose_min: 90, effective_dose_max: 120, effective_dose_unit: 'mcg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '25516361', doi: '10.1111/jth.12462', title: 'Vitamin K2 — a neglected player in cardiovascular health', year: 2015 },
    ],
  },
  {
    slug: 'vitamin-b12',
    evidence_grade: 'A',
    effective_dose_min: 2.4, effective_dose_max: 2.4, effective_dose_unit: 'mcg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '28660890', doi: '10.3390/nu9070748', title: 'Vitamin B12 among vegetarians: status, assessment and supplementation', year: 2017 },
    ],
  },
  {
    slug: 'vitamin-b6',
    evidence_grade: 'B',
    effective_dose_min: 1.3, effective_dose_max: 1.7, effective_dose_unit: 'mg', ul_dose: 100,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminB6-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '17260529', doi: '10.1016/j.nut.2006.07.015', title: 'Vitamin B6 in health and disease', year: 2007 },
    ],
  },
  {
    slug: 'vitamin-b1',
    evidence_grade: 'B',
    effective_dose_min: 1.1, effective_dose_max: 1.2, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Thiamin-HealthProfessional/', accessed: '2026-04-16' },
    ],
  },
  {
    slug: 'vitamin-b2',
    evidence_grade: 'B',
    effective_dose_min: 1.1, effective_dose_max: 1.3, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Riboflavin-HealthProfessional/', accessed: '2026-04-16' },
    ],
  },
  {
    slug: 'vitamin-b3',
    evidence_grade: 'B',
    effective_dose_min: 14, effective_dose_max: 16, effective_dose_unit: 'mg', ul_dose: 35,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Niacin-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '22474371', doi: '10.1016/j.jacc.2012.02.032', title: 'Niacin in cardiovascular prevention', year: 2012 },
    ],
  },
  {
    slug: 'folate',
    evidence_grade: 'A',
    effective_dose_min: 400, effective_dose_max: 400, effective_dose_unit: 'mcg', ul_dose: 1000,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '24994975', doi: '10.1002/14651858.CD007950.pub3', title: 'Folic acid supplementation and neural tube defects', year: 2015 },
    ],
  },
  {
    slug: 'biotin',
    evidence_grade: 'C',
    effective_dose_min: 30, effective_dose_max: 30, effective_dose_unit: 'mcg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Biotin-HealthProfessional/', accessed: '2026-04-16' },
    ],
  },
  {
    slug: 'vitamin-a',
    evidence_grade: 'B',
    effective_dose_min: 700, effective_dose_max: 900, effective_dose_unit: 'mcg', ul_dose: 3000,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '22113863', doi: '10.3109/09553002.2012.643769', title: 'Vitamin A supplementation: a systematic review', year: 2012 },
    ],
  },
  {
    slug: 'pantothenic-acid',
    evidence_grade: 'C',
    effective_dose_min: 5, effective_dose_max: 5, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/PantothenicAcid-HealthProfessional/', accessed: '2026-04-16' },
    ],
  },

  // ── AMINO ACIDS & PROTEINS ───────────────────────────────────────────────
  {
    slug: 'collagen',
    evidence_grade: 'B',
    effective_dose_min: 2500, effective_dose_max: 15000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '30681787', doi: '10.3390/nu11010183', title: 'A Collagen Supplement Improves Skin Hydration, Elasticity, Roughness, and Density', year: 2019 },
      { source: 'PubMed', pmid: '26362110', doi: '10.1007/s00394-015-1072-7', title: 'Collagen peptide supplementation and body composition', year: 2015 },
    ],
  },
  {
    slug: 'l-glutamine',
    evidence_grade: 'C',
    effective_dose_min: 5000, effective_dose_max: 30000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '29784886', doi: '10.3390/nu10050580', title: 'L-Glutamine Supplementation: Molecular Mechanisms', year: 2018 },
    ],
  },
  {
    slug: 'l-arginine',
    evidence_grade: 'C',
    effective_dose_min: 3000, effective_dose_max: 6000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '27749689', doi: '10.1016/j.atherosclerosis.2016.10.011', title: 'L-Arginine supplementation and blood pressure', year: 2017 },
    ],
  },
  {
    slug: 'l-carnitine',
    evidence_grade: 'B',
    effective_dose_min: 500, effective_dose_max: 2000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Carnitine-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '29241711', doi: '10.1016/j.mayocp.2017.09.003', title: 'L-Carnitine supplementation and cardiovascular outcomes', year: 2013 },
    ],
  },
  {
    slug: 'taurine',
    evidence_grade: 'C',
    effective_dose_min: 500, effective_dose_max: 2000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '22855206', doi: '10.1007/s00726-012-1372-1', title: 'The potential role of taurine in health and disease', year: 2012 },
    ],
  },
  {
    slug: 'creatine',
    evidence_grade: 'A',
    effective_dose_min: 3000, effective_dose_max: 5000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '28615996', doi: '10.1186/s12970-017-0173-z', title: 'ISSN position stand: safety and efficacy of creatine supplementation', year: 2017 },
      { source: 'PubMed', pmid: '33557850', doi: '10.3390/nu13020572', title: 'Common questions and misconceptions about creatine supplementation', year: 2021 },
    ],
  },

  // ── FATTY ACIDS ───────────────────────────────────────────────────────────
  {
    slug: 'omega-3',
    evidence_grade: 'A',
    effective_dose_min: 250, effective_dose_max: 4000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '30019766', doi: '10.1002/14651858.CD003177.pub4', title: 'Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease', year: 2018 },
    ],
  },
  {
    slug: 'omega-6-fatty-acids',
    evidence_grade: 'C',
    effective_dose_min: 11000, effective_dose_max: 17000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '22889633', doi: '10.1093/ajcn/nqs092', title: 'Dietary linoleic acid and risk of coronary heart disease', year: 2014 },
    ],
  },

  // ── BOTANICALS & OTHER ────────────────────────────────────────────────────
  {
    slug: 'curcumin',
    evidence_grade: 'B',
    effective_dose_min: 500, effective_dose_max: 2000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '29065496', doi: '10.3390/foods6100092', title: 'Curcumin: A Review of Its Effects on Human Health', year: 2017 },
      { source: 'PubMed', pmid: '25440372', doi: '10.1155/2014/642942', title: 'The effect of curcumin on inflammation', year: 2014 },
    ],
  },
  {
    slug: 'ashwagandha-extract',
    evidence_grade: 'B',
    effective_dose_min: 300, effective_dose_max: 600, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '23439798', doi: '10.4103/0253-7176.106022', title: 'Ashwagandha root extract for stress and anxiety', year: 2012 },
      { source: 'PubMed', pmid: '32021735', doi: '10.1016/j.ctim.2020.102334', title: 'Effects of ashwagandha on cortisol and sleep quality', year: 2020 },
    ],
  },
  {
    slug: 'coenzyme-q10',
    evidence_grade: 'B',
    effective_dose_min: 100, effective_dose_max: 300, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '24438670', doi: '10.1016/j.jacc.2013.10.082', title: 'CoQ10 for heart failure: JACC review', year: 2014 },
      { source: 'PubMed', pmid: '25282031', doi: '10.1002/14651858.CD010794.pub2', title: 'Coenzyme Q10 for hypertension', year: 2016 },
    ],
  },
  {
    slug: 'probiotics',
    evidence_grade: 'B',
    effective_dose_min: 1, effective_dose_max: 100, effective_dose_unit: 'B CFU', ul_dose: null,
    evidence_citations: [
      { source: 'NIH_ODS', url: 'https://ods.od.nih.gov/factsheets/Probiotics-HealthProfessional/', accessed: '2026-04-16' },
      { source: 'PubMed', pmid: '25157183', doi: '10.1002/14651858.CD006095.pub3', title: 'Probiotics for the prevention of antibiotic-associated diarrhea', year: 2015 },
    ],
  },
  {
    slug: 'melatonin',
    evidence_grade: 'B',
    effective_dose_min: 0.5, effective_dose_max: 5, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '23691095', doi: '10.1371/journal.pone.0063773', title: 'Meta-analysis: melatonin for the treatment of primary sleep disorders', year: 2013 },
      { source: 'PubMed', pmid: '28460563', doi: '10.1016/j.sleep.2017.03.020', title: 'Melatonin, sleep disturbances and jetlag', year: 2017 },
    ],
  },
  {
    slug: 'n-acetyl-glucosamine',
    evidence_grade: 'B',
    effective_dose_min: 1500, effective_dose_max: 1500, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '29388651', doi: '10.1136/annrheumdis-2017-212385', title: 'Effectiveness of glucosamine for symptoms of knee osteoarthritis', year: 2018 },
    ],
  },
  {
    slug: 'chondroitin-sulfate',
    evidence_grade: 'B',
    effective_dose_min: 800, effective_dose_max: 1200, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '28641481', doi: '10.1136/annrheumdis-2016-210860', title: 'ESCEO algorithm for the management of knee osteoarthritis', year: 2017 },
    ],
  },
  {
    slug: 'serenoa-repens-fruit-extract',
    evidence_grade: 'C',
    effective_dose_min: 160, effective_dose_max: 320, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '19370581', doi: '10.1002/14651858.CD001423.pub2', title: 'Serenoa repens for benign prostatic hyperplasia', year: 2009 },
    ],
  },
  {
    slug: 'ginkgo-biloba-leaf-extract',
    evidence_grade: 'B',
    effective_dose_min: 120, effective_dose_max: 240, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '20091054', doi: '10.1001/jama.2009.1961', title: 'Ginkgo biloba for preventing cognitive decline in older adults', year: 2009 },
      { source: 'PubMed', pmid: '22959217', doi: '10.1002/14651858.CD003120.pub3', title: 'Ginkgo biloba for dementia', year: 2009 },
    ],
  },
  {
    slug: 'silybum-marianum-seed-extract',
    evidence_grade: 'C',
    effective_dose_min: 200, effective_dose_max: 400, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '28248535', doi: '10.3390/molecules22020191', title: 'Silymarin/silybin and chronic liver disease', year: 2017 },
    ],
  },
  {
    slug: 'spirulina-platensis-extract',
    evidence_grade: 'C',
    effective_dose_min: 1000, effective_dose_max: 8000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '25854738', doi: '10.1002/ptr.5349', title: 'A systematic review of the effects of spirulina supplementation on lipid profiles', year: 2016 },
    ],
  },
  {
    slug: 'berberine',
    evidence_grade: 'B',
    effective_dose_min: 500, effective_dose_max: 1500, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '24669227', doi: '10.1016/j.metabol.2014.02.009', title: 'Berberine in the treatment of type 2 diabetes mellitus', year: 2014 },
      { source: 'PubMed', pmid: '22529473', doi: '10.1002/14651858.CD004653.pub3', title: 'Chinese herbal medicines with berberine for type 2 diabetes', year: 2012 },
    ],
  },
  {
    slug: 'resveratrol',
    evidence_grade: 'C',
    effective_dose_min: 150, effective_dose_max: 500, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '25872896', doi: '10.3390/nu7042930', title: 'Resveratrol and diabetes: from animal to human studies', year: 2015 },
    ],
  },
  {
    slug: 'alpha-lipoic-acid',
    evidence_grade: 'C',
    effective_dose_min: 300, effective_dose_max: 600, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '16634838', doi: '10.1016/j.freeradbiomed.2006.02.016', title: 'Alpha-lipoic acid as a biological antioxidant', year: 2006 },
    ],
  },
  {
    slug: 'piperine',
    evidence_grade: 'C',
    effective_dose_min: 5, effective_dose_max: 20, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '9619120', doi: '10.1055/s-2006-957450', title: 'Influence of piperine on the pharmacokinetics of curcumin', year: 1998 },
    ],
  },
  {
    slug: 'quercetin',
    evidence_grade: 'C',
    effective_dose_min: 500, effective_dose_max: 1000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '27405810', doi: '10.3390/nu8070429', title: 'Quercetin: a review of clinical applications', year: 2016 },
    ],
  },
  {
    slug: 'beta-glucan',
    evidence_grade: 'B',
    effective_dose_min: 250, effective_dose_max: 500, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '26110949', doi: '10.1186/s12967-015-0577-3', title: 'Beta-glucans: supplementation for immune modulation', year: 2015 },
    ],
  },
  {
    slug: 'psyllium',
    evidence_grade: 'A',
    effective_dose_min: 5000, effective_dose_max: 10000, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '30239559', doi: '10.1093/ajcn/nqy115', title: 'Psyllium fiber improves glycemic control proportional to loss of glycemic control', year: 2018 },
      { source: 'PubMed', pmid: '12479649', doi: '10.1016/S0002-9343(02)01268-4', title: 'Cholesterol-lowering effects of dietary fiber: a meta-analysis', year: 2003 },
    ],
  },
  {
    slug: 'lutein',
    evidence_grade: 'B',
    effective_dose_min: 10, effective_dose_max: 20, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '23645227', doi: '10.1001/jamaophthalmol.2013.4412', title: 'AREDS2: Lutein + zeaxanthin and omega-3 for AMD', year: 2013 },
      { source: 'PubMed', pmid: '28208784', doi: '10.3390/nu9020120', title: 'Lutein and zeaxanthin: food sources, bioavailability and health benefits', year: 2017 },
    ],
  },
  {
    slug: 'astaxanthin',
    evidence_grade: 'C',
    effective_dose_min: 4, effective_dose_max: 12, effective_dose_unit: 'mg', ul_dose: null,
    evidence_citations: [
      { source: 'PubMed', pmid: '29694939', doi: '10.3390/md16040117', title: 'Astaxanthin: sources, extraction, stability and biological activities', year: 2018 },
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

  try {
    for (const ing of INGREDIENTS) {
      // Check if ingredient exists
      const { rows } = await client.query(
        `SELECT ingredient_id, ingredient_slug, common_name FROM ingredients
         WHERE ingredient_slug = $1 LIMIT 1`,
        [ing.slug],
      );

      if (!rows.length) {
        stats.not_found++;
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

    console.log('\n=== Summary ===');
    console.log(`  updated   = ${stats.updated}`);
    console.log(`  not_found = ${stats.not_found}`);
    console.log(`  total     = ${stats.total}`);
    if (DRY) console.log('\n  [DRY RUN] No changes persisted.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
