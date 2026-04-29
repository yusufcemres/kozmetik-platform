import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
// Faz 6 ürünleri için şu an product_ingredients'ta ne var?
const r = await c.query(`
  SELECT pi.product_ingredient_id, pi.product_id, pi.ingredient_display_name, pi.concentration_source, pi.match_status, p.product_slug, b.brand_slug
  FROM product_ingredients pi
  JOIN products p ON p.product_id=pi.product_id
  JOIN brands b ON b.brand_id=p.brand_id
  WHERE b.brand_slug IN ('voonka','nutraxin','orzax')
    AND pi.concentration_source IN ('voonka-nutraxin-scrape', 'voonka-scrape', 'nutraxin-scrape')
  LIMIT 20`);
console.log(`Found ${r.rowCount}`);
for (const x of r.rows) console.log(`  ${x.product_id} | ${x.brand_slug} | ${x.product_slug.slice(0,30)} | ${x.ingredient_display_name} | source=${x.concentration_source} | status=${x.match_status}`);
// Total count
const t = await c.query(`SELECT COUNT(*) FROM product_ingredients WHERE concentration_source LIKE '%voonka%' OR concentration_source LIKE '%nutraxin%' OR concentration_source LIKE '%scrape%'`);
console.log(`\nTotal scrape source rows: ${t.rows[0].count}`);
await c.end();
