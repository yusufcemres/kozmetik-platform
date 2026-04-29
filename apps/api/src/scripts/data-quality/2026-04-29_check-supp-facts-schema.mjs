import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const tables = ['supplement_facts','product_supplement_facts','need_scores','product_scores','product_need_scores','products'];
for (const t of tables) {
  try {
    const r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1`, [t]);
    if (r.rowCount === 0) continue;
    console.log(`\n## ${t} (${r.rowCount} cols):`);
    for (const x of r.rows) console.log(`  ${x.column_name.padEnd(30)} ${x.data_type}`);
  } catch {}
}
const sample = await c.query(`SELECT * FROM supplement_facts LIMIT 2`).catch(() => null);
if (sample) {
  console.log('\nsupplement_facts sample:');
  for (const r of sample.rows) console.log(JSON.stringify(r, null, 2).slice(0, 600));
}
await c.end();
