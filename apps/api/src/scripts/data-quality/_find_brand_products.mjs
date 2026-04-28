import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const slug = process.argv[2];
const r = await client.query(`
  SELECT p.product_id, p.product_name, p.status,
         (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id = p.product_id) as inci_count,
         (SELECT image_url FROM product_images pim WHERE pim.product_id = p.product_id ORDER BY sort_order LIMIT 1) as image_url
  FROM products p JOIN brands b ON b.brand_id = p.brand_id
  WHERE b.brand_slug = $1
  ORDER BY p.product_id
`, [slug]);
for (const row of r.rows) {
  console.log(`[${row.product_id}] ${row.product_name.slice(0,70)} | inci:${row.inci_count} | img:${row.image_url ? 'Y' : 'N'} | st:${row.status}`);
}
await client.end();
