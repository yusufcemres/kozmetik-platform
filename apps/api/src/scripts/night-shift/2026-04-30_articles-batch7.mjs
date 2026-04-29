// Articles batch 7 — 5 yeni makale (80 → 85)
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ARTICLES = [
  {
    title: 'REVELA Skoru Nasıl Hesaplanır? 7 Boyut, Ağırlıklar, Breakdown',
    slug: '2026-04-30-revela-skor-metodoloji',
    content_type: 'guide',
    summary: 'REVELA Skoru kozmetik 100 üzerinden 7 ağırlıklı bileşenle hesaplanır. Aktif etkinlik, güvenlik sınıfı, konsantrasyon, etkileşim, alerjen yükü, CMR/endokrin, şeffaflık. Floor cap kuralları ve örnek hesaplama.',
    body_markdown: `## REVELA Skoru = Bilim + Şeffaflık

Her ürün **0-100 arası** skorlanır. Skor sayı değil, **açıklamalı skor** — her bileşen için hangi kriterin neyi etkilediği gösterilir.

## 7 Bileşen + Ağırlıklar

| Bileşen | Ağırlık | Sinyal |
|---------|---------|--------|
| **Aktif Etkinlik** | %25 | Etken maddenin kanıt-temelli etkisi (retinol, niasinamid, vb.) |
| **Güvenlik Sınıfı** | %20 | CIR/SCCS sınıflandırma, CMR, endokrin, AB-yasaklı flag |
| **Konsantrasyon** | %15 | Aktif madde efficacy eşiğinde mi |
| **Etkileşim** | %10 | Bileşenler arası tahriş / etkisizleşme riski |
| **Alerjen Yükü** | %10 | AB 26 alerjen + parfüm/koku bileşen sayısı |
| **CMR / Endokrin** | %10 | Kanserojen, mutajen, endokrin bozucu flag |
| **Şeffaflık** | %10 | INCI listesi açıklığı + konsantrasyon beyanı |

**Toplam: 100 puan**

## Floor Cap Kuralları (Otomatik Tavan)

Bazı kritik durumlarda skor **otomatik olarak düşürülür**:

| Durum | Maksimum Skor |
|-------|---------------|
| AB-yasaklı bileşen | ≤20 |
| CMR sınıf 1A veya 1B | ≤30 |
| IARC grup 1 (kanserojen) | ≤35 |
| Endokrin bozucu + ≥%0.1 konsantrasyon | ≤55 |

> Bu floor cap'ler skor şişirmeyi engeller — ürün diğer bileşenlerde mükemmel olsa bile kritik bir bileşen varsa skor düşer.

## Örnek Hesaplama: La Roche-Posay Effaclar Duo

**INCI**: niacinamide, salicylic acid, hyaluronic acid, glycerin, dimethicone, phenoxyethanol, ...

| Bileşen | Skor | Açıklama |
|---------|------|----------|
| Aktif Etkinlik | 22/25 | Niasinamid + salisilik (ikisi de A-grade evidence) |
| Güvenlik Sınıfı | 19/20 | CIR/SCCS uyumlu, CMR yok |
| Konsantrasyon | 13/15 | %5 niasinamid + %2 salisilik (ikisi de etkin eşik) |
| Etkileşim | 9/10 | Salisilik + retinol uyarısı (kullanıcı dikkat) |
| Alerjen Yükü | 8/10 | Parfüm yok, EU 26 alerjen sayısı düşük |
| CMR / Endokrin | 10/10 | Tamamen temiz |
| Şeffaflık | 8/10 | INCI tam, konsantrasyon kısmen açık |
| **Toplam** | **89/100** | Sınıf A |

## Sınıf Karşılığı

| Skor | Sınıf | Anlam |
|------|-------|-------|
| 90-100 | A+ | Mükemmel |
| 80-89 | A | Çok güvenli, kanıt-temelli |
| 70-79 | B | İyi, küçük dikkat |
| 60-69 | C | Orta, alternatif değerlendir |
| 50-59 | D | Zayıf, dikkatli kullan |
| 0-49 | E | Önerilmez |

## Kişisel Uyumluluk Skoru (Ayrı)

REVELA Skoru ürünün **genel** kalitesidir. Senin için **uyumluluk skoru** ayrı hesaplanır:

- Cilt tipi (yağlı, kuru, karma, hassas, normal)
- İhtiyaçlar (akne, anti-aging, leke, vb.)
- Hassasiyetler (parfüm alerjisi, atopik dermatit, vb.)

→ %0-100 **kişisel uyumluluk skoru**.

> Yüksek REVELA skoru olan ürün senin için uygun olmayabilir (örn. yağlı cilde aşırı yağlı içerik).

## Algoritma Versiyonu

- **Cosmetic v1** (mevcut): Bu makaledeki 7 bileşen
- **Supplement v2**: form_quality + dose_efficacy + evidence_grade + third_party + interaction + transparency (6 bileşen, 100 puan)

Versiyon güncellendiğinde tüm ürün skorları **yeniden hesaplanır** (Redis cache invalidasyonu otomatik).

## Açıklamalı Skor

Her ürün sayfasında:
- Her bileşen için ayrı bar grafik
- Hangi INCI hangi bileşeni nasıl etkiledi
- Floor cap aktif olduysa neden
- Alternatif öneri (eğer skor <60)

## Kanıt Kaynakları

- **CIR**: Cosmetic Ingredient Review (US)
- **SCCS**: Scientific Committee on Consumer Safety (EU)
- **EU Annex II/III**: Yasak + kısıtlı maddeler listesi
- **CMR**: Carcinogen, Mutagen, Reprotoxic
- **IARC**: International Agency for Research on Cancer
- **Peer-reviewed dermatoloji literatürü**

## REVELA Skoru ≠ Yuka

Yuka, INCI Decoder ve diğer skorlama sistemleri farklı algoritma + farklı veri seti kullanır. REVELA:
- Türkçe içerik dominant
- Türkiye pazarındaki ürünlere odaklı
- Her INCI için detaylı atıflı açıklama
- Kişiselleştirme entegrasyonu
- Affiliate transparency (gelir kaynağı bağımsızlık beyanlı)

## Kaynaklar

- /nasil-puanliyoruz (REVELA metodoloji sayfası)
- SCCS Opinion Database
- CIR Cosmetic Ingredient Review
- EU Cosmetic Regulation 1223/2009`,
  },

  {
    title: 'Türkiye Kozmetik Pazarı 2026: Trend INCI\'leri + Tüketici Davranışı',
    slug: '2026-04-30-turkiye-pazar-trend-2026',
    content_type: 'news',
    summary: '2026 itibariyle Türkiye kozmetik pazarındaki yükselen INCI trendleri: niasinamid + bakuchiol + ektoin + cica. K-beauty etkisi, dermokozmetik büyümesi, Z kuşağı tüketici davranışı.',
    body_markdown: `## 2026 Türkiye Kozmetik Pazarı

Türkiye kozmetik pazarı **12 milyar TL+ yıllık ciroya** ulaştı (2026). En hızlı büyüyen segmentler:

- **Dermokozmetik**: %25 yıllık büyüme (eczane satışları)
- **K-beauty**: %35 büyüme (online dominant)
- **Online satış**: %40 yıllık büyüme (Trendyol, Hepsiburada)
- **Erkek bakım**: %20 büyüme

## Yükselen Top 10 INCI 2026

### 1. Niasinamid (B3)

- 2024'te zirvedeydi, **hala 1 numara**
- Hemen her yeni serum formülü içeriyor
- %5 standart konsantrasyon, geniş tüketici farkındalığı
- TikTok + Instagram'da en çok geçen aktif

### 2. Bakuchiol

- Retinol alternatifi olarak **hızla yükseldi**
- Hamilelik + hassas cilt segmentinde dominant
- The Ordinary + ürün sayısı 2024'te 5 → 2026'da 30+

### 3. Centella Asiatica (Cica)

- K-beauty etkisiyle her marka serisinde
- Atopik dermatit + rosacea standart aktifi
- Türkçe-Korece çift etiketleme yaygın

### 4. Ektoin

- 2025-2026'da yeni fenomen
- "Ekstremalit" pazarlaması güçlü
- Hassas cilt + atopik premium segment

### 5. Salisilik Asit (BHA)

- Akneye yatkın cilt için kalıcı dominant
- COSRX, Some By Mi gibi K-beauty markaları yaygınlaştırdı
- Toner formülasyonu standart

### 6. Hyaluronik Asit (multi-MA)

- 2020'den beri klasik, hala büyüyor
- "3D HA" pazarlaması popüler
- Premium çapraz-bağlı HA türevleri

### 7. Peptit Kompleksi

- Anti-aging segmentinde patlama
- Matrixyl 3000, GHK-Cu, Argireline
- 30+ yaş demografisi hedef

### 8. Madekassosid

- Centella'nın izole aktifi, premium pozisyonlama
- "Cica boost" iddialı ürünler
- Klinik kanıt güçlü, tüketici farkındalığı yeni

### 9. Tranexamic Acid

- Melasma trendi, hidrokinon yasakları sonrası
- The Ordinary lansmanı sonrası viral
- %5 konsantrasyon yaygınlaştı

### 10. Bakırpeptit (GHK-Cu)

- Premium anti-aging
- 50+ yaş + dermatolojik prosedür sonrası
- The Ordinary "Buffet + Copper Peptides" patlama

## Tüketici Davranış Trendleri

### Z Kuşağı (1997-2012 doğumlu)

- TikTok-driven satın alma
- "Skin cycling", "skinimalism" trendleri
- 5-7 katmanlı klasik rutinden **3-4 katmana** dönüş
- Marka sadakati düşük, viral ürün avı yüksek

### Y Kuşağı (1981-1996)

- "Holy grail" mantığı (sadık ürün)
- Klinik kanıta verim
- Dermokozmetik (eczane) tercih
- Yıllık $200-400 cilt bakım bütçesi

### X Kuşağı + 50+

- Premium markalar (SKII, Estée Lauder, La Mer)
- Dermatolog yönlendirmesi yoğun
- Reçeteli + OTC kombinasyonu
- "Anti-aging" değil, "yaşa uygun bakım"

## Marka Trendleri

### Yükselen Yerel Markalar

- **Procsin**: K-beauty stilinde Türk markası, hızla büyüyor
- **Sekate**: niş ürünler, Anatolyan kozmetik
- **Elizium**: dermatolog co-branded
- **Gedeon**: Türk eczacı markası

### Düşen Eski Markalar

- Klasik supermarket markaları (Nivea, L'Oréal supermarket serileri) yavaşladı
- Eczane segmenti hala güçlü ama K-beauty saldırısıyla daralıyor

### Premium İmport Markalar

- La Roche-Posay, Vichy, Eucerin: dermokozmetik dominant
- Skinceuticals, Paula's Choice: online + Sephora kanal
- The Ordinary: ulaşılabilir bilim-temelli pozisyon

## INCI Trendi Tahminleri (2027-2028)

- **Bakteriyofaj-temelli aktifler**: cilt mikrobiyom dengeleyici (klinik tarafta yeni)
- **Sentetik biyoloji peptitleri**: Layla, Symbiotech türü patentli moleküler
- **NMN (Nicotinamide Mononucleotide)**: niasinamid'in mitokondri öncüsü, premium
- **Rekombinan kollajen**: %95 bitkisel-tabanlı kollajen üretim
- **Probiyotik sonbahar/cell-free supernatant**: mikrobiyom 2.0

## REVELA Pozisyonu

Bu trend ekosistemine bilim-temelli + Türkçe + bağımsız bakış açısı eksikliğini gördüğümüz için kuruldu. Yatırımcı için ana mesaj:

- **Boş niş**: Türkçe bilim-temelli kozmetik analizi
- **Pazar büyüklüğü**: 12B TL+ ve %15-25 yıllık büyüme
- **Affiliate gelir modeli**: 8 platform entegrasyonu
- **Genç demografi**: Z + Y kuşağı dijital dominant

## Kaynaklar

- Euromonitor International — Beauty & Personal Care Türkiye 2026
- TKDD (Türk Kozmetik Dermatologlar Derneği) yıllık raporu
- Statista Beauty Market Turkey
- INCI Decoder veritabanı trend analizi`,
  },

  {
    title: 'Etiket Okuma 201: Konsantrasyon İpuçları, "Free From" Tuzakları, INCI Sıralaması',
    slug: '2026-04-30-etiket-okuma-201',
    content_type: 'label_reading',
    summary: 'INCI sıralama kuralları (azalan ağırlık), konsantrasyon ipuçları (%1 üstü vs altı bölge), "free from" pazarlama tuzakları, "doğal" iddiası tuzağı. İleri seviye etiket okuma rehberi.',
    body_markdown: `## INCI Sıralaması Kuralı

INCI (International Nomenclature of Cosmetic Ingredients) listesi:

- **Azalan ağırlık** sırasına göre yazılır (AB Regulation 1223/2009 zorunluluğu)
- %1'in altındaki bileşenler **istenildiği sırada** olabilir
- Pigmentler + parfümler son sırada listelenebilir

## %1 Bölgesi Tespiti

Etikette **bir gösterge yok** ama tahmin yöntemi:

### Yaygın "Bölge İşaretçileri"

| Bileşen | Tipik % | Etkisi |
|---------|---------|--------|
| Aqua | %50-90 | İlk sırada |
| Glycerin | %3-7 | İlk 5-10 |
| Cetearyl Alcohol | %2-5 | İlk 5-10 |
| Phenoxyethanol | %0.5-1 | Genelde son 5-10 (≤%1 limit) |
| EDTA | %0.1-0.5 | Son 5 |
| Parfum | <%1 | Son 5-10 |
| Tocopherol | %0.1-0.5 | Son 5 |

> **Phenoxyethanol** sıraya bak — **AB max %1**. Phenoxyethanol'dan SONRA gelen tüm bileşenler **%1'in altında**.

### Aktif Konsantrasyon Çıkarımı

Niasinamid serumu örneği:
- "Aqua, Niacinamide, Glycerin, ..." → niasinamid 2. sırada → muhtemelen %5-10
- "Aqua, Glycerin, Phenoxyethanol, Niacinamide, ..." → niasinamid phenoxy'den sonra → %<1 (etkisiz)

## "Free From" Tuzakları

### "Paraben-Free"

- Paraben yerine **başka koruyucu** var mı? (phenoxyethanol, sodium-benzoate, methylisothiazolinone)
- "Methylisothiazolinone" daha allerjenik olabilir → "paraben-free" iyi olmayabilir

### "Sulfate-Free"

- Sülfat yerine ne kullanılıyor? (cocamidopropyl-betaine, lauryl-glucoside)
- "Sulfate-free shampoo" yağlı saçta saç köküne ulaşmayan temizlik (eksik temizlik)

### "Silicone-Free"

- Silikon yerine **ne ile değiştirildi?** (yağ alkolleri, kapariller, ester)
- "Silicone-free" pazarlama trendi → cilt için silikon zarar değildir, gerek yok

### "Alcohol-Free"

- Etanol yok mu, yağ alkolü (cetyl-alcohol, stearyl-alcohol) sayılmaz mı?
- Etiketinde "Alcohol Denat" varsa **kurutucu alkol** içerir → "alcohol-free" iddia yanıltıcı
- Cetyl/stearyl/cetearyl alcohol var ise → bunlar yağ alkolü, kurutmaz

### "Fragrance-Free" vs "Unscented"

| Etiket | Anlam |
|--------|-------|
| **Fragrance-Free** | Hiç parfüm bileşeni yok (en güvenli) |
| **Unscented** | Hammadde kokusunu maskelemek için **gizli parfüm** içerebilir |
| **No Synthetic Fragrance** | Sentetik parfüm yok ama esansiyel yağ olabilir (allerjen) |

## "Doğal" İddiası Tuzağı

### "100% Natural"

- AB regülasyonu **doğal/organik kozmetik için resmi tanım yok**
- ECOCERT, COSMOS, NATRUE üçüncü taraf sertifikalar standardize eder
- "100% natural" pazarlama iddiası → marka kendisi belirler, sertifika yoksa şüpheli

### "Bitki Bazlı / Plant-Based"

- Plastikten dahi türetilmiş bileşenler "plant-based" diyebilir (sentez yoluyla)
- Önemli olan **molekülün özelliği**, kaynak değil

### "Cruelty-Free" + "Vegan" + "Organic"

Üç farklı şey:
- **Cruelty-Free**: hayvan testi yok
- **Vegan**: hayvansal içerik yok (lanolin, beeswax dahil)
- **Organic**: tarımsal hammadde organik kategorisinde (sertifikalı)

## INCI Sıralamasında Aldatıcı Yöntemler

### "Pixie Dusting"

Marka iddiaları için aktifin etikete eklenmesi ama etkin olmayan **iz miktarda** ($\\<%0.1$):
- "Niacinamide" etiketin son 5 maddesi arasında → **etkisiz**
- "Vitamin C content" iddiası ama askorbik asit son sırada → **etkisiz**
- "Retinol içerir" ama son sırada → **etkisiz**

→ Aktif sıralaması ilk 5-7 madde içinde değilse marka iddiası şüpheli.

### Multi-Slug Aktif Yığma

Aynı aktifin farklı isimleri ile **aktif yığını** yapılabilir:
- "Citric Acid" + "Lactic Acid" + "Glycolic Acid" + "Mandelic Acid" → 4 farklı AHA, toplam %5+ olabilir
- Tek tek %1 altında ama toplam yüksek
- Tahriş riski tek aktif gibi görmez

### "Aqua/Water/Eau" Çok Dilli Etiket

- AB + ABD + Fransızca regülasyonu çoklu dil zorunluluğu
- Aldatıcı değil — formülasyon farkı yok

### "And/Or" Karışıklığı

- "Sodium Hyaluronate **and** Hyaluronic Acid" → her ikisi var (ayrı bileşen)
- "Sodium Hyaluronate **or** Hyaluronic Acid" → biri var (üretici hakkı)

## Etiket Okuma Pratik 5 Adım

1. **İlk 5 INCI**: ürün omurgası
2. **Aktif madde sırası**: ilk 7 içinde mi
3. **Phenoxyethanol konum**: %1 sınırını işaret eder
4. **Parfüm + EU 26 alerjen**: hassas cilt için tara
5. **Floor cap bileşenleri**: AB-yasaklı, CMR, endokrin var mı

## REVELA Etiket Tarayıcısı

REVELA'da bir ürün ararsan:
- INCI sıralaması renkli (riskli kırmızı, güvenli yeşil)
- Floor cap aktif olduysa belirgin uyarı
- Tahmini konsantrasyon banti (her bileşen için)
- Alternatif öneri (skoru düşükse)

## Kaynaklar

- AB Cosmetic Regulation 1223/2009
- INCI Standard List
- ACDS (American Contact Dermatitis Society)
- EWG (Environmental Working Group) — alternatif perspektif`,
  },

  {
    title: 'Postpartum Cilt Bakımı: Doğum Sonrası 6 Aylık Onarım Rehberi',
    slug: '2026-04-30-postpartum-cilt-bakimi',
    content_type: 'guide',
    summary: 'Doğum sonrası hormonal değişiklikler, postpartum melasma, saç dökülmesi, atopik akne flare, stretch marks. 6 aylık adım adım onarım rehberi. Emzirme döneminde güvenli aktifler.',
    body_markdown: `## Postpartum Cilt Değişiklikleri

Doğum sonrası **estrojen dramatik düşer** (gebelik seviyesinin %1'ine), prolaktin artar (emzirme), bu hormonel kombinasyon cildi etkiler:

- Postpartum melasma (gebelik maskesi inatçı)
- Hormonal akne flare (3-6 ay)
- Saç dökülmesi (telojen efflüvyum, 3-6 ay)
- Atopik dermatit alevlenme
- Stretch mark yumuşatma
- Cilt incelmesi + bariyer hassasiyeti

## Emzirme Döneminde Güvenli Aktifler

### ✅ Güvenli (Topikal)

- **Niasinamid (B3)**: kategori A, geniş güvenlik
- **Hyaluronik asit + glycerin**: doğal moleküller
- **Centella asiatica**: anti-enflamatuvar, hassas
- **Bakuchiol**: retinol alternatifi (sınırlı kanıt, hekim onayı)
- **Azelaik asit %10**: postpartum akne için ideal (kategori B)
- **Mineral SPF (ZnO + TiO2)**: en güvenli güneş koruma
- **Alpha-arbutin**: melasma için hidrokinon yerine
- **Allantoin + panthenol**: yatıştırıcı

### ⚠️ Dikkatli (Hekim Onayı)

- **Salisilik %0.5-2 (yıkanan)**: tolere edilir
- **Glikolik asit %5-10**: sınırlı topikal güvenli
- **Tranexamic asit topikal**: melasma için 2-3. ay sonrası

### ❌ Yasak (Emzirme)

- **Tüm retinoidler** (oral + topikal): tretinoin, adapalene, retinol, retinaldehit
- **Hidrokinon**: sistemik emilim %30+
- **Yüksek konsantre BHA**: %2+ leave-on
- **Peeling prosedürleri**: süt salımına etki
- **Botox + filler**: 6 ay bekle ya da emzirme bitsin

## 6 Aylık Onarım Protokolü

### Ay 1 (Doğum Sonrası 0-30 gün)

**Cilt durumu:** hormonal kaos, hassasiyet maksimum, uyku eksik

**Strateji:** minimum + bariyer

- Yumuşak cleanser (Cetaphil, La Roche-Posay Toleriane)
- Hyaluronik + niasinamid serum
- Yoğun bariyer kremi (ceramide)
- Mineral SPF (sadece dışarı çıkarken)
- **Aktif YOK** (cilt resetlenecek)

### Ay 2-3 (30-90 gün)

**Cilt durumu:** ilk hormonal dengeleme, melasma görünür

**Strateji:** anti-pigmentasyon + akne önleme

- Sabah: Cleanser → niasinamid → alpha-arbutin %2 → bariyer kremi → SPF mineral
- Akşam: Cleanser → niasinamid + hyaluronik → bariyer kremi
- Haftada 2 gece: azelaik asit %10 (akne flare varsa)
- **SPF günlük zorunlu** (melasma için)

### Ay 4-6 (90-180 gün)

**Cilt durumu:** hormonal denge yerleşmeye başlar, saç dökülmesi pik

**Strateji:** aktif yoğunlaştırma

- Sabah: Cleanser → C vit %10 → niasinamid → alpha-arbutin → SPF mineral + iron oxide
- Akşam: Cleanser → bakuchiol %0.5-1 (haftada 3 gece) → ceramide krem
- Haftada 1-2: traneksamik asit topikal %3 (melasma persistent ise)
- **SPF + Iron Oxide**: visible light koruma (HEV) → melasma için kritik

### 6+ Ay (Emzirme Bittikten Sonra)

Emzirme bittikten 1-2 hafta sonra:
- **Retinol %0.3-0.5** (yeniden başla)
- AHA/BHA normal sıklıkta
- Reçeteli tretinoin (dermatolog onayı)
- Profesyonel prosedür değerlendir (lazer melasma için)

## Postpartum Sorunları Tek Tek

### Postpartum Melasma

**Klinik:** gebelik melasması doğum sonrası %30-50 oranında **kalıcı**.

**Tedavi:**
1. SPF mineral günlük + 2 saatte yenileme
2. Iron oxide içeren SPF (HEV koruma)
3. Alpha-arbutin %2 sabah
4. Traneksamik asit topikal %3-5 gece
5. Niasinamid kombinasyonu
6. **Hidrokinon emzirme bittikten sonra** (dermatolog)
7. Lazer (Q-switched, picosecond) — emzirme sonrası

### Postpartum Akne

**Klinik:** estrogen düşmesi → testosteron orantısı artar → sebum + akne.

**Tedavi:**
1. Salisilik %0.5-2 yıkanan (cleanser)
2. Niasinamid + çinko PCA
3. Azelaik asit %10 leave-on (emzirmede güvenli)
4. Topikal eritromisin reçeteli (hekim)
5. **Roaccutane YASAK** (emzirme + 1 ay sonrası)

### Telojen Efflüvyum (Saç Dökülmesi)

**Klinik:** doğum sonrası 3-6 ay yoğun saç dökülmesi (gebelikte korunan saçların kaybı).

**Tedavi:**
1. Demir + biotin + çinko takviyesi (kan testi sonrası)
2. Saç derisine niasinamid serumu (kan dolaşımı)
3. **Minoxidil emzirmede sınırlı** (hekim onayı)
4. Genelde 6-12 ayda kendiliğinden düzelir (sabır)

### Stretch Mark (Striae Distensae)

**Klinik:** dermal kollajen yırtılması, doğum sonrası ilk 6 ay aktif.

**Tedavi:**
1. **Önleme > tedavi** — gebelikte düzenli masaj + emolyent (zaten geç ama devam)
2. Centella asiatica %5-10 + retinol kombinasyon (emzirme sonrası)
3. Lazer + microneedling (klinik, emzirme sonrası)
4. Stretch mark **tamamen kaybolmaz**, sadece açılır + yumuşar

### Atopik Dermatit Flare

**Klinik:** hormonal değişim + uyku eksik + stress = atopik tetikleyici.

**Tedavi:**
1. Yoğun bariyer kremi (ceramide + kolesterol + yağ asit trio)
2. Topikal hidrokortizon %1 (lokal, hekim, kısa süreli)
3. Tacrolimus + pimecrolimus (alternatif, hekim)
4. Tetikleyici tespit + uzaklaşma

## Pratik Tavsiyeler

- **Uyku eksik**: cilt kendini onarması için 5+ saat REM uykusu gerek — partner desteği
- **Beslenme**: omega-3 + protein + C vit zengin (deri kollajen)
- **Su**: laktasyon nemi azaltır, +500ml/gün
- **Stress**: tek başına bakım için 5-10 dk → cortizol azaltır

## Ne Zaman Dermatologa?

- 3 ayda akne yanıtsız
- Melasma ağırlaşıyor
- Saç dökülmesi 6 ay sonrası geçmiyor
- Stretch mark çok geniş alanlı (postpartum striae alba)
- Atopik dermatit kontrol altında değil
- Mantar enfeksiyonu (tinea cruris postpartum yaygın)

## Kaynaklar

- Putra IB et al. *Indian J Dermatol Venereol Leprol* 2016 (cosmetic during lactation)
- Bozzo P et al. *Can Fam Physician* 2011 (skincare during pregnancy/lactation)
- Tunzi M & Gray GR. *Am Fam Physician* 2007 (postpartum dermatoses)
- AAD Postpartum Skincare Guidelines`,
  },

  {
    title: 'Hassas + Akneye Yatkın: İki Profil Bir Arada Cilt Bakımı',
    slug: '2026-04-30-hassas-akneli-kombo',
    content_type: 'comparison',
    summary: 'Hassas cilt + akneye yatkın çift profili nadir ama zorlu. Tahriş etmeyen + akne tedavi eden aktifler arasındaki denge. Yumuşak BHA, niasinamid, azelaik kombinasyonu, tetikleyici tespit.',
    body_markdown: `## Çelişen İhtiyaçlar

Hassas + akneli kombinasyon **dermatolojide zor sınıflandırma**:

- **Akne tedavisi**: aktifler tahriş eder (BHA, retinol, BPO)
- **Hassas cilt**: tahriş tetikleyici (rosacea + atopik + perioral dermatit)

İkisini birden tedavi etmek **balans + sabır** gerektirir.

## Hassasiyet Sınıflandırması

İlk önce hangisi:

### Tip 1: Atopik Hassasiyet
- Aile öyküsü (atopik triad: egzama + astım + alerjik rinit)
- Kaşıntı + pul pul kuruluk
- Belirli alerjenler tetikler (parfüm, esansiyel yağ, paraben, tutarsız)

### Tip 2: Rosacea Hassasiyet
- Yüzde **kalıcı kızarıklık** + telanjektazi
- Sıcak/soğuk/spicy yiyecek tetikleyici
- Genelde 30+ yaş başlangıç
- Akne benzeri papülpüstül (rosacea papulopustular alt tipi)

### Tip 3: Bariyer Hasarı (Geçici)
- Aşırı eksfoliyasyon sonrası
- Retinol/AHA toleransı kayıp
- Çekme + sıkışma + ürün uyumsuzluğu

### Tip 4: Perioral Dermatit
- Dudak + burun çevresi + çene papülpüstüller
- Floride toothpaste, kortikosteroid kullanımı tetikleyici
- Dermatolog tedavisi

## Akne Sınıflandırması

### Komedonal Akne
- Açık + kapalı komedon
- Lezyon enflamatuvar değil
- Tedavi: salisilik + retinol

### Enflamatuvar Papülpüstüler
- Kızarık + ağrılı papül
- Püstül (içinde irin)
- Tedavi: BPO + topikal antibiyotik + retinol

### Nodülokistik
- Derin + kalıcı nodül + kist
- Skar bırakma riski yüksek
- Tedavi: oral isotretinoin (dermatolog)

### Hormonal
- Çene + jaw line + boyun
- Menstural döngüye bağlı
- Tedavi: spironolactone + oral kontraseptif (kadın)

## Çift Profilde Yumuşak Aktifler

### Niasinamid (B3) — Altın Standart

- Anti-enflamatuvar + sebum + akne + hassas cilt **hepsi** uygun
- %5 günlük, sabit aktif

### Azelaik Asit %10

- Anti-bakteriyel + komedolitik + tirozinaz inhibitörü
- **Rosacea + akne ikisinde de** AB onaylı
- Hamilelikte güvenli (kategori B)

### PHA (Polyhydroxy Acid)

- AHA grubu ama **daha yumuşak**
- Gluconolactone, lactobionic acid
- Hassas cilt eksfoliyasyonu

### Centella Asiatica

- Anti-enflamatuvar + bariyer destekçi
- Akne + rosacea kombinasyonunda K-beauty tercih

### Salisilik %0.5-1 Yıkanan

- Leave-on yerine **cleanser formülasyonu**
- Tahriş eşiği düşük, gözenek temizliği

### Madekassosid

- Centella'nın izole aktifi
- Premium hassas + akne

### Sodium PCA + Hyaluronik

- Bariyer humektant
- Hiçbir tahriş riski

## Çift Profilde KAÇINILACAK Aktifler

❌ **Yüksek konsantre eksfoliyantlar**:
- Glikolik asit %10+ (PHA'ya geç)
- Salisilik %2+ leave-on

❌ **Benzoyl Peroxide %5-10**:
- Tahriş eşiği yüksek hassasiyet için
- %2.5 spot tedavisi olabilir

❌ **Retinol yüksek konsantrasyon**:
- %0.3 başlangıç, sandwich method zorunlu
- Bakuchiol alternatifi

❌ **Esansiyel yağ + parfüm**:
- "Doğal" iddialı ama tahriş tetikleyici
- Fragrance-free zorunlu

❌ **Yüksek alkol**:
- "Drying lotion" stilinde toner
- Bariyer çöker

## Çift Profil Rutini

### Ay 1: Bariyer Stabilize

- Sabah: Yumuşak cleanser → Niasinamid %5 → Centella krem → Mineral SPF
- Akşam: Yumuşak cleanser → Niasinamid + HA → Bariyer kremi
- Aktif YOK

### Ay 2-3: Akne Müdahalesi

- Sabah: aynı rutin + Azelaik %10 ekle (sabah + niacinamid sonrası)
- Akşam: Cleanser → Salisilik %0.5 toner haftada 3 gece → Niasinamid → Bariyer kremi
- Tolerans gelişince: PHA toner haftada 1-2 ekle

### Ay 4-6: Stabilize

- Sabah: Cleanser → Niasinamid → Azelaik → SPF
- Akşam: Cleanser → Skin cycling protokolü:
  - Gece 1: BHA salisilik %0.5
  - Gece 2: Bakuchiol %0.5-1 (retinole alternatif)
  - Gece 3-4: Bariyer dinlenme
- Lekek tedavisi (post-akne): alpha-arbutin sabaha eklenir

## Tetikleyici Tespit (Detective Work)

Akne + rosacea/hassas çiftinde tetikleyiciler:

### Çevresel
- Stres, uyku eksik (kortizol artar)
- Sıcak hava + nem (vazodilatasyon + sebum)
- Hava kirliliği (PM2.5, ozon)

### Beslenme
- Süt ürünleri (insulin → akne)
- Yüksek glisemik indeks (insulin → akne)
- Spicy yiyecek (rosacea flare)
- Alkol (vazodilatasyon)
- Çikolata (literatür karışık)

### Topikal
- Yeni ürün (patch test 24-48 saat zorunlu)
- Eksfoliyant aşırı kullanımı
- Sıcak su yıkama

### Hormonal
- Menstural döngü
- Postpartum
- Polikistik over sendromu (PCOS)

## Pratik Strateji

1. **Patch test her yeni ürün**: kola iç, 24-48 saat
2. **Aktif eklemek bir seferde bir tane**: 2 hafta gözlem
3. **Ürün rotasyonu**: aşırı kullanımdan kaçın
4. **Beslenme defteri**: 1 ay tutarsa pattern ortaya çıkar
5. **Stres yönetimi**: meditasyon, uyku, egzersiz
6. **Dermatolog yönlendirmesi**: 3-6 ay rutine yanıtsız akne

## Ne Zaman Dermatologa?

- 3-6 ay yumuşak rutine yanıtsız akne
- Rosacea papülpüstüler şiddetlenmesi
- Atopik dermatit + akne kombinasyonu kontrolsüz
- Skar bırakma riski (nodülokistik)
- Reçeteli adapalene veya tretinoin gerek
- Oral terapi (spironolactone, isotretinoin) için

## Kaynaklar

- Hayashi N et al. *J Dermatol* 2008 (acne guidelines)
- Wilkin J et al. *J Am Acad Dermatol* 2002 (rosacea classification)
- Schulte BC et al. *Br J Dermatol* 2015 (azelaic acid RCT)
- AAD Combined Skin Type Guidelines`,
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
