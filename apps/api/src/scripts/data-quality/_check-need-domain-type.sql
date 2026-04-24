-- Read-only post-apply check
SELECT domain_type, COUNT(*) AS count
FROM needs
WHERE is_active = true
GROUP BY domain_type
ORDER BY domain_type NULLS LAST;

SELECT need_slug, need_name, domain_type
FROM needs
WHERE is_active = true
ORDER BY domain_type NULLS LAST, need_slug;
