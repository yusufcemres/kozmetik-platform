-- ============================================
-- BATCH 3: Product labels for products 51-100
-- ============================================
INSERT INTO product_labels (product_id, usage_instructions, warning_text, claim_texts_json, pao_info, origin_info, manufacturer_info) VALUES

-- 51: Cetaphil Gentle Skin Cleanser
(51,
 'Islak yüze masaj yaparak uygulayın veya pamukla silin. Durulama ile veya durulamadan kullanılabilir.',
 'Yalnızca harici kullanım. Göze temas etmesi halinde bol su ile durulayın.',
 '["Dermatolojik referans temizleyici", "pH dengeli formül", "Hassas ciltler için", "Sabun ve parfümsüz", "Nemlendirici temizlik"]',
 '12M', 'Kanada', 'Galderma Canada Inc., Thornhill, Kanada'),

-- 52: Cetaphil Moisturizing Cream
(52,
 'İhtiyaç duyulan bölgelere günde 1-2 kez uygulayın. Banyo veya duş sonrası nemli cilde uygulamak daha etkilidir.',
 'Yalnızca harici kullanım. Tahriş olması halinde kullanımı durdurun.',
 '["Klinik olarak kanıtlanmış 48 saat nemlendirme", "Çok kuru ve hassas ciltler için", "Dermatolog önerisi", "Parfümsüz", "Vücut ve yüz için"]',
 '12M', 'Kanada', 'Galderma Canada Inc., Thornhill, Kanada'),

-- 53: Cetaphil Sun SPF50+ Light Gel
(53,
 'Güneşe çıkmadan 15 dakika önce uygulayın. 2 saatte bir yenileyin. Su teması sonrası tekrar uygulayın.',
 'Güneş koruyucu tek başına tam koruma sağlamaz. Geniş kenarlı şapka ve koruyucu giysi kullanın.',
 '["SPF50+ geniş spektrum", "Hafif jel doku", "Mat bitiş", "Yağsız formül", "Gözenekleri tıkamaz"]',
 '12M', 'Kanada', 'Galderma Canada Inc., Thornhill, Kanada'),

-- 54: Paula''s Choice 2% BHA Liquid Exfoliant
(54,
 'Temizleme sonrası pamukla tüm yüze uygulayın. Günde 1-2 kez kullanılabilir. Yeni başlayanlar gün aşırı başlamalı.',
 'Güneş hassasiyeti artabilir, güneş koruyucu kullanın. AHA ile aynı rutinde kullanmaktan kaçının. Göz çevresine uygulamayın.',
 '["Salisilik Asit %2", "Siyah nokta ve gözenek temizleyici", "BHA eksfolyan", "Cilt tonunu eşitler", "Parfümsüz ve hayvan deneysiz"]',
 '12M', 'ABD', 'Paula''s Choice LLC, Seattle, ABD'),

-- 55: Paula''s Choice 10% Niacinamide Booster
(55,
 'Temizleme sonrası birkaç damla yüze uygulayın. Serum veya nemlendirici ile karıştırılabilir. Sabah ve akşam kullanılabilir.',
 'Hassas ciltlerde yüksek konsantrasyon tahriş yapabilir. Az miktarla başlayın.',
 '["Niacinamide %10", "Gözenek küçültücü", "Cilt tonu eşitleyici", "Yağ dengeleyici", "Parfümsüz"]',
 '12M', 'ABD', 'Paula''s Choice LLC, Seattle, ABD'),

-- 56: Paula''s Choice C15 Super Booster
(56,
 'Sabah temizleme sonrası birkaç damla yüze uygulayın. Nemlendirici altına. Güneş koruyucu ile birlikte kullanın.',
 'Açık renk, zamanla oksidasyonla koyulaşabilir. Serin ve karanlık yerde saklayın. AHA/BHA ile ayrı rutinlerde kullanın.',
 '["C Vitamini %15", "E Vitamini + Ferulic Acid", "Antioksidan üçlüsü", "Aydınlatıcı ve koruyucu", "Paraben ve parfümsüz"]',
 '6M', 'ABD', 'Paula''s Choice LLC, Seattle, ABD'),

