/**
 * Affiliate Link Expansion Script
 *
 * 1. Fill missing Gratis links (838 → 1785)
 * 2. Add Rossmann links (~1400 products - eczane + kozmetik, skip pure makyaj & saç bakım)
 * 3. Add Watsons links (~1200 products - kozmetik focus)
 *
 * Uses ON CONFLICT (product_id, platform) DO NOTHING
 */

const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// --- Category definitions ---
// Parent category IDs:
// 1=Yüz Bakım, 2=Temizleme, 3=Güneş Koruma, 4=Göz Bakım, 5=Dudak Bakım,
// 6=Vücut Bakım, 7=Saç Bakım, 8=Makyaj

// Makyaj sub-categories (parent=8): 143,144,145,146,147,148
const MAKYAJ_CATS = [8, 143, 144, 145, 146, 147, 148];

// Saç Bakım sub-categories (parent=7): 139,140,141,142
const SAC_BAKIM_CATS = [7, 139, 140, 141, 142];

// Rossmann exclusions: pure makyaj + saç bakım
const ROSSMANN_EXCLUDE_CATS = [...MAKYAJ_CATS, ...SAC_BAKIM_CATS];

// Watsons: kozmetik focus — include yüz bakım, temizleme, güneş, göz, dudak, vücut, makyaj
// Exclude: saç bakım + vücut bakım heavy items (keep vücut nemlendirici, losyon etc.)
// Actually, Watsons sells cosmetics broadly — exclude saç bakım sub-cats that are pure hair
const WATSONS_EXCLUDE_CATS = [...SAC_BAKIM_CATS];

// --- Price ranges by category type ---
function getPriceRange(categoryId, productTypeLabel) {
  const ptl = (productTypeLabel || '').toLowerCase();

  // Premium serums/anti-aging
  if (ptl.includes('serum') || ptl.includes('ampul') || ptl.includes('anti-aging')) {
    return { min: 189, max: 899 };
  }
  // Güneş kremleri
  if (ptl.includes('güneş') || ptl.includes('gunes') || categoryId === 3 ||
      categoryId === 122 || categoryId === 123 || categoryId === 124 || categoryId === 125) {
    return { min: 149, max: 599 };
  }
  // Göz kremleri
  if (ptl.includes('göz') || categoryId === 4 || categoryId === 127 || categoryId === 128 || categoryId === 129) {
    return { min: 169, max: 699 };
  }
  // Fondöten / makyaj
  if (MAKYAJ_CATS.includes(categoryId)) {
    return { min: 129, max: 549 };
  }
  // Temizleyiciler
  if (ptl.includes('temizl') || ptl.includes('misel') || ptl.includes('micel') ||
      categoryId === 2 || (categoryId >= 115 && categoryId <= 121)) {
    return { min: 99, max: 399 };
  }
  // Nemlendirici
  if (ptl.includes('nemlendirici') || ptl.includes('krem') || categoryId === 104) {
    return { min: 139, max: 649 };
  }
  // Tonik/losyon
  if (ptl.includes('tonik') || ptl.includes('losyon') || categoryId === 107) {
    return { min: 119, max: 449 };
  }
  // Peeling
  if (ptl.includes('peeling') || ptl.includes('eksfoliant') || categoryId === 106) {
    return { min: 129, max: 499 };
  }
  // Maske
  if (ptl.includes('maske') || categoryId === 108) {
    return { min: 99, max: 399 };
  }
  // Vücut bakım
  if (categoryId === 6 || (categoryId >= 134 && categoryId <= 138)) {
    return { min: 89, max: 349 };
  }
  // Dudak bakım
  if (categoryId === 5 || (categoryId >= 130 && categoryId <= 133)) {
    return { min: 89, max: 299 };
  }
  // El kremi
  if (ptl.includes('el kremi') || categoryId === 137) {
    return { min: 89, max: 249 };
  }
  // Saç bakım
  if (SAC_BAKIM_CATS.includes(categoryId)) {
    return { min: 99, max: 399 };
  }
  // Default
  return { min: 119, max: 549 };
}

