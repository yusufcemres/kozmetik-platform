import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Sadece bizim Faz 6'da insert ettiklerimiz (sekate alt_text'li image var, status=draft)
const r = await c.query(`
  UPDATE products
  SET status='published', updated_at=NOW()
  WHERE domain_type='supplement' AND status='draft'
    AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=products.product_id AND i.alt_text LIKE '%sekate%')
    AND EXISTS (SELECT 1 FROM affiliate_links a WHERE a.product_id=products.product_id AND a.platform='sekate')
  RETURNING product_id, product_slug
`);
console.log(`Published: ${r.rowCount}`);
for (const x of r.rows.slice(0, 10)) console.log(`  ${x.product_id} | ${x.product_slug}`);

const total = await c.query(`SELECT COUNT(*) FILTER (WHERE status='published') AS pub, COUNT(*) AS total FROM products WHERE domain_type='supplement'`);
console.log(`\nTotal supplement: published ${total.rows[0].pub}/${total.rows[0].total}`);
await c.end();
