# REVELA — Bağlantı Ağacı & Data-Quality Araçları

Bu klasör REVELA veritabanı bağlantı ağacını denetleyen + onaran script'leri içerir.

## Bağlantı Ağacı

```
                              ┌─────────────────┐
                              │   INGREDIENTS   │  (5,000+ satır — TEMEL)
                              │ slug, inci_name │
                              │ safety fields   │
                              └──┬───┬───┬──────┘
                                 │   │   │
         ┌───────────────────────┘   │   └───────────────────────┐
         │                           │                           │
  ┌──────▼──────────┐   ┌────────────▼──────────────┐  ┌─────────▼────────┐
  │ ingredient_     │   │ ingredient_need_mappings  │  │ ingredient_      │
  │   aliases       │   │ (slug × need + score +    │  │   interactions   │
  │ (arama)         │   │  effect_type + evidence)  │  │ (etkileşim)      │
  └─────────────────┘   └────────────┬──────────────┘  └──────────────────┘
                                     │
                                     │ JOIN ↓
                                     │
  ┌────────────┐     ┌───────────────▼──────────────┐    ┌──────────────┐
  │  BRANDS    │     │  product_need_scores          │    │   NEEDS      │
  │  ISO2 code │────▶│  (compatibility_score,        │◀───│  domain_type │
  │            │     │   confidence_level)           │    │  (supp/cos)  │
  └──────┬─────┘     └───────────────▲──────────────┘    └──────────────┘
         │                           │
         │ foreign key               │ JOIN
         │                           │
  ┌──────▼─────────┐                 │
  │   PRODUCTS     │     ┌───────────┴──────────────┐
  │  domain_type   │────▶│  product_ingredients     │
  │  status        │     │  (pi × ingredient_id)    │
  │  target_area   │     └───────┬──────────────────┘
  │  product_type  │             │
  └──────┬─────────┘             │ + affiliate_links (fiyat)
         │                       │ + supplement_details (form/ülke/sertifika)
         │                       │ + product_images
         │
  ┌──────▼─────────┐
  │  categories    │
  │  (parent-child)│
  └────────────────┘
```

## Filtreleme nasıl çalışır

Kullanıcı `/urunler` veya `/takviyeler` sayfasında sidebar üzerinden filter
seçer. Backend `ProductsService.findAll()` içindeki "rich filter path" query
builder bu bağlantıları kullanır:

| Filter Dimension     | Join Zinciri                                            |
| -------------------- | ------------------------------------------------------- |
| Etken Madde (INCI)   | products → product_ingredients → ingredients            |
| İhtiyaç              | products → product_need_scores → needs                  |
| REVELA Skoru         | products → product_scores                               |
| Sertifika            | products → supplement_details.certification             |
| Form                 | products → supplement_details.form                      |
| Üretim Ülkesi        | products → supplement_details.manufacturer_country      |
| Marka                | products.brand_id → brands                              |
| Fiyat                | products → affiliate_links.price_snapshot               |
| Kategori             | products.category_id → categories                       |
| Ürün Tipi            | products.product_type_label                             |
| Bölge (kozmetik)     | products.target_area                                    |
| Cilt Tipi            | products.skin_type                                      |

Her bağlantı **iki yönlü**: eksik bir bağlantı filtreyi kırar — ürün filtrede
hiç görünmez. Bu yüzden audit + sync mekanizması kritik.

## Araçlar

### `sync-product-tree.mjs` — **ANA ORKESTRATÖR**

Yeni ürün eklendikten sonra çalıştır. 3 adımı atomik olarak yapar:

1. **LINK** — product_ingredients'ı boş olan supplement ürünlere pattern
   matching ile ingredient ekler (60+ keyword: "D3K2" → cholecalciferol +
   menaquinone, "Multivitamin" → 6 ingredient preset vs.)
2. **SCORE** — product_need_scores recompute (supplement DELETE+INSERT,
   kozmetik sadece boş olanları fill)
3. **AUDIT** — kapsama raporu + eşleşmeyen ürünler

```bash
node apps/api/src/scripts/data-quality/sync-product-tree.mjs --apply
```

**Ne zaman çalıştır:**
- Yeni ürün ingest'inden SONRA (manuel veya otomatik)
- Haftalık/aylık periodik bakım
- Ingredient mapping eklendikten sonra (scoring refresh için)

