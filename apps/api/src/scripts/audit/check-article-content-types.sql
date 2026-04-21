-- Audit content_type distribution in content_articles
-- Frontend (rehber/page.tsx CONTENT_TYPES) expects:
--   guide | ingredient_explainer | need_guide | label_reading | comparison | news
-- Seed v1 (articles.sql) used 'ingredient_guide' — legacy mismatch.

SELECT 'content_type_distribution' AS section;
SELECT content_type, COUNT(*) AS cnt
FROM content_articles
WHERE status = 'published'
GROUP BY content_type
ORDER BY cnt DESC;

SELECT 'sample_per_type' AS section;
SELECT content_type, slug, title
FROM content_articles
WHERE status = 'published'
ORDER BY content_type, published_at DESC;
