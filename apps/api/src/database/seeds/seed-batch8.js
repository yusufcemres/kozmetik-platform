/**
 * REVELA — Batch 8 Seed
 * 3 yeni marka (Farmasi, Iunik, Centellian24) + boş kategorilere ürün
 * + mevcut markalara makyaj/vücut/saç takviye
 *
 * Run: node src/database/seeds/seed-batch8.js
 */
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// === INGREDIENT ID MAP ===
const I = {
  niacinamide: 1, retinol: 2, hyaluronic_acid: 3, salicylic_acid: 4, glycolic_acid: 5,
  ceramide_np: 6, ascorbic_acid: 7, panthenol: 8, zinc_pca: 9, tocopherol: 10,
  centella: 11, glycerin: 12, azelaic_acid: 13, squalane: 14, allantoin: 15,
  lactic_acid: 16, madecassoside: 17, sodium_hyaluronate: 18, bakuchiol: 20,
  aqua: 21, parfum: 22, phenoxyethanol: 23, butylene_glycol: 24, dimethicone: 25,
  caffeine: 26, arbutin: 27, snail_secretion: 29, shea_butter: 30, cetearyl_alcohol: 31,
  copper_peptide: 33, propanediol: 36, ethylhexyl_mc: 37, zinc_oxide: 38,
  titanium_dioxide: 39, bisabolol: 40, propolis: 42, peptide_complex: 49,
  jojoba_oil: 51, mugwort: 56, rosehip_oil: 60, cica: 62, grape_seed: 63,
  kojic_acid: 68, ceramide_ap: 77, cholesterol: 78, phytosphingosine: 79,
  cetyl_alcohol: 241, stearic_acid: 247, argan_oil: 259, aloe: 559,
  biotin: 1351, copper_tripeptide: 1367, citric_acid: 1470, octocrylene: 1526,
  butyl_mdb: 1536, piroctone: 1872, arginine: 2114, collagen: 2035,
  alpha_arbutin: 3128, adenosine: 3122, carbomer: 1977,
};

// === CATEGORY MAP ===
const C = {
  yuz: 1, temizleme: 2, gunes: 3, goz: 4, dudak: 5, vucut: 6, sac: 7, makyaj: 8,
  vitamin: 9, probiyotik: 10, bitkisel: 11, omega: 12,
  nemlendirici: 104, serum: 105, peeling: 106, tonik: 107, maske: 108,
  yuz_yagi: 109, gece: 110, anti_aging: 111, leke: 112, sivilce: 113, bariyer: 114,
  jel_temizleyici: 115, misel: 116, kopuk: 117, temizleme_sutu: 118,
  temizleme_yagi: 119, peeling_temizleyici: 120, makyaj_temizleyici: 121,
  yuz_gunes: 122, vucut_gunes: 123, renkli_gunes: 124, gunes_spreyi: 125,
  gunes_sonrasi: 126, goz_kremi: 127, goz_serum: 128, goz_patch: 129,
  dudak_nemlendirici: 130, dudak_peeling: 131, dudak_maske: 132, dudak_yagi: 133,
  vucut_nemlendirici: 134, vucut_losyon: 135, vucut_yagi: 136, el_kremi: 137,
  ayak_bakim: 138, sampuan: 139, sac_maskesi: 140, sac_serum: 141, sac_kremi: 142,
  fondoten: 143, allik: 144, ruj: 145, maskara: 146, pudra: 147, kapatici: 148,
};

// === NEW BRANDS ===
const newBrands = [
  { id: 116, name: 'Farmasi', slug: 'farmasi', country: 'TR', website: 'https://farmasi.com.tr', desc: 'Türkiye\'nin en büyük kozmetik ve kişisel bakım markası' },
  { id: 117, name: 'Iunik', slug: 'iunik', country: 'KR', website: 'https://iunikcos.com', desc: 'Doğal ve minimal içerikli Kore cilt bakım markası' },
  { id: 118, name: 'Centellian24', slug: 'centellian24', country: 'KR', website: 'https://centellian24.com', desc: 'Centella Asiatica bazlı Kore dermokozmetik markası' },
];

// === PRODUCTS ===
let pid = 1882;
const products = [];

function addProduct(brand_id, name, slug, category_id, desc, ingredients, price) {
  products.push({
    id: pid++, brand_id, name, slug, category_id,
    short_description: desc,
    ingredients: ingredients,
    price: price,
  });
}

