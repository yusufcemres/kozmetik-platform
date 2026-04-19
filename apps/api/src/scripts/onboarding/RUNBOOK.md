# Onboarding Pipeline — RUNBOOK

Bu dosya her stage fail olduğunda ne kontrol edileceğini listeler.

## Çalıştırma

```bash
# 1. JSON şablonunu kopyala
cp src/database/seeds/products-queue/_template.json src/database/seeds/products-queue/<brand>-<slug>.json

# 2. Manuel doldur (bkz. _template.json yorumları)

# 3. Dry-run — DB'ye dokunmaz, diff gösterir
pnpm --filter api exec ts-node src/scripts/onboarding/onboard-supplement.ts \
  src/database/seeds/products-queue/<brand>-<slug>.json --dry-run

# 4. Live run — interactive onay sonrası INSERT
pnpm --filter api exec ts-node src/scripts/onboarding/onboard-supplement.ts \
  src/database/seeds/products-queue/<brand>-<slug>.json

# 5. Otomasyon / CI için onay atla
pnpm --filter api exec ts-node src/scripts/onboarding/onboard-supplement.ts \
  src/database/seeds/products-queue/<brand>-<slug>.json --yes --skip-qa
```

**Environment variables:**
- `DATABASE_URL`           (zorunlu — Neon pg URL)
- `TAVILY_API_KEY`         (opsiyonel — image fallback için)
- `ONBOARDING_ADMIN_EMAIL` (opsiyonel — Stage 4 recalc için)
- `ONBOARDING_ADMIN_PASSWORD`
- `ONBOARDING_API_BASE`    (default: `https://kozmetik-api.onrender.com`)
- `ONBOARDING_WEB_BASE`    (default: `https://kozmetik-platform.vercel.app`)

---

## Stage → Fail → Fix Troubleshooting

### Stage 0 PREFLIGHT

| Fail | Sebep | Fix |
|---|---|---|
| `brand_slug 'X' DB'de yok` | Yeni marka, `brands` tablosunda kayıt yok | JSON'a `brand_to_create` bloğu ekle (brand_slug, brand_name) |
| `category_slug 'X' DB'de yok` | Yeni kategori (anne-bebek vb.) | `seed-categories-anne-bebek.js` koş veya `category_to_create` bloğu ekle |
| `Category domain_type='cosmetic'` warning | Supplement ürününü cosmetic kategorisine bağladın | Doğru kategori seç (`vitamin-mineral`, `probiyotik` vb.) |
| `Bu ürün zaten kayıtlı: product_id=N` | Dedupe — isim+marka çakışması | Mevcut ürünü güncellemek için `update-supplement` tool'u (V2'de gelecek) veya JSON'da product_name değiştir |
| `Bu slug'lar DB'de yok ve payload da yok` | İngredient referansı eksik | JSON'da `ingredients_to_create[]` bloğuna slug ekle + tüm alanları doldur |

### Stage 1 INGREDIENT_ENRICH

| Fail | Sebep | Fix |
|---|---|---|
| `Chelated/compound form tespit edildi ama KNOWN_RATIOS tablosunda yok` | Yeni chelated form (örn. `zinc-malate`) | 2 seçenek: (a) payload'a `elemental_ratio` manuel ekle, (b) `enrichers/elemental-detect.ts` içine kalıcı ekle |
| `common_name eksik` | Yeni ingredient'a TR ad yazılmamış | `ingredients_to_create[].common_name` doldur |
| `function_summary İngilizce görünüyor` | AI kopyalandı veya Examine.com özeti kaldı | TR'ye çevir veya `research-ingredient.ts` ile yeniden üret |
| `evidence_grade A-E arasında olmalı` | Grade yazılmamış | NIH ODS / Examine'e bak, A-E gradede |
| `NULL food_sources` (nutrient) | Vitamin/mineral ingredient'a besin kaynağı yok | `food_sources[]` en az 2 entry ekle |

### Stage 2 PRODUCT_RESEARCH

