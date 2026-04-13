const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const certs = [
  { slug: 'the-body-shop', codes: ['leaping_bunny', 'vegan_society'], source: 'https://www.thebodyshop.com/en-gb/about-us/our-commitment/cruelty-free' },
  { slug: 'weleda', codes: ['natrue', 'cruelty_free'], source: 'https://www.weleda.com/about/sustainability' },
  { slug: 'dr-hauschka', codes: ['natrue', 'cruelty_free'], source: 'https://www.drhauschka.com/quality/natrue' },
  { slug: 'caudalie', codes: ['cruelty_free'], source: 'https://us.caudalie.com/cruelty-free' },
  { slug: 'drunk-elephant', codes: ['leaping_bunny'], source: 'https://www.drunkelephant.com/pages/ingredients' },
  { slug: 'the-ordinary', codes: ['cruelty_free', 'vegan_formulas'], source: 'https://theordinary.com/en-us/policies/cruelty-free' },
  { slug: 'cerave', codes: ['cruelty_free_peta'], source: 'https://www.peta.org/living/personal-care-fashion/global-beauty-brands-test-animals/' },
  { slug: 'burts-bees', codes: ['leaping_bunny'], source: 'https://www.burtsbees.com/sustainability' },
];

const certTypes = [
  { code: 'leaping_bunny', name: 'Leaping Bunny', category: 'cruelty_free' },
  { code: 'vegan_society', name: 'Vegan Society', category: 'vegan' },
  { code: 'natrue', name: 'NATRUE', category: 'natural' },
  { code: 'cruelty_free', name: 'Cruelty-Free (Brand Claim)', category: 'cruelty_free' },
  { code: 'cruelty_free_peta', name: 'PETA Beauty Without Bunnies', category: 'cruelty_free' },
  { code: 'vegan_formulas', name: 'Vegan Formulas (Brand Claim)', category: 'vegan' },
];

(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  // Upsert cert types first
  for (const t of certTypes) {
    await c.query(
      `INSERT INTO certification_types (cert_code, name_tr, category, legal_risk, note)
       VALUES ($1,$2,$3,true,null) ON CONFLICT (cert_code) DO NOTHING`,
      [t.code, t.name, t.category],
    );
  }
  let inserted = 0;
  for (const cert of certs) {
    const b = await c.query(`SELECT brand_id FROM brands WHERE brand_slug = $1`, [cert.slug]);
    if (!b.rows[0]) { console.log(`  ! brand not found: ${cert.slug}`); continue; }
    for (const code of cert.codes) {
      await c.query(
        `INSERT INTO brand_certifications (brand_id, cert_code, source_url, verified_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT DO NOTHING`,
        [b.rows[0].brand_id, code, cert.source],
      );
      inserted++;
    }
  }
  console.log(`✓ Seeded ${inserted} brand certifications`);
  const summary = await c.query(`SELECT cert_code, COUNT(*)::int AS n FROM brand_certifications GROUP BY cert_code ORDER BY n DESC`);
  summary.rows.forEach(r => console.log(`  ${r.cert_code}: ${r.n}`));
  await c.end();
})();
