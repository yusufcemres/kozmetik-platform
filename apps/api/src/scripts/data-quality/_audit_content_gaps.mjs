/**
 * Tüm "boş alan" gap'lerinin kapsamlı raporu — gece vardiyası planlaması için.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const sections = [];

// 1) Ingredients — function_summary, common_name, function_category, function_summary_tr
const ingCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='ingredients' ORDER BY ordinal_position`);
console.log('## ingredients schema (' + ingCols.rowCount + ' kolon):');
console.log('  ' + ingCols.rows.map(x => x.column_name).join(', '));

const ing = await c.query(`
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE function_summary IS NOT NULL AND length(function_summary) > 30) AS func_full,
  COUNT(*) FILTER (WHERE common_name IS NOT NULL AND length(common_name) > 0) AS has_common,
  COUNT(*) FILTER (WHERE ingredient_function IS NOT NULL AND length(ingredient_function) > 0) AS has_funccat,
  COUNT(*) FILTER (WHERE detailed_description IS NOT NULL AND length(detailed_description) > 100) AS has_detail,
  COUNT(*) FILTER (WHERE safety_narrative IS NOT NULL AND length(safety_narrative) > 50) AS has_safety
FROM ingredients
`);
console.log('\n## Ingredients (toplam ' + ing.rows[0].total + '):');
console.log(`  function_summary >30c : ${ing.rows[0].func_full} (%${Math.round(ing.rows[0].func_full/ing.rows[0].total*100)})`);
console.log(`  common_name dolu      : ${ing.rows[0].has_common} (%${Math.round(ing.rows[0].has_common/ing.rows[0].total*100)})`);
console.log(`  ingredient_function   : ${ing.rows[0].has_funccat || 0} (%${Math.round((ing.rows[0].has_funccat || 0)/ing.rows[0].total*100)})`);
console.log(`  detailed_description >100c: ${ing.rows[0].has_detail} (%${Math.round(ing.rows[0].has_detail/ing.rows[0].total*100)})`);
console.log(`  safety_narrative >50c : ${ing.rows[0].has_safety} (%${Math.round(ing.rows[0].has_safety/ing.rows[0].total*100)})`);

// 2) Brands
const brandCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='brands' ORDER BY ordinal_position`);
console.log('\n## brands schema (' + brandCols.rowCount + ' kolon):');
console.log('  ' + brandCols.rows.map(x => x.column_name).join(', '));

const br = await c.query(`
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE logo_url IS NOT NULL AND logo_url <> '') AS has_logo,
  COUNT(*) FILTER (WHERE country_of_origin IS NOT NULL AND country_of_origin <> '') AS has_country,
  COUNT(*) FILTER (WHERE website_url IS NOT NULL AND website_url <> '') AS has_website
FROM brands
`);
console.log('\n## Brands (toplam ' + br.rows[0].total + '):');
console.log(`  logo: ${br.rows[0].has_logo} (%${Math.round(br.rows[0].has_logo/br.rows[0].total*100)})`);
console.log(`  country: ${br.rows[0].has_country} (%${Math.round(br.rows[0].has_country/br.rows[0].total*100)})`);
console.log(`  website: ${br.rows[0].has_website} (%${Math.round(br.rows[0].has_website/br.rows[0].total*100)})`);

// 3) Needs
const needCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='needs' ORDER BY ordinal_position`);
console.log('\n## needs schema:');
console.log('  ' + needCols.rows.map(x => x.column_name).join(', '));

const ns = await c.query(`
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE short_description IS NOT NULL AND length(short_description) > 30) AS has_short,
  COUNT(*) FILTER (WHERE detailed_description IS NOT NULL AND length(detailed_description) > 100) AS has_detail
FROM needs
`);
console.log(`\n## Needs (toplam ${ns.rows[0].total}): short_desc → ${ns.rows[0].has_short} | detail → ${ns.rows[0].has_detail}`);

// 4) Articles
try {
  const artCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='articles' ORDER BY ordinal_position`);
  console.log('\n## articles schema:');
  console.log('  ' + artCols.rows.map(x => x.column_name).join(', '));

  const ar = await c.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='published') AS published FROM articles`);
  console.log(`\n## Articles: toplam ${ar.rows[0].total}, yayında ${ar.rows[0].published}`);

  // category breakdown
  try {
    const cats = await c.query(`SELECT category, COUNT(*) FROM articles GROUP BY category ORDER BY COUNT(*) DESC`);
    for (const r of cats.rows) console.log(`  ${r.category}: ${r.count}`);
  } catch {}
} catch (e) { console.log('\n## Articles tablosu yok: ' + e.message); }

// 5) Products — short_description, ingredients_text, manufacturer_country eksiklik
const prodCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='products' ORDER BY ordinal_position`);
console.log('\n## products schema (' + prodCols.rowCount + ' kolon):');
console.log('  ' + prodCols.rows.map(x => x.column_name).join(', '));

const prod = await c.query(`
SELECT domain_type,
  COUNT(*) FILTER (WHERE status='published') AS pub,
  COUNT(*) FILTER (WHERE status='published' AND short_description IS NOT NULL AND length(short_description) > 30) AS has_short,
  COUNT(*) FILTER (WHERE status='published' AND ingredients_text IS NOT NULL AND length(ingredients_text) > 50) AS has_inci_text
FROM products
GROUP BY domain_type
ORDER BY domain_type
`);
console.log('\n## Products içerik dolulu durumu:');
for (const r of prod.rows) {
  console.log(`  ${r.domain_type.padEnd(12)} | published: ${r.pub} | short_desc: ${r.has_short} (%${Math.round(r.has_short/r.pub*100)}) | inci_text: ${r.has_inci_text} (%${Math.round(r.has_inci_text/r.pub*100)})`);
}

// 6) Product_ingredients — concentration_band coverage
try {
  const piCount = await c.query(`SELECT COUNT(*) AS total FROM product_ingredients`);
  const piBands = await c.query(`SELECT COUNT(*) AS with_band FROM product_ingredients WHERE concentration_band IS NOT NULL`);
  console.log(`\n## Product_ingredients: toplam ${piCount.rows[0].total}, concentration_band dolu ${piBands.rows[0].with_band}`);
} catch (e) {}

// 7) Affiliate_links per product
const af = await c.query(`
SELECT p.domain_type,
  COUNT(DISTINCT p.product_id) FILTER (WHERE p.status='published') AS pub,
  COUNT(DISTINCT p.product_id) FILTER (WHERE p.status='published' AND EXISTS (SELECT 1 FROM affiliate_links al WHERE al.product_id = p.product_id AND al.is_active=true)) AS with_links
FROM products p
GROUP BY p.domain_type
`);
console.log('\n## Affiliate link kapsamı:');
for (const r of af.rows) console.log(`  ${r.domain_type}: ${r.with_links}/${r.pub} (%${Math.round(r.with_links/r.pub*100)})`);

await c.end();
