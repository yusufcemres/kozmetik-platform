import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Faz 6'dan draft'a çekilenleri tekrar publish et (Sekate alt_text image var olanlar)
const r = await c.query(`
  UPDATE products SET status = 'published', updated_at = NOW()
  WHERE domain_type='supplement' AND status='draft'
    AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = products.product_id AND (i.alt_text LIKE '%sekate%' OR i.alt_text LIKE '%voonka%' OR i.alt_text LIKE '%nutraxin%'))
  RETURNING product_id, product_slug
`);
console.log(`Tekrar published: ${r.rowCount}`);
const total = await c.query(`SELECT COUNT(*) FILTER (WHERE status='published') AS pub FROM products WHERE domain_type='supplement'`);
console.log(`Total published supplement: ${total.rows[0].pub}/329`);
await c.end();
