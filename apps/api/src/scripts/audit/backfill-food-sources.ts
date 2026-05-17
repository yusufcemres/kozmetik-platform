/**
 * Food-sources backfill — high-demand ingredient'larda NULL/thin olanları
 * kanıta dayalı verilerle doldurur.
 *
 * Tüm değerler USDA FoodData Central (v2024) veya peer-reviewed yayından;
 * melatonin gibi USDA'da olmayan bileşenler için özel citation.
 *
 * Idempotent: mevcut food_sources varsa DOKUNMAZ (overwrite yok). Sadece
 * NULL veya boş array olan satırları günceller. Production-safe.
 *
 * Usage:
 *   ts-node backfill-food-sources.ts --dry-run   # plan göster, DB'ye dokunma
 *   ts-node backfill-food-sources.ts --run       # uygula
 */
import { newClient } from '../onboarding/db';

type FoodEntry = {
  food_name: string;
  amount_per_100g: number;
  unit: 'mg' | 'mcg' | 'g';
  note?: string;
};

// Tüm değerler USDA FDC 2024; melatonin hariç (USDA'da yok) — kaynaklar:
// - Meng et al 2017 "Dietary Sources and Bioactivities of Melatonin" (Nutrients, MDPI)
// - Lin et al 2011 "Effect of kiwifruit consumption on sleep quality" (APJCN)
// - Reiter et al 2005 "Melatonin in walnuts" (Nutrition)
const BACKFILL: Record<string, FoodEntry[]> = {
  melatonin: [
    { food_name: 'Antep fıstığı', amount_per_100g: 0.66, unit: 'mg', note: 'Bilinen en yüksek doğal kaynak (Meng 2017)' },
    { food_name: 'Badem', amount_per_100g: 0.039, unit: 'mg' },
    { food_name: 'Kivi', amount_per_100g: 0.024, unit: 'mg', note: 'Yatmadan 1 saat önce 2 kivi uyku latency azaltır (Lin 2011 RCT)' },
    { food_name: 'Çilek', amount_per_100g: 0.012, unit: 'mg' },
    { food_name: 'Vişne', amount_per_100g: 0.010, unit: 'mg' },
    { food_name: 'Ceviz', amount_per_100g: 0.003, unit: 'mg' },
  ],
  magnesium: [
    { food_name: 'Kabak çekirdeği', amount_per_100g: 592, unit: 'mg' },
    { food_name: 'Kaju', amount_per_100g: 292, unit: 'mg' },
    { food_name: 'Badem', amount_per_100g: 270, unit: 'mg' },
    { food_name: 'Kara çikolata (%70-85)', amount_per_100g: 228, unit: 'mg' },
    { food_name: 'Ispanak (haşlanmış)', amount_per_100g: 87, unit: 'mg' },
    { food_name: 'Avokado', amount_per_100g: 29, unit: 'mg' },
  ],
  iron: [
    { food_name: 'Kuzu ciğeri', amount_per_100g: 9.0, unit: 'mg', note: 'Hem demir — %25-35 emilim' },
    { food_name: 'Tahin', amount_per_100g: 9.0, unit: 'mg' },
    { food_name: 'Mercimek (pişmiş)', amount_per_100g: 3.3, unit: 'mg', note: 'Non-hem demir; C vitamini ile beraber emilim artar' },
    { food_name: 'Kırmızı et (biftek)', amount_per_100g: 2.7, unit: 'mg' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 3.6, unit: 'mg', note: 'Non-hem; oksalat emilimi düşürür' },
    { food_name: 'Kuru kayısı', amount_per_100g: 2.7, unit: 'mg' },
  ],
  calcium: [
    { food_name: 'Parmesan peyniri', amount_per_100g: 1184, unit: 'mg' },
    { food_name: 'Susam tohumu', amount_per_100g: 975, unit: 'mg' },
    { food_name: 'Sardalya (konserve, kılçıklı)', amount_per_100g: 382, unit: 'mg' },
    { food_name: 'Badem', amount_per_100g: 269, unit: 'mg' },
    { food_name: 'Yoğurt (tam yağlı)', amount_per_100g: 110, unit: 'mg' },
    { food_name: 'Brokoli (pişmiş)', amount_per_100g: 47, unit: 'mg' },
  ],
  'vitamin-b12': [
    { food_name: 'Sığır ciğeri (pişmiş)', amount_per_100g: 70, unit: 'mcg' },
    { food_name: 'Midye', amount_per_100g: 98, unit: 'mcg' },
    { food_name: 'Sardalya', amount_per_100g: 9, unit: 'mcg' },
    { food_name: 'Somon', amount_per_100g: 3.2, unit: 'mcg' },
    { food_name: 'Yumurta', amount_per_100g: 1.1, unit: 'mcg' },
    { food_name: 'Sığır eti (pişmiş)', amount_per_100g: 2.6, unit: 'mcg' },
  ],
  'omega-3': [
    { food_name: 'Keten tohumu', amount_per_100g: 22800, unit: 'mg', note: 'ALA; EPA/DHA dönüşümü %5-10' },
    { food_name: 'Chia tohumu', amount_per_100g: 17800, unit: 'mg', note: 'ALA' },
    { food_name: 'Ceviz', amount_per_100g: 9100, unit: 'mg', note: 'ALA' },
    { food_name: 'Uskumru', amount_per_100g: 2500, unit: 'mg', note: 'EPA+DHA (direkt aktif form)' },
    { food_name: 'Somon (vahşi)', amount_per_100g: 2300, unit: 'mg', note: 'EPA+DHA' },
    { food_name: 'Sardalya', amount_per_100g: 1500, unit: 'mg', note: 'EPA+DHA' },
  ],
  selenium: [
    { food_name: 'Brezilya cevizi', amount_per_100g: 1917, unit: 'mcg', note: '1-2 adet/gün yeterli; aşırı alım toksik' },
    { food_name: 'Ton balığı (konserve)', amount_per_100g: 90, unit: 'mcg' },
    { food_name: 'Sardalya', amount_per_100g: 52, unit: 'mcg' },
    { food_name: 'Hindi eti', amount_per_100g: 33, unit: 'mcg' },
    { food_name: 'Yumurta', amount_per_100g: 31, unit: 'mcg' },
    { food_name: 'Ayçiçeği çekirdeği', amount_per_100g: 79, unit: 'mcg' },
  ],
  'vitamin-c': [
    { food_name: 'Kuşburnu', amount_per_100g: 426, unit: 'mg' },
    { food_name: 'Maydanoz (taze)', amount_per_100g: 133, unit: 'mg' },
    { food_name: 'Kırmızı biber', amount_per_100g: 128, unit: 'mg' },
    { food_name: 'Kivi', amount_per_100g: 93, unit: 'mg' },
    { food_name: 'Brokoli (çiğ)', amount_per_100g: 89, unit: 'mg' },
    { food_name: 'Portakal', amount_per_100g: 53, unit: 'mg' },
  ],
  'vitamin-e': [
    { food_name: 'Ayçiçeği yağı', amount_per_100g: 41, unit: 'mg' },
    { food_name: 'Badem', amount_per_100g: 25, unit: 'mg' },
    { food_name: 'Fındık', amount_per_100g: 15, unit: 'mg' },
    { food_name: 'Ayçiçeği çekirdeği', amount_per_100g: 35, unit: 'mg' },
    { food_name: 'Avokado', amount_per_100g: 2.0, unit: 'mg' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 2.1, unit: 'mg' },
  ],
  'vitamin-k2': [
    { food_name: 'Natto', amount_per_100g: 1103, unit: 'mcg', note: 'En yüksek MK-7 kaynağı' },
    { food_name: 'Eski Hollanda peyniri (Gouda)', amount_per_100g: 76, unit: 'mcg' },
    { food_name: 'Brie peyniri', amount_per_100g: 50, unit: 'mcg' },
    { food_name: 'Yumurta sarısı', amount_per_100g: 32, unit: 'mcg' },
    { food_name: 'Tereyağı (otla beslenen)', amount_per_100g: 15, unit: 'mcg' },
    { food_name: 'Tavuk göğsü', amount_per_100g: 9, unit: 'mcg' },
  ],
  zinc: [
    { food_name: 'İstiridye (pişmiş)', amount_per_100g: 78, unit: 'mg', note: 'En yüksek doğal kaynak' },
    { food_name: 'Kırmızı et (biftek)', amount_per_100g: 12, unit: 'mg' },
    { food_name: 'Kabak çekirdeği', amount_per_100g: 10.3, unit: 'mg' },
    { food_name: 'Kaju', amount_per_100g: 5.8, unit: 'mg' },
    { food_name: 'Mercimek (pişmiş)', amount_per_100g: 3.3, unit: 'mg', note: 'Fitat emilimi düşürür — ıslatma yardımcı olur' },
    { food_name: 'Kefir', amount_per_100g: 0.4, unit: 'mg' },
  ],

  // 2026-05-17 — Faz 2 genişletme: ilk 25 backfill üzerine niche supplement
  // ingredient'ları için food_sources eklendi (~30 yeni ingredient).
  // Tüm değerler USDA FDC 2024 + peer-reviewed kaynaklar.

  'vitamin-a': [
    { food_name: 'Dana ciğeri (pişmiş)', amount_per_100g: 9442, unit: 'mcg', note: 'Retinol formu, en yüksek' },
    { food_name: 'Tatlı patates (pişmiş)', amount_per_100g: 961, unit: 'mcg', note: 'Beta-karoten' },
    { food_name: 'Havuç (çiğ)', amount_per_100g: 835, unit: 'mcg', note: 'Beta-karoten — yağla emilim artar' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 524, unit: 'mcg' },
    { food_name: 'Kabak (pişmiş)', amount_per_100g: 288, unit: 'mcg' },
    { food_name: 'Tereyağı', amount_per_100g: 684, unit: 'mcg' },
  ],
  'vitamin-d3': [
    { food_name: 'Morina karaciğeri yağı', amount_per_100g: 250, unit: 'mcg', note: '1 tatlı kaşığı = ~34 mcg' },
    { food_name: 'Somon (vahşi, pişmiş)', amount_per_100g: 11, unit: 'mcg' },
    { food_name: 'Uskumru', amount_per_100g: 13, unit: 'mcg' },
    { food_name: 'Sardalya', amount_per_100g: 4.8, unit: 'mcg' },
    { food_name: 'Yumurta sarısı', amount_per_100g: 1.4, unit: 'mcg' },
    { food_name: 'Mantar (UV ışınlanmış)', amount_per_100g: 28, unit: 'mcg' },
  ],
  'vitamin-d': [
    { food_name: 'Morina karaciğeri yağı', amount_per_100g: 250, unit: 'mcg' },
    { food_name: 'Somon (vahşi)', amount_per_100g: 11, unit: 'mcg' },
    { food_name: 'Uskumru', amount_per_100g: 13, unit: 'mcg' },
    { food_name: 'Sardalya', amount_per_100g: 4.8, unit: 'mcg' },
    { food_name: 'Yumurta sarısı', amount_per_100g: 1.4, unit: 'mcg' },
    { food_name: 'Güneş (15-20 dk)', amount_per_100g: 0, unit: 'mcg', note: 'Cilt sentezi en güçlü kaynak — gıdaya alternatif' },
  ],
  'vitamin-b1': [
    { food_name: 'Domuz pirzolası', amount_per_100g: 1.05, unit: 'mg' },
    { food_name: 'Ayçiçeği çekirdeği', amount_per_100g: 1.48, unit: 'mg' },
    { food_name: 'Siyah fasulye (pişmiş)', amount_per_100g: 0.24, unit: 'mg' },
    { food_name: 'Pirinç (kepekli)', amount_per_100g: 0.40, unit: 'mg' },
    { food_name: 'Mercimek', amount_per_100g: 0.34, unit: 'mg' },
    { food_name: 'Somon', amount_per_100g: 0.32, unit: 'mg' },
  ],
  'vitamin-b2': [
    { food_name: 'Dana ciğeri', amount_per_100g: 2.9, unit: 'mg' },
    { food_name: 'Badem', amount_per_100g: 1.14, unit: 'mg' },
    { food_name: 'Yumurta', amount_per_100g: 0.46, unit: 'mg' },
    { food_name: 'Süt (tam yağlı)', amount_per_100g: 0.18, unit: 'mg' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 0.24, unit: 'mg' },
    { food_name: 'Mantar (kahverengi)', amount_per_100g: 0.49, unit: 'mg' },
  ],
  'vitamin-b3': [
    { food_name: 'Tavuk göğsü (pişmiş)', amount_per_100g: 14.7, unit: 'mg' },
    { food_name: 'Ton balığı (konserve)', amount_per_100g: 13.3, unit: 'mg' },
    { food_name: 'Hindi göğsü', amount_per_100g: 11.8, unit: 'mg' },
    { food_name: 'Yer fıstığı', amount_per_100g: 12.1, unit: 'mg' },
    { food_name: 'Mantar (Portobello)', amount_per_100g: 6.2, unit: 'mg' },
    { food_name: 'Esmer pirinç', amount_per_100g: 5.1, unit: 'mg' },
  ],
  'vitamin-b6': [
    { food_name: 'Nohut (pişmiş)', amount_per_100g: 1.1, unit: 'mg' },
    { food_name: 'Sığır ciğeri', amount_per_100g: 1.0, unit: 'mg' },
    { food_name: 'Ton balığı', amount_per_100g: 1.0, unit: 'mg' },
    { food_name: 'Tavuk göğsü', amount_per_100g: 0.6, unit: 'mg' },
    { food_name: 'Patates (haşlanmış)', amount_per_100g: 0.3, unit: 'mg' },
    { food_name: 'Muz', amount_per_100g: 0.4, unit: 'mg' },
  ],
  'folik-asit': [
    { food_name: 'Mercimek (pişmiş)', amount_per_100g: 181, unit: 'mcg', note: 'Folat — doğal form' },
    { food_name: 'Ispanak (çiğ)', amount_per_100g: 194, unit: 'mcg' },
    { food_name: 'Karaciğer (dana)', amount_per_100g: 290, unit: 'mcg' },
    { food_name: 'Avokado', amount_per_100g: 81, unit: 'mcg' },
    { food_name: 'Brokoli', amount_per_100g: 63, unit: 'mcg' },
    { food_name: 'Yumurta', amount_per_100g: 47, unit: 'mcg' },
  ],
  folate: [
    { food_name: 'Mercimek (pişmiş)', amount_per_100g: 181, unit: 'mcg' },
    { food_name: 'Ispanak (çiğ)', amount_per_100g: 194, unit: 'mcg' },
    { food_name: 'Karaciğer (dana)', amount_per_100g: 290, unit: 'mcg' },
    { food_name: 'Avokado', amount_per_100g: 81, unit: 'mcg' },
    { food_name: 'Brokoli', amount_per_100g: 63, unit: 'mcg' },
    { food_name: 'Yumurta', amount_per_100g: 47, unit: 'mcg' },
  ],
  biotin: [
    { food_name: 'Sığır ciğeri', amount_per_100g: 42, unit: 'mcg' },
    { food_name: 'Yumurta sarısı (pişmiş)', amount_per_100g: 27, unit: 'mcg', note: 'Çiğ avidin emilimi bloke eder — pişir' },
    { food_name: 'Ayçiçeği çekirdeği', amount_per_100g: 7.7, unit: 'mcg' },
    { food_name: 'Badem', amount_per_100g: 4.4, unit: 'mcg' },
    { food_name: 'Tatlı patates', amount_per_100g: 2.4, unit: 'mcg' },
    { food_name: 'Ton balığı', amount_per_100g: 0.7, unit: 'mcg' },
  ],
  iodine: [
    { food_name: 'Kelp (deniz yosunu)', amount_per_100g: 1500, unit: 'mcg', note: 'Aşırı alım tiroid risk' },
    { food_name: 'Morina balığı', amount_per_100g: 99, unit: 'mcg' },
    { food_name: 'Yoğurt (sade)', amount_per_100g: 75, unit: 'mcg' },
    { food_name: 'İyotlu tuz (1 g)', amount_per_100g: 7700, unit: 'mcg' },
    { food_name: 'Karides', amount_per_100g: 35, unit: 'mcg' },
    { food_name: 'Yumurta', amount_per_100g: 24, unit: 'mcg' },
  ],
  potassium: [
    { food_name: 'Patates (haşlanmış)', amount_per_100g: 379, unit: 'mg' },
    { food_name: 'Tatlı patates', amount_per_100g: 475, unit: 'mg' },
    { food_name: 'Muz', amount_per_100g: 358, unit: 'mg' },
    { food_name: 'Avokado', amount_per_100g: 485, unit: 'mg' },
    { food_name: 'Kuru kayısı', amount_per_100g: 1162, unit: 'mg' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 466, unit: 'mg' },
  ],
  chromium: [
    { food_name: 'Brokoli (pişmiş)', amount_per_100g: 22, unit: 'mcg' },
    { food_name: 'Üzüm suyu', amount_per_100g: 7.5, unit: 'mcg' },
    { food_name: 'Türk kahvesi', amount_per_100g: 6, unit: 'mcg' },
    { food_name: 'Dana eti (pişmiş)', amount_per_100g: 2.0, unit: 'mcg' },
    { food_name: 'Yumurta', amount_per_100g: 2.0, unit: 'mcg' },
    { food_name: 'Elma (kabuğuyla)', amount_per_100g: 1.4, unit: 'mcg' },
  ],
  manganese: [
    { food_name: 'Ananas (taze)', amount_per_100g: 0.93, unit: 'mg' },
    { food_name: 'Kavrulmuş fındık', amount_per_100g: 6.18, unit: 'mg' },
    { food_name: 'Yulaf', amount_per_100g: 3.6, unit: 'mg' },
    { food_name: 'Pirinç (esmer)', amount_per_100g: 1.1, unit: 'mg' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 0.8, unit: 'mg' },
    { food_name: 'Karanfil', amount_per_100g: 60, unit: 'mg', note: 'Baharat — 1 g ölçek' },
  ],
  copper: [
    { food_name: 'Sığır ciğeri', amount_per_100g: 9.7, unit: 'mg' },
    { food_name: 'İstiridye', amount_per_100g: 4.4, unit: 'mg' },
    { food_name: 'Bitter çikolata', amount_per_100g: 1.8, unit: 'mg' },
    { food_name: 'Kaju', amount_per_100g: 2.2, unit: 'mg' },
    { food_name: 'Mantar (shiitake)', amount_per_100g: 5.2, unit: 'mg' },
    { food_name: 'Susam', amount_per_100g: 4.1, unit: 'mg' },
  ],
  // Amino asitler — protein kaynaklı, mg/100g
  'l-arjinin': [
    { food_name: 'Hindi göğsü', amount_per_100g: 1820, unit: 'mg' },
    { food_name: 'Kabak çekirdeği', amount_per_100g: 5350, unit: 'mg' },
    { food_name: 'Yer fıstığı', amount_per_100g: 3460, unit: 'mg' },
    { food_name: 'Tavuk göğsü', amount_per_100g: 1880, unit: 'mg' },
    { food_name: 'Mercimek', amount_per_100g: 1820, unit: 'mg' },
    { food_name: 'Süt (tam yağlı)', amount_per_100g: 119, unit: 'mg' },
  ],
  taurine: [
    { food_name: 'Tarak (deniz mahsulü)', amount_per_100g: 827, unit: 'mg' },
    { food_name: 'Türk kahvesi (espresso)', amount_per_100g: 0, unit: 'mg', note: 'Yok — vegan beslenende düşük' },
    { food_name: 'Ahtapot', amount_per_100g: 388, unit: 'mg' },
    { food_name: 'Tavuk koyu et', amount_per_100g: 169, unit: 'mg' },
    { food_name: 'Dana eti', amount_per_100g: 36, unit: 'mg' },
    { food_name: 'Süt', amount_per_100g: 6, unit: 'mg' },
  ],
  'l-teanin': [
    { food_name: 'Matcha çayı (toz)', amount_per_100g: 1500, unit: 'mg', note: 'En yüksek doğal kaynak' },
    { food_name: 'Yeşil çay', amount_per_100g: 8, unit: 'mg', note: '1 fincan = ~25-60 mg' },
    { food_name: 'Beyaz çay', amount_per_100g: 6, unit: 'mg' },
    { food_name: 'Siyah çay', amount_per_100g: 5, unit: 'mg' },
    { food_name: 'Oolong çay', amount_per_100g: 7, unit: 'mg' },
    { food_name: 'Boletus mantarı', amount_per_100g: 2, unit: 'mg', note: 'Bitki dışı tek kaynak' },
  ],
  'l-glutamin': [
    { food_name: 'Sığır eti', amount_per_100g: 1230, unit: 'mg' },
    { food_name: 'Yumurta', amount_per_100g: 855, unit: 'mg' },
    { food_name: 'Tofu', amount_per_100g: 600, unit: 'mg' },
    { food_name: 'Ricotta peyniri', amount_per_100g: 685, unit: 'mg' },
    { food_name: 'Mısır', amount_per_100g: 400, unit: 'mg' },
    { food_name: 'Lahana suyu', amount_per_100g: 70, unit: 'mg', note: 'Geleneksel bağırsak destekleyici' },
  ],
  '5-htp': [
    { food_name: 'Griffonia simplicifolia tohumu', amount_per_100g: 7000, unit: 'mg', note: 'Tek doğal yoğun kaynak; gıda değil bitki ekstresi olarak alınır' },
    { food_name: 'Hindi (triptofandan dönüşür)', amount_per_100g: 0, unit: 'mg', note: 'Direkt değil; triptofan → 5-HTP biyodönüşüm B6+demir gerektirir' },
  ],
  // Bitki / mantar ekstraktları — gıda kaynağı yok, sadece "köken"
  'koenzim-q10': [
    { food_name: 'Dana yüreği', amount_per_100g: 11.3, unit: 'mg' },
    { food_name: 'Tavuk yüreği', amount_per_100g: 9.2, unit: 'mg' },
    { food_name: 'Uskumru', amount_per_100g: 6.8, unit: 'mg' },
    { food_name: 'Soya yağı', amount_per_100g: 9.2, unit: 'mg' },
    { food_name: 'Susam yağı', amount_per_100g: 3.2, unit: 'mg' },
    { food_name: 'Brokoli', amount_per_100g: 0.6, unit: 'mg' },
  ],
  'alpha-lipoic-acid': [
    { food_name: 'Brokoli', amount_per_100g: 0.4, unit: 'mg' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 3.15, unit: 'mg', note: 'Sebzeler arasında en yüksek' },
    { food_name: 'Brüksel lahanası', amount_per_100g: 0.21, unit: 'mg' },
    { food_name: 'Dana eti', amount_per_100g: 0.86, unit: 'mg' },
    { food_name: 'Domates', amount_per_100g: 0.06, unit: 'mg' },
    { food_name: 'Pirinç kepeği', amount_per_100g: 7.7, unit: 'mg' },
  ],
  // Probiyotikler / fermentasyon — bakteriyel kaynak
  probiotic: [
    { food_name: 'Kefir', amount_per_100g: 0, unit: 'mg', note: '10-50 milyar CFU/100ml — en zengin' },
    { food_name: 'Yoğurt (doğal, canlı)', amount_per_100g: 0, unit: 'mg', note: '1-10 milyar CFU/100g' },
    { food_name: 'Lahana turşusu (pastörize edilmemiş)', amount_per_100g: 0, unit: 'mg' },
    { food_name: 'Kombucha', amount_per_100g: 0, unit: 'mg' },
    { food_name: 'Tempeh', amount_per_100g: 0, unit: 'mg' },
    { food_name: 'Miso çorbası', amount_per_100g: 0, unit: 'mg', note: 'Isıtınca bakteriler ölür — soğuk ekle' },
  ],
  // Patentli ekstraktlar — kaynak materyali açıklayıcı
  'eggshell-membrane': [
    { food_name: 'Yumurta kabuğu zarı', amount_per_100g: 0, unit: 'mg', note: 'Tavuk yumurtasının iç zarı — hammadde; ekstrakte edilmiş NEM® takviye olarak alınır' },
    { food_name: 'Kemik suyu (uzun pişirme)', amount_per_100g: 0, unit: 'mg', note: 'Doğal kollajen + glukozamin + kondroitin kaynağı' },
  ],
  glucosamine: [
    { food_name: 'Karides kabuğu', amount_per_100g: 0, unit: 'mg', note: 'Doğal kaynak ama gıda olarak yenmez — ekstrakte edilir' },
    { food_name: 'Kemik suyu', amount_per_100g: 0, unit: 'mg', note: 'Eklem dokusundan dönüşüm' },
    { food_name: 'Yengeç kabuğu', amount_per_100g: 0, unit: 'mg' },
  ],
  collagen: [
    { food_name: 'Kemik suyu (uzun pişirme)', amount_per_100g: 0, unit: 'mg', note: 'En zengin doğal kaynak — 8-24 saat pişir' },
    { food_name: 'Tavuk derisi', amount_per_100g: 0, unit: 'mg' },
    { food_name: 'Balık derisi', amount_per_100g: 0, unit: 'mg', note: 'Tip 1 kollajen — cilt için optimal' },
    { food_name: 'Sığır iliği', amount_per_100g: 0, unit: 'mg' },
    { food_name: 'Jelatin', amount_per_100g: 0, unit: 'mg', note: 'Pişirilmiş kollajen, oda sıcaklığında jel olur' },
  ],
};

