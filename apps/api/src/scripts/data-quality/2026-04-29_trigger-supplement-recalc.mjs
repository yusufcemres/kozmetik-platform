import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Faz 6 ürünleri ki supplement_ingredients'ı dolu
const r = await c.query(`
  SELECT DISTINCT p.product_id, p.product_slug
  FROM products p
  WHERE p.domain_type='supplement' AND p.status='published'
    AND EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id=p.product_id)
    AND NOT EXISTS (SELECT 1 FROM product_scores ps WHERE ps.product_id=p.product_id)
  LIMIT 100`);
console.log(`Recalc bekleyen ürün: ${r.rowCount}`);

const API = 'https://kozmetik-api.onrender.com/api/v1';
let success = 0, fail = 0;
for (const p of r.rows) {
  try {
    const resp = await fetch(`${API}/supplements/${p.product_id}/score`, { signal: AbortSignal.timeout(20000) });
    if (resp.ok) { success++; }
    else { fail++; console.log(`  FAIL ${p.product_id} status=${resp.status}`); }
  } catch (e) { fail++; console.log(`  ERR ${p.product_id} ${e.message.slice(0,40)}`); }
  if ((success + fail) % 5 === 0) console.log(`  [${success+fail}/${r.rowCount}] ok=${success} fail=${fail}`);
  await new Promise(r => setTimeout(r, 500));
}
console.log(`\nTotal: ${success} success, ${fail} fail`);

// Doğrulama: kaç ürünün scoreu var?
const verify = await c.query(`
  SELECT COUNT(DISTINCT ps.product_id) AS scored
  FROM product_scores ps JOIN products p ON p.product_id=ps.product_id
  WHERE p.domain_type='supplement' AND p.status='published'
    AND EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id=p.product_id)
`);
console.log(`Skoru olan supplement: ${verify.rows[0].scored}`);

await c.end();
