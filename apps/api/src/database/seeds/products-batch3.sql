-- ============================================
-- BATCH 3: Products 51-100 (50 new products)
-- ============================================

-- New brands (IDs 20-28)
INSERT INTO brands (brand_id, brand_name, brand_slug, country_of_origin, is_active) VALUES
(20, 'Cetaphil', 'cetaphil', 'Kanada', true),
(21, 'Paula''s Choice', 'paulas-choice', 'ABD', true),
(22, 'Drunk Elephant', 'drunk-elephant', 'ABD', true),
(23, 'Isntree', 'isntree', 'Güney Kore', true),
(24, 'Beauty of Joseon', 'beauty-of-joseon', 'Güney Kore', true),
(25, 'Missha', 'missha', 'Güney Kore', true),
(26, 'Garnier', 'garnier', 'Fransa', true),
(27, 'Nivea', 'nivea', 'Almanya', true),
(28, 'Innisfree', 'innisfree', 'Güney Kore', true);

-- Reset sequence
SELECT setval('brands_brand_id_seq', 28);

-- ============================================
-- 50 NEW PRODUCTS (51-100)
-- ============================================
INSERT INTO products (product_id, brand_id, category_id, domain_type, product_name, product_slug, product_type_label, short_description, net_content_value, net_content_unit, target_area, usage_time_hint, status) VALUES

-- Cetaphil (20)
(51, 20, 2, 'cosmetic', 'Cetaphil Gentle Skin Cleanser', 'cetaphil-gentle-skin-cleanser', 'temizleyici', 'Hassas ciltler için nazik temizleyici. Dermatoloji referansı.', '473.00', 'ml', 'face_body', 'both', 'published'),
(52, 20, 1, 'cosmetic', 'Cetaphil Moisturizing Cream', 'cetaphil-moisturizing-cream', 'nemlendirici', 'Çok kuru ve hassas ciltler için zengin nemlendirici krem.', '453.00', 'g', 'face_body', 'both', 'published'),
(53, 20, 3, 'cosmetic', 'Cetaphil Sun SPF50+ Light Gel', 'cetaphil-sun-spf50-light-gel', 'güneş kremi', 'Hafif jel doku güneş koruyucu. Yağsız ve mat bitiş.', '50.00', 'ml', 'face', 'morning', 'published'),

-- Paula''s Choice (21)
(54, 21, 1, 'cosmetic', 'Paula''s Choice 2% BHA Liquid Exfoliant', 'paulas-choice-2-bha-liquid', 'peeling', 'Salisilik asit bazlı sıvı eksfolyan. Siyah nokta ve gözenek.', '118.00', 'ml', 'face', 'evening', 'published'),
(55, 21, 1, 'cosmetic', 'Paula''s Choice 10% Niacinamide Booster', 'paulas-choice-10-niacinamide', 'serum', 'Yüksek konsantrasyonlu niacinamide booster. Gözenek ve ton.', '20.00', 'ml', 'face', 'both', 'published'),
(56, 21, 1, 'cosmetic', 'Paula''s Choice C15 Super Booster', 'paulas-choice-c15-super-booster', 'serum', '%15 C vitamini + E vitamini + ferulic acid. Aydınlatıcı.', '20.00', 'ml', 'face', 'morning', 'published'),

-- Drunk Elephant (22)
(57, 22, 1, 'cosmetic', 'Drunk Elephant Protini Polypeptide Cream', 'drunk-elephant-protini-cream', 'nemlendirici', 'Peptit kompleksi ile protein bazlı anti-aging nemlendirici.', '50.00', 'ml', 'face', 'both', 'published'),
(58, 22, 1, 'cosmetic', 'Drunk Elephant T.L.C. Sukari Babyfacial', 'drunk-elephant-tlc-sukari', 'peeling', '%25 AHA + %2 BHA profesyonel peeling maskesi.', '50.00', 'ml', 'face', 'evening', 'published'),
(59, 22, 1, 'cosmetic', 'Drunk Elephant B-Hydra Intensive Hydration Serum', 'drunk-elephant-b-hydra-serum', 'serum', 'Provitamin B5 bazlı yoğun nemlendirici serum.', '50.00', 'ml', 'face', 'both', 'published'),

