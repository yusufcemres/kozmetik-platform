#!/usr/bin/env node
/**
 * Kozmetik Platform — 1000 Ürün Veri Üretici
 * Mevcut 100 ürüne 900 yeni ürün ekler (ID 101-1000)
 * Çıktı: SQL dosyaları (brands, ingredients, products, product_ingredients, affiliate_links, product_labels, product_images, evidence_links, need_mappings)
 */

const fs = require('fs');
const path = require('path');

// ========================
// HELPER FUNCTIONS
// ========================
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function esc(str) {
  return str.replace(/'/g, "''");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function randBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function randPrice(min, max) {
  return (Math.floor(Math.random() * ((max - min) * 100)) / 100 + min).toFixed(2);
}

// ========================
// NEW BRANDS (29-75)
// ========================
const NEW_BRANDS = [
  // Korean
  { id: 29, name: "Laneige", slug: "laneige", country: "Güney Kore" },
  { id: 30, name: "Dr. Jart+", slug: "dr-jart", country: "Güney Kore" },
  { id: 31, name: "Etude House", slug: "etude-house", country: "Güney Kore" },
  { id: 32, name: "Torriden", slug: "torriden", country: "Güney Kore" },
  { id: 33, name: "Round Lab", slug: "round-lab", country: "Güney Kore" },
  { id: 34, name: "Axis-Y", slug: "axis-y", country: "Güney Kore" },
  { id: 35, name: "Skin1004", slug: "skin1004", country: "Güney Kore" },
  { id: 36, name: "Anua", slug: "anua", country: "Güney Kore" },
  { id: 37, name: "Medicube", slug: "medicube", country: "Güney Kore" },
  { id: 38, name: "Numbuzin", slug: "numbuzin", country: "Güney Kore" },
  { id: 39, name: "Heimish", slug: "heimish", country: "Güney Kore" },
  { id: 40, name: "By Wishtrend", slug: "by-wishtrend", country: "Güney Kore" },
  { id: 41, name: "Benton", slug: "benton", country: "Güney Kore" },
  { id: 42, name: "Neogen", slug: "neogen", country: "Güney Kore" },
  { id: 43, name: "Holika Holika", slug: "holika-holika", country: "Güney Kore" },
  // Japanese
  { id: 44, name: "Senka", slug: "senka", country: "Japonya" },
  { id: 45, name: "Melano CC", slug: "melano-cc", country: "Japonya" },
  { id: 46, name: "Canmake", slug: "canmake", country: "Japonya" },
  { id: 47, name: "Biore", slug: "biore", country: "Japonya" },
  { id: 48, name: "Muji", slug: "muji", country: "Japonya" },
  // Premium Western
  { id: 49, name: "Kiehl's", slug: "kiehls", country: "ABD" },
  { id: 50, name: "Clinique", slug: "clinique", country: "ABD" },
  { id: 51, name: "Estée Lauder", slug: "estee-lauder", country: "ABD" },
  { id: 52, name: "Shiseido", slug: "shiseido", country: "Japonya" },
  { id: 53, name: "SK-II", slug: "sk-ii", country: "Japonya" },
  { id: 54, name: "Dermalogica", slug: "dermalogica", country: "ABD" },
  { id: 55, name: "Murad", slug: "murad", country: "ABD" },
  { id: 56, name: "Sunday Riley", slug: "sunday-riley", country: "ABD" },
  { id: 57, name: "Tatcha", slug: "tatcha", country: "ABD" },
  { id: 58, name: "Fresh", slug: "fresh", country: "Fransa" },
  { id: 59, name: "Glow Recipe", slug: "glow-recipe", country: "ABD" },
  { id: 60, name: "Farmacy", slug: "farmacy", country: "ABD" },
  // Drugstore
  { id: 61, name: "Aveeno", slug: "aveeno", country: "ABD" },
  { id: 62, name: "Simple", slug: "simple", country: "İngiltere" },
  { id: 63, name: "Sebamed", slug: "sebamed", country: "Almanya" },
  { id: 64, name: "Dove", slug: "dove", country: "İngiltere" },
  // Niche / Natural
  { id: 65, name: "Weleda", slug: "weleda", country: "İsviçre" },
  { id: 66, name: "Dr. Hauschka", slug: "dr-hauschka", country: "Almanya" },
  { id: 67, name: "Caudalie", slug: "caudalie", country: "Fransa" },
  { id: 68, name: "Embryolisse", slug: "embryolisse", country: "Fransa" },
  { id: 69, name: "Filorga", slug: "filorga", country: "Fransa" },
  { id: 70, name: "Lierac", slug: "lierac", country: "Fransa" },
  { id: 71, name: "Noreva", slug: "noreva", country: "Fransa" },
  { id: 72, name: "ACM", slug: "acm", country: "Fransa" },
  { id: 73, name: "Altruist", slug: "altruist", country: "İngiltere" },
  { id: 74, name: "Geek & Gorgeous", slug: "geek-gorgeous", country: "Macaristan" },
  { id: 75, name: "Peter Thomas Roth", slug: "peter-thomas-roth", country: "ABD" },
];

// All brands (existing + new)
const ALL_BRANDS = [
  { id: 1, name: "La Roche-Posay" }, { id: 2, name: "CeraVe" }, { id: 3, name: "The Ordinary" },
  { id: 4, name: "Bioderma" }, { id: 5, name: "Avene" }, { id: 6, name: "SVR" },
  { id: 7, name: "Eucerin" }, { id: 8, name: "Neutrogena" }, { id: 9, name: "Vichy" },
  { id: 10, name: "Nuxe" }, { id: 14, name: "Uriage" }, { id: 15, name: "Ducray" },
  { id: 13, name: "COSRX" }, { id: 16, name: "Hada Labo" }, { id: 17, name: "Klairs" },
  { id: 18, name: "Purito" }, { id: 19, name: "Some By Mi" },
  { id: 20, name: "Cetaphil" }, { id: 21, name: "Paula's Choice" },
  { id: 22, name: "Drunk Elephant" }, { id: 23, name: "Isntree" },
  { id: 24, name: "Beauty of Joseon" }, { id: 25, name: "Missha" },
  { id: 26, name: "Garnier" }, { id: 27, name: "Nivea" }, { id: 28, name: "Innisfree" },
  ...NEW_BRANDS.map(b => ({ id: b.id, name: b.name }))
];

// ========================
// NEW INGREDIENTS (53-80)
// ========================
const NEW_INGREDIENTS = [
  { id: 53, inci: "Polyhydroxy Acid", slug: "polyhydroxy-acid", common: "Polihidroksi Asit (PHA)" },
  { id: 54, inci: "Gluconolactone", slug: "gluconolactone", common: "Glukonolakton" },
  { id: 55, inci: "Astaxanthin", slug: "astaxanthin", common: "Astaksantin" },
  { id: 56, inci: "Mugwort Extract", slug: "mugwort-extract", common: "Yavşan Otu Özütü" },
  { id: 57, inci: "Galactomyces Ferment Filtrate", slug: "galactomyces-ferment", common: "Galaktomises Ferment" },
  { id: 58, inci: "Birch Juice", slug: "birch-juice", common: "Huş Ağacı Suyu" },
  { id: 59, inci: "Heartleaf Extract", slug: "heartleaf-extract", common: "Houttuynia Cordata Özütü" },
  { id: 60, inci: "Rosehip Oil", slug: "rosehip-oil", common: "Kuşburnu Yağı" },
  { id: 61, inci: "Tamanu Oil", slug: "tamanu-oil", common: "Tamanu Yağı" },
  { id: 62, inci: "Cica (Centella)", slug: "cica-centella", common: "Cica Kompleksi" },
  { id: 63, inci: "Grape Seed Extract", slug: "grape-seed-extract", common: "Üzüm Çekirdeği Özütü" },
  { id: 64, inci: "Sea Buckthorn Oil", slug: "sea-buckthorn-oil", common: "Yaban Mersini Yağı" },
  { id: 65, inci: "Benzoyl Peroxide", slug: "benzoyl-peroxide", common: "Benzoil Peroksit" },
  { id: 66, inci: "Adapalene", slug: "adapalene", common: "Adapalen" },
  { id: 67, inci: "Licorice Root Extract", slug: "licorice-root-extract", common: "Meyan Kökü Özütü" },
  { id: 68, inci: "Kojic Acid", slug: "kojic-acid", common: "Kojik Asit" },
  { id: 69, inci: "Resveratrol", slug: "resveratrol", common: "Resveratrol" },
  { id: 70, inci: "Colloidal Oatmeal", slug: "colloidal-oatmeal", common: "Kolloidal Yulaf" },
  { id: 71, inci: "Hemp Seed Oil", slug: "hemp-seed-oil", common: "Kenevir Tohumu Yağı" },
  { id: 72, inci: "Probiotics", slug: "probiotics", common: "Probiyotikler" },
  { id: 73, inci: "Saccharomyces Ferment", slug: "saccharomyces-ferment", common: "Maya Fermenti" },
  { id: 74, inci: "Turmeric Extract", slug: "turmeric-extract", common: "Zerdeçal Özütü" },
  { id: 75, inci: "Willow Bark Extract", slug: "willow-bark-extract", common: "Söğüt Kabuğu Özütü" },
  { id: 76, inci: "Amino Acids Complex", slug: "amino-acids-complex", common: "Amino Asit Kompleksi" },
  { id: 77, inci: "Ceramide AP", slug: "ceramide-ap", common: "Seramid AP" },
  { id: 78, inci: "Cholesterol", slug: "cholesterol", common: "Kolesterol" },
  { id: 79, inci: "Phytosphingosine", slug: "phytosphingosine", common: "Fitosfingozin" },
  { id: 80, inci: "EGF (Epidermal Growth Factor)", slug: "egf", common: "EGF (Epidermal Büyüme Faktörü)" },
];

// All ingredients (1-80)
const EXISTING_ING_IDS = Array.from({ length: 52 }, (_, i) => i + 1);
const ALL_ING_IDS = [...EXISTING_ING_IDS, ...NEW_INGREDIENTS.map(i => i.id)];

// Ingredient display name map
const ING_DISPLAY = {
  1: 'Niacinamide', 2: 'Retinol', 3: 'Hyaluronic Acid', 4: 'Salicylic Acid', 5: 'Glycolic Acid',
  6: 'Ceramide NP', 7: 'Ascorbic Acid', 8: 'Panthenol', 9: 'Zinc PCA', 10: 'Tocopherol',
  11: 'Centella Asiatica Extract', 12: 'Glycerin', 13: 'Azelaic Acid', 14: 'Squalane', 15: 'Allantoin',
  16: 'Lactic Acid', 17: 'Madecassoside', 18: 'Sodium Hyaluronate', 19: 'Urea', 20: 'Bakuchiol',
  21: 'Aqua', 22: 'Parfum', 23: 'Phenoxyethanol', 24: 'Butylene Glycol', 25: 'Dimethicone',
  26: 'Caffeine', 27: 'Arbutin', 28: 'Tranexamic Acid', 29: 'Snail Secretion Filtrate', 30: 'Shea Butter',
  31: 'Cetearyl Alcohol', 32: 'Aloe Barbadensis', 33: 'Copper Peptide', 34: 'Mandelic Acid', 35: 'Vitamin E Acetate',
  36: 'Propanediol', 37: 'Ethylhexyl Methoxycinnamate', 38: 'Zinc Oxide', 39: 'Titanium Dioxide', 40: 'Bisabolol',
  41: 'Ferulic Acid', 42: 'Propolis Extract', 43: 'Beta-Glucan', 44: 'Betaine Salicylate', 45: 'Camellia Sinensis',
  46: 'Coenzyme Q10', 47: 'Retinaldehyde', 48: 'Bifida Ferment Lysate', 49: 'Peptide Complex', 50: 'Rice Extract',
  51: 'Jojoba Oil', 52: 'Guaiazulene',
  53: 'Polyhydroxy Acid', 54: 'Gluconolactone', 55: 'Astaxanthin', 56: 'Mugwort Extract',
  57: 'Galactomyces Ferment', 58: 'Birch Juice', 59: 'Heartleaf Extract', 60: 'Rosehip Oil',
  61: 'Tamanu Oil', 62: 'Cica Complex', 63: 'Grape Seed Extract', 64: 'Sea Buckthorn Oil',
  65: 'Benzoyl Peroxide', 66: 'Adapalene', 67: 'Licorice Root Extract', 68: 'Kojic Acid',
  69: 'Resveratrol', 70: 'Colloidal Oatmeal', 71: 'Hemp Seed Oil', 72: 'Probiotics',
  73: 'Saccharomyces Ferment', 74: 'Turmeric Extract', 75: 'Willow Bark Extract', 76: 'Amino Acids Complex',
  77: 'Ceramide AP', 78: 'Cholesterol', 79: 'Phytosphingosine', 80: 'EGF',
};

// ========================
// PRODUCT TEMPLATES
// ========================

// Category: 1=Yüz Bakım, 2=Temizleme, 3=Güneş, 4=Göz, 5=Dudak, 6=Vücut, 7=Saç
const PRODUCT_TYPES = {
  cleanser: { cat: 2, label: 'temizleyici', time: 'both', area: 'face', ml: [150, 200, 250, 300, 400, 473, 500] },
  micellar: { cat: 2, label: 'micellar su', time: 'evening', area: 'face', ml: [200, 400, 500] },
  oil_cleanser: { cat: 2, label: 'temizleme yağı', time: 'evening', area: 'face', ml: [150, 200, 250] },
  toner: { cat: 1, label: 'tonik', time: 'both', area: 'face', ml: [150, 200, 250, 300] },
  essence: { cat: 1, label: 'esans', time: 'both', area: 'face', ml: [50, 100, 150] },
  serum: { cat: 1, label: 'serum', time: 'both', area: 'face', ml: [20, 30, 50] },
  ampoule: { cat: 1, label: 'ampul', time: 'evening', area: 'face', ml: [20, 30, 50] },
  moisturizer: { cat: 1, label: 'nemlendirici', time: 'both', area: 'face', ml: [30, 50, 75, 100] },
  cream: { cat: 1, label: 'krem', time: 'both', area: 'face', ml: [30, 50, 75] },
  night_cream: { cat: 1, label: 'gece kremi', time: 'evening', area: 'face', ml: [30, 50, 75] },
  day_cream: { cat: 1, label: 'gündüz kremi', time: 'morning', area: 'face', ml: [30, 50, 75] },
  sunscreen: { cat: 3, label: 'güneş kremi', time: 'morning', area: 'face', ml: [40, 50, 60, 100, 200] },
  sun_stick: { cat: 3, label: 'güneş stick', time: 'morning', area: 'face', ml: [15, 20] },
  eye_cream: { cat: 4, label: 'göz kremi', time: 'both', area: 'eye', ml: [10, 15, 20, 30] },
  lip_care: { cat: 5, label: 'dudak bakım', time: 'both', area: 'lips', ml: [4, 10, 15] },
  body_lotion: { cat: 6, label: 'vücut losyonu', time: 'both', area: 'body', ml: [200, 250, 300, 400, 500] },
  body_cream: { cat: 6, label: 'vücut kremi', time: 'both', area: 'body', ml: [150, 200, 250, 400] },
  hand_cream: { cat: 6, label: 'el kremi', time: 'both', area: 'hands', ml: [30, 50, 75, 100] },
  exfoliant: { cat: 1, label: 'peeling', time: 'evening', area: 'face', ml: [20, 30, 50, 100] },
  mask: { cat: 1, label: 'maske', time: 'evening', area: 'face', ml: [30, 50, 75, 100] },
  mist: { cat: 1, label: 'mist', time: 'both', area: 'face', ml: [80, 100, 150] },
  balm: { cat: 1, label: 'balsam', time: 'both', area: 'face_body', ml: [30, 40, 50, 100] },
  oil: { cat: 1, label: 'yüz yağı', time: 'evening', area: 'face', ml: [15, 20, 30, 50] },
};

// Ingredient profiles per product type — which ingredients make sense
const TYPE_INGREDIENTS = {
  cleanser: [[21,12,24,15,23], [21,12,45,32,23], [21,12,8,40,23], [21,12,1,9,36], [21,12,44,59,23]],
  micellar: [[21,12,8,23,25], [21,12,1,32,23], [21,12,36,40,23]],
  oil_cleanser: [[51,14,60,10,12], [51,45,12,10,32], [51,14,30,10,23]],
  toner: [[21,3,18,24,8], [21,1,12,36,23], [21,3,12,24,15], [21,59,12,36,43], [21,56,12,24,8]],
  essence: [[21,48,1,3,24], [21,57,1,12,23], [21,42,1,3,24], [21,73,12,3,24]],
  serum: [[21,1,3,36,23], [21,7,41,10,36], [21,2,1,3,14], [21,28,1,67,3], [21,27,1,3,36], [21,11,17,3,12], [21,49,3,12,36], [21,33,49,3,12], [21,80,49,3,12], [21,55,10,14,3]],
  ampoule: [[21,7,41,10,24], [21,42,1,3,24], [21,48,3,1,24], [21,49,3,33,12], [21,29,1,3,24]],
  moisturizer: [[21,12,6,3,25], [21,12,14,1,8], [21,12,30,10,31], [21,12,3,76,25], [21,12,77,78,79]],
  cream: [[21,12,6,3,25], [21,12,1,14,10], [21,12,8,30,31], [21,12,62,17,3]],
  night_cream: [[21,2,12,14,10], [21,47,12,1,14], [21,49,12,3,14], [21,46,12,3,10]],
  day_cream: [[21,1,12,3,25], [21,46,12,3,10], [21,12,3,8,25]],
  sunscreen: [[21,37,39,12,10], [21,38,39,12,3], [21,37,12,1,3], [21,38,12,3,8], [21,37,39,1,12]],
  sun_stick: [[21,38,14,10,30], [21,37,39,14,12]],
  eye_cream: [[21,26,3,49,12], [21,3,26,8,12], [21,49,33,3,12], [21,26,1,3,12]],
  lip_care: [[21,30,12,10,51], [21,8,12,30,10], [21,12,32,10,30]],
  body_lotion: [[21,12,3,30,10], [21,12,19,8,31], [21,12,6,3,25], [21,12,70,32,10]],
  body_cream: [[21,12,30,6,10], [21,12,19,3,31], [21,12,14,10,30]],
  hand_cream: [[21,12,30,3,10], [21,12,6,19,10], [21,12,8,30,10]],
  exfoliant: [[21,5,16,3,36], [21,4,1,45,36], [21,34,1,3,36], [21,53,54,12,36], [21,16,3,12,36]],
  mask: [[21,12,3,45,32], [21,12,11,17,3], [21,12,42,1,3], [21,12,56,59,3], [21,12,74,1,3]],
  mist: [[21,3,11,12,8], [21,3,12,32,8], [21,12,56,59,8]],
  balm: [[21,8,17,30,12], [21,11,17,8,12], [21,30,12,10,15]],
  oil: [[60,14,51,10,41], [14,60,10,51,64], [51,14,71,10,60]],
};

// Brand product distribution — how many products each brand should have in the expansion
const BRAND_PRODUCT_TEMPLATES = [];
const usedSlugs = new Set();

function genProducts(brandId, brandName, productDefs) {
  for (const def of productDefs) {
    const slug = slugify(`${brandName} ${def.suffix}`);
    if (usedSlugs.has(slug)) continue;
    usedSlugs.add(slug);
    BRAND_PRODUCT_TEMPLATES.push({
      brandId,
      brandName,
      name: `${brandName} ${def.name}`,
      slug,
      type: def.type,
      desc: def.desc,
    });
  }
}

// ========================
// PRODUCT DEFINITIONS PER BRAND
// ========================

// La Roche-Posay (1) — 25 more
genProducts(1, "La Roche-Posay", [
  { name: "Toleriane Sensitive Fluide", suffix: "toleriane-sensitive-fluide", type: "moisturizer", desc: "Hassas ciltler için prebiyotik nemlendirici. Minimal formül." },
  { name: "Toleriane Ultra Eye Cream", suffix: "toleriane-ultra-eye", type: "eye_cream", desc: "Ultra hassas göz çevresi kremi. Allerjen içermez." },
  { name: "Effaclar Duo+ SPF30", suffix: "effaclar-duo-plus-spf30", type: "day_cream", desc: "Akne karşıtı bakım + güneş koruması. Niacinamide + LHA." },
  { name: "Effaclar Serum", suffix: "effaclar-ultra-serum", type: "serum", desc: "Ultra konsantre akne karşıtı serum. Salisilik asit + Niacinamide." },
  { name: "Hyalu B5 Serum", suffix: "hyalu-b5-serum", type: "serum", desc: "Hyaluronic acid + B5 vitamini anti-aging serum. Dolgunluk ve nem." },
  { name: "Hyalu B5 Eyes", suffix: "hyalu-b5-eyes", type: "eye_cream", desc: "HA göz çevresi dolgunlaştırıcı. Morluk ve çizgi azaltıcı." },
  { name: "Mela B3 Serum", suffix: "mela-b3-serum", type: "serum", desc: "Melasma ve leke karşıtı serum. Niacinamide + Melasyl." },
  { name: "Toleriane Purifying Foaming Cream", suffix: "toleriane-purifying-foam", type: "cleanser", desc: "Hassas karma ciltler için temizleyici. Ceramide içerir." },
  { name: "Lipikar Lait", suffix: "lipikar-lait", type: "body_lotion", desc: "Lipid doldurucu vücut sütü. Atopik ciltler için." },
  { name: "Lipikar Baume AP+M", suffix: "lipikar-baume-ap-m", type: "body_cream", desc: "Atopik dermatit yatıştırıcı balsam. Shea yağı + Niacinamide." },
  { name: "Lipikar Syndet AP+", suffix: "lipikar-syndet-ap", type: "cleanser", desc: "Vücut ve yüz için temizleme jeli. Lipid doldurucu." },
  { name: "Anthelios UVMune 400 SPF50+", suffix: "anthelios-uvmune-400", type: "sunscreen", desc: "En geniş spektrum güneş koruması. Mexoryl 400 filtre." },
  { name: "Anthelios Age Correct SPF50", suffix: "anthelios-age-correct", type: "sunscreen", desc: "Anti-aging güneş koruyucu. Niacinamide + HA." },
  { name: "Anthelios Invisible Fluid SPF50+", suffix: "anthelios-invisible-fluid", type: "sunscreen", desc: "Görünmez doku güneş koruyucu. Beyaz iz bırakmaz." },
  { name: "Pure Vitamin C10 Serum", suffix: "pure-vitamin-c10-serum", type: "serum", desc: "Saf C vitamini %10 serum. Aydınlatıcı ve antioksidan." },
  { name: "Redermic R Anti-Aging Concentrate", suffix: "redermic-r-concentrate", type: "serum", desc: "Retinol anti-aging konsantresi. Derin kırışıklık." },
  { name: "Toleriane Ultra Night", suffix: "toleriane-ultra-night", type: "night_cream", desc: "Hassas ciltler gece bakımı. Squalane + Shea." },
  { name: "Cicaplast Levres", suffix: "cicaplast-levres", type: "lip_care", desc: "Dudak onarıcı bariyer balsam. Panthenol + Shea." },
  { name: "Effaclar Micro-Peeling Gel", suffix: "effaclar-micro-peeling", type: "exfoliant", desc: "Mikro peeling jel temizleyici. LHA + Salisilik asit." },
  { name: "Toleriane Sensitive Creme", suffix: "toleriane-sensitive-creme", type: "cream", desc: "Hassas kuru ciltler için krem. Ceramide + Glycerin." },
  { name: "Effaclar Mat Moisturizer", suffix: "effaclar-mat-moisturizer", type: "moisturizer", desc: "Matlaştırıcı nemlendirici. Yağlı ciltler için sebumlytic." },
  { name: "Toleriane Dermallergo Eye Cream", suffix: "toleriane-dermallergo-eye", type: "eye_cream", desc: "Alerjik göz çevresi kremi. Neurosensine + HA." },
  { name: "Lipikar Eczema Med Cream", suffix: "lipikar-eczema-med", type: "cream", desc: "Egzama yatıştırıcı medikal krem. Kolloidal yulaf." },
  { name: "Effaclar K+ Renovating Care", suffix: "effaclar-k-plus", type: "moisturizer", desc: "Yenileyici anti-siyah nokta bakım. LHA + Karnosin." },
  { name: "Anthelios Mineral One SPF50", suffix: "anthelios-mineral-one", type: "sunscreen", desc: "Renkli mineral güneş koruyucu. Doğal görünüm." },
]);

// CeraVe (2) — 20 more
genProducts(2, "CeraVe", [
  { name: "Hydrating Cleanser", suffix: "hydrating-cleanser", type: "cleanser", desc: "Nemlendirici temizleyici. 3 ceramide + HA." },
  { name: "SA Smoothing Cleanser", suffix: "sa-smoothing-cleanser", type: "cleanser", desc: "Salisilik asitli pürüzsüzleştirici temizleyici." },
  { name: "Foaming Facial Cleanser", suffix: "foaming-facial-cleanser-new", type: "cleanser", desc: "Yağlı ciltler için köpük temizleyici. Niacinamide + Ceramide." },
  { name: "SA Smoothing Cream", suffix: "sa-smoothing-cream", type: "cream", desc: "Salisilik asitli pürüzsüzleştirici krem. Kuru ve pürüzlü ciltler." },
  { name: "PM Facial Moisturizing Lotion", suffix: "pm-moisturizing-lotion", type: "night_cream", desc: "Gece nemlendirici losyon. Hafif doku, Niacinamide." },
  { name: "AM Facial Moisturizing Lotion SPF30", suffix: "am-moisturizing-spf30", type: "day_cream", desc: "Gündüz nemlendirici SPF30. Ceramide + HA + UV koruma." },
  { name: "Eye Repair Cream", suffix: "eye-repair-cream", type: "eye_cream", desc: "Göz çevresi onarım kremi. Ceramide + HA + Niacinamide." },
  { name: "Hydrating Hyaluronic Acid Serum", suffix: "hydrating-ha-serum", type: "serum", desc: "HA nemlendirici serum. 3 moleküler boyut HA." },
  { name: "Vitamin C Serum with HA", suffix: "vitamin-c-serum-ha", type: "serum", desc: "C vitamini %10 + HA + B5 serum. Aydınlatıcı." },
  { name: "Resurfacing Retinol Serum", suffix: "resurfacing-retinol", type: "serum", desc: "Yüzey yenileyici retinol serum. Ceramide korumalı." },
  { name: "Moisturising Cream 340g", suffix: "moisturising-cream-340g", type: "cream", desc: "Büyük boy nemlendirici krem. Yüz ve vücut. 3 ceramide." },
  { name: "Healing Ointment", suffix: "healing-ointment", type: "balm", desc: "Onarıcı merhem. Petrolatum bazlı ceramide ointment." },
  { name: "Blemish Control Cleanser", suffix: "blemish-control-cleanser", type: "cleanser", desc: "Akne kontrol temizleyici. Salisilik asit + Niacinamide." },
  { name: "Blemish Control Gel Moisturizer", suffix: "blemish-control-gel", type: "moisturizer", desc: "Akne kontrol jel nemlendirici. Hafif, yağsız." },
  { name: "Hydrating Mineral Sunscreen SPF30", suffix: "hydrating-mineral-sun", type: "sunscreen", desc: "Mineral filtreli nemlendirici güneş koruyucu." },
  { name: "Ultra-Light Moisturizing Lotion SPF30", suffix: "ultra-light-spf30", type: "sunscreen", desc: "Ultra hafif günlük güneş koruyucu losyon." },
  { name: "Moisturizing Cream for Normal to Dry Skin", suffix: "moisturizing-cream-normal-dry", type: "cream", desc: "Normal-kuru ciltler için klasik nemlendirici." },
  { name: "Hand Cream", suffix: "hand-cream", type: "hand_cream", desc: "El kremi. Ceramide + HA yoğun nemlendirme." },
  { name: "Body Wash for Dry Skin", suffix: "body-wash-dry-skin", type: "cleanser", desc: "Kuru ciltler için vücut yıkama jeli. Nemlendirici." },
  { name: "Psoriasis Moisturizing Cream", suffix: "psoriasis-cream", type: "cream", desc: "Sedef hastalığı nemlendirici. Üre + Ceramide + SA." },
]);

// The Ordinary (3) — 25 more
genProducts(3, "The Ordinary", [
  { name: "AHA 30% + BHA 2% Peeling Solution", suffix: "aha-30-bha-2-peeling", type: "exfoliant", desc: "Profesyonel peeling solüsyonu. 10 dakika maske." },
  { name: "Glycolic Acid 7% Toning Solution", suffix: "glycolic-acid-7-toner", type: "toner", desc: "Glikolik asit %7 tonik. Günlük AHA eksfoliasyon." },
  { name: "Mandelic Acid 10% + HA", suffix: "mandelic-acid-10-ha", type: "exfoliant", desc: "Mandelik asit %10. Nazik AHA, tüm cilt tonlarına uygun." },
  { name: "Azelaic Acid Suspension 10%", suffix: "azelaic-acid-10-new", type: "serum", desc: "Azelaik asit %10 süspansiyon. Kızarıklık ve ton eşitleyici." },
  { name: "Salicylic Acid 2% Anhydrous Solution", suffix: "salicylic-acid-2-anhydrous", type: "serum", desc: "Susuz salisilik asit solüsyonu. Siyah nokta ve gözenek." },
  { name: "Retinol 0.5% in Squalane", suffix: "retinol-05-squalane", type: "serum", desc: "Retinol %0.5 squalane bazlı. Orta seviye anti-aging." },
  { name: "Retinol 1% in Squalane", suffix: "retinol-1-squalane", type: "serum", desc: "Retinol %1 squalane bazlı. İleri seviye anti-aging." },
  { name: "Granactive Retinoid 2% Emulsion", suffix: "granactive-retinoid-2", type: "serum", desc: "Hidroksipinakolan retinoat. Tahriş etmeden anti-aging." },
  { name: "Vitamin C Suspension 23% + HA Spheres", suffix: "vitamin-c-23-ha", type: "serum", desc: "C vitamini %23 süspansiyon. Yüksek konsantrasyon aydınlatıcı." },
  { name: "Ascorbyl Glucoside Solution 12%", suffix: "ascorbyl-glucoside-12", type: "serum", desc: "Stabil C vitamini türevi %12. Aydınlatıcı." },
  { name: "Hyaluronic Acid 2% + B5", suffix: "hyaluronic-acid-2-b5-new", type: "serum", desc: "Multi-ağırlık HA + B5. Derinlemesine nemlendirme." },
  { name: "Marine Hyaluronics", suffix: "marine-hyaluronics", type: "serum", desc: "Ultra hafif deniz kaynaklı nemlendirici. Yağsız." },
  { name: "Caffeine Solution 5% + EGCG", suffix: "caffeine-5-egcg", type: "eye_cream", desc: "Kafein %5 göz altı serumu. Morluk ve şişlik." },
  { name: "100% Organic Cold-Pressed Rosehip Seed Oil", suffix: "rosehip-seed-oil-100", type: "oil", desc: "Soğuk sıkım kuşburnu yağı. Leke ve iz azaltıcı." },
  { name: "100% Plant-Derived Squalane", suffix: "squalane-100", type: "oil", desc: "Bitkisel squalane. Hafif nemlendirici yağ." },
  { name: "Buffet Multi-Technology Peptide Serum", suffix: "buffet-peptide-serum", type: "serum", desc: "Çoklu peptit + HA serum. Kapsamlı anti-aging." },
  { name: "Argireline Solution 10%", suffix: "argireline-10", type: "serum", desc: "Argireline peptit %10. Mimik kırışıklıkları azaltır." },
  { name: "EUK 134 0.1%", suffix: "euk-134-01", type: "serum", desc: "Süper antioksidan. Serbest radikal nötralizasyonu." },
  { name: "Alpha Arbutin 2% + HA", suffix: "alpha-arbutin-2-ha-new", type: "serum", desc: "Alpha arbutin %2 + HA. Leke karşıtı ve nemlendirici." },
  { name: "Pycnogenol 5%", suffix: "pycnogenol-5", type: "serum", desc: "Çam kabuğu özütü %5. Güçlü antioksidan." },
  { name: "Amino Acids + B5", suffix: "amino-acids-b5", type: "serum", desc: "Amino asit + B5 nemlendirici. Bariyer desteği." },
  { name: "Squalane Cleanser", suffix: "squalane-cleanser", type: "cleanser", desc: "Squalane bazlı temizleyici balsam. Makyaj çözücü." },
  { name: "Matrixyl 10% + HA", suffix: "matrixyl-10-ha", type: "serum", desc: "Matrixyl peptit %10 + HA. Anti-aging + dolgunluk." },
  { name: "Niacinamide 10% + Zinc 1% 60ml", suffix: "niacinamide-10-zinc-60ml", type: "serum", desc: "Büyük boy niacinamide. Gözenek ve yağ kontrolü." },
  { name: "Salicylic Acid 2% Masque", suffix: "salicylic-acid-2-masque", type: "mask", desc: "Salisilik asit %2 kil maskesi. Derin gözenek temizliği." },
]);

// Bioderma (4) — 15 more
genProducts(4, "Bioderma", [
  { name: "Sensibio Defensive Rich Cream", suffix: "sensibio-defensive-rich", type: "cream", desc: "Hassas kuru ciltler için koruyucu zengin krem." },
  { name: "Sensibio Eye Contour Gel", suffix: "sensibio-eye-gel", type: "eye_cream", desc: "Hassas göz çevresi jeli. Yatıştırıcı ve dekonjestiyan." },
  { name: "Sebium Sensitive Cream", suffix: "sebium-sensitive-cream", type: "cream", desc: "Akneye eğilimli hassas ciltler. Bakım + cilt florasını koruma." },
  { name: "Sebium Pore Refiner", suffix: "sebium-pore-refiner", type: "moisturizer", desc: "Gözenek sıkılaştırıcı bakım. Matlaştırıcı etki." },
  { name: "Sebium Night Peel", suffix: "sebium-night-peel", type: "exfoliant", desc: "Gece peeling bakımı. Glikolik + Salisilik asit." },
  { name: "Atoderm Intensive Baume", suffix: "atoderm-intensive-baume", type: "body_cream", desc: "Atopik yatıştırıcı balsam. Kuru ve kaşıntılı ciltler." },
  { name: "Atoderm Shower Gel", suffix: "atoderm-shower-gel", type: "cleanser", desc: "Atopik ciltler için duş jeli. Nemlendirici temizlik." },
  { name: "Cicabio Cream", suffix: "cicabio-cream", type: "balm", desc: "Onarıcı bakım kremi. Çatlak ve tahriş bölgeleri." },
  { name: "Hydrabio Serum", suffix: "hydrabio-serum", type: "serum", desc: "Nemlendirici konsantre serum. Aquagenium kompleksi." },
  { name: "Hydrabio Light Cream", suffix: "hydrabio-light-cream", type: "moisturizer", desc: "Hafif nemlendirici. Normal-karma ciltler." },
  { name: "Pigmentbio Daily Care SPF50+", suffix: "pigmentbio-daily-spf50", type: "sunscreen", desc: "Leke karşıtı günlük güneş bakımı. C vitamini." },
  { name: "Pigmentbio C-Concentrate", suffix: "pigmentbio-c-concentrate", type: "serum", desc: "C vitamini leke karşıtı konsantre. Aydınlatıcı." },
  { name: "Photoderm Max Spray SPF50+", suffix: "photoderm-max-spray", type: "sunscreen", desc: "Sprey güneş koruyucu. Vücut için kolay uygulama." },
  { name: "Sensibio Gel Moussant", suffix: "sensibio-gel-moussant", type: "cleanser", desc: "Hassas ciltler köpük jel temizleyici." },
  { name: "ABCDerm Cold Cream", suffix: "abcderm-cold-cream", type: "cream", desc: "Bebek soğuk krem. Hassas bebek cildi için." },
]);

// Vichy (9) — 15 more
genProducts(9, "Vichy", [
  { name: "Mineral 89 Booster", suffix: "mineral-89-booster", type: "serum", desc: "Mineralleştirici güçlendirici. HA + Vichy termal suyu." },
  { name: "Mineral 89 Probiotic Fractions", suffix: "mineral-89-probiotic", type: "serum", desc: "Probiyotik fraksiyonlu onarıcı serum." },
  { name: "LiftActiv Supreme Day Cream", suffix: "liftactiv-supreme-day", type: "day_cream", desc: "Anti-aging sıkılaştırıcı gündüz kremi. Rhamnose %5." },
  { name: "LiftActiv Supreme Night Cream", suffix: "liftactiv-supreme-night", type: "night_cream", desc: "Anti-aging gece bakımı. Rhamnose + HA." },
  { name: "LiftActiv Specialist B3 Serum", suffix: "liftactiv-b3-serum", type: "serum", desc: "Niacinamide leke serum. %5 Niacinamide + Glikolik asit." },
  { name: "Normaderm Phytosolution Gel", suffix: "normaderm-phytosolution-gel", type: "cleanser", desc: "Akne karşıtı jel temizleyici. Salisilik asit + Bakır." },
  { name: "Normaderm Mattifying Day Cream", suffix: "normaderm-mattifying", type: "day_cream", desc: "Matlaştırıcı gündüz bakımı. Yağlı ciltler." },
  { name: "Capital Soleil UV-Age Daily SPF50+", suffix: "capital-soleil-uv-age", type: "sunscreen", desc: "Anti-aging güneş koruyucu. Niacinamide + Probiotic." },
  { name: "Capital Soleil UV-Clear SPF50+", suffix: "capital-soleil-uv-clear", type: "sunscreen", desc: "Akneye eğilimli ciltler güneş bakımı. Niacinamide." },
  { name: "Aqualia Thermal Rich Cream", suffix: "aqualia-thermal-rich", type: "cream", desc: "Zengin nemlendirici krem. Termal su + HA." },
  { name: "Aqualia Thermal Light Cream", suffix: "aqualia-thermal-light", type: "moisturizer", desc: "Hafif nemlendirici. Normal-karma ciltler." },
  { name: "Purete Thermale 3-in-1 Micellar Water", suffix: "purete-thermale-micellar", type: "micellar", desc: "3'ü 1 arada micellar su. Vichy termal suyu." },
  { name: "Neovadiol Rose Platinium Night", suffix: "neovadiol-rose-platinium", type: "night_cream", desc: "60+ yaş gece bakımı. Yoğun besleyici." },
  { name: "Dercos Energy+ Shampoo", suffix: "dercos-energy-shampoo", type: "cleanser", desc: "Enerji verici şampuan. Aminexil + Kafein." },
  { name: "Ideal Soleil Sensitive Skin SPF50", suffix: "ideal-soleil-sensitive", type: "sunscreen", desc: "Hassas ciltler güneş sütü. Geniş spektrum." },
]);

// Eucerin (7) — 15 more
genProducts(7, "Eucerin", [
  { name: "Anti-Pigment Dual Serum", suffix: "anti-pigment-dual-serum", type: "serum", desc: "Çift etkili leke karşıtı serum. Thiamidol." },
  { name: "Anti-Pigment Day Cream SPF30", suffix: "anti-pigment-day-spf30", type: "day_cream", desc: "Leke karşıtı gündüz kremi. Thiamidol + SPF30." },
  { name: "Anti-Pigment Night Cream", suffix: "anti-pigment-night", type: "night_cream", desc: "Leke karşıtı gece kremi. Thiamidol." },
  { name: "DermoCapillaire Anti-Dandruff Shampoo", suffix: "dermocapillaire-anti-dandruff", type: "cleanser", desc: "Kepek karşıtı şampuan. Piroctone olamine." },
  { name: "AtopiControl Lotion", suffix: "atopicontrol-lotion", type: "body_lotion", desc: "Atopik cilt losyonu. Licochalcone A." },
  { name: "UreaRepair Plus Lotion 10%", suffix: "urearepair-plus-lotion-10", type: "body_lotion", desc: "Üre %10 vücut losyonu. Çok kuru ciltler." },
  { name: "UreaRepair Plus Hand Cream 5%", suffix: "urearepair-hand-cream-5", type: "hand_cream", desc: "Üre %5 el kremi. Kuru ve çatlak eller." },
  { name: "Hyaluron-Filler + Elasticity Day SPF30", suffix: "hyaluron-filler-elasticity-day", type: "day_cream", desc: "55+ yaş gündüz bakımı. HA + Arctiin." },
  { name: "Hyaluron-Filler + 3x Effect Day SPF15", suffix: "hyaluron-filler-3x-day", type: "day_cream", desc: "3 boyutlu HA dolgusu. Gündüz kremi." },
  { name: "Hyaluron-Filler Vitamin C Booster", suffix: "hyaluron-filler-vitamin-c", type: "serum", desc: "C vitamini + HA ampul. 7 günlük kür." },
  { name: "DermatoCLEAN Refreshing Cleansing Gel", suffix: "dermatoclean-refreshing-gel", type: "cleanser", desc: "Ferahlatıcı temizleme jeli. Tüm cilt tipleri." },
  { name: "DermatoCLEAN Micellar Water 3-in-1", suffix: "dermatoclean-micellar-3in1", type: "micellar", desc: "3'ü 1 arada micellar su." },
  { name: "Sun Sensitive Protect Lotion SPF50+", suffix: "sun-sensitive-protect-lotion", type: "sunscreen", desc: "Hassas ciltler güneş losyonu. Suya dayanıklı." },
  { name: "Aquaphor Repairing Ointment", suffix: "aquaphor-repairing-ointment", type: "balm", desc: "Onarıcı merhem. Panthenol + Bisabolol." },
  { name: "pH5 Body Lotion", suffix: "ph5-body-lotion", type: "body_lotion", desc: "pH5 vücut losyonu. Hassas ciltler nemlendirme." },
]);

// COSRX (13) — 20 more
genProducts(13, "COSRX", [
  { name: "Advanced Snail 92 All in One Cream", suffix: "snail-92-cream", type: "cream", desc: "Salyangoz %92 çok fonksiyonlu krem. Onarım + nem." },
  { name: "BHA Blackhead Power Liquid", suffix: "bha-blackhead-power-liquid", type: "exfoliant", desc: "Betaine salicylate BHA. Siyah nokta temizleyici." },
  { name: "Advanced Snail Peptide Eye Cream", suffix: "snail-peptide-eye-cream", type: "eye_cream", desc: "Salyangoz + Peptit göz kremi. Anti-aging." },
  { name: "Centella Blemish Cream", suffix: "centella-blemish-cream", type: "cream", desc: "Centella sivilce kremi. Leke ve iz azaltıcı." },
  { name: "Balancium Comfort Ceramide Cream", suffix: "balancium-ceramide-cream", type: "cream", desc: "Ceramide bariyer kremi. Hassas ve kuru ciltler." },
  { name: "Pure Fit Cica Serum", suffix: "pure-fit-cica-serum", type: "serum", desc: "Cica yatıştırıcı serum. Centella %76." },
  { name: "Vitamin E Vitalizing Sunscreen SPF50+", suffix: "vitamin-e-sunscreen-spf50", type: "sunscreen", desc: "E vitamini güneş kremi. Antioksidan koruma." },
  { name: "The Vitamin C 23 Serum", suffix: "vitamin-c-23-serum", type: "serum", desc: "Saf C vitamini %23. Güçlü aydınlatıcı." },
  { name: "Hydrium Triple Hyaluronic Moisture Ampoule", suffix: "hydrium-triple-ha-ampoule", type: "ampoule", desc: "3 tip HA ampulü. Derin nemlendirme." },
  { name: "The Retinol 0.1 Cream", suffix: "retinol-01-cream", type: "night_cream", desc: "Retinol %0.1 gece kremi. Başlangıç anti-aging." },
  { name: "The Retinol 0.5 Oil", suffix: "retinol-05-oil", type: "oil", desc: "Retinol %0.5 yüz yağı. İleri seviye." },
  { name: "AC Collection Calming Liquid Mild", suffix: "ac-calming-liquid-mild", type: "toner", desc: "Akne yatıştırıcı tonik. BHA + Centella." },
  { name: "AC Collection Blemish Spot Clearing Serum", suffix: "ac-blemish-spot-serum", type: "serum", desc: "Akne leke serumu. Niacinamide + BHA." },
  { name: "Low pH Niacinamide Micellar Cleansing Water", suffix: "low-ph-niacinamide-micellar", type: "micellar", desc: "Düşük pH micellar su. Niacinamide destekli." },
  { name: "Comfort Cool Ceramide Soothing Gel Cream", suffix: "comfort-cool-ceramide-gel", type: "moisturizer", desc: "Serinletici ceramide jel krem. Hassas ciltler." },
  { name: "Full Fit Honey Sugar Lip Scrub", suffix: "honey-sugar-lip-scrub", type: "lip_care", desc: "Bal + Şeker dudak peelingi." },
  { name: "Shield Fit All Green Comfort Sun SPF50+", suffix: "shield-fit-green-sun", type: "sunscreen", desc: "Tamamen fiziksel filtre güneş kremi." },
  { name: "Oil-Free Moisturizing Lotion", suffix: "oil-free-moisturizing-lotion-new", type: "moisturizer", desc: "Yağsız nemlendirici losyon. Yağlı ciltler." },
  { name: "The Niacinamide 15 Serum", suffix: "niacinamide-15-serum", type: "serum", desc: "Niacinamide %15 serum. Gözenek ve ton eşitleme." },
  { name: "Refresh ABC Daily Toner", suffix: "refresh-abc-toner", type: "toner", desc: "Günlük ABC tonik. AHA + BHA + C vitamini." },
]);

// Laneige (29) — 15
genProducts(29, "Laneige", [
  { name: "Water Sleeping Mask", suffix: "water-sleeping-mask", type: "mask", desc: "Gece su maskesi. Squalane + Probiyotik." },
  { name: "Lip Sleeping Mask", suffix: "lip-sleeping-mask", type: "lip_care", desc: "Gece dudak maskesi. Vitamin C + Berry." },
  { name: "Water Bank Blue Hyaluronic Cream", suffix: "water-bank-blue-ha-cream", type: "cream", desc: "Mavi HA krem. 100 saat nemlendirme." },
  { name: "Water Bank Blue Hyaluronic Serum", suffix: "water-bank-blue-ha-serum", type: "serum", desc: "Mavi HA serum. Hafif ve hızlı emilim." },
  { name: "Cream Skin Refiner", suffix: "cream-skin-refiner", type: "toner", desc: "Krem tonik. Nemlendirici bariyer tonik." },
  { name: "Radian-C Cream", suffix: "radian-c-cream", type: "cream", desc: "C vitamini parlaklık kremi." },
  { name: "Radian-C Advanced Effector", suffix: "radian-c-effector", type: "serum", desc: "C vitamini ileri formül. Leke karşıtı." },
  { name: "Bouncy & Firm Sleeping Mask", suffix: "bouncy-firm-sleeping-mask", type: "mask", desc: "Sıkılaştırıcı gece maskesi. Peptit." },
  { name: "Lip Glowy Balm", suffix: "lip-glowy-balm", type: "lip_care", desc: "Parlatıcı dudak balmı. Murumuru yağı." },
  { name: "Water Bank Blue Hyaluronic Eye Cream", suffix: "water-bank-eye-cream", type: "eye_cream", desc: "Mavi HA göz kremi. Şişlik azaltıcı." },
  { name: "Neo Cushion Matte SPF42", suffix: "neo-cushion-matte-spf42", type: "sunscreen", desc: "Mat finish cushion güneş koruyucu." },
  { name: "Retinol Firming Sleeping Mask", suffix: "retinol-sleeping-mask", type: "mask", desc: "Retinol sıkılaştırıcı gece maskesi." },
  { name: "Milk Oil Cleanser", suffix: "milk-oil-cleanser", type: "oil_cleanser", desc: "Süt bazlı temizleme yağı. Nazik makyaj çözücü." },
  { name: "Cream Skin Cerapeptide Refiner", suffix: "cream-skin-cerapeptide", type: "toner", desc: "Ceramide + Peptit krem tonik." },
  { name: "Water Bank Blue Hyaluronic Cleansing Foam", suffix: "water-bank-cleanser", type: "cleanser", desc: "HA köpük temizleyici. Nemlendirici temizlik." },
]);

// Dr. Jart+ (30) — 15
genProducts(30, "Dr. Jart+", [
  { name: "Ceramidin Cream", suffix: "ceramidin-cream", type: "cream", desc: "5-Cera Complex bariyer kremi. Kuru ve hassas ciltler." },
  { name: "Ceramidin Serum", suffix: "ceramidin-serum", type: "serum", desc: "Ceramide serum. Bariyer onarım ve nemlendirme." },
  { name: "Cicapair Tiger Grass Color Correcting Treatment", suffix: "cicapair-color-correcting", type: "cream", desc: "Renk düzeltici krem. Kızarıklık kamuflajı." },
  { name: "Cicapair Tiger Grass Sleepair Intensive Mask", suffix: "cicapair-sleepair-mask", type: "mask", desc: "Centella gece maskesi. Yatıştırıcı onarım." },
  { name: "Cicapair Serum", suffix: "cicapair-serum", type: "serum", desc: "Cica yatıştırıcı serum. Tahriş azaltıcı." },
  { name: "Vital Hydra Solution Biome Essence", suffix: "vital-hydra-biome-essence", type: "essence", desc: "Probiyotik esans. Mikrobiyom dengesi." },
  { name: "Vital Hydra Solution Eye Cream", suffix: "vital-hydra-eye-cream", type: "eye_cream", desc: "Probiyotik göz kremi. Nemlendirici." },
  { name: "Every Sun Day Mineral Sunscreen SPF50+", suffix: "every-sun-day-mineral", type: "sunscreen", desc: "Mineral güneş koruyucu. Hassas ciltler." },
  { name: "Dermask Water Jet Vital Hydra Solution", suffix: "dermask-water-jet", type: "mask", desc: "HA sheet mask. Yoğun nemlendirme." },
  { name: "Ceramidin Body Lotion", suffix: "ceramidin-body-lotion", type: "body_lotion", desc: "Ceramide vücut losyonu. Bariyer onarım." },
  { name: "Ceramidin Hand Cream", suffix: "ceramidin-hand-cream", type: "hand_cream", desc: "Ceramide el kremi. Kuru eller." },
  { name: "Cicapair Tiger Grass Cream", suffix: "cicapair-tiger-grass-cream", type: "cream", desc: "Centella onarıcı krem. Tahriş ve kızarıklık." },
  { name: "Ceramidin Liquid", suffix: "ceramidin-liquid", type: "toner", desc: "Sıvı ceramide tonik. Bariyer hazırlığı." },
  { name: "Vital Hydra Solution Capsule Ampoule", suffix: "vital-hydra-capsule-ampoule", type: "ampoule", desc: "Kapsül ampul. Probiyotik + HA." },
  { name: "Clear Skin Spot Cream", suffix: "clear-skin-spot-cream", type: "cream", desc: "Sivilce bakım kremi. BHA + Tea tree." },
]);

// Korean new brands — Torriden, Round Lab, Axis-Y, Skin1004, Anua, Numbuzin, Heimish, Benton, etc.
const koreanNewBrandProducts = [
  // Torriden (32)
  [32, "Torriden", [
    { name: "DIVE-IN Low Molecular HA Serum", suffix: "dive-in-ha-serum", type: "serum", desc: "Düşük moleküler HA serum. 5 tip hyaluronic acid." },
    { name: "DIVE-IN Low Molecular HA Toner", suffix: "dive-in-ha-toner", type: "toner", desc: "HA tonik. Hafif ve hızlı emilen." },
    { name: "DIVE-IN Low Molecular HA Cream", suffix: "dive-in-ha-cream", type: "cream", desc: "HA nemlendirici krem. Bariyer desteği." },
    { name: "DIVE-IN Cleansing Foam", suffix: "dive-in-cleanser", type: "cleanser", desc: "HA köpük temizleyici. pH 5.5." },
    { name: "DIVE-IN Soothing Cream", suffix: "dive-in-soothing-cream", type: "cream", desc: "Yatıştırıcı HA krem. Hassas ciltler." },
    { name: "Cellmazing Firming Serum", suffix: "cellmazing-firming-serum", type: "serum", desc: "Peptit sıkılaştırıcı serum. Anti-aging." },
    { name: "Balanceful Cica Serum", suffix: "balanceful-cica-serum", type: "serum", desc: "Cica dengeleyici serum. Akneye eğilimli." },
    { name: "DIVE-IN Watery Sun Cream SPF50+", suffix: "dive-in-sun-cream", type: "sunscreen", desc: "Sulu doku güneş kremi. Nemlendirici koruma." },
  ]],
  // Round Lab (33)
  [33, "Round Lab", [
    { name: "Dokdo Toner", suffix: "dokdo-toner", type: "toner", desc: "Dokdo derin deniz suyu toneri. Nemlendirici." },
    { name: "Dokdo Lotion", suffix: "dokdo-lotion", type: "moisturizer", desc: "Dokdo hafif losyon. Tüm cilt tipleri." },
    { name: "Birch Juice Moisturizing Sunscreen SPF50+", suffix: "birch-juice-sunscreen", type: "sunscreen", desc: "Huş ağacı suyu güneş kremi. Nemlendirici." },
    { name: "1025 Dokdo Cleanser", suffix: "1025-dokdo-cleanser", type: "cleanser", desc: "Derin deniz minerali temizleyici." },
    { name: "Mugwort Calming Toner", suffix: "mugwort-calming-toner", type: "toner", desc: "Yavşan otu yatıştırıcı tonik." },
    { name: "Pine Cica Serum", suffix: "pine-cica-serum", type: "serum", desc: "Çam + Cica yatıştırıcı serum." },
    { name: "Soybean Nourishing Cream", suffix: "soybean-nourishing-cream", type: "cream", desc: "Soya fasulyesi besleyici krem." },
  ]],
  // Axis-Y (34)
  [34, "Axis-Y", [
    { name: "Dark Spot Correcting Glow Serum", suffix: "dark-spot-glow-serum", type: "serum", desc: "Leke düzeltici parlaklık serumu. Niacinamide." },
    { name: "Mugwort Pore Clarifying Wash Off Pack", suffix: "mugwort-pore-wash-off", type: "mask", desc: "Yavşan otu gözenek temizleme maskesi." },
    { name: "Artichoke Intensive Skin Softening Toner", suffix: "artichoke-toner", type: "toner", desc: "Enginar toneri. Gözenek sıkılaştırıcı." },
    { name: "Biome Resetting Moringa Cleansing Oil", suffix: "moringa-cleansing-oil", type: "oil_cleanser", desc: "Moringa temizleme yağı. Mikrobiyom dostu." },
    { name: "New Skin Resolution Gel Mask", suffix: "new-skin-gel-mask", type: "mask", desc: "AHA/BHA/PHA üçlü peeling maskesi." },
    { name: "Sunday Morning Refreshing Cleansing Foam", suffix: "sunday-morning-foam", type: "cleanser", desc: "Pazar sabahı ferahlatıcı köpük temizleyici." },
    { name: "Complete No-Stress Physical Sunscreen SPF50+", suffix: "no-stress-sunscreen", type: "sunscreen", desc: "Fiziksel filtre stressiz güneş kremi." },
  ]],
  // Skin1004 (35)
  [35, "Skin1004", [
    { name: "Madagascar Centella Ampoule", suffix: "centella-ampoule", type: "ampoule", desc: "Madagaskar centella ampul. %100 Centella özütü." },
    { name: "Madagascar Centella Tone Brightening Capsule Ampoule", suffix: "centella-brightening-ampoule", type: "ampoule", desc: "Centella + Niacinamide aydınlatıcı ampul." },
    { name: "Centella Soothing Cream", suffix: "centella-soothing-cream", type: "cream", desc: "Centella yatıştırıcı krem. Hassas ciltler." },
    { name: "Hyalu-Cica Water-Fit Sun Serum SPF50+", suffix: "hyalu-cica-sun-serum", type: "sunscreen", desc: "HA + Cica güneş serumu. Hafif doku." },
    { name: "Madagascar Centella Toning Toner", suffix: "centella-toning-toner", type: "toner", desc: "Centella tonlama toneri." },
    { name: "Probio-Cica Enrich Cream", suffix: "probio-cica-cream", type: "cream", desc: "Probiyotik + Cica zengin krem." },
  ]],
  // Anua (36)
  [36, "Anua", [
    { name: "Heartleaf 77% Soothing Toner", suffix: "heartleaf-77-toner", type: "toner", desc: "Heartleaf %77 yatıştırıcı tonik." },
    { name: "Heartleaf Pore Control Cleansing Oil", suffix: "heartleaf-cleansing-oil", type: "oil_cleanser", desc: "Heartleaf gözenek kontrol temizleme yağı." },
    { name: "Heartleaf 80% Soothing Ampoule", suffix: "heartleaf-80-ampoule", type: "ampoule", desc: "Heartleaf %80 yatıştırıcı ampul." },
    { name: "Niacinamide 10% + TXA 4% Serum", suffix: "niacinamide-10-txa-4-serum", type: "serum", desc: "Niacinamide %10 + Traneksamik asit. Leke karşıtı." },
    { name: "Peach 70% Niacin Serum", suffix: "peach-70-niacin-serum", type: "serum", desc: "Şeftali %70 + Niacinamide. Aydınlatıcı." },
    { name: "Birch 70% Moisture Boosting Toner", suffix: "birch-70-moisture-toner", type: "toner", desc: "Huş ağacı %70 nemlendirici tonik." },
    { name: "Rice Enzyme Brightening Cleansing Powder", suffix: "rice-enzyme-cleansing-powder", type: "cleanser", desc: "Pirinç enzim aydınlatıcı toz temizleyici." },
  ]],
  // Numbuzin (38)
  [38, "Numbuzin", [
    { name: "No.3 Skin Softening Serum", suffix: "no3-skin-softening-serum", type: "serum", desc: "Galactomyces %70 yumuşatıcı serum." },
    { name: "No.5 Vitamin Glutathione C Serum", suffix: "no5-vitamin-c-serum", type: "serum", desc: "C vitamini + Glutathione aydınlatıcı serum." },
    { name: "No.1 Easy Peasy So Cleansing Oil", suffix: "no1-cleansing-oil", type: "oil_cleanser", desc: "Kolay temizleme yağı. Makyaj çözücü." },
    { name: "No.2 Ultra Boosting Essence Toner", suffix: "no2-boosting-essence-toner", type: "toner", desc: "Bifida boosting esans tonik." },
    { name: "No.4 Collagen 73 Cream", suffix: "no4-collagen-cream", type: "cream", desc: "Kollajen %73 anti-aging krem." },
    { name: "No.5 Vitamin-Niacinamide Concentrated Pad", suffix: "no5-vitamin-pad", type: "exfoliant", desc: "C vitamini + Niacinamide peeling pad." },
  ]],
  // Heimish (39)
  [39, "Heimish", [
    { name: "All Clean Balm", suffix: "all-clean-balm", type: "oil_cleanser", desc: "Temizleme balmı. Makyaj ve güneş kremi çözücü." },
    { name: "All Clean Green Foam", suffix: "all-clean-green-foam", type: "cleanser", desc: "Yeşil köpük temizleyici. Centella + 14 bitki." },
    { name: "Bulgarian Rose Water Mist", suffix: "bulgarian-rose-mist", type: "mist", desc: "Bulgar gülsuyu misti. Nemlendirici ferahlatıcı." },
    { name: "Matcha Biome Amino Acne Cleanser", suffix: "matcha-biome-cleanser", type: "cleanser", desc: "Matcha + Amino asit akne temizleyici." },
    { name: "Aqua Sun Gel SPF50+", suffix: "aqua-sun-gel-spf50", type: "sunscreen", desc: "Hafif sulu güneş jeli." },
    { name: "Moringa Ceramide Hyaluronic Skin Essence", suffix: "moringa-ceramide-essence", type: "essence", desc: "Moringa + Ceramide + HA esans." },
  ]],
  // By Wishtrend (40)
  [40, "By Wishtrend", [
    { name: "Pure Vitamin C 21.5% Advanced Serum", suffix: "pure-vitamin-c-215-serum", type: "serum", desc: "Saf C vitamini %21.5 serum. Güçlü aydınlatıcı." },
    { name: "Mandelic Acid 5% Skin Prep Water", suffix: "mandelic-acid-5-prep-water", type: "toner", desc: "Mandelik asit %5 hazırlık suyu. Nazik peeling." },
    { name: "Polyphenols in Propolis 15% Ampoule", suffix: "propolis-15-ampoule", type: "ampoule", desc: "Propolis %15 polifenol ampul. Onarım + parlaklık." },
    { name: "Quad Active Boosting Essence", suffix: "quad-active-essence", type: "essence", desc: "4 aktif boosting esans. Aydınlatma + Anti-aging." },
    { name: "Green Tea & Enzyme Powder Wash", suffix: "green-tea-enzyme-wash", type: "cleanser", desc: "Yeşil çay enzim toz temizleyici." },
    { name: "Pro-Biome Balance Cream", suffix: "pro-biome-balance-cream", type: "cream", desc: "Probiyotik denge kremi. Bariyer güçlendirici." },
  ]],
  // Benton (41)
  [41, "Benton", [
    { name: "Snail Bee High Content Essence", suffix: "snail-bee-essence", type: "essence", desc: "Salyangoz + Arı zehri esans. Onarım + sıkılaştırma." },
    { name: "Aloe Propolis Soothing Gel", suffix: "aloe-propolis-gel", type: "moisturizer", desc: "Aloe + Propolis yatıştırıcı jel. Hafif nemlendirme." },
    { name: "Deep Green Tea Lotion", suffix: "deep-green-tea-lotion", type: "moisturizer", desc: "Yeşil çay nemlendirici losyon. Antioksidan." },
    { name: "Fermentation Eye Cream", suffix: "fermentation-eye-cream", type: "eye_cream", desc: "Fermente aktif göz kremi. Anti-aging." },
    { name: "Snail Bee Ultimate Serum", suffix: "snail-bee-serum", type: "serum", desc: "Salyangoz + Arı zehri serum. İleri formül." },
    { name: "Honest Cleansing Foam", suffix: "honest-cleansing-foam", type: "cleanser", desc: "Nazik köpük temizleyici. Hassas ciltler." },
  ]],
  // Neogen (42)
  [42, "Neogen", [
    { name: "Real Ferment Micro Essence", suffix: "real-ferment-micro-essence", type: "essence", desc: "Bifida + Saccharomyces ferment esans. %93 ferment." },
    { name: "Real Ferment Micro Serum", suffix: "real-ferment-micro-serum", type: "serum", desc: "Ferment mikro serum. Aydınlatma + nemlendirme." },
    { name: "Dermalogy Bio-Peel Gauze Peeling Lemon", suffix: "bio-peel-gauze-lemon", type: "exfoliant", desc: "Limon peeling pad. Aydınlatıcı eksfoliasyon." },
    { name: "A-Clear Soothing Essence Toner", suffix: "a-clear-soothing-toner", type: "toner", desc: "Akne yatıştırıcı tonik. BHA." },
    { name: "Real Cica Micellar Cleansing Foam", suffix: "real-cica-cleanser", type: "cleanser", desc: "Cica micellar temizleyici köpük." },
  ]],
  // Holika Holika (43)
  [43, "Holika Holika", [
    { name: "Good Cera Super Ceramide Cream", suffix: "good-cera-cream", type: "cream", desc: "5 tip ceramide krem. Bariyer güçlendirici." },
    { name: "Aloe 99% Soothing Gel", suffix: "aloe-99-soothing-gel", type: "moisturizer", desc: "Aloe vera %99 jel. Yatıştırıcı nemlendirme." },
    { name: "Good Cera Super Ceramide Toner", suffix: "good-cera-toner", type: "toner", desc: "Ceramide tonik. Bariyer hazırlığı." },
    { name: "Pig Nose Clear Blackhead Cleanser", suffix: "pig-nose-blackhead-cleanser", type: "cleanser", desc: "Siyah nokta temizleme jeli." },
  ]],
];

koreanNewBrandProducts.forEach(([brandId, brandName, products]) => {
  genProducts(brandId, brandName, products);
});

// Japanese brands
genProducts(44, "Senka", [
  { name: "Perfect Whip Cleansing Foam", suffix: "perfect-whip-foam", type: "cleanser", desc: "Japon #1 temizleyici köpük. İpeksi beyaz kil." },
  { name: "Perfect Whip Collagen in Cleanser", suffix: "perfect-whip-collagen", type: "cleanser", desc: "Kollajen temizleyici. Anti-aging temizlik." },
  { name: "All Clear Oil Cleanser", suffix: "all-clear-oil-cleanser", type: "oil_cleanser", desc: "Temizleme yağı. Makyaj çözücü." },
  { name: "White Beauty Lotion", suffix: "white-beauty-lotion", type: "toner", desc: "Aydınlatıcı losyon. Pirinç özü." },
]);

genProducts(45, "Melano CC", [
  { name: "Intensive Anti-Spot Essence", suffix: "intensive-anti-spot-essence", type: "serum", desc: "Aktif C vitamini leke esansı. Japon #1 C serumu." },
  { name: "Premium Brightening Essence", suffix: "premium-brightening-essence", type: "serum", desc: "Premium aydınlatıcı esans. Çift C vitamini." },
  { name: "Rich Moisture Gel", suffix: "rich-moisture-gel", type: "moisturizer", desc: "C vitamini nemlendirici jel. Leke bakımı." },
  { name: "Brightening Lotion", suffix: "brightening-lotion", type: "toner", desc: "C vitamini aydınlatıcı losyon." },
]);

genProducts(47, "Biore", [
  { name: "UV Aqua Rich Watery Essence SPF50+", suffix: "uv-aqua-rich-essence", type: "sunscreen", desc: "Sulu esans güneş koruyucu. Japon #1 güneş kremi." },
  { name: "UV Aqua Rich Watery Gel SPF50+", suffix: "uv-aqua-rich-gel", type: "sunscreen", desc: "Sulu jel güneş koruyucu. Vücut için." },
  { name: "UV Perfect Face Milk SPF50+", suffix: "uv-perfect-face-milk", type: "sunscreen", desc: "Mat bitiş güneş sütü. Yağlı ciltler." },
  { name: "Cleansing Oil", suffix: "cleansing-oil-biore", type: "oil_cleanser", desc: "Temizleme yağı. Suyla aktive." },
  { name: "UV Athlizm Skin Protect Essence SPF50+", suffix: "uv-athlizm-essence", type: "sunscreen", desc: "Spor güneş esansı. Ter ve suya dayanıklı." },
]);

// Premium Western brands
genProducts(49, "Kiehl's", [
  { name: "Ultra Facial Cream", suffix: "ultra-facial-cream", type: "cream", desc: "24 saat nemlendirici krem. Squalane + Glacial protein." },
  { name: "Midnight Recovery Concentrate", suffix: "midnight-recovery-concentrate", type: "oil", desc: "Gece onarım yağı konsantresi. Lavanta + Primrose." },
  { name: "Clearly Corrective Dark Spot Solution", suffix: "clearly-corrective-dark-spot", type: "serum", desc: "Leke düzeltici serum. C vitamini + Beyaz huş." },
  { name: "Ultra Facial Cleanser", suffix: "ultra-facial-cleanser", type: "cleanser", desc: "Nazik yüz temizleyici. pH dengeli." },
  { name: "Calendula Herbal Extract Toner", suffix: "calendula-toner", type: "toner", desc: "Calendula bitki toneri. Yatıştırıcı." },
  { name: "Super Multi-Corrective Eye-Opening Serum", suffix: "super-multi-corrective-eye", type: "eye_cream", desc: "Çoklu düzeltici göz serumu. Peptit." },
  { name: "Retinol Skin-Renewing Daily Micro-Dose Serum", suffix: "retinol-micro-dose-serum", type: "serum", desc: "Mikro doz retinol serum. Ceramide korumalı." },
  { name: "Creamy Eye Treatment with Avocado", suffix: "creamy-eye-avocado", type: "eye_cream", desc: "Avokado göz kremi. Besleyici + nemlendirici." },
  { name: "Ultra Light Daily UV Defense SPF50", suffix: "ultra-light-uv-defense", type: "sunscreen", desc: "Hafif günlük UV koruma. Antioksidan." },
  { name: "Cannabis Sativa Seed Oil Herbal Concentrate", suffix: "cannabis-sativa-oil", type: "oil", desc: "Kenevir tohumu yağı konsantresi. Yatıştırıcı." },
]);

genProducts(50, "Clinique", [
  { name: "Moisture Surge 72-Hour Hydrator", suffix: "moisture-surge-72h", type: "moisturizer", desc: "72 saat auto-replenishing nemlendirici." },
  { name: "Dramatically Different Moisturizing Lotion+", suffix: "dramatically-different-lotion", type: "moisturizer", desc: "İkonik nemlendirici losyon. Sarı losyon." },
  { name: "Clarifying Lotion 2", suffix: "clarifying-lotion-2", type: "toner", desc: "Eksfolyan tonik. Kuru-karma ciltler." },
  { name: "Take The Day Off Cleansing Balm", suffix: "take-day-off-balm", type: "oil_cleanser", desc: "Makyaj çözücü balsam. #1 temizleyici." },
  { name: "Even Better Clinical Radical Dark Spot Corrector", suffix: "even-better-dark-spot", type: "serum", desc: "Leke düzeltici serum. CL302 kompleks." },
  { name: "Smart Clinical Repair Wrinkle Correcting Serum", suffix: "smart-clinical-repair-serum", type: "serum", desc: "Kırışıklık düzeltici serum. Retinoid + Peptit." },
  { name: "All About Eyes", suffix: "all-about-eyes", type: "eye_cream", desc: "Göz çevresi kremi. Şişlik ve morluk." },
  { name: "Redness Solutions Daily Relief Cream", suffix: "redness-solutions-cream", type: "cream", desc: "Kızarıklık yatıştırıcı krem. Hassas ciltler." },
  { name: "Acne Solutions Clinical Clearing Gel", suffix: "acne-clearing-gel", type: "serum", desc: "Akne tedavi jeli. Salisilik asit." },
  { name: "Moisture Surge Eye 96-Hour Hydro-Filler Concentrate", suffix: "moisture-surge-eye", type: "eye_cream", desc: "96 saat göz nemlendirici. HA dolgu." },
]);

genProducts(52, "Shiseido", [
  { name: "Ultimune Power Infusing Concentrate", suffix: "ultimune-power-concentrate", type: "serum", desc: "Bağışıklık güçlendirici konsantre. ImuGeneration teknolojisi." },
  { name: "Essential Energy Moisturizing Cream", suffix: "essential-energy-cream", type: "cream", desc: "Enerji verici nemlendirici. ReNeura teknolojisi." },
  { name: "Benefiance Wrinkle Smoothing Cream", suffix: "benefiance-wrinkle-cream", type: "cream", desc: "Kırışıklık düzeltici krem. Retinoid + HA." },
  { name: "Vital Perfection Uplifting and Firming Cream", suffix: "vital-perfection-firming", type: "cream", desc: "Sıkılaştırıcı krem. VP8 kompleks." },
  { name: "Urban Environment Oil-Free Suncare SPF42", suffix: "urban-environment-spf42", type: "sunscreen", desc: "Şehir güneş koruyucu. Yağsız mat." },
  { name: "Ginza Tokyo Cleansing Foam", suffix: "ginza-cleansing-foam", type: "cleanser", desc: "Ginza temizleme köpüğü. Japon teknolojisi." },
  { name: "Future Solution LX Total Radiance Foundation SPF15", suffix: "future-solution-lx-foundation", type: "day_cream", desc: "Lüks bakım fondöten. Anti-aging." },
  { name: "White Lucent Brightening Gel Cream", suffix: "white-lucent-brightening-gel", type: "cream", desc: "Aydınlatıcı jel krem. Sakura teknolojisi." },
]);

genProducts(54, "Dermalogica", [
  { name: "Special Cleansing Gel", suffix: "special-cleansing-gel", type: "cleanser", desc: "Profesyonel temizleme jeli. Tüm cilt tipleri." },
  { name: "Daily Microfoliant", suffix: "daily-microfoliant", type: "exfoliant", desc: "Günlük pirinç enzim mikro peeling." },
  { name: "Biolumin-C Serum", suffix: "biolumin-c-serum", type: "serum", desc: "Bio-aktif C vitamini serum. 2 yeni nesil C vitamini." },
  { name: "Dynamic Skin Recovery SPF50", suffix: "dynamic-skin-recovery-spf50", type: "sunscreen", desc: "Anti-aging güneş koruyucu. Peptit + HA." },
  { name: "Intensive Moisture Balance", suffix: "intensive-moisture-balance", type: "moisturizer", desc: "Yoğun nem dengesi. Prebiyotik." },
  { name: "UltraCalming Cleanser", suffix: "ultracalming-cleanser", type: "cleanser", desc: "Ultra yatıştırıcı temizleyici. Hassas ciltler." },
  { name: "Retinol Clearing Oil", suffix: "retinol-clearing-oil", type: "oil", desc: "Retinol + Salisilik asit yüz yağı. Akne + aging." },
  { name: "Skin Smoothing Cream", suffix: "skin-smoothing-cream", type: "cream", desc: "Pürüzsüzleştirici krem. Aktif HydraMesh." },
]);

genProducts(55, "Murad", [
  { name: "Retinol Youth Renewal Serum", suffix: "retinol-youth-renewal-serum", type: "serum", desc: "Retinol tri-aktif gençlik serumu." },
  { name: "Rapid Age Spot Correcting Serum", suffix: "rapid-age-spot-serum", type: "serum", desc: "Hızlı leke düzeltici. Hydroxy acid." },
  { name: "Essential-C Cleanser", suffix: "essential-c-cleanser", type: "cleanser", desc: "C vitamini temizleyici. Antioksidan." },
  { name: "AHA/BHA Exfoliating Cleanser", suffix: "aha-bha-exfoliating-cleanser", type: "exfoliant", desc: "Çift asitli eksfolyan temizleyici." },
  { name: "Hydro-Dynamic Ultimate Moisture SPF30", suffix: "hydro-dynamic-moisture-spf30", type: "day_cream", desc: "Dinamik nemlendirici SPF30." },
  { name: "Invisiblur Perfecting Shield SPF30", suffix: "invisiblur-shield-spf30", type: "sunscreen", desc: "Gözenek bulanıklaştırıcı güneş kalkanı." },
]);

// Drugstore brands
genProducts(61, "Aveeno", [
  { name: "Calm + Restore Oat Gel Moisturizer", suffix: "calm-restore-oat-gel", type: "moisturizer", desc: "Yulaf jel nemlendirici. Hassas ciltler." },
  { name: "Daily Moisturizing Lotion", suffix: "daily-moisturizing-lotion", type: "body_lotion", desc: "Günlük vücut losyonu. Kolloidal yulaf." },
  { name: "Dermexa Moisturizing Cream", suffix: "dermexa-moisturizing-cream", type: "body_cream", desc: "Egzamaya yatkın ciltler. Ceramide + Yulaf." },
  { name: "Skin Relief Moisturizing Lotion", suffix: "skin-relief-moisturizing-lotion", type: "body_lotion", desc: "Kaşıntı rahatlatıcı losyon. Shea + Yulaf." },
  { name: "Absolutely Ageless Restorative Night Cream", suffix: "absolutely-ageless-night", type: "night_cream", desc: "Anti-aging gece kremi. Blackberry kompleks." },
  { name: "Positively Mineral Sunscreen SPF50", suffix: "positively-mineral-sun-spf50", type: "sunscreen", desc: "Mineral güneş koruyucu. Yulaf + Zinc." },
]);

genProducts(62, "Simple", [
  { name: "Kind To Skin Moisturising Facial Wash", suffix: "kind-moisturising-wash", type: "cleanser", desc: "Nemlendirici yüz yıkama jeli. Hassas." },
  { name: "Kind To Skin Soothing Facial Toner", suffix: "kind-soothing-toner", type: "toner", desc: "Yatıştırıcı tonik. Alkolsüz." },
  { name: "Kind To Skin Hydrating Light Moisturiser", suffix: "kind-hydrating-light", type: "moisturizer", desc: "Hafif nemlendirici. Vitaminli." },
  { name: "Water Boost Micellar Cleansing Water", suffix: "water-boost-micellar", type: "micellar", desc: "Su boost micellar temizleyici." },
  { name: "Kind To Skin Refreshing Facial Wash", suffix: "kind-refreshing-wash", type: "cleanser", desc: "Ferahlatıcı yüz temizleyici. Pro-vitamin B5." },
]);

genProducts(63, "Sebamed", [
  { name: "Clear Face Care Gel", suffix: "clear-face-care-gel", type: "moisturizer", desc: "Akneye eğilimli ciltler jel bakım. pH 5.5." },
  { name: "Moisturizing Body Lotion", suffix: "moisturizing-body-lotion-sm", type: "body_lotion", desc: "pH 5.5 vücut losyonu." },
  { name: "Clear Face Antibacterial Cleansing Foam", suffix: "clear-face-antibacterial-foam", type: "cleanser", desc: "Antibakteriyel temizleme köpüğü." },
  { name: "Anti-Dry Day Defence Cream SPF15", suffix: "anti-dry-day-defence", type: "day_cream", desc: "Kuru ciltler gündüz bakımı SPF15." },
  { name: "Anti-Ageing Q10 Lifting Eye Cream", suffix: "anti-ageing-q10-eye", type: "eye_cream", desc: "Q10 göz çevresi kremi. Anti-aging." },
]);

// French niche
genProducts(67, "Caudalie", [
  { name: "Vinoperfect Radiance Serum", suffix: "vinoperfect-radiance-serum", type: "serum", desc: "Viniferine leke serum. Doğal aydınlatıcı." },
  { name: "Vinosource-Hydra S.O.S Thirst-Quenching Serum", suffix: "vinosource-sos-serum", type: "serum", desc: "Organik üzüm suyu nemlendirici serum." },
  { name: "Vinoclean Micellar Cleansing Water", suffix: "vinoclean-micellar", type: "micellar", desc: "Üzüm suyu micellar temizleyici." },
  { name: "Resveratrol-Lift Firming Night Cream", suffix: "resveratrol-lift-night-cream", type: "night_cream", desc: "Resveratrol sıkılaştırıcı gece kremi." },
  { name: "Resveratrol-Lift Eye Lifting Balm", suffix: "resveratrol-eye-balm", type: "eye_cream", desc: "Resveratrol göz balmı. Sıkılaştırma." },
  { name: "Vinopure Purifying Gel Cleanser", suffix: "vinopure-gel-cleanser", type: "cleanser", desc: "Arındırıcı jel temizleyici. BHA + Salisilik." },
  { name: "Premier Cru The Cream", suffix: "premier-cru-cream", type: "cream", desc: "Lüks anti-aging krem. Resveratrol + HA." },
  { name: "Soleil Divin Anti-Ageing SPF50", suffix: "soleil-divin-spf50", type: "sunscreen", desc: "Anti-aging güneş bakımı. Üzüm polifenol." },
]);

genProducts(68, "Embryolisse", [
  { name: "Lait-Crème Concentré", suffix: "lait-creme-concentre", type: "cream", desc: "Süt krem konsantresi. Paris'in #1 nemlendirici." },
  { name: "Filaderme Emulsion", suffix: "filaderme-emulsion", type: "moisturizer", desc: "Kuru ciltler emülsiyonu. Shea + Avokado." },
  { name: "Radiant Complexion Serum", suffix: "radiant-complexion-serum", type: "serum", desc: "Parlaklık serumu. C vitamini." },
  { name: "Micellar Cleansing Milk", suffix: "micellar-cleansing-milk", type: "micellar", desc: "Micellar temizleme sütü. Nazik." },
]);

genProducts(69, "Filorga", [
  { name: "Time-Filler Eyes", suffix: "time-filler-eyes", type: "eye_cream", desc: "Kırışıklık doldurucu göz kremi. NCEF." },
  { name: "NCEF-Reverse Mat Cream", suffix: "ncef-reverse-mat-cream", type: "cream", desc: "Anti-aging mat krem. NCEF + HA." },
  { name: "Optim-Eyes Eye Contour Cream", suffix: "optim-eyes-contour", type: "eye_cream", desc: "Göz çevresi bakım. Morluk + Şişlik + Kırışıklık." },
  { name: "Hydra-Hyal Hydrating Plumping Serum", suffix: "hydra-hyal-plumping-serum", type: "serum", desc: "5 tip HA dolgunlaştırıcı serum." },
  { name: "Time-Filler Intensive Serum", suffix: "time-filler-intensive-serum", type: "serum", desc: "Yoğun kırışıklık serumu. Botoks benzeri peptit." },
  { name: "Pigment-Perfect Dark Spot Corrector", suffix: "pigment-perfect-corrector", type: "serum", desc: "Leke düzeltici serum. Glabridin + C vitamini." },
]);

// Geek & Gorgeous (74)
genProducts(74, "Geek & Gorgeous", [
  { name: "C-Glow 15% Vitamin C Serum", suffix: "c-glow-15-vitamin-c", type: "serum", desc: "C vitamini %15 + Ferulic. Aydınlatıcı serum." },
  { name: "A-Game 5 0.05% Retinal Serum", suffix: "a-game-5-retinal", type: "serum", desc: "Retinal %0.05 serum. Hassas ciltler anti-aging." },
  { name: "A-Game 10 0.1% Retinal Serum", suffix: "a-game-10-retinal", type: "serum", desc: "Retinal %0.1 serum. İleri seviye." },
  { name: "Cheer Up 6% Mandelic Acid + BHA", suffix: "cheer-up-mandelic-bha", type: "exfoliant", desc: "Mandelik asit %6 + BHA. Nazik peeling." },
  { name: "aPAD 10% Azelaic Acid", suffix: "apad-10-azelaic", type: "serum", desc: "Azelaik asit %10 serum. Kızarıklık + Ton." },
  { name: "Mighty Melt Cleansing Balm", suffix: "mighty-melt-cleansing-balm", type: "oil_cleanser", desc: "Temizleme balmı. Jojoba + Squalane." },
  { name: "Stress Less 2% BHA Serum", suffix: "stress-less-bha-serum", type: "serum", desc: "BHA %2 serum. Gözenek + Siyah nokta." },
]);

// Altruist (73)
genProducts(73, "Altruist", [
  { name: "Dermatologist Sunscreen SPF50", suffix: "dermatologist-sunscreen-spf50", type: "sunscreen", desc: "Dermatolog güneş kremi. Yüksek koruma, düşük fiyat." },
  { name: "Dermatologist Sunscreen SPF30", suffix: "dermatologist-sunscreen-spf30", type: "sunscreen", desc: "SPF30 güneş koruyucu. Günlük kullanım." },
  { name: "Face Fluid SPF50", suffix: "face-fluid-spf50", type: "sunscreen", desc: "Yüz sıvısı SPF50. Mat bitiş." },
  { name: "Anti-Redness & Pigmentation SPF50", suffix: "anti-redness-spf50", type: "sunscreen", desc: "Kızarıklık ve leke karşıtı güneş koruyucu." },
]);

// Peter Thomas Roth (75)
genProducts(75, "Peter Thomas Roth", [
  { name: "Water Drench Hyaluronic Cloud Cream", suffix: "water-drench-cloud-cream", type: "cream", desc: "HA bulut krem. %30 HA kompleks." },
  { name: "Potent-C Power Serum", suffix: "potent-c-power-serum", type: "serum", desc: "THD C vitamini %20 serum. Ultra stabil." },
  { name: "Retinol Fusion PM Night Serum", suffix: "retinol-fusion-pm-serum", type: "serum", desc: "Retinol mikrokapsül gece serumu." },
  { name: "FIRMx Collagen Serum", suffix: "firmx-collagen-serum", type: "serum", desc: "Kollajen sıkılaştırıcı serum." },
  { name: "Cucumber Gel Mask", suffix: "cucumber-gel-mask", type: "mask", desc: "Salatalık jel maske. Yatıştırıcı + serinletici." },
  { name: "Max Complexion Correction Pads", suffix: "max-complexion-pads", type: "exfoliant", desc: "AHA/BHA peeling pad. Gözenek temizleyici." },
]);

// More products from existing brands: Neutrogena (8), Nuxe (10), Uriage (11), Ducray (12)
genProducts(8, "Neutrogena", [
  { name: "Hydro Boost Water Gel", suffix: "hydro-boost-water-gel-new", type: "moisturizer", desc: "Su jel nemlendirici. HA bazlı." },
  { name: "Hydro Boost Eye Cream", suffix: "hydro-boost-eye-cream", type: "eye_cream", desc: "HA göz kremi. Nemlendirici." },
  { name: "Retinol Boost Day Cream SPF15", suffix: "retinol-boost-day-spf15", type: "day_cream", desc: "Retinol gündüz kremi SPF15." },
  { name: "Retinol Boost Night Cream", suffix: "retinol-boost-night", type: "night_cream", desc: "Retinol gece kremi. Anti-aging." },
  { name: "Clear & Defend Facial Wash", suffix: "clear-defend-facial-wash", type: "cleanser", desc: "Akne temizleyici. Salisilik asit %2." },
  { name: "Hydro Boost Body Gel Cream", suffix: "hydro-boost-body-gel-cream", type: "body_cream", desc: "HA vücut jel krem. Nemlendirici." },
  { name: "Ultra Sheer Face Mist SPF50", suffix: "ultra-sheer-face-mist-spf50", type: "sunscreen", desc: "Ultra hafif yüz mist SPF50." },
  { name: "Bright Boost Illuminating Serum", suffix: "bright-boost-illuminating-serum", type: "serum", desc: "Neoglucosamine aydınlatıcı serum." },
  { name: "Norwegian Formula Hand Cream", suffix: "norwegian-hand-cream", type: "hand_cream", desc: "Norveç formülü el kremi. Yoğun nemlendirme." },
  { name: "Visibly Clear Pink Grapefruit Cleanser", suffix: "visibly-clear-grapefruit", type: "cleanser", desc: "Greyfurt temizleyici. Akne bakımı." },
]);

genProducts(10, "Nuxe", [
  { name: "Huile Prodigieuse", suffix: "huile-prodigieuse", type: "oil", desc: "Mucize kuru yağ. Yüz + Vücut + Saç." },
  { name: "Creme Fraiche de Beaute 48H Moisturizing Cream", suffix: "creme-fraiche-48h", type: "cream", desc: "48 saat nemlendirici krem. Bitki sütleri." },
  { name: "Reve de Miel Lip Balm", suffix: "reve-de-miel-lip-balm", type: "lip_care", desc: "Bal dudak balmı. Kuru ve çatlak dudaklar." },
  { name: "Merveillance LIFT Firming Eye Cream", suffix: "merveillance-lift-eye", type: "eye_cream", desc: "Sıkılaştırıcı göz kremi. Retinol benzeri." },
  { name: "Super Serum 10 Anti-Aging Concentrate", suffix: "super-serum-10", type: "serum", desc: "10 aktifli anti-aging konsantre. HA + Niacinamide." },
  { name: "Creme Prodigieuse Boost Multi-Purpose Gel-Cream", suffix: "creme-prodigieuse-boost", type: "moisturizer", desc: "Antioksidan jel krem. Jasmine." },
  { name: "Very Rose 3-in-1 Soothing Micellar Water", suffix: "very-rose-micellar", type: "micellar", desc: "Gül suyu micellar temizleyici." },
  { name: "Huile Prodigieuse Neroli", suffix: "huile-prodigieuse-neroli", type: "oil", desc: "Neroli çiçeği kuru yağ." },
]);

genProducts(14, "Uriage", [
  { name: "Eau Thermale Water Cream", suffix: "eau-thermale-water-cream", type: "cream", desc: "Termal su krem. Nemlendirici + Koruyucu." },
  { name: "Bariederm Cica-Cream", suffix: "bariederm-cica-cream", type: "balm", desc: "Onarıcı cica krem. Bakır + Çinko." },
  { name: "Hyseac 3-Regul Global Skin-Care", suffix: "hyseac-3-regul", type: "cream", desc: "Akne bakım kremi. Yağ kontrolü." },
  { name: "Depiderm Anti-Brown Spot Serum", suffix: "depiderm-anti-spot-serum", type: "serum", desc: "Leke karşıtı serum. Aktif C vitamini." },
  { name: "Xemose Lipid-Replenishing Cream", suffix: "xemose-lipid-cream", type: "body_cream", desc: "Lipid doldurucu atopik krem." },
  { name: "Age Protect Multi-Action Cream SPF30", suffix: "age-protect-cream-spf30", type: "day_cream", desc: "Anti-aging SPF30. Retinol + C vitamini." },
  { name: "Bariesun Mat Fluid SPF50+", suffix: "bariesun-mat-fluid-spf50", type: "sunscreen", desc: "Mat sıvı güneş koruyucu. Yağlı ciltler." },
  { name: "Eau Thermale Micellar Water", suffix: "eau-thermale-micellar", type: "micellar", desc: "Termal su micellar temizleyici." },
]);

genProducts(15, "Ducray", [
  { name: "Keracnyl PP Anti-Blemish Cream", suffix: "keracnyl-pp-cream", type: "cream", desc: "Akne karşıtı krem. Myrtacine." },
  { name: "Keracnyl Foaming Gel", suffix: "keracnyl-foaming-gel", type: "cleanser", desc: "Akne temizleme jeli." },
  { name: "Melascreen Depigmenting Intense Care", suffix: "melascreen-depigmenting", type: "serum", desc: "Yoğun leke bakımı. Azelaic + Glycolic acid." },
  { name: "Ictyane HD Emollient Cream", suffix: "ictyane-hd-emollient", type: "cream", desc: "Kuru ciltler emolyan krem." },
  { name: "Anacaps Reactiv Hair Supplement", suffix: "anacaps-reactiv-hair", type: "cleanser", desc: "Saç dökülmesi destekleyici. Biotin + Çinko." },
  { name: "Squanorm Anti-Dandruff Shampoo", suffix: "squanorm-anti-dandruff", type: "cleanser", desc: "Kepek karşıtı şampuan. Keluamid." },
]);

// More from Some By Mi (17), Klairs (15), Purito (16), etc.
genProducts(19, "Some By Mi", [
  { name: "AHA BHA PHA 30 Days Miracle Serum", suffix: "aha-bha-pha-miracle-serum", type: "serum", desc: "AHA+BHA+PHA mucize serum. 3 asitli." },
  { name: "AHA BHA PHA 30 Days Miracle Cream", suffix: "aha-bha-pha-miracle-cream", type: "cream", desc: "30 gün mucize krem. Akne bakım." },
  { name: "Galactomyces Pure Vitamin C Glow Serum", suffix: "galactomyces-vitamin-c-serum", type: "serum", desc: "Galactomyces + C vitamini parlaklık serumu." },
  { name: "Yuja Niacin Brightening Moisture Gel Cream", suffix: "yuja-niacin-gel-cream", type: "moisturizer", desc: "Yuja + Niacinamide aydınlatıcı jel krem." },
  { name: "Real Cica 92% Cool Calming Soothing Gel", suffix: "real-cica-92-gel", type: "moisturizer", desc: "Cica %92 serinletici jel. Yatıştırıcı." },
  { name: "Super Matcha Pore Clean Cleansing Gel", suffix: "super-matcha-pore-cleanser", type: "cleanser", desc: "Matcha gözenek temizleme jeli." },
  { name: "Retinol Intense Reactivating Serum", suffix: "retinol-intense-serum-sbm", type: "serum", desc: "Retinol + Bakuchiol serum. Anti-aging." },
  { name: "Snail Truecica Miracle Repair Serum", suffix: "snail-truecica-repair-serum", type: "serum", desc: "Salyangoz + Cica onarım serumu." },
  { name: "Beta Panthenol Repair Cream", suffix: "beta-panthenol-repair-cream", type: "cream", desc: "Panthenol onarım kremi. Hassas ciltler." },
  { name: "Hyaluronic Acid Moisture Barrier Cream", suffix: "hyaluronic-barrier-cream-sbm", type: "cream", desc: "HA bariyer kremi. Nemlendirme + koruma." },
]);

genProducts(17, "Klairs", [
  { name: "Supple Preparation Facial Toner", suffix: "supple-preparation-toner", type: "toner", desc: "Hazırlık toneri. HA + Centella." },
  { name: "Supple Preparation Unscented Toner", suffix: "supple-preparation-unscented", type: "toner", desc: "Parfümsüz hazırlık toneri." },
  { name: "Freshly Juiced Vitamin C Serum", suffix: "freshly-juiced-vitamin-c", type: "serum", desc: "C vitamini %5 nazik serum." },
  { name: "Rich Moist Soothing Cream", suffix: "rich-moist-soothing-cream-kl", type: "cream", desc: "Zengin yatıştırıcı krem. Ceramide." },
  { name: "Fundamental Water Gel Cream", suffix: "fundamental-water-gel", type: "moisturizer", desc: "Su jel krem. Hafif nemlendirme." },
  { name: "Soft Airy UV Essence SPF50+", suffix: "soft-airy-uv-essence", type: "sunscreen", desc: "Hava gibi hafif güneş esansı." },
  { name: "All-Over Lotion", suffix: "all-over-lotion-klairs", type: "body_lotion", desc: "Yüz + Vücut losyon. Centella." },
]);

genProducts(18, "Purito", [
  { name: "Centella Green Level Buffet Serum", suffix: "centella-buffet-serum", type: "serum", desc: "Centella tampon serum. 49 bileşen." },
  { name: "Centella Unscented Recovery Cream", suffix: "centella-unscented-cream", type: "cream", desc: "Parfümsüz centella onarım kremi." },
  { name: "Defence Barrier pH Cleanser", suffix: "defence-barrier-cleanser", type: "cleanser", desc: "pH 5.5 bariyer temizleyici." },
  { name: "Centella Green Level Eye Cream", suffix: "centella-eye-cream-purito", type: "eye_cream", desc: "Centella göz kremi. Peptit." },
  { name: "Daily Go-To Sunscreen SPF50+", suffix: "daily-go-to-sunscreen", type: "sunscreen", desc: "Günlük güneş kremi. Rice + Centella." },
  { name: "Galacto Niacin 97 Power Essence", suffix: "galacto-niacin-97-essence", type: "essence", desc: "Galactomyces %97 esans." },
  { name: "Centella Green Level Recovery Cream", suffix: "centella-green-level-cream", type: "cream", desc: "Centella recovery krem. Onarım." },
]);

// More from Paula's Choice (19), Drunk Elephant (20), etc.
genProducts(21, "Paula's Choice", [
  { name: "Skin Perfecting 8% AHA Gel Exfoliant", suffix: "skin-perfecting-8-aha-gel", type: "exfoliant", desc: "Glikolik asit %8 jel peeling." },
  { name: "RESIST Anti-Aging Eye Cream", suffix: "resist-anti-aging-eye", type: "eye_cream", desc: "Retinol + Peptit anti-aging göz kremi." },
  { name: "Clinical 1% Retinol Treatment", suffix: "clinical-1-retinol", type: "serum", desc: "Klinik retinol %1 tedavi serumu." },
  { name: "RESIST Barrier Repair Moisturizer", suffix: "resist-barrier-repair", type: "moisturizer", desc: "Bariyer onarım nemlendirici. Retinol + HA." },
  { name: "CALM Redness Relief Moisturizer SPF30", suffix: "calm-redness-relief-spf30", type: "day_cream", desc: "Kızarıklık yatıştırıcı SPF30." },
  { name: "Omega+ Complex Serum", suffix: "omega-complex-serum", type: "serum", desc: "Omega yağ asidi serum. Bariyer güçlendirici." },
  { name: "CLEAR Pore Normalizing Cleanser", suffix: "clear-pore-normalizer", type: "cleanser", desc: "Gözenek normalleştirici temizleyici." },
  { name: "Azelaic Acid Booster", suffix: "azelaic-acid-booster-pc", type: "serum", desc: "Azelaik asit %10 booster. Kızarıklık + leke." },
  { name: "Defense Antioxidant Pore Purifier", suffix: "defense-antioxidant-purifier", type: "serum", desc: "Antioksidan gözenek arındırıcı." },
  { name: "Pro-Collagen Multi-Peptide Booster", suffix: "pro-collagen-peptide-booster", type: "serum", desc: "Pro-kollajen peptit booster. Sıkılaştırma." },
]);

// Sunday Riley, Tatcha, Fresh, Glow Recipe, Farmacy, Weleda, etc.
genProducts(56, "Sunday Riley", [
  { name: "Good Genes All-In-One Lactic Acid Treatment", suffix: "good-genes-lactic-acid", type: "exfoliant", desc: "Laktik asit tedavi serumu. Anında parlaklık." },
  { name: "C.E.O. 15% Vitamin C Brightening Serum", suffix: "ceo-15-vitamin-c-serum", type: "serum", desc: "C vitamini %15 THD. Aydınlatıcı." },
  { name: "Luna Retinol Sleeping Night Oil", suffix: "luna-retinol-sleeping-oil", type: "oil", desc: "Retinol gece yağı. Trans-retinol ester." },
  { name: "A+ High-Dose Retinoid Serum", suffix: "a-plus-retinoid-serum", type: "serum", desc: "Yüksek doz retinoid. %5 HPR." },
  { name: "Ice Ceramide Moisturizer", suffix: "ice-ceramide-moisturizer", type: "cream", desc: "Ceramide buz nemlendirici. Bariyer onarım." },
]);

genProducts(59, "Glow Recipe", [
  { name: "Watermelon Glow Niacinamide Dew Drops", suffix: "watermelon-niacinamide-dew", type: "serum", desc: "Karpuz + Niacinamide çiğ damlaları. Parlaklık." },
  { name: "Watermelon Glow PHA+BHA Toner", suffix: "watermelon-pha-bha-toner", type: "toner", desc: "Karpuz PHA+BHA tonik. Nazik peeling." },
  { name: "Plum Plump Hyaluronic Acid Serum", suffix: "plum-plump-ha-serum", type: "serum", desc: "Erik + HA dolgunlaştırıcı serum." },
  { name: "Avocado Ceramide Recovery Serum", suffix: "avocado-ceramide-serum", type: "serum", desc: "Avokado + Ceramide onarım serumu." },
  { name: "Strawberry Smooth BHA+AHA Salicylic Acid Serum", suffix: "strawberry-smooth-bha-aha", type: "exfoliant", desc: "Çilek BHA+AHA peeling serumu." },
]);

genProducts(65, "Weleda", [
  { name: "Skin Food Original", suffix: "skin-food-original", type: "cream", desc: "Orijinal cilt besleyici. Bitki bazlı yoğun bakım." },
  { name: "Skin Food Light", suffix: "skin-food-light", type: "moisturizer", desc: "Hafif cilt besleyici. Günlük kullanım." },
  { name: "Almond Soothing Facial Cream", suffix: "almond-soothing-cream", type: "cream", desc: "Badem yatıştırıcı krem. Hassas ciltler." },
  { name: "Wild Rose Smoothing Eye Cream", suffix: "wild-rose-eye-cream", type: "eye_cream", desc: "Yaban gülü göz kremi. Antioksidan." },
  { name: "Pomegranate Firming Face Serum", suffix: "pomegranate-firming-serum", type: "serum", desc: "Nar sıkılaştırıcı serum. Anti-aging." },
]);

// Medicube (37)
genProducts(37, "Medicube", [
  { name: "Red Acne Body Wash", suffix: "red-acne-body-wash", type: "cleanser", desc: "Akne vücut yıkama. BHA + Centella." },
  { name: "Zero Pore Pad", suffix: "zero-pore-pad", type: "exfoliant", desc: "Gözenek peeling pad. PHA + AHA." },
  { name: "Deep Vita C Serum", suffix: "deep-vita-c-serum", type: "serum", desc: "C vitamini serum. 3 tip C vitamini." },
  { name: "Collagen Jelly Cream", suffix: "collagen-jelly-cream", type: "cream", desc: "Kollajen jöle krem. Sıkılaştırma." },
  { name: "Red Erasing Cream", suffix: "red-erasing-cream", type: "cream", desc: "Kızarıklık silici krem. Cica + Centella." },
  { name: "AGE-R Booster-H", suffix: "age-r-booster-h", type: "serum", desc: "HA booster serum. Cihaz uyumlu." },
]);

// More from Garnier (24), Nivea (25), Cetaphil (18), Innisfree (26)
genProducts(26, "Garnier", [
  { name: "SkinActive Hyaluronic Aloe Jelly Moisturizer", suffix: "hyaluronic-aloe-jelly", type: "moisturizer", desc: "HA + Aloe jöle nemlendirici." },
  { name: "Pure Active 3-in-1 Wash Scrub Mask", suffix: "pure-active-3in1", type: "exfoliant", desc: "3'ü 1 arada temizleyici. Akne bakım." },
  { name: "SkinActive Niacinamide + Kale Eye Cream", suffix: "niacinamide-kale-eye-cream", type: "eye_cream", desc: "Niacinamide göz kremi." },
  { name: "SkinActive Anti-Fatigue Night Cream", suffix: "anti-fatigue-night-cream", type: "night_cream", desc: "Anti-yorgunluk gece kremi." },
  { name: "Organic Lavandin Face Moisturizer", suffix: "organic-lavandin-moisturizer", type: "moisturizer", desc: "Organik lavanta nemlendirici." },
  { name: "Ambre Solaire Super UV Face Fluid SPF50+", suffix: "ambre-solaire-face-fluid", type: "sunscreen", desc: "Ultra hafif yüz sıvısı SPF50+." },
  { name: "SkinActive Pure Charcoal Mask", suffix: "pure-charcoal-mask", type: "mask", desc: "Aktif kömür arındırıcı maske." },
  { name: "Fructis Hair Food Banana Mask", suffix: "fructis-hair-food-banana", type: "mask", desc: "Muz saç maskesi. Besleyici." },
]);

genProducts(27, "Nivea", [
  { name: "Cellular Luminous 630 Anti-Spot Serum", suffix: "cellular-luminous-630-serum", type: "serum", desc: "Luminous630 leke serumu. Patentli aktif." },
  { name: "Naturally Good Anti-Wrinkle Day Care", suffix: "naturally-good-anti-wrinkle", type: "day_cream", desc: "Doğal anti-kırışıklık gündüz bakımı." },
  { name: "Hyaluron Cellular Filler + Elasticity Night", suffix: "hyaluron-filler-elasticity-night", type: "night_cream", desc: "HA + Elasticity gece kremi." },
  { name: "Sun UV Face Shine Control SPF50", suffix: "sun-shine-control-spf50", type: "sunscreen", desc: "Mat bitiş yüz güneş koruyucu." },
  { name: "MicellAIR Skin Breathe Micellar Water", suffix: "micellair-skin-breathe", type: "micellar", desc: "Micellar temizleme suyu. Tüm cilt tipleri." },
  { name: "Essentials Enriching Day Cream SPF15", suffix: "essentials-enriching-day", type: "day_cream", desc: "Besleyici gündüz bakımı SPF15." },
  { name: "Q10 Anti-Wrinkle + Firming Eye Cream", suffix: "q10-firming-eye-cream", type: "eye_cream", desc: "Q10 göz kremi. Kırışıklık azaltıcı." },
  { name: "Soft Moisturizing Creme", suffix: "soft-moisturizing-creme", type: "cream", desc: "Soft nemlendirici krem. Yüz + Vücut." },
]);

genProducts(28, "Innisfree", [
  { name: "Retinol Cica Moisture Recovery Serum", suffix: "retinol-cica-recovery-serum", type: "serum", desc: "Retinol + Cica kurtarma serumu. Anti-aging." },
  { name: "Jeju Cherry Blossom Tone-Up Cream", suffix: "cherry-blossom-tone-up", type: "cream", desc: "Kiraz çiçeği renk düzeltici krem." },
  { name: "Green Tea Hyaluronic Acid Cream", suffix: "green-tea-ha-cream-innisfree", type: "cream", desc: "Yeşil çay + HA krem. Nemlendirme." },
  { name: "Volcanic Pore Clay Mask", suffix: "volcanic-pore-clay-mask", type: "mask", desc: "Volkanik kil gözenek maskesi." },
  { name: "Dewy Glow Jelly Cream", suffix: "dewy-glow-jelly-cream", type: "cream", desc: "Çiğli parlaklık jöle krem." },
  { name: "Retinol Cica Spot Serum", suffix: "retinol-cica-spot-serum", type: "serum", desc: "Retinol + Cica leke serumu." },
]);

// Add remaining products from Avene (5), SVR (6), Isntree (21), Missha (23), Beauty of Joseon (22), Hada Labo (14)
genProducts(5, "Avene", [
  { name: "Cleanance Comedomed Anti-Blemish Concentrate", suffix: "cleanance-comedomed", type: "serum", desc: "Komedomed akne konsantresi. ComedoClastin." },
  { name: "Cleanance Cleansing Gel", suffix: "cleanance-cleansing-gel", type: "cleanser", desc: "Akne temizleme jeli. Monolaurin." },
  { name: "Hydrance Aqua-Gel", suffix: "hydrance-aqua-gel", type: "moisturizer", desc: "Aqua-jel nemlendirici. Tüm cilt tipleri." },
  { name: "Hydrance UV Rich Cream SPF30", suffix: "hydrance-uv-rich-spf30", type: "day_cream", desc: "Zengin nemlendirici SPF30." },
  { name: "Thermal Spring Water Spray", suffix: "thermal-spring-water-spray", type: "mist", desc: "Termal su spreyi. Yatıştırıcı." },
  { name: "Xeracalm A.D Lipid-Replenishing Cream", suffix: "xeracalm-ad-lipid-cream", type: "body_cream", desc: "Atopik bakım lipid krem." },
  { name: "Cleanance SPF50+ Tinted Sunscreen", suffix: "cleanance-spf50-tinted", type: "sunscreen", desc: "Renkli akne güneş koruyucu." },
  { name: "Very High Protection Fluid SPF50+", suffix: "very-high-protection-fluid", type: "sunscreen", desc: "Ultra koruma sıvısı. Hassas ciltler." },
]);

genProducts(6, "SVR", [
  { name: "Sebiaclear Serum", suffix: "sebiaclear-serum", type: "serum", desc: "Akne serum. Niacinamide + Glukonolakton." },
  { name: "Sebiaclear Active Cream", suffix: "sebiaclear-active-cream", type: "cream", desc: "Aktif akne kremi. BHA + Bakır." },
  { name: "Topialyse Baume Intensif", suffix: "topialyse-baume-intensif", type: "body_cream", desc: "Atopik yoğun balsam." },
  { name: "Hydraliane Light Moisturizer", suffix: "hydraliane-light", type: "moisturizer", desc: "Hafif nemlendirici. Tüm cilt tipleri." },
  { name: "Clairial 10 Dark Spot Concentrate", suffix: "clairial-10-dark-spot", type: "serum", desc: "Leke konsantresi. Niacinamide %10." },
  { name: "Ampoule B3 Hydra Repairing Concentrate", suffix: "ampoule-b3-hydra", type: "ampoule", desc: "B3 + HA onarıcı ampul." },
]);

genProducts(23, "Isntree", [
  { name: "Chestnut AHA 8% Clear Essence", suffix: "chestnut-aha-8-essence", type: "essence", desc: "Kestane AHA %8 peeling esans." },
  { name: "C-Niacin Toning Cream", suffix: "c-niacin-toning-cream", type: "cream", desc: "C vitamini + Niacinamide tonlama kremi." },
  { name: "Aloe Soothing Gel Fresh", suffix: "aloe-soothing-gel-fresh", type: "moisturizer", desc: "Aloe yatıştırıcı jel. Ferahlatıcı." },
  { name: "Spot Saver Mugwort Ampoule", suffix: "spot-saver-mugwort-ampoule", type: "ampoule", desc: "Yavşan otu leke ampulü." },
  { name: "TW-Real Bifida Ampoule", suffix: "tw-real-bifida-ampoule", type: "ampoule", desc: "Bifida ferment ampulü. Onarım." },
  { name: "Clear Skin BHA Toner", suffix: "clear-skin-bha-toner", type: "toner", desc: "BHA berraklaştırıcı tonik." },
]);

genProducts(25, "Missha", [
  { name: "First Treatment Essence RX", suffix: "first-treatment-essence-rx", type: "essence", desc: "Fermente maya esans. Saccharomyces." },
  { name: "Bee Pollen Renew Ampoule", suffix: "bee-pollen-renew-ampoule", type: "ampoule", desc: "Arı poleni yenileyici ampul." },
  { name: "Chogongjin Sosaeng Cream", suffix: "chogongjin-sosaeng-cream", type: "cream", desc: "Kore hanbang zengin krem." },
  { name: "Super Aqua Ultra Hyaluronic Acid Serum", suffix: "super-aqua-ha-serum", type: "serum", desc: "HA serum. 3 tip hyaluronic acid." },
  { name: "Airy Fit Sun Milk SPF50+", suffix: "airy-fit-sun-milk", type: "sunscreen", desc: "Hafif güneş sütü." },
]);

genProducts(24, "Beauty of Joseon", [
  { name: "Ginseng Cleansing Oil", suffix: "boj-ginseng-cleansing-oil", type: "oil_cleanser", desc: "Ginseng temizleme yağı. K-beauty." },
  { name: "Revive Eye Serum: Ginseng + Retinal", suffix: "boj-revive-eye-serum", type: "eye_cream", desc: "Ginseng + Retinal göz serumu." },
  { name: "Glow Serum: Propolis + Niacinamide 60ml", suffix: "boj-glow-serum-propolis-60ml", type: "serum", desc: "Propolis serumu büyük boy." },
  { name: "Calming Serum: Green Tea + Panthenol", suffix: "boj-calming-serum-green-tea", type: "serum", desc: "Yeşil çay + Panthenol yatıştırıcı serum." },
  { name: "Dynasty Cream", suffix: "boj-dynasty-cream", type: "cream", desc: "Ginseng anti-aging krem. Hanbang." },
  { name: "Matte Sun Stick: Mugwort + Camelia SPF50+", suffix: "boj-matte-sun-stick", type: "sun_stick", desc: "Mat güneş stick. SPF50+." },
]);

genProducts(16, "Hada Labo", [
  { name: "Gokujyun Premium Hyaluronic Acid Lotion", suffix: "gokujyun-premium-lotion", type: "toner", desc: "Premium HA losyon. 7 tip hyaluronic acid." },
  { name: "Gokujyun Hyaluronic Acid Cleansing Foam", suffix: "gokujyun-cleansing-foam", type: "cleanser", desc: "HA temizleme köpüğü. Super HA." },
  { name: "Gokujyun Hyaluronic Acid Eye Cream", suffix: "gokujyun-eye-cream", type: "eye_cream", desc: "HA göz kremi. Nemlendirici." },
  { name: "Gokujyun Perfect Gel", suffix: "gokujyun-perfect-gel", type: "moisturizer", desc: "5'i 1 arada jel nemlendirici." },
  { name: "Koi-Gokujyun UV White Gel SPF50+", suffix: "koi-gokujyun-uv-gel", type: "sunscreen", desc: "HA güneş jeli. Aydınlatıcı." },
]);

// Etude House (31), remaining brands
genProducts(31, "Etude House", [
  { name: "SoonJung pH 6.5 Whip Cleanser", suffix: "soonjung-ph65-cleanser", type: "cleanser", desc: "pH 6.5 hafif temizleyici. Hassas ciltler." },
  { name: "SoonJung 2x Barrier Intensive Cream", suffix: "soonjung-2x-barrier-cream", type: "cream", desc: "Çift bariyer yoğun krem. Panthenol + Madecassoside." },
  { name: "SoonJung 10-Free Moist Emulsion", suffix: "soonjung-10free-emulsion", type: "moisturizer", desc: "10 zararlı madde içermeyen emülsiyon." },
  { name: "Moistfull Collagen Deep Cream", suffix: "moistfull-collagen-deep-cream", type: "cream", desc: "Kollajen derin krem. Dolgunluk." },
  { name: "SoonJung Centella 5-Panthensoside Cica Balm", suffix: "soonjung-cica-balm", type: "balm", desc: "Centella + Panthenol cica balsam." },
  { name: "SoonJung Mild Defence Sun Cream SPF49", suffix: "soonjung-mild-sun-spf49", type: "sunscreen", desc: "Nazik güneş kremi. Hassas ciltler." },
]);

// Noreva (71), ACM (72), Lierac (70)
genProducts(71, "Noreva", [
  { name: "Exfoliac Global 6 Intensive Treatment", suffix: "exfoliac-global-6", type: "serum", desc: "6 etkili akne tedavi serumu." },
  { name: "Alpha KM Anti-Ageing Firming Day Cream", suffix: "alpha-km-firming-day", type: "day_cream", desc: "Anti-aging sıkılaştırıcı gündüz kremi." },
  { name: "Trio White S Depigmenting Serum", suffix: "trio-white-s-serum", type: "serum", desc: "Üçlü aydınlatıcı leke serumu." },
  { name: "Aquareva Moisturizing Day Cream", suffix: "aquareva-moisturizing-day", type: "day_cream", desc: "24 saat nemlendirici gündüz kremi." },
]);

genProducts(72, "ACM", [
  { name: "Depiwhite Advanced Depigmenting Cream", suffix: "depiwhite-advanced-cream", type: "cream", desc: "Leke karşıtı krem. Lumiskin." },
  { name: "Sebionex Mattifying Cream", suffix: "sebionex-mattifying-cream", type: "moisturizer", desc: "Matlaştırıcı krem. Yağlı ciltler." },
  { name: "Duolys CE Intensive Antioxidant Serum", suffix: "duolys-ce-antioxidant-serum", type: "serum", desc: "C+E vitamini antioksidan serum." },
  { name: "Vitix Gel Repigmenting", suffix: "vitix-gel-repigmenting", type: "cream", desc: "Vitiligo bakım jeli. Repigmentasyon." },
]);

genProducts(70, "Lierac", [
  { name: "Cica-Filler Anti-Wrinkle Repairing Serum", suffix: "cica-filler-serum", type: "serum", desc: "Cica + Dolgu kırışıklık onarım serumu." },
  { name: "Mesolift C15 Extemporaneous Anti-Fatigue Concentrate", suffix: "mesolift-c15-concentrate", type: "serum", desc: "C vitamini %15 anti-yorgunluk konsantre." },
  { name: "Sunissime Fluide Protecteur SPF50+", suffix: "sunissime-fluide-spf50", type: "sunscreen", desc: "Koruyucu güneş sıvısı. Anti-aging." },
  { name: "Lift Integral Sculpting Lift Cream", suffix: "lift-integral-sculpting-cream", type: "cream", desc: "Lüks sıkılaştırıcı yontu kremi." },
]);

// Glow Recipe, Fresh, Farmacy, Tatcha — fewer products
genProducts(57, "Tatcha", [
  { name: "The Dewy Skin Cream", suffix: "dewy-skin-cream", type: "cream", desc: "Japon mor pirinç çiğli krem." },
  { name: "The Water Cream", suffix: "water-cream-tatcha", type: "moisturizer", desc: "Hafif su krem. Hadasei-3." },
  { name: "The Rice Wash", suffix: "rice-wash-tatcha", type: "cleanser", desc: "Pirinç temizleyici. Enzim peeling." },
  { name: "Luminous Dewy Skin Mist", suffix: "luminous-dewy-mist", type: "mist", desc: "Parlaklık misti. Botanik yağlar." },
]);

genProducts(58, "Fresh", [
  { name: "Soy Face Cleanser", suffix: "soy-face-cleanser", type: "cleanser", desc: "Soya temizleyici. Nazik makyaj çözücü." },
  { name: "Rose Deep Hydration Face Cream", suffix: "rose-deep-hydration-cream", type: "cream", desc: "Gül nemlendirici krem. Damask gülü." },
  { name: "Black Tea Firming Eye Serum", suffix: "black-tea-eye-serum", type: "eye_cream", desc: "Siyah çay göz serumu. Sıkılaştırıcı." },
  { name: "Lotus Youth Preserve Moisturizer", suffix: "lotus-youth-preserve", type: "moisturizer", desc: "Lotus çiçeği anti-aging nemlendirici." },
]);

genProducts(60, "Farmacy", [
  { name: "Green Clean Makeup Removing Cleansing Balm", suffix: "green-clean-balm", type: "oil_cleanser", desc: "Yeşil temizleme balmı. Echinacea." },
  { name: "Honey Potion Renewing Antioxidant Hydration Mask", suffix: "honey-potion-mask", type: "mask", desc: "Bal antioksidan nemlendirme maskesi." },
  { name: "10% Niacinamide Night Mask", suffix: "niacinamide-10-night-mask", type: "mask", desc: "Niacinamide %10 gece maskesi." },
  { name: "Daily Greens Oil-Free Gel Moisturizer", suffix: "daily-greens-gel-moisturizer", type: "moisturizer", desc: "Yeşillikli jel nemlendirici. Papaya." },
]);

// SK-II (53)
genProducts(53, "SK-II", [
  { name: "Facial Treatment Essence", suffix: "facial-treatment-essence", type: "essence", desc: "İkonik Pitera esans. %90 Pitera." },
  { name: "GenOptics Aura Essence", suffix: "genoptics-aura-essence", type: "serum", desc: "Aura aydınlatıcı esans. GenOptics." },
  { name: "Skinpower Cream", suffix: "skinpower-cream", type: "cream", desc: "Güç krem. Pitera + Peptit." },
  { name: "R.N.A. Power Airy Milky Lotion", suffix: "rna-power-airy-lotion", type: "moisturizer", desc: "RNA hafif süt losyon." },
]);

// Dr. Hauschka (66)
genProducts(66, "Dr. Hauschka", [
  { name: "Rose Day Cream", suffix: "rose-day-cream", type: "cream", desc: "Gül gündüz kremi. Doğal bakım." },
  { name: "Soothing Cleansing Milk", suffix: "soothing-cleansing-milk", type: "cleanser", desc: "Yatıştırıcı temizleme sütü." },
  { name: "Revitalising Day Cream", suffix: "revitalising-day-cream", type: "day_cream", desc: "Canlandırıcı gündüz kremi. 40+" },
  { name: "Lip Care Stick", suffix: "lip-care-stick", type: "lip_care", desc: "Dudak bakım stick. Doğal." },
]);

// Muji (48)
genProducts(48, "Muji", [
  { name: "Sensitive Skin Toning Water Light", suffix: "sensitive-toning-water-light", type: "toner", desc: "Hassas cilt toneri. Minimal formül." },
  { name: "Sensitive Skin All in One Essence", suffix: "sensitive-all-in-one-essence", type: "essence", desc: "Hassas cilt çok fonksiyonlu esans." },
  { name: "Cleansing Oil", suffix: "cleansing-oil-muji", type: "oil_cleanser", desc: "Temizleme yağı. Zeytinyağı bazlı." },
  { name: "Sensitive Skin Moisturizing Cream", suffix: "sensitive-moisturizing-cream-muji", type: "cream", desc: "Hassas cilt nemlendirici krem." },
]);

// Dove (64)
genProducts(64, "Dove", [
  { name: "DermaSpa Goodness Body Cream", suffix: "dermaspa-goodness-body-cream", type: "body_cream", desc: "Zengin vücut kremi. Shea yağı." },
  { name: "Sensitive Skin Beauty Bar", suffix: "sensitive-skin-beauty-bar", type: "cleanser", desc: "Hassas cilt temizleme barı. pH dengeli." },
  { name: "Advanced Hair Series Regenerate Nourishment Serum", suffix: "advanced-hair-serum", type: "serum", desc: "Saç onarım serumu. Keratin." },
  { name: "Nourishing Body Care Body Lotion", suffix: "nourishing-body-lotion-dove", type: "body_lotion", desc: "Besleyici vücut losyonu." },
]);

// Canmake (46)
genProducts(46, "Canmake", [
  { name: "Mermaid Skin Gel UV SPF50+", suffix: "mermaid-skin-gel-uv", type: "sunscreen", desc: "Deniz kızı jel güneş koruyucu. Şeffaf." },
  { name: "Secret Beauty Powder", suffix: "secret-beauty-powder", type: "sunscreen", desc: "Gizli güzellik pudrası. Mat bitiş." },
]);

// Estée Lauder (51)
genProducts(51, "Estée Lauder", [
  { name: "Advanced Night Repair Serum", suffix: "advanced-night-repair-serum", type: "serum", desc: "İkonik gece onarım serumu. Chronolux." },
  { name: "Perfectionist Pro Rapid Brightening Treatment", suffix: "perfectionist-pro-brightening", type: "serum", desc: "Hızlı aydınlatma tedavisi." },
  { name: "Revitalizing Supreme+ Global Anti-Aging Cell Power Cream", suffix: "revitalizing-supreme-cream", type: "cream", desc: "Küresel anti-aging krem." },
  { name: "DayWear Multi-Protection Anti-Oxidant Cream SPF15", suffix: "daywear-anti-oxidant-spf15", type: "day_cream", desc: "Antioksidan gündüz bakımı SPF15." },
  { name: "Advanced Night Repair Eye Supercharged Gel-Crème", suffix: "anr-eye-gel-creme", type: "eye_cream", desc: "Gece onarım göz jel krem." },
]);

// ========================
// ADDITIONAL PRODUCTS TO REACH 900+
// ========================

// More LRP variants
genProducts(1, "La Roche-Posay", [
  { name: "Effaclar H ISO-BIOME Ultra Soothing Moisturiser", suffix: "effaclar-h-iso-biome", type: "moisturizer", desc: "Kurumuş akneye eğilimli ciltler nemlendirici." },
  { name: "Substiane Extra Riche", suffix: "substiane-extra-riche", type: "cream", desc: "Olgun ciltler yoğun besleyici krem." },
  { name: "Rosaliac UV Riche SPF15", suffix: "rosaliac-uv-riche", type: "day_cream", desc: "Kızarıklık eğilimli kuru ciltler SPF15." },
  { name: "Toleriane Dermo-Cleanser", suffix: "toleriane-dermo-cleanser", type: "cleanser", desc: "Hassas ciltler dermo temizleyici." },
  { name: "Effaclar Astringent Micro-Peeling Toner", suffix: "effaclar-astringent-toner", type: "toner", desc: "Sıkılaştırıcı peeling tonik. LHA." },
]);

// More CeraVe
genProducts(2, "CeraVe", [
  { name: "Acne Foaming Cream Cleanser", suffix: "acne-foaming-cream-cleanser", type: "cleanser", desc: "Akne köpük krem temizleyici. Benzoil peroksit %4." },
  { name: "Diabetics Moisturizing Cream", suffix: "diabetics-moisturizing-cream", type: "cream", desc: "Diyabetik ciltler nemlendirici krem." },
  { name: "Itch Relief Moisturizing Lotion", suffix: "itch-relief-moisturizing-lotion", type: "body_lotion", desc: "Kaşıntı rahatlatıcı losyon. Pramoksin." },
  { name: "Therapeutic Hand Cream", suffix: "therapeutic-hand-cream", type: "hand_cream", desc: "Terapötik el kremi. Çok kuru eller." },
  { name: "Skin Renewing Nightly Exfoliating Treatment", suffix: "renewing-nightly-exfoliating", type: "exfoliant", desc: "Gece eksfolyan tedavi. Glikolik asit + Laktik asit." },
]);

// More The Ordinary
genProducts(3, "The Ordinary", [
  { name: "Niacinamide 5% Face & Body Emulsion", suffix: "niacinamide-5-body-emulsion", type: "body_lotion", desc: "Niacinamide %5 yüz ve vücut emülsiyonu." },
  { name: "Glucoside Foaming Cleanser", suffix: "glucoside-foaming-cleanser", type: "cleanser", desc: "Glukoside bazlı köpük temizleyici." },
  { name: "Retinal 0.2% Emulsion", suffix: "retinal-02-emulsion", type: "serum", desc: "Retinal %0.2 emülsiyon. İleri seviye vitamin A." },
  { name: "Retinal 0.05% Emulsion", suffix: "retinal-005-emulsion", type: "serum", desc: "Retinal %0.05 emülsiyon. Başlangıç retinal." },
  { name: "Multi-Peptide + Copper Peptides 1% Serum", suffix: "multi-peptide-copper-1", type: "serum", desc: "Çoklu peptit + Bakır peptit %1." },
  { name: "Ethylated Ascorbic Acid 15% Solution", suffix: "ethylated-ascorbic-acid-15", type: "serum", desc: "Etil askorbik asit %15. Stabil C vitamini." },
  { name: "Sulphate 4% Cleanser for Body and Hair", suffix: "sulphate-4-body-hair-cleanser", type: "cleanser", desc: "Sülfat %4 vücut ve saç temizleyici." },
  { name: "Azelaic Acid 10% Suspension Brightening Gel", suffix: "azelaic-10-brightening-gel", type: "serum", desc: "Azelaik asit %10 jel. Kızarıklık ve ton." },
]);

// More Bioderma
genProducts(4, "Bioderma", [
  { name: "Sebium Hydra Moisturising Cream", suffix: "sebium-hydra-moisturising", type: "cream", desc: "Akne tedavisi sonrası nemlendirici. Kurumuş ciltler." },
  { name: "Sebium Foaming Gel", suffix: "sebium-foaming-gel", type: "cleanser", desc: "Akneye eğilimli ciltler temizleme jeli." },
  { name: "Sensibio AR BB Cream SPF30", suffix: "sensibio-ar-bb-cream", type: "sunscreen", desc: "Kızarıklık kamuflajlı BB krem SPF30." },
  { name: "Photoderm Bronz Dry Oil SPF30", suffix: "photoderm-bronz-dry-oil", type: "sunscreen", desc: "Bronzlaştırıcı kuru yağ SPF30." },
  { name: "Cicabio Arnica+", suffix: "cicabio-arnica-plus", type: "balm", desc: "Arnika onarıcı krem. Morluk ve çürük." },
  { name: "Atoderm Hands & Nails Cream", suffix: "atoderm-hands-nails", type: "hand_cream", desc: "El ve tırnak bakım kremi." },
]);

// More Vichy
genProducts(9, "Vichy", [
  { name: "Slow Age SPF25 Fluid", suffix: "slow-age-spf25-fluid", type: "day_cream", desc: "Yaşlanma yavaşlatıcı sıvı SPF25." },
  { name: "LiftActiv Collagen Specialist", suffix: "liftactiv-collagen-specialist", type: "cream", desc: "Kollajen uzmanı krem. Peptit + C vitamini." },
  { name: "Purete Thermale Fresh Cleansing Gel", suffix: "purete-thermale-fresh-gel", type: "cleanser", desc: "Ferahlatıcı temizleme jeli." },
  { name: "Normaderm Probio-BHA Serum", suffix: "normaderm-probio-bha", type: "serum", desc: "Probiyotik BHA akne serumu." },
  { name: "Mineral 89 Fortifying Recovery Mask", suffix: "mineral-89-recovery-mask", type: "mask", desc: "HA güçlendirici maske." },
]);

// More COSRX
genProducts(13, "COSRX", [
  { name: "Ultimate Nourishing Rice Overnight Spa Mask", suffix: "rice-overnight-spa-mask", type: "mask", desc: "Pirinç gece maskesi. Aydınlatıcı + nemlendirici." },
  { name: "Aloe Vera Oil-Free Soothing Gel", suffix: "aloe-vera-soothing-gel", type: "moisturizer", desc: "Aloe vera yatıştırıcı jel. Yağsız." },
  { name: "Hyaluronic Acid Hydra Power Essence", suffix: "ha-hydra-power-essence", type: "essence", desc: "HA güç esansı. 3 tip hyaluronic acid." },
  { name: "Low pH Good Morning Gel Cleanser 150ml", suffix: "low-ph-cleanser-150ml", type: "cleanser", desc: "Düşük pH sabah jel temizleyici. Büyük boy." },
  { name: "Advanced Snail Radiance Dual Essence", suffix: "snail-radiance-dual-essence", type: "essence", desc: "Çift fazlı salyangoz parlaklık esansı." },
]);

// More Korean brands
genProducts(29, "Laneige", [
  { name: "Cica Sleeping Mask", suffix: "cica-sleeping-mask", type: "mask", desc: "Cica gece maskesi. Centella yatıştırıcı." },
  { name: "Essential Power Skin Toner", suffix: "essential-power-skin-toner", type: "toner", desc: "Güç toneri. Bariyer takviyesi." },
  { name: "Perfect Renew 3EX Cream", suffix: "perfect-renew-3ex-cream", type: "cream", desc: "Peptit anti-aging krem." },
  { name: "Water Bank Moisture Essence", suffix: "water-bank-moisture-essence", type: "essence", desc: "Nem esansı. Mavi HA." },
  { name: "Glowy Makeup Serum", suffix: "glowy-makeup-serum", type: "serum", desc: "Parlaklık makyaj serumu. Primer." },
]);

genProducts(30, "Dr. Jart+", [
  { name: "Peptidin Radiance Serum", suffix: "peptidin-radiance-serum", type: "serum", desc: "Peptit parlaklık serumu." },
  { name: "Cicapair Calming Gel Cream", suffix: "cicapair-calming-gel-cream", type: "moisturizer", desc: "Cica yatıştırıcı jel krem." },
  { name: "Ceramidin Oil Balm", suffix: "ceramidin-oil-balm", type: "balm", desc: "Ceramide yağ balsam. Kuru bölgeler." },
  { name: "Pore Remedy PHA Exfoliating Serum", suffix: "pore-remedy-pha-serum", type: "exfoliant", desc: "PHA gözenek peeling serumu." },
  { name: "Ceramidin Gel Cream", suffix: "ceramidin-gel-cream", type: "moisturizer", desc: "Ceramide jel krem. Karma ciltler." },
]);

// More Torriden
genProducts(32, "Torriden", [
  { name: "DIVE-IN Mild Sunscreen SPF50+", suffix: "dive-in-mild-sunscreen", type: "sunscreen", desc: "Nazik güneş kremi. HA + Ceramide." },
  { name: "DIVE-IN Skin Booster", suffix: "dive-in-skin-booster", type: "toner", desc: "HA cilt güçlendirici tonik." },
  { name: "Balanceful Toner Pad", suffix: "balanceful-toner-pad", type: "exfoliant", desc: "Dengeleyici tonik pad." },
  { name: "DIVE-IN Multi Pad", suffix: "dive-in-multi-pad", type: "exfoliant", desc: "Çok fonksiyonlu HA pad." },
]);

// More Round Lab
genProducts(33, "Round Lab", [
  { name: "Birch Juice Moisturizing Cream", suffix: "birch-juice-moisturizing-cream", type: "cream", desc: "Huş ağacı suyu nemlendirici krem." },
  { name: "Soybean Nourishing Toner", suffix: "soybean-nourishing-toner", type: "toner", desc: "Soya fasulyesi besleyici tonik." },
  { name: "Dokdo Cleansing Oil", suffix: "dokdo-cleansing-oil", type: "oil_cleanser", desc: "Dokdo temizleme yağı." },
  { name: "Mugwort Calming Cream", suffix: "mugwort-calming-cream", type: "cream", desc: "Yavşan otu yatıştırıcı krem." },
]);

// More Anua
genProducts(36, "Anua", [
  { name: "Heartleaf Quercetinol Pore Deep Cleansing Foam", suffix: "heartleaf-deep-cleansing-foam", type: "cleanser", desc: "Heartleaf derin gözenek temizleyici." },
  { name: "Dark Spot Correcting Serum", suffix: "anua-dark-spot-serum", type: "serum", desc: "Leke düzeltici serum. Traneksamik asit." },
  { name: "Heartleaf 70% Daily Lotion", suffix: "heartleaf-70-daily-lotion", type: "moisturizer", desc: "Heartleaf günlük losyon." },
  { name: "BHA 2% Gentle Exfoliating Toner", suffix: "bha-2-gentle-toner", type: "toner", desc: "BHA %2 nazik peeling toneri." },
]);

// More Skin1004
genProducts(35, "Skin1004", [
  { name: "Madagascar Centella Air-Fit Suncream SPF50+", suffix: "centella-air-fit-suncream", type: "sunscreen", desc: "Centella hafif güneş kremi." },
  { name: "Madagascar Centella Poremizing Clear Ampoule", suffix: "centella-poremizing-ampoule", type: "ampoule", desc: "Gözenek küçültücü centella ampul." },
  { name: "Centella Watergel Cream", suffix: "centella-watergel-cream", type: "moisturizer", desc: "Centella su jel krem." },
  { name: "Madagascar Centella Cleansing Oil", suffix: "centella-cleansing-oil", type: "oil_cleanser", desc: "Centella temizleme yağı." },
]);

// More Numbuzin
genProducts(38, "Numbuzin", [
  { name: "No.3 Super Glowing Essence Toner", suffix: "no3-super-glowing-toner", type: "toner", desc: "Galactomyces parlaklık toneri." },
  { name: "No.4 Collagen 73 Eye Cream", suffix: "no4-collagen-eye-cream", type: "eye_cream", desc: "Kollajen göz kremi." },
  { name: "No.6 Deep Sleep Mask", suffix: "no6-deep-sleep-mask", type: "mask", desc: "Derin uyku maskesi. Probiyotik." },
  { name: "No.7 Mild Sun Essence SPF50+", suffix: "no7-mild-sun-essence", type: "sunscreen", desc: "Nazik güneş esansı." },
]);

// More Premium brands
genProducts(49, "Kiehl's", [
  { name: "Rare Earth Deep Pore Cleansing Masque", suffix: "rare-earth-pore-masque", type: "mask", desc: "Amazon beyaz kili gözenek maskesi." },
  { name: "Powerful-Strength Vitamin C Serum", suffix: "powerful-strength-vitamin-c", type: "serum", desc: "Güçlü C vitamini %12.5 serum." },
  { name: "Ultra Facial Overnight Hydrating Mask", suffix: "ultra-facial-overnight-mask", type: "mask", desc: "Gece HA nemlendirme maskesi." },
  { name: "Age Defender Moisturizer SPF30", suffix: "age-defender-moisturizer", type: "day_cream", desc: "Erkekler anti-aging nemlendirici SPF30." },
  { name: "Lip Balm #1", suffix: "lip-balm-1", type: "lip_care", desc: "Klasik dudak balmı. Squalane + Aloe." },
]);

genProducts(50, "Clinique", [
  { name: "Moisture Surge Overnight Mask", suffix: "moisture-surge-overnight-mask", type: "mask", desc: "Gece nem maskesi. 72 saat nemlendirme." },
  { name: "Dramatically Different Moisturizing Gel", suffix: "dramatically-different-gel", type: "moisturizer", desc: "Jel nemlendirici. Yağsız formül." },
  { name: "Fresh Pressed Vitamin C Booster", suffix: "fresh-pressed-vitamin-c", type: "serum", desc: "Taze sıkılmış C vitamini %10." },
  { name: "Pep-Start Eye Cream", suffix: "pep-start-eye-cream", type: "eye_cream", desc: "Peptit başlangıç göz kremi." },
  { name: "Anti-Blemish Solutions Cleansing Gel", suffix: "anti-blemish-cleansing-gel", type: "cleanser", desc: "Akne temizleme jeli. Salisilik asit." },
]);

genProducts(52, "Shiseido", [
  { name: "WASO Quick Gentle Cleanser", suffix: "waso-quick-gentle-cleanser", type: "cleanser", desc: "Nazik hızlı temizleyici. Tofu filtresi." },
  { name: "Essential Energy Eye Definer", suffix: "essential-energy-eye-definer", type: "eye_cream", desc: "Göz çevresi tanımlayıcı. ReNeura." },
  { name: "Men Total Revitalizer Cream", suffix: "men-total-revitalizer", type: "cream", desc: "Erkekler toplam canlandırıcı krem." },
  { name: "Synchro Skin Self-Refreshing SPF30", suffix: "synchro-skin-spf30", type: "sunscreen", desc: "Kendi kendini yenileyen SPF30 bakım." },
]);

genProducts(54, "Dermalogica", [
  { name: "Precleanse", suffix: "precleanse-dermalogica", type: "oil_cleanser", desc: "Ön temizleme yağı. Çift temizleme." },
  { name: "Active Moist Moisturizer", suffix: "active-moist", type: "moisturizer", desc: "Aktif nemlendirici. Yağsız formül." },
  { name: "Overnight Repair Serum", suffix: "overnight-repair-serum", type: "serum", desc: "Gece onarım serumu. Retinol + Peptit." },
  { name: "Calm Water Gel", suffix: "calm-water-gel", type: "moisturizer", desc: "Yatıştırıcı su jel. Hassas ciltler." },
]);

// More drugstore brands
genProducts(61, "Aveeno", [
  { name: "Oat Gel Moisturizer with Niacinamide", suffix: "oat-gel-niacinamide", type: "moisturizer", desc: "Yulaf + Niacinamide jel nemlendirici." },
  { name: "Daily Moisturizing Body Yogurt", suffix: "daily-body-yogurt", type: "body_cream", desc: "Günlük vücut yoğurdu. Yulaf + prebiyotik." },
  { name: "Calm + Restore Redness Relief Moisturizing Cream", suffix: "calm-restore-redness-cream", type: "cream", desc: "Kızarıklık yatıştırıcı krem." },
  { name: "Protect + Hydrate Face Sunscreen SPF50", suffix: "protect-hydrate-face-spf50", type: "sunscreen", desc: "Koruma + nemlendirme güneş kremi." },
]);

genProducts(62, "Simple", [
  { name: "Kind To Skin Cleansing Oil", suffix: "kind-cleansing-oil", type: "oil_cleanser", desc: "Nazik temizleme yağı." },
  { name: "Water Boost Hydrating Gel Cream", suffix: "water-boost-hydrating-gel", type: "moisturizer", desc: "Su takviyesi jel krem." },
  { name: "Booster Serum 10% Niacinamide", suffix: "booster-serum-niacinamide", type: "serum", desc: "Niacinamide %10 booster serum." },
  { name: "Kind To Skin Eye Makeup Remover", suffix: "kind-eye-makeup-remover", type: "micellar", desc: "Göz makyajı temizleyici." },
]);

genProducts(63, "Sebamed", [
  { name: "Anti-Dry Hydrating Body Lotion", suffix: "anti-dry-hydrating-body-lotion", type: "body_lotion", desc: "Kuruluğa karşı vücut losyonu." },
  { name: "Clear Face Cleansing Foam pH 5.5", suffix: "clear-face-foam-ph55", type: "cleanser", desc: "pH 5.5 temizleme köpüğü." },
  { name: "Lip Defense SPF30", suffix: "lip-defense-spf30", type: "lip_care", desc: "Dudak koruyucu SPF30." },
  { name: "Sensitive Skin Expert Sun Spray SPF30", suffix: "sensitive-sun-spray-spf30", type: "sunscreen", desc: "Hassas cilt güneş spreyi." },
]);

// More French niche
genProducts(67, "Caudalie", [
  { name: "Vinoperfect Dark Spot Correcting Glycolic Night Cream", suffix: "vinoperfect-glycolic-night", type: "night_cream", desc: "Glikolik asit leke gece kremi." },
  { name: "Vinosource-Hydra SOS Deep Hydration Cream", suffix: "vinosource-sos-deep-cream", type: "cream", desc: "SOS derin nemlendirme kremi." },
  { name: "Instant Detox Mask", suffix: "instant-detox-mask-caudalie", type: "mask", desc: "Anında detoks maskesi. Pembe kil." },
  { name: "Grape Water Moisturizing Face Mist", suffix: "grape-water-face-mist", type: "mist", desc: "Üzüm suyu nemlendirici mist." },
]);

genProducts(69, "Filorga", [
  { name: "NCEF-Shot Supreme Polyrevitalising Concentrate", suffix: "ncef-shot-supreme", type: "serum", desc: "10 günlük yoğun kür. NCEF konsantre." },
  { name: "Sleep & Peel Night Cream", suffix: "sleep-peel-night-cream", type: "night_cream", desc: "Gece peeling krem. AHA + enzimler." },
  { name: "UV-Defence Sun Care SPF50+", suffix: "uv-defence-sun-care", type: "sunscreen", desc: "Anti-aging güneş bakımı." },
  { name: "Meso-Mask Smoothing Radiance Mask", suffix: "meso-mask-smoothing", type: "mask", desc: "Pürüzsüzleştirici parlaklık maskesi." },
]);

// More from remaining brands
genProducts(55, "Murad", [
  { name: "Vita-C Glycolic Brightening Serum", suffix: "vita-c-glycolic-brightening", type: "serum", desc: "C vitamini + Glikolik asit aydınlatıcı." },
  { name: "Renewing Eye Cream", suffix: "renewing-eye-cream-murad", type: "eye_cream", desc: "Yenileyici göz kremi. Retinol." },
  { name: "Clarifying Body Spray", suffix: "clarifying-body-spray", type: "mist", desc: "Vücut akne spreyi. Salisilik asit." },
  { name: "Oil and Pore Control Mattifier SPF45", suffix: "oil-pore-control-spf45", type: "sunscreen", desc: "Yağ kontrol mattifier. SPF45." },
]);

genProducts(56, "Sunday Riley", [
  { name: "Saturn Sulfur Acne Treatment Mask", suffix: "saturn-sulfur-acne-mask", type: "mask", desc: "Kükürt akne maskesi." },
  { name: "Juno Antioxidant + Superfood Face Oil", suffix: "juno-antioxidant-face-oil", type: "oil", desc: "Süper gıda antioksidan yüz yağı." },
  { name: "Tidal Brightening Enzyme Water Cream", suffix: "tidal-brightening-water-cream", type: "cream", desc: "Enzim su krem. Aydınlatıcı." },
]);

genProducts(59, "Glow Recipe", [
  { name: "Watermelon Glow Hyaluronic Clay Pore-Tight Facial", suffix: "watermelon-hyaluronic-clay", type: "mask", desc: "Karpuz HA kil maskesi. Gözenek sıkılaştırıcı." },
  { name: "Banana Soufflé Moisture Cream", suffix: "banana-souffle-cream", type: "cream", desc: "Muz sufle nemlendirici krem. Magnezyum." },
  { name: "Guava Vitamin C Dark Spot Serum", suffix: "guava-vitamin-c-dark-spot", type: "serum", desc: "Guava C vitamini leke serumu." },
]);

genProducts(60, "Farmacy", [
  { name: "Honeymoon Glow AHA Resurfacing Night Serum", suffix: "honeymoon-glow-aha-serum", type: "exfoliant", desc: "AHA gece peeling serumu. Bal + Çiçek asitleri." },
  { name: "Very Cherry Bright 15% Clean Vitamin C Serum", suffix: "very-cherry-bright-vitamin-c", type: "serum", desc: "Kiraz C vitamini %15 serum." },
  { name: "Filling Good Hyaluronic Acid Plumping Serum", suffix: "filling-good-ha-serum", type: "serum", desc: "HA dolgunlaştırıcı serum." },
]);

genProducts(65, "Weleda", [
  { name: "Evening Primrose Age Revitalising Body Oil", suffix: "evening-primrose-body-oil", type: "oil", desc: "Çuha çiçeği canlandırıcı vücut yağı." },
  { name: "Calendula Baby Face Cream", suffix: "calendula-baby-face-cream", type: "cream", desc: "Calendula bebek yüz kremi." },
  { name: "Iris Hydrating Facial Lotion", suffix: "iris-hydrating-facial-lotion", type: "moisturizer", desc: "Süsen nemlendirici losyon. Karma ciltler." },
]);

// Extra from Kiehl's, Clinique
genProducts(49, "Kiehl's", [
  { name: "Amino Acid Shampoo", suffix: "amino-acid-shampoo", type: "cleanser", desc: "Amino asit şampuan. Nazik temizlik." },
  { name: "Super Multi-Corrective Cream", suffix: "super-multi-corrective-cream", type: "cream", desc: "Çoklu düzeltici krem. Jasmonic asit." },
  { name: "Pure Vitality Skin Renewing Cream", suffix: "pure-vitality-renewing-cream", type: "cream", desc: "Manuka balı canlandırıcı krem." },
  { name: "Buttermask for Lips", suffix: "buttermask-for-lips", type: "lip_care", desc: "Dudak yağ maskesi. Hindistan cevizi + Mango." },
]);

genProducts(50, "Clinique", [
  { name: "Moisture Surge Lip Hydro-Plump Treatment", suffix: "moisture-surge-lip-plump", type: "lip_care", desc: "Dudak dolgunlaştırıcı. HA." },
  { name: "Even Better Clinical Serum Foundation SPF20", suffix: "even-better-serum-foundation", type: "day_cream", desc: "Serum fondöten. Leke düzeltici SPF20." },
  { name: "Superdefense City Block SPF50 Face Protector", suffix: "superdefense-city-block-spf50", type: "sunscreen", desc: "Şehir koruyucu SPF50." },
  { name: "Rinse-Off Foaming Cleanser", suffix: "rinse-off-foaming-cleanser", type: "cleanser", desc: "Durulanan köpük temizleyici." },
]);

// More products from Paula's Choice
genProducts(21, "Paula's Choice", [
  { name: "RESIST Daily Pore-Refining Treatment 2% BHA", suffix: "resist-daily-pore-refining", type: "serum", desc: "Gözenek rafine edici %2 BHA." },
  { name: "Clinical Niacinamide 20% Treatment", suffix: "clinical-niacinamide-20", type: "serum", desc: "Klinik niacinamide %20." },
  { name: "DEFENSE Antioxidant Pore Purifier with Retinol", suffix: "defense-antioxidant-retinol", type: "serum", desc: "Antioksidan + Retinol gözenek arındırıcı." },
  { name: "Skin Balancing Pore-Reducing Toner", suffix: "skin-balancing-pore-toner", type: "toner", desc: "Denge tonik. Gözenek küçültücü." },
  { name: "RESIST Smoothing Primer SPF30", suffix: "resist-smoothing-primer-spf30", type: "sunscreen", desc: "Pürüzsüzleştirici primer SPF30." },
]);

// More Neutrogena
genProducts(8, "Neutrogena", [
  { name: "Hydro Boost Hyaluronic Acid Serum", suffix: "hydro-boost-ha-serum", type: "serum", desc: "HA konsantre serum." },
  { name: "Rapid Wrinkle Repair Retinol Pro+", suffix: "rapid-wrinkle-repair-retinol", type: "serum", desc: "Retinol Pro+ kırışıklık serumu." },
  { name: "Clear & Soothe Micellar Jelly Makeup Remover", suffix: "clear-soothe-micellar-jelly", type: "micellar", desc: "Micellar jöle temizleyici." },
  { name: "Cellular Boost Eye Rejuvenating Cream", suffix: "cellular-boost-eye-cream", type: "eye_cream", desc: "Hücresel boost göz kremi." },
  { name: "Deep Moisture Body Lotion", suffix: "deep-moisture-body-lotion", type: "body_lotion", desc: "Derin nem vücut losyonu." },
]);

// More Some By Mi
genProducts(19, "Some By Mi", [
  { name: "AHA BHA PHA 30 Days Miracle Toner 150ml", suffix: "aha-bha-pha-miracle-toner-150", type: "toner", desc: "30 gün mucize tonik. Büyük boy." },
  { name: "Cica Peptide Anti Hair Loss Shampoo", suffix: "cica-peptide-anti-hair-loss", type: "cleanser", desc: "Saç dökülmesi karşıtı şampuan." },
  { name: "Super Matcha Pore Tightening Serum", suffix: "super-matcha-pore-tightening", type: "serum", desc: "Matcha gözenek sıkılaştırıcı serum." },
  { name: "Bye Bye Blackhead 30 Days Miracle Green Tea Tox Bubble Cleanser", suffix: "bye-bye-blackhead-bubble", type: "cleanser", desc: "Siyah nokta temizleyici köpük." },
  { name: "Truecica Mineral Calming Tone Up Suncream SPF50+", suffix: "truecica-tone-up-sun", type: "sunscreen", desc: "Cica renkli güneş kremi." },
]);

// More Garnier, Nivea
genProducts(26, "Garnier", [
  { name: "SkinActive Serum Cream SPF30 with Vitamin C", suffix: "skinactive-serum-cream-spf30", type: "day_cream", desc: "Serum krem SPF30. C vitamini." },
  { name: "Bio Organic Argan Nourishing Moisturizer", suffix: "bio-argan-nourishing", type: "cream", desc: "Organik argan besleyici krem." },
  { name: "PureActive Sensitive Anti-Blemish Cleansing Gel", suffix: "pureactive-sensitive-gel", type: "cleanser", desc: "Hassas akne temizleme jeli." },
  { name: "SkinActive Hyaluronic Acid Replumping Serum", suffix: "skinactive-ha-replumping-serum", type: "serum", desc: "HA dolgunlaştırıcı serum." },
  { name: "Ambre Solaire Kids Sensitive SPF50+", suffix: "ambre-solaire-kids-spf50", type: "sunscreen", desc: "Çocuk hassas güneş kremi." },
]);

genProducts(27, "Nivea", [
  { name: "Derma Skin Clear Scrub", suffix: "derma-skin-clear-scrub", type: "exfoliant", desc: "Cilt berraklaştırıcı peeling. Salisilik asit." },
  { name: "Q10 Energy Recharging Night Cream", suffix: "q10-energy-recharging-night", type: "night_cream", desc: "Q10 enerji şarj gece kremi." },
  { name: "Urban Skin Detox Gel Moisturizer", suffix: "urban-skin-detox-gel", type: "moisturizer", desc: "Şehir detoks jel nemlendirici." },
  { name: "Derma Skin Clear Night Exfoliator", suffix: "derma-skin-clear-night-exfoliator", type: "exfoliant", desc: "Gece eksfolyan. Niacinamide." },
  { name: "MEN Protect & Care Face Moisturiser SPF15", suffix: "men-protect-care-spf15", type: "day_cream", desc: "Erkekler nemlendirici SPF15." },
]);

// More Innisfree, Missha, Klairs, Purito, BOJ, Hada Labo
genProducts(28, "Innisfree", [
  { name: "Green Tea Seed Eye Cream", suffix: "green-tea-seed-eye-cream-inn", type: "eye_cream", desc: "Yeşil çay tohumu göz kremi." },
  { name: "Super Volcanic Pore Clay Mask 2X", suffix: "super-volcanic-pore-2x", type: "mask", desc: "Süper volkanik kil maskesi. 2X güçlü." },
  { name: "Cherry Blossom Jelly Cream", suffix: "cherry-blossom-jelly-cream", type: "cream", desc: "Kiraz çiçeği jöle krem. Aydınlatıcı." },
  { name: "Intensive Hydrating Cream with Green Tea Seed", suffix: "intensive-hydrating-green-tea", type: "cream", desc: "Yoğun yeşil çay nemlendirici." },
]);

genProducts(25, "Missha", [
  { name: "Artemisia Calming Moisture Cream", suffix: "artemisia-calming-moisture", type: "cream", desc: "Artemisia yatıştırıcı krem." },
  { name: "All Around Safe Block Aqua Sun Gel SPF50+", suffix: "safe-block-aqua-sun-gel", type: "sunscreen", desc: "Aqua güneş jeli." },
  { name: "Time Revolution Red Algae Revitalizing Cream", suffix: "red-algae-revitalizing-cream", type: "cream", desc: "Kırmızı alg canlandırıcı krem." },
  { name: "Vita C Plus Brightening Toner", suffix: "vita-c-plus-brightening-toner", type: "toner", desc: "C vitamini aydınlatıcı tonik." },
]);

genProducts(17, "Klairs", [
  { name: "Midnight Blue Youth Activating Drop", suffix: "midnight-blue-youth-drop", type: "serum", desc: "Guaiazulene gençlik damlası." },
  { name: "Fundamental Nourishing Eye Butter", suffix: "fundamental-eye-butter", type: "eye_cream", desc: "Besleyici göz yağı. Shea + Ceramide." },
  { name: "All-Day Airy Sunscreen SPF50+", suffix: "all-day-airy-sunscreen", type: "sunscreen", desc: "Tüm gün hafif güneş kremi." },
]);

genProducts(24, "Beauty of Joseon", [
  { name: "Ginseng Moist Sun Serum SPF50+", suffix: "boj-ginseng-moist-sun-serum", type: "sunscreen", desc: "Ginseng nemlendirici güneş serumu." },
  { name: "Light On Serum: Centella + Vita C", suffix: "boj-light-on-serum-centella", type: "serum", desc: "Centella + C vitamini aydınlatıcı serum." },
  { name: "Red Bean Refreshing Pore Mask", suffix: "boj-red-bean-pore-mask", type: "mask", desc: "Kırmızı fasulye gözenek maskesi." },
  { name: "Glow Deep Serum: Rice + Alpha-Arbutin 60ml", suffix: "boj-glow-deep-serum-60ml", type: "serum", desc: "Pirinç + Arbutin serum. Büyük boy." },
]);

genProducts(16, "Hada Labo", [
  { name: "Gokujyun Premium Hyaluronic Acid Cream", suffix: "gokujyun-premium-cream", type: "cream", desc: "Premium HA krem. 7 tip HA." },
  { name: "Shirojyun Premium Brightening Essence", suffix: "shirojyun-premium-essence", type: "essence", desc: "Traneksamik asit aydınlatıcı esans." },
  { name: "Gokujyun Oil Cleansing", suffix: "gokujyun-oil-cleansing", type: "oil_cleanser", desc: "HA temizleme yağı. Hafif doku." },
]);

// More Etude House, Heimish
genProducts(31, "Etude House", [
  { name: "SoonJung Lip Balm", suffix: "soonjung-lip-balm", type: "lip_care", desc: "Hassas dudak balmı." },
  { name: "SoonJung Sleeping Pack", suffix: "soonjung-sleeping-pack", type: "mask", desc: "Hassas cilt gece paketi." },
  { name: "SoonJung Toner Pad", suffix: "soonjung-toner-pad", type: "exfoliant", desc: "Yatıştırıcı tonik pad." },
]);

genProducts(39, "Heimish", [
  { name: "All Clean White Clay Foam", suffix: "all-clean-white-clay-foam", type: "cleanser", desc: "Beyaz kil köpük temizleyici." },
  { name: "Artless Glow Base SPF50+", suffix: "artless-glow-base-spf50", type: "sunscreen", desc: "Parlaklık bazı SPF50+." },
  { name: "Watermelon Soothing Gel Cream", suffix: "watermelon-soothing-gel", type: "moisturizer", desc: "Karpuz yatıştırıcı jel krem." },
]);

// More Neogen, Holika Holika
genProducts(42, "Neogen", [
  { name: "Real Vitamin C Serum", suffix: "real-vitamin-c-serum-neogen", type: "serum", desc: "Gerçek C vitamini serum. %22." },
  { name: "Probiotics Youth Repair Cream", suffix: "probiotics-youth-repair-cream", type: "cream", desc: "Probiyotik gençlik krem." },
  { name: "Canadian Clay Pore Cleanser", suffix: "canadian-clay-pore-cleanser", type: "cleanser", desc: "Kanada kili gözenek temizleyici." },
]);

genProducts(43, "Holika Holika", [
  { name: "Smooth Egg Skin Peeling Gel", suffix: "smooth-egg-peeling-gel", type: "exfoliant", desc: "Yumurta peeling jeli." },
  { name: "Good Cera Hand Cream", suffix: "good-cera-hand-cream", type: "hand_cream", desc: "Ceramide el kremi." },
  { name: "Prime Youth Black Snail Repair Cream", suffix: "black-snail-repair-cream", type: "cream", desc: "Siyah salyangoz onarım kremi." },
]);

// More Japanese brands
genProducts(47, "Biore", [
  { name: "UV Perfect Protect Milk SPF50+", suffix: "uv-perfect-protect-milk", type: "sunscreen", desc: "Güçlü koruma güneş sütü." },
  { name: "Cleansing Oil Cotton Facial Sheets", suffix: "cleansing-oil-cotton-sheets", type: "micellar", desc: "Yağlı temizleme mendilleri." },
  { name: "UV Kids Pure Milk SPF50", suffix: "uv-kids-pure-milk", type: "sunscreen", desc: "Çocuk güneş sütü. Nazik formül." },
]);

genProducts(44, "Senka", [
  { name: "Perfect Aqua Rich Extra Moist Facial Cream", suffix: "perfect-aqua-rich-cream", type: "cream", desc: "Aqua zengin nemlendirici krem." },
  { name: "All Clear Micellar Water", suffix: "all-clear-micellar-water", type: "micellar", desc: "Micellar temizleme suyu." },
  { name: "White Beauty Serum in CC", suffix: "white-beauty-cc-serum", type: "serum", desc: "CC aydınlatıcı serum. Renk düzeltici." },
]);

genProducts(45, "Melano CC", [
  { name: "Anti-Spot Whitening Face Wash", suffix: "anti-spot-whitening-wash", type: "cleanser", desc: "Leke karşıtı temizleyici. C vitamini." },
  { name: "Anti-Spot Moisture Cream", suffix: "anti-spot-moisture-cream", type: "cream", desc: "C vitamini leke nemlendirici krem." },
  { name: "Anti-Spot White Mist", suffix: "anti-spot-white-mist", type: "mist", desc: "C vitamini aydınlatıcı mist." },
]);

// More Noreva, ACM, Lierac
genProducts(71, "Noreva", [
  { name: "Exfoliac NC Gel", suffix: "exfoliac-nc-gel", type: "moisturizer", desc: "Akne bakım jeli. NC kompleks." },
  { name: "Sensidiane AR Intensive Cream", suffix: "sensidiane-ar-cream", type: "cream", desc: "Kızarıklık yoğun bakım kremi." },
  { name: "Noveane Premium Multi-Corrective Day Cream", suffix: "noveane-premium-day-cream", type: "day_cream", desc: "Çoklu düzeltici gündüz kremi." },
]);

genProducts(72, "ACM", [
  { name: "Novophane Ultra-Nourishing Shampoo", suffix: "novophane-ultra-shampoo", type: "cleanser", desc: "Ultra besleyici şampuan." },
  { name: "Trigopax Protective Soothing Skincare", suffix: "trigopax-protective-soothing", type: "balm", desc: "Koruyucu yatıştırıcı bakım. Kıvrım bölgeleri." },
  { name: "Sebionex Hydra Repair Cream", suffix: "sebionex-hydra-repair", type: "cream", desc: "Akne sonrası onarım kremi." },
]);

genProducts(70, "Lierac", [
  { name: "Premium The Supreme Mask", suffix: "premium-supreme-mask", type: "mask", desc: "Lüks anti-aging maske." },
  { name: "Hydragenist Moisturizing Cream-Gel", suffix: "hydragenist-cream-gel", type: "moisturizer", desc: "Oksijenlendirici jel krem." },
]);

// Altruist, Geek & Gorgeous extras
genProducts(73, "Altruist", [
  { name: "Invisible Fluid SPF50", suffix: "invisible-fluid-spf50", type: "sunscreen", desc: "Görünmez sıvı güneş koruyucu." },
  { name: "Dry Touch Sunscreen SPF50", suffix: "dry-touch-sunscreen-spf50", type: "sunscreen", desc: "Kuru dokunuş güneş kremi." },
]);

genProducts(74, "Geek & Gorgeous", [
  { name: "Jelly Joker 6% Mandelic + 1% Salicylic", suffix: "jelly-joker-mandelic-salicylic", type: "exfoliant", desc: "Jöle eksfolyan. Mandelik + Salisilik." },
  { name: "101 Liquid Gold 5% Glycolic Toner", suffix: "101-liquid-gold-glycolic", type: "toner", desc: "Glikolik asit %5 tonik. Altın eksfoliasyon." },
  { name: "Calm Down 100% Niacinamide Powder", suffix: "calm-down-niacinamide-powder", type: "serum", desc: "Saf niacinamide tozu. Özel karıştırma." },
]);

genProducts(75, "Peter Thomas Roth", [
  { name: "Instant FIRMx Temporary Face Tightener", suffix: "instant-firmx-face-tightener", type: "cream", desc: "Anında sıkılaştırıcı. Geçici etki." },
  { name: "Potent-C Moisturizer", suffix: "potent-c-moisturizer", type: "cream", desc: "C vitamini nemlendirici krem." },
  { name: "Pumpkin Enzyme Mask", suffix: "pumpkin-enzyme-mask", type: "mask", desc: "Balkabağı enzim maskesi. Parlak cilt." },
]);

// Fill the rest with cross-brand extended product lines
genProducts(22, "Drunk Elephant", [
  { name: "Beste No. 9 Jelly Cleanser", suffix: "beste-no9-jelly-cleanser", type: "cleanser", desc: "Jöle temizleyici. pH 6.1." },
  { name: "Lala Retro Whipped Cream", suffix: "lala-retro-whipped-cream", type: "cream", desc: "Çırpılmış retro krem. 6 yağ karışımı." },
  { name: "C-Firma Fresh Vitamin C Day Serum", suffix: "c-firma-fresh-vitamin-c", type: "serum", desc: "Taze C vitamini %15. Günlük serum." },
  { name: "F-Balm Electrolyte Waterfacial", suffix: "f-balm-electrolyte-mask", type: "mask", desc: "Elektrolit su maskesi. Gece." },
  { name: "A-Passioni Retinol Cream", suffix: "a-passioni-retinol-cream", type: "night_cream", desc: "Retinol %1 gece kremi. Vegan." },
  { name: "Umbra Sheer Physical Daily Defense SPF30", suffix: "umbra-sheer-physical-spf30", type: "sunscreen", desc: "Fiziksel güneş koruyucu SPF30." },
]);

genProducts(23, "Isntree", [
  { name: "Cica Relief Cream", suffix: "cica-relief-cream", type: "cream", desc: "Cica rahatlatma kremi." },
  { name: "Onion Newpair Sunscreen SPF40", suffix: "onion-newpair-sunscreen", type: "sunscreen", desc: "Soğan güneş kremi. İz + koruma." },
  { name: "Sensitive Balancing Moisture Cream", suffix: "sensitive-balancing-moisture", type: "cream", desc: "Hassas denge nemlendirici." },
  { name: "Yam Root Vitalizing Cream", suffix: "yam-root-vitalizing-cream", type: "cream", desc: "Yam kökü canlandırıcı krem." },
]);

genProducts(18, "Purito", [
  { name: "Oat-In Calming Gel Cream", suffix: "oat-in-calming-gel-cream", type: "moisturizer", desc: "Yulaf yatıştırıcı jel krem." },
  { name: "Dermide Cica Barrier Sleeping Pack", suffix: "dermide-cica-sleeping-pack", type: "mask", desc: "Cica bariyer gece paketi." },
  { name: "B5 Panthenol Re-Barrier Cream", suffix: "b5-panthenol-re-barrier", type: "cream", desc: "B5 panthenol bariyer kremi." },
]);

// More Uriage, Ducray, SVR extras
genProducts(14, "Uriage", [
  { name: "Hyseac Bi-Stick", suffix: "hyseac-bi-stick", type: "balm", desc: "Çift etkili akne stick." },
  { name: "Roseliane Anti-Redness Cream SPF30", suffix: "roseliane-anti-redness-spf30", type: "day_cream", desc: "Kızarıklık karşıtı SPF30." },
  { name: "Eau Thermale Night Mask", suffix: "eau-thermale-night-mask", type: "mask", desc: "Termal su gece maskesi." },
  { name: "Isodense Firming Eye Contour Care", suffix: "isodense-firming-eye", type: "eye_cream", desc: "Sıkılaştırıcı göz çevresi bakımı." },
]);

genProducts(15, "Ducray", [
  { name: "Keracnyl Serum", suffix: "keracnyl-serum", type: "serum", desc: "Akne serumu. Glikolik asit." },
  { name: "Melascreen UV Rich Cream SPF50+", suffix: "melascreen-uv-rich-spf50", type: "sunscreen", desc: "Leke karşıtı güneş kremi." },
  { name: "Ictyane Micellar Water", suffix: "ictyane-micellar-water", type: "micellar", desc: "Kuru ciltler micellar su." },
]);

genProducts(6, "SVR", [
  { name: "Sebiaclear Micro-Peel", suffix: "sebiaclear-micro-peel", type: "exfoliant", desc: "Mikro peeling. Glukonolakton + Salisilik." },
  { name: "Ampoule Lift Firming Ampoule", suffix: "ampoule-lift-firming", type: "ampoule", desc: "Sıkılaştırıcı ampul. Kollajen." },
  { name: "Sun Secure Easy Stick SPF50+", suffix: "sun-secure-easy-stick", type: "sun_stick", desc: "Kolay güneş stick. SPF50+." },
]);

genProducts(5, "Avene", [
  { name: "Eau Thermale Lip Balm", suffix: "eau-thermale-lip-balm", type: "lip_care", desc: "Termal su dudak balmı." },
  { name: "PhysioLift Smoothing Night Balm", suffix: "physiolift-smoothing-night", type: "night_cream", desc: "Pürüzsüzleştirici gece balmı. Retinaldehit." },
  { name: "Cleanance Micellar Water", suffix: "cleanance-micellar-water-av", type: "micellar", desc: "Akne micellar su." },
  { name: "Tolerance Control Soothing Skin Recovery Balm", suffix: "tolerance-control-recovery-balm", type: "balm", desc: "Kontrollü tolerans onarım balmı." },
]);

// Embryolisse extras
genProducts(68, "Embryolisse", [
  { name: "Hydra-Cream with Orange Extract", suffix: "hydra-cream-orange", type: "cream", desc: "Portakal özlü nemlendirici." },
  { name: "Anti-Age Eye Care", suffix: "anti-age-eye-care", type: "eye_cream", desc: "Anti-aging göz bakımı." },
  { name: "Compresse Eye Mask", suffix: "compresse-eye-mask", type: "mask", desc: "Göz kompres maskesi." },
]);

// Tatcha, Fresh extras
genProducts(57, "Tatcha", [
  { name: "The Essence Plumping Skin Softener", suffix: "essence-plumping-skin-softener", type: "essence", desc: "Dolgunlaştırıcı cilt yumuşatıcı." },
  { name: "Indigo Soothing Recovery Cream", suffix: "indigo-soothing-recovery", type: "cream", desc: "İndigo yatıştırıcı onarım kremi." },
]);

genProducts(58, "Fresh", [
  { name: "Vitamin Nectar Moisture Glow Face Cream", suffix: "vitamin-nectar-glow-cream", type: "cream", desc: "Vitamin nektar parlaklık kremi." },
  { name: "Sugar Lip Treatment SPF15", suffix: "sugar-lip-treatment-spf15", type: "lip_care", desc: "Şeker dudak bakımı SPF15." },
  { name: "Black Tea Kombucha Facial Treatment Essence", suffix: "black-tea-kombucha-essence", type: "essence", desc: "Kombuça yüz bakım esansı." },
]);

// SK-II extras
genProducts(53, "SK-II", [
  { name: "Facial Treatment Clear Lotion", suffix: "facial-treatment-clear-lotion", type: "toner", desc: "Arındırıcı losyon. AHA + Pitera." },
  { name: "Facial Treatment Mask", suffix: "facial-treatment-mask", type: "mask", desc: "Pitera yüz maskesi. Yoğun bakım." },
]);

// Medicube extras
genProducts(37, "Medicube", [
  { name: "Triple Cica Ampoule", suffix: "triple-cica-ampoule", type: "ampoule", desc: "Üçlü cica ampulü." },
  { name: "Pore Tightening Serum", suffix: "pore-tightening-serum-mc", type: "serum", desc: "Gözenek sıkılaştırıcı serum." },
  { name: "Zero Sebum Peeling Toner", suffix: "zero-sebum-peeling-toner", type: "toner", desc: "Sıfır sebum peeling toneri." },
]);

// ========================
// GENERATE SQL
// ========================

const OUTDIR = __dirname;
let productId = 101;
const products = [];
const productIngredients = [];
const affiliateLinks = [];
const productLabels = [];
const productImages = [];

// Platforms for affiliate
const PLATFORMS = ['trendyol', 'hepsiburada', 'dermoeczanem', 'gratis'];
const PRICE_RANGES = {
  cleanser: [99, 499], micellar: [79, 299], oil_cleanser: [149, 599], toner: [99, 599],
  essence: [199, 899], serum: [149, 1999], ampoule: [199, 1499], moisturizer: [89, 999],
  cream: [99, 1999], night_cream: [149, 1299], day_cream: [149, 999], sunscreen: [119, 699],
  sun_stick: [149, 499], eye_cream: [149, 999], lip_care: [49, 299], body_lotion: [79, 399],
  body_cream: [99, 499], hand_cream: [49, 249], exfoliant: [129, 899], mask: [99, 699],
  mist: [99, 399], balm: [99, 599], oil: [149, 999],
};

// Usage instructions by type
const USAGE = {
  cleanser: 'Islak yüze masaj yaparak uygulayın. Köpürtün ve ılık su ile durulayın. Sabah ve akşam.',
  micellar: 'Pamuğa bol miktarda uygulayın. Yüz ve göz bölgesini nazikçe silin. Durulama gerektirmez.',
  oil_cleanser: 'Kuru yüze 2-3 pompa uygulayın. Dairesel masaj yapın. Islak elle emülsifiye edin, durulayın.',
  toner: 'Temizleme sonrası pamukla veya avuç içiyle yüze uygulayın. Sabah ve akşam.',
  essence: 'Tonik sonrası birkaç damla avuç içine alın, yüze hafifçe bastırarak uygulayın.',
  serum: 'Temizleme ve tonik sonrası birkaç damla yüze uygulayın. Nemlendirici öncesi.',
  ampoule: 'Tonik sonrası 2-3 damla yüze uygulayın. Kür olarak veya sürekli kullanılabilir.',
  moisturizer: 'Serum sonrası yüze ve boyuna uygulayın. Sabah ve akşam.',
  cream: 'Temizleme ve serum sonrası yüze uygulayın. İnce tabaka yeterlidir.',
  night_cream: 'Akşam temizleme ve serum sonrası yüze uygulayın. Gece boyunca çalışır.',
  day_cream: 'Sabah temizleme sonrası yüze uygulayın. Güneş koruyucu öncesi veya yerine.',
  sunscreen: 'Güneşe çıkmadan 15 dakika önce bol miktarda uygulayın. 2 saatte bir yenileyin.',
  sun_stick: 'Güneş koruyucu üzerine veya tek başına uygulayın. Tazeleme için ideal.',
  eye_cream: 'Sabah ve akşam göz çevresine yüzük parmağıyla hafifçe vurarak uygulayın.',
  lip_care: 'Dudaklara ihtiyaç duyulduğunda uygulayın. Gece yoğun bakım olarak kalın tabaka.',
  body_lotion: 'Banyo sonrası nemli cilde uygulayın. Günde 1-2 kez.',
  body_cream: 'Kuru bölgelere günde 1-2 kez uygulayın. Masaj yaparak yedirin.',
  hand_cream: 'El yıkama sonrası veya ihtiyaç duyulduğunda uygulayın.',
  exfoliant: 'Akşam temizleme sonrası uygulayın. Haftada 2-3 kez başlayın. Güneş koruyucu kullanın.',
  mask: 'Temiz cilde uygulayın. 10-20 dakika bekletin. Ilık su ile durulayın.',
  mist: 'Yüze 20-30 cm mesafeden püskürtün. Makyaj üzerine de kullanılabilir.',
  balm: 'Temiz cilde ince tabaka halinde uygulayın. Tahriş olmuş bölgelerde kullanılabilir.',
  oil: 'Akşam bakım rutininin son adımı olarak 2-3 damla yüze uygulayın.',
};

const WARNINGS = {
  cleanser: 'Göz temasından kaçının. Tahriş olursa kullanımı durdurun.',
  micellar: 'Göz hassasiyeti devam ederse kullanmayı bırakın.',
  oil_cleanser: 'Göz temasından kaçının. Yalnızca harici kullanım.',
  toner: 'Yalnızca harici kullanım. Açık yaralara uygulamayın.',
  essence: 'Hassas ciltlerde patch test yapın.',
  serum: 'Hassas ciltlerde az miktarla başlayın. Göz çevresinden kaçının.',
  ampoule: 'Hassas ciltlerde patch test önerilir. Açık yaralara uygulamayın.',
  moisturizer: 'Yalnızca harici kullanım. Tahriş olursa durdurun.',
  cream: 'Yalnızca harici kullanım.',
  night_cream: 'Yalnızca harici kullanım. Göz çevresine dikkat edin.',
  day_cream: 'Göz çevresine uygulamayın. SPF içerse de şapka kullanın.',
  sunscreen: 'Güneş koruyucu tek başına tam koruma sağlamaz. Gölge ve koruyucu giysi kullanın.',
  sun_stick: 'Göz çevresine dikkat edin. Tek başına tam koruma sağlamaz.',
  eye_cream: 'Göze doğrudan temas ettirmeyin.',
  lip_care: 'Yalnızca harici kullanım. Yutmayın.',
  body_lotion: 'Yalnızca harici kullanım. Açık yaralara uygulamayın.',
  body_cream: 'Yalnızca harici kullanım.',
  hand_cream: 'Yalnızca harici kullanım.',
  exfoliant: 'Güneş hassasiyeti artırır — güneş koruyucu kullanın. Retinol ile dikkatli kombine edin.',
  mask: 'Tahriş hissederseniz hemen durulayın. Açık yaralara uygulamayın.',
  mist: 'Gözlere püskürtmeyin.',
  balm: 'Derin ve enfekte yaralarda kullanmayın.',
  oil: 'Hassas ciltlerde patch test yapın. Göz çevresinden kaçının.',
};

const PAO = { cleanser: '12M', micellar: '12M', oil_cleanser: '12M', toner: '12M', essence: '12M', serum: '6M',
  ampoule: '6M', moisturizer: '12M', cream: '12M', night_cream: '12M', day_cream: '12M', sunscreen: '12M',
  sun_stick: '12M', eye_cream: '6M', lip_care: '12M', body_lotion: '12M', body_cream: '12M', hand_cream: '12M',
  exfoliant: '6M', mask: '12M', mist: '12M', balm: '12M', oil: '6M' };

const BRAND_COUNTRIES = {};
ALL_BRANDS.forEach(b => { BRAND_COUNTRIES[b.id] = b.name; });
NEW_BRANDS.forEach(b => { BRAND_COUNTRIES[b.id] = b.country; });
// Add existing brand countries
const EXISTING_COUNTRIES = {
  1: 'Fransa', 2: 'ABD', 3: 'Kanada', 4: 'Fransa', 5: 'Fransa', 6: 'Fransa',
  7: 'Almanya', 8: 'ABD', 9: 'Fransa', 10: 'Fransa', 13: 'Güney Kore',
  14: 'Fransa', 15: 'Fransa', 16: 'Japonya', 17: 'Güney Kore',
  18: 'Güney Kore', 19: 'Güney Kore', 20: 'Kanada', 21: 'ABD',
  22: 'ABD', 23: 'Güney Kore', 24: 'Güney Kore', 25: 'Güney Kore',
  26: 'Fransa', 27: 'Almanya', 28: 'Güney Kore'
};
Object.assign(BRAND_COUNTRIES, EXISTING_COUNTRIES);

const BRAND_MANUFACTURER = {};
ALL_BRANDS.forEach(b => {
  BRAND_MANUFACTURER[b.id] = `${b.name}, ${BRAND_COUNTRIES[b.id] || 'N/A'}`;
});

// Build products array
const templates = BRAND_PRODUCT_TEMPLATES; // Use all generated products

for (const tpl of templates) {
  const typeInfo = PRODUCT_TYPES[tpl.type];
  if (!typeInfo) continue;

  const ml = pick(typeInfo.ml);
  const unit = typeInfo.label.includes('stick') ? 'g' : 'ml';

  products.push({
    id: productId,
    brandId: tpl.brandId,
    catId: typeInfo.cat,
    name: tpl.name,
    slug: tpl.slug,
    typeLabel: typeInfo.label,
    desc: tpl.desc,
    ml, unit,
    area: typeInfo.area,
    time: typeInfo.time,
    type: tpl.type,
  });

  // Ingredients
  const ingProfiles = TYPE_INGREDIENTS[tpl.type] || TYPE_INGREDIENTS.moisturizer;
  const profile = pick(ingProfiles);
  const bands = ['active', 'high', 'medium', 'low', 'trace'];
  for (let i = 0; i < profile.length; i++) {
    productIngredients.push({
      productId,
      ingredientId: profile[i],
      displayName: ING_DISPLAY[profile[i]] || `Ingredient ${profile[i]}`,
      rank: i + 1,
      band: i === 0 ? pick(['active', 'high']) : bands[Math.min(i, 4)],
    });
  }

  // Affiliate links (2-3 per product)
  const numLinks = randBetween(2, 3);
  const platforms = pickN(PLATFORMS, numLinks);
  const priceRange = PRICE_RANGES[tpl.type] || [99, 499];
  const basePrice = parseFloat(randPrice(priceRange[0], priceRange[1]));
  for (const platform of platforms) {
    const priceVar = basePrice + randBetween(-20, 30);
    affiliateLinks.push({
      productId,
      platform,
      url: `https://www.${platform}.com/${tpl.slug}-p-${200000 + productId}`,
      price: Math.max(priceVar, priceRange[0]).toFixed(2),
    });
  }

  // Product label
  const claims = [];
  if (tpl.desc.includes('Niacinamide') || tpl.desc.includes('niacinamide')) claims.push('Niacinamide içerir');
  if (tpl.desc.includes('HA') || tpl.desc.includes('Hyaluronic') || tpl.desc.includes('hyaluronic')) claims.push('Hyaluronic Acid');
  if (tpl.desc.includes('Retinol') || tpl.desc.includes('retinol') || tpl.desc.includes('Retinal')) claims.push('Retinoid içerir');
  if (tpl.desc.includes('C vitamini') || tpl.desc.includes('Vitamin C') || tpl.desc.includes('Ascorbic')) claims.push('C Vitamini');
  if (tpl.desc.includes('SPF') || tpl.desc.includes('güneş')) claims.push('Güneş koruması');
  if (tpl.desc.includes('Ceramide') || tpl.desc.includes('ceramide') || tpl.desc.includes('Bariyer') || tpl.desc.includes('bariyer')) claims.push('Bariyer desteği');
  if (tpl.desc.includes('Centella') || tpl.desc.includes('Cica') || tpl.desc.includes('cica')) claims.push('Centella / Cica');
  if (tpl.desc.includes('Peptit') || tpl.desc.includes('peptit') || tpl.desc.includes('Peptide')) claims.push('Peptit kompleksi');
  if (tpl.desc.includes('anti-aging') || tpl.desc.includes('Anti-aging') || tpl.desc.includes('kırışıklık')) claims.push('Anti-aging bakım');
  if (tpl.desc.includes('Akne') || tpl.desc.includes('akne') || tpl.desc.includes('sivilce')) claims.push('Akne bakım');
  if (tpl.desc.includes('Leke') || tpl.desc.includes('leke') || tpl.desc.includes('Aydınlatıcı') || tpl.desc.includes('aydınlatıcı')) claims.push('Leke karşıtı');
  if (tpl.desc.includes('Nemlendirici') || tpl.desc.includes('nemlendirici') || tpl.desc.includes('Nem') || tpl.desc.includes('nem')) claims.push('Yoğun nemlendirme');
  if (claims.length < 3) claims.push('Dermatolojik test edilmiş');
  if (claims.length < 3) claims.push('Tüm cilt tipleri için');

  productLabels.push({
    productId,
    usage: USAGE[tpl.type] || USAGE.moisturizer,
    warning: WARNINGS[tpl.type] || WARNINGS.moisturizer,
    claims: JSON.stringify(claims.slice(0, 5)),
    pao: PAO[tpl.type] || '12M',
    origin: BRAND_COUNTRIES[tpl.brandId] || 'N/A',
    manufacturer: BRAND_MANUFACTURER[tpl.brandId] || tpl.name,
  });

  // Product image
  const colors = ['f0f5ff', 'e8f5e9', 'fff3e0', 'fce4ec', 'e0f7fa', 'f3e5f5', 'e3f2fd', 'fff8e1', 'e8eaf6', 'fff5e0'];
  const color = pick(colors);
  const shortName = tpl.name.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 20).trim().replace(/ /g, '+');
  productImages.push({
    productId,
    url: `https://placehold.co/600x600/${color}/1a1a2e?text=${shortName}`,
    alt: tpl.name,
  });

  productId++;
}

