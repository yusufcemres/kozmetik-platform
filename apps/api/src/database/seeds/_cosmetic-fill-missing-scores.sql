-- Skorsuz kozmetik ürünler için ingredient-bazlı scoring fill-in.
-- Mevcut skorlu 1540 ürüne dokunmuyor, sadece NOT EXISTS olanları ekler.

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
WHERE p.domain_type = 'cosmetic'
  AND p.status IN ('published','active')
  AND n.domain_type IN ('cosmetic','both')
  AND NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id = p.product_id)
GROUP BY pi.product_id, inm.need_id
HAVING AVG(inm.relevance_score) >= 25;

SELECT
  (SELECT COUNT(*)::int FROM products p
    WHERE p.domain_type='cosmetic' AND p.status IN ('published','active')
      AND NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id=p.product_id)) AS still_unscored_cosmetic;
