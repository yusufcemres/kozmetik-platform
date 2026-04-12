/**
 * Missing Images via Cloudflare Worker.
 * Worker: revela-og-scraper.muddy-moon-6ab1.workers.dev
 *
 * Calistir: node scrape-missing-via-worker.js <platform> [limit]
 */
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const WORKER_URL = 'https://revela-og-scraper.muddy-moon-6ab1.workers.dev/scrape';

function normalizeUrl(url) {
  // Trendyol: /en/ prefix is a dead redirect path; Turkish path works
  return url.replace(/trendyol\.com\/en\//, 'trendyol.com/');
}

async function scrapeViaWorker(targetUrl) {
  targetUrl = normalizeUrl(targetUrl);
  try {
    const res = await fetch(`${WORKER_URL}?url=${encodeURIComponent(targetUrl)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return { ok: false, reason: `worker-${res.status}` };
    const data = await res.json();
    if (!data.og_image) return { ok: false, reason: data.status === 200 ? 'no-og' : `http-${data.status}` };
    let img = data.og_image;
    if (/logo|favicon|placeholder/i.test(img)) return { ok: false, reason: 'logo-filter' };
    if (!img.startsWith('http')) return { ok: false, reason: 'relative' };
    return { ok: true, url: img };
  } catch (err) {
    return { ok: false, reason: err.name || 'fetch-error' };
  }
}

async function main() {
  const platform = process.argv[2] || 'trendyol';
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
    const result = await scrapeViaWorker(row.affiliate_url);

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

    // Worker rate limit: 100K/day, ~1req/s safe
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('\n=== SONUC ===');
  console.log(`Basarili: ${ok}/${rows.length} (${((ok/rows.length)*100).toFixed(1)}%)`);
  console.log(`Basarisiz: ${fail}`);
  console.log('Hata dagilimi:', failReasons);

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
