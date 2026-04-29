import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const r = await c.query(`
  SELECT ingredient_slug, common_name,
         LENGTH(detailed_description) AS len,
         (LENGTH(detailed_description) - LENGTH(REPLACE(detailed_description, '##', ''))) / 2 AS sections,
         detailed_description
  FROM ingredients
  WHERE detailed_description IS NOT NULL AND detailed_description != ''
  ORDER BY len DESC
`);

console.log(`Toplam detail dolu: ${r.rows.length}\n`);

let full = 0, partial = 0, stub = 0;
const fullList = [], partialList = [], stubList = [];
for (const row of r.rows) {
  // Heuristik: section sayısı * 200 char'dan az → eksik
  const expected = (row.sections || 0) * 200;
  let cat;
  if (row.len >= 1500) { full++; fullList.push(row); cat = 'FULL'; }
  else if (row.len >= 500) { partial++; partialList.push(row); cat = 'PART'; }
  else { stub++; stubList.push(row); cat = 'STUB'; }
}

console.log(`FULL  (≥1500 char): ${full}`);
console.log(`PART  (500-1500): ${partial}`);
console.log(`STUB  (<500): ${stub}\n`);

console.log('=== STUBS (en doldurulmaya muhtaç) ===');
for (const row of stubList.slice(0, 30)) {
  console.log(`  ${String(row.len).padStart(4)} char | ${row.ingredient_slug.padEnd(35)} | ${row.common_name || '-'}`);
}

console.log('\n=== PARTIALS (yarım) ===');
for (const row of partialList) {
  console.log(`  ${String(row.len).padStart(4)} char | ${row.ingredient_slug.padEnd(35)} | ${row.common_name || '-'}`);
}

console.log('\n=== FULLS (tam) ===');
for (const row of fullList) {
  console.log(`  ${String(row.len).padStart(4)} char | ${row.ingredient_slug.padEnd(35)} | ${row.common_name || '-'}`);
}

await c.end();
