# API Referansı

## Genel Bilgiler

- **Base URL:** `http://localhost:3001/api/v1`
- **Auth:** JWT Bearer token (admin endpoint'ler için)
- **Format:** JSON
- **Swagger:** `http://localhost:3001/api/docs`

## Public Endpoints

### Health
| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/health` | Sunucu durumu |

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

### Düzeltmeler
| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/corrections` | Hata bildir (public) |

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
