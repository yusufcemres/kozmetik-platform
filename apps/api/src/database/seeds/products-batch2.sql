-- Batch 2: Products 26-50
INSERT INTO products (product_name, product_slug, brand_id, category_id, domain_type, product_type_label, short_description, target_area, usage_time_hint, net_content_value, net_content_unit, status) VALUES
-- Vichy (brand_id=9)
('Vichy Mineral 89 Hyaluronic Acid Booster', 'vichy-mineral-89', 9, 1, 'cosmetic', 'serum', 'Volkanik su ve hyaluronic acid ile güçlendirilmiş günlük nemlendirici booster.', 'face', 'both', 50, 'ml', 'published'),
('Vichy Normaderm Phytosolution Double-Correction', 'vichy-normaderm-phytosolution', 9, 1, 'cosmetic', 'bakım', 'Sivilce eğilimli ciltler için çift etkili düzeltici bakım kremi.', 'face', 'both', 50, 'ml', 'published'),
('Vichy Liftactiv Supreme', 'vichy-liftactiv-supreme', 9, 1, 'cosmetic', 'nemlendirici', 'Anti-aging nemlendirici krem. Kırışıklık ve sarkma karşıtı.', 'face', 'morning', 50, 'ml', 'published'),

-- Nuxe (brand_id=10)
('Nuxe Huile Prodigieuse', 'nuxe-huile-prodigieuse', 10, 6, 'cosmetic', 'yağ', 'Yüz, vücut ve saç için çok amaçlı kuru yağ. 7 bitkisel yağ içerir.', 'face', 'both', 100, 'ml', 'published'),
('Nuxe Creme Fraiche de Beaute', 'nuxe-creme-fraiche', 10, 1, 'cosmetic', 'nemlendirici', '48 saat nemlendirici krem. Bitkisel süt ve hyaluronic acid içerir.', 'face', 'both', 50, 'ml', 'published'),

-- Bioderma (brand_id=4)
('Bioderma Atoderm Intensive Baume', 'bioderma-atoderm-intensive-baume', 4, 6, 'cosmetic', 'nemlendirici', 'Çok kuru ve atopik ciltler için yoğun onarıcı balm.', 'body', 'both', 200, 'ml', 'published'),
('Bioderma Photoderm MAX Cream SPF50+', 'bioderma-photoderm-max-spf50', 4, 3, 'cosmetic', 'güneş kremi', 'Hassas ciltler için çok yüksek koruma güneş kremi.', 'face', 'morning', 40, 'ml', 'published'),

-- CeraVe (brand_id=2)
('CeraVe SA Smoothing Cleanser', 'cerave-sa-smoothing-cleanser', 2, 2, 'cosmetic', 'temizleyici', 'Salisilik asit içeren pürüzsüzleştirici temizleyici. Pürüzlü ve sivilceli ciltler için.', 'face', 'both', 236, 'ml', 'published'),
('CeraVe Eye Repair Cream', 'cerave-eye-repair-cream', 2, 4, 'cosmetic', 'göz kremi', 'Göz çevresi için onarıcı krem. Ceramide ve hyaluronic acid içerir.', 'eye', 'both', 14, 'ml', 'published'),

-- La Roche-Posay (brand_id=1)
('La Roche-Posay Toleriane Sensitive', 'lrp-toleriane-sensitive', 1, 1, 'cosmetic', 'nemlendirici', 'Hassas ciltler için prebiyotik nemlendirici krem.', 'face', 'both', 40, 'ml', 'published'),
('La Roche-Posay Hyalu B5 Serum', 'lrp-hyalu-b5-serum', 1, 1, 'cosmetic', 'serum', 'Hyaluronic acid ve B5 vitamin içeren anti-aging dolgunlaştırıcı serum.', 'face', 'both', 30, 'ml', 'published'),

