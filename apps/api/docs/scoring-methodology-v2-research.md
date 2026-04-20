# REVELA Scoring Methodology v2 — Research Memo

Hazırlayan: backend/scoring
Tarih: 2026-04-20
Statü: Draft (patron review bekliyor)

---

## TL;DR

1. **Mevcut ağırlıklar temelde sağlam.** Hem cosmetic-v1 (7 bileşen) hem supplement-v2 (6 bileşen) yapısı literatür + benchmark platformlarla uyumlu. Büyük revizyon gerekmiyor, kalibrasyon gerekiyor.
2. **En kritik boşluk: `third_party_testing` gerçek veriden değil, proxy'den besleniyor.** Supplement tarafında ağırlığı %15 ama Informed Sport / USP Verified / NSF Certified etiketleri structured olarak toplanmıyor — alan dolu görünse de kaynak flaky. Bu önce veri, sonra skor problemi.
3. **`evidence_grade` A-E taksonomisi soyut.** Literatür incelemesini bir harfe sıkıştırıyor; meta-analiz sayısı / RCT sayısı / örneklem büyüklüğü gibi nicel alt bileşenlere dönüştürülmeli.
4. **food_sources backfill v1 kapandı** (batch 1, 11 high-demand ingredient). v2'de aynı ingredient'lar için peer-reviewed klinik kaynak listesi (`clinical_references` JSONB) eklenmeli — makale + need chip'leri ile bağlantı kurulabilir.
5. **Otomasyon:** CIR (Cosmetic Ingredient Review), SCCS (EU Scientific Committee on Consumer Safety), USP Verified, NIH ODS Fact Sheets, Examine.com database için scrape helper onboarding pipeline v2'ye bağlanacak — research-ingredient.ts ile aynı çatı altında.

---

## 1. Mevcut Durum — Ağırlık Haritası

### Cosmetic scoring (cosmetic-scoring.service.ts)

| Bileşen | Ağırlık | Kaynak |
|---|---|---|
| `active_efficacy` | **25%** | Aktif içerik etki kanıtı (örn. retinol %0.3-1.0, niacinamide %2-10) |
| `safety_class` | **20%** | CIR / SCCS güvenlik sınıfı + EU Annex II/III referansları |
| `concentration_fit` | **15%** | Etiketli veya raf dozu hedef bandın içinde mi |
| `interaction_safety` | **10%** | Retinol + AHA/BHA, Vit C + niacinamide gibi çakışmalar |
| `allergen_load` | **10%** | 26 EU-zorunlu alerjen + fragrance yükü |
| `cmr_endocrine` | **10%** | CMR 1A/1B + endocrine disruptor listesi |
| `transparency` | **10%** | Tam INCI + batch/origin bilgisi erişimi |

Floor-cap kuralları: EU banned ingredient → max 20, CMR 1A/1B → max 30, >%50 unknown safety → transparency cap.

### Supplement scoring (supplement-scoring.service.ts)

