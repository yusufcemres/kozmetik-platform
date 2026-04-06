/**
 * OG Image Scraper — Gerçek affiliate URL'lerinden ürün görseli çek
 *
 * Tavily ile bulunan gerçek Trendyol/HB/Amazon URL'lerinden
 * og:image meta tag'ini çekip product_images tablosunu günceller.
 *
 * Çalıştır: node scrape-og-images.js [limit]
 * Varsayılan limit: 200
 */

const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

async function fetchOgImage(url, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const html = await res.text();

    // og:image extract
    const match = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)
      || html.match(/content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);

    if (!match) return null;

    const ogImage = match[1];
    // Filter out logos, placeholders
    if (ogImage.includes('logo') || ogImage.includes('placeholder') || ogImage.includes('favicon')) return null;
    if (!ogImage.startsWith('http')) return null;

    return ogImage;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

async function main() {
  const limit = parseInt(process.argv[2]) || 200;

  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log(`DB bağlantısı kuruldu. Limit: ${limit}`);

  // DiceBear görselli ürünlerin valid (gerçek URL) affiliate linklerini bul
  const { rows } = await client.query(`
    SELECT DISTINCT ON (p.product_id)
      p.product_id, p.product_name,
      al.affiliate_url, al.platform,
      pi.image_id
    FROM products p
    JOIN product_images pi ON pi.product_id = p.product_id AND pi.image_url LIKE '%dicebear%'
    JOIN affiliate_links al ON al.product_id = p.product_id AND al.verification_status = 'valid'
    ORDER BY p.product_id,
      CASE al.platform
        WHEN 'trendyol' THEN 1
        WHEN 'hepsiburada' THEN 2
        WHEN 'amazon_tr' THEN 3
        ELSE 4
      END
    LIMIT $1
  `, [limit]);

  console.log(`${rows.length} ürün bulundu (DiceBear + valid affiliate link)\n`);

  let updated = 0, failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ogImage = await fetchOgImage(row.affiliate_url);

    if (ogImage) {
      await client.query('UPDATE product_images SET image_url = $1 WHERE image_id = $2', [ogImage, row.image_id]);
      updated++;
    } else {
      failed++;
    }

    if ((i + 1) % 20 === 0) {
      console.log(`  ${i + 1}/${rows.length} — güncellendi: ${updated}, başarısız: ${failed}`);
    }

    // 1-2s aralık (CDN'ler hızlı, agresif rate limit yok)
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
  }

  console.log('\n=== SONUÇ ===');
  console.log(`Toplam: ${rows.length}`);
  console.log(`Gerçek görsel bulundu: ${updated}`);
  console.log(`Başarısız: ${failed}`);

  // Güncel image dağılımı
  const stats = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%') AS dicebear,
      COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%') AS real_images,
      COUNT(*) AS total
    FROM product_images
  `);
  console.log('Image dağılımı:', stats.rows[0]);

  await client.end();
  console.log('Bitti.');
}

main().catch(console.error);
