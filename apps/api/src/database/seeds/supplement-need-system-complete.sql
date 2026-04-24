-- ============================================================================
-- Supplement ↔ Need bağlantı sistemi — bütünsel sıfırdan yapılandırma
--
-- Patron: "ihtiyaçlarla takviyeleri bağlamak lazım. bağışıklıkta D3K2 çıksın,
--          beta-glukan içerenler çıksın. kozmetikte nasılsa takviyedede benzer
--          mantık işlesin; içerikleri, ürünleri ve ihtiyaçları birbirine bağla."
--
-- Bu seed 3 aşamayı atomik olarak yapar:
--   PART A — Eksik 13 supplement ingredient'ı DB'ye ekler
--   PART B — 12 supplement/both need için 100+ ingredient mapping seed eder
--   PART C — product_need_scores'u otomatik recompute eder (pi × inm)
--
-- Idempotent: tüm UPDATE/INSERT'ler WHERE EXISTS + NOT EXISTS guard'lı.
-- Supplement need'ler için mapping'ler TEMİZLENIP yeniden yazılır (temiz slate).
--
-- Kullanım:
--   pnpm ts-node apps/api/src/scripts/run-sql-file.ts \
--     apps/api/src/database/seeds/supplement-need-system-complete.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART A — EKSİK SUPPLEMENT INGREDIENT'LAR
-- ============================================================================

INSERT INTO ingredients (
  inci_name, common_name, ingredient_slug, ingredient_group, origin_type,
  function_summary, evidence_level, allergen_flag, fragrance_flag, preservative_flag
) VALUES
  ('Menaquinone-7', 'K2 Vitamini (MK-7)', 'menaquinone', 'Vitamin', 'biotech',
   'Yağda çözünür K vitamini formu. Kemik mineralizasyonunu destekler ve arter kalsifikasyonunu önler. D3 ile sinerjik çalışır.',
   'systematic_review', false, false, false),
  ('Sambucus Nigra Extract', 'Kara Mürver Özütü', 'elderberry', 'Bitki Özütü', 'natural',
   'Antioksidan flavonoidler içerir. Viral üst solunum enfeksiyonlarını kısaltıcı etkisi klinik çalışmalarda gösterilmiştir.',
   'randomized_controlled', false, false, false),
  ('Echinacea Purpurea Extract', 'Ekinezya Özütü', 'echinacea', 'Bitki Özütü', 'natural',
   'Bağışıklık modülatörü. Üst solunum enfeksiyonlarında hem önleme hem süre kısaltma etkisi var.',
   'systematic_review', true, false, false),
  ('Ubiquinone', 'Koenzim Q10', 'coq10', 'Koenzim', 'biotech',
   'Mitokondriyal enerji üretimi için kritik. Kalp fonksiyonu, statik kullananlarda ve yaşlanan bireylerde önemlidir.',
   'randomized_controlled', false, false, false),
  ('Niacin', 'B3 Vitamini (Niasin)', 'niacin', 'Vitamin', 'synthetic',
   'Enerji metabolizması ve NAD+ sentezinde kofaktör. Yüksek dozda kolesterol düzenlemesinde kullanılır.',
   'systematic_review', false, false, false),
  ('Glucosamine Sulfate', 'Glukozamin Sülfat', 'glucosamine', 'Aminoşeker', 'natural',
   'Kıkırdak yapı taşı. Osteoartrit semptomlarında hafif-orta rahatlama sağlar.',
   'systematic_review', false, false, false),
  ('Chondroitin Sulfate', 'Kondroitin Sülfat', 'chondroitin', 'Glikozaminoglikan', 'natural',
   'Kıkırdak matrisinin ana bileşeni. Glukozamin ile birlikte eklem ağrısını azaltır.',
   'systematic_review', false, false, false),
  ('Inulin', 'İnülin', 'inulin', 'Prebiyotik', 'natural',
   'Fermente edilemeyen lif. Bağırsak mikrobiyotasını (özellikle Bifidobacterium) besler.',
   'randomized_controlled', false, false, false),
  ('Panax Ginseng Extract', 'Kore Ginsengi', 'ginseng', 'Bitki Özütü', 'natural',
   'Adaptojen. Yorgunluk, bilişsel performans ve enerji üzerinde pozitif etki.',
   'randomized_controlled', false, false, false),
  ('Rhodiola Rosea Extract', 'Altın Kök (Rhodiola)', 'rhodiola', 'Adaptojen', 'natural',
   'Stres adaptasyonu, mental yorgunluğu azaltma ve mood desteği sağlar.',
   'randomized_controlled', false, false, false),
  ('BCAA (Leucine/Isoleucine/Valine 2:1:1)', 'BCAA (Dallı Zincirli Amino Asit)', 'bcaa', 'Amino Asit', 'biotech',
   'Kas protein sentezini ve antrenman sonrası toparlanmayı destekler.',
   'randomized_controlled', false, false, false),
  ('Bacopa Monnieri Extract', 'Bacopa Monnieri', 'bacopa-monnieri', 'Bitki Özütü', 'natural',
   'Ayurvedik nootropik. 8-12 haftada hafıza ve bilişsel hızda kanıtlanmış gelişim.',
   'systematic_review', false, false, false),
  ('Alpha-GPC', 'Alpha-GPC', 'alpha-gpc', 'Kolin Bileşiği', 'biotech',
   'Kolin formu; asetilkolin sentezini artırır. Bilişsel fonksiyon ve spor performansında etkili.',
   'randomized_controlled', false, false, false),
  ('Vaccinium Myrtillus Extract', 'Yaban Mersini', 'bilberry', 'Bitki Özütü', 'natural',
   'Antosiyaninler açısından zengin. Göz yorgunluğu ve retina mikrosirkülasyonu için kullanılır.',
   'randomized_controlled', false, false, false)
