import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const patterns = ['%lot de %', '%lot x%', '% x2%', '% x3%', '% x4%', '% x6%', '%2x%', '%3x%', '%4x%', '%6x%', '% offre%', '%pack de%', '%duo%', '%trio%', '%coffret%'];
const q = patterns.map((p, i) => `product_name ILIKE $${i+1}`).join(' OR ');

const { rows: stats } = await client.query(
  `SELECT status, COUNT(*) as cnt FROM products WHERE (${q}) AND domain_type='cosmetic' GROUP BY status ORDER BY cnt DESC`,
  patterns
);
console.log('Status breakdown:', JSON.stringify(stats, null, 2));

const { rows: sample } = await client.query(
  `SELECT product_id, product_name, status FROM products WHERE (${q}) AND domain_type='cosmetic' ORDER BY status, product_name LIMIT 60`,
  patterns
);
console.log('\nSample:');
sample.forEach(r => console.log(`[${r.status}] ${r.product_name}`));

await client.end();
