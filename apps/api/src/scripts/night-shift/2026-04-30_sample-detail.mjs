import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(`
  SELECT ingredient_slug, inci_name, common_name, detailed_description
  FROM ingredients
  WHERE ingredient_slug IN ('niacinamide', 'salicylic-acid', 'phenoxyethanol')
  AND detailed_description IS NOT NULL
`);

for (const row of r.rows) {
  console.log('### ' + row.ingredient_slug + ' (' + (row.common_name || '-') + ')');
  console.log('---');
  console.log(row.detailed_description);
  console.log('\n========================================\n');
}

await c.end();