console.log(`Generated ${products.length} products (IDs 101-${100 + products.length})`);

// ========================
// WRITE SQL FILES
// ========================

// 1. Brands
let sql = `-- ============================================\n-- BATCH 4: New Brands (29-75)\n-- ============================================\n`;
sql += `INSERT INTO brands (brand_id, brand_name, brand_slug, country_of_origin, is_active) VALUES\n`;
sql += NEW_BRANDS.map((b, i) => `(${b.id}, '${esc(b.name)}', '${b.slug}', '${b.country}', true)${i < NEW_BRANDS.length - 1 ? ',' : ';'}`).join('\n');
sql += `\n\nSELECT setval('brands_brand_id_seq', 75);\n`;
fs.writeFileSync(path.join(OUTDIR, 'brands-batch4.sql'), sql);
console.log('Written: brands-batch4.sql');

// 2. Ingredients
sql = `-- ============================================\n-- BATCH 4: New Ingredients (53-80)\n-- ============================================\n`;
sql += `INSERT INTO ingredients (ingredient_id, inci_name, ingredient_slug, common_name, is_active) VALUES\n`;
sql += NEW_INGREDIENTS.map((ing, i) => `(${ing.id}, '${esc(ing.inci)}', '${ing.slug}', '${esc(ing.common)}', true)${i < NEW_INGREDIENTS.length - 1 ? ',' : ';'}`).join('\n');
sql += `\n\nSELECT setval('ingredients_ingredient_id_seq', 80);\n`;
fs.writeFileSync(path.join(OUTDIR, 'ingredients-batch4.sql'), sql);
console.log('Written: ingredients-batch4.sql');

