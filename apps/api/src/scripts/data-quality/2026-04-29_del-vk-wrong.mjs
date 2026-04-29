import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(`DELETE FROM product_images WHERE product_id IN (
  SELECT p.product_id FROM products p JOIN brands b ON b.brand_id=p.brand_id 
  WHERE b.brand_slug='voonka' AND p.product_slug IN ('voonka-d3-k2-60-softjel','voonka-hydrolyzed-collagen-type-ii-60-kapsul')
) AND alt_text LIKE '%voonka%' RETURNING image_id, product_id`);
console.log(`Deleted ${r.rowCount}: ${JSON.stringify(r.rows)}`);
await c.end();
