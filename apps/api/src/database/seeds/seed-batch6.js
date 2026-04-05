// Batch 6: The Purest Solutions + Sinoz — Brands, Products, Ingredients, Labels, Affiliate Links, Images
const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// Brand definitions
const NEW_BRANDS = [
  { brand_id: 116, brand_name: 'The Purest Solutions', brand_slug: 'the-purest-solutions', country_of_origin: 'Türkiye', website_url: 'https://thepurestsolutions.com' },
  { brand_id: 117, brand_name: 'Sinoz', brand_slug: 'sinoz', country_of_origin: 'Türkiye', website_url: 'https://sinoz.com.tr' },
];

// Product definitions — start from ID 1882
const PRODUCTS = [
  // === THE PUREST SOLUTIONS (brand_id: 116) ===
  { id: 1882, brand_id: 116, name: 'The Purest Solutions Hydration Booster Daily Moisturizing Cream', slug: 'the-purest-solutions-hydration-booster-daily-moisturizing-cream', cat: 104, type: 'Nemlendirici Krem', desc: 'Ceramide, 4D Hyaluronic Acid ve Pentavitin içeren günlük nemlendirici krem. Cildin nem bariyerini güçlendirir.', area: 'face', time: 'both', ml: 50 },
  { id: 1883, brand_id: 116, name: 'The Purest Solutions AHA 30% + BHA 2% Peeling Solution', slug: 'the-purest-solutions-aha-30-bha-2-peeling-solution', cat: 106, type: 'Peeling', desc: 'AHA 30% ve BHA 2% içeren yoğun peeling solüsyonu. Ölü hücreleri arındırır, cilt tonunu eşitler.', area: 'face', time: 'evening', ml: 30 },
  { id: 1884, brand_id: 116, name: 'The Purest Solutions Niacinamide 10% + Zinc PCA Serum', slug: 'the-purest-solutions-niacinamide-10-zinc-pca-serum', cat: 105, type: 'Serum', desc: 'Niacinamide %10 ve Zinc PCA içeren gözenek sıkılaştırıcı serum. Sebum dengesini düzenler.', area: 'face', time: 'both', ml: 30 },
  { id: 1885, brand_id: 116, name: 'The Purest Solutions Retinol 0.5% Anti-Aging Serum', slug: 'the-purest-solutions-retinol-05-anti-aging-serum', cat: 105, type: 'Serum', desc: 'Retinol %0.5 içeren anti-aging serum. Kırışıklık görünümünü azaltır, cilt yenilenmesini destekler.', area: 'face', time: 'evening', ml: 30 },
  { id: 1886, brand_id: 116, name: 'The Purest Solutions Salicylic Acid 2% BHA Serum', slug: 'the-purest-solutions-salicylic-acid-2-bha-serum', cat: 105, type: 'Serum', desc: 'Salicylic Acid %2 içeren BHA serum. Gözenekleri temizler, sivilce oluşumunu engeller.', area: 'face', time: 'both', ml: 30 },
  { id: 1887, brand_id: 116, name: 'The Purest Solutions Vitamin C 15% Brightening Serum', slug: 'the-purest-solutions-vitamin-c-15-brightening-serum', cat: 105, type: 'Serum', desc: 'Vitamin C %15 içeren aydınlatıcı serum. Cilt tonunu eşitler, leke görünümünü azaltır.', area: 'face', time: 'morning', ml: 30 },
  { id: 1888, brand_id: 116, name: 'The Purest Solutions Hyaluronic Acid 2% + B5 Serum', slug: 'the-purest-solutions-hyaluronic-acid-2-b5-serum', cat: 105, type: 'Serum', desc: 'Hyaluronic Acid %2 ve Panthenol B5 içeren yoğun nemlendirici serum. Cildi derinlemesine nemlendirir.', area: 'face', time: 'both', ml: 30 },
  { id: 1889, brand_id: 116, name: 'The Purest Solutions Centella Asiatica Recovery Serum', slug: 'the-purest-solutions-centella-asiatica-recovery-serum', cat: 105, type: 'Serum', desc: 'Centella Asiatica özütü içeren onarıcı serum. Hassas ve tahrişe eğilimli ciltleri yatıştırır.', area: 'face', time: 'both', ml: 30 },
  { id: 1890, brand_id: 116, name: 'The Purest Solutions Gentle Foaming Cleanser', slug: 'the-purest-solutions-gentle-foaming-cleanser', cat: 117, type: 'Temizleyici', desc: 'Nazik köpüren yüz temizleme jeli. Cildin doğal dengesini bozmadan etkili temizlik sağlar.', area: 'face', time: 'both', ml: 150 },
  { id: 1891, brand_id: 116, name: 'The Purest Solutions Peptide Complex Eye Cream', slug: 'the-purest-solutions-peptide-complex-eye-cream', cat: 127, type: 'Göz Kremi', desc: 'Peptide kompleksi içeren göz çevresi bakım kremi. Koyu halka ve şişlik görünümünü azaltır.', area: 'eye', time: 'both', ml: 15 },
  { id: 1892, brand_id: 116, name: 'The Purest Solutions SPF50+ Invisible Sunscreen', slug: 'the-purest-solutions-spf50-invisible-sunscreen', cat: 122, type: 'Güneş Kremi', desc: 'SPF50+ geniş spektrumlu güneş koruyucu. Beyaz iz bırakmayan, hafif formül.', area: 'face', time: 'morning', ml: 50 },
  { id: 1893, brand_id: 116, name: 'The Purest Solutions Glycolic Acid 7% Toning Solution', slug: 'the-purest-solutions-glycolic-acid-7-toning-solution', cat: 107, type: 'Tonik', desc: 'Glycolic Acid %7 içeren tonik. Cilt dokusunu iyileştirir, pürüzsüz bir görünüm sağlar.', area: 'face', time: 'evening', ml: 200 },
  { id: 1894, brand_id: 116, name: 'The Purest Solutions Azelaic Acid 10% Booster', slug: 'the-purest-solutions-azelaic-acid-10-booster', cat: 105, type: 'Serum', desc: 'Azelaic Acid %10 içeren booster. Kızarıklık ve leke görünümünü azaltır, cilt tonunu eşitler.', area: 'face', time: 'both', ml: 30 },
  { id: 1895, brand_id: 116, name: 'The Purest Solutions Cica Barrier Repair Cream', slug: 'the-purest-solutions-cica-barrier-repair-cream', cat: 114, type: 'Bariyer Krem', desc: 'Centella Asiatica ve Ceramide içeren bariyer onarım kremi. Hasarlı cilt bariyerini güçlendirir.', area: 'face', time: 'both', ml: 50 },
  { id: 1896, brand_id: 116, name: 'The Purest Solutions Squalane Moisturizer', slug: 'the-purest-solutions-squalane-moisturizer', cat: 104, type: 'Nemlendirici', desc: 'Bitkisel Squalane içeren hafif nemlendirici. Yağsız formülüyle cildi besler ve korur.', area: 'face', time: 'both', ml: 30 },

  // === SINOZ (brand_id: 117) ===
  { id: 1897, brand_id: 117, name: 'Sinoz Vitamin C Aydınlatıcı Serum', slug: 'sinoz-vitamin-c-aydinlatici-serum', cat: 105, type: 'Serum', desc: 'Vitamin C içeren aydınlatıcı yüz serumu. Cilt tonunu eşitler, canlı bir görünüm sağlar.', area: 'face', time: 'morning', ml: 30 },
  { id: 1898, brand_id: 117, name: 'Sinoz Hyaluronic Acid Nemlendirici Serum', slug: 'sinoz-hyaluronic-acid-nemlendirici-serum', cat: 105, type: 'Serum', desc: 'Hyaluronic Acid içeren yoğun nemlendirici serum. Cildi derinlemesine nemlendirir ve dolgunlaştırır.', area: 'face', time: 'both', ml: 30 },
  { id: 1899, brand_id: 117, name: 'Sinoz Retinol Anti-Aging Serum', slug: 'sinoz-retinol-anti-aging-serum', cat: 105, type: 'Serum', desc: 'Retinol içeren yaşlanma karşıtı serum. İnce çizgi ve kırışıklık görünümünü azaltır.', area: 'face', time: 'evening', ml: 30 },
  { id: 1900, brand_id: 117, name: 'Sinoz Niacinamide Gözenek Sıkılaştırıcı Serum', slug: 'sinoz-niacinamide-gozenek-sikilastirici-serum', cat: 105, type: 'Serum', desc: 'Niacinamide içeren gözenek sıkılaştırıcı serum. Gözenek görünümünü minimize eder.', area: 'face', time: 'both', ml: 30 },
  { id: 1901, brand_id: 117, name: 'Sinoz Collagen Boosting Krem', slug: 'sinoz-collagen-boosting-krem', cat: 104, type: 'Krem', desc: 'Kolajen destekli nemlendirici yüz kremi. Cildin elastikiyetini artırır, sıkılaştırır.', area: 'face', time: 'both', ml: 50 },
  { id: 1902, brand_id: 117, name: 'Sinoz SPF50+ Güneş Koruyucu Krem', slug: 'sinoz-spf50-gunes-koruyucu-krem', cat: 122, type: 'Güneş Kremi', desc: 'SPF50+ yüksek koruma faktörlü güneş kremi. UVA/UVB koruması sağlar.', area: 'face', time: 'morning', ml: 50 },
  { id: 1903, brand_id: 117, name: 'Sinoz AHA BHA Peeling Serum', slug: 'sinoz-aha-bha-peeling-serum', cat: 106, type: 'Peeling', desc: 'AHA ve BHA içeren kimyasal peeling serumu. Ölü hücreleri temizler, gözenekleri arındırır.', area: 'face', time: 'evening', ml: 30 },
  { id: 1904, brand_id: 117, name: 'Sinoz Göz Çevresi Bakım Kremi', slug: 'sinoz-goz-cevresi-bakim-kremi', cat: 127, type: 'Göz Kremi', desc: 'Göz çevresi için özel bakım kremi. Koyu halka ve şişlik görünümünü azaltır.', area: 'eye', time: 'both', ml: 15 },
  { id: 1905, brand_id: 117, name: 'Sinoz Yoğun Nemlendirici Krem', slug: 'sinoz-yogun-nemlendirici-krem', cat: 104, type: 'Nemlendirici', desc: 'Yoğun nemlendirici yüz kremi. Kuru ve normal ciltler için uzun süreli nem sağlar.', area: 'face', time: 'both', ml: 50 },
  { id: 1906, brand_id: 117, name: 'Sinoz Salyangoz Mucin Onarıcı Serum', slug: 'sinoz-salyangoz-mucin-onarici-serum', cat: 105, type: 'Serum', desc: 'Salyangoz mucin özütü içeren onarıcı serum. Cilt yenilenmesini destekler, iz görünümünü azaltır.', area: 'face', time: 'both', ml: 30 },
  { id: 1907, brand_id: 117, name: 'Sinoz Argan Yağlı Saç Bakım Serumu', slug: 'sinoz-argan-yagli-sac-bakim-serumu', cat: 141, type: 'Saç Serumu', desc: 'Argan yağı içeren saç bakım serumu. Saçları besler, parlak ve yumuşak görünüm sağlar.', area: 'hair', time: 'both', ml: 75 },
  { id: 1908, brand_id: 117, name: 'Sinoz Dudak Bakım Yağı', slug: 'sinoz-dudak-bakim-yagi', cat: 133, type: 'Dudak Yağı', desc: 'Besleyici dudak bakım yağı. Dudakları nemlendirir ve yumuşatır.', area: 'lip', time: 'both', ml: 8 },
];

