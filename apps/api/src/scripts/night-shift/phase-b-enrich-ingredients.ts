/**
 * Faz B — 6 draft ürünün ingredient'lerine evidence/dose/bioavail populate.
 *
 * Kaynaklar (meta-analitik):
 * - Passiflora: Miroddi 2013 (J Clin Pharm Ther) anxiety/insomnia review, dose 300-800 mg aerial-part extract
 * - Bromelain: Maurer 2001 (Cell Mol Life Sci) proteolytic review, dose 500-2000 mg (GDU/FIP varies)
 * - L-Glutathione (oral): Richie 2015 (Eur J Nutr) — 250-1000 mg, bioavail düşük (~30)
 * - Tribulus Terrestris: Neychev & Mitev 2016 (J Ethnopharmacol) — 500-1500 mg, conflicting evidence (D)
 * - Chromium picolinate: Suksomboon 2014 (Diabetes Obes Metab) — 100-200 mcg, moderate glucose benefit (B)
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/phase-b-enrich-ingredients.ts
 */
import { Client } from 'pg';

interface Update {
  slug: string;
  evidence_grade: 'A' | 'B' | 'C' | 'D' | 'E';
  effective_dose_min: number;
  effective_dose_max: number;
  effective_dose_unit: string;
  bioavailability_score: number;
  citation: { source: string; url?: string; pmid?: string; year?: number; note?: string };
}

const UPDATES: Update[] = [
  {
    slug: 'passiflora-incarnata-extract',
    evidence_grade: 'C',
    effective_dose_min: 300, effective_dose_max: 800, effective_dose_unit: 'mg',
    bioavailability_score: 60,
    citation: {
      source: 'Miroddi et al. 2013, J Clin Pharm Ther',
      pmid: '23348601', year: 2013,
      note: 'Passiflora incarnata review — dose 300-800 mg aerial-part extract for anxiety/insomnia, moderate evidence',
    },
  },
  {
    slug: 'bromelain',
    evidence_grade: 'C',
    effective_dose_min: 500, effective_dose_max: 2000, effective_dose_unit: 'mg',
    bioavailability_score: 45,
    citation: {
      source: 'Maurer 2001, Cell Mol Life Sci',
      pmid: '11577981', year: 2001,
      note: 'Bromelain proteolytic review — 500-2000 mg GDU equivalent, partial oral bioavailability',
    },
  },
  {
    slug: 'l-glutathione',
    evidence_grade: 'C',
    effective_dose_min: 250, effective_dose_max: 1000, effective_dose_unit: 'mg',
    bioavailability_score: 30,
    citation: {
      source: 'Richie et al. 2015, Eur J Nutr',
      pmid: '24791752', year: 2015,
      note: 'Oral glutathione 6 mo RCT — 250-1000 mg effective, but systemic bioavailability ~30% (enterocyte breakdown)',
    },
  },
  {
    slug: 'tribulus-terrestris-extract',
    evidence_grade: 'D',
    effective_dose_min: 500, effective_dose_max: 1500, effective_dose_unit: 'mg',
    bioavailability_score: 55,
    citation: {
      source: 'Neychev & Mitev 2016, J Ethnopharmacol',
      pmid: '26621233', year: 2016,
      note: 'Tribulus review — no reliable testosterone effect in healthy men; limited libido data (D-tier)',
    },
  },
  {
    slug: 'chromium-picolinate',
    evidence_grade: 'B',
    effective_dose_min: 100, effective_dose_max: 200, effective_dose_unit: 'mcg',
    bioavailability_score: 75,
    citation: {
      source: 'Suksomboon et al. 2014, Diabetes Obes Metab',
      pmid: '24635324', year: 2014,
      note: 'Chromium picolinate meta-analysis — modest HbA1c reduction in T2DM at 100-200 mcg/d',
    },
  },
];

async function main() {
  const c = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  for (const u of UPDATES) {
    const existing = await c.query(
      `SELECT ingredient_id, common_name, evidence_grade, effective_dose_min, effective_dose_max,
              bioavailability_score, evidence_citations
       FROM ingredients WHERE ingredient_slug=$1`,
      [u.slug],
    );
    if (existing.rowCount === 0) {
      console.log(`SKIP ${u.slug}: ingredient bulunamadı`);
      continue;
    }
    const cur = existing.rows[0];
    // Merge citations: preserve existing, append new one if not duplicate
    const existingCites: any[] = cur.evidence_citations || [];
    const hasCite = existingCites.some((c) => c.source === u.citation.source);
    const newCites = hasCite ? existingCites : [...existingCites, u.citation];

    await c.query(
      `UPDATE ingredients
       SET evidence_grade=$1,
           effective_dose_min=$2, effective_dose_max=$3, effective_dose_unit=$4,
           bioavailability_score=$5,
           evidence_citations=$6::jsonb
       WHERE ingredient_id=$7`,
      [
        u.evidence_grade,
        u.effective_dose_min, u.effective_dose_max, u.effective_dose_unit,
        u.bioavailability_score,
        JSON.stringify(newCites),
        cur.ingredient_id,
      ],
    );
    console.log(`OK ${u.slug} (#${cur.ingredient_id}): evidence=${cur.evidence_grade || '-'}→${u.evidence_grade}, ` +
      `dose ${cur.effective_dose_min || '-'}→${u.effective_dose_min}/${u.effective_dose_max}${u.effective_dose_unit}, ` +
      `bioavail ${cur.bioavailability_score || '-'}→${u.bioavailability_score}`);
  }

  await c.end();
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
