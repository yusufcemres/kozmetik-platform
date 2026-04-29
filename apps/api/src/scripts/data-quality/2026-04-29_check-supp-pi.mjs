import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
// Get a populated supplement and look at its ingredients
const ps = await c.query(`SELECT product_id, product_name FROM products WHERE domain_type='supplement' AND status='published' AND product_id IN (SELECT product_id FROM product_ingredients GROUP BY product_id LIMIT 5)`);
for (const p of ps.rows) {
  console.log(`\n## ${p.product_id}: ${p.product_name}`);
  const pis = await c.query(`SELECT ingredient_display_name, listed_as_raw, concentration_band, concentration_percent, concentration_source FROM product_ingredients WHERE product_id=$1 ORDER BY inci_order_rank LIMIT 10`, [p.product_id]);
  for (const pi of pis.rows) {
    console.log(`  ${(pi.ingredient_display_name||'').padEnd(35)} | raw="${pi.listed_as_raw||''}" | band=${pi.concentration_band} | pct=${pi.concentration_percent} | src=${pi.concentration_source}`);
  }
}
// Also check ingredients schema for dose-related fields
console.log('\n## ingredient effective_dose:');
const ing = await c.query(`SELECT ingredient_slug, common_name, effective_dose_min, effective_dose_max, effective_dose_unit, daily_recommended_value FROM ingredients WHERE ingredient_slug IN ('alpha-lipoic-acid','vitamin-c','vitamin-d3','niacinamide') LIMIT 5`);
for (const x of ing.rows) console.log(JSON.stringify(x));
await c.end();
