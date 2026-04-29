import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name,
    (SELECT i.image_url FROM product_images i WHERE i.product_id=p.product_id ORDER BY i.sort_order LIMIT 1) AS url,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.product_id) AS cnt
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE b.brand_slug='cerave' AND p.domain_type='cosmetic' AND p.status='published'
  ORDER BY p.product_name
`);

console.log(`CeraVe published total: ${r.rowCount}`);
let ok = 0, fail = 0, empty = 0, notHttp = 0;
const failed = [];
for (const row of r.rows) {
  const url = row.url || '';
  if (!url || url.trim() === '') { empty++; failed.push({...row, reason: 'empty'}); continue; }
  if (!url.startsWith('http')) { notHttp++; failed.push({...row, reason: 'not-http'}); continue; }
  try {
    const resp = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000), redirect: 'follow' });
    if (resp.ok) ok++;
    else { fail++; failed.push({...row, reason: `HTTP ${resp.status}`}); }
  } catch (e) {
    fail++;
    failed.push({...row, reason: `Error: ${e.message.slice(0,30)}`});
  }
}
console.log(`OK: ${ok}, Empty: ${empty}, Not-HTTP: ${notHttp}, Fail: ${fail}`);
console.log('\n## Problemli ürünler:');
for (const f of failed) {
  console.log(`  [${f.reason}] ${f.product_name.slice(0,55)} | ${(f.url||'(boş)').slice(0,80)}`);
}
await c.end();