// ═══════════════════════════════════════════
// FARMASI (116) — 20 ürün
// ═══════════════════════════════════════════

// Makyaj (boş kategori doldur)
addProduct(116, 'Farmasi Make Up Fondöten SPF 15', 'farmasi-make-up-fondoten-spf15', C.fondoten,
  'Orta-yüksek kapatıcılık, doğal bitişli fondöten',
  [I.aqua, I.dimethicone, I.titanium_dioxide, I.glycerin, I.tocopherol, I.panthenol, I.phenoxyethanol],
  159);
addProduct(116, 'Farmasi BB Krem SPF 15', 'farmasi-bb-krem-spf15', C.fondoten,
  'Hafif formüllü, nemlendirici BB krem',
  [I.aqua, I.dimethicone, I.glycerin, I.titanium_dioxide, I.panthenol, I.tocopherol, I.phenoxyethanol],
  129);
addProduct(116, 'Farmasi Tender Blush Allık', 'farmasi-tender-blush-allik', C.allik,
  'Doğal görünümlü toz allık, kolay uygulanır',
  [I.dimethicone, I.tocopherol, I.phenoxyethanol, I.parfum],
  99);
addProduct(116, 'Farmasi Terracotta Bronzer', 'farmasi-terracotta-bronzer', C.allik,
  'Güneş öpülmüş bronzluk veren pudra',
  [I.dimethicone, I.tocopherol, I.zinc_oxide, I.phenoxyethanol],
  119);
addProduct(116, 'Farmasi Matte Ruj', 'farmasi-matte-ruj', C.ruj,
  'Uzun süre kalıcı mat ruj, nemlendiricili formül',
  [I.dimethicone, I.shea_butter, I.tocopherol, I.jojoba_oil, I.phenoxyethanol],
  89);
addProduct(116, 'Farmasi Lip Gloss Dudak Parlatıcı', 'farmasi-lip-gloss', C.ruj,
  'Şeffaf parlaklık veren dudak ürünü',
  [I.dimethicone, I.jojoba_oil, I.tocopherol, I.parfum],
  69);
addProduct(116, 'Farmasi Long Lash Maskara', 'farmasi-long-lash-maskara', C.maskara,
  'Uzatıcı ve hacim verici siyah maskara',
  [I.aqua, I.dimethicone, I.panthenol, I.biotin, I.phenoxyethanol],
  99);
addProduct(116, 'Farmasi Eyeliner Kalem', 'farmasi-eyeliner-kalem', C.maskara,
  'Su bazlı kalıcı eyeliner, kolay uygulama',
  [I.aqua, I.dimethicone, I.phenoxyethanol],
  79);
addProduct(116, 'Farmasi Pore Minimizer Pudra', 'farmasi-pore-minimizer-pudra', C.pudra,
  'Gözenek gizleyici mat bitişli pudra',
  [I.dimethicone, I.zinc_oxide, I.tocopherol, I.phenoxyethanol],
  109);
addProduct(116, 'Farmasi Luminous Aydınlatıcı', 'farmasi-luminous-aydinlatici', C.pudra,
  'Işıltılı aydınlatıcı, doğal parlaklık',
  [I.dimethicone, I.tocopherol, I.glycerin, I.phenoxyethanol],
  99);
addProduct(116, 'Farmasi Kapatıcı Kalem', 'farmasi-kapatici-kalem', C.kapatici,
  'Koyu halka ve kusur kapatıcı, doğal bitişli',
  [I.aqua, I.dimethicone, I.glycerin, I.tocopherol, I.panthenol, I.phenoxyethanol],
  89);

// Cilt bakım
addProduct(116, 'Farmasi Dr. C. Tuna Çay Ağacı Yüz Yıkama Jeli', 'farmasi-cay-agaci-yuz-jeli', C.jel_temizleyici,
  'Çay ağacı yağlı arındırıcı yüz temizleme jeli',
  [I.aqua, I.salicylic_acid, I.glycerin, I.aloe, I.allantoin, I.phenoxyethanol],
  129);
addProduct(116, 'Farmasi Dr. C. Tuna Vitalizing Serum', 'farmasi-vitalizing-serum', C.serum,
  'C vitamini ve hyaluronik asitli canlandırıcı serum',
  [I.aqua, I.ascorbic_acid, I.sodium_hyaluronate, I.glycerin, I.tocopherol, I.panthenol],
  179);