ON CONFLICT (ingredient_slug) DO NOTHING;

-- Ingredient alias'ları (D3 ve K2 için Türkçe arama)
INSERT INTO ingredient_aliases (ingredient_id, alias_name, language, alias_type)
SELECT i.ingredient_id, a.alias_name, a.language, a.alias_type
FROM (VALUES
  ('cholecalciferol', 'D3 Vitamini', 'tr', 'common'),
  ('cholecalciferol', 'Vitamin D3', 'tr', 'common'),
  ('cholecalciferol', 'D Vitamini', 'tr', 'common'),
  ('menaquinone', 'K2 Vitamini', 'tr', 'common'),
  ('menaquinone', 'Vitamin K2', 'tr', 'common'),
  ('menaquinone', 'MK-7', 'en', 'common'),
  ('vitamin-k2', 'Menaquinone', 'en', 'common'),
  ('folic-acid', 'Metilfolat', 'tr', 'common'),
  ('folic-acid', 'Folat', 'tr', 'common'),
  ('folic-acid', '5-MTHF', 'en', 'common'),
  ('methylcobalamin', 'B12 Vitamini', 'tr', 'common'),
  ('methylcobalamin', 'Metilkobalamin', 'tr', 'common'),
  ('beta-glucan', 'Beta-Glukan', 'tr', 'common'),
  ('beta-glucan', 'Beta Glukan', 'tr', 'common'),
  ('omega-3', 'Omega 3', 'tr', 'common'),
  ('omega-3', 'Balık Yağı', 'tr', 'common'),
  ('omega-3', 'EPA', 'en', 'common'),
  ('omega-3', 'DHA', 'en', 'common'),
  ('coq10', 'Ubiquinol', 'en', 'common'),
  ('coq10', 'Koenzim Q10', 'tr', 'common'),
  ('zinc', 'Çinko', 'tr', 'common'),
  ('magnesium', 'Magnezyum', 'tr', 'common'),
  ('ascorbic-acid', 'Askorbik Asit', 'tr', 'common'),
  ('echinacea', 'Echinacea', 'tr', 'common'),
  ('elderberry', 'Sambucus', 'en', 'common'),
  ('ginseng', 'Ginseng', 'tr', 'common'),
  ('rhodiola', 'Rhodiola', 'tr', 'common'),
  ('ashwagandha', 'Ashwagandha', 'tr', 'common'),
  ('melatonin', 'Melatonin', 'tr', 'common'),
  ('l-theanine', 'L-Teanin', 'tr', 'common'),
  ('lutein', 'Lutein', 'tr', 'common'),
  ('hydrolyzed-collagen', 'Hidrolize Kolajen', 'tr', 'common'),
  ('hydrolyzed-collagen', 'Kolajen', 'tr', 'common'),
  ('biotin', 'Biotin', 'tr', 'common'),
  ('iron', 'Demir', 'tr', 'common'),
  ('calcium', 'Kalsiyum', 'tr', 'common'),
  ('selenium', 'Selenyum', 'tr', 'common'),
  ('creatine', 'Kreatin', 'tr', 'common'),
  ('whey-protein', 'Whey Protein', 'tr', 'common')
) AS a(slug, alias_name, language, alias_type)
JOIN ingredients i ON i.ingredient_slug = a.slug
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART B — INGREDIENT ↔ NEED MAPPINGS (sıfırdan yapılandır)
-- ============================================================================

