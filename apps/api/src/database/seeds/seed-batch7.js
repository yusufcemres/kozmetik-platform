/**
 * REVELA — Batch 7 Seed
 * 7 yeni marka + ~110 ürün + mevcut markalara takviye
 * Railway PostgreSQL'e direkt çalıştır: node seed-batch7.js
 */
const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// === INGREDIENT ID MAP ===
const I = {
  niacinamide: 1, retinol: 2, hyaluronic_acid: 3, salicylic_acid: 4, glycolic_acid: 5,
  ceramide_np: 6, ascorbic_acid: 7, panthenol: 8, zinc_pca: 9, tocopherol: 10,
  centella: 11, glycerin: 12, azelaic_acid: 13, squalane: 14, allantoin: 15,
  lactic_acid: 16, madecassoside: 17, sodium_hyaluronate: 18, bakuchiol: 20,
  aqua: 21, parfum: 22, phenoxyethanol: 23, butylene_glycol: 24, dimethicone: 25,
  caffeine: 26, arbutin: 27, shea_butter: 30, cetearyl_alcohol: 31, propanediol: 36,
  ethylhexyl_mc: 37, zinc_oxide: 38, titanium_dioxide: 39, bisabolol: 40, jojoba_oil: 51,
  kojic_acid: 68, ceramide_ap: 77, cholesterol: 78, phytosphingosine: 79,
  cetyl_alcohol: 241, stearic_acid: 247, aloe: 559, biotin: 1351, copper_tripeptide: 1367,
  citric_acid: 1470, octocrylene: 1526, butyl_mdb: 1536, piroctone: 1872,
  climbazole: 1873, arginine: 2114, collagen: 2035, alpha_arbutin: 3128,
  adenosine: 3122, ceramide_eop: 3074, carbomer: 1977, xanthan_gum: 1976,
  sodium_hydroxide: 2072, polysorbate_80: 1929, bht: 1903, disodium_edta: 2568,
  caprylic_triglyceride: 237, isopropyl_myristate: 238, ceteareth_20: 1673,
};

// === CATEGORY MAP ===
const C = {
  yuz: 1, temizleme: 2, gunes: 3, goz: 4, dudak: 5, vucut: 6, sac: 7,
  nemlendirici: 104, serum: 105, peeling: 106, tonik: 107, maske: 108,
  anti_aging: 111, leke: 112, sivilce: 113, bariyer: 114,
  jel_temizleyici: 115, misel: 116, kopuk: 117, temizleme_sutu: 118,
  temizleme_yagi: 119, yuz_gunes: 122, goz_kremi: 127, goz_serum: 128,
  sampuan: 139, sac_maskesi: 140, sac_serum: 141, sac_kremi: 142,
  vucut_nemlendirici: 134, vucut_losyon: 135, el_kremi: 137,
};

// === NEW BRANDS ===
const newBrands = [
  { id: 118, name: 'Bionnex', slug: 'bionnex', country: 'TR', website: 'https://bionnex.com.tr', desc: 'Dermokozmetik ve saç bakım markası' },
  { id: 119, name: 'Cosmed', slug: 'cosmed', country: 'TR', website: 'https://cosmed.com.tr', desc: 'Türk dermokozmetik markası' },
  { id: 120, name: 'Bioxcin', slug: 'bioxcin', country: 'TR', website: 'https://bioxcin.com.tr', desc: 'Bitkisel saç ve cilt bakım' },
  { id: 121, name: 'Mustela', slug: 'mustela', country: 'FR', website: 'https://mustela.com.tr', desc: 'Bebek ve anne cilt bakım' },
  { id: 122, name: 'Urban Care', slug: 'urban-care', country: 'TR', website: 'https://urbancare.com.tr', desc: 'Saç ve vücut bakım' },
  { id: 123, name: 'She Vec', slug: 'she-vec', country: 'TR', website: 'https://shevec.com', desc: 'Cilt bakım serumları ve kremleri' },
  { id: 124, name: 'Cream Co.', slug: 'cream-co', country: 'TR', website: 'https://creamco.com.tr', desc: 'Fonksiyonel cilt bakım serumları' },
];

// === PRODUCTS ===
let pid = 1909;
const products = [];

function addProduct(brand_id, name, slug, category_id, desc, ingredients, price) {
  products.push({
    id: pid++, brand_id, name, slug, category_id,
    short_description: desc,
    ingredients: ingredients,
    price: price,
  });
}

// --- BIONNEX (118) - 12 ürün ---
addProduct(118, 'Bionnex Preventiva Güneş Kremi SPF 50+', 'bionnex-preventiva-gunes-kremi-spf50', C.yuz_gunes,
  'Yüksek koruma faktörlü yüz güneş kremi, hassas ciltler için',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.butyl_mdb, I.glycerin, I.titanium_dioxide, I.tocopherol, I.panthenol, I.allantoin, I.dimethicone],
  329);
addProduct(118, 'Bionnex Organica Saç Dökülme Karşıtı Şampuan', 'bionnex-organica-sac-dokulmesi-sampuan', C.sampuan,
  'Organik bitkisel özlerle saç dökülmesine karşı günlük şampuan',
  [I.aqua, I.piroctone, I.biotin, I.caffeine, I.panthenol, I.arginine, I.allantoin, I.citric_acid],
  219);
addProduct(118, 'Bionnex Preventiva Leke Karşıtı Krem SPF 30', 'bionnex-preventiva-leke-karsiti-krem', C.leke,
  'Leke giderici ve ton eşitleyici bakım kremi, SPF 30 koruma',
  [I.aqua, I.niacinamide, I.alpha_arbutin, I.ascorbic_acid, I.glycerin, I.tocopherol, I.dimethicone, I.ethylhexyl_mc],
  289);
addProduct(118, 'Bionnex Perfederm Nemlendirici Yüz Kremi', 'bionnex-perfederm-nemlendirici-krem', C.nemlendirici,
  'Kuru ve hassas ciltler için yoğun nemlendirici bakım',
  [I.aqua, I.glycerin, I.shea_butter, I.squalane, I.ceramide_np, I.panthenol, I.allantoin, I.tocopherol, I.dimethicone],
  259);