// 3. Products — split into multiple files for manageability
const CHUNK = 300;
for (let c = 0; c < products.length; c += CHUNK) {
  const chunk = products.slice(c, c + CHUNK);
  const fileNum = Math.floor(c / CHUNK) + 1;
  sql = `-- ============================================\n-- BATCH 4 Part ${fileNum}: Products ${chunk[0].id}-${chunk[chunk.length - 1].id}\n-- ============================================\n`;
  sql += `INSERT INTO products (product_id, brand_id, category_id, domain_type, product_name, product_slug, product_type_label, short_description, net_content_value, net_content_unit, target_area, usage_time_hint, status) VALUES\n`;
  sql += chunk.map((p, i) => `(${p.id}, ${p.brandId}, ${p.catId}, 'cosmetic', '${esc(p.name)}', '${p.slug}', '${p.typeLabel}', '${esc(p.desc)}', '${p.ml}.00', '${p.unit}', '${p.area}', '${p.time}', 'published')${i < chunk.length - 1 ? ',' : ';'}`).join('\n');
  if (fileNum === Math.ceil(products.length / CHUNK)) {
    sql += `\n\nSELECT setval('products_product_id_seq', ${100 + products.length});\n`;
  }
  fs.writeFileSync(path.join(OUTDIR, `products-batch4-part${fileNum}.sql`), sql);
  console.log(`Written: products-batch4-part${fileNum}.sql (${chunk.length} products)`);
}

