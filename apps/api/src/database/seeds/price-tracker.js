/**
 * Fiyat Takip Modülü
 *
 * Affiliate link'lerdeki fiyatları günceller.
 * Gerçek scraping yerine platform search URL'lerinden fiyat simülasyonu yapar.
 * İleride gerçek fiyat API'leri eklenebilir.
 *
 * Kullanım: node price-tracker.js [--platform trendyol] [--limit 100]
 */
const { Client } = require('pg');
const PGCONN = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// Simulated price ranges by category
const PRICE_RANGES = {
  'Yüz Bakım': { min: 89, max: 450 },
  'Temizleme': { min: 59, max: 290 },
  'Güneş Koruma': { min: 129, max: 550 },
  'Göz Bakım': { min: 120, max: 600 },
  'Dudak Bakım': { min: 39, max: 180 },
  'Vücut Bakım': { min: 49, max: 320 },
  'Saç Bakım': { min: 69, max: 350 },
  'Makyaj': { min: 79, max: 420 },
};

// Platform price variation (percentage difference from base)
const PLATFORM_VARIATION = {
  trendyol: -0.05,     // 5% cheaper on average
  hepsiburada: 0.0,    // baseline
  gratis: 0.03,        // 3% more
  rossmann: 0.02,      // 2% more
  watsons: 0.01,       // 1% more
  dermoeczanem: -0.03, // 3% cheaper
  amazon_tr: 0.05,     // 5% more
};

function generatePrice(category, platform) {
  const range = PRICE_RANGES[category] || { min: 79, max: 350 };
  const base = range.min + Math.random() * (range.max - range.min);
  const variation = PLATFORM_VARIATION[platform] || 0;
  const price = base * (1 + variation);
  // Round to .90 or .99
  return Math.round(price) - 0.01;
}

async function main() {
  const args = process.argv.slice(2);
  const platformFilter = args.includes('--platform') ? args[args.indexOf('--platform') + 1] : null;
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 5000;

  const client = new Client({ connectionString: PGCONN, ssl: false });
  await client.connect();

  // Get affiliate links with product category info
  let query = `
    SELECT al.affiliate_link_id, al.platform, al.product_id,
           COALESCE(c2.category_name, c.category_name) as parent_cat
    FROM affiliate_links al
    JOIN products p ON al.product_id = p.product_id
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN categories c2 ON c.parent_category_id = c2.category_id
    WHERE al.is_active = true
  `;
  const params = [];
  if (platformFilter) {
    params.push(platformFilter);
    query += ` AND al.platform = $${params.length}`;
  }
  query += ` ORDER BY al.affiliate_link_id LIMIT ${limit}`;

  const res = await client.query(query, params);
  console.log(`Processing ${res.rows.length} affiliate links...`);

  let updated = 0;
  for (const row of res.rows) {
    const price = generatePrice(row.parent_cat, row.platform);
    await client.query(
      `UPDATE affiliate_links SET price_snapshot = $1, price_updated_at = NOW() WHERE affiliate_link_id = $2`,
      [price, row.affiliate_link_id],
    );
    updated++;
    if (updated % 500 === 0) process.stdout.write(`${updated}...`);
  }

  console.log(`\nUpdated ${updated} prices`);

  // Sample
  const sample = await client.query(`
    SELECT p.product_name, al.platform, al.price_snapshot
    FROM affiliate_links al
    JOIN products p ON al.product_id = p.product_id
    WHERE al.price_snapshot IS NOT NULL
    ORDER BY RANDOM() LIMIT 5
  `);
  console.log('\nSample prices:');
  sample.rows.forEach((r) => {
    console.log(`  ${r.product_name} [${r.platform}]: ₺${r.price_snapshot}`);
  });

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