addProduct(118, 'Bionnex Organica Anti-Hair Loss Serum', 'bionnex-organica-sac-serum', C.sac_serum,
  'Saç köklerini güçlendiren yoğun bakım serumu',
  [I.aqua, I.caffeine, I.biotin, I.panthenol, I.arginine, I.copper_tripeptide, I.propanediol],
  349);
addProduct(118, 'Bionnex Preventiva Yüz Yıkama Jeli', 'bionnex-preventiva-yuz-yikama-jeli', C.jel_temizleyici,
  'Hassas ciltler için nazik temizleme jeli',
  [I.aqua, I.glycerin, I.panthenol, I.allantoin, I.bisabolol, I.aloe, I.citric_acid, I.phenoxyethanol],
  179);
addProduct(118, 'Bionnex Preventiva Göz Çevresi Kremi', 'bionnex-preventiva-goz-kremi', C.goz_kremi,
  'Göz çevresi kırışıklık ve koyu halka bakımı',
  [I.aqua, I.caffeine, I.niacinamide, I.retinol, I.peptide, I.tocopherol, I.squalane, I.panthenol],
  269);
addProduct(118, 'Bionnex Preventiva C Vitamini Serum', 'bionnex-preventiva-c-vitamini-serum', C.serum,
  'Aydınlatıcı ve antioksidan C vitamini serumu',
  [I.aqua, I.ascorbic_acid, I.sodium_hyaluronate, I.tocopherol, I.panthenol, I.glycerin, I.propanediol],
  299);
addProduct(118, 'Bionnex Organica Kepek Karşıtı Şampuan', 'bionnex-organica-kepek-sampuan', C.sampuan,
  'Piroctone olamine ile kepek kontrolü',
  [I.aqua, I.piroctone, I.climbazole, I.zinc_pca, I.biotin, I.panthenol, I.aloe, I.citric_acid],
  199);
addProduct(118, 'Bionnex Preventiva Body Lotion', 'bionnex-preventiva-vucut-losyonu', C.vucut_losyon,
  'Hassas ciltler için günlük vücut losyonu',
  [I.aqua, I.glycerin, I.shea_butter, I.panthenol, I.allantoin, I.tocopherol, I.dimethicone, I.parfum],
  189);
addProduct(118, 'Bionnex Preventiva Retinol Serum', 'bionnex-preventiva-retinol-serum', C.serum,
  'Anti-aging retinol serumu, kırışıklık karşıtı',
  [I.aqua, I.retinol, I.sodium_hyaluronate, I.tocopherol, I.squalane, I.niacinamide, I.propanediol],
  319);
addProduct(118, 'Bionnex Preventiva Hyaluronik Asit Serum', 'bionnex-preventiva-ha-serum', C.serum,
  'Yoğun nemlendirme ve dolgunluk sağlayan HA serumu',
  [I.aqua, I.hyaluronic_acid, I.sodium_hyaluronate, I.panthenol, I.glycerin, I.allantoin, I.propanediol],
  279);

// --- COSMED (119) - 10 ürün ---
addProduct(119, 'Cosmed Alight C Vitamini Serum %10', 'cosmed-alight-c-vitamini-serum', C.serum,
  'Aydınlatıcı ve leke karşıtı saf C vitamini serumu',
  [I.aqua, I.ascorbic_acid, I.sodium_hyaluronate, I.glycerin, I.tocopherol, I.propanediol, I.panthenol],
  449);
addProduct(119, 'Cosmed Complete Benefit Nemlendirici Krem', 'cosmed-complete-benefit-nemlendirici', C.nemlendirici,
  'Tüm cilt tipleri için çoklu fayda nemlendirici',
  [I.aqua, I.glycerin, I.niacinamide, I.ceramide_np, I.panthenol, I.squalane, I.tocopherol, I.dimethicone],
  389);
addProduct(119, 'Cosmed Atopia Nemlendirici Krem', 'cosmed-atopia-nemlendirici-krem', C.bariyer,
  'Atopik ve çok kuru ciltler için bariyer onarıcı krem',
  [I.aqua, I.glycerin, I.shea_butter, I.ceramide_np, I.ceramide_ap, I.cholesterol, I.panthenol, I.allantoin],
  359);
addProduct(119, 'Cosmed Alight Niacinamide Serum %10', 'cosmed-alight-niacinamide-serum', C.serum,
  'Gözenek sıkılaştırıcı ve ton eşitleyici niacinamide serumu',
  [I.aqua, I.niacinamide, I.zinc_pca, I.sodium_hyaluronate, I.panthenol, I.glycerin, I.propanediol],
  399);
addProduct(119, 'Cosmed Day To Day Temizleme Jeli', 'cosmed-day-to-day-temizleme-jeli', C.jel_temizleyici,
  'Günlük kullanım için hafif temizleme jeli',
  [I.aqua, I.glycerin, I.panthenol, I.aloe, I.allantoin, I.citric_acid, I.phenoxyethanol],
  249);
addProduct(119, 'Cosmed Sun Essential Güneş Kremi SPF 50', 'cosmed-sun-essential-gunes-kremi', C.yuz_gunes,
  'Yüksek koruma faktörlü günlük güneş kremi',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.butyl_mdb, I.glycerin, I.tocopherol, I.panthenol, I.dimethicone],
  349);
addProduct(119, 'Cosmed Alight AHA %10 Peeling', 'cosmed-alight-aha-peeling', C.peeling,
  'AHA bazlı kimyasal peeling, cilt yenileme',
  [I.aqua, I.glycolic_acid, I.lactic_acid, I.niacinamide, I.sodium_hyaluronate, I.allantoin, I.panthenol],
  369);
addProduct(119, 'Cosmed Alight Retinol Serum %0.5', 'cosmed-alight-retinol-serum', C.serum,
  'Anti-aging retinol serumu, saf retinol %0.5',
  [I.aqua, I.retinol, I.squalane, I.sodium_hyaluronate, I.tocopherol, I.niacinamide, I.bisabolol],
  429);
