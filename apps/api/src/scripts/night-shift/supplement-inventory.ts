/**
 * Quick inventory — direct pg client, bypass Nest.
 */
import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const total = await client.query(
    `SELECT domain_type, COUNT(*)::int AS n FROM products GROUP BY domain_type ORDER BY n DESC`,
  );
  console.log('Products by domain_type:');
  for (const r of total.rows) console.log(`  ${r.domain_type}: ${r.n}`);

  const supplementBrands = await client.query(
    `SELECT b.brand_name, b.brand_slug, COUNT(*)::int AS n
     FROM products p
     JOIN brands b ON b.brand_id = p.brand_id
     WHERE p.domain_type = 'supplement'
     GROUP BY b.brand_name, b.brand_slug
     ORDER BY n DESC`,
  );
  console.log(`\nSupplement products by brand (${supplementBrands.rowCount} brands):`);
  for (const r of supplementBrands.rows) console.log(`  ${r.brand_slug.padEnd(25)} ${r.n}`);

  // Check brands.country_of_origin column exists
  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='brands'`,
  );
  const colNames = cols.rows.map((r: any) => r.column_name);
  console.log(`\nbrands table columns: ${colNames.join(', ')}`);

  // All TR-relevant brand slugs in DB (regardless of products)
  const trSlugs = [
    'nutraxin','voonka','naturals-garden','solgar','nature-s-supreme','ocean','vitaccord',
    'berko','balen','suda-vitamin','shiffa-home','huge-vitamin','orzax','royal','ongunmak',
    'venatura','farmasi','nbl','hurrem','lokman-hekim','eczacibasi','kurkumax','herbafarm',
    'vitaplus','vitamega'
  ];
  const brandRows = await client.query(
    `SELECT b.brand_name, b.brand_slug,
            COUNT(p.product_id) FILTER (WHERE p.domain_type='supplement')::int AS suppl_count,
            COUNT(p.product_id) FILTER (WHERE p.domain_type='cosmetic')::int AS cosm_count
     FROM brands b
     LEFT JOIN products p ON p.brand_id = b.brand_id
     WHERE b.brand_slug = ANY($1::text[])
     GROUP BY b.brand_name, b.brand_slug
     ORDER BY suppl_count DESC`,
    [trSlugs],
  );
  console.log(`\nTarget TR supplement brands found (${brandRows.rowCount} of ${trSlugs.length}):`);
  for (const r of brandRows.rows) console.log(`  ${r.brand_slug.padEnd(25)} suppl=${r.suppl_count} cosm=${r.cosm_count}`);

  const missing = trSlugs.filter(s => !brandRows.rows.some((r: any) => r.brand_slug === s));
  console.log(`\nMissing TR brands (need to create): ${missing.join(', ')}`);

  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
