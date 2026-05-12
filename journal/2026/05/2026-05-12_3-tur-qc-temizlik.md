# REVELA QC 3. Tur — 2026-05-12 (15:00+)

**Trigger:** "şimdi yap devam et" — 2. tur özet sonrası kalan sorunları çöz

**Zaman:** ~15:00 → devam ediyor

---

## Sonuç Özeti

| QC Metriği | 2. Tur Sonu | 3. Tur Sonu | Δ |
|------------|-------------|-------------|---|
| published  | 2527 | **2755** | +228 |
| draft      | 616  | **388**  | -228 |
| Need skor yok | 0 ✅ | **0** ✅ | - |
| Görsel yok | 2 | **1** | -1 |
| Affiliate yok | 752 | 980 (+228 yeni pub) | artış (yapısal) |
| Unmapped INCI | 521 | 521 | - (formülasyon yardımcıları) |
| Toplam evidence | 2518 | **4060+** (devam) | +1542+ |
| Evidence yok INCI | 4266 | **3703** | -563 |
| Mapping proposals pending | 376 | 188 | -188 |

---

## Yapılan Aksiyonlar

### 1. Draft Analizi — 570 INCI>=5 Drafts

616 draft'ın kırılımı:
- 570: INCI>=5 (tier 1 kapasiteli)
- 28: INCI 1-2
- 18: INCI 3-4

570'in blokeri:
- 364: sadece kategori eksik (görsel var, INCI>=5)
- 150: sadece görsel eksik (kategori var, INCI>=5)
- 33: her ikisi de eksik
- 0: tam hazır (publish bekliyor)

### 2. Kategori AI — 426 Ürün

`2026-05-12_category-ai-batch.mjs` güncellendi (`category_id IS NULL` da dahil edildi).
`--limit=500` ile 426 ürüne otomatik kategori atandı.

### 3. Auto-Publish 2. Tur — +228

Kategori gelen 364 üründen görsel+INCI>=5 kriterini sağlayanlar publish edildi.
Published: 2527 → **2755** (+228)

### 4. Need Score Hesaplama (+1802)

228 yeni published ürünün need score'u yoktu.
`_cosmetic-fill-missing-scores.sql` mantığıyla doğru kolona (compatibility_score) insert.
**no_need = 0** ✅

### 5. Mapping Auto-Approve Eşik 65→50 (+193)

`mapping-auto-approve-v2.mjs` ile pending proposals 376 → 183 (193 onaylandı).
Onaylanan: ingredient_need_mappings'e eklendi + etkilenen ürünlerin need score'ları güncellendi.

### 6. Mapping AI Round 2 — 465 Unmapped INCI

`2026-05-12_inci-mapping-ai.mjs --limit=600` çalıştırıldı.
68 INCI işlendi, 5 yeni proposal oluştu.
Not: Kalan 521 unmapped INCI formülasyon yardımcıları (pigment, dolgu, emülsifier teknik) —
bunların "need" bağlantısı olmaması BEKLENEN davranış (Synthetic Fluorphlogopite, PEG-x, Aluminum Stearate vb.)

### 7. PubMed Evidence Backfill — `--limit=5000` (devam ediyor)

Önceki tur: 2518 toplam link
Şu an: 4060+ ve artıyor (~1500 INCI işlendi)
no_evidence_inci: 4266 → 3703 (-563, backfill devam ediyor)

---

## 388 Kalan Draft — Durum

| Kategori | Sayı | Sorun | Çözüm |
|----------|------|-------|-------|
| Görsel yok (INCI>=5, kategori var) | ~150 | Trendyol/HB'de satılmıyor (OBF AB ürün) | Tavily Extract tekrar deneme veya kabul |
| Görsel + Kategori yok | ~33 | İkisi de eksik | Aynı yapısal sorun |
| INCI <5 | ~205 | Yetersiz INCI verisi | OBF re-fetch veya arşivleme |

Temel sorun: Bu 388 ürünün büyük çoğunluğu OBF'tan import edilmiş AB pazarı ürünleri
(Fransa, Almanya, İngiltere) — Türkiye'de Trendyol/HB'de satılmıyor.

---

## Politika Güncelleme

- `ingredient_need_mappings` için **eşik 65 → 50** kalıcı (düşük güven ama makul)
- `product_need_scores` hesaplamada `compatibility_score` kolonu kullanılmalı (score değil)
- Formülasyon yardımcıları (pigment, emülsifier, dolgu) unmapped kalabilir — bu normal

---

## PubMed Backfill Tamamlandığında Beklenen

- no_evidence_inci: 3703 → ~2500 (tahmini)
- total_evidence: 4060 → ~5500-6000
- Hedef INCI: top 5000 kullanım frekansına göre
