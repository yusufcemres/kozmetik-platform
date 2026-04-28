-- Supplement ürünleri için product_need_scores otomatik hesapla.
-- Kural: supplement ürünü bir ingredient içeriyorsa ve o ingredient bir need ile mapping'liyse,
-- need'in relevance_score ortalaması ürünün need_score'u olur.
--
-- Bağışıklık, kemik-eklem, kalp-damar, enerji, uyku, kas-performans gibi supplement-only
-- need'ler için şu an DB'de çok az skor var (audit: bagisiklik=3 supp). Bu script eksikleri
-- doldurur.

INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary)
SELECT
  pi.product_id,
  inm.need_id,
  ROUND(AVG(inm.relevance_score * CASE inm.effect_type
    WHEN 'direct_support'    THEN 1.0
    WHEN 'indirect_support'  THEN 0.75
    WHEN 'complementary'     THEN 0.5
    WHEN 'caution_related'   THEN 0.3
    ELSE 0.6
  END))::numeric(5,2) AS score,
  CASE
    WHEN COUNT(*) >= 3 THEN 'high'
    WHEN COUNT(*) = 2 THEN 'medium'
    ELSE 'low'
  END AS confidence,
  'Ürün içeriğindeki ' || COUNT(*) || ' bileşenin ihtiyaca katkısından hesaplandı' AS reason
FROM product_ingredients pi
JOIN products p ON p.product_id = pi.product_id
JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
JOIN needs n ON n.need_id = inm.need_id
WHERE p.domain_type = 'supplement'
  AND p.status IN ('published', 'active')
  AND n.domain_type IN ('supplement', 'both')
GROUP BY pi.product_id, inm.need_id
HAVING AVG(inm.relevance_score) >= 30
ON CONFLICT (product_id, need_id) DO UPDATE
  SET compatibility_score = EXCLUDED.compatibility_score,
      confidence_level = EXCLUDED.confidence_level,
      score_reason_summary = EXCLUDED.score_reason_summary;

-- Sonuç raporu
SELECT
  n.need_slug,
  n.need_name,
  COUNT(*) AS supplement_count,
  MIN(ns.compatibility_score) AS min_score,
  MAX(ns.compatibility_score) AS max_score
FROM product_need_scores ns
JOIN products p ON p.product_id = ns.product_id
JOIN needs n ON n.need_id = ns.need_id
WHERE p.domain_type = 'supplement' AND n.domain_type IN ('supplement', 'both')
GROUP BY n.need_slug, n.need_name
ORDER BY supplement_count DESC;
