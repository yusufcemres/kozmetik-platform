const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  for (const t of ['products', 'product_ingredients', 'ingredients', 'needs', 'product_need_scores', 'categories', 'titck_banned_ingredients', 'brand_certifications']) {
    try {
      const r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [t]);
      console.log(`\n=== ${t} ===`);
      r.rows.forEach(x => console.log('  ' + x.column_name + ' - ' + x.data_type));
      const cnt = await c.query(`SELECT COUNT(*)::int AS n FROM ${t}`);
      console.log(`  ROWS: ${cnt.rows[0].n}`);
    } catch (e) {
      console.log(`\n=== ${t} === NOT FOUND: ${e.message.substring(0, 100)}`);
    }
  }
  // Sample products with ingredient text
  const sample = await c.query(`SELECT product_id, product_name, product_slug FROM products LIMIT 3`);
  console.log('\n=== sample products ===');
  sample.rows.forEach(r => console.log(JSON.stringify(r)));
  const ingSample = await c.query(`SELECT ingredient_id, inci_name, ingredient_slug FROM ingredients LIMIT 5`);
  console.log('\n=== sample ingredients ===');
  ingSample.rows.forEach(r => console.log(JSON.stringify(r)));
  // Are there any products with raw ingredient text somewhere?
  const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='products' AND (column_name ILIKE '%ingredient%' OR column_name ILIKE '%inci%')`);
  console.log('\n=== products ingredient columns ===');
  cols.rows.forEach(x => console.log(x.column_name));
  await c.end();
})();