// 4. Product images
sql = `-- ============================================\n-- BATCH 4: Product Images (101-${100 + products.length})\n-- ============================================\n`;
sql += `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text) VALUES\n`;
sql += productImages.map((img, i) => `(${img.productId}, '${esc(img.url)}', 'product', 1, '${esc(img.alt)}')${i < productImages.length - 1 ? ',' : ';'}`).join('\n');
fs.writeFileSync(path.join(OUTDIR, 'product-images-batch4.sql'), sql);
console.log(`Written: product-images-batch4.sql (${productImages.length} images)`);

// 5. Product ingredients — split
for (let c = 0; c < productIngredients.length; c += 1500) {
  const chunk = productIngredients.slice(c, c + 1500);
  const fileNum = Math.floor(c / 1500) + 1;
  sql = `-- ============================================\n-- BATCH 4 Part ${fileNum}: Product Ingredients\n-- ============================================\n`;
  sql += `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band) VALUES\n`;
  sql += chunk.map((pi, i) => `(${pi.productId}, ${pi.ingredientId}, '${esc(pi.displayName)}', ${pi.rank}, '${pi.band}')${i < chunk.length - 1 ? ',' : ';'}`).join('\n');
  fs.writeFileSync(path.join(OUTDIR, `product-ingredients-batch4-part${fileNum}.sql`), sql);
  console.log(`Written: product-ingredients-batch4-part${fileNum}.sql (${chunk.length} rows)`);
}

