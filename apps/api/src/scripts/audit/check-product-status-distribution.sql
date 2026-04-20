SELECT 'supplement_status_breakdown' AS section;
SELECT p.status, COUNT(*) AS cnt
FROM products p
WHERE p.domain_type = 'supplement'
GROUP BY p.status
ORDER BY cnt DESC;

SELECT 'cosmetic_status_breakdown' AS section;
SELECT p.status, COUNT(*) AS cnt
FROM products p
WHERE p.domain_type = 'cosmetic'
GROUP BY p.status
ORDER BY cnt DESC;

SELECT 'supplement_first_10' AS section;
SELECT p.product_id, p.product_name, p.status, p.domain_type
FROM products p
WHERE p.domain_type = 'supplement'
ORDER BY p.product_id ASC
LIMIT 10;
