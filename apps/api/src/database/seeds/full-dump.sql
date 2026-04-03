--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admin_roles VALUES (1, 'super_admin', 'Süper Admin', 'Tüm yetkiler', '["*"]', '2026-04-02 23:56:47.445243');
INSERT INTO public.admin_roles VALUES (2, 'content_editor', 'İçerik Editörü', 'Makale ve ürün metinleri', '["articles.write", "products.write", "approved_wordings.write"]', '2026-04-02 23:56:47.445243');
INSERT INTO public.admin_roles VALUES (3, 'taxonomy_editor', 'Taksonomi Editörü', 'İçerik, ihtiyaç, kategori, marka CRUD', '["ingredients.write", "needs.write", "categories.write", "brands.write"]', '2026-04-02 23:56:47.445243');
INSERT INTO public.admin_roles VALUES (4, 'reviewer', 'İnceleyici', 'Review ve publish onayı', '["*.review", "*.publish"]', '2026-04-02 23:56:47.445243');
INSERT INTO public.admin_roles VALUES (5, 'methodology_reviewer', 'Metodoloji İnceleyici', 'Kanıt seviyesi ve ifade onayı', '["evidence_levels.write", "approved_wordings.write"]', '2026-04-02 23:56:47.445243');


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admin_users VALUES (1, 'admin@kozmetik.com', '$2b$12$GJrX2rkUlMzwzhlNKtuL.u/XoEcXX3yNgiqDO7gOApIYyYVBz0rMa', 'Sistem Admin', 1, true, '2026-04-03 04:36:09.825', '2026-04-02 23:56:51.885138', '2026-04-03 01:36:09.832701');


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.brands VALUES (1, 'La Roche-Posay', 'la-roche-posay', 'Fransa', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (2, 'CeraVe', 'cerave', 'ABD', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (3, 'The Ordinary', 'the-ordinary', 'Kanada', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (4, 'Bioderma', 'bioderma', 'Fransa', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (5, 'Avene', 'avene', 'Fransa', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (6, 'SVR', 'svr', 'Fransa', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (7, 'Eucerin', 'eucerin', 'Almanya', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (8, 'Neutrogena', 'neutrogena', 'ABD', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (9, 'Vichy', 'vichy', 'Fransa', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (10, 'Nuxe', 'nuxe', 'Fransa', NULL, NULL, true, '2026-04-02 23:56:51.922088', '2026-04-02 23:56:51.922088');
INSERT INTO public.brands VALUES (13, 'COSRX', 'cosrx', 'Güney Kore', NULL, NULL, true, '2026-04-03 00:52:14.342941', '2026-04-03 00:52:14.342941');
INSERT INTO public.brands VALUES (14, 'Uriage', 'uriage', 'Fransa', NULL, NULL, true, '2026-04-03 01:32:04.302072', '2026-04-03 01:32:04.302072');
INSERT INTO public.brands VALUES (15, 'Ducray', 'ducray', 'Fransa', NULL, NULL, true, '2026-04-03 01:32:04.302072', '2026-04-03 01:32:04.302072');
INSERT INTO public.brands VALUES (16, 'Hada Labo', 'hada-labo', 'Japonya', NULL, NULL, true, '2026-04-03 01:32:04.302072', '2026-04-03 01:32:04.302072');
INSERT INTO public.brands VALUES (17, 'Klairs', 'klairs', 'Güney Kore', NULL, NULL, true, '2026-04-03 01:32:04.302072', '2026-04-03 01:32:04.302072');
INSERT INTO public.brands VALUES (18, 'Purito', 'purito', 'Güney Kore', NULL, NULL, true, '2026-04-03 01:32:04.302072', '2026-04-03 01:32:04.302072');
INSERT INTO public.brands VALUES (19, 'Some By Mi', 'some-by-mi', 'Güney Kore', NULL, NULL, true, '2026-04-03 01:32:04.302072', '2026-04-03 01:32:04.302072');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES (1, NULL, 'Yüz Bakım', 'yuz-bakim', 'cosmetic', 1, true, '2026-04-02 23:56:51.909273', '2026-04-02 23:56:51.909273');
INSERT INTO public.categories VALUES (2, NULL, 'Temizleme', 'temizleme', 'cosmetic', 2, true, '2026-04-02 23:56:51.909273', '2026-04-02 23:56:51.909273');
INSERT INTO public.categories VALUES (3, NULL, 'Güneş Koruma', 'gunes-koruma', 'cosmetic', 3, true, '2026-04-02 23:56:51.909273', '2026-04-02 23:56:51.909273');
INSERT INTO public.categories VALUES (4, NULL, 'Göz Bakım', 'goz-bakim', 'cosmetic', 4, true, '2026-04-02 23:56:51.909273', '2026-04-02 23:56:51.909273');
INSERT INTO public.categories VALUES (5, NULL, 'Dudak Bakım', 'dudak-bakim', 'cosmetic', 5, true, '2026-04-02 23:56:51.909273', '2026-04-02 23:56:51.909273');
INSERT INTO public.categories VALUES (6, NULL, 'Vücut Bakım', 'vucut-bakim', 'cosmetic', 6, true, '2026-04-02 23:56:51.909273', '2026-04-02 23:56:51.909273');
INSERT INTO public.categories VALUES (7, NULL, 'Saç Bakım', 'sac-bakim', 'cosmetic', 7, true, '2026-04-02 23:56:51.909273', '2026-04-02 23:56:51.909273');
INSERT INTO public.categories VALUES (8, NULL, 'Makyaj', 'makyaj', 'cosmetic', 8, true, '2026-04-02 23:56:51.909273', '2026-04-02 23:56:51.909273');
INSERT INTO public.categories VALUES (9, NULL, 'Vitamin & Mineral', 'vitamin-mineral', 'supplement', 10, true, '2026-04-02 23:56:52.078155', '2026-04-02 23:56:52.078155');
INSERT INTO public.categories VALUES (10, NULL, 'Probiyotik', 'probiyotik', 'supplement', 11, true, '2026-04-02 23:56:52.078155', '2026-04-02 23:56:52.078155');
INSERT INTO public.categories VALUES (11, NULL, 'Bitkisel Takviye', 'bitkisel-takviye', 'supplement', 12, true, '2026-04-02 23:56:52.078155', '2026-04-02 23:56:52.078155');
INSERT INTO public.categories VALUES (12, NULL, 'Omega & Yağ Asitleri', 'omega-yag-asitleri', 'supplement', 13, true, '2026-04-02 23:56:52.078155', '2026-04-02 23:56:52.078155');


--
-- Data for Name: product_masters; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products VALUES (1, NULL, 2, 1, 'cosmetic', 'CeraVe Moisturising Cream', 'cerave-moisturising-cream', 'nemlendirici', 'Kuru ve çok kuru ciltler için ceramide içerikli yoğun nemlendirici krem', NULL, 454.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (2, NULL, 2, 2, 'cosmetic', 'CeraVe Foaming Cleanser', 'cerave-foaming-cleanser', 'temizleyici', 'Normal ve yağlı ciltler için köpüren temizleyici jel', NULL, 236.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (3, NULL, 2, 1, 'cosmetic', 'CeraVe PM Facial Moisturising Lotion', 'cerave-pm-lotion', 'nemlendirici', 'Niacinamide içeren gece nemlendirici losyon', NULL, 52.00, 'ml', 'face', 'evening', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (4, NULL, 1, 1, 'cosmetic', 'La Roche-Posay Effaclar Duo+', 'lrp-effaclar-duo-plus', 'bakım', 'Sivilce eğilimli ciltler için bakım kremi', NULL, 40.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (5, NULL, 1, 3, 'cosmetic', 'La Roche-Posay Anthelios UVMUNE 400 SPF50+', 'lrp-anthelios-uvmune-400', 'güneş kremi', 'Çok yüksek koruma güneş kremi', NULL, 50.00, 'ml', 'face', 'morning', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (6, NULL, 1, 1, 'cosmetic', 'La Roche-Posay Cicaplast Baume B5+', 'lrp-cicaplast-baume-b5', 'onarıcı', 'Hassas ve irritasyonlu ciltler için onarıcı bariyer balm', NULL, 40.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (7, NULL, 4, 2, 'cosmetic', 'Bioderma Sensibio H2O', 'bioderma-sensibio-h2o', 'temizleyici', 'Hassas ciltler için misel su', NULL, 250.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (8, NULL, 4, 1, 'cosmetic', 'Bioderma Sebium Global', 'bioderma-sebium-global', 'bakım', 'Akne eğilimli ciltler için global bakım', NULL, 30.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (9, NULL, 5, 1, 'cosmetic', 'Avene Cicalfate+ Onarıcı Krem', 'avene-cicalfate-onarici-krem', 'onarıcı', 'Hassas ve irritasyonlu ciltler için onarıcı krem', NULL, 40.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (10, NULL, 5, 1, 'cosmetic', 'Avene Tolerance Extreme Emulsion', 'avene-tolerance-extreme', 'nemlendirici', 'Ultra hassas ciltler için minimalist nemlendirici', NULL, 50.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (11, NULL, 3, 1, 'cosmetic', 'The Ordinary Niacinamide 10% + Zinc 1%', 'to-niacinamide-zinc', 'serum', 'Gözenek sıkılaştırıcı ve yağ dengeleyici serum', NULL, 30.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (12, NULL, 3, 1, 'cosmetic', 'The Ordinary Hyaluronic Acid 2% + B5', 'to-hyaluronic-acid-b5', 'serum', 'Multi-ağırlık hyaluronik asit nemlendirici serum', NULL, 30.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (13, NULL, 3, 1, 'cosmetic', 'The Ordinary Retinol 0.5% in Squalane', 'to-retinol-05-squalane', 'serum', 'Orta güçte retinol serumu', NULL, 30.00, 'ml', 'face', 'evening', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (14, NULL, 3, 1, 'cosmetic', 'The Ordinary AHA 30% + BHA 2% Peeling Solution', 'to-aha-bha-peeling', 'peeling', '10 dakikalık eksfoliyan peeling', NULL, 30.00, 'ml', 'face', 'evening', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (15, NULL, 3, 1, 'cosmetic', 'The Ordinary Ascorbic Acid 8% + Alpha Arbutin 2%', 'to-ascorbic-acid-alpha-arbutin', 'serum', 'Aydınlatıcı C vitamini serumu', NULL, 30.00, 'ml', 'face', 'morning', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (16, NULL, 3, 1, 'cosmetic', 'The Ordinary Azelaic Acid Suspension 10%', 'to-azelaic-acid-10', 'bakım', 'Leke karşıtı ve sivilce bakım ürünü', NULL, 30.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (17, NULL, 13, 1, 'cosmetic', 'COSRX Advanced Snail 96 Mucin Power Essence', 'cosrx-snail-96-essence', 'esans', 'Salyangoz müsini ile onarıcı ve nemlendirici esans', NULL, 100.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (18, NULL, 13, 2, 'cosmetic', 'COSRX Low pH Good Morning Gel Cleanser', 'cosrx-low-ph-cleanser', 'temizleyici', 'Düşük pH jel temizleyici', NULL, 150.00, 'ml', 'face', 'morning', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (19, NULL, 13, 1, 'cosmetic', 'COSRX BHA Blackhead Power Liquid', 'cosrx-bha-blackhead-liquid', 'tonik', 'Salisilik asit içeren siyah nokta bakım toniği', NULL, 100.00, 'ml', 'face', 'evening', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (20, NULL, 8, 1, 'cosmetic', 'Neutrogena Hydro Boost Water Gel', 'neutrogena-hydro-boost', 'nemlendirici', 'Hyaluronik asit içeren su bazlı jel nemlendirici', NULL, 50.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (21, NULL, 8, 3, 'cosmetic', 'Neutrogena Ultra Sheer Dry-Touch SPF55', 'neutrogena-ultra-sheer-spf55', 'güneş kremi', 'Mat bitişli güneş kremi', NULL, 88.00, 'ml', 'face', 'morning', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (22, NULL, 6, 1, 'cosmetic', 'SVR Sebiaclear Serum', 'svr-sebiaclear-serum', 'serum', 'Niacinamide + gluconolactone sivilce serumu', NULL, 30.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (23, NULL, 6, 1, 'cosmetic', 'SVR Ampoule B3 Hydra', 'svr-ampoule-b3-hydra', 'serum', 'Niacinamide yoğun nemlendirici ampul', NULL, 30.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (24, NULL, 7, 1, 'cosmetic', 'Eucerin UreaRepair Plus %5 Urea Krem', 'eucerin-urearepair-5', 'nemlendirici', '%5 Urea içeren yoğun nemlendirici', NULL, 75.00, 'ml', 'body', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (25, NULL, 7, 1, 'cosmetic', 'Eucerin DermoPurifyer Oil Control Jel Krem', 'eucerin-dermopurifyer-jel-krem', 'bakım', 'Yağlı ve akne eğilimli ciltler için mat bakım', NULL, 50.00, 'ml', 'face', 'both', 'published', '2026-04-03 00:44:26.330898', '2026-04-03 00:44:26.330898');
INSERT INTO public.products VALUES (26, NULL, 9, 1, 'cosmetic', 'Vichy Mineral 89 Hyaluronic Acid Booster', 'vichy-mineral-89', 'serum', 'Volkanik su ve hyaluronic acid ile güçlendirilmiş günlük nemlendirici booster.', NULL, 50.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (27, NULL, 9, 1, 'cosmetic', 'Vichy Normaderm Phytosolution Double-Correction', 'vichy-normaderm-phytosolution', 'bakım', 'Sivilce eğilimli ciltler için çift etkili düzeltici bakım kremi.', NULL, 50.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (28, NULL, 9, 1, 'cosmetic', 'Vichy Liftactiv Supreme', 'vichy-liftactiv-supreme', 'nemlendirici', 'Anti-aging nemlendirici krem. Kırışıklık ve sarkma karşıtı.', NULL, 50.00, 'ml', 'face', 'morning', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (29, NULL, 10, 6, 'cosmetic', 'Nuxe Huile Prodigieuse', 'nuxe-huile-prodigieuse', 'yağ', 'Yüz, vücut ve saç için çok amaçlı kuru yağ. 7 bitkisel yağ içerir.', NULL, 100.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (30, NULL, 10, 1, 'cosmetic', 'Nuxe Creme Fraiche de Beaute', 'nuxe-creme-fraiche', 'nemlendirici', '48 saat nemlendirici krem. Bitkisel süt ve hyaluronic acid içerir.', NULL, 50.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (31, NULL, 4, 6, 'cosmetic', 'Bioderma Atoderm Intensive Baume', 'bioderma-atoderm-intensive-baume', 'nemlendirici', 'Çok kuru ve atopik ciltler için yoğun onarıcı balm.', NULL, 200.00, 'ml', 'body', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (32, NULL, 4, 3, 'cosmetic', 'Bioderma Photoderm MAX Cream SPF50+', 'bioderma-photoderm-max-spf50', 'güneş kremi', 'Hassas ciltler için çok yüksek koruma güneş kremi.', NULL, 40.00, 'ml', 'face', 'morning', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (33, NULL, 2, 2, 'cosmetic', 'CeraVe SA Smoothing Cleanser', 'cerave-sa-smoothing-cleanser', 'temizleyici', 'Salisilik asit içeren pürüzsüzleştirici temizleyici. Pürüzlü ve sivilceli ciltler için.', NULL, 236.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (34, NULL, 2, 4, 'cosmetic', 'CeraVe Eye Repair Cream', 'cerave-eye-repair-cream', 'göz kremi', 'Göz çevresi için onarıcı krem. Ceramide ve hyaluronic acid içerir.', NULL, 14.00, 'ml', 'eye', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (35, NULL, 1, 1, 'cosmetic', 'La Roche-Posay Toleriane Sensitive', 'lrp-toleriane-sensitive', 'nemlendirici', 'Hassas ciltler için prebiyotik nemlendirici krem.', NULL, 40.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (36, NULL, 1, 1, 'cosmetic', 'La Roche-Posay Hyalu B5 Serum', 'lrp-hyalu-b5-serum', 'serum', 'Hyaluronic acid ve B5 vitamin içeren anti-aging dolgunlaştırıcı serum.', NULL, 30.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (37, NULL, 3, 4, 'cosmetic', 'The Ordinary Caffeine Solution 5% + EGCG', 'to-caffeine-solution-5', 'serum', 'Göz altı morlukları ve şişlikler için konsantre kafein serumu.', NULL, 30.00, 'ml', 'eye', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (38, NULL, 3, 2, 'cosmetic', 'The Ordinary Squalane Cleanser', 'to-squalane-cleanser', 'temizleyici', 'Squalane bazlı nazik temizleyici. Makyaj çözücü olarak da kullanılabilir.', NULL, 50.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (39, NULL, 3, 1, 'cosmetic', 'The Ordinary Mandelic Acid 10% + HA', 'to-mandelic-acid-10-ha', 'serum', 'Hassas ciltlere uygun hafif AHA eksfoliyan. Mandelik asit + hyaluronic acid.', NULL, 30.00, 'ml', 'face', 'evening', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (40, NULL, 3, 1, 'cosmetic', 'The Ordinary Alpha Arbutin 2% + HA', 'to-alpha-arbutin-2-ha', 'serum', 'Leke karşıtı arbutin serum. Hiperpigmentasyon tedavisi için.', NULL, 30.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (41, NULL, 13, 3, 'cosmetic', 'COSRX Aloe Soothing Sun Cream SPF50+ PA+++', 'cosrx-aloe-soothing-sun-cream', 'güneş kremi', 'Aloe vera içerikli yatıştırıcı güneş kremi. Hafif ve nemlendirici doku.', NULL, 50.00, 'ml', 'face', 'morning', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (42, NULL, 14, 1, 'cosmetic', 'Uriage Bariederm Cica-Cream', 'uriage-bariederm-cica-cream', 'onarıcı', 'Tahriş olmuş ve hasarlı ciltler için onarıcı bakım kremi.', NULL, 40.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (43, NULL, 14, 1, 'cosmetic', 'Uriage Eau Thermale Water Cream', 'uriage-eau-thermale-water-cream', 'nemlendirici', 'Termal su bazlı hafif nemlendirici krem. Tüm cilt tipleri için.', NULL, 40.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (44, NULL, 15, 1, 'cosmetic', 'Ducray Keracnyl Serum', 'ducray-keracnyl-serum', 'serum', 'Sivilce izleri ve gözenekler için düzeltici serum.', NULL, 30.00, 'ml', 'face', 'evening', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (45, NULL, 16, 1, 'cosmetic', 'Hada Labo Gokujyun Premium Hyaluronic Acid Lotion', 'hada-labo-gokujyun-premium', 'tonik', '5 farklı hyaluronic acid içeren premium nemlendirici losyon/tonik.', NULL, 170.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (46, NULL, 17, 1, 'cosmetic', 'Klairs Supple Preparation Facial Toner', 'klairs-supple-preparation-toner', 'tonik', 'Hassas ciltler için pH dengeleyici yatıştırıcı tonik.', NULL, 180.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (47, NULL, 17, 1, 'cosmetic', 'Klairs Freshly Juiced Vitamin Drop', 'klairs-freshly-juiced-vitamin-drop', 'serum', '%5 askorbik asit içeren hassas ciltlere uygun C vitamini serumu.', NULL, 35.00, 'ml', 'face', 'morning', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (48, NULL, 18, 1, 'cosmetic', 'Purito Centella Green Level Recovery Cream', 'purito-centella-recovery-cream', 'nemlendirici', 'Centella asiatica ağırlıklı yatıştırıcı onarım kremi.', NULL, 50.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (49, NULL, 19, 1, 'cosmetic', 'Some By Mi AHA BHA PHA 30 Days Miracle Toner', 'sbm-aha-bha-pha-miracle-toner', 'tonik', 'AHA, BHA ve PHA üçlü asit tonik. Sivilce eğilimli ciltler için 30 günlük mucize.', NULL, 150.00, 'ml', 'face', 'both', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');
INSERT INTO public.products VALUES (50, NULL, 8, 1, 'cosmetic', 'Neutrogena Retinol Boost Cream', 'neutrogena-retinol-boost-cream', 'nemlendirici', 'Retinol içeren anti-aging gece kremi. Kırışıklık ve ince çizgiler için.', NULL, 50.00, 'ml', 'face', 'evening', 'published', '2026-04-03 01:32:54.268341', '2026-04-03 01:32:54.268341');


--
-- Data for Name: affiliate_links; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.affiliate_links VALUES (1, 1, 'trendyol', 'https://www.trendyol.com/cerave/moisturising-cream-p-123456', 389.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (2, 1, 'hepsiburada', 'https://www.hepsiburada.com/cerave-moisturising-cream-pm-HB00123', 399.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (3, 1, 'dermoeczanem', 'https://www.dermoeczanem.com/cerave-moisturising-cream', 379.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (4, 2, 'trendyol', 'https://www.trendyol.com/cerave/foaming-cleanser-p-234567', 299.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (5, 2, 'gratis', 'https://www.gratis.com/cerave-foaming-cleanser', 309.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (6, 3, 'trendyol', 'https://www.trendyol.com/cerave/pm-lotion-p-345678', 449.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (7, 3, 'hepsiburada', 'https://www.hepsiburada.com/cerave-pm-lotion-pm-HB00345', 459.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (8, 4, 'trendyol', 'https://www.trendyol.com/la-roche-posay/effaclar-duo-p-456789', 549.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (9, 4, 'dermoeczanem', 'https://www.dermoeczanem.com/lrp-effaclar-duo', 539.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (10, 4, 'hepsiburada', 'https://www.hepsiburada.com/lrp-effaclar-duo-pm-HB00456', 559.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (11, 5, 'trendyol', 'https://www.trendyol.com/la-roche-posay/anthelios-uvmune-p-567890', 619.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (12, 5, 'gratis', 'https://www.gratis.com/lrp-anthelios-uvmune-400', 629.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (13, 6, 'trendyol', 'https://www.trendyol.com/la-roche-posay/cicaplast-baume-b5-p-678901', 429.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (14, 6, 'dermoeczanem', 'https://www.dermoeczanem.com/lrp-cicaplast-baume', 419.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (15, 7, 'trendyol', 'https://www.trendyol.com/bioderma/sensibio-h2o-p-789012', 349.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (16, 7, 'hepsiburada', 'https://www.hepsiburada.com/bioderma-sensibio-h2o-pm-HB00789', 359.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (17, 7, 'gratis', 'https://www.gratis.com/bioderma-sensibio-h2o', 339.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (18, 11, 'trendyol', 'https://www.trendyol.com/the-ordinary/niacinamide-10-zinc-1-p-111213', 189.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (19, 11, 'hepsiburada', 'https://www.hepsiburada.com/to-niacinamide-zinc-pm-HB01112', 199.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (20, 12, 'trendyol', 'https://www.trendyol.com/the-ordinary/hyaluronic-acid-2-b5-p-121314', 179.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (21, 13, 'trendyol', 'https://www.trendyol.com/the-ordinary/retinol-05-squalane-p-131415', 219.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (22, 13, 'hepsiburada', 'https://www.hepsiburada.com/to-retinol-05-pm-HB01314', 229.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (23, 14, 'trendyol', 'https://www.trendyol.com/the-ordinary/aha-30-bha-2-peeling-p-141516', 209.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (24, 20, 'trendyol', 'https://www.trendyol.com/neutrogena/hydro-boost-water-gel-p-202122', 329.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (25, 20, 'gratis', 'https://www.gratis.com/neutrogena-hydro-boost', 339.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (26, 24, 'trendyol', 'https://www.trendyol.com/eucerin/urearepair-plus-p-242526', 469.90, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (27, 24, 'dermoeczanem', 'https://www.dermoeczanem.com/eucerin-urearepair-plus', 459.00, NULL, true, '2026-04-03 01:03:19.899962', '2026-04-03 01:03:19.899962');
INSERT INTO public.affiliate_links VALUES (28, 8, 'trendyol', 'https://www.trendyol.com/bioderma/sebium-global-p-345678', 289.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (29, 8, 'dermoeczanem', 'https://www.dermoeczanem.com/bioderma-sebium-global', 299.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (30, 9, 'trendyol', 'https://www.trendyol.com/avene/cicalfate-onarici-krem-p-456789', 379.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (31, 9, 'hepsiburada', 'https://www.hepsiburada.com/avene-cicalfate-krem-pm-HB00234', 389.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (32, 10, 'trendyol', 'https://www.trendyol.com/avene/tolerance-extreme-emulsion-p-567890', 349.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (33, 10, 'dermoeczanem', 'https://www.dermoeczanem.com/avene-tolerance-extreme-emulsion', 359.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (34, 15, 'trendyol', 'https://www.trendyol.com/the-ordinary/ascorbic-acid-alpha-arbutin-p-678901', 189.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (35, 15, 'hepsiburada', 'https://www.hepsiburada.com/the-ordinary-ascorbic-acid-alpha-arbutin-pm-HB00345', 195.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (36, 16, 'trendyol', 'https://www.trendyol.com/the-ordinary/azelaic-acid-suspension-p-789012', 169.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (37, 16, 'gratis', 'https://www.gratis.com/the-ordinary-azelaic-acid-10', 175.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (38, 17, 'trendyol', 'https://www.trendyol.com/cosrx/snail-96-mucin-essence-p-890123', 329.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (39, 17, 'hepsiburada', 'https://www.hepsiburada.com/cosrx-snail-96-essence-pm-HB00456', 339.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (40, 18, 'trendyol', 'https://www.trendyol.com/cosrx/low-ph-good-morning-cleanser-p-901234', 199.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (41, 18, 'gratis', 'https://www.gratis.com/cosrx-low-ph-good-morning-cleanser', 209.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (42, 19, 'trendyol', 'https://www.trendyol.com/cosrx/bha-blackhead-power-liquid-p-012345', 269.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (43, 19, 'hepsiburada', 'https://www.hepsiburada.com/cosrx-bha-blackhead-power-pm-HB00567', 279.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (44, 21, 'trendyol', 'https://www.trendyol.com/neutrogena/ultra-sheer-spf55-p-112233', 219.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (45, 21, 'gratis', 'https://www.gratis.com/neutrogena-ultra-sheer-spf55', 229.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (46, 22, 'trendyol', 'https://www.trendyol.com/svr/sebiaclear-serum-p-223344', 349.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (47, 22, 'dermoeczanem', 'https://www.dermoeczanem.com/svr-sebiaclear-serum', 359.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (48, 23, 'trendyol', 'https://www.trendyol.com/svr/ampoule-b3-hydra-p-334455', 389.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (49, 23, 'dermoeczanem', 'https://www.dermoeczanem.com/svr-ampoule-b3-hydra', 399.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (50, 25, 'trendyol', 'https://www.trendyol.com/eucerin/dermopurifyer-oil-control-p-445566', 329.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (51, 25, 'hepsiburada', 'https://www.hepsiburada.com/eucerin-dermopurifyer-pm-HB00678', 339.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (52, 26, 'trendyol', 'https://www.trendyol.com/vichy/mineral-89-booster-p-556677', 549.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (53, 26, 'hepsiburada', 'https://www.hepsiburada.com/vichy-mineral-89-pm-HB00789', 559.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (54, 26, 'dermoeczanem', 'https://www.dermoeczanem.com/vichy-mineral-89-hyaluronic-acid-booster', 539.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (55, 27, 'trendyol', 'https://www.trendyol.com/vichy/normaderm-phytosolution-p-667788', 459.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (56, 27, 'hepsiburada', 'https://www.hepsiburada.com/vichy-normaderm-phytosolution-pm-HB00890', 469.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (57, 28, 'trendyol', 'https://www.trendyol.com/vichy/liftactiv-supreme-p-778899', 529.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (58, 28, 'dermoeczanem', 'https://www.dermoeczanem.com/vichy-liftactiv-supreme', 539.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (59, 29, 'trendyol', 'https://www.trendyol.com/nuxe/huile-prodigieuse-p-889900', 429.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (60, 29, 'hepsiburada', 'https://www.hepsiburada.com/nuxe-huile-prodigieuse-pm-HB00901', 439.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (61, 29, 'gratis', 'https://www.gratis.com/nuxe-huile-prodigieuse', 419.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (62, 30, 'trendyol', 'https://www.trendyol.com/nuxe/creme-fraiche-de-beaute-p-990011', 399.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (63, 30, 'hepsiburada', 'https://www.hepsiburada.com/nuxe-creme-fraiche-pm-HB00012', 409.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (64, 31, 'trendyol', 'https://www.trendyol.com/bioderma/atoderm-intensive-baume-p-101112', 349.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (65, 31, 'dermoeczanem', 'https://www.dermoeczanem.com/bioderma-atoderm-intensive-baume', 359.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (66, 32, 'trendyol', 'https://www.trendyol.com/bioderma/photoderm-max-spf50-p-121314', 389.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (67, 32, 'hepsiburada', 'https://www.hepsiburada.com/bioderma-photoderm-max-pm-HB00123', 399.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (68, 33, 'trendyol', 'https://www.trendyol.com/cerave/sa-smoothing-cleanser-p-131415', 259.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (69, 33, 'gratis', 'https://www.gratis.com/cerave-sa-smoothing-cleanser', 269.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (70, 33, 'hepsiburada', 'https://www.hepsiburada.com/cerave-sa-smoothing-cleanser-pm-HB00234', 265.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (71, 34, 'trendyol', 'https://www.trendyol.com/cerave/eye-repair-cream-p-141516', 289.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (72, 34, 'hepsiburada', 'https://www.hepsiburada.com/cerave-eye-repair-cream-pm-HB00345', 299.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (73, 35, 'trendyol', 'https://www.trendyol.com/la-roche-posay/toleriane-sensitive-p-151617', 389.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (74, 35, 'dermoeczanem', 'https://www.dermoeczanem.com/lrp-toleriane-sensitive', 399.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (75, 36, 'trendyol', 'https://www.trendyol.com/la-roche-posay/hyalu-b5-serum-p-161718', 549.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (76, 36, 'hepsiburada', 'https://www.hepsiburada.com/lrp-hyalu-b5-serum-pm-HB00456', 559.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (77, 36, 'dermoeczanem', 'https://www.dermoeczanem.com/lrp-hyalu-b5-serum', 539.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (78, 37, 'trendyol', 'https://www.trendyol.com/the-ordinary/caffeine-solution-5-egcg-p-171819', 139.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (79, 37, 'gratis', 'https://www.gratis.com/the-ordinary-caffeine-solution', 145.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (80, 38, 'trendyol', 'https://www.trendyol.com/the-ordinary/squalane-cleanser-p-181920', 159.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (81, 38, 'hepsiburada', 'https://www.hepsiburada.com/the-ordinary-squalane-cleanser-pm-HB00567', 165.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (82, 39, 'trendyol', 'https://www.trendyol.com/the-ordinary/mandelic-acid-10-ha-p-192021', 169.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (83, 39, 'gratis', 'https://www.gratis.com/the-ordinary-mandelic-acid-10-ha', 175.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (84, 40, 'trendyol', 'https://www.trendyol.com/the-ordinary/alpha-arbutin-2-ha-p-202122', 179.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (85, 40, 'hepsiburada', 'https://www.hepsiburada.com/the-ordinary-alpha-arbutin-pm-HB00678', 185.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (86, 41, 'trendyol', 'https://www.trendyol.com/cosrx/aloe-soothing-sun-cream-p-212223', 249.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (87, 41, 'hepsiburada', 'https://www.hepsiburada.com/cosrx-aloe-sun-cream-pm-HB00789', 259.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (88, 42, 'trendyol', 'https://www.trendyol.com/uriage/bariederm-cica-cream-p-222324', 319.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (89, 42, 'dermoeczanem', 'https://www.dermoeczanem.com/uriage-bariederm-cica-cream', 329.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (90, 43, 'trendyol', 'https://www.trendyol.com/uriage/eau-thermale-water-cream-p-232425', 299.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (91, 43, 'hepsiburada', 'https://www.hepsiburada.com/uriage-eau-thermale-water-cream-pm-HB00890', 309.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (92, 44, 'trendyol', 'https://www.trendyol.com/ducray/keracnyl-serum-p-242526', 349.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (93, 44, 'dermoeczanem', 'https://www.dermoeczanem.com/ducray-keracnyl-serum', 359.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (94, 45, 'trendyol', 'https://www.trendyol.com/hada-labo/gokujyun-premium-lotion-p-252627', 359.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (95, 45, 'hepsiburada', 'https://www.hepsiburada.com/hada-labo-gokujyun-premium-pm-HB00901', 369.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (96, 46, 'trendyol', 'https://www.trendyol.com/klairs/supple-preparation-toner-p-262728', 299.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (97, 46, 'hepsiburada', 'https://www.hepsiburada.com/klairs-supple-preparation-toner-pm-HB00012', 309.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (98, 47, 'trendyol', 'https://www.trendyol.com/klairs/freshly-juiced-vitamin-drop-p-272829', 329.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (99, 47, 'hepsiburada', 'https://www.hepsiburada.com/klairs-vitamin-drop-pm-HB00123', 339.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (100, 48, 'trendyol', 'https://www.trendyol.com/purito/centella-recovery-cream-p-282930', 279.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (101, 48, 'hepsiburada', 'https://www.hepsiburada.com/purito-centella-recovery-pm-HB00234', 289.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (102, 49, 'trendyol', 'https://www.trendyol.com/some-by-mi/aha-bha-pha-miracle-toner-p-293031', 269.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (103, 49, 'hepsiburada', 'https://www.hepsiburada.com/some-by-mi-miracle-toner-pm-HB00345', 279.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (104, 50, 'trendyol', 'https://www.trendyol.com/neutrogena/retinol-boost-cream-p-303132', 299.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (105, 50, 'gratis', 'https://www.gratis.com/neutrogena-retinol-boost-cream', 309.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');
INSERT INTO public.affiliate_links VALUES (106, 50, 'hepsiburada', 'https://www.hepsiburada.com/neutrogena-retinol-boost-pm-HB00456', 305.00, '2026-04-03 01:45:53.028248', true, '2026-04-03 01:45:53.028248', '2026-04-03 01:45:53.028248');


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: approved_wordings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.approved_wordings VALUES (1, 'nemlendirme', 'Cildi nemlendirmeye yardımcı olur', 'Cildi sonsuza kadar nemlendirir', 'Kesin ifadelerden kaçının', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (2, 'nemlendirme', 'Nem dengesini korumaya destek olur', 'Kuruluğu tamamen ortadan kaldırır', NULL, 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (3, 'anti-aging', 'Kırışıklık görünümünü azaltmaya yardımcı olur', 'Kırışıklıkları yok eder', 'Kozmetik ürünler tedavi etmez', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (4, 'anti-aging', 'Yaşlanma belirtilerinin görünümünü iyileştirmeye destek olur', '10 yaş gençleştirir', NULL, 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (5, 'sivilce', 'Sivilce eğilimli ciltler için formüle edilmiştir', 'Sivilceleri tedavi eder', 'Tedavi ifadesi tıbbi üründür', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (6, 'sivilce', 'Gözeneklerin tıkanmasını azaltmaya yardımcı olur', 'Sivilceleri kesin çözüm', NULL, 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (7, 'leke', 'Cilt tonunun eşitlenmesine yardımcı olur', 'Lekeleri siler', 'Silmek ifadesi yanıltıcı', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (8, 'leke', 'Koyu leke görünümünü azaltmaya destek olur', 'Lekeleri tedavi eder', NULL, 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (9, 'bariyer', 'Cilt bariyerini güçlendirmeye yardımcı olur', 'Cilt bariyerini onarır', 'Onarım ifadesi tıbbi', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (10, 'hassasiyet', 'Hassas ciltler için uygunluğu test edilmiştir', 'Alerji yapmaz', '%100 garanti verilemez', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (11, 'genel', 'İçerdiği [aktif] sayesinde [fayda] sağlamaya yardımcı olur', '[Aktif] sayesinde kesinlikle [fayda] sağlar', 'Kesinlik belirten ifadelerden kaçının', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (12, 'genel', 'Dermatolojik olarak test edilmiştir', 'Doktor onaylıdır', 'Onay ile test farklı kavramlar', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (13, 'güneş', 'SPF koruma faktörlü', 'Güneşten %100 korur', '%100 koruma mümkün değil', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (14, 'parfüm', 'Parfüm içermez', 'Hipoalerjenik', 'Hipoalerjenik düzenlenmiş bir terim değil', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');
INSERT INTO public.approved_wordings VALUES (15, 'doğal', 'Doğal kaynaklı içerikler ile formüle edilmiştir', '%100 doğal', '%100 doğal formülasyon neredeyse imkansız', 'tr', true, '2026-04-02 23:56:52.028749', '2026-04-02 23:56:52.028749');


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: batch_imports; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: content_articles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.content_articles VALUES (1, 'Niacinamide Nedir? Cilt İçin Faydaları ve Kullanımı', 'niacinamide-nedir-faydalari', 'ingredient_guide', 'B3 vitamini olarak da bilinen niacinamide, cilt bakımında en çok araştırılan aktif maddelerden biridir.', '## Niacinamide Nedir?

Niacinamide (niasinamid), B3 vitamininin aktif formudur. Suda çözünür bir vitamindir ve topikal olarak uygulandığında cildin üst tabakalarına nüfuz edebilir.

## Kanıtlanmış Faydaları

### 1. Gözenek Görünümünü Azaltır
%5 konsantrasyonda niacinamide kullanımının 12 hafta sonunda gözenek görünümünü anlamlı ölçüde azalttığı gösterilmiştir.

### 2. Leke ve Hiperpigmentasyonu Hafifletir
Melanin üretimini düzenleyerek koyu lekelerin açılmasına yardımcı olur. Etkisi 8-12 hafta düzenli kullanımda belirginleşir.

### 3. Yağ Üretimini Dengeler
Sebum üretimini düzenleyerek yağlı cilt parlamasını kontrol eder.

### 4. Cilt Bariyerini Güçlendirir
Ceramide üretimini destekleyerek cildin doğal koruma bariyerini onarır.

## Nasıl Kullanılır?

- **Konsantrasyon:** %2-10 arası etkili, %5 en yaygın
- **Uygulama:** Temizleme sonrası, nemlendirici öncesi
- **Sıklık:** Günde 2 kez (sabah ve akşam)
- **Kombinasyon:** Hyaluronic acid, ceramide ile uyumlu

## Dikkat Edilmesi Gerekenler

- Yüksek konsantrasyonlarda (%10+) hassas ciltlerde kızarıklık yapabilir
- C vitamini ile aynı anda kullanılabilir
- Sonuçlar 4-8 hafta düzenli kullanımda görülür', 'published', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751');
INSERT INTO public.content_articles VALUES (2, 'Sivilce Eğilimli Cilt İçin En İyi 5 Aktif Madde', 'sivilce-icin-en-iyi-5-aktif', 'guide', 'Sivilce tedavisinde bilimsel olarak etkisi kanıtlanmış 5 aktif madde: salisilik asit, niacinamide, çinko, azelaik asit ve retinol.', '## Sivilce ile Mücadelede Bilim Ne Diyor?

Sivilce (akne vulgaris), dünyada en yaygın cilt sorunlarından biridir.

## 1. Salisilik Asit (BHA)

**Ne yapar:** Yağda çözünür yapısı sayesinde gözeneklerin içine nüfuz ederek tıkanıklığı giderir.
**Konsantrasyon:** %0.5-2
**Kanıt düzeyi:** Yüksek

## 2. Niacinamide

**Ne yapar:** Sebum üretimini düzenler, iltihap karşıtı etki gösterir.
**Konsantrasyon:** %4-5
**Kanıt düzeyi:** Yüksek

## 3. Çinko (Zinc PCA)

**Ne yapar:** Antimikrobiyal ve anti-inflamatuar etki gösterir.
**Konsantrasyon:** %1-4 (topikal)

## 4. Azelaik Asit

**Ne yapar:** Antibakteriyel, keratolotik ve anti-inflamatuar.
**Konsantrasyon:** %10-20

## 5. Retinol

**Ne yapar:** Hücre yenilenmesini hızlandırır, gözeneklerin tıkanmasını önler.
**Konsantrasyon:** %0.1-0.5

## Kullanım Sırası Önerisi

1. Temizleyici (salisilik asitli)
2. Tonik/esans
3. Niacinamide + Zinc serum
4. Nemlendirici
5. Güneş kremi (sabah)', 'published', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751');
INSERT INTO public.content_articles VALUES (3, 'Cilt Bariyeri Nedir? Nasıl Onarılır?', 'cilt-bariyeri-nedir-nasil-onarilir', 'guide', 'Cilt bariyeri sağlığı, tüm cilt bakım rutinlerinin temelidir. Bariyer hasarının belirtileri, nedenleri ve onarım yöntemleri.', '## Cilt Bariyeri Nedir?

Cildin en dış tabakası olan stratum corneum, vücudun dış dünyaya karşı ilk savunma hattıdır. Bu tabaka, ceramidler, kolesterol ve yağ asitlerinden oluşan bir "tuğla-harç" yapısına sahiptir.

## Bariyer Hasarının Belirtileri

- Sıkılık ve kuruluk hissi
- Kızarıklık ve hassasiyet
- Ürünler batıyor veya yakıyor
- Ciltte pullanma
- Normalden fazla yağlanma (kompansatuar)

## Neler Bariyeri Bozar?

- Aşırı temizleme (günde 3+ yıkama)
- Sert yüzey aktif maddeler (SLS)
- Aktif madde aşırı kullanımı
- Çok sıcak suyla yıkama

## Onarım İçin Anahtar Maddeler

### Ceramide
Bariyerin yapı taşı. CeraVe, Eucerin gibi markalar ceramide içerikli ürünleriyle bilinir.

### Hyaluronic Acid
Su tutma kapasitesi yüksek, nem kaybını azaltır.

### Panthenol (B5)
Yatıştırıcı, onarıcı, nem tutma kapasitesini artırır.

### Urea (%5-10)
Hem nemlendirici hem hafif keratolotik etki gösterir.

## Bariyer Onarım Rutini

1. Nazik temizleyici (sülfatsız)
2. Hyaluronic acid serum (nemli cilde)
3. Ceramide + panthenol içeren nemlendirici
4. Güneş kremi (sabah)

**Süre:** Bariyer onarımı genellikle 2-4 hafta sürer.', 'published', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751');
INSERT INTO public.content_articles VALUES (4, 'AHA ve BHA Farkı Nedir? Hangisini Seçmelisin?', 'aha-bha-farki-hangisini-secmelisin', 'guide', 'Kimyasal eksfoliyanlar AHA ve BHA arasındaki farklar, cilt tipine göre seçim rehberi.', '## Kimyasal Eksfoliyasyon Nedir?

Kimyasal eksfoliyantlar, ölü hücreleri fiziksel sürtünme yerine kimyasal reaksiyonla uzaklaştırır.

## AHA (Alfa Hidroksi Asitler)

**Örnekler:** Glikolik asit, laktik asit, mandelic asit
**Nasıl çalışır:** Suda çözünür. Cildin yüzeyindeki hücre bağlarını kopararak ölü hücreleri uzaklaştırır.

**Kime uygun:**
- Kuru ve normal ciltler
- Güneş hasarı ve lekeler
- İnce çizgiler

## BHA (Beta Hidroksi Asitler)

**Örnek:** Salisilik asit
**Nasıl çalışır:** Yağda çözünür. Gözeneklerin içine nüfuz ederek tıkanıklığı giderir.

**Kime uygun:**
- Yağlı ve karma ciltler
- Sivilce eğilimli ciltler
- Siyah nokta sorunu

## Karşılaştırma

| Özellik | AHA | BHA |
|---------|-----|-----|
| Çözünürlük | Suda | Yağda |
| Derinlik | Yüzey | Gözenek içi |
| En uygun cilt | Kuru/normal | Yağlı/karma |
| Anti-aging | Güçlü | Zayıf |
| Anti-akne | Zayıf | Güçlü |

## İkisi Birlikte Kullanılır mı?

Evet, ancak dikkatli olunmalı. Haftada 1-2 kez kombinasyon ürün kullanılabilir.', 'published', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751');
INSERT INTO public.content_articles VALUES (5, 'Retinol Rehberi: Başlangıçtan İleri Seviyeye', 'retinol-rehberi-baslangictan-ileri-seviyeye', 'ingredient_guide', 'Retinol kullanımına yeni başlayanlar ve deneyimli kullanıcılar için kapsamlı rehber.', '## Retinol Nedir?

Retinol, A vitamininin topikal formudur. Anti-aging alanında altın standart olarak kabul edilir.

## Faydaları

- Kırışıklık ve ince çizgileri azaltır
- Kolajen üretimini artırır
- Hücre yenilenmesini hızlandırır
- Gözenek görünümünü azaltır
- Hiperpigmentasyonu hafifletir

## Başlangıç Rehberi

### Hafta 1-2: Alıştırma
- %0.1-0.2 retinol ile başla
- Haftada 2 gece uygula

### Hafta 3-4: Artırma
- Haftada 3-4 geceye çık
- Tahriş yoksa devam

### Ay 2+: Düzenli Kullanım
- Her akşam veya gün aşırı
- Konsantrasyon artırılabilir (%0.3-0.5)

## Retinol Yanığı (Retinization)

İlk 2-6 hafta normal:
- Hafif soyulma
- Kızarıklık
- Kuruluk
- Geçici sivilce artışı (purging)

## Kombinasyon Kuralları

**Birlikte kullan:** Hyaluronic acid, Ceramide, SPF
**Ayrı akşamlarda:** AHA/BHA
**Kesinlikle kullanma:** Hamilelik/emzirme döneminde

## Konsantrasyon Rehberi

| Seviye | Konsantrasyon | Kimler İçin |
|--------|--------------|-------------|
| Başlangıç | %0.1-0.3 | İlk kez kullananlar |
| Orta | %0.3-0.5 | 3+ ay deneyimli |
| İleri | %0.5-1.0 | 6+ ay deneyimli |', 'published', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751');
INSERT INTO public.content_articles VALUES (6, 'Güneş Kremi Rehberi: SPF, PA ve Doğru Seçim', 'gunes-kremi-rehberi-spf-pa', 'guide', 'Güneş korumasının önemi, SPF ve PA değerleri, kimyasal vs mineral filtreler, doğru güneş kremi seçimi.', '## Neden Güneş Kremi?

UV ışınları ciltte:
- Erken yaşlanmanın %80''inden sorumludur
- Hiperpigmentasyon ve lekelere yol açar
- Cilt kanseri riskini artırır

**Tek bir anti-aging ürün seçecek olsan, güneş kremi olmalı.**

## SPF Ne Demek?

SPF (Sun Protection Factor), UVB korumasını ölçer:
- SPF 30: UVB''nin %97''sini engeller
- SPF 50: UVB''nin %98''ini engeller

## PA Değeri

PA, UVA korumasını gösterir:
- PA++++: Çok yüksek

## Kimyasal vs Mineral

### Kimyasal Filtreler
UV''yi absorbe eder. Hafif doku, beyaz iz bırakmaz.

### Mineral Filtreler
UV''yi yansıtır. Hassas ciltlere uygun, hemen etkili.

## Ne Kadar Sürmeliyiz?

- Yüz için: Yaklaşık yarım çay kaşığı
- 2 parmak kuralı: İşaret + orta parmak üzerine şerit çek
- Her 2 saatte bir yeniden uygula

## Cilt Tipine Göre Seçim

| Cilt Tipi | Filtre Tipi | Doku |
|-----------|-------------|------|
| Yağlı | Kimyasal | Jel/fluid |
| Kuru | Kimyasal/Karma | Krem |
| Hassas | Mineral | Krem |
| Sivilceli | Kimyasal | Oil-free jel |', 'published', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751');
INSERT INTO public.content_articles VALUES (7, 'INCI Listesi Nasıl Okunur?', 'inci-listesi-nasil-okunur', 'guide', 'Kozmetik ürünlerin arkasındaki INCI listesini anlamak için temel rehber.', '## INCI Nedir?

INCI (International Nomenclature of Cosmetic Ingredients), kozmetik ürünlerin içerik listesini standartlaştıran uluslararası isimlendirme sistemidir.

## Temel Kurallar

### 1. Konsantrasyon Sıralaması
İçerikler miktarına göre azalan sırada yazılır. İlk sıradakiler en yüksek konsantrasyondadır.

### 2. %1 Eşiği
Genellikle Phenoxyethanol veya benzeri koruyucular %1 sınırını işaret eder. Bu maddeden sonra yazılanlar çok düşük konsantrasyondadır.

### 3. Latince İsimler
- Bitkisel içerikler Latince yazılır: Aloe Barbadensis Leaf Extract
- Kimyasal maddeler İngilizce: Niacinamide
- Su her zaman: Aqua

## Dikkat Edilecek Maddeler

### Koruyucular
- Phenoxyethanol — en yaygın, genellikle güvenli
- Methylisothiazolinone (MI) — alerjik reaksiyon riski yüksek

### Parfüm/Koku
- Parfum veya Fragrance — hassas ciltler için risk
- Limonene, Linalool — alerjen koku bileşenleri

### Faydalı Aktifler
- Niacinamide, Hyaluronic Acid, Retinol, Salicylic Acid

## Okuma Stratejisi

1. **İlk 5 maddeye bak** — ürünün %80+''ini oluşturur
2. **Aktif maddenin yerini kontrol et** — üst sıralardaysa etkili dozda
3. **Koruyucu sınırını bul** — aktifler bundan önce mi?
4. **Hassasiyet maddelerini tara** — fragrance, alcohol denat

## Platformumuzda Ne İşe Yarar?

Kozmetik Platform olarak her ürünün INCI listesini analiz ediyor, maddeleri tanımlıyor ve cilt ihtiyaçlarınıza uyumluluğunu skorluyoruz.', 'published', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751', '2026-04-03 01:09:25.709751');


--
-- Data for Name: evidence_levels; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.evidence_levels VALUES (1, 'systematic_review', 'Sistematik Derleme', 'Birden fazla çalışmanın meta-analizi', 1, '#22c55e', '🟢', true, '2026-04-02 23:56:45.963721', '2026-04-02 23:56:45.963721');
INSERT INTO public.evidence_levels VALUES (2, 'randomized_controlled', 'Randomize Kontrollü', 'Altın standart klinik çalışma', 2, '#22c55e', '🟢', true, '2026-04-02 23:56:45.963721', '2026-04-02 23:56:45.963721');
INSERT INTO public.evidence_levels VALUES (3, 'cohort_study', 'Kohort Çalışması', 'Gözlemsel takip çalışması', 3, '#eab308', '🟡', true, '2026-04-02 23:56:45.963721', '2026-04-02 23:56:45.963721');
INSERT INTO public.evidence_levels VALUES (4, 'case_control', 'Vaka Kontrol', 'Geriye dönük karşılaştırma', 4, '#eab308', '🟡', true, '2026-04-02 23:56:45.963721', '2026-04-02 23:56:45.963721');
INSERT INTO public.evidence_levels VALUES (5, 'expert_opinion', 'Uzman Görüşü', 'Dermatolojist/kimyager konsensüsü', 5, '#f97316', '🟠', true, '2026-04-02 23:56:45.963721', '2026-04-02 23:56:45.963721');
INSERT INTO public.evidence_levels VALUES (6, 'in_vitro', 'In Vitro', 'Laboratuvar ortamı çalışması', 6, '#f97316', '🟠', true, '2026-04-02 23:56:45.963721', '2026-04-02 23:56:45.963721');
INSERT INTO public.evidence_levels VALUES (7, 'traditional_use', 'Geleneksel Kullanım', 'Uzun süreli geleneksel deneyim', 7, '#3b82f6', '🔵', true, '2026-04-02 23:56:45.963721', '2026-04-02 23:56:45.963721');
INSERT INTO public.evidence_levels VALUES (8, 'anecdotal', 'Anekdot', 'Bireysel deneyim ve gözlem', 8, '#3b82f6', '🔵', true, '2026-04-02 23:56:45.963721', '2026-04-02 23:56:45.963721');


--
-- Data for Name: formula_revisions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ingredients VALUES (1, 'cosmetic', 'Niacinamide', 'Niasinamid (B3 Vitamini)', 'niacinamide', 'Vitamin', 'synthetic', 'Gözenek sıkılaştırıcı, leke giderici, bariyer güçlendirici. Hemen her cilt tipine uygun çok yönlü aktif.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (2, 'cosmetic', 'Retinol', 'Retinol (A Vitamini)', 'retinol', 'Vitamin', 'synthetic', 'Anti-aging altın standardı. Kırışıklık, leke ve akne üzerinde güçlü etki. Gece kullanımı gerektirir.', NULL, NULL, false, false, false, 'systematic_review', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (3, 'cosmetic', 'Hyaluronic Acid', 'Hyaluronik Asit', 'hyaluronic-acid', 'Nemlendirici', 'biotech', 'Kendi ağırlığının 1000 katı su tutan nemlendirici. Tüm cilt tipleri için uygun.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (4, 'cosmetic', 'Salicylic Acid', 'Salisilik Asit', 'salicylic-acid', 'BHA', 'synthetic', 'Yağda çözünür eksfoliyant. Gözeneklerin derinlerine ulaşarak sivilce oluşumunu engeller.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (5, 'cosmetic', 'Glycolic Acid', 'Glikolik Asit', 'glycolic-acid', 'AHA', 'synthetic', 'En küçük AHA molekülü. Ölü hücreleri arındırarak cilt yenilenmesini hızlandırır.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (6, 'cosmetic', 'Ceramide NP', 'Seramid NP', 'ceramide-np', 'Lipid', 'synthetic', 'Cilt bariyerinin temel yapı taşı. Nem kaybını önler ve bariyeri onarır.', NULL, NULL, false, false, false, 'cohort_study', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (7, 'cosmetic', 'Ascorbic Acid', 'C Vitamini', 'ascorbic-acid', 'Vitamin', 'synthetic', 'Güçlü antioksidan. Leke giderici, kolajen sentezini destekler.', NULL, NULL, false, false, false, 'systematic_review', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (8, 'cosmetic', 'Panthenol', 'Panthenol (B5 Vitamini)', 'panthenol', 'Vitamin', 'synthetic', 'Yatıştırıcı ve nemlendirici. Cilt bariyerini güçlendirir.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (9, 'cosmetic', 'Zinc PCA', 'Çinko PCA', 'zinc-pca', 'Mineral', 'synthetic', 'Sebum düzenleyici, anti-bakteriyel. Yağlı ve akne eğilimli cilde uygun.', NULL, NULL, false, false, false, 'cohort_study', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (10, 'cosmetic', 'Tocopherol', 'E Vitamini', 'tocopherol', 'Vitamin', 'natural', 'Güçlü antioksidan, nemlendirici ve iyileştirici.', NULL, NULL, false, false, false, 'systematic_review', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (11, 'cosmetic', 'Centella Asiatica Extract', 'Centella Asiatica Özütü', 'centella-asiatica-extract', 'Bitki Özütü', 'natural', 'Yatıştırıcı, iyileştirici, bariyer güçlendirici. Hassas ciltlere özel.', NULL, NULL, false, false, false, 'cohort_study', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (12, 'cosmetic', 'Glycerin', 'Gliserin', 'glycerin', 'Nemlendirici', 'synthetic', 'Temel nemlendirici humektant. Havadan nem çeker ve ciltte tutar.', NULL, NULL, false, false, false, 'systematic_review', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (13, 'cosmetic', 'Azelaic Acid', 'Azelaik Asit', 'azelaic-acid', 'Aktif', 'synthetic', 'Sivilce, leke ve rozasea için etkili. Antienflamatuar ve antibakteriyel.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (14, 'cosmetic', 'Squalane', 'Skualan', 'squalane', 'Emoliyan', 'biotech', 'Cildin doğal yağına benzeyen hafif emoliyan. Gözenekleri tıkamaz.', NULL, NULL, false, false, false, 'expert_opinion', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (15, 'cosmetic', 'Allantoin', 'Allantoin', 'allantoin', 'Yatıştırıcı', 'synthetic', 'Cilt yatıştırıcı ve yumuşatıcı. Tahrişi azaltır.', NULL, NULL, false, false, false, 'cohort_study', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (16, 'cosmetic', 'Lactic Acid', 'Laktik Asit', 'lactic-acid', 'AHA', 'biotech', 'Hassas ciltler için uygun yumuşak AHA. Hem eksfoliye eder hem nemlendirir.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (17, 'cosmetic', 'Madecassoside', 'Madesassosid', 'madecassoside', 'Bitki Özütü', 'natural', 'Centella türevi. Güçlü yatıştırıcı ve onarıcı.', NULL, NULL, false, false, false, 'cohort_study', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (18, 'cosmetic', 'Sodium Hyaluronate', 'Sodyum Hyaluronat', 'sodium-hyaluronate', 'Nemlendirici', 'biotech', 'Hyaluronik asidin tuzu. Daha küçük molekül, daha derin penetrasyon.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (19, 'cosmetic', 'Urea', 'Üre', 'urea', 'Nemlendirici', 'synthetic', 'Güçlü humektant ve hafif keratolotik. Ekstra kuru ciltler için ideal.', NULL, NULL, false, false, false, 'systematic_review', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (20, 'cosmetic', 'Bakuchiol', 'Bakuchiol', 'bakuchiol', 'Bitki Özütü', 'natural', 'Retinol alternatifi bitkisel aktif. Hamilelikte de kullanılabilir.', NULL, NULL, false, false, false, 'randomized_controlled', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (21, 'cosmetic', 'Aqua', 'Su', 'aqua', 'Çözücü', 'natural', 'Tüm kozmetik formülasyonların temel çözücüsü.', NULL, NULL, false, false, false, 'expert_opinion', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (22, 'cosmetic', 'Parfum', 'Parfüm', 'parfum', 'Koku', 'synthetic', 'Ürüne koku veren bileşen karışımı. Hassas ciltler için tahriş riski taşır.', NULL, NULL, true, true, false, 'expert_opinion', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (23, 'cosmetic', 'Phenoxyethanol', 'Fenoksietanol', 'phenoxyethanol', 'Koruyucu', 'synthetic', 'Yaygın kullanılan koruyucu. Paraben alternatifi.', NULL, NULL, false, false, true, 'expert_opinion', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (24, 'cosmetic', 'Butylene Glycol', 'Butilen Glikol', 'butylene-glycol', 'Nemlendirici', 'synthetic', 'Hafif nemlendirici ve çözücü. Aktif maddelerin penetrasyonunu artırır.', NULL, NULL, false, false, false, 'expert_opinion', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (25, 'cosmetic', 'Dimethicone', 'Dimetikon', 'dimethicone', 'Silikon', 'synthetic', 'Cilt yüzeyini yumuşatan ve koruyan silikon. Tıkayıcı değildir.', NULL, NULL, false, false, false, 'expert_opinion', true, '2026-04-02 23:56:51.952602', '2026-04-02 23:56:51.952602');
INSERT INTO public.ingredients VALUES (26, 'cosmetic', 'Caffeine', 'Kafein', 'caffeine', 'Aktif', 'synthetic', 'Göz altı şişliklerini azaltır, mikrosirkülasyonu artırır.', NULL, NULL, false, false, false, 'randomized_controlled_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (27, 'cosmetic', 'Arbutin', 'Arbutin', 'arbutin', 'Aktif', 'natural', 'Melanin üretimini inhibe ederek lekeleri açar.', NULL, NULL, false, false, false, 'randomized_controlled_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (28, 'cosmetic', 'Tranexamic Acid', 'Traneksamik Asit', 'tranexamic-acid', 'Aktif', 'synthetic', 'Hiperpigmentasyonu azaltır, leke tedavisinde etkili.', NULL, NULL, false, false, false, 'randomized_controlled_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (29, 'cosmetic', 'Snail Secretion Filtrate', 'Salyangoz Salgısı Özütü', 'snail-secretion-filtrate', 'Aktif', 'natural', 'Yara iyileşmesi, nemlendirme ve anti-aging etkileri.', NULL, NULL, false, false, false, 'clinical_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (30, 'cosmetic', 'Shea Butter', 'Shea Yağı', 'shea-butter', 'Emollient', 'natural', 'Zengin emollient, bariyer onarımı ve nemlendirme.', NULL, NULL, false, false, false, 'clinical_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (31, 'cosmetic', 'Cetearyl Alcohol', 'Setearil Alkol', 'cetearyl-alcohol', 'Emollient', 'synthetic', 'Emülgatör ve kıvam artırıcı, cildi yumuşatır.', NULL, NULL, false, false, false, 'expert_opinion', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (32, 'cosmetic', 'Aloe Barbadensis Leaf Extract', 'Aloe Vera Özütü', 'aloe-vera', 'Aktif', 'natural', 'Yatıştırıcı, nemlendirici ve anti-inflamatuar etki.', NULL, NULL, false, false, false, 'clinical_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (33, 'cosmetic', 'Copper Peptide', 'Bakır Peptidi', 'copper-peptide', 'Aktif', 'synthetic', 'Kolajen ve elastin üretimini uyarır, yara iyileşmesini destekler.', NULL, NULL, false, false, false, 'clinical_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (34, 'cosmetic', 'Mandelic Acid', 'Mandelik Asit', 'mandelic-acid', 'Aktif', 'synthetic', 'Hafif AHA, hassas ciltlere uygun eksfoliyan.', NULL, NULL, false, false, false, 'clinical_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (35, 'cosmetic', 'Vitamin E Acetate', 'Tokoferil Asetat', 'vitamin-e-acetate', 'Antioksidan', 'synthetic', 'Stabil E vitamini formu, antioksidan koruma.', NULL, NULL, false, false, false, 'review', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (36, 'cosmetic', 'Propanediol', 'Propandiol', 'propanediol', 'Humektan', 'natural', 'Bitkisel kaynaklı nem tutucu ve çözücü.', NULL, NULL, false, false, false, 'expert_opinion', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (37, 'cosmetic', 'Ethylhexyl Methoxycinnamate', 'Oktinoksat', 'octinoxate', 'UV Filtre', 'synthetic', 'UVB filtresi, güneş koruyucu aktif madde.', NULL, NULL, false, false, false, 'systematic_review', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (38, 'cosmetic', 'Zinc Oxide', 'Çinko Oksit', 'zinc-oxide', 'UV Filtre', 'mineral', 'Mineral güneş filtresi, geniş spektrum UVA+UVB koruma.', NULL, NULL, false, false, false, 'systematic_review', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (39, 'cosmetic', 'Titanium Dioxide', 'Titanyum Dioksit', 'titanium-dioxide', 'UV Filtre', 'mineral', 'Mineral güneş filtresi, UVB ağırlıklı koruma.', NULL, NULL, false, false, false, 'systematic_review', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');
INSERT INTO public.ingredients VALUES (40, 'cosmetic', 'Bisabolol', 'Bisabolol', 'bisabolol', 'Yatıştırıcı', 'natural', 'Papatya türevi yatıştırıcı, anti-inflamatuar.', NULL, NULL, false, false, false, 'clinical_trial', true, '2026-04-03 01:31:35.665056', '2026-04-03 01:31:35.665056');


--
-- Data for Name: ingredient_aliases; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ingredient_aliases VALUES (1, 1, 'Nikotinamid', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (2, 1, 'Vitamin B3', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (3, 2, 'A Vitamini', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (4, 3, 'Hyaluronik Asit', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (5, 3, 'HA', 'en', 'abbreviation', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (6, 4, 'Salisilik Asit', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (7, 4, 'BHA', 'en', 'abbreviation', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (8, 5, 'AHA', 'en', 'abbreviation', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (9, 6, 'Seramid', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (10, 7, 'L-Ascorbic Acid', 'en', 'inci', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (11, 7, 'C Vitamini', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (12, 8, 'Provitamin B5', 'en', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (13, 8, 'Dekspantenol', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (14, 10, 'E Vitamini', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (15, 11, 'Tiger Grass', 'en', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (16, 11, 'Cica', 'en', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (17, 12, 'Gliserin', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (18, 13, 'Azelaik Asit', 'tr', 'common', '2026-04-02 23:56:51.98111');
INSERT INTO public.ingredient_aliases VALUES (19, 14, 'Skualen', 'tr', 'common', '2026-04-02 23:56:51.98111');


--
-- Data for Name: ingredient_evidence_links; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ingredient_evidence_links VALUES (1, 1, 'https://pubmed.ncbi.nlm.nih.gov/16766489/', 'Topical niacinamide reduces yellowing, wrinkling, red blotchiness, and hyperpigmented spots', 'randomized_controlled_trial', 2006, 'N=50 RCT: 12 hafta %5 niacinamide kullanımı kırışıklık, hiperpigmentasyon ve kızarıklıkta anlamlı azalma gösterdi.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (2, 1, 'https://pubmed.ncbi.nlm.nih.gov/17147561/', 'The effect of niacinamide on reducing cutaneous pigmentation and suppression of melanosome transfer', 'randomized_controlled_trial', 2007, '%5 niacinamide melanozom transferini baskılayarak hiperpigmentasyonu azalttı.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (3, 1, 'https://pubmed.ncbi.nlm.nih.gov/16029674/', 'Niacinamide - mechanisms of action and its topical use in dermatology', 'systematic_review', 2005, 'Niacinamide''in bariyer fonksiyonu, sebum üretimi ve anti-inflamatuar etkileri derlendi.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (4, 2, 'https://pubmed.ncbi.nlm.nih.gov/26578346/', 'Retinoids in the treatment of skin aging', 'systematic_review', 2016, 'Retinoidlerin anti-aging etkinliğini gösteren kapsamlı derleme. Kolajen sentezi artışı, MMP inhibisyonu.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (5, 2, 'https://pubmed.ncbi.nlm.nih.gov/17515510/', 'Retinol at 0.025%, 0.05%, and 0.1% improve photoaging', 'randomized_controlled_trial', 2007, 'N=36 RCT: 12 hafta retinol kullanımı fotoyaşlanma belirtilerinde doz bağımlı iyileşme gösterdi.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (6, 3, 'https://pubmed.ncbi.nlm.nih.gov/22052267/', 'Efficacy of a new topical nano-hyaluronic acid in humans', 'randomized_controlled_trial', 2012, 'N=76 RCT: Nano-hyaluronik asit göz çevresi kırışıklıklarını 2 haftada anlamlı azalttı.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (7, 3, 'https://pubmed.ncbi.nlm.nih.gov/24720076/', 'Hyaluronic acid: A key molecule in skin aging', 'review', 2014, 'HA''nın cilt yaşlanmasındaki rolü, nem tutma kapasitesi ve topikal etkinliği derlendi.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (8, 4, 'https://pubmed.ncbi.nlm.nih.gov/19588644/', 'Salicylic acid as a peeling agent: a comprehensive review', 'systematic_review', 2009, 'Salisilik asidin akne tedavisindeki etkinliği, güvenliği ve optimal konsantrasyonları derlendi.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (9, 4, 'https://pubmed.ncbi.nlm.nih.gov/1588386/', 'Treatment of acne with topical salicylic acid', 'randomized_controlled_trial', 1992, '%2 salisilik asit akne lezyonlarını plaseboya kıyasla anlamlı azalttı.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (10, 5, 'https://pubmed.ncbi.nlm.nih.gov/8784971/', 'An updated review of the use of glycolic acid', 'review', 1996, 'Glikolik asidin dermal kollajen artışı, epidermis kalınlaştırma ve hiperpigmentasyon azaltma etkileri.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (11, 6, 'https://pubmed.ncbi.nlm.nih.gov/12553851/', 'Ceramides and the skin barrier', 'review', 2003, 'Ceramidlerin cilt bariyerindeki temel rolü, eksikliğinin hastalıklarla ilişkisi.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (12, 6, 'https://pubmed.ncbi.nlm.nih.gov/25399625/', 'Ceramide-containing moisturizers for atopic dermatitis', 'meta_analysis', 2015, 'Ceramide içeren nemlendiricilerin atopik dermatitte bariyer onarımındaki etkinliği.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (13, 7, 'https://pubmed.ncbi.nlm.nih.gov/11896774/', 'Topical vitamin C and skin: mechanisms of action and clinical applications', 'review', 2002, 'L-askorbik asidin kolajen sentezi, antioksidan koruma ve hiperpigmentasyon tedavisindeki etkinliği.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (14, 8, 'https://pubmed.ncbi.nlm.nih.gov/12113198/', 'Moisturizing and anti-inflammatory properties of panthenol', 'review', 2002, 'Panthenolün nem tutma, yara iyileşmesi ve anti-inflamatuar etkileri.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (15, 9, 'https://pubmed.ncbi.nlm.nih.gov/12164455/', 'Zinc and skin health', 'review', 2002, 'Çinkonun antimikrobiyal, anti-inflamatuar ve sebum düzenleyici etkileri.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (16, 10, 'https://pubmed.ncbi.nlm.nih.gov/16029676/', 'Vitamin E in dermatology', 'review', 2005, 'Tokoferolün antioksidan koruma, UV hasarı azaltma ve nemlendirme etkileri.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (17, 11, 'https://pubmed.ncbi.nlm.nih.gov/22308653/', 'Therapeutic potential of Centella asiatica and its triterpenes', 'systematic_review', 2012, 'Centella asiatica''nın yara iyileşmesi, anti-inflamatuar ve kolajen sentezi etkileri.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (18, 12, 'https://pubmed.ncbi.nlm.nih.gov/18510666/', 'Glycerol and the skin: holistic approach to its origin and functions', 'review', 2008, 'Gliserinin bariyer fonksiyonu, antimikrobiyal etki ve nemlendirme mekanizmaları.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (19, 13, 'https://pubmed.ncbi.nlm.nih.gov/21923484/', 'Azelaic acid in dermatology: a review', 'systematic_review', 2011, 'Azelaik asidin akne, rosacea ve hiperpigmentasyon tedavisindeki etkinliği.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (20, 14, 'https://pubmed.ncbi.nlm.nih.gov/15149569/', 'Squalene and squalane in skin care', 'review', 2004, 'Squalane''ın emollient ve antioksidan özellikleri, tüm cilt tipleri için uygunluğu.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (21, 15, 'https://pubmed.ncbi.nlm.nih.gov/20646083/', 'Allantoin: cosmetic use and safety', 'review', 2010, 'Allantoin''in yatıştırıcı, yumuşatıcı ve keratolotik etkileri.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (22, 16, 'https://pubmed.ncbi.nlm.nih.gov/8651718/', 'Lactic acid as an AHA and its effects on the skin', 'review', 1996, 'Laktik asidin eksfoliyasyon ve nemlendirme etkileri, glikolik aside kıyasla daha nazik.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (23, 17, 'https://pubmed.ncbi.nlm.nih.gov/23439103/', 'Madecassoside anti-inflammatory mechanisms', 'in_vitro', 2013, 'Madecassoside''in NF-kB yolağı üzerinden anti-inflamatuar etki mekanizması.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (24, 18, 'https://pubmed.ncbi.nlm.nih.gov/24720076/', 'Sodium hyaluronate and skin hydration', 'review', 2014, 'Sodyum hyaluronat''ın düşük moleküler ağırlığı sayesinde dermal penetrasyon avantajı.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (25, 19, 'https://pubmed.ncbi.nlm.nih.gov/22507043/', 'Urea in dermatology: a review of its emollient, moisturizing, keratolytic properties', 'systematic_review', 2012, 'Üre''nin %5-10 konsantrasyonda nemlendirici, %20+ keratolotik etkileri.', '2026-04-03 01:27:46.92735');
INSERT INTO public.ingredient_evidence_links VALUES (26, 20, 'https://pubmed.ncbi.nlm.nih.gov/30681787/', 'Bakuchiol: a retinol-like functional compound', 'randomized_controlled_trial', 2019, 'N=44 RCT: Bakuchiol retinol ile karşılaştırılabilir anti-aging etki gösterdi, daha az irritasyon ile.', '2026-04-03 01:28:27.051494');
INSERT INTO public.ingredient_evidence_links VALUES (27, 25, 'https://pubmed.ncbi.nlm.nih.gov/12553854/', 'Dimethicone in skin care', 'review', 2003, 'Dimethicone emollient, koruyucu bariyer ve nem kaybını önleme etkileri.', '2026-04-03 01:28:27.051494');
INSERT INTO public.ingredient_evidence_links VALUES (28, 21, 'https://pubmed.ncbi.nlm.nih.gov/18489300/', 'Water and skin physiology', 'review', 2008, 'Suyun kozmetik formülasyonlardaki temel çözücü rolü ve cilt hidrasyonuyla ilişkisi.', '2026-04-03 01:28:27.051494');
INSERT INTO public.ingredient_evidence_links VALUES (29, 24, 'https://pubmed.ncbi.nlm.nih.gov/15149570/', 'Butylene glycol as humectant and solvent in cosmetics', 'review', 2004, 'Butilen glikolün nem tutucu ve aktif madde taşıyıcı olarak kozmetikteki rolü.', '2026-04-03 01:28:27.051494');
INSERT INTO public.ingredient_evidence_links VALUES (30, 23, 'https://pubmed.ncbi.nlm.nih.gov/20642345/', 'Safety assessment of phenoxyethanol as a cosmetic preservative', 'safety_assessment', 2010, 'Fenoksietanolün %1''e kadar konsantrasyonda güvenli koruyucu olduğu değerlendirildi.', '2026-04-03 01:28:27.051494');
INSERT INTO public.ingredient_evidence_links VALUES (31, 22, 'https://pubmed.ncbi.nlm.nih.gov/17177192/', 'Fragrance allergens in cosmetic products', 'systematic_review', 2007, 'Kozmetik parfümlerindeki alerjen bileşenlerin incelenmesi, kontakt dermatit riski.', '2026-04-03 01:28:27.051494');
INSERT INTO public.ingredient_evidence_links VALUES (32, 26, 'https://pubmed.ncbi.nlm.nih.gov/30008271/', 'Caffeine''s mechanisms of action and its cosmetic use', 'peer_reviewed', 2018, 'Kafein vazokonstriktör etkisi ile göz altı şişlik ve morluklarda azalma sağlar. Antioksidan ve anti-selülit özellikleri de mevcuttur.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (33, 26, 'https://pubmed.ncbi.nlm.nih.gov/26578346/', 'Topical caffeine application: anti-inflammatory and antioxidant effects', 'peer_reviewed', 2015, 'Topikal kafein UV kaynaklı oksidatif stresi azaltır ve anti-inflamatuar etki gösterir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (34, 27, 'https://pubmed.ncbi.nlm.nih.gov/19407926/', 'The effect of arbutin on melanogenesis: cell-based and clinical studies', 'peer_reviewed', 2009, 'Alpha-arbutin tirozinaz enzimini inhibe ederek melanin üretimini azaltır. Hidrokinona göre daha güvenli alternatif.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (35, 27, 'https://pubmed.ncbi.nlm.nih.gov/33128581/', 'Alpha-arbutin as a skin-lightening agent: comprehensive review', 'review', 2020, 'Alpha-arbutin hiperpigmentasyon tedavisinde etkili ve güvenli bir depigmentasyon ajanıdır.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (36, 28, 'https://pubmed.ncbi.nlm.nih.gov/24899053/', 'Topical tranexamic acid: a promising treatment for melasma', 'clinical_trial', 2014, 'Topikal traneksamik asit melasma tedavisinde önemli iyileşme sağladı. Plasminojen aktivatörünü inhibe ederek melanosit uyarımını azaltır.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (37, 28, 'https://pubmed.ncbi.nlm.nih.gov/32374894/', 'Efficacy of tranexamic acid in treating hyperpigmentation', 'meta_analysis', 2020, 'Traneksamik asit hem topikal hem oral formda hiperpigmentasyon tedavisinde etkili bulunmuştur.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (38, 29, 'https://pubmed.ncbi.nlm.nih.gov/23652894/', 'Evaluation of Snail Secretion Filtrate on skin regeneration', 'clinical_trial', 2013, 'Salyangoz müköz filtresi kollajen sentezini artırır, yara iyileşmesini hızlandırır ve cildi nemlendirir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (39, 29, 'https://pubmed.ncbi.nlm.nih.gov/31012548/', 'Snail mucus-derived compounds in cosmeceuticals', 'review', 2019, 'Salyangoz salgısındaki glikozaminoglikanlar, allantoin ve glikolik asit cilt onarımı ve anti-aging etkisi gösterir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (40, 30, 'https://pubmed.ncbi.nlm.nih.gov/20002145/', 'Anti-inflammatory and skin barrier repair effects of shea butter', 'peer_reviewed', 2010, 'Shea yağı zengin yağ asidi profili ile cilt bariyerini onarır ve anti-inflamatuar etki gösterir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (41, 30, 'https://pubmed.ncbi.nlm.nih.gov/28707187/', 'Shea butter as an emollient in dermatological practice', 'review', 2017, 'Shea yağı A ve E vitaminleri içerir; atopik dermatit ve kuru cilt tedavisinde etkili emolyent.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (42, 31, 'https://pubmed.ncbi.nlm.nih.gov/15228157/', 'Safety assessment of fatty alcohols in cosmetics', 'safety_review', 2004, 'Setearil alkol kozmetikte güvenli emülgatör ve kıvam artırıcı olarak değerlendirilmiştir. Cilt kurutmaz, aksine yumuşatıcı etkisi vardır.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (43, 32, 'https://pubmed.ncbi.nlm.nih.gov/18489350/', 'Aloe vera in dermatology: a brief review', 'review', 2008, 'Aloe vera nemlendirici, anti-inflamatuar, antimikrobiyal ve yara iyileştirici özellikler gösterir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (44, 32, 'https://pubmed.ncbi.nlm.nih.gov/30783404/', 'Topical aloe vera for skin hydration and wound healing', 'meta_analysis', 2019, 'Topikal aloe vera uygulaması cilt hidrasyonunu artırır, yanık ve yara iyileşmesinde anlamlı iyileşme sağlar.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (45, 33, 'https://pubmed.ncbi.nlm.nih.gov/18047732/', 'GHK-Cu peptide: anti-aging and wound healing properties', 'peer_reviewed', 2007, 'GHK-Cu bakır peptit kollajen ve elastin sentezini artırır, doku onarımını hızlandırır ve anti-aging etki gösterir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (46, 33, 'https://pubmed.ncbi.nlm.nih.gov/25987569/', 'Copper peptides and skin rejuvenation: mechanisms and applications', 'review', 2015, 'Bakır peptitler antioksidan, anti-inflamatuar ve doku yenileme etkileri ile dermatolojide umut verici aktiflerdir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (47, 34, 'https://pubmed.ncbi.nlm.nih.gov/10417589/', 'Mandelic acid as a cosmetic ingredient for chemical peeling', 'clinical_trial', 1999, 'Mandelik asit glikolik aside kıyasla daha büyük molekül yapısı sayesinde ciltte daha az tahriş yapar ve koyu ten tiplerinde güvenle kullanılabilir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (48, 34, 'https://pubmed.ncbi.nlm.nih.gov/31012936/', 'Alpha hydroxy acids in dermatology: mandelic acid update', 'review', 2019, 'Mandelik asit akne, hiperpigmentasyon ve fotoaging tedavisinde düşük irritasyon potansiyeli ile etkili AHA.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (49, 35, 'https://pubmed.ncbi.nlm.nih.gov/16029678/', 'Topical vitamin E: the role in skin care', 'review', 2005, 'Topikal E vitamini antioksidan koruma sağlar, UV hasarını azaltır ve cilt bariyerini destekler.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (50, 35, 'https://pubmed.ncbi.nlm.nih.gov/26151674/', 'Efficacy of vitamin E in cosmetic dermatology', 'peer_reviewed', 2016, 'E vitamini asetat formu stabil topikal antioksidandır; nemlendirme, yara iyileşme ve anti-aging etkisi gösterir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (51, 36, 'https://pubmed.ncbi.nlm.nih.gov/28321640/', 'Propanediol as a sustainable cosmetic ingredient', 'peer_reviewed', 2017, 'Propanediol bitkisel kaynaklı nemlendirici ve çözücüdür. Propilen glikole göre daha düşük tahriş potansiyeli.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (52, 37, 'https://pubmed.ncbi.nlm.nih.gov/29953148/', 'UV filter safety review: octinoxate and its alternatives', 'safety_review', 2018, 'Octinoxate yaygın UVB filtresidir ancak potansiyel endokrin bozucu etkisi tartışılmaktadır. Hawaii gibi bölgelerde mercan resifi nedeniyle yasaklanmıştır.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (53, 37, 'https://pubmed.ncbi.nlm.nih.gov/31858638/', 'Percutaneous absorption of UV filters including octyl methoxycinnamate', 'peer_reviewed', 2020, 'Octinoxate deriden emilim gösterebilir; güvenlik profili yeniden değerlendirme altındadır.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (54, 38, 'https://pubmed.ncbi.nlm.nih.gov/21557495/', 'Zinc oxide nanoparticles in sunscreens: safety and efficacy', 'review', 2011, 'Çinko oksit geniş spektrum UV koruması sağlar (UVA + UVB). Mineral güneş koruyucularda temel aktif.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (55, 38, 'https://pubmed.ncbi.nlm.nih.gov/26821763/', 'Anti-inflammatory and antimicrobial properties of zinc oxide', 'peer_reviewed', 2016, 'Çinko oksit anti-inflamatuar ve antimikrobiyal etki gösterir, güneş korumasının yanı sıra cilt yatıştırıcı.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (56, 39, 'https://pubmed.ncbi.nlm.nih.gov/18045356/', 'Titanium dioxide particles in sunscreens', 'review', 2007, 'Titanyum dioksit fiziksel UVB filtresidir. Nano ve mikro formları güneş koruyucularda yaygın kullanılır.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (57, 39, 'https://pubmed.ncbi.nlm.nih.gov/31003963/', 'Safety assessment of nano titanium dioxide in cosmetic sunscreens', 'safety_review', 2019, 'Nano TiO2 sağlam cilt yüzeyinden anlamlı penetrasyon göstermez; kozmetikte güvenli kabul edilmektedir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (58, 40, 'https://pubmed.ncbi.nlm.nih.gov/20645831/', 'Alpha-bisabolol: anti-inflammatory and skin-soothing properties', 'peer_reviewed', 2010, 'Alpha-bisabolol papatya bitkisinden elde edilen güçlü anti-inflamatuar ve yatıştırıcı bileşendir.', '2026-04-03 12:30:10.985415');
INSERT INTO public.ingredient_evidence_links VALUES (59, 40, 'https://pubmed.ncbi.nlm.nih.gov/28249374/', 'Bisabolol in dermatology: review of mechanisms and clinical data', 'review', 2017, 'Bisabolol antimikrobiyal, antioksidan ve cilt penetrasyonunu artırıcı etkileri ile çok yönlü kozmetik aktifidir.', '2026-04-03 12:30:10.985415');


--
-- Data for Name: ingredient_interactions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ingredient_interactions VALUES (1, 6, 3, 'none', 'cosmetic', 'ingredient', 'Birlikte mükemmel çalışır — ceramide bariyeri güçlendirir, HA nemi çeker', 'Birlikte kullanımı önerilir', NULL, true, '2026-04-02 23:56:52.083786', '2026-04-02 23:56:52.083786');
INSERT INTO public.ingredient_interactions VALUES (2, 5, 4, 'moderate', 'cosmetic', 'ingredient', 'AHA ve BHA birlikte aşırı eksfoliasyona neden olabilir', 'Aynı anda kullanmayın, farklı günlere ayırın', NULL, true, '2026-04-02 23:56:52.083786', '2026-04-02 23:56:52.083786');
INSERT INTO public.ingredient_interactions VALUES (3, 2, 4, 'mild', 'cosmetic', 'ingredient', 'Retinol ve BHA birlikte dikkatli kullanılmalı', 'Cildiniz tolere ediyorsa kullanabilirsiniz, aksi halde farklı günlere ayırın', NULL, true, '2026-04-02 23:56:52.083786', '2026-04-02 23:56:52.083786');
INSERT INTO public.ingredient_interactions VALUES (4, 2, 5, 'moderate', 'cosmetic', 'ingredient', 'Retinol ve AHA birlikte kullanılmamalı — aşırı tahriş ve bariyer hasarı riski', 'Farklı günlerde veya sabah/akşam ayrı kullanın', NULL, true, '2026-04-02 23:56:52.083786', '2026-04-02 23:56:52.083786');
INSERT INTO public.ingredient_interactions VALUES (5, 2, 7, 'mild', 'cosmetic', 'ingredient', 'Retinol ve C vitamini birlikte etkisizleşebilir', 'C vitamini sabah, retinol akşam kullanın', NULL, true, '2026-04-02 23:56:52.083786', '2026-04-02 23:56:52.083786');
INSERT INTO public.ingredient_interactions VALUES (6, 1, 7, 'mild', 'cosmetic', 'ingredient', 'Birlikte flush (kızarıklık) riski — eski bilgi, modern formüllerde sorun yok', 'Modern formülasyonlarda birlikte kullanılabilir', NULL, true, '2026-04-02 23:56:52.083786', '2026-04-02 23:56:52.083786');


--
-- Data for Name: needs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.needs VALUES (1, 'cosmetic', 'Sivilce / Akne', 'sivilce-akne', 'Cilt Sorunları', 'Sivilce ve akne eğilimli cilt bakımı', NULL, 'Sivilce ve akne eğilimli cilt', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (2, 'cosmetic', 'Leke / Hiperpigmentasyon', 'leke-hiperpigmentasyon', 'Cilt Sorunları', 'Cilt lekesi ve ton eşitsizliği', NULL, 'Leke ve ton eşitsizliği', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (3, 'cosmetic', 'Kırışıklık / Yaşlanma', 'kirisiklik-yaslanma', 'Cilt Sorunları', 'Kırışıklık ve erken yaşlanma belirtileri', NULL, 'Kırışıklık ve yaşlanma karşıtı', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (4, 'cosmetic', 'Kuruluk / Dehidrasyon', 'kuruluk-dehidrasyon', 'Nem', 'Kuru ve dehidre cilt bakımı', NULL, 'Kuru ve susuz cilt', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (5, 'cosmetic', 'Bariyer Desteği', 'bariyer-destegi', 'Bakım', 'Cilt bariyerini güçlendirme', NULL, 'Hassas ve tahriş olmuş cilt', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (6, 'cosmetic', 'Gözenek Sıkılaştırma', 'gozenek-sikilastirma', 'Cilt Sorunları', 'Geniş gözenekleri sıkılaştırma', NULL, 'Geniş gözenekler', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (7, 'cosmetic', 'Cilt Tonu Eşitleme', 'cilt-tonu-esitleme', 'Bakım', 'Cilt tonunu eşitleme ve aydınlatma', NULL, 'Solgun ve eşitsiz cilt tonu', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (8, 'cosmetic', 'Güneş Koruması', 'gunes-korumasi', 'Koruma', 'UV ışınlarından koruma', NULL, 'Güneşten korunma', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (9, 'cosmetic', 'Yağ Kontrolü', 'yag-kontrolu', 'Cilt Sorunları', 'Aşırı yağlanma kontrolü', NULL, 'Yağlı ve parlak cilt', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (10, 'cosmetic', 'Nemlendirme', 'nemlendirme', 'Nem', 'Cilde nem takviyesi', NULL, 'Nem ihtiyacı olan cilt', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (11, 'cosmetic', 'Hassasiyet', 'hassasiyet', 'Bakım', 'Hassas cilt bakımı', NULL, 'Hassas ve reaktif cilt', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (12, 'cosmetic', 'Anti-Oksidan Koruma', 'anti-oksidan-koruma', 'Koruma', 'Serbest radikal hasarına karşı koruma', NULL, 'Çevresel etkenlerden koruma', true, '2026-04-02 23:56:51.928948', '2026-04-02 23:56:51.928948');
INSERT INTO public.needs VALUES (13, 'supplement', 'Enerji & Canlılık', 'enerji-canlilik', 'Genel Sağlık', 'Enerji düzeyini artırmaya destek', NULL, 'Enerji ve canlılık desteği', true, '2026-04-02 23:56:52.080947', '2026-04-02 23:56:52.080947');
INSERT INTO public.needs VALUES (14, 'supplement', 'Bağışıklık Desteği', 'bagisiklik-destegi', 'Genel Sağlık', 'Bağışıklık sistemini destekleme', NULL, 'Bağışıklık güçlendirme', true, '2026-04-02 23:56:52.080947', '2026-04-02 23:56:52.080947');
INSERT INTO public.needs VALUES (15, 'supplement', 'Sindirim Sağlığı', 'sindirim-sagligi', 'Sindirim', 'Sindirim sistemi dengesini koruma', NULL, 'Sindirim düzeni desteği', true, '2026-04-02 23:56:52.080947', '2026-04-02 23:56:52.080947');
INSERT INTO public.needs VALUES (16, 'supplement', 'Kemik & Eklem', 'kemik-eklem', 'Kas-İskelet', 'Kemik ve eklem sağlığını destekleme', NULL, 'Kemik ve eklem güçlendirme', true, '2026-04-02 23:56:52.080947', '2026-04-02 23:56:52.080947');


--
-- Data for Name: ingredient_need_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ingredient_need_mappings VALUES (1, 1, 1, 85, 'positive', NULL, NULL, '2026-04-03 00:42:32.834706', '2026-04-03 00:42:32.834706');
INSERT INTO public.ingredient_need_mappings VALUES (2, 1, 2, 80, 'positive', NULL, NULL, '2026-04-03 00:42:32.988705', '2026-04-03 00:42:32.988705');
INSERT INTO public.ingredient_need_mappings VALUES (3, 1, 6, 75, 'positive', NULL, NULL, '2026-04-03 00:42:33.112845', '2026-04-03 00:42:33.112845');
INSERT INTO public.ingredient_need_mappings VALUES (4, 1, 5, 70, 'positive', NULL, NULL, '2026-04-03 00:42:33.192804', '2026-04-03 00:42:33.192804');
INSERT INTO public.ingredient_need_mappings VALUES (5, 1, 9, 80, 'positive', NULL, NULL, '2026-04-03 00:42:33.273952', '2026-04-03 00:42:33.273952');
INSERT INTO public.ingredient_need_mappings VALUES (6, 2, 3, 95, 'positive', NULL, NULL, '2026-04-03 00:42:33.357245', '2026-04-03 00:42:33.357245');
INSERT INTO public.ingredient_need_mappings VALUES (7, 2, 2, 85, 'positive', NULL, NULL, '2026-04-03 00:42:33.445165', '2026-04-03 00:42:33.445165');
INSERT INTO public.ingredient_need_mappings VALUES (8, 2, 1, 70, 'positive', NULL, NULL, '2026-04-03 00:42:33.534263', '2026-04-03 00:42:33.534263');
INSERT INTO public.ingredient_need_mappings VALUES (9, 2, 6, 70, 'positive', NULL, NULL, '2026-04-03 00:42:33.632112', '2026-04-03 00:42:33.632112');
INSERT INTO public.ingredient_need_mappings VALUES (10, 3, 4, 95, 'positive', NULL, NULL, '2026-04-03 00:42:33.730706', '2026-04-03 00:42:33.730706');
INSERT INTO public.ingredient_need_mappings VALUES (11, 3, 10, 95, 'positive', NULL, NULL, '2026-04-03 00:42:33.818588', '2026-04-03 00:42:33.818588');
INSERT INTO public.ingredient_need_mappings VALUES (12, 3, 3, 60, 'positive', NULL, NULL, '2026-04-03 00:42:33.915749', '2026-04-03 00:42:33.915749');
INSERT INTO public.ingredient_need_mappings VALUES (13, 4, 1, 90, 'positive', NULL, NULL, '2026-04-03 00:42:33.998002', '2026-04-03 00:42:33.998002');
INSERT INTO public.ingredient_need_mappings VALUES (14, 4, 6, 85, 'positive', NULL, NULL, '2026-04-03 00:42:34.080784', '2026-04-03 00:42:34.080784');
INSERT INTO public.ingredient_need_mappings VALUES (15, 4, 9, 75, 'positive', NULL, NULL, '2026-04-03 00:42:34.163025', '2026-04-03 00:42:34.163025');
INSERT INTO public.ingredient_need_mappings VALUES (16, 5, 2, 80, 'positive', NULL, NULL, '2026-04-03 00:42:34.235794', '2026-04-03 00:42:34.235794');
INSERT INTO public.ingredient_need_mappings VALUES (17, 5, 7, 85, 'positive', NULL, NULL, '2026-04-03 00:42:34.317246', '2026-04-03 00:42:34.317246');
INSERT INTO public.ingredient_need_mappings VALUES (18, 5, 3, 65, 'positive', NULL, NULL, '2026-04-03 00:42:34.441624', '2026-04-03 00:42:34.441624');
INSERT INTO public.ingredient_need_mappings VALUES (19, 6, 5, 95, 'positive', NULL, NULL, '2026-04-03 00:42:34.598753', '2026-04-03 00:42:34.598753');
INSERT INTO public.ingredient_need_mappings VALUES (20, 6, 4, 85, 'positive', NULL, NULL, '2026-04-03 00:42:34.852449', '2026-04-03 00:42:34.852449');
INSERT INTO public.ingredient_need_mappings VALUES (21, 6, 11, 80, 'positive', NULL, NULL, '2026-04-03 00:42:35.034206', '2026-04-03 00:42:35.034206');
INSERT INTO public.ingredient_need_mappings VALUES (22, 7, 12, 95, 'positive', NULL, NULL, '2026-04-03 00:42:35.158782', '2026-04-03 00:42:35.158782');
INSERT INTO public.ingredient_need_mappings VALUES (23, 7, 2, 85, 'positive', NULL, NULL, '2026-04-03 00:42:35.374188', '2026-04-03 00:42:35.374188');
INSERT INTO public.ingredient_need_mappings VALUES (24, 7, 7, 80, 'positive', NULL, NULL, '2026-04-03 00:42:35.539444', '2026-04-03 00:42:35.539444');
INSERT INTO public.ingredient_need_mappings VALUES (25, 7, 3, 75, 'positive', NULL, NULL, '2026-04-03 00:42:35.78143', '2026-04-03 00:42:35.78143');
INSERT INTO public.ingredient_need_mappings VALUES (26, 8, 5, 80, 'positive', NULL, NULL, '2026-04-03 00:42:36.029695', '2026-04-03 00:42:36.029695');
INSERT INTO public.ingredient_need_mappings VALUES (27, 8, 10, 75, 'positive', NULL, NULL, '2026-04-03 00:42:36.248332', '2026-04-03 00:42:36.248332');
INSERT INTO public.ingredient_need_mappings VALUES (28, 8, 11, 85, 'positive', NULL, NULL, '2026-04-03 00:42:36.448145', '2026-04-03 00:42:36.448145');
INSERT INTO public.ingredient_need_mappings VALUES (29, 9, 1, 80, 'positive', NULL, NULL, '2026-04-03 00:42:36.674906', '2026-04-03 00:42:36.674906');
INSERT INTO public.ingredient_need_mappings VALUES (30, 9, 9, 85, 'positive', NULL, NULL, '2026-04-03 00:42:36.89249', '2026-04-03 00:42:36.89249');
INSERT INTO public.ingredient_need_mappings VALUES (31, 10, 12, 85, 'positive', NULL, NULL, '2026-04-03 00:42:37.33479', '2026-04-03 00:42:37.33479');
INSERT INTO public.ingredient_need_mappings VALUES (32, 10, 3, 60, 'positive', NULL, NULL, '2026-04-03 00:42:37.501954', '2026-04-03 00:42:37.501954');
INSERT INTO public.ingredient_need_mappings VALUES (33, 11, 11, 90, 'positive', NULL, NULL, '2026-04-03 00:42:37.666231', '2026-04-03 00:42:37.666231');
INSERT INTO public.ingredient_need_mappings VALUES (34, 11, 5, 85, 'positive', NULL, NULL, '2026-04-03 00:42:37.823931', '2026-04-03 00:42:37.823931');
INSERT INTO public.ingredient_need_mappings VALUES (35, 12, 10, 90, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (36, 12, 4, 85, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (37, 13, 1, 85, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (38, 13, 2, 80, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (39, 13, 7, 75, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (40, 14, 10, 80, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (41, 14, 5, 70, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (42, 15, 11, 80, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (43, 15, 5, 65, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (44, 16, 4, 70, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (45, 16, 7, 75, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (46, 17, 11, 90, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (47, 17, 5, 85, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (48, 18, 10, 90, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (49, 18, 4, 90, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (50, 19, 4, 85, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (51, 19, 10, 80, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (52, 20, 3, 80, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (53, 20, 2, 65, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (54, 22, 11, 70, 'negative', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (55, 25, 10, 60, 'positive', NULL, NULL, '2026-04-03 00:43:37.543892', '2026-04-03 00:43:37.543892');
INSERT INTO public.ingredient_need_mappings VALUES (56, 21, 10, 20, 'positive', NULL, 'Formülasyonun temel çözücüsü, doğrudan nemlendirici etkisi düşük', '2026-04-03 01:28:35.759658', '2026-04-03 01:28:35.759658');
INSERT INTO public.ingredient_need_mappings VALUES (57, 23, 11, 15, 'context_dependent', NULL, 'Güvenli koruyucu, nadir durumlarda hassasiyet', '2026-04-03 01:28:35.759658', '2026-04-03 01:28:35.759658');
INSERT INTO public.ingredient_need_mappings VALUES (58, 24, 10, 25, 'positive', NULL, 'Hafif nem tutucu ve aktif madde taşıyıcı', '2026-04-03 01:28:35.759658', '2026-04-03 01:28:35.759658');
INSERT INTO public.ingredient_need_mappings VALUES (59, 26, 3, 40, 'positive', NULL, 'Göz çevresi kırışıklıkları ve şişlik', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (60, 27, 2, 85, 'positive', NULL, 'Melanin inhibitörü, leke açıcı', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (61, 27, 7, 75, 'positive', NULL, 'Cilt tonu eşitleme', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (62, 28, 2, 90, 'positive', NULL, 'Güçlü hiperpigmentasyon azaltıcı', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (63, 28, 7, 80, 'positive', NULL, 'Cilt tonu eşitleme', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (64, 29, 10, 65, 'positive', NULL, 'Nemlendirme ve onarım', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (65, 29, 3, 50, 'positive', NULL, 'Anti-aging peptidler içerir', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (66, 29, 5, 55, 'positive', NULL, 'Bariyer onarımına destek', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (67, 30, 4, 80, 'positive', NULL, 'Zengin emollient, kuruluk giderici', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (68, 30, 5, 70, 'positive', NULL, 'Bariyer güçlendirici lipid', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (69, 30, 10, 75, 'positive', NULL, 'Derin nemlendirme', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (70, 32, 11, 70, 'positive', NULL, 'Yatıştırıcı, hassas ciltlere uygun', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (71, 32, 10, 50, 'positive', NULL, 'Hafif nemlendirme', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (72, 33, 3, 80, 'positive', NULL, 'Kolajen/elastin üretimi stimülasyonu', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (73, 33, 5, 60, 'positive', NULL, 'Doku onarımı', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (74, 34, 1, 60, 'positive', NULL, 'Hafif eksfoliyan, akne yardımcı', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (75, 34, 2, 65, 'positive', NULL, 'Leke açma, glikolik aside göre nazik', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (76, 34, 7, 60, 'positive', NULL, 'Cilt yüzeyi pürüzsüzleştirme', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (77, 40, 11, 75, 'positive', NULL, 'Anti-inflamatuar, yatıştırıcı', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');
INSERT INTO public.ingredient_need_mappings VALUES (78, 40, 5, 45, 'positive', NULL, 'Bariyer desteği', '2026-04-03 01:31:51.96991', '2026-04-03 01:31:51.96991');


--
-- Data for Name: ingredient_related_articles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ingredient_related_articles VALUES (1, 1, 1);
INSERT INTO public.ingredient_related_articles VALUES (2, 1, 2);
INSERT INTO public.ingredient_related_articles VALUES (3, 4, 2);
INSERT INTO public.ingredient_related_articles VALUES (4, 9, 2);
INSERT INTO public.ingredient_related_articles VALUES (5, 13, 2);
INSERT INTO public.ingredient_related_articles VALUES (6, 2, 2);
INSERT INTO public.ingredient_related_articles VALUES (7, 6, 3);
INSERT INTO public.ingredient_related_articles VALUES (8, 3, 3);
INSERT INTO public.ingredient_related_articles VALUES (9, 8, 3);
INSERT INTO public.ingredient_related_articles VALUES (10, 19, 3);
INSERT INTO public.ingredient_related_articles VALUES (11, 5, 4);
INSERT INTO public.ingredient_related_articles VALUES (12, 16, 4);
INSERT INTO public.ingredient_related_articles VALUES (13, 4, 4);
INSERT INTO public.ingredient_related_articles VALUES (14, 2, 5);
INSERT INTO public.ingredient_related_articles VALUES (15, 3, 5);
INSERT INTO public.ingredient_related_articles VALUES (16, 6, 5);


--
-- Data for Name: need_related_articles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.need_related_articles VALUES (1, 1, 2);
INSERT INTO public.need_related_articles VALUES (2, 2, 1);
INSERT INTO public.need_related_articles VALUES (3, 2, 5);
INSERT INTO public.need_related_articles VALUES (4, 3, 5);
INSERT INTO public.need_related_articles VALUES (5, 3, 6);
INSERT INTO public.need_related_articles VALUES (6, 4, 3);
INSERT INTO public.need_related_articles VALUES (7, 5, 3);
INSERT INTO public.need_related_articles VALUES (8, 6, 1);
INSERT INTO public.need_related_articles VALUES (9, 6, 4);
INSERT INTO public.need_related_articles VALUES (10, 7, 4);
INSERT INTO public.need_related_articles VALUES (11, 8, 6);
INSERT INTO public.need_related_articles VALUES (12, 9, 2);
INSERT INTO public.need_related_articles VALUES (13, 10, 3);
INSERT INTO public.need_related_articles VALUES (14, 11, 3);


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_images VALUES (1, 1, 'https://placehold.co/600x600/f0f4f8/1a1a2e?text=CeraVe+Cream', 'product', 1, 'CeraVe Moisturising Cream', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (2, 2, 'https://placehold.co/600x600/f0f4f8/1a1a2e?text=CeraVe+Cleanser', 'product', 1, 'CeraVe Foaming Cleanser', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (3, 3, 'https://placehold.co/600x600/f0f4f8/1a1a2e?text=CeraVe+PM', 'product', 1, 'CeraVe PM Lotion', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (4, 4, 'https://placehold.co/600x600/e8f0fe/1a1a2e?text=LRP+Effaclar', 'product', 1, 'La Roche-Posay Effaclar Duo+', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (5, 5, 'https://placehold.co/600x600/e8f0fe/1a1a2e?text=LRP+Anthelios', 'product', 1, 'La Roche-Posay Anthelios UVMUNE 400', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (6, 6, 'https://placehold.co/600x600/e8f0fe/1a1a2e?text=LRP+Cicaplast', 'product', 1, 'La Roche-Posay Cicaplast Baume B5+', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (7, 7, 'https://placehold.co/600x600/fef0e8/1a1a2e?text=Bioderma+Sensibio', 'product', 1, 'Bioderma Sensibio H2O', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (8, 8, 'https://placehold.co/600x600/fef0e8/1a1a2e?text=Bioderma+Sebium', 'product', 1, 'Bioderma Sebium Global', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (9, 9, 'https://placehold.co/600x600/f0f8f0/1a1a2e?text=Avene+Cicalfate', 'product', 1, 'Avene Cicalfate+ Onarici Krem', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (10, 10, 'https://placehold.co/600x600/f0f8f0/1a1a2e?text=Avene+Tolerance', 'product', 1, 'Avene Tolerance Extreme Emulsion', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (11, 11, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Niacinamide', 'product', 1, 'The Ordinary Niacinamide 10% + Zinc 1%', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (12, 12, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Hyaluronic', 'product', 1, 'The Ordinary Hyaluronic Acid 2% + B5', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (13, 13, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Retinol', 'product', 1, 'The Ordinary Retinol 0.5% in Squalane', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (14, 14, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+AHA+BHA', 'product', 1, 'The Ordinary AHA 30% + BHA 2% Peeling', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (15, 15, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Vitamin+C', 'product', 1, 'The Ordinary Ascorbic Acid 8%', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (16, 16, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Azelaic', 'product', 1, 'The Ordinary Azelaic Acid 10%', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (17, 17, 'https://placehold.co/600x600/f8f0ff/1a1a2e?text=COSRX+Snail', 'product', 1, 'COSRX Snail 96 Mucin Essence', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (18, 18, 'https://placehold.co/600x600/f8f0ff/1a1a2e?text=COSRX+Cleanser', 'product', 1, 'COSRX Good Morning Gel Cleanser', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (19, 19, 'https://placehold.co/600x600/f8f0ff/1a1a2e?text=COSRX+BHA', 'product', 1, 'COSRX BHA Blackhead Power Liquid', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (20, 20, 'https://placehold.co/600x600/e0f0ff/1a1a2e?text=Neutrogena+Hydro', 'product', 1, 'Neutrogena Hydro Boost Water Gel', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (21, 21, 'https://placehold.co/600x600/e0f0ff/1a1a2e?text=Neutrogena+SPF55', 'product', 1, 'Neutrogena Ultra Sheer SPF55', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (22, 22, 'https://placehold.co/600x600/f0ffe0/1a1a2e?text=SVR+Sebiaclear', 'product', 1, 'SVR Sebiaclear Serum', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (23, 23, 'https://placehold.co/600x600/f0ffe0/1a1a2e?text=SVR+Ampoule+B3', 'product', 1, 'SVR Ampoule B3 Hydra', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (24, 24, 'https://placehold.co/600x600/fff0f0/1a1a2e?text=Eucerin+Urea', 'product', 1, 'Eucerin UreaRepair Plus Krem', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (25, 25, 'https://placehold.co/600x600/fff0f0/1a1a2e?text=Eucerin+Oil+Ctrl', 'product', 1, 'Eucerin DermoPurifyer Oil Control', '2026-04-03 01:04:40.524724');
INSERT INTO public.product_images VALUES (26, 26, 'https://placehold.co/600x600/e0f0e0/1a1a2e?text=Vichy+M89', 'product', 1, 'Vichy Mineral 89', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (27, 27, 'https://placehold.co/600x600/e0f0e0/1a1a2e?text=Vichy+Normaderm', 'product', 1, 'Vichy Normaderm', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (28, 28, 'https://placehold.co/600x600/e0f0e0/1a1a2e?text=Vichy+Liftactiv', 'product', 1, 'Vichy Liftactiv', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (29, 29, 'https://placehold.co/600x600/ffe8d0/1a1a2e?text=Nuxe+Huile', 'product', 1, 'Nuxe Huile Prodigieuse', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (30, 30, 'https://placehold.co/600x600/ffe8d0/1a1a2e?text=Nuxe+Creme', 'product', 1, 'Nuxe Creme Fraiche', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (31, 31, 'https://placehold.co/600x600/fef0e8/1a1a2e?text=Bioderma+Atoderm', 'product', 1, 'Bioderma Atoderm', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (32, 32, 'https://placehold.co/600x600/fef0e8/1a1a2e?text=Bioderma+SPF50', 'product', 1, 'Bioderma Photoderm', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (33, 33, 'https://placehold.co/600x600/f0f4f8/1a1a2e?text=CeraVe+SA', 'product', 1, 'CeraVe SA Cleanser', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (34, 34, 'https://placehold.co/600x600/f0f4f8/1a1a2e?text=CeraVe+Eye', 'product', 1, 'CeraVe Eye Repair', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (35, 35, 'https://placehold.co/600x600/e8f0fe/1a1a2e?text=LRP+Toleriane', 'product', 1, 'LRP Toleriane', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (36, 36, 'https://placehold.co/600x600/e8f0fe/1a1a2e?text=LRP+Hyalu+B5', 'product', 1, 'LRP Hyalu B5', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (37, 37, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Caffeine', 'product', 1, 'TO Caffeine Solution', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (38, 38, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Squalane+CL', 'product', 1, 'TO Squalane Cleanser', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (39, 39, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Mandelic', 'product', 1, 'TO Mandelic Acid', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (40, 40, 'https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Arbutin', 'product', 1, 'TO Alpha Arbutin', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (41, 41, 'https://placehold.co/600x600/f8f0ff/1a1a2e?text=COSRX+Sun', 'product', 1, 'COSRX Aloe Sun', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (42, 42, 'https://placehold.co/600x600/f0f0ff/1a1a2e?text=Uriage+Cica', 'product', 1, 'Uriage Bariederm', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (43, 43, 'https://placehold.co/600x600/f0f0ff/1a1a2e?text=Uriage+Water', 'product', 1, 'Uriage Eau Thermale', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (44, 44, 'https://placehold.co/600x600/f5f0e8/1a1a2e?text=Ducray+Keracnyl', 'product', 1, 'Ducray Keracnyl', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (45, 45, 'https://placehold.co/600x600/ffe0e0/1a1a2e?text=Hada+Labo', 'product', 1, 'Hada Labo Premium', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (46, 46, 'https://placehold.co/600x600/fff0e8/1a1a2e?text=Klairs+Toner', 'product', 1, 'Klairs Toner', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (47, 47, 'https://placehold.co/600x600/fff0e8/1a1a2e?text=Klairs+Vit+C', 'product', 1, 'Klairs Vitamin Drop', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (48, 48, 'https://placehold.co/600x600/e8ffe8/1a1a2e?text=Purito+Centella', 'product', 1, 'Purito Centella', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (49, 49, 'https://placehold.co/600x600/e8f8ff/1a1a2e?text=SBM+Miracle', 'product', 1, 'Some By Mi Toner', '2026-04-03 01:34:20.343541');
INSERT INTO public.product_images VALUES (50, 50, 'https://placehold.co/600x600/e0f0ff/1a1a2e?text=Neutrogena+Ret', 'product', 1, 'Neutrogena Retinol', '2026-04-03 01:34:20.343541');


--
-- Data for Name: product_ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_ingredients VALUES (1, 1, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (2, 1, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (3, 1, 25, 'Dimethicone', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (4, 1, 6, 'Ceramide NP', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (5, 1, 3, 'Hyaluronic Acid', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (6, 1, 24, 'Butylene Glycol', 6, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (7, 1, 23, 'Phenoxyethanol', 7, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (8, 2, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (9, 2, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (10, 2, 1, 'Niacinamide', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (11, 2, 6, 'Ceramide NP', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (12, 2, 3, 'Hyaluronic Acid', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (13, 2, 23, 'Phenoxyethanol', 6, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (14, 3, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (15, 3, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (16, 3, 1, 'Niacinamide', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (17, 3, 25, 'Dimethicone', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (18, 3, 6, 'Ceramide NP', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (19, 3, 3, 'Hyaluronic Acid', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (20, 3, 10, 'Tocopherol', 7, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (21, 3, 23, 'Phenoxyethanol', 8, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (22, 4, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (23, 4, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (24, 4, 1, 'Niacinamide', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (25, 4, 4, 'Salicylic Acid', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (26, 4, 25, 'Dimethicone', 5, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (27, 4, 23, 'Phenoxyethanol', 6, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (28, 5, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (29, 5, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (30, 5, 25, 'Dimethicone', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (31, 5, 10, 'Tocopherol', 4, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (32, 6, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (33, 6, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (34, 6, 8, 'Panthenol', 3, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (35, 6, 25, 'Dimethicone', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (36, 6, 17, 'Madecassoside', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (37, 6, 9, 'Zinc PCA', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (38, 7, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (39, 7, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (40, 7, 15, 'Allantoin', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (41, 7, 23, 'Phenoxyethanol', 4, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (42, 8, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (43, 8, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (44, 8, 4, 'Salicylic Acid', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (45, 8, 9, 'Zinc PCA', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (46, 8, 15, 'Allantoin', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (47, 9, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (48, 9, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (49, 9, 25, 'Dimethicone', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (50, 9, 15, 'Allantoin', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (51, 9, 8, 'Panthenol', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (52, 10, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (53, 10, 14, 'Squalane', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (54, 10, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (55, 11, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (56, 11, 1, 'Niacinamide', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (57, 11, 9, 'Zinc PCA', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (58, 11, 12, 'Glycerin', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (59, 11, 23, 'Phenoxyethanol', 5, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (60, 12, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (61, 12, 18, 'Sodium Hyaluronate', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (62, 12, 3, 'Hyaluronic Acid', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (63, 12, 8, 'Panthenol', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (64, 12, 23, 'Phenoxyethanol', 5, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (65, 13, 14, 'Squalane', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (66, 13, 2, 'Retinol', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (67, 13, 24, 'Butylene Glycol', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (68, 14, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (69, 14, 5, 'Glycolic Acid', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (70, 14, 16, 'Lactic Acid', 3, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (71, 14, 4, 'Salicylic Acid', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (72, 14, 24, 'Butylene Glycol', 5, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (73, 15, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (74, 15, 7, 'Ascorbic Acid', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (75, 15, 24, 'Butylene Glycol', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (76, 15, 23, 'Phenoxyethanol', 4, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (77, 16, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (78, 16, 13, 'Azelaic Acid', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (79, 16, 25, 'Dimethicone', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (80, 16, 23, 'Phenoxyethanol', 4, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (81, 17, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (82, 17, 18, 'Sodium Hyaluronate', 2, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (83, 17, 15, 'Allantoin', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (84, 17, 8, 'Panthenol', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (85, 18, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (86, 18, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (87, 18, 11, 'Centella Asiatica Extract', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (88, 19, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (89, 19, 4, 'Salicylic Acid', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (90, 19, 24, 'Butylene Glycol', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (91, 19, 15, 'Allantoin', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (92, 20, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (93, 20, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (94, 20, 3, 'Hyaluronic Acid', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (95, 20, 25, 'Dimethicone', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (96, 20, 23, 'Phenoxyethanol', 5, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (97, 21, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (98, 21, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (99, 21, 25, 'Dimethicone', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (100, 21, 10, 'Tocopherol', 4, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (101, 22, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (102, 22, 1, 'Niacinamide', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (103, 22, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (104, 22, 4, 'Salicylic Acid', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (105, 23, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (106, 23, 1, 'Niacinamide', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (107, 23, 3, 'Hyaluronic Acid', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (108, 23, 8, 'Panthenol', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (109, 24, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (110, 24, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (111, 24, 19, 'Urea', 3, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (112, 24, 6, 'Ceramide NP', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (113, 24, 23, 'Phenoxyethanol', 5, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (114, 25, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (115, 25, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (116, 25, 4, 'Salicylic Acid', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (117, 25, 1, 'Niacinamide', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (118, 25, 25, 'Dimethicone', 5, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 00:45:51.476771', '2026-04-03 00:45:51.476771');
INSERT INTO public.product_ingredients VALUES (119, 26, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (120, 26, 18, 'Sodium Hyaluronate', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (121, 26, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (122, 26, 24, 'Butylene Glycol', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (123, 26, 23, 'Phenoxyethanol', 5, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (124, 27, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (125, 27, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (126, 27, 4, 'Salicylic Acid', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (127, 27, 1, 'Niacinamide', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (128, 27, 25, 'Dimethicone', 5, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (129, 27, 22, 'Parfum', 6, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (130, 28, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (131, 28, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (132, 28, 25, 'Dimethicone', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (133, 28, 3, 'Hyaluronic Acid', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (134, 28, 7, 'Ascorbic Acid', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (135, 28, 22, 'Parfum', 6, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (136, 29, 14, 'Squalane', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (137, 29, 10, 'Tocopherol', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (138, 29, 22, 'Parfum', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (139, 30, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (140, 30, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (141, 30, 30, 'Shea Butter', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (142, 30, 3, 'Hyaluronic Acid', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (143, 30, 10, 'Tocopherol', 5, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (144, 30, 22, 'Parfum', 6, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (145, 31, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (146, 31, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (147, 31, 30, 'Shea Butter', 3, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (148, 31, 25, 'Dimethicone', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (149, 31, 15, 'Allantoin', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (150, 31, 6, 'Ceramide NP', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (151, 32, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (152, 32, 37, 'Ethylhexyl Methoxycinnamate', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (153, 32, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (154, 32, 10, 'Tocopherol', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (155, 33, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (156, 33, 4, 'Salicylic Acid', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (157, 33, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (158, 33, 1, 'Niacinamide', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (159, 33, 6, 'Ceramide NP', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (160, 33, 3, 'Hyaluronic Acid', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (161, 34, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (162, 34, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (163, 34, 25, 'Dimethicone', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (164, 34, 6, 'Ceramide NP', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (165, 34, 3, 'Hyaluronic Acid', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (166, 34, 26, 'Caffeine', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (167, 35, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (168, 35, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (169, 35, 30, 'Shea Butter', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (170, 35, 25, 'Dimethicone', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (171, 35, 1, 'Niacinamide', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (172, 35, 6, 'Ceramide NP', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (173, 36, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (174, 36, 3, 'Hyaluronic Acid', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (175, 36, 18, 'Sodium Hyaluronate', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (176, 36, 8, 'Panthenol', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (177, 36, 17, 'Madecassoside', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (178, 36, 23, 'Phenoxyethanol', 6, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (179, 37, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (180, 37, 26, 'Caffeine', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (181, 37, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (182, 37, 36, 'Propanediol', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (183, 38, 14, 'Squalane', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (184, 38, 31, 'Cetearyl Alcohol', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (185, 38, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (186, 39, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (187, 39, 34, 'Mandelic Acid', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (188, 39, 36, 'Propanediol', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (189, 39, 3, 'Hyaluronic Acid', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (190, 40, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (191, 40, 27, 'Arbutin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (192, 40, 3, 'Hyaluronic Acid', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (193, 40, 16, 'Lactic Acid', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (194, 41, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (195, 41, 37, 'Ethylhexyl Methoxycinnamate', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (196, 41, 32, 'Aloe Barbadensis Leaf Extract', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (197, 41, 12, 'Glycerin', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (198, 41, 8, 'Panthenol', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (199, 42, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (200, 42, 12, 'Glycerin', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (201, 42, 30, 'Shea Butter', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (202, 42, 33, 'Copper Peptide', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (203, 42, 8, 'Panthenol', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (204, 42, 11, 'Centella Asiatica Extract', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (205, 43, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (206, 43, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (207, 43, 3, 'Hyaluronic Acid', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (208, 43, 25, 'Dimethicone', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (209, 43, 10, 'Tocopherol', 5, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (210, 44, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (211, 44, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (212, 44, 5, 'Glycolic Acid', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (213, 44, 1, 'Niacinamide', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (214, 44, 4, 'Salicylic Acid', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (215, 45, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (216, 45, 3, 'Hyaluronic Acid', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (217, 45, 18, 'Sodium Hyaluronate', 3, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (218, 45, 24, 'Butylene Glycol', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (219, 45, 19, 'Urea', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (220, 46, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (221, 46, 24, 'Butylene Glycol', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (222, 46, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (223, 46, 11, 'Centella Asiatica Extract', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (224, 46, 40, 'Bisabolol', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (225, 46, 3, 'Hyaluronic Acid', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (226, 47, 36, 'Propanediol', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (227, 47, 7, 'Ascorbic Acid', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (228, 47, 11, 'Centella Asiatica Extract', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (229, 47, 18, 'Sodium Hyaluronate', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (230, 48, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (231, 48, 11, 'Centella Asiatica Extract', 2, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (232, 48, 12, 'Glycerin', 3, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (233, 48, 30, 'Shea Butter', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (234, 48, 17, 'Madecassoside', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (235, 48, 8, 'Panthenol', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (236, 49, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (237, 49, 24, 'Butylene Glycol', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (238, 49, 5, 'Glycolic Acid', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (239, 49, 4, 'Salicylic Acid', 4, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (240, 49, 1, 'Niacinamide', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (241, 49, 15, 'Allantoin', 6, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (242, 50, 21, 'Aqua', 1, NULL, 'high', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (243, 50, 12, 'Glycerin', 2, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (244, 50, 2, 'Retinol', 3, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (245, 50, 25, 'Dimethicone', 4, NULL, 'medium', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (246, 50, 3, 'Hyaluronic Acid', 5, NULL, 'low', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');
INSERT INTO public.product_ingredients VALUES (247, 50, 23, 'Phenoxyethanol', 6, NULL, 'trace', false, false, 'auto', 1.00, '2026-04-03 01:33:58.251903', '2026-04-03 01:33:58.251903');


--
-- Data for Name: product_labels; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_labels VALUES (1, 1, NULL, NULL, 'Temiz cilde sabah ve akşam uygulayın. Yüz ve vücut için uygundur. Nazikçe masaj yaparak yayın.', 'Göz çevresinden kaçının. Tahriş olursa kullanımı durdurun.', NULL, NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["3 temel ceramide içerir", "MVE teknolojisi ile 24 saat nemlendirme", "Parfümsüz", "Dermatolog önerisi"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (2, 2, NULL, NULL, 'Islak yüze uygulayın, köpürterek masaj yapın, bol suyla durulayın. Günde 2 kez kullanılabilir.', 'Göz temasından kaçının. Temas halinde bol suyla yıkayın.', NULL, NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Ceramide içerikli", "Yağlı ve normal ciltler için", "Parfümsüz", "Non-komedojenik"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (3, 3, NULL, NULL, 'Akşam temizleme sonrası yüze ve boyuna uygulayın. Serum sonrası son adım olarak kullanın.', 'Yalnızca harici kullanım içindir.', NULL, NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Niacinamide içerir", "Hafif doku", "Yağsız formül", "Gece bakım rutini için ideal"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (4, 4, NULL, NULL, 'Temiz cilde sabah ve/veya akşam uygulayın. Tüm yüze ince bir tabaka halinde yayın.', 'Göz çevresinden kaçının. İlk kullanımda hafif kuruluk normal olabilir.', NULL, NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Niacinamide + Salisilik Asit", "Sivilce sonrası izleri azaltır", "Yağ kontrolü sağlar", "Non-komedojenik"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (5, 5, NULL, NULL, 'Güneşe çıkmadan 15-20 dk önce bol miktarda uygulayın. Her 2 saatte bir tekrarlayın. Yüzme ve terleme sonrası yeniden uygulayın.', 'Göz temasından kaçının. 6 ay altı bebeklerde kullanmayın. Güneş koruması tek başına yeterli değildir, koruyucu kıyafet ve gölge de önerilir.', NULL, NULL, 'Fransa', NULL, NULL, '9M', NULL, NULL, '["SPF 50+ geniş spektrum", "UVMUNE 400 teknolojisi", "Ultra uzun UVA koruması", "Suya dayanıklı"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (6, 6, NULL, NULL, 'Tahriş olmuş veya hasarlı cilt bölgelerine günde 2 kez uygulayın. Yüz ve vücut için uygundur.', 'Derin yaralarda kullanmayın. Enfekte bölgelere uygulamayın.', NULL, NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Panthenol %5", "Madecassoside", "Çinko", "Hassas ve tahriş olmuş ciltler için"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (7, 7, NULL, NULL, 'Pamuk üzerine dökün, yüz ve göz makyajını nazikçe silin. Durulama gerektirmez.', 'Sadece harici kullanım. Göz hassasiyeti durumunda doktora danışın.', NULL, NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Micellar teknoloji", "Hassas ciltler için", "Göz çevresi dahil", "Durulama gerektirmez", "Parfümsüz"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (8, 11, NULL, NULL, 'Temizleme sonrası, nemlendirici öncesi birkaç damla yüze uygulayın. Sabah ve akşam kullanılabilir.', 'Dış kullanım içindir. C vitamini ile aynı rutinde kullanılabilir. Yüksek konsantrasyon hassas ciltlerde kızarıklık yapabilir, bu durumda kullanımı azaltın.', NULL, NULL, 'Kanada', NULL, NULL, '12M', NULL, NULL, '["Niacinamide %10", "Zinc PCA %1", "Gözenek görünümünü azaltır", "Yağ dengesini sağlar", "Vegan", "Cruelty-free"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (9, 12, NULL, NULL, 'Temizleme sonrası nemli cilde birkaç damla uygulayın. Üzerine nemlendirici sürün. Sabah ve akşam kullanılabilir.', 'Kuru cilde uygulamayın, nem çekemeyeceği için kurutucu etki yapabilir. Nemli cilde uygulayın.', NULL, NULL, 'Kanada', NULL, NULL, '6M', NULL, NULL, '["3 farklı moleküler ağırlıkta hyaluronic acid", "Provitamin B5", "Derin nemlendirme", "Vegan"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (10, 13, NULL, NULL, 'Akşam temizleme sonrası birkaç damla uygulayın. Haftada 2-3 kez başlayıp kademeli olarak artırın. Sabah mutlaka SPF kullanın.', 'Hamilelik ve emzirme döneminde KULLANMAYIN. AHA/BHA ile aynı akşam kullanmayın. Güneş hassasiyetini artırır, SPF zorunludur. İlk haftalarda soyulma ve kızarıklık normal olabilir (retinizasyon).', NULL, NULL, 'Kanada', NULL, NULL, '6M', NULL, NULL, '["Retinol %0.5", "Squalane bazlı", "Kırışıklık ve ince çizgileri azaltır", "Hücre yenilenmesini hızlandırır"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (11, 14, NULL, NULL, 'Haftada en fazla 2 kez akşam kullanın. Temiz, kuru cilde uygulayın. 10 dakikadan fazla beklemeyin. Ilık suyla durulayın. Üzerine nemlendirici sürün.', 'Hassas ciltlerde, aktif sivilce veya açık yaralarda KULLANMAYIN. Diğer asitler, retinol veya C vitamini ile aynı gün kullanmayın. İlk kullanımda yanma hissi olabilir. Ertesi gün SPF zorunludur. Ciltte 10 dakikadan fazla bırakmayın.', NULL, NULL, 'Kanada', NULL, NULL, '12M', NULL, NULL, '["AHA %30 (Glikolik + Laktik)", "BHA %2 (Salisilik)", "10 dakikalık peeling", "Haftada 1-2 kez"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (12, 20, NULL, NULL, 'Temiz cilde sabah ve akşam uygulayın. Serum sonrası, güneş kremi öncesi kullanın.', 'Göz çevresinden kaçının.', NULL, NULL, 'ABD', NULL, NULL, '12M', NULL, NULL, '["Hyaluronic acid içerir", "48 saat nemlendirme", "Yağsız jel formül", "Non-komedojenik"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (13, 24, NULL, NULL, 'Temiz cilde günde 2 kez uygulayın. Özellikle kuru ve çatlak bölgelere masaj yaparak yayın.', 'Açık yaralara uygulamayın. 3 yaş altı çocuklarda kullanmayın.', NULL, NULL, 'Almanya', NULL, NULL, '12M', NULL, NULL, '["Urea %5", "Ceramide", "Çok kuru ve pürüzlü ciltler için", "48 saat nemlendirme", "Parfümsüz"]', '2026-04-03 01:26:23.742136', '2026-04-03 01:26:23.742136');
INSERT INTO public.product_labels VALUES (14, 8, NULL, NULL, 'Temiz cilde sabah ve/veya akşam uygulayın. Tüm yüze ince bir tabaka halinde sürün. Göz çevresi hariç.', 'Göz temasından kaçının. Kullanım başlangıcında hafif soyulma ve kuruluk normal kabul edilir. Cilt tahriş olursa kullanımı bırakın.', 'NAOS / Bioderma, Lyon, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Salisilik asit + Glikolik asit", "Sıkılaştırıcı + matlaştırıcı etki", "Gözenekleri arındırır", "Yağlı ve akneye eğilimli ciltler için", "Non-komedojen"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (15, 9, NULL, NULL, 'Temiz ve kuru cilde günde 1-2 kez uygulayın. Tahriş olmuş, çatlamış veya işlem sonrası ciltte kullanılabilir.', 'Derin ve enfekte yaralarda kullanmayın. Yalnızca harici kullanım içindir.', 'Pierre Fabre Dermo-Cosmetique, Toulouse, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Sucralfate + Bakır-Çinko", "Onarıcı ve yatıştırıcı", "Avene termal suyu", "Hassas ve tahriş olmuş ciltler", "Steril formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (16, 10, NULL, NULL, 'Temiz cilde sabah ve akşam uygulayın. Hassas ciltlerde güvenle kullanılabilir. Makyaj altına uygundur.', 'Yalnızca harici kullanım. Göz çevresinden kaçının.', 'Pierre Fabre Dermo-Cosmetique, Toulouse, Fransa', NULL, 'Fransa', NULL, NULL, '6M', NULL, NULL, '["Sadece 7 içerik", "Parfümsüz, koruyucusuz", "Steril kozmetik (D.E.F.I. teknolojisi)", "Aşırı hassas ve intoleran ciltler için"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (17, 15, NULL, NULL, 'Sabah temizleme sonrası birkaç damla yüze uygulayın. Nemlendirici öncesi kullanın. Güneş koruyucu ile birlikte kullanılmalıdır.', 'Hassas ciltlerde patch test yapın. Niacinamide ile aynı rutinde kullanılabilir ancak güçlü asitlerle birleştirmekten kaçının.', 'DECIEM Inc., Toronto, Kanada', NULL, 'Kanada', NULL, NULL, '6M', NULL, NULL, '["C Vitamini + Alpha Arbutin", "Leke karşıtı", "Aydınlatıcı etki", "Antioksidan koruma", "Vegan formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (18, 16, NULL, NULL, 'Akşam bakım rutininde, serum sonrası son adım olarak uygulayın. İnce bir tabaka halinde tüm yüze sürün.', 'Göz çevresinden kaçının. Hamilelikte doktor kontrolünde kullanılabilir. İlk kullanımda hafif karıncalanma normal kabul edilir.', 'DECIEM Inc., Toronto, Kanada', NULL, 'Kanada', NULL, NULL, '12M', NULL, NULL, '["Azelaic Acid %10", "Leke ve ton eşitsizliği", "Gözenek görünümünü azaltır", "Parlama karşıtı", "Vegan"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (19, 17, NULL, NULL, 'Toner sonrası avuç içine 2-3 pompa alın, yüze ve boyuna hafifçe bastırarak uygulayın. Sabah ve akşam kullanılabilir.', 'Salyangoz alerjisi olanlar kullanmamalıdır. Açık yaralara uygulamayın.', 'COSRX Inc., Seul, Güney Kore', NULL, 'Güney Kore', NULL, NULL, '12M', NULL, NULL, '["Snail Secretion Filtrate %96.3", "Derin nemlendirme", "Onarıcı ve yatıştırıcı", "Hasar görmüş cilt bariyerini güçlendirir", "Hafif jel doku"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (20, 18, NULL, NULL, 'Islak yüze az miktarda uygulayın, köpürterek 30-60 saniye masaj yapın, ılık suyla durulayın. Sabah temizliği için idealdir.', 'Göz temasından kaçının. Çok kuru ciltlerde günde 1 kullanım yeterlidir.', 'COSRX Inc., Seul, Güney Kore', NULL, 'Güney Kore', NULL, NULL, '12M', NULL, NULL, '["pH 5.0-6.0 dengeli", "BHA (Betaine Salicylate) içerir", "Çay ağacı yağı", "Hassas ciltler için nazik temizlik", "Sabah temizliği için ideal"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (21, 19, NULL, NULL, 'Toner sonrası pamuk üzerine döküp yüze uygulayın veya avuç içinden parmak uçlarıyla sürün. Başlangıçta haftada 2-3 kez, alıştıkça günlük kullanın.', 'Göz çevresinden ve mukoza membranlarından uzak tutun. AHA ile aynı rutinde kullanırken dikkatli olun.', 'COSRX Inc., Seul, Güney Kore', NULL, 'Güney Kore', NULL, NULL, '12M', NULL, NULL, '["Betaine Salicylate %4 (BHA)", "Siyah nokta karşıtı", "Gözenekleri derinlemesine temizler", "Söğüt ağacı kabuğu özütü", "Düşük pH formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (22, 21, NULL, NULL, 'Güneşe çıkmadan 15 dakika önce bol miktarda uygulayın. 2 saatte bir ve yüzdükten/terlendikten sonra tekrarlayın.', 'Göz temasından kaçının. 6 ay altı bebeklerde doktor onayı olmadan kullanmayın. Cilt tahriş olursa durdurun.', 'Johnson & Johnson Consumer Inc., NJ, ABD', NULL, 'ABD', NULL, NULL, '12M', NULL, NULL, '["SPF 55 geniş spektrum", "Dry-Touch teknolojisi", "Helioplex formül", "Mat bitiş", "Yüz ve vücut için", "Suya dayanıklı (80 dk)"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (23, 22, NULL, NULL, 'Temiz cilde sabah ve/veya akşam uygulayın. Nemlendirici öncesi tüm yüze ince bir tabaka halinde sürün.', 'Göz çevresinden kaçının. Hamilelikte kullanmadan önce doktora danışın.', 'Laboratoires SVR, Paris, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Niacinamide %4 + Glukonolakton %14", "Gözenek sıkılaştırıcı", "Sebum düzenleyici", "Leke karşıtı", "Hassas ciltler için uygun"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (24, 23, NULL, NULL, 'Sabah ve akşam temiz cilde 4-5 damla uygulayın. Nemlendirici öncesi kullanın.', 'Yalnızca harici kullanım. Göz temasından kaçının.', 'Laboratoires SVR, Paris, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Niacinamide %5 + Hyaluronic Acid", "48 saat nemlendirme", "Cilt bariyerini onarır", "Leke karşıtı", "Parfümsüz"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (25, 25, NULL, NULL, 'Temiz cilde sabah ve akşam uygulayın. Makyaj altına uygun matlaştırıcı baz olarak da kullanılabilir.', 'Göz çevresinden kaçının. Aktif sivilce üzerinde dikkatli kullanın.', 'Beiersdorf AG, Hamburg, Almanya', NULL, 'Almanya', NULL, NULL, '12M', NULL, NULL, '["Licochalcone A", "8 saat mat etki", "Sebum düzenleyici", "Gözenek sıkılaştırıcı", "Non-komedojen", "Akneye eğilimli yağlı ciltler için"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (26, 26, NULL, NULL, 'Temiz cilde sabah ve akşam 2 pompa uygulayın. Günlük bakım rutininin ilk adımı olarak, serum/nemlendirici öncesi kullanın.', 'Yalnızca harici kullanım. Göz çevresinden kaçının.', 'Vichy Laboratoires / L''Oreal, Paris, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Hyaluronic Acid + Vichy Mineralizing Water", "89% mineralleştirici termal su", "Cilt bariyerini güçlendirir", "Daha parlak ve dolgun görünüm", "Hassas ciltler için uygun", "Parfümsüz"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (27, 27, NULL, NULL, 'Temiz cilde sabah ve akşam uygulayın. Tüm yüze ince bir tabaka halinde sürün, masaj yaparak emilmesini sağlayın.', 'Göz çevresinden kaçının. Aşırı tahriş durumunda kullanımı bırakın.', 'Vichy Laboratoires / L''Oreal, Paris, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Salisilik Asit + Hyaluronic Acid", "Çift düzeltici etki", "Sivilce izlerini azaltır", "24 saat nemlendirme", "Yağlı ve akneye eğilimli ciltler için"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (28, 28, NULL, NULL, 'Sabah bakım rutininde temiz cilde uygulayın. Serum sonrası, güneş koruyucu öncesi kullanın.', 'Yalnızca harici kullanım.', 'Vichy Laboratoires / L''Oreal, Paris, Fransa', NULL, 'Fransa', NULL, NULL, '18M', NULL, NULL, '["Rhamnose %5 + Hyaluronic Acid", "Yaşlanma karşıtı", "Kırışıklık ve sarkma", "Parlak ve genç görünüm", "Kuru ve karma ciltler için"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (29, 29, NULL, NULL, 'Yüz, saç ve vücuda uygulayın. Banyo sonrası nemli cilde masaj yaparak sürün. Saçlara birkaç damla uç kısımlarına uygulayın.', 'Göz temasından kaçının. Güneşlenme öncesi uygulamayın.', 'Laboratoire NUXE, Paris, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["7 botanik yağ karışımı", "Çok amaçlı kuru yağ", "Yüz, vücut ve saç", "Besleyici ve onarıcı", "Saten parlaklık", "Parfümlü formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (30, 30, NULL, NULL, 'Temiz cilde sabah ve akşam uygulayın. Makyaj altına uygundur.', 'Yalnızca harici kullanım.', 'Laboratoire NUXE, Paris, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Bitkisel süt + Hyaluronic Acid", "48 saat nemlendirme", "Yatıştırıcı", "Normal ve karma ciltler için", "Vegan formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (31, 31, NULL, NULL, 'Temiz cilde günde 1-2 kez uygulayın. Banyo veya duş sonrası nemli cilde uygulamak emilimi artırır. Yüz ve vücut için uygundur.', 'Açık yaralara ve enfekte bölgelere uygulamayın.', 'NAOS / Bioderma, Lyon, Fransa', NULL, 'Fransa', NULL, NULL, '6M', NULL, NULL, '["Biyolojik patentli kompleks", "Kaşıntı giderici", "Cilt bariyerini yeniden yapılandırır", "Atopik ve çok kuru ciltler için", "Yüz ve vücut", "Parfümsüz"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (32, 32, NULL, NULL, 'Güneşe çıkmadan 20 dakika önce yeterli miktarda uygulayın. Her 2 saatte bir tekrarlayın. Yüzdükten sonra yeniden uygulayın.', 'Göz temasından kaçının. 6 ay altı bebeklerde kullanmayın. Ürün tek başına tam koruma sağlamaz, şapka ve gölge ile destekleyin.', 'NAOS / Bioderma, Lyon, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["SPF 50+ / UVA 38", "Cellular Bioprotection", "Geniş spektrum UVA-UVB", "Su ve tere dayanıklı", "Hassas ciltler için", "Fotokararlı formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (33, 33, NULL, NULL, 'Islak cilde uygulayın, köpürterek 30-60 saniye masaj yapın, ılık suyla durulayın. Yüz ve vücut için uygundur.', 'Göz temasından kaçının. Aktif güneş yanığı olan bölgelere uygulamayın.', 'L''Oreal / CeraVe, Vichy, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Salisilik Asit + 3 Ceramide", "Pürüzsüzleştirici", "Ölü deri hücrelerini temizler", "MVE teknolojisi", "Kuru ve pürüzlü ciltler için", "Non-komedojen"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (34, 34, NULL, NULL, 'Sabah ve akşam temiz göz çevresine yüzük parmağıyla hafifçe vuruşlarla uygulayın. Az miktar yeterlidir.', 'Göz içine temas ettirmeyin. Tahriş olursa kullanımı durdurun.', 'L''Oreal / CeraVe, Vichy, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["3 Ceramide + Hyaluronic Acid", "MVE teknolojisi", "Göz altı morlukları ve şişlik", "Hafif krem doku", "Göz doktoru test edilmiş", "Parfümsüz"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (35, 35, NULL, NULL, 'Temiz cilde sabah ve akşam uygulayın. Tüm yüze hafifçe masaj yaparak sürün.', 'Yalnızca harici kullanım. Göz çevresinden kaçının.', 'La Roche-Posay / L''Oreal, La Roche-Posay, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Prebiyotik termal su", "Niacinamide + Glycerin", "Hassas cilt bariyerini güçlendirir", "Tahriş azaltıcı", "Parfümsüz, alkol içermez", "Minimal içerik formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (36, 36, NULL, NULL, 'Sabah ve akşam temiz cilde 3-4 damla uygulayın. Nemlendirici öncesi kullanın. Göz çevresine de uygulanabilir.', 'Yalnızca harici kullanım.', 'La Roche-Posay / L''Oreal, La Roche-Posay, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["2 Tip Hyaluronic Acid + Vitamin B5", "Anti-aging + nemlendirme", "Dolgunlaştırıcı etki", "Hassas ciltler için uygun", "Dermatolog test edilmiş"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (37, 37, NULL, NULL, 'Sabah ve akşam temiz göz çevresine yüzük parmağıyla hafifçe pat pat yaparak uygulayın. Göz kremi yerine veya altına kullanılabilir.', 'Göz içine temas ettirmeyin. Kafeine alerji durumunda kullanmayın.', 'DECIEM Inc., Toronto, Kanada', NULL, 'Kanada', NULL, NULL, '12M', NULL, NULL, '["Caffeine %5 + EGCG", "Göz altı morlukları ve şişlik", "Antioksidan yeşil çay", "Hafif serum doku", "Vegan formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (38, 38, NULL, NULL, 'Kuru ellere pompalayın, kuru yüze uygulayın, 30-60 saniye masaj yapın. Ilık suyla durulayın. Balm-to-milk dönüşüm formülü.', 'Göz temasından kaçının.', 'DECIEM Inc., Toronto, Kanada', NULL, 'Kanada', NULL, NULL, '12M', NULL, NULL, '["Squalane bazlı temizleyici", "Balm-to-milk dönüşüm", "Makyaj çözücü", "Hassas ciltler için", "Kurutmayan formül", "Vegan"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (39, 39, NULL, NULL, 'Akşam temizleme sonrası pamuk ile veya parmak uçlarıyla yüze uygulayın. Haftada 2-3 kez başlayıp günlük kullanıma geçin.', 'AHA ürünüdür, güneşe karşı duyarlılığı artırır. Mutlaka SPF kullanın. Retinol ile aynı akşam kullanmayın.', 'DECIEM Inc., Toronto, Kanada', NULL, 'Kanada', NULL, NULL, '6M', NULL, NULL, '["Mandelic Acid %10", "Nazik AHA peeling", "Hassas ciltler için uygun AHA", "Ton eşitsizliği ve leke", "Gözenek arındırıcı", "Vegan"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (40, 40, NULL, NULL, 'Sabah ve akşam temiz cilde birkaç damla uygulayın. Nemlendirici öncesi, C vitamini ile birlikte kullanılabilir.', 'Yalnızca harici kullanım. Güneş koruyucu ile birlikte kullanılmalıdır.', 'DECIEM Inc., Toronto, Kanada', NULL, 'Kanada', NULL, NULL, '12M', NULL, NULL, '["Alpha Arbutin %2 + Hyaluronic Acid", "Leke karşıtı", "Aydınlatıcı", "Hiperpigmentasyon", "Eşit cilt tonu", "Vegan"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (41, 41, NULL, NULL, 'Cilt bakım rutininin son adımı olarak, güneşe çıkmadan 15 dakika önce uygulayın. 2-3 saatte bir tekrarlayın.', 'Göz temasından kaçının. Cilt tahriş olursa kullanımı durdurun.', 'COSRX Inc., Seul, Güney Kore', NULL, 'Güney Kore', NULL, NULL, '12M', NULL, NULL, '["SPF 50+ PA+++", "Aloe Vera yatıştırıcı", "Hafif ve yapışkan olmayan doku", "Beyazlaştırmayan formül", "Günlük kullanım için ideal"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (42, 42, NULL, NULL, 'Temiz cilde günde 1-2 kez uygulayın. Tahriş olmuş, çatlamış veya işlem sonrası ciltte kullanılabilir.', 'Derin yaralarda veya enfekte bölgelerde kullanmayın.', 'Laboratoires Dermatologiques d''Uriage, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Bakır-Çinko kompleks", "Poly-2p (onarıcı patent)", "Centella Asiatica", "Cilt onarıcı ve yatıştırıcı", "Uriage termal su", "Parfümsüz"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (43, 43, NULL, NULL, 'Temiz cilde sabah ve akşam uygulayın. Makyaj altına uygundur.', 'Yalnızca harici kullanım.', 'Laboratoires Dermatologiques d''Uriage, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Uriage Termal Su + Hyaluronic Acid", "Hafif jel-krem doku", "24 saat nemlendirme", "Normal ve karma ciltler", "Non-komedojen"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (44, 44, NULL, NULL, 'Temiz cilde akşam uygulayın. Göz çevresi hariç tüm yüze ince bir tabaka sürün. Nemlendirici öncesi kullanın.', 'Göz çevresinden kaçının. Hamilelikte kullanmadan önce doktora danışın. AHA/BHA kombinasyonlarında dikkatli olun.', 'Pierre Fabre Dermatologie, Toulouse, Fransa', NULL, 'Fransa', NULL, NULL, '12M', NULL, NULL, '["Glikolik Asit + Myrtacine", "Siyah nokta ve sivilce karşıtı", "Gözenek arındırıcı", "Yağ kontrolü", "Pürüzsüz cilt dokusu"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (45, 45, NULL, NULL, 'Temiz cilde 3-4 damla avuç içine alıp yüze bastırarak uygulayın. Nemli cilde uygulamak emilimi artırır. Katmanlama yapılabilir.', 'Çok kuru iklimlerde tek başına nemlendirici olarak yeterli olmayabilir. Üzerine oklüzif ürün sürün.', 'Rohto Pharmaceutical Co., Osaka, Japonya', NULL, 'Japonya', NULL, NULL, '12M', NULL, NULL, '["5 Tip Hyaluronic Acid", "Premium nemlendirme", "7 kat nem katmanı", "Yapışkan olmayan doku", "Parfümsüz, renklendirici içermez", "Japon cilt bakım felsefesi"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (46, 46, NULL, NULL, 'Temiz cilde pamuk veya avuç içi ile uygulayın. 2-3 kat katmanlama yapılabilir. Serum öncesi pH dengeleme adımı olarak kullanın.', 'Yalnızca harici kullanım.', 'Wishtrend / Dear Klairs, Seul, Güney Kore', NULL, 'Güney Kore', NULL, NULL, '18M', NULL, NULL, '["Hyaluronic Acid + Beta-Glucan", "pH dengeleme", "Hassas cilt toniği", "Nemlendirme katmanı", "Parfümsüz versiyon", "Vegan, cruelty-free"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (47, 47, NULL, NULL, 'Sabah veya akşam temiz cilde 2-3 damla uygulayın. Toner sonrası, nemlendirici öncesi kullanın. Güneş koruyucu ile birlikte kullanılmalıdır.', 'C vitamini ürünüdür, ışığa duyarlılık artırabilir. Retinol ile aynı akşam kullanmayın. Buzdolabında saklayın.', 'Wishtrend / Dear Klairs, Seul, Güney Kore', NULL, 'Güney Kore', NULL, NULL, '6M', NULL, NULL, '["Ascorbic Acid %5 (C Vitamini)", "Hassas ciltler için düşük konsantrasyon", "Aydınlatıcı ve ton eşitleyici", "Antioksidan koruma", "Stabil formül"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (48, 48, NULL, NULL, 'Cilt bakım rutininin son adımı olarak sabah ve akşam uygulayın. Tahriş olmuş ve hassas ciltlerde yatıştırıcı olarak da kullanılabilir.', 'Yalnızca harici kullanım.', 'Purito, Seul, Güney Kore', NULL, 'Güney Kore', NULL, NULL, '12M', NULL, NULL, '["Centella Asiatica %49", "Yatıştırıcı ve onarıcı", "Hafif krem doku", "Hassas ve akneye eğilimli ciltler", "Parfümsüz", "EWG Green Grade"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (49, 49, NULL, NULL, 'Temiz cilde pamuk ile veya avuç içinden uygulayın. Günlük kullanıma uygundur. Serum öncesi adım olarak kullanın.', 'AHA/BHA içerir, güneşe karşı duyarlılığı artırır. SPF kullanın. Retinol ile aynı rutinde dikkatli olun.', 'Some By Mi, Seul, Güney Kore', NULL, 'Güney Kore', NULL, NULL, '12M', NULL, NULL, '["AHA + BHA + PHA üçlü asit", "30 günlük mucize", "Çay ağacı %10.000ppm", "Gözenek ve sivilce karşıtı", "Ölü deri arındırma + nemlendirme"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');
INSERT INTO public.product_labels VALUES (50, 50, NULL, NULL, 'Akşam temiz cilde uygulayın. Haftada 2-3 kez başlayıp, cilt alıştıkça günlük kullanıma geçin. Güneş koruyucu ile birlikte kullanılmalıdır.', 'Hamilelik ve emzirme döneminde KULLANMAYIN. AHA/BHA ile aynı akşam kullanmayın. İlk kullanımlarda hafif soyulma ve kızarıklık normal.', 'Johnson & Johnson Consumer Inc., NJ, ABD', NULL, 'ABD', NULL, NULL, '6M', NULL, NULL, '["Retinol (saf)", "Kırışıklık ve ince çizgi", "Cilt yenileme", "Ton eşitsizliği", "Sıkılaştırıcı etki", "Dermatolog test edilmiş"]', '2026-04-03 12:28:53.891408', '2026-04-03 12:28:53.891408');


--
-- Data for Name: product_need_scores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_need_scores VALUES (140, 1, 4, 87.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 3}', 'high', '2026-04-03 04:36:10.522');
INSERT INTO public.product_need_scores VALUES (141, 1, 10, 56.87, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.56, "relevance": 25, "effect_type": "positive", "contribution": 0.14, "ingredient_id": 24}], "matched_count": 5}', 'high', '2026-04-03 04:36:10.523');
INSERT INTO public.product_need_scores VALUES (142, 1, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.523');
INSERT INTO public.product_need_scores VALUES (143, 1, 5, 95.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.523');
INSERT INTO public.product_need_scores VALUES (144, 1, 11, 65.78, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}, {"strength": 0.14, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.02, "ingredient_id": 23}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.523');
INSERT INTO public.product_need_scores VALUES (145, 2, 1, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (146, 2, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (147, 2, 6, 75.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (148, 2, 5, 79.62, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 1}, {"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (149, 2, 9, 80.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (150, 2, 4, 87.78, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 3}', 'high', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (151, 2, 10, 60.65, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (152, 2, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (153, 2, 11, 65.78, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}, {"strength": 0.14, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.02, "ingredient_id": 23}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.564');
INSERT INTO public.product_need_scores VALUES (154, 3, 1, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (155, 3, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (156, 3, 6, 75.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (157, 3, 5, 79.62, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 1}, {"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (158, 3, 9, 80.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (159, 3, 4, 86.89, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 3}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 3}', 'high', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (160, 3, 10, 60.71, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (161, 3, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 60, "effect_type": "positive", "contribution": 0.21, "ingredient_id": 3}, {"strength": 0.14, "relevance": 60, "effect_type": "positive", "contribution": 0.08, "ingredient_id": 10}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (162, 3, 11, 65.78, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}, {"strength": 0.14, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.02, "ingredient_id": 23}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (163, 3, 12, 85.00, NULL, '{"ingredients": [{"strength": 0.14, "relevance": 85, "effect_type": "positive", "contribution": 0.12, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.786');
INSERT INTO public.product_need_scores VALUES (164, 4, 1, 86.92, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.802');
INSERT INTO public.product_need_scores VALUES (165, 4, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.802');
INSERT INTO public.product_need_scores VALUES (166, 4, 6, 78.85, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.802');
INSERT INTO public.product_need_scores VALUES (167, 4, 5, 70.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.802');
INSERT INTO public.product_need_scores VALUES (168, 4, 9, 78.08, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:10.802');
INSERT INTO public.product_need_scores VALUES (169, 4, 10, 53.85, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:10.802');
INSERT INTO public.product_need_scores VALUES (170, 4, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.802');
INSERT INTO public.product_need_scores VALUES (171, 4, 11, 15.00, NULL, '{"ingredients": [{"strength": 0.14, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.02, "ingredient_id": 23}], "matched_count": 1}', 'medium', '2026-04-03 04:36:10.802');
INSERT INTO public.product_need_scores VALUES (172, 5, 12, 85.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 85, "effect_type": "positive", "contribution": 0.17, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.019');
INSERT INTO public.product_need_scores VALUES (173, 5, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 60, "effect_type": "positive", "contribution": 0.12, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.019');
INSERT INTO public.product_need_scores VALUES (174, 5, 10, 53.85, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.019');
INSERT INTO public.product_need_scores VALUES (175, 5, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.019');
INSERT INTO public.product_need_scores VALUES (176, 6, 5, 81.67, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 8}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 17}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.046');
INSERT INTO public.product_need_scores VALUES (177, 6, 10, 61.32, NULL, '{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 8}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.046');
INSERT INTO public.product_need_scores VALUES (178, 6, 11, 86.67, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 8}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 17}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.046');
INSERT INTO public.product_need_scores VALUES (179, 6, 1, 80.00, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 80, "effect_type": "positive", "contribution": 0.28, "ingredient_id": 9}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.046');
INSERT INTO public.product_need_scores VALUES (180, 6, 9, 85.00, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 85, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 9}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.046');
INSERT INTO public.product_need_scores VALUES (181, 6, 4, 85.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.046');
INSERT INTO public.product_need_scores VALUES (182, 7, 10, 51.11, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.059');
INSERT INTO public.product_need_scores VALUES (183, 7, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.059');
INSERT INTO public.product_need_scores VALUES (184, 7, 11, 61.43, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}, {"strength": 0.2, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.03, "ingredient_id": 23}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.059');
INSERT INTO public.product_need_scores VALUES (185, 7, 5, 65.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.059');
INSERT INTO public.product_need_scores VALUES (186, 8, 1, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 9}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.072');
INSERT INTO public.product_need_scores VALUES (187, 8, 6, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.072');
INSERT INTO public.product_need_scores VALUES (188, 8, 9, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 9}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.072');
INSERT INTO public.product_need_scores VALUES (189, 8, 10, 51.11, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.072');
INSERT INTO public.product_need_scores VALUES (190, 8, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.072');
INSERT INTO public.product_need_scores VALUES (191, 8, 11, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.072');
INSERT INTO public.product_need_scores VALUES (192, 8, 5, 65.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.072');
INSERT INTO public.product_need_scores VALUES (193, 9, 5, 72.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}, {"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.085');
INSERT INTO public.product_need_scores VALUES (194, 9, 10, 57.26, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.085');
INSERT INTO public.product_need_scores VALUES (195, 9, 11, 82.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.085');
INSERT INTO public.product_need_scores VALUES (196, 9, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.085');
INSERT INTO public.product_need_scores VALUES (197, 10, 10, 60.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 14}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.097');
INSERT INTO public.product_need_scores VALUES (198, 10, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.097');
INSERT INTO public.product_need_scores VALUES (199, 10, 5, 70.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 14}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.097');
INSERT INTO public.product_need_scores VALUES (200, 11, 1, 82.78, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 1}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 9}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.109');
INSERT INTO public.product_need_scores VALUES (201, 11, 2, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.11');
INSERT INTO public.product_need_scores VALUES (202, 11, 6, 75.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.11');
INSERT INTO public.product_need_scores VALUES (203, 11, 5, 70.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.11');
INSERT INTO public.product_need_scores VALUES (204, 11, 9, 82.22, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 9}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.11');
INSERT INTO public.product_need_scores VALUES (205, 11, 10, 51.11, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.11');
INSERT INTO public.product_need_scores VALUES (206, 11, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.11');
INSERT INTO public.product_need_scores VALUES (207, 11, 11, 15.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.03, "ingredient_id": 23}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.11');
INSERT INTO public.product_need_scores VALUES (208, 12, 4, 92.50, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 18}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.123');
INSERT INTO public.product_need_scores VALUES (209, 12, 10, 66.29, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 18}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.123');
INSERT INTO public.product_need_scores VALUES (210, 12, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.123');
INSERT INTO public.product_need_scores VALUES (211, 12, 5, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.123');
INSERT INTO public.product_need_scores VALUES (212, 12, 11, 65.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}, {"strength": 0.2, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.03, "ingredient_id": 23}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.123');
INSERT INTO public.product_need_scores VALUES (213, 13, 3, 95.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 2}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.136');
INSERT INTO public.product_need_scores VALUES (214, 13, 2, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 2}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.136');
INSERT INTO public.product_need_scores VALUES (215, 13, 1, 70.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 2}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.136');
INSERT INTO public.product_need_scores VALUES (216, 13, 6, 70.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 2}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.136');
INSERT INTO public.product_need_scores VALUES (217, 13, 10, 55.56, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 14}, {"strength": 0.8, "relevance": 25, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 24}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.136');
INSERT INTO public.product_need_scores VALUES (218, 13, 5, 70.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 14}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.136');
INSERT INTO public.product_need_scores VALUES (219, 14, 1, 90.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 4}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.148');
INSERT INTO public.product_need_scores VALUES (220, 14, 6, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 4}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.148');
INSERT INTO public.product_need_scores VALUES (221, 14, 9, 75.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 4}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.148');
INSERT INTO public.product_need_scores VALUES (222, 14, 2, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 5}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.148');
INSERT INTO public.product_need_scores VALUES (223, 14, 7, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 5}, {"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 16}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.148');
INSERT INTO public.product_need_scores VALUES (224, 14, 3, 65.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 65, "effect_type": "positive", "contribution": 0.65, "ingredient_id": 5}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.148');
INSERT INTO public.product_need_scores VALUES (225, 14, 4, 70.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 16}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.148');
INSERT INTO public.product_need_scores VALUES (226, 14, 10, 22.22, NULL, '{"ingredients": [{"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 25, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 24}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.148');
INSERT INTO public.product_need_scores VALUES (227, 15, 12, 95.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 95, "effect_type": "positive", "contribution": 0.95, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.162');
INSERT INTO public.product_need_scores VALUES (228, 15, 2, 85.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.162');
INSERT INTO public.product_need_scores VALUES (229, 15, 7, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.162');
INSERT INTO public.product_need_scores VALUES (230, 15, 3, 75.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.162');
INSERT INTO public.product_need_scores VALUES (231, 15, 10, 22.22, NULL, '{"ingredients": [{"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 25, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 24}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.162');
INSERT INTO public.product_need_scores VALUES (232, 15, 11, 15.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.03, "ingredient_id": 23}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.162');
INSERT INTO public.product_need_scores VALUES (233, 16, 1, 85.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 13}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.173');
INSERT INTO public.product_need_scores VALUES (234, 16, 2, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 13}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.173');
INSERT INTO public.product_need_scores VALUES (235, 16, 7, 75.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 13}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.173');
INSERT INTO public.product_need_scores VALUES (236, 16, 10, 37.78, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.173');
INSERT INTO public.product_need_scores VALUES (237, 16, 11, 15.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.03, "ingredient_id": 23}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.173');
INSERT INTO public.product_need_scores VALUES (238, 17, 5, 72.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}, {"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.184');
INSERT INTO public.product_need_scores VALUES (305, 29, 12, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.741');
INSERT INTO public.product_need_scores VALUES (239, 17, 10, 51.25, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 18}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.184');
INSERT INTO public.product_need_scores VALUES (240, 17, 11, 82.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.184');
INSERT INTO public.product_need_scores VALUES (241, 17, 4, 90.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 18}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.184');
INSERT INTO public.product_need_scores VALUES (242, 18, 11, 90.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 11}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.194');
INSERT INTO public.product_need_scores VALUES (243, 18, 5, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 11}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.194');
INSERT INTO public.product_need_scores VALUES (244, 18, 10, 51.11, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.194');
INSERT INTO public.product_need_scores VALUES (245, 18, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.194');
INSERT INTO public.product_need_scores VALUES (246, 19, 1, 90.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 4}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.207');
INSERT INTO public.product_need_scores VALUES (247, 19, 6, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 4}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.207');
INSERT INTO public.product_need_scores VALUES (248, 19, 9, 75.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 4}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.207');
INSERT INTO public.product_need_scores VALUES (249, 19, 11, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.207');
INSERT INTO public.product_need_scores VALUES (250, 19, 5, 65.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.207');
INSERT INTO public.product_need_scores VALUES (251, 19, 10, 22.22, NULL, '{"ingredients": [{"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 25, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 24}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.207');
INSERT INTO public.product_need_scores VALUES (252, 20, 4, 89.44, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.414');
INSERT INTO public.product_need_scores VALUES (253, 20, 10, 65.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.414');
INSERT INTO public.product_need_scores VALUES (254, 20, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.414');
INSERT INTO public.product_need_scores VALUES (255, 20, 11, 15.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.03, "ingredient_id": 23}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.414');
INSERT INTO public.product_need_scores VALUES (256, 21, 12, 85.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 85, "effect_type": "positive", "contribution": 0.17, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.43');
INSERT INTO public.product_need_scores VALUES (257, 21, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 60, "effect_type": "positive", "contribution": 0.12, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.43');
INSERT INTO public.product_need_scores VALUES (258, 21, 10, 53.85, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.43');
INSERT INTO public.product_need_scores VALUES (259, 21, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.43');
INSERT INTO public.product_need_scores VALUES (260, 22, 1, 86.67, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.444');
INSERT INTO public.product_need_scores VALUES (261, 22, 2, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.444');
INSERT INTO public.product_need_scores VALUES (262, 22, 6, 78.33, NULL, '{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.444');
INSERT INTO public.product_need_scores VALUES (263, 22, 5, 70.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.444');
INSERT INTO public.product_need_scores VALUES (264, 22, 9, 78.33, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.444');
INSERT INTO public.product_need_scores VALUES (265, 22, 10, 51.11, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.444');
INSERT INTO public.product_need_scores VALUES (266, 22, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.444');
INSERT INTO public.product_need_scores VALUES (267, 23, 1, 85.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (268, 23, 2, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (269, 23, 6, 75.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (270, 23, 5, 73.33, NULL, '{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 1}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (271, 23, 9, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (272, 23, 4, 95.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (273, 23, 10, 58.04, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (274, 23, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (275, 23, 11, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.46');
INSERT INTO public.product_need_scores VALUES (276, 24, 5, 95.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.475');
INSERT INTO public.product_need_scores VALUES (277, 24, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 19}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.475');
INSERT INTO public.product_need_scores VALUES (278, 24, 11, 61.43, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}, {"strength": 0.2, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.03, "ingredient_id": 23}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.475');
INSERT INTO public.product_need_scores VALUES (279, 24, 10, 63.33, NULL, '{"ingredients": [{"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 19}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.475');
INSERT INTO public.product_need_scores VALUES (280, 25, 1, 87.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.681');
INSERT INTO public.product_need_scores VALUES (281, 25, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.681');
INSERT INTO public.product_need_scores VALUES (282, 25, 6, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.681');
INSERT INTO public.product_need_scores VALUES (283, 25, 5, 70.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.681');
INSERT INTO public.product_need_scores VALUES (306, 29, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.741');
INSERT INTO public.product_need_scores VALUES (284, 25, 9, 77.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.681');
INSERT INTO public.product_need_scores VALUES (285, 25, 10, 53.85, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.681');
INSERT INTO public.product_need_scores VALUES (286, 25, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.682');
INSERT INTO public.product_need_scores VALUES (287, 26, 10, 54.12, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 18}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 25, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 24}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.704');
INSERT INTO public.product_need_scores VALUES (288, 26, 4, 87.50, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 18}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.704');
INSERT INTO public.product_need_scores VALUES (289, 26, 11, 15.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.03, "ingredient_id": 23}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.704');
INSERT INTO public.product_need_scores VALUES (290, 27, 1, 87.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.718');
INSERT INTO public.product_need_scores VALUES (291, 27, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.718');
INSERT INTO public.product_need_scores VALUES (292, 27, 6, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.718');
INSERT INTO public.product_need_scores VALUES (293, 27, 5, 70.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.718');
INSERT INTO public.product_need_scores VALUES (294, 27, 9, 77.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.718');
INSERT INTO public.product_need_scores VALUES (295, 27, 10, 53.85, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.718');
INSERT INTO public.product_need_scores VALUES (296, 27, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.718');
INSERT INTO public.product_need_scores VALUES (297, 27, 11, 0.00, NULL, '{"ingredients": [{"strength": 0.14, "relevance": 70, "effect_type": "negative", "contribution": 0.1, "ingredient_id": 22}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.718');
INSERT INTO public.product_need_scores VALUES (298, 28, 4, 88.33, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.729');
INSERT INTO public.product_need_scores VALUES (299, 28, 10, 62.27, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.729');
INSERT INTO public.product_need_scores VALUES (300, 28, 3, 67.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 7}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.729');
INSERT INTO public.product_need_scores VALUES (301, 28, 12, 95.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.729');
INSERT INTO public.product_need_scores VALUES (302, 28, 2, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.729');
INSERT INTO public.product_need_scores VALUES (303, 28, 7, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.729');
INSERT INTO public.product_need_scores VALUES (304, 28, 11, 0.00, NULL, '{"ingredients": [{"strength": 0.14, "relevance": 70, "effect_type": "negative", "contribution": 0.1, "ingredient_id": 22}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.729');
INSERT INTO public.product_need_scores VALUES (307, 29, 10, 80.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 14}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.741');
INSERT INTO public.product_need_scores VALUES (308, 29, 5, 70.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 14}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.741');
INSERT INTO public.product_need_scores VALUES (309, 29, 11, 0.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "negative", "contribution": 0.35, "ingredient_id": 22}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.741');
INSERT INTO public.product_need_scores VALUES (310, 30, 4, 85.43, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 30}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.753');
INSERT INTO public.product_need_scores VALUES (311, 30, 10, 65.91, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 30}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.753');
INSERT INTO public.product_need_scores VALUES (312, 30, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}, {"strength": 0.2, "relevance": 60, "effect_type": "positive", "contribution": 0.12, "ingredient_id": 10}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.753');
INSERT INTO public.product_need_scores VALUES (313, 30, 12, 85.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 85, "effect_type": "positive", "contribution": 0.17, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.753');
INSERT INTO public.product_need_scores VALUES (314, 30, 11, 0.00, NULL, '{"ingredients": [{"strength": 0.14, "relevance": 70, "effect_type": "negative", "contribution": 0.1, "ingredient_id": 22}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.753');
INSERT INTO public.product_need_scores VALUES (315, 30, 5, 70.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 30}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.753');
INSERT INTO public.product_need_scores VALUES (316, 31, 5, 73.38, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 6}, {"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}, {"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 30}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.764');
INSERT INTO public.product_need_scores VALUES (317, 31, 4, 82.87, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 85, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 6}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}, {"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 30}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.764');
INSERT INTO public.product_need_scores VALUES (318, 31, 11, 80.00, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 80, "effect_type": "positive", "contribution": 0.28, "ingredient_id": 6}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.764');
INSERT INTO public.product_need_scores VALUES (319, 31, 10, 61.32, NULL, '{"ingredients": [{"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 30}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.764');
INSERT INTO public.product_need_scores VALUES (320, 32, 12, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.775');
INSERT INTO public.product_need_scores VALUES (321, 32, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.775');
INSERT INTO public.product_need_scores VALUES (322, 32, 10, 51.11, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.775');
INSERT INTO public.product_need_scores VALUES (323, 32, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.775');
INSERT INTO public.product_need_scores VALUES (324, 33, 1, 88.08, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 1}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.784');
INSERT INTO public.product_need_scores VALUES (325, 33, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.784');
INSERT INTO public.product_need_scores VALUES (326, 33, 6, 81.15, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 1}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.784');
INSERT INTO public.product_need_scores VALUES (327, 33, 5, 82.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 1}, {"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.785');
INSERT INTO public.product_need_scores VALUES (328, 33, 9, 76.92, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}, {"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.785');
INSERT INTO public.product_need_scores VALUES (329, 33, 4, 87.12, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 3}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.785');
INSERT INTO public.product_need_scores VALUES (330, 33, 10, 58.26, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.785');
INSERT INTO public.product_need_scores VALUES (331, 33, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 60, "effect_type": "positive", "contribution": 0.21, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.785');
INSERT INTO public.product_need_scores VALUES (332, 33, 11, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.785');
INSERT INTO public.product_need_scores VALUES (333, 34, 4, 87.78, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.796');
INSERT INTO public.product_need_scores VALUES (334, 34, 10, 60.48, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.796');
INSERT INTO public.product_need_scores VALUES (335, 34, 3, 51.76, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}, {"strength": 0.35, "relevance": 40, "effect_type": "positive", "contribution": 0.14, "ingredient_id": 26}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.796');
INSERT INTO public.product_need_scores VALUES (336, 34, 5, 95.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.796');
INSERT INTO public.product_need_scores VALUES (337, 34, 11, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.796');
INSERT INTO public.product_need_scores VALUES (338, 35, 1, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.808');
INSERT INTO public.product_need_scores VALUES (339, 35, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.808');
INSERT INTO public.product_need_scores VALUES (340, 35, 6, 75.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.808');
INSERT INTO public.product_need_scores VALUES (341, 35, 5, 75.30, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 1}, {"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 6}, {"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 30}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.808');
INSERT INTO public.product_need_scores VALUES (342, 35, 9, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.808');
INSERT INTO public.product_need_scores VALUES (343, 35, 4, 83.14, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 85, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 6}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 30}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.808');
INSERT INTO public.product_need_scores VALUES (344, 35, 11, 80.00, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 80, "effect_type": "positive", "contribution": 0.28, "ingredient_id": 6}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.808');
INSERT INTO public.product_need_scores VALUES (345, 35, 10, 60.56, NULL, '{"ingredients": [{"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 30}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.808');
INSERT INTO public.product_need_scores VALUES (346, 36, 4, 92.78, NULL, '{"ingredients": [{"strength": 1, "relevance": 95, "effect_type": "positive", "contribution": 0.95, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 18}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.819');
INSERT INTO public.product_need_scores VALUES (347, 36, 10, 68.61, NULL, '{"ingredients": [{"strength": 1, "relevance": 95, "effect_type": "positive", "contribution": 0.95, "ingredient_id": 3}, {"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 8}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 18}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.819');
INSERT INTO public.product_need_scores VALUES (348, 36, 3, 60.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 60, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.819');
INSERT INTO public.product_need_scores VALUES (349, 36, 5, 81.92, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 8}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 17}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.819');
INSERT INTO public.product_need_scores VALUES (350, 36, 11, 79.93, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 8}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 17}, {"strength": 0.14, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.02, "ingredient_id": 23}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.819');
INSERT INTO public.product_need_scores VALUES (351, 37, 10, 51.11, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.829');
INSERT INTO public.product_need_scores VALUES (352, 37, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.829');
INSERT INTO public.product_need_scores VALUES (353, 37, 3, 40.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 40, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 26}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.829');
INSERT INTO public.product_need_scores VALUES (354, 38, 10, 84.44, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 14}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.84');
INSERT INTO public.product_need_scores VALUES (355, 38, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.84');
INSERT INTO public.product_need_scores VALUES (356, 38, 5, 70.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 14}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.84');
INSERT INTO public.product_need_scores VALUES (357, 39, 4, 95.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.85');
INSERT INTO public.product_need_scores VALUES (358, 39, 10, 45.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.85');
INSERT INTO public.product_need_scores VALUES (359, 39, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.85');
INSERT INTO public.product_need_scores VALUES (360, 39, 1, 60.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 60, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 34}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.85');
INSERT INTO public.product_need_scores VALUES (361, 39, 2, 65.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 65, "effect_type": "positive", "contribution": 0.65, "ingredient_id": 34}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.85');
INSERT INTO public.product_need_scores VALUES (362, 39, 7, 60.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 60, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 34}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.85');
INSERT INTO public.product_need_scores VALUES (363, 40, 4, 85.38, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 16}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.859');
INSERT INTO public.product_need_scores VALUES (364, 40, 10, 53.33, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.859');
INSERT INTO public.product_need_scores VALUES (365, 40, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.859');
INSERT INTO public.product_need_scores VALUES (366, 40, 7, 75.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 16}, {"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 27}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.859');
INSERT INTO public.product_need_scores VALUES (367, 40, 2, 85.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 27}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.859');
INSERT INTO public.product_need_scores VALUES (368, 41, 5, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.87');
INSERT INTO public.product_need_scores VALUES (369, 41, 10, 54.68, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 50, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 32}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.87');
INSERT INTO public.product_need_scores VALUES (370, 41, 11, 75.77, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}, {"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 32}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.87');
INSERT INTO public.product_need_scores VALUES (371, 41, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.87');
INSERT INTO public.product_need_scores VALUES (372, 42, 5, 72.44, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}, {"strength": 0.35, "relevance": 85, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 11}, {"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 30}, {"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 33}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.879');
INSERT INTO public.product_need_scores VALUES (373, 42, 10, 62.88, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 30}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.879');
INSERT INTO public.product_need_scores VALUES (374, 42, 11, 87.06, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}, {"strength": 0.35, "relevance": 90, "effect_type": "positive", "contribution": 0.32, "ingredient_id": 11}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.879');
INSERT INTO public.product_need_scores VALUES (375, 42, 4, 82.78, NULL, '{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 30}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.879');
INSERT INTO public.product_need_scores VALUES (376, 42, 3, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 33}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.879');
INSERT INTO public.product_need_scores VALUES (377, 43, 4, 88.85, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.889');
INSERT INTO public.product_need_scores VALUES (378, 43, 10, 60.48, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.889');
INSERT INTO public.product_need_scores VALUES (379, 43, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}, {"strength": 0.2, "relevance": 60, "effect_type": "positive", "contribution": 0.12, "ingredient_id": 10}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.889');
INSERT INTO public.product_need_scores VALUES (380, 43, 12, 85.00, NULL, '{"ingredients": [{"strength": 0.2, "relevance": 85, "effect_type": "positive", "contribution": 0.17, "ingredient_id": 10}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.889');
INSERT INTO public.product_need_scores VALUES (381, 44, 1, 87.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (382, 44, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 5}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (383, 44, 6, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (384, 44, 5, 70.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 1}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (385, 44, 9, 77.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (386, 44, 7, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 5}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (387, 44, 3, 65.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 65, "effect_type": "positive", "contribution": 0.52, "ingredient_id": 5}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (388, 44, 10, 51.11, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (389, 44, 4, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.898');
INSERT INTO public.product_need_scores VALUES (390, 45, 4, 91.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 95, "effect_type": "positive", "contribution": 0.95, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 18}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 19}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.908');
INSERT INTO public.product_need_scores VALUES (391, 45, 10, 61.63, NULL, '{"ingredients": [{"strength": 1, "relevance": 95, "effect_type": "positive", "contribution": 0.95, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 18}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 19}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 25, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 24}], "matched_count": 5}', 'high', '2026-04-03 04:36:11.908');
INSERT INTO public.product_need_scores VALUES (392, 45, 3, 60.00, NULL, '{"ingredients": [{"strength": 1, "relevance": 60, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.908');
INSERT INTO public.product_need_scores VALUES (393, 46, 4, 88.04, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 3}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.916');
INSERT INTO public.product_need_scores VALUES (394, 46, 10, 49.24, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 25, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 24}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.916');
INSERT INTO public.product_need_scores VALUES (395, 46, 3, 60.00, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 60, "effect_type": "positive", "contribution": 0.21, "ingredient_id": 3}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.916');
INSERT INTO public.product_need_scores VALUES (396, 46, 11, 82.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 11}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 40}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.916');
INSERT INTO public.product_need_scores VALUES (397, 46, 5, 65.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 11}, {"strength": 0.5, "relevance": 45, "effect_type": "positive", "contribution": 0.23, "ingredient_id": 40}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.916');
INSERT INTO public.product_need_scores VALUES (398, 47, 12, 95.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.928');
INSERT INTO public.product_need_scores VALUES (399, 47, 2, 85.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.928');
INSERT INTO public.product_need_scores VALUES (400, 47, 7, 80.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.928');
INSERT INTO public.product_need_scores VALUES (401, 47, 3, 75.00, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 7}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.928');
INSERT INTO public.product_need_scores VALUES (402, 47, 11, 90.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 11}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.928');
INSERT INTO public.product_need_scores VALUES (403, 47, 5, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 11}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.928');
INSERT INTO public.product_need_scores VALUES (404, 47, 10, 90.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 18}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.928');
INSERT INTO public.product_need_scores VALUES (405, 47, 4, 90.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 18}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.928');
INSERT INTO public.product_need_scores VALUES (406, 48, 5, 79.81, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 80, "effect_type": "positive", "contribution": 0.28, "ingredient_id": 8}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 11}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 17}, {"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 30}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.938');
INSERT INTO public.product_need_scores VALUES (407, 48, 10, 60.42, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 75, "effect_type": "positive", "contribution": 0.26, "ingredient_id": 8}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 30}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.938');
INSERT INTO public.product_need_scores VALUES (408, 48, 11, 89.05, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 85, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 8}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 11}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 17}], "matched_count": 3}', 'high', '2026-04-03 04:36:11.938');
INSERT INTO public.product_need_scores VALUES (409, 48, 4, 82.50, NULL, '{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 30}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.938');
INSERT INTO public.product_need_scores VALUES (410, 49, 1, 87.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (411, 49, 2, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 5}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (412, 49, 6, 80.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (413, 49, 5, 67.94, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 1}, {"strength": 0.35, "relevance": 65, "effect_type": "positive", "contribution": 0.23, "ingredient_id": 15}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (414, 49, 9, 77.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (415, 49, 7, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 5}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (416, 49, 3, 65.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 5}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (417, 49, 11, 80.00, NULL, '{"ingredients": [{"strength": 0.35, "relevance": 80, "effect_type": "positive", "contribution": 0.28, "ingredient_id": 15}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (418, 49, 10, 22.22, NULL, '{"ingredients": [{"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}, {"strength": 0.8, "relevance": 25, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 24}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.948');
INSERT INTO public.product_need_scores VALUES (419, 50, 3, 77.50, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 2}, {"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.959');
INSERT INTO public.product_need_scores VALUES (420, 50, 2, 85.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 2}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.959');
INSERT INTO public.product_need_scores VALUES (421, 50, 1, 70.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 2}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.959');
INSERT INTO public.product_need_scores VALUES (422, 50, 6, 70.00, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 2}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.959');
INSERT INTO public.product_need_scores VALUES (423, 50, 4, 88.85, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 2}', 'medium', '2026-04-03 04:36:11.959');
INSERT INTO public.product_need_scores VALUES (424, 50, 10, 60.48, NULL, '{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}, {"strength": 1, "relevance": 20, "effect_type": "positive", "contribution": 0.2, "ingredient_id": 21}], "matched_count": 4}', 'high', '2026-04-03 04:36:11.959');
INSERT INTO public.product_need_scores VALUES (425, 50, 11, 15.00, NULL, '{"ingredients": [{"strength": 0.14, "relevance": 15, "effect_type": "context_dependent", "contribution": 0.02, "ingredient_id": 23}], "matched_count": 1}', 'medium', '2026-04-03 04:36:11.959');


--
-- Data for Name: product_related_articles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: scoring_configs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.scoring_configs VALUES (1, 'rank_weight_need_compat', 0.500, 'ProductRankScore: Need uyumu ağırlığı', 'scoring', '2026-04-02 23:56:52.033564', '2026-04-02 23:56:52.033564');
INSERT INTO public.scoring_configs VALUES (2, 'rank_weight_strength', 0.200, 'ProductRankScore: Ingredient gücü ağırlığı', 'scoring', '2026-04-02 23:56:52.033564', '2026-04-02 23:56:52.033564');
INSERT INTO public.scoring_configs VALUES (3, 'rank_weight_label', 0.150, 'ProductRankScore: Etiket tutarlılığı ağırlığı', 'scoring', '2026-04-02 23:56:52.033564', '2026-04-02 23:56:52.033564');
INSERT INTO public.scoring_configs VALUES (4, 'rank_weight_completeness', 0.150, 'ProductRankScore: İçerik tamlığı ağırlığı', 'scoring', '2026-04-02 23:56:52.033564', '2026-04-02 23:56:52.033564');
INSERT INTO public.scoring_configs VALUES (5, 'penalty_fragrance', 0.600, 'Hassasiyet cezası: Parfüm', 'sensitivity', '2026-04-02 23:56:52.033564', '2026-04-02 23:56:52.033564');
INSERT INTO public.scoring_configs VALUES (6, 'penalty_alcohol', 0.700, 'Hassasiyet cezası: Alkol', 'sensitivity', '2026-04-02 23:56:52.033564', '2026-04-02 23:56:52.033564');
INSERT INTO public.scoring_configs VALUES (7, 'penalty_paraben', 0.800, 'Hassasiyet cezası: Paraben', 'sensitivity', '2026-04-02 23:56:52.033564', '2026-04-02 23:56:52.033564');
INSERT INTO public.scoring_configs VALUES (8, 'penalty_essential_oils', 0.750, 'Hassasiyet cezası: Esansiyel yağ', 'sensitivity', '2026-04-02 23:56:52.033564', '2026-04-02 23:56:52.033564');


--
-- Data for Name: sponsorship_disclosures; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: supplement_details; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: supplement_ingredients; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_corrections; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_skin_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_skin_profiles VALUES (1, 'demo-profile-1', 'oily', '[1, 6, 9]', '{"alcohol": false, "paraben": false, "fragrance": true, "essential_oils": false}', '25-34', '2026-04-02 23:56:52.071242', '2026-04-02 23:56:52.071242');
INSERT INTO public.user_skin_profiles VALUES (2, 'demo-profile-2', 'dry', '[4, 5, 10]', '{"alcohol": true, "paraben": false, "fragrance": false, "essential_oils": false}', '35-44', '2026-04-02 23:56:52.071242', '2026-04-02 23:56:52.071242');
INSERT INTO public.user_skin_profiles VALUES (3, 'demo-profile-3', 'combination', '[2, 3, 7]', '{"alcohol": false, "paraben": true, "fragrance": true, "essential_oils": false}', '25-34', '2026-04-02 23:56:52.071242', '2026-04-02 23:56:52.071242');
INSERT INTO public.user_skin_profiles VALUES (4, 'test-uuid-1234', 'combination', '[1, 2, 5]', '{"alcohol": false, "paraben": false, "fragrance": true, "essential_oils": false}', '25-34', '2026-04-03 00:22:49.9979', '2026-04-03 00:22:49.9979');
INSERT INTO public.user_skin_profiles VALUES (5, 'test-1', 'oily', '[1, 2]', '{}', NULL, '2026-04-03 00:58:43.061791', '2026-04-03 00:58:43.061791');


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: admin_roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_roles_role_id_seq', 5, true);


--
-- Name: admin_users_admin_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_users_admin_user_id_seq', 1, true);


--
-- Name: affiliate_links_affiliate_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.affiliate_links_affiliate_link_id_seq', 126, true);


--
-- Name: api_keys_api_key_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_keys_api_key_id_seq', 1, false);


--
-- Name: approved_wordings_wording_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.approved_wordings_wording_id_seq', 15, true);


--
-- Name: audit_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_log_id_seq', 1, false);


--
-- Name: batch_imports_import_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.batch_imports_import_id_seq', 1, false);


--
-- Name: brands_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_brand_id_seq', 19, true);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 13, true);


--
-- Name: content_articles_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_articles_article_id_seq', 7, true);


--
-- Name: evidence_levels_evidence_level_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.evidence_levels_evidence_level_id_seq', 8, true);


--
-- Name: formula_revisions_revision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.formula_revisions_revision_id_seq', 1, false);


--
-- Name: ingredient_aliases_alias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_aliases_alias_id_seq', 19, true);


--
-- Name: ingredient_evidence_links_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_evidence_links_link_id_seq', 59, true);


--
-- Name: ingredient_interactions_interaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_interactions_interaction_id_seq', 6, true);


--
-- Name: ingredient_need_mappings_ingredient_need_mapping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_need_mappings_ingredient_need_mapping_id_seq', 78, true);


--
-- Name: ingredient_related_articles_ingredient_related_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_related_articles_ingredient_related_article_id_seq', 16, true);


--
-- Name: ingredients_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredients_ingredient_id_seq', 40, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 3, true);


--
-- Name: need_related_articles_need_related_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.need_related_articles_need_related_article_id_seq', 14, true);


--
-- Name: needs_need_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.needs_need_id_seq', 16, true);


--
-- Name: price_history_price_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.price_history_price_history_id_seq', 1, false);


--
-- Name: product_images_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_images_image_id_seq', 50, true);


--
-- Name: product_ingredients_product_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_ingredients_product_ingredient_id_seq', 247, true);


--
-- Name: product_labels_product_label_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_labels_product_label_id_seq', 50, true);


--
-- Name: product_masters_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_masters_master_id_seq', 1, false);


--
-- Name: product_need_scores_product_need_score_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_need_scores_product_need_score_id_seq', 425, true);


--
-- Name: product_related_articles_product_related_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_related_articles_product_related_article_id_seq', 1, false);


--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_variants_variant_id_seq', 1, false);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_product_id_seq', 50, true);


--
-- Name: scoring_configs_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scoring_configs_config_id_seq', 8, true);


--
-- Name: sponsorship_disclosures_disclosure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sponsorship_disclosures_disclosure_id_seq', 1, false);


--
-- Name: supplement_details_supplement_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplement_details_supplement_detail_id_seq', 1, false);


--
-- Name: supplement_ingredients_supplement_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplement_ingredients_supplement_ingredient_id_seq', 1, false);


--
-- Name: user_corrections_correction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_corrections_correction_id_seq', 1, false);


--
-- Name: user_skin_profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_skin_profiles_profile_id_seq', 5, true);


--
-- Name: webhooks_webhook_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.webhooks_webhook_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