// 6. Affiliate links — split
for (let c = 0; c < affiliateLinks.length; c += 1000) {
  const chunk = affiliateLinks.slice(c, c + 1000);
  const fileNum = Math.floor(c / 1000) + 1;
  sql = `-- ============================================\n-- BATCH 4 Part ${fileNum}: Affiliate Links\n-- ============================================\n`;
  sql += `INSERT INTO affiliate_links (product_id, platform, affiliate_url, price_snapshot, price_updated_at, is_active) VALUES\n`;
  sql += chunk.map((al, i) => `(${al.productId}, '${al.platform}', '${al.url}', ${al.price}, NOW(), true)${i < chunk.length - 1 ? ',' : ';'}`).join('\n');
  fs.writeFileSync(path.join(OUTDIR, `affiliate-links-batch4-part${fileNum}.sql`), sql);
  console.log(`Written: affiliate-links-batch4-part${fileNum}.sql (${chunk.length} links)`);
}

// 7. Product labels — split
for (let c = 0; c < productLabels.length; c += 300) {
  const chunk = productLabels.slice(c, c + 300);
  const fileNum = Math.floor(c / 300) + 1;
  sql = `-- ============================================\n-- BATCH 4 Part ${fileNum}: Product Labels\n-- ============================================\n`;
  sql += `INSERT INTO product_labels (product_id, usage_instructions, warning_text, claim_texts_json, pao_info, origin_info, manufacturer_info) VALUES\n`;
  sql += chunk.map((pl, i) => {
    return `(${pl.productId},\n '${esc(pl.usage)}',\n '${esc(pl.warning)}',\n '${esc(pl.claims)}',\n '${pl.pao}', '${esc(pl.origin)}', '${esc(pl.manufacturer)}')${i < chunk.length - 1 ? ',' : ';'}`;
  }).join('\n\n');
  fs.writeFileSync(path.join(OUTDIR, `product-labels-batch4-part${fileNum}.sql`), sql);
  console.log(`Written: product-labels-batch4-part${fileNum}.sql (${chunk.length} labels)`);
}

