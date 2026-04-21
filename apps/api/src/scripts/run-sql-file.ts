/**
 * One-shot SQL file runner.
 *
 * Reads DATABASE_URL from .env (monorepo root) and executes the given SQL file
 * as a single multi-statement transaction. Safe for idempotent seeds with
 * ON CONFLICT / ON CONFLICT DO UPDATE clauses.
 *
 * Usage:
 *   ts-node src/scripts/run-sql-file.ts <path-to.sql>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: ts-node run-sql-file.ts <path-to.sql>');
    process.exit(1);
  }

  // monorepo root .env
  dotenv.config({ path: resolve(__dirname, '../../../../.env') });
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL missing in .env');
    process.exit(1);
  }

  const sql = readFileSync(resolve(file), 'utf8');
  console.log(`Executing ${file} (${sql.length} chars) against DATABASE_URL...`);

  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    const started = Date.now();
    await client.query(sql);
    console.log(`OK in ${Date.now() - started}ms`);
  } catch (err) {
    console.error('SQL execution failed:', err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
