const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const a = await c.query(`SELECT
    COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%' OR image_url LIKE '%placehold.co%') AS placeholder,
    COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%' AND image_url NOT LIKE '%placehold.co%') AS real_images,
    COUNT(*) AS total FROM product_images`);
  console.log('Image dist:', a.rows[0]);
  const b = await c.query(`SELECT COUNT(DISTINCT p.product_id) AS n FROM products p
    JOIN product_images pi ON pi.product_id = p.product_id AND (pi.image_url LIKE '%dicebear%' OR pi.image_url LIKE '%placehold.co%')
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.verification_status = 'valid'`);
  console.log('Placeholder products with valid affiliate link:', b.rows[0]);
  const d = await c.query(`SELECT al.platform, COUNT(DISTINCT p.product_id) AS n FROM products p
    JOIN product_images pi ON pi.product_id = p.product_id AND (pi.image_url LIKE '%dicebear%' OR pi.image_url LIKE '%placehold.co%')
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.verification_status = 'valid'
    GROUP BY al.platform ORDER BY n DESC`);
  console.log('By platform:', d.rows);
  await c.end();
})();