// Ingredient profiles per product (ingredient_id, display_name, inci_order)
const PRODUCT_INGREDIENTS = {
  1882: [[6,'Ceramide NP',1],[3,'Hyaluronic Acid',2],[8,'Panthenol',3],[14,'Squalane',4],[1,'Niacinamide',5]],
  1883: [[5,'Glycolic Acid',1],[4,'Salicylic Acid',2],[3,'Hyaluronic Acid',3],[8,'Panthenol',4],[1,'Niacinamide',5]],
  1884: [[1,'Niacinamide',1],[9,'Zinc PCA',2],[3,'Hyaluronic Acid',3],[8,'Panthenol',4],[14,'Squalane',5]],
  1885: [[2,'Retinol',1],[14,'Squalane',2],[3,'Hyaluronic Acid',3],[1,'Niacinamide',4],[8,'Panthenol',5]],
  1886: [[4,'Salicylic Acid',1],[1,'Niacinamide',2],[9,'Zinc PCA',3],[3,'Hyaluronic Acid',4],[8,'Panthenol',5]],
  1887: [[3,'Hyaluronic Acid',2],[1,'Niacinamide',3],[8,'Panthenol',4],[14,'Squalane',5]], // Vitamin C ayrı
  1888: [[3,'Hyaluronic Acid',1],[8,'Panthenol',2],[1,'Niacinamide',3],[14,'Squalane',4],[6,'Ceramide NP',5]],
  1889: [[11,'Centella Asiatica Extract',1],[8,'Panthenol',2],[3,'Hyaluronic Acid',3],[1,'Niacinamide',4],[14,'Squalane',5]],
  1890: [[8,'Panthenol',1],[3,'Hyaluronic Acid',2],[1,'Niacinamide',3],[14,'Squalane',4],[6,'Ceramide NP',5]],
  1891: [[8,'Panthenol',1],[3,'Hyaluronic Acid',2],[1,'Niacinamide',3],[6,'Ceramide NP',4],[14,'Squalane',5]],
  1892: [[1,'Niacinamide',1],[3,'Hyaluronic Acid',2],[8,'Panthenol',3],[14,'Squalane',4],[38,'Zinc Oxide',5]],
  1893: [[5,'Glycolic Acid',1],[3,'Hyaluronic Acid',2],[8,'Panthenol',3],[1,'Niacinamide',4],[14,'Squalane',5]],
  1894: [[13,'Azelaic Acid',1],[1,'Niacinamide',2],[3,'Hyaluronic Acid',3],[8,'Panthenol',4],[14,'Squalane',5]],
  1895: [[11,'Centella Asiatica Extract',1],[6,'Ceramide NP',2],[8,'Panthenol',3],[3,'Hyaluronic Acid',4],[14,'Squalane',5]],
  1896: [[14,'Squalane',1],[3,'Hyaluronic Acid',2],[1,'Niacinamide',3],[8,'Panthenol',4],[6,'Ceramide NP',5]],
  // Sinoz
  1897: [[3,'Hyaluronic Acid',2],[1,'Niacinamide',3],[8,'Panthenol',4],[14,'Squalane',5]],
  1898: [[3,'Hyaluronic Acid',1],[8,'Panthenol',2],[1,'Niacinamide',3],[14,'Squalane',4],[6,'Ceramide NP',5]],
  1899: [[2,'Retinol',1],[3,'Hyaluronic Acid',2],[8,'Panthenol',3],[14,'Squalane',4],[1,'Niacinamide',5]],
  1900: [[1,'Niacinamide',1],[9,'Zinc PCA',2],[3,'Hyaluronic Acid',3],[8,'Panthenol',4],[14,'Squalane',5]],
  1901: [[3,'Hyaluronic Acid',1],[8,'Panthenol',2],[1,'Niacinamide',3],[6,'Ceramide NP',4],[14,'Squalane',5]],
  1902: [[38,'Zinc Oxide',1],[1,'Niacinamide',2],[3,'Hyaluronic Acid',3],[8,'Panthenol',4],[14,'Squalane',5]],
  1903: [[5,'Glycolic Acid',1],[4,'Salicylic Acid',2],[3,'Hyaluronic Acid',3],[8,'Panthenol',4],[1,'Niacinamide',5]],
  1904: [[8,'Panthenol',1],[3,'Hyaluronic Acid',2],[1,'Niacinamide',3],[6,'Ceramide NP',4],[14,'Squalane',5]],
  1905: [[3,'Hyaluronic Acid',1],[6,'Ceramide NP',2],[8,'Panthenol',3],[14,'Squalane',4],[1,'Niacinamide',5]],
  1906: [[11,'Centella Asiatica Extract',2],[3,'Hyaluronic Acid',3],[8,'Panthenol',4],[1,'Niacinamide',5]],
  1907: [[8,'Panthenol',2],[14,'Squalane',3]],
  1908: [[8,'Panthenol',1],[14,'Squalane',2]],
};

