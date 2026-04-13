/**
 * Faz E — 64 marka seed (phase2).
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  const json = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'phase2-brands.json'), 'utf8')
  );
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  let inserted = 0;
  for (const b of json.brands) {
    await client.query(
      `INSERT INTO brands (brand_name, slug, origin_country)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO NOTHING`,
      [b.name, b.slug, b.origin_country],
    );
    inserted++;
  }
  console.log(`✓ ${inserted} phase2 brands upserted`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
