# REVELA Launch Readiness — Faz P

Bu liste, Faz 2 fazları bittikten sonra launch öncesi tamamlanmalı.

## DB & Backup
- [ ] Neon branching snapshot — 009 öncesi
- [ ] Neon branching snapshot — 010 öncesi
- [ ] Neon branching snapshot — 013 öncesi
- [ ] Neon branching snapshot — 014 öncesi
- [ ] Neon branching snapshot — 017 öncesi
- [ ] Her migration `down()` metodu elden rollback testi
- [ ] Prod connection string Render env var'da doğrulanmış

## Feature Flags
- [ ] `NEXT_PUBLIC_FEATURE_AI_SEARCH=false`
- [ ] `NEXT_PUBLIC_FEATURE_QUIZ_V2=false`
- [ ] `NEXT_PUBLIC_FEATURE_BLOG=true` (launch default)
- [ ] `NEXT_PUBLIC_FEATURE_TITCK_BADGE=true`
- [ ] `NEXT_PUBLIC_FEATURE_CROSS_SELL=true`
- [ ] `NEXT_PUBLIC_FEATURE_MEDICAL_REVIEWERS=true`
- [ ] `SWAGGER_PUBLIC=true` (B2B için)

## Sentry
- [ ] Release version tag deploy hook
- [ ] AI Search için separate error budget + alert
- [ ] Source map upload

## Performance
- [ ] `EXPLAIN ANALYZE` yeni kategori filter query'leri
- [ ] `EXPLAIN ANALYZE` profile → recommendation query
- [ ] Slow query log → index ekleme
- [ ] Lighthouse mobile score ≥ 85

## Smoke Testleri (Playwright)
- [ ] home → quiz → profil
- [ ] ai-arama → shortcut match → ürün detay
- [ ] blog list → detay → ingredient link → ürün detay
- [ ] favorite ekle → favoriler sayfası
- [ ] cross-sell "birlikte iyi gider" bloğu
- [ ] compare (compare feature flag kapalı — UI gözükmemeli)

## Analytics (GA4)
- [ ] quiz_start / quiz_complete events
- [ ] ai_search_query + matched_intent
- [ ] blog_post_view
- [ ] affiliate_click (platform + product_id)
- [ ] favorite_add

## Transactional Email
- [ ] Resend API key + verified domain
- [ ] Magic link template
- [ ] Welcome email template
- [ ] Newsletter template (boş queue ile)

## SEO
- [ ] `robots.txt` production-ready
- [ ] `sitemap.xml` blog URL'lerini + yeni kategorileri içeriyor
- [ ] `schema.org` validator pass (blog posts)
- [ ] Canonical URL'ler query-free
- [ ] OG image dinamik üretim test

## Environment Parity
- [ ] Render production env var listesi = local .env
- [ ] Neon prod DB URL
- [ ] Sentry DSN (prod project)
- [ ] GA4 Measurement ID
- [ ] Affiliate partner ID'ler (TY / HB / Amazon)
- [ ] Redis URL (Upstash veya Render Redis)

## Affiliate
- [ ] Trendyol Partner başvuru onaylandı, tag ID `.env`'de
- [ ] Hepsiburada Affiliate onaylandı
- [ ] Amazon TR Associates onaylandı
- [ ] `rewrite-affiliate-partner-ids.js` prod'da çalıştırıldı
- [ ] 3 platformdan 5 rastgele link partner ID kontrol

## İçerik
- [ ] 10 blog makalesi published
- [ ] En az 3 reviewer profile verified
- [ ] En az 200 ürün görsel + INCI + en az 3 tag ile published
- [ ] Homepage hero + CTA'lar nihai