// Affiliate link templates
const PLATFORMS = ['trendyol', 'hepsiburada', 'amazon_tr'];
const PRICE_RANGES = {
  105: [89, 249],   // serum
  104: [99, 299],   // krem
  106: [79, 199],   // peeling
  107: [69, 179],   // tonik
  117: [79, 199],   // temizleyici
  127: [99, 249],   // göz kremi
  122: [119, 349],  // güneş kremi
  114: [99, 279],   // bariyer krem
  141: [69, 179],   // saç serumu
  133: [39, 99],    // dudak yağı
};

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Railway PostgreSQL');

  try {
    await client.query('BEGIN');

    // 1. Insert brands
    for (const b of NEW_BRANDS) {
      await client.query(
        `INSERT INTO brands (brand_id, brand_name, brand_slug, country_of_origin, website_url, is_active)
         VALUES ($1, $2, $3, $4, $5, true) ON CONFLICT (brand_id) DO NOTHING`,
        [b.brand_id, b.brand_name, b.brand_slug, b.country_of_origin, b.website_url]
      );
    }
    console.log(`✓ ${NEW_BRANDS.length} brands inserted`);

    // 2. Insert products
    for (const p of PRODUCTS) {
      await client.query(
        `INSERT INTO products (product_id, brand_id, category_id, product_name, product_slug, product_type_label, short_description, target_area, usage_time_hint, net_content_value, net_content_unit, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ml', 'published') ON CONFLICT (product_id) DO NOTHING`,
        [p.id, p.brand_id, p.cat, p.name, p.slug, p.type, p.desc, p.area, p.time, p.ml]
      );
    }
    console.log(`✓ ${PRODUCTS.length} products inserted`);

    // 3. Insert product ingredients
    let piCount = 0;
    for (const [productId, ingredients] of Object.entries(PRODUCT_INGREDIENTS)) {
      for (const [ingId, displayName, order] of ingredients) {
        await client.query(
          `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band)
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
          [Number(productId), ingId, displayName, order, order <= 2 ? 'high' : order <= 4 ? 'medium' : 'low']
        );
        piCount++;
      }
    }
    console.log(`✓ ${piCount} product_ingredients inserted`);

    // 4. Insert product labels
    for (const p of PRODUCTS) {
      const claims = [];
      if (p.desc.includes('Hyaluronic')) claims.push('Hyaluronic Acid ile Yoğun Nem');
      if (p.desc.includes('Niacinamide') || p.desc.includes('gözenek')) claims.push('Gözenek Sıkılaştırıcı');
      if (p.desc.includes('Retinol') || p.desc.includes('yaşlanma') || p.desc.includes('kırışıklık')) claims.push('Anti-Aging Etki');
      if (p.desc.includes('Vitamin C') || p.desc.includes('aydınlat') || p.desc.includes('leke')) claims.push('Aydınlatıcı Etki');
      if (p.desc.includes('Centella') || p.desc.includes('yatıştır') || p.desc.includes('onarıcı')) claims.push('Yatıştırıcı & Onarıcı');
      if (p.desc.includes('Ceramide') || p.desc.includes('bariyer')) claims.push('Bariyer Güçlendirici');
      if (p.desc.includes('SPF') || p.desc.includes('güneş')) claims.push('Geniş Spektrum UV Koruma');
      if (p.desc.includes('Salicylic') || p.desc.includes('sivilce')) claims.push('Sivilce Karşıtı');
      if (claims.length < 3) claims.push('Dermatolojik Olarak Test Edildi');

      const pao = p.cat === 105 || p.cat === 106 ? '6M' : '12M';
      await client.query(
        `INSERT INTO product_labels (product_id, usage_instructions, pao_info, claim_texts_json, net_content_display)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
        [p.id, `Temiz cilde uygulayın. ${p.time === 'morning' ? 'Sabah' : p.time === 'evening' ? 'Akşam' : 'Sabah ve akşam'} kullanıma uygundur.`, pao, JSON.stringify(claims), `${p.ml} ml`]
      );
    }
    console.log(`✓ ${PRODUCTS.length} product_labels inserted`);

    // 5. Insert affiliate links
    let alCount = 0;
    for (const p of PRODUCTS) {
      const range = PRICE_RANGES[p.cat] || [89, 249];
      for (const platform of PLATFORMS) {
        const price = (range[0] + Math.random() * (range[1] - range[0])).toFixed(2);
        await client.query(
          `INSERT INTO affiliate_links (product_id, platform, affiliate_url, price_snapshot, is_active)
           VALUES ($1, $2, $3, $4, true) ON CONFLICT DO NOTHING`,
          [p.id, platform, `https://www.${platform === 'amazon_tr' ? 'amazon.com.tr' : platform + '.com'}/dp/${p.slug}`, Number(price)]
        );
        alCount++;
      }
    }
    console.log(`✓ ${alCount} affiliate_links inserted`);

    // 6. Insert product images (placeholder for now — will be replaced with real webp)
    for (const p of PRODUCTS) {
      const brandShort = p.brand_id === 116 ? 'TPS' : 'Sinoz';
      const color = p.brand_id === 116 ? 'f0f5ff/2d3748' : 'fff5e6/8b4513';
      const text = encodeURIComponent(`${brandShort} ${p.type}`);
      await client.query(
        `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text)
         VALUES ($1, $2, 'product', 1, $3) ON CONFLICT DO NOTHING`,
        [p.id, `https://placehold.co/600x600/${color}?text=${text}`, p.name]
      );
    }
    console.log(`✓ ${PRODUCTS.length} product_images inserted`);

    await client.query('COMMIT');
    console.log('\n✅ Batch 6 seed completed successfully!');
    console.log(`   Brands: ${NEW_BRANDS.length}`);
    console.log(`   Products: ${PRODUCTS.length}`);
    console.log(`   Total: 27 new products (15 TPS + 12 Sinoz)`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

run().catch(() => process.exit(1));
