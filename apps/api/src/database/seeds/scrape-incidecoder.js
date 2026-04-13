/**
 * Incidecoder scraper for products with NO valid affiliate link.
 *
 * Strategy: DDG HTML site-search → first incidecoder.com/products/<slug> →
 * fetch page → parse product-main-image picture source → take highest-res jpeg.
 *
 * Calistir: node scrape-incidecoder.js [limit]
 */
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function toSlug(s) {
  return s.toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ddgFindSlug(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:incidecoder.com ' + query)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html' } });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/incidecoder\.com\/products\/([a-z0-9-]+)/i);
    return m ? m[1] : null;
  } catch { return null; }
}

async function tryDirectSlug(brand, name) {
  const variants = [
    toSlug(`${brand || ''} ${name}`),
    toSlug(name),
  ];
  for (const slug of variants) {
    if (!slug) continue;
    try {
      const res = await fetch(`https://incidecoder.com/products/${slug}`, { headers: { 'User-Agent': UA }, redirect: 'manual' });
      if (res.status === 200) return slug;
    } catch {}
  }
  return null;
}

async function fetchProductImage(slug) {
  const url = `https://incidecoder.com/products/${slug}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const html = await res.text();
  // Prefer jpeg source (webp not always supported everywhere), highest density
  const jpegSrc = html.match(/<source[^>]*srcset="([^"]+)"[^>]*type="image\/jpeg"/i);
  if (jpegSrc) {
    // srcset: "url 1x, url 2x, url 3x" — pick last (highest)
    const parts = jpegSrc[1].split(',').map(s => s.trim());
    const last = parts[parts.length - 1];
    const u = last.split(/\s+/)[0];
    if (u && u.startsWith('http')) return u;
  }
  // Fallback: webp
  const webpSrc = html.match(/<source[^>]*srcset="([^"]+)"[^>]*type="image\/webp"/i);
  if (webpSrc) {
    const parts = webpSrc[1].split(',').map(s => s.trim());
    const last = parts[parts.length - 1];
    const u = last.split(/\s+/)[0];
    if (u && u.startsWith('http')) return u;
  }
  // Last resort: any incidecoder-content image
  const any = html.match(/https:\/\/incidecoder-content\.storage\.googleapis\.com\/[^\s"')]+\.(?:jpg|jpeg|png|webp)/i);
  return any ? any[0] : null;
}

async function main() {
  const limit = parseInt(process.argv[2]) || 200;
  let client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`Limit: ${limit}`);

  const { rows } = await client.query(`
    SELECT p.product_id, p.product_name, b.brand_name
    FROM products p
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.product_id
    LEFT JOIN affiliate_links al ON al.product_id = p.product_id AND al.verification_status = 'valid'
    WHERE pi.image_id IS NULL AND al.affiliate_link_id IS NULL
    ORDER BY p.product_id
    LIMIT $1
  `, [limit]);

  console.log(`${rows.length} urun bulundu\n`);

  let ok = 0, fail = 0, noSlug = 0, noImg = 0;
  let consecutiveDdgFail = 0;
  let skipDdg = false;

  async function safeInsert(productId, imgUrl) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, image_type, sort_order)
           VALUES ($1, $2, 'primary', 0)`,
          [productId, imgUrl]
        );
        return true;
      } catch (err) {
        if (err.code === '57P01' || err.code === 'ECONNRESET' || /terminating|Connection terminated/i.test(err.message || '')) {
          try { await client.end(); } catch {}
          client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
          await client.connect();
          continue;
        }
        throw err;
      }
    }
    return false;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const query = `${row.brand_name || ''} ${row.product_name}`.trim();
    try {
      let slug = await tryDirectSlug(row.brand_name, row.product_name);
      if (!slug && !skipDdg) {
        slug = await ddgFindSlug(query);
        if (!slug) {
          consecutiveDdgFail++;
          if (consecutiveDdgFail >= 15) {
            skipDdg = true;
            console.log('  ! DDG rate-limited, switching to direct-slug only');
          }
        } else {
          consecutiveDdgFail = 0;
        }
      }
      if (!slug) { noSlug++; fail++; }
      else {
        const img = await fetchProductImage(slug);
        if (!img) { noImg++; fail++; }
        else {
          await safeInsert(row.product_id, img);
          ok++;
        }
      }
    } catch (err) {
      fail++;
    }

    if ((i + 1) % 10 === 0 || i === rows.length - 1) {
      console.log(`  ${i + 1}/${rows.length} — ok: ${ok}, fail: ${fail} (noSlug: ${noSlug}, noImg: ${noImg})`);
    }

    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
  }

  console.log('\n=== SONUC ===');
  console.log(`Basarili: ${ok}/${rows.length} (${((ok/rows.length)*100).toFixed(1)}%)`);
  console.log(`Basarisiz: ${fail} (slug yok: ${noSlug}, img yok: ${noImg})`);

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