| Bileşen | Ağırlık | Kaynak |
|---|---|---|
| `form_quality` | **25%** | Biyoyararlanım (örn. magnezyum glisinat > oksit, folat metilfolat > folik asit) |
| `dose_efficacy` | **25%** | RCT'lerde etkili bulunan doz aralığı (örn. D3 1000-4000 IU) |
| `evidence_grade` | **15%** | A-E skalası (A = ≥2 meta-analiz; E = geleneksel/anekdotal) |
| `third_party_testing` | **15%** | Informed Sport / USP / NSF / ConsumerLab |
| `interaction_safety` | **10%** | İlaç etkileşimi (örn. St. John's Wort + SSRI, K + warfarin) |
| `transparency_and_tier` | **10%** | Raw material kaynağı + tier 1/2/3 (pharma/medical/standard) |

---

## 2. Benchmark — Rakipler Ne Kullanıyor?

### EWG Skin Deep (ewg.org)
- **Ağırlık şeması:** Hazard score (1-10, ters skala) + Data Availability flag.
- **Güçlü yanı:** CMR + endocrine disruptor sınıflandırmasında çok net — her ingredient için raw literature link.
- **Zayıf yanı:** Concentration-agnostic (0.1% retinol ile %2 retinol aynı hazard skorunu alır) + activist bias.
- **REVELA için takeaway:** `safety_class` + `cmr_endocrine` katmanlarımızda benzer veri (ama concentration-aware).

### Yuka (yuka.io)
- **Ağırlık şeması:** 60% safety + 20% naturalness + 20% endocrine disruption (kozmetik); gıda tarafında Nutri-Score + catkı + organik.
- **Güçlü yanı:** Basit, kullanıcı-dostu 0-100 + renk bandı.
- **Zayıf yanı:** Efficacy tamamen dışarıda — hiçbir ürün "işe yaradığı için" puan almaz.
- **REVELA için takeaway:** Biz `active_efficacy` 25% ile Yuka'nın bu eksiğini kapatıyoruz. Renk bandı/grade mantığı (A-E) iyi, koru.

### INCI Beauty
- **Ağırlık şeması:** Ingredient-level "good / moderate / controversial / bad" → ürün seviyesi harmonik ortalama.
- **Güçlü yanı:** CosIng (EU reference) verisiyle tam sync.
- **Zayıf yanı:** Concentration + formülasyon bağlamını yok sayar.
- **REVELA için takeaway:** CosIng sync'i bizim de olmalı — onboarding pipeline v2 içinde CosIng ID eşleme task'ı aç.

### Examine.com
- **Ağırlık şeması:** Health outcome başına ayrı grade (A-D) + human evidence level; ürün skoru yok, ingredient/outcome matrisi.
- **Güçlü yanı:** RCT sayısı + örneklem ağırlıklı evidence hesabı.
- **Zayıf yanı:** Ürün kataloğu yok — consumer tool değil.
- **REVELA için takeaway:** **En kritik benchmark.** `evidence_grade` A-E'yi Examine'ın nicel modeline yaklaştır (meta-analiz × 3 + RCT × 1 + observational × 0.3 şeklinde weighted count).

### ConsumerLab / Labdoor
- **Ağırlık şeması:** Lab testing + label accuracy + purity + heavy metal + nutritional value.
- **REVELA için takeaway:** `third_party_testing` 15%'inin gerçek karşılığı bu. Şu an proxy (marka tier) ile doldurulan alan, structured veri ile beslenmeli.

---

## 3. V2 Önerileri

### 3.1 `evidence_grade`: Harf → Nicel

Mevcut: `A` / `B` / `C` / `D` / `E` manuel atanıyor.
Önerilen: `evidence_score = Σ(study_weight × quality_factor) / 10` formülü.

| Çalışma tipi | Ağırlık |
|---|---|
| Meta-analysis (Cochrane/PRISMA) | 3.0 |
| Systematic review | 2.5 |
| RCT (double-blind, n≥100) | 2.0 |
| RCT (single-blind / n<100) | 1.0 |
| Observational / cohort | 0.3 |
| Mechanistic / in-vitro | 0.1 |
| Anekdotal | 0 |

Quality factor: sample size, follow-up duration, effect size (Cohen's d), conflict of interest flag.

Geçiş planı: mevcut A-E → otomatik evidence_score band'ı. Sonra nicel alanı canlı tut, harf legacy kalsın.

### 3.2 `third_party_testing`: Proxy → Structured

Yeni ingredient/product alanları (migration v2):
- `third_party_cert_informed_sport: boolean`
- `third_party_cert_usp_verified: boolean`
- `third_party_cert_nsf: boolean`
- `third_party_cert_consumerlab_passed: boolean`
- `third_party_last_tested_at: date`

Hesap: `coverage = count(true) / 4`; `freshness = 1 - max(0, (today - last_tested) / 730)`.

Scrape kaynakları: `informed-sport.com/products`, `quality-supplements.org` (USP), `nsf.org/knowledge-library/certified-products-search`, `consumerlab.com/reviews`.

### 3.3 Kozmetik `safety_class`: CIR/SCCS freshness

- CIR final reports: https://cir-safety.org/ingredients (>2022 olan son 3 yıl).
- SCCS opinions: https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs (EU).

Öneri: `safety_review_date` alanı ekle; 5 yıldan eski review varsa `safety_class` skor -15%.

### 3.4 `food_sources` v2

V1'de 11 ingredient için basit TR gıda listesi eklendi (batch 1). V2'de:
- `clinical_references: JSONB` — her kaynak için `{ doi, title, year, outcome, effect_size }` dizisi.
- `bioavailability_factor: number` — gıdadan emilim (%), supplement vs gıda karşılaştırması için.
- `rda_tr_source: string` — Türkiye Halk Sağlığı veya EFSA referansı.

Reference table: `ingredient_clinical_refs` (ingredient_id FK + 1-N ref row) — JSONB pragmatik ama tekil ref'e search gerekirse normalize edilebilir.

### 3.5 Kalibrasyon Otomasyonu

Her batch ingredient ingest sonrası audit:
- `apps/api/src/scripts/audit/check-evidence-coverage.ts` (yeni, v2 backlog): evidence_grade null oranı, third_party field null oranı, food_sources empty oranı raporla.
- Çıktı: per-domain ingredient × kaynak matrisi — hangi field'da kaç % ingredient boş.

---

## 4. Veri Kaynağı Doldurma Önceliği

| Kaynak | Öncelik | Ne için |
|---|---|---|
| PubChem | P0 | Moleküler yapı, SMILES, CAS, sinonimler |
| NIH ODS Fact Sheets | P0 | Supplement RDA + ÜL + deficiency belirtileri |
| Examine.com | P0 | RCT özet + effect size + grade |
| CosIng (EU) | P0 | Kozmetik Annex II/III/IV/V/VI sync + regulated function |
| CIR Final Reports | P1 | Cosmetic ingredient safety freshness |
| SCCS Opinions | P1 | EU kozmetik yeniden değerlendirme |
| EWG Skin Deep | P1 | Hazard score cross-check (validasyon) |
| Informed Sport / USP / NSF | P1 | Structured third-party cert verisi |
| ConsumerLab | P2 | Supplement lab test pass/fail |
| Labdoor | P2 | Purity + heavy metal |
| Türkiye Halk Sağlığı + EFSA | P2 | Türkiye-spesifik RDA (yaş + cinsiyet) |

Her kaynak için scrape helper `apps/api/src/scripts/onboarding/sources/<source>.ts` altında, research-ingredient.ts orchestrator'ı tarafından çağrılır.

---

## 5. Next Steps (V2 Sprint Planı)

1. **Sprint 1 (veri altyapısı)**
   - Migration: `third_party_cert_*` alanları (supplement product table).
   - Migration: `safety_review_date` (ingredient table).
   - Migration: `clinical_references` JSONB (ingredient table).

2. **Sprint 2 (scrape helpers)**
   - CIR + SCCS + NIH ODS + Examine + CosIng scraper her biri ~200 LOC.
   - Retry + backoff + cache (1 hafta TTL ingredient/ref başına).

3. **Sprint 3 (scoring formula)**
   - `evidence_score` nicel bileşen (A-E paralel tut ama skoru bundan hesapla).
   - `third_party_testing` coverage+freshness formülü.
   - `safety_class` freshness penalty.

4. **Sprint 4 (onboarding + audit)**
   - `research-ingredient.ts` orchestrator v2.
   - `check-evidence-coverage.ts` audit script.

---

## 6. Patron Karar Noktaları

1. `evidence_grade` harf alanını **paralel** tutalım mı, yoksa nicel skor geçince **drop** mu edelim? (Önerim: 6 ay paralel, sonra drop.)
2. Third-party cert scrape'i **günlük** mü **haftalık** mı koşsun? (Önerim: haftalık; cert değişimi yavaş.)
3. `clinical_references` JSONB versus normalize — hangi yönde? (Önerim: JSONB başla, ref-search gerekirse v2.1'de normalize et.)
4. EWG hazard score'u **validasyon** olarak tutalım mı (cross-check) yoksa tamamen ignore mu edelim (activist bias)? (Önerim: read-only cross-check; skor değil sanity-check.)
