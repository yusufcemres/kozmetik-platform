-- Sprint 6 (#10 follow-up) — Eksik food_sources için seed
-- Patron geri bildirimi: takviye detay "Hangi Gıdalarda Bulabilirsiniz?" bölümünde
-- bazı bileşenler (Riboflavin, B6, L-Serine, Betain HCl vs.) görünmüyor çünkü
-- DB'de food_sources NULL.
--
-- Bu seed, food_sources NULL veya boş olan ingredient'ları doldurur.
-- Idempotent: ingredient yoksa veya zaten food_sources varsa atlar.
--
-- Kaynak referansları: USDA SR Legacy, NIH ODS, EFSA Dietary Reference Values.
-- Biyoyararlanım sınıfları: Yüksek (>%50 emilim) | Orta (%20-50) | Düşük (<%20)
--
-- Kullanım:
--   pnpm ts-node apps/api/src/scripts/run-sql-file.ts \
--     apps/api/src/database/seeds/ingredient-food-sources-seed.sql

-- ============ B GROUP VITAMINS ============

-- Tiamin (B1)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Domuz eti (yağsız)", "amount_per_100g": 1.05, "unit": "mg", "bioavailability": "Yüksek", "note": "En zengin hayvansal kaynak"},
    {"food_name": "Ayçekirdeği", "amount_per_100g": 1.48, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Siyah fasulye (haşlanmış)", "amount_per_100g": 0.24, "unit": "mg", "bioavailability": "Orta", "note": "Antinutrient''ler için ıslat + haşla"},
    {"food_name": "Sazan balığı", "amount_per_100g": 0.30, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Tam buğday ekmeği", "amount_per_100g": 0.30, "unit": "mg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 1.2,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('thiamine','thiamin','vitamin-b1','tiamin')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Riboflavin (B2) — patron screenshot'ında eksik olan
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Dana ciğeri", "amount_per_100g": 2.83, "unit": "mg", "bioavailability": "Yüksek", "note": "En zengin doğal kaynak"},
    {"food_name": "Yumurta (büyük)", "amount_per_100g": 0.46, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Badem", "amount_per_100g": 1.14, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Yağsız peynir", "amount_per_100g": 0.42, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Ispanak (haşlanmış)", "amount_per_100g": 0.24, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Süt (tam yağlı)", "amount_per_100g": 0.18, "unit": "mg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 1.3,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('riboflavin','vitamin-b2','riboflavin-5-phosphate','b2-vitamini')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Niasin (B3)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Tavuk göğsü", "amount_per_100g": 14.8, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Ton balığı (konserve)", "amount_per_100g": 13.3, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Yer fıstığı", "amount_per_100g": 12.1, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Kurutulmuş şeftali", "amount_per_100g": 4.4, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Mantar (Portobello)", "amount_per_100g": 3.6, "unit": "mg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 16,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('niacin','niacinamide','vitamin-b3','nicotinic-acid','niacinamid')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Pantotenik Asit (B5)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Tavuk ciğeri", "amount_per_100g": 6.7, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Mantar (Shiitake)", "amount_per_100g": 3.6, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Avokado", "amount_per_100g": 1.4, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Yumurta sarısı", "amount_per_100g": 1.4, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Yulaf ezmesi", "amount_per_100g": 1.1, "unit": "mg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 5,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('pantothenic-acid','vitamin-b5','d-pantothenic-acid','panthenol-supplement')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- B6 Vitamini (Pyridoxine, Pyridoxal-5-Phosphate) — patron screenshot'ında eksik
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Nohut (haşlanmış)", "amount_per_100g": 1.10, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Somon balığı", "amount_per_100g": 0.94, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Tavuk göğsü", "amount_per_100g": 0.81, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Patates (kabuklu fırınlanmış)", "amount_per_100g": 0.54, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Muz", "amount_per_100g": 0.37, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Ayçekirdeği", "amount_per_100g": 1.35, "unit": "mg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 1.7,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('pyridoxine','vitamin-b6','b6-vitamini','pyridoxal-5-phosphate','pyridoxine-hcl','p-5-p')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Biotin (B7)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Yumurta sarısı (pişmiş)", "amount_per_100g": 27, "unit": "mcg", "bioavailability": "Yüksek", "note": "Çiğ yumurta beyazı biotin emilimini engeller"},
    {"food_name": "Dana ciğeri", "amount_per_100g": 42, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Somon balığı", "amount_per_100g": 5, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Badem (kavrulmuş)", "amount_per_100g": 4.4, "unit": "mcg", "bioavailability": "Orta"},
    {"food_name": "Tatlı patates", "amount_per_100g": 2.4, "unit": "mcg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 30,
  daily_recommended_unit = 'mcg'
WHERE ingredient_slug IN ('biotin','vitamin-b7','vitamin-h')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Folik Asit / Metilfolat
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Mercimek (haşlanmış)", "amount_per_100g": 181, "unit": "mcg", "bioavailability": "Orta"},
    {"food_name": "Ispanak (çiğ)", "amount_per_100g": 194, "unit": "mcg", "bioavailability": "Düşük", "note": "Pişirme folatın %50''sini bozar"},
    {"food_name": "Marul (Romaine)", "amount_per_100g": 136, "unit": "mcg", "bioavailability": "Düşük"},
    {"food_name": "Kuşkonmaz (haşlanmış)", "amount_per_100g": 149, "unit": "mcg", "bioavailability": "Orta"},
    {"food_name": "Avokado", "amount_per_100g": 81, "unit": "mcg", "bioavailability": "Orta"},
    {"food_name": "Brokoli (haşlanmış)", "amount_per_100g": 108, "unit": "mcg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 400,
  daily_recommended_unit = 'mcg'
WHERE ingredient_slug IN ('folic-acid','folate','vitamin-b9','metilfolat','methylfolate','l-methylfolate','5-mthf','quatrefolic')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- B12 (Cyanocobalamin / Methylcobalamin) — patron screenshot'ında zaten varmış ama emin olmak için
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Dana ciğeri (pişmiş)", "amount_per_100g": 70, "unit": "mcg", "bioavailability": "Yüksek", "note": "En yoğun B12 kaynağı"},
    {"food_name": "Uskumru", "amount_per_100g": 19, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Somon balığı", "amount_per_100g": 4.9, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Yumurta", "amount_per_100g": 1.1, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Süt (tam yağlı)", "amount_per_100g": 0.5, "unit": "mcg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 2.4,
  daily_recommended_unit = 'mcg'
WHERE ingredient_slug IN ('vitamin-b12','cyanocobalamin','methylcobalamin','b12-vitamini','metilkobalamin','cobalamin')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- ============ FAT-SOLUBLE VITAMINS ============

-- Vitamin A (Retinyl Palmitate / Beta-Carotene)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Dana ciğeri", "amount_per_100g": 8800, "unit": "mcg", "bioavailability": "Yüksek", "note": "Retinol formu"},
    {"food_name": "Tatlı patates (fırınlanmış)", "amount_per_100g": 961, "unit": "mcg", "bioavailability": "Orta", "note": "Beta-karoten formu, dönüşüm 12:1"},
    {"food_name": "Havuç (çiğ)", "amount_per_100g": 835, "unit": "mcg", "bioavailability": "Orta", "note": "Yağ ile birlikte tüket"},
    {"food_name": "Ispanak (haşlanmış)", "amount_per_100g": 524, "unit": "mcg", "bioavailability": "Orta"},
    {"food_name": "Yumurta sarısı", "amount_per_100g": 381, "unit": "mcg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 800,
  daily_recommended_unit = 'mcg'
WHERE ingredient_slug IN ('vitamin-a','retinol','retinyl-palmitate','retinyl-acetate','beta-carotene','beta-karoten')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Vitamin D3 (Cholecalciferol)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Morina ciğeri yağı (1 yk)", "amount_per_100g": 250, "unit": "mcg", "bioavailability": "Yüksek", "note": "En yoğun doğal kaynak"},
    {"food_name": "Som balığı (vahşi)", "amount_per_100g": 14.2, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Sardalya (konserve)", "amount_per_100g": 5.0, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Yumurta sarısı", "amount_per_100g": 1.4, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Mantar (UV maruz)", "amount_per_100g": 7.0, "unit": "mcg", "bioavailability": "Orta", "note": "D2 formu, D3 değil"},
    {"food_name": "Süt (D ile zenginleştirilmiş)", "amount_per_100g": 1.2, "unit": "mcg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 15,
  daily_recommended_unit = 'mcg'
WHERE ingredient_slug IN ('vitamin-d3','cholecalciferol','vitamin-d','d3-vitamini')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Vitamin E (Tocopherol)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Buğday tohumu yağı", "amount_per_100g": 149, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Ayçekirdeği", "amount_per_100g": 35, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Badem", "amount_per_100g": 25, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Findık", "amount_per_100g": 15, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Avokado", "amount_per_100g": 2.1, "unit": "mg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 12,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('vitamin-e','tocopherol','d-alpha-tocopherol','mixed-tocopherols','e-vitamini')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Vitamin K2 (Menaquinone)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Natto (Japon fermente soya)", "amount_per_100g": 1103, "unit": "mcg", "bioavailability": "Yüksek", "note": "MK-7 formunda en zengin"},
    {"food_name": "Kaz ciğeri", "amount_per_100g": 369, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Sert peynir (Gouda)", "amount_per_100g": 76, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Yumurta sarısı", "amount_per_100g": 32, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Tavuk butu", "amount_per_100g": 14, "unit": "mcg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 75,
  daily_recommended_unit = 'mcg'
WHERE ingredient_slug IN ('vitamin-k2','menaquinone','mk-7','mk-4','vitamin-k')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- ============ MINERALS ============

-- Çinko (Zinc) — patron screenshot'ında zaten varmış
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "İstiridye (pişmiş)", "amount_per_100g": 78.6, "unit": "mg", "bioavailability": "Yüksek", "note": "En zengin çinko kaynağı"},
    {"food_name": "Kırmızı et (biftek)", "amount_per_100g": 12.3, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Kabak çekirdeği", "amount_per_100g": 10.3, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Kaju", "amount_per_100g": 5.8, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Mercimek (pişmiş)", "amount_per_100g": 3.3, "unit": "mg", "bioavailability": "Düşük", "note": "Fitik asit emilimi azaltır"},
    {"food_name": "Kefir", "amount_per_100g": 0.4, "unit": "mg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 10,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('zinc','cinko','zinc-bisglycinate','zinc-citrate','zinc-picolinate','zinc-sulfate','zinc-gluconate','zinc-pca')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Magnezyum
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Kabak çekirdeği", "amount_per_100g": 535, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Badem", "amount_per_100g": 270, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Ispanak (haşlanmış)", "amount_per_100g": 87, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Kara çikolata (%70+)", "amount_per_100g": 228, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Avokado", "amount_per_100g": 29, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Kara fasulye", "amount_per_100g": 70, "unit": "mg", "bioavailability": "Düşük"}
  ]'::jsonb,
  daily_recommended_value = 375,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('magnesium','magnezyum','magnesium-oxide','magnesium-citrate','magnesium-glycinate','magnesium-bisglycinate','magnesium-malate','magnesium-l-threonate')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Demir (Iron)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Dana ciğeri (pişmiş)", "amount_per_100g": 6.5, "unit": "mg", "bioavailability": "Yüksek", "note": "Heme demir, %15-35 emilim"},
    {"food_name": "Sığır eti (yağsız)", "amount_per_100g": 2.6, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Mercimek (haşlanmış)", "amount_per_100g": 3.3, "unit": "mg", "bioavailability": "Düşük", "note": "Non-heme demir, C vitamini ile emilim artar"},
    {"food_name": "Ispanak (haşlanmış)", "amount_per_100g": 3.6, "unit": "mg", "bioavailability": "Düşük"},
    {"food_name": "Kabak çekirdeği", "amount_per_100g": 8.8, "unit": "mg", "bioavailability": "Düşük"},
    {"food_name": "Kakao tozu", "amount_per_100g": 13.9, "unit": "mg", "bioavailability": "Düşük"}
  ]'::jsonb,
  daily_recommended_value = 14,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('iron','demir','ferrous-sulfate','ferrous-fumarate','ferrous-bisglycinate','iron-bisglycinate','heme-iron')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Kalsiyum
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Sardalya (kemikli)", "amount_per_100g": 382, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Süt (tam yağlı)", "amount_per_100g": 113, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Yoğurt (sade)", "amount_per_100g": 121, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Susam tohumu", "amount_per_100g": 975, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Tahin", "amount_per_100g": 426, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Kara lahana", "amount_per_100g": 232, "unit": "mg", "bioavailability": "Yüksek", "note": "Düşük oksalat, iyi emilim"}
  ]'::jsonb,
  daily_recommended_value = 800,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('calcium','kalsiyum','calcium-carbonate','calcium-citrate','calcium-malate','tricalcium-phosphate')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Selenyum
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Brezilya cevizi", "amount_per_100g": 1917, "unit": "mcg", "bioavailability": "Yüksek", "note": "1 ceviz = ~95 mcg, günlük 2-3 yeterli"},
    {"food_name": "Ton balığı (konserve)", "amount_per_100g": 80, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Sardalya", "amount_per_100g": 53, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Hindi göğsü", "amount_per_100g": 31, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Yumurta", "amount_per_100g": 31, "unit": "mcg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 55,
  daily_recommended_unit = 'mcg'
WHERE ingredient_slug IN ('selenium','selenyum','sodium-selenite','selenomethionine','l-selenomethionine')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- İyot (Iodine)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Kelp (kuru deniz yosunu)", "amount_per_100g": 232000, "unit": "mcg", "bioavailability": "Yüksek", "note": "Aşırı yüksek, az miktar yeterli"},
    {"food_name": "Wakame yosunu", "amount_per_100g": 16000, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Morina balığı", "amount_per_100g": 99, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Süt (tam yağlı)", "amount_per_100g": 32, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "Yumurta", "amount_per_100g": 24, "unit": "mcg", "bioavailability": "Yüksek"},
    {"food_name": "İyotlu tuz", "amount_per_100g": 4500, "unit": "mcg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 150,
  daily_recommended_unit = 'mcg'
WHERE ingredient_slug IN ('iodine','iyot','potassium-iodide','iodine-kelp')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- ============ AMINO ACIDS ============

-- L-Serin (patron screenshot'ında eksik)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Soya fasulyesi (pişmiş)", "amount_per_100g": 2358, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Hindi göğsü", "amount_per_100g": 1432, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Ton balığı", "amount_per_100g": 1107, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Yumurta", "amount_per_100g": 970, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Yer fıstığı", "amount_per_100g": 1271, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Mercimek (pişmiş)", "amount_per_100g": 462, "unit": "mg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 800,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('l-serine','serine','l-serin')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- L-Karnitin
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Sığır eti (kırmızı)", "amount_per_100g": 95, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Domuz eti", "amount_per_100g": 27, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Tavuk göğsü", "amount_per_100g": 5, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Süt (tam yağlı)", "amount_per_100g": 3, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Avokado", "amount_per_100g": 2, "unit": "mg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 1000,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('l-carnitine','l-karnitin','carnitine','acetyl-l-carnitine','l-carnitine-tartrate')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- L-Theanine
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Yeşil çay (matcha)", "amount_per_100g": 670, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Yeşil çay (gyokuro)", "amount_per_100g": 460, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Beyaz çay", "amount_per_100g": 230, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Siyah çay", "amount_per_100g": 110, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Mantar (Bay bolete)", "amount_per_100g": 380, "unit": "mg", "bioavailability": "Orta", "note": "Tek bilinen mantar kaynağı"}
  ]'::jsonb,
  daily_recommended_value = 200,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('l-theanine','theanine')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- ============ OTHER COMMON SUPPLEMENT INGREDIENTS ============

-- Betain HCl / Trimethylglisin (patron screenshot'ında eksik)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Kırmızı pancar (haşlanmış)", "amount_per_100g": 297, "unit": "mg", "bioavailability": "Yüksek", "note": "İsmin geldiği yer (beta vulgaris)"},
    {"food_name": "Ispanak (çiğ)", "amount_per_100g": 645, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Kinoa", "amount_per_100g": 391, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Buğday kepeği", "amount_per_100g": 1339, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Yulaf", "amount_per_100g": 39, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Karides", "amount_per_100g": 219, "unit": "mg", "bioavailability": "Yüksek"}
  ]'::jsonb,
  daily_recommended_value = 500,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('betaine-hcl','betain-hidroklorur','trimethylglycine','tmg','betaine','betaine-anhydrous')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Coenzyme Q10
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Sığır kalp", "amount_per_100g": 11.3, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Sardalya", "amount_per_100g": 6.4, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Sığır ciğeri", "amount_per_100g": 3.9, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Yer fıstığı", "amount_per_100g": 2.7, "unit": "mg", "bioavailability": "Orta"},
    {"food_name": "Brokoli (haşlanmış)", "amount_per_100g": 0.86, "unit": "mg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 100,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('coq10','coenzyme-q10','ubiquinone','ubiquinol','co-q10','koenzim-q10')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Omega-3 (EPA/DHA)
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Som balığı (vahşi)", "amount_per_100g": 2260, "unit": "mg", "bioavailability": "Yüksek", "note": "EPA + DHA toplamı"},
    {"food_name": "Uskumru (Atlantic)", "amount_per_100g": 2670, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Sardalya (konserve)", "amount_per_100g": 1480, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Ton balığı (taze)", "amount_per_100g": 1290, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Hamsi", "amount_per_100g": 2050, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Keten tohumu (öğütülmüş)", "amount_per_100g": 22800, "unit": "mg", "bioavailability": "Düşük", "note": "ALA formu, EPA/DHA dönüşümü %5-10"}
  ]'::jsonb,
  daily_recommended_value = 500,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('omega-3','epa','dha','fish-oil','balik-yagi','omega-3-fatty-acids','epa-dha','algae-oil')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Lutein + Zeaxanthin
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Kara lahana", "amount_per_100g": 18246, "unit": "mcg", "bioavailability": "Orta"},
    {"food_name": "Ispanak (haşlanmış)", "amount_per_100g": 11308, "unit": "mcg", "bioavailability": "Orta", "note": "Yağ ile birlikte tüket"},
    {"food_name": "Brokoli", "amount_per_100g": 1403, "unit": "mcg", "bioavailability": "Orta"},
    {"food_name": "Yumurta sarısı", "amount_per_100g": 1094, "unit": "mcg", "bioavailability": "Yüksek", "note": "Yağda çözündüğü için emilim çok iyi"},
    {"food_name": "Mısır (haşlanmış)", "amount_per_100g": 884, "unit": "mcg", "bioavailability": "Orta"}
  ]'::jsonb,
  daily_recommended_value = 10,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('lutein','zeaxanthin','lutein-zeaxanthin')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- Hidrolize Kolajen
UPDATE ingredients SET
  food_sources = '[
    {"food_name": "Kemik suyu (uzun kaynatma)", "amount_per_100g": 6000, "unit": "mg", "bioavailability": "Yüksek", "note": "12+ saat haşla, tip I + III"},
    {"food_name": "Tavuk derisi", "amount_per_100g": 22500, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Balık derisi", "amount_per_100g": 22000, "unit": "mg", "bioavailability": "Yüksek", "note": "Marine kolajen tip I"},
    {"food_name": "Domuz kulağı", "amount_per_100g": 19000, "unit": "mg", "bioavailability": "Yüksek"},
    {"food_name": "Jelatin (kuru)", "amount_per_100g": 86000, "unit": "mg", "bioavailability": "Yüksek", "note": "Kolajen denatüre formu"}
  ]'::jsonb,
  daily_recommended_value = 10000,
  daily_recommended_unit = 'mg'
WHERE ingredient_slug IN ('hydrolyzed-collagen','hidrolize-kolajen','collagen-peptides','marine-collagen','bovine-collagen','collagen-type-1','collagen-type-3')
  AND (food_sources IS NULL OR jsonb_array_length(food_sources) = 0);

-- ============ Post-update raporu ============
SELECT
  inci_name,
  ingredient_slug,
  CASE WHEN food_sources IS NOT NULL AND jsonb_array_length(food_sources) > 0 THEN '✓' ELSE '—' END AS has_sources,
  CASE WHEN food_sources IS NOT NULL THEN jsonb_array_length(food_sources) ELSE 0 END AS source_count,
  daily_recommended_value || ' ' || COALESCE(daily_recommended_unit, '') AS rda
FROM ingredients
WHERE ingredient_slug IN (
  'thiamine','riboflavin','niacin','niacinamide','pantothenic-acid','pyridoxine','b6-vitamini',
  'biotin','folic-acid','metilfolat','vitamin-b12','methylcobalamin','metilkobalamin',
  'vitamin-a','retinol','vitamin-d3','cholecalciferol','vitamin-e','tocopherol','vitamin-k2',
  'zinc','cinko','magnesium','magnezyum','iron','demir','calcium','kalsiyum','selenium','iodine',
  'l-serine','l-serin','l-carnitine','l-theanine',
  'betaine-hcl','betain-hidroklorur','coq10','coenzyme-q10','omega-3','fish-oil',
  'lutein','hydrolyzed-collagen'
)
ORDER BY has_sources DESC, inci_name;