-- 57: Drunk Elephant Protini Polypeptide Cream
(57,
 'Temizleme ve serum sonrası bezelye büyüklüğünde yüze ve boyuna uygulayın. Sabah ve akşam.',
 'Yalnızca harici kullanım. Tahriş olması halinde kullanımı bırakın.',
 '["9 peptit kompleksi", "Protein bazlı anti-aging", "Silikon ve parfümsüz", "Tüm cilt tipleri için", "Clean beauty"]',
 '12M', 'ABD', 'Drunk Elephant LLC, Houston, ABD'),

-- 58: Drunk Elephant T.L.C. Sukari Babyfacial
(58,
 'Haftada 1-2 kez temiz ve kuru cilde uygulayın. 20 dakika bekletin. Ilık su ile durulayın. Ardından nemlendirici uygulayın.',
 'Güçlü peeling — güneş hassasiyeti ciddi artabilir. Güneş koruyucu mutlaka kullanın. Retinol ile aynı gün kullanmayın.',
 '["AHA %25 + BHA %2", "Profesyonel peeling maskesi", "Tartarik, Glikolik, Laktik asit karışımı", "10 dakikada gözle görülür parlaklık", "Vegan ve temiz formül"]',
 '12M', 'ABD', 'Drunk Elephant LLC, Houston, ABD'),

-- 59: Drunk Elephant B-Hydra Intensive Hydration Serum
(59,
 'Temizleme sonrası yüze uygulayın. Diğer serumlarla veya nemlendiriciyle karıştırılabilir. Sabah ve akşam.',
 'Yalnızca harici kullanım. Göze temas ettiğinde durulayın.',
 '["Provitamin B5 bazlı", "Yoğun nemlendirme", "Kaktüs özü", "Anında dolgunluk ve parlaklık", "Silikon ve parfümsüz"]',
 '12M', 'ABD', 'Drunk Elephant LLC, Houston, ABD'),

-- 60: Isntree Hyaluronic Acid Toner
(60,
 'Temizleme sonrası pamukla veya avuç içiyle yüze uygulayın. Katman katman uygulanabilir (7-skin method). Sabah ve akşam.',
 'Yalnızca harici kullanım. Tahriş olursa kullanımı durdurun.',
 '["Hyaluronic Acid %50 kompleks", "Düşük + Yüksek molekül ağırlıklı HA", "7 katmanlı nemlendirme", "Vegan ve parfümsüz", "Hassas ciltler için uygun"]',
 '12M', 'Güney Kore', 'Isntree Co., Ltd., Seul, Güney Kore'),

-- 61: Isntree Green Tea Fresh Emulsion
(61,
 'Tonik sonrası yüze uygulayın. Hafif doku sayesinde katman yapılabilir. Sabah ve akşam.',
 'Yalnızca harici kullanım.',
 '["Yeşil çay özü %80", "Hafif emülsiyon doku", "Antioksidan koruma", "Yağlı ve karma ciltler için ideal", "Gözenekleri tıkamaz"]',
 '12M', 'Güney Kore', 'Isntree Co., Ltd., Seul, Güney Kore'),

-- 62: Isntree HA Watery Sun Gel SPF50+
(62,
 'Güneşe çıkmadan 15 dakika önce yüze uygulayın. Makyaj altına uygun. 2 saatte bir yenileyin.',
 'Göz temasından kaçının. Güneş koruyucu tek başına tam koruma sağlamaz.',
 '["SPF50+ PA++++", "Hyaluronic Acid içerikli", "Sulu jel doku", "Beyaz iz bırakmaz", "Nemlendirici güneş koruma"]',
 '12M', 'Güney Kore', 'Isntree Co., Ltd., Seul, Güney Kore'),

-- 63: Beauty of Joseon Glow Serum: Propolis + Niacinamide
(63,
 'Temizleme ve tonik sonrası birkaç damla yüze uygulayın. Nemlendirici öncesi. Sabah ve akşam.',
 'Propolis alerjisi olanlarda dikkatli kullanılmalıdır. Patch test önerilir.',
 '["Propolis %60 + Niacinamide %2", "Parlaklık ve nem", "Kore güzellik klasiği", "Hassas ciltlere uygun", "Vegan formül"]',
 '12M', 'Güney Kore', 'Beauty of Joseon Co., Ltd., Seul, Güney Kore'),

-- 64: Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+
(64,
 'Güneşe çıkmadan önce yüze uygulayın. Makyaj bazı olarak kullanılabilir. 2-3 saatte bir yenileyin.',
 'Göz çevresinden kaçının. Güneş koruyucu tek başına tam koruma sağlamaz.',
 '["SPF50+ PA++++", "Pirinç + Probiyotik", "Organik güneş filtresi", "Hafif ve nemlendirici", "K-beauty bestseller"]',
 '12M', 'Güney Kore', 'Beauty of Joseon Co., Ltd., Seul, Güney Kore'),

