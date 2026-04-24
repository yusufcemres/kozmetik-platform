/**
 * Bağlantı Ağacı Denetimi
 *
 * REVELA veritabanındaki tüm ana entity'ler arasındaki bağlantıları haritalar:
 *   ingredients ← product_ingredients → products
 *   ingredients ← ingredient_need_mappings → needs
 *   ingredients ← ingredient_aliases (arama)
 *   products ← product_need_scores → needs
 *   products ← affiliate_links
 *   products ← product_ingredients (bileşen eşleşme)
 *   products → brands, categories
 *
 * Orphan'lar (hiç bağlantısı olmayan) ve düşük-bağlantılı düğümleri tespit eder.
 */
import { Client } from 'pg';
import { config } from 'dotenv';
config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const sep = (t) => console.log('\n' + '═'.repeat(68) + '\n  ' + t + '\n' + '═'.repeat(68));

// ============================================================================
sep('1. INGREDIENTS — temel düğüm');
const ing = await client.query(`
  SELECT
    (SELECT COUNT(*)::int FROM ingredients WHERE is_active=true) AS total,
    (SELECT COUNT(DISTINCT pi.ingredient_id)::int FROM product_ingredients pi WHERE pi.ingredient_id IS NOT NULL) AS linked_to_products,
    (SELECT COUNT(DISTINCT inm.ingredient_id)::int FROM ingredient_need_mappings inm) AS linked_to_needs,
    (SELECT COUNT(DISTINCT ia.ingredient_id)::int FROM ingredient_aliases ia) AS has_aliases,
    (SELECT COUNT(*)::int FROM ingredients i WHERE is_active=true
      AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.ingredient_id=i.ingredient_id)
      AND NOT EXISTS (SELECT 1 FROM ingredient_need_mappings inm WHERE inm.ingredient_id=i.ingredient_id)
    ) AS orphans
`);
const i = ing.rows[0];
console.log(`  Toplam aktif ingredient : ${i.total}`);
console.log(`  Bir ürüne bağlı         : ${i.linked_to_products}  (${((i.linked_to_products / i.total) * 100).toFixed(1)}%)`);
console.log(`  Bir need'e mapping'li   : ${i.linked_to_needs}  (${((i.linked_to_needs / i.total) * 100).toFixed(1)}%)`);
console.log(`  Alias'ı var (arama)     : ${i.has_aliases}  (${((i.has_aliases / i.total) * 100).toFixed(1)}%)`);
console.log(`  ORPHAN (hiç bağı yok)   : ${i.orphans}  ← filtrede hiç görünmez`);

// ============================================================================
sep('2. PRODUCTS — ingredient ve need bağlantısı');
const prod = await client.query(`
  SELECT
    p.domain_type,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (
      WHERE NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)
    )::int AS no_ingredients,
    COUNT(*) FILTER (
      WHERE NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id=p.product_id)
    )::int AS no_need_scores,
    COUNT(*) FILTER (
      WHERE NOT EXISTS (SELECT 1 FROM affiliate_links al WHERE al.product_id=p.product_id AND al.is_active=true)
    )::int AS no_affiliate,
    COUNT(*) FILTER (WHERE p.category_id IS NULL)::int AS no_category,
    COUNT(*) FILTER (WHERE p.brand_id IS NULL)::int AS no_brand
  FROM products p
  WHERE p.status IN ('published','active')
  GROUP BY p.domain_type ORDER BY p.domain_type
`);
console.log('  Domain       Toplam  NoIng  NoScore  NoAff  NoCat  NoBrand');
prod.rows.forEach(r => console.log(
  '  ' + r.domain_type.padEnd(12) + String(r.total).padEnd(8) + String(r.no_ingredients).padEnd(7) +
  String(r.no_need_scores).padEnd(9) + String(r.no_affiliate).padEnd(7) + String(r.no_category).padEnd(7) + r.no_brand
));

// ============================================================================
sep('3. NEEDS — mapping ve skorlama');
const needs = await client.query(`
  SELECT
    n.domain_type,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (
      WHERE NOT EXISTS (SELECT 1 FROM ingredient_need_mappings inm WHERE inm.need_id=n.need_id)
    )::int AS no_mapping,
    COUNT(*) FILTER (
      WHERE NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.need_id=n.need_id)
    )::int AS no_product_scores
  FROM needs n WHERE n.is_active=true
  GROUP BY n.domain_type ORDER BY n.domain_type
`);
console.log('  Domain       Toplam  NoMapping  NoProdScore');
needs.rows.forEach(r => console.log(
  '  ' + r.domain_type.padEnd(12) + String(r.total).padEnd(8) + String(r.no_mapping).padEnd(11) + r.no_product_scores
));

