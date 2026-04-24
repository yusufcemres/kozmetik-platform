-- Brand country_of_origin Türkçe full-text → ISO2 normalize
-- Frontend COUNTRY_FLAGS map'i sadece ISO2 destekliyor; çift standart yüzünden 'Türkiye' (10)
-- ve 'TR' (6) ayrı chip'lerde gözükmüyor.
--
-- Çalıştır:
--   pnpm ts-node apps/api/src/scripts/run-sql-file.ts apps/api/src/database/seeds/brand-country-normalize.sql

UPDATE brands SET country_of_origin = 'TR' WHERE country_of_origin = 'Türkiye';
UPDATE brands SET country_of_origin = 'KR' WHERE country_of_origin IN ('Güney Kore','Kore');
UPDATE brands SET country_of_origin = 'US' WHERE country_of_origin IN ('ABD','Amerika','Amerika Birleşik Devletleri');
UPDATE brands SET country_of_origin = 'FR' WHERE country_of_origin = 'Fransa';
UPDATE brands SET country_of_origin = 'DE' WHERE country_of_origin = 'Almanya';
UPDATE brands SET country_of_origin = 'JP' WHERE country_of_origin = 'Japonya';
UPDATE brands SET country_of_origin = 'UK' WHERE country_of_origin IN ('İngiltere','Birleşik Krallık','İngiltere ve Galler');
UPDATE brands SET country_of_origin = 'IT' WHERE country_of_origin = 'İtalya';
UPDATE brands SET country_of_origin = 'ES' WHERE country_of_origin = 'İspanya';
UPDATE brands SET country_of_origin = 'CH' WHERE country_of_origin = 'İsviçre';
UPDATE brands SET country_of_origin = 'SE' WHERE country_of_origin = 'İsveç';
UPDATE brands SET country_of_origin = 'CA' WHERE country_of_origin = 'Kanada';
UPDATE brands SET country_of_origin = 'HU' WHERE country_of_origin = 'Macaristan';
UPDATE brands SET country_of_origin = 'PL' WHERE country_of_origin = 'Polonya';
UPDATE brands SET country_of_origin = 'NL' WHERE country_of_origin = 'Hollanda';
UPDATE brands SET country_of_origin = 'BE' WHERE country_of_origin = 'Belçika';
UPDATE brands SET country_of_origin = 'AT' WHERE country_of_origin = 'Avusturya';
UPDATE brands SET country_of_origin = 'AU' WHERE country_of_origin = 'Avustralya';
UPDATE brands SET country_of_origin = 'IL' WHERE country_of_origin = 'İsrail';
UPDATE brands SET country_of_origin = 'IN' WHERE country_of_origin = 'Hindistan';
UPDATE brands SET country_of_origin = 'CN' WHERE country_of_origin = 'Çin';

-- Sonuç raporu
SELECT COALESCE(country_of_origin, 'NULL') AS country, COUNT(*)::int AS n
FROM brands
GROUP BY country_of_origin
ORDER BY n DESC;
