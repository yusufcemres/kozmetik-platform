const { Client } = require('pg');
const PGCONN = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// Brand color mapping: brand_name -> [bg, fg]
const BRAND_COLORS = {
  // Fransız Eczane
  'La Roche-Posay': ['1a5276', 'ffffff'], 'Bioderma': ['1a5276', 'ffffff'], 'Avene': ['1a5276', 'ffffff'],
  'Vichy': ['1a5276', 'ffffff'], 'SVR': ['1a5276', 'ffffff'], 'Ducray': ['1a5276', 'ffffff'],
  'Uriage': ['1a5276', 'ffffff'], 'Nuxe': ['1a5276', 'ffffff'], 'Caudalie': ['1a5276', 'ffffff'],
  'Embryolisse': ['1a5276', 'ffffff'], 'Filorga': ['1a5276', 'ffffff'], 'Lierac': ['1a5276', 'ffffff'],
  'Noreva': ['1a5276', 'ffffff'], 'ACM': ['1a5276', 'ffffff'], 'Isis Pharma': ['1a5276', 'ffffff'],
  'Dercos': ['1a5276', 'ffffff'],
  // Kore
  'COSRX': ['e8d5e0', '4a1942'], 'Klairs': ['e8d5e0', '4a1942'], 'Purito': ['e8d5e0', '4a1942'],
  'Some By Mi': ['e8d5e0', '4a1942'], 'Isntree': ['e8d5e0', '4a1942'], 'Beauty of Joseon': ['e8d5e0', '4a1942'],
  'Missha': ['e8d5e0', '4a1942'], 'Laneige': ['e8d5e0', '4a1942'], 'Dr. Jart+': ['e8d5e0', '4a1942'],
  'Etude House': ['e8d5e0', '4a1942'], 'Torriden': ['e8d5e0', '4a1942'], 'Round Lab': ['e8d5e0', '4a1942'],
  'Axis-Y': ['e8d5e0', '4a1942'], 'Skin1004': ['e8d5e0', '4a1942'], 'Anua': ['e8d5e0', '4a1942'],
  'Medicube': ['e8d5e0', '4a1942'], 'Numbuzin': ['e8d5e0', '4a1942'], 'Heimish': ['e8d5e0', '4a1942'],
  'By Wishtrend': ['e8d5e0', '4a1942'], 'Benton': ['e8d5e0', '4a1942'], 'Neogen': ['e8d5e0', '4a1942'],
  'Holika Holika': ['e8d5e0', '4a1942'], 'Mizon': ['e8d5e0', '4a1942'], 'TonyMoly': ['e8d5e0', '4a1942'],
  'Pyunkang Yul': ['e8d5e0', '4a1942'], 'Illiyoon': ['e8d5e0', '4a1942'], 'Sulwhasoo': ['2c1810', 'd4af37'],
  'Banila Co': ['e8d5e0', '4a1942'], 'Peripera': ['e8d5e0', '4a1942'], 'Cosrx': ['e8d5e0', '4a1942'],
  'Innisfree': ['e8d5e0', '4a1942'],
  // Amerikan
  'CeraVe': ['e8f6f3', '117864'], 'Cerave': ['e8f6f3', '117864'], 'Neutrogena': ['e8f6f3', '117864'],
  'Cetaphil': ['e8f6f3', '117864'], "Paula's Choice": ['e8f6f3', '117864'], 'Drunk Elephant': ['e8f6f3', '117864'],
  'Murad': ['e8f6f3', '117864'], 'Sunday Riley': ['e8f6f3', '117864'], 'Glow Recipe': ['e8f6f3', '117864'],
  'Farmacy': ['e8f6f3', '117864'], 'Aveeno': ['e8f6f3', '117864'], 'Simple': ['e8f6f3', '117864'],
  "Kiehl's": ['e8f6f3', '117864'], 'Clinique': ['e8f6f3', '117864'], 'Olay': ['e8f6f3', '117864'],
  'Peter Thomas Roth': ['e8f6f3', '117864'],
  // Alman
  'Eucerin': ['d6eaf8', '1b4f72'], 'Nivea': ['d6eaf8', '1b4f72'], 'Sebamed': ['d6eaf8', '1b4f72'],
  // Türk
  'Procsin': ['fdebd0', 'b7410e'], 'Dermoskin': ['fdebd0', 'b7410e'], 'Doa': ['fdebd0', 'b7410e'],
  'Thalia': ['fdebd0', 'b7410e'], 'Incia': ['fdebd0', 'b7410e'], 'Rosense': ['fdebd0', 'b7410e'],
  'Siveno': ['fdebd0', 'b7410e'], 'Bebak': ['fdebd0', 'b7410e'], 'Hunca': ['fdebd0', 'b7410e'],
  'Marjinal': ['fdebd0', 'b7410e'],
  // Premium
  'MAC': ['1c1c1c', 'd4af37'], 'Charlotte Tilbury': ['1c1c1c', 'd4af37'], 'Rare Beauty': ['1c1c1c', 'd4af37'],
  'Fenty Beauty': ['1c1c1c', 'd4af37'], 'Estée Lauder': ['1c1c1c', 'd4af37'], 'SK-II': ['1c1c1c', 'd4af37'],
  'Shiseido': ['1c1c1c', 'd4af37'], 'Tatcha': ['1c1c1c', 'd4af37'], 'Fresh': ['1c1c1c', 'd4af37'],
  // Doğal
  'Weleda': ['d5f5e3', '1e8449'], 'Dr. Hauschka': ['d5f5e3', '1e8449'],
  'The Body Shop': ['d5f5e3', '1e8449'], "Burt's Bees": ['d5f5e3', '1e8449'],
  // Japon
  'Hada Labo': ['fce4ec', '880e4f'], 'Senka': ['fce4ec', '880e4f'], 'Melano CC': ['fce4ec', '880e4f'],
  'Canmake': ['fce4ec', '880e4f'], 'Biore': ['fce4ec', '880e4f'], 'Muji': ['fce4ec', '880e4f'],
  // Makyaj
  'NYX': ['f3e5f5', '6a1b9a'], 'Maybelline': ['f3e5f5', '6a1b9a'], 'Revolution': ['f3e5f5', '6a1b9a'],
  'Catrice': ['f3e5f5', '6a1b9a'], 'Essence': ['f3e5f5', '6a1b9a'], "L'Oreal Paris": ['f3e5f5', '6a1b9a'],
  // The Ordinary
  'The Ordinary': ['ffffff', '1a1a1a'],
  // Derma
  'Dermalogica': ['e0f2f1', '004d40'], 'Rilastil': ['e0f2f1', '004d40'], 'Heliocare': ['e0f2f1', '004d40'],
  'SkinCeuticals': ['e0f2f1', '004d40'], 'Altruist': ['e0f2f1', '004d40'], 'Geek & Gorgeous': ['e0f2f1', '004d40'],
  'Garnier': ['e0f2f1', '004d40'], 'Dove': ['e0f2f1', '004d40'],
  // Bioderma duplicate slug
  'Bioderma': ['1a5276', 'ffffff'],
};

