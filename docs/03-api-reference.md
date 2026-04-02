# API Referansı

## Genel Bilgiler

- **Base URL:** `http://localhost:3001/api/v1`
- **Auth:** JWT Bearer token (admin endpoint'ler için)
- **Format:** JSON (gzip compressed, threshold: 1KB)
- **Swagger:** `http://localhost:3001/api/docs` (sadece development)
- **Rate Limit:** Global 60 req/min/IP, search 30 req/min/IP, B2B key bazlı
- **Security:** helmet, CORS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff

## Public Endpoints

### Health
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/health` | Sunucu durumu (DB, Redis, uptime, memory) |

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-02T...",
  "service": "kozmetik-platform-api",
  "version": "1.0.0",
  "uptime": { "ms": 123456, "human": "1d 2h 3m 4s" },
  "checks": { "database": "connected", "redis": "connected" },
  "memory": { "rss_mb": 85, "heap_used_mb": 42 }
}
```

### Kategoriler
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/categories` | Kategori listesi (pagination) |
| GET | `/categories/tree` | Hiyerarşik ağaç |
| GET | `/categories/:slug` | Kategori detay |

### Markalar
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/brands` | Marka listesi (pagination) |
| GET | `/brands/:slug` | Marka detay |

### Ürünler
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/products` | Ürün listesi (pagination, filtreleme) |
| GET | `/products/:slug` | Ürün detay (ingredients, scores, affiliate links dahil) |
| GET | `/products/:id/need-scores` | Ürün-ihtiyaç skorları |
| GET | `/products/:id/personal-score?profile_id=...` | Kişisel uyum skoru |
| GET | `/products/:id/affiliate-links` | Satın alma linkleri |

### İçerik Maddeleri
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/ingredients` | Ingredient listesi (pagination) |
| GET | `/ingredients/:slug` | Ingredient detay |
| GET | `/ingredients/suggest?q=...` | Auto-suggest (trigram) |

### İhtiyaçlar
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/needs` | İhtiyaç listesi |
| GET | `/needs/:slug` | İhtiyaç detay |

### Arama
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/search?q=...&type=...` | Çapraz arama (product/ingredient/need/mixed) |
| GET | `/search/suggest?q=...` | Arama önerileri |

### Makaleler
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/articles` | Yayınlanmış makaleler |
| GET | `/articles/:slug` | Makale detay |

### Profil
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/skin-profiles` | Anonim profil oluştur |
| GET | `/skin-profiles/:anonymousId` | Profil getir |
| PUT | `/skin-profiles/:anonymousId` | Profil güncelle |

### Fiyat Takibi
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/products/:productId/price-drops` | Ürün fiyat düşüş bilgisi |
| GET | `/affiliate-links/:linkId/price-history?days=30` | Fiyat geçmişi (grafik için) |

### Düzeltmeler
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/corrections` | Hata bildir (public) |

## B2B API Endpoints (X-API-Key Required)

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/b2b/v1/products?page=1&limit=50` | Ürün verisi (bulk export) |
| GET | `/b2b/v1/ingredients?page=1&limit=50` | İçerik maddesi verisi |
| GET | `/b2b/v1/products/prices?page=1&limit=50` | Fiyat verisi |
| GET | `/b2b/v1/needs` | İhtiyaç/concern verisi |
| GET | `/b2b/v1/product-scores?product_id=...` | Ürün-ihtiyaç skorları |

**Auth:** `X-API-Key` header. Key'ler admin panelden oluşturulur.
**Rate Limit:** Varsayılan 1000/saat, 10000/gün (key bazlı ayarlanabilir).

## Admin Endpoints (JWT Required)

### Auth
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/auth/login` | Admin giriş → JWT |
| GET | `/auth/me` | Mevcut kullanıcı bilgisi |

### Taxonomy CRUD (categories, brands, ingredients, needs)
Her entity için: `POST`, `GET` (list), `GET /:id`, `PUT /:id`, `DELETE /:id`

### Ürün Yönetimi
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/products` | Ürün oluştur (+ label + images) |
| PUT | `/products/:id` | Ürün güncelle |
| DELETE | `/products/:id` | Ürün sil (soft) |
| POST | `/products/:id/affiliate-links` | Affiliate link ekle |
| PUT | `/affiliate-links/:id` | Link güncelle |
| DELETE | `/affiliate-links/:id` | Link sil |

### INCI Ingestion
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/ingestion/parse` | INCI text → parse |
| POST | `/ingestion/match` | Parsed → DB eşleştirme |
| POST | `/ingestion/ingest/:productId` | Full pipeline (parse + match + save) |
| POST | `/ingestion/bulk-import` | CSV toplu import |

### Eşleşmeler (Mappings)
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/mappings` | Ingredient-need mapping oluştur |
| GET | `/mappings` | Tüm mappingler |
| GET | `/mappings/by-ingredient/:id` | Ingredient bazlı |
| GET | `/mappings/by-need/:id` | Need bazlı |

### Scoring
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/products/:id/calculate-scores` | Tekil ürün skoru hesapla |
| POST | `/scoring/recalculate-all` | Tüm ürünleri yeniden hesapla |
| GET | `/admin/scoring-config` | Scoring ayarları |
| PUT | `/admin/scoring-config` | Ayarları güncelle |

### Kalite Kontrol
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/admin/qc/report` | Tam QC raporu (JSON) |
| GET | `/admin/qc/report/csv` | QC raporu (CSV) |
| GET | `/admin/qc/products/without-ingredients` | INCI'siz ürünler |
| GET | `/admin/qc/products/without-scores` | Skorsuz ürünler |
| GET | `/admin/qc/ingredients/duplicates` | Duplicate INCI |

### Supplement Yönetimi
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/admin/supplements` | Supplement listesi |
| POST | `/admin/supplements/:productId/details` | Supplement detayı ekle |
| PUT | `/admin/supplements/:productId/details` | Supplement detayı güncelle |
| POST | `/admin/supplements/:productId/nutrition` | Besin içeriği ekle |

### Etkileşim Yönetimi
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/admin/interactions` | Etkileşim oluştur |
| GET | `/admin/interactions` | Tüm etkileşimler |
| GET | `/admin/interactions/ingredient/:id` | Ingredient bazlı etkileşimler |
| POST | `/admin/interactions/check-product/:productId` | Ürün etkileşim kontrolü |

### Affiliate & Fiyat Takip
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/admin/affiliate/update-prices` | Tüm fiyatları güncelle (batch) |
| POST | `/admin/affiliate/update-price/:linkId` | Tek link fiyatı güncelle |
| GET | `/admin/affiliate/metrics` | Affiliate metrikleri |
| GET | `/admin/affiliate/price-alerts?threshold=5` | Son 24s fiyat düşüş bildirimleri |

### B2B API Yönetimi
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/admin/b2b/api-keys` | API key oluştur |
| GET | `/admin/b2b/api-keys` | API key listesi |
| GET | `/admin/b2b/api-keys/:id/stats` | Key kullanım istatistikleri |
| DELETE | `/admin/b2b/api-keys/:id` | Key iptal et |
| POST | `/admin/b2b/api-keys/:id/webhooks` | Webhook oluştur |
| GET | `/admin/b2b/api-keys/:id/webhooks` | Webhook listesi |
| DELETE | `/admin/b2b/webhooks/:id` | Webhook sil |
| GET | `/admin/b2b/metrics` | B2B metrikleri |

### Sistem
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/admin/corrections` | Düzeltme bildirimleri |
| GET | `/admin/audit-logs` | Audit log |
| GET | `/admin/batch-imports` | Import geçmişi |

## Pagination

Tüm liste endpoint'leri standart pagination destekler:

```
?page=1&limit=20&search=niacinamide
```

Response:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

## Hata Formatı

```json
{
  "statusCode": 404,
  "message": "Ürün bulunamadı",
  "error": "Not Found"
}
```
