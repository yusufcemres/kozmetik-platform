import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(`SELECT
  COUNT(*) FILTER (WHERE p.domain_type='supplement' AND p.status='published') AS sup_pub,
  COUNT(*) FILTER (WHERE p.domain_type='supplement' AND p.status='published' AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id)) AS sup_img,
  COUNT(*) FILTER (WHERE p.domain_type='cosmetic' AND p.status='published') AS cos_pub,
  COUNT(*) FILTER (WHERE p.domain_type='cosmetic' AND p.status='published' AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id)) AS cos_img
FROM products p`);
const x = r.rows[0];
console.log(`Supplement: ${x.sup_img}/${x.sup_pub} (${Math.round(x.sup_img/x.sup_pub*100)}%)`);
console.log(`Cosmetic: ${x.cos_img}/${x.cos_pub} (${Math.round(x.cos_img/x.cos_pub*100)}%)`);
await c.end();
