-- Align content_articles.content_type with frontend tab keys.
-- Frontend (apps/web/src/app/(public)/rehber/page.tsx CONTENT_TYPES):
--   guide | ingredient_explainer | need_guide | label_reading | comparison | news
-- Seed v1 (articles.sql) used the legacy 'ingredient_guide' key; v2 uses the
-- correct 'ingredient_explainer'. Rename v1 rows so the İÇERİK İNCELEME tab
-- filter returns them.
--
-- Idempotent: re-running after alignment is a no-op (zero matching rows).

UPDATE content_articles
SET content_type = 'ingredient_explainer'
WHERE content_type = 'ingredient_guide';

-- Sanity check (should return no 'ingredient_guide' rows after the UPDATE)
SELECT content_type, COUNT(*) AS cnt
FROM content_articles
WHERE status = 'published'
GROUP BY content_type
ORDER BY cnt DESC;
