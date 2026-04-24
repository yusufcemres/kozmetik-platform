-- Sprint 2 (#10) — Kozmetik ürünlerde concentration_band ve concentration_percent audit.
-- Read-only. NULL/'unknown' yüzdesini çıkarır. UI fallback'inin gerekip gerekmediğine
-- karar vermek için kullanılır.
--
-- Kullanım:
--   pnpm ts-node src/scripts/run-sql-file.ts src/scripts/data-quality/audit-cosmetic-concentration.sql

-- === 1. Genel concentration_band dağılımı (kozmetik ürünler için) ===
SELECT
  pi.concentration_band,
  COUNT(*) AS row_count,
  ROUND(COUNT(*)::numeric * 100 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM product_ingredients pi
JOIN products p ON p.product_id = pi.product_id
WHERE p.domain_type = 'cosmetic'
GROUP BY pi.concentration_band
ORDER BY row_count DESC;

-- === 2. concentration_percent NULL yüzdesi ===
SELECT
  COUNT(*) FILTER (WHERE pi.concentration_percent IS NULL) AS null_count,
  COUNT(*) FILTER (WHERE pi.concentration_percent IS NOT NULL) AS filled_count,
  COUNT(*) AS total,
  ROUND(
    COUNT(*) FILTER (WHERE pi.concentration_percent IS NULL)::numeric * 100 / NULLIF(COUNT(*), 0),
    1
  ) AS null_pct
FROM product_ingredients pi
JOIN products p ON p.product_id = pi.product_id
WHERE p.domain_type = 'cosmetic';

-- === 3. concentration_source dağılımı ===
SELECT
  COALESCE(pi.concentration_source, 'NULL') AS source,
  COUNT(*) AS row_count
FROM product_ingredients pi
JOIN products p ON p.product_id = pi.product_id
WHERE p.domain_type = 'cosmetic'
GROUP BY pi.concentration_source
ORDER BY row_count DESC;

-- === 4. En az 1 bileşende concentration_percent dolu olan ürün sayısı ===
SELECT
  COUNT(DISTINCT p.product_id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM product_ingredients pi2
      WHERE pi2.product_id = p.product_id AND pi2.concentration_percent IS NOT NULL
    )
  ) AS products_with_any_percent,
  COUNT(DISTINCT p.product_id) AS total_cosmetic_products
FROM products p
WHERE p.domain_type = 'cosmetic' AND p.status IN ('published', 'active');

-- === 5. INCI rank dağılımı (UI fallback için referans) ===
-- rank 1-3 → YÜKSEK, 4-8 → ORTA, 9-20 → DÜŞÜK, 21+ → ESER
SELECT
  CASE
    WHEN pi.inci_order_rank BETWEEN 1 AND 3 THEN '1-3 (YÜKSEK)'
    WHEN pi.inci_order_rank BETWEEN 4 AND 8 THEN '4-8 (ORTA)'
    WHEN pi.inci_order_rank BETWEEN 9 AND 20 THEN '9-20 (DÜŞÜK)'
    ELSE '21+ (ESER)'
  END AS inci_band,
  COUNT(*) AS row_count
FROM product_ingredients pi
JOIN products p ON p.product_id = pi.product_id
WHERE p.domain_type = 'cosmetic' AND p.status IN ('published', 'active')
GROUP BY inci_band
ORDER BY inci_band;
