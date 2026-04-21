# Affiliate Link Reliability — Plan + Implementation Memo (2026-04-21)

## Bağlam

2026-04-20 gecesi fiyat cron'u ilk kez prod'da koştu: **117/7186 link (%1.6)**
başarıyla güncellendi. Patron "affiliate linkleri daha çözemedik galiba" dedi.
Hedef: başarı oranını **>%20'ye** çekmek (hedef ay içinde %50+).

## Sorun analizi

### Başarısızlık kaynakları (hipotez)

| Sebep | Olasılık | Kanıt |
|---|---|---|
| DOM selector eşleşmiyor (2026 değişikliği) | Yüksek | TY/HB 2025 sonunda redesign yapmıştı |
| Cloudflare/bot-check (403) | Yüksek | Amazon'da yaygın, TY hafif |
| Retry yok, tek deneme → transient fail kalıcı fail gibi | Orta | Mevcut kod 1 deneme + sessiz fail |
| Error kategorisi yok, debug zor | Orta | `error: string` ama taxonomy yok |
| `in_stock=false` → price null → fail gibi görünüyor | Düşük | Doğru davranış ama rapor ayırmıyor |

## Yapılan — Bu PR

### B.1 Audit altyapısı
- **Script:** `apps/api/src/scripts/audit/check-affiliate-failure-reasons.ts`
  - Platform bazında total / w/price / stale / never / needs_review breakdown
  - Error-type bazında başarısızlık sayısı
  - Örnek 10 başarısız linkten canlı re-fetch + kategori dağılımı
- **Migration 026** — `consecutive_failures`, `last_error_type`, `last_error_message`, `last_attempted_at` kolonları + `needs_review` için partial index

### B.2 Provider selector refresh
Her 3 provider'da:
- User-Agent header + Accept-Encoding + Sec-Fetch-* eklendi (bot-check baypas)
- `redirect: 'follow'` açık
- JSON-LD primer (en stabil): Product/@graph her iki yapı destekleniyor
- Fallback selectors genişletildi:
  - **Trendyol:** `.prc-dsc`, `.product-price-container .prc-slg|.prc-dsc`, `[data-testid="product-price"]`, `.pr-bx-w .prc-dsc`, `.featured-prices .prc-dsc`, `.campaign-price-container .prc-dsc`, `[class*="priceInfo"]`
  - **Hepsiburada:** `[data-testid="price-current-price"]`, `[data-test-id="..."]`, `.price-value`, `[class*="priceValue"]`, `[itemprop="price"]`
  - **Amazon:** `span.a-price[data-a-size="xl"] .a-offscreen`, `#corePriceDisplay_desktop_feature_div .a-offscreen`, `#apex_desktop .a-offscreen`, `[data-a-color="price"] .a-offscreen`
- Amazon'da bot-check gate detection (Enter the characters you see below) → `http_403` flag
- Fiyat parse'da `1.234,56` formatı desteği (binlik ayracı noktalar kaldırılıyor)
- OOS markers: Trendyol `.out-of-stock-btn`, HB body regex, Amazon `#availability span`

### B.3 Retry + observability
- **Error taxonomy:** `AffiliateErrorType` = `http_403 | http_404 | http_5xx | http_other | timeout | network | dom_mismatch | parse_error | oos | unknown`
- **Retry policy:** `RETRYABLE_ERROR_TYPES` = `http_403, http_5xx, timeout, network` — 3 deneme, exponential backoff (1.5s → 3s → 6s)
- **Non-retryable:** `http_404` (link dead), `dom_mismatch` (selector değişmiş, retry anlamsız), `oos` (stok durumu)
- **Structured JSON logging** her link için:
  ```json
  {"event":"price_update","link_id":123,"platform":"trendyol","status":"ok|fail|exception","attempts":1,"error_type":"...","consecutive_failures":0}
  ```
- Batch summary JSON:
  ```json
  {"event":"batch_update_summary","total":7186,"updated":X,"errors":Y,"quarantined":Z,"error_breakdown":{"dom_mismatch":410,"http_403":82,...}}
  ```

### B.4 Dead link quarantine
- Ardışık 3 başarısızlık → `verification_status='needs_review'`
- Frontend: `products.findBySlug()` artık `needs_review` ve `dead` linkleri filtreliyor
- Admin endpoints:
  - `GET /admin/affiliate/quarantined?limit=100` — liste
  - `POST /admin/affiliate/reverify/:linkId` — tekrar doğrula (başarı → `valid`'e dön)
- Metrics'e `quarantined` + `error_breakdown` eklendi

## Deploy adımları (merge sonrası)

1. Render otomatik deploy tetiklenecek
2. Migration 026 çalışacak (ADD COLUMN IF NOT EXISTS idempotent)
3. Audit script'i koş:
   ```bash
   cd apps/api
   npx ts-node -r tsconfig-paths/register src/scripts/audit/check-affiliate-failure-reasons.ts
   ```
4. Manuel batch update tetikle:
   ```bash
   curl -X POST https://api.revela.app/admin/affiliate/update-prices \
     -H "Authorization: Bearer <admin-jwt>"
   ```
5. Log çıktısında `batch_update_summary` satırını incele:
   - `updated` > 117 olmalı (selector refresh etkisi)
   - `error_breakdown` içinde en büyük kategori belirlenir → sıradaki iterasyonun hedefi

## Beklenen etki

- **Selector refresh** → TY/HB dom_mismatch oranı ~%50 düşer (yeni DOM'a uygun)
- **Retry (3x)** → http_403 ve timeout gibi transient hatalar ~%30-50'i başarılı döner
- **Bot-check bypass** (header iyileştirmesi) → Amazon başarı oranı muhtemelen 2x-3x
- **Karma tahmin:** 117/7186 → 500-1000/7186 (~%7-14) bu PR sonrası, sonraki iterasyonda %20+

## Sonraki iterasyonlar (Batch B+1)

1. **Playwright / puppeteer** — Cloudflare sıkı siteler için headless browser fallback (prod maliyet hesabı gerekir)
2. **Paralelizasyon** — şu an seri 7186 link; tek batch'te eşzamanlı 10-20 fetch (rate-limit aware)
3. **Platform-specific API entegrasyonu** — Trendyol Partner API, Hepsiburada HepsiBurada Premium gibi resmi API'lar varsa scraping yerine onlar
4. **Weekly report** — `batch_update_summary` log'ları toplayıp haftalık delta raporu