| Fail / Uyarı | Sebep | Fix |
|---|---|---|
| `image_url HEAD check failed` | URL ölü / CDN değişti | Trendyol sayfasından yeni URL al |
| `Tavily fetch fail: 401` | `TAVILY_API_KEY` invalid | `.env` güncelle |
| `affiliate: Search URL — affiliate revenue kaybı` | Trendyol search URL verildi | Ürün sayfasının direkt URL'ini al (`/sr?q=...` yerine `/brand/urun-p-123456`) |

### Stage 2.5 DRY-RUN DIFF

- `DRY-RUN` modunda DB'ye yazılmaz, normal.
- Interactive `y/N` prompt'ta `n` yazarsan pipeline durur, zararsız.

### Stage 3 ATOMIC_INSERT

| Fail | Sebep | Fix |
|---|---|---|
| `duplicate key value violates unique constraint "products_product_slug_key"` | product_slug zaten var (dedupe Stage 0'da kaçtı, edge case) | JSON'da product_name'i biraz değiştir |
| `null value in column "X" violates not-null constraint` | Validator bir alanı kaçırdı (bug bildir) | Stage 1'de doğru set edildiğinden emin ol |
| `ROLLBACK yapıldı` | Herhangi bir INSERT hatası | Error mesajı + pg logs kontrol et; DB tutarlı, hiçbir satır yazılmadı |

### Stage 4 AUTO_SCORING

| Fail | Sebep | Fix |
|---|---|---|
| `ONBOARDING_ADMIN_EMAIL .env içinde yok` | Skor otomatik recalc atlandı | Manuel: `POST /api/v1/admin/supplements/<id>/recalculate-score` + admin JWT |
| `Grade=F (score=N)` | evidence_grade veya food_sources eksik | Audit: `find-missing-ingredient-data.ts` koş |
| `floor_cap UL_EXCEEDED aktif` | Elemental_ratio yanlış veya eksik | İngredient row'da `elemental_ratio` kontrol et, chelated'se NIH ODS elemental norm'a çek |
| `overall_score=0` | İngredient eşleşmedi (product_ingredients boş?) | Stage 0 ingredient_alias logic kontrol |
| Bebek/çocuk ürünü yetişkin UL'siyle patlıyor | `target_audience` eklenmemiş ya da ingredient'ta `ul_by_audience` yok | JSON product bloğuna `"target_audience": "infant_0_12m"` (veya uygun enum) ekle; gerekiyorsa `ingredients_to_create[i].ul_by_audience = { "infant_0_12m": <NIH_ODS_UL> }` doldur, skor recalc et |

### Stage 5 VERCEL_QA

| Uyarı | Sebep | Fix |
|---|---|---|
| `HTTP 404` | Revalidate henüz vurmadı | 5 dk sonra manuel kontrol |
| `function_summary snippet sayfada yok` | DB cache stale | `POST /api/v1/admin/cache/bust` veya 5 dk bekle |
| `Generic placeholder render ediyor` | common_name / function_summary NULL (tekrarlayan bug) | Audit + backfill çalıştır |
| `Skor rozeti bulunamadı` | Stage 4 recalc atlandı/başarısız | Manuel recalc → revalidate |

---

## Rollback

Hatayı fark ettiysen:

```bash
# Sadece gizle (status='draft') — revalidate sonrası public 404
ts-node src/scripts/onboarding/unpublish-supplement.ts <product_id>

# Tamamen sil (cascade)
ts-node src/scripts/onboarding/unpublish-supplement.ts <product_id> --delete
```

## Backfill (mevcut ürünler)

```bash
# 1. Eksikleri listele
ts-node src/scripts/audit/find-missing-ingredient-data.ts

# 2. Patch JSON yaz: [{ ingredient_slug: "...", common_name: "...", ...}, ...]

# 3. Dry-run + uygula
ts-node src/scripts/audit/backfill-from-json.ts patches/batch-1.json --dry-run
ts-node src/scripts/audit/backfill-from-json.ts patches/batch-1.json
```

## Research helper (AI asistan)

```bash
# 1. Taslak üret
ts-node src/scripts/research/research-ingredient.ts ashwagandha \
  https://examine.com/supplements/ashwagandha/ \
  https://ods.od.nih.gov/factsheets/...

# 2. Çıktıyı incele, düzelt, `products-queue/*.json` içine yapıştır
```
