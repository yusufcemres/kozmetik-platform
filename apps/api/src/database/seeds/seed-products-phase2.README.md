# Faz E — Ürün Seed (phase2)

~600 ürünlük seed dosyası bu repoda **yer almaz**. İçerik üretimi iki aşamalı:

1. **Araştırma çıktıları**: Önceki subagent/Tavily araştırmalarından gelen JSON dosyaları (dermo 228 + takviye 173 + bebek 100 + mevcut 10 ≈ 511 + buffer).
   Kaynaklar `c:/dev/revela-research/` altında tutulacak (repo'ya commit edilmez).

2. **Seed loader**: Araştırma JSON'ları hazır olduğunda aşağıdaki script çalıştırılır:

```bash
node seed-products-phase2.js --source=../../../../revela-research/products.json
```

Script davranışı:

- Her ürün `status='draft'` ile insert edilir
- `brand_id` phase2-brands.json'dan slug lookup
- `category_id` categories-taxonomy.json'dan slug lookup
- INCI listesi `ingredients_inci` JSONB'ye parse edilir
- Görsel + affiliate linkler Faz F'te ayrı script ile zenginleştirilir
- Faz I'de publish gate çalışır, geçenler `published` olur

## Hızlı başlangıç (araştırma olmadan)

Test için 30-50 ürünlük örnek dosya elle oluşturulabilir:
`phase2-products-sample.json` şeması:

```json
{
  "products": [
    {
      "name": "...",
      "brand_slug": "...",
      "category_slug": "...",
      "description": "...",
      "ingredients_inci": ["Aqua", "Glycerin", ...],
      "image_url": null,
      "size_ml": 50
    }
  ]
}
```
