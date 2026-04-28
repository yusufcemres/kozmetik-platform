import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log('═══════════════════════════════════════');
console.log('REVELA STRUCTURAL AUDIT — 2026-04-27');
console.log('═══════════════════════════════════════\n');

// 1. Brand country_of_origin status (#6 Türkiye chip)
console.log('## #6 — BRAND country_of_origin DURUMU');
const r1 = await c.query(`
  SELECT COALESCE(country_of_origin, 'NULL') as country, COUNT(*) as n
  FROM brands GROUP BY country_of_origin ORDER BY n DESC
`);
for (const row of r1.rows) console.log(`  ${row.country}: ${row.n}`);

// 1b. Türk markalar tahmin (slug pattern)
const r1b = await c.query(`
  SELECT brand_slug, brand_name, country_of_origin
  FROM brands
  WHERE country_of_origin IS NULL
    AND brand_slug = ANY(ARRAY['bebak','dermoskin','doa','hunca','incia','marjinal','procsin','rosense',
       'sinoz','licape','ph-lab','wlab','the-ceel','resetify','the-purest-solutions','cream-co',
       'frudia','isana','farmasi','golden-rose','flormar','watsons','bee-beauty','nivea',
       'bebek-isvicre','nuxe','klorane','caudalie','vichy','la-roche-posay','eucerin','avene',
       'bioderma','cerave','cosmed','cosmica'])
  ORDER BY brand_slug
`);
console.log(`\n  Türk olabilecek + NULL country: ${r1b.rows.length}`);
for (const row of r1b.rows) console.log(`    ${row.brand_slug} → ${row.brand_name}`);

// 2. needs.domain_affinity kolonu var mı (#9)
console.log('\n## #9 — needs.domain_affinity KOLONU');
const r2 = await c.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name='needs' AND column_name IN ('domain_affinity','domain_type')
`);
console.log(`  Kolon var mı: ${r2.rows.length > 0 ? r2.rows.map(r=>r.column_name).join(',') : 'YOK'}`);

// 2b. needs içerik
const r2b = await c.query(`SELECT need_id, need_name, need_slug FROM needs ORDER BY need_id LIMIT 30`);
console.log(`  Toplam needs: ${r2b.rows.length} (ilk 30):`);
for (const row of r2b.rows) console.log(`    [${row.need_id}] ${row.need_name} (${row.need_slug})`);

// 3. Articles (#7 Rehber)
console.log('\n## #7 — REHBER (articles) DURUMU');
const r3 = await c.query(`
  SELECT content_type, status, COUNT(*) FROM articles GROUP BY content_type, status ORDER BY content_type, status
`);
if (!r3.rows.length) {
  // Schema yok mu?
  const r3a = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_name='articles'`);
  console.log(`  articles tablosu: ${r3a.rows.length > 0 ? 'VAR ama BOŞ' : 'YOK'}`);
} else {
  for (const row of r3.rows) console.log(`  ${row.content_type} (${row.status}): ${row.count}`);
}

// 4. concentration_percent NULL rate (#10)
console.log('\n## #10 — KOZMETİK concentration_percent NULL ORANI');
const r4 = await c.query(`
  SELECT
    COUNT(*) as total,
    COUNT(pi.concentration_percent) as has_value,
    COUNT(*) - COUNT(pi.concentration_percent) as is_null,
    ROUND(100.0 * COUNT(pi.concentration_percent) / COUNT(*), 2) as has_pct
  FROM product_ingredients pi
  JOIN products p ON p.product_id = pi.product_id
  WHERE p.domain_type = 'cosmetic'
`);
const row4 = r4.rows[0];
console.log(`  Toplam INCI satır: ${row4.total}`);
console.log(`  concentration_percent dolu: ${row4.has_value} (%${row4.has_pct})`);
console.log(`  NULL: ${row4.is_null}`);

// concentration_band durumu (alternatif)
const r4b = await c.query(`
  SELECT concentration_band, COUNT(*) FROM product_ingredients pi
  JOIN products p ON p.product_id=pi.product_id WHERE p.domain_type='cosmetic'
  GROUP BY concentration_band ORDER BY count DESC
`);
console.log(`  concentration_band dağılımı:`);
for (const row of r4b.rows) console.log(`    ${row.concentration_band || 'NULL'}: ${row.count}`);

// 5. Profile persistence — user_skin_profiles vs user_profiles tabloları (#3)
console.log('\n## #3 — PROFİL PERSISTENCE (user tabloları)');
const r5 = await c.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema='public' AND (table_name LIKE 'user%' OR table_name LIKE '%profile%' OR table_name LIKE '%favorite%' OR table_name LIKE '%routine%')
  ORDER BY table_name
`);
for (const row of r5.rows) console.log(`  ${row.table_name}`);

// 5b. user_skin_profiles columns (varsa)
const r5b = await c.query(`
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_name='user_skin_profiles' ORDER BY ordinal_position
`);
if (r5b.rows.length) {
  console.log(`  user_skin_profiles kolonları:`);
  for (const row of r5b.rows) console.log(`    ${row.column_name}: ${row.data_type}`);
} else {
  console.log(`  user_skin_profiles tablosu: YOK (Profile localStorage-only)`);
}

// 6. Cosmetic with weird need scores (Kemik&Eklem on cosmetic etc - #12)
console.log('\n## #12 — KOZMETİK x SUPPLEMENT-ONLY NEED skoru (anomali)');
const r6 = await c.query(`
  SELECT n.need_name, COUNT(*) as products_count
  FROM product_need_scores pns
  JOIN products p ON p.product_id = pns.product_id
  JOIN needs n ON n.need_id = pns.need_id
  WHERE p.domain_type = 'cosmetic'
    AND n.need_slug IN ('bagisiklik-destekleme','kemik-eklem-sagligi','kalp-damar-sagligi','sindirim-probiyotik',
                        'enerji-metabolizma','uyku-kalitesi','stres-anksiyete','hafiza-konsantrasyon')
  GROUP BY n.need_name ORDER BY products_count DESC
`);
console.log(`  Kozmetik üründe supplement-only ihtiyaç skoru olan kalemler:`);
for (const row of r6.rows) console.log(`    ${row.need_name}: ${row.products_count} kozmetik`);

// 7. Cross-domain product recommendations (#5)
console.log('\n## #5 — CROSS-DOMAIN ÖNERİ KAYNAKLARI');
const r7 = await c.query(`
  SELECT
    SUM(CASE WHEN p.domain_type='supplement' THEN 1 ELSE 0 END) as supplements,
    SUM(CASE WHEN p.domain_type='cosmetic' THEN 1 ELSE 0 END) as cosmetics
  FROM products p WHERE p.status='published'
`);
console.log(`  Published cosmetic: ${r7.rows[0].cosmetics}, supplement: ${r7.rows[0].supplements}`);

// 8. Bana göre / personal score endpoint (does code path exist?)
console.log('\n## DİĞER KONTROLLER');
const r8 = await c.query(`SELECT COUNT(*) FROM products WHERE status='published'`);
console.log(`  Toplam published ürün: ${r8.rows[0].count}`);

const r9 = await c.query(`
  SELECT p.domain_type, COUNT(DISTINCT pns.product_id) as scored
  FROM products p LEFT JOIN product_need_scores pns ON pns.product_id=p.product_id
  WHERE p.status='published' GROUP BY p.domain_type
`);
console.log(`  Need score'u olan ürünler:`);
for (const row of r9.rows) console.log(`    ${row.domain_type}: ${row.scored}`);

await c.end();
