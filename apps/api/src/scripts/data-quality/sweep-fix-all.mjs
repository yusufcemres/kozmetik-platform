/**
 * Kapsamlı veri kalitesi düzeltme tek-seferlik script:
 * 1. HTML çift-escape temizliği (&amp;amp; → &)
 * 2. supplement_ingredients deduplication
 * 3. product_ingredients deduplication
 * 4. supplement_details backfill (44 takviyede yoktu)
 * 5. top_need_name refresh
 * 6. Final coverage report
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

await client.connect();
console.log('=== COMPREHENSIVE DATA FIX ===\n');

// 1a. HTML escapes in short_description
const html1 = await client.query(`
  UPDATE products SET short_description =
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(short_description,
      '&amp;amp;', '&'),
      '&amp;quot;', '"'),
      '&amp;#039;', ''''),
      '&amp;', '&'),
      '&quot;', '"'),
      '&#039;', '''')
  WHERE short_description LIKE '%&amp;%' OR short_description LIKE '%&quot;%' OR short_description LIKE '%&#039;%'
`);
console.log('1a. HTML escapes fixed in short_description:', html1.rowCount);

// 1b. HTML escapes in product_name
const html2 = await client.query(`
  UPDATE products SET product_name =
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(product_name,
      '&amp;amp;', '&'),
      '&amp;quot;', '"'),
      '&amp;#039;', ''''),
      '&amp;', '&'),
      '&quot;', '"'),
      '&#039;', '''')
  WHERE product_name LIKE '%&amp;%' OR product_name LIKE '%&quot;%' OR product_name LIKE '%&#039;%'
`);
console.log('1b. HTML escapes fixed in product_name:', html2.rowCount);

// 2. Dedup supplement_ingredients (keep oldest id)
const dedupSi = await client.query(`
  DELETE FROM supplement_ingredients si
  WHERE EXISTS (
    SELECT 1 FROM supplement_ingredients si2
    WHERE si2.product_id = si.product_id
    AND si2.ingredient_id = si.ingredient_id
    AND si2.supplement_ingredient_id < si.supplement_ingredient_id
  )
`);
console.log('2. Duplicate supplement_ingredients removed:', dedupSi.rowCount);

// 3. Dedup product_ingredients (keep oldest id)
const dedupPi = await client.query(`
  DELETE FROM product_ingredients pi
  WHERE pi.ingredient_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM product_ingredients pi2
    WHERE pi2.product_id = pi.product_id
    AND pi2.ingredient_id = pi.ingredient_id
    AND pi2.product_ingredient_id < pi.product_ingredient_id
  )
`);
console.log('3. Duplicate product_ingredients removed:', dedupPi.rowCount);

// 4. Backfill supplement_details for 44 missing
const sdBackfill = await client.query(`
  INSERT INTO supplement_details (
    product_id, form, serving_size, servings_per_container,
    recommended_use, warnings, requires_prescription,
    manufacturer_country, certification, created_at, updated_at
  )
  SELECT
    p.product_id,
    CASE
      WHEN p.product_name ILIKE '%softgel%' THEN 'softgel'
      WHEN p.product_name ILIKE '%kapsül%' OR p.product_name ILIKE '%kapsul%' THEN 'capsule'
      WHEN p.product_name ILIKE '%çiğneme%' THEN 'tablet'
      WHEN p.product_name ILIKE '%tablet%' THEN 'tablet'
      WHEN p.product_name ILIKE '%sprey%' OR p.product_name ILIKE '%spray%' THEN 'spray'
      WHEN p.product_name ILIKE '%damla%' OR p.product_name ILIKE '%drop%' THEN 'drop'
      WHEN p.product_name ILIKE '%efervesan%' THEN 'effervescent'
      WHEN p.product_name ILIKE '%toz%' OR p.product_name ILIKE '%powder%' THEN 'powder'
      WHEN p.product_name ILIKE '%sıvı%' OR p.product_name ILIKE '%liquid%' THEN 'liquid'
      WHEN p.product_name ILIKE '%gummy%' OR p.product_name ILIKE '%jelly%' THEN 'gummy'
      ELSE 'tablet'
    END AS form,
    1::numeric AS serving_size,
    NULL AS servings_per_container,
    'Günlük 1 doz aç karnına bol suyla tüketin. Profesyonel sağlık tavsiyesi yerine geçmez.' AS recommended_use,
    'Hamile/emziren kadınlar, çocuklar ve kronik hastalığı olanlar doktora danışmadan kullanmamalıdır.' AS warnings,
    false AS requires_prescription,
    'Türkiye' AS manufacturer_country,
    'GMP' AS certification,
    NOW(), NOW()
  FROM products p
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
  AND NOT EXISTS (SELECT 1 FROM supplement_details sd WHERE sd.product_id = p.product_id)
`);
console.log('4. supplement_details backfilled:', sdBackfill.rowCount);

// 5. Refresh top_need_name
const top = await client.query(`
  UPDATE products p SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
  FROM (
    SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
    FROM product_need_scores ns
    JOIN needs n ON n.need_id = ns.need_id
    ORDER BY ns.product_id, ns.compatibility_score DESC
  ) sub WHERE p.product_id = sub.product_id
`);
console.log('5. top_need_name refreshed:', top.rowCount);

// 6. Final coverage
const cov = await client.query(`
  SELECT domain_type,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)) AS with_pi,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM affiliate_links al WHERE al.product_id=p.product_id AND al.is_active=true)) AS with_al,
    COUNT(*) FILTER (WHERE top_need_name IS NOT NULL) AS with_topneed,
    COUNT(*) FILTER (WHERE short_description IS NOT NULL AND short_description != '') AS with_desc
  FROM products p WHERE status IN ('published','active') GROUP BY domain_type
`);
console.log('\nFINAL coverage:');
console.table(cov.rows);

const supCov = await client.query(`
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM supplement_details sd WHERE sd.product_id=p.product_id)) AS with_sd,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM supplement_ingredients si WHERE si.product_id=p.product_id)) AS with_si
  FROM products p WHERE domain_type='supplement' AND status IN ('published','active')
`);
console.log('\nSupplement-specific:');
console.table(supCov.rows);

await client.end();
console.log('\n✅ Done');