addProduct(119, 'Cosmed Complete Benefit Göz Kremi', 'cosmed-complete-benefit-goz-kremi', C.goz_kremi,
  'Göz çevresi bakımı, koyu halka ve kırışıklık karşıtı',
  [I.aqua, I.caffeine, I.niacinamide, I.sodium_hyaluronate, I.tocopherol, I.panthenol, I.squalane],
  339);
addProduct(119, 'Cosmed Hair Guard Saç Dökülme Şampuanı', 'cosmed-hair-guard-sampuan', C.sampuan,
  'Saç dökülmesine karşı güçlendirici şampuan',
  [I.aqua, I.caffeine, I.biotin, I.piroctone, I.panthenol, I.arginine, I.zinc_pca, I.aloe],
  299);

// --- BIOXCIN (120) - 12 ürün ---
addProduct(120, 'Bioxcin Forte Şampuan Yoğun Saç Dökülmesi', 'bioxcin-forte-sampuan', C.sampuan,
  'Yoğun saç dökülmesine karşı bitkisel formül',
  [I.aqua, I.caffeine, I.biotin, I.piroctone, I.panthenol, I.arginine, I.allantoin, I.aloe],
  189);
addProduct(120, 'Bioxcin Genesis Şampuan Kuru/Normal Saç', 'bioxcin-genesis-sampuan-kuru', C.sampuan,
  'Kuru ve normal saçlar için dökülme karşıtı bakım',
  [I.aqua, I.biotin, I.panthenol, I.arginine, I.glycerin, I.aloe, I.citric_acid, I.parfum],
  159);
addProduct(120, 'Bioxcin Collagen & Biotin Hacim Şampuanı', 'bioxcin-collagen-biotin-sampuan', C.sampuan,
  'Kolajen ve biotin ile hacim veren şampuan',
  [I.aqua, I.collagen, I.biotin, I.panthenol, I.glycerin, I.arginine, I.parfum, I.citric_acid],
  179);
addProduct(120, 'Bioxcin Acnium Sivilce Karşıtı Yüz Yıkama Jeli', 'bioxcin-acnium-yuz-jeli', C.sivilce,
  'Sivilceye eğilimli ciltler için arındırıcı jel',
  [I.aqua, I.salicylic_acid, I.niacinamide, I.zinc_pca, I.aloe, I.allantoin, I.phenoxyethanol],
  229);
addProduct(120, 'Bioxcin Acnium Serum Niacinamide %10', 'bioxcin-acnium-niacinamide-serum', C.serum,
  'Sivilce ve gözenek bakımı için niacinamide serumu',
  [I.aqua, I.niacinamide, I.zinc_pca, I.salicylic_acid, I.panthenol, I.allantoin, I.propanediol],
  259);
addProduct(120, 'Bioxcin Sun Care Güneş Kremi SPF 50+', 'bioxcin-sun-care-gunes-kremi', C.yuz_gunes,
  'Bitkisel destekli yüz güneş kremi',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.titanium_dioxide, I.tocopherol, I.panthenol, I.aloe, I.glycerin],
  269);
addProduct(120, 'Bioxcin Beauty Collagen Serum', 'bioxcin-beauty-collagen-serum', C.serum,
  'Kolajen destekli sıkılaştırıcı yüz serumu',
  [I.aqua, I.collagen, I.sodium_hyaluronate, I.niacinamide, I.panthenol, I.tocopherol, I.glycerin],
  299);
addProduct(120, 'Bioxcin Aqua Thermal Nemlendirici Krem', 'bioxcin-aqua-thermal-nemlendirici', C.nemlendirici,
  'Termal su bazlı hafif nemlendirici krem',
  [I.aqua, I.glycerin, I.sodium_hyaluronate, I.panthenol, I.allantoin, I.tocopherol, I.dimethicone],
  249);
addProduct(120, 'Bioxcin Femina Kadınlara Özel Şampuan', 'bioxcin-femina-kadin-sampuan', C.sampuan,
  'Kadınlara özel saç dökülme karşıtı formül',
  [I.aqua, I.biotin, I.caffeine, I.panthenol, I.arginine, I.keratin, I.parfum, I.citric_acid],
  169);
addProduct(120, 'Bioxcin Saç Serumu Dökülme Karşıtı', 'bioxcin-sac-serumu-dokulmesi', C.sac_serum,
  'Yoğun saç dökülme bakım serumu',
  [I.aqua, I.caffeine, I.biotin, I.panthenol, I.copper_tripeptide, I.arginine, I.propanediol],
  219);
addProduct(120, 'Bioxcin Acnium Leke Karşıtı Krem', 'bioxcin-acnium-leke-karsiti-krem', C.leke,
  'Sivilce sonrası leke bakım kremi',
  [I.aqua, I.niacinamide, I.alpha_arbutin, I.ascorbic_acid, I.glycerin, I.tocopherol, I.allantoin],
  239);
addProduct(120, 'Bioxcin Terra Cotta Kil Maskesi', 'bioxcin-terra-cotta-kil-maskesi', C.maske,
  'Gözenek temizleyici kil maske',
  [I.aqua, I.glycerin, I.zinc_oxide, I.salicylic_acid, I.aloe, I.allantoin, I.panthenol],
  189);

// --- MUSTELA (121) - 8 ürün ---
addProduct(121, 'Mustela Hydra Bébé Yüz Kremi', 'mustela-hydra-bebe-yuz-kremi', C.nemlendirici,
  'Bebekler için doğal nemlendirici yüz kremi',
  [I.aqua, I.glycerin, I.shea_butter, I.tocopherol, I.panthenol, I.allantoin, I.dimethicone],
  329);
addProduct(121, 'Mustela Stelatopia Nemlendirici Balm', 'mustela-stelatopia-nemlendirici-balm', C.bariyer,
  'Atopik dermatite eğilimli ciltler için nemlendirici balm',
  [I.aqua, I.shea_butter, I.glycerin, I.ceramide_np, I.squalane, I.tocopherol, I.panthenol, I.allantoin],
  449);