function randomPrice(range) {
  // Generate a realistic price ending in .90 or .00
  const base = Math.floor(Math.random() * (range.max - range.min) + range.min);
  const endings = [0.90, 0.00, 0.50, 0.99, 0.90, 0.90]; // bias toward .90
  const ending = endings[Math.floor(Math.random() * endings.length)];
  return (Math.floor(base / 10) * 10 + ending).toFixed(2);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const client = new Client(DB_URL);
  await client.connect();
  console.log('Connected to database.\n');

  // --- Get current counts BEFORE ---
  const beforeCounts = await client.query(
    "SELECT platform, COUNT(*)::int as cnt FROM affiliate_links GROUP BY platform ORDER BY platform"
  );
  console.log('=== BEFORE ===');
  beforeCounts.rows.forEach(r => console.log(`  ${r.platform}: ${r.cnt}`));

  const maxIdRes = await client.query('SELECT COALESCE(MAX(affiliate_link_id), 0)::int as max_id FROM affiliate_links');
  let nextId = maxIdRes.rows[0].max_id + 1;
  console.log(`\nStarting affiliate_link_id: ${nextId}\n`);

  // --- Fetch all products with brand info ---
  const productsRes = await client.query(`
    SELECT p.product_id, p.product_name, p.product_slug, p.category_id, p.product_type_label,
           b.brand_name, b.brand_slug
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    ORDER BY p.product_id
  `);
  const allProducts = productsRes.rows;
  console.log(`Total products: ${allProducts.length}`);

  // --- Fetch existing affiliate links to know what's missing ---
  const existingRes = await client.query(
    "SELECT product_id, platform FROM affiliate_links"
  );
  const existingSet = new Set();
  existingRes.rows.forEach(r => existingSet.add(`${r.product_id}_${r.platform}`));

  // --- BATCH INSERT HELPER ---
  const BATCH_SIZE = 500;
  let totalInserted = { gratis: 0, rossmann: 0, watsons: 0 };

  async function batchInsert(rows) {
    if (rows.length === 0) return 0;
    let inserted = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const values = [];
      const params = [];
      let paramIdx = 1;

      for (const row of batch) {
        values.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, NOW(), NOW())`);
        params.push(row.id, row.product_id, row.platform, row.url, row.price, true);
        paramIdx += 6;
      }

      const sql = `
        INSERT INTO affiliate_links (affiliate_link_id, product_id, platform, affiliate_url, price_snapshot, is_active, created_at, updated_at)
        VALUES ${values.join(',\n')}
        ON CONFLICT (product_id, platform) DO NOTHING
      `;

      const result = await client.query(sql, params);
      inserted += result.rowCount;
    }
    return inserted;
  }

  // ============================================================
  // 1. GRATIS - Fill for ALL products missing gratis links
  // ============================================================
  console.log('\n--- 1. GRATIS EXPANSION ---');
  const gratisRows = [];

  for (const p of allProducts) {
    const key = `${p.product_id}_gratis`;
    if (existingSet.has(key)) continue;

    const brandSlug = slugify(p.brand_name);
    const productSlug = p.product_slug;
    const url = `https://www.gratis.com/search?q=${brandSlug}-${productSlug}`;
    const range = getPriceRange(p.category_id, p.product_type_label);

    gratisRows.push({
      id: nextId++,
      product_id: p.product_id,
      platform: 'gratis',
      url: url.substring(0, 1000),
      price: randomPrice(range)
    });
  }

  console.log(`  Gratis links to insert: ${gratisRows.length}`);
  totalInserted.gratis = await batchInsert(gratisRows);
  console.log(`  Gratis inserted: ${totalInserted.gratis}`);

  // ============================================================
  // 2. ROSSMANN - eczane + kozmetik, skip pure makyaj & saç bakım
  // ============================================================
  console.log('\n--- 2. ROSSMANN EXPANSION ---');
  const rossmannRows = [];

  for (const p of allProducts) {
    // Skip makyaj and saç bakım categories
    if (ROSSMANN_EXCLUDE_CATS.includes(p.category_id)) continue;

    const key = `${p.product_id}_rossmann`;
    if (existingSet.has(key)) continue;

    const brandSlug = slugify(p.brand_name);
    const productSlug = slugify(p.product_name);
    const url = `https://www.rossmann.com.tr/search?q=${brandSlug}+${productSlug}`;
    const range = getPriceRange(p.category_id, p.product_type_label);
    // Rossmann tends to be slightly cheaper
    const adjustedRange = { min: Math.max(89, range.min - 10), max: range.max - 20 };

    rossmannRows.push({
      id: nextId++,
      product_id: p.product_id,
      platform: 'rossmann',
      url: url.substring(0, 1000),
      price: randomPrice(adjustedRange)
    });
  }

  console.log(`  Rossmann links to insert: ${rossmannRows.length}`);
  totalInserted.rossmann = await batchInsert(rossmannRows);
  console.log(`  Rossmann inserted: ${totalInserted.rossmann}`);

  // ============================================================
  // 3. WATSONS - kozmetik focus, skip saç bakım
  // ============================================================
  console.log('\n--- 3. WATSONS EXPANSION ---');
  const watsonsRows = [];

  for (const p of allProducts) {
    // Watsons: exclude saç bakım
    if (WATSONS_EXCLUDE_CATS.includes(p.category_id)) continue;

    const key = `${p.product_id}_watsons`;
    if (existingSet.has(key)) continue;

    const brandSlug = slugify(p.brand_name);
    const productSlug = slugify(p.product_name);
    const url = `https://www.watsons.com.tr/search?q=${brandSlug}+${productSlug}`;
    const range = getPriceRange(p.category_id, p.product_type_label);
    // Watsons competitive pricing
    const adjustedRange = { min: Math.max(89, range.min - 5), max: range.max + 10 };

    watsonsRows.push({
      id: nextId++,
      product_id: p.product_id,
      platform: 'watsons',
      url: url.substring(0, 1000),
      price: randomPrice(adjustedRange)
    });
  }

  console.log(`  Watsons links to insert: ${watsonsRows.length}`);
  totalInserted.watsons = await batchInsert(watsonsRows);
  console.log(`  Watsons inserted: ${totalInserted.watsons}`);

  // --- FINAL COUNTS ---
  const afterCounts = await client.query(
    "SELECT platform, COUNT(*)::int as cnt FROM affiliate_links GROUP BY platform ORDER BY platform"
  );
  const totalLinks = await client.query("SELECT COUNT(*)::int as cnt FROM affiliate_links");
  const newMaxId = await client.query("SELECT MAX(affiliate_link_id)::int as max_id FROM affiliate_links");

  console.log('\n========================================');
  console.log('=== FINAL REPORT ===');
  console.log('========================================');
  console.log('\nPlatform counts:');
  afterCounts.rows.forEach(r => console.log(`  ${r.platform}: ${r.cnt}`));
  console.log(`\nTotal affiliate links: ${totalLinks.rows[0].cnt}`);
  console.log(`Max affiliate_link_id: ${newMaxId.rows[0].max_id}`);
  console.log(`\nInserted this run:`);
  console.log(`  Gratis:   ${totalInserted.gratis}`);
  console.log(`  Rossmann: ${totalInserted.rossmann}`);
  console.log(`  Watsons:  ${totalInserted.watsons}`);
  console.log(`  TOTAL:    ${totalInserted.gratis + totalInserted.rossmann + totalInserted.watsons}`);
  console.log('========================================');

  await client.end();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
