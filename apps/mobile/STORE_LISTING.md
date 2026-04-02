# Store Listing — Kozmetik Platform

## App Bilgileri

| Alan | Değer |
|------|-------|
| App Adı | Kozmetik Platform |
| Kısa Açıklama | Kozmetik ürün analizi, INCI içerik detayı ve cilt uyumu |
| Kategori | Sağlık & Fitness / Güzellik |
| Bundle ID (iOS) | com.kozmetikplatform.app |
| Package (Android) | com.kozmetikplatform.app |
| İçerik Derecelendirme | Herkes (Everyone) |
| Fiyat | Ücretsiz |

## Tam Açıklama

Kozmetik Platform, kozmetik ürünlerin INCI içerik listesini analiz eden, cilt ihtiyaçlarına göre uyumluluk skoru hesaplayan ve kişiselleştirilmiş öneriler sunan bağımsız bir platformdur.

**Özellikler:**

- Barkod tarama ile anlık ürün analizi
- INCI etiket OCR — fotoğraf çekip içerik analizi yap
- 25+ aktif ingredient hakkında detaylı bilgi ve kanıt seviyeleri
- Kişisel cilt profili — cilt tipine göre uyumluluk skoru
- Sabah/akşam cilt bakımı rutin oluşturucu
- Ingredient etkileşim uyarıları (retinol + AHA vb.)
- Ürün karşılaştırma — yan yana ingredient ve skor analizi
- "Nereden Alınır?" — Trendyol, Hepsiburada, Gratis fiyat karşılaştırması
- Favori ürünler ve offline erişim

**Bağımsızız:** Hiçbir markadan sponsorluk almıyoruz. Affiliate linkleri şeffaf şekilde belirtilir.

**Gizlilik:** Hesap açmadan kullanılır. Kişisel cilt profili anonim olarak saklanır.

## Anahtar Kelimeler

kozmetik, cilt bakımı, inci, ingredient, içerik analizi, serum, nemlendirici, güneş kremi, niacinamide, retinol, hyaluronic acid, cilt tipi, barkod, cilt uyumu

## Ekran Görüntüsü Listesi

1. **Ana Sayfa** — Arama + ihtiyaç chip'leri + öne çıkan ürünler
2. **Ürün Detay** — Skor barları + kişisel uyum + "Nereden Alınır?"
3. **Barkod Tarama** — Kamera ekranı + sonuç
4. **Cilt Profili** — 3 adımlı wizard
5. **Rutin Oluşturucu** — Sabah/akşam + etkileşim uyarıları
6. **Arama Sonuçları** — Cross-entity sonuçlar
7. **Ingredient Detay** — INCI bilgi + evidence badge
8. **Favoriler** — Offline erişilebilir liste

## Gerekli Asset'ler

### iOS (App Store Connect)
- Icon: 1024x1024 PNG (alpha yok)
- Screenshots: 6.7" (1290x2796), 6.5" (1284x2778), 5.5" (1242x2208)
- iPad screenshots (opsiyonel): 12.9" (2048x2732)

### Android (Google Play Console)
- Icon: 512x512 PNG
- Feature Graphic: 1024x500
- Screenshots: min 2, max 8 (16:9 veya 9:16)
- Phone: 1080x1920 önerilen

## Gizlilik Politikası URL
https://kozmetikplatform.com/gizlilik

## Destek URL
https://kozmetikplatform.com/destek

## EAS Build Komutları

```bash
# Development build
eas build --profile development --platform all

# Preview (internal test)
eas build --profile preview --platform all

# Production
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```