**Auto-trigger:** `supplement-bulk-ingest.ts` ve benzer ingest script'lerinin
son aşamasında `child_process.exec('... --apply --quiet')` ile çağır.

### `connection-tree-audit.mjs` — tanı aracı

Sadece rapor üretir (DB'yi değiştirmez). 9 bölümlü sağlık raporu:
- Ingredient bağlantı dağılımı (products/needs/alias)
- Products per domain (no_ing, no_score, no_cat, no_brand)
- Needs (no_mapping, no_product_scores)
- Brands (country, product, cert coverage)
- Category dağılımı
- Orphan ingredient örnekleri
- Bağlanmamış supplement ürünler
- Skorsuz supplement ürünler
- Filtreleme sağlığı (coverage %)

```bash
node apps/api/src/scripts/data-quality/connection-tree-audit.mjs
```

**Ne zaman çalıştır:**
- Patron "bu sayfa boş, filtrede görünmüyor" dediğinde → ilk adım
- Sync sonrası verifiye etmek için
- CI/CD pipeline'ında smoke test

### `link-products-from-name.mjs` — bulk linker (standalone)

`sync-product-tree.mjs` içindeki LINK adımının bağımsız versiyonu. Daha detaylı
dry-run raporu verir.

```bash
node apps/api/src/scripts/data-quality/link-products-from-name.mjs --dry-run
node apps/api/src/scripts/data-quality/link-products-from-name.mjs --apply
```

### `backfill-brand-country.ts` — marka ülke backfill (Sprint 2)

Türk markalar + 40+ uluslararası marka için `country_of_origin` ISO2 normalize.

### `audit-cosmetic-concentration.sql` — INCI concentration denetimi

Kozmetik ürünlerde `concentration_percent` ve `concentration_band` dağılımı.

## SQL Seed'ler (`../database/seeds/`)

| Dosya                                       | İçerik                                    |
| ------------------------------------------- | ----------------------------------------- |
| `supplement-need-system-complete.sql`       | 13 eksik ingredient + 90 mapping + recompute |
| `supplement-need-mappings-extended.sql`     | 21 niş bileşen (curcumin, maca, 5-HTP…) için 50+ mapping |
| `brand-country-normalize.sql`               | Türkçe full-text → ISO2 country code      |
| `rehber-articles-seed.sql`                  | 18 rehber makalesi (guide/ingredient/need_guide/...) |
| `ingredient-safety-narrative-seed.sql`      | 12 tartışmalı içerik için narrative       |
| `ingredient-food-sources-seed.sql`          | 25 supplement ingredient için doğal gıda kaynakları |
| `fix-need-domain-type.sql`                  | needs.domain_type (supplement/cosmetic/both) |

## Yeni ürün onboarding flow'u — bütünsel akış

```
1. Ürün eklenir (admin panel veya ingest script)
   └─→ products satırı yazılır
   └─→ product_ingredients yazılır (scraper'dan geldi ise)

2. ⚠ product_ingredients BOŞSA:
   → sync-product-tree.mjs LINK adımı pattern matching ile doldurur

3. product_need_scores otomatik hesaplanır
   → AVG(relevance × effect_weight) / JOIN ingredient_need_mappings

4. AUDIT:
   → kapsama raporu
   → eşleşmeyen ürünler listesi (manuel inceleme için)

5. Filtre sayfaları hemen sağlam çalışır — yeni ürün tüm filtre
   dimension'larında doğru yerde görünür
```

## Kapsama hedefleri

| Metrik                         | Hedef  | Şu an (2026-04-24) |
| ------------------------------ | ------ | ------------------ |
| Supplement ingredient coverage | ≥95%   | %99 (2/163 eksik)  |
| Supplement score coverage      | ≥90%   | %91 (15/163)       |
| Cosmetic ingredient coverage   | ≥98%   | %100 (0/1573)      |
| Cosmetic score coverage        | ≥95%   | %100 (0/1573)      |
| Brand country_of_origin        | 100%   | %100 (0 NULL)      |
| Filter coverage (form/ülke/cert) | ≥95% | %97-100            |

Hedefin altına düştüğünde `sync-product-tree.mjs --apply` çalıştır + audit raporu
incele.