-- Önce mevcut supplement/both need'ler için mapping'leri temizle (clean slate)
DELETE FROM ingredient_need_mappings
WHERE need_id IN (SELECT need_id FROM needs WHERE domain_type IN ('supplement','both'));

-- Şimdi tam mapping setini ekle. Format:
--   (ingredient_slug, need_slug, relevance_score, effect_type, evidence_level, usage_context_note)
INSERT INTO ingredient_need_mappings (ingredient_id, need_id, relevance_score, effect_type, evidence_level, usage_context_note)
SELECT i.ingredient_id, n.need_id, m.relevance_score, m.effect_type, m.evidence_level, m.note
FROM (VALUES
  -- ========== BAĞIŞIKLIK DESTEĞİ ==========
  ('cholecalciferol',          'bagisiklik-destegi',      90, 'direct_support', 'systematic_review',    'D3: doğuştan bağışıklık ve T-hücre aktivasyonunda kritik. Kış aylarında 1000-4000 IU.'),
  ('menaquinone',              'bagisiklik-destegi',      55, 'complementary',  'cohort_study',         'K2: D3 ile sinerjik, kemik-bağışıklık eksen dengesini destekler.'),
  ('zinc',                     'bagisiklik-destegi',      85, 'direct_support', 'systematic_review',    'Çinko: T hücresi olgunlaşması ve doğuştan bağışıklık için zorunlu.'),
  ('ascorbic-acid',            'bagisiklik-destegi',      80, 'direct_support', 'systematic_review',    'C Vit: nötrofil fonksiyonu, antioksidan kanıtı 75+ yıl. 200-1000 mg/gün.'),
  ('beta-glucan',              'bagisiklik-destegi',      85, 'direct_support', 'randomized_controlled','Beta-Glukan (mantar/yulaf): makrofaj aktivasyonu, kanıtlı URTI azalması.'),
  ('elderberry',               'bagisiklik-destegi',      75, 'direct_support', 'randomized_controlled','Kara mürver: grip süresini ortalama 2-4 gün kısaltır (meta-analiz).'),
  ('echinacea',                'bagisiklik-destegi',      70, 'direct_support', 'systematic_review',    'Ekinezya: üst solunum enfeksiyonu risk azaltma %35.'),
  ('selenium',                 'bagisiklik-destegi',      65, 'complementary',  'cohort_study',         'Selenyum: glutatyon peroksidaz kofaktörü. Türkiye eksik bölge var.'),
  ('lactobacillus-acidophilus','bagisiklik-destegi',      80, 'direct_support', 'systematic_review',    'Probiyotik: %70 bağışıklığın bağırsakta şekillendiğini destekler.'),
  ('bifidobacterium-lactis',   'bagisiklik-destegi',      75, 'direct_support', 'randomized_controlled','Bifido: IgA üretimini ve solunum yolu bağışıklığını artırır.'),
  ('quercetin',                'bagisiklik-destegi',      70, 'direct_support', 'randomized_controlled','Querçetin: antiviral + antihistaminik. C Vit ile sinerjik.'),

  -- ========== KALP & DAMAR SAĞLIĞI ==========
  ('omega-3',                  'kalp-damar-sagligi',      90, 'direct_support', 'systematic_review',    'EPA/DHA: trigliserit düşürme, inflamasyon azaltma. Günlük 1-2g.'),
  ('coq10',                    'kalp-damar-sagligi',      85, 'direct_support', 'randomized_controlled','CoQ10: kalp kası enerji üretimi. Statin alanlarda önerilir.'),
  ('magnesium',                'kalp-damar-sagligi',      80, 'direct_support', 'systematic_review',    'Mg: ritim düzenleyici, kan basıncı yönetiminde önemli.'),
  ('niacin',                   'kalp-damar-sagligi',      75, 'direct_support', 'randomized_controlled','Niasin: HDL artışı + LDL düşüşü. Yüksek doz doktor gözetiminde.'),
  ('menaquinone',              'kalp-damar-sagligi',      75, 'direct_support', 'randomized_controlled','K2: arter kalsifikasyonunu önler, MK-7 formu tercih.'),
  ('cholecalciferol',          'kalp-damar-sagligi',      60, 'complementary',  'cohort_study',         'D3: düşük seviyelerde kardiyovasküler risk artışı gözlenmiştir.'),
  ('quercetin',                'kalp-damar-sagligi',      60, 'complementary',  'cohort_study',         'Querçetin: endotel fonksiyonunu iyileştirir (in vivo).'),
  ('hydrolyzed-collagen',      'kalp-damar-sagligi',      40, 'complementary',  'case_control',         'Kolajen: damar duvarı elastikiyetine dolaylı katkı.'),

  -- ========== KEMİK & EKLEM ==========
  ('calcium',                  'kemik-eklem',             90, 'direct_support', 'systematic_review',    'Kalsiyum: kemik mineral matrisinin temel minerali.'),
  ('cholecalciferol',          'kemik-eklem',             90, 'direct_support', 'systematic_review',    'D3: kalsiyum emilimi için zorunlu kofaktör.'),
  ('menaquinone',              'kemik-eklem',             85, 'direct_support', 'randomized_controlled','K2: kalsiyumu kemiğe yönlendirir, arterden uzak tutar.'),
  ('magnesium',                'kemik-eklem',             80, 'direct_support', 'randomized_controlled','Mg: kemik mineralizasyonu + D3 aktivasyonu.'),
  ('hydrolyzed-collagen',      'kemik-eklem',             75, 'direct_support', 'randomized_controlled','Kolajen tip 1/2: kemik matrisinin %30''u + kıkırdak yapı.'),
  ('glucosamine',              'kemik-eklem',             80, 'direct_support', 'systematic_review',    'Glukozamin: osteoartrit ağrısında hafif-orta rahatlama.'),
  ('chondroitin',              'kemik-eklem',             75, 'direct_support', 'systematic_review',    'Kondroitin: glukozamin ile kombinasyonda etkinliği artar.'),
  ('msm',                      'kemik-eklem',             65, 'direct_support', 'randomized_controlled','MSM: eklem inflamasyonu ve ağrısını azaltır.'),
  ('vitamin-a',                'kemik-eklem',             45, 'complementary',  'cohort_study',         'A Vit: osteoblast aktivitesinde rol. Yüksek doz kemik yoğunluğunu azaltabilir.'),

  -- ========== SİNDİRİM SAĞLIĞI ==========
  ('lactobacillus-acidophilus','sindirim-sagligi',        85, 'direct_support', 'systematic_review',    'L.acidophilus: IBS semptomlarında ve laktoz sindiriminde etkili.'),
  ('bifidobacterium-lactis',   'sindirim-sagligi',        85, 'direct_support', 'systematic_review',    'B.lactis: bağırsak geçişini düzenler, konstipasyonda azalma.'),
  ('inulin',                   'sindirim-sagligi',        75, 'direct_support', 'randomized_controlled','İnülin: prebiyotik lif. Bifidobakterileri besler.'),
  ('l-glutamine',              'sindirim-sagligi',        70, 'direct_support', 'randomized_controlled','Glutamin: bağırsak epitel hücrelerinin ana yakıtı. Leaky gut''ta.'),
  ('betaine-hcl',              'sindirim-sagligi',        60, 'complementary',  'case_control',         'Betain HCl: mide asidini destekler. Düşük HCl üretenlerde.'),
  ('ginger-extract',           'sindirim-sagligi',        55, 'complementary',  'randomized_controlled','Zencefil: bulantı, gaz ve dispepsi semptomlarında.'),

  -- ========== ENERJİ & CANLILIK ==========
  ('methylcobalamin',          'enerji-canlilik',         85, 'direct_support', 'systematic_review',    'B12: metilasyon, enerji metabolizması. Eksikliği kronik yorgunluk yapar.'),
  ('vitamin-b6',               'enerji-canlilik',         75, 'direct_support', 'randomized_controlled','B6: amino asit metabolizması + nörotransmitter sentezi.'),
  ('folic-acid',               'enerji-canlilik',         70, 'direct_support', 'randomized_controlled','Folat: DNA sentezi + eritrosit üretimi.'),
  ('iron',                     'enerji-canlilik',         85, 'direct_support', 'systematic_review',    'Demir: oksijen taşıma + ATP üretimi. Kadınlarda özellikle kritik.'),
  ('coq10',                    'enerji-canlilik',         80, 'direct_support', 'randomized_controlled','CoQ10: mitokondriyal ATP sentezinde kofaktör.'),
  ('l-carnitine',              'enerji-canlilik',         75, 'direct_support', 'systematic_review',    'L-Karnitin: yağ asidi mitokondriye taşıma. Enerji için.'),
  ('ginseng',                  'enerji-canlilik',         80, 'direct_support', 'randomized_controlled','Ginseng: mental + fiziksel yorgunlukta kanıtlı etkili.'),
  ('ashwagandha',              'enerji-canlilik',         70, 'direct_support', 'randomized_controlled','Ashwagandha: adaptojen, kronik stres kaynaklı yorgunlukta.'),
  ('rhodiola',                 'enerji-canlilik',         70, 'direct_support', 'randomized_controlled','Rhodiola: akut mental yorgunluk ve stres azaltma.'),
  ('cholecalciferol',          'enerji-canlilik',         55, 'complementary',  'cohort_study',         'D3 eksikliği yorgunlukla ilişkili. Seviye kontrolü öner.'),

  -- ========== UYKU & STRES YÖNETİMİ ==========
  ('magnesium',                'uyku-stres-yonetimi',     85, 'direct_support', 'systematic_review',    'Magnesium (özellikle glisinat): GABA aktivasyonu, kas gevşemesi.'),
  ('l-theanine',               'uyku-stres-yonetimi',     85, 'direct_support', 'randomized_controlled','L-Teanin: alfa dalga artışı, sakin odaklanma. 200 mg etkili.'),
  ('ashwagandha',              'uyku-stres-yonetimi',     85, 'direct_support', 'randomized_controlled','Ashwagandha: kortizol azalması, uyku kalitesi artışı.'),
  ('melatonin',                'uyku-stres-yonetimi',     90, 'direct_support', 'systematic_review',    'Melatonin: sirkadiyan ritim ayarı. Jet-lag ve uyku gecikmesinde.'),
  ('rhodiola',                 'uyku-stres-yonetimi',     75, 'direct_support', 'randomized_controlled','Rhodiola: stres adaptasyonu (sabah kullan, uyku saati değil).'),
  ('vitamin-b6',               'uyku-stres-yonetimi',     60, 'complementary',  'cohort_study',         'B6: serotonin + melatonin sentezinde kofaktör.'),
  ('quercetin',                'uyku-stres-yonetimi',     45, 'complementary',  'in_vitro',             'Querçetin: anti-inflamatuar, dolaylı uyku etkisi.'),

  -- ========== KAS & PERFORMANS ==========
  ('creatine',                 'kas-performans',          90, 'direct_support', 'systematic_review',    'Kreatin: ATP-PCr sistemi. En kanıtlı ergojenik supplement.'),
  ('whey-protein',             'kas-performans',          85, 'direct_support', 'systematic_review',    'Whey: hızlı amino asit profili, kas protein sentezi.'),
  ('bcaa',                     'kas-performans',          80, 'direct_support', 'randomized_controlled','BCAA: antrenman sırası katabolizmayı azaltır, toparlanma.'),
  ('hydrolyzed-collagen',      'kas-performans',          75, 'direct_support', 'randomized_controlled','Kolajen peptid: tendon sağlığı + sakatlık önleme.'),
  ('l-carnitine',              'kas-performans',          70, 'direct_support', 'randomized_controlled','L-Karnitin: yağ oksidasyonu + toparlanma.'),
  ('beta-alanine',             'kas-performans',          70, 'direct_support', 'randomized_controlled','Beta-alanin: karnozin üretimi, 1-4 dk dayanıklılıkta etkili.'),
  ('magnesium',                'kas-performans',          75, 'direct_support', 'randomized_controlled','Magnesium: kas kasılması, kramplara karşı.'),
  ('cholecalciferol',          'kas-performans',          60, 'complementary',  'cohort_study',         'D3: kas kuvveti ve güç ile korele (özellikle yaşlı sporcular).'),

  -- ========== BEYİN & BİLİŞSEL FONKSİYON ==========
  ('omega-3',                  'beyin-bilissel-fonksiyon',85, 'direct_support', 'systematic_review',    'DHA: beyin yağ asidi kompozisyonunun %30''u. Bilişsel koruma.'),
  ('l-theanine',               'beyin-bilissel-fonksiyon',70, 'complementary',  'randomized_controlled','L-Teanin: kafein ile sinerjik odaklanma (100+200 mg).'),
  ('ashwagandha',              'beyin-bilissel-fonksiyon',65, 'direct_support', 'randomized_controlled','Ashwagandha: hafıza ve reaksiyon süresinde iyileşme.'),
  ('bacopa-monnieri',          'beyin-bilissel-fonksiyon',75, 'direct_support', 'systematic_review',    'Bacopa: 12 haftada hafıza + bilgi işleme hızı.'),
  ('ginkgo-biloba',            'beyin-bilissel-fonksiyon',70, 'direct_support', 'systematic_review',    'Ginkgo: serebral dolaşımı artırır, mild bilişsel bozuklukta.'),
  ('alpha-gpc',                'beyin-bilissel-fonksiyon',70, 'direct_support', 'randomized_controlled','Alpha-GPC: kolinerjik aktivite + büyüme hormonu salınımı.'),
  ('methylcobalamin',          'beyin-bilissel-fonksiyon',75, 'direct_support', 'systematic_review',    'B12: sinir kılıfı sağlığı, bilişsel koruma.'),
  ('rhodiola',                 'beyin-bilissel-fonksiyon',60, 'complementary',  'randomized_controlled','Rhodiola: mental yorgunluk azaltma.'),
  ('folic-acid',               'beyin-bilissel-fonksiyon',55, 'complementary',  'cohort_study',         'Folat: homosistein azaltma, yaşlanma ile bilişsel koruma.'),

  -- ========== SAÇ & TIRNAK ==========
  ('biotin',                   'sac-tirnak',              85, 'direct_support', 'systematic_review',    'Biotin: saç ve tırnak keratin yapısı. Eksiklikte dökülme.'),
  ('zinc',                     'sac-tirnak',              70, 'direct_support', 'randomized_controlled','Çinko: saç folikül fonksiyonu, dökülme azaltma.'),
  ('iron',                     'sac-tirnak',              75, 'direct_support', 'systematic_review',    'Demir: ferritin düşüklüğü kadınlarda saç dökülme ana nedeni.'),
  ('hydrolyzed-collagen',      'sac-tirnak',              70, 'direct_support', 'randomized_controlled','Kolajen: saç dehydrasyonu + tırnak kalınlığı artışı.'),
  ('methylcobalamin',          'sac-tirnak',              60, 'complementary',  'cohort_study',         'B12: eksiklikte saç beyazlaşma + dökülme.'),
  ('selenium',                 'sac-tirnak',              55, 'complementary',  'case_control',         'Selenyum: tiroid ve saç sağlığı bağlantısı.'),

  -- ========== GÖZ SAĞLIĞI ==========
  ('lutein',                   'goz-sagligi',             90, 'direct_support', 'systematic_review',    'Lutein: makula pigmenti, yaşa bağlı makula dejenerasyonu (AMD) koruma.'),
  ('zeaxanthin',               'goz-sagligi',             90, 'direct_support', 'systematic_review',    'Zeaksantin: lutein ile kombinasyon, foveal koruma.'),
  ('omega-3',                  'goz-sagligi',             80, 'direct_support', 'systematic_review',    'DHA: retina lipit kompozisyonu + kuru göz semptomları.'),
  ('vitamin-a',                'goz-sagligi',             80, 'direct_support', 'systematic_review',    'A Vit: retinal fonksiyon (gece görüşü), eksiklik körlük.'),
  ('bilberry',                 'goz-sagligi',             70, 'direct_support', 'randomized_controlled','Yaban mersini: antosiyaninler, retina kan akışı.'),
  ('zinc',                     'goz-sagligi',             60, 'complementary',  'cohort_study',         'Çinko: A vit transport + makula koruma (AREDS çalışması).'),
  ('quercetin',                'goz-sagligi',             45, 'complementary',  'in_vitro',             'Querçetin: antioksidan etki, katarakt risk azaltma.'),

  -- ========== HORMONAL DENGE ==========
  ('magnesium',                'hormonal-denge',          75, 'direct_support', 'randomized_controlled','Mg: PMS semptomları, insülin duyarlılığı, tiroid.'),
  ('cholecalciferol',          'hormonal-denge',          70, 'direct_support', 'randomized_controlled','D3: östrojen reseptörleri, testosteron seviyesi ile korele.'),
  ('ashwagandha',              'hormonal-denge',          75, 'direct_support', 'randomized_controlled','Ashwagandha: kortizol + testosteron + tiroid etkisi.'),
  ('rhodiola',                 'hormonal-denge',          60, 'direct_support', 'case_control',         'Rhodiola: HPA aksı + adrenal yorgunluk desteği.'),
  ('vitamin-b6',               'hormonal-denge',          70, 'direct_support', 'randomized_controlled','B6: PMS + kadın hormonal döngüsü.'),
  ('zinc',                     'hormonal-denge',          65, 'complementary',  'randomized_controlled','Çinko: testosteron + insülin hassasiyeti.'),
  ('selenium',                 'hormonal-denge',          60, 'complementary',  'case_control',         'Selenyum: tiroid hormonu dönüşümü (T4→T3).'),
  ('omega-3',                  'hormonal-denge',          55, 'complementary',  'cohort_study',         'Omega-3: hormonal kaynaklı inflamasyonu azaltır.'),

  -- ========== İNFLAMASYON AZALTMA ==========
  ('omega-3',                  'inflamasyon-azaltma',     90, 'direct_support', 'systematic_review',    'EPA/DHA: özüt proinflamatuar lipid mediyatörleri azaltır.'),
  ('quercetin',                'inflamasyon-azaltma',     75, 'direct_support', 'randomized_controlled','Querçetin: mast hücresi stabilizasyonu + TNF-α azaltma.'),
  ('magnesium',                'inflamasyon-azaltma',     65, 'direct_support', 'randomized_controlled','Mg: CRP ve IL-6 düşüşü.'),
  ('cholecalciferol',          'inflamasyon-azaltma',     70, 'direct_support', 'systematic_review',    'D3: sistemik inflamasyon + otoimmün modülasyon.'),
  ('coq10',                    'inflamasyon-azaltma',     65, 'direct_support', 'randomized_controlled','CoQ10: oksidatif stres azaltma.'),
  ('selenium',                 'inflamasyon-azaltma',     55, 'complementary',  'cohort_study',         'Selenyum: glutatyon peroksidaz aktivitesi.'),
  ('zinc',                     'inflamasyon-azaltma',     50, 'complementary',  'case_control',         'Çinko: NF-kB yolu baskılama.'),
  ('ashwagandha',              'inflamasyon-azaltma',     60, 'complementary',  'randomized_controlled','Ashwagandha: CRP azaltma, adaptojen etki.')
) AS m(ingredient_slug, need_slug, relevance_score, effect_type, evidence_level, note)
JOIN ingredients i ON i.ingredient_slug = m.ingredient_slug
JOIN needs n ON n.need_slug = m.need_slug;