-- 65: Beauty of Joseon Glow Deep Serum: Rice + Alpha-Arbutin
(65,
 'Temizleme sonrası birkaç damla yüze uygulayın. Akşam rutininde leke karşıtı bakım için ideal.',
 'Hassas ciltlerde patch test yapın. Göz çevresinden kaçının.',
 '["Pirinç suyu + Alpha Arbutin %2", "Leke karşıtı aydınlatıcı", "Geleneksel Kore formülü", "Nemlendirici etki", "Parfümsüz"]',
 '12M', 'Güney Kore', 'Beauty of Joseon Co., Ltd., Seul, Güney Kore'),

-- 66: Missha Time Revolution Night Repair Ampoule
(66,
 'Akşam temizleme ve tonik sonrası yüze uygulayın. 2-3 pompa yeterlidir. Nemlendirici öncesi.',
 'Yalnızca harici kullanım. Hassas ciltlerde patch test önerilir.',
 '["Bifida Ferment Lysate %97", "Gece onarım formülü", "Anti-aging + parlaklık", "SK-II''ye ekonomik alternatif", "Fermente aktif"]',
 '12M', 'Güney Kore', 'ABLE C&C Co., Ltd. (Missha), Seul, Güney Kore'),

-- 67: Missha Safe Block Essence Sun SPF45
(67,
 'Güneşe çıkmadan 15 dakika önce yüze uygulayın. Günlük kullanım güneş esansı.',
 'Göz temasından kaçının. 2-3 saatte bir yenileyin.',
 '["SPF45 PA+++", "Hafif esans doku", "Yapışmaz bitiş", "Günlük kullanıma uygun", "Makyaj altına ideal"]',
 '12M', 'Güney Kore', 'ABLE C&C Co., Ltd. (Missha), Seul, Güney Kore'),

-- 68: Missha Vita C Plus Spot Correcting Ampoule
(68,
 'Sabah temizleme sonrası leke bölgelerine veya tüm yüze uygulayın. Güneş koruyucu ile birlikte.',
 'Hassas ciltlerde tahriş yapabilir. Az miktarla başlayın. AHA/BHA ile dikkatli kombine edin.',
 '["C Vitamini yüksek konsantrasyon", "Leke düzeltici", "Aydınlatıcı ampul", "Koyu lekeler ve ton eşitsizliği", "Antioksidan formül"]',
 '6M', 'Güney Kore', 'ABLE C&C Co., Ltd. (Missha), Seul, Güney Kore'),

-- 69: Garnier Micellar Cleansing Water
(69,
 'Pamuğa bol miktarda uygulayın. Yüz, göz ve dudak bölgesini hafifçe silin. Durulama gerektirmez.',
 'Göz hassasiyeti olan kişilerde dikkatli kullanın.',
 '["Micellar teknoloji", "Makyaj çözücü", "Durulama gerektirmez", "Tüm cilt tipleri", "Dermatolojik olarak test edilmiş"]',
 '12M', 'Fransa', 'L''Oréal Paris / Garnier, Clichy, Fransa'),

-- 70: Garnier Vitamin C Brightening Serum
(70,
 'Sabah temizleme sonrası birkaç damla yüze uygulayın. Nemlendirici ve güneş koruyucu öncesi.',
 'Hassas ciltlerde patch test yapın. Güneş koruyucu kullanın.',
 '["Vitamin C %3.5", "Niacinamide + Salisilik Asit", "Leke karşıtı serum", "30 günde gözle görülür etki", "Dermatolojik test"]',
 '6M', 'Fransa', 'L''Oréal Paris / Garnier, Clichy, Fransa'),

-- 71: Garnier Ambre Solaire Sensitive Advanced SPF50+
(71,
 'Güneşe çıkmadan 15-20 dakika önce bol miktarda uygulayın. 2 saatte bir ve yüzme sonrası yenileyin.',
 'Bebekleri doğrudan güneşten koruyun. Güneş koruyucu tam koruma sağlamaz. Tekstillere leke bırakabilir.',
 '["SPF50+ geniş spektrum", "Hassas ciltler için", "Suya dayanıklı", "Hipoalerjenik", "Parfümsüz formül"]',
 '12M', 'Fransa', 'L''Oréal Paris / Garnier, Clichy, Fransa'),

