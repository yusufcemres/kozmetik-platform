const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const a = await c.query(`SELECT COUNT(DISTINCT product_id) AS n FROM product_images`);
  const b = await c.query(`SELECT COUNT(*) AS n FROM products`);
  const c2 = await c.query(`SELECT COUNT(DISTINCT p.product_id) AS n FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.product_id WHERE pi.image_id IS NULL`);
  const d = await c.query(`SELECT split_part(split_part(image_url,'://',2),'/',1) AS host, COUNT(*) AS n FROM product_images GROUP BY host ORDER BY n DESC LIMIT 15`);
  console.log('Products total:', b.rows[0].n);
  console.log('Products with image:', a.rows[0].n);
  console.log('Products WITHOUT image:', c2.rows[0].n);
  console.log('Top image hosts:');
  d.rows.forEach(r => console.log(' ', r.host, '-', r.n));
  await c.end();
})();