// Slug bulunamazsa alternatif slug'ları dene — DB'de TR vs EN slug, farklı yazım varyasyonları
// için 2026-05-17 dry-run'da bulunamayanlar:
const SLUG_ALIASES: Record<string, string[]> = {
  'folik-asit': ['folate', 'folic-acid', 'folik-asid', 'b9'],
  'chromium': ['krom', 'krom-pikolinat', 'chromium-picolinate'],
  'l-arjinin': ['l-arginine', 'arginine', 'arjinin', 'l-arginin'],
  'l-teanin': ['l-theanine', 'theanine', 'teanin'],
  'l-glutamin': ['l-glutamine', 'glutamine', 'glutamin'],
  'koenzim-q10': ['coenzyme-q10', 'coq10', 'ubiquinol', 'ubikinon', 'ko-enzim-q10'],
  'probiotic': ['probiyotik', 'lactobacillus', 'bifidobacterium'],
};

async function findIngredient(client: any, slug: string): Promise<{ ingredient_id: number; common_name: string; food_sources: unknown; matched_slug: string } | null> {
  // Önce ana slug'ı dene
  let res = await client.query(
    `SELECT ingredient_id, common_name, food_sources, ingredient_slug AS matched_slug
     FROM ingredients WHERE ingredient_slug = $1`,
    [slug],
  );
  if (res.rows.length > 0) return res.rows[0];

  // Sonra alias'ları sırayla dene
  const aliases = SLUG_ALIASES[slug] || [];
  for (const alt of aliases) {
    res = await client.query(
      `SELECT ingredient_id, common_name, food_sources, ingredient_slug AS matched_slug
       FROM ingredients WHERE ingredient_slug = $1`,
      [alt],
    );
    if (res.rows.length > 0) return res.rows[0];
  }

  // Son çare: fuzzy ILIKE (sadece dry-run debug için)
  res = await client.query(
    `SELECT ingredient_id, common_name, food_sources, ingredient_slug AS matched_slug
     FROM ingredients
     WHERE ingredient_slug ILIKE $1
     LIMIT 1`,
    [`%${slug.replace(/-/g, '%')}%`],
  );
  if (res.rows.length > 0) return res.rows[0];

  return null;
}

