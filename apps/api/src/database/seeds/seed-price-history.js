/**
 * Fiyat Geçmişi Seed Script
 *
 * Her affiliate link için son 90 günlük simüle fiyat geçmişi oluşturur.
 * Günlük 1 kayıt, ±%15 fiyat dalgalanması ile.
 *
 * Kullanım: node seed-price-history.js [--days 90] [--batch 500]
 */
const { Client } = require('pg');
const PGCONN = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

async function main() {
  const args = process.argv.slice(2);
  const DAYS = args.includes('--days') ? parseInt(args[args.indexOf('--days') + 1]) : 90;
  const BATCH = args.includes('--batch') ? parseInt(args[args.indexOf('--batch') + 1]) : 500;

  const client = new Client({ connectionString: PGCONN, ssl: false });
  await client.connect();

  // Truncate existing
  await client.query('TRUNCATE price_history RESTART IDENTITY');
  console.log('Truncated price_history');

  // Get all active affiliate links with prices
  const res = await client.query(`
    SELECT affiliate_link_id, price_snapshot
    FROM affiliate_links
    WHERE price_snapshot IS NOT NULL AND is_active = true
    ORDER BY affiliate_link_id
  `);
  console.log(`Found ${res.rows.length} priced affiliate links`);

  const now = new Date();
  let total = 0;
  let values = [];
  let paramIdx = 1;

  for (const row of res.rows) {
    const basePrice = parseFloat(row.price_snapshot);
    if (!basePrice || basePrice <= 0) continue;

    // Generate a random walk for price history
    let currentPrice = basePrice;
    // Start from DAYS ago, walk toward today
    // Initial price = base * random(0.85, 1.15)
    currentPrice = basePrice * (0.90 + Math.random() * 0.20);

    for (let d = DAYS; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(10 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

      // Random walk: ±3% daily change, with drift toward base price
      const drift = (basePrice - currentPrice) / basePrice * 0.05;
      const change = (Math.random() - 0.5) * 0.06 + drift;
      currentPrice = currentPrice * (1 + change);
      // Clamp to ±25% of base
      currentPrice = Math.max(basePrice * 0.75, Math.min(basePrice * 1.25, currentPrice));
      const price = Math.round(currentPrice * 100) / 100;

      // Last day = current price_snapshot
      const finalPrice = d === 0 ? basePrice : price;

      values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2})`);
      paramIdx += 3;

      if (values.length >= BATCH) {
        const insertQ = `INSERT INTO price_history (affiliate_link_id, price, recorded_at) VALUES ${values.join(',')}`;
        const params = [];
        // Rebuild params
        values = [];
        paramIdx = 1;
        // Use a simpler approach: build query and params together
      }
    }
  }

  // Simpler batch approach
  console.log('Inserting price history in batches...');
  values = [];
  let params = [];
  paramIdx = 1;
  total = 0;

  for (const row of res.rows) {
    const basePrice = parseFloat(row.price_snapshot);
    if (!basePrice || basePrice <= 0) continue;

    let currentPrice = basePrice * (0.90 + Math.random() * 0.20);

    for (let d = DAYS; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(10 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

      const drift = (basePrice - currentPrice) / basePrice * 0.05;
      const change = (Math.random() - 0.5) * 0.06 + drift;
      currentPrice = currentPrice * (1 + change);
      currentPrice = Math.max(basePrice * 0.75, Math.min(basePrice * 1.25, currentPrice));
      const price = d === 0 ? basePrice : Math.round(currentPrice * 100) / 100;

      values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2})`);
      params.push(row.affiliate_link_id, price, date.toISOString());
      paramIdx += 3;

      if (values.length >= BATCH) {
        await client.query(
          `INSERT INTO price_history (affiliate_link_id, price, recorded_at) VALUES ${values.join(',')}`,
          params,
        );
        total += values.length;
        if (total % 10000 === 0) process.stdout.write(`${total}...`);
        values = [];
        params = [];
        paramIdx = 1;
      }
    }
  }

  // Flush remaining
  if (values.length > 0) {
    await client.query(
      `INSERT INTO price_history (affiliate_link_id, price, recorded_at) VALUES ${values.join(',')}`,
      params,
    );
    total += values.length;
  }

  console.log(`\nInserted ${total} price history records`);

  // Verify
  const verify = await client.query('SELECT COUNT(*) FROM price_history');
  console.log(`Total in price_history: ${verify.rows[0].count}`);

  const sample = await client.query(`
    SELECT ph.affiliate_link_id, al.platform, al.product_id, ph.price, ph.recorded_at
    FROM price_history ph
    JOIN affiliate_links al ON ph.affiliate_link_id = al.affiliate_link_id
    WHERE al.product_id = 1
    ORDER BY ph.recorded_at DESC
    LIMIT 10
  `);
  console.log('\nSample (product_id=1):');
  sample.rows.forEach(r => {
    console.log(`  [${r.platform}] ${r.recorded_at.toISOString().slice(0,10)}: ₺${r.price}`);
  });

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
