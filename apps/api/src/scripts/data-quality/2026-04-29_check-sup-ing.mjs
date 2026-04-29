import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
for (const t of ['supplement_ingredients','supplement_details']) {
  const r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1`, [t]);
  console.log(`\n## ${t}:`);
  for (const x of r.rows) console.log(`  ${x.column_name.padEnd(28)} ${x.data_type}`);
}
const sample = await c.query(`SELECT * FROM supplement_ingredients LIMIT 2`);
console.log('\nsample sup_ing:'); for (const r of sample.rows) console.log(JSON.stringify(r,null,2).slice(0,500));
await c.end();