addProduct(116, 'Farmasi Nemlendirici Günlük Krem', 'farmasi-nemlendirici-gunluk-krem', C.nemlendirici,
  'Tüm cilt tipleri için hafif günlük nemlendirici',
  [I.aqua, I.glycerin, I.shea_butter, I.panthenol, I.tocopherol, I.dimethicone, I.allantoin],
  149);

// Vücut & Güneş (boş kategoriler)
addProduct(116, 'Farmasi Güneş Koruma Vücut Sütü SPF 30', 'farmasi-vucut-gunes-sutu-spf30', C.vucut_gunes,
  'Geniş spektrumlu vücut güneş koruma sütü',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.butyl_mdb, I.glycerin, I.tocopherol, I.panthenol, I.aloe],
  179);
addProduct(116, 'Farmasi Güneş Spreyi SPF 50', 'farmasi-gunes-spreyi-spf50', C.gunes_spreyi,
  'Kolay uygulanır sprey formda güneş koruma',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.tocopherol, I.panthenol, I.aloe, I.parfum],
  199);
addProduct(116, 'Farmasi Güneş Sonrası Losyon', 'farmasi-gunes-sonrasi-losyon', C.gunes_sonrasi,
  'Güneş sonrası yatıştırıcı ve nemlendirici losyon',
  [I.aqua, I.aloe, I.panthenol, I.glycerin, I.allantoin, I.bisabolol, I.tocopherol],
  139);
addProduct(116, 'Farmasi Ayak Bakım Kremi', 'farmasi-ayak-bakim-kremi', C.ayak_bakim,
  'Çatlak ve kuru ayaklar için yoğun nemlendirici krem',
  [I.aqua, I.shea_butter, I.glycerin, I.panthenol, I.allantoin, I.tocopherol, I.dimethicone],
  89);

// Dudak (boş kategoriler)
addProduct(116, 'Farmasi Dudak Yağı Besleyici', 'farmasi-dudak-yagi-besleyici', C.dudak_yagi,
  'Doğal yağlarla besleyici dudak bakımı',
  [I.jojoba_oil, I.shea_butter, I.tocopherol, I.rosehip_oil, I.parfum],
  59);
addProduct(116, 'Farmasi Dudak Peeling Şeker Scrub', 'farmasi-dudak-peeling-scrub', C.dudak_peeling,
  'Şeker tanecikli yumuşatıcı dudak peelingi',
  [I.shea_butter, I.jojoba_oil, I.tocopherol, I.glycerin, I.parfum],
  49);

// ═══════════════════════════════════════════
// IUNIK (117) — 12 ürün
// ═══════════════════════════════════════════

addProduct(117, 'Iunik Centella Calming Gel Cream', 'iunik-centella-calming-gel-cream', C.nemlendirici,
  'Centella bazlı yatıştırıcı jel krem, hassas ciltler için',
  [I.aqua, I.centella, I.cica, I.madecassoside, I.panthenol, I.butylene_glycol, I.allantoin, I.glycerin],
  349);
addProduct(117, 'Iunik Beta-Glucan Power Moisture Serum', 'iunik-beta-glucan-power-serum', C.serum,
  'Beta-glukan bazlı yoğun nemlendirici serum',
  [I.aqua, I.hyaluronic_acid, I.sodium_hyaluronate, I.glycerin, I.centella, I.panthenol, I.allantoin],
  399);
addProduct(117, 'Iunik Tea Tree Relief Serum', 'iunik-tea-tree-relief-serum', C.serum,
  'Çay ağacı yağlı yatıştırıcı serum, sivilce eğilimli ciltler',
  [I.aqua, I.centella, I.salicylic_acid, I.panthenol, I.allantoin, I.butylene_glycol, I.glycerin],
  379);
addProduct(117, 'Iunik Propolis Vitamin Synergy Serum', 'iunik-propolis-vitamin-serum', C.serum,
  'Propolis ve vitaminlerle besleyici parlaklık serumu',
  [I.aqua, I.propolis, I.sodium_hyaluronate, I.niacinamide, I.adenosine, I.glycerin, I.panthenol, I.tocopherol],
  429);
addProduct(117, 'Iunik Centella Edition Soothing Toner', 'iunik-centella-soothing-toner', C.tonik,
  'Centella özlü yatıştırıcı tonik, 98% doğal',
  [I.aqua, I.centella, I.cica, I.panthenol, I.madecassoside, I.glycerin, I.allantoin, I.butylene_glycol],
  329);
