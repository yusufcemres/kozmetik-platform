import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

const ROOT = path.resolve(__dirname, '../../../../..');
dotenv.config({ path: path.join(ROOT, '.env') });

const READY_DIR = path.join(ROOT, 'apps/api/src/database/seeds/products-queue/_ready');

async function main() {
  const readyFiles = fs.readdirSync(READY_DIR).filter((f) => f.startsWith('orzax-') && f.endsWith('.json'));
  console.log(`Total ready: ${readyFiles.length}`);

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Discover correct name column
  const colRes = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name='products' ORDER BY ordinal_position
  `);
  const colNames = colRes.rows.map((r: any) => r.column_name);
  const nameCol = colNames.includes('product_name')
    ? 'product_name'
    : colNames.includes('title')
    ? 'title'
    : colNames.find((c: string) => c.includes('name'));
  console.log(`products columns: ${colNames.join(', ')}`);
  console.log(`Using name column: ${nameCol}`);

  const { rows } = await client.query(
    `SELECT LOWER(p.${nameCol}) AS n FROM products p
     JOIN brands b ON b.brand_id = p.brand_id
     WHERE b.brand_slug = 'orzax'`,
  );
  const dbNames = new Set(rows.map((r: any) => r.n));
  console.log(`DB orzax names: ${dbNames.size}`);

  const newOnes: string[] = [];
  for (const f of readyFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(READY_DIR, f), 'utf8'));
    const productName = j.product?.product_name;
    if (!productName) {
      console.log(`  [WARN] ${f} has no product_name`);
      continue;
    }
    const key = productName.toLowerCase().trim();
    if (!dbNames.has(key)) {
      newOnes.push(f);
    }
  }
  console.log(`\nNew to onboard (${newOnes.length}):`);
  newOnes.forEach((n) => console.log(`  ${n}`));
  // Write list to a file for the batch onboarder
  fs.writeFileSync(
    path.join(ROOT, 'night-shift/logs/supplement-sprint/new-to-onboard.txt'),
    newOnes.join('\n') + '\n',
  );
  console.log('\nList written to: night-shift/logs/supplement-sprint/new-to-onboard.txt');
  await client.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
