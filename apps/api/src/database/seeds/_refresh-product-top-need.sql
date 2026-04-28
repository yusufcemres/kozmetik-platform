-- products.top_need_name + top_need_score'u her ürünün en yüksek skorlu need'ine göre günceller.
-- Kart liste sayfaları bu alanları kullanıyor (N+1 önlemek için denormalized).

UPDATE products p
SET
  top_need_name = sub.need_name,
  top_need_score = sub.compatibility_score
FROM (
  SELECT DISTINCT ON (ns.product_id)
    ns.product_id,
    n.need_name,
    ns.compatibility_score
  FROM product_need_scores ns
  JOIN needs n ON n.need_id = ns.need_id
  ORDER BY ns.product_id, ns.compatibility_score DESC
) sub
WHERE p.product_id = sub.product_id;

-- Rapor: top_need dolu/boş
SELECT
  domain_type,
  COUNT(*) FILTER (WHERE top_need_name IS NOT NULL) AS with_top_need,
  COUNT(*) FILTER (WHERE top_need_name IS NULL) AS without,
  COUNT(*) AS total
FROM products
WHERE status IN ('published','active')
GROUP BY domain_type;
