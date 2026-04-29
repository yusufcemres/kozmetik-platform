# 📋 Yusuf İçin Talimatlar — 2026-04-29

İki iş yapacaksın, ben her ikisini de işleyip DB'ye yazacağım. Net adımlar aşağıda.

---

## 🖼️ İş 1 — Eksik Görseller (214 ürün)

### Liste nerede?
Tam liste → [`MISSING_IMAGES_2026-04-29.md`](MISSING_IMAGES_2026-04-29.md) (kök dizinde)

| Domain | Sayı |
|--------|------|
| Takviye | 135 |
| Kozmetik | 79 |
| **Toplam** | **214** |

### En çok problemli markalar (yüksek öncelik)
- **Orzax** 31 takviye
- **Naturals Garden** 24 takviye
- **Voonka** 18 takviye
- **CeraVe** 9 kozmetik
- **Nutraxin** ~9 takviye
- **Purito** 3 + **Beauty of Joseon** 2 + diğer mark = 38 kozmetik

### Klasör yapısı (önerilen)

```
revela-images-2026-04-29/
├── orzax/
│   ├── 2528.jpg          # product_id.jpg
│   ├── 2530.jpg
│   └── ...
├── voonka/
│   ├── voonka-d3-k2-60-softjel.jpg     # veya product_slug.jpg
│   └── ...
├── naturals-garden/
├── cerave/
├── nutraxin/
├── purito/
├── beauty-of-joseon/
└── (diğer markalar)
```

### Format kuralları
- **Dosya adı**: `product_id.jpg` (en kolay) veya `product_slug.jpg` (slug listede mevcut)
- **Format**: jpg, png, webp (jpg tercih)
- **Boyut**: 800px+ kısa kenar (1000x1000 ideal)
- **Arka plan**: Beyaz veya transparent (PNG için)
- **Watermark**: Yok / sade

### Kaynak önerisi
1. Markanın resmi sitesi (Orzax kataloğu, Naturals Garden, vb.)
2. Trendyol/Hepsiburada satıcı sayfaları (sağ tık → görseli kaydet)
3. Google görsel arama → ürün adı + "1000x1000"
4. CeraVe için us.cerave.com ABD sitesinden (TR'de yoksa)

### Teslim
**3 yöntem** (sana en kolayı seç):

**A) Tek zip (önerilen)** → ZIP olarak yükle (Drive/Dropbox/WeTransfer)
   - Klasör yapısı yukarıdaki gibi
   - Bana paylaşım linki at, ben download + unzip + insert ederim

**B) Bana drive klasörü paylaş** → Klasörü direkt şarjlı bir Google Drive klasöründe oluştur, link ver
   - Ben Drive API ile fetch edebilirim (alternatif yöntemler de var)

**C) Tek tek URL** → Excel/CSV: `product_id, image_url`
   - Ben her URL'i fetch edip DB'ye yazarım
   - URL'ler public erişilebilir olmalı (Imgur/Cloudinary/Drive direct link)

---

## 🥗 İş 2 — Orzax 3 Ürünün İçerik Bilgisi

### Liste

Sadece 3 Orzax/Ocean takviyesi kaldı. Ürün etiketinden veya resmi siteden besin değerlerini gir.

```
ORZAX_INCI_TEMPLATE.csv  (kök dizinde, hazır template)
```

### Template yapısı

```csv
product_id,product_name,ingredient_name_tr,amount,unit,sort_order
2734,Nutraxin Iron Max,Demir,17,mg,1
2734,Nutraxin Iron Max,Vitamin C,80,mg,2
2734,Nutraxin Iron Max,Vitamin B6,2,mg,3
```

### Kurallar
- **product_id**: değiştirme (template'te hazır)
- **ingredient_name_tr**: Türkçe ad (Demir, Vitamin C, Magnezyum vb.) — INCI değil, TR
- **amount**: sayı, virgül yerine nokta (örn 17.5)
- **unit**: `mg`, `mcg`, `IU`, `g`, `ml`
- **sort_order**: 1, 2, 3... (etiketteki sıraya göre)

### Kaynak
- **Orzax.com** sitesinde ürün varsa "İçindekiler" bölümü
- **Eczane fiziksel etiket** → fotoğraf çek + okuyarak gir
- **Google'da ürün adı + "besin değerleri"** araması

### Teslim
- Doldurulmuş `ORZAX_INCI_TEMPLATE.csv` dosyasını bana ilet (Drive link, mesaj, vb.)
- Ben parse edip `supplement_ingredients` tablosuna insert ederim
- Sonra otomatik recalc → REVELA Skoru + Uyumluluk hesaplanır

---

## ⚙️ Ben tarafımda neyi otomatik yapacağım

1. ZIP / klasör / CSV → otomatik parse
2. Image → `product_images` tablosuna INSERT (alt_text="(kullanıcı yüklemesi)")
3. INCI → `supplement_ingredients` tablosuna INSERT
4. Score recalc → `GET /supplements/:id/score` çağır → product_scores hesapla
5. Need-scores → `ingredient_need_mappings` join → `product_need_scores` insert
6. `top_need_name` + `top_need_score` UPDATE
7. Vercel auto-deploy + canlı doğrulama

---

## ⏱️ Tahmini süre (sen)

- **İş 1 (görseller)**: 100-200 görsel × 30 saniye = 1-2 saat
- **İş 2 (Orzax INCI)**: 3 ürün × 5 dk = 15 dk

**Toplam**: ~1.5-2 saat sen + ~15 dk ben (otomatik insert)

---

## 🚀 Öncelik sırası önerim

1. **Önce 3 Orzax INCI** (15 dk → biten + insert anında)
2. **Sonra görseller** marka marka:
   - Önce **CeraVe 9** (Türkiye'de eczanede zaten mevcut, kolay)
   - Sonra **Voonka 18** (resmi site açık)
   - Sonra **Nutraxin 9**
   - Son **Orzax 31 + Naturals Garden 24** (en zor — Trendyol satıcı sayfaları)
   - Diğer kozmetik markalar (Purito, Beauty of Joseon vb. → resmi siteleri açık)

---

Sorular varsa söyle. Hazır olduğunda bana bildir → 5 dk içinde insert + recalc tamam.
