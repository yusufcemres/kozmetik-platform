// Articles batch 6 — 5 yeni pratik rehber. 75 → 80 published
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ARTICLES = [
  {
    title: 'Yağlı Cilt İçin Tam Rutin: Sebum Kontrolü, Por Görünümü, Akne Önleme',
    slug: '2026-04-30-yagli-cilt-tam-rutin',
    content_type: 'guide',
    summary: 'Yağlı cilt biyolojisi, sebum kontrol aktiflerinin (niasinamid, çinko PCA, salisilik) etki mekanizması, 12 haftalık yağ dengesi rutini. Yanlış stratejiler ve doğru yaklaşımlar.',
    body_markdown: `## Yağlı Cilt = Aktif Sebase Bezleri

Yağlı cilt sebase bez aktivitesinin yüksek olmasından kaynaklanır. Hormonal (androjenik), genetik ve çevresel faktörlerin birleşimi. Tedavi sebumu **azaltmak değil, dengelemek** üzerine kuruludur.

## Yağlı Cilt Aktifleri

### Niasinamid (B3 Vitamini) — Ana Aktör

- Sebum üretimini regüle eder (Bissett 2005)
- Por görünümünü azaltır (4-12 hafta)
- Akneye yatkın ciltte tolere edilir
- **%5 günlük** klinik kanıtlı

### Çinko PCA / Çinko Glukonat

- Topikal çinko 5-alfa-redüktaz enzim aktivitesini baskılar (sebum üretimi azalır)
- Anti-mikrobiyal P. acnes etkisi
- **%2-3 günlük formülasyon**

### Salisilik Asit (BHA)

- Lipofilik — gözenek içine penetre olur
- Komedolitik + sebum kontrolü
- **%2 toner haftada 5-7 gece** (tolerans gelişince)

### Retinoidler

- Hücre yenilenmesini hızlandırır
- Sebase bez aktivitesini azaltır
- Adapalene reçeteli ya da retinol %0.5+ ev kullanımı

## 12 Haftalık Rutin

### Hafta 1-4: Temel + Sebum Kontrolü

**Sabah:**
- Sülfat-free cleanser
- Niasinamid %5
- Hafif jel nemlendirici (yağsız)
- SPF mineral (mat finish)

**Akşam:**
- Cleanser
- BHA toner haftada 3 gece
- Niasinamid
- Hafif nemlendirici

### Hafta 5-8: Aktif Yoğunlaştırma

**Sabah:** aynı

**Akşam:**
- Cleanser
- Aktif rotasyonu (skin cycling protokolü):
  - Gece 1: BHA
  - Gece 2: Retinol
  - Gece 3-4: Dinlenme

### Hafta 9-12: Stabilize

- Sebum dengesi yerleşir
- Por görünümü iyileşir
- Akne lezyonları azalır
- **Bu rutin kalıcı + sürdürülebilir**

## Yaygın Yanlışlar

❌ **"Yağ kuruyalım, sebum çekelim"** — agresif kuruma → ters etki, sebum üretimi artar
❌ **Saf alkol bazlı toner** — bariyer hasarı, paradoksen yağlanma
❌ **Sülfat sabun + sıcak su** — bariyer çöker
❌ **Yağ-free her ürün** — bazı yağlar (squalane, jojoba) sebum dengeleyici
❌ **Mat pudra kalın katman** — gözenek tıkanır

## Doğru Yaklaşımlar

✅ Yumuşak cleanser (pH 5.5)
✅ Yağsız değil, **doğru yağ** (squalane, jojoba — sebum benzeri non-comedogenic)
✅ Niasinamid + çinko + salisilik kombinasyonu
✅ Mineral SPF (mat formülasyon)
✅ Haftada 1-2 kil maskesi (kaolin, bentonit) — kontrollü sebum kontrolü

## Yağlı Cilde Uygun Olmayan İçerikler

❌ **Kaçının:**
- Saf hindistan cevizi yağı (komedojenik 4/5)
- Kakao butter (4/5)
- Wheat germ oil (5/5)
- Yüksek oleik yağlar (kanola, aspir)

✅ **Tercih edin:**
- Squalane (0/5)
- Jojoba (0/5)
- Hyaluronik asit
- Caprylic/Capric Triglyceride (1/5)

## Hormonal Akne — Dermatolog Ne Zaman?

- 12 hafta tedaviye yanıtsız
- Çene + jaw line lokalize akne (hormonal işaret)
- Menstural döngüye bağlı flare
- PCOS şüphesi

→ Reçeteli adapalene, oral kontraseptif değerlendirmesi, spironolactone (sınırlı).

## Kaynaklar

- Bissett DL et al. *Dermatol Surg* 2005 (niasinamid)
- Draelos ZD et al. *Cutis* 2006 (niasinamid + çinko)
- Babamiri K. *J Drugs Dermatol* 2010 (salisilik)
- AAD Acne Guidelines 2024`,
  },

  {
    title: 'Kuru Cilt İçin Bariyer Onarım Protokolü: 8 Hafta',
    slug: '2026-04-30-kuru-cilt-bariyer-onarim',
    content_type: 'guide',
    summary: 'Kuru cilt vs dehidre cilt farkı, stratum corneum bariyer biyolojisi, ceramide/kolesterol/yağ asit trio, retinol/AHA tolerans yeniden kurma protokolü. 8 haftalık iyileşme planı.',
    body_markdown: `## Kuru Cilt vs Dehidre Cilt

İki farklı durum, farklı çözümler:

| Özellik | Kuru Cilt | Dehidre Cilt |
|---------|-----------|--------------|
| Tip | Sebace bez aktivitesi düşük | Su içeriği düşük |
| Süreklilik | Genetik / yaşam boyu | Geçici / mevsimsel |
| Belirti | Pul, çatlak, çekme | Sıkışma, ince çizgi |
| Tedavi | Lipid (yağ, ceramide) | Humektant (HA, glycerin) |

> Çoğu kişi her ikisini birlikte yaşar — bariyer protokolü ikisini de hedefler.

## Bariyer Lipid Trio (Man 1996 Standardı)

Stratum corneum lipidleri:
- **%50 Seramid** (NP, AP, EOP, NS)
- **%25 Kolesterol**
- **%15 Serbest yağ asidi** (linoleik, oleik, stearik)

**1:1:1 oranında** topikal uygulama bariyer onarımı altın standardıdır.

## 8 Haftalık Onarım Protokolü

### Hafta 1-2: Aktif Tatil + Bariyer Resetleme

**Tüm aktifleri durdur:**
- ❌ Retinol, AHA, BHA, C vit
- ❌ Yüksek alkol içeren toner
- ❌ Sülfat içerikli cleanser
- ❌ Esansiyel yağ + parfüm

**Sadece:**
- Yumuşak cleanser (Cetaphil, La Roche-Posay Toleriane)
- Hyaluronik asit + niasinamid serum (nemli cilde)
- Ceramide + kolesterol kremi (yoğun katman)
- Squalane oklusiv (üst kapak)
- Mineral SPF

### Hafta 3-4: Bariyer Stabilize

Hala aktiflerden uzak. Aynı rutin + ek:
- Üre %5-10 kremi (haftada 1-2 vücut için, yüze gerekirse)
- Kolloidal yulaf nemlendirici (özellikle hassas + atopik)

**TEWL ölçümü** (klinik test): bu süreçte %30-40 azalma normal.

### Hafta 5-6: Aktif Yumuşak Geri Dönüş

- **Bakuchiol %0.5-1** geceleri (retinole alternatif başlangıç)
- **PHA toner** (haftada 2-3, AHA'dan yumuşak)
- Bariyer kremi devam

### Hafta 7-8: Tolerans Test

- Retinol %0.3 başlangıç (haftada 2 gece, tolerans gelişince artırma)
- AHA %5-10 (haftada 1-2 gece)
- Sandwich method: nemlendirici → aktif → nemlendirici

## Bariyer Hasarı Belirtileri

- Çekme + sıkışma hissi
- Pul pul soyulma
- Ürün uygulamada batma + yanma
- Daha önce tolere edilen aktif şimdi tahriş yapıyor
- Lokalize kızarıklık + kuruluk
- Atopik dermatit alevlenmesi

## Doğru Bariyer Aktifleri

✅ **Trio:**
- Ceramide NP/AP/EOP
- Kolesterol
- Linoleik asit

✅ **Humektant:**
- Hyaluronik asit (multi-MA)
- Glycerin
- Sodium PCA
- Ektoin

✅ **Yatıştırıcı:**
- Niasinamid
- Centella asiatica
- Panthenol
- Allantoin
- Madekassosid

✅ **Oklusiv (üst kapak):**
- Squalane
- Shea butter
- Petrolatum
- Caprylic/Capric Triglyceride

## Bariyer İçin Marka Önerileri

- **CeraVe Moisturizing Cream** — temel bariyer (ceramide + niasinamid)
- **La Roche-Posay Lipikar AP+** — atopik bariyer
- **Eucerin Atopikontrol** — licochalcone-A + ceramide
- **The Inkey List Ceramide Cleanser** — bütçe ceramide
- **Skinceuticals Triple Lipid 2:4:2** — premium klinik

## Kaynaklar

- Man MQ et al. *J Invest Dermatol* 1996 (1:1:1 trio)
- Spada F et al. *Dermatol Ther* 2018 (ceramide RCT)
- Lin TK et al. *Int J Mol Sci* 2018 (atopik bariyer)`,
  },

  {
    title: 'Erkek Cilt Bakımı 101: 5 Adımlık Minimum Etkili Rutin',
    slug: '2026-04-30-erkek-cilt-bakimi-5-adim',
    content_type: 'guide',
    summary: 'Erkek cilt biyolojisi (kalın stratum corneum, yüksek sebum), traş sonrası bakım, anti-aging başlangıç. 5 adımlık minimum etkili rutin — fazla ürün yorgunluğunu yenmek için.',
    body_markdown: `## Erkek Cildi Erişkin Kadın Cildinden Farklı

- **%20-25 daha kalın stratum corneum** — aktiflerin penetrasyonu için biraz daha yüksek konsantrasyon gerek
- **%50+ daha yüksek sebum** — gözenek görünümü, akneye yatkınlık
- **Testosteron etkisi** — sebum bezlerini büyütür
- **Daily traş** — yüzey iritasyon + folikül iltihabı (folikülit)

Tedavi yaklaşımı: **basitlik + tutarlılık**. Erkek-spesifik ürün gerek yok; "basitleştirilmiş rutin" yeterli.

## 5 Adımlık Minimum Etkili Rutin

### 1. Cleanser (Sabah + Akşam)

- pH 5-6, sülfat-free veya yumuşak surfaktan
- Yağlı cilt: BHA içerikli (Salisilic 1-2%)
- Hassas cilt: glikol bazlı

**Önerilen:** CeraVe Foaming, La Roche-Posay Effaclar, Bioderma Sébium

### 2. Aktif Serum (Akşam, ortalama)

- **Yağlı / akneye yatkın:** %5 niasinamid + %2 BHA gece rotasyonu
- **Anti-aging:** retinol %0.3-0.5
- **Pigmentasyon (post-akne):** alpha-arbutin %2 + niasinamid

### 3. Nemlendirici (Sabah + Akşam)

- Hafif jel formülasyonu (yağlı cilt) veya
- Krem (kuru cilt)
- İçerik: hyaluronik + ceramide + niasinamid

**Önerilen:** Vichy Mineral 89, La Roche-Posay Hyalu B5, CeraVe PM Lotion

### 4. SPF (Sabah, Her Gün)

- **Mineral veya kimyasal melezi**
- Mat finish (yağlı cilt için)
- SPF 30+

**Önerilen:** La Roche-Posay Anthelios UVMune 400, Bioderma Photoderm Mat, ISDIN Fusion Water

### 5. Traş Sonrası Bakım (Aktif Traş Eden)

- **Alkol-free aftershave** (etanol değil — yağ alkolü)
- Niasinamid + panthenol kombinasyonu (yatıştırıcı)
- Veya: hyaluronik + centella post-traş serum

## Yaygın Erkek Cilt Sorunları

### Yüzey Akne (Şirin Akne)

- Çene + kollar + sırt
- Tedavi: niasinamid + BHA + retinol (gece skin cycling)
- 12 hafta yanıt yoksa → dermatolog adapalene/oral

### Folikülit (İçe Doğru Kıvrılan Sakal)

- Sıkı sakal + kıvırcık saç tipinde yaygın
- Tedavi:
  - Traş öncesi sıcak kompres + yumuşatıcı yağ
  - Tek-yön traş (ters yön YASAK)
  - Salisilik %2 toner traş sonrası
  - Retinoid topikal (gece) — kılı yumuşatır

### Erken Yaşlanma (UV Hasarı)

- Erkekler dış mekanda daha çok zaman geçirir → fotodamage daha hızlı
- Tedavi:
  - **Günlük SPF 30+ MUTLAKA**
  - Retinol %0.5-1 gece (4-8 hafta tolerans sonrası)
  - Antioksidan serum (C vit + E vit)

### Kepek + Saç Derisi

- Malassezia yoğun → seborrheic dermatit
- Tedavi:
  - Ketokonazol %2 şampuan (haftada 2)
  - Selenium sülfid alternatif
  - Çay ağacı yağı şampuan (hafif vakalar)

## "Erkek Ürünü" vs Genel Ürün

❌ "Men's" pazarlanan ürünler genellikle **agresif** (alkol, parfüm, mentol)
✅ Genel hassas cilt formüller daha uygun
✅ Markaya göre değil, **içeriğe** göre seç

## Ne Zaman Dermatologa?

- 12 hafta rutine yanıtsız akne
- Saç dökülmesi (saç çıkışı genetik vs hormonal)
- Şüpheli leke (renk değişimi, asimetri, sınır net olmayan)
- Folikülit kronik
- Atopik dermatit alevlenme

## Kaynaklar

- AAD Men's Skincare Guidelines
- Bouloc A et al. *Br J Dermatol* 2014 (erkek cilt biyolojisi)
- Hayashi N et al. *J Dermatol* 2008 (acne guidelines)`,
  },

  {
    title: 'Yaşa Göre Cilt Bakımı: 20\'li, 30\'lu, 40\'lı, 50+ Yaşlar İçin Rutin',
    slug: '2026-04-30-yasa-gore-cilt-bakimi',
    content_type: 'guide',
    summary: '20-30-40-50+ yaş gruplarında biyolojik değişimler, öncelikli aktifler, önleme vs tedavi yaklaşımları. Her dekat için minimum etkili rutin.',
    body_markdown: `## Yaşla Cilt Nasıl Değişir?

Cilt yaşlanması iki ana yol:

- **İntrinsik yaşlanma:** genetik + hormonal — kollajen kaybı yıllık %1
- **Ekstrinsik yaşlanma:** UV + hava kirliliği + sigara — yüzdelik %80-90

İyi haber: **ekstrinsik yaşlanma ÖNLENEBİLİR** — günlük SPF + antioksidan + bariyer.

## 20\'li Yaşlar — "Önleme + Akne"

### Biyolojik Durum

- Sebum yüksek
- Akne hâlâ aktif olabilir
- Kolajen sentezi optimal (henüz kaybetmiyorsun)
- UV hasarı birikmeye başlıyor

### Öncelikler

1. **Akne tedavisi** (varsa, dermatolog yönlendirme)
2. **GÜNLÜK SPF** — bu dekattaki tek anti-aging stratejisi
3. Niasinamid (sebum + por + bariyer)
4. Hyaluronik asit (nemli cilt = sağlam bariyer)

### Minimum Rutin

- Sabah: Cleanser → Niasinamid → SPF
- Akşam: Cleanser → Niasinamid → Nemlendirici

> Bu yaşta **anti-aging serum almak gerekmiyor** — SPF tek başına %80 koruma.

### Hatalar

❌ Anti-aging serumlarına aşırı para
❌ SPF unutmak
❌ Yatak gözenektikten kalkmadan yıkamadan uyumak (özellikle makyaj sonrası)

## 30\'lu Yaşlar — "Önleme + Hafif Tedavi"

### Biyolojik Durum

- İlk ince çizgiler (göz çevresi)
- Sebum azalmaya başlar (35+ yaşta)
- Hormon değişiklikleri (gebelik sonrası melasma, perimenopoz)
- UV hasarı görünür hale gelir

### Öncelikler

1. SPF zorunlu (dekat boyunca)
2. **Retinol veya bakuchiol başlangıç** (gece)
3. Antioksidan serum (sabah C vit veya yeşil çay)
4. Hyaluronik + niasinamid bariyer

### Minimum Rutin

- Sabah: Cleanser → C vit → Niasinamid → Nemlendirici → SPF
- Akşam: Cleanser → Retinol/Bakuchiol gece 3-4 → Nemlendirici (bariyer kremi)

### Bu Dekat Aktifler

- Retinol %0.3-0.5 (başlangıç)
- C vit %10-15 (askorbik asit veya türevleri)
- Hyaluronik multi-MA
- Niasinamid %5

## 40\'lı Yaşlar — "Aktif Tedavi"

### Biyolojik Durum

- Görünür kıvrımlar (alın, glabella, periorbital)
- Sebum belirgin azalır → kuruluk hissi
- Cilt elasticitesi kaybı
- Perimenopoz (kadın) → hormonal kaynaklı melasma + akne flare

### Öncelikler

1. **Retinol konsantrasyonu yükseltme** (%0.5-1)
2. **Peptit + büyüme faktörü** (kollajen sentezi)
3. SPF + iron oxide (visible light koruma)
4. Bariyer kremi (kuruluk arttı)

### Bu Dekat Aktifler

- Retinol %0.5-1 (gece, skin cycling)
- Peptit (Matrixyl, GHK-Cu)
- Bakuchiol kombo (retinole alternatif gün)
- C vit + E vit antioksidan
- Iron oxide içeren SPF

### Minimum Rutin

- Sabah: Cleanser → C vit + E vit → Peptit serum → Nemlendirici → SPF (iron oxide içerikli)
- Akşam: Cleanser → Retinol gece 3-4 (skin cycling) → Peptit + ceramide krem → Squalane

## 50+ Yaşlar — "Onarım + Konfor"

### Biyolojik Durum

- Menopoz sonrası östrojen kaybı → kollajen %30 azalma 5 yılda
- Bariyer fonksiyonu zayıflar
- Cilt incelmesi (atrofi)
- Pigmentasyon değişiklikleri (lentigo, cherry angioma)

### Öncelikler

1. **Bariyer + nemlendirme** (kuruluk dominant)
2. **Tretinoin reçeteli** (retinol yetmez bu yaşta) — dermatolog
3. Estrojen-mimic peptit (resveratrol, soy izoflavon)
4. Profesyonel prosedür (lazer, mikroakım, mezoterapi)

### Bu Dekat Aktifler

- Tretinoin %0.025-0.05 (reçeteli, gece)
- Yoğun nemlendirici (üre %10 + ceramide + skualan)
- Peptit GHK-Cu + Matrixyl 3000 kombo
- C vit %15-20 (sabah)
- Iron oxide SPF

### Minimum Rutin

- Sabah: Yumuşak cleanser → C vit %15 → Peptit → Yoğun nemlendirici → SPF
- Akşam: Yumuşak cleanser → Tretinoin gece 3-4 → Yoğun bariyer kremi → Squalane oklusiv

## Tüm Dekatlerde Sabit Aktif

| Aktif | 20 | 30 | 40 | 50+ |
|-------|-----|-----|-----|-----|
| **SPF Günlük** | ✅ | ✅ | ✅ | ✅ |
| Niasinamid | ✅ | ✅ | ✅ | ✅ |
| Hyaluronik | ✅ | ✅ | ✅ | ✅ |
| Ceramide | Optional | ✅ | ✅ | ✅ |
| Retinol/oid | — | Hafif | Orta | Reçeteli |
| C vit | Optional | ✅ | ✅ | ✅ |
| Peptit | — | Optional | ✅ | ✅ |

## Hatalar (Tüm Yaşlar)

❌ Yaşa göre "anti-aging" pahalı ürün almak — SPF her zaman daha etkili
❌ Aktif çoğaltma → bariyer hasarı
❌ Cilt tipi tanımayı atlamak
❌ Profesyonel prosedüre erken başlamak (40 öncesi prevent > treat)

## Kaynaklar

- Kligman AM. *J Am Acad Dermatol* 1986 (intrinsic vs extrinsic aging)
- Farage MA et al. *Int J Cosmet Sci* 2008 (skin aging review)
- Mukherjee S et al. *Clin Interv Aging* 2006 (retinol)
- AAD Anti-Aging Guidelines 2024`,
  },

  {
    title: 'Sezonluk Cilt Bakımı: Yaz, Sonbahar, Kış, İlkbahar — Aktiflerin Mevsime Göre Adaptasyonu',
    slug: '2026-04-30-mevsimsel-cilt-bakimi',
    content_type: 'guide',
    summary: 'Mevsim değişimlerinde rutininiz nasıl uyarlanmalı? Yaz ısı + UV, kış kuruluk + bariyer, sonbahar geçiş. Her mevsim için aktif öncelikleri ve formülasyon değişiklikleri.',
    body_markdown: `## Cilt Mevsimle Değişir

Stratum corneum su içeriği yazın %15+ artar, kışın %10 düşer. Bu fark **rutin değişikliği zorunlu** kılar.

## Yaz (Haziran-Ağustos)

### Cilt Durumu

- Yüksek sebum üretimi (sıcak + nem)
- UV maruziyeti maksimum
- Terleme + bakteriyel akne riski
- Hyperpigmentasyon flare (melasma yaz aylarında kötüleşir)

### Yaz Öncelikleri

1. **SPF 50+ HER GÜN, 2 saatte yenileme** — yazın 1 numaralı aktif
2. Hafif jel formülasyonlar (krem değil)
3. Anti-pigmentasyon aktifler
4. Antioksidan (UV koruma destekçi)

### Yaz Aktifleri

✅ **Tercih:**
- C vit %10-15 (sabah, antioksidan + UV adjuvan)
- Niasinamid %5 (sebum + tonal)
- Salisilik %2 BHA (sebum + akne)
- Alpha-arbutin (anti-pigmentasyon)
- Hafif HA serum

❌ **Kaçın (yaz aktifi olarak):**
- Yoğun krem (mat formülasyona geç)
- Çok yağlı oklusiv (yüzde — vücut için ok)
- Kimyasal SPF tek başına (mineral + kimyasal kombo daha güvenli)

### Yaz Rutini

- Sabah: Yumuşak cleanser → C vit → Niasinamid → Hafif jel → **SPF mineral 50+**
- Akşam: Çift temizlik (oil cleanser + foam) → BHA toner → Niasinamid → Hafif gel
- 2 saatte SPF yenile (özellikle deniz/havuz)

## Sonbahar (Eylül-Kasım)

### Cilt Durumu

- Yaz UV hasarı toparlanma
- Sebum dengesi düşmeye başlar
- Bariyer hassasiyeti hafif artar
- Mevsim geçiş alerjisi → atopik dermatit flare

### Sonbahar Öncelikleri

1. **Yaz hasarı onarımı** (anti-pigmentasyon yoğunlaştır)
2. Bariyer hazırlığı (kış öncesi)
3. Aktif konsantrasyonu artırabilirsin (UV az, tahriş eşiği daha yüksek)
4. **Retinol başlatma için ideal mevsim**

### Sonbahar Aktifleri

✅ **Tercih:**
- Retinol başlatma (sonbahar = ideal, çünkü UV az, tolerans gelişir kışa kadar)
- AHA toner haftada 2-3 (post-yaz exfoliyasyon)
- Lekek tedavisi yoğunlaştır (alpha-arbutin + traneksamik)
- C vit + E vit antioksidan

### Sonbahar Rutini

- Sabah: Cleanser → C vit + E vit → Niasinamid → Krem (yaz kremin orta nemlendirici) → SPF
- Akşam: Cleanser → Retinol gece 2-3 (skin cycling başlat) → Bariyer kremi

## Kış (Aralık-Şubat)

### Cilt Durumu

- **Kuruluk maksimum** — düşük rutubet + iç ısıtma
- Bariyer fonksiyonu zayıflar (TEWL artar)
- Atopik dermatit aktif flare
- Sebum üretimi yıllık minimum

### Kış Öncelikleri

1. **Bariyer onarım** — ceramide + kolesterol + yağ asit trio
2. Yoğun nemlendirme (humektant + emolyent + oklusiv)
3. Aktif konsantrasyonu **düşürebilirsin** (cilt zaten zorlanıyor)
4. SPF unutma — kar UV yansıması ekstra

### Kış Aktifleri

✅ **Tercih:**
- Hyaluronik asit + niacinamid (humektant kat)
- Ceramide + kolesterol (bariyer)
- Squalane veya shea butter (oklusiv)
- Retinol konsantrasyonu **düşür** (haftada 2 gece, sandwich method)
- AHA/BHA azalt (haftada 1-2)

❌ **Kaçın:**
- Yoğun AHA peeling (bariyer zaten hassas)
- Yüksek alkol içeren toner
- Çok sıcak su yıkama (TEWL fırlar)

### Kış Rutini

- Sabah: Yumuşak cleanser → Niasinamid + HA → Yoğun krem (ceramide) → Squalane → SPF
- Akşam: Yumuşak cleanser → Hafif aktif (retinol haftada 2) → Yoğun bariyer kremi → Oklusiv (shea/skualan)

### Kış İpuçları

- **Humidifier (oda nemlendirici):** %50-60 nem hedef
- **Sıcak su yerine ılık:** banyo süresi 5-10 dk
- **Anlık nemlendirici:** dudak balsam, el kremi (sürekli)

## İlkbahar (Mart-Mayıs)

### Cilt Durumu

- Kış kuruluğundan toparlanma
- Sebum üretimi artmaya başlar
- Polen + pollen alerjisi → cilt hassasiyeti
- UV maruziyeti artmaya başlar

### İlkbahar Öncelikleri

1. **Geçiş rutini** — kıştan yaza yumuşak adaptasyon
2. Aktifleri yeniden başlatma (kış sonrası)
3. SPF artırma (UVB güçleniyor)
4. Hafif eksfoliyasyon (kış birikmiş ölü hücre)

### İlkbahar Aktifleri

✅ **Tercih:**
- AHA toner artır (haftada 3-5)
- Retinol normal seviyeye geri (haftada 3-4)
- C vit aktif kullanımı yoğunlaştır
- Niasinamid + alpha-arbutin (yaz öncesi melasma önleme)
- Hafif krem nemlendirici (kış kreminden ince)

### İlkbahar Rutini

- Sabah: Cleanser → C vit → Niasinamid → Hafif krem → SPF (her gün artık)
- Akşam: Cleanser → AHA gece 1-2 + Retinol gece 2 → Bariyer kremi

## Sezonluk Geçiş Tüyoları

- **Mevsim geçişinde 1-2 hafta** rutini kademeli değiştir (ani değişim bariyer şokuna yol açar)
- **Mevsime göre yenisi alma**, mevcut ürünlerin **konsantrasyonu/sıklığı** değişir
- SPF her mevsim, **kış dahil**

## Iklim Bölgesine Göre

- **Akdeniz iklimi (yaz nemli):** yaz formülünü Mayıs-Eylül uzat
- **Karasal iklim (kış sert):** Kasım-Mart yoğun bariyer
- **Yağışlı iklim (Karadeniz):** sebum dengesi yıl boyu, hafif rutin
- **Şehir kirliliği yüksek:** antioksidan günlük (C vit + E vit + niasinamid)

## Kaynaklar

- Wei KS et al. *Int J Cosmet Sci* 2016 (mevsim TEWL değişimi)
- Engebretsen KA et al. *Br J Dermatol* 2016 (atopik dermatit + nem)
- Anderson R et al. *Photochem Photobiol* 2010 (UV mevsim varyasyonu)`,
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
