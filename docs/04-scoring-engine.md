# Scoring Engine

## Genel Bakış

Platform, ürünlerin kullanıcı ihtiyaçlarına ne kadar uygun olduğunu **6 formül** ile hesaplar. Tüm skorlar 0-100 arasında normalize edilir.

## Formüller

### 1. IngredientStrengthScore

Bir ingredient'ın üründeki etki gücü.

```
IngredientStrengthScore = BaseOrderScore × ClaimBoost × ConcentrationBandWeight
```

| Parametre | Kaynak | Açıklama |
|-----------|--------|----------|
| BaseOrderScore | `getBaseOrderScore(order)` | INCI sırasına göre: 1→100, 2→95, ... 5→80, 10→55 |
| ClaimBoost | `CLAIM_BOOST = 1.15` | Etiket claim'de geçiyorsa %15 boost |
| ConcentrationBandWeight | `CONCENTRATION_WEIGHTS` | high=1.0, medium=0.8, low=0.5, trace=0.2, unknown=0.6 |

### 2. ProductNeedCompatibility

Ürünün belirli bir ihtiyaçla uyumu.

```
ProductNeedCompatibility = normalize(Σ relevance × IngredientStrengthScore)
```

- Her ingredient'ın o need ile `relevance` skoru (0-100) mapping'den gelir
- Çarpım toplamı → 0-100 arası normalize

### 3. LabelConsistencyScore

Etiketteki claim'lerin ingredient listesiyle tutarlılığı.

```
Score = (desteklenen_claim_sayısı / toplam_claim_sayısı) × 100
```

### 4. ContentCompletenessScore

Ürün veri doluluk oranı.

```
Kontrol edilen alanlar:
- product_name ✓
- short_description ✓
- ingredients (en az 1) ✓
- images (en az 1) ✓
- brand ✓
- category ✓
- barcode ✓
- net_content ✓

Score = (dolu_alan_sayısı / 8) × 100
```

### 5. ProductRankScore

Toplam ürün kalite skoru (admin dashboard sıralama için).

```
ProductRankScore = 
  needScore × 0.35 +
  labelScore × 0.20 +
  completenessScore × 0.15 +
  evidenceScore × 0.15 +
  reviewScore × 0.15
```

Ağırlıklar `RANK_SCORE_WEIGHTS` constant'ından gelir ve `scoring_configs` tablosundan admin tarafından değiştirilebilir.

### 6. PersonalCompatibilityScore (Kişisel)

Kullanıcının cilt profiline özel uyum skoru.

```
PersonalCompatibilityScore = 
  ProductNeedCompatibility(profildeki_needler) × SensitivityPenalty
```

**SensitivityPenalty değerleri:**

| Hassasiyet | Koşul | Çarpan |
|-----------|-------|--------|
| Parfüm | Üründe fragrance var | × 0.6 |
| Alkol | Üründe alcohol denat var | × 0.7 |
| Paraben | Üründe paraben var | × 0.75 |
| Esansiyel yağ | Üründe essential oil var | × 0.8 |
| Yok | Hassasiyet eşleşmesi yok | × 1.0 |

## Gösterim

### Ürün Detay Sayfası
- **Genel skor:** "Bu ürünün sivilce eğilimli cilt uyumu: %78"
- **Kişisel skor:** "Senin cildine uyumu: %65 ⚠️ (parfüm hassasiyetin var)"

### Arama Sonuçları
- SearchScore composite: `textRelevance × 0.4 + needScore × 0.3 + completeness × 0.15 + evidence × 0.15`

## Konfigürasyon

Admin panel üzerinden `scoring_configs` tablosundaki ağırlıklar değiştirilebilir:

```
GET  /admin/scoring-config     → mevcut ayarlar
PUT  /admin/scoring-config     → güncelle
POST /scoring/recalculate-all  → tüm ürünleri yeniden hesapla
```

## Shared Constants

Tüm scoring sabitleri `packages/shared/src/constants/scoring.ts` dosyasında:

```typescript
BASE_ORDER_SCORES    // INCI sıra → skor tablosu
CLAIM_BOOST          // 1.15
CONCENTRATION_WEIGHTS // { high: 1.0, medium: 0.8, ... }
RANK_SCORE_WEIGHTS   // { need: 0.35, label: 0.20, ... }
SEARCH_SCORE_WEIGHTS // { text: 0.4, need: 0.3, ... }
SENSITIVITY_PENALTIES // { fragrance: 0.6, alcohol: 0.7, ... }
```
