const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const pi = await c.query('SELECT COUNT(DISTINCT product_id)::int AS n FROM product_ingredients');
  const pns = await c.query('SELECT COUNT(DISTINCT product_id)::int AS n FROM product_need_scores');
  const prodCount = await c.query('SELECT COUNT(*)::int AS n FROM products');
  console.log('Products total:', prodCount.rows[0].n);
  console.log('Products w/ ingredients:', pi.rows[0].n);
  console.log('Products w/ need scores:', pns.rows[0].n);
  const sample = await c.query(`SELECT p.product_id, p.product_name, COUNT(pi.ingredient_id)::int AS ing_count FROM products p LEFT JOIN product_ingredients pi ON pi.product_id = p.product_id GROUP BY p.product_id, p.product_name ORDER BY ing_count DESC LIMIT 3`);
  console.log('Top products:', sample.rows);
  const draft = await c.query("SELECT COUNT(*)::int AS n FROM products WHERE status='draft'");
  const pub = await c.query("SELECT COUNT(*)::int AS n FROM products WHERE status='published'");
  console.log('Draft:', draft.rows[0].n, 'Published:', pub.rows[0].n);
  await c.end();
})();
