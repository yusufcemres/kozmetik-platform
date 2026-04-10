/**
 * Populate alt_text for all product_images
 * Format: "{brand_name} {product_name}"
 *
 * Run from apps/api: node src/database/seeds/populate-alt-text.js
 */
const { Client } = require('pg');

const DB = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to DB');

  const result = await client.query(`
    UPDATE product_images pi
    SET alt_text = CONCAT(b.brand_name, ' ', p.product_name)
    FROM products p
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    WHERE pi.product_id = p.product_id
      AND pi.alt_text IS NULL
  `);

  console.log(`Updated ${result.rowCount} image alt_text values`);

  // Verify
  const check = await client.query(`
    SELECT count(*) as total,
           count(alt_text) as with_alt
    FROM product_images
  `);
  console.log(`Total images: ${check.rows[0].total}, with alt_text: ${check.rows[0].with_alt}`);

  await client.end();
}

main().catch(console.error);
