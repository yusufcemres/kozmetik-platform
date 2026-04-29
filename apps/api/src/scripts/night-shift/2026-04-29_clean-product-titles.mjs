import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Faz 6 ürünleri (Sekate alt_text)
const r = await c.query(`
  SELECT p.product_id, p.product_name
  FROM products p
  WHERE p.domain_type='supplement' AND p.status='published'
    AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id AND i.alt_text LIKE '%sekate%')
    AND (p.product_name LIKE '%&amp;%' OR p.product_name LIKE '%&gt;%' OR p.product_name LIKE '% - Vitamin ve%' OR p.product_name LIKE '% - Güçlü%')
`);
console.log(`Cleanup gerekli: ${r.rowCount}`);

function decodeHtml(s) {
  return s
    .replace(/&amp;gt;/g, '>')
    .replace(/&amp;lt;/g, '<')
    .replace(/&amp;amp;/g, '&')
    .replace(/&amp;#039;/g, "'")
    .replace(/&amp;quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

function cleanTitle(t) {
  let s = decodeHtml(t);
  // Sekate suffix patterns: " - Vitamin ve Destek > Diğer ..."
  s = s.replace(/\s*-\s*Vitamin ve Destek.*$/i, '');
  s = s.replace(/\s*-\s*Güçlü ve Etkili.*$/i, '');
  s = s.replace(/\s*-\s*Karamürver.*$/i, '');
  s = s.replace(/\s*-\s*Glukozamin Destekli.*$/i, '');
  s = s.replace(/\s*-\s*Kapsam.*$/i, '');
  s = s.replace(/\s*-\s*Çiğneme Tablet.*$/i, '');
  s = s.replace(/\s*-\s*Yeni Nesil.*$/i, '');
  s = s.replace(/\s*\|\s*.*$/, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

let updated = 0;
for (const x of r.rows) {
  const cleaned = cleanTitle(x.product_name);
  if (cleaned !== x.product_name && cleaned.length > 5) {
    await c.query(`UPDATE products SET product_name=$2 WHERE product_id=$1`, [x.product_id, cleaned.slice(0, 250)]);
    updated++;
    console.log(`  ${x.product_id}: "${x.product_name.slice(0,55)}" → "${cleaned.slice(0,55)}"`);
  }
}
console.log(`\n${updated}/${r.rowCount} update`);
await c.end();
