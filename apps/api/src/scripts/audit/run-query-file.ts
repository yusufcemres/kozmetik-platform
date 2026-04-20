/**
 * Execute a read-only query file against prod DB and print rows as JSON.
 * Usage: ts-node run-query-file.ts <path-to.sql>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('Usage: run-query-file.ts <path>'); process.exit(1); }

  dotenv.config({ path: resolve(__dirname, '../../../../../.env') });
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL missing'); process.exit(1); }

  const sql = readFileSync(resolve(file), 'utf8');
  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    // Split on ';' for simple multi-statement query printing.
    const statements = sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      const res = await client.query(stmt);
      if (res.rows?.length) {
        console.log(JSON.stringify(res.rows, null, 2));
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