-- Isntree (23)
(60, 23, 1, 'cosmetic', 'Isntree Hyaluronic Acid Toner', 'isntree-hyaluronic-acid-toner', 'tonik', '%50 hyaluronic acid kompleksi ile nemlendirici tonik.', '200.00', 'ml', 'face', 'both', 'published'),
(61, 23, 1, 'cosmetic', 'Isntree Green Tea Fresh Emulsion', 'isntree-green-tea-emulsion', 'nemlendirici', 'Yeşil çay bazlı hafif emülsiyon. Yağlı ciltler için.', '120.00', 'ml', 'face', 'both', 'published'),
(62, 23, 3, 'cosmetic', 'Isntree Hyaluronic Acid Watery Sun Gel SPF50+', 'isntree-ha-watery-sun-gel', 'güneş kremi', 'HA bazlı sulu jel güneş koruyucu. Nemlendirici etki.', '50.00', 'ml', 'face', 'morning', 'published'),

-- Beauty of Joseon (24)
(63, 24, 1, 'cosmetic', 'Beauty of Joseon Glow Serum: Propolis + Niacinamide', 'boj-glow-serum-propolis', 'serum', 'Propolis + niacinamide parlaklık serumu. Kore güzellik klasiği.', '30.00', 'ml', 'face', 'both', 'published'),
(64, 24, 3, 'cosmetic', 'Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+', 'boj-relief-sun-rice', 'güneş kremi', 'Pirinç + probiyotik güneş kremi. Hafif ve nemlendirici.', '50.00', 'ml', 'face', 'morning', 'published'),
(65, 24, 1, 'cosmetic', 'Beauty of Joseon Glow Deep Serum: Rice + Alpha-Arbutin', 'boj-glow-deep-serum-rice', 'serum', 'Pirinç suyu + alpha arbutin aydınlatıcı serum.', '30.00', 'ml', 'face', 'both', 'published'),

-- Missha (25)
(66, 25, 1, 'cosmetic', 'Missha Time Revolution Night Repair Ampoule', 'missha-time-revolution-ampoule', 'serum', 'Bifida ferment bazlı gece onarım ampulü. Anti-aging.', '50.00', 'ml', 'face', 'evening', 'published'),
(67, 25, 3, 'cosmetic', 'Missha All Around Safe Block Essence Sun SPF45', 'missha-safe-block-sun', 'güneş kremi', 'Günlük kullanım güneş esansı. Hafif ve yapışmaz.', '50.00', 'ml', 'face', 'morning', 'published'),
(68, 25, 1, 'cosmetic', 'Missha Vita C Plus Spot Correcting Ampoule', 'missha-vita-c-plus-ampoule', 'serum', 'C vitamini leke düzeltici ampul. Aydınlatıcı etki.', '30.00', 'ml', 'face', 'morning', 'published'),

-- Garnier (26)
(69, 26, 2, 'cosmetic', 'Garnier Micellar Cleansing Water', 'garnier-micellar-water', 'temizleyici', 'Micellar temizleme suyu. Makyaj çözücü. Tüm cilt tipleri.', '400.00', 'ml', 'face', 'evening', 'published'),
(70, 26, 1, 'cosmetic', 'Garnier Vitamin C Brightening Serum', 'garnier-vitamin-c-serum', 'serum', 'C vitamini aydınlatıcı serum. Leke karşıtı günlük bakım.', '30.00', 'ml', 'face', 'morning', 'published'),
(71, 26, 3, 'cosmetic', 'Garnier Ambre Solaire Sensitive Advanced SPF50+', 'garnier-ambre-solaire-spf50', 'güneş kremi', 'Hassas ciltler için güneş sütü. Geniş spektrum koruma.', '200.00', 'ml', 'face_body', 'morning', 'published'),

-- Nivea (27)
(72, 27, 1, 'cosmetic', 'Nivea Q10 Power Anti-Wrinkle Firming Day Cream SPF15', 'nivea-q10-anti-wrinkle-day', 'nemlendirici', 'Koenzim Q10 anti-aging gündüz kremi. SPF15 koruma.', '50.00', 'ml', 'face', 'morning', 'published'),
(73, 27, 6, 'cosmetic', 'Nivea Creme', 'nivea-creme', 'nemlendirici', 'Klasik Nivea nemlendirici krem. Yüz ve vücut için.', '150.00', 'ml', 'face_body', 'both', 'published'),
(74, 27, 4, 'cosmetic', 'Nivea Cellular Expert Filler Eye & Lip Contour Cream', 'nivea-cellular-eye-lip', 'göz kremi', 'Hyaluronic acid göz ve dudak çevresi kremi.', '15.00', 'ml', 'eye', 'both', 'published'),

