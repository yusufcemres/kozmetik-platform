-- Supplement need coverage breakdown
-- 1. How many ingredient_need_mappings exist per supplement-domain need?
-- 2. How many supplement products have product_ingredients rows?
-- 3. How many ingredient_need_mappings link to ingredients that appear in any supplement's product_ingredients?
SELECT '1_mappings_per_supplement_need' AS section;
SELECT n.need_slug, COALESCE(COUNT(m.ingredient_need_mapping_id), 0) AS mapping_count
FROM needs n
LEFT JOIN ingredient_need_mappings m ON m.need_id = n.need_id
WHERE COALESCE(n.domain_type, 'cosmetic') = 'supplement'
  AND COALESCE(n.is_active, TRUE) = TRUE
GROUP BY n.need_slug
ORDER BY mapping_count ASC;

SELECT '2_supplement_products_with_ingredients' AS section;
SELECT
  COUNT(DISTINCT p.product_id) FILTER (WHERE pi.product_id IS NOT NULL) AS with_ingredients,
  COUNT(DISTINCT p.product_id) FILTER (WHERE pi.product_id IS NULL)     AS without_ingredients,
  COUNT(DISTINCT p.product_id)                                          AS total_published
FROM products p
LEFT JOIN product_ingredients pi ON pi.product_id = p.product_id
WHERE p.domain_type = 'supplement' AND p.status = 'published';

SELECT '3_supplement_need_ingredient_coverage' AS section;
SELECT n.need_slug,
       COUNT(DISTINCT m.ingredient_id)                                  AS mapped_ingredients,
       COUNT(DISTINCT pi.ingredient_id)                                  AS ingredients_in_catalog
FROM needs n
LEFT JOIN ingredient_need_mappings m ON m.need_id = n.need_id
LEFT JOIN product_ingredients pi
       ON pi.ingredient_id = m.ingredient_id
LEFT JOIN products p
       ON p.product_id = pi.product_id
      AND p.domain_type = 'supplement'
      AND p.status = 'published'
WHERE COALESCE(n.domain_type, 'cosmetic') = 'supplement'
  AND COALESCE(n.is_active, TRUE) = TRUE
GROUP BY n.need_slug
ORDER BY ingredients_in_catalog ASC;
