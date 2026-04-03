-- ============================================
-- BATCH 4: New Ingredients (53-80)
-- ============================================
INSERT INTO ingredients (ingredient_id, inci_name, ingredient_slug, common_name, is_active) VALUES
(53, 'Polyhydroxy Acid', 'polyhydroxy-acid', 'Polihidroksi Asit (PHA)', true),
(54, 'Gluconolactone', 'gluconolactone', 'Glukonolakton', true),
(55, 'Astaxanthin', 'astaxanthin', 'Astaksantin', true),
(56, 'Mugwort Extract', 'mugwort-extract', 'Yavşan Otu Özütü', true),
(57, 'Galactomyces Ferment Filtrate', 'galactomyces-ferment', 'Galaktomises Ferment', true),
(58, 'Birch Juice', 'birch-juice', 'Huş Ağacı Suyu', true),
(59, 'Heartleaf Extract', 'heartleaf-extract', 'Houttuynia Cordata Özütü', true),
(60, 'Rosehip Oil', 'rosehip-oil', 'Kuşburnu Yağı', true),
(61, 'Tamanu Oil', 'tamanu-oil', 'Tamanu Yağı', true),
(62, 'Cica (Centella)', 'cica-centella', 'Cica Kompleksi', true),
(63, 'Grape Seed Extract', 'grape-seed-extract', 'Üzüm Çekirdeği Özütü', true),
(64, 'Sea Buckthorn Oil', 'sea-buckthorn-oil', 'Yaban Mersini Yağı', true),
(65, 'Benzoyl Peroxide', 'benzoyl-peroxide', 'Benzoil Peroksit', true),
(66, 'Adapalene', 'adapalene', 'Adapalen', true),
(67, 'Licorice Root Extract', 'licorice-root-extract', 'Meyan Kökü Özütü', true),
(68, 'Kojic Acid', 'kojic-acid', 'Kojik Asit', true),
(69, 'Resveratrol', 'resveratrol', 'Resveratrol', true),
(70, 'Colloidal Oatmeal', 'colloidal-oatmeal', 'Kolloidal Yulaf', true),
(71, 'Hemp Seed Oil', 'hemp-seed-oil', 'Kenevir Tohumu Yağı', true),
(72, 'Probiotics', 'probiotics', 'Probiyotikler', true),
(73, 'Saccharomyces Ferment', 'saccharomyces-ferment', 'Maya Fermenti', true),
(74, 'Turmeric Extract', 'turmeric-extract', 'Zerdeçal Özütü', true),
(75, 'Willow Bark Extract', 'willow-bark-extract', 'Söğüt Kabuğu Özütü', true),
(76, 'Amino Acids Complex', 'amino-acids-complex', 'Amino Asit Kompleksi', true),
(77, 'Ceramide AP', 'ceramide-ap', 'Seramid AP', true),
(78, 'Cholesterol', 'cholesterol', 'Kolesterol', true),
(79, 'Phytosphingosine', 'phytosphingosine', 'Fitosfingozin', true),
(80, 'EGF (Epidermal Growth Factor)', 'egf', 'EGF (Epidermal Büyüme Faktörü)', true);

SELECT setval('ingredients_ingredient_id_seq', 80);