-- Innisfree (28)
(75, 28, 1, 'cosmetic', 'Innisfree Green Tea Seed Serum', 'innisfree-green-tea-seed-serum', 'serum', 'Yeşil çay tohumu bazlı nemlendirici serum. Antioksidan.', '80.00', 'ml', 'face', 'both', 'published'),
(76, 28, 3, 'cosmetic', 'Innisfree Daily UV Defence Sunscreen SPF36', 'innisfree-daily-uv-defence', 'güneş kremi', 'Günlük hafif güneş koruyucu. Doğal bitiş.', '50.00', 'ml', 'face', 'morning', 'published'),
(77, 28, 2, 'cosmetic', 'Innisfree Green Tea Foam Cleanser', 'innisfree-green-tea-foam', 'temizleyici', 'Yeşil çay özlü köpük temizleyici. Antioksidan temizlik.', '150.00', 'ml', 'face', 'both', 'published'),

-- Mevcut markalardan ek ürünler
-- La Roche-Posay (1) ek ürünler
(78, 1, 2, 'cosmetic', 'La Roche-Posay Effaclar Purifying Foaming Gel', 'lrp-effaclar-foaming-gel', 'temizleyici', 'Yağlı ciltler için arındırıcı köpük jel. Zinc pidolate.', '400.00', 'ml', 'face', 'both', 'published'),
(79, 1, 1, 'cosmetic', 'La Roche-Posay Cicaplast Baume B5+', 'lrp-cicaplast-baume-b5-plus', 'onarıcı', 'Yenilenmiş formül onarıcı balsam. Panthenol + Madecassoside.', '40.00', 'ml', 'face_body', 'both', 'published'),
(80, 1, 1, 'cosmetic', 'La Roche-Posay Retinol B3 Serum', 'lrp-retinol-b3-serum', 'serum', 'Retinol + Niacinamide anti-aging serum. Kırışıklık ve leke.', '30.00', 'ml', 'face', 'evening', 'published'),

-- CeraVe (2) ek
(81, 2, 6, 'cosmetic', 'CeraVe Moisturising Lotion', 'cerave-moisturising-lotion', 'nemlendirici', 'Hafif vücut losyonu. 3 ceramide + hyaluronic acid.', '236.00', 'ml', 'face_body', 'both', 'published'),
(82, 2, 1, 'cosmetic', 'CeraVe Skin Renewing Retinol Serum', 'cerave-retinol-serum', 'serum', 'Enkapsüle retinol serum. Ceramide destekli anti-aging.', '30.00', 'ml', 'face', 'evening', 'published'),

-- The Ordinary (3) ek
(83, 3, 1, 'cosmetic', 'The Ordinary Lactic Acid 10% + HA', 'the-ordinary-lactic-acid-10', 'peeling', 'Laktik asit %10 nazik peeling. Hassas ciltler için AHA.', '30.00', 'ml', 'face', 'evening', 'published'),
(84, 3, 1, 'cosmetic', 'The Ordinary Multi-Peptide + HA Serum', 'the-ordinary-multi-peptide-ha', 'serum', 'Çoklu peptit kompleksi. Anti-aging + nemlendirme.', '30.00', 'ml', 'face', 'both', 'published'),
(85, 3, 1, 'cosmetic', 'The Ordinary Natural Moisturizing Factors + HA', 'the-ordinary-nmf-ha', 'nemlendirici', 'Doğal nem faktörleri bazlı nemlendirici. Hafif doku.', '30.00', 'ml', 'face', 'both', 'published'),

-- Bioderma (4) ek
(86, 4, 3, 'cosmetic', 'Bioderma Photoderm Aquafluide SPF50+', 'bioderma-photoderm-aquafluide', 'güneş kremi', 'Ultra hafif sulu doku güneş koruyucu. Parlama karşıtı.', '40.00', 'ml', 'face', 'morning', 'published'),
(87, 4, 2, 'cosmetic', 'Bioderma Sensibio H2O 500ml', 'bioderma-sensibio-h2o-500ml', 'temizleyici', 'İkonik micellar su. Hassas ciltler için nazik temizlik. Büyük boy.', '500.00', 'ml', 'face', 'evening', 'published'),

