/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Seed: supplement_details — form/serving/certification defaults for supplement products
 * without existing detail. Uses heuristic inference from product name.
 * Idempotent — skips products that already have a detail row.
 * Usage: node apps/api/src/database/seeds/seed-supplement-details.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DRY = process.argv.includes('--dry-run');

const FORM_HINTS = [
  [/tablet/i, 'tablet'],
  [/kapsül|capsule|softgel|yumuşak/i, 'capsule'],
  [/softgel|jel/i, 'softgel'],
  [/powder|toz/i, 'powder'],
  [/sıvı|şurup|liquid|damla/i, 'liquid'],
  [/gummy|jöle|çiğne/i, 'gummy'],
  [/sprey/i, 'spray'],
  [/damla|drop/i, 'drop'],
];

function guessForm(name) {
  for (const [rx, form] of FORM_HINTS) if (rx.test(name)) return form;
  return 'capsule';
}

function guessCert(brand) {
  if (!brand) return null;
  const b = brand.toLowerCase();
  if (/solgar|now|thorne|nature.?made|puritan|gnc|jarrow|doctor.?s best/i.test(b)) return 'GMP';
  return null;
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });
  await client.connect();

  const { rows: products } = await client.query(`
    SELECT p.product_id, p.product_name, b.brand_name
    FROM products p
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN supplement_details sd ON sd.product_id = p.product_id
    WHERE p.domain_type = 'supplement' AND sd.supplement_detail_id IS NULL
  `);

  console.log(`Missing supplement_details: ${products.length}`);

  let inserted = 0;
  for (const p of products) {
    const form = guessForm(p.product_name);
    const cert = guessCert(p.brand_name);
    if (DRY) {
      console.log(`[DRY] ${p.product_id} "${p.product_name}" → form=${form} cert=${cert ?? '-'}`);
      inserted++;
      continue;
    }
    await client.query(
      `INSERT INTO supplement_details
        (product_id, form, recommended_use, certification)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id) DO NOTHING`,
      [p.product_id, form, 'Günde 1 porsiyon, tercihen yemekle birlikte.', cert]
    );
    inserted++;
  }

  await client.end();
  console.log(`\nDone. inserted=${inserted}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