// 8. Evidence links for new ingredients (53-80)
sql = `-- ============================================\n-- BATCH 4: Evidence Links for Ingredients 53-80\n-- ============================================\n`;
sql += `INSERT INTO ingredient_evidence_links (ingredient_id, source_url, source_title, source_type, publication_year, summary_note) VALUES\n`;
const evidenceLinks = [
  [53, 'https://pubmed.ncbi.nlm.nih.gov/15666839/', 'Polyhydroxy acids in dermatology: clinical applications', 'review', 2004, 'PHA\'lar AHA\'lara kıyasla daha az tahriş edici olup antioksidan ve nemlendirici ek etkiler gösterir.'],
  [54, 'https://pubmed.ncbi.nlm.nih.gov/20113345/', 'Gluconolactone: gentle exfoliation with moisturizing properties', 'peer_reviewed', 2010, 'Glukonolakton nazik eksfoliasyon sağlarken cildi nemlendirir. Hassas ciltlerde bile güvenle kullanılabilir.'],
  [55, 'https://pubmed.ncbi.nlm.nih.gov/22428137/', 'Astaxanthin: a potent antioxidant for skin photoprotection', 'review', 2012, 'Astaksantin C vitamini ve E vitamininden güçlü antioksidan etkiye sahiptir. UV hasarına karşı korur.'],
  [56, 'https://pubmed.ncbi.nlm.nih.gov/30393753/', 'Artemisia (Mugwort) extract: anti-inflammatory effects in atopic dermatitis', 'clinical_trial', 2018, 'Yavşan otu özütü atopik dermatit belirtilerini hafifletir ve anti-inflamatuar etki gösterir.'],
  [57, 'https://pubmed.ncbi.nlm.nih.gov/26923689/', 'Galactomyces ferment filtrate: skin brightening and barrier strengthening', 'peer_reviewed', 2016, 'Galactomyces fermenti cilt aydınlatma, bariyer güçlendirme ve nem artırma etkileri gösterir.'],
  [58, 'https://pubmed.ncbi.nlm.nih.gov/27180098/', 'Birch sap: antioxidant and moisturizing properties for skin care', 'peer_reviewed', 2016, 'Huş ağacı suyu doğal mineraller ve antioksidanlar içerir. Nemlendirici ve yatıştırıcı etki gösterir.'],
  [59, 'https://pubmed.ncbi.nlm.nih.gov/32001899/', 'Houttuynia cordata: anti-inflammatory and antibacterial effects in dermatology', 'review', 2020, 'Heartleaf (Houttuynia cordata) güçlü anti-inflamatuar ve antimikrobiyal özelliklere sahiptir. Akne ve hassas ciltlerde etkili.'],
  [60, 'https://pubmed.ncbi.nlm.nih.gov/25430280/', 'Rosehip oil: composition and dermatological applications', 'review', 2014, 'Kuşburnu yağı zengin yağ asidi ve retinoid içeriği ile iz ve leke azaltma, nemlendirme ve anti-aging etki gösterir.'],
  [61, 'https://pubmed.ncbi.nlm.nih.gov/26151005/', 'Tamanu oil: wound healing and anti-inflammatory properties', 'peer_reviewed', 2015, 'Tamanu yağı calophyllolide sayesinde anti-inflamatuar ve yara iyileştirici etki gösterir.'],
  [62, 'https://pubmed.ncbi.nlm.nih.gov/10849138/', 'Centella asiatica: comprehensive review of wound healing properties', 'review', 2000, 'Centella asiatica madecassoside, asiaticoside ve asiatic acid ile kollajen sentezini artırır ve yara iyileştirmesini hızlandırır.'],
  [63, 'https://pubmed.ncbi.nlm.nih.gov/16640547/', 'Grape seed proanthocyanidins: antioxidant and anti-aging effects', 'peer_reviewed', 2006, 'Üzüm çekirdeği proantosiyanidinleri güçlü antioksidan etki gösterir ve kollajen çapraz bağlanmasını destekler.'],
  [64, 'https://pubmed.ncbi.nlm.nih.gov/25341995/', 'Sea buckthorn oil: dermatological benefits and clinical evidence', 'review', 2014, 'Yaban mersini yağı omega-7 yağ asidi, karotenoid ve C vitamini zenginliği ile cilt onarımı ve anti-aging etki sağlar.'],
  [67, 'https://pubmed.ncbi.nlm.nih.gov/30073640/', 'Licorice root extract (Glabridin): depigmenting and anti-inflammatory', 'review', 2018, 'Meyan kökü özütü glabridin aktifi ile tirozinaz inhibisyonu yaparak aydınlatıcı etki gösterir. Anti-inflamatuar.'],
  [68, 'https://pubmed.ncbi.nlm.nih.gov/20665567/', 'Kojic acid: mechanism and efficacy in treating hyperpigmentation', 'clinical_trial', 2010, 'Kojik asit melanin üretimini baskılayarak hiperpigmentasyonu azaltır. Güvenli ve etkili depigmentasyon ajanı.'],
  [69, 'https://pubmed.ncbi.nlm.nih.gov/25266053/', 'Resveratrol: anti-aging and photoprotective effects on skin', 'review', 2014, 'Resveratrol SIRT1 aktivasyonu ile anti-aging etki gösterir. UV hasarından korur ve kollajen sentezini artırır.'],
  [70, 'https://pubmed.ncbi.nlm.nih.gov/22421643/', 'Colloidal oatmeal: clinical evidence for atopic dermatitis treatment', 'clinical_trial', 2012, 'Kolloidal yulaf atopik dermatit belirtilerini hafifletir. Anti-inflamatuar avenanthramide içerir.'],
  [71, 'https://pubmed.ncbi.nlm.nih.gov/25149527/', 'Hemp seed oil: composition and skin benefits', 'peer_reviewed', 2014, 'Kenevir tohumu yağı omega-3 ve omega-6 oranı ile cilt bariyerini güçlendirir. Anti-inflamatuar etki gösterir.'],
  [72, 'https://pubmed.ncbi.nlm.nih.gov/28508895/', 'Probiotic skincare: modulating the skin microbiome', 'review', 2017, 'Probiyotik bazlı cilt bakımı mikrobiyom dengesini düzenler, inflamasyonu azaltır ve bariyer fonksiyonunu iyileştirir.'],
  [73, 'https://pubmed.ncbi.nlm.nih.gov/24740693/', 'Saccharomyces ferment: skin brightening and anti-aging effects', 'peer_reviewed', 2014, 'Maya fermenti (Pitera) cilt aydınlatma, nemlendirme ve anti-aging etkileri gösterir. SK-II\'nin temel aktifi.'],
  [74, 'https://pubmed.ncbi.nlm.nih.gov/27213821/', 'Curcumin in dermatology: anti-inflammatory and wound healing', 'review', 2016, 'Zerdeçal (kurkumin) anti-inflamatuar, antioksidan ve antimikrobiyal özelliklere sahiptir. Akne ve yaşlanma karşıtı etki.'],
  [75, 'https://pubmed.ncbi.nlm.nih.gov/21382647/', 'Willow bark extract: a natural source of salicylic acid', 'peer_reviewed', 2011, 'Söğüt kabuğu özütü doğal salisilik asit kaynağıdır. Sentetik BHA\'ya kıyasla daha nazik eksfoliasyon sağlar.'],
  [76, 'https://pubmed.ncbi.nlm.nih.gov/17147561/', 'Amino acids in skin care: moisturizing and barrier function', 'review', 2007, 'Amino asitler doğal nem faktörlerinin temel bileşenidir. Cilt bariyerini güçlendirir ve nemlendirme sağlar.'],
  [77, 'https://pubmed.ncbi.nlm.nih.gov/19243551/', 'Ceramides in skin barrier function and repair', 'review', 2009, 'Ceramide AP dahil tüm ceramide türleri cilt bariyerinin temel lipid bileşenidir. Eksikliği atopik dermatite yol açar.'],
  [78, 'https://pubmed.ncbi.nlm.nih.gov/12553851/', 'Cholesterol in stratum corneum: role in barrier homeostasis', 'peer_reviewed', 2003, 'Kolesterol stratum korneumdaki lipid matriks bileşenidir. Ceramide ile birlikte bariyer bütünlüğünü korur.'],
  [79, 'https://pubmed.ncbi.nlm.nih.gov/15304189/', 'Phytosphingosine: antimicrobial and anti-inflammatory skin lipid', 'peer_reviewed', 2004, 'Fitosfingozin doğal bir cilt lipididir. Antimikrobiyal etki gösterir ve ceramide sentezini destekler.'],
  [80, 'https://pubmed.ncbi.nlm.nih.gov/16029675/', 'EGF in wound healing and skin rejuvenation', 'clinical_trial', 2005, 'EGF hücre çoğalmasını uyararak yara iyileşmesini hızlandırır ve cilt yenilenme sürecini destekler.'],
];
sql += evidenceLinks.map((e, i) => `(${e[0]}, '${e[1]}', '${esc(e[2])}', '${e[3]}', ${e[4]},\n '${esc(e[5])}')${i < evidenceLinks.length - 1 ? ',' : ';'}`).join('\n');
fs.writeFileSync(path.join(OUTDIR, 'evidence-links-batch4.sql'), sql);
console.log(`Written: evidence-links-batch4.sql (${evidenceLinks.length} links)`);

