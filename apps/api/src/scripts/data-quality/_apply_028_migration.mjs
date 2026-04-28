import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS brand_description TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER,
  ADD COLUMN IF NOT EXISTS signature_categories TEXT[],
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(160)`);
console.log('Migration 028 applied');
const r = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='brands' ORDER BY ordinal_position`);
console.log('brands cols:', r.rows.map(x=>x.column_name).join(', '));
await c.end();
