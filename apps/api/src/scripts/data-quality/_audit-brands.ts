/**
 * Quick brand audit — prints country distribution + TR brands + NULL high-product brands
 */
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: resolve(__dirname, '../../../../../.env') });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL missing'); process.exit(1); }

  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    const r1 = await client.query(`
      SELECT COALESCE(country_of_origin, 'NULL') AS country, COUNT(*)::int AS brand_count
      FROM brands GROUP BY country_of_origin ORDER BY brand_count DESC
    `);
    console.log('\n=== Country distribution ===');
    r1.rows.forEach(r => console.log(`  ${r.country.padEnd(8)} ${r.brand_count}`));

    const r2 = await client.query(`
      SELECT b.brand_slug, b.brand_name, COUNT(p.product_id)::int AS pc
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.brand_id AND p.status IN ('published','active')
      WHERE b.country_of_origin = 'TR'
      GROUP BY b.brand_slug, b.brand_name
      ORDER BY b.brand_name
    `);
    console.log(`\n=== TR brands (${r2.rows.length}) ===`);
    r2.rows.forEach(r => console.log(`  ${r.brand_name.padEnd(30)} ${r.brand_slug.padEnd(30)} (${r.pc} ürün)`));

    const r3 = await client.query(`
      SELECT b.brand_slug, b.brand_name, COUNT(p.product_id)::int AS pc
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.brand_id AND p.status IN ('published','active')
      WHERE b.country_of_origin IS NULL
      GROUP BY b.brand_slug, b.brand_name
      HAVING COUNT(p.product_id) > 0
      ORDER BY pc DESC
      LIMIT 60
    `);
    console.log(`\n=== NULL country brands w/ products (top 60 of ${r3.rowCount}) ===`);
    r3.rows.forEach(r => console.log(`  ${r.brand_name.padEnd(35)} ${r.brand_slug.padEnd(35)} (${r.pc} ürün)`));
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
