-- Türk markaları + ülke dağılımı + ürün sayısı denetimi
-- 1. Mevcut country_of_origin dağılımı
SELECT
  COALESCE(country_of_origin, 'NULL') AS country,
  COUNT(*) AS brand_count
FROM brands
GROUP BY country_of_origin
ORDER BY brand_count DESC;

-- 2. Türk markalar listesi + ürün sayısı
SELECT
  b.brand_slug,
  b.brand_name,
  COUNT(p.product_id) AS product_count
FROM brands b
LEFT JOIN products p ON p.brand_id = b.brand_id AND p.status IN ('published','active')
WHERE b.country_of_origin = 'TR'
GROUP BY b.brand_slug, b.brand_name
ORDER BY b.brand_name;

-- 3. NULL country olan ve ürün sayısı yüksek markalar (atlanmış olabilir)
SELECT
  b.brand_slug,
  b.brand_name,
  COUNT(p.product_id) AS product_count
FROM brands b
LEFT JOIN products p ON p.brand_id = b.brand_id AND p.status IN ('published','active')
WHERE b.country_of_origin IS NULL
GROUP BY b.brand_slug, b.brand_name
HAVING COUNT(p.product_id) > 0
ORDER BY product_count DESC
LIMIT 40;