-- COSRX (13) ek
(88, 13, 1, 'cosmetic', 'COSRX AHA 7 Whitehead Power Liquid', 'cosrx-aha-7-whitehead', 'peeling', 'Glikolik asit %7 AHA eksfolyan. Beyaz nokta ve pürüzsüzlük.', '100.00', 'ml', 'face', 'evening', 'published'),
(89, 13, 1, 'cosmetic', 'COSRX Full Fit Propolis Light Ampoule', 'cosrx-propolis-ampoule', 'serum', 'Propolis %73.5 yatıştırıcı ampul. Nem + onarım.', '30.00', 'ml', 'face', 'both', 'published'),
(90, 13, 1, 'cosmetic', 'COSRX Oil-Free Ultra-Moisturizing Lotion with Birch Sap', 'cosrx-oil-free-birch-sap', 'nemlendirici', 'Huş ağacı özlü yağsız nemlendirici. Yağlı ciltler için.', '100.00', 'ml', 'face', 'both', 'published'),

-- Vichy (9) ek
(91, 9, 1, 'cosmetic', 'Vichy Neovadiol Meno 5 Bi-Serum', 'vichy-neovadiol-meno5-serum', 'serum', 'Menopoz sonrası cilt bakım serumu. 5 aktif bileşen.', '30.00', 'ml', 'face', 'both', 'published'),
(92, 9, 4, 'cosmetic', 'Vichy Mineral 89 Eyes', 'vichy-mineral-89-eyes', 'göz kremi', 'Hyaluronic acid göz çevresi güçlendirici. Şişlik ve morluk.', '15.00', 'ml', 'eye', 'both', 'published'),

-- Eucerin (7) ek
(93, 7, 3, 'cosmetic', 'Eucerin Sun Oil Control Dry Touch SPF50+', 'eucerin-sun-oil-control-spf50', 'güneş kremi', 'Yağ kontrollü mat güneş koruyucu. Kuru dokunuş.', '50.00', 'ml', 'face', 'morning', 'published'),
(94, 7, 1, 'cosmetic', 'Eucerin Hyaluron-Filler Night Cream', 'eucerin-hyaluron-filler-night', 'nemlendirici', 'Hyaluronic acid gece kremi. Derin kırışıklık doldurucu.', '50.00', 'ml', 'face', 'evening', 'published'),

-- SVR (6) ek
(95, 6, 3, 'cosmetic', 'SVR Sun Secure Blur SPF50+', 'svr-sun-secure-blur', 'güneş kremi', 'Mousse doku optik bulanıklaştırıcı güneş koruyucu.', '50.00', 'ml', 'face', 'morning', 'published'),

-- Avene (5) ek
(96, 5, 1, 'cosmetic', 'Avene RetrinAL 0.1 Intensive Cream', 'avene-retrinal-intensive-cream', 'nemlendirici', 'Retinaldehit anti-aging yoğun krem. İleri yaş bakımı.', '30.00', 'ml', 'face', 'evening', 'published'),

-- Klairs (17) ek
(97, 17, 1, 'cosmetic', 'Klairs Midnight Blue Calming Cream', 'klairs-midnight-blue-cream', 'nemlendirici', 'Guaiazulene yatıştırıcı gece kremi. Hassas ve kızarık cilt.', '30.00', 'ml', 'face', 'evening', 'published'),

-- Purito (18) ek
(98, 18, 1, 'cosmetic', 'Purito From Green Cleansing Oil', 'purito-from-green-cleansing-oil', 'temizleyici', 'Bitkisel yağ bazlı temizleme yağı. Çift temizleme adımı.', '200.00', 'ml', 'face', 'evening', 'published'),

-- Some By Mi (19) ek
(99, 19, 1, 'cosmetic', 'Some By Mi Truecica Mineral 100 Calming Suncream SPF50+', 'sbm-truecica-mineral-sun', 'güneş kremi', 'Mineral filtreli yatıştırıcı güneş kremi. Centella.', '50.00', 'ml', 'face', 'morning', 'published'),

