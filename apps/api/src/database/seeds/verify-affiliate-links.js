/**
 * Affiliate Link Doğrulama — HTTP HEAD ile URL Kontrol
 *
 * Tüm aktif affiliate linkleri HTTP HEAD ile test eder.
 * Sonuçlara göre verification_status günceller.
 *
 * Çalıştır: node verify-affiliate-links.js [platform] [limit]
 *   platform: all | trendyol | hepsiburada | gratis | ... (varsayılan: all)
 *   limit: max kaç link test edilecek (varsayılan: 500)
 */

const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

async function checkUrl(url, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timer);

    const finalUrl = res.url !== url ? res.url : null;
    return {
      status: res.status,
      finalUrl,
      ok: res.ok,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      status: 0,
      finalUrl: null,
      ok: false,
      error: err.name === 'AbortError' ? 'timeout' : err.message,
    };
  }
}

async function main() {
  const platform = process.argv[2] || 'all';
  const limit = parseInt(process.argv[3]) || 500;

  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log(`DB bağlantısı kuruldu. Platform: ${platform}, Limit: ${limit}`);

  let query = `
    SELECT affiliate_link_id, affiliate_url, platform, verification_status
    FROM affiliate_links
    WHERE is_active = true
  `;
  const params = [];

  if (platform !== 'all') {
    query += ` AND platform = $1`;
    params.push(platform);
  }

  // search_only olanları atla (zaten arama URL'si)
  query += ` AND (verification_status != 'search_only' OR verification_status IS NULL)`;
  query += ` ORDER BY last_verified ASC NULLS FIRST LIMIT $${params.length + 1}`;
  params.push(limit);

  const { rows } = await client.query(query, params);
  console.log(`${rows.length} link test edilecek\n`);

  const stats = { valid: 0, redirect: 0, dead: 0, timeout: 0 };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const result = await checkUrl(row.affiliate_url);

    let newStatus;
    let newActive = true;
    let updateUrl = null;

    if (result.ok) {
      if (result.finalUrl && result.finalUrl !== row.affiliate_url) {
        newStatus = 'redirect';
        updateUrl = result.finalUrl;
        stats.redirect++;
      } else {
        newStatus = 'valid';
        stats.valid++;
      }
    } else if (result.status === 403) {
      // Bot koruması — search URL olabilir, aktif bırak
      newStatus = 'valid'; // 403 genellikle sayfa var demek
      stats.valid++;
    } else {
      newStatus = 'dead';
      newActive = false;
      stats.dead++;
      if (result.error === 'timeout') stats.timeout++;
    }

    const updateQuery = updateUrl
      ? `UPDATE affiliate_links SET verification_status = $1, last_verified = NOW(), is_active = $2, affiliate_url = $3 WHERE affiliate_link_id = $4`
      : `UPDATE affiliate_links SET verification_status = $1, last_verified = NOW(), is_active = $2 WHERE affiliate_link_id = $3`;

    const updateParams = updateUrl
      ? [newStatus, newActive, updateUrl, row.affiliate_link_id]
      : [newStatus, newActive, row.affiliate_link_id];

    await client.query(updateQuery, updateParams);

    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${rows.length} — valid: ${stats.valid}, redirect: ${stats.redirect}, dead: ${stats.dead}`);
    }

    // Rate limit: 200ms aralık
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n=== SONUÇ ===');
  console.log(`Toplam test: ${rows.length}`);
  console.log(`Valid: ${stats.valid}`);
  console.log(`Redirect: ${stats.redirect}`);
  console.log(`Dead: ${stats.dead} (timeout: ${stats.timeout})`);

  await client.end();
  console.log('Bitti.');
}

main().catch(console.error);
