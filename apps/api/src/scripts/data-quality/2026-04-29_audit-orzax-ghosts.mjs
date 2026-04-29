import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
// Tüm Orzax-prefix ürünleri (Ocean değil, Orzax doğrudan)
const r = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, p.status, p.created_at,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.product_id) AS img_cnt,
    (SELECT i.alt_text FROM product_images i WHERE i.product_id=p.product_id LIMIT 1) AS alt,
    (SELECT COUNT(*) FROM supplement_ingredients si WHERE si.product_id=p.product_id) AS sup_ing_cnt,
    (SELECT COUNT(*) FROM affiliate_links al WHERE al.product_id=p.product_id) AS aff_cnt
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE b.brand_slug='orzax' AND p.domain_type='supplement'
    AND p.product_slug LIKE 'orzax-%'
  ORDER BY p.product_id
`);
console.log(`Orzax-prefix ürünler: ${r.rowCount}`);
for (const x of r.rows) {
  console.log(`  ${x.product_id} | ${x.status.padEnd(10)} | img:${x.img_cnt} sup:${x.sup_ing_cnt} aff:${x.aff_cnt} | created:${new Date(x.created_at).toISOString().slice(0,10)} | alt:"${(x.alt||'').slice(0,40)}" | ${x.product_slug.slice(0,55)}`);
}
await c.end();