// 9. Need mappings for new ingredients
sql = `-- ============================================\n-- BATCH 4: Ingredient-Need Mappings for Ingredients 53-80\n-- ============================================\n`;
const needMappings = [
  // PHA (53) — hassas cilt peeling
  [53, 6, 65, 'positive'], [53, 7, 60, 'positive'], [53, 10, 55, 'positive'],
  // Gluconolactone (54)
  [54, 6, 60, 'positive'], [54, 10, 55, 'positive'], [54, 11, 50, 'positive'],
  // Astaxanthin (55)
  [55, 12, 90, 'positive'], [55, 3, 65, 'positive'],
  // Mugwort (56)
  [56, 11, 80, 'positive'], [56, 5, 60, 'positive'],
  // Galactomyces (57)
  [57, 7, 75, 'positive'], [57, 10, 65, 'positive'], [57, 3, 55, 'positive'],
  // Birch Juice (58)
  [58, 10, 70, 'positive'], [58, 4, 60, 'positive'],
  // Heartleaf (59)
  [59, 11, 85, 'positive'], [59, 1, 55, 'positive'], [59, 5, 60, 'positive'],
  // Rosehip Oil (60)
  [60, 2, 65, 'positive'], [60, 3, 60, 'positive'], [60, 10, 55, 'positive'],
  // Tamanu Oil (61)
  [61, 5, 70, 'positive'], [61, 1, 50, 'positive'],
  // Cica Complex (62)
  [62, 5, 85, 'positive'], [62, 11, 80, 'positive'],
  // Grape Seed (63)
  [63, 12, 80, 'positive'], [63, 3, 55, 'positive'],
  // Sea Buckthorn (64)
  [64, 12, 75, 'positive'], [64, 5, 60, 'positive'],
  // Licorice Root (67)
  [67, 2, 80, 'positive'], [67, 7, 70, 'positive'], [67, 11, 55, 'positive'],
  // Kojic Acid (68)
  [68, 2, 85, 'positive'], [68, 7, 75, 'positive'],
  // Resveratrol (69)
  [69, 3, 80, 'positive'], [69, 12, 85, 'positive'],
  // Colloidal Oatmeal (70)
  [70, 11, 90, 'positive'], [70, 5, 75, 'positive'], [70, 4, 60, 'positive'],
  // Hemp Seed Oil (71)
  [71, 5, 70, 'positive'], [71, 10, 60, 'positive'],
  // Probiotics (72)
  [72, 5, 75, 'positive'], [72, 11, 70, 'positive'],
  // Saccharomyces (73)
  [73, 7, 70, 'positive'], [73, 10, 65, 'positive'],
  // Turmeric (74)
  [74, 12, 70, 'positive'], [74, 1, 55, 'positive'],
  // Willow Bark (75)
  [75, 1, 65, 'positive'], [75, 6, 60, 'positive'],
  // Amino Acids (76)
  [76, 10, 75, 'positive'], [76, 5, 65, 'positive'],
  // Ceramide AP (77)
  [77, 5, 90, 'positive'], [77, 4, 75, 'positive'],
  // Cholesterol (78)
  [78, 5, 80, 'positive'],
  // Phytosphingosine (79)
  [79, 5, 75, 'positive'], [79, 1, 50, 'positive'],
  // EGF (80)
  [80, 3, 75, 'positive'], [80, 5, 60, 'positive'],
];
sql += `INSERT INTO ingredient_need_mappings (ingredient_id, need_id, relevance_score, effect_type) VALUES\n`;
sql += needMappings.map((m, i) => `(${m[0]}, ${m[1]}, ${m[2]}, '${m[3]}')${i < needMappings.length - 1 ? ',' : ';'}`).join('\n');
fs.writeFileSync(path.join(OUTDIR, 'need-mappings-batch4.sql'), sql);
console.log(`Written: need-mappings-batch4.sql (${needMappings.length} mappings)`);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Products: ${products.length}`);
console.log(`Product ingredients: ${productIngredients.length}`);
console.log(`Affiliate links: ${affiliateLinks.length}`);
console.log(`Product labels: ${productLabels.length}`);
console.log(`Product images: ${productImages.length}`);
console.log(`New brands: ${NEW_BRANDS.length}`);
console.log(`New ingredients: ${NEW_INGREDIENTS.length}`);
console.log(`Evidence links: ${evidenceLinks.length}`);
console.log(`Need mappings: ${needMappings.length}`);
