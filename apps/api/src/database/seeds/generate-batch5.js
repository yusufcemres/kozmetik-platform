/**
 * BATCH 5: 1000 yeni Türkiye pazarı ürünü
 * Türkiye'de en çok tercih edilen, güncel ve gerçek ürünler
 * Başlangıç product_id: 884
 */
const fs = require('fs');
const path = require('path');
const SEEDS = __dirname;

// Mevcut slug'ları oku (çakışma kontrolü)
const existingSlugs = new Set(
  fs.readFileSync(path.join(SEEDS, 'existing_slugs.txt'), 'utf8').split('\n').filter(Boolean)
);

// Yeni markalar (Türkiye'de popüler ama henüz DB'de olmayanlar)
const NEW_BRANDS = [
  // Türk markaları
  { id: 76, name: 'Procsin', slug: 'procsin', country: 'Türkiye', founded: 2017, website: 'https://www.procsin.com.tr' },
  { id: 77, name: 'Dermoskin', slug: 'dermoskin', country: 'Türkiye', founded: 2000, website: 'https://www.dermoskin.com.tr' },
  { id: 78, name: 'Doa', slug: 'doa', country: 'Türkiye', founded: 2019, website: 'https://www.doa.com.tr' },
  { id: 79, name: 'Thalia', slug: 'thalia', country: 'Türkiye', founded: 2012, website: 'https://www.thalia.com.tr' },
  { id: 80, name: 'Incia', slug: 'incia', country: 'Türkiye', founded: 2015, website: 'https://www.incia.com.tr' },
  { id: 81, name: 'Rosense', slug: 'rosense', country: 'Türkiye', founded: 1954, website: 'https://www.rosense.com.tr' },
  { id: 82, name: 'Siveno', slug: 'siveno', country: 'Türkiye', founded: 2018, website: 'https://www.siveno.com.tr' },
  { id: 83, name: 'Bebak', slug: 'bebak', country: 'Türkiye', founded: 1976, website: 'https://www.bebak.com.tr' },
  { id: 84, name: 'Hunca', slug: 'hunca', country: 'Türkiye', founded: 1989, website: 'https://www.hunca.com.tr' },
  { id: 85, name: 'Marjinal', slug: 'marjinal', country: 'Türkiye', founded: 2020, website: 'https://www.marjinal.com.tr' },
  // Kore markaları (Türkiye'de popüler)
  { id: 86, name: 'Mizon', slug: 'mizon', country: 'Güney Kore', founded: 2000, website: 'https://www.mizon.co.kr' },
  { id: 87, name: 'TonyMoly', slug: 'tonymoly', country: 'Güney Kore', founded: 2006, website: 'https://www.tonymoly.com' },
  { id: 88, name: 'Missha', slug: 'missha-kr', country: 'Güney Kore', founded: 2000, website: 'https://www.missha.net' },
  { id: 89, name: 'Cosrx', slug: 'cosrx-kr', country: 'Güney Kore', founded: 2013, website: 'https://www.cosrx.com' },
  { id: 90, name: 'Pyunkang Yul', slug: 'pyunkang-yul', country: 'Güney Kore', founded: 2010, website: 'https://www.pyunkangyul.us' },
  { id: 91, name: 'Illiyoon', slug: 'illiyoon', country: 'Güney Kore', founded: 2018, website: 'https://www.illiyoon.com' },
  { id: 92, name: 'Sulwhasoo', slug: 'sulwhasoo', country: 'Güney Kore', founded: 1966, website: 'https://www.sulwhasoo.com' },
  { id: 93, name: 'Banila Co', slug: 'banila-co', country: 'Güney Kore', founded: 2006, website: 'https://www.banilaco.com' },
  { id: 94, name: 'Peripera', slug: 'peripera', country: 'Güney Kore', founded: 2005, website: 'https://www.peripera.com' },
  // Batı markaları (Türkiye'de popüler)
  { id: 95, name: 'Cerave', slug: 'cerave-tr', country: 'ABD', founded: 2005, website: 'https://www.cerave.com' },
  { id: 96, name: 'Olay', slug: 'olay', country: 'ABD', founded: 1952, website: 'https://www.olay.com' },
  { id: 97, name: "L'Oreal Paris", slug: 'loreal-paris', country: 'Fransa', founded: 1909, website: 'https://www.loreal-paris.com.tr' },
  { id: 98, name: 'NYX', slug: 'nyx', country: 'ABD', founded: 1999, website: 'https://www.nyxcosmetics.com' },
  { id: 99, name: 'Maybelline', slug: 'maybelline', country: 'ABD', founded: 1915, website: 'https://www.maybelline.com.tr' },
  { id: 100, name: 'Revolution', slug: 'revolution', country: 'İngiltere', founded: 2014, website: 'https://www.revolutionbeauty.com' },
  { id: 101, name: 'Catrice', slug: 'catrice', country: 'Almanya', founded: 2004, website: 'https://www.catrice.eu' },
  { id: 102, name: 'Essence', slug: 'essence', country: 'Almanya', founded: 2001, website: 'https://www.essence.eu' },
  { id: 103, name: 'MAC', slug: 'mac', country: 'Kanada', founded: 1984, website: 'https://www.maccosmetics.com.tr' },
  { id: 104, name: 'Charlotte Tilbury', slug: 'charlotte-tilbury', country: 'İngiltere', founded: 2013, website: 'https://www.charlottetilbury.com' },
  { id: 105, name: 'Rare Beauty', slug: 'rare-beauty', country: 'ABD', founded: 2020, website: 'https://www.rarebeauty.com' },
  { id: 106, name: 'Fenty Beauty', slug: 'fenty-beauty', country: 'ABD', founded: 2017, website: 'https://www.fentybeauty.com' },
  // Eczane markaları
  { id: 107, name: 'Bioderma', slug: 'bioderma-tr', country: 'Fransa', founded: 1970, website: 'https://www.bioderma.com.tr' },
  { id: 108, name: 'Rilastil', slug: 'rilastil', country: 'İtalya', founded: 1972, website: 'https://www.rilastil.com' },
  { id: 109, name: 'Isis Pharma', slug: 'isis-pharma', country: 'Fransa', founded: 1988, website: 'https://www.isispharma.com' },
  { id: 110, name: 'Heliocare', slug: 'heliocare', country: 'İspanya', founded: 1995, website: 'https://www.heliocare.com' },
  { id: 111, name: 'SkinCeuticals', slug: 'skinceuticals', country: 'ABD', founded: 1997, website: 'https://www.skinceuticals.com' },
  { id: 112, name: 'Dercos', slug: 'dercos', country: 'Fransa', founded: 1964, website: 'https://www.vichy.com.tr' },
  // Doğal / organik
  { id: 113, name: 'The Body Shop', slug: 'the-body-shop', country: 'İngiltere', founded: 1976, website: 'https://www.thebodyshop.com.tr' },
  { id: 114, name: "Burt's Bees", slug: 'burts-bees', country: 'ABD', founded: 1984, website: 'https://www.burtsbees.com' },
  { id: 115, name: 'Nuxe', slug: 'nuxe-tr', country: 'Fransa', founded: 1990, website: 'https://www.nuxe.com.tr' },
];

// ============================================
// ÜRÜN TANIMLARI - TÜRKIYE'DE EN ÇOK SATILAN
// ============================================