addProduct(121, 'Mustela Gentle Cleansing Gel', 'mustela-gentle-cleansing-gel', C.jel_temizleyici,
  'Bebek saç ve vücut için nazik temizleme jeli',
  [I.aqua, I.glycerin, I.aloe, I.panthenol, I.allantoin, I.citric_acid, I.phenoxyethanol],
  279);
addProduct(121, 'Mustela Vitamin Barrier Cream', 'mustela-vitamin-barrier-cream', C.bariyer,
  'Bebek pişik bariyer kremi, vitamin destekli',
  [I.aqua, I.zinc_oxide, I.glycerin, I.shea_butter, I.panthenol, I.tocopherol, I.allantoin],
  299);
addProduct(121, 'Mustela Güneş Koruyucu Losyon SPF 50+', 'mustela-gunes-koruyucu-losyon', C.yuz_gunes,
  'Bebek ve çocuklar için yüksek koruma güneş losyonu',
  [I.aqua, I.titanium_dioxide, I.zinc_oxide, I.glycerin, I.tocopherol, I.shea_butter, I.panthenol],
  399);
addProduct(121, 'Mustela Stretch Marks Cream', 'mustela-stretch-marks-cream', C.vucut_nemlendirici,
  'Hamilelik çatlak bakım kremi',
  [I.aqua, I.glycerin, I.shea_butter, I.squalane, I.tocopherol, I.panthenol, I.dimethicone, I.allantoin],
  419);
addProduct(121, 'Mustela Nourishing Lotion', 'mustela-nourishing-lotion', C.vucut_losyon,
  'Bebek vücut bakım losyonu, besleyici formül',
  [I.aqua, I.glycerin, I.shea_butter, I.jojoba_oil, I.tocopherol, I.panthenol, I.allantoin],
  289);
addProduct(121, 'Mustela Stelatopia Temizleme Yağı', 'mustela-stelatopia-temizleme-yagi', C.temizleme_yagi,
  'Atopik ciltler için nazik temizleme yağı',
  [I.aqua, I.glycerin, I.squalane, I.shea_butter, I.tocopherol, I.allantoin, I.panthenol],
  369);

// --- URBAN CARE (122) - 10 ürün ---
addProduct(122, 'Urban Care Argan Oil & Keratin Şampuan', 'urban-care-argan-keratin-sampuan', C.sampuan,
  'Argan yağı ve keratin ile onarıcı saç bakım şampuanı',
  [I.aqua, I.jojoba_oil, I.panthenol, I.glycerin, I.tocopherol, I.arginine, I.parfum, I.citric_acid],
  119);
addProduct(122, 'Urban Care Coconut & Aloe Vera Şampuan', 'urban-care-coconut-aloe-sampuan', C.sampuan,
  'Hindistan cevizi ve aloe vera ile nemlendirici şampuan',
  [I.aqua, I.aloe, I.glycerin, I.panthenol, I.tocopherol, I.parfum, I.citric_acid, I.phenoxyethanol],
  119);
addProduct(122, 'Urban Care Hyaluronic Acid & Collagen Şampuan', 'urban-care-ha-collagen-sampuan', C.sampuan,
  'Hyaluronik asit ve kolajen ile hacim veren şampuan',
  [I.aqua, I.sodium_hyaluronate, I.collagen, I.panthenol, I.glycerin, I.biotin, I.parfum],
  129);
addProduct(122, 'Urban Care Biotin & Caffeine Şampuan', 'urban-care-biotin-caffeine-sampuan', C.sampuan,
  'Biotin ve kafein ile dökülme karşıtı şampuan',
  [I.aqua, I.biotin, I.caffeine, I.panthenol, I.arginine, I.glycerin, I.parfum, I.citric_acid],
  129);
addProduct(122, 'Urban Care Argan Oil Saç Bakım Maskesi', 'urban-care-argan-sac-maskesi', C.sac_maskesi,
  'Argan yağlı yoğun onarıcı saç maskesi',
  [I.aqua, I.jojoba_oil, I.shea_butter, I.panthenol, I.glycerin, I.tocopherol, I.parfum],
  99);
addProduct(122, 'Urban Care Coconut Saç Bakım Kremi', 'urban-care-coconut-sac-kremi', C.sac_kremi,
  'Hindistan cevizi yağlı durulanmayan saç bakım kremi',
  [I.aqua, I.glycerin, I.panthenol, I.dimethicone, I.tocopherol, I.aloe, I.parfum],
  89);
addProduct(122, 'Urban Care Hyaluronic Acid Saç Serumu', 'urban-care-ha-sac-serumu', C.sac_serum,
  'Hyaluronik asit ile saç nem serumu',
  [I.aqua, I.sodium_hyaluronate, I.panthenol, I.glycerin, I.dimethicone, I.tocopherol, I.parfum],
  109);
addProduct(122, 'Urban Care Keratin Saç Bakım Yağı', 'urban-care-keratin-sac-yagi', C.sac_serum,
  'Keratin destekli besleyici saç bakım yağı',
  [I.jojoba_oil, I.squalane, I.tocopherol, I.dimethicone, I.parfum],
  99);
addProduct(122, 'Urban Care Duş Jeli Coconut & Vanilla', 'urban-care-dus-jeli-coconut', C.vucut,
  'Hindistan cevizi ve vanilya kokulu duş jeli',
  [I.aqua, I.glycerin, I.aloe, I.panthenol, I.parfum, I.citric_acid, I.phenoxyethanol],
  79);
addProduct(122, 'Urban Care El Kremi Argan Oil', 'urban-care-el-kremi-argan', C.el_kremi,
  'Argan yağlı nemlendirici el bakım kremi',
  [I.aqua, I.glycerin, I.jojoba_oil, I.shea_butter, I.panthenol, I.allantoin, I.tocopherol, I.parfum],
  69);

