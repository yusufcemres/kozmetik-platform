# Faz 2 Hazırlık

## Faz Yol Haritası

| Faz | Kapsam | Bağımlılık |
|-----|--------|-----------|
| Faz 2 | Supplement domain | Faz 1 complete |
| Faz 2.5 | Mobil uygulama | Faz 1 API |
| Faz 3 | E-ticaret + fiyat takibi | Faz 1 + affiliate links |
| Faz 4 | B2B API | Faz 1-3 |

## Supplement Domain Genişleme (Faz 2)

### domain_type Pattern

Mevcut `products` ve `ingredients` tablolarında `domain_type` kolonu var:

```sql
domain_type VARCHAR(20) DEFAULT 'cosmetic'
```

Faz 2'de `'supplement'` değeri eklenecek. Tüm mevcut query'ler `domain_type` filtresi ile ayrıştırılacak.

### Yeni Enum'lar (Hazır)

`packages/shared/src/types/enums.ts` dosyasına eklenmiş:

```typescript
SupplementForm     // tablet, capsule, softgel, powder, liquid, gummy, spray, drop
DosageUnit         // mg, mcg, g, IU, ml, CFU
InteractionSeverity // none, mild, moderate, severe, contraindicated
```

### Supplement-Specific Tablolar (Faz 2'de eklenecek)

```
supplement_details
  - product_id FK
  - form: SupplementForm
  - serving_size: number
  - serving_unit: DosageUnit
  - servings_per_container: number

supplement_ingredients (nutritional facts)
  - product_id FK
  - ingredient_id FK
  - amount_per_serving: number
  - unit: DosageUnit
  - daily_value_percentage: number

ingredient_interactions
  - ingredient_a_id FK
  - ingredient_b_id FK
  - severity: InteractionSeverity
  - description: text
  - source_url: text
```

## Faz 2.5 Interface'ler (Hazır)

`packages/shared/src/interfaces/` dizininde 4 interface tanımlı:

### IRoutineEngine
Sabah/akşam rutin oluşturma motoru.
- `generateRoutine()` — profil + ürünlere göre rutin
- `checkInteractions()` — ingredient etkileşim kontrolü
- `suggestAddition()` — rutine ürün ekleme önerisi

### IBarcodeScanner
Barkod + OCR işlemleri.
- `scanBarcode()` — barkod tara, DB'de eşleştir
- `scanLabel()` — INCI etiketi OCR + parse
- `submitUnknownBarcode()` — bilinmeyen ürünü kuyruğa ekle

### IAffiliateProvider
Çoklu e-ticaret platformu entegrasyonu.
- `fetchPrice()` — fiyat çekme (scraping/API)
- `generateAffiliateUrl()` — tracking link oluşturma
- `checkStock()` — stok kontrolü
- `batchUpdatePrices()` — toplu fiyat güncelleme

### IMobileSyncAdapter
Web ↔ Mobil ↔ Backend profil senkronizasyonu.
- `pushToServer()` / `pullFromServer()` — push/pull sync
- `resolveConflict()` — çakışma çözümleme (3 strateji)
- `generateTransferToken()` / `importFromToken()` — QR/link transfer

## Faz 3 — E-ticaret Entegrasyonu

### Otomatik Fiyat Takibi
- IAffiliateProvider implementasyonları: Trendyol, Hepsiburada, Amazon TR
- Cron job ile günlük fiyat güncelleme
- Fiyat düşüş bildirimleri

### İçerik İçi Affiliate
- "Niacinamide içeren 5 ürün" yazısında doğal link yerleştirme
- İçerik-ürün ilişkisi üzerinden otomatik link seçimi

## Faz 4 — B2B API

### Planlar
- Rate limiting + API key auth
- Webhook'lar (formül değişikliği, yeni ürün)
- Bulk data export
- White-label widget'lar

## Mevcut Genişleme Noktaları

| Nokta | Dosya | Açıklama |
|-------|-------|----------|
| domain_type filter | Entity'ler | 'cosmetic' / 'supplement' ayrımı |
| Scoring constants | shared/constants/scoring.ts | Admin tarafından değiştirilebilir |
| Module registration | app.module.ts | featureModules array'i ile koşullu yükleme |
| Search intent | search.service.ts | Yeni intent type'lar eklenebilir |
| QC checks | qc.service.ts | Yeni kontroller kolayca eklenebilir |