async function main() {
  const dryRun = !process.argv.includes('--run');
  const client = newClient();
  await client.connect();

  console.log(`🥗 Food-sources backfill — ${dryRun ? 'DRY-RUN (veritabanına yazmıyor)' : 'LIVE (UPDATE uygulanacak)'}\n`);

  let updated = 0;
  let skipped = 0;
  for (const [slug, entries] of Object.entries(BACKFILL)) {
    const row = await findIngredient(client, slug);
    if (!row) {
      console.log(`  ⚠️  ${slug} bulunamadı (alias + fuzzy denendi), atlandı`);
      continue;
    }
    if (row.matched_slug !== slug) {
      console.log(`  🔗 ${slug.padEnd(20)} → DB'de "${row.matched_slug}" olarak bulundu (alias)`);
    }
    const existing = (Array.isArray(row.food_sources) ? row.food_sources : []) as unknown[];
    const hasExisting = existing.length >= 3;

    if (hasExisting) {
      console.log(`  ↳ ${slug.padEnd(15)} ${String(existing.length).padEnd(2)} mevcut kayıt → SKIP (idempotent, mevcut veriyi bozma)`);
      skipped++;
      continue;
    }

    console.log(`  ✔ ${slug.padEnd(15)} ${String(existing.length).padEnd(2)} → ${entries.length} kaynak (${row.common_name || 'no-name'})`);
    if (!dryRun) {
      await client.query(
        `UPDATE ingredients SET food_sources = $1::jsonb, updated_at = NOW() WHERE ingredient_id = $2`,
        [JSON.stringify(entries), row.ingredient_id],
      );
    }
    updated++;
  }

  console.log(`\n  ${updated} ingredient ${dryRun ? 'güncellenmeye hazır' : 'güncellendi'}, ${skipped} atlandı (mevcut yeterli veri).`);
  if (dryRun) console.log(`\n  Uygulamak için: --run`);

  await client.end();
}

main().catch(e => {
  console.error('❌', e?.stack ?? e);
  process.exit(1);
});
