/**
 * Shared pg client factory for onboarding scripts. Mirrors seed-*.js convention
 * (Neon → ssl rejectUnauthorized:false, DATABASE_URL from monorepo .env).
 */
import { Client, Pool } from 'pg';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: path.resolve(__dirname, '../../../../../.env') });

export function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL yok — .env kontrol et.');
  }
  return url;
}

export function newClient(): Client {
  return new Client({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
  });
}

export function newPool(max = 4): Pool {
  return new Pool({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
    max,
  });
}
