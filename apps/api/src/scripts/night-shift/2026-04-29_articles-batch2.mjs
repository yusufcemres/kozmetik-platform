/**
 * Faz D — Rehber makaleleri batch 2 (10 yeni makale, toplam 45 → 55).
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const ARTICLES = [
  {
    title: 'Sabah ve Akşam Cilt Bakımı: 4 Adımlık Temel Rutin',
    slug: '2026-04-29-sabah-aksam-temel-rutin',
    content_type: 'guide',
    summary: 'Cilt bakımına yeni başlıyorsanız ya da rutininizi sadeleştirmek istiyorsanız: 4 adım yeterli. Karmaşık 10-step gerekli değil.',
    body_markdown: `## Karmaşık Değil, Tutarlı

K-beauty 10 adımlı rutin uzun yıllar moda oldu, ama klinik kanıt **rutin tutarlılığının ürün sayısından daha önemli** olduğunu gösteriyor. 4 adım yeterli.

## SABAH (3-4 dk)

1. **Temizleme**: Hafif jel veya sadece ılık su (yağlı ciltte bile). Yüzü gece sürmüş ürünlerden arındır.
2. **Aktif Serum**: C vitamini (antioksidan + UV koruma destek) veya niasinamid (sebum + leke).
3. **Nemlendirici**: Hafif jel (yağlı) veya zengin krem (kuru). HA + ceramide içerikli tercih.
4. **SPF 50+**: Geniş spektrum (UVA + UVB). Mineral veya kimyasal — fark etmez, ama her gün şart.

## AKŞAM (5-6 dk)

1. **Çift Temizleme**: Makyaj/SPF varsa önce yağ bazlı (cleansing balm/oil), sonra su bazlı (jel temizleyici).
2. **Aktif Serum**: Retinol (anti-aging), salisilik asit (akne) veya bakuchiol (hassas alternatif). Sadece **bir** aktif gece, dönüşümlü.
3. **Nemlendirici**: Ceramide + peptit içerikli zengin krem.
4. **(Opsiyonel)** Yüz yağı veya sleeping mask — kuru cilt için.

## Aktif Sıralama Kuralı

**İnce → kalın** sıralı uygula:
- Sulu serum → jel → emülsiyon → krem → yağ → SPF

## "Bu Sırayı Uyamaya Üşenirim" Diyenler

3 dakikada da olur:
- **Sabah**: Temizleyici → SPF
- **Akşam**: Çift temizleme → Nemlendirici

Aktifleri haftada 2-3 gece eklerseniz fark görürsünüz. **Tutarlılık 30 günde fark; aktif olmadan da rutin > rutin yokluğu**.

## Tüyo: Marka Değil Bileşen
"X marka serum almalı mıyım?" sorusu yanlış. "Niasinamid var mı?" sorusu doğru. REVELA Skoru bu yüzden var: marka kalkanını kırar, formülün gerçeğini gösterir.

## Kaynaklar
- [American Academy of Dermatology — Skincare Routine](https://www.aad.org/public/everyday-care/skin-care-basics)
- [Cosmetic Ingredient Review](https://www.cir-safety.org/)`,
  },
  {
    title: 'Hangi Cilt Tipi Sensin? 5 Soruda Doğru Profil',
    slug: '2026-04-29-cilt-tipi-tanima',
    content_type: 'need_guide',
    summary: 'Yağlı, kuru, karma, hassas, normal — yanlış tip seçimi yanlış ürün demek. 5 dakikada doğru profil çıkar.',
    body_markdown: `## Yanlış Tip → Yanlış Bakım → Reaktif Cilt

Internet'te "ben kuru ciltliyim çünkü öyle hissediyor" yanılgısı yaygın. Klinik tip tanımı **sebum üretimi + bariyer durumu**'na göre yapılır.

## 5 Soruluk Test

### Soru 1: Sabah uyandığında yüzün nasıl?
- A) Yağlı/parlak (T-zone + yanak): **YAĞLI**
- B) Sadece T-zone yağlı, yanaklar normal/kuru: **KARMA**
- C) Tüm yüz mat ve gergin: **KURU**
- D) Tüm yüz dengeli, ne yağ ne gerginlik: **NORMAL**
- E) Kızarık, hassas, reaktif: **HASSAS**

### Soru 2: Yüzü yıkadıktan 30 dk sonra (nemlendirici sürmeden)?
- A) Tekrar yağlı: yağlı
- B) T-zone yağ, yanak gergin: karma
- C) Pul pul, çatlamış: kuru
- D) Rahat, mat: normal
- E) Yanma, kızarıklık: hassas

### Soru 3: Cilt gözenek görünümün?
- A) Belirgin, tüm yüzde: yağlı
- B) Sadece T-zone'da: karma
- C) Belirgin değil: kuru/normal
- D) Genelde rahatsızlık vermez: normal/hassas

### Soru 4: Sivilceyle ilişkin?
- A) Düzenli sivilce: yağlı (akneye yatkın)
- B) T-zone'da ara sıra: karma
- C) Nadiren: kuru/normal/hassas
- D) Pek olmaz: normal

### Soru 5: Yeni ürün denerken?
- A) Genelde tolere ediyor: yağlı/normal
- B) Bazen reaksiyon: karma
- C) Sıkça yanma/gerginlik: hassas/kuru bariyer hasarı

## Cilt Tipinin Aksine Cilt **Durumu**

Tip kalıcı (genetik); durum geçici:
- **Dehidre**: Yağlı cilt bile dehidre olabilir (su eksikliği — sebum farklı)
- **Reaktif**: Bariyer hasarı sonrası geçici (ürün yanlış kombin)
- **Yaşlanan**: Tüm tiplerde olabilir, kollajen kaybı

## Profil Sonucu → Ürün Seçimi

| Tip | Temizleyici | Nemlendirici | Aktif |
|-----|-------------|---------------|-------|
| Yağlı | Salisilik jel | Hafif jel HA | Niasinamid, BHA |
| Kuru | Krem cleansing | Zengin ceramide krem | HA, peptit, hafif retinol |
| Karma | Hafif jel | Bölgesel (T-jel, yanak-krem) | Niasinamid + HA |
| Hassas | Sülfat-free, parfümsüz | Centella, ceramide | Bakuchiol, allantoin |
| Normal | Hafif jel | Orta krem | Anti-aging, antioksidan |

## REVELA Cilt Profili
İhtiyaç + cilt tipi profilini tek seferde çıkarmak için: [Cilt Analizi Quiz](/cilt-analizi)

## Kaynaklar
- [DermNet NZ — Skin Types](https://dermnetnz.org/topics/skin-type)`,
  },
  {
    title: 'Niacinamide Hangi Konsantrasyonlarda Etkili?',
    slug: '2026-04-29-niacinamide-konsantrasyon',
    content_type: 'ingredient_explainer',
    summary: 'Niasinamid %2, %5, %10, %20 — hangi konsantrasyon ne işe yarar? Doz-cevap eğrisinde plato nerede?',
    body_markdown: `## Doz-Cevap Eğrisi

Niasinamid kanıt-temelli en iyi araştırılan kozmetik aktiflerinden biri. Klinik veriler net konsantrasyon eşikleri gösteriyor:

| Konsantrasyon | Hedef | Klinik Kanıt |
|---|---|---|
| **%2** | Bariyer destek | Hafif, NMF artışı |
| **%4-5** | Sebum + gözenek | Bissett 2005 — 8 hafta ölçülebilir |
| **%5-10** | Anti-pigmentasyon | Hakozaki 2002 — 12 hafta |
| **%10** | Anti-aging | Skinceuticals/Cosrx — pratik standart |
| **%15-20** | Ek fayda **YOK** | Doz-cevap plato — tahriş artar |

## Niasinamid Konsantrasyon Pazarlaması

The Ordinary, Cosrx, Inkey List gibi markalar **%10 niasinamid + %1 zinc** combo standart. %5'ten yukarısı klinik fayda küçük artar; %10'dan sonra plato.

## Tahriş Riski
**%5+ konsantrasyonu** bazı kişilerde:
- Niasinamid → niasinik aside hidrolize (asit yan ürün)
- pH<3.5 hidroliz hızlanır
- "Niacinamid yanması" reaktif cilt belirtisi

**Çözüm**: Düşük konsantrasyon başla (%2-5), tolerans gelişirse %10'a çık. Hassas cilt %5'i geçmez.

## Kombin Stratejileri

| Kombin | Sinerji |
|---|---|
| Niasinamid + Hyaluronik Asit | Nem + bariyer |
| Niasinamid + Retinol | Retinol tahrişini azaltır |
| Niasinamid + Vitamin C | **Modern formüllerde sorun YOK** (eski mit) |
| Niasinamid + Salicylic Acid | Akne + sebum |
| Niasinamid + Peptit | Anti-aging sinerji |

## "Niasinamid + C Vitamini Birbirini Nötrleştirir" Mit
Eski mit DIY karıştırma için doğruydu (saf forms pH çakışması). Modern stabilize formüllerde sorun yok.

## En İyi Markaları (klinik kanıt)

- The Ordinary Niacinamide 10% + Zinc 1%
- Paula's Choice 10% Niacinamide Booster
- Cosrx The Niacinamide 15% Serum
- SkinCeuticals Metacell Renewal B3

## Kaynaklar
- [Hakozaki et al. 2002 — J Cosmet Dermatol](https://pubmed.ncbi.nlm.nih.gov/17147561/)
- [Bissett et al. 2005 — Dermatol Surg](https://pubmed.ncbi.nlm.nih.gov/15875010/)`,
  },
  {
    title: 'Retinol vs Retinaldehit vs Tretinoin: Hangisi Sana?',
    slug: '2026-04-29-retinol-retinaldehit-tretinoin',
    content_type: 'comparison',
    summary: 'A vitamini türevleri arasında etki + tahriş hiyerarşisi. OTC retinol mu, reçeteli tretinoin mi? Hangi yaşta, hangi cilt tipinde?',
    body_markdown: `## A Vitamini Hiyerarşisi

Cilt enzimleri tüm A vitamini türevlerini sonunda **retinoik asit (RA)** üretir. RA çekirdek reseptörlere bağlanır → kollajen sentezi.

| Form | Aktif RA'ya Mesafe | Etki | Tahriş |
|---|---|---|---|
| **Retinil Palmitat** | 4 adım | En zayıf | Çok düşük |
| **Retinol** | 2 adım | Orta-yüksek | Orta |
| **Retinaldehit** | 1 adım | Yüksek | Düşük-orta |
| **Tretinoin (RA)** | 0 adım (saf) | En güçlü | Yüksek |
| **Adapalen** | Sentetik retinoid | Yüksek (akne) | Orta |

## Klinik Karşılaştırma

%0.05 tretinoin = %0.5 retinol = %0.1 retinaldehit (yaklaşık)

## Hangisini Seç?

### Retinol (OTC %0.025-1)
- ✅ Başlangıç (hiç A vit kullanmamış)
- ✅ Genel anti-aging
- ✅ Hassas cilt için %0.025-0.1
- ✅ Türkiye'de eczanesiz alınabilir

### Retinaldehit (%0.025-0.1)
- ✅ Retinol toleransı oluşmuş, ileri seviye istek
- ✅ Daha hızlı sonuç (RA'ya 1 adım)
- ✅ Hassas cilt için tretinoin alternatifi
- ❌ Daha pahalı, daha az ürün
- Markalar: Avène, La Roche-Posay, Medik8

### Tretinoin (Reçeteli)
- ✅ Akne, melasma, derin kırışık (35+ yaş)
- ✅ Klinik kanıt en yüksek
- ❌ Türkiye'de reçeteli (Retin-A, Acnetrent)
- ❌ Hamile + emziren YASAK
- ❌ İlk 2-4 hafta tahriş zorunlu

### Adapalen (OTC %0.1, %0.3 reçeteli)
- ✅ Akne en etkili (komedonal)
- ✅ Yaşlanma karşıtı orta düzey
- ✅ Tahriş düşük
- Türkiye markaları: Differin, Adaferin

### Bakuchiol (Doğal alternatif)
- ✅ Hassas + hamile + emziren
- ✅ Fotosensitif değil
- ⚠️ Etki retinolün ~%80'i (Dhaliwal 2018 RCT)

## Tolerans Geliştirme (Retinol)

| Hafta | Sıklık | Konsantrasyon |
|---|---|---|
| 1-2 | Gün aşırı | %0.025 |
| 3-4 | Her gece | %0.025-0.05 |
| 5-8 | Her gece | %0.1 |
| 9-12 | Her gece | %0.3 |
| 13+ | Her gece | %0.5+ veya retinaldehit'e geç |

## Yan Etki Yönetimi

### "Sandwich" Tekniği
1. Nemlendirici sür
2. 2 dk bekle
3. Retinol/retinoid sür
4. 2 dk bekle
5. Tekrar nemlendirici

Bu yöntem tahrişi %50-70 azaltır.

### "Buffer" Tekniği
Retinol + cremeyi avuçta karıştır → uygula. Daha hafif penetrasyon.

## Yan Aktif Kuralı
Retinol akşam → AHA/BHA aynı gece **YOK**, dönüşümlü kullan.
Retinol → SPF zorunlu.

## Kaynaklar
- [Mukherjee et al. 2006 — Clin Interv Aging](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2699641/)
- [Dhaliwal et al. 2018 — Br J Dermatol](https://doi.org/10.1111/bjd.16918)`,
  },
  {
    title: 'EU 26 Alerjen Listesi: Parfüm Bileşenlerinin Kara Listesi',
    slug: '2026-04-29-eu-26-allergen',
    content_type: 'label_reading',
    summary: 'AB regülasyonu kozmetik etiketlerinde belirtilmesi zorunlu 26 (yeni 80+) parfüm alerjeni. Hassas cildin için neden önemli?',
    body_markdown: `## AB Annex III — Alerjen Beyan Zorunluluğu

AB Cosmetics Regulation 1223/2009, parfümlü ürünlerde **belirli alerjen molekülleri** ayrı listelenmesi zorunluluğu getirdi.

## Eski 26 Liste (1999-2023)

| Alerjen | Yaygın Kaynak |
|---|---|
| **Linalool** | Lavanta, bergamot |
| **Limonene** | Citrus, kabuk yağları |
| **Citronellol** | Geranyum, gül |
| **Geraniol** | Gül, geraniyum |
| **Citral** | Limon, lemongrass |
| **Eugenol** | Karanfil |
| **Farnesol** | Çiçeksi notalar |
| **Benzyl Alcohol** | Çiçeksi (jasmine, ylang-ylang) |
| **Benzyl Benzoate** | Balzam |
| **Benzyl Salicylate** | Çiçeksi |
| **Cinnamal** | Tarçın |
| **Cinnamyl Alcohol** | Tarçın |
| **Coumarin** | Tonka fasulye, tarçın |
| **Hexyl Cinnamal** | Çiçeksi-kremalı |
| **Hydroxycitronellal** | Lily-of-the-valley sentetik |
| **Isoeugenol** | Karanfil |
| **Methyl 2-Octynoate** | Yeşil notalar |
| **Alpha-Isomethyl Ionone** | Pudralı menekşe |
| **Amyl Cinnamal** | Çiçeksi |
| **Amylcinnamyl Alcohol** | Çiçeksi |
| **Anisyl Alcohol** | Anason, vanilya |
| **Tree Moss Extract** | Yosun, klasik chypre |
| **Oak Moss Extract** | Yosun, doğal parfüm |
| **Butylphenyl Methylpropional** (Lilial) | **2022'de yasaklandı** |
| **Hydroxyisohexyl 3-Cyclohexene Carboxaldehyde** (Lyral) | 2017 yasaklandı |
| **Benzyl Cinnamate** | Reçine |

## Yeni 80+ (2023 SCCS Update)

2023'te SCCS güncellemesi listeyi **57'ye + 24 alerjen daha** genişletti, toplam ~80+. Implementation: 2026 itibariyle Avrupa'da etiket zorunluluğu 80'e çıkıyor.

## REVELA Etiket Tarama

REVELA ürün sayfasındaki INCI listesinde her alerjen molekülün **ALERJEN** kırmızı rozetli gösterilir. "PARFÜM" tek başına ürünün gerçek bileşenini saklar — biz açıklıyoruz.

## Hassas Cilt İçin Strateji

1. **Parfümsüz** ürünler tercih (etikette "fragrance free" veya "parfümsüz")
2. **"Doğal koku" ≠ alerjensiz**: Esansiyel yağlar bu listenin çoğunu içerir (lavanta = linalool + linalyl asetat)
3. **EUH 208 işareti**: AB'de "İçerir [alerjen ismi]. Alerjik reaksiyona yol açabilir" yazısı zorunlu eğer:
   - Yıkanan ürünlerde >%0.01
   - Yıkanmayan ürünlerde >%0.001

## Kontakt Dermatit İstatistikleri

- Avrupa'da %1-3 yetişkin kozmetik kontakt dermatit
- En sık alerjenler: limonene, linalool, geraniol
- Patch test (dermatologda) %20-30 sensitif kişide pozitif

## Pratik Tüyo
Hassas + atopik cilt için: parfümsüz + sülfat-free + alkol-free temel kombin. Avène Tolérance, Bioderma Sensibio, La Roche-Posay Toleriane bu segmentin altın standartları.

## Kaynaklar
- [SCCS/1459/11 Opinion on Fragrance Allergens](https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety_en)
- [EU Cosmetics Regulation Annex III](https://eur-lex.europa.eu/)`,
  },
  {
    title: 'D Vitamini ve Kozmetik: Eksik Olduğunda Cildin Ne Yaşar?',
    slug: '2026-04-29-d-vitamini-cilt',
    content_type: 'ingredient_explainer',
    summary: 'D vitamini sadece kemik için değil — ciltte de çoklu rol oynar. Eksiklik atopik dermatit, akne ve psoriasiste tetikleyici.',
    body_markdown: `## D Vitamini ve Cilt Bağlantısı

D vitamini "cilt vitamini" olarak da bilinir. Ciltte UVB ışığı altında kolesterolden 7-dehidrokolesterol → previtamin D3 sentezlenir. Topikal D vitamini de absorbe edilir.

## Mekanizma — Cilt Hücreleri Üzerinde

- **Keratinosit proliferasyonu**: Diferansiyasyonu düzenler (psoriasis araştırması bu üzerine)
- **Bariyer fonksiyonu**: Filaggrin sentezini artırır (atopik dermatitte zayıf)
- **Anti-enflamatuar**: Th17 yolağı baskılar
- **Antimikrobiyal peptit (LL-37) sentezi**: Akne savunması

## Eksiklik Belirtileri (Cilt)

- **Atopik dermatit**: Kuru, kaşıntılı cilt (D vit eksik %50+ vakada)
- **Akne**: D vit eksik bireylerde 2x risk
- **Psoriasis**: Doğrudan ilişkili (topikal calcipotriol tedavisi)
- **Yara iyileşmesi**: Yavaşlama
- **Saç dökülmesi**: Telojen efluvium

## D Vitamini Düzeyi Hedefi

25-OH D testinde:
- **<20 ng/mL**: Eksik
- **20-30 ng/mL**: Yetersiz
- **30-60 ng/mL**: Optimal
- **>100 ng/mL**: Toksik

Türkiye'de %70+ popülasyon yetersiz/eksik.

## Topikal vs Oral

### Oral (Sistemik)
- D3 (kolekalsiferol) > D2
- Eksiklikte 4000-5000 IU/gün
- Normal aralıkta 1000-2000 IU/gün idame
- Yağda çözünür → yağlı yemekle al

### Topikal (Klinik Tedavi)
- **Calcipotriol** (Daivonex): Reçeteli psoriasis tedavisi
- **Calcitriol** (Silkis): Reçeteli
- OTC topikal D vit limitli kanıt
- Bakım kremlerinde D vit eklenmiş ürünler estetik amaçlı

## Mevsim + Lokasyon

- Türkiye 36-42° kuzey enlem: yaz öğleyle 15-30 dk güneş yeterli
- Kış (Kasım-Mart): UVB yetersiz, supplement gerekli
- Koyu ten + kapalı giyim: yaz dahi eksiklik mümkün

## Cilt Bakım Rutinine D Vit Etkisi

D vit yeterse:
- ✅ Bariyer güçlenir
- ✅ Atopik krizler azalır
- ✅ Akne tedavisine yanıt artar
- ✅ Yara iyileşme hızı normal

## Pratik Tavsiye

1. **Test yaptır** — 25-OH D
2. **Eksikse 4000-5000 IU/gün D3** (8-12 hafta sonra tekrar test)
3. **Optimal aralıkta 1000-2000 IU/gün idame**
4. **K2 (MK-7 100-180 mcg) eklenirse damar kireçlenmesini önler**
5. **Magnezyum + Çinko** D vit metabolizması için eş-faktörler

## Kaynaklar
- [Holick 2017 — Rev Endocr Metab Disord](https://pubmed.ncbi.nlm.nih.gov/28512267/)
- [Bikle 2014 — Photochem Photobiol](https://pubmed.ncbi.nlm.nih.gov/25342258/)`,
  },
  {
    title: 'Ses Seviyesinde 3 Yanlış Cilt Bakım Tavsiyesi',
    slug: '2026-04-29-yanlis-cilt-bakim-tavsiyeleri',
    content_type: 'guide',
    summary: 'Sosyal medyada yaygın ama klinik olarak yanlış 3 cilt bakım iddiası — ve neden bilim onları desteklemiyor.',
    body_markdown: `## Sosyal Medya ≠ Klinik

TikTok, Instagram'da viral olan "hack"lerin çoğu klinik kanıttan uzak. 3 yaygın hatayı düzeltelim.

## Yanlış 1: "Limon + Karbonat ile Doğal Cilt Aydınlatma"

### Hata
Limon (pH ~2) + karbonat (pH ~9) cilde sürmek "doğal" peeling iddiası.

### Neden Yanlış
- Cilt pH 5-5.5; limon **bariyer hasarı** + kimyasal yanık
- Limon **fototoksik** (furokumarinler) — UV altında pigmentasyon **artar**
- "Doğal" ≠ güvenli; doğal lavanta yağı bile alerjen

### Bilim Tabanlı Alternatif
- **Kojik asit %2** (mantar fermenti, klinik aydınlatma)
- **Niasinamide %5-10** (B3 vitamini, melanin düzenler)
- **Alpha arbutin %2** (doğal hidrokinon türevi)
- + SPF 50 zorunlu

## Yanlış 2: "Buz Kürü Gözenek Sıkıştırır"

### Hata
Buz parçasını yüze sürmek gözenekleri "kapatır" iddiası.

### Neden Yanlış
- Gözenek boyutu **genetik** — fiziksel olarak küçültülemez
- Buz vasokonstriksiyon → **anlık** görünüm değişikliği (5-10 dk)
- Hassas + rosacea ciltte kılcal damar genişlemesi (telenjiektaazi) tetikleyebilir
- Cilt bariyerine soğuk şok

### Bilim Tabanlı Alternatif
- **Niacinamide %5-10**: Sebum üretimini düzenler → görünüm azalır
- **Salicylic acid %1-2**: Tıkanıklığı açar → gözenek temiz görünür
- **Retinol/adapalen**: Kollajen ile gözenek çevresi sıkı
- **Kil maskesi haftada 1-2**: Sebum çekme

## Yanlış 3: "İçinizden Kapatın — Su İçmek Kuru Cildi Çözer"

### Hata
"Günde 3 litre su içersen cildin nemli olur" iddiası.

### Neden Yanlış
- Cilt nemini **stratum korneum lipid + NMF** belirler, sistemik su değil
- Yeterli hidrate olduktan sonra ek su idrarla atılır, ciltte birikmez
- Klinik çalışmalar: ekstra su tüketimi cilt elastikiyetinde marjinal/anlamsız fark
- Dehidrasyon (gerçek) elbette tüm vücut sağlığı için kritik — abartı yapmamak gerek

### Bilim Tabanlı Alternatif
- **Topikal humektant**: HA, glycerin, sodium PCA
- **Bariyer onarımı**: Ceramide, niasinamid
- **Occlusive**: Yağ + krem üst kat (nem buharlaşmasın)
- Sistemik 2-2.5L su yeterli (susuzluk hissi gerçek bir gösterge)

## Genel Kural — Bilim mi Trend mi?

Yeni "hack" gördüğünde sor:
1. **Klinik çalışma var mı?** Plasebo kontrollü, randomized?
2. **Mekanizma açıklanabilir mi?** Cilt fizyolojisi ne diyor?
3. **Kanıt seviyesi**: Anekdot < deney < RCT < meta-analiz
4. **Marka çıkarı var mı?** "Influencer + indirim kodu" ≠ kanıt

REVELA bu yüzden var: marka iddialarını klinik kanıtla karşılaştırır, INCI listesini şeffaf gösterir.

## Kaynaklar
- [Cochrane Skin Group Reviews](https://skin.cochrane.org/)
- [JAMA Dermatology — Evidence-Based Skincare](https://jamanetwork.com/journals/jamadermatology)`,
  },
  {
    title: 'Çinko Cinkostan Akne Tedavisinde Ne Kadar Etkili?',
    slug: '2026-04-29-cinko-akne',
    content_type: 'ingredient_explainer',
    summary: 'Çinko bisglisinat, çinko sitrat ve topikal çinko PCA — akne tedavisinde formuna göre etki farkı.',
    body_markdown: `## Çinko ve Akne — Bilimsel Bağlantı

Çinko esansiyel mineral; akne hastalarının %30-40\'ında düşük plasma seviyesi gözlemleniyor.

## Mekanizma

- **Anti-bakteriyel**: Cutibacterium acnes baskılar
- **Anti-enflamatuar**: TNF-alpha + IL-6 düzenler
- **Sebum modülasyonu**: 5-alpha-reductase inhibisyonu (orta düzey)
- **Yara iyileşmesi**: Akne sonrası iz iyileşmesi

## Çinko Formları (Oral)

| Form | Emilim | Kullanım |
|---|---|---|
| **Çinko Bisglisinat** | %85+ (en yüksek) | Akne, bağışıklık |
| **Çinko Sitrat** | %75 | Genel kullanım |
| **Çinko Pikolinat** | %80 | Akne (klinik) |
| **Çinko Sülfat** | %30 (mide hassasiyeti) | Eski formül |
| **Çinko Oksit** | %20 (en düşük) | Topikal SPF/diaper rash |

## Etkili Doz (Oral Akne)

- **30 mg/gün** çinko bisglisinat veya pikolinat
- **8-12 hafta** denemeden değerlendirme yapma
- Bakır eksikliği önlemek için **2 mg bakır** kombin (uzun süreli)

## Topikal Çinko

| Form | Kullanım | Etkinlik |
|---|---|---|
| **Çinko PCA** | Akne, sebum kontrolü | Orta |
| **Çinko Glukonat** | Yara iyileşmesi | Yüksek |
| **Çinko Oksit** | Mineral SPF, diaper rash | Yüksek (UV) |
| **Çinko Sülfat** | Akne (eski) | Düşük (tahriş) |

The Ordinary Niacinamide 10% + Zinc 1% — pratik standart oral değil topikal kombin.

## Akne Vakalarında Etki Karşılaştırma

Klinik meta-analiz (Dreno et al. 2018):
- Tetrasiklin antibiyotik: %60 iyileşme
- Çinko 30 mg/gün: %30 iyileşme
- Plasebo: %15 iyileşme

Yani çinko **antibiyotik kadar değil** ama plasebodan anlamlı üstün. Hafif-orta akne için kontraendikasyon olmayan ek tedavi.

## Çinko + Diğer Aktifler Sinerji

- **Çinko + B6 (Pyridoxine)**: Sebum daha fazla düzenler
- **Çinko + Probiotik**: Bağırsak-cilt aksı
- **Çinko + D vitamini**: Bağışıklık + akne düzeneği
- **Çinko + Salicylic Acid (topikal)**: Akne güçlü kombo

## Yan Etkiler

- Aç karna 30+ mg → mide bulantısı (yemekle al)
- 50+ mg uzun süre → bakır eksikliği, ishal
- Antibiyotik (tetrasiklin) emilimini azaltır → 4 saat ara

## Pratik Strateji

1. **Hafif akne**: Niasinamide 10% + Zinc 1% topikal + 30 mg/gün oral çinko 8-12 hafta
2. **Orta akne**: + adapalen %0.1 gece + salisilik %2 sabah
3. **Şiddetli**: Dermatolog (isotretinoin / antibiyotik)

## Kaynaklar
- [Dreno et al. 2018 — Eur J Dermatol](https://pubmed.ncbi.nlm.nih.gov/29683426/)
- [Cervantes et al. 2018 — Dermatol Ther](https://pubmed.ncbi.nlm.nih.gov/29380442/)`,
  },
  {
    title: 'Mineral SPF mi Kimyasal SPF mi? Ortak Yanılgılar',
    slug: '2026-04-29-mineral-vs-kimyasal-spf',
    content_type: 'comparison',
    summary: 'Mineral (zinc oxide, titanium dioxide) vs kimyasal (avobenzone, octinoxate) güneş kremi — fark nedir, hangisi senin için?',
    body_markdown: `## İki Filtre Tipi

### Mineral / Fiziksel
- Zinc Oxide (ZnO)
- Titanium Dioxide (TiO2)

### Kimyasal / Organik
- Avobenzone (UVA)
- Octinoxate / Octocrylene (UVB)
- Tinosorb S/M (yeni nesil)
- Bemotrizinol, Bisoctrizole

## Mit 1: "Mineral Yansıtır, Kimyasal Absorbe Eder"

**Yanlış basitleştirme.** Modern araştırma gösterdi ki:
- Mineral SPF de UV'nin **%90+'ını absorbe eder** (yansıtma sadece %10-15)
- Mekanizma farkı küçük; her ikisi de UV enerjisini ısıya çevirir
- Pratik fark: **partikül boyutu + ten beyazı + endokrin etkisi**

## Mit 2: "Mineral Daha Güvenli"

Genelde doğru ama nüanslı:
- ✅ ZnO + TiO2 endokrin etkisi yok
- ✅ Mercan resifi güvenli (Hawaii ban'dan muaf)
- ✅ Hassas + bebek + gebelikte tercih
- ⚠️ Nano partikül (boyut <100 nm): cilt absorpsyonu tartışmalı (sınırlı kanıt)
- ⚠️ Inhalasyon riski (sprey değil krem tercih)

## Mit 3: "Kimyasal Cilt Tarafından Emilir"

FDA 2019 çalışması doğruladı:
- Plasma'da kimyasal SPF moleküllerinin algılanabilir seviye 1-7 gün
- Ama: "**FDA emilim ≠ tehlike**" diyor — yeterli güvenlik testi gerekli
- AB SCCS yeni limitleri (Octinoxate %7.34, Oxybenzone %2.2) bu tartışma sonrası

## Doğru Karşılaştırma Tablosu

| Özellik | Mineral | Kimyasal |
|---|---|---|
| **UV koruma** | UVA + UVB (ZnO geniş) | UVA + UVB (kombinasyon) |
| **Hemen koruma** | ✅ Anında | ❌ 20 dk bekle |
| **Beyaz iz** | ⚠️ Klasik formüllerde | ✅ Yok |
| **Tekstür** | Yoğun | Hafif |
| **Endokrin** | ✅ Risk yok | ⚠️ Bazılarında risk |
| **Hassas/bebek** | ✅ İdeal | ⚠️ Reaksiyon mümkün |
| **Hamile/emziren** | ✅ İdeal | ⚠️ Sınırlı kanıt |
| **Alerjik reaksiyon** | Çok nadir | Avobenzone bazılarında |
| **Plaj/spor** | İyi (mineral su geçirmez) | Yenilenme gerekir |
| **Yağlı cilt** | ⚠️ Beyaz iz, mat değil | ✅ Hafif tekstür |

## Hangi Cilt Tipi Hangisi?

### Mineral Tercih
- **Bebek + çocuk** (3 yaş altı zorunlu)
- **Hamile + emziren**
- **Hassas + atopik**
- **Post-prosedür** (lazer, peeling sonrası)
- **Rosacea**
- **Aktif aktif kullanan** (retinol + AHA gece sonrası)

### Kimyasal Tercih
- **Yağlı cilt** (mat tekstür için)
- **Karma cilt** (T-zone hassas)
- **Makyaj altı** (beyaz iz olmaz)
- **Esmer ten** (mineral beyazlık daha belirgin)

## Hibrit (Mineral + Kimyasal Kombin)

En çok ürün ikisini kombine eder. Avantajlar:
- ✅ Hem hızlı koruma (mineral)
- ✅ Hafif tekstür (kimyasal)
- ✅ Geniş spektrum

Markalar: La Roche-Posay Anthelios Hydrating, Eucerin Sun Sensitive, Avène Mineral Très Haute Protection.

## En İyi Markaları (Türkiye Eczane)

### Mineral
- La Roche-Posay Anthelios UVMune 400 Mineral
- Avène Mineral Cream SPF 50+
- Eucerin Sensitive Mineral
- ISDIN Mineral Brush SPF 50+

### Kimyasal (yeni nesil filtreler)
- La Roche-Posay Anthelios UVMune 400 (Tinosorb S, Mexoplex)
- Bioderma Photoderm Spot SPF 50+
- ISDIN Fusion Water

## Kaynaklar
- [SCCS/1644/22 Opinion (Sunscreen Filters)](https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety_en)
- [FDA 2019 Sunscreen Absorption Study](https://jamanetwork.com/journals/jama/article-abstract/2733085)`,
  },
  {
    title: 'Probiyotik Takviyesi: 8 Önemli Soru ve Cevap',
    slug: '2026-04-29-probiyotik-faq',
    content_type: 'guide',
    summary: 'CFU sayısı yeterli mi? Hangi suş ne işe yarar? Antibiyotik sonrası ne zaman almalı? Probiyotik konusundaki temel sorular.',
    body_markdown: `## 1. CFU Sayısı Ne Olmalı?

CFU (Colony Forming Units) = canlı bakteri sayısı.

| Hedef | CFU/gün |
|---|---|
| Genel sağlık | 1-10 milyar |
| Antibiyotik sonrası | 10-25 milyar |
| IBS, kronik sindirim | 25-50 milyar |
| C. difficile sonrası | 50-100+ milyar |

**Önemli not**: "Üretim anında 50 milyar" vs "raf ömrü sonunda 25 milyar" — etiketinde **expiry date'te garanti edilen miktar** olmalı.

## 2. Hangi Suş Hangi Sorun İçin?

### Sindirim
- **Lactobacillus rhamnosus GG**: Yolculuk ishali, antibiyotik sonrası
- **Saccharomyces boulardii**: C. difficile, akut ishal
- **Bifidobacterium infantis 35624**: IBS-D

### İmmün Destek
- **Lactobacillus rhamnosus**: Üst solunum yolu enfeksiyonları
- **Lactobacillus casei**: Soğuk algınlığı süresini kısaltır

### Cilt (Bağırsak-Cilt Aksı)
- **L. rhamnosus + L. paracasei**: Atopik dermatit destek
- **L. plantarum**: UV-induced oksidatif stres

### Kadın Sağlığı
- **L. crispatus**: Vajinal mikrobiyom
- **L. acidophilus**: Üriner sağlık

### Ruhsal
- **L. rhamnosus + L. helveticus**: Anksiyete, mood (psikobiyotik)

## 3. Probiyotik Aç Karna mı Yemekle mi?

| Form | En İyi Zaman |
|---|---|
| Sıvı, jel | Aç karna (15-30 dk önce yemek) |
| Kapsül | Yemekle (mide asidini tamponlar) |
| Enkapsule kapsül (delayed release) | Aç karna |

## 4. Antibiyotik Sonrası Probiyotik?

**Evet — kanıt güçlü.**

- Antibiyotik **2-4 saat sonra** probiyotik
- Antibiyotik bittikten sonra **2 hafta daha** devam
- Saccharomyces boulardii antibiyotikle birlikte alınabilir (maya, antibiyotikten etkilenmez)

## 5. Probiyotikler Buzdolabında Saklanmalı mı?

- **Yaşıyor / canlı kapsül**: Evet, çoğu
- **Spor formu** (B. coagulans, L. sporogenes): Oda sıcaklığında kalıcı
- **Etiketteki saklama** talimatına uy

## 6. Çocuklara Verilebilir mi?

- **>6 ay**: L. rhamnosus GG güvenli (atopik dermatit erken tanı varsa)
- Doz çocuk için 1-5 milyar CFU
- Anne sütü doğal probiyotik kaynağı (HMO + L. reuteri)

## 7. "Hepsi Aynı" Mit

**Yanlış**. Suşlar arası fark çok büyük:
- Lactobacillus acidophilus NCFM ≠ Lactobacillus acidophilus DDS-1
- Ürün etiketinde **suş numarası** olmalı (örn LGG, NCFM, DDS-1)
- Generic "L. acidophilus" suş garantisi vermez

## 8. Prebiyotik Ne?

Prebiyotik = probiyotik bakterilerin yiyeceği (çözünmez lif).

| Prebiyotik | Doğal Kaynak |
|---|---|
| **İnülin** | Hindiba, sarımsak, soğan |
| **FOS** (Fructooligosaccharides) | Muz, kuşkonmaz |
| **GOS** (Galactooligosaccharides) | Anne sütü |
| **Resistant Starch** | Soğuk pişmiş patates, yeşil muz |

**Sinbiyotik** = probiyotik + prebiyotik kombin ürünler.

## Pratik Reçete

### Genel sağlık
- 10-20 milyar CFU/gün, **çok-suşlu** (4-6 farklı bakteri)
- 8-12 hafta dene, yarar yoksa farklı ürün

### Spesifik sorun
- IBS: B. infantis 35624 — Symprove veya Visbiome
- Antibiyotik sonrası: Saccharomyces boulardii — Florastor

## Türkiye Markaları (Eczane)

- Florastor (Saccharomyces boulardii)
- Solgar Advanced 40+ Acidophilus
- Now Probiotic-10
- Pharmaton Probiyotik

## Kaynaklar
- [WGO Global Guidelines — Probiotics](https://www.worldgastroenterology.org/guidelines/probiotics-and-prebiotics)
- [ISAPP Position Statement](https://isappscience.org/)`,
  },
];

console.log(`[1] ${ARTICLES.length} pilot makale insert ediliyor...`);
let inserted = 0;
for (const a of ARTICLES) {
  try {
    await c.query(
      `INSERT INTO content_articles (title, slug, content_type, summary, body_markdown, status, published_at)
       VALUES ($1, $2, $3, $4, $5, 'published', NOW())
       ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             summary = EXCLUDED.summary,
             body_markdown = EXCLUDED.body_markdown,
             status = 'published',
             updated_at = NOW()`,
      [a.title, a.slug, a.content_type, a.summary, a.body_markdown]
    );
    inserted++;
  } catch (e) {
    console.log(`  ERR [${a.slug}] ${e.message.slice(0, 60)}`);
  }
}
console.log(`\n${inserted}/${ARTICLES.length} insert/update`);

const final = await c.query(`SELECT content_type, COUNT(*) FROM content_articles WHERE status='published' GROUP BY content_type ORDER BY content_type`);
console.log('\n## Final yayında dağılımı:');
for (const r of final.rows) console.log(`  ${r.content_type.padEnd(25)} ${r.count}`);

await c.end();