-- 72: Nivea Q10 Power Anti-Wrinkle Day Cream SPF15
(72,
 'Her sabah temiz cilde yüz ve boyuna uygulayın. Makyaj bazı olarak kullanılabilir.',
 'Göz çevresine uygulamayın. Tahriş olursa kullanmayı bırakın.',
 '["Koenzim Q10", "SPF15 koruma", "Anti-kırışıklık bakım", "10 saat nemlendirme", "Cilt sıkılığını artırır"]',
 '12M', 'Almanya', 'Beiersdorf AG, Hamburg, Almanya'),

-- 73: Nivea Creme
(73,
 'İhtiyaç duyulan bölgelere günde birkaç kez uygulayın. Yüz, el ve vücut için uygundur.',
 'Yalnızca harici kullanım.',
 '["Klasik nemlendirme formülü", "Panthenol + Glycerin", "Tüm cilt tipleri", "Yüz ve vücut kullanımı", "100+ yıllık güvenilirlik"]',
 '30M', 'Almanya', 'Beiersdorf AG, Hamburg, Almanya'),

-- 74: Nivea Cellular Expert Filler Eye & Lip Cream
(74,
 'Sabah ve akşam göz çevresi ve dudak çevresine yüzük parmağıyla hafifçe uygulayın.',
 'Göze doğrudan temas ettirmeyin.',
 '["Hyaluronic Acid + Collagen booster", "Göz + dudak çevresi bakımı", "Kırışıklık doldurucu etki", "Şişlik ve morluk azaltıcı", "Dermatolojik onay"]',
 '6M', 'Almanya', 'Beiersdorf AG, Hamburg, Almanya'),

-- 75: Innisfree Green Tea Seed Serum
(75,
 'Temizleme ve tonik sonrası 2-3 pompa yüze uygulayın. Nemlendirici öncesi. Sabah ve akşam.',
 'Yalnızca harici kullanım. Tahriş olursa durdurun.',
 '["Jeju yeşil çay tohumu özü", "3-kat nemlendirme teknolojisi", "Antioksidan serum", "Tüm cilt tipleri", "Doğal içerikli"]',
 '12M', 'Güney Kore', 'Amorepacific / Innisfree, Seul, Güney Kore'),

-- 76: Innisfree Daily UV Defence SPF36
(76,
 'Bakım rutininizin son adımı olarak yüze uygulayın. Makyaj altına uygun.',
 'Güneş koruyucu tek başına tam koruma sağlamaz. Yoğun güneş altında daha yüksek SPF önerilir.',
 '["SPF36 PA++", "Günlük kullanım", "Hafif ve doğal bitiş", "Yapışmaz doku", "Yeşil çay özlü"]',
 '12M', 'Güney Kore', 'Amorepacific / Innisfree, Seul, Güney Kore'),

-- 77: Innisfree Green Tea Foam Cleanser
(77,
 'Islak yüze masaj yaparak uygulayın. Köpürtün ve ılık su ile durulayın. Sabah ve akşam.',
 'Göz temasından kaçının.',
 '["Jeju organik yeşil çay", "Antioksidan temizlik", "Nazik köpük doku", "Amino asit bazlı surfaktan", "pH 5.5"]',
 '12M', 'Güney Kore', 'Amorepacific / Innisfree, Seul, Güney Kore'),

-- 78: LRP Effaclar Purifying Foaming Gel
(78,
 'Islak yüze masaj yaparak uygulayın. Köpürtün ve bol su ile durulayın. Sabah ve akşam. Makyaj temizliği öncesi ilk adım olarak da kullanılabilir.',
 'Göz temasından kaçının. Aşırı kurutucu bulursanız yalnızca akşam kullanın.',
 '["Zinc pidolate", "Yağlı ciltler için arındırıcı", "Sabun ve paraben içermez", "Gözenekleri temizler", "Dermatolojik test"]',
 '12M', 'Fransa', 'La Roche-Posay Laboratoire Pharmaceutique, La Roche-Posay, Fransa'),

