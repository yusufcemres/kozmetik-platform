-- New ingredients (41-52)
INSERT INTO ingredients (ingredient_id, inci_name, ingredient_slug, common_name, is_active) VALUES
(41, 'Ferulic Acid', 'ferulic-acid', 'Ferulik Asit', true),
(42, 'Propolis Extract', 'propolis-extract', 'Propolis Özütü', true),
(43, 'Beta-Glucan', 'beta-glucan', 'Beta-Glukan', true),
(44, 'Betaine Salicylate', 'betaine-salicylate', 'Betain Salisilat', true),
(45, 'Camellia Sinensis Leaf Extract', 'camellia-sinensis', 'Yeşil Çay Özütü', true),
(46, 'Coenzyme Q10', 'coenzyme-q10', 'Koenzim Q10', true),
(47, 'Retinaldehyde', 'retinaldehyde', 'Retinaldehit', true),
(48, 'Bifida Ferment Lysate', 'bifida-ferment-lysate', 'Bifida Ferment Lizat', true),
(49, 'Peptide Complex', 'peptide-complex', 'Peptit Kompleksi', true),
(50, 'Rice Extract', 'rice-extract', 'Pirinç Özütü', true),
(51, 'Jojoba Oil', 'jojoba-oil', 'Jojoba Yağı', true),
(52, 'Guaiazulene', 'guaiazulene', 'Guaiazulen', true);

SELECT setval('ingredients_ingredient_id_seq', 52);

-- Existing ingredient name lookup for display names
-- product_ingredients: product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band

INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band) VALUES
-- 51: Cetaphil Gentle Skin Cleanser
(51, 21, 'Aqua', 1, 'high'), (51, 12, 'Glycerin', 2, 'medium'), (51, 31, 'Cetearyl Alcohol', 3, 'medium'), (51, 23, 'Phenoxyethanol', 4, 'low'), (51, 15, 'Allantoin', 5, 'low'),
-- 52: Cetaphil Moisturizing Cream
(52, 21, 'Aqua', 1, 'high'), (52, 12, 'Glycerin', 2, 'high'), (52, 30, 'Shea Butter', 3, 'medium'), (52, 25, 'Dimethicone', 4, 'medium'), (52, 35, 'Vitamin E Acetate', 5, 'low'),
-- 53: Cetaphil Sun SPF50+
(53, 21, 'Aqua', 1, 'high'), (53, 37, 'Ethylhexyl Methoxycinnamate', 2, 'high'), (53, 39, 'Titanium Dioxide', 3, 'medium'), (53, 12, 'Glycerin', 4, 'medium'), (53, 10, 'Tocopherol', 5, 'low'),
-- 54: Paula Choice 2% BHA
(54, 21, 'Aqua', 1, 'high'), (54, 4, 'Salicylic Acid', 2, 'active'), (54, 24, 'Butylene Glycol', 3, 'medium'), (54, 45, 'Camellia Sinensis Leaf Extract', 4, 'low'), (54, 36, 'Propanediol', 5, 'medium'),
-- 55: Paula Choice 10% Niacinamide
(55, 21, 'Aqua', 1, 'high'), (55, 1, 'Niacinamide', 2, 'active'), (55, 36, 'Propanediol', 3, 'medium'), (55, 15, 'Allantoin', 4, 'low'), (55, 23, 'Phenoxyethanol', 5, 'low'),
-- 56: Paula Choice C15 Super Booster
(56, 7, 'Ascorbic Acid', 1, 'active'), (56, 41, 'Ferulic Acid', 2, 'active'), (56, 10, 'Tocopherol', 3, 'medium'), (56, 21, 'Aqua', 4, 'high'), (56, 36, 'Propanediol', 5, 'medium'),
-- 57: Drunk Elephant Protini
(57, 21, 'Aqua', 1, 'high'), (57, 49, 'Peptide Complex', 2, 'active'), (57, 12, 'Glycerin', 3, 'medium'), (57, 14, 'Squalane', 4, 'medium'), (57, 1, 'Niacinamide', 5, 'low'),
-- 58: Drunk Elephant TLC Sukari
(58, 5, 'Glycolic Acid', 1, 'active'), (58, 4, 'Salicylic Acid', 2, 'active'), (58, 16, 'Lactic Acid', 3, 'active'), (58, 21, 'Aqua', 4, 'high'), (58, 36, 'Propanediol', 5, 'medium'),
-- 59: Drunk Elephant B-Hydra
(59, 21, 'Aqua', 1, 'high'), (59, 8, 'Panthenol', 2, 'active'), (59, 3, 'Hyaluronic Acid', 3, 'medium'), (59, 18, 'Sodium Hyaluronate', 4, 'medium'), (59, 43, 'Beta-Glucan', 5, 'low'),
-- 60: Isntree HA Toner
(60, 21, 'Aqua', 1, 'high'), (60, 3, 'Hyaluronic Acid', 2, 'active'), (60, 18, 'Sodium Hyaluronate', 3, 'medium'), (60, 24, 'Butylene Glycol', 4, 'medium'), (60, 8, 'Panthenol', 5, 'low'),
-- 61: Isntree Green Tea Emulsion
(61, 21, 'Aqua', 1, 'high'), (61, 45, 'Camellia Sinensis Leaf Extract', 2, 'active'), (61, 12, 'Glycerin', 3, 'medium'), (61, 1, 'Niacinamide', 4, 'low'), (61, 36, 'Propanediol', 5, 'medium'),
-- 62: Isntree HA Sun Gel
(62, 21, 'Aqua', 1, 'high'), (62, 3, 'Hyaluronic Acid', 2, 'medium'), (62, 37, 'Ethylhexyl Methoxycinnamate', 3, 'high'), (62, 18, 'Sodium Hyaluronate', 4, 'low'), (62, 8, 'Panthenol', 5, 'low'),
-- 63: BOJ Glow Serum Propolis
(63, 21, 'Aqua', 1, 'high'), (63, 42, 'Propolis Extract', 2, 'active'), (63, 1, 'Niacinamide', 3, 'active'), (63, 3, 'Hyaluronic Acid', 4, 'medium'), (63, 24, 'Butylene Glycol', 5, 'medium'),
-- 64: BOJ Relief Sun Rice
(64, 21, 'Aqua', 1, 'high'), (64, 50, 'Rice Extract', 2, 'medium'), (64, 38, 'Zinc Oxide', 3, 'high'), (64, 39, 'Titanium Dioxide', 4, 'medium'), (64, 12, 'Glycerin', 5, 'medium'),
-- 65: BOJ Glow Deep Serum Rice
(65, 21, 'Aqua', 1, 'high'), (65, 50, 'Rice Extract', 2, 'active'), (65, 27, 'Arbutin', 3, 'active'), (65, 3, 'Hyaluronic Acid', 4, 'medium'), (65, 1, 'Niacinamide', 5, 'low'),
-- 66: Missha Time Revolution
(66, 21, 'Aqua', 1, 'high'), (66, 48, 'Bifida Ferment Lysate', 2, 'active'), (66, 1, 'Niacinamide', 3, 'medium'), (66, 3, 'Hyaluronic Acid', 4, 'medium'), (66, 8, 'Panthenol', 5, 'low'),
-- 67: Missha Safe Block Sun
(67, 21, 'Aqua', 1, 'high'), (67, 37, 'Ethylhexyl Methoxycinnamate', 2, 'high'), (67, 39, 'Titanium Dioxide', 3, 'medium'), (67, 3, 'Hyaluronic Acid', 4, 'low'), (67, 32, 'Aloe Barbadensis Leaf Extract', 5, 'low'),
-- 68: Missha Vita C Plus
(68, 21, 'Aqua', 1, 'high'), (68, 7, 'Ascorbic Acid', 2, 'active'), (68, 1, 'Niacinamide', 3, 'medium'), (68, 27, 'Arbutin', 4, 'low'), (68, 36, 'Propanediol', 5, 'medium'),
-- 69: Garnier Micellar Water
(69, 21, 'Aqua', 1, 'high'), (69, 12, 'Glycerin', 2, 'medium'), (69, 23, 'Phenoxyethanol', 3, 'low'), (69, 25, 'Dimethicone', 4, 'low'), (69, 22, 'Parfum', 5, 'low'),
-- 70: Garnier Vitamin C Serum
(70, 21, 'Aqua', 1, 'high'), (70, 7, 'Ascorbic Acid', 2, 'active'), (70, 1, 'Niacinamide', 3, 'medium'), (70, 12, 'Glycerin', 4, 'medium'), (70, 22, 'Parfum', 5, 'low'),
-- 71: Garnier Ambre Solaire
(71, 21, 'Aqua', 1, 'high'), (71, 37, 'Ethylhexyl Methoxycinnamate', 2, 'high'), (71, 12, 'Glycerin', 3, 'medium'), (71, 35, 'Vitamin E Acetate', 4, 'low'), (71, 22, 'Parfum', 5, 'low'),
-- 72: Nivea Q10 Day
(72, 21, 'Aqua', 1, 'high'), (72, 46, 'Coenzyme Q10', 2, 'active'), (72, 12, 'Glycerin', 3, 'medium'), (72, 37, 'Ethylhexyl Methoxycinnamate', 4, 'medium'), (72, 25, 'Dimethicone', 5, 'medium'),
-- 73: Nivea Creme
(73, 21, 'Aqua', 1, 'high'), (73, 12, 'Glycerin', 2, 'high'), (73, 30, 'Shea Butter', 3, 'medium'), (73, 25, 'Dimethicone', 4, 'medium'), (73, 22, 'Parfum', 5, 'low'),
-- 74: Nivea Cellular Eye
(74, 21, 'Aqua', 1, 'high'), (74, 3, 'Hyaluronic Acid', 2, 'active'), (74, 12, 'Glycerin', 3, 'medium'), (74, 26, 'Caffeine', 4, 'low'), (74, 25, 'Dimethicone', 5, 'medium'),
-- 75: Innisfree Green Tea Serum
(75, 21, 'Aqua', 1, 'high'), (75, 45, 'Camellia Sinensis Leaf Extract', 2, 'active'), (75, 12, 'Glycerin', 3, 'medium'), (75, 3, 'Hyaluronic Acid', 4, 'medium'), (75, 24, 'Butylene Glycol', 5, 'medium'),
-- 76: Innisfree UV Defence
(76, 21, 'Aqua', 1, 'high'), (76, 38, 'Zinc Oxide', 2, 'high'), (76, 12, 'Glycerin', 3, 'medium'), (76, 45, 'Camellia Sinensis Leaf Extract', 4, 'low'), (76, 10, 'Tocopherol', 5, 'low'),
-- 77: Innisfree Green Tea Foam
(77, 21, 'Aqua', 1, 'high'), (77, 45, 'Camellia Sinensis Leaf Extract', 2, 'medium'), (77, 12, 'Glycerin', 3, 'medium'), (77, 23, 'Phenoxyethanol', 4, 'low'), (77, 22, 'Parfum', 5, 'low'),
-- 78: LRP Effaclar Foaming Gel
(78, 21, 'Aqua', 1, 'high'), (78, 9, 'Zinc PCA', 2, 'active'), (78, 4, 'Salicylic Acid', 3, 'low'), (78, 12, 'Glycerin', 4, 'medium'), (78, 23, 'Phenoxyethanol', 5, 'low'),
-- 79: LRP Cicaplast B5+
(79, 21, 'Aqua', 1, 'high'), (79, 8, 'Panthenol', 2, 'active'), (79, 17, 'Madecassoside', 3, 'active'), (79, 30, 'Shea Butter', 4, 'medium'), (79, 38, 'Zinc Oxide', 5, 'low'),
-- 80: LRP Retinol B3
(80, 21, 'Aqua', 1, 'high'), (80, 2, 'Retinol', 2, 'active'), (80, 1, 'Niacinamide', 3, 'active'), (80, 3, 'Hyaluronic Acid', 4, 'medium'), (80, 12, 'Glycerin', 5, 'medium'),
-- 81: CeraVe Lotion
(81, 21, 'Aqua', 1, 'high'), (81, 6, 'Ceramide NP', 2, 'medium'), (81, 3, 'Hyaluronic Acid', 3, 'medium'), (81, 12, 'Glycerin', 4, 'high'), (81, 25, 'Dimethicone', 5, 'low'),
-- 82: CeraVe Retinol Serum
(82, 21, 'Aqua', 1, 'high'), (82, 2, 'Retinol', 2, 'active'), (82, 6, 'Ceramide NP', 3, 'medium'), (82, 3, 'Hyaluronic Acid', 4, 'medium'), (82, 1, 'Niacinamide', 5, 'low'),
-- 83: TO Lactic Acid
(83, 16, 'Lactic Acid', 1, 'active'), (83, 21, 'Aqua', 2, 'high'), (83, 3, 'Hyaluronic Acid', 3, 'medium'), (83, 18, 'Sodium Hyaluronate', 4, 'low'), (83, 23, 'Phenoxyethanol', 5, 'low'),
-- 84: TO Multi-Peptide
(84, 21, 'Aqua', 1, 'high'), (84, 49, 'Peptide Complex', 2, 'active'), (84, 3, 'Hyaluronic Acid', 3, 'active'), (84, 33, 'Copper Peptide', 4, 'low'), (84, 36, 'Propanediol', 5, 'medium'),
-- 85: TO NMF
(85, 21, 'Aqua', 1, 'high'), (85, 3, 'Hyaluronic Acid', 2, 'medium'), (85, 12, 'Glycerin', 3, 'medium'), (85, 19, 'Urea', 4, 'low'), (85, 14, 'Squalane', 5, 'low'),
-- 86: Bioderma Aquafluide
(86, 21, 'Aqua', 1, 'high'), (86, 37, 'Ethylhexyl Methoxycinnamate', 2, 'high'), (86, 12, 'Glycerin', 3, 'medium'), (86, 35, 'Vitamin E Acetate', 4, 'low'), (86, 10, 'Tocopherol', 5, 'low'),
-- 87: Bioderma Sensibio H2O 500ml
(87, 21, 'Aqua', 1, 'high'), (87, 12, 'Glycerin', 2, 'medium'), (87, 23, 'Phenoxyethanol', 3, 'low'), (87, 40, 'Bisabolol', 4, 'low'), (87, 15, 'Allantoin', 5, 'low'),
-- 88: COSRX AHA 7
(88, 21, 'Aqua', 1, 'high'), (88, 5, 'Glycolic Acid', 2, 'active'), (88, 1, 'Niacinamide', 3, 'low'), (88, 24, 'Butylene Glycol', 4, 'medium'), (88, 32, 'Aloe Barbadensis Leaf Extract', 5, 'low'),
-- 89: COSRX Propolis
(89, 21, 'Aqua', 1, 'high'), (89, 42, 'Propolis Extract', 2, 'active'), (89, 12, 'Glycerin', 3, 'medium'), (89, 3, 'Hyaluronic Acid', 4, 'low'), (89, 24, 'Butylene Glycol', 5, 'medium'),
-- 90: COSRX Birch Sap
(90, 21, 'Aqua', 1, 'high'), (90, 12, 'Glycerin', 2, 'high'), (90, 43, 'Beta-Glucan', 3, 'medium'), (90, 1, 'Niacinamide', 4, 'low'), (90, 8, 'Panthenol', 5, 'low'),
-- 91: Vichy Neovadiol
(91, 21, 'Aqua', 1, 'high'), (91, 3, 'Hyaluronic Acid', 2, 'active'), (91, 49, 'Peptide Complex', 3, 'medium'), (91, 1, 'Niacinamide', 4, 'medium'), (91, 12, 'Glycerin', 5, 'medium'),
-- 92: Vichy M89 Eyes
(92, 21, 'Aqua', 1, 'high'), (92, 3, 'Hyaluronic Acid', 2, 'active'), (92, 26, 'Caffeine', 3, 'medium'), (92, 1, 'Niacinamide', 4, 'low'), (92, 12, 'Glycerin', 5, 'medium'),
-- 93: Eucerin Sun OC
(93, 21, 'Aqua', 1, 'high'), (93, 37, 'Ethylhexyl Methoxycinnamate', 2, 'high'), (93, 39, 'Titanium Dioxide', 3, 'medium'), (93, 12, 'Glycerin', 4, 'medium'), (93, 25, 'Dimethicone', 5, 'low'),
-- 94: Eucerin HF Night
(94, 21, 'Aqua', 1, 'high'), (94, 3, 'Hyaluronic Acid', 2, 'active'), (94, 12, 'Glycerin', 3, 'medium'), (94, 49, 'Peptide Complex', 4, 'low'), (94, 25, 'Dimethicone', 5, 'low'),
-- 95: SVR Sun Blur
(95, 21, 'Aqua', 1, 'high'), (95, 37, 'Ethylhexyl Methoxycinnamate', 2, 'high'), (95, 39, 'Titanium Dioxide', 3, 'medium'), (95, 1, 'Niacinamide', 4, 'low'), (95, 12, 'Glycerin', 5, 'medium'),
-- 96: Avene RetrinAL
(96, 21, 'Aqua', 1, 'high'), (96, 47, 'Retinaldehyde', 2, 'active'), (96, 12, 'Glycerin', 3, 'medium'), (96, 35, 'Vitamin E Acetate', 4, 'low'), (96, 14, 'Squalane', 5, 'medium'),
-- 97: Klairs Midnight Blue
(97, 21, 'Aqua', 1, 'high'), (97, 52, 'Guaiazulene', 2, 'active'), (97, 11, 'Centella Asiatica Extract', 3, 'medium'), (97, 12, 'Glycerin', 4, 'medium'), (97, 51, 'Jojoba Oil', 5, 'low'),
-- 98: Purito Cleansing Oil
(98, 51, 'Jojoba Oil', 1, 'high'), (98, 45, 'Camellia Sinensis Leaf Extract', 2, 'medium'), (98, 10, 'Tocopherol', 3, 'low'), (98, 11, 'Centella Asiatica Extract', 4, 'low'), (98, 21, 'Aqua', 5, 'medium'),
-- 99: SBM Mineral Sun
(99, 21, 'Aqua', 1, 'high'), (99, 38, 'Zinc Oxide', 2, 'high'), (99, 11, 'Centella Asiatica Extract', 3, 'medium'), (99, 39, 'Titanium Dioxide', 4, 'medium'), (99, 12, 'Glycerin', 5, 'medium'),
-- 100: Hada Labo Shirojyun
(100, 21, 'Aqua', 1, 'high'), (100, 28, 'Tranexamic Acid', 2, 'active'), (100, 3, 'Hyaluronic Acid', 3, 'medium'), (100, 18, 'Sodium Hyaluronate', 4, 'medium'), (100, 12, 'Glycerin', 5, 'medium');
