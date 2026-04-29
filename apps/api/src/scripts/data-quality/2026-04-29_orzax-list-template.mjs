import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE b.brand_slug='orzax' AND p.domain_type='supplement' AND p.status='published'
    AND NOT EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id=p.product_id)
  ORDER BY p.product_name
`);
console.log(`Orzax INCI'siz takviye: ${r.rowCount}`);

// CSV template
let csv = 'product_id,product_name,ingredient_name_tr,amount,unit,sort_order\n';
csv += '# Bu CSV\'yi her ürünün besin değerleri ile doldur. Boş bırak satırlarını sil.\n';
csv += '# Örnek format:\n';
csv += '# 2734,Nutraxin Iron Max,Demir,17,mg,1\n';
csv += '# 2734,Nutraxin Iron Max,Vitamin C,80,mg,2\n';
csv += '# unit: mg / mcg / IU / g / ml\n\n';
for (const row of r.rows) {
  csv += `# ${row.product_id} - ${row.product_name}\n`;
  csv += `${row.product_id},"${row.product_name}",,,,1\n`;
  csv += `${row.product_id},"${row.product_name}",,,,2\n`;
  csv += `${row.product_id},"${row.product_name}",,,,3\n\n`;
}

const csvPath = resolve(__dirname, '../../../../../ORZAX_INCI_TEMPLATE.csv');
writeFileSync(csvPath, csv, 'utf8');
console.log(`Template: ${csvPath}`);

await c.end();
