# products-queue

Onboarding pipeline'ın input klasörü. Her JSON dosyası 1 supplement ürünü tanımlar.

## Dosya adlandırma

```
<brand-slug>-<product-slug>.json
```

Örnek: `nutraxin-magnesium-bisglycinate-400.json`

## Alan listesi

Zorunlu ve opsiyonel alanlar `_template.json` içinde inline yorum olarak var.

## Kısa özet — 5 tipik hata

1. **common_name boş** → UI Latin ad gösterir. Daima Türkçe ad yaz.
2. **İngilizce function_summary** → Generic placeholder render olur. Min 80 char TR.
3. **food_sources boş** (nutrient için) → "Besin Kaynakları" section boş.
4. **Chelated form (bisglycinate, citrate…) + elemental_ratio yok** → UL false-positive + skor 50'ye düşer.
5. **Trendyol search URL** → Affiliate gelir kaybı. Direkt ürün URL (`...-p-123456`) ver.

Pipeline bu 5'ini otomatik tespit edip fail verir. Detay: `../onboarding/RUNBOOK.md`.

## Akış

```
_template.json → <brand-slug>-<product>.json → onboard-supplement.ts --dry-run → (onay) → live run
```

- `--dry-run`: DB'ye yazmaz, diff gösterir
- `--yes`: interactive onay atlar (CI için)
- `--skip-qa`: Vercel QA atlar
