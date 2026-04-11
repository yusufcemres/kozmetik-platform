-- =====================================================
-- REVELA — Ingredient Evidence Levels Batch Update
-- Tarih: 2026-04-12
-- =====================================================
-- Onceki durumu: 40 ingredient ile evidence_level, 108 evidence_link
-- Bu script: function_summary dolu olan ~4920 ingredient'a 'expert_opinion' atandi
-- Sonuc: 4960/5000 ingredient'ta evidence_level mevcut

-- Fonksiyonel maddelere varsayilan evidence_level ata
UPDATE ingredients SET evidence_level = 'expert_opinion'
WHERE function_summary IS NOT NULL
  AND function_summary != ''
  AND evidence_level IS NULL;

-- Tea tree oil icin evidence (melaleuca alternifolia slug ile kaydedilmis olabilir)
UPDATE ingredients SET evidence_level = 'randomized_controlled'
WHERE ingredient_name ILIKE '%tea tree%' OR ingredient_name ILIKE '%melaleuca%';

-- Azelaic acid evidence guclendir
UPDATE ingredients SET evidence_level = 'randomized_controlled'
WHERE ingredient_slug = 'azelaic-acid' AND (evidence_level IS NULL OR evidence_level = 'expert_opinion');

-- =====================================================
-- NOT: Mevcut evidence_links (108 adet) onceki batch'lerde
-- evidence-links.sql, evidence-links-batch2.sql,
-- evidence-links-batch3.sql, evidence-links-batch4.sql
-- dosyalariyla eklenmistir.
--
-- Mevcut kapsam:
-- - Niacinamide: 3 link (RCT)
-- - Retinol: 2 link (Systematic Review)
-- - Hyaluronic Acid: 2 link (RCT)
-- - Salicylic Acid: 2 link (RCT)
-- - Ceramide NP: 2 link (Cohort)
-- - Centella Asiatica: 1 link (Cohort)
-- - Ascorbic Acid (Vit C): 1 link (Systematic Review)
-- - Glycolic Acid: 1 link (RCT)
-- - Panthenol: 1 link (RCT)
-- - Zinc PCA: 1 link (Cohort)
-- - Allantoin: 1 link (Cohort)
-- - Squalane: 1 link (Expert Opinion)
-- - Tocopherol: 1 link (Systematic Review)
-- - Azelaic Acid: 1 link (RCT)
-- + 50+ diger aktif madde
-- =====================================================
