/**
 * Faz C1 — Sertifika seed loader
 *
 * certifications.json → certification_types + brand_certifications
 * Usage: node seed-certifications.js
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  const json = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'certifications.json'), 'utf8')
  );

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  let typeCount = 0;
  for (const t of json.certification_types) {
    await client.query(
      `INSERT INTO certification_types (cert_code, name_tr, category, legal_risk, note)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (cert_code) DO UPDATE SET
         name_tr = EXCLUDED.name_tr,
         category = EXCLUDED.category,
         legal_risk = EXCLUDED.legal_risk,
         note = EXCLUDED.note`,
      [t.code, t.name_tr, t.category, t.legal_risk !== false, t.note || null]
    );
    typeCount++;
  }
  console.log(`✓ ${typeCount} certification_types upserted`);

  let brandCertCount = 0;
  let missingBrands = 0;
  for (const b of json.brands) {
    const brandRes = await client.query(
      `SELECT brand_id FROM brands WHERE slug = $1 LIMIT 1`,
      [b.brand_slug]
    );
    if (brandRes.rows.length === 0) {
      console.warn(`  ! brand not found: ${b.brand_slug}`);
      missingBrands++;
      continue;
    }
    const brandId = brandRes.rows[0].brand_id;
    for (const certCode of b.certs) {
      await client.query(
        `INSERT INTO brand_certifications (brand_id, cert_code, source_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (brand_id, cert_code) DO NOTHING`,
        [brandId, certCode, json._meta?.sources?.[certCode.split('_')[0]] || null]
      );
      brandCertCount++;
    }
  }

  console.log(`✓ ${brandCertCount} brand_certifications inserted`);
  console.log(`  ${missingBrands} brands not yet in DB (will be added in Faz E)`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
