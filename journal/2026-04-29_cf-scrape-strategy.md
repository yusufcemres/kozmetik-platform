# Cloudflare-Blocked Scrape Stratejisi — 2026-04-29

## Sorun
Trendyol, Hepsiburada, N11, Sonkullan **Cloudflare bot challenge** uyguluyor. Curl + basic User-Agent ile 403/JS challenge döner.

## Test edilen kaynaklar
| Site | Durum | Kullanım |
|------|-------|----------|
| sekate.com.tr | ✅ Açık | Affiliate + image scrape için |
| voonka.com | ✅ Açık (sitemap.xml) | Voonka için image |
| nutraxin.com.tr | ✅ Açık | Nutraxin için image |
| cerave.com.tr | ✅ Açık (sitemap.xml) | Lokal envanter sınırlı |
| trendyol.com | ❌ CF 403 | Tüm marketplace için |
| hepsiburada.com | ❌ CF 403 | Tüm marketplace için |
| n11.com | ❌ CF 403 | Tüm marketplace için |
| sonkullan.com | ❌ CF JS challenge | Çoklu marka için |
| naturalsgarden.com.tr | ❌ Domain down | Naturals Garden için |

## Çözüm seçenekleri (effort × value)

### A) Cloudflare Workers proxy (uzun vadeli, **doğru çözüm**)
- Kullanıcının Cloudflare hesabına bir Worker deploy et
- Worker `/scrape?url=<TARGET>` endpoint'i sunar
- CF kendi network'ünden çıktığı için CF Bot Management onu trusted kabul eder
- **Effort**: 30-60 dk (CF hesabına login, API token, deploy)
- **Engel**: Kullanıcının `wrangler login` yapması gerekli — otonom yapamam
- **Maliyet**: CF Workers free tier 100K request/day yeter

### B) Playwright + headless Chromium (lokal, **acil çözüm**)
- `npm install playwright @playwright/test` + chromium binary (~250MB)
- Local node script'inde browser başlat → CF challenge'ı geçer (gerçek tarayıcı)
- **Effort**: 15-30 dk setup + her scrape ~3-5 saniye
- **Engel**: `chromium download` 250MB indirme, npm install timeout riski
- **Hız**: Sekate (curl) saniyede 10 URL ≫ Playwright saniyede 1 URL

### C) ScrapeNinja / Apify / ScrapingBee API
- 3rd party scrape proxy (CF bypass dahil)
- ~$0.001-0.005 per request
- **Effort**: 5 dk (API key alıp .env'ye ekle)
- **Engel**: Kullanıcının credit card ile signup gerekli

### D) Manuel browser scrape (zaman ağırlıklı)
- Chrome DevTools açık → ürün URL'lerine tek tek tıkla → img URL kopyala
- 49 ürün × 30 saniye = ~25 dakika
- **Effort**: 25 dk (ama insan tabanlı, hata payı yüksek)

## Gece vardiyası kararı
- **Otonom yapamadığım için A, C, D ertelendi** — kullanıcı uyandığında karar verir
- B (Playwright) altyapı setup'ı next session'a alındı (250MB download riskli)
- Mevcut çalışan kaynaklarla maksimize edildi: 51 + 46 + 45 ürün/aksiyon

## TODO (kullanıcı kararı bekliyor)
1. **CF Workers proxy** kur (en uzun ömürlü, en hızlı, ücretsiz)
2. Veya **ScrapingBee API** key al → .env'ye ekle, ben pipeline'ı entegre ederim
3. Veya **Playwright** lokal kur + 49 kalan görseli toplu çek

## Hızlı win önerisi
ScrapingBee free tier (1000 req/ay) → 49 kalan görsel için yeter. Kullanıcı 5 dk içinde signup + API key alabilir, ben pipeline'ı 10 dk'da entegre ederim.
