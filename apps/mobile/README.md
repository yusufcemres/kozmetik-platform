# Mobile App (Faz 2.5)

Bu klasör Faz 2.5'ta Expo (React Native) uygulaması ile doldurulacaktır.

## Planlanan Ekran Yapısı

```
src/
├── screens/
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── IngredientDetailScreen.tsx
│   ├── NeedDetailScreen.tsx
│   ├── ScanScreen.tsx            ← barkod + OCR
│   ├── ProfileScreen.tsx          ← cilt profili (web'den sync)
│   ├── RoutineScreen.tsx          ← sabah/akşam rutin
│   ├── CompareScreen.tsx          ← ürün karşılaştırma
│   └── FavoritesScreen.tsx
├── components/
│   ├── ProductCard.tsx
│   ├── IngredientCard.tsx
│   ├── ScoreBar.tsx
│   ├── EvidenceBadge.tsx
│   └── AffiliateButton.tsx
├── services/
│   ├── api.ts                     ← shared API client
│   ├── barcode.ts                 ← IBarcodeScanner impl
│   ├── ocr.ts                     ← Google ML Kit / Apple Vision
│   └── notifications.ts
├── navigation/
│   └── AppNavigator.tsx           ← tab + stack
├── hooks/
│   ├── useSkinProfile.ts
│   └── usePersonalScore.ts
└── stores/
    ├── profile.ts                 ← IMobileSyncAdapter impl
    └── favorites.ts
```

## Planlanan Özellikler
- Barkod tarama + anlık ürün analizi
- Etiket OCR + INCI parse
- Kişisel cilt profili (web'den sync)
- Sabah/akşam rutin oluşturucu
- Ürün karşılaştırma
- Favoriler + offline mode
- Push notifications
- Affiliate "Nereden Alınır" + deep linking

## Shared Package Interfaces
- `IRoutineEngine` — rutin oluşturucu motor
- `IBarcodeScanner` — barkod tarama + OCR
- `IAffiliateProvider` — çoklu platform fiyat çekme
- `IMobileSyncAdapter` — profil sync (web ↔ mobil ↔ backend)

## Teknoloji
- Expo SDK + EAS Build
- React Native
- TypeScript
- `packages/shared` import (aynı monorepo)
- Aynı NestJS backend API (ek endpoint gerekmez)

## Geliştirme Sırası (M1-M10)
1. Expo scaffold + navigation + API client + shared bağlantı
2. Core ekranlar (ana sayfa, arama, detay)
3. Profil sync + kişisel skor
4. Barkod tarama
5. OCR + INCI parse
6. Favoriler + offline cache
7. Rutin oluşturucu
8. Karşılaştırma + push notifications
9. Affiliate + deep linking
10. App Store / Google Play submission
