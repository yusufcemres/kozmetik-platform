import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const cols = await c.query(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'content_articles'
  ORDER BY ordinal_position
`);

console.log('## content_articles columns:');
for (const r of cols.rows) {
  console.log(`  ${r.column_name.padEnd(30)} ${r.data_type.padEnd(20)} ${r.is_nullable} default:${r.column_default || ''}`);
}

// 1 örnek satır
const sample = await c.query(`SELECT * FROM content_articles WHERE status='published' AND content_type='ingredient_explainer' LIMIT 1`);
if (sample.rows.length) {
  console.log('\n## Sample ingredient_explainer:');
  for (const [k, v] of Object.entries(sample.rows[0])) {
    const val = typeof v === 'string' ? v.slice(0, 100) : JSON.stringify(v);
    console.log(`  ${k}: ${val}`);
  }
}

await c.end();