-- The Ordinary (brand_id=3)
('The Ordinary Caffeine Solution 5% + EGCG', 'to-caffeine-solution-5', 3, 4, 'cosmetic', 'serum', 'Göz altı morlukları ve şişlikler için konsantre kafein serumu.', 'eye', 'both', 30, 'ml', 'published'),
('The Ordinary Squalane Cleanser', 'to-squalane-cleanser', 3, 2, 'cosmetic', 'temizleyici', 'Squalane bazlı nazik temizleyici. Makyaj çözücü olarak da kullanılabilir.', 'face', 'both', 50, 'ml', 'published'),
('The Ordinary Mandelic Acid 10% + HA', 'to-mandelic-acid-10-ha', 3, 1, 'cosmetic', 'serum', 'Hassas ciltlere uygun hafif AHA eksfoliyan. Mandelik asit + hyaluronic acid.', 'face', 'evening', 30, 'ml', 'published'),
('The Ordinary Alpha Arbutin 2% + HA', 'to-alpha-arbutin-2-ha', 3, 1, 'cosmetic', 'serum', 'Leke karşıtı arbutin serum. Hiperpigmentasyon tedavisi için.', 'face', 'both', 30, 'ml', 'published'),

-- COSRX (brand_id=13)
('COSRX Aloe Soothing Sun Cream SPF50+ PA+++', 'cosrx-aloe-soothing-sun-cream', 13, 3, 'cosmetic', 'güneş kremi', 'Aloe vera içerikli yatıştırıcı güneş kremi. Hafif ve nemlendirici doku.', 'face', 'morning', 50, 'ml', 'published'),

-- Uriage (brand_id=14)
('Uriage Bariederm Cica-Cream', 'uriage-bariederm-cica-cream', 14, 1, 'cosmetic', 'onarıcı', 'Tahriş olmuş ve hasarlı ciltler için onarıcı bakım kremi.', 'face', 'both', 40, 'ml', 'published'),
('Uriage Eau Thermale Water Cream', 'uriage-eau-thermale-water-cream', 14, 1, 'cosmetic', 'nemlendirici', 'Termal su bazlı hafif nemlendirici krem. Tüm cilt tipleri için.', 'face', 'both', 40, 'ml', 'published'),

-- Ducray (brand_id=15)
('Ducray Keracnyl Serum', 'ducray-keracnyl-serum', 15, 1, 'cosmetic', 'serum', 'Sivilce izleri ve gözenekler için düzeltici serum.', 'face', 'evening', 30, 'ml', 'published'),

-- Hada Labo (brand_id=16)
('Hada Labo Gokujyun Premium Hyaluronic Acid Lotion', 'hada-labo-gokujyun-premium', 16, 1, 'cosmetic', 'tonik', '5 farklı hyaluronic acid içeren premium nemlendirici losyon/tonik.', 'face', 'both', 170, 'ml', 'published'),

-- Klairs (brand_id=17)
('Klairs Supple Preparation Facial Toner', 'klairs-supple-preparation-toner', 17, 1, 'cosmetic', 'tonik', 'Hassas ciltler için pH dengeleyici yatıştırıcı tonik.', 'face', 'both', 180, 'ml', 'published'),
('Klairs Freshly Juiced Vitamin Drop', 'klairs-freshly-juiced-vitamin-drop', 17, 1, 'cosmetic', 'serum', '%5 askorbik asit içeren hassas ciltlere uygun C vitamini serumu.', 'face', 'morning', 35, 'ml', 'published'),

-- Purito (brand_id=18)
('Purito Centella Green Level Recovery Cream', 'purito-centella-recovery-cream', 18, 1, 'cosmetic', 'nemlendirici', 'Centella asiatica ağırlıklı yatıştırıcı onarım kremi.', 'face', 'both', 50, 'ml', 'published'),

-- Some By Mi (brand_id=19)
('Some By Mi AHA BHA PHA 30 Days Miracle Toner', 'sbm-aha-bha-pha-miracle-toner', 19, 1, 'cosmetic', 'tonik', 'AHA, BHA ve PHA üçlü asit tonik. Sivilce eğilimli ciltler için 30 günlük mucize.', 'face', 'both', 150, 'ml', 'published'),

-- Neutrogena (brand_id=8)
('Neutrogena Retinol Boost Cream', 'neutrogena-retinol-boost-cream', 8, 1, 'cosmetic', 'nemlendirici', 'Retinol içeren anti-aging gece kremi. Kırışıklık ve ince çizgiler için.', 'face', 'evening', 50, 'ml', 'published');
