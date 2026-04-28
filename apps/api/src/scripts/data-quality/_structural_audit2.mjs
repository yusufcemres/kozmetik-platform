import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log('═══ STRUCTURAL AUDIT v2 ═══\n');

// 1. needs.domain_type detay (#9 — kozmetik domain'de supplement-only ihtiyaçlar var mı?)
console.log('## #9 — needs.domain_type DURUMU');
const r1 = await c.query(`SELECT need_id, need_name, need_slug, domain_type FROM needs ORDER BY domain_type, need_id`);
const byDomain = new Map();
for (const row of r1.rows) {
  if (!byDomain.has(row.domain_type)) byDomain.set(row.domain_type, []);
  byDomain.get(row.domain_type).push(row);
}
for (const [domain, needs] of byDomain) {
  console.log(`\n  ${domain || 'NULL'}: ${needs.length}`);
  for (const n of needs) console.log(`    [${n.need_id}] ${n.need_name}`);
}

// 2. Articles benzeri tablo var mı (#7 Rehber)
console.log('\n## #7 — REHBER tablo arama');
const r2 = await c.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema='public' AND (
    table_name LIKE '%article%' OR table_name LIKE '%post%' OR table_name LIKE '%content%' OR
    table_name LIKE '%blog%' OR table_name LIKE '%guide%' OR table_name LIKE '%rehber%'
  )
  ORDER BY table_name
`);
console.log(`  Bulunan tablolar:`);
for (const row of r2.rows) console.log(`    ${row.table_name}`);

// 3. Rehber sayfası ne kullanıyor?
console.log('\n## #10 — KOZMETİK concentration_percent vs concentration_band');
const r3 = await c.query(`
  SELECT
    SUM(CASE WHEN pi.concentration_percent IS NULL THEN 1 ELSE 0 END) as pct_null,
    SUM(CASE WHEN pi.concentration_percent IS NOT NULL THEN 1 ELSE 0 END) as pct_filled,
    SUM(CASE WHEN pi.concentration_band IS NULL OR pi.concentration_band = 'unknown' THEN 1 ELSE 0 END) as band_unknown,
    SUM(CASE WHEN pi.concentration_band IS NOT NULL AND pi.concentration_band <> 'unknown' THEN 1 ELSE 0 END) as band_filled,
    COUNT(*) as total
  FROM product_ingredients pi
  JOIN products p ON p.product_id = pi.product_id
  WHERE p.domain_type = 'cosmetic' AND p.status = 'published'
`);
const row3 = r3.rows[0];
console.log(`  Toplam INCI satır: ${row3.total}`);
console.log(`  concentration_percent dolu: ${row3.pct_filled} (%${(row3.pct_filled/row3.total*100).toFixed(2)})`);
console.log(`  concentration_band dolu: ${row3.band_filled} (%${(row3.band_filled/row3.total*100).toFixed(2)})`);

// 4. user_skin_profiles var mı (#3)
console.log('\n## #3 — PROFİL PERSISTENCE');
const r4 = await c.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema='public' AND (
    table_name LIKE 'user%' OR table_name LIKE '%profile%' OR table_name LIKE '%favorite%' OR table_name LIKE '%routine%'
  )
  ORDER BY table_name
`);
for (const row of r4.rows) console.log(`  ${row.table_name}`);

// 5. Cosmetic supplement-only need score anomalisi (#12)
console.log('\n## #12 — KOZMETİK x SUPPLEMENT-ONLY NEED skoru anomalisi');
const r5 = await c.query(`
  SELECT n.need_name, n.domain_type, COUNT(*) as cosmetic_count
  FROM product_need_scores pns
  JOIN products p ON p.product_id = pns.product_id
  JOIN needs n ON n.need_id = pns.need_id
  WHERE p.domain_type = 'cosmetic' AND n.domain_type = 'supplement'
  GROUP BY n.need_name, n.domain_type
  ORDER BY cosmetic_count DESC
`);
console.log(`  Kozmetik üründe SUPPLEMENT-only ihtiyaç skoru:`);
if (r5.rows.length === 0) {
  console.log(`    YOK (temiz)`);
} else {
  for (const row of r5.rows) console.log(`    ${row.need_name}: ${row.cosmetic_count} kozmetik`);
}

// 6. Supplement x cosmetic-only
console.log('\n## #12b — SUPPLEMENT x COSMETIC-ONLY NEED skoru');
const r6 = await c.query(`
  SELECT n.need_name, COUNT(*) as supp_count
  FROM product_need_scores pns
  JOIN products p ON p.product_id = pns.product_id
  JOIN needs n ON n.need_id = pns.need_id
  WHERE p.domain_type = 'supplement' AND n.domain_type = 'cosmetic'
  GROUP BY n.need_name ORDER BY supp_count DESC
`);
if (r6.rows.length === 0) console.log(`  YOK (temiz)`);
else for (const row of r6.rows) console.log(`  ${row.need_name}: ${row.supp_count} supplement`);

// 7. /rehber endpoint hangi data source?
console.log('\n## #7b — Tüm tablolar listesi');
const r7 = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
console.log(`  Tablolar:`);
for (const row of r7.rows) console.log(`    ${row.table_name}`);

await c.end();
