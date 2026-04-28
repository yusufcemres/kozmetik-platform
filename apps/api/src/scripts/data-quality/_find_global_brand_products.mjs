import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

const GLOBAL_BRANDS = ['the-ordinary', 'cerave', 'bioderma', 'la-roche-posay', 'eucerin', 'vichy', 'avene', 'cosrx', 'beauty-of-joseon', 'some-by-mi', 'skin1004', 'numbuzin', 'anua', 'purito', 'nivea', 'mustela', 'klorane', 'caudalie', 'nuxe'];

const r = await client.query(`
  SELECT p.product_id, p.product_name, p.status, b.brand_slug, b.brand_name,
         (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id = p.product_id) as inci_count,
         (SELECT image_url FROM product_images pim WHERE pim.product_id = p.product_id ORDER BY sort_order LIMIT 1) as image_url
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE b.brand_slug = ANY($1::text[])
  ORDER BY b.brand_slug, p.product_id
`, [GLOBAL_BRANDS]);

console.log(`Found ${r.rows.length} products from global brands:\n`);
const byBrand = new Map();
for (const row of r.rows) {
  if (!byBrand.has(row.brand_slug)) byBrand.set(row.brand_slug, []);
  byBrand.get(row.brand_slug).push(row);
}
for (const [brand, products] of byBrand) {
  console.log(`\n[${brand}] (${products.length})`);
  for (const p of products) {
    console.log(`  [${p.product_id}] ${p.product_name.slice(0,60)} | inci:${p.inci_count} | img:${p.image_url ? 'Y' : 'N'} | st:${p.status}`);
  }
}
await client.end();
