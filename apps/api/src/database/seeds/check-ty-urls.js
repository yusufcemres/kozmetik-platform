const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='affiliate_links' ORDER BY ordinal_position`);
  console.log('affiliate_links cols:', cols.rows.map(r=>r.column_name).join(', '));
  const r = await c.query(`
    SELECT p.product_id, p.product_name, p.product_slug, b.brand_name, al.affiliate_url
    FROM products p
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.product_id
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.verification_status='valid' AND al.platform='trendyol'
    WHERE pi.image_id IS NULL
    ORDER BY p.product_id LIMIT 5`);
  r.rows.forEach(x => console.log(JSON.stringify(x)));
  await c.end();
})();