addProduct(117, 'Iunik Vitamin Hyaluronic Acid Vitalizing Toner', 'iunik-vitamin-ha-vitalizing-toner', C.tonik,
  'Hyaluronik asit ve vitaminli canlandırıcı tonik',
  [I.aqua, I.sodium_hyaluronate, I.hyaluronic_acid, I.ascorbic_acid, I.tocopherol, I.panthenol, I.glycerin],
  349);
addProduct(117, 'Iunik Black Snail Restore Serum', 'iunik-black-snail-restore-serum', C.serum,
  'Salyangoz özlü onarıcı anti-aging serum',
  [I.aqua, I.snail_secretion, I.centella, I.niacinamide, I.adenosine, I.glycerin, I.panthenol, I.allantoin],
  449);
addProduct(117, 'Iunik Black Snail Restore Cream', 'iunik-black-snail-restore-cream', C.anti_aging,
  'Salyangoz müsilajı ile onarıcı gece kremi',
  [I.aqua, I.snail_secretion, I.centella, I.cica, I.niacinamide, I.shea_butter, I.dimethicone, I.adenosine],
  479);
addProduct(117, 'Iunik Centella Bubble Cleansing Foam', 'iunik-centella-bubble-cleansing-foam', C.kopuk,
  'Centella özlü nazik temizleme köpüğü',
  [I.aqua, I.centella, I.cica, I.glycerin, I.panthenol, I.allantoin, I.citric_acid, I.phenoxyethanol],
  269);
addProduct(117, 'Iunik Rose Galactomyces Synergy Serum', 'iunik-rose-galactomyces-serum', C.serum,
  'Gül suyu ve galactomyces ile aydınlatıcı serum',
  [I.aqua, I.niacinamide, I.sodium_hyaluronate, I.adenosine, I.glycerin, I.panthenol, I.tocopherol, I.allantoin],
  399);
addProduct(117, 'Iunik Noni Light Oil Serum', 'iunik-noni-light-oil-serum', C.yuz_yagi,
  'Hafif yağ-serum formülü, besleyici ve parlatıcı',
  [I.aqua, I.jojoba_oil, I.squalane, I.tocopherol, I.panthenol, I.glycerin, I.rosehip_oil],
  369);
addProduct(117, 'Iunik Daily Calming Low-pH Cleanser', 'iunik-daily-calming-cleanser', C.jel_temizleyici,
  'Düşük pH\'lı günlük yatıştırıcı temizleyici',
  [I.aqua, I.centella, I.glycerin, I.panthenol, I.allantoin, I.citric_acid, I.phenoxyethanol],
  249);

// ═══════════════════════════════════════════
// CENTELLIAN24 (118) — 12 ürün
// ═══════════════════════════════════════════

addProduct(118, 'Centellian24 Madeca Cream', 'centellian24-madeca-cream', C.bariyer,
  'Madecassoside konsantre bariyer onarım kremi',
  [I.aqua, I.madecassoside, I.centella, I.cica, I.panthenol, I.glycerin, I.dimethicone, I.allantoin, I.adenosine],
  549);
addProduct(118, 'Centellian24 Madeca Derma Cream II', 'centellian24-madeca-derma-cream-ii', C.nemlendirici,
  'Yeni nesil madeca formülü, yoğun nemlendirme',
  [I.aqua, I.madecassoside, I.centella, I.niacinamide, I.panthenol, I.sodium_hyaluronate, I.glycerin, I.dimethicone],
  599);
addProduct(118, 'Centellian24 Madeca Serum', 'centellian24-madeca-serum', C.serum,
  'Centella konsantre anti-aging serum',
  [I.aqua, I.madecassoside, I.centella, I.niacinamide, I.sodium_hyaluronate, I.adenosine, I.panthenol, I.propanediol],
  499);
addProduct(118, 'Centellian24 Madeca Toner', 'centellian24-madeca-toner', C.tonik,
  'Centella bazlı yatıştırıcı ve nemlendirici tonik',
  [I.aqua, I.madecassoside, I.centella, I.panthenol, I.glycerin, I.allantoin, I.butylene_glycol],
  399);
addProduct(118, 'Centellian24 Madeca Eye Cream', 'centellian24-madeca-eye-cream', C.goz_kremi,
  'Centella özlü göz çevresi anti-aging krem',
  [I.aqua, I.madecassoside, I.centella, I.caffeine, I.niacinamide, I.peptide_complex, I.adenosine, I.panthenol],
  449);
