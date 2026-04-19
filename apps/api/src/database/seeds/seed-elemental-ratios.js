/**
 * Seed elemental_ratio for chelated mineral ingredient forms.
 *
 * Scoring compares servingDose × elemental_ratio against effective_dose/UL
 * (both stored at elemental level per NIH ODS convention). NULL = 1.0.
 *
 * Molecular weight sources: PubChem.
 *
 * Run:  node seed-elemental-ratios.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// ratio = atomic_weight(mineral) / molecular_weight(compound)
const RATIOS = [
  { slug: 'magnesium-bisglycinate', ratio: 0.1083 }, // Mg 24.305 / 224.46
  { slug: 'magnesium-citrate',      ratio: 0.1617 }, // 3×Mg 72.915 / 451.11 (trimagnesium citrate)
  { slug: 'iron-bisglycinate',      ratio: 0.2133 }, // Fe 55.845 / 261.85
  { slug: 'zinc-picolinate',        ratio: 0.2112 }, // Zn 65.38 / 309.62
  { slug: 'zinc-gluconate',         ratio: 0.1435 }, // Zn 65.38 / 455.70
];

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  let updated = 0, notFound = 0;
  try {
    for (const r of RATIOS) {
      if (DRY) { console.log(`  [DRY] ${r.slug} → ${r.ratio}`); continue; }
      const res = await client.query(
        `UPDATE ingredients SET elemental_ratio = $1, updated_at = now() WHERE ingredient_slug = $2 RETURNING ingredient_id`,
        [r.ratio, r.slug],
      );
      if (res.rowCount === 0) { console.log(`  [NOT FOUND] ${r.slug}`); notFound++; }
      else { console.log(`  [UPD] ${r.slug} → ${r.ratio}`); updated++; }
    }
  } finally {
    await client.end();
  }
  console.log(`\n=== Summary ===\n  updated   = ${updated}\n  notfound  = ${notFound}\n  total     = ${RATIOS.length}`);
}

main().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
