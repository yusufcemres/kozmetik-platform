-- Articles V2 Batch — 15 high-quality TR articles with H2/H3 + citations
-- Covers: skincare, supplements, pregnancy, food sources, pairing
-- Idempotent via ON CONFLICT (slug)

INSERT INTO content_articles (title, slug, content_type, summary, body_markdown, status, published_at) VALUES
(
  'D Vitamini Eksikliği Belirtileri ve Doğru Takviye Seçimi',
  'd-vitamini-eksikligi-belirtileri-takviye',
  'ingredient_explainer',
  'D vitamini eksikliğinin klinik belirtileri, laboratuvar değerleri, D2/D3 farkı ve günlük doz önerileri.',
  E'## D Vitamini Neden Önemli?\n\nD vitamini, kalsiyum emilimi, kemik sağlığı ve bağışıklık fonksiyonu için kritik bir prohormon. Türkiye gibi 36-42° enleminde yer alan bölgelerde kış aylarında ciltte sentezlenemediği için gıda ve takviye yoluyla karşılanması gerekir.\n\n## Eksiklik Belirtileri\n\n### Fiziksel\n- Yorgunluk ve kas güçsüzlüğü\n- Kemik ve eklem ağrıları\n- Saç dökülmesinde artış\n- Sık enfeksiyon (üst solunum yolu)\n\n### Laboratuvar\n- 25(OH)D < 20 ng/mL: eksiklik\n- 20-30 ng/mL: yetersiz\n- 30-50 ng/mL: optimal\n- > 100 ng/mL: toksisite riski\n\n## D2 mi D3 mü?\n\n**D3 (kolekalsiferol)** kan seviyesini D2’ye göre ~%87 daha etkili yükseltir. Tercih edilmeli.\n\n## Doz Önerileri\n\n- Sağlıklı yetişkin: 600-800 IU/gün (NIH ODS)\n- Eksiklik varsa: 2000-4000 IU/gün, 8-12 hafta\n- 10.000 IU/gün üzeri hekim kontrolünde\n\n## K2 ile Birlikte Alınır mı?\n\nD3 + K2 (MK-7) kombinasyonu kalsiyumun damarlara değil kemiklere yönlendirilmesinde sinerjiktir. Özellikle yüksek doz D3 alanlarda önerilir.\n\n## Kaynaklar\n- NIH ODS Vitamin D Fact Sheet\n- Tripkovic et al. 2012, Am J Clin Nutr (D3 vs D2 karşılaştırma)',
  'published',
  NOW()
),
(
  'Hamilelikte Güvenli Takviyeler ve Kaçınılması Gerekenler',
  'hamilelikte-guvenli-takviyeler',
  'guide',
  'Hamilelik döneminde önerilen folik asit, demir, omega-3 dozları ve kaçınılması gereken içerikler.',
  E'## Hamilelikte Takviye Neden Kritik?\n\nGebeliğin ilk 12 haftasında nöral tüp gelişimi, ikinci ve üçüncü trimesterde beyin ve göz gelişimi besin gereksinimlerini belirgin artırır.\n\n## Kesinlikle Önerilen\n\n### Folik Asit\n- Doz: 400-800 mcg/gün (hamilelikten 1-3 ay önce başlamalı)\n- Nöral tüp defektlerini %70’e kadar azaltır (CDC)\n\n### Demir\n- Doz: 27 mg/gün\n- Demir eksikliği anemisi riskini düşürür\n- Emilimi artırmak için C vitamini kaynaklarıyla al\n\n### Omega-3 (DHA)\n- Doz: 200-300 mg DHA/gün\n- Fetal beyin ve retina gelişimi için kritik\n- Balık yağı yerine algal kaynak tercih edilebilir (civa riski yok)\n\n### D Vitamini\n- Doz: 600 IU/gün (gebe)\n\n## Kaçınılması Gerekenler\n\n- **Yüksek doz A vitamini (retinol > 10.000 IU):** teratojenik\n- **Topikal retinoidler:** retinol, tretinoin, adapalen\n- **Bitkisel takviyeler:** ginkgo, ginseng, keten tohumu yağı (yüksek doz), sinameki\n- **Salisilik asit (oral/yüksek doz):** kategori C/D\n\n## Topikal Güvenli Alternatifler\n\n- Azelaik asit %10-20 (kategori B)\n- Niacinamide\n- Vitamin C (L-askorbik asit)\n- Hyaluronic acid, ceramide\n\n## Kaynaklar\n- ACOG Committee Opinion 2021\n- NIH ODS Prenatal Nutrition',
  'published',
  NOW()
),
(
  'Retinol + Niacinamide: Birlikte Kullanılır mı?',
  'retinol-niacinamide-birlikte-kullanim',
  'comparison',
  'Retinol ve niacinamide kombinasyonu, tahriş efsanesi ve doğru uygulama sıralaması.',
  E'## Kısa Cevap: Evet, Birlikte Kullanılabilir\n\n2000’ler başındaki "aktifler flush yapar" söylemi zamanla çürüdü. Modern formülasyonlar ikisini birlikte aynı şişede sunabiliyor.\n\n## Niacinamide Retinolü Tolere Etmeye Yardım Eder\n\nNiacinamide, ceramide üretimini artırarak bariyeri güçlendirir. Bu sayede retinolün yaygın yan etkisi olan kuruluk ve kızarıklık azalır.\n\n## Uygulama Sıralaması\n\n**Aynı gece iki ayrı ürün:**\n1. Temizlik\n2. Niacinamide serum (~%5)\n3. 5-10 dk bekle\n4. Retinol (~%0.3-0.5)\n5. Nemlendirici\n\n**Alternatif:** Sabah niacinamide, gece retinol — tahriş hassas ciltlerde tercih edilebilir.\n\n## Flush Efsanesi\n\n1960’ların araştırmalarında yüksek sıcaklıkta niacinamide’in niasinik aside dönüşüp "flush" yapabileceği bulgusu, topikal formülasyonlarda karşılık bulmaz. Oda sıcaklığında stabildir.\n\n## Hassas Cilt İçin Başlangıç\n\n- İlk 2 hafta: Sadece niacinamide\n- 3. hafta: Retinol haftada 2 gece eklenir\n- 6. hafta: Gün aşırı veya her gece\n\n## Kaynaklar\n- Draelos et al. 2006, Dermatol Surg\n- Kawada et al. 2008, niacinamide barrier repair',
  'published',
  NOW()
),
(
  'Magnezyum Formları: Sitrat, Glisinat, Malat Hangisi?',
  'magnezyum-formlari-sitrat-glisinat-malat',
  'comparison',
  'Magnezyum takviye formlarının biyoyararlanımı, endikasyonları ve kimler için hangisi.',
  E'## Magnezyum Neden Çok Formda Var?\n\nMagnezyum tek başına emilemez, bir "taşıyıcı" mineralle birleştirilir. Her form, farklı doku dağılımı ve yan etki profiline sahiptir.\n\n## Magnezyum Sitrat\n- **Biyoyararlanım:** Orta-yüksek\n- **Ne için iyi?** Kabızlık (osmotik etki), genel takviye\n- **Yan etki:** Yüksek dozda ishal\n\n## Magnezyum Glisinat (Bisglisinat)\n- **Biyoyararlanım:** Yüksek\n- **Ne için iyi?** Uyku, anksiyete, kas gevşemesi\n- **Avantaj:** Sindirimi en iyi tolere edilen form\n\n## Magnezyum Malat\n- **Biyoyararlanım:** Yüksek\n- **Ne için iyi?** Fibromiyalji, kronik yorgunluk (ATP döngüsüyle sinerji)\n\n## Magnezyum Oksit\n- **Biyoyararlanım:** Düşük (~%4)\n- Ucuz ama zayıf emilir. Tablet başına yüksek elemental magnezyum gösterir ama çoğu emilmez.\n\n## Magnezyum Threonat\n- **Biyoyararlanım:** Orta\n- **Ne için iyi?** Bilişsel fonksiyon (kan-beyin bariyerini geçer)\n- En pahalı form\n\n## Doz Önerisi\n\n- Yetişkin erkek: 400-420 mg/gün (elemental)\n- Yetişkin kadın: 310-320 mg/gün\n- Takviye: 200-400 mg/gün arası yaygın\n\n## Kim İçin Hangisi?\n\n| Hedef | Önerilen Form |\n|-------|--------------|\n| Uyku/anksiyete | Glisinat |\n| Kabızlık | Sitrat |\n| Yorgunluk | Malat |\n| Bilişsel | Threonat |\n| Genel | Sitrat veya Glisinat |\n\n## Kaynaklar\n- Examine.com Magnesium monograph\n- NIH ODS Magnesium Fact Sheet',
  'published',
  NOW()
),
(
  'Omega-3: Doğru Dozaj, EPA/DHA Farkı ve Kaynaklar',
  'omega-3-dozaj-epa-dha-farki',
  'ingredient_explainer',
  'EPA ve DHA’nın rolleri, günlük doz önerileri ve balık yağı vs algal omega-3 karşılaştırması.',
  E'## Omega-3 Nedir?\n\nOmega-3, vücudun sentezleyemediği esansiyel yağ asitlerinin adıdır. Üç ana form: ALA (bitkisel), EPA ve DHA (deniz kaynaklı).\n\n## EPA vs DHA\n\n### EPA (Eikosapentaenoik Asit)\n- Güçlü anti-inflamatuar\n- Depresyon ve kalp sağlığı için öncelikli\n- Etkili doz: 1000-2000 mg/gün\n\n### DHA (Dokosahekzaenoik Asit)\n- Beyin dokusunda yüksek konsantrasyonda\n- Göz ve fetal gelişim için kritik\n- Etkili doz: 500-1000 mg/gün\n\n## Günlük Doz Önerisi\n\n- Genel sağlık: 250-500 mg EPA+DHA/gün (AHA)\n- Kalp-damar risk: 1000 mg/gün\n- Yüksek trigliserid: 2000-4000 mg/gün (hekim kontrolü)\n\n## Balık Yağı vs Algal\n\n### Balık Yağı\n- Ucuz, yaygın\n- Civa/dioksin riski düşük (moleküler distilasyon)\n- Balık kokusu yan etkisi\n\n### Algal Omega-3\n- Vegan uyumlu\n- Civa riski sıfır\n- %2-3 daha pahalı\n\n## Formlar: Triglyceride vs Ethyl Ester\n\n- **rTG (reesterified triglyceride):** emilim en yüksek\n- **TG:** doğal form, iyi emilim\n- **EE (ethyl ester):** ucuz, emilim ~%50 daha düşük\n\n## Etiket Okuma\n\n"1000 mg balık yağı" ≠ "1000 mg omega-3". Arka etiketteki EPA + DHA toplamına bak.\n\n## Kaynaklar\n- AHA Scientific Statement 2017\n- NIH ODS Omega-3 Fact Sheet',
  'published',
  NOW()
),
(
  'Probiyotik Seçimi: CFU, Suş Çeşitliliği ve Saklama',
  'probiyotik-secimi-cfu-sus-saklama',
  'guide',
  'Probiyotik takviyede CFU sayısı, suş çeşitliliği, enkapsülasyon ve saklama koşullarının önemi.',
  E'## CFU Nedir?\n\nCFU (Colony Forming Unit), takviyedeki canlı mikroorganizma sayısıdır. "10 milyar CFU" = 10×10⁹ canlı bakteri.\n\n## Ne Kadar CFU Yeterli?\n\n- Genel sağlık: 1-10 milyar CFU/gün\n- IBS: 10-20 milyar CFU/gün\n- Antibiyotik sonrası: 20-40 milyar CFU/gün\n\nDaha yüksek her zaman daha iyi değil — suş çeşitliliği ve suşa özgü araştırma önemli.\n\n## Tek Suş vs Çoklu Suş\n\n**Tek suş (monosuş):** Klinik çalışmalar genelde tek suşla yapılır (ör. Lactobacillus rhamnosus GG). Belirli endikasyon için kanıt güçlü.\n\n**Çoklu suş:** 4-12 suş kombinasyonları bağırsak flora çeşitliliğini destekler. Genel sağlık için tercih edilebilir.\n\n## Öne Çıkan Suşlar ve Endikasyonları\n\n| Suş | Endikasyon |\n|-----|-----------|\n| Lactobacillus rhamnosus GG | Antibiyotikle ishal, IBS |\n| Lactobacillus plantarum 299v | IBS semptomları |\n| Bifidobacterium longum | Anksiyete (gut-brain axis) |\n| Saccharomyces boulardii | Yolculuk ishali, C. difficile |\n| Lactobacillus reuteri | Bebek kolik, kolesterol |\n\n## Saklama Koşulları\n\n- Soğuk zincir etiketi → buzdolabında sakla\n- "Shelf-stable" ürünler liyofilize, oda sıcaklığında 2 yıl\n- Üretim tarihindeki CFU sona erme CFU olmalı (bazı markalar üretim CFU yazar, yanıltıcı)\n\n## Enkapsülasyon\n\nAside dirençli (enteric-coated) kapsüller, mide asidinde çözünmeyip ince bağırsakta açılır. Hayatta kalan bakteri oranını ~%80’e çıkarır.\n\n## Kaynaklar\n- ISAPP Consensus Statement 2013\n- Examine.com Probiotics',
  'published',
  NOW()
),
(
  'Demir Eksikliği: Belirtiler, Emilim Artırma ve Takviye',
  'demir-eksikligi-belirtiler-emilim-takviye',
  'guide',
  'Demir eksikliği anemisi, heme ve non-heme demir farkları, emilimi artıran ve azaltan faktörler.',
  E'## Demir Eksikliği Ne Kadar Yaygın?\n\nWHO verilerine göre dünyada en yaygın besin eksikliği demirdir. Doğurgan yaş kadınlarda prevalansın %30-50’ye ulaştığı tahmin edilir.\n\n## Belirtiler\n\n- Yorgunluk, nefes darlığı\n- Soluk cilt, tırnaklarda kaşık deformitesi\n- Saç dökülmesi (telogen effluvium)\n- Huzursuz bacak sendromu\n- Konsantrasyon kaybı\n\n## Laboratuvar Değerleri\n\n- Ferritin < 30 ng/mL: eksiklik\n- Ferritin 30-100 ng/mL: yeterli\n- Hemoglobin ile birlikte değerlendirilmeli\n\n## Heme vs Non-Heme Demir\n\n**Heme demir (kırmızı et, tavuk, balık):** Emilim oranı %15-35\n**Non-heme demir (bitkisel, takviye):** Emilim oranı %2-20\n\n## Emilimi Artıran Faktörler\n\n- C vitamini (500 mg, aynı öğünde)\n- Et proteini\n- Asidik ortam (portakal suyu, limon)\n\n## Emilimi Azaltan Faktörler\n\n- Çay, kahve (tanenler)\n- Kalsiyum takviyeleri\n- Antasit ilaçlar\n- Tahıllardaki fitatlar\n\n## Doğru Alım Zamanı\n\n- Aç karnına (aç tolere edilemiyorsa hafif öğünle)\n- Sabah tercih edilebilir\n- Kalsiyum ve kahve ile arada 2 saat\n\n## Takviye Formları\n\n- **Demir sülfat:** Ucuz, yaygın, GI yan etki yüksek\n- **Demir bisglisinat:** Daha iyi tolere edilir, emilimi yüksek\n- **Demir fumarat:** Orta emilim, orta tolerans\n\n## Doz\n\n- Yetişkin kadın: 18 mg/gün RDA\n- Hamilelik: 27 mg/gün\n- Takviye: 30-60 mg elemental/gün (hekim önerisiyle)\n\n## Kaynaklar\n- WHO Iron Deficiency Guidelines\n- NIH ODS Iron Fact Sheet',
  'published',
  NOW()
),
(
  'Kolajen Takviyesi: Bilim Gerçekten Destekliyor mu?',
  'kolajen-takviyesi-bilim-etki',
  'ingredient_explainer',
  'Hidrolize kolajen peptitleri, cilt elastikiyeti ve eklem sağlığı üzerindeki etkileri.',
  E'## Kolajen Nedir?\n\nKolajen, vücuttaki en bol protein. Cilt, kemik, kıkırdak ve bağ dokunun yapı taşı. 25 yaşından sonra yıllık %1 azalır.\n\n## Oral Kolajen Emilir mi?\n\nEvet — ancak dolaşıma geçtiğinde "ağırlıklı olarak prolin-hidroksiprolin dipeptitleri" olarak geçer, tam molekül değil. Bu dipeptitler fibroblastları uyarır.\n\n## Klinik Kanıtlar\n\n### Cilt\n- 2019 meta-analiz (Barati et al.): 2.5-10 g/gün kolajen peptit, 8-12 haftada cilt elastikiyetinde anlamlı artış\n- Kırışıklık derinliğinde ~%13 azalma\n\n### Eklem\n- 2018 Porfírio et al.: Osteoartritte 10 g/gün, 6 ayda ağrıda iyileşme\n- Sporcu eklem ağrısında 5 g/gün UC-II etkili\n\n## Tipleri\n\n- **Tip I:** Cilt, saç, tırnak\n- **Tip II:** Kıkırdak (UC-II formunda etkili)\n- **Tip III:** Damar, bağırsak\n\nTakviyelerde Tip I + III yaygın. Deniz (fish) kaynaklı molekül ağırlığı daha küçük, emilim avantajı varsayımsal.\n\n## Doğru Doz\n\n- Cilt: 2.5-10 g/gün (5 g yaygın)\n- Eklem: 10 g peptit VEYA 40 mg UC-II\n\n## C Vitamini ile Birlikte\n\nKolajen sentezinde prolinin hidroksilasyon basamağı için C vitamini kofaktördür. 500-1000 mg C ile birlikte al.\n\n## Alternatifi: Gıda Kaynakları\n\n- Kemik suyu (~6 g/porsiyon)\n- Tavuk derisi, balık derisi\n- C vitamini kaynakları (turunçgil, biber) destekleyici\n\n## Kaynaklar\n- Barati et al. 2019, J Cosmet Dermatol\n- Examine.com Collagen',
  'published',
  NOW()
),
(
  'Kuru Cilt Bariyer Onarım Rutini: 30 Gün Protokolü',
  'kuru-cilt-bariyer-onarim-30-gun',
  'guide',
  'Hasarlı cilt bariyerini onarmak için 30 günlük minimalist rutin ve aktif madde çizelgesi.',
  E'## Neden Minimalist?\n\nHasarlı bariyer, her tahrişe daha duyarlı hale gelir. "Slugging", 5-6 basamaklı rutinler tersine etki yapabilir.\n\n## 1-7. Gün: Sadeleştir\n\n- Sabah: Ilık su + pamuklu havlu (temizleyici yok)\n- Sabah nemlendirici: Ceramide + panthenol\n- SPF 30+ mineral\n- Akşam: pH 5.5 sülfatsız jel temizleyici\n- Akşam nemlendirici: Aynı + hyaluronic asit\n\n**Kaçın:** Retinol, AHA/BHA, C vitamini, sert tonik\n\n## 8-14. Gün: Hafif Aktif Ekle\n\n- Niacinamide %5 (sabah veya akşam, biri)\n- Gündüz mineral SPF devam\n- 2-3 günde bir centella asiatica içerikli yatıştırıcı\n\n## 15-21. Gün: Kontrollü Test\n\n- Kızarıklık azaldıysa: haftada 2 gece %0.1 retinol\n- Hala hassasiyet varsa: bakiniacinamide + panthenol, retinol ertele\n\n## 22-30. Gün: Genişletme\n\n- Retinol frekans haftada 3\n- Haftada 1 PHA (lactobionic acid) nazik eksfoliyasyon\n- Hyaluronic asit serum haftada 2 gün, nemli cilde\n\n## Anahtar Maddeler (Sıralı Önem)\n\n1. Ceramide NP, AP\n2. Kolesterol + yağ asidi (3:1:1 oranı ideal)\n3. Panthenol (B5)\n4. Hyaluronic acid düşük moleküler ağırlık\n5. Centella asiatica (CICA)\n\n## Kaçınılması Gerekenler\n\n- Alkol denat. > %10\n- Esansiyel yağlar (lavanta, nane)\n- Sert kömürler, fiziksel scrub\n- Sıcak su yıkama\n\n## Kaynaklar\n- Draelos 2020, J Drugs Dermatol\n- Elias Stratum Corneum Model',
  'published',
  NOW()
),
(
  'Melatonin: Uyku İçin Güvenli mi, Ne Kadar Almalı?',
  'melatonin-uyku-guvenli-doz',
  'ingredient_explainer',
  'Melatoninin etki mekanizması, optimal doz, yaygın yanlışlar ve doğal besin kaynakları.',
  E'## Melatonin Nedir?\n\nMelatonin, pineal bezden salgılanan ve sirkadiyen ritmi düzenleyen bir hormon. Karanlıkta artar, ışıkta azalır.\n\n## En Yaygın Yanlış: Yüksek Doz\n\nRafta 3 mg, 5 mg, hatta 10 mg görebilirsin. Oysa klinik çalışmalar en etkili dozu **0.3-0.5 mg** olarak gösteriyor. Yüksek doz sabah sersemliği ve reseptör duyarlılığında azalma yapar.\n\n## Doğru Kullanım\n\n- Uyumadan 30-60 dk önce\n- 0.3-1 mg düşük doz\n- Maksimum 5 mg (jet-lag gibi özel durumlarda)\n- 4 haftadan uzun kesintisiz kullanma\n\n## Uyku Kalitesine Etkisi\n\n- Uyuma süresini ortalama 7 dk kısaltır (meta-analiz Ferracioli-Oda 2013)\n- Toplam uyku süresini ortalama 8 dk uzatır\n- Klinik olarak jet-lag ve faz gecikmeli uyku bozukluğunda en etkili\n\n## Doğal Besin Kaynakları\n\nMelatonin bazı gıdalarda doğal bulunur. Düşük ama kümülatif:\n\n- **Kivi:** 2 adet (~2-3 saat uyumadan önce) uyku latensini %35 azaltıyor (Lin 2011)\n- **Antep fıstığı:** 100 g’da ~660 ng melatonin\n- **Badem:** 100 g’da ~39 ng melatonin\n- **Vişne:** Tart kiraz suyu (Meng 2017)\n\n## Ne Zaman Almamalı?\n\n- Otoimmün hastalık (bağışıklık aktivasyonu şüpheli)\n- Hamilelik ve emzirme\n- Antidepresan kullananlar (hekim danışı)\n\n## Kaynaklar\n- Ferracioli-Oda et al. 2013, PLoS ONE\n- Lin et al. 2011, Asia Pac J Clin Nutr\n- Meng et al. 2017, Nutrients',
  'published',
  NOW()
),
(
  'Ceramide, Squalane ve Hyaluronic Acid: Nem Üçlüsü',
  'ceramide-squalane-hyaluronic-acid-nem',
  'comparison',
  'Üç temel nemlendirici maddenin işlevleri, rutindeki sırası ve kombinasyon önerileri.',
  E'## Nemlendirme ≠ Hidratasyon\n\nCilt bakımında iki kavram sıkça karıştırılır:\n- **Hidrate etmek:** Cilde su kazandırmak (humectant’lar)\n- **Nemlendirmek:** Cilt barrier’ını kapatıp suyu içeride tutmak (occlusive’ler)\n\n## Hyaluronic Acid — Humectant\n\nKendi ağırlığının 1000 katı su tutar. Nemli cilde uygulanırsa havadan/alt tabakalardan su çeker.\n\n- **Düşük moleküler ağırlık (<50 kDa):** derin penetrasyon\n- **Yüksek moleküler ağırlık (>1000 kDa):** yüzey hidrasyonu, yatıştırıcı\n- Tipik konsantrasyon: %1-2\n\n## Ceramide — Bariyer Tamamlayıcı\n\nCildin doğal ceramide üretimi yaşla ve hasarla düşer. Topikal ceramide fiziksel olarak bariyerin "harcı"nı tamamlar.\n\n- Ceramide NP, AP, EOP kombinasyonu altın standart\n- Kolesterol ve yağ asidi ile 3:1:1 oranı ideal\n\n## Squalane — Occlusive\n\nBitkisel kaynaklı hidrokarbon. Cildin kendi ürettiği squalene’in hidrojenize, stabil formu.\n\n- Non-komojenik (gözenek tıkamaz)\n- Oksidatif strese dirençli\n- Yağlı cilt dahil tolere edilir\n\n## Doğru Sıralama\n\n1. **Nemli cilde** hyaluronic acid serum (kuru cilde uygulamak ters etki!)\n2. Ceramide içerikli nemlendirici\n3. Kuru ciltlerde üstüne birkaç damla squalane\n\n## Kombinasyon Örnekleri\n\n- **Kuru cilt:** Üçü de\n- **Yağlı cilt:** Hyaluronic + hafif ceramide jel\n- **Akneli cilt:** Squalane yerine dimetikon veya HA + centella\n\n## Kaynaklar\n- Elias, Stratum Corneum Lipid Organization\n- Draelos 2020, J Cosmet Dermatol',
  'published',
  NOW()
),
(
  'Çinko Cilt Sağlığı ve Bağışıklık İçin Ne Kadar?',
  'cinko-cilt-bagisiklik-doz',
  'ingredient_explainer',
  'Çinko eksikliğinin belirtileri, cilt ve bağışıklığa etkisi, hangi formu seçmeli.',
  E'## Çinko Neden Kritik?\n\nÇinko, 300+ enzimin kofaktörü. Yara iyileşmesi, bağışıklık, kolajen sentezi ve protein üretiminde görev alır.\n\n## Eksiklik Belirtileri\n\n- Sık enfeksiyon\n- Yavaş yara iyileşmesi\n- Ağız çevresinde dermatit\n- Saç dökülmesi\n- Tat alma kaybı\n- Akne artışı\n\n## Cilde Etki\n\n- **Akne:** Anti-inflamatuar ve anti-androjenik etki. 30-45 mg elemental/gün 8-12 haftada iyileşme (Dreno 2018 meta-analiz)\n- **Yara iyileşmesi:** Topikal çinko oksit ve oral sinergik\n- **Atopik dermatit:** Sebum dengesine yardım\n\n## Bağışıklık\n\n- Soğuk algınlığı semptom süresini ortalama 1.5 gün kısaltır (Hemilä meta-analiz)\n- İlk 24 saatte başlanmalı, 75+ mg/gün\n\n## Formları\n\n| Form | Elemental Oranı | Biyoyararlanım |\n|------|----------------|---------------|\n| Çinko pikolinat | ~%20 | Yüksek |\n| Çinko sitrat | ~%31 | Yüksek |\n| Çinko glukonat | ~%13 | Orta |\n| Çinko oksit | ~%80 | Düşük |\n| Çinko sülfat | ~%23 | Orta |\n\n## Doz\n\n- RDA: 8 mg (kadın), 11 mg (erkek)\n- Akne: 30-45 mg/gün elemental, 8-12 hafta\n- Soğuk algınlığı: 75 mg/gün, 5 gün\n- Üst limit: 40 mg/gün (uzun vadeli)\n\n## Bakır ile Dengele\n\nUzun süreli yüksek çinko alımı bakır eksikliği yapabilir. 50 mg çinko başına 1-2 mg bakır ekleyebilirsin.\n\n## Alım Zamanı\n\n- Aç karnına GI yan etki yapabilir\n- Hafif öğünle al\n- Kalsiyum ve demir takviyeleriyle arada 2 saat\n\n## Kaynaklar\n- Dreno et al. 2018 (akne meta-analiz)\n- Hemilä 2017 (soğuk algınlığı)\n- NIH ODS Zinc',
  'published',
  NOW()
),
(
  'D3 + K2 Neden Birlikte Alınır?',
  'd3-k2-birlikte-kullanim',
  'comparison',
  'D3 ve K2 MK-7 sinerjisi, kalsiyum hedeflenmesi ve doz önerileri.',
  E'## D3 + K2 Sinerjisi\n\nD3 bağırsaktan kalsiyum emilimini artırır. K2 (MK-7) ise kalsiyumu kemiklere yönlendiren matriks Gla proteinini (MGP) aktive eder. Birlikte alınmazsa kalsiyum damar duvarına birikebilir (teorik risk).\n\n## K1 vs K2 Farkı\n\n**K1 (filokinon):** Yeşil yapraklı sebzelerde. Pıhtılaşma faktörlerini aktive eder, kısa yarı ömür (~1 saat).\n\n**K2 MK-4:** Hayvansal kaynak (organ etleri). Yarı ömür ~1 saat, yüksek doz gerekir.\n\n**K2 MK-7:** Fermente ürünler (natto). Yarı ömür ~72 saat, düşük dozla etkili.\n\n## Doz\n\n- D3: 1000-4000 IU/gün (kan seviyesine göre)\n- K2 MK-7: 90-180 mcg/gün\n- 5000 IU D3 başına ~100 mcg K2 yaygın pratik\n\n## Kimler İçin Kritik?\n\n- 10.000 IU+ D3 alanlar\n- Osteoporoz riski yüksekler\n- Damar kalsifikasyonu öyküsü olanlar\n- Yüksek kolesterol ile statin kullananlar\n\n## Dikkat\n\n- Warfarin kullananlar K2 almadan önce hekime danışmalı (INR değişebilir)\n- Yağda çözünür — öğünle al (MCT veya avokado ile)\n\n## Gıda Kaynakları\n\n**K1:** Ispanak, lahana, brokoli, pazı\n**K2 MK-7:** Natto (en yüksek), gouda, brie, tereyağı\n**K2 MK-4:** Kaz ciğeri, yumurta sarısı, tavuk butu\n\n## Kaynaklar\n- Schurgers 2007, Blood (MK-7 bioavailability)\n- NIH ODS Vitamin K',
  'published',
  NOW()
),
(
  'B12 Vejetaryen ve Vegan Diyetlerde: Nasıl Karşılanır?',
  'b12-vejetaryen-vegan-takviye',
  'guide',
  'B12 vitamini eksikliği riski, hangi bitki bazlı kaynaklar yeterli, takviye formları ve doz.',
  E'## B12 Neden Sadece Hayvansal?\n\nB12 sadece bakteriler tarafından üretilir. Hayvanlar bu bakterileri barındırır (mide ve bağırsak), insanlar ise yeterli miktarda üretemez.\n\n## Bitkisel "B12 Kaynakları" Aldatıcı\n\n- **Spirulina, klorella:** Pseudo-B12 (analog) içerir. İnsanda inaktif, hatta gerçek B12 emilimini bloke edebilir.\n- **Nori, kombu:** Az miktarda aktif B12 içerir ama tutarsız\n- **Fermente ürünler (tempeh, miso):** Eser miktar, güvenilir değil\n\n**Sonuç:** Vegan/strict vejetaryenlere takviye zorunludur.\n\n## Takviye Formları\n\n### Siyanokobalamin\n- En ucuz, en stabil\n- Vücutta aktif formlara dönüşür\n- %98 vakada yeterli\n\n### Metilkobalamin\n- Direkt aktif form\n- MTHFR gen varyantı olanlarda teorik avantaj\n- Daha pahalı\n\n### Hidroksikobalamin\n- Yüksek retansiyon\n- İnjeksiyonda tercih edilir\n\n## Doz\n\n- Oral emilim düşük (~%1-2 aktif transport doygun olduktan sonra)\n- **Günlük:** 25-100 mcg\n- **Haftalık:** 2000 mcg 2×/hafta\n- Eksiklik varsa: 1000 mcg/gün 4 hafta, sonra idame\n\n## Eksiklik Belirtileri\n\n- Yorgunluk, halsizlik\n- El ve ayaklarda karıncalanma\n- Hafıza sorunu\n- Pernisiyöz anemi\n- Dil iltihabı\n\n## Ölçüm\n\n- Serum B12 tek başına yanıltıcı\n- **Aktif B12 (holotranskobalamin)** veya **metilmalonik asit (MMA)** daha hassas\n\n## Zenginleştirilmiş Gıdalar\n\n- Bitki sütleri (badem, soya, yulaf): genelde 1 mcg/porsiyon\n- Vegan bulyon kuplarının bir kısmı\n- Beslenme mayası (nutritional yeast) "fortified" etiketli\n\n## Kaynaklar\n- Pawlak 2013, Nutr Rev (vejetaryen B12 status)\n- NIH ODS Vitamin B12',
  'published',
  NOW()
),
(
  'Azelaik Asit vs Niacinamide: Hangisi Ne Zaman?',
  'azelaik-asit-niacinamide-karsilastirma',
  'comparison',
  'İki lekelere karşı altın standart aktifin endikasyonları, yan etki profili ve rutin entegrasyonu.',
  E'## Her İkisi de "Yatıştırıcı Aktif"\n\nHem azelaik asit hem niacinamide tahriş potansiyeli düşük, hassas ciltler için ilk tercihler.\n\n## Azelaik Asit\n\n### Ne Yapar?\n- Anti-inflamatuar (rozasea, akne rozasea)\n- Antibakteriyel (C. acnes)\n- Tirosinaz inhibitörü (melazma, PIH)\n- Komedolitik\n\n### Konsantrasyon\n- OTC: %10 (Ordinary, La Roche-Posay)\n- Reçeteli: %15-20 (Finacea)\n\n### Hamilelikte\n- Kategori B — güvenli kabul edilir\n\n## Niacinamide\n\n### Ne Yapar?\n- Bariyer güçlendirici (ceramide üretimi)\n- Sebum regülasyonu\n- Anti-inflamatuar\n- Melanozom transfer inhibisyonu (lekelere dolaylı etki)\n\n### Konsantrasyon\n- %2-10 (%5 en yaygın)\n\n### Hamilelikte\n- Güvenli\n\n## Hangisi Ne Zaman?\n\n| Endikasyon | İlk Tercih |\n|-----------|-----------|\n| Rozasea | Azelaik asit |\n| Genel hassasiyet | Niacinamide |\n| Akne + leke | Azelaik asit |\n| Yağlı/büyük gözenek | Niacinamide |\n| Melazma | Azelaik asit (VitC ile kombine) |\n| Bariyer hasarı | Niacinamide |\n\n## Birlikte Kullanılır mı?\n\nEvet. Sabah azelaik asit, gece niacinamide + retinol yaygın kombinasyon.\n\n## Yan Etki\n\n### Azelaik Asit\n- İlk 2 hafta karıncalanma\n- Kuruluk (nadir)\n- Hiperpigmente ciltte nadir hipopigmentasyon\n\n### Niacinamide\n- %10+ hassas ciltte kızarıklık\n- Genellikle çok iyi tolere edilir\n\n## Kaynaklar\n- Fitton & Goa 1991, Drugs (azelaic acid review)\n- Draelos 2006, J Cosmet Dermatol (niacinamide)',
  'published',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  body_markdown = EXCLUDED.body_markdown,
  summary = EXCLUDED.summary,
  content_type = EXCLUDED.content_type,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ===================================================================
-- Relation seeds: Articles ↔ Ingredients / Needs / Products
-- Fails-soft: only inserts pairs where both slugs exist in DB
-- ===================================================================

-- Niacinamide ↔ niacinamide ingredient + related needs
INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'retinol-niacinamide-birlikte-kullanim'
  AND i.ingredient_slug IN ('niacinamide', 'retinol')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'azelaik-asit-niacinamide-karsilastirma'
  AND i.ingredient_slug IN ('niacinamide', 'azelaic-acid', 'azelaik-asit')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'ceramide-squalane-hyaluronic-acid-nem'
  AND i.ingredient_slug IN ('ceramide-np', 'ceramide', 'hyaluronic-acid', 'squalane')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'd-vitamini-eksikligi-belirtileri-takviye'
  AND i.ingredient_slug IN ('vitamin-d', 'vitamin-d3', 'cholecalciferol', 'd-vitamini')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'melatonin-uyku-guvenli-doz'
  AND i.ingredient_slug IN ('melatonin')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'cinko-cilt-bagisiklik-doz'
  AND i.ingredient_slug IN ('zinc', 'cinko', 'zinc-picolinate', 'zinc-citrate')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'omega-3-dozaj-epa-dha-farki'
  AND i.ingredient_slug IN ('omega-3', 'epa', 'dha', 'fish-oil')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'magnezyum-formlari-sitrat-glisinat-malat'
  AND i.ingredient_slug IN ('magnesium', 'magnezyum', 'magnesium-citrate', 'magnesium-glycinate')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'kolajen-takviyesi-bilim-etki'
  AND i.ingredient_slug IN ('collagen', 'kolajen', 'collagen-peptide')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'demir-eksikligi-belirtiler-emilim-takviye'
  AND i.ingredient_slug IN ('iron', 'demir', 'iron-bisglycinate')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'd3-k2-birlikte-kullanim'
  AND i.ingredient_slug IN ('vitamin-d', 'vitamin-d3', 'vitamin-k2', 'k2-mk7')
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_related_articles (ingredient_id, article_id)
SELECT i.ingredient_id, a.article_id
FROM content_articles a
CROSS JOIN ingredients i
WHERE a.slug = 'b12-vejetaryen-vegan-takviye'
  AND i.ingredient_slug IN ('vitamin-b12', 'b12', 'cyanocobalamin', 'methylcobalamin')
ON CONFLICT DO NOTHING;

-- Needs ↔ Articles
INSERT INTO need_related_articles (need_id, article_id)
SELECT n.need_id, a.article_id
FROM content_articles a
CROSS JOIN needs n
WHERE a.slug = 'kuru-cilt-bariyer-onarim-30-gun'
  AND n.need_slug IN ('kuru-cilt', 'bariyer-hasari', 'hassas-cilt')
ON CONFLICT DO NOTHING;

INSERT INTO need_related_articles (need_id, article_id)
SELECT n.need_id, a.article_id
FROM content_articles a
CROSS JOIN needs n
WHERE a.slug = 'melatonin-uyku-guvenli-doz'
  AND n.need_slug IN ('uyku-sorunu', 'uyku', 'uykusuzluk', 'insomnia')
ON CONFLICT DO NOTHING;

INSERT INTO need_related_articles (need_id, article_id)
SELECT n.need_id, a.article_id
FROM content_articles a
CROSS JOIN needs n
WHERE a.slug = 'azelaik-asit-niacinamide-karsilastirma'
  AND n.need_slug IN ('akne', 'sivilce', 'leke', 'hiperpigmentasyon', 'rozasea')
ON CONFLICT DO NOTHING;

INSERT INTO need_related_articles (need_id, article_id)
SELECT n.need_id, a.article_id
FROM content_articles a
CROSS JOIN needs n
WHERE a.slug = 'cinko-cilt-bagisiklik-doz'
  AND n.need_slug IN ('akne', 'sivilce', 'bagisiklik', 'immune-support')
ON CONFLICT DO NOTHING;

INSERT INTO need_related_articles (need_id, article_id)
SELECT n.need_id, a.article_id
FROM content_articles a
CROSS JOIN needs n
WHERE a.slug = 'demir-eksikligi-belirtiler-emilim-takviye'
  AND n.need_slug IN ('yorgunluk', 'sac-dokulmesi', 'hair-loss', 'anemi')
ON CONFLICT DO NOTHING;

INSERT INTO need_related_articles (need_id, article_id)
SELECT n.need_id, a.article_id
FROM content_articles a
CROSS JOIN needs n
WHERE a.slug = 'kolajen-takviyesi-bilim-etki'
  AND n.need_slug IN ('yasli-cilt', 'anti-aging', 'eklem-sagligi', 'kirisiklik')
ON CONFLICT DO NOTHING;

INSERT INTO need_related_articles (need_id, article_id)
SELECT n.need_id, a.article_id
FROM content_articles a
CROSS JOIN needs n
WHERE a.slug = 'hamilelikte-guvenli-takviyeler'
  AND n.need_slug IN ('hamilelik', 'gebelik', 'pregnancy')
ON CONFLICT DO NOTHING;