-- 79: LRP Cicaplast Baume B5+
(79,
 'Temiz ve kuru cilde günde 1-2 kez uygulayın. Tahriş olmuş, kurumuş veya işlem sonrası bölgelere. Bebek pişiklerinde de kullanılabilir.',
 'Derin ve enfekte yaralarda kullanmayın. Yalnızca harici kullanım.',
 '["Panthenol %5 + Madecassoside", "Yenilenmiş B5+ formül", "Onarıcı ve yatıştırıcı balsam", "Tüm aile için uygun", "Mikrobiom dostu"]',
 '12M', 'Fransa', 'La Roche-Posay Laboratoire Pharmaceutique, La Roche-Posay, Fransa'),

-- 80: LRP Retinol B3 Serum
(80,
 'Akşam temizleme sonrası birkaç damla yüze uygulayın. Haftada 2-3 kez başlayıp tolerans geliştikçe her akşam kullanın.',
 'Hamilelik ve emzirme döneminde kullanmayın. Güneş hassasiyeti artırır — güneş koruyucu kullanın. AHA/BHA ile dikkatli kombine edin.',
 '["Saf Retinol + Niacinamide", "Kırışıklık ve leke karşıtı", "Dermatolojik protokol", "Hassas ciltlerde bile tolere edilir", "Vitamin B3 ile güçlendirilmiş"]',
 '6M', 'Fransa', 'La Roche-Posay Laboratoire Pharmaceutique, La Roche-Posay, Fransa'),

-- 81: CeraVe Moisturising Lotion
(81,
 'Temiz cilde sabah ve akşam uygulayın. Banyo sonrası nemli cilde uygulamak daha etkilidir. Yüz ve vücut için.',
 'Yalnızca harici kullanım.',
 '["3 Esansiyel Ceramide", "MVE teknolojisi — 24 saat nemlendirme", "Hafif losyon doku", "Yüz ve vücut için", "Parfümsüz ve non-komedojen"]',
 '12M', 'ABD', 'L''Oréal / CeraVe, New York, ABD'),

-- 82: CeraVe Skin Renewing Retinol Serum
(82,
 'Akşam temizleme sonrası birkaç damla yüze uygulayın. Haftada 2-3 kez başlayın. Göz çevresinden kaçının.',
 'Hamilelik ve emzirme döneminde kullanmayın. Güneş hassasiyeti artırır. Güneş koruyucu mutlaka kullanın.',
 '["Enkapsüle Retinol", "3 Ceramide ile bariyeri korur", "Niacinamide destekli", "Kırışıklık azaltıcı", "Hassas ciltler için formüle edilmiş"]',
 '6M', 'ABD', 'L''Oréal / CeraVe, New York, ABD'),

