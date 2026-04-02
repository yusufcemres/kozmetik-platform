# Mobil Uygulama Mimarisi (Faz 2.5)

## Teknoloji Seçimi

| Bileşen | Teknoloji |
|---------|-----------|
| Framework | Expo (React Native) |
| Dil | TypeScript |
| Navigation | React Navigation (tab + stack) |
| State | AsyncStorage + context |
| Build | EAS Build |
| Barkod | expo-camera + barcode scanner |
| OCR | Google ML Kit / Apple Vision |
| Push | expo-notifications |
| Shared | `packages/shared` (aynı monorepo) |

## Ekran Yapısı

```
┌──────────────────────────────────────┐
│  Tab Navigator                       │
├──────────┬──────────┬───────────────┤
│  Ana      │  Tara    │  Profil       │
│  Sayfa    │  (Scan)  │               │
└──────────┴──────────┴───────────────┘

Ana Sayfa → Arama → Ürün Detay → Ingredient Detay
                  → Need Detay
Tara → Barkod Sonuç → Ürün Detay
     → OCR Sonuç → Ingredient Analiz
Profil → Rutin → Karşılaştırma
       → Favoriler
```

### 10 Ekran

| Ekran | Dosya | Açıklama |
|-------|-------|----------|
| Home | HomeScreen.tsx | Arama + öne çıkanlar |
| Search | SearchScreen.tsx | Arama sonuçları |
| Product Detail | ProductDetailScreen.tsx | Ürün detay + skorlar + affiliate |
| Ingredient Detail | IngredientDetailScreen.tsx | Ingredient bilgi + kanıt |
| Need Detail | NeedDetailScreen.tsx | İhtiyaç + uyumlu ürünler |
| Scan | ScanScreen.tsx | Barkod + OCR kamera |
| Profile | ProfileScreen.tsx | Cilt profili (web sync) |
| Routine | RoutineScreen.tsx | Sabah/akşam rutin |
| Compare | CompareScreen.tsx | 2-3 ürün karşılaştırma |
| Favorites | FavoritesScreen.tsx | Offline favori listesi |

## Mobil-Only Feature'lar

### 1. Barkod Tarama
```
Kamera → Barkod oku → API: GET /products?barcode=...
  ├─ Bulundu → ProductDetailScreen
  └─ Bulunamadı → "Fotoğraf çek" → OCR → Review queue'ya gönder
                → Push notification: "Ürün eklendi!"
```

### 2. Etiket OCR
```
Kamera → INCI fotoğrafı → ML Kit OCR → Text extraction
  → INCI Parser (Prompt 6 pipeline) → Anlık ingredient analizi
  → "Kaydet?" → Admin review'a gönder
```

### 3. Rutin Oluşturucu (IRoutineEngine)
```
Sabah                    Akşam
1. Temizleyici            1. Temizleyici
2. Tonik                  2. Aktif (retinol/AHA)
3. Serum                  3. Nemlendirici
4. Nemlendirici           4. Göz kremi
5. Güneş kremi

Uyarılar:
⚠️ Retinol + AHA aynı akşam kullanma
⚠️ Vitamin C + Niacinamide sıralamasına dikkat
✅ Ceramide + Hyaluronic Acid birlikte iyi çalışır
```

### 4. Ürün Karşılaştırma
- 2-3 ürün yan yana
- Ortak / farklı ingredient diff
- Need skor karşılaştırması
- Kişisel uyum karşılaştırması

### 5. Push Notifications
- "Güneş kremi zamanı" (sabah hatırlatma)
- "Retinol akşamı" (rutin takibi)
- "Favori ürünün formül değişti" (formula_revisions tetikler)
- "Yeni rehber yayınlandı"

### 6. Offline Mode
- Favori ürünler + ingredient bilgileri local cache
- Offline'da barkod tara → cache'de ara
- Online olunca sync

## Profil Sync Akışı (IMobileSyncAdapter)

```
Web (localStorage)  ←──── QR/Link Transfer ────→  Mobil (AsyncStorage)
        │                                                  │
        └──────── POST /skin-profiles ──────────→ Backend ←┘
                  PUT /skin-profiles/:id
```

**Conflict resolution stratejileri:**
- `server_wins` — backend verisi kazanır
- `client_wins` — local veri kazanır
- `latest_wins` — en son güncellenen kazanır (timestamp karşılaştırma)

## API Entegrasyonu

Mobil uygulama **aynı NestJS API'yi** kullanır. Ek endpoint gerekmez.

Mevcut endpoint'lerden mobilde kullanılanlar:
- `/products`, `/ingredients`, `/needs` — liste + detay
- `/search`, `/search/suggest` — arama
- `/skin-profiles` — profil CRUD
- `/products/:id/personal-score` — kişisel skor
- `/products/:id/affiliate-links` — nereden alınır

## Geliştirme Sırası (M1-M10)

| Sprint | İçerik |
|--------|--------|
| M1 | Expo scaffold + navigation + API client + shared bağlantı |
| M2 | Core ekranlar: ana sayfa, arama, ürün/ingredient/need detay |
| M3 | Profil sync + kişisel skor |
| M4 | Barkod tarama + ürün eşleştirme |
| M5 | OCR + INCI parse |
| M6 | Favoriler + offline cache |
| M7 | Rutin oluşturucu |
| M8 | Karşılaştırma + push notifications |
| M9 | Affiliate "Nereden Alınır" + deep linking |
| M10 | App Store / Google Play submission (EAS Build) |

## Monorepo Entegrasyon

```json
// apps/mobile/package.json
{
  "dependencies": {
    "@kozmetik/shared": "workspace:*"
  }
}
```

Shared package'dan import:
```typescript
import { SkinType, IRoutineEngine, SENSITIVITY_PENALTIES } from '@kozmetik/shared';
```
