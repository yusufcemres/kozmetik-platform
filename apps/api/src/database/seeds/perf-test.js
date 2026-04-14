/* Performance test: EXPLAIN ANALYZE on Faz 2 query paths. */
const { Client } = require('pg');

const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const queries = [
    {
      name: 'products_list_published',
      sql: `SELECT product_id, product_slug, product_name FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 24`,
    },
    {
      name: 'product_by_slug',
      sql: `SELECT p.*, b.brand_name FROM products p LEFT JOIN brands b ON b.brand_id = p.brand_id WHERE p.product_slug = 'solgar-flaxseed-oil' LIMIT 1`,
    },
    {
      name: 'tag_deriver_join',
      sql: `SELECT bool_or(i.is_paraben) AS has_paraben, bool_or(i.is_silicone) AS has_silicone FROM product_ingredients pi JOIN ingredients i ON i.ingredient_id = pi.ingredient_id WHERE pi.product_id = 1948`,
    },
    {
      name: 'publish_gate_counts',
      sql: `SELECT p.category_id, p.titck_status, (SELECT COUNT(*)::int FROM product_images pi WHERE pi.product_id = p.product_id) AS image_count, (SELECT COUNT(*)::int FROM product_ingredients pii WHERE pii.product_id = p.product_id) AS inci_count FROM products p WHERE p.product_id = 1948`,
    },
    {
      name: 'category_filter',
      sql: `SELECT product_id FROM products WHERE category_id = 12 AND status = 'active' LIMIT 50`,
    },
    {
      name: 'need_score_join',
      sql: `SELECT p.product_id, p.product_name, ns.compatibility_score FROM products p JOIN product_need_scores ns ON ns.product_id = p.product_id WHERE ns.need_id = 1 AND p.status = 'active' ORDER BY ns.compatibility_score DESC LIMIT 20`,
    },
    {
      name: 'blog_post_by_slug',
      sql: `SELECT * FROM blog_posts WHERE slug = 'niacinamide-nedir-hangi-cilt-tiplerine-iyi-gelir' AND status = 'published' LIMIT 1`,
    },
    {
      name: 'cross_sell_same_category',
      sql: `SELECT product_id, product_name, product_slug FROM products WHERE category_id = 12 AND product_id != 1948 AND status = 'active' ORDER BY favorite_count DESC LIMIT 8`,
    },
  ];

  const report = [];
  for (const q of queries) {
    try {
      const res = await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${q.sql}`);
      const plan = res.rows[0]['QUERY PLAN'][0];
      const exec = plan['Execution Time'];
      const planning = plan['Planning Time'];
      const total = exec + planning;
      report.push({ name: q.name, planning_ms: planning.toFixed(2), exec_ms: exec.toFixed(2), total_ms: total.toFixed(2) });
      console.log(`${total > 100 ? '🐌' : total > 20 ? '⚠️' : '✅'} ${q.name.padEnd(30)} total=${total.toFixed(2).padStart(8)}ms  (plan=${planning.toFixed(2)}ms exec=${exec.toFixed(2)}ms)`);
    } catch (e) {
      console.log(`❌ ${q.name}: ${e.message}`);
      report.push({ name: q.name, error: e.message });
    }
  }

  const slow = report.filter((r) => r.total_ms && parseFloat(r.total_ms) > 100);
  const warn = report.filter((r) => r.total_ms && parseFloat(r.total_ms) > 20 && parseFloat(r.total_ms) <= 100);
  console.log(`\n=== Summary: ${report.length} queries | ${slow.length} slow (>100ms) | ${warn.length} warn (>20ms) ===`);

  await client.end();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
