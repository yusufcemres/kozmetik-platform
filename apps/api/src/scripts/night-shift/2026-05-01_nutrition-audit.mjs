import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// supplement_ingredients tablosu kolonları
const cols = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='supplement_ingredients' ORDER BY ordinal_position`);
console.log('## supplement_ingredients columns:');
for (const r of cols.rows) console.log(`  ${r.column_name.padEnd(30)} ${r.data_type}`);

// Toplam published takviye + supplement_ingredients sayısı kırılımı
const total = await c.query(`SELECT COUNT(*) FROM products WHERE domain_type='supplement' AND status IN ('published','active')`);
console.log(`\n## Yayında takviye: ${total.rows[0].count}`);

const withFacts = await c.query(`
  SELECT COUNT(DISTINCT p.product_id)
  FROM products p
  JOIN supplement_ingredients si ON si.product_id = p.product_id
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
`);
console.log(`supplement_ingredients olan: ${withFacts.rows[0].count}`);

const without = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_name
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id = p.product_id)
  ORDER BY b.brand_name, p.product_name
`);
console.log(`\n## Besin değerleri EKSİK takviye: ${without.rows.length}\n`);

const byBrand = {};
for (const r of without.rows) {
  byBrand[r.brand_name] = (byBrand[r.brand_name] || []);
  byBrand[r.brand_name].push(r);
}

for (const [brand, items] of Object.entries(byBrand)) {
  console.log(`### ${brand} (${items.length})`);
  for (const it of items.slice(0, 10)) {
    console.log(`  ${it.product_id} | ${it.product_slug}`);
  }
  if (items.length > 10) console.log(`  ... +${items.length - 10} daha`);
  console.log('');
}

await c.end();
