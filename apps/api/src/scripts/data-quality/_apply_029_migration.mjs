import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`ALTER TABLE needs
  ADD COLUMN IF NOT EXISTS faq_json JSONB,
  ADD COLUMN IF NOT EXISTS skin_type_affinity JSONB,
  ADD COLUMN IF NOT EXISTS interaction_warnings JSONB,
  ADD COLUMN IF NOT EXISTS confused_with_json JSONB`);
console.log('Migration 029 applied');
const r = await c.query(`SELECT need_id, need_name, need_slug, domain_type FROM needs ORDER BY need_id`);
console.log('Need list:');
for (const x of r.rows) console.log(`  ${x.need_id} | ${x.need_slug.padEnd(35)} | ${x.domain_type} | ${x.need_name}`);
await c.end();
