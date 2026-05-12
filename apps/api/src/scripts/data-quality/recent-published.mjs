import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(`
  SELECT
    p.product_id,
    p.product_name,
    b.brand_name,
    p.updated_at::date as updated_date,
    to_char(p.updated_at, 'HH24:MI') as updated_time,
    (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id = p.product_id) as inci_count,
    (SELECT COUNT(*) FROM product_images pi2 WHERE pi2.product_id = p.product_id) > 0 as has_image,
    NULL as enrichment_source
  FROM products p
  LEFT JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.status = 'published'
    AND p.updated_at >= NOW() - INTERVAL '2 days'
    AND p.domain_type = 'cosmetic'
  ORDER BY p.updated_at DESC
  LIMIT 80
`);

console.log('Son 2 günde published/güncellenen kozmetik ürünler:', rows.length);
console.log('');

let lastDate = '';
for (const r of rows) {
  if (r.updated_date !== lastDate) {
    console.log('--- ' + r.updated_date + ' ---');
    lastDate = r.updated_date;
  }
  const name = (r.product_name || '').substring(0, 50);
  const brand = (r.brand_name || '?').substring(0, 20);
  console.log(`  ${r.updated_time} #${r.product_id} [${brand}] ${name} | INCI:${r.inci_count} img:${r.has_image}`);
}


await client.end();
