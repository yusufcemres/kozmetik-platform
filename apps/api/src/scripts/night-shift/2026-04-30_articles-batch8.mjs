// Articles batch 8 — 5 yeni makale (85 → 90)
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ARTICLES = [
  {
    title: 'Reçeteli Tretinoin vs OTC Retinol: Hangisi, Ne Zaman, Nasıl?',
    slug: '2026-04-30-tretinoin-vs-retinol',
    content_type: 'comparison',
    summary: 'Tretinoin (retinoik asit) ve retinol arasındaki dönüşüm farkları, etki gücü, tahriş profili, reçete gerekliliği. Hangi cilt profili hangisini hak ediyor?',
    body_markdown: `## Retinoid Ailesi

Tüm retinoidler **A vitamini türevleri**. Hücre içinde **retinoik asit** formuna dönüşüp **retinoik asit reseptörüne (RAR)** bağlanıyorlar. Etki gücü dönüşüm sayısına bağlı:

| Form | Dönüşüm | Etki Gücü | Reçete |
|------|---------|-----------|---------|
| **Retinyl Palmitate** | 3 adım | × | Hayır |
| **Retinol** | 2 adım | ★★ | Hayır (OTC) |
| **Retinaldehit (Retinal)** | 1 adım | ★★★ | Hayır (OTC) |
| **Tretinoin (Retinoik Asit)** | Doğrudan aktif | ★★★★★ | **Evet (reçeteli)** |
| **Adapalene (Differin)** | Doğrudan aktif (sentetik) | ★★★★ | Reçete + OTC (ABD) |
| **Tazarotene** | Doğrudan aktif | ★★★★★ | **Reçete** |

## Etki Gücü Karşılaştırması

**Genel kural:** her dönüşüm adımı **gücü 10× azaltır**.

- %1 retinol ≈ %0.025 tretinoin (yaklaşık)
- %0.5 retinol ≈ %0.0125 tretinoin
- %0.1 retinaldehit ≈ %0.025 tretinoin

> Bu çevirimler **mutlak değil** — biyoavailabilite ve formülasyon faktörleri etkiler.

## Klinik Endikasyonlar

### Retinol (OTC)

**Uygun:**
- Anti-aging başlangıç
- İnce çizgi + foto-aging
- Tonal düzensizlik (ışık)
- Genel cilt yenileme

**Sınırlı:**
- Aktif akne (yetersiz güç)
- Şiddetli foto-aging
- Melasma + hidrokinon kombinasyonu

### Adapalene (Differin %0.1 — ABD'de OTC, Türkiye'de reçeteli)

**Uygun:**
- Aktif akne (komedonal + enflamatuvar)
- Hassas cilt retinoid
- Hamilelikte topikal sınırlı kullanım (kategori C)

**Avantaj:** retinole göre **daha az tahriş** + **daha güçlü akne tedavisi**.

### Tretinoin (Reçeteli)

**Uygun:**
- Şiddetli akne
- Aktif foto-aging (40+ yaş)
- Lichen planus, keratosis pilaris
- Stretch mark (sınırlı kanıt)

**Sınırlı:**
- Hassas cilt başlangıç
- Yüksek konsantrasyon (%0.1) ilk uygulama
- Hamilelik (kategori C, kaçın)

### Tazarotene (Reçeteli)

**Uygun:**
- Sedef (psoriasis)
- Aktif akne, dirençli vakalar
- Foto-aging, hiperpigmentasyon

**En güçlü retinoid:** tahriş profili de en yüksek.

## Tolerans Geliştirme

### Retinol Başlatma Protokolü

1. **Hafta 1-2:** %0.3 retinol, haftada 2 gece
2. **Hafta 3-4:** %0.3, haftada 3 gece
3. **Hafta 5-6:** %0.3, her gece
4. **Hafta 7-8:** %0.5'e geç
5. **Hafta 9+:** %1 değerlendir

### Tretinoin Başlatma Protokolü (Dermatolog Yönlendirir)

1. **Hafta 1-2:** %0.025 tretinoin, haftada 2 gece, sandwich method
2. **Hafta 3-4:** %0.025, haftada 3 gece
3. **Hafta 5-6:** %0.025, her gece
4. **Hafta 7-8:** %0.05'e değerlendir
5. **6 ay sonra:** %0.1 son aşama

### Tahriş Yönetimi

- **Sandwich method:** nemlendirici → retinoid → nemlendirici
- **Mineral SPF zorunlu** (UV duyarlılığı artar)
- **Skin cycling** (4 günlük rotasyon)
- **Bariyer kremi** günlük (ceramide)
- **Tahriş şiddetli ise:** 1 gece atla, dönüş

## Hangi Cilde Hangisi?

| Profil | Birinci Tercih |
|--------|----------------|
| 25-35 yaş, anti-aging başlangıç | Retinol %0.3-0.5 |
| Hassas cilt | Bakuchiol veya retinaldehit |
| Aktif akne | Adapalene (Türkiye reçeteli, %0.1) |
| 40+ foto-aging | Tretinoin %0.025 reçeteli |
| Melasma + leke | Tretinoin + hidrokinon (dermatolog) |
| Hamile | Bakuchiol (topikal) |
| Sedef, keratosis pilaris | Tazarotene reçeteli |

## Reçeteli Almak İçin Hekim Süreci

Türkiye'de:

1. **Dermatolog randevusu**: özel veya devlet
2. **Klinik değerlendirme**: lezyon sayısı, fotodamage skoru
3. **Reçete**: tretinoin %0.025 / 0.05 / 0.1 (Stieva-A, Acnetrex)
4. **Ay-3 ay takip**: tolerans + sonuç değerlendirme
5. **Maintenance**: %0.025 sürdürülebilir uzun vadeli

## Yan Etkiler ve Dikkatler

### Yaygın

- Kuruluk + soyulma (ilk 4-8 hafta)
- Hassasiyet artışı
- Geçici kızarıklık
- Pul pul cilt
- "Retinoid uyum" denilen 4-6 haftalık adaptasyon

### Nadir

- Kalıcı hassasiyet → bariyer kalıcı hasarı, retinoid bırakma
- Foto-allergic kontakt dermatit
- Kiraz kırmızı cilt + ödem (alerjik)

### Yasaklar

- **Hamilelik**: tüm retinoidler kategori C/X
- **Emzirme**: dermatologa danış
- **Aktif egzama**: önce bariyer onarımı
- **Aktif rosacea**: spesifik dermatolog yönlendirmesi

## Kaynaklar

- Mukherjee S et al. *Clin Interv Aging* 2006 (retinol review)
- Kligman AM et al. *J Am Acad Dermatol* 1986 (tretinoin classic)
- Czernielewski J et al. *J Am Acad Dermatol* 1997 (adapalene)
- Sorg O et al. *Skin Pharmacol Physiol* 2013 (retinaldehit)
- AAD Retinoid Use Guidelines 2024`,
  },

  {
    title: 'Vegan + Cruelty-Free Kozmetik: Sertifikalar, Tuzaklar, Etik Karar',
    slug: '2026-04-30-vegan-cruelty-free-kozmetik',
    content_type: 'guide',
    summary: 'Vegan vs cruelty-free farkı, AB hayvan testi yasağı (2013), Çin pazar zorunluluğu, Leaping Bunny vs PETA sertifikası. Tüketici için doğru karar verme rehberi.',
    body_markdown: `## Vegan vs Cruelty-Free Karışıklığı

İki farklı kavram, sıkça karıştırılır:

| Etiket | Anlam |
|--------|-------|
| **Cruelty-Free** | Hayvan testi yapılmaz |
| **Vegan** | Hayvansal içerik yok (lanolin, beeswax, silk, snail dahil) |
| **Hem Vegan Hem Cruelty-Free** | Her ikisi |
| **Sadece Cruelty-Free** | Hayvansal içerik var ama test edilmez |

> "Cruelty-free" sertifikalı bir ürün hala lanolin (yün yağı) veya beeswax içerebilir.

## AB Hayvan Testi Yasağı (2013)

**AB Cosmetic Regulation 1223/2009:**
- 2009'dan itibaren **bitmiş ürün hayvan testi YASAK**
- 2013'ten itibaren **bileşen seviyesinde de YASAK**
- AB'de satılan tüm kozmetik ürünler doğal olarak cruelty-free

> Bu yüzden AB'de bir markanın "Cruelty-Free" iddiası **garantili değil özel**.

## Çin Pazar Zorunluluğu (Karmaşık)

- Çin pazarına satmak için **bazı ürünlerde hayvan testi zorunluydu** (2021 öncesi)
- 2021 reformu: "genel kozmetik" ürünlerde test gönüllü oldu, "özel kozmetik" (sunscreen, çocuk, anti-aging) hala zorunlu
- 2023: özel kozmetik için de seçenek azaltıldı (in vitro alternatif onaylar)

> Markanın "Çin'de satılıyor" olması artık otomatik "hayvan testi yapıyor" anlamına gelmiyor — formül + ürün kategorisine bağlı.

## Sertifikalar

### Leaping Bunny (CCIC)

- **En sıkı sertifika** — tedarik zinciri dahil
- 8 ulusal hayvan koruma derneğinin koalisyonu
- Üye markalar:
  - Aveda, Burt's Bees, Pacifica, Tarte
  - The Body Shop, Lush, Pixi
  - Türkiye: çok sınırlı kayıt

### PETA "Beauty Without Bunnies"

- Marka beyanı temelli (Leaping Bunny'den daha gevşek)
- "Working for Regulatory Change" + "Animal Test-Free" + "Vegan"
- Daha geniş üye listesi
- Türkiye'de: Solgar, Loving Tan, Fenty Beauty, vd.

### Choose Cruelty Free (Avustralya)

- Avustralya orijinli, küresel
- Beeswax + lanolin + carmin gibi içerikleri reddeder
- Vegan + cruelty-free birleştirilmiş

### Vegan Society

- **Sadece vegan** sertifikası (cruelty-free ile karışmasın)
- Hayvansal içerik kontrolü
- Ürün + üretim sürecinde hayvansal türevi yok

## Yaygın Hayvansal İçerikler

❌ **Vegan değil:**
- **Lanolin** (yün yağı) → emolyent
- **Beeswax** (arı mumu) → katılaştırıcı
- **Honey** (bal) → humektant
- **Royal Jelly** (arı sütü) → premium aktif
- **Carmine** (E120) → kırmızı pigment (kabuklu böcekten)
- **Silk Amino Acids** (ipek) → saç + cilt
- **Hyaluronic Acid (animal source)** → eklem + horoz ibiği (modern HA mikrobiyal fermantasyon)
- **Squalene (shark liver)** → omega-7 (modern squalane bitkisel — zeytin/şeker kamışı)
- **Collagen (bovine/marine)** → kollajen (deniz balığından çıkarılan)
- **Snail Mucin** (salyangoz salgısı) → K-beauty popüler
- **Tallow** (hayvansal yağ) → sabun klasik

✅ **Vegan alternatifler:**
- Lanolin → bitkisel yağ alkolleri
- Beeswax → carnauba wax, candelilla wax, soy wax
- Honey → glucose, agave nektarı
- Carmine → bitkisel pigment (anatto, beetroot)
- Snail mucin → bitkisel polisakarit kompleksleri
- Squalene → squalane (bitkisel)
- Collagen → bitkisel peptit + hyaluronik

## Tüketici Tuzakları

### Marka Sahiplenmesi (Parent Company)

Bir markası cruelty-free olabilir ama **ana şirketi hayvan testi yapıyor** olabilir:
- The Body Shop: cruelty-free, Natura&Co'ya bağlı (cruelty-free)
- Aveda: cruelty-free, Estée Lauder'e bağlı (Çin satışı, durum karmaşık)
- Burt's Bees: cruelty-free, Clorox'a bağlı (test yapıyor)

> Etiket → şirket sahibi → hayvan testi politikası: 3 katmanlı kontrol gerek.

### "Bizim Ürünlerimiz Test Edilmedi" Aldatması

Bu tek başına yeterli değil:
- Bileşen tedarikçisi test etmiş olabilir
- Geçmişte test yapmış, şimdi yapmıyor
- "Test gerekirse yaparız" politikası

Sertifikalı sertifika güvencesi tek garanti.

### "Doğal" + "Cruelty-Free" Karışıklığı

- "Doğal" ≠ "vegan" (lanolin doğaldır ama vegan değil)
- "Cruelty-free" ≠ "doğal" (cruelty-free ürünler sentetik içerebilir)

## Türkiye Pazarında

- **Yasal zorunluluk yok** (AB regülasyonu Türkiye'de henüz tam aktif değil)
- Markaların çoğu **gönüllü olarak** AB standartlarını uyguluyor
- Yerel markalar genelde test yapmıyor (maliyet, etik, AB ihracat)
- "Cruelty-free Turkey" gibi yerel sertifika yok

## Etik Karar Verme Rehberi

1. **Marka sertifikasını kontrol et** (Leaping Bunny, PETA, Vegan Society)
2. **Ana şirket politikası** araştır (parent company)
3. **Çin pazarı** durumu sor (özel kozmetik test zorunlu mu?)
4. **Bileşenleri tara** (lanolin, beeswax, vd.)
5. **Tutarlı seç:** her seferinde aynı standardı uygula

## Önerilen Markalar (Türkiye Erişimi)

### Leaping Bunny / Vegan Society sertifikalı + erişilebilir

- **The Body Shop** (Türkiye mağazaları)
- **Lush** (Türkiye mağazaları)
- **Pacifica** (online)
- **Pixi** (online + Sephora)

### Leaping Bunny sertifikası olmayan ama AB compliant + cruelty-free beyan

- **The Ordinary** (Çin pazarına satmıyor)
- **Paula's Choice** (cruelty-free beyan)
- **CeraVe** (L'Oréal grup, durum karmaşık)
- **La Roche-Posay** (L'Oréal, Çin satışı)

## Kaynaklar

- AB Cosmetic Regulation 1223/2009 (hayvan testi yasağı)
- Leaping Bunny Cruelty-Free Standard
- PETA Beauty Without Bunnies database
- Vegan Society standartları
- Cruelty Free International (CFI)`,
  },

  {
    title: 'Cilt Tipini Doğru Tanı: Kuru, Yağlı, Karma, Hassas, Normal — Test ve Yöntem',
    slug: '2026-04-30-cilt-tipi-tani-rehberi',
    content_type: 'guide',
    summary: '"Hassas cildim mi var?" "Karma mı yoksa yağlı mı?" Cilt tipi sınıflandırma yöntemleri, peçete testi, sebum metresi, dermatolog tanısı. Yanlış tanı yaygın hatalar.',
    body_markdown: `## Cilt Tipi = Bakım Kararının Temeli

Yanlış cilt tipi tanısı = yanlış aktif seçimi = bariyer hasarı. Doğru tanı 5 dakikalık ev testi + 1 ay rutin gözlemi gerektirir.

## 5 Ana Cilt Tipi

### 1. Normal

- Sebum üretimi orta
- Bariyer fonksiyonu sağlam
- Görünür gözenek minimum
- Tahriş eşiği yüksek
- Mevsim değişiminde stabil

> %15 nüfusta gerçek "normal" cilt — çoğu kişi karma veya hafif yağlı tarafa kayar.

### 2. Yağlı

- Sebum üretimi yüksek (T-bölgesi + yanaklar dahil)
- Görünür gözenekler
- Akneye yatkınlık
- Makyaj kayma + ürün dağılım sorunu
- Genelde 25 yaş öncesi belirgin (hormonal)

### 3. Kuru

- Sebum üretimi düşük
- Çekme + sıkışma hissi
- Pul pul soyulma
- Bariyer hassasiyeti
- Yaşla artar (40+ yaş)

### 4. Karma (Combination)

- T-bölgesi (alın + burun + çene) yağlı
- Yanaklar normal/kuru
- Çift formülasyon ihtiyacı
- En yaygın cilt tipi (~%40 nüfus)

### 5. Hassas

- Tahriş eşiği düşük
- Belirli ürünlere hızlı reaksiyon
- Genelde **alt tip + hassas** (yağlı+hassas, kuru+hassas, vb.)
- Atopik dermatit + rosacea + perioral dermatit ile sınır

## Peçete Testi (Klasik Ev Testi)

**Yöntem:**
1. Akşam yumuşak cleanser ile yıka
2. Hiçbir ürün uygulamadan **2 saat bekle**
3. Yağlı kağıt veya peçete al
4. Yüze bastır:
   - Alın
   - Burun
   - Yanaklar
   - Çene

**Sonuç değerlendirme:**

| Sonuç | Cilt Tipi |
|-------|-----------|
| Tüm bölgelerde yağ izi belirgin | Yağlı |
| T-bölgesi yağlı, yanaklar temiz | Karma |
| Hiç yağ izi yok, çekme hissi var | Kuru |
| Hafif yağ izi T-bölgesi + yanaklar | Normal |
| Kızarıklık + hassasiyet (peçete bastırınca) | Hassas (alt tip ile) |

## Sebumetre (Klinik Yöntem)

Dermatolog ofisinde:
- Sebumetre cihazı sebum miktarını ölçer (μg/cm²)
- Bölgesel ölçüm (alın, yanak, burun)
- Sayısal değer:
  - <50 → kuru
  - 50-100 → normal
  - 100-200 → yağlı/karma
  - >200 → çok yağlı

## Cilt Tipi Yıllar İçinde Değişir

### Çocuk + Genç (0-15)

- Genelde normal-kuru
- Sebum üretimi düşük

### Ergenlik + Genç Yetişkin (15-25)

- Sebum patlaması (hormonal)
- Yağlı + akneye yatkınlık
- T-bölgesi belirgin yağlanma

### Yetişkin (25-40)

- Sebum dengesi yerleşir
- Karma → normal'e doğru
- Hormonal flare (gebelik, menstural)

### Orta Yaş + Sonra (40+)

- Sebum azalır
- Yağlı → karma → kuru'ya kayar
- Bariyer fonksiyonu zayıflar
- Hassasiyet artar

## "Hassas Cildim Mi Var?" Testi

Hassas cilt **alt tip değil**, üst karakteristik. Aşağıdakilerden 3+ varsa:

- ☐ Yeni ürünler hızla kızarıklık veya batma yapıyor
- ☐ Parfümlü ürünler tetikleyici
- ☐ Sıcak/soğuk hava cildi etkiler
- ☐ Sıcak duş sonrası kızarıklık + kuruluk
- ☐ Belirli kumaşlar (yün, sentetik) cildi rahatsız eder
- ☐ Genelde "hassas formül" ihtiyacı duyar
- ☐ Aile öyküsü (atopik dermatit, alerji, astım)
- ☐ Belirli aktiflere kötü tolerans (retinol, AHA)
- ☐ Kuruluk + sıkışma sık yaşanır
- ☐ Lokalize kızarıklık (örn. yanak telanjektazi)

## Yaygın Yanlış Tanılar

### "Yağlı sandım, aslında dehidre"

- Yağlı **sebum üretimi** ile alakalı
- Dehidre **su içeriği** ile alakalı
- İkisi birlikte olabilir → yağlı + dehidre cilt
- Tedavi: HA + niasinamid + hafif jel nemlendirici

### "Kuru sandım, aslında bariyer hasarı"

- Kuruluk genetik
- Bariyer hasarı **geçici** (aşırı eksfoliyasyon, retinol overdose, kötü cleanser)
- Tedavi: ceramide + 2 hafta aktif tatil

### "Hassas sandım, aslında perioral dermatit"

- Dudak + burun çevresi + çene papülpüstüller
- Florid içerikli diş macunu, kortikosteroid kullanımı tetikleyici
- Klasik "hassas cilt rutini" işe yaramaz → dermatolog yönlendirmesi

### "Karma sandım, aslında dehidre normal"

- T-bölgesi normal yağlı görünebilir
- Yanaklar dehidre olduğu için kuru hissi
- Tedavi: HA serum + dengeli krem (özel karma rutini gereksiz)

## Cilt Tipi + İhtiyaç Birleşimi

REVELA platformunda kullanıcı:
1. Cilt tipini belirler (5 seçenek)
2. İhtiyaçları seçer (24 ihtiyaç matrisi)
3. Hassasiyetleri tanımlar (parfüm alerji, atopik vb.)
4. **Kişisel uyumluluk skoru** her ürün için 0-100

## REVELA Cilt Analiz Quizi

Sitemizde **/cilt-analizi** sayfasında 4 dakikalık quiz:
- 12 soru (cilt + yaşam tarzı + hassasiyet)
- AI öneri motoru
- Kişiselleştirilmiş ürün listesi
- 30 günlük takip mail desteği

## Ne Zaman Dermatologa?

- Cilt tipi tanısında kararsız 3+ ay
- Belirli aktivelere persistent reaksiyon
- Lokalize sorunlar (rosacea, perioral, perinazal)
- Genetik atopik geçmiş + aktif şikayet
- Hormonal akne kontrol altında değil

## Kaynaklar

- Baumann L. *Skin Type Solution* 2010 (Baumann skin type sınıflandırma)
- Blume-Peytavi U et al. *J Eur Acad Dermatol Venereol* 2016 (skin physiology)
- Endly DC & Miller RA. *J Clin Aesthet Dermatol* 2017 (dehydrated vs dry skin)
- AAD Skin Type Diagnosis Guidelines`,
  },

  {
    title: 'Eczacının Önereceği Top 10 Dermokozmetik Ürün: Bilim-Temelli Seçim',
    slug: '2026-04-30-dermokozmetik-top-10',
    content_type: 'guide',
    summary: 'Türkiye eczane segmentinde kanıt-temelli en çok önerilen 10 dermokozmetik ürün. La Roche-Posay, Vichy, Eucerin, Avene, Bioderma, ISDIN: hangisi hangi sorun için?',
    body_markdown: `## Dermokozmetik Nedir?

Dermokozmetik = **dermatolog/eczacı önerili** kozmetik ürünler. Genelde:
- Klinik test edilmiş
- AB SCCS uyumlu yüksek standart
- Hassas cilt formülasyonu
- Türkiye eczane kanalı dominant

Türkiye'de pazar payı yıllık **%25 büyüme** — en hızlı segment.

## Top 10 Bilim-Temelli Dermokozmetik

### 1. La Roche-Posay Effaclar Duo+

**Endikasyon:** akneye yatkın yağlı cilt, post-inflammatory hyperpigmentation
**Aktifler:** niacinamide + salicylic acid + glycolic acid + procerad (LRP patentli)
**Kullanım:** günde 2 kez, aylar boyunca
**Kanıt:** çoklu RCT (Marini 2014, Niren 2014)
**REVELA Skoru:** ~88/100

### 2. La Roche-Posay Lipikar AP+M

**Endikasyon:** atopik dermatit + ksiroz (kuru cilt)
**Aktifler:** niacinamide + shea butter + AquaPosae Filiformis prebiyotik
**Kullanım:** günde 1-2 kez, banyo sonrası
**Kanıt:** Seité 2017 (atopik dermatit pediatrik RCT)
**REVELA Skoru:** ~92/100

### 3. Vichy Mineral 89

**Endikasyon:** günlük nemlendirme + bariyer destek
**Aktifler:** Vichy Volcanic Water + Hyaluronic Acid + 15 mineral
**Kullanım:** sabah + akşam, serum öncesi
**Kanıt:** klinik test edildi, basit formül
**REVELA Skoru:** ~85/100

### 4. Eucerin AntiRedness Concealing Day Care

**Endikasyon:** rosacea, perioral dermatit, persistent kızarıklık
**Aktifler:** licochalcone-A + SymCalmin + UV filtreler (SPF 25)
**Kullanım:** sabah, makyaj altı
**Kanıt:** Kolbe 2006 (licochalcone-A RCT)
**REVELA Skoru:** ~87/100

### 5. Avene Tolerance Extreme Cream

**Endikasyon:** çok hassas cilt, post-prosedür, kortikosteroid sonrası bariyer
**Aktifler:** Avene Thermal Spring Water + minimum bileşen (8 INCI)
**Kullanım:** günde 1-2 kez
**Kanıt:** Chiriac 2018 (post-prosedür RCT)
**REVELA Skoru:** ~89/100

### 6. Bioderma Sébium Hydra

**Endikasyon:** akneye yatkın + dehidre cilt (ilaç sonrası)
**Aktifler:** Fluidactiv + glycerin + niacinamide
**Kullanım:** günde 2 kez
**Kanıt:** Bioderma klinik dosyası
**REVELA Skoru:** ~83/100

### 7. La Roche-Posay Anthelios UVMune 400

**Endikasyon:** günlük geniş spektrum SPF (UVA + UVB + UVA Long)
**Aktifler:** Mexoryl 400 + Tinosorb S + diğer filtreler
**Kullanım:** sabah, 1.25 ml yüze, 2 saatte yenile
**Kanıt:** SCCS dossier + LRP klinik
**REVELA Skoru:** ~91/100 (premium sunscreen)

### 8. ISDIN Fusion Water

**Endikasyon:** yağlı/karma cilt SPF + makyaj altı
**Aktifler:** Tinosorb S + Tinosorb M + Uvinul T 150 (mineral + kimyasal hibrit)
**Kullanım:** sabah, son adım, hafif su benzeri
**Kanıt:** ISDIN klinik
**REVELA Skoru:** ~89/100

### 9. SkinCeuticals C E Ferulic

**Endikasyon:** anti-aging + foto-koruma adjuvanı
**Aktifler:** L-ascorbic acid 15% + tocopherol 1% + ferulic acid 0.5%
**Kullanım:** sabah, SPF altı
**Kanıt:** Lin 2003 (foto-koruma RCT, gold standard)
**REVELA Skoru:** ~94/100 (premium klinik)

### 10. Avene Cicalfate+ Restorative Cream

**Endikasyon:** post-prosedür, yara iyileşmesi, atopik dermatit
**Aktifler:** Cicalfate complex + niacinamide + sucralfate
**Kullanım:** lokalize, günde 2-3 kez
**Kanıt:** Mahé 2019 (post-laser RCT)
**REVELA Skoru:** ~90/100

## Eczacı Tavsiyesinde 5 Soru

Eczacıya gittiğinde sormalısın:

1. **"Bu ürünün ana aktifi ne ve ne kadar etkin konsantrasyonda?"**
2. **"Hangi cilt tipine uygun?"**
3. **"Yan etki olarak en yaygın ne?"**
4. **"Ne zaman sonuç beklemeliyim?"**
5. **"Daha ucuz alternatif var mı?"** (genelde var)

## Hangi Sorun → Hangi Ürün

| Sorun | İlk Tercih | İkinci Tercih |
|-------|------------|---------------|
| Akne (orta) | LRP Effaclar Duo+ | Bioderma Sebium Pore Refiner |
| Atopik dermatit | LRP Lipikar AP+M | Eucerin AtopiControl |
| Rosacea | Eucerin AntiRedness | Avene Antirougeurs |
| Hassas + bariyer | Avene Tolerance Extreme | LRP Toleriane Sensitive |
| Kuru cilt | LRP Lipikar | CeraVe Moisturizing Cream |
| Anti-aging başlangıç | Vichy LiftActiv | Eucerin Hyaluron-Filler |
| SPF günlük | LRP Anthelios UVMune | ISDIN Fusion Water |
| Vitamin C anti-aging | SkinCeuticals C E Ferulic | The Ordinary Vitamin C Suspension 23% |
| Post-prosedür | Avene Cicalfate+ | LRP Cicaplast Baume B5 |
| Bebek bakımı | LRP Lipikar Baby | Bepanthen Baby |

## Pahalı vs Bütçe Karşılaştırması

| Premium | Bütçe Alternatif | Etkinlik Farkı |
|---------|-----------------|----------------|
| SkinCeuticals C E Ferulic ($170) | The Ordinary Vit C Suspension 23% ($7) | Marjinal (formülasyon farkı) |
| LRP Anthelios ($35) | Garnier Ambre Solaire ($10) | UVA koruma farkı (premium iyi) |
| Eucerin AntiRedness ($25) | Bioderma Sensibio AR ($20) | Kıyas eşit |
| Avene Cicalfate+ ($25) | Bepanthen ($8) | Aktif madde farkı (cicalfate complex) |

> **Genel kural:** dermokozmetikte fiyat formülasyon kalitesi ile alakalı, ama ucuz alternatifler de işlevsel. **Konsantrasyon + pH + bileşen profili** önemli.

## Türkiye Eczane Pazarı

- **Top 5 dermokozmetik marka:** La Roche-Posay, Eucerin, Bioderma, Vichy, Avene
- **Yükselen:** ISDIN, SVR, Caudalie
- **Bütçe segmenti:** CeraVe (USA orijin, eczane kanalına geçti)

## REVELA + Dermokozmetik

REVELA platformunda her dermokozmetik ürün:
- Tam INCI dökümü
- 7 boyut REVELA Skoru
- Kişisel uyumluluk hesabı
- Affiliate fiyat karşılaştırma (Trendyol, HB, eczanesi)

## Kaynaklar

- Marini A et al. *Acta Derm Venereol* 2014 (LRP Effaclar)
- Lin F et al. *J Invest Dermatol* 2003 (CE Ferulic)
- Kolbe L et al. *Skin Pharmacol Physiol* 2006 (Eucerin AntiRedness)
- Seité S et al. *Pediatr Dermatol* 2017 (LRP Lipikar AP)
- Türkiye Eczacılar Birliği — dermokozmetik raporu 2024`,
  },

  {
    title: 'Cilt Mikrobiyomu 2026: Probiyotik, Prebiyotik, Postbiyotik Aktifler',
    slug: '2026-04-30-cilt-mikrobiyomu-probiyotik',
    content_type: 'news',
    summary: 'Cilt yüzeyinde 1000+ bakteri türü yaşar. Probiyotik (canlı bakteri), prebiyotik (besin), postbiyotik (metabolit) aktifler. 2026 yeni nesil mikrobiyom kozmetiğinin bilim-temelli analizi.',
    body_markdown: `## Cilt Mikrobiyomu Nedir?

Cilt yüzeyinde **1000+ farklı bakteri, mantar, virüs türü** simbiyotik yaşar. Toplam mikroorganizma sayısı vücut hücrelerinden **10 kat fazla**.

Sağlıklı mikrobiyom = sağlıklı cilt:
- Bariyer fonksiyonu desteği
- Patojen bakteri (S. aureus, P. acnes pathogenik suşları) kontrolü
- Lokal immün sistem dengeleme
- Cilt pH'ı (5.0-5.5) korunması

Mikrobiyom dengesizliği (dysbiosis) → akne, atopik dermatit, rosacea, perioral dermatit.

## Mikrobiyom Aktiflerinin 3 Kategori

### 1. Probiyotik (Canlı Bakteri)

**Mekanizma:** canlı bakteri suşları cilt üzerinde **kolonize** olur (sınırlı), patojen bakteri ile rekabet eder.

**Aktifler:**
- *Lactobacillus* türleri
- *Bifidobacterium* türleri
- *Streptococcus thermophilus*

**Sınırlama:** kozmetik formülasyonda canlı bakteri **stabil tutmak zor**:
- Soğuk zincir gerek
- Koruyucu sistem öldürür
- Raf ömrü kısa

**Modern formülasyon:** liyofilize (donmuş kuru) bakteri pellet'leri ürün içinde saklanır, kullanıcı uygulamada karıştırır.

### 2. Prebiyotik (Bakteri Besini)

**Mekanizma:** mevcut sağlıklı bakterileri **besler**, çoğalmasını destekler.

**Aktifler:**
- **Inulin** (kompleks polisakarit, bitki kaynaklı)
- **Fructooligosaccharides (FOS)**
- **Galactooligosaccharides (GOS)**
- **Beta-glucan** (yulaf, mantar kaynaklı)
- **Alpha-glucan oligosaccharides**

**Avantaj:** stabil + raf ömrü uzun + formülasyon-uyumlu.

**Klinik kanıt:** Glatz 2018 — alpha-glucan oligosakkarit, atopik dermatit S. aureus baskılaması (J Am Acad Dermatol).

### 3. Postbiyotik (Bakteri Metabolitleri)

**Mekanizma:** bakteri ferment metabolitleri (canlı bakteri **olmadan** etki).

**Aktifler:**
- **Lactobacillus Ferment Lysate** → cilt mikrobiyomu dengeleyici
- **Bifida Ferment Lysate** → bariyer destekçi (Guéniche 2010 RCT)
- **Galactomyces Ferment Filtrate (Pitera)** → SK-II ana aktifi
- **Saccharomyces Ferment Filtrate** → maya türevi
- **Lactic Acid + Acetic Acid (postbiyotik metabolitleri)** → pH dengeleyici

**Avantaj:** stabil + güvenlik profili çok yüksek + klinik kanıt artıyor.

## Pazar Trendi 2026

### Yükselen Markalar

- **La Roche-Posay**: Aqua Posae Filiformis (Vitreoscilla filiformis ferment) — bariyer destekçi
- **Mother Dirt** (USA): canlı *Nitrosomonas eutropha* — niş pazar
- **Aurelia London**: probiyotik premium
- **TULA Skincare** (USA): probiyotik + post-biyotik kombinasyonu

### Türkiye Pazarında

- **The Ordinary** Lactic Acid (zayıf prebiyotik etki)
- **Some By Mi** Galactomyces Snail Essence (postbiyotik)
- **CosRX** Galactomyces 95 Tone Balancing Essence
- **REVOLUTION** Probiyotik Mask (bütçe)

## Mikrobiyom Aktivasyon Stratejileri

### Bariyer + Mikrobiyom Yaklaşımı

1. **Yumuşak cleanser** (yüksek pH yıkayıcı = mikrobiyom hasarı)
2. **Postbiyotik ferment serum** (Galaktomis veya Bifida ferment)
3. **Prebiyotik krem** (inulin, beta-glucan)
4. **Bariyer destekçi** (ceramide + niasinamid)

### Akne + Mikrobiyom Yaklaşımı

1. Hafif salisilik (BHA) — patojen bakteri kontrol (cilt mikrobiyomunu dramatik bozmaz)
2. **Lactobacillus ferment** post-biyotik (P. acnes pathogenik suşları baskılar)
3. Niasinamid + çinko PCA (mikrobiyom-uyumlu sebum kontrolü)
4. **Antibakteriyel agresif KAÇIN**: triclosan, alkol bazlı agresif yıkayıcı

### Atopik Dermatit + Mikrobiyom

1. *S. aureus* aşırı kolonizasyonu kontrol → **prebiyotik (alpha-glucan)** uygun
2. Bifida + Lactobacillus ferment (klinik kanıt)
3. Ceramide + bariyer (mikrobiyom toparlanması paralel)
4. Topikal antibiyotik **son seçenek** (geniş spektrum mikrobiyomu çöker)

## "Mikrobiyom-Friendly" Ürün Etiketi

Pazar trendi 2025-2026'da bu etiket yaygınlaştı. Kontrol edilmesi gerekenler:

✅ **İyi mikrobiyom-uyumlu işaretler:**
- Yumuşak surfaktan (sülfat-free)
- pH 5.0-5.5
- Postbiyotik veya prebiyotik içerik
- Minimum koruyucu (paraben-free veya hassas grup)
- Parfümsüz

❌ **Mikrobiyom-bozucu işaretler:**
- Triklosan, triclocarban (antibakteriyel)
- Yüksek alkol (denat)
- Sodyum lauril sülfat (SLS)
- Yüksek pH yıkayıcı (sabun klasik)

## Bilimsel Sınırlamalar

### "Probiyotik kozmetik mucize değildir"

- Topikal probiyotik **ciltte kalıcı kolonize olmaz** (genelde 24-48 saat)
- Etki cilt mikrobiyomu dengeleyici **değil tedaviçi**
- Dysbiosis kronikse profesyonel müdahale gerekir

### Çoğu ürün kanıt seviyesi orta

- Probiyotik canlı bakteri: kanıt sınırlı
- Postbiyotik: orta-iyi kanıt (Galaktomis, Bifida)
- Prebiyotik: orta kanıt
- Buyuk RCT'ler henüz yetersiz

### Pazarlama vs Klinik Gerçek

"Probiotic skincare" yaygın iddia ama:
- Çoğu ürün canlı bakteri **içermiyor** (postbiyotik aslında)
- Etiket "probiotic" diyebilir ama formülde *Lactobacillus ferment* (postbiyotik) olur
- Tüketici farkındalığı düşük

## Gelecek 2027-2028 Beklentileri

- **Bakteriyofaj-temelli aktifler** (specific patojen kontrolü)
- **Sentetik biyoloji peptit + bakteri ekosistem**
- **Cilt mikrobiyomu kişiselleştirme** (16S rRNA test ile)
- **Prebiyotik + postbiyotik kombinasyon serisi** geniş yayılım
- **In situ probiyotik koşullandırma** (formülasyonda canlı tutma teknolojisi)

## REVELA + Mikrobiyom

REVELA platformunda mikrobiyom-uyumlu ürünleri **filtreleyebilirsin**:
- Sülfat-free arama
- pH bilgisi
- Postbiyotik içeriği
- Mikrobiyom-bozucu içerik flagı

## Kaynaklar

- Byrd AL et al. *Nat Rev Microbiol* 2018 (skin microbiome review)
- Glatz M et al. *J Am Acad Dermatol* 2018 (alpha-glucan + atopik)
- Guéniche A et al. *Br J Dermatol* 2010 (Bifidobacterium ferment)
- Yu Y et al. *Microorganisms* 2020 (skin microbiome cosmetics)
- Lee SH et al. *J Cosmet Dermatol* 2013 (Galactomyces RCT)`,
  },
];

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let inserted = 0;
for (const a of ARTICLES) {
  const r = await c.query(
    `INSERT INTO content_articles (title, slug, content_type, summary, body_markdown, status, published_at)
     VALUES ($1, $2, $3, $4, $5, 'published', NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       summary = EXCLUDED.summary,
       body_markdown = EXCLUDED.body_markdown,
       content_type = EXCLUDED.content_type,
       updated_at = NOW()
     RETURNING article_id, slug, LENGTH(body_markdown) AS len`,
    [a.title, a.slug, a.content_type, a.summary, a.body_markdown]
  );
  const row = r.rows[0];
  console.log(`✓ id=${row.article_id} | ${row.slug} | ${row.len} char`);
  inserted++;
}

console.log(`\nToplam yazılan: ${inserted}/${ARTICLES.length}`);

const total = await c.query(`SELECT COUNT(*) FROM content_articles WHERE status='published'`);
console.log(`content_articles toplam published: ${total.rows[0].count}`);

await c.end();
