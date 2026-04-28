import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const slugs = process.argv.slice(2);
for (const slug of slugs) {
  const r = await c.query(`SELECT product_id, product_name FROM products WHERE product_slug = $1`, [slug]);
  console.log(`${slug}: ${r.rows[0] ? `EXISTS [${r.rows[0].product_id}] ${r.rows[0].product_name}` : 'NOT FOUND'}`);
}
await c.end();
