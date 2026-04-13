# Sabah Raporu — 2026-04-13

## Özet
Gece otonomda FAZ 5 (görsel scraping) tamamen ilerledi. Lansman blokeri olan eksik görsel problemi büyük ölçüde çözüldü.

**Görsel kapsamı: 1097/1851 (59.3%) → 1585/1851 (85.6%) — +488 yeni görsel**

KÜME F (launch readiness) zaten dün gece kapanmıştı; gece işi sadece görsel kapsamı üzerine yoğunlaştı.

---

## Yapılanlar

### 1. Amazon TR: 39/39 (%100)
- `scrape-missing-og.js` — Amazon'un `og:image` olmaması nedeniyle 3 katmanlı parser yazıldı:
  - `"hiRes":"..."` JSON (öncelikli)
  - `data-old-hires="..."` attribute
  - `data-a-dynamic-image` JSON map
- Generic `og:image` fallback her şey için

### 2. Cloudflare Worker deploy
- URL: `https://revela-og-scraper.muddy-moon-6ab1.workers.dev`
- `workers/og-image-scraper/worker.js` (zaten vardı, deploy bekliyordu)
- Allowed domains: trendyol, hepsiburada, amazon.com.tr, gratis, watsons, rossmann, dermoeczanem
- `wrangler deploy` (senin Cloudflare dashboard'dan subdomain oluşturmanın ardından)

### 3. Trendyol: 51/113 (%45)
- `scrape-missing-via-worker.js` — CF Worker üzerinden proxy scraping
- Kritik fix: DB'deki TY URL'lerinin çoğu `/en/` prefix ile kayıtlıydı → 302 dead redirect
  - `normalizeUrl()` eklendi: `/en/` stripleme
- Kalan 62 ürün: gerçek ölü TY slug'ları (ürün kaldırılmış/değişmiş) — çözülebilir değil

### 4. Incidecoder brand-crawl v2 (ASIL KAZANÇ)
- `scrape-incidecoder-v2.js` — DDG ve Google Custom Search blokeli olunca alternatif strateji
- Algoritma:
  1. Eksik görseli olan ürünleri brand'e göre grupla
  2. Her brand için `incidecoder.com/brands/{slug}?offset=N` crawl (tüm sayfaları)
  3. DB ürün adını marka slug listesine jaccard token benzerliği ile eşleştir (eşik 0.4)
  4. Eşleşen slug'ın ürün sayfasından `<source type="image/jpeg">` srcset'inden en yüksek çözünürlük görseli çek
- 2 geçişte toplam **398 görsel** eklendi (v1 direct-slug + DDG: 170, v2 offset pagination fix: 228 hibrit + 125 ek geçiş)
- Bonus: TY/HB affiliate'li ama ölü olan ürünleri de kapsadı → TY ve HB no-image kategorileri **0'a düştü**

### 5. Yan bulgular / başarısız denemeler
- **DuckDuckGo HTML search**: 10 request'ten sonra rate-limit, sonra IP'den tamamen blok. Archived.
- **Bing site: search**: Site: operator sonuç döndürmüyor, JS-rendered görünüyor. Archived.
- **Google Custom Search API**: GCP projesinde "Custom Search JSON API" enabled değil — `HTTP 403: This project does not have access`. Sabah dashboard'dan tek tıklamayla açabilirsin ama artık gerek kalmadı.
- **Tavily Extract API**: Quota tükenmiş — `HTTP 432: exceeds usage limit`. `scrape-missing-tavily.js` arşivlendi (yeni key gelince aktif olur).
- **Hepsiburada direkt fetch**: Hem Windows IP hem CF Worker IP'sinden Akamai bot koruması → 403. Bypass mümkün değil.
- **Neon 57P01 admin_shutdown**: Uzun süreli bağlantılar idle timeout ile kesiliyordu. `safeInsert()` helper'ı ile otomatik reconnect eklendi.

---

## Kalan Eksikler

### Görsel (266 ürün — %14.4)
Tamamı:
- Affiliate link'i olmayan (piyasada bulunmayan veya yarı-terk edilmiş ürünler)
- Incidecoder'da kayıtlı olmayan
- Küçük Türk markaları veya çok niş

**Değerlendirme**: Launch için kabul edilebilir. Ürün sayfalarında fallback placeholder veya "görsel yok" state zaten var. İsteğe bağlı: bu 266 ürünün brand sitelerinden manuel veya yapay (ChatGPT image / stock) besleme bir sonraki sprint'e bırakılabilir.

### Hepsiburada (zaten çözüldü)
22 tanesi incidecoder v2 tarafından yakalandığı için HB için ayrıca bir şey yapmaya gerek kalmadı.

---

## Commit'ler
1. `c9754db` feat(seeds): FAZ 5 image scrapers (Amazon/TY/HB + incidecoder)
2. `1671055` feat(seeds): incidecoder v2 brand-page crawl + jaccard fuzzy match

Her ikisi de push edildi. KÜME F commit'leri dün gece zaten master'da.

---

## Senden İstenenler
- **(opsiyonel)** GCP Console → Custom Search JSON API enable — gelecekte 266 kalana deneyebilmek için
- **(opsiyonel)** Tavily yeni API key — başka platformlar için faydalı olabilir
- Görsel kapsamı 85.6% launch için yeterli mi, yoksa 266'nın da kapatılmasını ister misin?

---

## Sonraki Adımlar (senin kararın)
1. Launch et — 85.6% kapsam yeterli, kalan 266 için placeholder yeterli
2. VEYA: 266 kalana manuel/AI image generation sprint aç
3. VEYA: FAZ 6+ (varsa) veya domain/şirket kuruluş takip
