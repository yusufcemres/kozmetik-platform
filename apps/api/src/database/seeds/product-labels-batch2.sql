-- Product labels for remaining 37 products
INSERT INTO product_labels (product_id, usage_instructions, warning_text, claim_texts_json, pao_info, origin_info, manufacturer_info) VALUES

-- 8: Bioderma Sebium Global
(8,
 'Temiz cilde sabah ve/veya akşam uygulayın. Tüm yüze ince bir tabaka halinde sürün. Göz çevresi hariç.',
 'Göz temasından kaçının. Kullanım başlangıcında hafif soyulma ve kuruluk normal kabul edilir. Cilt tahriş olursa kullanımı bırakın.',
 '["Salisilik asit + Glikolik asit", "Sıkılaştırıcı + matlaştırıcı etki", "Gözenekleri arındırır", "Yağlı ve akneye eğilimli ciltler için", "Non-komedojen"]',
 '12M', 'Fransa', 'NAOS / Bioderma, Lyon, Fransa'),

-- 9: Avene Cicalfate+ Onarıcı Krem
(9,
 'Temiz ve kuru cilde günde 1-2 kez uygulayın. Tahriş olmuş, çatlamış veya işlem sonrası ciltte kullanılabilir.',
 'Derin ve enfekte yaralarda kullanmayın. Yalnızca harici kullanım içindir.',
 '["Sucralfate + Bakır-Çinko", "Onarıcı ve yatıştırıcı", "Avene termal suyu", "Hassas ve tahriş olmuş ciltler", "Steril formül"]',
 '12M', 'Fransa', 'Pierre Fabre Dermo-Cosmetique, Toulouse, Fransa'),

-- 10: Avene Tolerance Extreme Emulsion
(10,
 'Temiz cilde sabah ve akşam uygulayın. Hassas ciltlerde güvenle kullanılabilir. Makyaj altına uygundur.',
 'Yalnızca harici kullanım. Göz çevresinden kaçının.',
 '["Sadece 7 içerik", "Parfümsüz, koruyucusuz", "Steril kozmetik (D.E.F.I. teknolojisi)", "Aşırı hassas ve intoleran ciltler için"]',
 '6M', 'Fransa', 'Pierre Fabre Dermo-Cosmetique, Toulouse, Fransa'),

