// Quick read-only query runner that prints results.
// Usage: node _query.mjs "<SQL>"
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const sql = process.argv.slice(2).join(' ');
if (!sql) {
  console.error('Usage: node _query.mjs "<SQL>"');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
const client = new Client({
  connectionString: url,
  ssl: url?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});
await client.connect();
try {
  const r = await client.query(sql);
  console.log(JSON.stringify(r.rows, null, 2));
} finally {
  await client.end();
}
