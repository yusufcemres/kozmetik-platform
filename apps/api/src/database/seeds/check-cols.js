const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='product_images' ORDER BY ordinal_position`);
  r.rows.forEach(x => console.log(x.column_name, '-', x.data_type));
  await c.end();
})();
