-- Sprint 2 (#9) — needs.domain_type sınıflandırma düzeltmeleri
-- Idempotent. Önce SELECT ile dry-run bak, sonra BEGIN/COMMIT bloğunu manuel çalıştır.
-- Kullanım:
--   1) Dry-run: Bu dosyayı oku, sadece SELECT'leri çalıştır, ne değişeceğini gör.
--   2) Apply: pnpm ts-node src/scripts/run-sql-file.ts src/scripts/data-quality/fix-need-domain-type.sql

-- === DRY-RUN RAPORU ===
SELECT
  need_slug,
  need_name,
  domain_type AS current_domain_type,
  CASE
    WHEN need_slug IN (
      'bagisiklik-destegi','bagisiklik-destekleme',
      'kalp-damar-sagligi','kalp-ve-damar-sagligi',
      'kemik-eklem','kemik-eklem-sagligi',
      'sindirim-sagligi','sindirim-probiyotik',
      'enerji-canlilik','enerji-metabolizma',
      'uyku-kalitesi','uyku',
      'stres-anksiyete','stres',
      'hafiza-konsantrasyon','konsantrasyon',
      'goz-sagligi'
    ) THEN 'supplement'
    WHEN need_slug IN (
      'sac-sagligi','tirnak-sagligi','cilt-parlakligi','yag-kontrolu'
    ) THEN 'both'
    ELSE NULL  -- değişmez
  END AS target_domain_type
FROM needs
WHERE CASE
  WHEN need_slug IN (
    'bagisiklik-destegi','bagisiklik-destekleme',
    'kalp-damar-sagligi','kalp-ve-damar-sagligi',
    'kemik-eklem','kemik-eklem-sagligi',
    'sindirim-sagligi','sindirim-probiyotik',
    'enerji-canlilik','enerji-metabolizma',
    'uyku-kalitesi','uyku',
    'stres-anksiyete','stres',
    'hafiza-konsantrasyon','konsantrasyon',
    'goz-sagligi'
  ) THEN 'supplement'
  WHEN need_slug IN (
    'sac-sagligi','tirnak-sagligi','cilt-parlakligi','yag-kontrolu'
  ) THEN 'both'
  ELSE NULL
END IS DISTINCT FROM NULL
ORDER BY domain_type, need_slug;

-- === APPLY ===
-- Supplement-only: internal ihtiyaçlar (bağışıklık, kalp, kemik, sindirim, vb.)
UPDATE needs
SET domain_type = 'supplement'
WHERE need_slug IN (
  'bagisiklik-destegi','bagisiklik-destekleme',
  'kalp-damar-sagligi','kalp-ve-damar-sagligi',
  'kemik-eklem','kemik-eklem-sagligi',
  'sindirim-sagligi','sindirim-probiyotik',
  'enerji-canlilik','enerji-metabolizma',
  'uyku-kalitesi','uyku',
  'stres-anksiyete','stres',
  'hafiza-konsantrasyon','konsantrasyon',
  'goz-sagligi'
) AND domain_type IS DISTINCT FROM 'supplement';

-- Both: hem kozmetik hem takviye
UPDATE needs
SET domain_type = 'both'
WHERE need_slug IN (
  'sac-sagligi','tirnak-sagligi','cilt-parlakligi','yag-kontrolu'
) AND domain_type IS DISTINCT FROM 'both';

-- === POST-APPLY ÖZET ===
SELECT domain_type, COUNT(*) AS count
FROM needs
WHERE is_active = true
GROUP BY domain_type
ORDER BY domain_type;
