import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
// Sample 30 random "timeout-network" suspect
const r = await c.query(`
  SELECT p.product_id, p.product_slug,
    (SELECT i.image_url FROM product_images i WHERE i.product_id=p.product_id ORDER BY i.sort_order LIMIT 1) AS url
  FROM products p
  WHERE p.status='published'
    AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id AND i.image_url IS NOT NULL AND i.image_url <> '')
  ORDER BY RANDOM() LIMIT 50`);
let ok=0, fail=0;
for (const x of r.rows) {
  if (!x.url || !x.url.startsWith('http')) continue;
  try {
    const resp = await fetch(x.url, { method: 'HEAD', signal: AbortSignal.timeout(15000), redirect: 'follow' });
    if (resp.ok) ok++; else fail++;
  } catch { fail++; }
}
console.log(`Random 50 sample (timeout 15s): ok=${ok} fail=${fail}`);
await c.end();
