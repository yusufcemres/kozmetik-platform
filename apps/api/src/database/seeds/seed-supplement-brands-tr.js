/**
 * Supplement Brands (TR) — catalog expansion batch 1
 * Seeds Nutraxin, Voonka, Naturals Garden.
 *
 * Idempotent: ON CONFLICT (brand_slug) DO UPDATE.
 *
 * Run:  node seed-supplement-brands-tr.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

const BRANDS = [
  {
    slug: 'nutraxin',
    name: 'Nutraxin',
    country: 'TR',
    website: 'https://www.nutraxin.com.tr',
    logo: 'https://www.google.com/s2/favicons?domain=nutraxin.com.tr&sz=128',
  },
  {
    slug: 'voonka',
    name: 'Voonka',
    country: 'TR',
    website: 'https://www.voonka.com',
    logo: 'https://www.google.com/s2/favicons?domain=voonka.com&sz=128',
  },
  {
    slug: 'naturals-garden',
    name: 'Naturals Garden',
    country: 'TR',
    website: 'https://www.naturalsgarden.com.tr',
    logo: 'https://www.google.com/s2/favicons?domain=naturalsgarden.com.tr&sz=128',
  },
];

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  let inserted = 0, updated = 0;
  try {
    for (const b of BRANDS) {
      if (DRY) {
        console.log(`  [DRY] UPSERT ${b.slug} (${b.name})`);
        continue;
      }
      const res = await client.query(
        `INSERT INTO brands (brand_name, brand_slug, country_of_origin, website_url, logo_url, is_active)
         VALUES ($1,$2,$3,$4,$5,true)
         ON CONFLICT (brand_slug) DO UPDATE SET
           brand_name = EXCLUDED.brand_name,
           country_of_origin = EXCLUDED.country_of_origin,
           website_url = EXCLUDED.website_url,
           logo_url = EXCLUDED.logo_url,
           updated_at = now()
         RETURNING brand_id, (xmax = 0) AS inserted`,
        [b.name, b.slug, b.country, b.website, b.logo],
      );
      const row = res.rows[0];
      if (row.inserted) { inserted++; console.log(`  [NEW] ${b.slug} → brand_id=${row.brand_id}`); }
      else { updated++; console.log(`  [UPD] ${b.slug} → brand_id=${row.brand_id}`); }
    }
  } finally {
    await client.end();
  }
  console.log(`\n=== Summary ===\n  inserted = ${inserted}\n  updated  = ${updated}\n  total    = ${BRANDS.length}`);
}

main().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
