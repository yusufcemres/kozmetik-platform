-- Niş supplement bileşenleri için mapping genişletme
-- (curcumin, maca, 5-htp, astaxanthin, bromelain, resveratrol vb.)
--
-- Audit (önce): 27 supplement ürün need-score'suzdu çünkü bileşenleri
-- ingredient_need_mappings'ta yoktu. Bu seed onları tamamlar.
--
-- Idempotent: NOT EXISTS guard'lı.

INSERT INTO ingredient_need_mappings (ingredient_id, need_id, relevance_score, effect_type, evidence_level, usage_context_note)
SELECT i.ingredient_id, n.need_id, m.relevance_score, m.effect_type, m.evidence_level, m.note
FROM (VALUES
  -- Curcumin (zerdeçal aktif maddesi)
  ('curcumin',              'inflamasyon-azaltma',     90, 'direct_support', 'systematic_review',    'Curcumin: NF-kB yolu baskılama, potent anti-inflamatuar.'),
  ('curcumin',              'kalp-damar-sagligi',      65, 'direct_support', 'randomized_controlled','Curcumin: endotel fonksiyonu + LDL oksidasyonu azaltma.'),
  ('curcumin',              'sindirim-sagligi',        60, 'complementary',  'randomized_controlled','Curcumin: IBS semptomları ve mide dispepsi.'),
  ('curcumin',              'beyin-bilissel-fonksiyon',55, 'complementary',  'case_control',         'Curcumin: nöroinflamasyon azaltma.'),
  ('curcumin',              'kemik-eklem',             60, 'direct_support', 'randomized_controlled','Curcumin: osteoartrit ağrısı azaltma (400mg+piperin).'),

  -- Maca Root
  ('maca-root',             'hormonal-denge',          85, 'direct_support', 'randomized_controlled','Maca: libido + hormonal denge, özellikle menopoz dönemi.'),
  ('maca-root',             'enerji-canlilik',         75, 'direct_support', 'randomized_controlled','Maca: adaptojen, dayanıklılık ve enerji.'),
  ('maca-root',             'uyku-stres-yonetimi',     55, 'complementary',  'case_control',         'Maca: stres kaynaklı yorgunluk azaltma.'),

  -- 5-HTP
  ('5-htp',                 'uyku-stres-yonetimi',     85, 'direct_support', 'randomized_controlled','5-HTP: serotonin öncüsü, uyku kalitesi + ruh hali.'),
  ('5-htp',                 'hormonal-denge',          55, 'complementary',  'case_control',         '5-HTP: PMS ve perimenopozal durum dalgalanmaları.'),

  -- Alpha-Lipoic Acid
  ('alpha-lipoic-acid',     'inflamasyon-azaltma',     70, 'direct_support', 'randomized_controlled','ALA: güçlü antioksidan, diyabetik nöropati çalışmaları.'),
  ('alpha-lipoic-acid',     'kalp-damar-sagligi',      65, 'direct_support', 'randomized_controlled','ALA: endotel fonksiyonu + insülin duyarlılığı.'),
  ('alpha-lipoic-acid',     'enerji-canlilik',         60, 'complementary',  'cohort_study',         'ALA: mitokondriyal fonksiyon desteği.'),

  -- Astaxanthin (Astaksantin)
  ('astaxanthin',           'goz-sagligi',             80, 'direct_support', 'randomized_controlled','Astaksantin: göz yorgunluğu ve retinal koruma.'),
  ('astaxanthin',           'inflamasyon-azaltma',     75, 'direct_support', 'randomized_controlled','Astaksantin: vitamin E''den 100x daha güçlü antioksidan.'),
  ('astaxanthin',           'kalp-damar-sagligi',      65, 'direct_support', 'cohort_study',         'Astaksantin: LDL oksidasyonu azaltma.'),

  -- Bromelain
  ('bromelain',             'inflamasyon-azaltma',     80, 'direct_support', 'systematic_review',    'Bromelain: ameliyat sonrası şişlik + sinüzit iltihabı.'),
  ('bromelain',             'sindirim-sagligi',        75, 'direct_support', 'randomized_controlled','Bromelain: protein sindirimi + sindirim rahatsızlığı.'),
  ('bromelain',             'kemik-eklem',             55, 'complementary',  'randomized_controlled','Bromelain: osteoartrit ağrısı adjuvan.'),

  -- Chromium Picolinate
  ('chromium-picolinate',   'hormonal-denge',          75, 'direct_support', 'randomized_controlled','Krom Pikolinat: insülin duyarlılığı + glikoz metabolizması.'),
  ('chromium-picolinate',   'enerji-canlilik',         50, 'complementary',  'cohort_study',         'Krom: karbonhidrat metabolizması, atak hafifletme.'),

  -- Silymarin (Milk Thistle)
  ('silymarin',             'inflamasyon-azaltma',     70, 'direct_support', 'systematic_review',    'Silimarin: karaciğer koruyucu, sistemik anti-inflamatuar.'),
  ('silymarin',             'sindirim-sagligi',        55, 'complementary',  'cohort_study',         'Silimarin: karaciğer safra akışı desteği.'),

  -- Resveratrol
  ('resveratrol',           'kalp-damar-sagligi',      80, 'direct_support', 'systematic_review',    'Resveratrol: endotel fonksiyonu + SIRT1 aktivasyonu.'),
  ('resveratrol',           'inflamasyon-azaltma',     75, 'direct_support', 'randomized_controlled','Resveratrol: anti-inflamatuar polifenol (üzüm kabuğu).'),
  ('resveratrol',           'beyin-bilissel-fonksiyon',60, 'complementary',  'randomized_controlled','Resveratrol: serebral kan akışı iyileştirme.'),

  -- Iodine
  ('iodine',                'hormonal-denge',          85, 'direct_support', 'systematic_review',    'İyot: tiroid hormonu (T3/T4) için zorunlu.'),
  ('iodine',                'enerji-canlilik',         60, 'complementary',  'cohort_study',         'İyot: eksiklikte hipotiroid kaynaklı yorgunluk.'),
  ('potassium-iodide',      'hormonal-denge',          80, 'direct_support', 'systematic_review',    'Potasyum İyodür: tiroid hormonu sentezi.'),

  -- L-Arginine
  ('l-arginine',            'kalp-damar-sagligi',      70, 'direct_support', 'randomized_controlled','L-Arjinin: NO sentezi, vazodilatasyon.'),
  ('l-arginine',            'kas-performans',          70, 'direct_support', 'randomized_controlled','L-Arjinin: kan akışı + antrenman performansı.'),
  ('arginine',              'kalp-damar-sagligi',      65, 'direct_support', 'randomized_controlled','Arjinin: NO sentezi (L-form ile benzer etki).'),

  -- Myo-Inositol
  ('myo-inositol',          'hormonal-denge',          80, 'direct_support', 'systematic_review',    'Myo-İnositol: PCOS, insülin duyarlılığı, fertilite.'),
  ('myo-inositol',          'uyku-stres-yonetimi',     55, 'complementary',  'randomized_controlled','Myo-İnositol: anksiyete semptomları hafifletme.'),
  ('inositol',              'hormonal-denge',          70, 'direct_support', 'randomized_controlled','İnositol: mood + metabolik düzenleme.'),

  -- Phosphatidylserine
  ('phosphatidylserine',    'beyin-bilissel-fonksiyon',75, 'direct_support', 'randomized_controlled','PS: hafıza + bilişsel yaşlanma koruması.'),
  ('phosphatidylserine',    'uyku-stres-yonetimi',     60, 'complementary',  'randomized_controlled','PS: kortizol azaltma, akşam stres.'),

  -- Glutathione
  ('glutathione',           'inflamasyon-azaltma',     70, 'direct_support', 'randomized_controlled','Glutatyon: ana hücresel antioksidan, detoks.'),
  ('glutathione',           'kalp-damar-sagligi',      55, 'complementary',  'cohort_study',         'Glutatyon: oksidatif stres azaltma.'),

  -- Taurine
  ('taurine',               'kalp-damar-sagligi',      65, 'direct_support', 'randomized_controlled','Taurin: kalp ritmi + kan basıncı modülasyonu.'),
  ('taurine',               'goz-sagligi',             60, 'direct_support', 'cohort_study',         'Taurin: retina fonksiyonu + fotoreseptör koruması.'),
  ('taurine',               'kas-performans',          55, 'complementary',  'randomized_controlled','Taurin: kas kasılma + toparlanma.'),

  -- Evening Primrose Oil (GLA)
  ('evening-primrose-oil',  'hormonal-denge',          70, 'direct_support', 'randomized_controlled','Evening Primrose (GLA): PMS + menopoz semptomları.'),
  ('evening-primrose-oil',  'inflamasyon-azaltma',     55, 'complementary',  'cohort_study',         'GLA: omega-6 yolağı anti-inflamatuar.'),
  ('evening-primrose-oil',  'sac-tirnak',              50, 'complementary',  'case_control',         'GLA: atopik dermatit + saç kalitesi.'),

  -- Propolis
  ('propolis',              'bagisiklik-destegi',      80, 'direct_support', 'systematic_review',    'Propolis: antibakteriyel + üst solunum yolu koruma.'),
  ('propolis',              'inflamasyon-azaltma',     60, 'complementary',  'randomized_controlled','Propolis: oral ve dermal anti-inflamatuar.'),

  -- D-Ribose
  ('d-ribose',              'kas-performans',          70, 'direct_support', 'randomized_controlled','D-Riboz: ATP sentezi, antrenman toparlanma.'),
  ('d-ribose',              'enerji-canlilik',         70, 'direct_support', 'cohort_study',         'D-Riboz: fibromiyalji + kronik yorgunluk (küçük çalışmalar).')

) AS m(ingredient_slug, need_slug, relevance_score, effect_type, evidence_level, note)
JOIN ingredients i ON i.ingredient_slug = m.ingredient_slug
JOIN needs n ON n.need_slug = m.need_slug
WHERE NOT EXISTS (
  SELECT 1 FROM ingredient_need_mappings inm
  WHERE inm.ingredient_id = i.ingredient_id AND inm.need_id = n.need_id
);

