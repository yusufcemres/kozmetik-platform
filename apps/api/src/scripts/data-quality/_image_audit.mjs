import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log('═══ IMAGE AUDIT ═══\n');

// 1. Genel durum
const r1 = await c.query(`
  SELECT
    p.domain_type,
    COUNT(*) as total,
    SUM(CASE WHEN EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id) THEN 1 ELSE 0 END) as with_image,
    SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id) THEN 1 ELSE 0 END) as missing
  FROM products p
  WHERE p.status = 'published'
  GROUP BY p.domain_type
`);
console.log('## Genel — Published ürünlerde image durumu');
for (const row of r1.rows) {
  const pct = (row.with_image / row.total * 100).toFixed(1);
  console.log(`  ${row.domain_type}: ${row.with_image}/${row.total} image var (%${pct}), ${row.missing} eksik`);
}

// 2. Hangi brand'lerin imageli ürünleri en eksik
console.log('\n## En çok image eksiği olan brand\'ler (published ürünlerden)');
const r2 = await c.query(`
  SELECT b.brand_name, b.brand_slug,
    COUNT(*) as total,
    SUM(CASE WHEN EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id) THEN 0 ELSE 1 END) as missing
  FROM products p JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.status = 'published'
  GROUP BY b.brand_name, b.brand_slug
  HAVING SUM(CASE WHEN EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id) THEN 0 ELSE 1 END) > 0
  ORDER BY missing DESC LIMIT 20
`);
for (const row of r2.rows) console.log(`  ${row.brand_slug}: ${row.missing}/${row.total} eksik`);

// 3. Yeni eklenen 27 üründen image yok olanlar
const NEW_IDS = [2691,2692,2693,2694,2695,2696,2697,2698,2699,2700,2701,2702,2703,2704,2705,2706,2707,2708,2709,2710,2711,2712,2713,2714,2715,2716,2717];
console.log('\n## Bu sessionda eklenen 27 ürünün image durumu');
const r3 = await c.query(`
  SELECT p.product_id, p.product_name, p.product_slug,
    (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY sort_order LIMIT 1) as image_url
  FROM products p WHERE p.product_id = ANY($1::int[]) ORDER BY p.product_id
`, [NEW_IDS]);
let missingCount = 0;
for (const row of r3.rows) {
  const status = row.image_url ? 'Y' : 'N';
  if (!row.image_url) missingCount++;
  console.log(`  [${row.product_id}] img:${status} | ${row.product_slug}`);
}
console.log(`  TOPLAM EKSİK: ${missingCount}/27`);

// 4. Broken image URL kontrolü — placehold patterns / data:image / shopifyCdn dış
console.log('\n## Şüpheli image URL\'leri (data:image, /skincare/, /products gibi catalog path)');
const r4 = await c.query(`
  SELECT p.product_id, p.product_name, pi.image_url
  FROM product_images pi
  JOIN products p ON p.product_id = pi.product_id
  WHERE p.status = 'published'
    AND (
      pi.image_url LIKE 'data:%'
      OR pi.image_url LIKE '%/skincare/%' AND pi.image_url NOT LIKE '%.jpg' AND pi.image_url NOT LIKE '%.png' AND pi.image_url NOT LIKE '%.webp'
      OR pi.image_url LIKE '%[product-image-path]%'
      OR pi.image_url LIKE '%placeholder%'
      OR pi.image_url LIKE '%CeraVe-Baby-%'
    )
  ORDER BY p.product_id LIMIT 30
`);
for (const row of r4.rows) console.log(`  [${row.product_id}] ${row.image_url} | ${row.product_name.slice(0,50)}`);

await c.end();
