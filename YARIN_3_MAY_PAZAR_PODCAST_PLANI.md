# 🎙️ Yarın 3 Mayıs Pazar — Podcast İnceleme + Yayın Planı

**Şu an:** 3 May Pazar 02:25 (gece)
**Hedef:** 3 May içinde 3 bölüm Spotify'da yayında
**Sonraki gün:** 4 May Pzt 11:00 ARDVENTURE TEKMER (sunum, podcast canlı demo)

---

## 1. NotebookLM 3 Bölüm Üretim (Bu Gece veya Yarın Sabah)

### v7-narrative Klasörü Hazır

```
c:\Users\Yusuf Cemre\OneDrive\Desktop\kozmetik-platform\podcast-pilot\v7-narrative\
├── 01-mikrobiyom-v7.md
├── 02-lekek-v7.md
└── 03-skin-cycling-v7.md
```

### v7 Format Özeti (Final)
- ✅ Kişisel isim YOK (sunucular Yusuf Cemre olarak tanıtmıyor)
- ✅ Hızlı giriş + sponsor + bölüm önizlemesi (bugün şunu çözeceğiz)
- ✅ Yapı: mesele → gelişme (bilim + atıflar OK) → sonuç (çözüm)
- ❌ Yüzde / ürün sayısı / marka sayısı / INCI sayısı YOK
- ❌ Site adresi YOK
- ✅ Atıflar (Polnikorn, Wu, Mukherjee, Bowe, Lee, Glatz) doğal aktarılır

### NotebookLM Workflow

1. **Eski tüm kaynakları sil** (sol panel temizle)
2. **Sadece 1 v7 dosyası yükle** (tek kaynak = kısa süre)
3. **Ayarlar:**
   - Biçim: Ayrıntılı inceleme
   - Dil: Türkçe
   - Uzunluk: **Kısa**
4. **Odak prompt** (her bölüm için aynı, sadece konu adı değişir):

```
Sunucular kişisel isim KULLANMASIN — kendilerini "Yusuf Cemre" olarak tanıtmasınlar. İki AI host doğal sohbet havasında konuşsun.

Kaynaktaki AÇILIŞ ve KAPANIŞ bloklarındaki bilgileri sohbete doğal yedirin:
- Sponsorluk + brand tanıtımı (REVELA)
- Bölüm önizlemesi (bugün şu konuyu konuşacağız, şu soruyu çözeceğiz)

Yapı: giriş (mesele) → gelişme (bilim + atıflar) → sonuç (çözüm).

KRİTİK: Yüzde, ürün sayısı, marka sayısı, INCI sayısı söylemesin. Atıflar (araştırmacı isimleri, çalışma yılları) doğal aktarılabilir. Site adresi söylemesin.

Hedef süre: 8-10 dakika. Sade dil, akıcı sohbet.
```

5. **Üret** → 2-3 dk bekle → MP3 indir
6. **Sıradakini üret** (kaynağı değiştirip aynı prompt)

---

## 2. Spotify for Podcasters Yayın

### Hesap (Henüz Açılmadı)

- URL: **https://podcasters.spotify.com**
- Spotify hesabıyla giriş

### Show Bilgileri

| Alan | Değer |
|------|-------|
| Program adı | `REVELA Podcast` |
| İçerik üreticinin adı | `SoloLabs Studio` |
| Kategori | `Alternatif Sağlık` |
| Dil | `Türkçe` |
| Explicit | `No` |

### Show Açıklaması (510 char, kopyala-yapıştır)

```
Kozmetik ve takviye gıda içeriklerinin bilimini Türkçe konuşuyoruz. INCI listesinin arkasındaki kanıtlar, hangi aktif hangi cilde uygun, modaya kapılmadan formülün gerçekte ne yaptığı.

Her bölümde bir aktif bileşen, bir cilt sorunu veya bir bakım protokolü ele alıyoruz. SCCS, CIR ve peer-reviewed dermatoloji literatürü atıflı — kanıt-temelli, bağımsız.

Aktif mekanizması, etkili konsantrasyon, klinik kanıt, kullanım tüyoları ve yaygın yanlış kanılar — hepsi bir arada.

Markaların değil, formüllerin konuştuğu yer.
```

### Kapak Görseli

⭐ **REVELA_PODCAST_COVER_v4.png** (Ideogram, slogan + molekül büyük)

📁 `c:\...\kozmetik-platform\podcast-pilot\REVELA_PODCAST_COVER_v4.png`

⚠️ **Boyut sorunu**: 1024x1024 (Spotify minimum **1400x1400** ister)

**Çözüm seçenekleri:**
- **A.** Yine de yükle, Spotify "boyut yetersiz" derse Photoshop/Canva ile 1500x1500 upscale
- **B.** Şu an Photoshop'ta upscale et (Image → Resize → 2048x2048 Bicubic Smoother)
- **C.** Windows Paint → Resize → %200 (en hızlı)

### 3 Bölüm Show Notes (Kopyala-Yapıştır)

#### Bölüm 1
**Title:** `Cildin Görünmez Bakteri Şehri ve Postbiyotikler`

```
Cilt yüzeyinde binlerce farklı bakteri, mantar ve virüs simbiyotik yaşar — vücudumuzun en kalabalık ekosistemi cildimizde.

Bu bölümde:
• Mikrobiyom dengesizliği ile akne, atopik dermatit ve rosacea bağlantısı
• Probiyotik (canlı bakteri), prebiyotik (besin) ve postbiyotik (metabolit) farkı
• Galaktomis, Bifida ferment lysate, Lactobacillus — hangi ürünlerde, ne için?
• Mikrobiyom-uyumlu ürün seçim rehberi

Bahsedilen klinik kaynaklar: Glatz (J Am Acad Dermatol), Guéniche (Br J Dermatol), Lee (J Cosmet Dermatol).
```