addProduct(118, 'Centellian24 Madeca Foam Cleanser', 'centellian24-madeca-foam-cleanser', C.kopuk,
  'Centella bazlı nazik temizleme köpüğü',
  [I.aqua, I.centella, I.madecassoside, I.glycerin, I.panthenol, I.allantoin, I.phenoxyethanol],
  299);
addProduct(118, 'Centellian24 Madeca Sun Cream SPF 50+', 'centellian24-madeca-sun-cream-spf50', C.yuz_gunes,
  'Centella koruyucu güneş kremi, hassas cilt',
  [I.aqua, I.ethylhexyl_mc, I.centella, I.madecassoside, I.panthenol, I.tocopherol, I.glycerin, I.titanium_dioxide],
  429);
addProduct(118, 'Centellian24 Madeca Ampoule', 'centellian24-madeca-ampoule', C.serum,
  'Yoğun centella konsantreli ampul',
  [I.aqua, I.madecassoside, I.centella, I.cica, I.sodium_hyaluronate, I.adenosine, I.panthenol, I.allantoin],
  529);
addProduct(118, 'Centellian24 Madeca Sleeping Pack', 'centellian24-madeca-sleeping-pack', C.gece,
  'Centella gece bakım maskesi, uyku paketi',
  [I.aqua, I.madecassoside, I.centella, I.cica, I.glycerin, I.squalane, I.dimethicone, I.panthenol],
  459);
addProduct(118, 'Centellian24 Madeca Sheet Mask', 'centellian24-madeca-sheet-mask', C.maske,
  'Tek kullanımlık centella yaprak maske',
  [I.aqua, I.madecassoside, I.centella, I.cica, I.panthenol, I.glycerin, I.allantoin, I.butylene_glycol],
  79);
addProduct(118, 'Centellian24 Madeca Body Lotion', 'centellian24-madeca-body-lotion', C.vucut_losyon,
  'Centella bazlı yatıştırıcı vücut losyonu',
  [I.aqua, I.madecassoside, I.centella, I.glycerin, I.shea_butter, I.panthenol, I.allantoin, I.dimethicone],
  349);
addProduct(118, 'Centellian24 Madeca Lip Sleeping Mask', 'centellian24-madeca-lip-sleeping-mask', C.dudak_maske,
  'Centella özlü dudak uyku maskesi, gece bakımı',
  [I.aqua, I.madecassoside, I.shea_butter, I.jojoba_oil, I.panthenol, I.tocopherol, I.glycerin],
  199);

// ═══════════════════════════════════════════
// MEVCUT MARKALARA EK — Boş kategoriler dolsun
// ═══════════════════════════════════════════

// Klairs (17) — Göz bakım boş
addProduct(17, 'Klairs Fundamental Eye Awakening Gel', 'klairs-fundamental-eye-gel', C.goz_serum,
  'Kafeinli göz çevresi jeli, şişlik ve koyu halka azaltıcı',
  [I.aqua, I.caffeine, I.niacinamide, I.sodium_hyaluronate, I.peptide_complex, I.panthenol, I.tocopherol],
  329);

// COSRX (13) — Maskara/eyeliner boş, peeling temizleyici boş
addProduct(13, 'COSRX BHA Blackhead Power Liquid', 'cosrx-bha-blackhead-power-liquid', C.peeling_temizleyici,
  'BHA bazlı siyah nokta arındırıcı peeling losyonu',
  [I.aqua, I.salicylic_acid, I.niacinamide, I.sodium_hyaluronate, I.butylene_glycol, I.panthenol, I.allantoin],
  379);

// Some By Mi (19) — Göz patch boş
addProduct(19, 'Some By Mi Yuja Niacin Brightening Eye Patch', 'some-by-mi-yuja-eye-patch', C.goz_patch,
  'Yuja ve niacinamide ile aydınlatıcı göz altı patchı',
  [I.aqua, I.niacinamide, I.ascorbic_acid, I.sodium_hyaluronate, I.glycerin, I.allantoin, I.panthenol],
  249);

// Innisfree (28) — Vücut yağı boş
addProduct(28, 'Innisfree Green Tea Seed Body Oil', 'innisfree-green-tea-body-oil', C.vucut_yagi,
  'Yeşil çay tohumu bazlı besleyici vücut yağı',
  [I.aqua, I.grape_seed, I.jojoba_oil, I.tocopherol, I.squalane, I.glycerin, I.parfum],
  329);

