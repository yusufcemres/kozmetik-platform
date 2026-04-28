import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// 1. ingredient_need_mappings constraint check
const r0 = await c.query(`SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'product_need_scores'::regclass`);
console.log('product_need_scores constraints:');
for (const row of r0.rows) console.log(`  ${row.conname}: ${row.pg_get_constraintdef}`);

// 2. effect_type values in ingredient_need_mappings
const r1 = await c.query(`SELECT effect_type, COUNT(*) FROM ingredient_need_mappings GROUP BY effect_type`);
console.log(`\ningredient_need_mappings.effect_type:`);
for (const row of r1.rows) console.log(`  ${row.effect_type}: ${row.count}`);

// 3. CeraVe Brightening Lotion (2713) — INCI'ları ile ingredient_need_mappings'in kesişimi
const r2 = await c.query(`
  SELECT pi.ingredient_display_name, i.ingredient_slug, i.domain_type,
    (SELECT COUNT(*) FROM ingredient_need_mappings inm
     WHERE inm.ingredient_id = pi.ingredient_id
       AND inm.effect_type IN ('direct_support', 'complementary')
       AND inm.relevance_score >= 30) as mappings_count
  FROM product_ingredients pi
  LEFT JOIN ingredients i ON i.ingredient_id = pi.ingredient_id
  WHERE pi.product_id = 2713
  ORDER BY pi.inci_order_rank
`);
console.log(`\n2713 CeraVe Brightening Lotion INCI → mappings:`);
for (const row of r2.rows) console.log(`  ${row.ingredient_display_name} (${row.ingredient_slug || 'unmatched'} / ${row.domain_type || '-'}) → ${row.mappings_count} mapping`);

// 4. product 2659 (The Ordinary Niacinamide — already published, has full data) for comparison
console.log(`\n2659 (referans) The Ordinary Niacinamide INCI → mappings:`);
const r3 = await c.query(`
  SELECT pi.ingredient_display_name, i.ingredient_slug,
    (SELECT COUNT(*) FROM ingredient_need_mappings inm
     WHERE inm.ingredient_id = pi.ingredient_id
       AND inm.effect_type IN ('direct_support', 'complementary')
       AND inm.relevance_score >= 30) as mappings_count
  FROM product_ingredients pi
  LEFT JOIN ingredients i ON i.ingredient_id = pi.ingredient_id
  WHERE pi.product_id = 2659
  ORDER BY pi.inci_order_rank
`);
for (const row of r3.rows) console.log(`  ${row.ingredient_display_name} (${row.ingredient_slug || 'unmatched'}) → ${row.mappings_count} mapping`);

const r3b = await c.query(`SELECT need_id, compatibility_score FROM product_need_scores WHERE product_id = 2659`);
console.log(`  2659 has ${r3b.rows.length} need_scores`);

// 5. effect_type list daha geniş — direct_support+complementary dışında ne var
const r4 = await c.query(`SELECT DISTINCT effect_type FROM ingredient_need_mappings ORDER BY effect_type`);
console.log(`\nDISTINCT effect_types:`);
for (const row of r4.rows) console.log(`  ${row.effect_type}`);

// 6. relevance_score dağılımı
const r5 = await c.query(`SELECT
  CASE WHEN relevance_score >= 30 THEN '>=30' WHEN relevance_score > 0 THEN '1-29' ELSE '0' END as bucket,
  COUNT(*) FROM ingredient_need_mappings GROUP BY bucket ORDER BY bucket`);
console.log(`\nrelevance_score distribution:`);
for (const row of r5.rows) console.log(`  ${row.bucket}: ${row.count}`);

await c.end();
