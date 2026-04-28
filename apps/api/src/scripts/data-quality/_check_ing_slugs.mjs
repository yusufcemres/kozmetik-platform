import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const args = process.argv.slice(2);
if (args[0] === '--search') {
  const q = args[1];
  const r = await client.query(`SELECT ingredient_slug, inci_name, common_name, domain_type FROM ingredients WHERE ingredient_slug ILIKE $1 OR inci_name ILIKE $1 OR common_name ILIKE $1 ORDER BY ingredient_slug LIMIT 50`, [`%${q}%`]);
  for (const row of r.rows) console.log(`  ${row.ingredient_slug}  [${row.domain_type}]  | inci=${row.inci_name} | common=${row.common_name || ''}`);
} else if (args[0] === '--list-domain') {
  const dom = args[1];
  const r = await client.query(`SELECT ingredient_slug, inci_name FROM ingredients WHERE domain_type = $1 OR domain_type = 'both' ORDER BY ingredient_slug`, [dom]);
  console.log(`# ${dom} ingredients: ${r.rows.length}`);
  for (const row of r.rows) console.log(`${row.ingredient_slug}\t${row.inci_name}`);
}
await client.end();
