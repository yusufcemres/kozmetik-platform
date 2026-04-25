/**
 * Seed 100 yeni gıda takviyesi — full pipeline.
 *
 * Akış:
 *   1) Brand + ingredient slug → ID lookup
 *   2) products + supplement_details + product_ingredients + supplement_ingredients INSERT
 *   3) product_need_scores AGGREGATE INSERT (ingredient_need_mappings'ten compute)
 *   4) product_scores SIMPLE INSERT (heuristic A/B/C grade — admin recalculate sonra precision için)
 *   5) products.top_need_name + top_need_score REFRESH (mevcut SQL pattern)
 *
 * Idempotent: product_slug UNIQUE constraint sayesinde re-run güvenli (ON CONFLICT DO NOTHING).
 *
 * Kullanım:
 *   node src/scripts/data-quality/seed-100-supplements.mjs --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

// === DATA ===

// 100 supplement template'ı. Her biri:
// {
//   name: 'Marka Ürün Adı',
//   brand_slug: 'orzax' | 'voonka' | 'nutraxin' | 'naturals-garden',
//   form: 'tablet' | 'capsule' | 'softgel' | 'gummy' | 'powder' | 'liquid' | 'sachet',
//   serving_size: 1, serving_unit: 'capsule' | 'tablet' | ...
//   servings_per_container: 30, certification: 'GMP',
//   manufacturer_country: 'TR' | 'US' | ...
//   target_audience: 'adult' | 'pregnant' | 'child_4_12y',
//   short_description: '...',
//   ingredients: [
//     { slug, amount, unit, dv_pct, highlighted: true }
//   ]
// }
const TEMPLATES = [
  // --- Multivitamin & Multimineral (20) ---
  { name: 'Daily Multi 30 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 30,
    description: 'Günlük temel vitamin ve mineral karışımı. 12 vitamin + 8 mineral.',
    ings: [
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
      { slug: 'cholecalciferol', amount: 20, unit: 'mcg', dv: 100 },
      { slug: 'vitamin-e', amount: 12, unit: 'mg', dv: 100 },
      { slug: 'vitamin-b12', amount: 2.5, unit: 'mcg', dv: 100 },
      { slug: 'zinc', amount: 10, unit: 'mg', dv: 100 },
      { slug: 'selenium', amount: 55, unit: 'mcg', dv: 100 },
    ]
  },
  { name: 'Multi Plus 50+ 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: '50 yaş üstü için güçlendirilmiş multivitamin formülü.',
    ings: [
      { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 125 },
      { slug: 'vitamin-b12', amount: 25, unit: 'mcg', dv: 1000 },
      { slug: 'calcium-citrate', amount: 200, unit: 'mg', dv: 25 },
      { slug: 'vitamin-k2', amount: 75, unit: 'mcg', dv: 100 },
      { slug: 'coenzyme-q10', amount: 30, unit: 'mg' },
    ]
  },
  { name: 'Pregnancy Multi 60 Softjel', brand: 'orzax', form: 'softgel', serving: 1, container: 60, target: 'pregnant',
    description: 'Hamilelik ve emzirme dönemi için kapsamlı multivitamin formülü.',
    ings: [
      { slug: 'folic-acid', amount: 400, unit: 'mcg', dv: 200 },
      { slug: 'iron-bisglycinate', amount: 18, unit: 'mg', dv: 130, highlighted: true },
      { slug: 'cholecalciferol', amount: 15, unit: 'mcg', dv: 75 },
      { slug: 'iodine', amount: 200, unit: 'mcg', dv: 130 },
      { slug: 'omega-3', amount: 200, unit: 'mg' },
    ]
  },
  { name: 'Active Multi Performance 90 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 90,
    description: 'Aktif yaşam için 25 bileşenli enerji odaklı multivitamin.',
    ings: [
      { slug: 'vitamin-c', amount: 200, unit: 'mg', dv: 250 },
      { slug: 'vitamin-b6', amount: 5, unit: 'mg', dv: 357 },
      { slug: 'vitamin-b12', amount: 12, unit: 'mcg', dv: 480 },
      { slug: 'magnesium-citrate', amount: 100, unit: 'mg', dv: 27 },
      { slug: 'l-carnitine', amount: 250, unit: 'mg' },
    ]
  },
  { name: 'Stress Relief Complex 60 Kapsül', brand: 'voonka', form: 'capsule', serving: 1, container: 60,
    description: 'Stres ve yorgunluk dönemleri için magnezyum, ashwagandha ve B kompleks.',
    ings: [
      { slug: 'magnesium-citrate', amount: 200, unit: 'mg', dv: 53 },
      { slug: 'ashwagandha-extract', amount: 300, unit: 'mg', highlighted: true },
      { slug: 'vitamin-b6', amount: 4, unit: 'mg', dv: 286 },
      { slug: 'vitamin-b12', amount: 5, unit: 'mcg', dv: 200 },
      { slug: 'rhodiola', amount: 100, unit: 'mg' },
    ]
  },
  { name: 'Multi Daily 60 Kapsül', brand: 'nutraxin', form: 'capsule', serving: 2, container: 30,
    description: 'Yetişkin için günlük multivitamin ve antioksidan kombinasyonu.',
    ings: [
      { slug: 'vitamin-c', amount: 100, unit: 'mg', dv: 125 },
      { slug: 'cholecalciferol', amount: 20, unit: 'mcg', dv: 100 },
      { slug: 'zinc', amount: 8, unit: 'mg', dv: 80 },
      { slug: 'selenium', amount: 50, unit: 'mcg', dv: 91 },
      { slug: 'biotin', amount: 50, unit: 'mcg', dv: 100 },
    ]
  },
  { name: 'Energy Complex 30 Tablet', brand: 'nutraxin', form: 'tablet', serving: 1, container: 30,
    description: 'B kompleks vitamin, demir ve magnezyum ile enerji desteği.',
    ings: [
      { slug: 'vitamin-b12', amount: 50, unit: 'mcg', dv: 2000, highlighted: true },
      { slug: 'iron-bisglycinate', amount: 14, unit: 'mg', dv: 100 },
      { slug: 'magnesium-citrate', amount: 100, unit: 'mg', dv: 27 },
      { slug: 'l-carnitine', amount: 200, unit: 'mg' },
    ]
  },
  { name: 'Sport Boost 60 Kapsül', brand: 'nutraxin', form: 'capsule', serving: 2, container: 30,
    description: 'Performans ve toparlanma için BCAA, magnezyum, B6 kombinasyonu.',
    ings: [
      { slug: 'magnesium-citrate', amount: 250, unit: 'mg', dv: 67 },
      { slug: 'l-carnitine', amount: 500, unit: 'mg', highlighted: true },
      { slug: 'vitamin-b6', amount: 3, unit: 'mg', dv: 214 },
    ]
  },
  { name: 'Daily Vitality 90 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 90,
    description: 'Günlük canlılık ve bağışıklık için 30 bileşenli multivitamin formülü.',
    ings: [
      { slug: 'vitamin-c', amount: 150, unit: 'mg', dv: 188 },
      { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 125 },
      { slug: 'vitamin-e', amount: 15, unit: 'mg', dv: 125 },
      { slug: 'zinc', amount: 12, unit: 'mg', dv: 120 },
      { slug: 'selenium', amount: 60, unit: 'mcg', dv: 109 },
      { slug: 'iron-bisglycinate', amount: 8, unit: 'mg', dv: 57 },
    ]
  },
  { name: 'Active Aging 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 60,
    description: 'Anti-aging odaklı resveratrol, CoQ10 ve antioksidan kompleks.',
    ings: [
      { slug: 'resveratrol', amount: 100, unit: 'mg', highlighted: true },
      { slug: 'coenzyme-q10', amount: 50, unit: 'mg' },
      { slug: 'vitamin-c', amount: 200, unit: 'mg', dv: 250 },
      { slug: 'vitamin-e', amount: 20, unit: 'mg', dv: 167 },
      { slug: 'green-tea-extract', amount: 150, unit: 'mg' },
    ]
  },
  { name: 'Women Multi 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'Kadınlar için demir, folat ve cilt-saç destek bileşenleri.',
    ings: [
      { slug: 'iron-bisglycinate', amount: 14, unit: 'mg', dv: 100, highlighted: true },
      { slug: 'folic-acid', amount: 200, unit: 'mcg', dv: 100 },
      { slug: 'biotin', amount: 100, unit: 'mcg', dv: 200 },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
      { slug: 'cholecalciferol', amount: 20, unit: 'mcg', dv: 100 },
    ]
  },
  { name: 'Men Multi 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'Erkekler için saw palmetto, çinko ve B kompleks içeren multivitamin.',
    ings: [
      { slug: 'saw-palmetto-extract', amount: 200, unit: 'mg', highlighted: true },
      { slug: 'zinc', amount: 15, unit: 'mg', dv: 150 },
      { slug: 'vitamin-b12', amount: 5, unit: 'mcg', dv: 200 },
      { slug: 'selenium', amount: 70, unit: 'mcg', dv: 127 },
    ]
  },
  { name: 'Children Multi Gummy 60 Adet', brand: 'voonka', form: 'gummy', serving: 1, container: 60, target: 'child_4_12y',
    description: 'Çocuklar için meyveli aroma multivitamin gummy.',
    ings: [
      { slug: 'vitamin-c', amount: 30, unit: 'mg' },
      { slug: 'cholecalciferol', amount: 10, unit: 'mcg' },
      { slug: 'zinc', amount: 3, unit: 'mg' },
    ]
  },
  { name: 'Senior Care 60 Tablet', brand: 'nutraxin', form: 'tablet', serving: 1, container: 60,
    description: '60 yaş üstü için kemik, kalp ve bilişsel sağlık desteği.',
    ings: [
      { slug: 'cholecalciferol', amount: 30, unit: 'mcg', dv: 150 },
      { slug: 'vitamin-k2', amount: 100, unit: 'mcg', dv: 133 },
      { slug: 'omega-3', amount: 500, unit: 'mg' },
      { slug: 'coenzyme-q10', amount: 100, unit: 'mg', highlighted: true },
      { slug: 'ginkgo-biloba', amount: 60, unit: 'mg' },
    ]
  },
  { name: 'Immune Boost Multi 30 Saşe', brand: 'voonka', form: 'sachet', serving: 1, container: 30,
    description: 'Bağışıklık güçlendirme için C vitamini, çinko ve propolis sıcak içecek.',
    ings: [
      { slug: 'vitamin-c', amount: 1000, unit: 'mg', dv: 1250, highlighted: true },
      { slug: 'zinc', amount: 15, unit: 'mg', dv: 150 },
      { slug: 'propolis', amount: 100, unit: 'mg' },
      { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 125 },
    ]
  },
  { name: 'Beauty Multi 90 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 1, container: 90,
    description: 'Cilt, saç, tırnak için biotin + kolajen + C vitamini.',
    ings: [
      { slug: 'hydrolyzed-collagen', amount: 1000, unit: 'mg', highlighted: true },
      { slug: 'biotin', amount: 5000, unit: 'mcg', dv: 10000 },
      { slug: 'vitamin-c', amount: 100, unit: 'mg', dv: 125 },
      { slug: 'zinc', amount: 8, unit: 'mg', dv: 80 },
      { slug: 'hyaluronic-acid', amount: 50, unit: 'mg' },
    ]
  },
  { name: 'Mood Support Plus 60 Kapsül', brand: 'voonka', form: 'capsule', serving: 1, container: 60,
    description: 'Pozitif ruh hali için magnezyum, B6 ve ashwagandha.',
    ings: [
      { slug: 'ashwagandha-extract', amount: 600, unit: 'mg', highlighted: true },
      { slug: 'magnesium-bisglycinate', amount: 200, unit: 'mg', dv: 53 },
      { slug: 'vitamin-b6', amount: 5, unit: 'mg', dv: 357 },
      { slug: 'rhodiola', amount: 200, unit: 'mg' },
    ]
  },
  { name: 'Detox Cleanse 30 Kapsül', brand: 'nutraxin', form: 'capsule', serving: 1, container: 30,
    description: 'Karaciğer destek için silimarin, devedikenı ve antioksidanlar.',
    ings: [
      { slug: 'silymarin', amount: 200, unit: 'mg', highlighted: true },
      { slug: 'milk-thistle-extract', amount: 250, unit: 'mg' },
      { slug: 'green-tea-extract', amount: 150, unit: 'mg' },
      { slug: 'vitamin-e', amount: 12, unit: 'mg' },
    ]
  },
  { name: 'Athlete Performance 90 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 2, container: 45,
    description: 'Atletik performans için BCAA, magnezyum, l-arginin ve B vitaminleri.',
    ings: [
      { slug: 'l-arginine', amount: 1000, unit: 'mg', highlighted: true },
      { slug: 'magnesium-citrate', amount: 200, unit: 'mg', dv: 53 },
      { slug: 'vitamin-b6', amount: 6, unit: 'mg', dv: 429 },
      { slug: 'vitamin-b12', amount: 25, unit: 'mcg', dv: 1000 },
    ]
  },
  { name: 'Iron Plus C 30 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 30,
    description: 'Demir eksikliğinde C vitamini ile emilimi yüksek demir bisglisinat.',
    ings: [
      { slug: 'iron-bisglycinate', amount: 28, unit: 'mg', dv: 200, highlighted: true },
      { slug: 'vitamin-c', amount: 60, unit: 'mg', dv: 75 },
      { slug: 'folic-acid', amount: 200, unit: 'mcg', dv: 100 },
      { slug: 'vitamin-b12', amount: 5, unit: 'mcg', dv: 200 },
    ]
  },

  // --- Single Ingredient (30) ---
  { name: 'D3 1000 IU 60 Softjel', brand: 'orzax', form: 'softgel', serving: 1, container: 60,
    description: '1000 IU (25 mcg) D3 vitamini, kemik sağlığı ve bağışıklık desteği.',
    ings: [{ slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 125, highlighted: true }] },
  { name: 'D3 2000 IU 90 Softjel', brand: 'orzax', form: 'softgel', serving: 1, container: 90,
    description: '2000 IU (50 mcg) yüksek doz D3, eksiklik düzeltme amaçlı.',
    ings: [{ slug: 'cholecalciferol', amount: 50, unit: 'mcg', dv: 250, highlighted: true }] },
  { name: 'D3+K2 60 Softjel', brand: 'voonka', form: 'softgel', serving: 1, container: 60,
    description: 'D3 ve K2 sinerjisi — kalsiyumun kemiklere yönlendirilmesi.',
    ings: [
      { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 125, highlighted: true },
      { slug: 'vitamin-k2', amount: 100, unit: 'mcg', dv: 133 },
    ] },
  { name: 'Vitamin C 500 mg 60 Tablet', brand: 'nutraxin', form: 'tablet', serving: 1, container: 60,
    description: 'Saf askorbik asit 500 mg, antioksidan ve bağışıklık desteği.',
    ings: [{ slug: 'vitamin-c', amount: 500, unit: 'mg', dv: 625, highlighted: true }] },
  { name: 'Vitamin C 1000 Time Release 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: '1000 mg yavaş salınımlı C vitamini — gün boyu sürekli alım.',
    ings: [{ slug: 'vitamin-c', amount: 1000, unit: 'mg', dv: 1250, highlighted: true }] },
  { name: 'Magnesium Citrate 250 mg 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Yüksek emilimli magnezyum sitrat, kas ve sinir desteği.',
    ings: [{ slug: 'magnesium-citrate', amount: 250, unit: 'mg', dv: 67, highlighted: true }] },
  { name: 'Magnesium Bisglycinate 200 mg 90 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 1, container: 90,
    description: 'Mide dostu magnezyum bisglisinat — uyku ve kas rahatlama.',
    ings: [{ slug: 'magnesium-bisglycinate', amount: 200, unit: 'mg', dv: 53, highlighted: true }] },
  { name: 'Magnesium L-Threonate 60 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 2, container: 30,
    description: 'Beyin geçirgen magnezyum formu — bilişsel performans.',
    ings: [{ slug: 'magnesium-threonate', amount: 1500, unit: 'mg', highlighted: true }] },
  { name: 'Zinc 25 mg 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'Çinko pikolinat 25 mg, bağışıklık ve cilt sağlığı.',
    ings: [{ slug: 'zinc', amount: 25, unit: 'mg', dv: 250, highlighted: true }] },
  { name: 'Zinc 15 mg + Selenium 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Çinko ve selenyum kombinasyonu — güçlü antioksidan koruma.',
    ings: [
      { slug: 'zinc', amount: 15, unit: 'mg', dv: 150, highlighted: true },
      { slug: 'selenium', amount: 100, unit: 'mcg', dv: 182 },
    ] },
  { name: 'Iron Bisglycinate 14 mg 30 Tablet', brand: 'nutraxin', form: 'tablet', serving: 1, container: 30,
    description: 'Mide dostu demir bisglisinat — bulantı yapmaz.',
    ings: [{ slug: 'iron-bisglycinate', amount: 14, unit: 'mg', dv: 100, highlighted: true }] },
  { name: 'Calcium 600 + D3 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'Kalsiyum sitrat ve D3, kemik mineralizasyon desteği.',
    ings: [
      { slug: 'calcium-citrate', amount: 600, unit: 'mg', dv: 75, highlighted: true },
      { slug: 'cholecalciferol', amount: 10, unit: 'mcg', dv: 50 },
    ] },
  { name: 'B12 Methyl 1000 mcg 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Metilkobalamin formu B12 — daha yüksek biyoyararlanım.',
    ings: [{ slug: 'vitamin-b12', amount: 1000, unit: 'mcg', dv: 40000, highlighted: true }] },
  { name: 'B12 + Folate 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'B12 ve folat birlikte — homosistein dengesi.',
    ings: [
      { slug: 'vitamin-b12', amount: 500, unit: 'mcg', dv: 20000, highlighted: true },
      { slug: 'folic-acid', amount: 400, unit: 'mcg', dv: 200 },
    ] },
  { name: 'B Complex 60 Kapsül', brand: 'nutraxin', form: 'capsule', serving: 1, container: 60,
    description: '8 B vitamini içeren kompleks — enerji metabolizması.',
    ings: [
      { slug: 'vitamin-b12', amount: 25, unit: 'mcg', dv: 1000 },
      { slug: 'folic-acid', amount: 400, unit: 'mcg', dv: 200 },
      { slug: 'vitamin-b6', amount: 6, unit: 'mg', dv: 429 },
      { slug: 'vitamin-b1', amount: 5, unit: 'mg' },
      { slug: 'vitamin-b2', amount: 5, unit: 'mg' },
      { slug: 'biotin', amount: 50, unit: 'mcg' },
      { slug: 'niacin', amount: 16, unit: 'mg' },
      { slug: 'pantothenic-acid', amount: 6, unit: 'mg' },
    ] },
  { name: 'Vitamin K2 MK7 100 mcg 60 Softjel', brand: 'voonka', form: 'softgel', serving: 1, container: 60,
    description: 'MK7 formu K2 — uzun yarılanma ömrü, kalsiyum transportu.',
    ings: [{ slug: 'vitamin-k2', amount: 100, unit: 'mcg', dv: 133, highlighted: true }] },
  { name: 'Biotin 5000 mcg 90 Kapsül', brand: 'orzax', form: 'capsule', serving: 1, container: 90,
    description: 'Yüksek doz biotin — saç, cilt, tırnak sağlığı.',
    ings: [{ slug: 'biotin', amount: 5000, unit: 'mcg', dv: 10000, highlighted: true }] },
  { name: 'Hair Skin Nail Combo 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 60,
    description: 'Biotin + çinko + selenyum + C vitamini güzellik kombinasyonu.',
    ings: [
      { slug: 'biotin', amount: 2500, unit: 'mcg', dv: 5000, highlighted: true },
      { slug: 'zinc', amount: 10, unit: 'mg', dv: 100 },
      { slug: 'selenium', amount: 50, unit: 'mcg', dv: 91 },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
    ] },
  { name: 'Selenium 200 mcg 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Yüksek doz selenyum — tiroid ve bağışıklık.',
    ings: [{ slug: 'selenium', amount: 200, unit: 'mcg', dv: 364, highlighted: true }] },
  { name: 'Iodine 150 mcg 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 60,
    description: 'İyot — tiroid hormonu sentezi için temel mineral.',
    ings: [{ slug: 'iodine', amount: 150, unit: 'mcg', dv: 100, highlighted: true }] },
  { name: 'Vitamin E 400 IU 60 Softjel', brand: 'orzax', form: 'softgel', serving: 1, container: 60,
    description: 'Doğal d-alpha tokoferol formu E vitamini.',
    ings: [{ slug: 'vitamin-e', amount: 268, unit: 'mg', dv: 2233, highlighted: true }] },
  { name: 'Folate 400 mcg 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Folat (folik asit) — hücre yenilenme ve gebelik öncesi.',
    ings: [{ slug: 'folic-acid', amount: 400, unit: 'mcg', dv: 200, highlighted: true }] },
  { name: 'Niacin (B3) 100 mg 60 Tablet', brand: 'nutraxin', form: 'tablet', serving: 1, container: 60,
    description: 'B3 vitamini, lipid profili ve enerji metabolizması.',
    ings: [{ slug: 'niacin', amount: 100, unit: 'mg', dv: 625, highlighted: true }] },
  { name: 'B6 Pyridoxal 50 mg 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'B6 piridoksal-5-fosfat aktif formu.',
    ings: [{ slug: 'vitamin-b6', amount: 50, unit: 'mg', dv: 3571, highlighted: true }] },
  { name: 'Riboflavin (B2) 100 mg 30 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 30,
    description: 'B2 vitamini — migren profilaksisi destek.',
    ings: [{ slug: 'vitamin-b2', amount: 100, unit: 'mg' }] },
  { name: 'Pantothenic Acid 500 mg 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 60,
    description: 'B5 vitamini, koenzim A sentezi ve cilt onarım.',
    ings: [{ slug: 'pantothenic-acid', amount: 500, unit: 'mg', dv: 8333, highlighted: true }] },
  { name: 'Manganese 10 mg 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Manganez, bağ doku ve antioksidan enzim desteği.',
    ings: [{ slug: 'manganese', amount: 10, unit: 'mg', dv: 500, highlighted: true }] },
  { name: 'Molybdenum 250 mcg 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 60,
    description: 'Molibden, ksantin oksidaz enzim koenzimi.',
    ings: [{ slug: 'molybdenum', amount: 250, unit: 'mcg', dv: 500, highlighted: true }] },
  { name: 'Vitamin D3 5000 IU 90 Softjel', brand: 'orzax', form: 'softgel', serving: 1, container: 90,
    description: 'Yüksek doz D3 5000 IU — ciddi eksiklik düzeltme.',
    ings: [{ slug: 'cholecalciferol', amount: 125, unit: 'mcg', dv: 625, highlighted: true }] },
  { name: 'Liposomal Vitamin C 60 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 1, container: 60,
    description: 'Lipozomal C vitamini — yüksek emilim ve doku ulaşımı.',
    ings: [{ slug: 'vitamin-c', amount: 1000, unit: 'mg', dv: 1250, highlighted: true }] },

  // --- Omega / Cardio (10) ---
  { name: 'Omega-3 1000 mg 60 Softjel', brand: 'orzax', form: 'softgel', serving: 1, container: 60,
    description: 'Balık yağı 1000 mg, EPA 180 + DHA 120, kalp ve beyin desteği.',
    ings: [{ slug: 'omega-3', amount: 1000, unit: 'mg', dv: 100, highlighted: true }] },
  { name: 'Omega-3 Triple Strength 60 Softjel', brand: 'voonka', form: 'softgel', serving: 1, container: 60,
    description: 'Yüksek konsantrasyon balık yağı — EPA 600 + DHA 400.',
    ings: [{ slug: 'omega-3', amount: 1500, unit: 'mg', highlighted: true }] },
  { name: 'EPA-DHA 600/300 90 Softjel', brand: 'naturals-garden', form: 'softgel', serving: 2, container: 45,
    description: 'EPA dominant balık yağı — anti-enflamatuar destek.',
    ings: [{ slug: 'omega-3', amount: 1800, unit: 'mg', highlighted: true }] },
  { name: 'CoQ10 100 mg 60 Softjel', brand: 'orzax', form: 'softgel', serving: 1, container: 60,
    description: 'Koenzim Q10 ubikinon, mitokondri enerji ve kalp.',
    ings: [{ slug: 'coenzyme-q10', amount: 100, unit: 'mg', highlighted: true }] },
  { name: 'CoQ10 200 mg 30 Softjel', brand: 'voonka', form: 'softgel', serving: 1, container: 30,
    description: 'Yüksek doz CoQ10, statin kullanıcıları için ideal.',
    ings: [{ slug: 'coenzyme-q10', amount: 200, unit: 'mg', highlighted: true }] },
  { name: 'Ubiquinol 100 mg 30 Softjel', brand: 'naturals-garden', form: 'softgel', serving: 1, container: 30,
    description: 'Aktif form CoQ10 (ubiquinol) — yaşlı için emilim avantajı.',
    ings: [{ slug: 'coq10', amount: 100, unit: 'mg', highlighted: true }] },
  { name: 'Heart Combo Q10+Omega 60 Softjel', brand: 'nutraxin', form: 'softgel', serving: 1, container: 60,
    description: 'CoQ10 ve omega-3 kalp için sinerjik kombinasyon.',
    ings: [
      { slug: 'coenzyme-q10', amount: 60, unit: 'mg', highlighted: true },
      { slug: 'omega-3', amount: 500, unit: 'mg' },
    ] },
  { name: 'L-Carnitine 1000 mg 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'L-karnitin — yağ asit transportu, kalp ve egzersiz performansı.',
    ings: [{ slug: 'l-carnitine', amount: 1000, unit: 'mg', highlighted: true }] },
  { name: 'L-Arginine 1500 mg 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 2, container: 30,
    description: 'L-arginin nitrik oksit prekürsörü, vazodilatasyon.',
    ings: [{ slug: 'l-arginine', amount: 1500, unit: 'mg', highlighted: true }] },
  { name: 'L-Arg + L-Carn Combo 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'Arginin ve karnitin kombinasyonu, performans.',
    ings: [
      { slug: 'l-arginine', amount: 750, unit: 'mg' },
      { slug: 'l-carnitine', amount: 500, unit: 'mg' },
    ] },

  // --- Joint & Bone (10) ---
  { name: 'Glucosamine Sulfate 1500 mg 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'Glukozamin sülfat — kıkırdak yapı taşı.',
    ings: [{ slug: 'glucosamine', amount: 1500, unit: 'mg', highlighted: true }] },
  { name: 'Glucosamine + Chondroitin 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Glukozamin ve kondroitin — eklem destek ikilisi.',
    ings: [
      { slug: 'glucosamine', amount: 1500, unit: 'mg', highlighted: true },
      { slug: 'chondroitin', amount: 1200, unit: 'mg' },
    ] },
  { name: 'GCM Triple 90 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 3, container: 30,
    description: 'Glukozamin + kondroitin + MSM — eklem üçlüsü.',
    ings: [
      { slug: 'glucosamine', amount: 1500, unit: 'mg' },
      { slug: 'chondroitin', amount: 1200, unit: 'mg' },
      { slug: 'msm', amount: 1000, unit: 'mg' },
    ] },
  { name: 'Hydrolyzed Collagen Type II 60 Kapsül', brand: 'voonka', form: 'capsule', serving: 1, container: 60,
    description: 'Tip II kolajen — eklem kıkırdak desteği.',
    ings: [{ slug: 'hydrolyzed-collagen', amount: 1200, unit: 'mg', highlighted: true }] },
  { name: 'Marine Collagen 10000 mg 30 Saşe', brand: 'orzax', form: 'sachet', serving: 1, container: 30,
    description: 'Deniz kolajeni 10g + C vitamini — cilt ve eklem.',
    ings: [
      { slug: 'hydrolyzed-collagen', amount: 10000, unit: 'mg', highlighted: true },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
    ] },
  { name: 'Bone Complex Ca+Mg+D3+K2 60 Tablet', brand: 'nutraxin', form: 'tablet', serving: 1, container: 60,
    description: 'Kemik mineralizasyon dörtlüsü — kalsiyum, magnezyum, D3, K2.',
    ings: [
      { slug: 'calcium-citrate', amount: 600, unit: 'mg', dv: 75, highlighted: true },
      { slug: 'magnesium-citrate', amount: 200, unit: 'mg', dv: 53 },
      { slug: 'cholecalciferol', amount: 25, unit: 'mcg', dv: 125 },
      { slug: 'vitamin-k2', amount: 75, unit: 'mcg' },
    ] },
  { name: 'MSM 1000 mg 60 Kapsül', brand: 'orzax', form: 'capsule', serving: 1, container: 60,
    description: 'MSM (metilsülfonilmetan) — eklem ve cilt anti-enflamatuar.',
    ings: [{ slug: 'msm', amount: 1000, unit: 'mg', highlighted: true }] },
  { name: 'Joint Boost Plus 90 Tablet', brand: 'voonka', form: 'tablet', serving: 3, container: 30,
    description: 'Glukozamin + kondroitin + MSM + kurkumin — kapsamlı eklem.',
    ings: [
      { slug: 'glucosamine', amount: 1500, unit: 'mg' },
      { slug: 'chondroitin', amount: 1000, unit: 'mg' },
      { slug: 'msm', amount: 800, unit: 'mg' },
      { slug: 'curcumin', amount: 100, unit: 'mg', highlighted: true },
    ] },
  { name: 'Calcium Magnesium Zinc 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 60,
    description: 'Kalsiyum + magnezyum + çinko temel mineral kombinasyonu.',
    ings: [
      { slug: 'calcium-citrate', amount: 500, unit: 'mg', dv: 63 },
      { slug: 'magnesium-citrate', amount: 250, unit: 'mg', dv: 67 },
      { slug: 'zinc', amount: 10, unit: 'mg', dv: 100 },
    ] },
  { name: 'Collagen + HA + C 30 Saşe', brand: 'voonka', form: 'sachet', serving: 1, container: 30,
    description: 'Kolajen + hyaluronik asit + C vitamini içecek tozu.',
    ings: [
      { slug: 'hydrolyzed-collagen', amount: 8000, unit: 'mg', highlighted: true },
      { slug: 'hyaluronic-acid', amount: 100, unit: 'mg' },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
    ] },

  // --- Probiotic & Digestive (10) ---
  { name: 'Probiotic 10 Billion CFU 30 Kapsül', brand: 'orzax', form: 'capsule', serving: 1, container: 30,
    description: 'Multi-strain probiyotik 10 milyar CFU — sindirim ve bağışıklık.',
    ings: [{ slug: 'probiotics', amount: 10, unit: 'mg', highlighted: true }] },
  { name: 'Probiotic 25 Billion CFU 30 Kapsül', brand: 'voonka', form: 'capsule', serving: 1, container: 30,
    description: 'Yüksek potens 25 milyar CFU çoklu suş probiyotik.',
    ings: [{ slug: 'probiotics', amount: 25, unit: 'mg', highlighted: true }] },
  { name: 'Probiotic 50 Billion CFU 30 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 1, container: 30,
    description: 'En yüksek potens 50 milyar CFU — antibiyotik sonrası.',
    ings: [{ slug: 'probiotics', amount: 50, unit: 'mg', highlighted: true }] },
  { name: 'Probiotic + Prebiotic 60 Kapsül', brand: 'nutraxin', form: 'capsule', serving: 1, container: 60,
    description: 'Probiyotik ve inulin lif (prebiyotik) sinerjik kombinasyon.',
    ings: [{ slug: 'probiotics', amount: 15, unit: 'mg', highlighted: true }] },
  { name: 'Lactobacillus Rhamnosus 30 Kapsül', brand: 'voonka', form: 'capsule', serving: 1, container: 30,
    description: 'Tek suş Lactobacillus rhamnosus — IBS ve genel sindirim.',
    ings: [{ slug: 'probiotics', amount: 5, unit: 'mg', highlighted: true }] },
  { name: 'Bifidobacterium Longum 30 Kapsül', brand: 'orzax', form: 'capsule', serving: 1, container: 30,
    description: 'Bifidobacterium longum — kolon sağlığı.',
    ings: [{ slug: 'probiotics', amount: 5, unit: 'mg', highlighted: true }] },
  { name: 'Digestive Enzyme Complex 60 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 1, container: 60,
    description: 'Amilaz, lipaz, proteaz, laktaz sindirim enzim karışımı.',
    ings: [] },
  { name: 'Glutamine 5000 mg 30 Saşe', brand: 'nutraxin', form: 'sachet', serving: 1, container: 30,
    description: 'L-glutamin — bağırsak bariyeri ve egzersiz toparlanma.',
    ings: [] },
  { name: 'Saccharomyces Boulardii 30 Kapsül', brand: 'voonka', form: 'capsule', serving: 1, container: 30,
    description: 'Maya probiyotik — antibiyotik kaynaklı ishal koruma.',
    ings: [{ slug: 'probiotics', amount: 5, unit: 'mg', highlighted: true }] },
  { name: 'IBS Relief Combo 30 Kapsül', brand: 'orzax', form: 'capsule', serving: 1, container: 30,
    description: 'Probiyotik + nane yağı + sinameki — IBS rahatlama.',
    ings: [{ slug: 'probiotics', amount: 10, unit: 'mg', highlighted: true }] },

  // --- Beauty & Hair-Skin (10) ---
  { name: 'Bovine Collagen Type 1+3 30 Saşe', brand: 'orzax', form: 'sachet', serving: 1, container: 30,
    description: 'Sığır kolajen Tip 1+3 — cilt ve saç desteği 10g.',
    ings: [{ slug: 'hydrolyzed-collagen', amount: 10000, unit: 'mg', highlighted: true }] },
  { name: 'Marine Collagen + HA + C 60 Tablet', brand: 'voonka', form: 'tablet', serving: 2, container: 30,
    description: 'Deniz kolajeni, HA ve C vitamini cilt elastikiyet.',
    ings: [
      { slug: 'hydrolyzed-collagen', amount: 5000, unit: 'mg', highlighted: true },
      { slug: 'hyaluronic-acid', amount: 80, unit: 'mg' },
      { slug: 'vitamin-c', amount: 100, unit: 'mg', dv: 125 },
    ] },
  { name: 'Hair Growth Complex 60 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 1, container: 60,
    description: 'Biotin + saw palmetto + çinko — saç dökülme önleme.',
    ings: [
      { slug: 'biotin', amount: 5000, unit: 'mcg', dv: 10000, highlighted: true },
      { slug: 'saw-palmetto-extract', amount: 320, unit: 'mg' },
      { slug: 'zinc', amount: 15, unit: 'mg', dv: 150 },
    ] },
  { name: 'Hyaluronic Acid 200 mg 60 Kapsül', brand: 'orzax', form: 'capsule', serving: 1, container: 60,
    description: 'Düşük moleküler ağırlık HA — cilt nem ve eklem.',
    ings: [{ slug: 'hyaluronic-acid', amount: 200, unit: 'mg', highlighted: true }] },
  { name: 'Skin Glow 30 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 30,
    description: 'Astaxantin + C vitamini + E vitamini güneş ve antioksidan.',
    ings: [
      { slug: 'vitamin-c', amount: 100, unit: 'mg', dv: 125 },
      { slug: 'vitamin-e', amount: 12, unit: 'mg', dv: 100 },
      { slug: 'lutein', amount: 6, unit: 'mg' },
    ] },
  { name: 'Nail Strength 30 Tablet', brand: 'nutraxin', form: 'tablet', serving: 1, container: 30,
    description: 'Biotin + silika + selenyum — tırnak güçlendirme.',
    ings: [
      { slug: 'biotin', amount: 2500, unit: 'mcg', dv: 5000, highlighted: true },
      { slug: 'selenium', amount: 50, unit: 'mcg', dv: 91 },
    ] },
  { name: 'Beauty Multi Plus 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 1, container: 60,
    description: 'Kolajen + biotin + çinko + C vitamini güzellik kompleksi.',
    ings: [
      { slug: 'hydrolyzed-collagen', amount: 1000, unit: 'mg', highlighted: true },
      { slug: 'biotin', amount: 2500, unit: 'mcg', dv: 5000 },
      { slug: 'zinc', amount: 8, unit: 'mg', dv: 80 },
      { slug: 'vitamin-c', amount: 80, unit: 'mg', dv: 100 },
    ] },
  { name: 'Anti-Aging Resveratrol 60 Kapsül', brand: 'voonka', form: 'capsule', serving: 1, container: 60,
    description: 'Trans-resveratrol — sirtuin aktivasyonu, anti-aging.',
    ings: [{ slug: 'resveratrol', amount: 250, unit: 'mg', highlighted: true }] },
  { name: 'Quercetin 500 mg 60 Kapsül', brand: 'orzax', form: 'capsule', serving: 1, container: 60,
    description: 'Quercetin flavonoid — anti-enflamatuar ve antihistaminik.',
    ings: [{ slug: 'quercetin', amount: 500, unit: 'mg', highlighted: true }] },
  { name: 'Spirulina 1000 mg 60 Tablet', brand: 'naturals-garden', form: 'tablet', serving: 2, container: 30,
    description: 'Spirulina platensis — yüksek protein ve fitokimyasal.',
    ings: [{ slug: 'spirulina-platensis-extract', amount: 1000, unit: 'mg', highlighted: true }] },

  // --- Brain / Cognitive (5) ---
  { name: 'Ginkgo Biloba 60 mg 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Ginkgo biloba ekstresi — beyin kan akımı ve hafıza.',
    ings: [{ slug: 'ginkgo-biloba', amount: 60, unit: 'mg', highlighted: true }] },
  { name: 'Ginkgo 120 mg 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'Yüksek doz ginkgo biloba — bilişsel performans.',
    ings: [{ slug: 'ginkgo-biloba', amount: 120, unit: 'mg', highlighted: true }] },
  { name: 'Panax Ginseng 200 mg 30 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 1, container: 30,
    description: 'Panax ginsen ekstresi — adaptojen, enerji ve odaklanma.',
    ings: [{ slug: 'panax-ginseng-extract', amount: 200, unit: 'mg', highlighted: true }] },
  { name: 'Cognitive Boost 60 Kapsül', brand: 'nutraxin', form: 'capsule', serving: 2, container: 30,
    description: 'Ginkgo + B kompleks + omega-3 beyin sağlığı.',
    ings: [
      { slug: 'ginkgo-biloba', amount: 80, unit: 'mg' },
      { slug: 'vitamin-b12', amount: 25, unit: 'mcg' },
      { slug: 'omega-3', amount: 500, unit: 'mg' },
    ] },
  { name: 'Brain Focus Combo 30 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 30,
    description: 'Bacopa + ashwagandha + B6 — günlük zihinsel netlik.',
    ings: [
      { slug: 'ashwagandha-extract', amount: 300, unit: 'mg' },
      { slug: 'vitamin-b6', amount: 4, unit: 'mg' },
    ] },

  // --- Stress & Sleep (5) ---
  { name: 'Melatonin 3 mg 60 Tablet', brand: 'orzax', form: 'tablet', serving: 1, container: 60,
    description: 'Melatonin 3 mg — uyku başlangıcı yardımcısı.',
    ings: [{ slug: 'melatonin', amount: 3, unit: 'mg', highlighted: true }] },
  { name: 'Melatonin 5 mg 60 Tablet', brand: 'voonka', form: 'tablet', serving: 1, container: 60,
    description: 'Yüksek doz melatonin 5 mg — jet lag ve uykusuzluk.',
    ings: [{ slug: 'melatonin', amount: 5, unit: 'mg', highlighted: true }] },
  { name: 'Ashwagandha 600 mg 60 Kapsül', brand: 'naturals-garden', form: 'capsule', serving: 1, container: 60,
    description: 'KSM-66 ashwagandha — kortizol regulasyon ve stres.',
    ings: [{ slug: 'ashwagandha-extract', amount: 600, unit: 'mg', highlighted: true }] },
  { name: 'Rhodiola Rosea 250 mg 60 Kapsül', brand: 'voonka', form: 'capsule', serving: 1, container: 60,
    description: 'Rhodiola adaptojen — yorgunluk ve mental dayanıklılık.',
    ings: [{ slug: 'rhodiola', amount: 250, unit: 'mg', highlighted: true }] },
  { name: 'Sleep Combo Mg+Mel 60 Kapsül', brand: 'orzax', form: 'capsule', serving: 1, container: 60,
    description: 'Magnezyum + melatonin uyku kompleksi.',
    ings: [
      { slug: 'magnesium-bisglycinate', amount: 200, unit: 'mg', dv: 53 },
      { slug: 'melatonin', amount: 3, unit: 'mg', highlighted: true },
    ] },
];

// === SCRIPT ===

function turkishSlug(s) {
  return s
    .toLowerCase()
    .replaceAll('ı', 'i')
    .replaceAll('İ', 'i')
    .replaceAll('ö', 'o')
    .replaceAll('Ö', 'o')
    .replaceAll('ü', 'u')
    .replaceAll('Ü', 'u')
    .replaceAll('ç', 'c')
    .replaceAll('Ç', 'c')
    .replaceAll('ş', 's')
    .replaceAll('Ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('Ğ', 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function bandFromOrder(order) {
  if (order <= 1) return 'high';
  if (order <= 3) return 'medium';
  return 'low';
}

async function main() {
  if (TEMPLATES.length !== 100) {
    console.error(`Expected 100 templates, found ${TEMPLATES.length}`);
    process.exit(1);
  }

  const apply = process.argv.includes('--apply');
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL missing');
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    // Lookup brand_ids
    const brandRes = await client.query(
      `SELECT brand_id, brand_slug, brand_name FROM brands WHERE brand_slug IN ('orzax','voonka','nutraxin','naturals-garden')`,
    );
    const brandMap = new Map(brandRes.rows.map((b) => [b.brand_slug, { id: b.brand_id, name: b.brand_name }]));
    console.log('Brands:', Object.fromEntries(brandMap));

    // Lookup ingredient_ids
    const allSlugs = Array.from(new Set(TEMPLATES.flatMap((t) => t.ings.map((i) => i.slug))));
    const ingRes = await client.query(
      `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
      [allSlugs],
    );
    const ingMap = new Map(ingRes.rows.map((r) => [r.ingredient_slug, r.ingredient_id]));
    console.log(`Ingredients found: ${ingMap.size} / ${allSlugs.length} requested`);
    const missing = allSlugs.filter((s) => !ingMap.has(s));
    if (missing.length) {
      console.warn('MISSING ingredient slugs (will skip those rows):', missing);
    }

    // Plan
    const plan = TEMPLATES.map((t) => {
      const brand = brandMap.get(t.brand);
      if (!brand) throw new Error(`Brand not found: ${t.brand}`);
      const slug = turkishSlug(`${t.brand}-${t.name}`);
      return { ...t, brand_id: brand.id, brand_name: brand.name, slug };
    });

    if (!apply) {
      console.log(`\n[DRY-RUN] ${plan.length} ürün eklenecek. Örnek ilk 3:`);
      for (const p of plan.slice(0, 3)) {
        console.log(`  ${p.slug} (brand=${p.brand_name}) — ${p.ings.length} ingredient`);
      }
      console.log('\nRe-run with --apply to write.');
      return;
    }

    await client.query('BEGIN');
    let inserted = 0;
    let skipped = 0;
    const newIds = [];
    for (const p of plan) {
      // Skip if slug already exists
      const exists = await client.query(`SELECT product_id FROM products WHERE product_slug = $1`, [p.slug]);
      if (exists.rows.length > 0) {
        skipped++;
        continue;
      }

      // Choose category
      // 9 = Vitamin & Mineral (default)
      // 11 = Bitkisel Takviye (herbal — ginkgo, ginseng, ashwagandha, rhodiola etc.)
      // 149 = Hamile Takviyeleri
      // 152 = Çocuk Vitaminleri
      let categoryId = 9;
      if (p.target === 'pregnant') categoryId = 149;
      else if (p.target === 'child_4_12y') categoryId = 152;
      else {
        const herbalSlugs = ['ashwagandha-extract', 'rhodiola', 'ginkgo-biloba', 'panax-ginseng-extract', 'green-tea-extract', 'silymarin', 'milk-thistle-extract', 'saw-palmetto-extract', 'spirulina-platensis-extract', 'curcumin'];
        if (p.ings.some((i) => herbalSlugs.includes(i.slug))) categoryId = 11;
      }

      // Insert product
      const productRes = await client.query(
        `INSERT INTO products (product_name, product_slug, brand_id, category_id, domain_type, short_description, status, target_audience, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'supplement', $5, 'published', $6, NOW(), NOW())
         RETURNING product_id`,
        [p.name, p.slug, p.brand_id, categoryId, p.description, p.target || 'adult'],
      );
      const productId = productRes.rows[0].product_id;
      newIds.push(productId);

      // Insert supplement_details
      await client.query(
        `INSERT INTO supplement_details (product_id, form, serving_size, serving_unit, servings_per_container, manufacturer_country, certification, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'TR', 'GMP', NOW(), NOW())`,
        [productId, p.form, p.serving, p.form, p.container],
      );

      // Insert ingredients (product_ingredients + supplement_ingredients)
      let order = 0;
      for (const ing of p.ings) {
        order++;
        const ingId = ingMap.get(ing.slug);
        if (!ingId) continue; // skip unknown ingredients

        await client.query(
          `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, match_confidence, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, false, $6, 'matched', 0.95, NOW(), NOW())`,
          [productId, ingId, ing.slug, order, bandFromOrder(order), !!ing.highlighted],
        );

        // amount: precision 10, scale 3 (max 9999999.999)
        // daily_value: precision 5, scale 1 (max 9999.9)
        const dvCapped = ing.dv != null ? Math.min(9999, ing.dv) : null;
        await client.query(
          `INSERT INTO supplement_ingredients (product_id, ingredient_id, amount_per_serving, unit, daily_value_percentage, is_proprietary_blend, sort_order, created_at)
           VALUES ($1, $2, $3, $4, $5, false, $6, NOW())`,
          [productId, ingId, ing.amount, ing.unit || 'mg', dvCapped, order],
        );
      }
      inserted++;
    }

    // Compute product_need_scores from ingredient_need_mappings (aggregate)
    if (newIds.length > 0) {
      console.log(`Computing need scores for ${newIds.length} new products...`);
      await client.query(
        `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, calculated_at)
         SELECT
           pi.product_id,
           inm.need_id,
           LEAST(100, ROUND(AVG(inm.relevance_score)::numeric, 2)) AS compatibility_score,
           CASE WHEN COUNT(*) >= 3 THEN 'high' WHEN COUNT(*) >= 1 THEN 'medium' ELSE 'low' END AS confidence_level,
           NOW()
         FROM product_ingredients pi
         JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
         WHERE pi.product_id = ANY($1::int[])
           AND inm.effect_type IN ('effective', 'supportive', 'synergistic', 'positive')
         GROUP BY pi.product_id, inm.need_id
         HAVING AVG(inm.relevance_score) >= 30`,
        [newIds],
      );

      // Refresh top_need_name + top_need_score
      console.log('Refreshing top_need_name + top_need_score...');
      await client.query(
        `UPDATE products p
         SET top_need_name = sub.need_name,
             top_need_score = sub.compatibility_score
         FROM (
           SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
           FROM product_need_scores ns
           JOIN needs n ON n.need_id = ns.need_id
           WHERE ns.product_id = ANY($1::int[])
           ORDER BY ns.product_id, ns.compatibility_score DESC
         ) sub
         WHERE p.product_id = sub.product_id`,
        [newIds],
      );

      // Insert basic product_scores (heuristic — admin recalc precision için sonra)
      console.log('Inserting heuristic product_scores...');
      await client.query(
        `INSERT INTO product_scores (product_id, algorithm_version, overall_score, grade, breakdown, explanation, flags, computed_at)
         SELECT
           p.product_id,
           'supplement-v2' AS algorithm_version,
           CASE
             WHEN sd.certification IS NOT NULL AND sd.certification ILIKE '%GMP%' THEN 78
             ELSE 70
           END AS overall_score,
           CASE
             WHEN sd.certification IS NOT NULL AND sd.certification ILIKE '%GMP%' THEN 'B'
             ELSE 'C'
           END AS grade,
           '{"form_quality": 75, "dose_efficacy": 70, "evidence_grade": 80, "third_party_testing": 60, "interaction_safety": 85, "transparency_and_tier": 75}'::jsonb,
           '[]'::jsonb,
           '{"proprietary_blends": [], "ul_exceeded": [], "harmful_interactions": []}'::jsonb,
           NOW()
         FROM products p
         JOIN supplement_details sd ON sd.product_id = p.product_id
         WHERE p.product_id = ANY($1::int[])
         ON CONFLICT (product_id, algorithm_version) DO NOTHING`,
        [newIds],
      );
    }

    await client.query('COMMIT');
    console.log(`\nOK: ${inserted} ürün insert, ${skipped} mevcut zaten (skip)`);
    console.log(`product_need_scores ve product_scores kayıtları toplu oluşturuldu.`);

    // Final stats
    const after = await client.query(`SELECT COUNT(*) AS n FROM products WHERE domain_type = 'supplement'`);
    console.log(`Toplam supplement: ${after.rows[0].n}`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('FAILED:', err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
