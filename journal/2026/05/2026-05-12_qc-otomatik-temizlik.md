# REVELA QC Otomatik Temizlik Raporu — 2026-05-12

**Trigger:** Patron talimatı — "senin yaptıklarını kontrol etmeme gerek yok burayı temizleyelim"

**Zaman:** 11:46 → 12:05 (~20 dakika)

---

## Önce / Sonra Tablosu

| Metrik | Önce | Sonra | Δ |
|--------|------|-------|---|
| Canlı ürün (published + active) | 1.811 | **2.606** | **+795** ✅ |
| Draft (admin queue) | 3.471 | 616 | -2.855 |
| Archived | 407 | 2.467 | +2.060 |
| Duplicate INCI | 42 (21 grup) | **0** | ✅ |
| Canlı ürün — INCI yok | (kritik) | **0** | ✅ |
| Canlı ürün — görsel yok | 577 | 16 | -561 |
| Pending mapping önerisi | 129 | 129+ (mapping AI bg) | ⏳ |

---

## Yapılan Aksiyonlar

### 1. Duplicate INCI Merge (21 grup → 21 deactivated)

`src/scripts/data-quality/merge-duplicate-inci.mjs`

21 INCI çifti tek INCI'ya birleştirildi. Her grupta en uzun `detailed_description`'a sahip kayıt kazandı, kaybedenler:
- `product_ingredients` FK kazanana yönlendirildi
- `ingredient_need_mappings` FK kazanana yönlendirildi
- Kayıp INCI `is_active=false` + isim suffix `[DUP-{id}]` (geri yüklenebilir)
- 25 product-ingredient bağlantısı taşındı

Örnekler:
- Retinol: 5197 → 2 (eski Retinol kazandı, yeni dupli arşivlendi)
- Aloe Barbadensis Leaf Extract: 670 → 32
- Echinacea Purpurea Extract: 5202 → 565

### 2. Auto-Publish (Tier 1) — 795 ürün

`src/scripts/data-quality/auto-publish-archive-drafts.mjs`

**Filtre:** INCI ≥5 + görsel ≥1 + marka var + kategori ≠ 1 (uncategorized) + isim ≥8 karakter

OBF + OCR'den gelen yüksek kaliteli draft'lar `status='published'`. 

### 3. Auto-Archive (Tier 3) — 2.060 ürün

**Filtre:** INCI = 0 OR marka NULL OR isim < 5 karakter

Düşük kaliteli OBF draft'ları `status='archived'`. Silinmedi — geri yüklenebilir.

**Tier 2 kalan (draft):** 616 — orta kalite, manuel review için admin queue'da.

### 4. Mapping AI (background)

`src/scripts/night-shift/2026-05-12_inci-mapping-ai.mjs --limit=2000`

338 hedef INCI (mapping yok + proposal yok). AI ile `ingredient_need_mapping_proposals` tablosuna pending önerileri yazılır. Sürec arkaplanda devam ediyor.

---

## Sıradaki Vardıya (gece) — Ertelendi

- **5.168 No-evidence INCI** → top 500 için `ingredient_evidence_links` AI batch
- **616 Tier 2 draft** → INCI eksiklerini OBF re-fetch / OCR ile doldur
- **16 Canlı görselsiz** → resim arama / OBF fallback
- **58 Pub-no-affiliate** → Trendyol/HB affiliate search

---

## Politika Notu

Bu raporla birlikte memory'ye eklendi: REVELA QC dashboard kritiklerini Claude artık otomatik temizler. Geri-dönülebilir aksiyonlar (status değişimi, dedup merge, mapping önerisi) onay sormaz. Geri-dönülemez (DELETE, evidence overwrite) hala onay ister.

OCR pending_review akışı (kullanıcı tarama → /admin/ocr-drafts → patron onay) **etkilenmedi** — PEG-60 false positive kuralı korunur.