-- 15: TO Ascorbic Acid 8% + Alpha Arbutin 2%
(15,
 'Sabah temizleme sonrası birkaç damla yüze uygulayın. Nemlendirici öncesi kullanın. Güneş koruyucu ile birlikte kullanılmalıdır.',
 'Hassas ciltlerde patch test yapın. Niacinamide ile aynı rutinde kullanılabilir ancak güçlü asitlerle birleştirmekten kaçının.',
 '["C Vitamini + Alpha Arbutin", "Leke karşıtı", "Aydınlatıcı etki", "Antioksidan koruma", "Vegan formül"]',
 '6M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 16: TO Azelaic Acid Suspension 10%
(16,
 'Akşam bakım rutininde, serum sonrası son adım olarak uygulayın. İnce bir tabaka halinde tüm yüze sürün.',
 'Göz çevresinden kaçının. Hamilelikte doktor kontrolünde kullanılabilir. İlk kullanımda hafif karıncalanma normal kabul edilir.',
 '["Azelaic Acid %10", "Leke ve ton eşitsizliği", "Gözenek görünümünü azaltır", "Parlama karşıtı", "Vegan"]',
 '12M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 17: COSRX Advanced Snail 96 Mucin Power Essence
(17,
 'Toner sonrası avuç içine 2-3 pompa alın, yüze ve boyuna hafifçe bastırarak uygulayın. Sabah ve akşam kullanılabilir.',
 'Salyangoz alerjisi olanlar kullanmamalıdır. Açık yaralara uygulamayın.',
 '["Snail Secretion Filtrate %96.3", "Derin nemlendirme", "Onarıcı ve yatıştırıcı", "Hasar görmüş cilt bariyerini güçlendirir", "Hafif jel doku"]',
 '12M', 'Güney Kore', 'COSRX Inc., Seul, Güney Kore'),

-- 18: COSRX Low pH Good Morning Gel Cleanser
(18,
 'Islak yüze az miktarda uygulayın, köpürterek 30-60 saniye masaj yapın, ılık suyla durulayın. Sabah temizliği için idealdir.',
 'Göz temasından kaçının. Çok kuru ciltlerde günde 1 kullanım yeterlidir.',
 '["pH 5.0-6.0 dengeli", "BHA (Betaine Salicylate) içerir", "Çay ağacı yağı", "Hassas ciltler için nazik temizlik", "Sabah temizliği için ideal"]',
 '12M', 'Güney Kore', 'COSRX Inc., Seul, Güney Kore'),

-- 19: COSRX BHA Blackhead Power Liquid
(19,
 'Toner sonrası pamuk üzerine döküp yüze uygulayın veya avuç içinden parmak uçlarıyla sürün. Başlangıçta haftada 2-3 kez, alıştıkça günlük kullanın.',
 'Göz çevresinden ve mukoza membranlarından uzak tutun. AHA ile aynı rutinde kullanırken dikkatli olun.',
 '["Betaine Salicylate %4 (BHA)", "Siyah nokta karşıtı", "Gözenekleri derinlemesine temizler", "Söğüt ağacı kabuğu özütü", "Düşük pH formül"]',
 '12M', 'Güney Kore', 'COSRX Inc., Seul, Güney Kore'),

-- 21: Neutrogena Ultra Sheer Dry-Touch SPF55
(21,
 'Güneşe çıkmadan 15 dakika önce bol miktarda uygulayın. 2 saatte bir ve yüzdükten/terlendikten sonra tekrarlayın.',
 'Göz temasından kaçının. 6 ay altı bebeklerde doktor onayı olmadan kullanmayın. Cilt tahriş olursa durdurun.',
 '["SPF 55 geniş spektrum", "Dry-Touch teknolojisi", "Helioplex formül", "Mat bitiş", "Yüz ve vücut için", "Suya dayanıklı (80 dk)"]',
 '12M', 'ABD', 'Johnson & Johnson Consumer Inc., NJ, ABD'),

-- 22: SVR Sebiaclear Serum
(22,
 'Temiz cilde sabah ve/veya akşam uygulayın. Nemlendirici öncesi tüm yüze ince bir tabaka halinde sürün.',
 'Göz çevresinden kaçının. Hamilelikte kullanmadan önce doktora danışın.',
 '["Niacinamide %4 + Glukonolakton %14", "Gözenek sıkılaştırıcı", "Sebum düzenleyici", "Leke karşıtı", "Hassas ciltler için uygun"]',
 '12M', 'Fransa', 'Laboratoires SVR, Paris, Fransa'),

-- 23: SVR Ampoule B3 Hydra
(23,
 'Sabah ve akşam temiz cilde 4-5 damla uygulayın. Nemlendirici öncesi kullanın.',
 'Yalnızca harici kullanım. Göz temasından kaçının.',
 '["Niacinamide %5 + Hyaluronic Acid", "48 saat nemlendirme", "Cilt bariyerini onarır", "Leke karşıtı", "Parfümsüz"]',
 '12M', 'Fransa', 'Laboratoires SVR, Paris, Fransa'),

-- 25: Eucerin DermoPurifyer Oil Control Jel Krem
(25,
 'Temiz cilde sabah ve akşam uygulayın. Makyaj altına uygun matlaştırıcı baz olarak da kullanılabilir.',
 'Göz çevresinden kaçının. Aktif sivilce üzerinde dikkatli kullanın.',
 '["Licochalcone A", "8 saat mat etki", "Sebum düzenleyici", "Gözenek sıkılaştırıcı", "Non-komedojen", "Akneye eğilimli yağlı ciltler için"]',
 '12M', 'Almanya', 'Beiersdorf AG, Hamburg, Almanya'),

-- 26: Vichy Mineral 89 Hyaluronic Acid Booster
(26,
 'Temiz cilde sabah ve akşam 2 pompa uygulayın. Günlük bakım rutininin ilk adımı olarak, serum/nemlendirici öncesi kullanın.',
 'Yalnızca harici kullanım. Göz çevresinden kaçının.',
 '["Hyaluronic Acid + Vichy Mineralizing Water", "89% mineralleştirici termal su", "Cilt bariyerini güçlendirir", "Daha parlak ve dolgun görünüm", "Hassas ciltler için uygun", "Parfümsüz"]',
 '12M', 'Fransa', 'Vichy Laboratoires / L''Oreal, Paris, Fransa'),

-- 27: Vichy Normaderm Phytosolution
(27,
 'Temiz cilde sabah ve akşam uygulayın. Tüm yüze ince bir tabaka halinde sürün, masaj yaparak emilmesini sağlayın.',
 'Göz çevresinden kaçının. Aşırı tahriş durumunda kullanımı bırakın.',
 '["Salisilik Asit + Hyaluronic Acid", "Çift düzeltici etki", "Sivilce izlerini azaltır", "24 saat nemlendirme", "Yağlı ve akneye eğilimli ciltler için"]',
 '12M', 'Fransa', 'Vichy Laboratoires / L''Oreal, Paris, Fransa'),

-- 28: Vichy Liftactiv Supreme
(28,
 'Sabah bakım rutininde temiz cilde uygulayın. Serum sonrası, güneş koruyucu öncesi kullanın.',
 'Yalnızca harici kullanım.',
 '["Rhamnose %5 + Hyaluronic Acid", "Yaşlanma karşıtı", "Kırışıklık ve sarkma", "Parlak ve genç görünüm", "Kuru ve karma ciltler için"]',
 '18M', 'Fransa', 'Vichy Laboratoires / L''Oreal, Paris, Fransa'),

-- 29: Nuxe Huile Prodigieuse
(29,
 'Yüz, saç ve vücuda uygulayın. Banyo sonrası nemli cilde masaj yaparak sürün. Saçlara birkaç damla uç kısımlarına uygulayın.',
 'Göz temasından kaçının. Güneşlenme öncesi uygulamayın.',
 '["7 botanik yağ karışımı", "Çok amaçlı kuru yağ", "Yüz, vücut ve saç", "Besleyici ve onarıcı", "Saten parlaklık", "Parfümlü formül"]',
 '12M', 'Fransa', 'Laboratoire NUXE, Paris, Fransa'),

-- 30: Nuxe Creme Fraiche de Beaute
(30,
 'Temiz cilde sabah ve akşam uygulayın. Makyaj altına uygundur.',
 'Yalnızca harici kullanım.',
 '["Bitkisel süt + Hyaluronic Acid", "48 saat nemlendirme", "Yatıştırıcı", "Normal ve karma ciltler için", "Vegan formül"]',
 '12M', 'Fransa', 'Laboratoire NUXE, Paris, Fransa'),

-- 31: Bioderma Atoderm Intensive Baume
(31,
 'Temiz cilde günde 1-2 kez uygulayın. Banyo veya duş sonrası nemli cilde uygulamak emilimi artırır. Yüz ve vücut için uygundur.',
 'Açık yaralara ve enfekte bölgelere uygulamayın.',
 '["Biyolojik patentli kompleks", "Kaşıntı giderici", "Cilt bariyerini yeniden yapılandırır", "Atopik ve çok kuru ciltler için", "Yüz ve vücut", "Parfümsüz"]',
 '6M', 'Fransa', 'NAOS / Bioderma, Lyon, Fransa'),

-- 32: Bioderma Photoderm MAX Cream SPF50+
(32,
 'Güneşe çıkmadan 20 dakika önce yeterli miktarda uygulayın. Her 2 saatte bir tekrarlayın. Yüzdükten sonra yeniden uygulayın.',
 'Göz temasından kaçının. 6 ay altı bebeklerde kullanmayın. Ürün tek başına tam koruma sağlamaz, şapka ve gölge ile destekleyin.',
 '["SPF 50+ / UVA 38", "Cellular Bioprotection", "Geniş spektrum UVA-UVB", "Su ve tere dayanıklı", "Hassas ciltler için", "Fotokararlı formül"]',
 '12M', 'Fransa', 'NAOS / Bioderma, Lyon, Fransa'),

-- 33: CeraVe SA Smoothing Cleanser
(33,
 'Islak cilde uygulayın, köpürterek 30-60 saniye masaj yapın, ılık suyla durulayın. Yüz ve vücut için uygundur.',
 'Göz temasından kaçının. Aktif güneş yanığı olan bölgelere uygulamayın.',
 '["Salisilik Asit + 3 Ceramide", "Pürüzsüzleştirici", "Ölü deri hücrelerini temizler", "MVE teknolojisi", "Kuru ve pürüzlü ciltler için", "Non-komedojen"]',
 '12M', 'Fransa', 'L''Oreal / CeraVe, Vichy, Fransa'),

-- 34: CeraVe Eye Repair Cream
(34,
 'Sabah ve akşam temiz göz çevresine yüzük parmağıyla hafifçe vuruşlarla uygulayın. Az miktar yeterlidir.',
 'Göz içine temas ettirmeyin. Tahriş olursa kullanımı durdurun.',
 '["3 Ceramide + Hyaluronic Acid", "MVE teknolojisi", "Göz altı morlukları ve şişlik", "Hafif krem doku", "Göz doktoru test edilmiş", "Parfümsüz"]',
 '12M', 'Fransa', 'L''Oreal / CeraVe, Vichy, Fransa'),

-- 35: La Roche-Posay Toleriane Sensitive
(35,
 'Temiz cilde sabah ve akşam uygulayın. Tüm yüze hafifçe masaj yaparak sürün.',
 'Yalnızca harici kullanım. Göz çevresinden kaçının.',
 '["Prebiyotik termal su", "Niacinamide + Glycerin", "Hassas cilt bariyerini güçlendirir", "Tahriş azaltıcı", "Parfümsüz, alkol içermez", "Minimal içerik formül"]',
 '12M', 'Fransa', 'La Roche-Posay / L''Oreal, La Roche-Posay, Fransa'),

-- 36: La Roche-Posay Hyalu B5 Serum
(36,
 'Sabah ve akşam temiz cilde 3-4 damla uygulayın. Nemlendirici öncesi kullanın. Göz çevresine de uygulanabilir.',
 'Yalnızca harici kullanım.',
 '["2 Tip Hyaluronic Acid + Vitamin B5", "Anti-aging + nemlendirme", "Dolgunlaştırıcı etki", "Hassas ciltler için uygun", "Dermatolog test edilmiş"]',
 '12M', 'Fransa', 'La Roche-Posay / L''Oreal, La Roche-Posay, Fransa'),

-- 37: TO Caffeine Solution 5% + EGCG
(37,
 'Sabah ve akşam temiz göz çevresine yüzük parmağıyla hafifçe pat pat yaparak uygulayın. Göz kremi yerine veya altına kullanılabilir.',
 'Göz içine temas ettirmeyin. Kafeine alerji durumunda kullanmayın.',
 '["Caffeine %5 + EGCG", "Göz altı morlukları ve şişlik", "Antioksidan yeşil çay", "Hafif serum doku", "Vegan formül"]',
 '12M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 38: TO Squalane Cleanser
(38,
 'Kuru ellere pompalayın, kuru yüze uygulayın, 30-60 saniye masaj yapın. Ilık suyla durulayın. Balm-to-milk dönüşüm formülü.',
 'Göz temasından kaçının.',
 '["Squalane bazlı temizleyici", "Balm-to-milk dönüşüm", "Makyaj çözücü", "Hassas ciltler için", "Kurutmayan formül", "Vegan"]',
 '12M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 39: TO Mandelic Acid 10% + HA
(39,
 'Akşam temizleme sonrası pamuk ile veya parmak uçlarıyla yüze uygulayın. Haftada 2-3 kez başlayıp günlük kullanıma geçin.',
 'AHA ürünüdür, güneşe karşı duyarlılığı artırır. Mutlaka SPF kullanın. Retinol ile aynı akşam kullanmayın.',
 '["Mandelic Acid %10", "Nazik AHA peeling", "Hassas ciltler için uygun AHA", "Ton eşitsizliği ve leke", "Gözenek arındırıcı", "Vegan"]',
 '6M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 40: TO Alpha Arbutin 2% + HA
(40,
 'Sabah ve akşam temiz cilde birkaç damla uygulayın. Nemlendirici öncesi, C vitamini ile birlikte kullanılabilir.',
 'Yalnızca harici kullanım. Güneş koruyucu ile birlikte kullanılmalıdır.',
 '["Alpha Arbutin %2 + Hyaluronic Acid", "Leke karşıtı", "Aydınlatıcı", "Hiperpigmentasyon", "Eşit cilt tonu", "Vegan"]',
 '12M', 'Kanada', 'DECIEM Inc., Toronto, Kanada'),

-- 41: COSRX Aloe Soothing Sun Cream SPF50+ PA+++
(41,
 'Cilt bakım rutininin son adımı olarak, güneşe çıkmadan 15 dakika önce uygulayın. 2-3 saatte bir tekrarlayın.',
 'Göz temasından kaçının. Cilt tahriş olursa kullanımı durdurun.',
 '["SPF 50+ PA+++", "Aloe Vera yatıştırıcı", "Hafif ve yapışkan olmayan doku", "Beyazlaştırmayan formül", "Günlük kullanım için ideal"]',
 '12M', 'Güney Kore', 'COSRX Inc., Seul, Güney Kore'),

-- 42: Uriage Bariederm Cica-Cream
(42,
 'Temiz cilde günde 1-2 kez uygulayın. Tahriş olmuş, çatlamış veya işlem sonrası ciltte kullanılabilir.',
 'Derin yaralarda veya enfekte bölgelerde kullanmayın.',
 '["Bakır-Çinko kompleks", "Poly-2p (onarıcı patent)", "Centella Asiatica", "Cilt onarıcı ve yatıştırıcı", "Uriage termal su", "Parfümsüz"]',
 '12M', 'Fransa', 'Laboratoires Dermatologiques d''Uriage, Fransa'),

-- 43: Uriage Eau Thermale Water Cream
(43,
 'Temiz cilde sabah ve akşam uygulayın. Makyaj altına uygundur.',
 'Yalnızca harici kullanım.',
 '["Uriage Termal Su + Hyaluronic Acid", "Hafif jel-krem doku", "24 saat nemlendirme", "Normal ve karma ciltler", "Non-komedojen"]',
 '12M', 'Fransa', 'Laboratoires Dermatologiques d''Uriage, Fransa'),

-- 44: Ducray Keracnyl Serum
(44,
 'Temiz cilde akşam uygulayın. Göz çevresi hariç tüm yüze ince bir tabaka sürün. Nemlendirici öncesi kullanın.',
 'Göz çevresinden kaçının. Hamilelikte kullanmadan önce doktora danışın. AHA/BHA kombinasyonlarında dikkatli olun.',
 '["Glikolik Asit + Myrtacine", "Siyah nokta ve sivilce karşıtı", "Gözenek arındırıcı", "Yağ kontrolü", "Pürüzsüz cilt dokusu"]',
 '12M', 'Fransa', 'Pierre Fabre Dermatologie, Toulouse, Fransa'),

-- 45: Hada Labo Gokujyun Premium Hyaluronic Acid Lotion
(45,
 'Temiz cilde 3-4 damla avuç içine alıp yüze bastırarak uygulayın. Nemli cilde uygulamak emilimi artırır. Katmanlama yapılabilir.',
 'Çok kuru iklimlerde tek başına nemlendirici olarak yeterli olmayabilir. Üzerine oklüzif ürün sürün.',
 '["5 Tip Hyaluronic Acid", "Premium nemlendirme", "7 kat nem katmanı", "Yapışkan olmayan doku", "Parfümsüz, renklendirici içermez", "Japon cilt bakım felsefesi"]',
 '12M', 'Japonya', 'Rohto Pharmaceutical Co., Osaka, Japonya'),

-- 46: Klairs Supple Preparation Facial Toner
(46,
 'Temiz cilde pamuk veya avuç içi ile uygulayın. 2-3 kat katmanlama yapılabilir. Serum öncesi pH dengeleme adımı olarak kullanın.',
 'Yalnızca harici kullanım.',
 '["Hyaluronic Acid + Beta-Glucan", "pH dengeleme", "Hassas cilt toniği", "Nemlendirme katmanı", "Parfümsüz versiyon", "Vegan, cruelty-free"]',
 '18M', 'Güney Kore', 'Wishtrend / Dear Klairs, Seul, Güney Kore'),

-- 47: Klairs Freshly Juiced Vitamin Drop
(47,
 'Sabah veya akşam temiz cilde 2-3 damla uygulayın. Toner sonrası, nemlendirici öncesi kullanın. Güneş koruyucu ile birlikte kullanılmalıdır.',
 'C vitamini ürünüdür, ışığa duyarlılık artırabilir. Retinol ile aynı akşam kullanmayın. Buzdolabında saklayın.',
 '["Ascorbic Acid %5 (C Vitamini)", "Hassas ciltler için düşük konsantrasyon", "Aydınlatıcı ve ton eşitleyici", "Antioksidan koruma", "Stabil formül"]',
 '6M', 'Güney Kore', 'Wishtrend / Dear Klairs, Seul, Güney Kore'),

-- 48: Purito Centella Green Level Recovery Cream
(48,
 'Cilt bakım rutininin son adımı olarak sabah ve akşam uygulayın. Tahriş olmuş ve hassas ciltlerde yatıştırıcı olarak da kullanılabilir.',
 'Yalnızca harici kullanım.',
 '["Centella Asiatica %49", "Yatıştırıcı ve onarıcı", "Hafif krem doku", "Hassas ve akneye eğilimli ciltler", "Parfümsüz", "EWG Green Grade"]',
 '12M', 'Güney Kore', 'Purito, Seul, Güney Kore'),

-- 49: Some By Mi AHA BHA PHA 30 Days Miracle Toner
(49,
 'Temiz cilde pamuk ile veya avuç içinden uygulayın. Günlük kullanıma uygundur. Serum öncesi adım olarak kullanın.',
 'AHA/BHA içerir, güneşe karşı duyarlılığı artırır. SPF kullanın. Retinol ile aynı rutinde dikkatli olun.',
 '["AHA + BHA + PHA üçlü asit", "30 günlük mucize", "Çay ağacı %10.000ppm", "Gözenek ve sivilce karşıtı", "Ölü deri arındırma + nemlendirme"]',
 '12M', 'Güney Kore', 'Some By Mi, Seul, Güney Kore'),

-- 50: Neutrogena Retinol Boost Cream
(50,
 'Akşam temiz cilde uygulayın. Haftada 2-3 kez başlayıp, cilt alıştıkça günlük kullanıma geçin. Güneş koruyucu ile birlikte kullanılmalıdır.',
 'Hamilelik ve emzirme döneminde KULLANMAYIN. AHA/BHA ile aynı akşam kullanmayın. İlk kullanımlarda hafif soyulma ve kızarıklık normal.',
 '["Retinol (saf)", "Kırışıklık ve ince çizgi", "Cilt yenileme", "Ton eşitsizliği", "Sıkılaştırıcı etki", "Dermatolog test edilmiş"]',
 '6M', 'ABD', 'Johnson & Johnson Consumer Inc., NJ, ABD');