// ============================================================================
sep('4. BRANDS — ülke, ürün, sertifika');
const brands = await client.query(`
  SELECT
    (SELECT COUNT(*)::int FROM brands) AS total,
    (SELECT COUNT(*)::int FROM brands WHERE country_of_origin IS NULL) AS no_country,
    (SELECT COUNT(*)::int FROM brands b WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.brand_id=b.brand_id)) AS no_products,
    (SELECT COUNT(DISTINCT b.brand_id)::int FROM brands b LEFT JOIN brand_certifications bc ON bc.brand_id=b.brand_id WHERE bc.brand_id IS NULL) AS no_certs
`);
const b = brands.rows[0];
console.log(`  Toplam marka          : ${b.total}`);
console.log(`  country_of_origin NULL: ${b.no_country}`);
console.log(`  Hiç ürünü yok         : ${b.no_products}`);
console.log(`  Sertifikası yok       : ${b.no_certs}`);

// ============================================================================
sep('5. CATEGORIES — ürün dağılımı');
const cat = await client.query(`
  SELECT
    c.category_name,
    c.domain_type,
    COUNT(p.product_id)::int AS product_count
  FROM categories c LEFT JOIN products p ON p.category_id=c.category_id AND p.status IN ('published','active')
  WHERE c.parent_category_id IS NULL
  GROUP BY c.category_id, c.category_name, c.domain_type
  ORDER BY product_count DESC
`);
cat.rows.forEach(r => console.log('  ' + r.category_name.padEnd(25) + (r.domain_type || '').padEnd(12) + r.product_count));

// ============================================================================
sep('6. ORPHAN INGREDIENT ÖRNEKLERİ — hiç bağlanmamış');
const orphans = await client.query(`
  SELECT i.ingredient_slug, i.inci_name
  FROM ingredients i
  WHERE i.is_active=true
    AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.ingredient_id=i.ingredient_id)
    AND NOT EXISTS (SELECT 1 FROM ingredient_need_mappings inm WHERE inm.ingredient_id=i.ingredient_id)
  ORDER BY i.inci_name LIMIT 20
`);
if (orphans.rowCount === 0) console.log('  Hiç orphan yok ✓');
else orphans.rows.forEach(r => console.log('  ' + r.ingredient_slug.padEnd(35) + ' ' + r.inci_name));

// ============================================================================
sep('7. BAĞLANMAMIŞ SUPPLEMENT ÜRÜNLER (link-products sonrası)');
const unlinked = await client.query(`
  SELECT b.brand_name, p.product_name
  FROM products p LEFT JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)
  ORDER BY p.product_name
`);
if (unlinked.rowCount === 0) console.log('  Tüm supplement bağlı ✓');
else unlinked.rows.forEach(r => console.log('  ' + (r.brand_name || '-').padEnd(15) + ' ' + r.product_name));

// ============================================================================
sep('8. SKORSUZ SUPPLEMENT ÜRÜNLER');
const noScores = await client.query(`
  SELECT b.brand_name, p.product_name,
    (SELECT COUNT(*)::int FROM product_ingredients pi WHERE pi.product_id=p.product_id) AS ingredient_count
  FROM products p LEFT JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id=p.product_id)
  ORDER BY p.product_name LIMIT 20
`);
if (noScores.rowCount === 0) console.log('  Tüm supplement skorlu ✓');
else noScores.rows.forEach(r => console.log('  [' + r.ingredient_count + ' ing] ' + (r.brand_name || '-').padEnd(15) + ' ' + r.product_name));

// ============================================================================
sep('9. FİLTRELEME SAĞLIĞI — her filter dimension için veri yüzdesi');
const filterHealth = await client.query(`
  SELECT
    (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE sd.form IS NOT NULL) / NULLIF(COUNT(*), 0), 1)
       FROM supplement_details sd) AS supp_form_pct,
    (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE sd.manufacturer_country IS NOT NULL) / NULLIF(COUNT(*), 0), 1)
       FROM supplement_details sd) AS supp_country_pct,
    (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE sd.certification IS NOT NULL) / NULLIF(COUNT(*), 0), 1)
       FROM supplement_details sd) AS supp_cert_pct,
    (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE p.target_area IS NOT NULL) / NULLIF(COUNT(*), 0), 1)
       FROM products p WHERE p.domain_type='cosmetic') AS cos_area_pct,
    (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE p.product_type_label IS NOT NULL) / NULLIF(COUNT(*), 0), 1)
       FROM products p WHERE p.domain_type='cosmetic') AS cos_type_pct,
    (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE al.price_snapshot IS NOT NULL) / NULLIF(COUNT(*), 0), 1)
       FROM affiliate_links al WHERE al.is_active=true) AS price_coverage_pct
`);
const fh = filterHealth.rows[0];
console.log(`  Supplement form            : ${fh.supp_form_pct}% dolu`);
console.log(`  Supplement ülke            : ${fh.supp_country_pct}% dolu`);
console.log(`  Supplement sertifika       : ${fh.supp_cert_pct}% dolu`);
console.log(`  Kozmetik bölge (area)      : ${fh.cos_area_pct}% dolu`);
console.log(`  Kozmetik ürün tipi         : ${fh.cos_type_pct}% dolu`);
console.log(`  Affiliate link fiyat       : ${fh.price_coverage_pct}% dolu`);

console.log();
await client.end();
