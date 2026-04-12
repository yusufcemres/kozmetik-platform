/**
 * Incidecoder v2: brand-page crawl + fuzzy match.
 *
 * 1. Group missing products by brand
 * 2. For each brand fetch /brands/<slug>?page=1..N until empty
 * 3. Build slug corpus, fuzzy-match product name against it
 * 4. Fetch matching slug's product page, extract image
 *
 * Calistir: node scrape-incidecoder-v2.js [limit]
 */
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function toSlug(s) {
  return (s || '').toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tokens(s) {
  return new Set(
    (s || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 2)
  );
}

function jaccard(a, b) {
  const inter = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

async function fetchBrandSlugs(brandSlug) {
  const slugs = new Set();
  for (let offset = 0; offset <= 20; offset++) {
    const url = offset === 0
      ? `https://incidecoder.com/brands/${brandSlug}`
      : `https://incidecoder.com/brands/${brandSlug}?offset=${offset}`;
    let res;
    try { res = await fetch(url, { headers: { 'User-Agent': UA } }); }
    catch { break; }
    if (!res.ok) break;
    const html = await res.text();
    const matches = html.match(/href="\/products\/([a-z0-9-]+)"/g) || [];
    const before = slugs.size;
    for (const m of matches) {
      const s = m.match(/\/products\/([a-z0-9-]+)/)[1];
      slugs.add(s);
    }
    if (slugs.size === before) break; // no new slugs, end of pagination
    await new Promise(r => setTimeout(r, 400));
  }
  return [...slugs];
}

async function fetchProductImage(slug) {
  const url = `https://incidecoder.com/products/${slug}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const html = await res.text();
  const jpegSrc = html.match(/<source[^>]*srcset="([^"]+)"[^>]*type="image\/jpeg"/i);
  if (jpegSrc) {
    const parts = jpegSrc[1].split(',').map(s => s.trim());
    const last = parts[parts.length - 1];
    const u = last.split(/\s+/)[0];
    if (u && u.startsWith('http')) return u;
  }
  const webpSrc = html.match(/<source[^>]*srcset="([^"]+)"[^>]*type="image\/webp"/i);
  if (webpSrc) {
    const parts = webpSrc[1].split(',').map(s => s.trim());
    const last = parts[parts.length - 1];
    const u = last.split(/\s+/)[0];
    if (u && u.startsWith('http')) return u;
  }
  const any = html.match(/https:\/\/incidecoder-content\.storage\.googleapis\.com\/[^\s"')]+\.(?:jpg|jpeg|png|webp)/i);
  return any ? any[0] : null;
}

async function main() {
  const limit = parseInt(process.argv[2]) || 2000;
  let client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

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
        if (err.code === '57P01' || /terminating|Connection terminated/i.test(err.message || '')) {
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

  const { rows } = await client.query(`
    SELECT p.product_id, p.product_name, b.brand_name
    FROM products p
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.product_id
    WHERE pi.image_id IS NULL AND b.brand_name IS NOT NULL
    ORDER BY b.brand_name, p.product_id
    LIMIT $1
  `, [limit]);

  console.log(`${rows.length} urun bulundu\n`);

  // Group by brand
  const byBrand = new Map();
  for (const r of rows) {
    const b = r.brand_name;
    if (!byBrand.has(b)) byBrand.set(b, []);
    byBrand.get(b).push(r);
  }
  console.log(`${byBrand.size} marka\n`);

  let ok = 0, fail = 0;
  const brandStats = [];

  for (const [brand, products] of byBrand) {
    const brandSlug = toSlug(brand);
    let slugs = [];
    try {
      slugs = await fetchBrandSlugs(brandSlug);
    } catch { slugs = []; }

    if (slugs.length === 0) {
      fail += products.length;
      brandStats.push({ brand, slugs: 0, matched: 0, total: products.length });
      continue;
    }

    // Precompute slug token sets
    const slugTokens = slugs.map(s => ({ slug: s, toks: tokens(s.replace(/-/g, ' ')) }));

    let brandOk = 0;
    for (const p of products) {
      const pToks = tokens(`${brand} ${p.product_name}`);
      let best = null;
      let bestScore = 0;
      for (const { slug, toks } of slugTokens) {
        const score = jaccard(pToks, toks);
        if (score > bestScore) {
          bestScore = score;
          best = slug;
        }
      }
      if (best && bestScore >= 0.4) {
        try {
          const img = await fetchProductImage(best);
          if (img) {
            await safeInsert(p.product_id, img);
            ok++;
            brandOk++;
          } else {
            fail++;
          }
        } catch {
          fail++;
        }
        await new Promise(r => setTimeout(r, 300));
      } else {
        fail++;
      }
    }
    brandStats.push({ brand, slugs: slugs.length, matched: brandOk, total: products.length });
    console.log(`  [${brand}] slugs: ${slugs.length}, matched: ${brandOk}/${products.length} — total ok: ${ok}, fail: ${fail}`);
  }

  console.log('\n=== SONUC ===');
  console.log(`Basarili: ${ok}/${rows.length} (${((ok/rows.length)*100).toFixed(1)}%)`);
  console.log(`Basarisiz: ${fail}`);

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