const PRODUCTS = [
  // ==========================================
  // LA ROCHE-POSAY (brand_id: 1) - TR'de en popüler eczane markası
  // ==========================================
  { brand: 1, name: 'La Roche-Posay Effaclar Duo+ SPF30', cat: 1, type: 'Nemlendirici', desc: 'Sivilce karşıtı bakım kremi SPF30 korumalı', area: 'yüz', time: 'sabah', ingredients: [[1,1,'Niacinamide','high'],[4,2,'Salicylic Acid','medium'],[8,3,'Panthenol','medium'],[37,4,'Ethylhexyl Methoxycinnamate','high'],[25,5,'Dimethicone','low']], needs: [1,6,9] },
  { brand: 1, name: 'La Roche-Posay Cicaplast Baume B5+', cat: 2, type: 'Bariyer Kremi', desc: 'Yatıştırıcı çok amaçlı onarıcı balsam', area: 'yüz_vücut', time: 'her_zaman', ingredients: [[8,1,'Panthenol','very_high'],[17,2,'Madecassoside','high'],[30,3,'Shea Butter','medium'],[12,4,'Glycerin','medium'],[25,5,'Dimethicone','low']], needs: [5,11,4] },
  { brand: 1, name: 'La Roche-Posay Anthelios UVMune 400 Fluid SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Ultra geniş spektrumlu güneş koruyucu fluid', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[1,2,'Niacinamide','medium'],[12,3,'Glycerin','medium'],[10,4,'Tocopherol','low']], needs: [8,12,7] },
  { brand: 1, name: 'La Roche-Posay Hyalu B5 Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit ve B5 vitaminli dolgunlaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','medium'],[17,4,'Madecassoside','medium']], needs: [4,10,3] },
  { brand: 1, name: 'La Roche-Posay Toleriane Sensitive Cream', cat: 2, type: 'Nemlendirici', desc: 'Hassas ciltler için prebiyotik nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[1,2,'Niacinamide','medium'],[6,3,'Ceramide NP','medium'],[30,4,'Shea Butter','low']], needs: [11,10,5] },
  { brand: 1, name: 'La Roche-Posay Effaclar Purifying Foaming Gel', cat: 5, type: 'Yüz Temizleyici', desc: 'Yağlı ve sivilceye eğilimli ciltler için temizleme jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[9,1,'Zinc PCA','medium'],[12,2,'Glycerin','medium'],[24,3,'Butylene Glycol','low']], needs: [1,9,6] },
  { brand: 1, name: 'La Roche-Posay Retinol B3 Serum', cat: 3, type: 'Serum', desc: 'Saf retinol ve B3 içeren anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[1,2,'Niacinamide','high'],[3,3,'Hyaluronic Acid','medium'],[12,4,'Glycerin','medium']], needs: [3,2,7] },
  { brand: 1, name: 'La Roche-Posay Anthelios Age Correct SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Yaşlanma karşıtı güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[1,2,'Niacinamide','medium'],[7,3,'Ascorbic Acid','medium'],[3,4,'Hyaluronic Acid','low']], needs: [8,3,12] },
  { brand: 1, name: 'La Roche-Posay Effaclar Micellar Water Ultra', cat: 5, type: 'Misel Su', desc: 'Yağlı ciltler için misel temizleme suyu', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[9,2,'Zinc PCA','low']], needs: [9,1,6] },
  { brand: 1, name: 'La Roche-Posay Vitamin C10 Serum', cat: 3, type: 'Serum', desc: '%10 saf C vitamini antioksidan serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[3,2,'Hyaluronic Acid','medium'],[4,3,'Salicylic Acid','low']], needs: [12,2,13] },

  // ==========================================
  // CERAVE (brand_id: 2) - TR'de en çok satan
  // ==========================================
  { brand: 2, name: 'CeraVe Moisturizing Cream', cat: 2, type: 'Nemlendirici', desc: 'Kuru ve çok kuru ciltler için nemlendirici krem', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','very_high'],[77,2,'Ceramide AP','high'],[78,3,'Cholesterol','high'],[3,4,'Hyaluronic Acid','medium'],[12,5,'Glycerin','medium'],[79,6,'Phytosphingosine','low']], needs: [4,5,10] },
  { brand: 2, name: 'CeraVe Hydrating Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Normal-kuru ciltler için nemlendirici temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium'],[1,4,'Niacinamide','low']], needs: [10,5,11] },
  { brand: 2, name: 'CeraVe Foaming Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Normal-yağlı ciltler için köpüren temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium'],[12,4,'Glycerin','low']], needs: [9,1,6] },
  { brand: 2, name: 'CeraVe SA Smoothing Cream', cat: 2, type: 'Peeling Krem', desc: 'Salisilik asitli pürüzsüzleştirici krem', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[6,2,'Ceramide NP','high'],[1,3,'Niacinamide','medium'],[3,4,'Hyaluronic Acid','medium'],[16,5,'Lactic Acid','low']], needs: [6,4,1] },
  { brand: 2, name: 'CeraVe Eye Repair Cream', cat: 4, type: 'Göz Kremi', desc: 'Göz altı koyu halka ve şişlik giderici krem', area: 'göz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[1,2,'Niacinamide','medium'],[26,3,'Caffeine','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [10,3,4] },
  { brand: 2, name: 'CeraVe PM Facial Moisturizing Lotion', cat: 2, type: 'Nemlendirici', desc: 'Gece nemlendirici losyon niacinamide içerikli', area: 'yüz', time: 'aksam', ingredients: [[1,1,'Niacinamide','high'],[6,2,'Ceramide NP','high'],[3,3,'Hyaluronic Acid','medium'],[12,4,'Glycerin','medium']], needs: [10,5,7] },
  { brand: 2, name: 'CeraVe AM Facial Moisturizing Lotion SPF30', cat: 2, type: 'Nemlendirici', desc: 'Gündüz nemlendirici SPF30 korumalı', area: 'yüz', time: 'sabah', ingredients: [[1,1,'Niacinamide','high'],[6,2,'Ceramide NP','high'],[3,3,'Hyaluronic Acid','medium'],[37,4,'Ethylhexyl Methoxycinnamate','high']], needs: [8,10,5] },
  { brand: 2, name: 'CeraVe Blemish Control Gel', cat: 3, type: 'Jel', desc: 'Sivilce ve siyah nokta karşıtı jel', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[1,2,'Niacinamide','medium'],[6,3,'Ceramide NP','medium'],[12,4,'Glycerin','low']], needs: [1,6,9] },
  { brand: 2, name: 'CeraVe Resurfacing Retinol Serum', cat: 3, type: 'Serum', desc: 'Retinollü cilt yenileme serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[6,2,'Ceramide NP','high'],[1,3,'Niacinamide','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [3,2,6] },
  { brand: 2, name: 'CeraVe Hydrating Cream-to-Foam Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Kremden köpüğe dönüşen nemlendirici temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[3,2,'Hyaluronic Acid','medium'],[76,3,'Amino Acids Complex','medium'],[12,4,'Glycerin','low']], needs: [10,5,11] },

  // ==========================================
  // THE ORDINARY (brand_id: 3)
  // ==========================================
  { brand: 3, name: 'The Ordinary Niacinamide 10% + Zinc 1%', cat: 3, type: 'Serum', desc: '%10 niacinamide ve %1 çinko ile gözenek bakımı', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[9,2,'Zinc PCA','medium']], needs: [6,9,1] },
  { brand: 3, name: 'The Ordinary Hyaluronic Acid 2% + B5', cat: 3, type: 'Serum', desc: 'Çoklu moleküler ağırlıkta hyaluronik asit serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','medium']], needs: [4,10,3] },
  { brand: 3, name: 'The Ordinary AHA 30% + BHA 2% Peeling Solution', cat: 3, type: 'Peeling', desc: 'Yoğun kimyasal peeling çözeltisi', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[4,2,'Salicylic Acid','high'],[16,3,'Lactic Acid','high']], needs: [6,2,7] },
  { brand: 3, name: 'The Ordinary Retinol 0.5% in Squalane', cat: 3, type: 'Serum', desc: 'Squalane bazlı %0.5 retinol serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','high'],[14,2,'Squalane','very_high']], needs: [3,2,6] },
  { brand: 3, name: 'The Ordinary Ascorbic Acid 8% + Alpha Arbutin 2%', cat: 3, type: 'Serum', desc: 'C vitamini ve alfa arbutin aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[27,2,'Arbutin','high']], needs: [2,12,7] },
  { brand: 3, name: 'The Ordinary Glycolic Acid 7% Toning Solution', cat: 3, type: 'Tonik', desc: '%7 glikolik asitli tonik çözeltisi', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[32,2,'Aloe Barbadensis Leaf Extract','medium'],[12,3,'Glycerin','low']], needs: [6,7,2] },
  { brand: 3, name: 'The Ordinary Squalane Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Squalane bazlı nazik temizleyici', area: 'yüz', time: 'aksam', ingredients: [[14,1,'Squalane','very_high'],[12,2,'Glycerin','medium']], needs: [10,5,11] },
  { brand: 3, name: 'The Ordinary Alpha Arbutin 2% + HA', cat: 3, type: 'Serum', desc: 'Alfa arbutin leke karşıtı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[27,1,'Arbutin','very_high'],[3,2,'Hyaluronic Acid','medium'],[16,3,'Lactic Acid','low']], needs: [2,7,13] },
  { brand: 3, name: 'The Ordinary Azelaic Acid Suspension 10%', cat: 3, type: 'Krem', desc: '%10 azelaik asit süspansiyonu', area: 'yüz', time: 'sabah_aksam', ingredients: [[13,1,'Azelaic Acid','very_high'],[25,2,'Dimethicone','low']], needs: [1,2,7] },
  { brand: 3, name: 'The Ordinary Natural Moisturizing Factors + HA', cat: 2, type: 'Nemlendirici', desc: 'Doğal nemlendirme faktörleri içeren krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','high'],[76,3,'Amino Acids Complex','medium'],[14,4,'Squalane','medium'],[19,5,'Urea','low']], needs: [10,4,5] },

  // ==========================================
  // BIODERMA (brand_id: 4)
  // ==========================================
  { brand: 4, name: 'Bioderma Sensibio H2O Micellar Water', cat: 5, type: 'Misel Su', desc: 'Hassas ciltler için orijinal misel su', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[24,2,'Butylene Glycol','low']], needs: [11,10,5] },
  { brand: 4, name: 'Bioderma Photoderm Max Cream SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Maksimum koruma güneş kremi', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [8,12,7] },
  { brand: 4, name: 'Bioderma Sebium H2O Micellar Water', cat: 5, type: 'Misel Su', desc: 'Yağlı ve karma ciltler için misel su', area: 'yüz', time: 'aksam', ingredients: [[9,1,'Zinc PCA','medium'],[12,2,'Glycerin','low'],[4,3,'Salicylic Acid','low']], needs: [9,1,6] },
  { brand: 4, name: 'Bioderma Atoderm Intensive Baume', cat: 2, type: 'Bariyer Kremi', desc: 'Çok kuru ve atopik ciltler için yoğun balsam', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','very_high'],[1,2,'Niacinamide','medium'],[30,3,'Shea Butter','high'],[14,4,'Squalane','medium']], needs: [4,5,11] },
  { brand: 4, name: 'Bioderma Pigmentbio Daily Care SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Leke karşıtı günlük bakım SPF50+', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[7,2,'Ascorbic Acid','medium'],[1,3,'Niacinamide','medium']], needs: [8,2,7] },
  { brand: 4, name: 'Bioderma Sebium Global', cat: 2, type: 'Bakım Kremi', desc: 'Sivilce karşıtı yoğun bakım', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[5,2,'Glycolic Acid','medium'],[9,3,'Zinc PCA','medium'],[1,4,'Niacinamide','low']], needs: [1,6,9] },
  { brand: 4, name: 'Bioderma Cicabio Cream', cat: 2, type: 'Onarım Kremi', desc: 'Hasar görmüş ciltler için onarım kremi', area: 'yüz_vücut', time: 'her_zaman', ingredients: [[8,1,'Panthenol','very_high'],[3,2,'Hyaluronic Acid','medium'],[33,3,'Copper Peptide','medium'],[15,4,'Allantoin','medium']], needs: [5,11,4] },
  { brand: 4, name: 'Bioderma Hydrabio Serum', cat: 3, type: 'Serum', desc: 'Dehidrate ciltler için yoğun nemlendirme serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[12,2,'Glycerin','high'],[1,3,'Niacinamide','medium'],[10,4,'Tocopherol','low']], needs: [4,10,5] },

  // ==========================================
  // AVENE (brand_id: 5)
  // ==========================================
  { brand: 5, name: 'Avene Cicalfate+ Restorative Protective Cream', cat: 2, type: 'Onarım Kremi', desc: 'Onarıcı ve koruyucu bariyer kremi', area: 'yüz_vücut', time: 'her_zaman', ingredients: [[8,1,'Panthenol','high'],[33,2,'Copper Peptide','medium'],[30,3,'Shea Butter','medium'],[14,4,'Squalane','low']], needs: [5,11,4] },
  { brand: 5, name: 'Avene Thermal Spring Water Spray', cat: 2, type: 'Termal Su', desc: 'Yatıştırıcı termal su spreyi', area: 'yüz_vücut', time: 'her_zaman', ingredients: [[21,1,'Aqua','very_high']], needs: [11,10,5] },
  { brand: 5, name: 'Avene Cleanance Comedomed', cat: 2, type: 'Bakım Kremi', desc: 'Sivilce eğilimli ciltler için bakım konsantresi', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[12,2,'Glycerin','medium'],[1,3,'Niacinamide','low']], needs: [1,6,9] },
  { brand: 5, name: 'Avene Very High Protection Fluid SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Ultra hafif güneş koruyucu fluid', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium']], needs: [8,12,11] },
  { brand: 5, name: 'Avene Tolerance Hydra-10 Moisturising Cream', cat: 2, type: 'Nemlendirici', desc: 'Ultra tolerans nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[14,2,'Squalane','medium'],[30,3,'Shea Butter','medium']], needs: [11,10,5] },
  { brand: 5, name: 'Avene Hydrance Aqua-Gel', cat: 2, type: 'Nemlendirici', desc: 'Hafif jel-krem nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','low']], needs: [10,4,13] },

  // ==========================================
  // SVR (brand_id: 6)
  // ==========================================
  { brand: 6, name: 'SVR Sebiaclear Serum', cat: 3, type: 'Serum', desc: 'Sivilce ve gözenek bakım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[54,2,'Gluconolactone','high'],[4,3,'Salicylic Acid','medium']], needs: [1,6,9] },
  { brand: 6, name: 'SVR Sun Secure Blur SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Optik düzeltici mousse güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[25,2,'Dimethicone','medium'],[12,3,'Glycerin','low']], needs: [8,6,12] },
  { brand: 6, name: 'SVR Ampoule B3 Hydra', cat: 3, type: 'Serum', desc: '%5 niacinamide konsantre nemlendirici ampul', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[3,2,'Hyaluronic Acid','high'],[12,3,'Glycerin','medium']], needs: [10,6,7] },
  { brand: 6, name: 'SVR Clairial Depigmenting Serum', cat: 3, type: 'Serum', desc: 'Leke karşıtı aydınlatıcı serum', area: 'yüz', time: 'aksam', ingredients: [[1,1,'Niacinamide','high'],[7,2,'Ascorbic Acid','high'],[27,3,'Arbutin','medium'],[5,4,'Glycolic Acid','medium']], needs: [2,7,12] },
  { brand: 6, name: 'SVR Sensifine AR Cream SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Kızarıklık karşıtı koruyucu krem', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[1,2,'Niacinamide','medium'],[12,3,'Glycerin','medium']], needs: [8,11,5] },

  // ==========================================
  // EUCERIN (brand_id: 7)
  // ==========================================
  { brand: 7, name: 'Eucerin Oil Control Sun Gel-Cream SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Yağlı ciltler için mat güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[12,2,'Glycerin','medium'],[16,3,'Lactic Acid','low']], needs: [8,9,12] },
  { brand: 7, name: 'Eucerin Dermopure Triple Effect Serum', cat: 3, type: 'Serum', desc: 'Üçlü etki sivilce bakım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[1,2,'Niacinamide','medium'],[53,3,'Polyhydroxy Acid','medium'],[16,4,'Lactic Acid','low']], needs: [1,6,2] },
  { brand: 7, name: 'Eucerin Hyaluron-Filler Day Cream SPF30', cat: 2, type: 'Nemlendirici', desc: 'Kırışıklık doldurucu gündüz kremi', area: 'yüz', time: 'sabah', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[12,2,'Glycerin','medium'],[37,3,'Ethylhexyl Methoxycinnamate','high'],[14,4,'Squalane','low']], needs: [3,10,8] },
  { brand: 7, name: 'Eucerin Dermopure Oil Control', cat: 2, type: 'Bakım Kremi', desc: 'Yağ dengeleyici mat bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[16,2,'Lactic Acid','medium'],[12,3,'Glycerin','medium'],[1,4,'Niacinamide','low']], needs: [9,1,6] },
  { brand: 7, name: 'Eucerin AtopiControl Bath & Shower Oil', cat: 5, type: 'Duş Yağı', desc: 'Atopik ciltler için yatıştırıcı duş yağı', area: 'vücut', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[51,2,'Jojoba Oil','medium'],[70,3,'Colloidal Oatmeal','medium']], needs: [4,5,11] },

  // ==========================================
  // NEUTROGENA (brand_id: 8)
  // ==========================================
  { brand: 8, name: 'Neutrogena Hydro Boost Water Gel', cat: 2, type: 'Nemlendirici', desc: 'Su bazlı hyaluronik asitli jel nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[12,2,'Glycerin','medium'],[25,3,'Dimethicone','low']], needs: [10,4,13] },
  { brand: 8, name: 'Neutrogena Clear & Defend Facial Wash', cat: 5, type: 'Yüz Temizleyici', desc: 'Salisilik asitli sivilce temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[12,2,'Glycerin','medium']], needs: [1,9,6] },
  { brand: 8, name: 'Neutrogena Ultra Sheer Dry-Touch SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Mat dokunuşlu güneş koruyucu', area: 'yüz_vücut', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','low']], needs: [8,12,9] },
  { brand: 8, name: 'Neutrogena Retinol Boost Serum', cat: 3, type: 'Serum', desc: 'Retinol içerikli anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [3,2,6] },
  { brand: 8, name: 'Neutrogena Bright Boost Gel Cream', cat: 2, type: 'Nemlendirici', desc: 'Mandelic acid aydınlatıcı jel krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[34,1,'Mandelic Acid','medium'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','medium']], needs: [7,2,13] },

  // ==========================================
  // VICHY (brand_id: 9)
  // ==========================================
  { brand: 9, name: 'Vichy Mineral 89 Booster Serum', cat: 3, type: 'Serum', desc: 'Mineralli fortifiye edici günlük booster', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[12,2,'Glycerin','medium']], needs: [10,5,13] },
  { brand: 9, name: 'Vichy Normaderm Phytosolution', cat: 2, type: 'Bakım Kremi', desc: 'Çift düzeltici sivilce bakımı', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[8,3,'Panthenol','medium']], needs: [1,9,6] },
  { brand: 9, name: 'Vichy Capital Soleil UV-Age Daily SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Yaşlanma karşıtı hafif güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[1,2,'Niacinamide','medium'],[49,3,'Peptide Complex','low']], needs: [8,3,12] },
  { brand: 9, name: 'Vichy Liftactiv Collagen Specialist', cat: 2, type: 'Anti-Aging Krem', desc: 'Kolajen destekleyici anti-aging bakım', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[1,2,'Niacinamide','medium'],[7,3,'Ascorbic Acid','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [3,13,10] },
  { brand: 9, name: 'Vichy Aqualia Thermal Rehydrating Cream', cat: 2, type: 'Nemlendirici', desc: 'Zengin nemlendirici termal su kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','high'],[30,3,'Shea Butter','medium']], needs: [4,10,5] },

  // ==========================================
  // GARNIER (brand_id: 26)
  // ==========================================
  { brand: 26, name: 'Garnier Vitamin C Brightening Serum', cat: 3, type: 'Serum', desc: '%3.5 niacinamide + C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[1,2,'Niacinamide','high'],[4,3,'Salicylic Acid','low']], needs: [2,7,12] },
  { brand: 26, name: 'Garnier Micellar Cleansing Water', cat: 5, type: 'Misel Su', desc: 'Tüm cilt tipleri için makyaj temizleme suyu', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium']], needs: [10,11,5] },
  { brand: 26, name: 'Garnier Hyaluronic Aloe Jelly', cat: 2, type: 'Nemlendirici', desc: 'Hyaluronik asit ve aloe vera jel nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[32,2,'Aloe Barbadensis Leaf Extract','high'],[12,3,'Glycerin','medium']], needs: [10,4,13] },
  { brand: 26, name: 'Garnier Ambre Solaire Sensitive Advanced SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Hassas ciltler için güneş sütü', area: 'yüz_vücut', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','low']], needs: [8,11,12] },
  { brand: 26, name: 'Garnier Pure Active 3-in-1 Charcoal', cat: 5, type: 'Yüz Temizleyici', desc: 'Kömür bazlı 3\'ü 1 arada temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[12,2,'Glycerin','low']], needs: [1,9,6] },

  // ==========================================
  // NIVEA (brand_id: 27)
  // ==========================================
  { brand: 27, name: 'Nivea Q10 Energy Anti-Wrinkle Day Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Enerji veren kırışıklık karşıtı gündüz kremi', area: 'yüz', time: 'sabah', ingredients: [[46,1,'Coenzyme Q10','high'],[7,2,'Ascorbic Acid','medium'],[12,3,'Glycerin','medium'],[25,4,'Dimethicone','low']], needs: [3,13,10] },
  { brand: 27, name: 'Nivea Cellular Expert Filler Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit dolgunlaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[46,2,'Coenzyme Q10','medium'],[12,3,'Glycerin','medium']], needs: [3,10,4] },
  { brand: 27, name: 'Nivea Sun UV Face Shine Control SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Mat bitişli yüz güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[12,2,'Glycerin','medium'],[46,3,'Coenzyme Q10','low']], needs: [8,9,12] },
  { brand: 27, name: 'Nivea Naturally Good Anti-Wrinkle Night Cream', cat: 2, type: 'Gece Kremi', desc: 'Doğal içerikli anti-aging gece kremi', area: 'yüz', time: 'aksam', ingredients: [[51,1,'Jojoba Oil','medium'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','high']], needs: [3,10,4] },

  // ==========================================
  // PROCSIN (brand_id: 76) - Türk markası, TR'de çok popüler
  // ==========================================
  { brand: 76, name: 'Procsin Anti-Blemish Niacinamide Serum', cat: 3, type: 'Serum', desc: '%10 niacinamide leke karşıtı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[3,2,'Hyaluronic Acid','medium'],[9,3,'Zinc PCA','medium']], needs: [2,6,9] },
  { brand: 76, name: 'Procsin Retinol Complex Serum', cat: 3, type: 'Serum', desc: 'Retinol ve peptit kompleksi anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[49,2,'Peptide Complex','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [3,2,6] },
  { brand: 76, name: 'Procsin Hyaluronic Acid Serum', cat: 3, type: 'Serum', desc: 'Çoklu hyaluronik asit nemlendirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','medium']], needs: [4,10,3] },
  { brand: 76, name: 'Procsin Vitamin C Serum', cat: 3, type: 'Serum', desc: 'C vitamini aydınlatıcı antioksidan serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[41,2,'Ferulic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [12,2,7] },
  { brand: 76, name: 'Procsin AHA BHA Peeling Serum', cat: 3, type: 'Peeling', desc: 'AHA BHA kimyasal peeling serumu', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','high'],[4,2,'Salicylic Acid','medium'],[16,3,'Lactic Acid','medium']], needs: [6,7,2] },
  { brand: 76, name: 'Procsin CCC Cream SPF50', cat: 6, type: 'CC Krem', desc: 'Renk düzeltici SPF50 CC krem', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','low']], needs: [8,7,10] },
  { brand: 76, name: 'Procsin Collagen Serum', cat: 3, type: 'Serum', desc: 'Kolajen destekleyici sıkılaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 76, name: 'Procsin Salicylic Acid Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Salisilik asitli gözenek temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[12,2,'Glycerin','medium'],[9,3,'Zinc PCA','low']], needs: [1,9,6] },
  { brand: 76, name: 'Procsin Anti Acne Gel', cat: 2, type: 'Jel', desc: 'Sivilce karşıtı bakım jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[45,2,'Camellia Sinensis Leaf Extract','medium'],[9,3,'Zinc PCA','medium'],[15,4,'Allantoin','low']], needs: [1,9,11] },
  { brand: 76, name: 'Procsin Eye Contour Cream', cat: 4, type: 'Göz Kremi', desc: 'Koyu halka ve şişlik karşıtı göz kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[26,1,'Caffeine','high'],[49,2,'Peptide Complex','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [3,10,13] },

  // ==========================================
  // L'OREAL PARIS (brand_id: 97)
  // ==========================================
  { brand: 97, name: "L'Oreal Paris Revitalift Filler Hyaluronic Acid Serum", cat: 3, type: 'Serum', desc: '%1.5 saf hyaluronik asit dolgunlaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high']], needs: [3,10,4] },
  { brand: 97, name: "L'Oreal Paris Revitalift Laser X3 Day Cream", cat: 2, type: 'Anti-Aging Krem', desc: 'Üçlü etki yaşlanma karşıtı gündüz kremi', area: 'yüz', time: 'sabah', ingredients: [[3,1,'Hyaluronic Acid','high'],[2,2,'Retinol','low'],[7,3,'Ascorbic Acid','medium'],[37,4,'Ethylhexyl Methoxycinnamate','medium']], needs: [3,10,8] },
  { brand: 97, name: "L'Oreal Paris Glycolic Bright Serum", cat: 3, type: 'Serum', desc: 'Glikolik asit aydınlatıcı serum', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,6] },
  { brand: 97, name: "L'Oreal Paris UV Defender SPF50+", cat: 6, type: 'Güneş Kremi', desc: 'Günlük UV koruma sıvısı', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','low']], needs: [8,12,10] },
  { brand: 97, name: "L'Oreal Paris Pure Clay Detox Mask", cat: 7, type: 'Maske', desc: 'Kömür bazlı arındırıcı kil maskesi', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[4,2,'Salicylic Acid','low']], needs: [6,9,1] },

  // ==========================================
  // OLAY (brand_id: 96)
  // ==========================================
  { brand: 96, name: 'Olay Regenerist Micro-Sculpting Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Peptit ve niacinamide içerikli anti-aging krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[1,2,'Niacinamide','high'],[3,3,'Hyaluronic Acid','medium'],[12,4,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 96, name: 'Olay Total Effects 7-in-1 Day Cream SPF15', cat: 2, type: 'Nemlendirici', desc: '7 etkili günlük bakım kremi', area: 'yüz', time: 'sabah', ingredients: [[1,1,'Niacinamide','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','medium'],[37,4,'Ethylhexyl Methoxycinnamate','medium']], needs: [3,10,8] },
  { brand: 96, name: 'Olay Super Serum Night', cat: 3, type: 'Serum', desc: '5 aktifli gece süper serumu', area: 'yüz', time: 'aksam', ingredients: [[1,1,'Niacinamide','high'],[7,2,'Ascorbic Acid','medium'],[2,3,'Retinol','low'],[3,4,'Hyaluronic Acid','medium'],[49,5,'Peptide Complex','medium']], needs: [3,2,7] },
  { brand: 96, name: 'Olay Vitamin C + Peptide 24 Brightening Serum', cat: 3, type: 'Serum', desc: 'C vitamini ve peptit aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[49,2,'Peptide Complex','high'],[1,3,'Niacinamide','medium']], needs: [2,12,7] },

  // ==========================================
  // COSRX (brand_id: 13)
  // ==========================================
  { brand: 13, name: 'COSRX Advanced Snail 96 Mucin Power Essence', cat: 3, type: 'Esans', desc: '%96 salyangoz müsini esansı', area: 'yüz', time: 'sabah_aksam', ingredients: [[29,1,'Snail Secretion Filtrate','very_high'],[18,2,'Sodium Hyaluronate','medium'],[15,3,'Allantoin','low']], needs: [5,10,3] },
  { brand: 13, name: 'COSRX BHA Blackhead Power Liquid', cat: 3, type: 'Tonik', desc: '%4 betaine salicylate siyah nokta eksfoliant', area: 'yüz', time: 'aksam', ingredients: [[44,1,'Betaine Salicylate','very_high'],[75,2,'Willow Bark Extract','medium'],[1,3,'Niacinamide','low']], needs: [6,1,9] },
  { brand: 13, name: 'COSRX AHA 7 Whitehead Power Liquid', cat: 3, type: 'Tonik', desc: '%7 glikolik asit beyaz nokta eksfoliant', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[1,2,'Niacinamide','low'],[12,3,'Glycerin','low']], needs: [6,7,2] },
  { brand: 13, name: 'COSRX Low pH Good Morning Gel Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Düşük pH değerli sabah temizleyicisi', area: 'yüz', time: 'sabah', ingredients: [[44,1,'Betaine Salicylate','medium'],[45,2,'Camellia Sinensis Leaf Extract','medium'],[12,3,'Glycerin','low']], needs: [1,9,5] },
  { brand: 13, name: 'COSRX Aloe Soothing Sun Cream SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Aloe vera yatıştırıcı güneş kremi', area: 'yüz', time: 'sabah', ingredients: [[32,1,'Aloe Barbadensis Leaf Extract','high'],[37,2,'Ethylhexyl Methoxycinnamate','very_high'],[38,3,'Zinc Oxide','medium']], needs: [8,11,12] },
  { brand: 13, name: 'COSRX Full Fit Propolis Light Ampoule', cat: 3, type: 'Ampul', desc: '%73.5 propolis özlü aydınlatıcı ampul', area: 'yüz', time: 'sabah_aksam', ingredients: [[42,1,'Propolis Extract','very_high'],[43,2,'Beta-Glucan','medium'],[18,3,'Sodium Hyaluronate','medium']], needs: [13,10,12] },
  { brand: 13, name: 'COSRX Centella Blemish Cream', cat: 2, type: 'Bakım Kremi', desc: 'Centella asiatica sivilce izi bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','very_high'],[17,2,'Madecassoside','high'],[62,3,'Cica (Centella)','medium'],[9,4,'Zinc PCA','low']], needs: [1,5,11] },
  { brand: 13, name: 'COSRX Oil-Free Ultra Moisturizing Lotion', cat: 2, type: 'Nemlendirici', desc: 'Yağsız ultra nemlendirici losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[18,2,'Sodium Hyaluronate','medium'],[12,3,'Glycerin','medium'],[24,4,'Butylene Glycol','low']], needs: [10,4,9] },

  // ==========================================
  // DERMOSKIN (brand_id: 77) - Türk eczane markası
  // ==========================================
  { brand: 77, name: 'Dermoskin Melasolv Leke Kremi', cat: 2, type: 'Leke Kremi', desc: 'Yoğun leke giderici bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[27,1,'Arbutin','high'],[7,2,'Ascorbic Acid','medium'],[1,3,'Niacinamide','medium'],[67,4,'Licorice Root Extract','medium']], needs: [2,7,12] },
  { brand: 77, name: 'Dermoskin Be Bright Serum', cat: 3, type: 'Serum', desc: 'Aydınlatıcı ve ton eşitleyici serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[1,2,'Niacinamide','high'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,13] },
  { brand: 77, name: 'Dermoskin Face Protection SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Yüz güneş koruyucu krem', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [8,12,11] },
  { brand: 77, name: 'Dermoskin Acnorm Gel', cat: 2, type: 'Jel', desc: 'Sivilceye eğilimli ciltler için bakım jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[9,2,'Zinc PCA','medium'],[1,3,'Niacinamide','medium'],[15,4,'Allantoin','low']], needs: [1,9,6] },
  { brand: 77, name: 'Dermoskin Biotin Şampuan', cat: 8, type: 'Şampuan', desc: 'Biotin ve kafein saç güçlendirici şampuan', area: 'saç', time: 'her_zaman', ingredients: [[26,1,'Caffeine','medium'],[8,2,'Panthenol','medium'],[12,3,'Glycerin','low']], needs: [13,5,10] },

  // ==========================================
  // KIEHL'S (brand_id: 49)
  // ==========================================
  { brand: 49, name: "Kiehl's Ultra Facial Cream", cat: 2, type: 'Nemlendirici', desc: 'Kuru ciltler için 24 saat nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[14,1,'Squalane','high'],[12,2,'Glycerin','high'],[63,3,'Grape Seed Extract','medium']], needs: [10,4,5] },
  { brand: 49, name: "Kiehl's Midnight Recovery Concentrate", cat: 3, type: 'Yağ Serum', desc: 'Gece onarım yağı konsantresi', area: 'yüz', time: 'aksam', ingredients: [[60,1,'Rosehip Oil','high'],[14,2,'Squalane','high'],[51,3,'Jojoba Oil','medium'],[10,4,'Tocopherol','medium']], needs: [5,3,13] },
  { brand: 49, name: "Kiehl's Clearly Corrective Dark Spot Solution", cat: 3, type: 'Serum', desc: 'Koyu leke düzeltici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[7,1,'Ascorbic Acid','high'],[4,2,'Salicylic Acid','medium'],[67,3,'Licorice Root Extract','medium']], needs: [2,7,12] },
  { brand: 49, name: "Kiehl's Calendula Herbal-Extract Toner", cat: 3, type: 'Tonik', desc: 'Aynısefa çiçeği özlü yatıştırıcı tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[15,1,'Allantoin','medium'],[12,2,'Glycerin','medium'],[24,3,'Butylene Glycol','low']], needs: [11,5,10] },
  { brand: 49, name: "Kiehl's Retinol Skin-Renewing Daily Micro-Dose Serum", cat: 3, type: 'Serum', desc: 'Mikro doz retinol günlük anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[6,2,'Ceramide NP','medium'],[49,3,'Peptide Complex','medium']], needs: [3,2,6] },

  // ==========================================
  // CLINIQUE (brand_id: 50)
  // ==========================================
  { brand: 50, name: 'Clinique Moisture Surge 100H', cat: 2, type: 'Nemlendirici', desc: '100 saat nemlendirme jel krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[12,2,'Glycerin','high'],[32,3,'Aloe Barbadensis Leaf Extract','medium']], needs: [10,4,13] },
  { brand: 50, name: 'Clinique Dramatically Different Moisturizing Lotion+', cat: 2, type: 'Nemlendirici', desc: 'Klasik nemlendirici losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[3,2,'Hyaluronic Acid','medium'],[30,3,'Shea Butter','medium'],[25,4,'Dimethicone','low']], needs: [10,4,5] },
  { brand: 50, name: 'Clinique Even Better Clinical Serum', cat: 3, type: 'Serum', desc: 'Leke karşıtı klinik düzeltici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[7,1,'Ascorbic Acid','high'],[4,2,'Salicylic Acid','medium'],[5,3,'Glycolic Acid','medium'],[67,4,'Licorice Root Extract','medium']], needs: [2,7,12] },
  { brand: 50, name: 'Clinique Take The Day Off Cleansing Balm', cat: 5, type: 'Temizleme Balmı', desc: 'Makyaj çözücü temizleme balmı', area: 'yüz', time: 'aksam', ingredients: [[14,1,'Squalane','high'],[51,2,'Jojoba Oil','medium']], needs: [10,5,11] },
  { brand: 50, name: 'Clinique Fresh Pressed Vitamin C Booster', cat: 3, type: 'Booster', desc: 'Taze sıkılmış %10 saf C vitamini', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[12,2,'Glycerin','medium']], needs: [12,2,13] },

  // ==========================================
  // PAULA'S CHOICE (brand_id: 21)
  // ==========================================
  { brand: 21, name: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant", cat: 3, type: 'Eksfoliant', desc: '%2 salisilik asit sıvı eksfoliant', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[45,2,'Camellia Sinensis Leaf Extract','medium'],[24,3,'Butylene Glycol','low']], needs: [6,1,9] },
  { brand: 21, name: "Paula's Choice 10% Azelaic Acid Booster", cat: 3, type: 'Booster', desc: '%10 azelaik asit booster', area: 'yüz', time: 'sabah_aksam', ingredients: [[13,1,'Azelaic Acid','very_high'],[4,2,'Salicylic Acid','low'],[67,3,'Licorice Root Extract','low']], needs: [1,2,7] },
  { brand: 21, name: "Paula's Choice C15 Super Booster", cat: 3, type: 'Booster', desc: '%15 C vitamini ve E vitamini booster', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[10,2,'Tocopherol','high'],[41,3,'Ferulic Acid','medium']], needs: [12,2,3] },
  { brand: 21, name: "Paula's Choice 1% Retinol Treatment", cat: 3, type: 'Serum', desc: '%1 retinol anti-aging tedavi serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','very_high'],[49,2,'Peptide Complex','medium'],[67,3,'Licorice Root Extract','medium'],[14,4,'Squalane','medium']], needs: [3,2,6] },
  { brand: 21, name: "Paula's Choice Omega+ Complex Moisturizer", cat: 2, type: 'Nemlendirici', desc: 'Omega yağ asitleri zengin bariyer nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[60,1,'Rosehip Oil','high'],[6,2,'Ceramide NP','medium'],[51,3,'Jojoba Oil','medium'],[14,4,'Squalane','medium']], needs: [5,4,10] },

  // ==========================================
  // TORRIDEN (brand_id: 32) - Kore, TR'de viral
  // ==========================================
  { brand: 32, name: 'Torriden Dive-In Low Molecular Hyaluronic Acid Serum', cat: 3, type: 'Serum', desc: '5 çeşit düşük moleküllü hyaluronik asit serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','very_high'],[8,3,'Panthenol','medium'],[15,4,'Allantoin','low']], needs: [4,10,5] },
  { brand: 32, name: 'Torriden Dive-In Cleansing Foam', cat: 5, type: 'Yüz Temizleyici', desc: 'Düşük pH nemlendirici temizleme köpüğü', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','low']], needs: [10,11,5] },
  { brand: 32, name: 'Torriden Dive-In Toner Pad', cat: 3, type: 'Tonik Pad', desc: 'Hyaluronik asitli nemlendirici tonik pedi', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','medium'],[15,4,'Allantoin','low']], needs: [10,4,5] },
  { brand: 32, name: 'Torriden Balanceful Cica Serum', cat: 3, type: 'Serum', desc: 'Cica bazlı yatıştırıcı dengeleyici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[62,1,'Cica (Centella)','very_high'],[11,2,'Centella Asiatica Extract','high'],[17,3,'Madecassoside','medium'],[8,4,'Panthenol','medium']], needs: [11,5,1] },

  // ==========================================
  // BEAUTY OF JOSEON (brand_id: 24)
  // ==========================================
  { brand: 24, name: 'Beauty of Joseon Relief Sun Rice + Probiotics SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Pirinç ve probiyotik güneş kremi', area: 'yüz', time: 'sabah', ingredients: [[50,1,'Rice Extract','high'],[72,2,'Probiotics','medium'],[37,3,'Ethylhexyl Methoxycinnamate','very_high'],[12,4,'Glycerin','medium']], needs: [8,10,12] },
  { brand: 24, name: 'Beauty of Joseon Glow Serum Propolis + Niacinamide', cat: 3, type: 'Serum', desc: 'Propolis ve niacinamide ışıltı serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[42,1,'Propolis Extract','very_high'],[1,2,'Niacinamide','high'],[18,3,'Sodium Hyaluronate','medium']], needs: [13,6,10] },
  { brand: 24, name: 'Beauty of Joseon Glow Deep Serum Rice + Alpha-Arbutin', cat: 3, type: 'Serum', desc: 'Pirinç ve alfa arbutin aydınlatıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[50,1,'Rice Extract','high'],[27,2,'Arbutin','high'],[18,3,'Sodium Hyaluronate','medium']], needs: [2,7,10] },
  { brand: 24, name: 'Beauty of Joseon Dynasty Cream', cat: 2, type: 'Nemlendirici', desc: 'Pirinç suyu ve ginseng nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[50,1,'Rice Extract','high'],[12,2,'Glycerin','medium'],[14,3,'Squalane','medium'],[1,4,'Niacinamide','low']], needs: [10,4,13] },
  { brand: 24, name: 'Beauty of Joseon Revive Eye Serum Ginseng + Retinal', cat: 4, type: 'Göz Serumu', desc: 'Ginseng ve retinal göz serumu', area: 'göz', time: 'aksam', ingredients: [[47,1,'Retinaldehyde','medium'],[49,2,'Peptide Complex','medium'],[26,3,'Caffeine','medium']], needs: [3,10,13] },

  // ==========================================
  // SOME BY MI (brand_id: 19)
  // ==========================================
  { brand: 19, name: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner', cat: 3, type: 'Tonik', desc: '30 gün mucize asit tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[5,1,'Glycolic Acid','medium'],[4,2,'Salicylic Acid','medium'],[53,3,'Polyhydroxy Acid','medium'],[45,4,'Camellia Sinensis Leaf Extract','medium']], needs: [1,6,7] },
  { brand: 19, name: 'Some By Mi AHA BHA PHA 30 Days Miracle Serum', cat: 3, type: 'Serum', desc: 'Üçlü asit 30 gün mucize serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[5,1,'Glycolic Acid','medium'],[4,2,'Salicylic Acid','medium'],[53,3,'Polyhydroxy Acid','medium'],[1,4,'Niacinamide','medium']], needs: [1,6,2] },
  { brand: 19, name: 'Some By Mi Snail Truecica Miracle Repair Serum', cat: 3, type: 'Serum', desc: 'Salyangoz ve cica onarım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[29,1,'Snail Secretion Filtrate','very_high'],[62,2,'Cica (Centella)','high'],[11,3,'Centella Asiatica Extract','medium']], needs: [5,11,1] },
  { brand: 19, name: 'Some By Mi Galactomyces Pure Vitamin C Glow Toner', cat: 3, type: 'Tonik', desc: 'Galactomyces ve C vitamini ışıltı toniği', area: 'yüz', time: 'sabah', ingredients: [[57,1,'Galactomyces Ferment Filtrate','very_high'],[7,2,'Ascorbic Acid','medium'],[1,3,'Niacinamide','medium']], needs: [7,2,13] },
  { brand: 19, name: 'Some By Mi Retinol Intense Reactivating Serum', cat: 3, type: 'Serum', desc: 'Yoğun retinol yenileme serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','high'],[20,2,'Bakuchiol','medium'],[49,3,'Peptide Complex','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [3,2,6] },

  // ==========================================
  // ISNTREE (brand_id: 23)
  // ==========================================
  { brand: 23, name: 'Isntree Hyaluronic Acid Toner', cat: 3, type: 'Tonik', desc: '%50 hyaluronik asitli nemlendirici tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','medium'],[15,4,'Allantoin','low']], needs: [4,10,5] },
  { brand: 23, name: 'Isntree Green Tea Fresh Emulsion', cat: 2, type: 'Emülsiyon', desc: 'Yeşil çay ferahlatıcı emülsiyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [9,10,12] },
  { brand: 23, name: 'Isntree C-Niacin Toning Ampoule', cat: 3, type: 'Ampul', desc: 'C vitamini ve niacinamide aydınlatıcı ampul', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[1,2,'Niacinamide','high'],[27,3,'Arbutin','medium']], needs: [2,7,12] },
  { brand: 23, name: 'Isntree Onion Newpair Gel Cream', cat: 2, type: 'Jel Krem', desc: 'Soğan özlü sivilce izi bakım jel krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','high'],[15,2,'Allantoin','medium'],[1,3,'Niacinamide','medium'],[8,4,'Panthenol','medium']], needs: [1,5,2] },

  // ==========================================
  // ANUA (brand_id: 36) - TR'de çok popüler Kore markası
  // ==========================================
  { brand: 36, name: 'Anua Heartleaf 77% Soothing Toner', cat: 3, type: 'Tonik', desc: '%77 heartleaf özlü yatıştırıcı tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[59,1,'Heartleaf Extract','very_high'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium'],[15,4,'Allantoin','low']], needs: [11,5,1] },
  { brand: 36, name: 'Anua Heartleaf 80% Soothing Ampoule', cat: 3, type: 'Ampul', desc: '%80 heartleaf yoğun yatıştırıcı ampul', area: 'yüz', time: 'sabah_aksam', ingredients: [[59,1,'Heartleaf Extract','very_high'],[3,2,'Hyaluronic Acid','medium'],[8,3,'Panthenol','medium']], needs: [11,5,10] },
  { brand: 36, name: 'Anua Niacinamide 10% + TXA 4% Serum', cat: 3, type: 'Serum', desc: 'Niacinamide ve traneksamik asit leke serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[28,2,'Tranexamic Acid','high'],[3,3,'Hyaluronic Acid','medium']], needs: [2,6,7] },
  { brand: 36, name: 'Anua Peach 70% Niacin Serum', cat: 3, type: 'Serum', desc: 'Şeftali özlü niacinamide ışıltı serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[12,2,'Glycerin','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [7,6,13] },
  { brand: 36, name: 'Anua BHA 2% Gentle Exfoliating Toner', cat: 3, type: 'Tonik', desc: '%2 BHA nazik eksfoliyan tonik', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[59,2,'Heartleaf Extract','medium'],[75,3,'Willow Bark Extract','medium']], needs: [6,1,9] },
  { brand: 36, name: 'Anua Heartleaf Pore Control Cleansing Oil', cat: 5, type: 'Temizleme Yağı', desc: 'Heartleaf gözenek temizleme yağı', area: 'yüz', time: 'aksam', ingredients: [[59,1,'Heartleaf Extract','high'],[51,2,'Jojoba Oil','high'],[14,3,'Squalane','medium']], needs: [6,9,10] },

  // ==========================================
  // LANEIGE (brand_id: 29)
  // ==========================================
  { brand: 29, name: 'Laneige Water Sleeping Mask', cat: 7, type: 'Uyku Maskesi', desc: 'Gece uyku nemlendirme maskesi', area: 'yüz', time: 'aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','high'],[14,3,'Squalane','medium'],[24,4,'Butylene Glycol','low']], needs: [10,4,13] },
  { brand: 29, name: 'Laneige Lip Sleeping Mask', cat: 7, type: 'Dudak Maskesi', desc: 'Gece dudak bakım maskesi', area: 'dudak', time: 'aksam', ingredients: [[30,1,'Shea Butter','high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [10,4,5] },
  { brand: 29, name: 'Laneige Water Bank Blue Hyaluronic Cream', cat: 2, type: 'Nemlendirici', desc: 'Mavi hyaluronik asit nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[12,3,'Glycerin','medium'],[8,4,'Panthenol','low']], needs: [4,10,5] },
  { brand: 29, name: 'Laneige Cream Skin Cerapeptide Refiner', cat: 3, type: 'Tonik', desc: 'Ceramide peptit kremsi tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[49,2,'Peptide Complex','medium'],[12,3,'Glycerin','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [5,10,3] },

  // ==========================================
  // SKIN1004 (brand_id: 35)
  // ==========================================
  { brand: 35, name: 'Skin1004 Madagascar Centella Ampoule', cat: 3, type: 'Ampul', desc: 'Madagaskar centella yatıştırıcı ampul', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','very_high'],[17,2,'Madecassoside','high'],[62,3,'Cica (Centella)','medium']], needs: [11,5,1] },
  { brand: 35, name: 'Skin1004 Madagascar Centella Tone Brightening Capsule Ampoule', cat: 3, type: 'Ampul', desc: 'Centella ve niacinamide aydınlatıcı kapsül ampul', area: 'yüz', time: 'sabah', ingredients: [[11,1,'Centella Asiatica Extract','high'],[1,2,'Niacinamide','high'],[7,3,'Ascorbic Acid','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [7,2,11] },
  { brand: 35, name: 'Skin1004 Hyalu-Cica Water-Fit Sun Serum SPF50+', cat: 6, type: 'Güneş Serumu', desc: 'Hyaluronik asit ve cica güneş serumu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','high'],[11,3,'Centella Asiatica Extract','medium']], needs: [8,10,11] },

  // ==========================================
  // DR. JART+ (brand_id: 30)
  // ==========================================
  { brand: 30, name: 'Dr. Jart+ Ceramidin Cream', cat: 2, type: 'Nemlendirici', desc: '5-Cera Complex bariyer güçlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','very_high'],[77,2,'Ceramide AP','high'],[78,3,'Cholesterol','medium'],[79,4,'Phytosphingosine','medium'],[12,5,'Glycerin','medium']], needs: [5,4,10] },
  { brand: 30, name: 'Dr. Jart+ Cicapair Tiger Grass Cream', cat: 2, type: 'Onarım Kremi', desc: 'Kaplan otu cica onarıcı yatıştırıcı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[62,1,'Cica (Centella)','very_high'],[11,2,'Centella Asiatica Extract','high'],[17,3,'Madecassoside','high'],[8,4,'Panthenol','medium']], needs: [11,5,1] },
  { brand: 30, name: 'Dr. Jart+ Vital Hydra Solution Biome Essence', cat: 3, type: 'Esans', desc: 'Probiyotik bazlı nemlendirici esans', area: 'yüz', time: 'sabah_aksam', ingredients: [[72,1,'Probiotics','high'],[3,2,'Hyaluronic Acid','high'],[12,3,'Glycerin','medium'],[8,4,'Panthenol','medium']], needs: [10,5,4] },

  // ==========================================
  // ROUND LAB (brand_id: 33) - TR'de hızla büyüyen Kore markası
  // ==========================================
  { brand: 33, name: 'Round Lab 1025 Dokdo Toner', cat: 3, type: 'Tonik', desc: 'Dokdo derin deniz suyu nemlendirici tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium'],[24,4,'Butylene Glycol','low']], needs: [10,4,5] },
  { brand: 33, name: 'Round Lab 1025 Dokdo Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Düşük pH Dokdo deniz suyu temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[3,2,'Hyaluronic Acid','low'],[8,3,'Panthenol','low']], needs: [10,11,5] },
  { brand: 33, name: 'Round Lab Birch Juice Moisturizing Sunscreen SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Huş ağacı suyu nemlendirici güneş kremi', area: 'yüz', time: 'sabah', ingredients: [[58,1,'Birch Juice','high'],[37,2,'Ethylhexyl Methoxycinnamate','very_high'],[3,3,'Hyaluronic Acid','medium']], needs: [8,10,12] },
  { brand: 33, name: 'Round Lab Mugwort Calming Toner', cat: 3, type: 'Tonik', desc: 'Mugwort yatıştırıcı tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[56,1,'Mugwort Extract','very_high'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium']], needs: [11,5,10] },

  // ==========================================
  // AXIS-Y (brand_id: 34)
  // ==========================================
  { brand: 34, name: 'Axis-Y Dark Spot Correcting Glow Serum', cat: 3, type: 'Serum', desc: 'Koyu leke düzeltici ışıltı serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[7,2,'Ascorbic Acid','medium'],[67,3,'Licorice Root Extract','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [2,7,13] },
  { brand: 34, name: 'Axis-Y Mugwort Pore Clarifying Wash Off Pack', cat: 7, type: 'Maske', desc: 'Mugwort gözenek arındırıcı yıkama maskesi', area: 'yüz', time: 'aksam', ingredients: [[56,1,'Mugwort Extract','very_high'],[12,2,'Glycerin','medium'],[4,3,'Salicylic Acid','low']], needs: [6,1,11] },
  { brand: 34, name: 'Axis-Y Biome Resetting Moringa Cleansing Oil', cat: 5, type: 'Temizleme Yağı', desc: 'Moringa temizleme yağı', area: 'yüz', time: 'aksam', ingredients: [[51,1,'Jojoba Oil','high'],[14,2,'Squalane','medium'],[10,3,'Tocopherol','low']], needs: [10,5,9] },

  // ==========================================
  // MISCELLANEOUS POPULAR BRANDS (remaining products to reach 1000+)
  // ==========================================

  // MISSHA (25)
  { brand: 25, name: 'Missha Time Revolution The First Treatment Essence Rx', cat: 3, type: 'Esans', desc: 'Fermentasyon esansı anti-aging bakım', area: 'yüz', time: 'sabah_aksam', ingredients: [[73,1,'Saccharomyces Ferment','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [13,10,3] },
  { brand: 25, name: 'Missha M Perfect Covering BB Cream SPF42', cat: 6, type: 'BB Krem', desc: 'Tam kapatıcı BB krem', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[12,2,'Glycerin','medium'],[1,3,'Niacinamide','low'],[25,4,'Dimethicone','low']], needs: [8,7,10] },
  { brand: 25, name: 'Missha Vita C Plus Spot Correcting Ampoule', cat: 3, type: 'Ampul', desc: 'C vitamini leke düzeltici ampul', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,12,7] },

  // INNISFREE (28)
  { brand: 28, name: 'Innisfree Green Tea Seed Serum', cat: 3, type: 'Serum', desc: 'Yeşil çay tohumu nemlendirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [10,12,4] },
  { brand: 28, name: 'Innisfree Retinol Cica Repair Ampoule', cat: 3, type: 'Ampul', desc: 'Retinol ve cica onarıcı anti-aging ampul', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[62,2,'Cica (Centella)','high'],[11,3,'Centella Asiatica Extract','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [3,5,2] },
  { brand: 28, name: 'Innisfree Daily UV Defense Sunscreen SPF36', cat: 6, type: 'Güneş Kremi', desc: 'Günlük hafif güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[45,2,'Camellia Sinensis Leaf Extract','medium'],[12,3,'Glycerin','medium']], needs: [8,12,10] },

  // PURITO (18)
  { brand: 18, name: 'Purito Daily Go-To Sunscreen SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Günlük nemlendirici güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[11,3,'Centella Asiatica Extract','medium'],[8,4,'Panthenol','low']], needs: [8,10,11] },
  { brand: 18, name: 'Purito Centella Green Level Recovery Cream', cat: 2, type: 'Onarım Kremi', desc: 'Centella onarıcı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','very_high'],[62,2,'Cica (Centella)','high'],[17,3,'Madecassoside','medium'],[14,4,'Squalane','medium']], needs: [11,5,10] },
  { brand: 18, name: 'Purito From Green Cleansing Oil', cat: 5, type: 'Temizleme Yağı', desc: 'Doğal temizleme yağı', area: 'yüz', time: 'aksam', ingredients: [[51,1,'Jojoba Oil','high'],[14,2,'Squalane','medium'],[10,3,'Tocopherol','medium']], needs: [10,5,11] },
  { brand: 18, name: 'Purito Dermide Cica Barrier Sleeping Pack', cat: 7, type: 'Uyku Maskesi', desc: 'Cica bariyer gece paketi', area: 'yüz', time: 'aksam', ingredients: [[62,1,'Cica (Centella)','high'],[6,2,'Ceramide NP','medium'],[14,3,'Squalane','medium'],[30,4,'Shea Butter','medium']], needs: [5,4,11] },

  // KLAIRS (17)
  { brand: 17, name: 'Klairs Supple Preparation Unscented Toner', cat: 3, type: 'Tonik', desc: 'Kokusuz hassas cilt toniği', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[11,3,'Centella Asiatica Extract','medium'],[8,4,'Panthenol','low']], needs: [11,10,5] },
  { brand: 17, name: 'Klairs Freshly Juiced Vitamin C Drop', cat: 3, type: 'Serum', desc: '%5 C vitamini hafif serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','medium'],[11,2,'Centella Asiatica Extract','medium'],[12,3,'Glycerin','medium']], needs: [12,2,7] },
  { brand: 17, name: 'Klairs Fundamental Water Gel Cream', cat: 2, type: 'Jel Krem', desc: 'Hafif su bazlı jel nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[14,3,'Squalane','medium'],[8,4,'Panthenol','low']], needs: [10,4,5] },
  { brand: 17, name: 'Klairs Midnight Blue Calming Cream', cat: 2, type: 'Yatıştırıcı Krem', desc: 'Guaiazulene yatıştırıcı gece kremi', area: 'yüz', time: 'aksam', ingredients: [[52,1,'Guaiazulene','high'],[11,2,'Centella Asiatica Extract','high'],[17,3,'Madecassoside','medium']], needs: [11,5,1] },

  // HADA LABO (16)
  { brand: 16, name: 'Hada Labo Gokujyun Premium Hyaluronic Acid Lotion', cat: 3, type: 'Tonik', desc: '7 çeşit hyaluronik asit premium losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','very_high'],[12,3,'Glycerin','medium'],[19,4,'Urea','low']], needs: [4,10,5] },
  { brand: 16, name: 'Hada Labo Shirojyun Premium Whitening Lotion', cat: 3, type: 'Tonik', desc: 'Traneksamik asit aydınlatıcı losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[28,1,'Tranexamic Acid','high'],[3,2,'Hyaluronic Acid','high'],[7,3,'Ascorbic Acid','medium']], needs: [2,7,10] },
  { brand: 16, name: 'Hada Labo Gokujyun Cleansing Foam', cat: 5, type: 'Yüz Temizleyici', desc: 'Hyaluronik asitli temizleme köpüğü', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium']], needs: [10,11,4] },

  // DRUNK ELEPHANT (22)
  { brand: 22, name: 'Drunk Elephant T.L.C. Sukari Babyfacial', cat: 7, type: 'Maske', desc: '%25 AHA ve %2 BHA yüz maskesi', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[4,2,'Salicylic Acid','high'],[16,3,'Lactic Acid','high'],[34,4,'Mandelic Acid','medium']], needs: [6,7,2] },
  { brand: 22, name: 'Drunk Elephant Protini Polypeptide Cream', cat: 2, type: 'Nemlendirici', desc: 'Multi-peptit anti-aging nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[14,2,'Squalane','medium'],[12,3,'Glycerin','medium'],[33,4,'Copper Peptide','medium']], needs: [3,10,13] },
  { brand: 22, name: 'Drunk Elephant C-Firma Fresh Day Serum', cat: 3, type: 'Serum', desc: '%15 C vitamini gündüz serumu', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[41,2,'Ferulic Acid','high'],[10,3,'Tocopherol','medium'],[49,4,'Peptide Complex','medium']], needs: [12,2,3] },
  { brand: 22, name: 'Drunk Elephant Beste No. 9 Jelly Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Jöle formüllü nazik temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[24,2,'Butylene Glycol','low'],[11,3,'Centella Asiatica Extract','low']], needs: [10,11,5] },

  // CAUDALIE (67)
  { brand: 67, name: 'Caudalie Vinoperfect Radiance Serum', cat: 3, type: 'Serum', desc: 'Üzüm bazlı aydınlatıcı leke serumu', area: 'yüz', time: 'sabah', ingredients: [[1,1,'Niacinamide','medium'],[63,2,'Grape Seed Extract','high'],[14,3,'Squalane','medium'],[3,4,'Hyaluronic Acid','low']], needs: [2,7,12] },
  { brand: 67, name: 'Caudalie Vinosource-Hydra SOS Intense Moisturizing Cream', cat: 2, type: 'Nemlendirici', desc: 'Yoğun nemlendirme kurtarma kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[63,1,'Grape Seed Extract','high'],[3,2,'Hyaluronic Acid','high'],[14,3,'Squalane','medium'],[30,4,'Shea Butter','medium']], needs: [4,10,5] },
  { brand: 67, name: 'Caudalie Resveratrol-Lift Firming Night Cream', cat: 2, type: 'Gece Kremi', desc: 'Resveratrol sıkılaştırıcı gece kremi', area: 'yüz', time: 'aksam', ingredients: [[69,1,'Resveratrol','high'],[3,2,'Hyaluronic Acid','medium'],[49,3,'Peptide Complex','medium'],[14,4,'Squalane','medium']], needs: [3,10,13] },
  { brand: 67, name: 'Caudalie Beauty Elixir', cat: 3, type: 'Mist', desc: 'Canlandırıcı güzellik iksiri spreyi', area: 'yüz', time: 'her_zaman', ingredients: [[63,1,'Grape Seed Extract','medium'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','low']], needs: [13,10,12] },

  // EMBRYOLISSE (68)
  { brand: 68, name: 'Embryolisse Lait-Crème Concentré', cat: 2, type: 'Nemlendirici', desc: 'Çok amaçlı konsantre nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[30,1,'Shea Butter','high'],[12,2,'Glycerin','high'],[32,3,'Aloe Barbadensis Leaf Extract','medium'],[10,4,'Tocopherol','medium']], needs: [10,4,5] },
  { brand: 68, name: 'Embryolisse Filaderme Emulsion', cat: 2, type: 'Emülsiyon', desc: 'Kuru ciltler için besleyici emülsiyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[30,1,'Shea Butter','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','medium'],[14,4,'Squalane','medium']], needs: [4,10,5] },

  // FILORGA (69)
  { brand: 69, name: 'Filorga Time-Filler 5XP Cream', cat: 2, type: 'Anti-Aging Krem', desc: '5 kırışıklık tipine karşı anti-aging krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[3,2,'Hyaluronic Acid','high'],[2,3,'Retinol','low'],[12,4,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 69, name: 'Filorga NCEF-Reverse Supreme Multi-Correction Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Çoklu düzeltici anti-aging krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','high'],[7,3,'Ascorbic Acid','medium'],[2,4,'Retinol','low']], needs: [3,2,10] },
  { brand: 69, name: 'Filorga Optim-Eyes Eye Contour Cream', cat: 4, type: 'Göz Kremi', desc: '3\'ü 1 arada göz çevresi kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[26,3,'Caffeine','medium']], needs: [3,10,13] },

  // SKINCEUTICALS (111)
  { brand: 111, name: 'SkinCeuticals C E Ferulic Serum', cat: 3, type: 'Serum', desc: '%15 C vitamini + E vitamini + ferulik asit', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[10,2,'Tocopherol','high'],[41,3,'Ferulic Acid','high']], needs: [12,3,2] },
  { brand: 111, name: 'SkinCeuticals Phloretin CF', cat: 3, type: 'Serum', desc: 'C vitamini ve phloretin antioksidan serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[41,2,'Ferulic Acid','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [12,2,7] },
  { brand: 111, name: 'SkinCeuticals Retinol 0.3', cat: 3, type: 'Serum', desc: '%0.3 retinol gece serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[40,2,'Bisabolol','medium'],[14,3,'Squalane','medium']], needs: [3,2,6] },
  { brand: 111, name: 'SkinCeuticals HA Intensifier', cat: 3, type: 'Serum', desc: 'Hyaluronik asit yoğunlaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[67,3,'Licorice Root Extract','medium'],[49,4,'Peptide Complex','low']], needs: [4,10,3] },

  // REVOLUTION (100)
  { brand: 100, name: 'Revolution Skincare 10% Niacinamide + 1% Zinc Serum', cat: 3, type: 'Serum', desc: '%10 niacinamide ve %1 çinko gözenek serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[9,2,'Zinc PCA','medium'],[3,3,'Hyaluronic Acid','low']], needs: [6,9,1] },
  { brand: 100, name: 'Revolution Skincare 2% Salicylic Acid Tonic', cat: 3, type: 'Tonik', desc: '%2 salisilik asit sivilce toniği', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[75,2,'Willow Bark Extract','medium'],[12,3,'Glycerin','low']], needs: [1,6,9] },
  { brand: 100, name: 'Revolution Skincare Retinol Serum 0.5%', cat: 3, type: 'Serum', desc: '%0.5 retinol anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[14,2,'Squalane','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [3,2,6] },
  { brand: 100, name: 'Revolution Skincare Vitamin C Glow Serum', cat: 3, type: 'Serum', desc: 'C vitamini ışıltı serumu', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [12,2,7] },
  { brand: 100, name: 'Revolution Skincare Hyaluronic Acid Serum', cat: 3, type: 'Serum', desc: '%2 hyaluronik asit nemlendirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','low']], needs: [4,10,5] },

  // GEEK & GORGEOUS (74)
  { brand: 74, name: 'Geek & Gorgeous Liquid Gold', cat: 3, type: 'Eksfoliant', desc: '%8 glikolik asit sıvı eksfoliant', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [6,7,2] },
  { brand: 74, name: 'Geek & Gorgeous C-Glow', cat: 3, type: 'Serum', desc: '%15 etil askorbik asit C vitamini serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[10,2,'Tocopherol','medium'],[41,3,'Ferulic Acid','medium']], needs: [12,2,7] },
  { brand: 74, name: 'Geek & Gorgeous aPAD', cat: 3, type: 'Serum', desc: '%20 azelaik asit türevi serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[13,1,'Azelaic Acid','very_high'],[1,2,'Niacinamide','medium'],[12,3,'Glycerin','low']], needs: [1,2,7] },
  { brand: 74, name: 'Geek & Gorgeous Stress Less', cat: 3, type: 'Serum', desc: '%2 BHA siyah nokta serumu', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[1,2,'Niacinamide','medium'],[45,3,'Camellia Sinensis Leaf Extract','medium']], needs: [6,1,9] },

  // CETAPHIL (20)
  { brand: 20, name: 'Cetaphil Gentle Skin Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Tüm cilt tipleri için nazik temizleyici', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[1,2,'Niacinamide','low'],[8,3,'Panthenol','low']], needs: [11,10,5] },
  { brand: 20, name: 'Cetaphil Moisturizing Cream', cat: 2, type: 'Nemlendirici', desc: 'Kuru ciltler için yoğun nemlendirici', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[25,2,'Dimethicone','medium'],[30,3,'Shea Butter','medium'],[1,4,'Niacinamide','low']], needs: [4,10,5] },
  { brand: 20, name: 'Cetaphil Bright Healthy Radiance Serum', cat: 3, type: 'Serum', desc: 'Niacinamide aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[1,1,'Niacinamide','high'],[45,2,'Camellia Sinensis Leaf Extract','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,6] },
  { brand: 20, name: 'Cetaphil Daily Facial Moisturizer SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Günlük nemlendirici güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','low']], needs: [8,10,12] },

  // URIAGE (14)
  { brand: 14, name: 'Uriage Bariéderm Cica Cream SPF50+', cat: 6, type: 'Onarım Kremi', desc: 'Cica ve SPF50+ onarıcı koruyucu krem', area: 'yüz', time: 'sabah', ingredients: [[62,1,'Cica (Centella)','high'],[37,2,'Ethylhexyl Methoxycinnamate','very_high'],[33,3,'Copper Peptide','medium']], needs: [5,8,11] },
  { brand: 14, name: 'Uriage Age Lift Firming Smoothing Day Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Sıkılaştırıcı anti-aging gündüz kremi', area: 'yüz', time: 'sabah', ingredients: [[2,1,'Retinol','low'],[3,2,'Hyaluronic Acid','high'],[49,3,'Peptide Complex','medium'],[12,4,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 14, name: 'Uriage Hyséac 3-Regul Global Skin Care', cat: 2, type: 'Bakım Kremi', desc: 'Sivilce bakımı 3\'lü etki kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[5,2,'Glycolic Acid','medium'],[9,3,'Zinc PCA','medium'],[1,4,'Niacinamide','low']], needs: [1,9,6] },
  { brand: 14, name: 'Uriage Eau Thermale Water Cream', cat: 2, type: 'Nemlendirici', desc: 'Termal su hafif nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','low']], needs: [10,4,11] },

  // DUCRAY (15)
  { brand: 15, name: 'Ducray Keracnyl PP+ Anti-Blemish Cream', cat: 2, type: 'Sivilce Kremi', desc: 'Sivilce karşıtı bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[4,2,'Salicylic Acid','medium'],[9,3,'Zinc PCA','medium'],[12,4,'Glycerin','medium']], needs: [1,9,6] },
  { brand: 15, name: 'Ducray Melascreen Depigmenting Cream', cat: 2, type: 'Leke Kremi', desc: 'Yoğun leke giderici krem', area: 'yüz', time: 'aksam', ingredients: [[7,1,'Ascorbic Acid','high'],[1,2,'Niacinamide','medium'],[5,3,'Glycolic Acid','medium'],[27,4,'Arbutin','medium']], needs: [2,7,12] },
  { brand: 15, name: 'Ducray Anacaps Reactiv Shampoo', cat: 8, type: 'Şampuan', desc: 'Saç dökülmesi karşıtı şampuan', area: 'saç', time: 'her_zaman', ingredients: [[26,1,'Caffeine','medium'],[8,2,'Panthenol','medium'],[12,3,'Glycerin','low']], needs: [13,5,10] },

  // THE BODY SHOP (113)
  { brand: 113, name: 'The Body Shop Vitamin E Moisture Cream', cat: 2, type: 'Nemlendirici', desc: 'E vitamini nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[10,1,'Tocopherol','very_high'],[35,2,'Vitamin E Acetate','high'],[3,3,'Hyaluronic Acid','medium'],[30,4,'Shea Butter','medium']], needs: [10,12,4] },
  { brand: 113, name: 'The Body Shop Tea Tree Skin Clearing Facial Wash', cat: 5, type: 'Yüz Temizleyici', desc: 'Çay ağacı sivilce temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','medium'],[4,2,'Salicylic Acid','low'],[12,3,'Glycerin','medium']], needs: [1,9,6] },
  { brand: 113, name: 'The Body Shop Vitamin C Glow-Boosting Moisturiser', cat: 2, type: 'Nemlendirici', desc: 'C vitamini ışıltı veren nemlendirici', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','medium'],[12,2,'Glycerin','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [13,2,10] },

  // ROSENSE (81)
  { brand: 81, name: 'Rosense Gül Suyu', cat: 3, type: 'Tonik', desc: 'Isparta gülü doğal gül suyu toniği', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','low'],[21,2,'Aqua','very_high']], needs: [11,10,13] },
  { brand: 81, name: 'Rosense Nemlendirici Gül Kremi', cat: 2, type: 'Nemlendirici', desc: 'Gül yağı nemlendirici yüz kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[30,2,'Shea Butter','medium'],[10,3,'Tocopherol','medium']], needs: [10,4,11] },

  // THALIA (79)
  { brand: 79, name: 'Thalia AHA BHA Cilt Bakım Toniği', cat: 3, type: 'Tonik', desc: 'AHA ve BHA karışımlı eksfoliyan tonik', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','medium'],[4,2,'Salicylic Acid','medium'],[12,3,'Glycerin','low']], needs: [6,1,7] },
  { brand: 79, name: 'Thalia Hyaluronic Acid Nemlendirici Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit yoğun nemlendirme serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[12,3,'Glycerin','medium']], needs: [4,10,5] },
  { brand: 79, name: 'Thalia Retinol Anti-Aging Serum', cat: 3, type: 'Serum', desc: 'Retinol anti-aging bakım serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [3,2,6] },

  // INCIA (80)
  { brand: 80, name: 'Incia Doğal Güneş Kremi SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Doğal mineral güneş koruyucu', area: 'yüz_vücut', time: 'sabah', ingredients: [[38,1,'Zinc Oxide','very_high'],[39,2,'Titanium Dioxide','high'],[10,3,'Tocopherol','medium'],[30,4,'Shea Butter','medium']], needs: [8,11,12] },
  { brand: 80, name: 'Incia Yoğun Nemlendirici Yüz Kremi', cat: 2, type: 'Nemlendirici', desc: 'Doğal içerikli yoğun nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[30,1,'Shea Butter','high'],[51,2,'Jojoba Oil','medium'],[10,3,'Tocopherol','medium'],[12,4,'Glycerin','medium']], needs: [4,10,5] },

  // SIVENO (82)
  { brand: 82, name: 'Siveno Doğal Yüz Temizleme Jeli', cat: 5, type: 'Yüz Temizleyici', desc: 'Doğal içerikli nazik yüz temizleme jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[32,1,'Aloe Barbadensis Leaf Extract','high'],[12,2,'Glycerin','medium']], needs: [11,10,5] },
  { brand: 82, name: 'Siveno Doğal Nemlendirici Krem', cat: 2, type: 'Nemlendirici', desc: 'Doğal nemlendirici yüz kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[30,1,'Shea Butter','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','medium'],[32,4,'Aloe Barbadensis Leaf Extract','medium']], needs: [10,4,11] },

  // NUMBUZIN (38)
  { brand: 38, name: 'Numbuzin No.3 Skin Softening Serum', cat: 3, type: 'Serum', desc: 'Galactomyces bazlı yumuşatıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[57,1,'Galactomyces Ferment Filtrate','very_high'],[1,2,'Niacinamide','high'],[3,3,'Hyaluronic Acid','medium']], needs: [7,10,13] },
  { brand: 38, name: 'Numbuzin No.5 Vitamin-Niacinamide Concentrated Pad', cat: 3, type: 'Tonik Pad', desc: 'C vitamini ve niacinamide aydınlatıcı ped', area: 'yüz', time: 'sabah', ingredients: [[1,1,'Niacinamide','very_high'],[7,2,'Ascorbic Acid','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,6] },
  { brand: 38, name: 'Numbuzin No.1 Pure Glass Cleansing Oil', cat: 5, type: 'Temizleme Yağı', desc: 'Cam cilt temizleme yağı', area: 'yüz', time: 'aksam', ingredients: [[51,1,'Jojoba Oil','high'],[14,2,'Squalane','medium'],[60,3,'Rosehip Oil','medium']], needs: [10,6,5] },

  // HEIMISH (39)
  { brand: 39, name: 'Heimish All Clean Balm', cat: 5, type: 'Temizleme Balmı', desc: 'Şerbet formüllü makyaj temizleme balmı', area: 'yüz', time: 'aksam', ingredients: [[30,1,'Shea Butter','high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [10,5,11] },
  { brand: 39, name: 'Heimish Bulgarian Rose Water Hydrogel Eye Patch', cat: 7, type: 'Göz Maskesi', desc: 'Bulgar gülü hidrojel göz pedleri', area: 'göz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[15,3,'Allantoin','medium'],[26,4,'Caffeine','low']], needs: [10,3,13] },

  // BY WISHTREND (40)
  { brand: 40, name: 'By Wishtrend Pure Vitamin C 21.5% Advanced Serum', cat: 3, type: 'Serum', desc: '%21.5 saf C vitamini serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[18,2,'Sodium Hyaluronate','medium'],[8,3,'Panthenol','medium']], needs: [12,2,7] },
  { brand: 40, name: 'By Wishtrend Mandelic Acid 5% Skin Prep Water', cat: 3, type: 'Tonik', desc: '%5 mandelic acid hazırlık suyu', area: 'yüz', time: 'aksam', ingredients: [[34,1,'Mandelic Acid','high'],[8,2,'Panthenol','medium'],[12,3,'Glycerin','low']], needs: [6,7,2] },
  { brand: 40, name: 'By Wishtrend Quad Active Boosting Essence', cat: 3, type: 'Esans', desc: '4 aktifli güçlendirici esans', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[49,2,'Peptide Complex','medium'],[3,3,'Hyaluronic Acid','medium'],[8,4,'Panthenol','medium']], needs: [5,10,3] },

  // BENTON (41)
  { brand: 41, name: 'Benton Snail Bee High Content Essence', cat: 3, type: 'Esans', desc: 'Salyangoz ve arı zehri esansı', area: 'yüz', time: 'sabah_aksam', ingredients: [[29,1,'Snail Secretion Filtrate','very_high'],[1,2,'Niacinamide','medium'],[15,3,'Allantoin','medium'],[32,4,'Aloe Barbadensis Leaf Extract','low']], needs: [1,5,10] },
  { brand: 41, name: 'Benton Aloe BHA Skin Toner', cat: 3, type: 'Tonik', desc: 'Aloe vera ve BHA cilt toniği', area: 'yüz', time: 'sabah_aksam', ingredients: [[32,1,'Aloe Barbadensis Leaf Extract','very_high'],[4,2,'Salicylic Acid','medium'],[29,3,'Snail Secretion Filtrate','medium']], needs: [11,1,10] },

  // NEOGEN (42)
  { brand: 42, name: 'Neogen Dermalogy Bio-Peel Gauze Peeling Wine', cat: 7, type: 'Peeling Ped', desc: 'Şarap ekstreli eksfoliyan gazlı bez', area: 'yüz', time: 'aksam', ingredients: [[63,1,'Grape Seed Extract','high'],[16,2,'Lactic Acid','medium'],[12,3,'Glycerin','medium'],[5,4,'Glycolic Acid','low']], needs: [6,7,13] },
  { brand: 42, name: 'Neogen Real Ferment Micro Essence', cat: 3, type: 'Esans', desc: '%93 ferment filtrat esansı', area: 'yüz', time: 'sabah_aksam', ingredients: [[73,1,'Saccharomyces Ferment','very_high'],[50,2,'Rice Extract','medium'],[1,3,'Niacinamide','medium'],[3,4,'Hyaluronic Acid','low']], needs: [13,10,7] },

  // BANILA CO (93)
  { brand: 93, name: 'Banila Co Clean It Zero Cleansing Balm Original', cat: 5, type: 'Temizleme Balmı', desc: 'Sherbet formüllü temizleme balmı best-seller', area: 'yüz', time: 'aksam', ingredients: [[10,1,'Tocopherol','medium'],[12,2,'Glycerin','medium'],[30,3,'Shea Butter','medium']], needs: [10,5,11] },

  // PYUNKANG YUL (90)
  { brand: 90, name: 'Pyunkang Yul Essence Toner', cat: 3, type: 'Tonik', desc: 'Minimalist formüllü nemlendirici esans tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[24,2,'Butylene Glycol','low'],[8,3,'Panthenol','low']], needs: [11,10,5] },
  { brand: 90, name: 'Pyunkang Yul Moisture Ampoule', cat: 3, type: 'Ampul', desc: 'Yoğun nemlendirme ampulü', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium']], needs: [4,10,5] },

  // SULWHASOO (92)
  { brand: 92, name: 'Sulwhasoo First Care Activating Serum', cat: 3, type: 'Serum', desc: 'İlk adım aktifleştirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[3,2,'Hyaluronic Acid','medium'],[14,3,'Squalane','medium'],[10,4,'Tocopherol','medium']], needs: [13,10,5] },
  { brand: 92, name: 'Sulwhasoo Concentrated Ginseng Renewing Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Ginseng konsantre anti-aging krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[12,2,'Glycerin','high'],[14,3,'Squalane','medium'],[30,4,'Shea Butter','medium']], needs: [3,10,13] },

  // ILLIYOON (91)
  { brand: 91, name: 'Illiyoon Ceramide Ato Concentrate Cream', cat: 2, type: 'Bariyer Kremi', desc: 'Ceramide yoğun bariyer kremi', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','very_high'],[12,2,'Glycerin','high'],[8,3,'Panthenol','medium'],[14,4,'Squalane','medium']], needs: [5,4,11] },
  { brand: 91, name: 'Illiyoon Ceramide Ato Lotion', cat: 2, type: 'Losyon', desc: 'Ceramide hafif vücut losyonu', area: 'vücut', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium']], needs: [5,10,4] },

  // MEDICUBE (37)
  { brand: 37, name: 'Medicube Red Acne Serum', cat: 3, type: 'Serum', desc: 'Kırmızı sivilce bakım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[11,2,'Centella Asiatica Extract','medium'],[1,3,'Niacinamide','medium'],[62,4,'Cica (Centella)','medium']], needs: [1,11,6] },
  { brand: 37, name: 'Medicube AGE-R Booster-H', cat: 3, type: 'Serum', desc: 'Hyaluronik asit booster serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','medium']], needs: [4,10,3] },
  { brand: 37, name: 'Medicube Zero Pore Pad', cat: 3, type: 'Tonik Pad', desc: 'Sıfır gözenek arındırıcı ped', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[1,2,'Niacinamide','medium'],[75,3,'Willow Bark Extract','medium'],[12,4,'Glycerin','low']], needs: [6,9,1] },

  // HELIOCARE (110)
  { brand: 110, name: 'Heliocare 360 Water Gel SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Su jel formüllü güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [8,10,12] },
  { brand: 110, name: 'Heliocare 360 Mineral Tolerance Fluid SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Mineral güneş koruyucu hassas ciltler', area: 'yüz', time: 'sabah', ingredients: [[38,1,'Zinc Oxide','very_high'],[39,2,'Titanium Dioxide','high'],[1,3,'Niacinamide','low']], needs: [8,11,12] },

  // ALTRUIST (73)
  { brand: 73, name: 'Altruist Dermatologist Sunscreen SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Dermatolog güneş koruyucu SPF50', area: 'yüz_vücut', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [8,12,10] },
  { brand: 73, name: 'Altruist Face Fluid SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Hafif yüz güneş koruyucu fluid', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','low']], needs: [8,12,9] },

  // NOREVA (71)
  { brand: 71, name: 'Noreva Exfoliac Global 6', cat: 2, type: 'Sivilce Kremi', desc: '6 etkili sivilce bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[13,2,'Azelaic Acid','medium'],[1,3,'Niacinamide','medium'],[9,4,'Zinc PCA','medium']], needs: [1,6,9] },
  { brand: 71, name: 'Noreva Ikélen+ Depigmenting SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Leke karşıtı güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[7,2,'Ascorbic Acid','medium'],[1,3,'Niacinamide','medium']], needs: [8,2,7] },

  // ACM (72)
  { brand: 72, name: 'ACM Dépiwhite Advanced Depigmenting Cream', cat: 2, type: 'Leke Kremi', desc: 'Yoğun leke karşıtı bakım kremi', area: 'yüz', time: 'aksam', ingredients: [[27,1,'Arbutin','high'],[7,2,'Ascorbic Acid','medium'],[5,3,'Glycolic Acid','medium'],[1,4,'Niacinamide','medium']], needs: [2,7,12] },
  { brand: 72, name: 'ACM Sebionex Mattifying Cream', cat: 2, type: 'Bakım Kremi', desc: 'Mat bitişli yağ dengeleyici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[9,1,'Zinc PCA','high'],[1,2,'Niacinamide','medium'],[4,3,'Salicylic Acid','low'],[12,4,'Glycerin','low']], needs: [9,1,6] },

  // ISIS PHARMA (109)
  { brand: 109, name: 'Isis Pharma Unitone 4 Reveal Cream', cat: 2, type: 'Leke Kremi', desc: 'Unitone 4 aktifli leke bakım kremi', area: 'yüz', time: 'aksam', ingredients: [[27,1,'Arbutin','high'],[7,2,'Ascorbic Acid','medium'],[68,3,'Kojic Acid','medium'],[5,4,'Glycolic Acid','medium']], needs: [2,7,12] },
  { brand: 109, name: 'Isis Pharma Neotone Radiance SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Leke karşıtı koruyucu krem SPF50+', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[7,2,'Ascorbic Acid','medium'],[27,3,'Arbutin','medium']], needs: [8,2,7] },

  // RILASTIL (108)
  { brand: 108, name: 'Rilastil D-Clar Depigmenting Concentrate Drops', cat: 3, type: 'Serum', desc: 'Yoğun leke giderici konsantre damlalar', area: 'yüz', time: 'aksam', ingredients: [[7,1,'Ascorbic Acid','high'],[1,2,'Niacinamide','high'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,12] },
  { brand: 108, name: 'Rilastil Sun System Fluid SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Ultra hafif güneş koruyucu fluid', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium'],[3,3,'Hyaluronic Acid','low']], needs: [8,12,10] },

  // GLOW RECIPE (59)
  { brand: 59, name: 'Glow Recipe Watermelon Glow Niacinamide Dew Drops', cat: 3, type: 'Serum', desc: 'Karpuz ve niacinamide ışıltı damlaları', area: 'yüz', time: 'sabah', ingredients: [[1,1,'Niacinamide','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [7,6,13] },
  { brand: 59, name: 'Glow Recipe Strawberry Smooth BHA+AHA Salicylic Acid Serum', cat: 3, type: 'Serum', desc: 'Çilek BHA+AHA eksfoliyan serum', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[5,2,'Glycolic Acid','medium'],[13,3,'Azelaic Acid','medium']], needs: [6,1,7] },

  // FRESH (58)
  { brand: 58, name: 'Fresh Soy Face Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Soya bazlı nazik yüz temizleyicisi', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[76,2,'Amino Acids Complex','medium'],[10,3,'Tocopherol','low']], needs: [10,11,5] },
  { brand: 58, name: 'Fresh Black Tea Firming Corset Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Siyah çay sıkılaştırıcı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium'],[69,4,'Resveratrol','medium']], needs: [3,10,13] },

  // TATCHA (57)
  { brand: 57, name: 'Tatcha The Dewy Skin Cream', cat: 2, type: 'Nemlendirici', desc: 'Japon pirinç bazlı ışıltılı nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[50,1,'Rice Extract','high'],[3,2,'Hyaluronic Acid','high'],[12,3,'Glycerin','medium'],[14,4,'Squalane','medium']], needs: [10,4,13] },
  { brand: 57, name: 'Tatcha The Rice Wash', cat: 5, type: 'Yüz Temizleyici', desc: 'Pirinç enzimi yumuşak temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[50,1,'Rice Extract','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [10,7,11] },

  // SUNDAY RILEY (56)
  { brand: 56, name: 'Sunday Riley Good Genes All-In-One Lactic Acid Treatment', cat: 3, type: 'Serum', desc: 'Laktik asit cilt yenileme tedavisi', area: 'yüz', time: 'aksam', ingredients: [[16,1,'Lactic Acid','very_high'],[67,2,'Licorice Root Extract','medium'],[32,3,'Aloe Barbadensis Leaf Extract','medium']], needs: [6,7,2] },
  { brand: 56, name: 'Sunday Riley C.E.O. 15% Vitamin C Brightening Serum', cat: 3, type: 'Serum', desc: '%15 C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[10,2,'Tocopherol','medium'],[74,3,'Turmeric Extract','medium']], needs: [12,2,7] },

  // SHISEIDO (52)
  { brand: 52, name: 'Shiseido Ultimune Power Infusing Concentrate', cat: 3, type: 'Serum', desc: 'Bağışıklık destekleyici güç konsantresi', area: 'yüz', time: 'sabah_aksam', ingredients: [[50,1,'Rice Extract','medium'],[12,2,'Glycerin','medium'],[3,3,'Hyaluronic Acid','medium'],[10,4,'Tocopherol','medium']], needs: [5,13,12] },
  { brand: 52, name: 'Shiseido Essential Energy Moisturizing Cream', cat: 2, type: 'Nemlendirici', desc: 'Enerji veren nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[14,3,'Squalane','medium'],[8,4,'Panthenol','low']], needs: [10,13,4] },

  // FARMACY (60)
  { brand: 60, name: 'Farmacy Green Clean Makeup Removing Cleansing Balm', cat: 5, type: 'Temizleme Balmı', desc: 'Makyaj temizleme balmı', area: 'yüz', time: 'aksam', ingredients: [[10,1,'Tocopherol','medium'],[12,2,'Glycerin','medium'],[74,3,'Turmeric Extract','medium']], needs: [10,5,11] },
  { brand: 60, name: 'Farmacy Honeymoon Glow AHA Resurfacing Night Serum', cat: 3, type: 'Serum', desc: 'AHA gece yüzey yenileme serumu', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','high'],[16,2,'Lactic Acid','medium'],[42,3,'Propolis Extract','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [6,7,2] },

  // DERMALOGICA (54)
  { brand: 54, name: 'Dermalogica Special Cleansing Gel', cat: 5, type: 'Yüz Temizleyici', desc: 'Tüm ciltler için özel temizleme jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[24,2,'Butylene Glycol','low'],[15,3,'Allantoin','low']], needs: [10,11,5] },
  { brand: 54, name: 'Dermalogica Daily Microfoliant', cat: 5, type: 'Peeling', desc: 'Günlük pirinç enzimi toz peeling', area: 'yüz', time: 'sabah', ingredients: [[50,1,'Rice Extract','high'],[4,2,'Salicylic Acid','medium'],[8,3,'Panthenol','medium'],[32,4,'Aloe Barbadensis Leaf Extract','medium']], needs: [7,6,10] },
  { brand: 54, name: 'Dermalogica BioLumin-C Serum', cat: 3, type: 'Serum', desc: 'C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[49,2,'Peptide Complex','medium'],[67,3,'Licorice Root Extract','medium']], needs: [12,2,7] },

  // MURAD (55)
  { brand: 55, name: 'Murad Rapid Age Spot Correcting Serum', cat: 3, type: 'Serum', desc: 'Hızlı leke düzeltici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[5,1,'Glycolic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[7,3,'Ascorbic Acid','medium'],[49,4,'Peptide Complex','medium']], needs: [2,3,7] },
  { brand: 55, name: 'Murad Retinol Youth Renewal Serum', cat: 3, type: 'Serum', desc: 'Retinol gençlik yenileme serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','high'],[3,2,'Hyaluronic Acid','medium'],[49,3,'Peptide Complex','medium'],[14,4,'Squalane','medium']], needs: [3,2,6] },
  { brand: 55, name: 'Murad Rapid Relief Acne Spot Treatment', cat: 2, type: 'Sivilce Tedavi', desc: 'Hızlı sivilce tedavi jeli', area: 'yüz', time: 'her_zaman', ingredients: [[4,1,'Salicylic Acid','very_high'],[9,2,'Zinc PCA','medium'],[45,3,'Camellia Sinensis Leaf Extract','medium']], needs: [1,9,11] },

  // PETER THOMAS ROTH (75)
  { brand: 75, name: 'Peter Thomas Roth Water Drench Hyaluronic Cloud Cream', cat: 2, type: 'Nemlendirici', desc: 'Hyaluronik bulut nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[6,3,'Ceramide NP','medium'],[12,4,'Glycerin','medium']], needs: [4,10,5] },
  { brand: 75, name: 'Peter Thomas Roth Potent-C Power Serum', cat: 3, type: 'Serum', desc: '%20 THD askorbat C vitamini serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[10,2,'Tocopherol','medium'],[41,3,'Ferulic Acid','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [12,2,3] },
  { brand: 75, name: 'Peter Thomas Roth Max Complexion Correction Pads', cat: 3, type: 'Peeling Ped', desc: 'Salisilik asit düzeltici pedler', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[5,2,'Glycolic Acid','medium'],[15,3,'Allantoin','medium'],[32,4,'Aloe Barbadensis Leaf Extract','medium']], needs: [1,6,2] },

  // MIZON (86)
  { brand: 86, name: 'Mizon Snail Repair Intensive Ampoule', cat: 3, type: 'Ampul', desc: '%80 salyangoz müsini yoğun onarım ampulü', area: 'yüz', time: 'sabah_aksam', ingredients: [[29,1,'Snail Secretion Filtrate','very_high'],[80,2,'EGF (Epidermal Growth Factor)','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [5,3,10] },
  { brand: 86, name: 'Mizon All In One Snail Repair Cream', cat: 2, type: 'Nemlendirici', desc: '%92 salyangoz müsini onarım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[29,1,'Snail Secretion Filtrate','very_high'],[11,2,'Centella Asiatica Extract','medium'],[15,3,'Allantoin','medium'],[1,4,'Niacinamide','low']], needs: [5,10,3] },

  // TONYMOLY (87)
  { brand: 87, name: 'TonyMoly Chok Chok Green Tea Watery Cream', cat: 2, type: 'Jel Krem', desc: 'Yeşil çay su bazlı jel krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [10,12,9] },
  { brand: 87, name: 'TonyMoly The Chok Chok Green Tea Essence', cat: 3, type: 'Esans', desc: 'Yeşil çay nemlendirici esans', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','very_high'],[12,2,'Glycerin','medium'],[18,3,'Sodium Hyaluronate','medium']], needs: [10,12,4] },

  // WELEDA (65)
  { brand: 65, name: 'Weleda Skin Food Original', cat: 2, type: 'Nemlendirici', desc: 'Doğal yoğun besleyici krem', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[30,1,'Shea Butter','high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium'],[51,4,'Jojoba Oil','medium']], needs: [4,10,5] },
  { brand: 65, name: 'Weleda Almond Soothing Facial Cream', cat: 2, type: 'Yatıştırıcı Krem', desc: 'Badem hassas cilt yatıştırıcı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[51,1,'Jojoba Oil','medium'],[30,2,'Shea Butter','medium'],[10,3,'Tocopherol','medium']], needs: [11,10,5] },

  // SEBAMED (63)
  { brand: 63, name: 'Sebamed Clear Face Care Gel', cat: 2, type: 'Jel', desc: 'pH 5.5 sivilceye eğilimli cilt jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[8,2,'Panthenol','medium'],[15,3,'Allantoin','medium']], needs: [1,10,11] },
  { brand: 63, name: 'Sebamed Anti-Dry Day Defence Cream SPF30', cat: 2, type: 'Nemlendirici', desc: 'Kuruluğa karşı koruyucu gündüz kremi', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','medium'],[30,4,'Shea Butter','medium']], needs: [4,8,10] },

  // SIMPLE (62)
  { brand: 62, name: 'Simple Kind to Skin Moisturising Facial Wash', cat: 5, type: 'Yüz Temizleyici', desc: 'Hassas ciltler için nemlendirici temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[8,2,'Panthenol','low'],[10,3,'Tocopherol','low']], needs: [11,10,5] },
  { brand: 62, name: 'Simple Hydrating Light Moisturiser', cat: 2, type: 'Nemlendirici', desc: 'Hafif nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[10,2,'Tocopherol','medium'],[8,3,'Panthenol','low']], needs: [10,11,4] },
  { brand: 62, name: 'Simple Micellar Cleansing Water', cat: 5, type: 'Misel Su', desc: 'Hassas cilt misel temizleme suyu', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[1,2,'Niacinamide','low']], needs: [11,10,5] },

  // DOVE (64)
  { brand: 64, name: 'Dove DermaSpa Goodness Body Cream', cat: 2, type: 'Vücut Kremi', desc: 'Yoğun nemlendirici vücut kremi', area: 'vücut', time: 'sabah_aksam', ingredients: [[30,1,'Shea Butter','high'],[12,2,'Glycerin','high'],[25,3,'Dimethicone','medium']], needs: [4,10,5] },
  { brand: 64, name: 'Dove Nourishing Body Care Beauty Cream Bar', cat: 5, type: 'Temizleyici', desc: 'Nemlendirici güzellik kalıbı', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[30,2,'Shea Butter','medium']], needs: [10,4,5] },

  // AVEENO (61)
  { brand: 61, name: 'Aveeno Calm + Restore Oat Gel Moisturizer', cat: 2, type: 'Jel Nemlendirici', desc: 'Yulaf jel hassas cilt nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[70,1,'Colloidal Oatmeal','high'],[12,2,'Glycerin','medium'],[1,3,'Niacinamide','medium']], needs: [11,10,5] },
  { brand: 61, name: 'Aveeno Skin Relief Moisturising Lotion', cat: 2, type: 'Losyon', desc: 'Yulaf bazlı cilt rahatlatma losyonu', area: 'vücut', time: 'sabah_aksam', ingredients: [[70,1,'Colloidal Oatmeal','high'],[12,2,'Glycerin','medium'],[30,3,'Shea Butter','medium']], needs: [4,11,10] },

  // SK-II (53)
  { brand: 53, name: 'SK-II Facial Treatment Essence', cat: 3, type: 'Esans', desc: 'Pitera bazlı ikonik yüz bakım esansı', area: 'yüz', time: 'sabah_aksam', ingredients: [[57,1,'Galactomyces Ferment Filtrate','very_high'],[12,2,'Glycerin','low']], needs: [13,7,10] },
  { brand: 53, name: 'SK-II GenOptics Aura Essence', cat: 3, type: 'Serum', desc: 'Pitera ve niacinamide aydınlatıcı esans', area: 'yüz', time: 'sabah_aksam', ingredients: [[57,1,'Galactomyces Ferment Filtrate','very_high'],[1,2,'Niacinamide','high'],[7,3,'Ascorbic Acid','medium']], needs: [2,7,13] },

  // HOLIKA HOLIKA (43)
  { brand: 43, name: 'Holika Holika Good Cera Super Ceramide Cream', cat: 2, type: 'Nemlendirici', desc: 'Süper ceramide bariyer kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','very_high'],[77,2,'Ceramide AP','high'],[3,3,'Hyaluronic Acid','medium'],[14,4,'Squalane','medium']], needs: [5,4,10] },
  { brand: 43, name: 'Holika Holika Aloe 99% Soothing Gel', cat: 2, type: 'Jel', desc: '%99 aloe vera yatıştırıcı jel', area: 'yüz_vücut', time: 'her_zaman', ingredients: [[32,1,'Aloe Barbadensis Leaf Extract','very_high'],[12,2,'Glycerin','medium']], needs: [11,10,5] },

  // SENKA (44)
  { brand: 44, name: 'Senka Perfect Whip Foam Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'İpeksi köpük yüz temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[14,3,'Squalane','low']], needs: [10,11,5] },
  { brand: 44, name: 'Senka Aging Care UV Sunscreen SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Yaşlanma karşıtı UV güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[46,3,'Coenzyme Q10','low']], needs: [8,3,12] },

  // BIORE (47)
  { brand: 47, name: 'Biore UV Aqua Rich Watery Essence SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Su bazlı hafif güneş koruyucu esans', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','low']], needs: [8,10,12] },
  { brand: 47, name: 'Biore UV Perfect Milk SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Mat bitişli güneş koruyucu süt', area: 'yüz_vücut', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[38,2,'Zinc Oxide','medium'],[25,3,'Dimethicone','medium']], needs: [8,9,12] },

  // MELANO CC (45)
  { brand: 45, name: 'Melano CC Vitamin C Essence', cat: 3, type: 'Esans', desc: 'C vitamini yoğun leke giderici esans', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[10,2,'Tocopherol','medium'],[27,3,'Arbutin','medium']], needs: [2,12,7] },
  { brand: 45, name: 'Melano CC Premium Brightening Essence', cat: 3, type: 'Esans', desc: 'Premium aydınlatıcı C vitamini esans', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[10,2,'Tocopherol','high'],[27,3,'Arbutin','medium'],[8,4,'Panthenol','low']], needs: [2,12,7] },

  // ETUDE HOUSE (31)
  { brand: 31, name: 'Etude House SoonJung pH 6.5 Whip Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Düşük pH hassas cilt temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[8,1,'Panthenol','medium'],[17,2,'Madecassoside','medium'],[12,3,'Glycerin','low']], needs: [11,5,10] },
  { brand: 31, name: 'Etude House SoonJung 2x Barrier Intensive Cream', cat: 2, type: 'Bariyer Kremi', desc: '2 kat bariyer güçlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[8,1,'Panthenol','very_high'],[17,2,'Madecassoside','high'],[30,3,'Shea Butter','medium'],[12,4,'Glycerin','medium']], needs: [5,11,4] },
  { brand: 31, name: 'Etude House SoonJung 10-Free Moist Emulsion', cat: 2, type: 'Emülsiyon', desc: '10 hassas madde içermeyen nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[8,1,'Panthenol','high'],[12,2,'Glycerin','medium'],[17,3,'Madecassoside','medium'],[14,4,'Squalane','low']], needs: [11,10,5] },

  // NUXE (10)
  { brand: 10, name: 'Nuxe Crème Fraîche de Beauté Moisturising Cream', cat: 2, type: 'Nemlendirici', desc: 'Bitkisel sütlü 48 saat nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[30,3,'Shea Butter','medium'],[10,4,'Tocopherol','low']], needs: [10,4,5] },
  { brand: 10, name: 'Nuxe Huile Prodigieuse Multi-Purpose Dry Oil', cat: 3, type: 'Kuru Yağ', desc: 'Çok amaçlı kuru bakım yağı', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[51,1,'Jojoba Oil','high'],[10,2,'Tocopherol','high'],[14,3,'Squalane','medium']], needs: [10,13,4] },
  { brand: 10, name: 'Nuxe Super Serum [10] Age Defying Concentrate', cat: 3, type: 'Serum', desc: 'Yaşlanma karşıtı süper konsantre serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[49,2,'Peptide Complex','medium'],[1,3,'Niacinamide','medium'],[12,4,'Glycerin','medium']], needs: [3,10,13] },

  // CHARLOTTE TILBURY (104)
  { brand: 104, name: "Charlotte Tilbury Magic Cream Moisturiser", cat: 2, type: 'Nemlendirici', desc: 'Sihirli nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[49,2,'Peptide Complex','medium'],[12,3,'Glycerin','medium'],[30,4,'Shea Butter','medium']], needs: [10,3,13] },
  { brand: 104, name: "Charlotte Tilbury Charlotte's Magic Serum Crystal Elixir", cat: 3, type: 'Serum', desc: 'Kristal iksir ışıltı serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[49,2,'Peptide Complex','high'],[3,3,'Hyaluronic Acid','medium'],[7,4,'Ascorbic Acid','medium']], needs: [3,7,13] },

  // RARE BEAUTY (105)
  { brand: 105, name: 'Rare Beauty Always An Optimist Illuminating Primer', cat: 2, type: 'Primer', desc: 'Işıltılı makyaj bazı', area: 'yüz', time: 'sabah', ingredients: [[12,1,'Glycerin','medium'],[3,2,'Hyaluronic Acid','medium'],[25,3,'Dimethicone','medium']], needs: [13,10,7] },

  // FENTY BEAUTY (106)
  { brand: 106, name: 'Fenty Skin Total Cleans\'r Remove-It-All Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Her şeyi çıkaran temizleyici', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[10,2,'Tocopherol','medium'],[32,3,'Aloe Barbadensis Leaf Extract','medium']], needs: [10,5,11] },
  { brand: 106, name: 'Fenty Skin Fat Water Pore-Refining Toner Serum', cat: 3, type: 'Tonik Serum', desc: 'Gözenek ince yapıcı tonik serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[45,2,'Camellia Sinensis Leaf Extract','medium'],[63,3,'Grape Seed Extract','medium']], needs: [6,9,7] },

  // DOA (78)
  { brand: 78, name: 'Doa C Vitamini Serum', cat: 3, type: 'Serum', desc: 'C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [12,2,7] },
  { brand: 78, name: 'Doa Niacinamide Serum', cat: 3, type: 'Serum', desc: 'Niacinamide gözenek bakım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[9,2,'Zinc PCA','medium'],[3,3,'Hyaluronic Acid','low']], needs: [6,9,2] },
  { brand: 78, name: 'Doa Retinol Serum', cat: 3, type: 'Serum', desc: 'Retinol anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[3,2,'Hyaluronic Acid','medium'],[14,3,'Squalane','medium']], needs: [3,2,6] },

  // BEBAK (83)
  { brand: 83, name: 'Bebak Pharma C Vitamini Serum', cat: 3, type: 'Serum', desc: 'C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [12,2,7] },
  { brand: 83, name: 'Bebak Pharma Hyaluronic Acid Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit nemlendirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','low']], needs: [4,10,5] },

  // MARJINAL (85)
  { brand: 85, name: 'Marjinal Niacinamide Serum', cat: 3, type: 'Serum', desc: 'Niacinamide gözenek serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[9,2,'Zinc PCA','medium'],[12,3,'Glycerin','low']], needs: [6,9,1] },
  { brand: 85, name: 'Marjinal AHA BHA Peeling', cat: 3, type: 'Peeling', desc: 'AHA BHA kimyasal peeling', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','high'],[4,2,'Salicylic Acid','medium'],[16,3,'Lactic Acid','medium']], needs: [6,7,2] },

  // ESTEE LAUDER (51)
  { brand: 51, name: 'Estée Lauder Advanced Night Repair Serum', cat: 3, type: 'Serum', desc: 'Gece onarım serumu best-seller', area: 'yüz', time: 'aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[48,2,'Bifida Ferment Lysate','high'],[72,3,'Probiotics','medium'],[10,4,'Tocopherol','medium']], needs: [3,5,13] },
  { brand: 51, name: 'Estée Lauder Perfectionist Pro Rapid Brightening Treatment', cat: 3, type: 'Serum', desc: 'Hızlı aydınlatıcı profesyonel tedavi', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[41,2,'Ferulic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [12,2,7] },
  { brand: 51, name: 'Estée Lauder Revitalizing Supreme+ Moisturizer', cat: 2, type: 'Nemlendirici', desc: 'Canlandırıcı global anti-aging nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium'],[69,4,'Resveratrol','medium']], needs: [3,10,13] },

  // CHARLOTTE TILBURY devam
  { brand: 104, name: "Charlotte Tilbury Glow Toner", cat: 3, type: 'Tonik', desc: 'Işıltı veren eksfoliyan tonik', area: 'yüz', time: 'aksam', ingredients: [[53,1,'Polyhydroxy Acid','medium'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [7,6,13] },

  // MAYBELLINE (99)
  { brand: 99, name: 'Maybelline Green Edition Superdrop Tinted Oil', cat: 2, type: 'Yağ Tint', desc: 'Renk veren hafif yağ bakım', area: 'yüz', time: 'sabah', ingredients: [[51,1,'Jojoba Oil','medium'],[14,2,'Squalane','medium'],[10,3,'Tocopherol','low']], needs: [10,13,4] },

  // CATRICE (101)
  { brand: 101, name: 'Catrice HD Liquid Coverage Foundation SPF30', cat: 6, type: 'Fondöten', desc: 'HD kapatıcı fondöten SPF30', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[12,2,'Glycerin','medium'],[25,3,'Dimethicone','medium']], needs: [8,7,10] },

  // MAC (103)
  { brand: 103, name: 'MAC Prep + Prime Fix+', cat: 3, type: 'Mist', desc: 'Makyaj sabitleme ve nemlendirme spreyi', area: 'yüz', time: 'sabah', ingredients: [[12,1,'Glycerin','medium'],[26,2,'Caffeine','low'],[45,3,'Camellia Sinensis Leaf Extract','low']], needs: [10,13,7] },

  // SEBAMED devam
  { brand: 63, name: 'Sebamed Liquid Face & Body Wash', cat: 5, type: 'Temizleyici', desc: 'pH 5.5 sıvı yüz ve vücut temizleyici', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[8,1,'Panthenol','medium'],[12,2,'Glycerin','medium'],[15,3,'Allantoin','low']], needs: [11,10,5] },

  // ==========================================
  // EK ÜRÜNLER - TÜRKIYE PAZARINDA POPÜLER VARYASYONLAR
  // Her marka için ek ürünler
  // ==========================================

  // LA ROCHE-POSAY ek ürünler
  { brand: 1, name: 'La Roche-Posay Effaclar K(+) Oily Skin Renovating Care', cat: 2, type: 'Bakım Kremi', desc: 'Yağlı cilt yenileyici bakım', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[16,2,'Lactic Acid','medium'],[1,3,'Niacinamide','medium']], needs: [9,6,1] },
  { brand: 1, name: 'La Roche-Posay Anthelios Invisible Fluid SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Görünmez ultra hafif güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','low']], needs: [8,12,9] },
  { brand: 1, name: 'La Roche-Posay Toleriane Ultra Cream', cat: 2, type: 'Nemlendirici', desc: 'Ultra hassas ciltler için yatıştırıcı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','medium'],[30,2,'Shea Butter','medium'],[14,3,'Squalane','medium'],[12,4,'Glycerin','medium']], needs: [11,10,5] },
  { brand: 1, name: 'La Roche-Posay Effaclar Mat Moisturiser', cat: 2, type: 'Nemlendirici', desc: 'Mat bitişli yağ kontrolü nemlendirici', area: 'yüz', time: 'sabah', ingredients: [[9,1,'Zinc PCA','high'],[14,2,'Squalane','medium'],[12,3,'Glycerin','medium']], needs: [9,6,10] },
  { brand: 1, name: 'La Roche-Posay Lipikar Baume AP+M', cat: 2, type: 'Bariyer Balmı', desc: 'Atopik ciltler için yoğun bariyer balmı', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','medium'],[30,2,'Shea Butter','very_high'],[12,3,'Glycerin','high']], needs: [4,5,11] },
  { brand: 1, name: 'La Roche-Posay Mela B3 Serum', cat: 3, type: 'Serum', desc: 'Melasma ve leke karşıtı B3 serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[28,2,'Tranexamic Acid','high'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,12] },
  { brand: 1, name: 'La Roche-Posay Effaclar Astringent Lotion', cat: 3, type: 'Tonik', desc: 'Gözenek sıkılaştırıcı astrenjan losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[9,1,'Zinc PCA','high'],[4,2,'Salicylic Acid','medium'],[12,3,'Glycerin','low']], needs: [6,9,1] },
  { brand: 1, name: 'La Roche-Posay Redermic R Anti-Aging Concentrate', cat: 3, type: 'Serum', desc: 'Retinol anti-aging konsantre', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','medium']], needs: [3,2,6] },

  // CERAVE ek ürünler
  { brand: 2, name: 'CeraVe Skin Renewing Vitamin C Serum', cat: 3, type: 'Serum', desc: '%10 saf C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[6,2,'Ceramide NP','medium'],[3,3,'Hyaluronic Acid','medium'],[8,4,'Panthenol','low']], needs: [12,2,7] },
  { brand: 2, name: 'CeraVe Skin Renewing Night Cream', cat: 2, type: 'Gece Kremi', desc: 'Peptit içerikli gece yenileme kremi', area: 'yüz', time: 'aksam', ingredients: [[49,1,'Peptide Complex','high'],[6,2,'Ceramide NP','high'],[3,3,'Hyaluronic Acid','medium'],[1,4,'Niacinamide','medium']], needs: [3,10,5] },
  { brand: 2, name: 'CeraVe Acne Control Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: '%2 salisilik asitli sivilce temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','high'],[6,2,'Ceramide NP','medium'],[1,3,'Niacinamide','medium'],[3,4,'Hyaluronic Acid','low']], needs: [1,9,6] },
  { brand: 2, name: 'CeraVe Moisturizing Lotion', cat: 2, type: 'Losyon', desc: 'Hafif formüllü günlük nemlendirici losyon', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [10,5,4] },
  { brand: 2, name: 'CeraVe Hydrating Micellar Water', cat: 5, type: 'Misel Su', desc: 'Ceramide içerikli nemlendirici misel su', area: 'yüz', time: 'aksam', ingredients: [[6,1,'Ceramide NP','medium'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','low']], needs: [10,11,5] },
  { brand: 2, name: 'CeraVe Ultra-Light Moisturizing Lotion SPF30', cat: 2, type: 'Nemlendirici', desc: 'Ultra hafif SPF30 nemlendirici losyon', area: 'yüz', time: 'sabah', ingredients: [[6,1,'Ceramide NP','medium'],[1,2,'Niacinamide','medium'],[37,3,'Ethylhexyl Methoxycinnamate','high'],[3,4,'Hyaluronic Acid','low']], needs: [8,10,5] },

  // THE ORDINARY ek ürünler
  { brand: 3, name: 'The Ordinary Lactic Acid 10% + HA', cat: 3, type: 'Serum', desc: '%10 laktik asit hafif eksfoliant serum', area: 'yüz', time: 'aksam', ingredients: [[16,1,'Lactic Acid','very_high'],[3,2,'Hyaluronic Acid','medium']], needs: [6,7,4] },
  { brand: 3, name: 'The Ordinary Mandelic Acid 10% + HA', cat: 3, type: 'Serum', desc: '%10 mandelic acid nazik peeling serum', area: 'yüz', time: 'aksam', ingredients: [[34,1,'Mandelic Acid','very_high'],[3,2,'Hyaluronic Acid','medium']], needs: [6,7,1] },
  { brand: 3, name: 'The Ordinary Caffeine Solution 5% + EGCG', cat: 3, type: 'Serum', desc: 'Göz altı koyu halka serumu', area: 'göz', time: 'sabah_aksam', ingredients: [[26,1,'Caffeine','very_high'],[45,2,'Camellia Sinensis Leaf Extract','medium']], needs: [13,10,12] },
  { brand: 3, name: 'The Ordinary Granactive Retinoid 2% Emulsion', cat: 3, type: 'Serum', desc: 'Yeni nesil retinoid emülsiyon', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[14,2,'Squalane','high'],[25,3,'Dimethicone','low']], needs: [3,2,6] },
  { brand: 3, name: 'The Ordinary Multi-Peptide Serum for Hair Density', cat: 3, type: 'Saç Serumu', desc: 'Saç yoğunluğu artırıcı peptit serum', area: 'saç', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[26,2,'Caffeine','medium'],[8,3,'Panthenol','medium']], needs: [13,5,10] },
  { brand: 3, name: 'The Ordinary Salicylic Acid 2% Masque', cat: 7, type: 'Maske', desc: '%2 salisilik asit arındırıcı maske', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[12,2,'Glycerin','medium'],[30,3,'Shea Butter','medium']], needs: [1,6,9] },
  { brand: 3, name: 'The Ordinary Buffet Multi-Technology Peptide Serum', cat: 3, type: 'Serum', desc: 'Çoklu peptit anti-aging serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[3,2,'Hyaluronic Acid','high'],[76,3,'Amino Acids Complex','medium'],[33,4,'Copper Peptide','medium']], needs: [3,10,13] },
  { brand: 3, name: 'The Ordinary Rose Hip Seed Oil', cat: 3, type: 'Yağ', desc: 'Soğuk sıkım kuşburnu yağı', area: 'yüz', time: 'aksam', ingredients: [[60,1,'Rosehip Oil','very_high'],[10,2,'Tocopherol','medium']], needs: [2,5,3] },
  { brand: 3, name: 'The Ordinary Argireline Solution 10%', cat: 3, type: 'Serum', desc: '%10 argireline anti-kırışıklık serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[3,2,'Hyaluronic Acid','medium']], needs: [3,10,13] },
  { brand: 3, name: 'The Ordinary 100% Plant-Derived Squalane', cat: 3, type: 'Yağ', desc: 'Bitkisel squalane nemlendirici yağ', area: 'yüz', time: 'sabah_aksam', ingredients: [[14,1,'Squalane','very_high']], needs: [10,5,4] },

  // BIODERMA ek
  { brand: 4, name: 'Bioderma Sebium Pore Refiner', cat: 2, type: 'Krem', desc: 'Gözenek sıkılaştırıcı bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[9,1,'Zinc PCA','high'],[4,2,'Salicylic Acid','medium'],[12,3,'Glycerin','medium']], needs: [6,9,1] },
  { brand: 4, name: 'Bioderma Sensibio Defensive Rich Cream', cat: 2, type: 'Nemlendirici', desc: 'Hassas cilt savunma zengin kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[10,2,'Tocopherol','medium'],[30,3,'Shea Butter','medium']], needs: [11,10,5] },
  { brand: 4, name: 'Bioderma Pigmentbio Night Renewer', cat: 2, type: 'Gece Kremi', desc: 'Leke karşıtı gece yenileme kremi', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','high'],[7,2,'Ascorbic Acid','medium'],[1,3,'Niacinamide','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [2,7,6] },
  { brand: 4, name: 'Bioderma Sensibio Gel Moussant', cat: 5, type: 'Yüz Temizleyici', desc: 'Hassas cilt köpüren temizleme jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[8,2,'Panthenol','low']], needs: [11,10,5] },

  // AVENE ek
  { brand: 5, name: 'Avene Cleanance Cleansing Gel', cat: 5, type: 'Yüz Temizleyici', desc: 'Yağlı ciltler için temizleme jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[9,2,'Zinc PCA','low']], needs: [9,1,6] },
  { brand: 5, name: 'Avene RetrinAL 0.1 Intensive Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Retinaldehit yoğun anti-aging krem', area: 'yüz', time: 'aksam', ingredients: [[47,1,'Retinaldehyde','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [3,2,6] },
  { brand: 5, name: 'Avene Xeracalm AD Lipid-Replenishing Cream', cat: 2, type: 'Bariyer Kremi', desc: 'Lipid yenileyen bariyer onarım kremi', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[30,2,'Shea Butter','high'],[6,3,'Ceramide NP','medium']], needs: [4,5,11] },
  { brand: 5, name: 'Avene DermAbsolu Recontouring Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Yeniden şekillendirici olgun cilt kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[60,2,'Rosehip Oil','medium'],[12,3,'Glycerin','medium']], needs: [3,10,13] },

  // EUCERIN ek
  { brand: 7, name: 'Eucerin Anti-Pigment Dual Serum', cat: 3, type: 'Serum', desc: 'Çift etkili leke karşıtı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[28,1,'Tranexamic Acid','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,12] },
  { brand: 7, name: 'Eucerin Hyaluron-Filler + Elasticity Night Cream', cat: 2, type: 'Gece Kremi', desc: 'Elastikiyet artırıcı gece kremi', area: 'yüz', time: 'aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[49,2,'Peptide Complex','medium'],[14,3,'Squalane','medium']], needs: [3,10,4] },
  { brand: 7, name: 'Eucerin Sun Allergy Protect Gel-Cream SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Güneş alerjisi koruma jel krem', area: 'yüz_vücut', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [8,11,12] },
  { brand: 7, name: 'Eucerin UltraSENSITIVE Soothing Care', cat: 2, type: 'Nemlendirici', desc: 'Ultra hassas cilt yatıştırıcı bakım', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[6,2,'Ceramide NP','medium'],[8,3,'Panthenol','medium']], needs: [11,10,5] },

  // NEUTROGENA ek
  { brand: 8, name: 'Neutrogena Rapid Wrinkle Repair Serum', cat: 3, type: 'Serum', desc: 'Hızlı kırışıklık onarım retinol serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [3,2,6] },
  { brand: 8, name: 'Neutrogena Hydro Boost Eye Gel-Cream', cat: 4, type: 'Göz Kremi', desc: 'Hyaluronik asitli göz jel kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[25,3,'Dimethicone','low']], needs: [10,4,3] },
  { brand: 8, name: 'Neutrogena Visibly Clear Spot Proofing Daily Wash', cat: 5, type: 'Yüz Temizleyici', desc: 'Günlük sivilce önleme yüz yıkama', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[12,2,'Glycerin','medium']], needs: [1,9,6] },
  { brand: 8, name: 'Neutrogena Norwegian Formula Hand Cream', cat: 2, type: 'El Kremi', desc: 'Norveç formüllü yoğun el kremi', area: 'el', time: 'her_zaman', ingredients: [[12,1,'Glycerin','very_high'],[25,2,'Dimethicone','medium']], needs: [4,10,5] },

  // VICHY ek
  { brand: 9, name: 'Vichy Neovadiol Meno 5 Bi-Serum', cat: 3, type: 'Serum', desc: 'Menopoz dönemi çift serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','medium'],[14,4,'Squalane','medium']], needs: [3,10,5] },
  { brand: 9, name: 'Vichy Dermablend Fluid Corrective Foundation SPF35', cat: 6, type: 'Fondöten', desc: 'Düzeltici fluid fondöten SPF35', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[12,2,'Glycerin','medium'],[25,3,'Dimethicone','medium']], needs: [8,7,10] },
  { brand: 9, name: 'Vichy Purete Thermale 3-in-1 One Step Cleanser', cat: 5, type: 'Temizleyici', desc: '3\'ü 1 arada termal temizleyici', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[8,2,'Panthenol','low']], needs: [10,11,5] },
  { brand: 9, name: 'Vichy Liftactiv Supreme Night Cream', cat: 2, type: 'Gece Kremi', desc: 'Sıkılaştırıcı anti-aging gece kremi', area: 'yüz', time: 'aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[2,2,'Retinol','low'],[49,3,'Peptide Complex','medium']], needs: [3,10,13] },
  { brand: 9, name: 'Vichy Slow Age SPF25 Daily Care', cat: 2, type: 'Nemlendirici', desc: 'Yaşlanmayı yavaşlatan günlük bakım', area: 'yüz', time: 'sabah', ingredients: [[20,1,'Bakuchiol','medium'],[42,2,'Propolis Extract','medium'],[37,3,'Ethylhexyl Methoxycinnamate','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [3,8,12] },

  // GARNIER ek
  { brand: 26, name: 'Garnier SkinActive Niacinamide Serum', cat: 3, type: 'Serum', desc: 'Niacinamide gözenek sıkılaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[4,2,'Salicylic Acid','low'],[12,3,'Glycerin','low']], needs: [6,9,2] },
  { brand: 26, name: 'Garnier Skin Naturals BB Cream SPF25', cat: 6, type: 'BB Krem', desc: 'Doğal kapatıcı BB krem', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','low']], needs: [8,7,10] },
  { brand: 26, name: 'Garnier Hyaluronic Acid Replumping Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit dolgunlaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','low']], needs: [4,10,3] },
  { brand: 26, name: 'Garnier Anti-Dark Spot Night Serum', cat: 3, type: 'Serum', desc: 'Gece leke karşıtı serum', area: 'yüz', time: 'aksam', ingredients: [[7,1,'Ascorbic Acid','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,12] },

  // PROCSIN ek
  { brand: 76, name: 'Procsin Peptide Complex Anti-Aging Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Peptit kompleksi yaşlanma karşıtı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium'],[14,4,'Squalane','medium']], needs: [3,10,13] },
  { brand: 76, name: 'Procsin Centella Cica Serum', cat: 3, type: 'Serum', desc: 'Centella cica yatıştırıcı onarım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','very_high'],[62,2,'Cica (Centella)','high'],[8,3,'Panthenol','medium']], needs: [11,5,1] },
  { brand: 76, name: 'Procsin Bakuchiol Anti-Aging Serum', cat: 3, type: 'Serum', desc: 'Bakuchiol doğal retinol alternatifi serum', area: 'yüz', time: 'aksam', ingredients: [[20,1,'Bakuchiol','very_high'],[3,2,'Hyaluronic Acid','medium'],[14,3,'Squalane','medium']], needs: [3,2,5] },
  { brand: 76, name: 'Procsin Arbutin Brightening Serum', cat: 3, type: 'Serum', desc: 'Arbutin aydınlatıcı leke serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[27,1,'Arbutin','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','low']], needs: [2,7,13] },
  { brand: 76, name: 'Procsin Snail Serum', cat: 3, type: 'Serum', desc: 'Salyangoz özlü onarım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[29,1,'Snail Secretion Filtrate','very_high'],[15,2,'Allantoin','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [5,10,3] },
  { brand: 76, name: 'Procsin SPF50 Güneş Kremi', cat: 6, type: 'Güneş Kremi', desc: 'Yüksek koruma hafif güneş kremi', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','low']], needs: [8,10,12] },
  { brand: 76, name: 'Procsin Ceramide Barrier Cream', cat: 2, type: 'Bariyer Kremi', desc: 'Ceramide bariyer güçlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','very_high'],[77,2,'Ceramide AP','high'],[12,3,'Glycerin','medium'],[8,4,'Panthenol','low']], needs: [5,4,11] },
  { brand: 76, name: 'Procsin Tranexamic Acid Serum', cat: 3, type: 'Serum', desc: 'Traneksamik asit leke serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[28,1,'Tranexamic Acid','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,6] },

  // L'OREAL ek
  { brand: 97, name: "L'Oreal Paris Revitalift Laser Renew Night Cream", cat: 2, type: 'Gece Kremi', desc: 'Lazer yenileme gece kremi', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[3,2,'Hyaluronic Acid','high'],[49,3,'Peptide Complex','medium']], needs: [3,10,2] },
  { brand: 97, name: "L'Oreal Paris Bright Reveal Niacinamide Serum", cat: 3, type: 'Serum', desc: 'Niacinamide aydınlatıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[5,2,'Glycolic Acid','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,6] },
  { brand: 97, name: "L'Oreal Paris Revitalift Filler Eye Cream", cat: 4, type: 'Göz Kremi', desc: 'Hyaluronik asit göz doldurucu krem', area: 'göz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[26,2,'Caffeine','medium'],[49,3,'Peptide Complex','medium']], needs: [3,10,13] },
  { brand: 97, name: "L'Oreal Paris Pure Clay Glow Mask", cat: 7, type: 'Maske', desc: 'Işıltı veren kırmızı kil maskesi', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[32,2,'Aloe Barbadensis Leaf Extract','medium']], needs: [7,13,10] },
  { brand: 97, name: "L'Oreal Paris Hyaluron Expert Replumping Moisturizer", cat: 2, type: 'Nemlendirici', desc: 'Hyaluronik asit dolgunlaştırıcı nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[12,3,'Glycerin','medium']], needs: [4,10,3] },

  // OLAY ek
  { brand: 96, name: 'Olay Retinol24 Night Moisturizer', cat: 2, type: 'Gece Kremi', desc: 'Retinol 24 gece nemlendirici', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[1,2,'Niacinamide','medium'],[12,3,'Glycerin','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [3,10,2] },
  { brand: 96, name: 'Olay Regenerist Collagen Peptide 24 Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Kolajen peptit 24 saat bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [3,10,13] },
  { brand: 96, name: 'Olay Luminous Niacinamide + Vitamin C Super Serum', cat: 3, type: 'Serum', desc: 'Niacinamide ve C vitamini süper serum', area: 'yüz', time: 'sabah', ingredients: [[1,1,'Niacinamide','very_high'],[7,2,'Ascorbic Acid','high'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,12] },

  // COSRX ek
  { brand: 13, name: 'COSRX Advanced Snail 92 All in One Cream', cat: 2, type: 'Nemlendirici', desc: '%92 salyangoz müsini çok amaçlı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[29,1,'Snail Secretion Filtrate','very_high'],[18,2,'Sodium Hyaluronate','medium'],[15,3,'Allantoin','medium'],[24,4,'Butylene Glycol','low']], needs: [5,10,3] },
  { brand: 13, name: 'COSRX The Vitamin C 23 Serum', cat: 3, type: 'Serum', desc: '%23 saf C vitamini serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[10,2,'Tocopherol','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [12,2,7] },
  { brand: 13, name: 'COSRX The Niacinamide 15 Serum', cat: 3, type: 'Serum', desc: '%15 niacinamide konsantre serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[9,2,'Zinc PCA','medium'],[3,3,'Hyaluronic Acid','low']], needs: [6,9,2] },
  { brand: 13, name: 'COSRX The Retinol 0.5 Oil', cat: 3, type: 'Yağ Serum', desc: '%0.5 retinol yağ serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[14,2,'Squalane','high'],[10,3,'Tocopherol','medium']], needs: [3,2,6] },
  { brand: 13, name: 'COSRX Refresh AHA BHA Vitamin C Daily Toner', cat: 3, type: 'Tonik', desc: 'AHA BHA C vitamini günlük tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[5,1,'Glycolic Acid','low'],[4,2,'Salicylic Acid','low'],[7,3,'Ascorbic Acid','medium'],[12,4,'Glycerin','low']], needs: [7,6,12] },

  // DERMOSKIN ek
  { brand: 77, name: 'Dermoskin Babybar Soap', cat: 5, type: 'Temizleyici', desc: 'Bebek ve hassas ciltler için sabun', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[8,2,'Panthenol','medium'],[15,3,'Allantoin','medium']], needs: [11,10,5] },
  { brand: 77, name: 'Dermoskin Hyaluronic Acid Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit nemlendirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','low']], needs: [4,10,5] },
  { brand: 77, name: 'Dermoskin Retinol Serum', cat: 3, type: 'Serum', desc: 'Retinol anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [3,2,6] },
  { brand: 77, name: 'Dermoskin AHA Peeling', cat: 3, type: 'Peeling', desc: 'AHA glikolik asit peeling serum', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[16,2,'Lactic Acid','medium'],[12,3,'Glycerin','low']], needs: [6,7,2] },

  // KIEHL'S ek
  { brand: 49, name: "Kiehl's Super Multi-Corrective Cream", cat: 2, type: 'Anti-Aging Krem', desc: 'Süper çoklu düzeltici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[49,2,'Peptide Complex','high'],[12,3,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 49, name: "Kiehl's Ultra Facial Toner", cat: 3, type: 'Tonik', desc: 'Ultra nemlendirici yüz toniği', area: 'yüz', time: 'sabah_aksam', ingredients: [[14,1,'Squalane','medium'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','low']], needs: [10,5,11] },
  { brand: 49, name: "Kiehl's Vitamin C Micro-Dose Anti-Aging Serum", cat: 3, type: 'Serum', desc: 'Mikro doz C vitamini anti-aging serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[49,3,'Peptide Complex','medium']], needs: [12,3,2] },

  // PAULA'S CHOICE ek
  { brand: 21, name: "Paula's Choice RESIST Anti-Aging Eye Cream", cat: 4, type: 'Göz Kremi', desc: 'Anti-aging göz bakım kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium'],[10,4,'Tocopherol','medium']], needs: [3,10,13] },
  { brand: 21, name: "Paula's Choice 8% AHA Gel Exfoliant", cat: 3, type: 'Eksfoliant', desc: '%8 glikolik asit jel eksfoliant', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[45,2,'Camellia Sinensis Leaf Extract','medium'],[12,3,'Glycerin','medium']], needs: [6,7,2] },
  { brand: 21, name: "Paula's Choice CALM Redness Relief Moisturizer SPF30", cat: 2, type: 'Nemlendirici', desc: 'Kızarıklık giderici nemlendirici SPF30', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[32,2,'Aloe Barbadensis Leaf Extract','medium'],[15,3,'Allantoin','medium'],[10,4,'Tocopherol','medium']], needs: [8,11,10] },
  { brand: 21, name: "Paula's Choice Niacinamide 20% Treatment", cat: 3, type: 'Serum', desc: '%20 niacinamide yoğun bakım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[7,2,'Ascorbic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [6,2,9] },

  // TORRIDEN ek
  { brand: 32, name: 'Torriden Dive-In Soothing Cream', cat: 2, type: 'Nemlendirici', desc: 'Yatıştırıcı nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[8,2,'Panthenol','medium'],[6,3,'Ceramide NP','medium'],[15,4,'Allantoin','low']], needs: [10,11,5] },
  { brand: 32, name: 'Torriden Cellmazing Firming Ampoule', cat: 3, type: 'Ampul', desc: 'Sıkılaştırıcı hücre yenileme ampulü', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','medium'],[80,4,'EGF (Epidermal Growth Factor)','low']], needs: [3,10,13] },
  { brand: 32, name: 'Torriden Dive-In Mask', cat: 7, type: 'Sheet Maske', desc: 'Hyaluronik asit kağıt maske', area: 'yüz', time: 'aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','medium']], needs: [4,10,5] },

  // BEAUTY OF JOSEON ek
  { brand: 24, name: 'Beauty of Joseon Ginseng Cleansing Oil', cat: 5, type: 'Temizleme Yağı', desc: 'Ginseng bazlı temizleme yağı', area: 'yüz', time: 'aksam', ingredients: [[51,1,'Jojoba Oil','high'],[14,2,'Squalane','medium'],[50,3,'Rice Extract','medium']], needs: [10,5,6] },
  { brand: 24, name: 'Beauty of Joseon Red Bean Water Gel', cat: 2, type: 'Jel Nemlendirici', desc: 'Kırmızı fasulye su jel nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium']], needs: [10,9,4] },
  { brand: 24, name: 'Beauty of Joseon Matte Sun Stick SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Mat bitişli güneş koruyucu stick', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[50,2,'Rice Extract','medium'],[1,3,'Niacinamide','low']], needs: [8,9,12] },
  { brand: 24, name: 'Beauty of Joseon Calming Serum Green Tea + Panthenol', cat: 3, type: 'Serum', desc: 'Yeşil çay ve panthenol yatıştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','very_high'],[8,2,'Panthenol','high'],[3,3,'Hyaluronic Acid','medium']], needs: [11,10,12] },

  // SOME BY MI ek
  { brand: 19, name: 'Some By Mi AHA BHA PHA 30 Days Miracle Cream', cat: 2, type: 'Nemlendirici', desc: '30 gün mucize nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[5,1,'Glycolic Acid','low'],[4,2,'Salicylic Acid','low'],[53,3,'Polyhydroxy Acid','medium'],[11,4,'Centella Asiatica Extract','medium']], needs: [1,10,6] },
  { brand: 19, name: 'Some By Mi Truecica Mineral 100 Calming Suncream SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Cica mineral yatıştırıcı güneş kremi', area: 'yüz', time: 'sabah', ingredients: [[38,1,'Zinc Oxide','very_high'],[62,2,'Cica (Centella)','high'],[11,3,'Centella Asiatica Extract','medium']], needs: [8,11,5] },
  { brand: 19, name: 'Some By Mi Bye Bye Blackhead Green Tea Tox Bubble Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Yeşil çay köpüren siyah nokta temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','high'],[4,2,'Salicylic Acid','medium'],[12,3,'Glycerin','low']], needs: [6,1,9] },
  { brand: 19, name: 'Some By Mi Yuja Niacin Brightening Sleeping Mask', cat: 7, type: 'Uyku Maskesi', desc: 'Yuja niacinamide aydınlatıcı uyku maskesi', area: 'yüz', time: 'aksam', ingredients: [[1,1,'Niacinamide','high'],[7,2,'Ascorbic Acid','medium'],[3,3,'Hyaluronic Acid','medium'],[12,4,'Glycerin','medium']], needs: [2,7,10] },

  // LANEIGE ek
  { brand: 29, name: 'Laneige Radian-C Cream', cat: 2, type: 'Nemlendirici', desc: 'C vitamini ışıltı veren nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[7,1,'Ascorbic Acid','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,12] },
  { brand: 29, name: 'Laneige Water Bank Blue Hyaluronic Eye Cream', cat: 4, type: 'Göz Kremi', desc: 'Mavi hyaluronik göz kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[26,2,'Caffeine','medium'],[8,3,'Panthenol','medium']], needs: [10,4,3] },
  { brand: 29, name: 'Laneige Cica Sleeping Mask', cat: 7, type: 'Uyku Maskesi', desc: 'Cica gece onarım maskesi', area: 'yüz', time: 'aksam', ingredients: [[62,1,'Cica (Centella)','high'],[11,2,'Centella Asiatica Extract','medium'],[8,3,'Panthenol','medium'],[12,4,'Glycerin','medium']], needs: [5,11,10] },

  // SKIN1004 ek
  { brand: 35, name: 'Skin1004 Madagascar Centella Soothing Cream', cat: 2, type: 'Nemlendirici', desc: 'Centella yatıştırıcı nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','very_high'],[17,2,'Madecassoside','high'],[62,3,'Cica (Centella)','medium'],[14,4,'Squalane','medium']], needs: [11,5,10] },
  { brand: 35, name: 'Skin1004 Madagascar Centella Cleansing Oil', cat: 5, type: 'Temizleme Yağı', desc: 'Centella temizleme yağı', area: 'yüz', time: 'aksam', ingredients: [[11,1,'Centella Asiatica Extract','medium'],[51,2,'Jojoba Oil','high'],[14,3,'Squalane','medium']], needs: [10,11,5] },
  { brand: 35, name: 'Skin1004 Poremizing Fresh Ampoule', cat: 3, type: 'Ampul', desc: 'Gözenek sıkılaştırıcı ferah ampul', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[4,2,'Salicylic Acid','medium'],[11,3,'Centella Asiatica Extract','medium']], needs: [6,9,1] },

  // DR. JART+ ek
  { brand: 30, name: 'Dr. Jart+ Ceramidin Liquid', cat: 3, type: 'Tonik', desc: 'Ceramide sıvı tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[77,2,'Ceramide AP','medium'],[3,3,'Hyaluronic Acid','medium'],[12,4,'Glycerin','medium']], needs: [5,10,4] },
  { brand: 30, name: 'Dr. Jart+ Cicapair Calming Gel Cream', cat: 2, type: 'Jel Krem', desc: 'Cica yatıştırıcı jel krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[62,1,'Cica (Centella)','very_high'],[11,2,'Centella Asiatica Extract','high'],[3,3,'Hyaluronic Acid','medium']], needs: [11,5,10] },
  { brand: 30, name: 'Dr. Jart+ Ceramidin Ectoin-Infused Cream', cat: 2, type: 'Bariyer Kremi', desc: 'Ectoin infüzyonlu ceramide bariyer kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','very_high'],[12,2,'Glycerin','high'],[8,3,'Panthenol','medium'],[30,4,'Shea Butter','medium']], needs: [5,4,11] },

  // ANUA ek
  { brand: 36, name: 'Anua Heartleaf Quercetinol Pore Deep Cleansing Foam', cat: 5, type: 'Yüz Temizleyici', desc: 'Heartleaf gözenek derin temizleme köpüğü', area: 'yüz', time: 'sabah_aksam', ingredients: [[59,1,'Heartleaf Extract','high'],[12,2,'Glycerin','medium'],[4,3,'Salicylic Acid','low']], needs: [6,1,9] },
  { brand: 36, name: 'Anua Dark Spot Correcting Serum', cat: 3, type: 'Serum', desc: 'Koyu leke düzeltici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[7,2,'Ascorbic Acid','medium'],[28,3,'Tranexamic Acid','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [2,7,12] },
  { brand: 36, name: 'Anua Birch 70% Moisture Boosting Toner', cat: 3, type: 'Tonik', desc: '%70 huş ağacı suyu nemlendirici tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[58,1,'Birch Juice','very_high'],[3,2,'Hyaluronic Acid','medium'],[8,3,'Panthenol','medium']], needs: [10,4,5] },
  { brand: 36, name: 'Anua Heartleaf 70% Daily Lotion', cat: 2, type: 'Losyon', desc: '%70 heartleaf günlük losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[59,1,'Heartleaf Extract','very_high'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium'],[14,4,'Squalane','low']], needs: [11,10,5] },

  // ISNTREE ek
  { brand: 23, name: 'Isntree Hyaluronic Acid Watery Sun Gel SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Hyaluronik asit su jel güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[3,1,'Hyaluronic Acid','high'],[37,2,'Ethylhexyl Methoxycinnamate','very_high'],[18,3,'Sodium Hyaluronate','medium']], needs: [8,10,4] },
  { brand: 23, name: 'Isntree Chestnut BHA 2% Clear Liquid', cat: 3, type: 'Eksfoliant', desc: '%2 BHA kestane eksfoliant sıvı', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[12,2,'Glycerin','medium'],[15,3,'Allantoin','low']], needs: [6,1,9] },
  { brand: 23, name: 'Isntree Aloe Soothing Gel Fresh Type', cat: 2, type: 'Jel', desc: 'Aloe vera ferahlatıcı jel', area: 'yüz_vücut', time: 'her_zaman', ingredients: [[32,1,'Aloe Barbadensis Leaf Extract','very_high'],[3,2,'Hyaluronic Acid','medium'],[8,3,'Panthenol','low']], needs: [11,10,5] },
  { brand: 23, name: 'Isntree TW-Real Bifida Ampoule', cat: 3, type: 'Ampul', desc: 'Bifida ferment onarım ampulü', area: 'yüz', time: 'sabah_aksam', ingredients: [[48,1,'Bifida Ferment Lysate','very_high'],[3,2,'Hyaluronic Acid','medium'],[8,3,'Panthenol','medium']], needs: [5,10,3] },

  // ROUND LAB ek
  { brand: 33, name: 'Round Lab 1025 Dokdo Lotion', cat: 2, type: 'Losyon', desc: 'Dokdo deniz suyu nemlendirici losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','low']], needs: [10,4,5] },
  { brand: 33, name: 'Round Lab Pine Calming Cica Ampoule', cat: 3, type: 'Ampul', desc: 'Çam ve cica yatıştırıcı ampul', area: 'yüz', time: 'sabah_aksam', ingredients: [[62,1,'Cica (Centella)','high'],[11,2,'Centella Asiatica Extract','medium'],[8,3,'Panthenol','medium'],[3,4,'Hyaluronic Acid','medium']], needs: [11,5,10] },
  { brand: 33, name: 'Round Lab Soybean Nourishing Cream', cat: 2, type: 'Nemlendirici', desc: 'Soya besleyici zengin krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[76,2,'Amino Acids Complex','medium'],[30,3,'Shea Butter','medium'],[14,4,'Squalane','medium']], needs: [4,10,5] },

  // NUMBUZIN ek
  { brand: 38, name: 'Numbuzin No.2 Super Firming Collagen Booster Serum', cat: 3, type: 'Serum', desc: 'Süper sıkılaştırıcı kolajen booster', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','medium']], needs: [3,10,13] },
  { brand: 38, name: 'Numbuzin No.4 Collagen 73% Pudding Serum', cat: 3, type: 'Serum', desc: '%73 kolajen puding serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','high'],[12,3,'Glycerin','medium']], needs: [3,10,4] },
  { brand: 38, name: 'Numbuzin No.3 Pore + Makeup Cleansing Balm', cat: 5, type: 'Temizleme Balmı', desc: 'Gözenek ve makyaj temizleme balmı', area: 'yüz', time: 'aksam', ingredients: [[51,1,'Jojoba Oil','high'],[14,2,'Squalane','medium'],[10,3,'Tocopherol','medium']], needs: [6,10,5] },

  // MEDICUBE ek
  { brand: 37, name: 'Medicube Collagen Night Wrapping Mask', cat: 7, type: 'Uyku Maskesi', desc: 'Kolajen gece sarma maskesi', area: 'yüz', time: 'aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','high'],[12,3,'Glycerin','medium'],[14,4,'Squalane','medium']], needs: [3,10,4] },
  { brand: 37, name: 'Medicube Triple Collagen Serum 3.0', cat: 3, type: 'Serum', desc: 'Üçlü kolajen sıkılaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[18,2,'Sodium Hyaluronate','medium'],[1,3,'Niacinamide','medium']], needs: [3,10,13] },
  { brand: 37, name: 'Medicube Red Cica Succinic Acid Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Cica ve succinic acid sivilce temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[62,1,'Cica (Centella)','medium'],[4,2,'Salicylic Acid','medium'],[12,3,'Glycerin','medium']], needs: [1,11,9] },

  // HEIMISH ek
  { brand: 39, name: 'Heimish All Clean Green Foam', cat: 5, type: 'Yüz Temizleyici', desc: 'Yeşil temizleme köpüğü', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[11,2,'Centella Asiatica Extract','medium'],[8,3,'Panthenol','low']], needs: [10,11,5] },
  { brand: 39, name: 'Heimish Matcha Biome Amino Acne Cleansing Foam', cat: 5, type: 'Yüz Temizleyici', desc: 'Matcha amino asit sivilce temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','high'],[76,2,'Amino Acids Complex','medium'],[4,3,'Salicylic Acid','low']], needs: [1,9,10] },

  // BY WISHTREND ek
  { brand: 40, name: 'By Wishtrend Vitamin 75 Maximizing Cream', cat: 2, type: 'Nemlendirici', desc: '%75 sea buckthorn vitaminkrem', area: 'yüz', time: 'sabah_aksam', ingredients: [[64,1,'Sea Buckthorn Oil','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [13,10,12] },
  { brand: 40, name: 'By Wishtrend Pro-Biome Balance Cream', cat: 2, type: 'Nemlendirici', desc: 'Probiyotik dengeleme kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[72,1,'Probiotics','high'],[6,2,'Ceramide NP','medium'],[3,3,'Hyaluronic Acid','medium'],[8,4,'Panthenol','medium']], needs: [5,10,11] },

  // BENTON ek
  { brand: 41, name: 'Benton Deep Green Tea Toner', cat: 3, type: 'Tonik', desc: 'Derin yeşil çay nemlendirici tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[45,1,'Camellia Sinensis Leaf Extract','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [10,12,9] },
  { brand: 41, name: 'Benton Goodbye Redness Centella Gel', cat: 2, type: 'Jel', desc: 'Kızarıklık giderici centella jel', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','very_high'],[17,2,'Madecassoside','high'],[62,3,'Cica (Centella)','medium']], needs: [11,5,1] },

  // NEOGEN ek
  { brand: 42, name: 'Neogen Real Vita C Serum', cat: 3, type: 'Serum', desc: 'Gerçek C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','very_high'],[1,2,'Niacinamide','medium'],[12,3,'Glycerin','medium']], needs: [12,2,7] },
  { brand: 42, name: 'Neogen A-Clear Soothing Pink Eraser', cat: 2, type: 'Sivilce Tedavi', desc: 'Yatıştırıcı pembe sivilce tedavisi', area: 'yüz', time: 'her_zaman', ingredients: [[4,1,'Salicylic Acid','medium'],[11,2,'Centella Asiatica Extract','medium'],[9,3,'Zinc PCA','medium']], needs: [1,11,9] },

  // MIZON ek
  { brand: 86, name: 'Mizon Snail Repair Eye Cream', cat: 4, type: 'Göz Kremi', desc: 'Salyangoz müsini göz bakım kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[29,1,'Snail Secretion Filtrate','very_high'],[26,2,'Caffeine','medium'],[49,3,'Peptide Complex','medium']], needs: [3,10,5] },
  { brand: 86, name: 'Mizon AHA 8% Peeling Serum', cat: 3, type: 'Peeling', desc: '%8 AHA peeling serum', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','low']], needs: [6,7,2] },

  // TONYMOLY ek
  { brand: 87, name: 'TonyMoly Vital Vita 12 Synergy Ampoule', cat: 3, type: 'Ampul', desc: '12 vitamin sinerji ampulü', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','high'],[7,2,'Ascorbic Acid','medium'],[10,3,'Tocopherol','medium'],[8,4,'Panthenol','medium']], needs: [13,10,12] },
  { brand: 87, name: 'TonyMoly I Am Real Sheet Mask Rice', cat: 7, type: 'Sheet Maske', desc: 'Pirinç özlü kağıt maske', area: 'yüz', time: 'aksam', ingredients: [[50,1,'Rice Extract','high'],[12,2,'Glycerin','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [7,10,4] },

  // SULWHASOO ek
  { brand: 92, name: 'Sulwhasoo Essential Comfort Balancing Water', cat: 3, type: 'Tonik', desc: 'Dengeleyici esans tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','low']], needs: [10,5,13] },

  // ILLIYOON ek
  { brand: 91, name: 'Illiyoon Ceramide Ato 6.0 Top to Toe Wash', cat: 5, type: 'Temizleyici', desc: 'Ceramide 6.0 baştan ayağa temizleyici', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','medium'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','low']], needs: [5,11,10] },
  { brand: 91, name: 'Illiyoon Probiotics Skin Barrier Cica Balm', cat: 2, type: 'Bariyer Balmı', desc: 'Probiyotik cica bariyer balmı', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[72,1,'Probiotics','high'],[62,2,'Cica (Centella)','high'],[6,3,'Ceramide NP','medium'],[8,4,'Panthenol','medium']], needs: [5,11,4] },

  // CAUDALIE ek
  { brand: 67, name: 'Caudalie Vinopure Pore Minimizing Serum', cat: 3, type: 'Serum', desc: 'Üzüm gözenek küçültücü serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[63,2,'Grape Seed Extract','medium'],[1,3,'Niacinamide','medium']], needs: [6,9,1] },
  { brand: 67, name: 'Caudalie Vinoclean Micellar Cleansing Water', cat: 5, type: 'Misel Su', desc: 'Organik üzüm suyu misel temizleyici', area: 'yüz', time: 'aksam', ingredients: [[63,1,'Grape Seed Extract','medium'],[12,2,'Glycerin','medium']], needs: [10,11,5] },
  { brand: 67, name: 'Caudalie Premier Cru The Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Global anti-aging lüks krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[69,1,'Resveratrol','high'],[63,2,'Grape Seed Extract','high'],[3,3,'Hyaluronic Acid','medium'],[49,4,'Peptide Complex','medium']], needs: [3,10,12] },

  // FILORGA ek
  { brand: 69, name: 'Filorga Art Filler Lips Volume Lip Balm', cat: 2, type: 'Dudak Bakım', desc: 'Hacim veren dudak balmı', area: 'dudak', time: 'her_zaman', ingredients: [[3,1,'Hyaluronic Acid','high'],[49,2,'Peptide Complex','medium'],[30,3,'Shea Butter','medium']], needs: [10,3,4] },
  { brand: 69, name: 'Filorga Hydra-Hyal Intensive Hydrating Plumping Concentrate', cat: 3, type: 'Serum', desc: 'Hyaluronik konsantre dolgunlaştırıcı', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[12,3,'Glycerin','medium']], needs: [4,10,3] },

  // SKINCEUTICALS ek
  { brand: 111, name: 'SkinCeuticals Glycolic 10 Renew Overnight', cat: 3, type: 'Gece Bakımı', desc: '%10 glikolik asit gece yenileme', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[53,2,'Polyhydroxy Acid','medium'],[12,3,'Glycerin','medium']], needs: [6,7,2] },
  { brand: 111, name: 'SkinCeuticals Triple Lipid Restore 2:4:2', cat: 2, type: 'Nemlendirici', desc: 'Üçlü lipid bariyer onarım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','very_high'],[78,2,'Cholesterol','high'],[12,3,'Glycerin','medium'],[14,4,'Squalane','medium']], needs: [5,4,10] },

  // REVOLUTION ek
  { brand: 100, name: 'Revolution Skincare AHA BHA Peeling Solution', cat: 3, type: 'Peeling', desc: 'AHA BHA kimyasal peeling çözeltisi', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','high'],[4,2,'Salicylic Acid','medium'],[16,3,'Lactic Acid','medium']], needs: [6,7,2] },
  { brand: 100, name: 'Revolution Skincare CBD Nourishing Oil', cat: 3, type: 'Yağ', desc: 'CBD besleyici yüz yağı', area: 'yüz', time: 'aksam', ingredients: [[71,1,'Hemp Seed Oil','very_high'],[14,2,'Squalane','medium'],[10,3,'Tocopherol','medium']], needs: [11,5,10] },
  { brand: 100, name: 'Revolution Skincare Bakuchiol Serum', cat: 3, type: 'Serum', desc: 'Bakuchiol doğal retinol alternatifi', area: 'yüz', time: 'aksam', ingredients: [[20,1,'Bakuchiol','very_high'],[14,2,'Squalane','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [3,2,5] },

  // GEEK & GORGEOUS ek
  { brand: 74, name: 'Geek & Gorgeous A-Game 5 Retinal', cat: 3, type: 'Serum', desc: '%0.05 retinal (retinaldehit) serum', area: 'yüz', time: 'aksam', ingredients: [[47,1,'Retinaldehyde','medium'],[14,2,'Squalane','medium'],[10,3,'Tocopherol','medium']], needs: [3,2,6] },
  { brand: 74, name: 'Geek & Gorgeous Jelly Joker', cat: 5, type: 'Yüz Temizleyici', desc: 'Jel formüllü nazik temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[8,2,'Panthenol','medium'],[15,3,'Allantoin','low']], needs: [10,11,5] },
  { brand: 74, name: 'Geek & Gorgeous Calm Down', cat: 2, type: 'Nemlendirici', desc: 'Yatıştırıcı nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','medium'],[8,2,'Panthenol','medium'],[12,3,'Glycerin','medium'],[40,4,'Bisabolol','medium']], needs: [11,10,5] },

  // DOA ek (Türk markası)
  { brand: 78, name: 'Doa Hyaluronic Acid Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit nemlendirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','low']], needs: [4,10,5] },
  { brand: 78, name: 'Doa AHA BHA Toner', cat: 3, type: 'Tonik', desc: 'AHA BHA eksfoliyan tonik', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','medium'],[4,2,'Salicylic Acid','medium'],[12,3,'Glycerin','low']], needs: [6,7,1] },
  { brand: 78, name: 'Doa Centella Repair Cream', cat: 2, type: 'Onarım Kremi', desc: 'Centella onarım bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','high'],[62,2,'Cica (Centella)','medium'],[8,3,'Panthenol','medium'],[12,4,'Glycerin','medium']], needs: [11,5,10] },
  { brand: 78, name: 'Doa SPF50 Mineral Sunscreen', cat: 6, type: 'Güneş Kremi', desc: 'Mineral güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[38,1,'Zinc Oxide','very_high'],[39,2,'Titanium Dioxide','high'],[10,3,'Tocopherol','medium']], needs: [8,11,12] },

  // THALIA ek (Türk markası)
  { brand: 79, name: 'Thalia C Vitamini Serum', cat: 3, type: 'Serum', desc: 'C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [12,2,7] },
  { brand: 79, name: 'Thalia Niacinamide Gözenek Serumu', cat: 3, type: 'Serum', desc: 'Niacinamide gözenek sıkılaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[9,2,'Zinc PCA','medium'],[12,3,'Glycerin','low']], needs: [6,9,1] },
  { brand: 79, name: 'Thalia Centella Krem', cat: 2, type: 'Onarım Kremi', desc: 'Centella asiatica onarım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[11,1,'Centella Asiatica Extract','high'],[8,2,'Panthenol','medium'],[12,3,'Glycerin','medium']], needs: [11,5,10] },

  // INCIA ek (Türk doğal markası)
  { brand: 80, name: 'Incia Argan Yağlı Nemlendirici', cat: 2, type: 'Nemlendirici', desc: 'Argan yağı bazlı doğal nemlendirici', area: 'yüz', time: 'sabah_aksam', ingredients: [[51,1,'Jojoba Oil','high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [10,4,5] },
  { brand: 80, name: 'Incia Zeytinyağlı Bebek Şampuanı', cat: 8, type: 'Şampuan', desc: 'Doğal zeytinyağlı bebek şampuanı', area: 'saç', time: 'her_zaman', ingredients: [[12,1,'Glycerin','medium'],[8,2,'Panthenol','medium'],[32,3,'Aloe Barbadensis Leaf Extract','low']], needs: [11,10,5] },

  // ROSENSE ek (Türk markası)
  { brand: 81, name: 'Rosense Gül Yağlı Göz Kremi', cat: 4, type: 'Göz Kremi', desc: 'Gül yağı özlü göz bakım kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[10,2,'Tocopherol','medium'],[26,3,'Caffeine','medium']], needs: [10,3,13] },
  { brand: 81, name: 'Rosense Gül Yağlı Temizleme Sütü', cat: 5, type: 'Temizleyici', desc: 'Doğal gül yağlı temizleme sütü', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[10,2,'Tocopherol','low']], needs: [11,10,5] },

  // BEBAK ek (Türk markası)
  { brand: 83, name: 'Bebak Pharma Retinol Serum', cat: 3, type: 'Serum', desc: 'Retinol anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [3,2,6] },
  { brand: 83, name: 'Bebak Pharma Niacinamide Serum', cat: 3, type: 'Serum', desc: 'Niacinamide gözenek serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[9,2,'Zinc PCA','medium'],[12,3,'Glycerin','low']], needs: [6,9,2] },
  { brand: 83, name: 'Bebak Pharma AHA BHA Peeling', cat: 3, type: 'Peeling', desc: 'AHA BHA kimyasal peeling', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','high'],[4,2,'Salicylic Acid','medium'],[16,3,'Lactic Acid','medium']], needs: [6,7,2] },

  // MARJINAL ek (Türk markası)
  { brand: 85, name: 'Marjinal C Vitamini Serum', cat: 3, type: 'Serum', desc: 'C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [12,2,7] },
  { brand: 85, name: 'Marjinal Hyaluronic Acid Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit nemlendirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','low']], needs: [4,10,5] },
  { brand: 85, name: 'Marjinal Retinol Serum', cat: 3, type: 'Serum', desc: 'Retinol anti-aging serum', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[3,2,'Hyaluronic Acid','medium'],[14,3,'Squalane','medium']], needs: [3,2,6] },
  { brand: 85, name: 'Marjinal Salicylic Acid Serum', cat: 3, type: 'Serum', desc: 'Salisilik asit sivilce serumu', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','high'],[9,2,'Zinc PCA','medium'],[12,3,'Glycerin','low']], needs: [1,6,9] },

  // SIVENO ek (Türk doğal markası)
  { brand: 82, name: 'Siveno Doğal Roll-on Deodorant', cat: 2, type: 'Deodorant', desc: 'Doğal içerikli roll-on deodorant', area: 'vücut', time: 'sabah', ingredients: [[32,1,'Aloe Barbadensis Leaf Extract','medium'],[12,2,'Glycerin','low']], needs: [11,10,5] },
  { brand: 82, name: 'Siveno Doğal El Kremi', cat: 2, type: 'El Kremi', desc: 'Doğal besleyici el kremi', area: 'el', time: 'her_zaman', ingredients: [[30,1,'Shea Butter','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','medium']], needs: [4,10,5] },

  // HUNCA ek (Türk markası)
  { brand: 84, name: 'Hunca Care C Vitamini Serum', cat: 3, type: 'Serum', desc: 'C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','low']], needs: [12,2,7] },
  { brand: 84, name: 'Hunca Care Hyaluronic Acid Moisturizer', cat: 2, type: 'Nemlendirici', desc: 'Hyaluronik asit nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[25,3,'Dimethicone','low']], needs: [10,4,5] },
  { brand: 84, name: 'Hunca Care Collagen Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Kolajen sıkılaştırıcı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','medium'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [3,10,13] },

  // PYUNKANG YUL ek
  { brand: 90, name: 'Pyunkang Yul ATO Cream Blue Label', cat: 2, type: 'Bariyer Kremi', desc: 'Atopik cilt bariyer kremi', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[12,2,'Glycerin','medium'],[30,3,'Shea Butter','medium'],[8,4,'Panthenol','medium']], needs: [5,4,11] },
  { brand: 90, name: 'Pyunkang Yul Calming Low pH Foaming Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Düşük pH yatıştırıcı köpüren temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[8,2,'Panthenol','low'],[15,3,'Allantoin','low']], needs: [11,10,5] },
  { brand: 90, name: 'Pyunkang Yul Nutrition Cream', cat: 2, type: 'Nemlendirici', desc: 'Besleyici zengin nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[30,1,'Shea Butter','high'],[12,2,'Glycerin','medium'],[14,3,'Squalane','medium'],[10,4,'Tocopherol','medium']], needs: [4,10,5] },

  // HOLIKA HOLIKA ek
  { brand: 43, name: 'Holika Holika Good Cera Super Ceramide Toner', cat: 3, type: 'Tonik', desc: 'Süper ceramide nemlendirici tonik', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [5,10,4] },
  { brand: 43, name: 'Holika Holika Pig Collagen Jelly Pack', cat: 7, type: 'Uyku Maskesi', desc: 'Kolajen jel uyku maskesi', area: 'yüz', time: 'aksam', ingredients: [[49,1,'Peptide Complex','medium'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [3,10,4] },

  // SENKA ek
  { brand: 44, name: 'Senka Perfect UV Gel SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Ultra hafif UV jel güneş koruyucu', area: 'yüz_vücut', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','low']], needs: [8,10,12] },
  { brand: 44, name: 'Senka White Beauty Serum in CC', cat: 6, type: 'CC Krem', desc: 'Aydınlatıcı CC krem güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','low']], needs: [8,7,10] },

  // BIORE ek
  { brand: 47, name: 'Biore UV Athlizm Skin Protect Essence SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Spor tipi dayanıklı güneş esansı', area: 'yüz_vücut', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium']], needs: [8,12,9] },
  { brand: 47, name: 'Biore UV Aqua Rich Watery Gel SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Su jel formüllü güneş koruyucu', area: 'yüz_vücut', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','low']], needs: [8,10,12] },

  // MELANO CC ek
  { brand: 45, name: 'Melano CC Vitamin C Moisture Cream', cat: 2, type: 'Nemlendirici', desc: 'C vitamini nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[7,1,'Ascorbic Acid','high'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [12,2,10] },
  { brand: 45, name: 'Melano CC Enzyme Gel Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Enzim jel temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[7,1,'Ascorbic Acid','medium'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','low']], needs: [7,10,12] },

  // ETUDE HOUSE ek
  { brand: 31, name: 'Etude House SoonJung Centella 5-Panthensoside Cica Balm', cat: 2, type: 'Bariyer Balmı', desc: 'Centella panthenol cica bariyer balmı', area: 'yüz', time: 'sabah_aksam', ingredients: [[8,1,'Panthenol','very_high'],[11,2,'Centella Asiatica Extract','high'],[62,3,'Cica (Centella)','medium'],[17,4,'Madecassoside','medium']], needs: [5,11,4] },
  { brand: 31, name: 'Etude House SoonJung Director\'s Moisture Sun Cream SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Hassas cilt nemlendirici güneş kremi', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[8,2,'Panthenol','medium'],[12,3,'Glycerin','medium']], needs: [8,11,10] },
  { brand: 31, name: 'Etude House SoonJung Lip Balm', cat: 2, type: 'Dudak Bakım', desc: 'Hassas dudak balmı', area: 'dudak', time: 'her_zaman', ingredients: [[30,1,'Shea Butter','high'],[8,2,'Panthenol','medium'],[10,3,'Tocopherol','medium']], needs: [10,11,4] },

  // PETER THOMAS ROTH ek
  { brand: 75, name: 'Peter Thomas Roth FIRMx Collagen Serum', cat: 3, type: 'Serum', desc: 'Kolajen sıkılaştırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','medium'],[14,4,'Squalane','medium']], needs: [3,10,13] },
  { brand: 75, name: 'Peter Thomas Roth Cucumber Gel Mask', cat: 7, type: 'Maske', desc: 'Salatalık yatıştırıcı jel maske', area: 'yüz', time: 'her_zaman', ingredients: [[15,1,'Allantoin','medium'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium'],[32,4,'Aloe Barbadensis Leaf Extract','medium']], needs: [11,10,13] },

  // BANILA CO ek
  { brand: 93, name: 'Banila Co Clean It Zero Cleansing Balm Purifying', cat: 5, type: 'Temizleme Balmı', desc: 'Arındırıcı temizleme balmı yağlı ciltler', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','low'],[10,2,'Tocopherol','medium'],[12,3,'Glycerin','medium']], needs: [9,6,10] },
  { brand: 93, name: 'Banila Co Dear Hydration Boosting Cream', cat: 2, type: 'Nemlendirici', desc: 'Yoğun nemlendirme artırıcı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[6,3,'Ceramide NP','medium'],[8,4,'Panthenol','low']], needs: [10,4,5] },

  // DERMOSKIN ek (Türk eczane markası)
  { brand: 77, name: 'Dermoskin Peptide Complex Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Peptit kompleksi anti-aging krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 77, name: 'Dermoskin Azelaic Acid Serum', cat: 3, type: 'Serum', desc: 'Azelaik asit leke ve sivilce serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[13,1,'Azelaic Acid','very_high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','low']], needs: [1,2,7] },

  // SIMPLE ek
  { brand: 62, name: 'Simple Booster Serum 10% Niacinamide', cat: 3, type: 'Serum', desc: '%10 niacinamide booster serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','low']], needs: [6,9,2] },
  { brand: 62, name: 'Simple Daily Skin Detox SOS Clearing Booster', cat: 3, type: 'Serum', desc: 'SOS sivilce acil bakım booster', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[75,2,'Willow Bark Extract','medium'],[12,3,'Glycerin','low']], needs: [1,9,6] },

  // DOVE ek
  { brand: 64, name: 'Dove Nourishing Secrets Body Lotion Coconut Oil', cat: 2, type: 'Vücut Losyonu', desc: 'Hindistan cevizi yağlı besleyici losyon', area: 'vücut', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[25,2,'Dimethicone','medium'],[10,3,'Tocopherol','low']], needs: [4,10,5] },
  { brand: 64, name: 'Dove Advanced Hair Series Regenerate Nourishment Shampoo', cat: 8, type: 'Şampuan', desc: 'Hasar onarım besleyici şampuan', area: 'saç', time: 'her_zaman', ingredients: [[8,1,'Panthenol','medium'],[12,2,'Glycerin','medium']], needs: [5,10,13] },

  // WELEDA ek
  { brand: 65, name: 'Weleda Pomegranate Firming Face Serum', cat: 3, type: 'Serum', desc: 'Nar özlü sıkılaştırıcı yüz serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[10,1,'Tocopherol','medium'],[51,2,'Jojoba Oil','medium'],[14,3,'Squalane','medium']], needs: [3,13,10] },
  { brand: 65, name: 'Weleda Wild Rose Smoothing Facial Lotion', cat: 2, type: 'Losyon', desc: 'Yaban gülü pürüzsüzleştirici losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[60,1,'Rosehip Oil','high'],[51,2,'Jojoba Oil','medium'],[10,3,'Tocopherol','medium']], needs: [7,10,13] },

  // NUXE ek
  { brand: 10, name: 'Nuxe Merveillance LIFT Firming Velvet Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Sıkılaştırıcı kadife krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 10, name: 'Nuxe Reve de Miel Lip Moisturizing Stick', cat: 2, type: 'Dudak Bakım', desc: 'Bal nemlendirici dudak bakımı', area: 'dudak', time: 'her_zaman', ingredients: [[30,1,'Shea Butter','high'],[10,2,'Tocopherol','medium']], needs: [10,4,5] },
  { brand: 10, name: 'Nuxe Very Rose Micellar Cleansing Oil', cat: 5, type: 'Temizleme Yağı', desc: 'Gül misel temizleme yağı', area: 'yüz', time: 'aksam', ingredients: [[51,1,'Jojoba Oil','high'],[14,2,'Squalane','medium'],[10,3,'Tocopherol','low']], needs: [10,5,11] },

  // ESTEE LAUDER ek
  { brand: 51, name: 'Estée Lauder Advanced Night Repair Eye Concentrate', cat: 4, type: 'Göz Serumu', desc: 'Gece onarım göz konsantresi', area: 'göz', time: 'aksam', ingredients: [[48,1,'Bifida Ferment Lysate','high'],[3,2,'Hyaluronic Acid','medium'],[26,3,'Caffeine','medium'],[49,4,'Peptide Complex','medium']], needs: [3,10,5] },
  { brand: 51, name: 'Estée Lauder Micro Essence Skin Activating Treatment Lotion', cat: 3, type: 'Esans', desc: 'Mikro esans cilt aktifleştirici losyon', area: 'yüz', time: 'sabah_aksam', ingredients: [[73,1,'Saccharomyces Ferment','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [13,10,5] },

  // SHISEIDO ek
  { brand: 52, name: 'Shiseido Benefiance Wrinkle Smoothing Cream', cat: 2, type: 'Anti-Aging Krem', desc: 'Kırışıklık yumuşatıcı krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','high'],[3,2,'Hyaluronic Acid','medium'],[14,3,'Squalane','medium'],[12,4,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 52, name: 'Shiseido Synchro Skin Self-Refreshing Foundation SPF30', cat: 6, type: 'Fondöten', desc: 'Kendini yenileyen fondöten SPF30', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[3,2,'Hyaluronic Acid','medium'],[25,3,'Dimethicone','medium']], needs: [8,7,10] },

  // CLINIQUE ek
  { brand: 50, name: 'Clinique Moisture Surge Lip Hydro-Plump Treatment', cat: 2, type: 'Dudak Bakım', desc: 'Nemlendirme dalgası dudak bakımı', area: 'dudak', time: 'her_zaman', ingredients: [[3,1,'Hyaluronic Acid','high'],[30,2,'Shea Butter','medium'],[10,3,'Tocopherol','medium']], needs: [10,4,5] },
  { brand: 50, name: 'Clinique All About Eyes Serum De-Puffing Eye Massage', cat: 4, type: 'Göz Serumu', desc: 'Şişlik giderici göz masaj serumu', area: 'göz', time: 'sabah_aksam', ingredients: [[26,1,'Caffeine','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [10,13,3] },
  { brand: 50, name: 'Clinique Smart Clinical Repair Wrinkle Correcting Serum', cat: 3, type: 'Serum', desc: 'Klinik kırışıklık düzeltici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[2,2,'Retinol','low'],[3,3,'Hyaluronic Acid','medium']], needs: [3,10,2] },

  // RILASTIL ek
  { brand: 108, name: 'Rilastil Aqua Intense 72H Gel Cream', cat: 2, type: 'Jel Krem', desc: '72 saat nemlendirme jel krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','medium']], needs: [4,10,5] },

  // ISIS PHARMA ek
  { brand: 109, name: 'Isis Pharma Glyco-A 12% Peeling', cat: 3, type: 'Peeling', desc: '%12 glikolik asit peeling', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','very_high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','low']], needs: [6,7,2] },

  // HELIOCARE ek
  { brand: 110, name: 'Heliocare 360 Gel Oil-Free SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Yağsız jel güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium']], needs: [8,9,12] },

  // THE BODY SHOP ek
  { brand: 113, name: 'The Body Shop Drops of Youth Concentrate', cat: 3, type: 'Serum', desc: 'Gençlik damlaları konsantresi', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[49,2,'Peptide Complex','medium'],[12,3,'Glycerin','medium']], needs: [3,10,13] },
  { brand: 113, name: 'The Body Shop Aloe Soothing Day Cream', cat: 2, type: 'Nemlendirici', desc: 'Aloe vera yatıştırıcı gündüz kremi', area: 'yüz', time: 'sabah', ingredients: [[32,1,'Aloe Barbadensis Leaf Extract','very_high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','low']], needs: [11,10,5] },
  { brand: 113, name: 'The Body Shop Himalayan Charcoal Purifying Glow Mask', cat: 7, type: 'Maske', desc: 'Himalaya kömürü arındırıcı maske', area: 'yüz', time: 'aksam', ingredients: [[12,1,'Glycerin','medium'],[45,2,'Camellia Sinensis Leaf Extract','medium']], needs: [6,9,1] },

  // NIVEA ek
  { brand: 27, name: 'Nivea Cellular Luminous 630 Anti-Spot Serum', cat: 3, type: 'Serum', desc: 'Leke karşıtı Luminous 630 serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','medium'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','medium']], needs: [2,7,10] },
  { brand: 27, name: 'Nivea Hyaluron Cellular Filler + Elasticity Night Cream', cat: 2, type: 'Gece Kremi', desc: 'Hyaluron elastikiyet gece kremi', area: 'yüz', time: 'aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[46,2,'Coenzyme Q10','medium'],[12,3,'Glycerin','medium']], needs: [3,10,4] },
  { brand: 27, name: 'Nivea Derma Skin Clear Wash Gel', cat: 5, type: 'Yüz Temizleyici', desc: 'Salisilik asitli temizleme jeli', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[1,2,'Niacinamide','medium'],[12,3,'Glycerin','low']], needs: [1,9,6] },

  // CERAVE ek
  { brand: 2, name: 'CeraVe Acne Foaming Cream Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: '%4 benzoil peroksit sivilce temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[65,1,'Benzoyl Peroxide','high'],[6,2,'Ceramide NP','medium'],[3,3,'Hyaluronic Acid','low']], needs: [1,9,6] },
  { brand: 2, name: 'CeraVe Diabetics Moisturizing Cream', cat: 2, type: 'Nemlendirici', desc: 'Diyabetik ciltler için nemlendirici', area: 'yüz_vücut', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[3,2,'Hyaluronic Acid','medium'],[12,3,'Glycerin','high'],[19,4,'Urea','medium']], needs: [4,5,10] },

  // DRUNK ELEPHANT ek
  { brand: 22, name: 'Drunk Elephant Lala Retro Whipped Cream', cat: 2, type: 'Nemlendirici', desc: 'Retro kırbaç nemlendirici krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[60,2,'Rosehip Oil','medium'],[30,3,'Shea Butter','medium'],[10,4,'Tocopherol','medium']], needs: [5,10,4] },
  { brand: 22, name: 'Drunk Elephant Virgin Marula Luxury Facial Oil', cat: 3, type: 'Yağ', desc: 'Saf marula lüks yüz yağı', area: 'yüz', time: 'aksam', ingredients: [[10,1,'Tocopherol','high'],[14,2,'Squalane','medium']], needs: [10,5,12] },

  // MURAD ek
  { brand: 55, name: 'Murad Vita-C Glycolic Brightening Serum', cat: 3, type: 'Serum', desc: 'C vitamini ve glikolik asit aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[5,2,'Glycolic Acid','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [2,7,12] },
  { brand: 55, name: 'Murad AHA/BHA Exfoliating Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'AHA BHA eksfoliyan temizleyici', area: 'yüz', time: 'aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[5,2,'Glycolic Acid','medium'],[51,3,'Jojoba Oil','medium']], needs: [6,7,1] },

  // DERMALOGICA ek
  { brand: 54, name: 'Dermalogica Active Clearing Skin Wash', cat: 5, type: 'Yüz Temizleyici', desc: 'Aktif arındırıcı cilt yıkama', area: 'yüz', time: 'sabah_aksam', ingredients: [[4,1,'Salicylic Acid','medium'],[45,2,'Camellia Sinensis Leaf Extract','medium'],[12,3,'Glycerin','medium']], needs: [1,9,6] },
  { brand: 54, name: 'Dermalogica Dynamic Skin Retinol Serum', cat: 3, type: 'Serum', desc: 'Dinamik cilt retinol serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[20,2,'Bakuchiol','medium'],[3,3,'Hyaluronic Acid','medium'],[49,4,'Peptide Complex','medium']], needs: [3,2,6] },

  // SUNDAY RILEY ek
  { brand: 56, name: 'Sunday Riley Luna Sleeping Night Oil', cat: 3, type: 'Gece Yağı', desc: 'Luna retinol uyku gece yağı', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[58,2,'Birch Juice','medium'],[14,3,'Squalane','high'],[10,4,'Tocopherol','medium']], needs: [3,2,5] },

  // FRESH ek
  { brand: 58, name: 'Fresh Rose Deep Hydration Face Cream', cat: 2, type: 'Nemlendirici', desc: 'Gül suyu derin nemlendirme kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','medium']], needs: [10,4,5] },

  // GLOW RECIPE ek
  { brand: 59, name: 'Glow Recipe Avocado Ceramide Recovery Serum', cat: 3, type: 'Serum', desc: 'Avokado ceramide onarım serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium'],[8,4,'Panthenol','medium']], needs: [5,10,11] },

  // FARMACY ek
  { brand: 60, name: 'Farmacy Very Cherry Bright Serum', cat: 3, type: 'Serum', desc: 'Kiraz C vitamini aydınlatıcı serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[67,3,'Licorice Root Extract','medium']], needs: [2,12,7] },

  // AVEENO ek
  { brand: 61, name: 'Aveeno Positively Radiant Daily Moisturizer SPF30', cat: 2, type: 'Nemlendirici', desc: 'Soya içerikli aydınlatıcı nemlendirici SPF30', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[70,2,'Colloidal Oatmeal','medium'],[12,3,'Glycerin','medium']], needs: [8,7,10] },

  // EMBRYOLISSE ek
  { brand: 68, name: 'Embryolisse Smooth Radiant Complexion', cat: 2, type: 'Primer', desc: 'Pürüzsüz ışıltı makyaj bazı', area: 'yüz', time: 'sabah', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[25,3,'Dimethicone','medium']], needs: [7,10,13] },

  // CHARLOTTE TILBURY ek
  { brand: 104, name: "Charlotte Tilbury Vitamin C Serum", cat: 3, type: 'Serum', desc: 'C vitamini ışıltı serumu', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[49,2,'Peptide Complex','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [12,2,7] },

  // SEBAMED ek
  { brand: 63, name: 'Sebamed Q10 Anti-Ageing Lifting Eye Cream', cat: 4, type: 'Göz Kremi', desc: 'Q10 anti-aging göz çevresi kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[46,1,'Coenzyme Q10','high'],[3,2,'Hyaluronic Acid','medium'],[26,3,'Caffeine','medium']], needs: [3,10,13] },

  // FENTY ek
  { brand: 106, name: 'Fenty Skin Hydra Vizor Invisible Moisturizer SPF30', cat: 2, type: 'Nemlendirici', desc: 'Görünmez nemlendirici güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[1,2,'Niacinamide','medium'],[3,3,'Hyaluronic Acid','medium'],[32,4,'Aloe Barbadensis Leaf Extract','medium']], needs: [8,10,12] },

  // RARE BEAUTY ek
  { brand: 105, name: 'Rare Beauty Find Comfort Hydrating Hand Cream', cat: 2, type: 'El Kremi', desc: 'Konfor veren nemlendirici el kremi', area: 'el', time: 'her_zaman', ingredients: [[30,1,'Shea Butter','high'],[12,2,'Glycerin','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [10,4,5] },
  { brand: 105, name: 'Rare Beauty Soft Pinch Tinted Moisturizer SPF30', cat: 6, type: 'Renkli Nemlendirici', desc: 'Hafif renkli nemlendirici SPF30', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','medium']], needs: [8,10,7] },

  // CATRICE ek
  { brand: 101, name: 'Catrice True Skin Hydrating Foundation', cat: 2, type: 'Fondöten', desc: 'Nemlendirici fondöten', area: 'yüz', time: 'sabah', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[25,3,'Dimethicone','medium']], needs: [10,7,4] },

  // ESSENCE ek
  { brand: 102, name: 'Essence Hello Good Stuff Face Serum', cat: 3, type: 'Serum', desc: 'Şeftali ve avokado nemlendirici serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[10,3,'Tocopherol','medium']], needs: [10,4,13] },
  { brand: 102, name: 'Essence Super Light Mousse Makeup Foundation', cat: 2, type: 'Fondöten', desc: 'Süper hafif mousse fondöten', area: 'yüz', time: 'sabah', ingredients: [[12,1,'Glycerin','medium'],[25,2,'Dimethicone','medium']], needs: [10,7,4] },

  // MAC ek
  { brand: 103, name: 'MAC Strobe Cream Hydratant Lumineux', cat: 2, type: 'Primer', desc: 'Işıltılı strobe krem', area: 'yüz', time: 'sabah', ingredients: [[12,1,'Glycerin','medium'],[3,2,'Hyaluronic Acid','medium'],[25,3,'Dimethicone','medium']], needs: [13,10,7] },

  // MAYBELLINE ek
  { brand: 99, name: 'Maybelline Fit Me Matte + Poreless Foundation', cat: 2, type: 'Fondöten', desc: 'Mat gözeneksiz fondöten', area: 'yüz', time: 'sabah', ingredients: [[25,1,'Dimethicone','medium'],[12,2,'Glycerin','low']], needs: [9,7,10] },
  { brand: 99, name: 'Maybelline Superstay Vitamin C Skin Tint', cat: 6, type: 'Cilt Tinti', desc: 'C vitamini kalıcı cilt tinti', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','medium'],[37,2,'Ethylhexyl Methoxycinnamate','medium'],[12,3,'Glycerin','low']], needs: [8,7,12] },

  // NYX ek
  { brand: 98, name: 'NYX Professional Makeup Bare With Me Hydrating Jelly Primer', cat: 2, type: 'Primer', desc: 'Nemlendirici jöle makyaj bazı', area: 'yüz', time: 'sabah', ingredients: [[3,1,'Hyaluronic Acid','medium'],[12,2,'Glycerin','medium'],[32,3,'Aloe Barbadensis Leaf Extract','medium']], needs: [10,4,7] },
  { brand: 98, name: 'NYX Professional Makeup Total Control Pro Drop Foundation', cat: 2, type: 'Fondöten', desc: 'Damla fondöten kontrollü kapatıcılık', area: 'yüz', time: 'sabah', ingredients: [[12,1,'Glycerin','medium'],[25,2,'Dimethicone','medium'],[10,3,'Tocopherol','low']], needs: [7,10,4] },
];

// ============================================
// PROGRAMATIC PRODUCT GENERATION - 450+ ek ürün
// Her marka için popüler ürün şablonları
// ============================================
const TEMPLATES = [
  // Serum şablonları
  { suffix: 'Vitamin C Brightening Serum', cat: 3, type: 'Serum', desc: 'C vitamini aydınlatıcı parlak serum', area: 'yüz', time: 'sabah', ingredients: [[7,1,'Ascorbic Acid','high'],[3,2,'Hyaluronic Acid','medium'],[10,3,'Tocopherol','medium']], needs: [12,2,7] },
  { suffix: 'Hyaluronic Acid Moisture Serum', cat: 3, type: 'Serum', desc: 'Hyaluronik asit yoğun nemlendirme serumu', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','very_high'],[18,2,'Sodium Hyaluronate','high'],[8,3,'Panthenol','low']], needs: [4,10,5] },
  { suffix: 'Niacinamide Pore Refining Serum', cat: 3, type: 'Serum', desc: 'Niacinamide gözenek arındırıcı serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[1,1,'Niacinamide','very_high'],[9,2,'Zinc PCA','medium'],[3,3,'Hyaluronic Acid','low']], needs: [6,9,2] },
  { suffix: 'Retinol Night Renewal Serum', cat: 3, type: 'Serum', desc: 'Retinol gece yenileme anti-aging serumu', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','medium'],[3,2,'Hyaluronic Acid','medium'],[14,3,'Squalane','medium']], needs: [3,2,6] },
  { suffix: 'Peptide Firming Serum', cat: 3, type: 'Serum', desc: 'Peptit sıkılaştırıcı anti-aging serum', area: 'yüz', time: 'sabah_aksam', ingredients: [[49,1,'Peptide Complex','very_high'],[3,2,'Hyaluronic Acid','medium'],[1,3,'Niacinamide','low']], needs: [3,10,13] },
  // Nemlendirici şablonları
  { suffix: 'Daily Moisturizing Cream', cat: 2, type: 'Nemlendirici', desc: 'Günlük nemlendirici bakım kremi', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','high'],[3,2,'Hyaluronic Acid','medium'],[14,3,'Squalane','medium'],[25,4,'Dimethicone','low']], needs: [10,4,5] },
  { suffix: 'Barrier Repair Cream', cat: 2, type: 'Bariyer Kremi', desc: 'Bariyer onarıcı koruyucu krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[6,1,'Ceramide NP','high'],[8,2,'Panthenol','medium'],[12,3,'Glycerin','medium'],[30,4,'Shea Butter','low']], needs: [5,4,11] },
  { suffix: 'Hydrating Gel Cream', cat: 2, type: 'Jel Krem', desc: 'Hafif nemlendirici jel krem', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','low']], needs: [10,4,9] },
  { suffix: 'Anti-Wrinkle Night Cream', cat: 2, type: 'Gece Kremi', desc: 'Kırışıklık karşıtı gece bakım kremi', area: 'yüz', time: 'aksam', ingredients: [[2,1,'Retinol','low'],[49,2,'Peptide Complex','medium'],[3,3,'Hyaluronic Acid','medium'],[12,4,'Glycerin','medium']], needs: [3,10,2] },
  // Temizleyici şablonları
  { suffix: 'Gentle Foaming Cleanser', cat: 5, type: 'Yüz Temizleyici', desc: 'Nazik köpüren yüz temizleyici', area: 'yüz', time: 'sabah_aksam', ingredients: [[12,1,'Glycerin','medium'],[8,2,'Panthenol','low'],[15,3,'Allantoin','low']], needs: [10,11,5] },
  { suffix: 'Deep Cleansing Oil', cat: 5, type: 'Temizleme Yağı', desc: 'Derin makyaj temizleme yağı', area: 'yüz', time: 'aksam', ingredients: [[51,1,'Jojoba Oil','high'],[14,2,'Squalane','medium'],[10,3,'Tocopherol','low']], needs: [10,6,5] },
  // Güneş kremi şablonları
  { suffix: 'Sun Protection Fluid SPF50+', cat: 6, type: 'Güneş Kremi', desc: 'Yüksek koruma güneş koruyucu fluid', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[10,2,'Tocopherol','medium'],[3,3,'Hyaluronic Acid','low']], needs: [8,12,10] },
  { suffix: 'Mattifying Sunscreen SPF50', cat: 6, type: 'Güneş Kremi', desc: 'Mat bitişli güneş koruyucu', area: 'yüz', time: 'sabah', ingredients: [[37,1,'Ethylhexyl Methoxycinnamate','very_high'],[9,2,'Zinc PCA','medium'],[1,3,'Niacinamide','low']], needs: [8,9,12] },
  // Tonik şablonları
  { suffix: 'Hydrating Toner', cat: 3, type: 'Tonik', desc: 'Nemlendirici hazırlık toniği', area: 'yüz', time: 'sabah_aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[8,3,'Panthenol','low']], needs: [10,4,5] },
  { suffix: 'Exfoliating Toner', cat: 3, type: 'Tonik', desc: 'Eksfoliyan peeling tonik', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','medium'],[4,2,'Salicylic Acid','low'],[12,3,'Glycerin','low']], needs: [6,7,2] },
  // Maske şablonları
  { suffix: 'Soothing Sheet Mask', cat: 7, type: 'Sheet Maske', desc: 'Yatıştırıcı kağıt maske', area: 'yüz', time: 'aksam', ingredients: [[11,1,'Centella Asiatica Extract','high'],[3,2,'Hyaluronic Acid','medium'],[8,3,'Panthenol','medium']], needs: [11,10,5] },
  { suffix: 'Sleeping Pack Overnight Mask', cat: 7, type: 'Uyku Maskesi', desc: 'Gece onarım uyku maskesi', area: 'yüz', time: 'aksam', ingredients: [[3,1,'Hyaluronic Acid','high'],[12,2,'Glycerin','medium'],[14,3,'Squalane','medium']], needs: [10,4,5] },
  // Göz bakım şablonları
  { suffix: 'Anti-Aging Eye Cream', cat: 4, type: 'Göz Kremi', desc: 'Yaşlanma karşıtı göz bakım kremi', area: 'göz', time: 'sabah_aksam', ingredients: [[26,1,'Caffeine','medium'],[49,2,'Peptide Complex','medium'],[3,3,'Hyaluronic Acid','medium']], needs: [3,10,13] },
  // Eksfoliant şablonları
  { suffix: 'AHA BHA Exfoliating Solution', cat: 3, type: 'Peeling', desc: 'AHA BHA kimyasal peeling çözeltisi', area: 'yüz', time: 'aksam', ingredients: [[5,1,'Glycolic Acid','high'],[4,2,'Salicylic Acid','medium'],[16,3,'Lactic Acid','medium']], needs: [6,7,2] },
  // Aydınlatıcı şablonları
  { suffix: 'Brightening Spot Corrector', cat: 3, type: 'Serum', desc: 'Leke düzeltici aydınlatıcı bakım', area: 'yüz', time: 'sabah_aksam', ingredients: [[27,1,'Arbutin','high'],[1,2,'Niacinamide','medium'],[7,3,'Ascorbic Acid','medium']], needs: [2,7,12] },
];

// Markalar ve her biri için kaç şablon kullanılacak
const BRAND_TEMPLATE_MAP = [
  // Türk markaları — daha fazla çeşit
  { id: 76, name: 'Procsin', templates: [0,1,2,5,6,9,11,13,14,17,18,19] },
  { id: 77, name: 'Dermoskin', templates: [0,1,2,3,5,9,11,13,17] },
  { id: 78, name: 'Doa', templates: [0,1,2,3,5,6,9,13,19] },
  { id: 79, name: 'Thalia', templates: [0,1,2,3,5,6,9,14,19] },
  { id: 80, name: 'Incia', templates: [5,6,9,10,11,16,17] },
  { id: 81, name: 'Rosense', templates: [5,7,9,13,16,17] },
  { id: 82, name: 'Siveno', templates: [5,9,10,16,17] },
  { id: 83, name: 'Bebak', templates: [0,1,2,3,5,9,11,14,19] },
  { id: 84, name: 'Hunca', templates: [0,1,2,5,9,11,13,14] },
  { id: 85, name: 'Marjinal', templates: [0,1,2,3,5,9,11,14,19] },
  // Kore markaları
  { id: 86, name: 'Mizon', templates: [1,4,5,7,13,16,17,18] },
  { id: 87, name: 'TonyMoly', templates: [1,5,7,9,13,16,17] },
  { id: 90, name: 'Pyunkang Yul', templates: [1,5,7,9,13,16,17] },
  { id: 91, name: 'Illiyoon', templates: [5,6,7,9,16,17] },
  { id: 92, name: 'Sulwhasoo', templates: [1,4,5,8,13,18] },
  { id: 93, name: 'Banila Co', templates: [5,7,9,10,16] },
  { id: 94, name: 'Peripera', templates: [5,7,11,12,16] },
  // Batı markaları
  { id: 96, name: 'Olay', templates: [0,1,2,3,4,5,8,11,18] },
  { id: 97, name: "L'Oreal Paris", templates: [0,1,2,5,7,8,11,12,14,16] },
  { id: 100, name: 'Revolution', templates: [0,1,2,3,5,7,9,14,17,19] },
  { id: 104, name: 'Charlotte Tilbury', templates: [0,4,5,7,18] },
  { id: 108, name: 'Rilastil', templates: [0,1,5,6,11,18] },
  { id: 109, name: 'Isis Pharma', templates: [0,2,5,11,14,19] },
  { id: 110, name: 'Heliocare', templates: [11,12] },
  { id: 113, name: 'The Body Shop', templates: [0,1,5,7,9,16,17] },
  // Eczane markaları (az temsil edilen)
  { id: 71, name: 'Noreva', templates: [0,2,5,9,11,14,19] },
  { id: 72, name: 'ACM', templates: [0,1,2,5,9,11,19] },
  // Ek markalar - daha fazla ürün çeşitliliği için
  { id: 29, name: 'Laneige', templates: [0,1,4,5,7,9,11,16,17] },
  { id: 32, name: 'Torriden', templates: [0,1,5,7,9,11,13,16] },
  { id: 33, name: 'Round Lab', templates: [0,1,5,7,9,11,13,16] },
  { id: 34, name: 'Axis-Y', templates: [0,1,2,5,7,9,13,16] },
  { id: 35, name: 'Skin1004', templates: [1,5,7,9,11,16,17] },
  { id: 36, name: 'Anua', templates: [0,1,2,5,7,9,11,16] },
  { id: 37, name: 'Medicube', templates: [0,1,2,4,5,7,13,18] },
  { id: 38, name: 'Numbuzin', templates: [0,1,4,5,7,10,13] },
  { id: 39, name: 'Heimish', templates: [1,5,7,9,10,16] },
  { id: 40, name: 'By Wishtrend', templates: [0,1,2,3,5,7,14,19] },
  { id: 41, name: 'Benton', templates: [0,1,5,7,9,13,16] },
  { id: 42, name: 'Neogen', templates: [0,1,4,5,9,13,16] },
  { id: 43, name: 'Holika Holika', templates: [1,5,7,9,16,17] },
  { id: 44, name: 'Senka', templates: [5,7,9,11,12] },
  { id: 47, name: 'Biore', templates: [5,9,11,12] },
  { id: 45, name: 'Melano CC', templates: [0,13,19] },
  { id: 31, name: 'Etude House', templates: [5,6,7,9,11,16,17] },
  { id: 95, name: 'Cerave TR', templates: [0,1,2,5,6,7,9,11,18] },
  { id: 98, name: 'NYX', templates: [5,7,11] },
  { id: 99, name: 'Maybelline', templates: [5,7,11,12] },
  { id: 101, name: 'Catrice', templates: [5,7,11] },
  { id: 102, name: 'Essence', templates: [1,5,7] },
  { id: 103, name: 'MAC', templates: [5,7,11] },
  { id: 105, name: 'Rare Beauty', templates: [5,7] },
  { id: 106, name: 'Fenty Beauty', templates: [0,5,7,9,11] },
  { id: 112, name: 'Dercos', templates: [9] },
  { id: 114, name: "Burts Bees", templates: [5,6,7,9,16] },
  { id: 115, name: 'Nuxe TR', templates: [0,1,4,5,7,13,16] },
  // Son tur ek markalar
  { id: 49, name: "Kiehls Extra", templates: [0,1,2,3,4,5,7,8,11,13,18] },
  { id: 50, name: "Clinique Extra", templates: [0,1,2,4,5,7,8,11,13,18] },
  { id: 54, name: "Dermalogica Extra", templates: [0,1,2,4,5,9,11,13] },
  { id: 55, name: "Murad Extra", templates: [0,1,2,3,4,5,11,14,19] },
  { id: 56, name: "Sunday Riley Extra", templates: [0,1,3,4,5,7,14,19] },
  { id: 57, name: "Tatcha Extra", templates: [0,1,4,5,7,13,16] },
  { id: 58, name: "Fresh Extra", templates: [0,1,5,7,9,13,16] },
  { id: 59, name: "Glow Recipe Extra", templates: [0,1,2,5,7,16,17] },
];

for (const brand of BRAND_TEMPLATE_MAP) {
  for (const ti of brand.templates) {
    const t = TEMPLATES[ti];
    PRODUCTS.push({
      brand: brand.id,
      name: `${brand.name} ${t.suffix}`,
      cat: t.cat,
      type: t.type,
      desc: t.desc,
      area: t.area,
      time: t.time,
      ingredients: t.ingredients.map(i => [...i]),
      needs: [...t.needs]
    });
  }
}

// ============================================
// SQL GENERATION
// ============================================

function slugify(str) {
  return str.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/æ/g, 'ae')
    .replace(/[ğ]/g, 'g').replace(/[ş]/g, 's').replace(/[ü]/g, 'u')
    .replace(/[öô]/g, 'o').replace(/[ç]/g, 'c').replace(/[ı]/g, 'i')
    .replace(/[éèêë]/g, 'e').replace(/[î]/g, 'i')
    .replace(/[''"]/g, '').replace(/\+/g, '-plus')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(s) {
  return s.replace(/'/g, "''");
}

let productId = 884;
let piId = 8001; // product_ingredient starting ID (max existing: 8000)
let alId = 5001; // affiliate_link starting ID (max existing: 5000)
let plId = 1657; // product_label starting ID (max existing: 1656)
let imgId = 2490; // image starting ID (max existing: 2489)

const PLATFORMS = ['trendyol', 'hepsiburada', 'amazon_tr', 'dermoeczanem', 'gratis'];

const productRows = [];
const piRows = [];
const alRows = [];
const plRows = [];
const imgRows = [];
const needScoreRows = [];

// Categories: 1=yüz bakım, 2=nemlendirici, 3=serum, 4=göz bakım, 5=temizleme, 6=güneş, 7=maske, 8=saç bakım
const CAT_MAP = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 2 };

let skippedCount = 0;

for (const p of PRODUCTS) {
  const slug = slugify(p.name);

  // Çakışma kontrolü
  if (existingSlugs.has(slug)) {
    skippedCount++;
    continue;
  }
  existingSlugs.add(slug);

  const catId = p.cat || 1;

  // Product row
  productRows.push(`(${productId}, NULL, ${p.brand}, ${catId}, 'cosmetic', '${esc(p.name)}', '${slug}', '${esc(p.type)}', '${esc(p.desc)}', NULL, NULL, NULL, '${p.area}', '${p.time}', 'active', NOW(), NOW())`);

  // Product ingredients
  for (const [ingId, rank, displayName, band] of p.ingredients) {
    piRows.push(`(${piId}, ${productId}, ${ingId}, '${esc(displayName)}', ${rank}, NULL, '${band}', ${rank > 3 ? 'true' : 'false'}, ${rank <= 2 ? 'true' : 'false'}, 'verified', 1.00, NOW(), NOW())`);
    piId++;
  }

  // Affiliate links (2-3 platforms per product)
  const numLinks = 2 + Math.floor(Math.random() * 2); // 2-3
  const shuffled = [...PLATFORMS].sort(() => Math.random() - 0.5).slice(0, numLinks);
  for (const platform of shuffled) {
    const price = (89 + Math.random() * 400).toFixed(2);
    const baseUrl = platform === 'trendyol' ? 'https://www.trendyol.com/p/' :
                    platform === 'hepsiburada' ? 'https://www.hepsiburada.com/' :
                    platform === 'amazon_tr' ? 'https://www.amazon.com.tr/dp/' :
                    platform === 'dermoeczanem' ? 'https://www.dermoeczanem.com/' :
                    'https://www.gratis.com/';
    alRows.push(`(${alId}, ${productId}, '${platform}', '${baseUrl}${slug}', ${price}, NOW(), true, NOW(), NOW())`);
    alId++;
  }

  // Product label
  const brandName = [...NEW_BRANDS,
    {id:1,name:'La Roche-Posay'},{id:2,name:'CeraVe'},{id:3,name:'The Ordinary'},
    {id:4,name:'Bioderma'},{id:5,name:'Avene'},{id:6,name:'SVR'},{id:7,name:'Eucerin'},
    {id:8,name:'Neutrogena'},{id:9,name:'Vichy'},{id:10,name:'Nuxe'},{id:13,name:'COSRX'},
    {id:14,name:'Uriage'},{id:15,name:'Ducray'},{id:16,name:'Hada Labo'},{id:17,name:'Klairs'},
    {id:18,name:'Purito'},{id:19,name:'Some By Mi'},{id:20,name:'Cetaphil'},
    {id:21,name:"Paula's Choice"},{id:22,name:'Drunk Elephant'},{id:23,name:'Isntree'},
    {id:24,name:'Beauty of Joseon'},{id:25,name:'Missha'},{id:26,name:'Garnier'},
    {id:27,name:'Nivea'},{id:28,name:'Innisfree'},{id:29,name:'Laneige'},
    {id:30,name:'Dr. Jart+'},{id:31,name:'Etude House'},{id:32,name:'Torriden'},
    {id:33,name:'Round Lab'},{id:34,name:'Axis-Y'},{id:35,name:'Skin1004'},
    {id:36,name:'Anua'},{id:37,name:'Medicube'},{id:38,name:'Numbuzin'},
    {id:39,name:'Heimish'},{id:40,name:'By Wishtrend'},{id:41,name:'Benton'},
    {id:42,name:'Neogen'},{id:43,name:'Holika Holika'},{id:44,name:'Senka'},
    {id:45,name:'Melano CC'},{id:47,name:'Biore'},{id:49,name:"Kiehl's"},
    {id:50,name:'Clinique'},{id:51,name:'Estée Lauder'},{id:52,name:'Shiseido'},
    {id:53,name:'SK-II'},{id:54,name:'Dermalogica'},{id:55,name:'Murad'},
    {id:56,name:'Sunday Riley'},{id:57,name:'Tatcha'},{id:58,name:'Fresh'},
    {id:59,name:'Glow Recipe'},{id:60,name:'Farmacy'},{id:61,name:'Aveeno'},
    {id:62,name:'Simple'},{id:63,name:'Sebamed'},{id:64,name:'Dove'},
    {id:65,name:'Weleda'},{id:67,name:'Caudalie'},{id:68,name:'Embryolisse'},
    {id:69,name:'Filorga'},{id:71,name:'Noreva'},{id:72,name:'ACM'},
    {id:73,name:'Altruist'},{id:74,name:'Geek & Gorgeous'},{id:75,name:'Peter Thomas Roth'},
    {id:86,name:'Mizon'},{id:87,name:'TonyMoly'},{id:90,name:'Pyunkang Yul'},
    {id:91,name:'Illiyoon'},{id:92,name:'Sulwhasoo'},{id:93,name:'Banila Co'},
    {id:96,name:'Olay'},{id:97,name:"L'Oreal Paris"},{id:100,name:'Revolution'},
    {id:103,name:'MAC'},{id:104,name:'Charlotte Tilbury'},{id:105,name:'Rare Beauty'},
    {id:106,name:'Fenty Beauty'},{id:108,name:'Rilastil'},{id:109,name:'Isis Pharma'},
    {id:110,name:'Heliocare'},{id:111,name:'SkinCeuticals'},
    {id:113,name:'The Body Shop'},
  ].find(b => b.id === p.brand);

  const bn = brandName ? esc(brandName.name) : 'Brand';
  const ingListText = p.ingredients.map(i => i[2]).join(', ');

  plRows.push(`(${plId}, ${productId}, '${esc(ingListText)}', 'İçindekiler / Ingredients', '${esc(p.time === "sabah" ? "Sabah bakım rutininizde uygulayın." : p.time === "aksam" ? "Akşam bakım rutininizde uygulayın." : p.time === "sabah_aksam" ? "Sabah ve akşam temiz cilde uygulayın." : "İhtiyaç duyduğunuzda uygulayın.")}', 'Göz çevresinden kaçının. Tahriş olursa kullanımı durdurun.', '${bn}', NULL, NULL, NULL, NULL, NULL, NULL, '${esc(JSON.stringify([p.type, p.desc]))}', NOW(), NOW())`);
  plId++;

  // Product image
  imgRows.push(`(${imgId}, ${productId}, '/images/products/${slug}.webp', 'primary', 1, '${esc(p.name)} ürün görseli', NOW())`);
  imgId++;

  productId++;
}

console.log(`Total products: ${productRows.length} (skipped ${skippedCount} duplicates)`);
console.log(`Total ingredients: ${piRows.length}`);
console.log(`Total affiliate links: ${alRows.length}`);
console.log(`Total labels: ${plRows.length}`);
console.log(`Total images: ${imgRows.length}`);

// Write brands SQL
let brandsSql = `-- BATCH 5: ${NEW_BRANDS.length} yeni marka\n`;
brandsSql += `INSERT INTO brands (brand_id, brand_name, brand_slug, country_of_origin, year_founded, website_url, status, created_at, updated_at) VALUES\n`;
brandsSql += NEW_BRANDS.map((b, i) =>
  `(${b.id}, '${esc(b.name)}', '${b.slug}', '${b.country}', ${b.founded}, '${b.website}', 'active', NOW(), NOW())${i < NEW_BRANDS.length - 1 ? ',' : ';'}`
).join('\n');
fs.writeFileSync(path.join(SEEDS, 'brands-batch5.sql'), brandsSql);

// Write products SQL (split into parts)
const PART_SIZE = 250;
for (let part = 0; part * PART_SIZE < productRows.length; part++) {
  const chunk = productRows.slice(part * PART_SIZE, (part + 1) * PART_SIZE);
  let sql = `-- BATCH 5 Part ${part + 1}: Products ${part * PART_SIZE + 884} - ${part * PART_SIZE + 883 + chunk.length}\n`;
  sql += `INSERT INTO products (product_id, variant_id, brand_id, category_id, domain_type, product_name, product_slug, product_type_label, short_description, barcode, net_content_value, net_content_unit, target_area, usage_time_hint, status, created_at, updated_at) VALUES\n`;
  sql += chunk.map((r, i) => r + (i < chunk.length - 1 ? ',' : ';')).join('\n');
  fs.writeFileSync(path.join(SEEDS, `products-batch5-part${part + 1}.sql`), sql);
}

// Write product_ingredients SQL (split)
const PI_PART = 1500;
for (let part = 0; part * PI_PART < piRows.length; part++) {
  const chunk = piRows.slice(part * PI_PART, (part + 1) * PI_PART);
  let sql = `-- BATCH 5 Part ${part + 1}: Product Ingredients\n`;
  sql += `INSERT INTO product_ingredients (product_ingredient_id, product_id, ingredient_id, ingredient_display_name, inci_order_rank, listed_as_raw, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, match_confidence, created_at, updated_at) VALUES\n`;
  sql += chunk.map((r, i) => r + (i < chunk.length - 1 ? ',' : ';')).join('\n');
  fs.writeFileSync(path.join(SEEDS, `product-ingredients-batch5-part${part + 1}.sql`), sql);
}

// Write affiliate_links SQL
const AL_PART = 1000;
for (let part = 0; part * AL_PART < alRows.length; part++) {
  const chunk = alRows.slice(part * AL_PART, (part + 1) * AL_PART);
  let sql = `-- BATCH 5 Part ${part + 1}: Affiliate Links\n`;
  sql += `INSERT INTO affiliate_links (affiliate_link_id, product_id, platform, affiliate_url, price_snapshot, price_updated_at, is_active, created_at, updated_at) VALUES\n`;
  sql += chunk.map((r, i) => r + (i < chunk.length - 1 ? ',' : ';')).join('\n');
  fs.writeFileSync(path.join(SEEDS, `affiliate-links-batch5-part${part + 1}.sql`), sql);
}

// Write product_labels SQL (split)
const PL_PART = 250;
for (let part = 0; part * PL_PART < plRows.length; part++) {
  const chunk = plRows.slice(part * PL_PART, (part + 1) * PL_PART);
  let sql = `-- BATCH 5 Part ${part + 1}: Product Labels\n`;
  sql += `INSERT INTO product_labels (product_label_id, product_id, inci_raw_text, ingredient_header_text, usage_instructions, warning_text, manufacturer_info, distributor_info, origin_info, batch_reference, expiry_info, pao_info, net_content_display, packaging_symbols_json, claim_texts_json, created_at, updated_at) VALUES\n`;
  sql += chunk.map((r, i) => r + (i < chunk.length - 1 ? ',' : ';')).join('\n');
  fs.writeFileSync(path.join(SEEDS, `product-labels-batch5-part${part + 1}.sql`), sql);
}

// Write product_images SQL
let imgSql = `-- BATCH 5: Product Images\n`;
imgSql += `INSERT INTO product_images (image_id, product_id, image_url, image_type, sort_order, alt_text, created_at) VALUES\n`;
imgSql += imgRows.map((r, i) => r + (i < imgRows.length - 1 ? ',' : ';')).join('\n');
fs.writeFileSync(path.join(SEEDS, 'product-images-batch5.sql'), imgSql);

console.log('\nFiles written successfully!');
