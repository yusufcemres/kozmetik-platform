# Admin Kullanım Kılavuzu

## Giriş

Admin paneline `/admin/login` adresinden erişilir.

**Varsayılan super_admin:**
- Email: `admin@kozmetikplatform.com`
- Şifre: `admin123!` (seed'den)

## Roller ve Yetkiler

| Rol | Yetki |
|-----|-------|
| `super_admin` | Tüm işlemler + kullanıcı yönetimi |
| `content_editor` | Makale CRUD + ürün düzenleme |
| `taxonomy_editor` | Kategori, marka, ingredient, need CRUD |
| `reviewer` | Review queue + düzeltme yönetimi |
| `methodology_reviewer` | Kanıt seviyeleri + approved wordings |

## Admin Sayfaları (17)

### Dashboard (`/admin`)
- Özet kartlar: toplam ürün, ingredient, need, makale
- QC uyarı kartları (kritik/uyarı/bilgi)
- Son aktivite feed

### Taxonomy
- **Kategoriler** (`/admin/categories`) — Hiyerarşik kategori yönetimi
- **Markalar** (`/admin/brands`) — Marka CRUD + logo
- **İçerikler** (`/admin/ingredients`) — INCI maddesi + alias + evidence link
- **İhtiyaçlar** (`/admin/needs`) — Cilt ihtiyaçları

### Ürün Yönetimi
- **Ürünler** (`/admin/products`) — Ürün CRUD + label + görsel + affiliate link
- **Review Queue** (`/admin/review-queue`) — INCI eşleştirme onay kuyruğu
- **Eşleşmeler** (`/admin/ingredient-need-mappings`) — Ingredient-need mapping
- **Affiliate Links** (`/admin/affiliate-links`) — Toplu link yönetimi

### İçerik
- **Makaleler** (`/admin/articles`) — Blog/rehber CRUD

### Scoring & Metodoloji
- **Scoring Config** (`/admin/scoring-config`) — Skor ağırlıklarını ayarla
- **Kanıt Seviyeleri** (`/admin/evidence-levels`) — 8 evidence level
- **İfadeler** (`/admin/approved-wordings`) — Güvenli ifade kütüphanesi

### Kalite Kontrol
- **QC Raporu** (`/admin/qc`) — 13 veri kalitesi kontrolü + CSV export

### Sistem
- **Audit Log** (`/admin/audit-log`) — Tüm değişiklik geçmişi
- **Düzeltmeler** (`/admin/corrections`) — Kullanıcı hata bildirimleri
- **Import** (`/admin/batch-imports`) — Toplu veri import geçmişi

## Tipik İş Akışları

### Yeni Ürün Ekleme
1. Marka yoksa → Markalar'dan ekle
2. Kategori yoksa → Kategoriler'den ekle
3. Ürünler → Yeni Ürün → Bilgileri doldur
4. INCI text'i yapıştır → Ingestion pipeline çalışır
5. Eşleşme sonuçlarını Review Queue'dan onayla
6. Scoring hesaplat
7. Affiliate linkleri ekle
8. Durumu "published" yap

### INCI Ingestion Pipeline
1. Raw INCI text → Parser virgülle ayırır, parantez sub-ingredient'ları işler
2. Her ingredient için 4 adımlı eşleştirme:
   - Exact INCI name match
   - Exact common name match
   - Alias match
   - Trigram similarity (≥0.95 auto, 0.80-0.94 suggestion, <0.80 review)
3. Review Queue'dan düşük güvenli eşleşmeler onaylanır

### QC Kontrolü
1. Dashboard'daki QC kartlarını kontrol et
2. `/admin/qc` → Detaylı raporu incele
3. Kritik sorunları (ingredient'sız ürün, duplicate INCI) öncelikle çöz
4. CSV export ile takım paylaşımı