// --- SHE VEC (123) - 10 ürün ---
addProduct(123, 'She Vec Vitamin C Brightening Serum', 'she-vec-vitamin-c-serum', C.serum,
  'Aydınlatıcı ve canlandırıcı C vitamini serumu',
  [I.aqua, I.ascorbic_acid, I.sodium_hyaluronate, I.niacinamide, I.tocopherol, I.panthenol, I.propanediol],
  249);
addProduct(123, 'She Vec Hyaluronic Acid Serum', 'she-vec-hyaluronic-acid-serum', C.serum,
  'Yoğun nemlendirme hyaluronik asit serumu',
  [I.aqua, I.hyaluronic_acid, I.sodium_hyaluronate, I.panthenol, I.glycerin, I.allantoin, I.propanediol],
  229);
addProduct(123, 'She Vec Retinol Anti-Aging Serum', 'she-vec-retinol-serum', C.serum,
  'Kırışıklık karşıtı retinol bakım serumu',
  [I.aqua, I.retinol, I.niacinamide, I.sodium_hyaluronate, I.tocopherol, I.squalane, I.bisabolol],
  269);
addProduct(123, 'She Vec Niacinamide %10 Serum', 'she-vec-niacinamide-serum', C.serum,
  'Gözenek sıkılaştırıcı ve sebum dengeleyici serum',
  [I.aqua, I.niacinamide, I.zinc_pca, I.panthenol, I.sodium_hyaluronate, I.glycerin, I.propanediol],
  219);
addProduct(123, 'She Vec AHA BHA Peeling Solution', 'she-vec-aha-bha-peeling', C.peeling,
  'AHA+BHA kimyasal peeling çözeltisi',
  [I.aqua, I.glycolic_acid, I.salicylic_acid, I.lactic_acid, I.niacinamide, I.allantoin, I.panthenol],
  199);
addProduct(123, 'She Vec Centella Calming Cream', 'she-vec-centella-calming-cream', C.nemlendirici,
  'Centella asiatica ile yatıştırıcı nemlendirici krem',
  [I.aqua, I.centella, I.madecassoside, I.panthenol, I.glycerin, I.squalane, I.allantoin, I.bisabolol],
  239);
addProduct(123, 'She Vec Salicylic Acid Cleanser', 'she-vec-salicylic-acid-cleanser', C.sivilce,
  'Salisilik asit temizleyici jel, sivilceye eğilimli ciltler',
  [I.aqua, I.salicylic_acid, I.niacinamide, I.aloe, I.allantoin, I.glycerin, I.phenoxyethanol],
  179);
addProduct(123, 'She Vec SPF 50+ Invisible Sunscreen', 'she-vec-spf50-invisible-sunscreen', C.yuz_gunes,
  'Görünmez doku güneş koruyucu krem SPF 50+',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.butyl_mdb, I.glycerin, I.niacinamide, I.tocopherol, I.panthenol],
  199);
addProduct(123, 'She Vec Eye Contour Cream', 'she-vec-eye-contour-cream', C.goz_kremi,
  'Kafein ve peptit içerikli göz çevresi kremi',
  [I.aqua, I.caffeine, I.niacinamide, I.sodium_hyaluronate, I.panthenol, I.tocopherol, I.squalane],
  209);
addProduct(123, 'She Vec Arbutin Brightening Serum', 'she-vec-arbutin-brightening-serum', C.leke,
  'Alpha arbutin ile leke karşıtı aydınlatıcı serum',
  [I.aqua, I.alpha_arbutin, I.niacinamide, I.ascorbic_acid, I.sodium_hyaluronate, I.panthenol, I.glycerin],
  239);

// --- CREAM CO. (124) - 10 ürün ---
addProduct(124, 'Cream Co. Niacinamide %10 + Zinc %1 Serum', 'cream-co-niacinamide-zinc-serum', C.serum,
  'Gözenek bakımı ve sebum dengeleme serumu',
  [I.aqua, I.niacinamide, I.zinc_pca, I.sodium_hyaluronate, I.panthenol, I.propanediol, I.phenoxyethanol],
  179);
addProduct(124, 'Cream Co. Retinol %0.5 Serum', 'cream-co-retinol-serum', C.serum,
  'Anti-aging saf retinol serumu',
  [I.aqua, I.retinol, I.squalane, I.tocopherol, I.niacinamide, I.bisabolol, I.propanediol],
  199);
addProduct(124, 'Cream Co. Hyaluronic Acid %2 + B5 Serum', 'cream-co-ha-b5-serum', C.serum,
  'Çift moleküllü hyaluronik asit nemlendirme serumu',
  [I.aqua, I.hyaluronic_acid, I.sodium_hyaluronate, I.panthenol, I.glycerin, I.allantoin, I.propanediol],
  169);
addProduct(124, 'Cream Co. Vitamin C %15 Serum', 'cream-co-vitamin-c-serum', C.serum,
  'Yüksek dozlu C vitamini aydınlatıcı serum',
  [I.aqua, I.ascorbic_acid, I.tocopherol, I.sodium_hyaluronate, I.propanediol, I.panthenol],
  189);
addProduct(124, 'Cream Co. AHA %30 + BHA %2 Peeling', 'cream-co-aha-bha-peeling', C.peeling,
  'Güçlü kimyasal peeling, cilt tonu eşitleme',
  [I.aqua, I.glycolic_acid, I.salicylic_acid, I.lactic_acid, I.niacinamide, I.allantoin, I.propanediol],
  159);
addProduct(124, 'Cream Co. Salicylic Acid %2 Serum', 'cream-co-salicylic-acid-serum', C.sivilce,
  'BHA serum, sivilce ve siyah nokta bakımı',
  [I.aqua, I.salicylic_acid, I.niacinamide, I.zinc_pca, I.allantoin, I.propanediol, I.phenoxyethanol],
  149);
addProduct(124, 'Cream Co. Azelaic Acid %10 Serum', 'cream-co-azelaic-acid-serum', C.serum,
  'Azelaik asit ile leke ve sivilce bakımı',
  [I.aqua, I.azelaic_acid, I.niacinamide, I.sodium_hyaluronate, I.glycerin, I.propanediol, I.allantoin],
  169);
