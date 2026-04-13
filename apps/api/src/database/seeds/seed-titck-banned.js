const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const banned = [
  { inci_name: 'Hydroquinone', inci_slug: 'hydroquinone', ban_reason: 'Pigment giderici — kozmetikte yasak, yalnızca reçeteli ilaç formunda izinli', ban_category: 'skin_lightener', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Mercury', inci_slug: 'mercury', ban_reason: 'Ağır metal — nörotoksik, kozmetikte tamamen yasak', ban_category: 'heavy_metal', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Lead Acetate', inci_slug: 'lead-acetate', ban_reason: 'Kurşun bileşiği — toksik, 2018\'den itibaren kozmetikte yasak', ban_category: 'heavy_metal', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Formaldehyde', inci_slug: 'formaldehyde', ban_reason: 'Kanserojen (IARC Grup 1) — serbest formda yasak, koruyucu donörlerinde sınırlı', ban_category: 'carcinogen', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Methylene Chloride', inci_slug: 'methylene-chloride', ban_reason: 'Dichloromethane — solventte kanserojen', ban_category: 'carcinogen', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Coal Tar', inci_slug: 'coal-tar', ban_reason: 'Kömür katranı — kanserojen, kozmetikte yasak', ban_category: 'carcinogen', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Strontium Sulfide', inci_slug: 'strontium-sulfide', ban_reason: 'Tüy döktürücü — ciddi deri tahrişi, yasak', ban_category: 'irritant', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Chloroform', inci_slug: 'chloroform', ban_reason: 'Kloroform — kanserojen, solvent, yasak', ban_category: 'carcinogen', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Methyl Methacrylate', inci_slug: 'methyl-methacrylate', ban_reason: 'MMA — tırnak ürünlerinde yasak (alerjen, toksik)', ban_category: 'allergen', regulation_ref: 'TİTCK 2011/78' },
  { inci_name: 'Dibutyl Phthalate', inci_slug: 'dibutyl-phthalate', ban_reason: 'DBP — endokrin bozucu, üreme toksisitesi', ban_category: 'endocrine', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Diethyl Phthalate', inci_slug: 'diethyl-phthalate', ban_reason: 'DEP — endokrin bozucu, şüpheli üreme toksisitesi', ban_category: 'endocrine', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Dibutyltin Hydrogen Borate', inci_slug: 'dibutyltin-hydrogen-borate', ban_reason: 'Organotin — üreme toksik, yasak', ban_category: 'toxic', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Hexachlorophene', inci_slug: 'hexachlorophene', ban_reason: 'Antimikrobiyal — nörotoksik, yasak', ban_category: 'toxic', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Nitrobenzene', inci_slug: 'nitrobenzene', ban_reason: 'Nitrobenzen — kanserojen, yasak', ban_category: 'carcinogen', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Bithionol', inci_slug: 'bithionol', ban_reason: 'Antifungal — fotosensitizasyon, yasak', ban_category: 'photosensitizer', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Thioacetamide', inci_slug: 'thioacetamide', ban_reason: 'Hepatotoksik — yasak', ban_category: 'toxic', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Zirconium', inci_slug: 'zirconium', ban_reason: 'Aerosol ürünlerde yasak (granülom riski)', ban_category: 'toxic', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Dichlorophene', inci_slug: 'dichlorophene', ban_reason: 'Antimikrobiyal — alerjen, yasak', ban_category: 'allergen', regulation_ref: 'EC 1223/2009 Annex II' },
  { inci_name: 'Bronopol', inci_slug: 'bronopol', ban_reason: 'Nitrozamin oluşum riski — belirli koşullarda yasak', ban_category: 'carcinogen_risk', regulation_ref: 'TİTCK 2019' },
  { inci_name: 'Triclosan Over 0.3', inci_slug: 'triclosan-high', ban_reason: 'Antimikrobiyal — sadece %0.3 altında izinli, endokrin bozucu şüphesi', ban_category: 'restricted', regulation_ref: 'EC 1223/2009 Annex V' },
];

(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try {
    for (const b of banned) {
      await c.query(
        `INSERT INTO titck_banned_ingredients (inci_name, inci_slug, ban_reason, ban_category, regulation_ref, banned_at)
         VALUES ($1,$2,$3,$4,$5, CURRENT_DATE)
         ON CONFLICT DO NOTHING`,
        [b.inci_name, b.inci_slug, b.ban_reason, b.ban_category, b.regulation_ref],
      );
    }
    console.log(`✓ Seeded ${banned.length} banned ingredients`);

    // Bulk crosscheck
    console.log('\n=== Running cross-check for all products ===');
    const result = await c.query(`
      UPDATE products p
         SET titck_status = 'banned',
             titck_banned_reason = sub.reason,
             titck_verified_at = NOW()
        FROM (
          SELECT DISTINCT pi.product_id,
                 b.inci_name || ': ' || b.ban_reason AS reason
            FROM product_ingredients pi
            JOIN ingredients ing ON ing.ingredient_id = pi.ingredient_id
            JOIN titck_banned_ingredients b ON b.inci_slug = ing.ingredient_slug
        ) sub
       WHERE p.product_id = sub.product_id
    `);
    console.log(`Products flagged as banned: ${result.rowCount}`);

    // Mark rest as 'not_found' (scanned, no ban) — placeholder until real scraper
    const notChecked = await c.query(`
      UPDATE products
         SET titck_status = 'not_found',
             titck_verified_at = NOW()
       WHERE titck_status = 'not_checked' OR titck_status IS NULL
    `);
    console.log(`Products marked not_found: ${notChecked.rowCount}`);

    const summary = await c.query(`SELECT titck_status, COUNT(*)::int AS n FROM products GROUP BY titck_status`);
    console.log('\nFinal status breakdown:');
    summary.rows.forEach(r => console.log(`  ${r.titck_status}: ${r.n}`));
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  } finally {
    await c.end();
  }
})();