-- 83: TO Lactic Acid 10% + HA
(83,
 'Akşam temizleme sonrası birkaç damla yüze uygulayın. Göz çevresi hariç. Haftada 2-3 kez başlayın.',
 'Güneş hassasiyeti artırır — güneş koruyucu kullanın. Diğer güçlü asitlerle kombine etmeyin. Hassas ciltlerde patch test yapın.',
 '["Laktik Asit %10", "Hyaluronic Acid destekli", "Nazik AHA peeling", "Tasmanya biber suyu ile tahriş azaltma", "Cilt tonunu eşitler"]',
 '6M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 84: TO Multi-Peptide + HA Serum
(84,
 'Temizleme sonrası birkaç damla yüze uygulayın. Su bazlı serumlardan sonra, yağ bazlılardan önce. Sabah ve akşam.',
 'Doğrudan C vitamini ile aynı rutinde kullanmaktan kaçının. Yalnızca harici kullanım.',
 '["Çoklu peptit kompleksi", "Hyaluronic Acid + Amino asitler", "Anti-aging + nemlendirme", "Sıkılaştırıcı etki", "Vegan formül"]',
 '12M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 85: TO Natural Moisturizing Factors + HA
(85,
 'Temizleme ve serum sonrası yüze uygulayın. Sabah ve akşam. Son adım olarak kullanın.',
 'Yalnızca harici kullanım.',
 '["Doğal nem faktörleri", "Hyaluronic Acid + Amino asit", "Hafif nemlendirici krem", "Cilt bariyerini destekler", "Vegan ve parfümsüz"]',
 '12M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 86: Bioderma Photoderm Aquafluide SPF50+
(86,
 'Güneşe çıkmadan 20 dakika önce yüze uygulayın. 2 saatte bir yenileyin.',
 'Güneş koruyucu tek başına tam koruma sağlamaz. Bebekleri güneşten uzak tutun.',
 '["SPF50+ PA++++", "Cellular Bioprotection teknolojisi", "Ultra hafif sulu doku", "Parlama karşıtı", "Hassas ciltlere uygun"]',
 '12M', 'Fransa', 'NAOS / Bioderma, Lyon, Fransa'),

-- 87: Bioderma Sensibio H2O 500ml
(87,
 'Pamuğa bol miktarda uygulayın. Yüz ve göz bölgesini nazikçe silin. Durulama gerektirmez.',
 'Göz hassasiyeti devam ederse kullanmayı bırakın.',
 '["İkonik micellar su", "Hassas ciltler için #1", "Makyaj + kirlilik temizleyici", "Gözyaşı pH''sına uygun", "Parfümsüz ve hipoalerjenik"]',
 '12M', 'Fransa', 'NAOS / Bioderma, Lyon, Fransa'),

-- 88: COSRX AHA 7 Whitehead Power Liquid
(88,
 'Akşam temizleme sonrası pamukla yüze uygulayın. Haftada 2-3 kez başlayıp tolerans geliştirin.',
 'Güneş hassasiyeti ciddi artabilir. Güneş koruyucu mutlaka kullanın. BHA ile aynı gün kullanmaktan kaçının.',
 '["Glikolik Asit %7", "Apple water bazlı AHA", "Beyaz nokta ve pürüzsüzlük", "Cilt yenilenme hızlandırıcı", "Düşük pH formül"]',
 '12M', 'Güney Kore', 'COSRX Inc., Seul, Güney Kore'),

-- 89: COSRX Full Fit Propolis Light Ampoule
(89,
 'Temizleme ve tonik sonrası 2-3 damla yüze uygulayın. Sabah ve akşam. Nemlendirici öncesi.',
 'Propolis alerjisi olan kişilerde dikkatli kullanılmalıdır.',
 '["Propolis özü %73.5", "Doğal nem + onarım", "Parlaklık veren ampul", "Hassas ciltlere uygun", "Yapışkan olmayan hafif doku"]',
 '12M', 'Güney Kore', 'COSRX Inc., Seul, Güney Kore'),

-- 90: COSRX Oil-Free Birch Sap Lotion
(90,
 'Temizleme ve serum sonrası yüze uygulayın. Sabah ve akşam nemlendirici olarak.',
 'Yalnızca harici kullanım.',
 '["Huş ağacı özü %70", "Yağsız nemlendirme", "Yağlı ve karma ciltler için", "Gözenekleri tıkamaz", "Hafif losyon doku"]',
 '12M', 'Güney Kore', 'COSRX Inc., Seul, Güney Kore'),

-- 91: Vichy Neovadiol Meno 5 Bi-Serum
(91,
 'Sabah ve akşam temiz cilde uygulayın. Nemlendirici öncesi. Çalkalayıp kullanın (bi-faz formül).',
 'Hamilelik döneminde kullanım öncesi doktora danışın.',
 '["5 aktif bileşen", "Menopoz sonrası cilt bakımı", "Bi-serum teknolojisi", "Sıkılaştırma + aydınlatma", "Vichy termal suyu"]',
 '6M', 'Fransa', 'Vichy Laboratoires / L''Oréal, Vichy, Fransa'),

-- 92: Vichy Mineral 89 Eyes
(92,
 'Sabah ve akşam göz çevresine yüzük parmağıyla hafifçe vurarak uygulayın.',
 'Göze doğrudan temas ettirmeyin. Tahriş olursa durdurun.',
 '["Hyaluronic Acid + Kafein", "Göz çevresi güçlendirici", "Şişlik ve morluk azaltıcı", "Mineralleştirici Vichy suyu", "Parfümsüz jel doku"]',
 '6M', 'Fransa', 'Vichy Laboratoires / L''Oréal, Vichy, Fransa'),

-- 93: Eucerin Sun Oil Control Dry Touch SPF50+
(93,
 'Güneşe çıkmadan 15 dakika önce bol miktarda uygulayın. 2 saatte bir yenileyin.',
 'Güneş koruyucu tam koruma sağlamaz. Göz çevresinden kaçının.',
 '["SPF50+ geniş spektrum", "Oil Control teknolojisi", "8 saat mat bitiş", "Kuru dokunuş", "Akneye eğilimli ciltler için"]',
 '12M', 'Almanya', 'Beiersdorf AG / Eucerin, Hamburg, Almanya'),

-- 94: Eucerin Hyaluron-Filler Night Cream
(94,
 'Akşam temiz cilde yüz ve boyuna uygulayın. Serum sonrası kullanılabilir.',
 'Yalnızca harici kullanım. Göz çevresine uygulamayın.',
 '["Hyaluronic Acid çift etki", "Gece kırışıklık doldurucu", "Cilt yenilenme desteği", "Dermo-kozmetik formül", "Klinik olarak kanıtlanmış"]',
 '12M', 'Almanya', 'Beiersdorf AG / Eucerin, Hamburg, Almanya'),

-- 95: SVR Sun Secure Blur SPF50+
(95,
 'Güneşe çıkmadan önce yüze uygulayın. Makyaj bazı olarak kullanılabilir. 2 saatte bir yenileyin.',
 'Göz çevresinden kaçının. Güneş koruyucu tek başına tam koruma sağlamaz.',
 '["SPF50+ geniş spektrum", "Mousse doku — optik bulanıklaştırıcı", "Gözenek kamufle edici", "Mat bitiş", "Parfümsüz"]',
 '12M', 'Fransa', 'SVR Laboratoire Dermatologique, Paris, Fransa'),

-- 96: Avene RetrinAL 0.1 Intensive Cream
(96,
 'Akşam temiz cilde ince bir tabaka halinde yüze uygulayın. Haftada 2-3 kez başlayın.',
 'Hamilelik ve emzirme döneminde kullanmayın. Güneş hassasiyeti artırır. AHA/BHA ile kombine etmekten kaçının.',
 '["Retinaldehit %0.1", "Retinolden daha etkili, retinoik asitten daha tolerabl", "Anti-aging yoğun bakım", "Avene termal suyu", "Kırışıklık + leke azaltıcı"]',
 '6M', 'Fransa', 'Pierre Fabre Dermo-Cosmetique, Toulouse, Fransa'),

-- 97: Klairs Midnight Blue Calming Cream
(97,
 'Akşam bakım rutininin son adımı olarak hassas ve kızarmış bölgelere uygulayın. İnce bir tabaka yeterlidir.',
 'Yalnızca harici kullanım. Derin yaralara uygulamayın.',
 '["Guaiazulene (papatya özü)", "Yatıştırıcı mavi krem", "Kızarıklık ve tahriş azaltıcı", "Hassas ve reaktif ciltler", "EWG verified — temiz formül"]',
 '12M', 'Güney Kore', 'Wishcompany / Klairs, Seul, Güney Kore'),

-- 98: Purito From Green Cleansing Oil
(98,
 'Kuru yüze 2-3 pompa uygulayın. Dairesel hareketlerle masaj yapın. Islak elle emülsifiye edin, ardından durulayın.',
 'Göz temasından kaçının. Yalnızca harici kullanım.',
 '["Bitkisel yağ bazlı", "Çift temizlemenin ilk adımı", "Makyaj + güneş kremi çözücü", "Hafif ve nazik formül", "Vegan ve cruelty-free"]',
 '12M', 'Güney Kore', 'Purito Co., Ltd., Seul, Güney Kore'),

-- 99: Some By Mi Truecica Mineral Sun SPF50+
(99,
 'Güneşe çıkmadan 15 dakika önce yüze uygulayın. 2-3 saatte bir yenileyin.',
 'Mineral filtreler beyazımsı bir iz bırakabilir. Göz çevresinden kaçının.',
 '["SPF50+ PA++++", "Mineral filtre (Zinc Oxide)", "Centella asiatica yatıştırıcı", "Hassas ve akneye eğilimli ciltler", "Kimyasal filtre içermez"]',
 '12M', 'Güney Kore', 'Some By Mi Co., Ltd., Seul, Güney Kore'),

-- 100: Hada Labo Shirojyun Premium Whitening Lotion
(100,
 'Temizleme sonrası avuç içiyle veya pamukla yüze uygulayın. Katman katman uygulanabilir. Sabah ve akşam.',
 'Hassas ciltlerde patch test yapın. Göz çevresinden kaçının.',
 '["Traneksamik Asit", "Vitamin C türevi", "Leke karşıtı Japon formülü", "Nemlendirici losyon/tonik", "Hyaluronic Acid destekli"]',
 '12M', 'Japonya', 'Rohto Pharmaceutical Co., Ltd., Osaka, Japonya');
