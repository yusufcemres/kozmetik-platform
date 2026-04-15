# REVELA — Trigger-Gated Backlog

Bu doküman "şimdi yapılmayacak" işleri trigger koşullarıyla birlikte tutar. Plana tekrar
girmemeleri için burada kayıt altında olmalılar. Trigger tetiklendiğinde ilgili maddeyi
aktif plana taşı, burada üstünü çiz ve DONE işaretini `project_kozmetik_platform.md`
memory'sine yansıt.

---

## Performance/Scale Trigger (>5.000 MAU)

- **Skin Journal** — kullanıcı bazlı günlük/rutin takip. Kullanıcı havuzu anlamlı olmadan
  veri toplanmaz.
- **User Routines** — kaydedilmiş rutinler + paylaşma. Sosyal etkileşim kütle gerektirir.
- **Smart Scan v2** — çoklu cilt bölgesi analizi. V1 doygunlaşmadan v2 anlamsız.
- **Video review feed** — UGC akışı. Kullanıcı içeriği olmadan boş ekran.
- **Gamification / rozet sistemi** — etkileşim oyunlaştırma. Davranış verisi biriktikten sonra.

## Feature Trigger

- **Quiz v2 compatibility + routine generator** — tetik: aylık >1000 quiz tamamlanması.
  Şu anki quiz sonuçları yeterli sinyalsel değilse v2 mantıklı değil.
- **A/B testing — GrowthBook** — tetik: >500 DAU. Daha az trafikle istatistiksel güç yok.
- **AI Search — pgvector + Gemini** — tetik: aylık >100 AI arama sorgusu. Mevcut keyword
  search yeterli kalana kadar embedding altyapı maliyeti haksız.

## Ticari Model Kararı

- **Bundle/kit satışı** — patronun stok/operasyon kararı bekliyor.
- **Subscription (aylık kutu)** — lojistik ve iade politikası kurulmadan açılmamalı.
- **Review incentive program** — hediye/indirim karşılığı yorum. Legal inceleme gerek
  (yanıltıcı yorum riski).
- **Dermatolog endorsement** — legal risk notu: reçete/teşhis yasağı, KVKK. Hukuk onayı
  alınmadan ele alınmaz.
- **Partner pharmacy entegrasyonu** — B2B sözleşme bekliyor.
- **Brand sponsorship / öne çıkarma** — editorial bağımsızlık politikası yazılmadan
  açılmaz (kullanıcı güvenine zarar riski).

## Operasyonel Düşük Öncelik

- **016_affiliate_tracking schema drift fix** — Neon'daki `affiliate_clicks` tablosu
  eski manuel şemada (`click_id, affiliate_link_id, source_page, ip_hash, user_agent,
  clicked_at`). Repo'daki [016_affiliate_tracking.ts](../apps/api/src/database/migrations/016_affiliate_tracking.ts)
  yeni şemaya (`product_id, platform, utm JSONB…`) geçmek istiyor ama `CREATE TABLE IF
  NOT EXISTS` mevcut tabloya çarpıyor, sonra `CREATE INDEX ON (product_id)` fail ediyor.
  016, Neon'un `migrations` tablosunda yok (017 BrandCertifications var). Fix sprint (~1-2
  saat): API controller/service yeni şema mı kullanıyor kontrol et → DROP + re-run
  VEYA ALTER migration yaz → Render restart + smoke test (gerçek affiliate click).
- **Neon backup checkpoint prosedürü** — append-only migration dönemi bittiğinde
  `docs/OPERATIONS.md`'e 1 satır prosedür ekle. Şu an major migration öncesi checkpoint
  ihtiyacı yok.
- **Sentry release tracking** — BLOK F16 runbook ile birlikte gelecek. Nice-to-have.
- **Admin interactions CRUD UI** — tek admin var, seed script (BLOK C9) 5× daha hızlı.
- **Admin supplements CRUD UI** — aynı gerekçe — seed script (BLOK C10) tercih edildi.
- **Admin affiliate dashboard** — raw SQL / psql query launch öncesi yeterli.
- **Fiyat karşılaştırma UI** — trafik düşükken ROI minimal.
- **Price drop push bildirimi** — tetik: 30 gün fiyat geçmişi birikmiş olmalı.

## Zaman / Q3

- **Blog 11-20** — haftalık 1 blog tempo.
- **TİTCK gerçek scraper** — şu anki badge static. Resmi API yoksa scraper + fallback cache.
- **i18n: AR + EN** — launch sonrası pazar kararı.
- **Refill tahmini** — kullanıcı kullanım verisi biriktikten sonra.
- **Ürün memnuniyetsizlik raporu** — yorum hacmi anlamlı olunca.
- **Brand Portal — tag correction flow** — marka ajanları onboard olduktan sonra.

---

## Taşıma Kuralı

- Bir madde buraya yazılıyorsa tetik açıkça belirtilmelidir. "Sonra bakarız" kabul edilmez.
- Tetik geldiğinde madde silinip ana plana eklenmeli, burada **sadece trigger-gated** işler
  kalmalı.
- `project_kozmetik_platform.md` memory'si bu dosyanın son halini referans alır.
