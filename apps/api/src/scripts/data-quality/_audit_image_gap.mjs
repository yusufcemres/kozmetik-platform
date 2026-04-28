import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// 1) Domain breakdown
const r1 = await c.query(`SELECT domain_type, status, COUNT(*) FROM products GROUP BY domain_type, status ORDER BY domain_type, status`);
console.log('## Ürün dağılımı');
for (const r of r1.rows) console.log(`  ${r.domain_type.padEnd(12)} | ${r.status.padEnd(12)} | ${r.count}`);

// 2) Image coverage
const r2 = await c.query(`
SELECT
  p.domain_type,
  COUNT(*) FILTER (WHERE p.status='published') as published,
  COUNT(*) FILTER (WHERE p.status='published' AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)) as with_image,
  COUNT(*) FILTER (WHERE p.status='published' AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)) as without_image
FROM products p
GROUP BY p.domain_type
ORDER BY p.domain_type
`);
console.log('\n## Görsel kapsamı (published)');
for (const r of r2.rows) {
  const pct = r.published > 0 ? Math.round((r.with_image / r.published) * 100) : 0;
  console.log(`  ${r.domain_type.padEnd(12)} | toplam: ${r.published} | gorsel: ${r.with_image} (%${pct}) | eksik: ${r.without_image}`);
}

// 3) Brand level breakdown for supplements without image
const r3 = await c.query(`
SELECT b.brand_name, COUNT(*) as missing
FROM products p
JOIN brands b ON b.brand_id = p.brand_id
WHERE p.domain_type='supplement' AND p.status='published'
  AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)
GROUP BY b.brand_name
ORDER BY missing DESC
LIMIT 20
`);
console.log('\n## Görselsiz takviyeler — marka top 20');
for (const r of r3.rows) console.log(`  ${r.brand_name.padEnd(35)} | eksik: ${r.missing}`);

// 4) Brand level breakdown for cosmetics without image
const r4 = await c.query(`
SELECT b.brand_name, COUNT(*) as missing
FROM products p
JOIN brands b ON b.brand_id = p.brand_id
WHERE p.domain_type='cosmetic' AND p.status='published'
  AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)
GROUP BY b.brand_name
ORDER BY missing DESC
LIMIT 10
`);
console.log('\n## Görselsiz kozmetikler — marka top 10');
for (const r of r4.rows) console.log(`  ${r.brand_name.padEnd(35)} | eksik: ${r.missing}`);

// 5) Brand schema discovery
const r5cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='brands' ORDER BY ordinal_position`);
console.log('\n## Brands schema:');
console.log('  ' + r5cols.rows.map(x => x.column_name).join(', '));

const r5 = await c.query(`
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE logo_url IS NOT NULL AND logo_url <> '') as with_logo,
  COUNT(*) FILTER (WHERE country_of_origin IS NOT NULL AND country_of_origin <> '') as with_country
FROM brands
`);
const b = r5.rows[0];
console.log('\n## Marka veri kapsamı');
console.log(`  toplam: ${b.total} | logo: ${b.with_logo} (%${Math.round(b.with_logo/b.total*100)}) | ulke: ${b.with_country}`);

// 6) Need detay tablo doluluk (FAQ, interaction, vs)
const r6 = await c.query(`
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE description IS NOT NULL AND length(description) > 50) as with_desc
FROM needs
`);
const n = r6.rows[0];
console.log('\n## Need (ihtiyaç) veri kapsamı');
console.log(`  toplam: ${n.total} | aciklama: ${n.with_desc}`);

// 7) Articles tablosu doluluk
try {
  const r7 = await c.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='published') as published FROM articles`);
  console.log(`\n## Articles (rehber): toplam ${r7.rows[0].total} | yayinda: ${r7.rows[0].published}`);
} catch (e) {
  console.log('\n## Articles tablosu yok veya schema farkli');
}

// 8) Ingredient açıklama coverage
const r8 = await c.query(`
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE function_summary IS NOT NULL AND length(function_summary) > 30) as with_func,
  COUNT(*) FILTER (WHERE common_name IS NOT NULL) as with_trivial
FROM ingredients
`);
const ing = r8.rows[0];
console.log(`\n## Ingredient veri kapsami: toplam ${ing.total} | function_summary: ${ing.with_func} (%${Math.round(ing.with_func/ing.total*100)}) | trivial isim: ${ing.with_trivial}`);

await c.end();
