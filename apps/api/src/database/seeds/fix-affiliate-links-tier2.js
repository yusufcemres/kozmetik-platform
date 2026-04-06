/**
 * Tier 2 Affiliate Link Fix — Search URL Formatı
 *
 * Gratis, Watsons, Rossmann, Dermoeczanem platformları için
 * sahte URL'leri çalışan arama URL'lerine çevirir.
 *
 * Çalıştır: node fix-affiliate-links-tier2.js
 */

const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

const SEARCH_URL_TEMPLATES = {
  gratis: (name) => `https://www.gratis.com/arama?q=${encodeURIComponent(name)}`,
  watsons: (name) => `https://www.watsons.com.tr/search?q=${encodeURIComponent(name)}`,
  rossmann: (name) => `https://www.rossmann.com.tr/arama?searchterm=${encodeURIComponent(name)}`,
  dermoeczanem: (name) => `https://www.dermoeczanem.com/arama?q=${encodeURIComponent(name)}`,
};

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('DB bağlantısı kuruldu.');

  // Tier 2 platformlarındaki tüm linkleri çek
  const platforms = Object.keys(SEARCH_URL_TEMPLATES);
  const { rows } = await client.query(`
    SELECT al.affiliate_link_id, al.platform, p.product_name
    FROM affiliate_links al
    JOIN products p ON p.product_id = al.product_id
    WHERE al.platform = ANY($1)
  `, [platforms]);

  console.log(`Toplam ${rows.length} link bulundu (${platforms.join(', ')})`);

  let updated = 0;
  const stats = {};

  for (const row of rows) {
    const template = SEARCH_URL_TEMPLATES[row.platform];
    if (!template) continue;

    const newUrl = template(row.product_name);

    await client.query(`
      UPDATE affiliate_links
      SET affiliate_url = $1,
          verification_status = 'search_only',
          last_verified = NOW(),
          is_active = true
      WHERE affiliate_link_id = $2
    `, [newUrl, row.affiliate_link_id]);

    stats[row.platform] = (stats[row.platform] || 0) + 1;
    updated++;

    if (updated % 500 === 0) {
      console.log(`  ${updated}/${rows.length} güncellendi...`);
    }
  }

  console.log('\n=== SONUÇ ===');
  console.log(`Toplam güncellenen: ${updated}`);
  for (const [platform, count] of Object.entries(stats)) {
    console.log(`  ${platform}: ${count}`);
  }

  await client.end();
  console.log('Bitti.');
}

main().catch(console.error);
