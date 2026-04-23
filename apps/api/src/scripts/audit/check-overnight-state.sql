-- Overnight end-state verification
SELECT 'price_history_recent' AS section;
SELECT COUNT(*) AS rows_last_hour
FROM product_price_history
WHERE created_at > NOW() - INTERVAL '1 hour';

SELECT 'price_history_distinct_products_total' AS section;
SELECT COUNT(DISTINCT product_id) AS products_with_history
FROM product_price_history;

SELECT 'need_coverage_zero_after_recalc' AS section;
SELECT n.need_slug
FROM needs n
LEFT JOIN product_need_scores s ON s.need_id = n.need_id
WHERE COALESCE(n.is_active, TRUE) = TRUE
GROUP BY n.need_slug, n.domain_type
HAVING COUNT(s.product_need_score_id) = 0
ORDER BY n.need_slug;

SELECT 'need_coverage_low_after_recalc' AS section;
SELECT n.need_slug,
       COALESCE(n.domain_type, 'cosmetic') AS domain_type,
       COUNT(s.product_need_score_id) AS score_count
FROM needs n
LEFT JOIN product_need_scores s ON s.need_id = n.need_id
WHERE COALESCE(n.is_active, TRUE) = TRUE
GROUP BY n.need_slug, n.domain_type
HAVING COUNT(s.product_need_score_id) BETWEEN 1 AND 2
ORDER BY score_count, n.need_slug;

SELECT 'content_articles_total' AS section;
SELECT COUNT(*) AS total_articles FROM content_articles WHERE is_published = TRUE;