-- Hada Labo (16) ek
(100, 16, 1, 'cosmetic', 'Hada Labo Shirojyun Premium Whitening Lotion', 'hada-labo-shirojyun-premium', 'tonik', 'Traneksamik asit aydınlatıcı losyon. Leke karşıtı.', '170.00', 'ml', 'face', 'both', 'published');

-- Reset product sequence
SELECT setval('products_product_id_seq', 100);

-- ============================================
-- PRODUCT IMAGES (51-100)
-- ============================================
INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text) VALUES
(51, 'https://placehold.co/600x600/f0f5ff/1a1a2e?text=Cetaphil+Cleanser', 'product', 1, 'Cetaphil Gentle Skin Cleanser'),
(52, 'https://placehold.co/600x600/f0f5ff/1a1a2e?text=Cetaphil+Cream', 'product', 1, 'Cetaphil Moisturizing Cream'),
(53, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=Cetaphil+Sun', 'product', 1, 'Cetaphil Sun SPF50+'),
(54, 'https://placehold.co/600x600/e8f5e9/1a1a2e?text=PC+BHA+Liquid', 'product', 1, 'Paulas Choice BHA Liquid'),
(55, 'https://placehold.co/600x600/e8f5e9/1a1a2e?text=PC+Niacinamide', 'product', 1, 'Paulas Choice Niacinamide'),
(56, 'https://placehold.co/600x600/fff3e0/1a1a2e?text=PC+C15+Booster', 'product', 1, 'Paulas Choice C15 Booster'),
(57, 'https://placehold.co/600x600/fce4ec/1a1a2e?text=DE+Protini', 'product', 1, 'Drunk Elephant Protini'),
(58, 'https://placehold.co/600x600/fce4ec/1a1a2e?text=DE+Babyfacial', 'product', 1, 'Drunk Elephant Babyfacial'),
(59, 'https://placehold.co/600x600/fce4ec/1a1a2e?text=DE+B-Hydra', 'product', 1, 'Drunk Elephant B-Hydra'),
(60, 'https://placehold.co/600x600/e0f7fa/1a1a2e?text=Isntree+HA+Toner', 'product', 1, 'Isntree HA Toner'),
(61, 'https://placehold.co/600x600/e8f5e9/1a1a2e?text=Isntree+GreenTea', 'product', 1, 'Isntree Green Tea Emulsion'),
(62, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=Isntree+Sun', 'product', 1, 'Isntree Sun Gel'),
(63, 'https://placehold.co/600x600/fff8e1/1a1a2e?text=BOJ+Propolis', 'product', 1, 'BOJ Glow Serum'),
(64, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=BOJ+Sun+Rice', 'product', 1, 'BOJ Relief Sun'),
(65, 'https://placehold.co/600x600/fff8e1/1a1a2e?text=BOJ+Rice+Serum', 'product', 1, 'BOJ Glow Deep Serum'),
(66, 'https://placehold.co/600x600/f3e5f5/1a1a2e?text=Missha+Ampoule', 'product', 1, 'Missha Time Revolution'),
(67, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=Missha+Sun', 'product', 1, 'Missha Safe Block Sun'),
(68, 'https://placehold.co/600x600/fff3e0/1a1a2e?text=Missha+VitaC', 'product', 1, 'Missha Vita C Ampoule'),
(69, 'https://placehold.co/600x600/e3f2fd/1a1a2e?text=Garnier+Micellar', 'product', 1, 'Garnier Micellar Water'),
(70, 'https://placehold.co/600x600/fff3e0/1a1a2e?text=Garnier+VitC', 'product', 1, 'Garnier Vitamin C Serum'),
(71, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=Garnier+Sun', 'product', 1, 'Garnier Ambre Solaire'),
(72, 'https://placehold.co/600x600/e8eaf6/1a1a2e?text=Nivea+Q10', 'product', 1, 'Nivea Q10 Day Cream'),
(73, 'https://placehold.co/600x600/e8eaf6/1a1a2e?text=Nivea+Creme', 'product', 1, 'Nivea Creme'),
(74, 'https://placehold.co/600x600/e8eaf6/1a1a2e?text=Nivea+Eye', 'product', 1, 'Nivea Cellular Eye Cream'),
(75, 'https://placehold.co/600x600/e8f5e9/1a1a2e?text=Innisfree+GTS', 'product', 1, 'Innisfree Green Tea Serum'),
(76, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=Innisfree+Sun', 'product', 1, 'Innisfree Daily UV Defence'),
(77, 'https://placehold.co/600x600/e8f5e9/1a1a2e?text=Innisfree+Foam', 'product', 1, 'Innisfree Green Tea Foam'),
(78, 'https://placehold.co/600x600/e3f2fd/1a1a2e?text=LRP+Effaclar', 'product', 1, 'LRP Effaclar Foaming Gel'),
(79, 'https://placehold.co/600x600/e0f0e0/1a1a2e?text=LRP+Cicaplast', 'product', 1, 'LRP Cicaplast Baume B5+'),
(80, 'https://placehold.co/600x600/f3e5f5/1a1a2e?text=LRP+Retinol+B3', 'product', 1, 'LRP Retinol B3 Serum'),
(81, 'https://placehold.co/600x600/e3f2fd/1a1a2e?text=CeraVe+Lotion', 'product', 1, 'CeraVe Moisturising Lotion'),
(82, 'https://placehold.co/600x600/f3e5f5/1a1a2e?text=CeraVe+Retinol', 'product', 1, 'CeraVe Retinol Serum'),
(83, 'https://placehold.co/600x600/fff3e0/1a1a2e?text=TO+Lactic+Acid', 'product', 1, 'TO Lactic Acid 10%'),
(84, 'https://placehold.co/600x600/f3e5f5/1a1a2e?text=TO+Peptide', 'product', 1, 'TO Multi-Peptide Serum'),
(85, 'https://placehold.co/600x600/e3f2fd/1a1a2e?text=TO+NMF', 'product', 1, 'TO Natural Moisturizing Factors'),
(86, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=Bioderma+Aqua', 'product', 1, 'Bioderma Photoderm Aquafluide'),
(87, 'https://placehold.co/600x600/e3f2fd/1a1a2e?text=Bioderma+H2O', 'product', 1, 'Bioderma Sensibio H2O'),
(88, 'https://placehold.co/600x600/fff3e0/1a1a2e?text=COSRX+AHA7', 'product', 1, 'COSRX AHA 7 Whitehead'),
(89, 'https://placehold.co/600x600/fff8e1/1a1a2e?text=COSRX+Propolis', 'product', 1, 'COSRX Propolis Ampoule'),
(90, 'https://placehold.co/600x600/e3f2fd/1a1a2e?text=COSRX+BirchSap', 'product', 1, 'COSRX Birch Sap Lotion'),
(91, 'https://placehold.co/600x600/f3e5f5/1a1a2e?text=Vichy+Neovadiol', 'product', 1, 'Vichy Neovadiol Meno 5'),
(92, 'https://placehold.co/600x600/e0f7fa/1a1a2e?text=Vichy+M89+Eyes', 'product', 1, 'Vichy Mineral 89 Eyes'),
(93, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=Eucerin+Sun+OC', 'product', 1, 'Eucerin Sun Oil Control'),
(94, 'https://placehold.co/600x600/f3e5f5/1a1a2e?text=Eucerin+HF+Night', 'product', 1, 'Eucerin Hyaluron-Filler Night'),
(95, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=SVR+Sun+Blur', 'product', 1, 'SVR Sun Secure Blur'),
(96, 'https://placehold.co/600x600/f3e5f5/1a1a2e?text=Avene+RetrinAL', 'product', 1, 'Avene RetrinAL 0.1'),
(97, 'https://placehold.co/600x600/e0f7fa/1a1a2e?text=Klairs+MidnightBlue', 'product', 1, 'Klairs Midnight Blue Cream'),
(98, 'https://placehold.co/600x600/e8f5e9/1a1a2e?text=Purito+Oil', 'product', 1, 'Purito From Green Cleansing Oil'),
(99, 'https://placehold.co/600x600/fff5e0/1a1a2e?text=SBM+Mineral+Sun', 'product', 1, 'SBM Truecica Mineral Sun'),
(100, 'https://placehold.co/600x600/f3e5f5/1a1a2e?text=HadaLabo+Shiro', 'product', 1, 'Hada Labo Shirojyun');