// Bioderma (4) — Makyaj temizleyici boş
addProduct(4, 'Bioderma Sensibio H2O Makyaj Temizleyici', 'bioderma-sensibio-h2o-makyaj-temizleyici', C.makyaj_temizleyici,
  'Hassas cilt için misel su makyaj temizleyici, 500ml',
  [I.aqua, I.glycerin, I.cetyl_alcohol, I.propanediol, I.phenoxyethanol],
  399);

// La Roche-Posay (varsa ID kontrol) — Renkli güneş boş
// LRP brand_id = 3
addProduct(3, 'La Roche-Posay Anthelios Tinted Fluid SPF 50+', 'lrp-anthelios-tinted-fluid-spf50', C.renkli_gunes,
  'Renkli güneş koruyucu, doğal ton eşitleme',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.butyl_mdb, I.titanium_dioxide, I.niacinamide, I.tocopherol, I.glycerin],
  549);

// ═══════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to DB\n');

  // --- Insert Brands ---
  for (const b of newBrands) {
    try {
      await client.query(
        `INSERT INTO brands (brand_id, brand_name, brand_slug, country_of_origin, website_url, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
         ON CONFLICT (brand_id) DO NOTHING`,
        [b.id, b.name, b.slug, b.country, b.website]
      );
      console.log(`Brand: ${b.name} (${b.id})`);
    } catch (e) {
      console.log(`Brand ${b.name} error: ${e.message}`);
    }
  }

  // --- Insert Products ---
  let inserted = 0, skipped = 0;
  for (const p of products) {
    try {
      // Check if slug exists
      const exists = await client.query('SELECT product_id FROM products WHERE product_slug = $1', [p.slug]);
      if (exists.rows.length > 0) {
        skipped++;
        continue;
      }

      await client.query(
        `INSERT INTO products (product_id, brand_id, product_name, product_slug, category_id, short_description, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())`,
        [p.id, p.brand_id, p.name, p.slug, p.category_id, p.short_description]
      );

      // Product image (placeholder — Bing scraper will fill later)
      await client.query(
        `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text, created_at)
         VALUES ($1, $2, 'primary', 1, $3, NOW())`,
        [p.id, `https://placehold.co/400x400/f8f8f8/999?text=${encodeURIComponent(p.name.split(' ').slice(0, 3).join('+'))}`, p.name]
      );

      // Product-ingredient relations
      if (p.ingredients && p.ingredients.length > 0) {
        for (let i = 0; i < p.ingredients.length; i++) {
          const ingId = p.ingredients[i];
          if (!ingId) continue;
          try {
            await client.query(
              `INSERT INTO product_ingredients (product_id, ingredient_id, inci_order_rank, created_at, updated_at)
               VALUES ($1, $2, $3, NOW(), NOW())
               ON CONFLICT DO NOTHING`,
              [p.id, ingId, i + 1]
            );
          } catch (e) { /* skip invalid ingredient */ }
        }
      }

      inserted++;
      if (inserted % 10 === 0) console.log(`  Inserted ${inserted} products...`);
    } catch (e) {
      console.log(`Product ${p.name} error: ${e.message}`);
    }
  }

  console.log(`\n═══ RESULTS ═══`);
  console.log(`Brands added: ${newBrands.length}`);
  console.log(`Products inserted: ${inserted}`);
  console.log(`Products skipped (duplicate): ${skipped}`);
  console.log(`Total products in list: ${products.length}`);

  // Verify
  const stats = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM brands WHERE is_active = true) as brands,
      (SELECT COUNT(*) FROM products WHERE status = 'active') as products,
      (SELECT COUNT(*) FROM product_images) as images,
      (SELECT COUNT(*) FROM product_images WHERE image_url LIKE '%placehold%' OR image_url LIKE '%dicebear%') as placeholder_images
  `);
  console.log('\nDB Stats:', stats.rows[0]);

  // Check previously-empty categories now have products
  const filledCats = await client.query(`
    SELECT c.category_name, COUNT(p.product_id) as cnt
    FROM categories c
    JOIN products p ON p.category_id = c.category_id
    WHERE c.category_id IN (8, 120, 123, 125, 126, 129, 131, 132, 133, 136, 138, 144, 145, 146, 147, 148)
    GROUP BY c.category_name
    ORDER BY c.category_name
  `);
  console.log('\nPreviously empty categories now filled:');
  filledCats.rows.forEach(r => console.log(`  ${r.category_name}: ${r.cnt} products`));

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
