import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const cols = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='brands' ORDER BY ordinal_position`);
console.log('brands columns:');
for (const r of cols.rows) console.log(`  ${r.column_name.padEnd(25)} ${r.data_type}`);

// Logo eksik markalar
const missing = await c.query(`
  SELECT brand_id, brand_slug, brand_name, logo_url
  FROM brands
  WHERE (logo_url IS NULL OR logo_url = '')
    AND EXISTS (SELECT 1 FROM products p WHERE p.brand_id = brands.brand_id AND p.status IN ('published','active'))
  ORDER BY brand_name
`);

console.log(`\nLogo eksik aktif marka: ${missing.rows.length}`);
for (const r of missing.rows) console.log(`  ${r.brand_slug.padEnd(40)} | ${r.brand_name}`);

await c.end();