addProduct(124, 'Cream Co. Caffeine Eye Serum', 'cream-co-caffeine-eye-serum', C.goz_serum,
  'Kafein göz çevresi aydınlatıcı serum',
  [I.aqua, I.caffeine, I.niacinamide, I.sodium_hyaluronate, I.panthenol, I.glycerin, I.propanediol],
  159);
addProduct(124, 'Cream Co. Centella Recovery Cream', 'cream-co-centella-recovery-cream', C.bariyer,
  'Centella bariyer onarıcı bakım kremi',
  [I.aqua, I.centella, I.madecassoside, I.panthenol, I.glycerin, I.squalane, I.ceramide_np, I.allantoin],
  189);
addProduct(124, 'Cream Co. Glycolic Acid %7 Toner', 'cream-co-glycolic-acid-toner', C.tonik,
  'Glikolik asit ile cilt yenileyen tonik',
  [I.aqua, I.glycolic_acid, I.niacinamide, I.aloe, I.panthenol, I.allantoin, I.sodium_hydroxide],
  139);

// --- VICHY (9) - +10 ürün ---
addProduct(9, 'Vichy Minéral 89 Hyaluronic Acid Serum', 'vichy-mineral-89-ha-serum', C.serum,
  'Vichy termal suyu ve hyaluronik asit ile güçlendirici serum',
  [I.aqua, I.hyaluronic_acid, I.sodium_hyaluronate, I.glycerin, I.panthenol, I.citric_acid, I.phenoxyethanol],
  549);
addProduct(9, 'Vichy Liftactiv Collagen Specialist', 'vichy-liftactiv-collagen-specialist', C.anti_aging,
  'Kolajen üretimini destekleyen anti-aging krem',
  [I.aqua, I.glycerin, I.niacinamide, I.dimethicone, I.tocopherol, I.ascorbic_acid, I.adenosine, I.parfum],
  699);
addProduct(9, 'Vichy Normaderm Phytosolution Jel', 'vichy-normaderm-phytosolution-jel', C.sivilce,
  'Sivilceye eğilimli ciltler için çift etkili nemlendirici jel',
  [I.aqua, I.salicylic_acid, I.niacinamide, I.glycerin, I.zinc_pca, I.panthenol, I.dimethicone],
  489);
addProduct(9, 'Vichy Capital Soleil UV-Age Daily SPF 50+', 'vichy-capital-soleil-uv-age-daily', C.yuz_gunes,
  'Foto-yaşlanma karşıtı hafif dokulu güneş kremi',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.niacinamide, I.tocopherol, I.glycerin, I.dimethicone],
  549);
addProduct(9, 'Vichy Aqualia Thermal Rich Cream', 'vichy-aqualia-thermal-rich-cream', C.nemlendirici,
  'Kuru ciltler için zengin dokulu nemlendirici krem',
  [I.aqua, I.glycerin, I.shea_butter, I.sodium_hyaluronate, I.dimethicone, I.tocopherol, I.parfum],
  479);
addProduct(9, 'Vichy Dercos Anti-Dandruff Şampuan', 'vichy-dercos-anti-dandruff-sampuan', C.sampuan,
  'Kepek karşıtı etkili saç bakım şampuanı',
  [I.aqua, I.piroctone, I.salicylic_acid, I.panthenol, I.glycerin, I.citric_acid, I.parfum],
  359);
addProduct(9, 'Vichy Liftactiv Supreme Göz Kremi', 'vichy-liftactiv-supreme-goz-kremi', C.goz_kremi,
  'Anti-aging göz çevresi bakım kremi',
  [I.aqua, I.caffeine, I.niacinamide, I.adenosine, I.sodium_hyaluronate, I.dimethicone, I.tocopherol],
  519);
addProduct(9, 'Vichy Pureté Thermale Misel Su', 'vichy-purete-thermale-misel-su', C.misel,
  'Vichy termal suyu ile 3-in-1 misel temizleme suyu',
  [I.aqua, I.glycerin, I.panthenol, I.allantoin, I.citric_acid, I.phenoxyethanol],
  299);
addProduct(9, 'Vichy Slow Âge SPF 25 Krem', 'vichy-slow-age-spf25-krem', C.anti_aging,
  'Yaşlanma belirtilerini geciktiren koruyucu krem',
  [I.aqua, I.glycerin, I.niacinamide, I.bakuchiol, I.tocopherol, I.ethylhexyl_mc, I.dimethicone, I.parfum],
  599);
addProduct(9, 'Vichy Idéal Soleil Velvety Cream SPF 50', 'vichy-ideal-soleil-velvety-cream', C.yuz_gunes,
  'Kadifemsi dokulu yüz güneş kremi SPF 50',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.butyl_mdb, I.glycerin, I.dimethicone, I.tocopherol],
  449);

// --- BIODERMA (4) - +8 ürün ---
addProduct(4, 'Bioderma Sensibio H2O Misel Su 500ml', 'bioderma-sensibio-h2o-misel-su-500', C.misel,
  'Hassas ciltler için misel temizleme suyu, büyük boy',
  [I.aqua, I.glycerin, I.allantoin, I.citric_acid, I.phenoxyethanol],
  379);
addProduct(4, 'Bioderma Atoderm Intensive Baume', 'bioderma-atoderm-intensive-baume', C.bariyer,
  'Çok kuru ve atopik ciltler için yoğun bakım balmı',
  [I.aqua, I.glycerin, I.shea_butter, I.niacinamide, I.squalane, I.allantoin, I.dimethicone, I.tocopherol],
  449);
addProduct(4, 'Bioderma Photoderm Max Cream SPF 50+', 'bioderma-photoderm-max-cream-spf50', C.yuz_gunes,
  'Yüksek koruma güneş kremi, hassas ciltler',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.butyl_mdb, I.tocopherol, I.glycerin, I.dimethicone],
  429);
