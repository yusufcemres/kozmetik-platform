import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(`
  SELECT p.product_id, p.product_name, p.product_slug, b.brand_name, b.brand_slug,
         (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.product_id) AS image_count
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.domain_type = 'supplement'
    AND p.status IN ('published','active')
    AND b.brand_slug IN ('voonka','naturals-garden','orzax')
  GROUP BY p.product_id, b.brand_name, b.brand_slug
  HAVING (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.product_id) = 0
  ORDER BY b.brand_slug, p.product_name
`);

console.log(`Toplam görsel-eksik takviye: ${r.rows.length}`);
const by_brand = {};
for (const row of r.rows) {
  by_brand[row.brand_slug] = (by_brand[row.brand_slug] || []);
  by_brand[row.brand_slug].push(row);
}
for (const [brand, products] of Object.entries(by_brand)) {
  console.log(`\n## ${brand} (${products.length})`);
  for (const p of products) {
    console.log(`  ${p.product_id} | ${p.product_slug} | ${p.product_name}`);
  }
}

await c.end();
