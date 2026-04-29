/**
 * Listedeki 214 ürünün gerçekten DB'de + canlı API'de erişilebilir olduğunu doğrula.
 * Eğer çoğu archived/draft veya silinmiş ise listeyi temizle.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// 1) MISSING_IMAGES'taki kategoriler:
//    - product_images.image_url boş veya yok
//    - HEAD test başarısız (404, 403, timeout)
const all = await c.query(`
  SELECT
    p.product_id, p.product_slug, p.product_name, p.status, p.domain_type,
    b.brand_name,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.product_id) AS img_cnt,
    (SELECT i.image_url FROM product_images i WHERE i.product_id=p.product_id ORDER BY i.sort_order LIMIT 1) AS first_url
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.status='published'
  ORDER BY p.domain_type, b.brand_name, p.product_id
`);

console.log(`Total published: ${all.rowCount}`);

// Status breakdown - sadece published
const archived = await c.query(`SELECT COUNT(*) FROM products WHERE status='archived'`);
const draft = await c.query(`SELECT COUNT(*) FROM products WHERE status='draft'`);
console.log(`Archived: ${archived.rows[0].count}, Draft: ${draft.rows[0].count}`);

// 2) HEAD test: gerçekten broken olan published ürünler
const stillBroken = [];
let processed = 0;
const items = all.rows.filter(r => {
  const url = r.first_url || '';
  return r.img_cnt === 0 || !url || url.trim() === '';
});
console.log(`\nDB'de URL boş veya image kaydı yok: ${items.length} (published)`);

// Sample 30 — public API'de URL canlı mı bak
const apiBase = 'https://kozmetik-api.onrender.com/api/v1';
console.log('\n## Sample 10 ürünü API\'de doğrula (gerçekten published mi):');
const sample = items.slice(0, 10);
for (const item of sample) {
  try {
    const r = await fetch(`${apiBase}/products/slug/${item.product_slug}`, { signal: AbortSignal.timeout(8000) });
    const status = r.status;
    let inApi = false;
    if (r.ok) {
      const data = await r.json();
      inApi = data.status === 'published';
    }
    console.log(`  [${item.product_id}] ${item.brand_name.slice(0,15).padEnd(15)} | ${item.product_slug.slice(0,40).padEnd(40)} | DB: ${item.status}, IMG: ${item.img_cnt} | API status=${status} pub=${inApi}`);
  } catch (e) {
    console.log(`  [${item.product_id}] ${item.product_slug.slice(0,40)} | err: ${e.message.slice(0,30)}`);
  }
}

// 3) Brand bazında
const byBrand = {};
for (const i of items) {
  byBrand[i.brand_name] = (byBrand[i.brand_name] || 0) + 1;
}
console.log('\n## Marka bazında doğrulanmış (DB published + img boş):');
for (const [b, c] of Object.entries(byBrand).sort((a,b) => b[1]-a[1]).slice(0, 15)) {
  console.log(`  ${c.toString().padStart(3)} | ${b}`);
}

await c.end();