const DEFAULT_COLORS = ['f0f4f8', '2c3e50'];

function shortenName(name, brand) {
  // Remove brand name from product name
  let short = name.replace(brand, '').trim();
  // Shorten to max ~30 chars for readability
  if (short.length > 30) {
    short = short.substring(0, 28) + '..';
  }
  return short;
}

function encodeText(text) {
  return encodeURIComponent(text).replace(/%20/g, '+');
}

async function main() {
  const client = new Client({ connectionString: PGCONN, ssl: false });
  await client.connect();
  console.log('Connected');

  // Get all products with brand names
  const res = await client.query(`
    SELECT p.product_id, p.product_name, b.brand_name,
           COALESCE(c2.category_name, c.category_name) as parent_cat,
           CASE WHEN c.parent_category_id IS NOT NULL THEN c.category_name ELSE NULL END as sub_cat
    FROM products p
    JOIN brands b ON p.brand_id = b.brand_id
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN categories c2 ON c.parent_category_id = c2.category_id
    ORDER BY p.product_id
  `);

  console.log(`Processing ${res.rows.length} products...`);

  let updated = 0;
  const BATCH = 50;
  const updates = [];

  for (const row of res.rows) {
    const colors = BRAND_COLORS[row.brand_name] || DEFAULT_COLORS;
    const bg = colors[0];
    const fg = colors[1];

    const brandShort = row.brand_name.length > 15 ? row.brand_name.substring(0, 14) + '.' : row.brand_name;
    const productShort = shortenName(row.product_name, row.brand_name);
    const catLabel = row.sub_cat || row.parent_cat || '';

    // Two-line text: Brand + Short product name
    const text = encodeText(`${brandShort}\n${productShort}`);
    const url = `https://placehold.co/600x600/${bg}/${fg}?text=${text}&font=raleway`;

    const altText = `${row.product_name} - ${catLabel}`;

    updates.push({ productId: row.product_id, url, altText });
  }

  // Batch update
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);

    for (const u of batch) {
      await client.query(
        `UPDATE product_images SET image_url = $1, alt_text = $2 WHERE product_id = $3`,
        [u.url, u.altText, u.productId]
      );
      updated++;
    }

    if ((i + BATCH) % 500 === 0) process.stdout.write(`${i + BATCH}...`);
  }

  console.log(`\nUpdated: ${updated} images`);

  // Verify
  const sample = await client.query(
    "SELECT p.product_name, pi.image_url FROM product_images pi JOIN products p ON pi.product_id = p.product_id ORDER BY RANDOM() LIMIT 5"
  );
  console.log('\nSample URLs:');
  for (const s of sample.rows) {
    console.log(`  ${s.product_name}: ${s.image_url.substring(0, 80)}...`);
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
