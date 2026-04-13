const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`
    SELECT p.product_id, p.product_name, al.affiliate_url
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.product_id
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.verification_status='valid' AND al.platform='hepsiburada'
    WHERE pi.image_id IS NULL
    ORDER BY p.product_id LIMIT 5`);
  r.rows.forEach(x => console.log(x.affiliate_url));
  await c.end();
})();
