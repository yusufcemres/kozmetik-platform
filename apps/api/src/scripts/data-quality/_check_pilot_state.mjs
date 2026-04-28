import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const ids = [2665,2661,2663,2654,2658,2664,2653,2656,2666,2689,2655,2680,2677,2669,2683,2675,2682,2681,2686,2674,2670,2678,2673,2667,2685,2671,2679,2672,2668,2684,2676];
const r = await client.query(`
  SELECT p.product_id, p.product_name, p.short_description, p.status, p.net_content_value, p.net_content_unit, p.domain_type,
         (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id = p.product_id) as inci_count,
         (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY sort_order LIMIT 1) as image,
         (SELECT usage_instructions FROM product_labels pl WHERE pl.product_id = p.product_id LIMIT 1) as usage
  FROM products p WHERE p.product_id = ANY($1::int[])
  ORDER BY p.domain_type, p.product_id`, [ids]);
for (const row of r.rows) {
  console.log(`[${row.product_id}] (${row.domain_type[0]}) ${row.product_name.slice(0,50)} | inci:${row.inci_count} | img:${row.image ? 'Y' : 'N'} | desc:${row.short_description ? 'Y' : 'N'} | usage:${row.usage ? 'Y' : 'N'} | st:${row.status}`);
}
await client.end();