**Etiketler:** `mikrobiyom, probiyotik, prebiyotik, postbiyotik, cilt bakımı, dermatoloji, REVELA`

#### Bölüm 2
**Title:** `Lekek Tedavisi Yol Haritası — Arbutin, Kojik, Tranexamic`

```
Hiperpigmentasyon farklı yollardan oluşur — UV, hormonal melasma, post-akne lekesi. Tek aktif tüm yolakları kapatamaz.

Bu bölümde:
• Alpha-arbutin — yumuşak, hassas cilt uyumlu, hidrokinon glikozit formu
• Kojik asit — Aspergillus oryzae fermentasyonu, AB regülasyonu
• Tranexamic asit — vasküler bileşeni de hedefler, dirençli melasmada üstün
• Hangi cilde hangisi? Hafif → orta → dirençli protokol
• Hidrokinon neden reçeteli, öz-tedavi neden tehlikeli

Klinik kaynaklar: Polnikorn, Wu, Atefi.
```

**Etiketler:** `lekek, melasma, arbutin, kojik asit, tranexamic, hiperpigmentasyon, REVELA`

#### Bölüm 3
**Title:** `Skin Cycling — 4 Günlük Aktif Rotasyon Protokolü`

```
Skin cycling, dermatolog Whitney Bowe tarafından popülerleştirilen 4 günlük rotasyon. Aktiflerin tahriş etkisini en aza indirip etki gücünü korumak.

Bu bölümde:
• Gece 1: Eksfoliyant (AHA/BHA)
• Gece 2: Retinol veya retinaldehit
• Gece 3-4: Bariyer dinlenme
• Geleneksel her gece aktif kullanımı bariyeri neden çökertir
• Hassas cilt için modifikasyon
• Akneye yatkın cilt için cycling adaptasyonu

Klinik literatür: Mukherjee, Draelos, Bowe.
```

**Etiketler:** `skin cycling, retinol, AHA, BHA, bariyer, cilt bakımı, REVELA`

### Distribution

Settings → Distribution:
- ✅ Apple Podcasts (otomatik RSS)
- ✅ Google Podcasts
- ✅ Amazon Music
- ✅ iHeartRadio

24-72 saat onay süreci.

---

## 3. Sunum Hazırlığı (4 May 11:00 ARDVENTURE)

### 3 May Pazar Akşamı

- ✅ 3 podcast bölümü Spotify'da yayında
- ✅ Show URL not edildi (sunumda göstermek için)
- ✅ QR kod üret (Spotify show URL → QR) — Sunum slaytı köşesi
- ✅ Mobil ve web'de podcast doğru görünüyor mu test

### 4 May Pzt Sabah Listesi

```bash
# 1. Render warm-up (cold start fix)
cd "c:/Users/Yusuf Cemre/OneDrive/Desktop/kozmetik-platform"
bash scripts/sunum-warmup.sh

# 2. Score recalc tetikle (POST /admin/scoring/recalculate-evidence-all, JWT super_admin)
# Manual yapılacak — Render dashboard üzerinden veya curl ile
```

### Klasör Kontrolü

`D:\chemdoc-ai\` 6 PDF:
- 16-ardventure-gorusme-rehberi.pdf
- 17-projeler-tanitim-sunumu.pdf
- 18-projeler-teknik-altyapi-rehberi.pdf
- 03-bigg-sunum.pdf
- 07-cv-yusuf-cemre-san.pdf
- 10-ekler-diyagramlar.pdf

### Sunum Demo Akışı

`SUNUM_DEMO_AKIS_4MAYIS.md` (PDF: `pdf-exports/SUNUM_DEMO_AKIS_4MAYIS.pdf`)

6-8 dk demo + 4-5 dk Q&A. **Yeni eklenebilir:** "REVELA Podcast yeni başladı — 3 bölüm Spotify'da" anonsu (rehber → 6. madde).

### Q&A Hazırlık

`SUNUM_QA_DATASET_4MAYIS.md` (PDF hazır)

25 olası soru + cevap, 8 kategori.

---

## 4. Acil Durum Planı

### Eğer NotebookLM çalışmazsa
- Voice clone alternatifi vazgeçildi (kalite yetersizdi)
- Manuel kayıt + ses editör (Audacity)
- En kötü: Spotify upload sunum sonrasına ertelenir, demo'da "yakında podcast" söylenir

### Eğer Spotify boyut reddederse (kapak)
- Photoshop / Canva 1500x1500 upscale
- Veya yeni kapak Ideogram'da `image_size: "square_hd_1280"` ile üret

### Eğer Spotify onay 4 May'a yetişmezse
- "Onay sürecinde, Pazartesi tüm büyük platformlarda canlı" denilebilir
- RSS link sunum sayfasına embed edilebilir

---

## Özet Sıra

```
3 May Pazar (yarın):
  1. NotebookLM 3 bölüm üret (v7 kaynak + odak prompt)
  2. MP3'leri kontrol et + beğendiklerini seç
  3. Kapak v4 upscale (1500x1500+)
  4. Spotify hesap aç
  5. Show + 3 bölüm yükle
  6. Distribution aktif et
  7. QR kod + sunum dosyasına ekle

4 May Pazartesi:
  10:30 — warm-up + score recalc + PDF kontrol
  11:00 — ARDVENTURE TEKMER (Söğütözü)
```

İyi geceler 🌙
