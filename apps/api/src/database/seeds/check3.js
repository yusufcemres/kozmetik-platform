const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const q1 = await c.query(`
    SELECT al.platform, COUNT(DISTINCT p.product_id) AS n
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.product_id
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.verification_status = 'valid'
    WHERE pi.image_id IS NULL
    GROUP BY al.platform ORDER BY n DESC`);
  console.log('No-image products by affiliate platform:', q1.rows);
  const q2 = await c.query(`
    SELECT COUNT(DISTINCT p.product_id) AS n
    FROM products p LEFT JOIN product_images pi ON pi.product_id = p.product_id
    WHERE pi.image_id IS NULL
      AND NOT EXISTS (SELECT 1 FROM affiliate_links al WHERE al.product_id = p.product_id AND al.verification_status='valid')`);
  console.log('No-image AND no valid affiliate:', q2.rows[0].n);
  await c.end();
})();
