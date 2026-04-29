import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log('## Yayında olan ürünlerin görsel kapsamı (status published+active)');
const overall = await c.query(`
  SELECT p.domain_type,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id)) AS with_image
  FROM products p
  WHERE p.status IN ('published','active')
  GROUP BY p.domain_type
`);
for (const r of overall.rows) {
  const pct = ((r.with_image / r.total) * 100).toFixed(1);
  console.log(`  ${r.domain_type.padEnd(12)} ${r.with_image}/${r.total} (${pct}%)`);
}

console.log('\n## Görselsiz yayında ürünler (marka kırılımı, top 15)');
const missing = await c.query(`
  SELECT b.brand_slug, p.domain_type, COUNT(*) AS missing_count
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id)
  GROUP BY b.brand_slug, p.domain_type
  ORDER BY missing_count DESC
  LIMIT 15
`);
for (const r of missing.rows) {
  console.log(`  ${r.brand_slug.padEnd(30)} ${r.domain_type.padEnd(12)} ${r.missing_count}`);
}

console.log('\n## Toplam görselsiz yayında ürün sayısı');
const total_missing = await c.query(`
  SELECT COUNT(*) AS n
  FROM products p
  WHERE p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id)
`);
console.log(`  ${total_missing.rows[0].n}`);

await c.end();