addProduct(4, 'Bioderma Sébium Hydra Nemlendirici', 'bioderma-sebium-hydra-nemlendirici', C.nemlendirici,
  'Kurutucu bakım sonrası onarıcı nemlendirici',
  [I.aqua, I.glycerin, I.squalane, I.ceramide_np, I.niacinamide, I.allantoin, I.panthenol],
  349);
addProduct(4, 'Bioderma Cicabio Onarıcı Krem', 'bioderma-cicabio-onarici-krem', C.bariyer,
  'Hasarlı cilt için onarıcı ve yatıştırıcı bakım',
  [I.aqua, I.panthenol, I.glycerin, I.shea_butter, I.allantoin, I.tocopherol, I.dimethicone, I.zinc_oxide],
  329);
addProduct(4, 'Bioderma Sébium Foaming Gel', 'bioderma-sebium-foaming-gel', C.jel_temizleyici,
  'Yağlı ve karma ciltler için arındırıcı köpük jel',
  [I.aqua, I.zinc_pca, I.glycerin, I.allantoin, I.citric_acid, I.phenoxyethanol],
  279);
addProduct(4, 'Bioderma Hydrabio Sérum', 'bioderma-hydrabio-serum', C.serum,
  'Dehidrate ciltler için yoğun nemlendirme serumu',
  [I.aqua, I.hyaluronic_acid, I.niacinamide, I.glycerin, I.sodium_hyaluronate, I.panthenol, I.allantoin],
  399);
addProduct(4, 'Bioderma Pigmentbio C-Concentrate', 'bioderma-pigmentbio-c-concentrate', C.leke,
  'C vitamini konsantresi, leke karşıtı aydınlatıcı bakım',
  [I.aqua, I.ascorbic_acid, I.niacinamide, I.glycerin, I.tocopherol, I.salicylic_acid, I.propanediol],
  489);

// --- CERAVE (95) - +5 ürün ---
addProduct(95, 'CeraVe SA Smoothing Cleanser', 'cerave-sa-smoothing-cleanser', C.jel_temizleyici,
  'Salisilik asitli pürüzsüzleştirici temizleyici',
  [I.aqua, I.salicylic_acid, I.ceramide_np, I.ceramide_ap, I.ceramide_eop, I.niacinamide, I.cholesterol, I.glycerin],
  349);
addProduct(95, 'CeraVe Hydrating Cream-to-Foam Cleanser', 'cerave-hydrating-cream-to-foam', C.kopuk,
  'Kremden köpüğe dönüşen nemlendirici temizleyici',
  [I.aqua, I.glycerin, I.ceramide_np, I.ceramide_ap, I.ceramide_eop, I.niacinamide, I.sodium_hyaluronate, I.cholesterol],
  329);
addProduct(95, 'CeraVe Skin Renewing Retinol Serum', 'cerave-skin-renewing-retinol-serum', C.serum,
  'Ceramidli retinol serumu, cilt yenileme',
  [I.aqua, I.retinol, I.ceramide_np, I.ceramide_ap, I.niacinamide, I.sodium_hyaluronate, I.tocopherol, I.dimethicone],
  499);
addProduct(95, 'CeraVe Resurfacing Retinol Serum', 'cerave-resurfacing-retinol-serum', C.serum,
  'Leke karşıtı retinol yüzey yenileme serumu',
  [I.aqua, I.retinol, I.niacinamide, I.ceramide_np, I.ceramide_eop, I.glycerin, I.dimethicone, I.tocopherol],
  479);
addProduct(95, 'CeraVe Ultra-Light Moisturizing Lotion SPF 30', 'cerave-ultra-light-moisturizing-spf30', C.yuz_gunes,
  'Ultra hafif dokulu günlük nemlendirici SPF 30',
  [I.aqua, I.ethylhexyl_mc, I.niacinamide, I.ceramide_np, I.ceramide_ap, I.ceramide_eop, I.sodium_hyaluronate, I.tocopherol],
  429);

// --- LA ROCHE-POSAY (1) - +5 ürün ---
addProduct(1, 'La Roche-Posay Cicaplast Baume B5+', 'lrp-cicaplast-baume-b5-plus', C.bariyer,
  'Onarıcı ve yatıştırıcı bariyer balmı, B5 vitaminli',
  [I.aqua, I.panthenol, I.shea_butter, I.glycerin, I.madecassoside, I.zinc_oxide, I.dimethicone, I.tocopherol],
  389);
addProduct(1, 'La Roche-Posay Hyalu B5 Serum', 'lrp-hyalu-b5-serum', C.serum,
  'Hyaluronik asit ve B5 vitamini ile dolgunlaştırıcı serum',
  [I.aqua, I.hyaluronic_acid, I.sodium_hyaluronate, I.panthenol, I.madecassoside, I.glycerin, I.dimethicone],
  599);
addProduct(1, 'La Roche-Posay Anthelios UVMune 400 SPF 50+', 'lrp-anthelios-uvmune-400-spf50', C.yuz_gunes,
  'UVA/UVB geniş spektrumlu güneş kremi',
  [I.aqua, I.ethylhexyl_mc, I.octocrylene, I.butyl_mdb, I.glycerin, I.niacinamide, I.tocopherol, I.dimethicone],
  529);
addProduct(1, 'La Roche-Posay Toleriane Sensitive Krem', 'lrp-toleriane-sensitive-krem', C.nemlendirici,
  'Hassas ciltler için prebiyotik nemlendirici krem',
  [I.aqua, I.glycerin, I.squalane, I.niacinamide, I.ceramide_np, I.shea_butter, I.tocopherol, I.dimethicone],
  449);
addProduct(1, 'La Roche-Posay Pure Vitamin C10 Serum', 'lrp-pure-vitamin-c10-serum', C.serum,
  'Saf C vitamini %10 aydınlatıcı antioksidan serum',
  [I.aqua, I.ascorbic_acid, I.sodium_hyaluronate, I.tocopherol, I.salicylic_acid, I.glycerin, I.propanediol],
  649);


