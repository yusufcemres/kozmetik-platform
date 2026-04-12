/**
 * Missing Images via Tavily Extract API.
 *
 * Trendyol + Hepsiburada bot korumasini bypass etmek icin Tavily Extract
 * kullaniyoruz (sunucu tarafli render, og:image icerir).
 *
 * Calistir: node scrape-missing-tavily.js <platform> [limit]
 *   platform: trendyol | hepsiburada
 */
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const TAVILY_KEY = process.env.TAVILY_API_KEY || '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';

async function tavilyExtract(urls) {
  const res = await fetch('https://api.tavily.com/extract', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TAVILY_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      urls,
      include_images: true,
      extract_depth: 'basic',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function pickBestImage(images, rawContent) {
  if (Array.isArray(images) && images.length > 0) {
    const good = images.find(u =>
      typeof u === 'string' &&
      u.startsWith('http') &&
      !/logo|favicon|placeholder|icon/i.test(u) &&
      /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u)
    );
    if (good) return good;
    const firstHttp = images.find(u => typeof u === 'string' && u.startsWith('http') && !/logo|favicon/i.test(u));
    if (firstHttp) return firstHttp;
  }
  if (typeof rawContent === 'string') {
    const m = rawContent.match(/https?:\/\/(?:cdn\.dsmcdn\.com|productimages\.hepsiburada\.net)\/[^\s"')]+\.(?:jpg|jpeg|png|webp)/i);
    if (m) return m[0];
  }
  return null;
}

async function main() {
  const platform = process.argv[2] || 'trendyol';
  const limit = parseInt(process.argv[3]) || 100;
  const batchSize = 20; // Tavily extract accepts up to 20 URLs per call

  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`Platform: ${platform}, Limit: ${limit}, Batch: ${batchSize}`);

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

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const urls = chunk.map(r => r.affiliate_url);

    let extractRes;
    try {
      extractRes = await tavilyExtract(urls);
    } catch (err) {
      console.error(`  Tavily hata (batch ${i/batchSize + 1}):`, err.message);
      fail += chunk.length;
      continue;
    }

    const results = extractRes.results || [];
    const byUrl = new Map(results.map(r => [r.url, r]));

    for (const row of chunk) {
      const ext = byUrl.get(row.affiliate_url);
      if (!ext) { fail++; continue; }
      const img = pickBestImage(ext.images, ext.raw_content);
      if (!img) { fail++; continue; }

      await client.query(
        `INSERT INTO product_images (product_id, image_url, image_type, sort_order)
         VALUES ($1, $2, 'primary', 0)`,
        [row.product_id, img]
      );
      ok++;
    }

    console.log(`  Batch ${Math.floor(i/batchSize) + 1}: ok=${ok}, fail=${fail} (${i + chunk.length}/${rows.length})`);
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n=== SONUC ===');
  console.log(`Basarili: ${ok}/${rows.length} (${((ok/rows.length)*100).toFixed(1)}%)`);
  console.log(`Basarisiz: ${fail}`);
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