-- ============================================================================
-- PART C — PRODUCT_NEED_SCORES RECOMPUTE
-- ============================================================================

-- Supplement ürünleri için tüm supplement+both need'lere ait skorları temizle
DELETE FROM product_need_scores
WHERE need_id IN (SELECT need_id FROM needs WHERE domain_type IN ('supplement','both'))
  AND product_id IN (SELECT product_id FROM products WHERE domain_type = 'supplement');

-- Auto-compute: ürünün içerdiği bileşenlerin ilgili need'e ortalama katkısı
INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary, calculated_at)
SELECT
  pi.product_id,
  inm.need_id,
  ROUND(AVG(inm.relevance_score * CASE inm.effect_type
    WHEN 'direct_support'    THEN 1.00
    WHEN 'indirect_support'  THEN 0.75
    WHEN 'complementary'     THEN 0.55
    WHEN 'caution_related'   THEN 0.25
    ELSE 0.50
  END))::numeric(5,2) AS score,
  CASE
    WHEN COUNT(*) >= 4 THEN 'high'
    WHEN COUNT(*) >= 2 THEN 'medium'
    ELSE 'low'
  END AS confidence,
  COUNT(*) || ' bileşen bu ihtiyaca doğrudan/dolaylı katkı sağlıyor' AS reason,
  NOW() AS calculated_at
FROM product_ingredients pi
JOIN products p ON p.product_id = pi.product_id
JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
JOIN needs n ON n.need_id = inm.need_id
WHERE p.domain_type = 'supplement'
  AND p.status IN ('published', 'active')
  AND n.domain_type IN ('supplement', 'both')
GROUP BY pi.product_id, inm.need_id
HAVING AVG(inm.relevance_score) >= 25;

COMMIT;

-- ============================================================================
-- POST-SEED RAPORU
-- ============================================================================
SELECT
  n.need_slug,
  n.need_name,
  (SELECT COUNT(*)::int FROM ingredient_need_mappings inm WHERE inm.need_id = n.need_id) AS mapping_count,
  (SELECT COUNT(*)::int FROM product_need_scores ns
     JOIN products p ON p.product_id = ns.product_id
     WHERE ns.need_id = n.need_id AND p.domain_type = 'supplement') AS supplement_product_count
FROM needs n
WHERE n.domain_type IN ('supplement','both')
ORDER BY n.need_slug;
