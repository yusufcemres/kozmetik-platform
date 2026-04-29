import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const total = await c.query(`SELECT COUNT(*) FROM content_articles`);
const published = await c.query(`SELECT COUNT(*) FROM content_articles WHERE status='published'`);
const byType = await c.query(`
  SELECT content_type, COUNT(*) AS n
  FROM content_articles
  WHERE status='published'
  GROUP BY content_type
  ORDER BY n DESC
`);

console.log(`## content_articles Tablosu`);
console.log(`Toplam: ${total.rows[0].count}`);
console.log(`Published: ${published.rows[0].count}\n`);

console.log(`Tipe göre dağılım:`);
for (const r of byType.rows) {
  console.log(`  ${r.content_type.padEnd(30)} ${r.n}`);
}

await c.end();
