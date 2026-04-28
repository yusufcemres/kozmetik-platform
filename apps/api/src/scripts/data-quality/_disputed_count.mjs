import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(`SELECT
  COUNT(*) FILTER (WHERE endocrine_flag=true) as endocrine,
  COUNT(*) FILTER (WHERE eu_banned=true) as eu_ban,
  COUNT(*) FILTER (WHERE cmr_class IS NOT NULL) as cmr,
  COUNT(*) FILTER (WHERE safety_class='harmful') as harmful,
  COUNT(*) FILTER (WHERE allergen_flag=true) as allergen,
  COUNT(*) FILTER (WHERE fragrance_flag=true) as fragrance,
  COUNT(*) FILTER (WHERE detailed_description IS NOT NULL AND length(detailed_description) > 50) as detail_full,
  COUNT(*) FILTER (WHERE function_summary IS NOT NULL AND length(function_summary) > 30) as func_full
FROM ingredients`);
console.log(JSON.stringify(r.rows[0], null, 2));
await c.end();
