/**
 * Missing Images — OG scraper for products with NO image record.
 *
 * Hedef: product_images'de kaydi olmayan ama valid affiliate link'i olan urunler.
 * Platform secilebilir: amazon_tr | trendyol | hepsiburada
 *
 * Calistir: node scrape-missing-og.js <platform> [limit]
 */
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

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
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const html = await res.text();
    let ogImage = null;

    // Amazon-specific patterns (no og:image, uses landingImage)
    const amazonHires = html.match(/"hiRes":"(https:\/\/m\.media-amazon\.com[^"]+?\.(?:jpg|jpeg|png|webp))"/i);
    if (amazonHires) ogImage = amazonHires[1];
    if (!ogImage) {
      const amazonLanding = html.match(/id=["']landingImage["'][^>]*data-old-hires=["']([^"']+)["']/i)
        || html.match(/data-old-hires=["']([^"']+)["'][^>]*id=["']landingImage["']/i);
      if (amazonLanding) ogImage = amazonLanding[1];
    }
    if (!ogImage) {
      const amazonDynamic = html.match(/data-a-dynamic-image=["']\{&quot;([^&]+)&quot;/i)
        || html.match(/data-a-dynamic-image=["']\{"([^"]+)"/);
      if (amazonDynamic) ogImage = amazonDynamic[1];
    }

    // Generic og:image fallback
    if (!ogImage) {
      const m = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)
        || html.match(/content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
      if (m) ogImage = m[1];
    }

    if (!ogImage) return { ok: false, reason: 'no-image' };
    ogImage = ogImage.replace(/&amp;/g, '&');
    if (/logo|placeholder|favicon/i.test(ogImage)) return { ok: false, reason: 'logo-filter' };
    if (!ogImage.startsWith('http')) return { ok: false, reason: 'relative-url' };
    return { ok: true, url: ogImage };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, reason: err.name || 'fetch-error' };
  }
}

async function main() {
  const platform = process.argv[2] || 'amazon_tr';
  const limit = parseInt(process.argv[3]) || 200;

  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`Platform: ${platform}, Limit: ${limit}`);

  const { rows } = await client.query(`
    SELECT p.product_id, p.product_name, al.affiliate_url
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.product_id
    JOIN affiliate_links al ON al.product_id = p.product_id
      AND al.verification_status = 'valid'
      AND al.platform = $1
    WHERE pi.image_id IS NULL
    ORDER BY p.product_id
    LIMIT $2
  `, [platform, limit]);

  console.log(`${rows.length} urun bulundu\n`);

  let ok = 0, fail = 0;
  const failReasons = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const result = await fetchOgImage(row.affiliate_url);

    if (result.ok) {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, image_type, sort_order)
         VALUES ($1, $2, 'primary', 0)`,
        [row.product_id, result.url]
      );
      ok++;
    } else {
      fail++;
      failReasons[result.reason] = (failReasons[result.reason] || 0) + 1;
    }

    if ((i + 1) % 10 === 0 || i === rows.length - 1) {
      console.log(`  ${i + 1}/${rows.length} — ok: ${ok}, fail: ${fail}`);
    }

    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
  }

  console.log('\n=== SONUC ===');
  console.log(`Basarili: ${ok}/${rows.length} (${((ok/rows.length)*100).toFixed(1)}%)`);
  console.log(`Basarisiz: ${fail}`);
  console.log('Hata dagilimi:', failReasons);

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
