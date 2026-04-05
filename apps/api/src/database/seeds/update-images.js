/**
 * Bulk product image updater — replaces placehold.co with real brand CDN URLs
 * For products without exact CDN match, uses DiceBear branded initials
 * Run: node apps/api/src/database/seeds/update-images.js
 */
const { Client } = require('pg');
const DB = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// Manual slug -> real CDN URL mappings
const IMAGES = {
  // CeraVe
  'cerave-moisturising-cream': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/pdp-packshot/packshots/crem-new-packshot/mc-1-lg.webp',
  'cerave-foaming-cleanser': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/pdp-packshot/packshots/lg/cerave-rn-grseller_desktop-kpren-temzleyc-473ml.jpg',
  'cerave-pm-lotion': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/pdp-packshot/packshots/lg/cerave-rn-grseller_desktop-nemlendrc-losyon-473ml.jpg',
  'cerave-sa-smoothing-cleanser': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/pdp-packshot/packshots/lg/cerave-rn-grseller_desktop-akneye-e-gs-temzleyc-236ml.jpg',
  'cerave-eye-repair-cream': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/products/pdp/packshot-images/skin-renewing-eye-cream/eye-cream/skin-renewing-eyecream-new-lg.webp',
  'cerave-moisturising-lotion': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/products/pdp/packshot-images/intensive-moisturising-lotion/iml-front-lg.webp',
  'cerave-retinol-serum': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/pdp-packshot/packshots/lg/cerave-rn-grseller_desktop-akneye-e-retnol-serum-30ml.jpg',
  'cerave-hydrating-cleanser': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/pdp-packshot/packshots/lg/cerave-rn-grseller_desktop-nemlendren-temzleyc-473ml.jpg',
  'cerave-moisturizing-cream': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/pdp-packshot/packshots/crem-new-packshot/mc-1-lg.webp',
  'cerave-hydrating-cream-to-foam-cleanser': 'https://www.cerave.com.tr/-/media/project/loreal/brand-sites/cerave/emea/tr/scx/products/pdp/packshot-images/air-foam-cleanser/air-foam-1-lg.webp',

  // Bioderma
  'bioderma-sensibio-h2o': 'https://www.bioderma.com.tr/sites/tr/files/styles/phablet_product_list_thumbnail/public/2026-02/Mainpackshot_Sebium-Gel-moussant-F500ml-28664A-MAD-may2022.png',
  'bioderma-sebium-global': 'https://www.bioderma.com.tr/sites/tr/files/styles/phablet_product_list_thumbnail/public/products/%7B184080%7D_%7BBIO_SEBIUM_KERATO%7D_%7B28675A%7D.png',
  'bioderma-atoderm-intensive-baume': 'https://www.bioderma.com.tr/sites/tr/files/styles/phablet_product_list_thumbnail/public/2025-08/Atoderm-Creme-Ultra-Chine-F500ml-A01017500-MADjan26.png',
  'bioderma-cicabio-creme': 'https://www.bioderma.com.tr/sites/tr/files/styles/phablet_product_list_thumbnail/public/products/%7B195312%7D_%7BBIO_CICABIO_CREME_PLUS%7D_%7BA01001900%7D.png',
  'bioderma-hydrabio-gel-cream': 'https://www.bioderma.com.tr/sites/tr/files/styles/phablet_product_list_thumbnail/public/products/%7B158392%7D_%7BBIO_HYDRABIO_GEL_CREME%7D_%7B28370A%7D.png',
};

// Brand color palette for DiceBear initials
const BRAND_COLORS = {
  'The Ordinary': '1A1A1A', 'La Roche-Posay': '003D6B', 'CeraVe': '1B3A5C',
  'Vichy': '2D2D2D', 'Bioderma': '00A651', 'COSRX': 'E31E24', 'Eucerin': '003B71',
  'Neutrogena': 'FF6600', 'Clinique': '8B008B', "Kiehl's": '2F4F2F',
  'Avene': 'E87722', 'Garnier': '009933', 'Nivea': '003399', 'Laneige': '7BB3D1',
  'Procsin': 'FF1493', 'Anua': '2E8B57', 'Dr. Jart+': '4169E1', 'Some By Mi': '32CD32',
  'Paula\'s Choice': '800020', 'Torriden': '4682B4', 'Numbuzin': '9370DB',
  'Skin1004': '8FBC8F', 'Round Lab': '6B8E23', 'Murad': '8B4513',
  'Dermalogica': '696969', 'Beauty of Joseon': 'DAA520', 'Etude House': 'FF69B4',
  'Dermoskin': '2F4F4F', "L'Oreal Paris": '000000', 'Medicube': 'DC143C',
  'Isntree': '556B2F', 'Sunday Riley': 'FFD700', 'Neogen': 'FF4500',
  'Glow Recipe': 'FF6B81', 'Axis-Y': '708090', 'Caudalie': '6B4226',
  'By Wishtrend': '4B0082', 'Benton': '228B22', 'Heimish': 'F4A460',
  'Revolution': 'B22222', 'Sebamed': '4A90D9', 'SVR': '0066CC',
  'Bionnex': '2E8B57', 'Cosmed': '483D8B', 'Bioxcin': '006400',
  'Mustela': '87CEEB', 'Urban Care': 'FF8C00', 'She Vec': 'C71585',
  'Cream Co.': 'D2691E', 'Sinoz': '8A2BE2', 'The Purest Solutions': '1A1A1A',
};

async function main() {
  const client = new Client(DB);
  await client.connect();
  console.log('Connected.');

  // Step 1: Apply manual CDN mappings
  let manual = 0;
  for (const [slug, url] of Object.entries(IMAGES)) {
    const r = await client.query(
      `UPDATE product_images SET image_url = $1
       FROM products p WHERE product_images.product_id = p.product_id
       AND p.product_slug = $2 AND product_images.image_url LIKE '%placehold%'`,
      [url, slug]
    );
    manual += r.rowCount;
  }
  console.log(`Step 1: ${manual} images updated from CDN mappings`);

  // Step 2: Replace ALL remaining placeholders with DiceBear branded initials
  const remaining = await client.query(`
    SELECT pi.image_id, b.brand_name
    FROM product_images pi
    JOIN products p ON p.product_id = pi.product_id
    JOIN brands b ON b.brand_id = p.brand_id
    WHERE pi.image_url LIKE '%placehold%'
  `);
  console.log(`Step 2: ${remaining.rows.length} remaining placeholders`);

  let batch = 0;
  for (const row of remaining.rows) {
    const bg = BRAND_COLORS[row.brand_name] || '2F3331';
    const url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.brand_name)}&backgroundColor=${bg}&textColor=ffffff&fontSize=36&size=400`;
    await client.query('UPDATE product_images SET image_url = $1 WHERE image_id = $2', [url, row.image_id]);
    batch++;
    if (batch % 200 === 0) console.log(`  ...${batch} done`);
  }
  console.log(`Step 2: ${batch} branded avatars set`);

  // Verify
  const ph = await client.query("SELECT count(*) FROM product_images WHERE image_url LIKE '%placehold%'");
  const real = await client.query("SELECT count(*) FROM product_images WHERE image_url NOT LIKE '%placehold%'");
  console.log(`\nFinal: ${ph.rows[0].count} placeholders, ${real.rows[0].count} real images`);

  await client.end();
  console.log('Done!');
}

main().catch(console.error);
