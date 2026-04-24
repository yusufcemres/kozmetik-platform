# MORNING REPORT — REVELA Supplement Ingest Sprint
**Tarih:** 2026-04-23
**Vardiya başlangıcı:** 2026-04-22 18:00

## Özet

| Metrik | Değer |
|---|---|
| Başlangıç takviye sayısı | 30 |
| Sprint sonu eklenen (aktif) | **91** |
| Draft / pasif | 0 |
| Toplam eklenen | 91 |
| Ortalama skor | 72.7 |
| Claude-gen ready | 91 |
| Claude-gen rejected | 46 |
| Duplicate skip | 0 |
| Onboard success | 88 |
| Onboard fail | 3 |

## Skor dağılımı

| Bucket | Sayı |
|---|---|
| 80-100 | 19 |
| 60-79 | 69 |
| 50-59 | 3 |
| 40-49 | 0 |
| <40 | 0 |
| null | 0 |

## Marka kırılımı

| Marka | Toplam | Aktif | Ort skor |
|---|---|---|---|
| orzax | 91 | 91 | 73 |

## En yüksek skorlu 10

- **87** — orzax: Ocean Iodine Damla 30 ml (A)
- **87** — orzax: Ocean Methyl Folat 30 Tablet (A)
- **83** — orzax: Ocean Methyl B12 1000 µg 5 ml Sprey (B)
- **83** — orzax: Ocean Methyl B12 500 µg Sprey (B)
- **82** — orzax: Ocean DHA 30 Softjel (B)
- **82** — orzax: Ocean Methyl B12 1000 µg 10 ml Sprey (B)
- **82** — orzax: Ocean Vitamin D3 1000 IU Damla (B)
- **82** — orzax: Ocean Vitamin D3 1000 IU Sprey 20 ml (B)
- **82** — orzax: Ocean Vitamin D3 600 IU Sprey 20 ml (B)
- **81** — orzax: Day2Day The Collagen All Body 300 g Toz (B)

## Gözden geçirilmesi gereken (<60)

- **54** — orzax: Ocean L-Arjinin Saşe 1000 mg
- **57** — orzax: Ocean Alfa Lipoik Asit 200 mg Bitkisel Kapsül
- **58** — orzax: Ocean ExtraMag Magnezyum Sitrat Saşe 30 Saşe

## Sabah manual check — 5 dk

1. Rastgele 5 aktif ürünü Vercel preview'da aç (görsel + ingredient tablosu + skor)
2. Düşük skor listesinde manual inceleme gerekenleri işaretle
3. Verify eksikleri listesindekiler otomatik deactive — DB'de kalıyor, frontend'de yok
4. Sonraki sprint öncesi prompt tuning gerekiyorsa feedback memory'ye ekle

---
_Generated 2026-04-23T21:44:36.579Z_