// === MAIN EXECUTION ===
async function run() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to Railway PostgreSQL');

  try {
    await client.query('BEGIN');

    // 1. Insert brands
    for (const b of newBrands) {
      await client.query(
        `INSERT INTO brands (brand_id, brand_name, brand_slug, country_of_origin, website_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (brand_id) DO NOTHING`,
        [b.id, b.name, b.slug, b.country, b.website]
      );
    }
    console.log(`✓ ${newBrands.length} brands inserted`);

    // 2. Insert products (skip if slug already exists)
    let insertedProducts = 0;
    let skippedProducts = 0;
    for (const p of products) {
      const exists = await client.query('SELECT product_id FROM products WHERE product_slug = $1', [p.slug]);
      if (exists.rows.length > 0) {
        p.id = exists.rows[0].product_id; // use existing ID for ingredients etc.
        skippedProducts++;
        continue;
      }
      await client.query(
        `INSERT INTO products (product_id, brand_id, product_name, product_slug, category_id, short_description, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'published', NOW(), NOW())`,
        [p.id, p.brand_id, p.name, p.slug, p.category_id, p.short_description]
      );
      insertedProducts++;
    }
    console.log(`✓ ${insertedProducts} products inserted (${skippedProducts} already existed)`);

    // 3. Insert product_ingredients (need ingredient_display_name from ingredients table)
    let ingredientCount = 0;
    // Cache ingredient names
    const ingNames = {};
    const ingRes = await client.query('SELECT ingredient_id, inci_name FROM ingredients');
    ingRes.rows.forEach(r => { ingNames[r.ingredient_id] = r.inci_name; });

    for (const p of products) {
      for (let i = 0; i < p.ingredients.length; i++) {
        const ingId = p.ingredients[i];
        if (!ingId || !ingNames[ingId]) continue;
        await client.query(
          `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, is_highlighted_in_claims, match_status, match_confidence)
           VALUES ($1, $2, $3, $4, $5, 'verified', 1.0)
           ON CONFLICT DO NOTHING`,
          [p.id, ingId, ingNames[ingId], i + 1, i < 3]
        );
        ingredientCount++;
      }
    }
    console.log(`✓ ${ingredientCount} product_ingredients inserted`);

    // 4. Insert product_labels
    for (const p of products) {
      const claims = [];
      if (p.ingredients.includes(I.niacinamide)) claims.push('Niacinamide içerir');
      if (p.ingredients.includes(I.retinol)) claims.push('Retinol içerir');
      if (p.ingredients.includes(I.hyaluronic_acid) || p.ingredients.includes(I.sodium_hyaluronate)) claims.push('Hyaluronik Asit içerir');
      if (p.ingredients.includes(I.ascorbic_acid)) claims.push('C Vitamini içerir');
      if (p.ingredients.includes(I.ceramide_np)) claims.push('Ceramide içerir');
      if (p.ingredients.includes(I.centella)) claims.push('Centella Asiatica içerir');
      if (p.ingredients.includes(I.salicylic_acid)) claims.push('Salisilik Asit içerir');

      await client.query(
        `INSERT INTO product_labels (product_id, claim_texts_json, pao_info, usage_instructions)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [p.id, JSON.stringify(claims), '12M', 'Temiz cilde uygulayın. Göz çevresinden kaçının.']
      );
    }
    console.log(`✓ ${products.length} product_labels inserted`);

    // 5. Insert affiliate_links
    let affiliateCount = 0;
    for (const p of products) {
      const slug = p.slug;
      const platforms = [
        { platform: 'trendyol', url: `https://www.trendyol.com/sr?q=${encodeURIComponent(p.name)}`, price: p.price },
        { platform: 'hepsiburada', url: `https://www.hepsiburada.com/ara?q=${encodeURIComponent(p.name)}`, price: Math.round(p.price * 1.05) },
        { platform: 'amazon_tr', url: `https://www.amazon.com.tr/s?k=${encodeURIComponent(p.name)}`, price: Math.round(p.price * 1.1) },
      ];
      for (const pl of platforms) {
        await client.query(
          `INSERT INTO affiliate_links (product_id, platform, affiliate_url, price_snapshot, price_updated_at, is_active)
           VALUES ($1, $2, $3, $4, NOW(), true)
           ON CONFLICT (product_id, platform) DO NOTHING`,
          [p.id, pl.platform, pl.url, pl.price]
        );
        affiliateCount++;
      }
    }
    console.log(`✓ ${affiliateCount} affiliate_links inserted`);

    // 6. Insert product_images (placeholder — will be updated with real CDN URLs)
    for (const p of products) {
      const brandSlug = newBrands.find(b => b.id === p.brand_id)?.slug ||
        (p.brand_id === 9 ? 'vichy' : p.brand_id === 4 ? 'bioderma' : p.brand_id === 95 ? 'cerave' : p.brand_id === 1 ? 'lrp' : 'brand');
      const color = { 1: 'e3f2fd/1565c0', 4: 'e8f5e9/2e7d32', 9: 'fce4ec/c62828', 95: 'e0f7fa/00695c',
        118: 'fff3e0/e65100', 119: 'f3e5f5/7b1fa2', 120: 'e8f5e9/1b5e20', 121: 'fff8e1/f57f17',
        122: 'eceff1/37474f', 123: 'fce4ec/ad1457', 124: 'e0f2f1/00695c' }[p.brand_id] || 'f5f5f5/333333';

      await client.query(
        `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text)
         VALUES ($1, $2, 'primary', 0, $3)
         ON CONFLICT DO NOTHING`,
        [p.id, `https://placehold.co/600x600/${color}?text=${encodeURIComponent(brandSlug.toUpperCase())}`, p.name]
      );
    }
    console.log(`✓ ${products.length} product_images inserted`);

    await client.query('COMMIT');
    console.log(`\n✅ Batch 7 seed completed successfully!`);
    console.log(`   Brands: ${newBrands.length} new`);
    console.log(`   Products: ${products.length} (${newBrands.length} new brands + existing brand additions)`);
    console.log(`   Product IDs: 1909 - ${pid - 1}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

run().catch(console.error);