-- Product_need_scores recompute
DELETE FROM product_need_scores
WHERE need_id IN (SELECT need_id FROM needs WHERE domain_type IN ('supplement','both'))
  AND product_id IN (SELECT product_id FROM products WHERE domain_type='supplement');

INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary, calculated_at)
SELECT
  pi.product_id,
  inm.need_id,
  ROUND(AVG(inm.relevance_score * CASE inm.effect_type
    WHEN 'direct_support'   THEN 1.00
    WHEN 'indirect_support' THEN 0.75
    WHEN 'complementary'    THEN 0.55
    WHEN 'caution_related'  THEN 0.25
    ELSE 0.50
  END))::numeric(5,2),
  CASE WHEN COUNT(*) >= 4 THEN 'high' WHEN COUNT(*) >= 2 THEN 'medium' ELSE 'low' END,
  COUNT(*) || ' bileşen bu ihtiyaca katkı sağlıyor',
  NOW()
FROM product_ingredients pi
JOIN products p ON p.product_id = pi.product_id
JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
JOIN needs n ON n.need_id = inm.need_id
WHERE p.domain_type='supplement' AND p.status IN ('published','active')
  AND n.domain_type IN ('supplement','both')
GROUP BY pi.product_id, inm.need_id
HAVING AVG(inm.relevance_score) >= 25;

SELECT
  (SELECT COUNT(*)::int FROM products p
    WHERE p.domain_type='supplement' AND p.status IN ('published','active')
      AND NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id=p.product_id)
  ) AS supplement_without_scores;
