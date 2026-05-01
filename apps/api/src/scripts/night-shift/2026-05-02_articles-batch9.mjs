// D — Articles batch 9: 10 yeni makale (90 → 100, yuvarlak sayı)
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ARTICLES = [
  {
    title: 'Bütçe Bakımı: 200 TL Altında Etkili Cilt Rutini',
    slug: '2026-05-02-butce-bakimi-200-tl',
    content_type: 'guide',
    summary: 'Premium markalardan vazgeçmeden bütçe dostu seçenekler. The Ordinary, Procsin, INKEY List, eczane jenerikleri — bilim temelli ucuz aktifler.',
    body_markdown: `## Pahalı = Daha İyi mi?

Kozmetik fiyat-performans çoğu zaman korelasyonsuz. SkinCeuticals C E Ferulic ($170) ile The Ordinary Vitamin C Suspension 23% ($7) — formülasyon farkı var ama klinik etki **eşdeğer kategoride**. 25× fiyat farkı pazarlamadan geliyor.

## 200 TL Altında Tam Rutin

### Cleanser (50-80 TL)
- **CeraVe Hydrating Cleanser** (orijinal) — ceramide + niasinamid, hassas cilt
- **The Inkey List Oat Cleansing Balm** — kolloidal yulaf, atopik
- **Eczane Procsin Saç Bakım Şampuanı** (cilt için değil)

### Niasinamid Serumu (45-70 TL)
- **The Ordinary Niacinamide 10% + Zinc 1%** — pazarın altın bütçe standardı
- **The Inkey List Niacinamide** — orta-üst kalite

### Salisilik Asit (50-80 TL)
- **The Ordinary Salicylic Acid 2% Solution** — leave-on toner
- **Procsin Active Salicylic Cleanser** — yıkanan formül

### SPF (40-100 TL — en kritik tasarruf)
- **Sebamed Sunbar SPF 50** — eczane, hassas cilt
- **Garnier Ambre Solaire Wet Skin** — bütçe geniş spektrum
- **Bioderma Photoderm Mineral** (premium ama indirimde 80 TL)

### Nemlendirici (60-90 TL)
- **CeraVe Moisturizing Lotion** — ceramide + niasinamid
- **Sebamed Clear Face Care Gel** — yağlı cilt
- **The Ordinary Natural Moisturizing Factors** — NMF, çok bütçe

### Toplam Aylık Maliyet: ~180-220 TL

| Ürün | Süre | Aylık Maliyet |
|------|------|---------------|
| CeraVe Cleanser 236ml | 3 ay | 50 TL/ay |
| The Ordinary Niasinamid 30ml | 2-3 ay | 25 TL/ay |
| Salisilik Asit 30ml | 2-3 ay | 25 TL/ay |
| Sebamed SPF 75ml | 2 ay | 30 TL/ay |
| CeraVe Moisturizing 236ml | 3 ay | 35 TL/ay |
| **Toplam** | | **~165 TL/ay** |

## "Premium Yatırım" Önerileri

200 TL bütçeyi aşmadan, sadece **1 ürünü** premium yapsan:
- **SkinCeuticals C E Ferulic** ($170, ~5000 TL) — Lin 2003 RCT klasik
- **La Roche-Posay Anthelios UVMune 400** (650 TL) — Mexoryl 400 + Tinosorb S
- **Skinceuticals Triple Lipid 2:4:2** ($142) — Man 1996 trio standart

## Kaçınılması Gereken Pahalı Ürünler

- "Anti-aging eye cream" özel ürünleri — yüz kreminden farklı değil
- "Caviar / Gold / Diamond" iddialı premium pazarlama
- "Bio / organik" sertifikasız iddialar
- "DNA yenileme" tarzı bilimsel olmayan iddialar

## REVELA Yardımı

REVELA platformunda her ürünün:
- Tahmini fiyat (Trendyol, Hepsiburada, eczane)
- Bilimsel skor (etkililik kanıt-temelli)
- Alternatif ürün önerisi (skor benzer + fiyat düşük)

Bütçe filtreleme + skor sıralaması tek yerde.

## Kaynaklar

- The Ordinary / Deciem product line
- Procsin yerel formülasyonlar
- CeraVe / La Roche-Posay eczane satışı
- Sebamed pediatrik klasiği`,
  },

  {
    title: 'INCI Listesi 5 Saniyede Anla: Acil Etiket Okuma',
    slug: '2026-05-02-inci-5-saniye-anla',
    content_type: 'label_reading',
    summary: 'Mağazada hızlı karar için 5 saniyelik etiket okuma protokolü. İlk 5 INCI, kırmızı flag bileşenler, parfüm tespit, SPF doğrulama.',
    body_markdown: `## 5 Saniye, 5 Soru

Mağazada elinde ürün, vakit kısıtlı. Sırayla bu 5 soruyu sor:

### 1. İlk 3 INCI — Ürünün Ana Yapısı

İlk 3 INCI ürünün **%70+'ı**. Burada ne görmek istiyorsun?

**Yüz krem:**
- ✅ Aqua + glycerin + iyi yağ (squalane, jojoba, shea)
- ❌ Aqua + alcohol denat + fragrance (kurutucu, alerjenik)

**Cleanser:**
- ✅ Aqua + cocamidopropyl betaine + glycerin
- ❌ Aqua + sodium lauryl sulfate + parfum (sert)

**SPF:**
- ✅ Mineral filtreler (zinc oxide, titanium dioxide) ya da modern (Tinosorb)
- ❌ Sadece octinoxate + oxybenzone (eski nesil + endokrin tartışması)

### 2. Aktif Madde — Etkin Konsantrasyon mu?

Aktif INCI sırası:
- **İlk 5'te** → muhtemelen %1+ (etkin)
- **Phenoxyethanol'dan sonra** → %1 altı (etkisiz "pixie dust")

Phenoxyethanol AB max %1 — sıralama göstergesi.

### 3. Parfüm Var mı? (Hassas Cilt için Kritik)

Etiketin son üçte birinde tara:
- "Parfum" / "Fragrance" / "Aroma" → parfüm var
- "Linalool, Limonene, Citronellol, Geraniol" → AB 26 alerjen listesinde
- "Fragrance-free" / "Parfümsüz" yazılı mı? Onay.

### 4. Kırmızı Flag Bileşenler

Bu kelimelerden 1+ varsa düşün:
- **Cilt için**: Methylisothiazolinone (allerjen), formaldehyde donörler
- **SPF**: Oxybenzone, Octinoxate (endokrin endişe — yine de AB onaylı)
- **Pazarlama tuzakları**: "Fragrance-free" + "linalool" çelişkisi

### 5. Üretim Kalitesi İpuçları

- AB üretimi (Made in EU/France/Germany) — daha sıkı regülasyon
- Üretim tarihi / Son kullanma tarihi — taze mi
- Ambalaj kalitesi (cam > plastik > pump > kavanoz light-stable mi)

## Pratik Etiket Tarayıcı (5 saniyelik checklist)

- İlk 3 INCI: ürün omurgası tanı
- Aktif madde ilk 5'te mi: etkililik
- Parfum / fragrance var mı: hassasiyet
- AB 26 alerjen sayısı: hassasiyet detay
- Phenoxyethanol konumu: konsantrasyon ipucu

## REVELA QR Kod (Geliyor)

Q3 2026: Mağazada ürün barkodunu tara → REVELA Skoru + 5 saniyelik etiket analizi anında telefonunda. Şu an web'de manuel.

## Kaynaklar

- AB Cosmetic Regulation 1223/2009
- INCI Standard List
- ACDS Patch Test Database`,
  },

  {
    title: '"Glow" Cilt Için Bilimsel Yaklaşım: Parlaklık Nasıl Sağlanır?',
    slug: '2026-05-02-glow-cilt-bilimsel',
    content_type: 'guide',
    summary: '"Glow" pazarlama kelimesi mi, somut hedef mi? Parlaklığın bilimsel temeli — ışık yansıması, hidrasyon, eksfoliyasyon, antioksidan. 4 haftalık glow protokolü.',
    body_markdown: `## "Glow" Nedir?

Glow pazarlama tarafında çok kullanılan bir kelime. Ama bilimsel olarak parlaklık 4 faktörden oluşur:

1. **Yüzey pürüzsüzlüğü** → ışığı uniform yansıtır (eksfoliyasyon)
2. **Cilt hidrasyonu** → şişen korneositler ışığı kırar (humektant)
3. **Mikrosirkülasyon** → kapilerler aktif → kırmızı-pembe ton (kafein, ginseng)
4. **Antioksidan koruma** → oksidatif hasar yok → açık ten tonu (C vit, niasinamid)

Glow = bu 4'ün toplamı.

## 4 Haftalık Glow Protokolü

### Hafta 1: Bariyer + Hidrasyon

**Hedef:** stratum corneum su içeriği +%30

- Sabah: Cleanser → Hyaluronik serum → Niasinamid → Hafif krem → SPF
- Akşam: Cleanser → HA serum → Ceramide krem
- **Aktif yok** — bariyer hazırlama

### Hafta 2: Eksfoliyasyon Başlat

**Hedef:** ölü hücre temizleme, ışık yansımasını arttır

- Sabah: aynı + niasinamid
- Akşam: Cleanser → AHA toner haftada 2-3 → krem
- Glikolik %5-7 başlangıç, tolerans gelişince mandelik veya laktik %10

### Hafta 3: Antioksidan Stack

**Hedef:** UV + çevresel stres koruması, açık ten

- Sabah: Cleanser → **C vit %10-15** → niasinamid → krem → SPF (mineral + iron oxide)
- Akşam: aynı (retinol cycling başlat haftada 2 gece)

C vit + E vit + ferulic asit kombinasyonu klasik glow stack (Lin 2003 RCT).

### Hafta 4: Stabilize + Optimize

**Hedef:** sürdürülebilir protokol

- Sabah: C vit + niasinamid + SPF
- Akşam: skin cycling — AHA / retinol / dinlenme / dinlenme
- Haftada 1-2: yatıştırıcı maske (centella, oat, mikrobiyom)

## "Glow Drops" / Highlighter İpucu

Doğru bakım yoksa highlighter sahte parlaklık verir. Bakım sonrası mikro shimmer içeren tonlu nemlendirici (örn. **Glossier Skin Tint** veya **Drunk Elephant D-Bronzi**) doğal parlaklık vurgular.

## Kaçınılması Gerekenler

- ❌ "Glow" iddialı agresif eksfoliyant peeling — bariyer çöker, sahte parlaklık
- ❌ "Sıkılaştırıcı" pumpkin enzim agresif maskeler — geçici, sürdürülemez
- ❌ Glitter mineral SPF — UV koruma yetersiz olabilir

## Pratik Doğal Glow Beslenmesi

İçten dışa:
- Omega-3 yağlı balık + chia tohumu
- Yeşil çay (EGCG antioksidan)
- C vit zengin meyveler (kuşburnu, nar)
- Magnezyum (avokado, badem) — uyku kalitesi

## REVELA Glow Filtresi

Yakında REVELA'da "Glow" ihtiyaç filtresi: aktiflerin glow'a katkısı skoru. Şu an manuel arama.

## Kaynaklar

- Lin 2003 (CE Ferulic RCT)
- Bissett 2005 (Niasinamid)
- Smith 1996 (AHA glow)
- Bowe 2022 Skin Cycling`,
  },

  {
    title: 'Cilt Bakım Mitleri: 10 Yaygın Yanlış Kanı',
    slug: '2026-05-02-cilt-mitleri-10',
    content_type: 'guide',
    summary: '"Por kapanır", "kollajen kreminden gelir", "doğal her zaman güvenli", "yağlı cilde nemlendirici gerekmez" — 10 popüler mit ve bilimsel gerçeği.',
    body_markdown: `## 10 Yaygın Mit

### 1. "Soğuk su gözenekleri kapatır"

❌ Yanlış. Gözenek **kas yapısı yok** — açıp kapanmaz. Soğuk su sadece geçici vazokonstriktör — kızarıklık azalır, gözenek görünmez olmaz. Por görünümü için niasinamid + retinol.

### 2. "Kollajen kreminden cilde geçer"

❌ Yanlış. Kollajen molekülü çok büyük (300-400 kDa), stratum corneum'u **geçemez**. Topikal kollajen sadece yüzey film + humektant etkisi yapar. Kollajen sentezi için **tetikleyici aktifler** gerek: retinol, peptit, C vit.

### 3. "Doğal her zaman güvenli"

❌ Yanlış. Esansiyel yağlar (lavanta, çay ağacı) **doğal alerjenler**. AB 26 alerjen listesinde linalool, limonene, citronellol gibi doğal moleküller var. Sentetik niasinamid hipoalerjeniktir, doğal lavanta yağı %10+ kontakt dermatit yapabilir.

### 4. "Yağlı cilt nemlendirici istemez"

❌ Yanlış. Sebum (yağ) ile su içeriği farklı şeyler. Yağlı cilt **dehidre olabilir** — sıkışma + parlama paradoks. Hafif jel + niasinamid + HA çözüm.

### 5. "SPF kullanırsam D vit eksik kalır"

❌ Yanlış. SPF 30 UV'nin %3'ünü geçirir — D vit sentezi için yeterli. Ama gerçekte çoğu kişi yetersiz miktar uygular — pratikte SPF 30 → SPF 10. D vit eksik olabilir ama SPF nedeni değil — gıda + güneş süresi yetersizliği.

### 6. "Akne kötü beslenme + kirli cilt yüzünden"

❌ Yanlış. Akne **hormonal + genetik + sebum-bakteri** etkileşimi. Kötü beslenme sadece bir tetikleyici (yüksek glisemik + süt). Sıkı temizlik aslında bariyeri çökertir, akneyi kötüleştirir.

### 7. "Pahalı ürün her zaman daha iyi"

❌ Yanlış. The Ordinary Niasinamid 10% ($5) ile SkinCeuticals niasinamid serum ($98) klinik olarak eşdeğer. Premium fiyat formülasyon kalitesini gösterir ama **etkililik konsantrasyon + pH'a bağlı**, marka adına değil.

### 8. "Retinol gece + güneş yanığı"

⚠️ Yarı doğru. Retinol **fotostabil değil** — gece kullanımı doğru. Ama "güneş yanığı yapar" abartılı. Retinol UV duyarlılığını artırır, **doğru sabah SPF 30+ ile sorun yok**. Yine de tahriş eşik düşürür.

### 9. "Toner zorunlu"

❌ Yanlış. Toner Asya kozmetik kültüründen gelir, modern bilim **opsiyonel** kabul ediyor. Cleanser → serum direkt geçişi yeterli. Toner sadece pH dengeleme için yararlı — sülfat-free cleanser kullananlar için gereksiz.

### 10. "Genç yaşta anti-aging başlamak yaşlandırır"

❌ Yanlış. SPF + niasinamid + antioksidan **önleyici** etki. Retinol 25+ yaşta tahriş riski olabilir ama düşük doz başlangıç güvenli. **20'li yaşlarda önleme = 40'lı yaşlarda az tedavi**.

## Bonus: REVELA'da Mit-Çürütme

Her ingredient sayfasında "yaygın yanlış kanılar" bölümü:
- /icerikler/dimethicone → "silikon nefessizleştirir" mitinin çürütülmesi
- /icerikler/propylene-glycol → "antifriz" karışıklığının açıklanması
- /icerikler/parfum → "doğal parfüm güvenli" mitinin çürütülmesi
- /icerikler/sodium-hydroxide → "lye kostik" kullanım context

## Kaynaklar

- AAD Position Statements
- ACDS (American Contact Dermatitis Society)
- CIR / SCCS güvenlik raporları
- Peer-reviewed dermatoloji review`,
  },

  {
    title: 'Eczacının Reçetesiz Verdiği Aktifler ve Nasıl Kullanmalı',
    slug: '2026-05-02-eczacida-reçetesiz-aktifler',
    content_type: 'guide',
    summary: 'Türkiye eczanelerinde reçetesiz alınabilen tedavi seviyesi aktifler. Adapalene Differin, BPO %5, azelaik %10 jeller, kullanım protokolleri.',
    body_markdown: `## Reçeteli vs Reçetesiz Türkiye Sınırı

Türkiye'de bazı aktif maddeler eczaneden **reçetesiz** alınabilir, ama dermatolojik takip gerektirir. ABD/İngiltere'de OTC olan bazı ürünler Türkiye'de reçeteli.

## Reçetesiz Eczane Aktifleri

### Salisilik Asit %2 Jel (Toner)

**İndikasyon:** akne, komedon, follicular keratosis pilaris.

**Kullanım:**
- Akşam temiz cilde, haftada 2-3 başlangıç
- Tolerans gelişince her gece
- Sabah mineral SPF zorunlu

**Marka:** Procsin Active, La Roche-Posay Effaclar, Bioderma Sebium

### Benzoyl Peroxide %2.5-5 (Krem)

**İndikasyon:** orta akne, P. acnes baskısı.

**Kullanım:**
- %2.5 başlangıç (yan etki düşük)
- Akşam lokalize lezyon üstüne
- Tahriş gelişirse haftada 3 gece

**Risk:** çamaşır + havlu beyazlatma, retinol ile aynı gece kullanma yasak (BPO retinolü inaktive eder).

**Marka:** Acnex, Benzac AC, Eryacne

### Azelaik Asit %15-20 Jel/Krem (Reçeteli/OTC)

**Türkiye Durum:** %15+ jeller (Skinoren, Finacea) **reçetesiz alınabilir** ama eczacı dermatolog tavsiyesi sorabilir.

**İndikasyon:** akne + rosacea + post-inflammatory hyperpigmentation.

**Kullanım:**
- Günde 2 kez, sabah + akşam
- Sandwich method (nemlendirici → azelaik → nemlendirici)
- 12 hafta görünür sonuç

**Hamilelik:** Kategori B — gebelikte tercih edilen aktif.

### Hidrokortizon %1 Krem (Reçetesiz Düşük Doz)

**İndikasyon:** lokal kontakt dermatit, böcek ısırığı, atopik dermatit alevlenme.

**Kullanım:**
- Sadece **lokalize küçük alana**
- Maksimum 7 gün
- Yüzde dikkatli (atrofiye yol açabilir)

**Risk:** uzun süreli kullanım perioral dermatit, telanjektazi.

### Adapalene %0.1 Jel (Differin) — TÜRKİYE'DE REÇETELİ!

> ⚠️ **Türkiye'de reçeteli** (ABD'de OTC). Dermatologa git.

**İndikasyon:** komedonal + enflamatuvar akne, fotodamage.

**Kullanım (reçete sonrası):**
- Akşam temiz cilde bezelye büyüklüğü
- Haftada 2-3 başlangıç
- 4-6 hafta "purging" (mevcut komedon yüzeye)
- 12-16 hafta görünür sonuç

### Üre %10-25 Krem

**İndikasyon:** kuru cilt, psoriasis, ihtiyoz, kuru topuk.

**Kullanım:**
- %10 yüz, %20-25 vücut
- Günde 1-2 kez
- Akşam sıcak duş sonrası en etkili

**Marka:** Eucerin Urea Repair, Mustela Stelatopia

### Panthenol (B5 Provitamini) %5 Krem

**İndikasyon:** post-laser, post-IPL, retinol/AHA bariyer onarımı, atopik.

**Kullanım:**
- Günde 2-3 kez, lokalize
- Hipoalerjenik, bebek dahil güvenli

**Marka:** Bepanthen, Panthenol Advance

### Centella Asiatica %5 Krem (Cica)

**İndikasyon:** rosacea, hassas cilt, post-prosedür.

**Marka:** La Roche-Posay Cicaplast Baume B5, Avene Cicalfate, Procsin Cica

## Kullanım Protokolü Önerisi

### Hafif Akne (Komedon)

Hafta 1-4: Salisilik %2 toner haftada 3-5 + niasinamid + SPF
Hafta 5-8: Yetersizse azelaik %15 ekle
Hafta 9-12: Hala yetersizse → dermatolog reçeteli adapalene

### Orta Akne (Enflamatuvar)

Hafta 1-2: Bariyer hazırlık (cleanser + bariyer kremi)
Hafta 3-4: BPO %2.5 lokalize + azelaik %15 sabah
Hafta 5-8: Tolerans gelişince retinol ekle
Hafta 9-12: Yanıt yoksa dermatolog (oral antibiyotik / spironolactone / isotretinoin)

### Rosacea Papülpüstüler

Hafta 1-12: Azelaik %15 günde 2 kez + LRP AntiRedness day care + tetikleyici uzaklaşma (sıcak, alkol, spicy)

## Eczacıya 5 Soru

Her eczane satışında sor:
1. Bu ürün hangi etken madde içeriyor? Konsantrasyon?
2. Yan etki olarak en yaygın ne?
3. Hangi cilde uygun değil?
4. Ne zaman sonuç beklemeliyim?
5. Daha ucuz alternatif var mı?

## Ne Zaman Dermatologa Yönlendirme Gerek?

- 12 hafta OTC tedaviye yanıtsız akne
- Şiddetli rosacea (telanjektazi yoğun)
- Skar bırakan nodülokistik akne
- Atopik dermatit kontrolsüz alevlenme
- Şüpheli leke (renk değişimi, asimetri)

## Kaynaklar

- Türk Eczacılar Birliği regülasyon listesi
- AAD Acne Guidelines 2024
- Türk Dermatoloji Derneği Rosacea Konsensüs`,
  },

  {
    title: 'Kış Kuruluğu için Acil Müdahale Rehberi',
    slug: '2026-05-02-kis-kurulugu-acil',
    content_type: 'guide',
    summary: 'Kış başında cilt kuruluk şokunu önleyen 7 günlük acil bariyer onarım protokolü. Üre, ceramide, kolesterol stack ile yoğun nemlendirme.',
    body_markdown: `## Kış Kuruluğu Neden Şiddetli?

Kasım-Şubat arası 4 faktör birleşir:
1. **Düşük nem** — dış %30, iç ısıtma %20
2. **Sebum üretimi azalır** — soğuk = vazokonstriktör
3. **Sıcak duş alışkanlığı** — TEWL fırlar
4. **Yün kıyafet** — mekanik tahriş

Sonuç: TEWL %50+ artar, bariyer çöker.

## 7 Günlük Acil Müdahale

### Gün 1-2: Aktiflerden Tatil

- ❌ Tüm aktifler durdur (retinol, AHA, BHA, C vit)
- ✅ Yumuşak cleanser + HA serum + yoğun bariyer kremi
- ✅ Squalane veya petrolatum (üst kapak oklusiv)
- 🚿 Duş 5 dk + ılık su (38°C max)

### Gün 3-4: Yoğun Bariyer Stack

**Sabah:**
- Yumuşak cleanser
- Hyaluronik serum (multi-MA)
- Niasinamid serum
- **Ceramide + Kolesterol kremi** (CeraVe Moisturizing Cream, La Roche-Posay Lipikar AP+)
- Squalane oklusiv
- Mineral SPF (kar yansıması UV ekstra)

**Akşam:**
- Aynı cleanser
- HA + niasinamid
- Yoğun bariyer kremi (gündüzdene 2x daha kalın)
- Üre %10 lokal (dirsek, topuk, kuru bölgeler)
- Squalane veya shea butter

### Gün 5-7: Stabilize

- Yoğun nemlendirme devam
- Tolerans iyi → bakuchiol veya hafif retinol haftada 2 gece (skin cycling)
- Vücut nemlendirme: Üre %20 + petrolatum

## Kış Kuruluğu Aktif Stack

| Aktif | Kategori | Etki |
|-------|----------|------|
| **Hyaluronik asit (multi-MA)** | Humektant | Anlık nem |
| **Glycerin** | Humektant | Derin hidrasyon |
| **Sodium PCA** | NMF humektant | Cilt doğal faktörü |
| **Ceramide NP/AP/EOP** | Bariyer lipid | Stratum corneum onarımı |
| **Cholesterol** | Bariyer lipid | Trio bileşeni |
| **Linoleik asit** | EFA | Bariyer + anti-enflamatuvar |
| **Squalane** | Oklusiv | TEWL kapatıcı |
| **Shea butter** | Oklusiv emolyent | Yoğun nemlendirme |
| **Petrolatum** | Premium oklusiv | TEWL %99 azaltma |
| **Üre %10-20** | Humektant + keratolitik | Kuru topuk + dirsek |
| **Ektoin** | Stres koruyucu | Çevresel stres tampon |

## Kış Bakım Hata Listesi

❌ **Sıcak su** — TEWL fırlar, bariyer çöker
❌ **Sülfat içeren cleanser** — kuruluk + kaşıntı
❌ **Aktif yoğunlaştırma** — kış zaten zor, retinol/AHA ekleme
❌ **Parfümlü krem** — alerjen + tahriş
❌ **Kalın yün boyna direkt temas** — mekanik tahriş + atopik flare

## Vücut Bakımı (İhmal Edilmesin)

Kış ekstra zorlu:
- Banyo sonrası 3 dk içinde nemlendirici (nemli cilde)
- Vücut için Eucerin Aquaphor / CeraVe Moisturizing Cream / Bepanthen Body
- El kremi sürekli (her el yıkamadan sonra)
- Dudak balsamı (Aquaphor / Bepanthen / Carmex)

## Atopik Dermatit Kış Alevlenme

Kış atopik flare için:
1. Yoğun bariyer kremi 2-3× günlük
2. Hidrokortizon %1 lokalize **maksimum 7 gün** (hekim onayı)
3. Tetikleyici uzaklaşma (yün, parfümlü deterjan, sıcak duş)
4. **Humidifier** ile %50-60 oda nemi
5. Şiddetli alevlenme → dermatolog (tacrolimus, dupilumab)

## Beslenme Desteği

İçten dışa kış desteği:
- Omega-3 (yağlı balık 2x/hafta)
- D vit takviyesi (Türkiye nüfusunda kış eksik %60+)
- Zinc 10-15 mg/gün
- Çinko + magnezyum bariyer için
- Bol su (bedensel hidrasyon ≠ topikal ama destek)

## REVELA Kış Filtreleme

REVELA'da arama: "kış cilt", "atopik dermatit", "bariyer onarım" — kış aktifleri toplu listelenir.

## Kaynaklar

- Wei 2016 (mevsim TEWL)
- Engebretsen 2016 (atopik + nem)
- Anderson 2010 (UV mevsim)`,
  },

  {
    title: 'Vegan Kollajen Alternatifleri: Bilim Ne Diyor?',
    slug: '2026-05-02-vegan-kollajen-alternatifleri',
    content_type: 'comparison',
    summary: 'Hayvansal kollajen vs vegan alternatifler — fitokimyasallar, peptitler, rekombinan kollajen. Hangisi gerçek kollajen sentezi tetikliyor?',
    body_markdown: `## Hayvansal Kollajen Topikal Etkili mi?

❌ **Topikal hayvansal kollajen ciltten geçemez**. Molekül 300-400 kDa, stratum corneum'u **aşamaz**. Cilt yüzeyinde sadece **film + humektant** etkisi yapar.

→ "Kollajen kremi" sahte vaad. Ama **vegan alternatifler** asıl mekanizma için gerçek değer üretir.

## Vegan Kollajen Sentezi Tetikleyicileri

### 1. Vitamin C (Askorbik Asit)

**Mekanizma:** prokollajen hidroksilaz enziminin **eş-faktörü**. C vit olmadan kollajen sentezi durur.

- %10-20 askorbik asit topikal (gold standard)
- 3-O-Ethyl Ascorbic Acid (kararlı C vit türevi)
- Sodium Ascorbyl Phosphate
- Ascorbyl Glucoside

**Kanıt:** Lin 2003 (J Invest Dermatol) — %15 askorbik asit + %1 tokoferol + ferülic asit, foto-koruma + kollajen sentezi RCT.

### 2. Retinoidler

**Mekanizma:** retinoik asit reseptörü (RAR) → kollajen tip I + III gen ekspresyonu artar.

- Retinol %0.3-1 (OTC)
- Retinaldehit %0.05-0.1 (OTC, daha güçlü)
- Tretinoin %0.025-0.1 (reçeteli, gold standard)

### 3. Peptit Aktifleri

**Mekanizma:** kollajen parçalanma fragmanlarını taklit ederek fibroblastı kandırır → "kollajen yıkımı oldu, yeniden sentez gerek".

- **Matrixyl (Pal-KTTKS)** — Robinson 2005 (Int J Cosmet Sci) %3 ppm, 12 hafta kıvrım %44 azalma
- **Matrixyl 3000 (Pal-GHK + Pal-GQPR)** — yara iyileşmesi sinerjisi
- **GHK-Cu (Bakır Tripeptit)** — Pickart 2008 review, 30+ yıl kanıt

### 4. Bakuchiol

**Mekanizma:** *Psoralea corylifolia* fitokimyasalı, retinole benzer transkripsiyonel cevap. Yapısal olarak benzemez ama RAR yolağına benzer etki.

**Kanıt:** Dhaliwal 2019 (Br J Dermatol) — %0.5 bakuchiol vs %0.5 retinol non-inferior + tahriş anlamlı az.

### 5. Centella Asiatica (Asiatikozit)

**Mekanizma:** triterpenoid saponin, fibroblast modulasyonu → kollajen tip I + III sentezi.

**Kanıt:** Bonté 1994 (Eur J Pharmacol) — %5 asiatikozit, fibroblast kollajen tip I sentezi 5× artış.

### 6. Soy İzoflavonları (Östrojen Mimic)

**Mekanizma:** menopoz sonrası kollajen kaybını yavaşlatır. Sentetik estrojen alternatifi (HRT olmaksızın).

**Kanıt:** Sümmüğüm 2008 — soy izoflavon + retinol, post-menopoz kollajen kaybını yavaşlatır.

### 7. Rekombinan Kollajen (2024+)

**Yeni teknoloji:** sentetik biyoloji — bakteri/maya genetik mühendislik ile insan kollajen tip I üretir. Hayvansal kaynak yok, %95+ saf.

**Marka:** **Prollenium / Geltor / Modern Meadow** — şu anda topikal değil, oral suplement piyasasında.

**Sınırlama:** rekombinan kollajen de **topikal stratum corneum'u geçemez** — oral kullanım dominant.

## Karşılaştırma Tablosu

| Aktif | Kanıt Seviyesi | Vegan | Penetrasyon | Maliyet |
|-------|----------------|-------|-------------|---------|
| Hayvansal kollajen topikal | D (yüzey film) | ❌ | Geçemez | Orta |
| C vit %15 | A (RCT) | ✅ | İyi | Düşük-orta |
| Retinol %0.5 | A (RCT) | ✅ | İyi | Düşük-orta |
| Tretinoin %0.025 (reçete) | A (gold) | ✅ | Çok iyi | Düşük (reçete) |
| Matrixyl %3 ppm | A (RCT) | ✅ | İyi | Yüksek |
| GHK-Cu | A (RCT) | ✅ | İyi | Yüksek |
| Bakuchiol %0.5 | B (Dhaliwal RCT) | ✅ | İyi | Orta |
| Asiatikozit %5 | B | ✅ | İyi | Orta |
| Rekombinan kollajen oral | C (sınırlı klinik) | ✅ | N/A (oral) | Yüksek |

## Pratik Vegan Anti-Aging Stack

**Sabah:**
- C vit %15 + E vit + ferulic asit (Drunk Elephant C-Firma, The Ordinary 23%, Skinceuticals CE Ferulic)
- Niasinamid %5
- SPF mineral

**Akşam:**
- Bakuchiol %0.5-1 (gece 2-3) veya Retinol %0.3-0.5 (cycling)
- Matrixyl 3000 + Bakır Tripeptit serum
- Ceramide + bariyer kremi

**Sürdürülebilirlik:** vegan + cruelty-free + bilim-temelli + sürdürülebilir.

## REVELA'da Vegan Filtreleme

Yakında: REVELA'da "vegan" ve "cruelty-free" filtreleri ürün listesinde. Şu an manuel arama.

## Kaynaklar

- Lin 2003 (CE Ferulic)
- Robinson 2005 (Matrixyl)
- Pickart 2008 (GHK-Cu)
- Dhaliwal 2019 (Bakuchiol)
- Bonté 1994 (Asiatikozit)`,
  },

  {
    title: 'Cilt Lekesi Tipleri: PIH, PIE, Melasma, Lentigo Nasıl Ayırılır?',
    slug: '2026-05-02-leke-tipleri-ayirma',
    content_type: 'guide',
    summary: 'Tüm lekeler aynı değil — PIH (kahverengi), PIE (kırmızı), melasma (hormonal), lentigo (yaş). Her tip için farklı tedavi protokolü.',
    body_markdown: `## 4 Ana Lekek Tipi

Lekek pazarlamada "leke" diye geçer ama aslında 4 ayrı durum:

### 1. PIH — Post-Inflammatory Hyperpigmentation

**Renk:** Kahverengi, koyu kahve.
**Sebep:** Akne, ekzema, kontakt dermatit sonrası — enflamasyon **melanosit aktivitesi** tetikler.
**Lokasyon:** Lezyon olduğu yerde (akne çevresinde, eski bölge).
**Süre:** 6 ay-2 yıl kalıcı (tedavisiz).

**Tedavi:**
- Niasinamid %5 (melanin transferini bloklar)
- Alpha-arbutin %2 (tirozinaz inhibitörü)
- Azelaik asit %10
- C vit %15 (antioksidan + tirozinaz)
- AHA/BHA (yüzey eksfoliyasyon)

### 2. PIE — Post-Inflammatory Erythema

**Renk:** Kırmızı, pembe.
**Sebep:** Akne, lazer, agresif eksfoliyasyon sonrası — vasküler kalıcılaşma.
**Lokasyon:** Lezyon olduğu yerde.
**Süre:** 3-6 ay kendiliğinden geçer.

**Tedavi:**
- **Mekanik tahrişi durdur** (ovuşturma, agresif eksfoliyasyon)
- Niasinamid + centella + bakuchiol
- IPL veya pulsed dye laser (klinik)
- Tranexamic asit topikal (vasküler bileşenli)

> ⚠️ **PIH ile karıştırılmamalı.** PIH için arbutin/kojic kullanımı PIE'da etkisiz. PIE vasküler — pigment azaltıcılar yardım etmez.

### 3. Melasma — Hormonal Hiperpigmentasyon

**Renk:** Açık kahve - koyu kahve, simetrik.
**Sebep:** Hormonal (östrojen + UV + genetik). Gebelik (gebelik maskesi), oral kontraseptif, menopoz.
**Lokasyon:** Yanaklar, alın, üst dudak, çene — **simetrik patern**.
**Süre:** Yaşam boyu — kontrolsüz UV ile alevlenme.

**Tedavi:**
- **SPF mineral + iron oxide günlük** (HEV koruması) — en kritik!
- Tranexamic asit topikal %3-5 (vasküler + plazmin yolağı)
- Alpha-arbutin %2 + niasinamid
- Hidrokinon %4 (reçeteli, dermatologa)
- Kojic asit %1 (rotasyon)
- Mikroinjeksiyon traneksamik (klinik)

> Melasma **kontrol** odaklı. Tamamen iyileşmez, ama dramatik soluklaşır.

### 4. Lentigo — Yaş + Güneş Lekesi

**Renk:** Açık kahve - koyu kahve, sınırları net.
**Sebep:** Birikmiş UV hasarı (yıllar boyu), genetik.
**Lokasyon:** El üstleri, yüz (yanak elmacık kemikleri), göğüs üstü.
**Süre:** Kalıcı — tedavi olmazsa kendiliğinden geçmez.

**Tedavi:**
- Tretinoin %0.025-0.05 reçeteli (gece)
- C vit %15-20 (sabah)
- Alpha-arbutin %2
- Q-switched lazer (klinik, en etkili)
- Picosecond lazer (premium klinik)

## Ayırma Tablosu

| Tip | Renk | Lokasyon | Sebep | İyileşme |
|-----|------|----------|-------|----------|
| **PIH** | Kahverengi | Lezyon yerinde | Enflamasyon | 6 ay-2 yıl + tedavi |
| **PIE** | Kırmızı | Lezyon yerinde | Vasküler | 3-6 ay kendiliğinden |
| **Melasma** | Açık-koyu kahve simetrik | Yanak/alın/dudak üstü | Hormonal + UV | Yaşam boyu kontrol |
| **Lentigo** | Net sınırlı kahve | El, yüz, göğüs | UV birikimi | Tedavi kalıcı |

## Tedavi Önceliği

### Hafif PIH (post-akne)

Hafta 1-12: Niasinamid + Alpha-arbutin + SPF
%70+ vakada 12 hafta yeterli.

### Orta-Şiddetli PIH

Yukarıya ekle:
- Azelaik %10 sabah
- Glikolik %5-10 haftada 3 gece
- Reçeteli tretinoin (dermatolog)

### PIE (Kırmızı)

- **Aktif tedavi yapma** — kendiliğinden geçer
- Niasinamid + centella yatıştırıcı
- 3 ay yanıt yoksa → IPL (klinik)

### Melasma

**Tedavi piramidi:**
1. SPF mineral + iron oxide (zorunlu, üst kısım)
2. Tranexamic %3-5 + alpha-arbutin (orta)
3. Hidrokinon %4 (dermatolog onayı)
4. Mikroinjeksiyon (klinik, dirençli vakalar)

### Lentigo (Yaş Lekesi)

- Reçeteli tretinoin gece
- C vit + niasinamid + alpha-arbutin sabah
- 12 hafta yetmiyor → klinik lazer (Q-switched)

## Yanlış Tanı Tuzağı

❌ "Bu PIE değil PIH" → kırmızıya pigment ürünü uygulamak yanıtsız.
❌ "Hidrokinon kullan, melasma geçer" → SPF olmadan etki yok.
❌ "Lekek kremi yeterli" → UV koruma olmadan tüm tedaviler etkisiz.

## REVELA Lekek Filtreleme

Yakında: REVELA'da "lekek tipi" filtreleme — kullanıcı PIH/PIE/Melasma/Lentigo seçer, uygun aktifler önerilir.

## Kaynaklar

- Davis & Callender 2010 (PIH/PIE review)
- Sheth & Pandya 2011 (Melasma review)
- Polnikorn 2008 (alpha-arbutin)
- Wu 2012 (traneksamik)`,
  },

  {
    title: '"Doğru Cleanser Seçimi" — pH, Surfaktan, Cilt Tipine Göre',
    slug: '2026-05-02-cleanser-secimi-rehberi',
    content_type: 'guide',
    summary: 'Cleanser yanlış seçimi tüm rutini sabote eder. pH 4.5-5.5, sülfat-free vs sülfat, jel/krem/yağ formülasyon farkları. Cilt tipine göre eşleştirme.',
    body_markdown: `## Cleanser = Rutinin Temeli

Tüm aktifler doğru olsa bile **yanlış cleanser** rutini sabote eder. Sebep:
1. Cilt pH'ını bozar (yüksek pH = bariyer çöker)
2. Sebumu agresif çıkarır (TEWL fırlar)
3. Mikrobiyom ekosistemini bozar

## Doğru Cleanser 5 Kriteri

### 1. pH 4.5-5.5

Cildin doğal pH'ı **5.0** civarı. Cleanser pH 7+ ise (klasik sabun) — bariyer 30-60 dk geri kazanmaya çalışır. Sürekli alkali yıkama → kronik bariyer hasarı.

**Test:** Üreticiden pH bilgisi sor. Türk markalarda etikette nadiren var, ama eczane dermokozmetiklerde belirtilir.

### 2. Sülfat-Free vs Sülfat

**Sülfat (SLS, SLES):** güçlü temizlik, zengin köpük — ama bariyer eşiğine yakın çalışır.

**Sülfat-free alternatifler:**
- **Cocamidopropyl Betaine (CAPB)** — amfoterik, yumuşak
- **Sodium Cocoyl Isethionate** — cilt-uyumlu
- **Lauryl Glucoside** — bitkisel glikozit
- **Sodium Cocoyl Glutamate** — aminoasit bazlı

> Atopik / hassas cilt → sülfat-free zorunlu.
> Yağlı + akneli cilt → sülfat tolere edilebilir, ama gece aktif kullanırken gündüz sülfat-free tercih.

### 3. Aktif İçerik (Cleanser ≠ Tedavi)

Cleanser **yıkanır** — aktiflerin çoğu yetmez sürede. Ama bazı aktifler cleanser'da etkin:
- **Salisilik %0.5-2** (BHA cleanser) — gözenek içine kısa temasla bile etkin
- **Glycolic asit %5-7** — yüzey eksfoliyasyon
- **Niasinamid %2-5** — yıkanan formülde bile faydalı

❌ "Vitamin C cleanser" — etkisiz (askorbik asit yıkanır)
❌ "Retinol cleanser" — etkisiz (retinoid temas süresi yetmez)

### 4. Formülasyon Tipi

**Jel (gel cleanser):** yağlı cilt, akneli, yaz. Hızlı durulama.
**Krem (cream cleanser):** kuru, hassas, kış. Yumuşak temas.
**Yağ (oil cleanser):** makyaj temizleme — ikinci adım cleanser ile ardısı.
**Köpük (foam):** orta — yağlı + normal cilt.
**Mikellar su:** acil temizlik (seyahat, makyaj çıkarma — yıkamayla bitirme).

### 5. Aksesuar Yaklaşımı

❌ **Yıkama bezi + agresif ovuşturma** → bariyer hasarı, mikrobiyom bozulması
✅ **Sadece eller** → yeterli + nazik
✅ **Yumuşak silikon fırça (haftada 2-3)** → mekanik eksfoliyasyon kontrollü
❌ **Klasik plastik fırça** → bakteri ekosistemi, tahriş

## Cilt Tipine Göre Eşleştirme

### Yağlı / Akneye Yatkın

**Sabah:** Yumuşak jel cleanser (cocamidopropyl betaine, pH 5)
- The Ordinary Squalane Cleanser
- CeraVe Foaming
- Bioderma Sebium Foaming

**Akşam:** BHA cleanser (salisilik %0.5-2)
- La Roche-Posay Effaclar Foaming Cleanser
- Procsin Active Salicylic
- Some By Mi AHA-BHA-PHA Toner Cleanser

### Kuru / Hassas

**Sabah:** Krem cleanser (sülfat-free, yumuşak)
- CeraVe Hydrating Cleanser
- La Roche-Posay Toleriane Cream Cleanser
- Aveeno Calm + Restore

**Akşam:** Aynı + ek bariyer destek (ceramide)
- Avene Tolerance Extreme cleanser

### Karma

Sabah: hafif jel
Akşam: T-bölgesi BHA, yanaklar krem (çift ürün)

### Anti-Aging (35+)

**Sabah + Akşam:** PHA bazlı yumuşak eksfoliyant cleanser
- The Inkey List PHA Toner / Cleanser
- Naturium PHA Cleanser

### Hassas + Akneye Yatkın

Çift profilde dengeli:
- Bioderma Sébium Hydra (kremsı yağsız)
- La Roche-Posay Toleriane Foaming

### Atopik Dermatit

Sülfat-free + ceramide:
- CeraVe Hydrating Cleanser
- La Roche-Posay Lipikar Syndet AP+
- Aveeno Skin Relief

## Çift Temizlik (K-Beauty Yaklaşımı)

**Akşam protokolü:**
1. **1. adım:** oil cleanser veya cleansing balm (makyaj + SPF kaldır)
2. **2. adım:** su bazlı cleanser (cilt yüzey temizlik)

> Ağır makyaj + SPF kullanan herkese önerili.
> Ağır makyaj kullanmayan → tek temizlik yeterli.

## Kaçınılacak Cleanser Türleri

❌ **"Cilt sıkılaştırıcı toner cleanser"** — alkol bazlı, agresif
❌ **Klasik sabun (kalıp sabun)** — pH 9-10, bariyer hasarı
❌ **Antibakteriyel cleanser (triclosan)** — mikrobiyom çöker
❌ **"Yüz ovucu" mekanik partikül** — mikro travma, vasküler hasar
❌ **Yağlı parfümlü duş jeli** → yüze kullanmak

## REVELA Cleanser Filtreleme

REVELA'da "cleanser" kategorisinde:
- pH bilgisi (mevcut markalar için)
- Sülfat-free filtresi
- Cilt tipi uyumu skoru

## Kaynaklar

- Mukhopadhyay 2011 (cleanser pH effects)
- Korting 1991 (sülfat vs amfoterik)
- Ananthapadmanabhan 2004 (mild cleansing)`,
  },

  {
    title: 'REVELA Mobile App Roadmap: Q3 2026 Beklentiler',
    slug: '2026-05-02-revela-mobile-roadmap',
    content_type: 'news',
    summary: 'REVELA mobile app Q3 2026 launch planı. Native iOS + Android, barkod tarama, push bildirim, offline mod, cilt analiz quiz mobile-first.',
    body_markdown: `## Mobile-First Pivot

REVELA web platformu canlı (1.795 ürün, 90+ rehber). Q3 2026 hedefi: native iOS + Android app launch.

## Neden Mobile?

- Türkiye internet kullanımının **%85+ mobil**
- Mağaza içi karar anında — laptop yok, telefon var
- Push bildirim ile günlük etkileşim
- Barkod tarama → web'de kullanışsız, native ideal

## Q3 2026 Feature Roadmap

### Faz 1 (Temmuz 2026) — Core Functionality

**Tarama**
- Barkod kamerayla okuma → ürün skor + INCI breakdown
- INCI listesi fotoğraf analizi (OCR + AI)
- Mağaza içi 3 saniyede karar

**Profil**
- Cilt analizi quizi (12 soru, 4 dk)
- Hassasiyetler + ihtiyaçlar
- Lokal storage (offline çalışır)

**Sayfa Render**
- Web'deki tüm sayfaların native versiyonu
- Daha hızlı (web'den 3-5× hızlı)
- Yer imi + favoriler

### Faz 2 (Ağustos 2026) — Engagement

**Push Bildirim**
- Yeni içerik makale geldiğinde
- Affiliate fiyat düştüğünde
- Cilt rutini hatırlatma (kullanıcı opt-in)

**Offline Mod**
- Cache 100+ favori ürün
- Mağazada internet yokken bile çalışır
- Sync günlük

**Karşılaştırma**
- 2-3 ürün yan yana (web'deki gibi)
- Skor diff + bileşen highlight
- Fiyat geçmişi grafiği

### Faz 3 (Eylül 2026) — Premium Features

**AI Cilt Analiz**
- Selfie → AI analiz (cilt tipi, akne, leke detection)
- Kişiselleştirilmiş öneri
- 30 günlük takip + ilerleme

**Topluluk**
- Ürün yorumları (filtreli, spam-free)
- Cilt tipi grupları
- Q&A dermatolog (premium tier)

**Subscription Tier**
- Free: temel tarama + skor
- Premium ($3.99/ay): AI analiz + topluluk + öneriler
- Pro ($9.99/ay): dermatolog Q&A, kişisel takip

## Teknoloji Stack

- **Frontend:** React Native (iOS + Android tek codebase)
- **State:** Zustand veya Redux Toolkit
- **API:** Render NestJS (mevcut backend)
- **DB:** Neon PostgreSQL (mevcut)
- **Auth:** JWT + biometric
- **Push:** Firebase Cloud Messaging
- **Analytics:** PostHog (mevcut)
- **OCR:** Google ML Kit (offline)

## Neden React Native?

- iOS + Android tek codebase = **2× hızlı geliştirme**
- Web ekibinin (Next.js) bilgisi geçer
- Performans: native'e %95 yakın (Hermes engine)
- Bundle size optimal

## Beta Test Süreci

- **TestFlight (iOS):** 50 kapalı beta, Temmuz başı
- **Play Console internal track:** Android Temmuz ortası
- **Public beta:** Ağustos
- **Stable release:** Eylül 2026

## Brand Portal (B2B Paralel)

Mobile app paralel olarak brand portal:
- Markalar kendi ürünlerini yönetir (ürün bilgisi, ek INCI, marka hikayesi)
- Aylık trafik analitik
- Lansmanı duyuru push (premium tier)

**Gelir hedefi:** 5-10 marka pilot Q3, 30+ marka Q4.

## Yatırım İhtiyacı

- React Native dev (1 senior, 6 ay): ~$30K
- iOS App Store + Apple Developer ($99/yıl)
- Google Play Console (tek seferlik $25)
- TestFlight + Firebase ücretsiz tier
- Toplam: **~$32K Q3 launch**

## Q4 + 2027 Vizyonu

- ✨ Mobile app stabil + 50K download
- ✨ Brand portal 30+ marka
- ✨ Avrupa pazarı pilotu (DE, FR — Türkçe ek diller)
- ✨ Dermatolog onayı + B2B partnership
- ✨ Topluluk 10K aktif kullanıcı

## Kaynaklar

- Statista mobile usage Turkey 2026
- App Store Connect / Play Console
- React Native performance benchmarks`,
  },

  {
    title: 'Profesyonel Cilt Prosedürleri 101: Lazer, IPL, Microneedling Karşılaştırma',
    slug: '2026-05-02-prosedur-laser-ipl-microneedling',
    content_type: 'comparison',
    summary: 'Klinik prosedürler ne zaman gerekir? Lazer (Q-switched, picosecond), IPL, microneedling, kimyasal peeling — endikasyon, downtime, maliyet karşılaştırması.',
    body_markdown: `## Topikal vs Klinik Prosedür

Bazı sorunlar için topikal yetmez:
- Kalın lentigo (yaş lekesi)
- Şiddetli melasma
- Atrofik akne skarları
- Telangiectasia (kılcal damarlar)
- Derin kıvrımlar (40+)

Bu durumlarda **klinik prosedür** + topikal birleşik tedavi gerekir.

## Ana Prosedürler Karşılaştırması

### Q-Switched Lazer (1064nm Nd:YAG)

**Endikasyon:** Lentigo, melasma, dövme silme, melanin lezyonları.

**Mekanizma:** Pigment hücrelerinde **selektif fototermoliz** — melanin spesifik dalga boyu, çevre dokuyu zedelemez.

**Süre:** 15-30 dk seans, 4-6 seans (4 hafta arayla).

**Downtime:** 24-48 saat hafif kızarıklık + kabuk.

**Maliyet:** Türkiye 800-1500 TL/seans = 4000-9000 TL toplam.

**Risk:** PIH (özellikle koyu cilt), hipopigmentasyon nadir.

### Picosecond Lazer (Cynosure PicoSure / Pico)

**Endikasyon:** Lentigo dirençli, dövme, melasma.

**Mekanizma:** Q-switched'den **çok daha kısa pulse** (pikosaniye), foto-akustik etki + foto-termal kombinasyon.

**Süre:** 15-30 dk seans, 3-4 seans yeterli.

**Downtime:** 12-24 saat (Q-switched'den hızlı).

**Maliyet:** Türkiye 1500-3000 TL/seans = 6000-12000 TL toplam.

**Risk:** Q-switched'den daha az PIH.

### IPL (Intense Pulsed Light)

**Endikasyon:** Foto-aging genel, lentigo hafif, vasküler (rosacea, telangiectasia), genç hyperpigmentasyon.

**Mekanizma:** Geniş spektrum 500-1200nm, melanin + hemoglobin emilimi.

**Süre:** 30-45 dk seans, 4-6 seans.

**Downtime:** 1-3 gün hafif kızarıklık.

**Maliyet:** Türkiye 600-1200 TL/seans = 3000-7000 TL toplam.

**Risk:** Koyu cilt için **dikkatli** (PIH riski).

### Microneedling (Dermapen, Skinpen)

**Endikasyon:** Atrofik akne skarları, kıvrım, gözenek görünümü, stretch mark.

**Mekanizma:** Mikro-iğneler kontrollü mikro-yara → kollajen sentezi tetikler (CIT — Collagen Induction Therapy).

**Süre:** 30-45 dk seans, 4-6 seans (4 hafta arayla).

**Downtime:** 1-3 gün kızarıklık + soyulma.

**Maliyet:** Türkiye 800-2000 TL/seans = 4000-12000 TL toplam.

**Risk:** Enfeksiyon (steril iğne kritik), PIE/PIH.

### Microneedling + RF (Radio Frequency)

**Endikasyon:** Daha derin kıvrım + elastisite kaybı (40+).

**Mekanizma:** Mikro-iğne + dermal RF enerji = derin kollajen denerasyonu.

**Süre:** 45-60 dk, 3-4 seans.

**Downtime:** 3-5 gün.

**Maliyet:** Türkiye 2000-5000 TL/seans = 8000-20000 TL toplam.

**Marka:** Morpheus8, Endymed Intensif, INFINI.

### Kimyasal Peeling

**Endikasyon:** Yüzey hyperpigmentasyon, hafif kıvrım, akne lezyonu.

**Tipler:**
- **Yüzeysel:** Glikolik %30-70, mandelik, laktik (15-30 dk, downtime 1-2 gün)
- **Orta:** TCA %15-35 (30-45 dk, downtime 5-7 gün)
- **Derin:** TCA %50+, fenol (1-2 saat, downtime 2-3 hafta, riskli)

**Maliyet:** Türkiye 400-2500 TL/seans (derinliğe göre).

**Marka klinik:** Mesoestetic, BioRePeel, Obagi Blue.

### HIFU (High-Intensity Focused Ultrasound)

**Endikasyon:** Sıkılaşma, hafif gevşeklik (35-50+ yaş).

**Mekanizma:** Derin SMAS (Superficial Musculo-Aponeurotic System) tabakasına ısı enerjisi → yapı yenilenmesi.

**Süre:** 60-90 dk, 1-2 seans yeterli.

**Downtime:** Yok-2 gün hafif şişlik.

**Maliyet:** Türkiye 5000-15000 TL/seans.

**Marka:** Ultherapy (gold standard), Doublo, Ulfit.

### Mezoterapi

**Endikasyon:** Genel cilt iyileşmesi, kollajen sentezi, hafif aydınlatma.

**Mekanizma:** Mikro-injeksiyon ile vitamin/peptit/HA dermise.

**Süre:** 30-45 dk seans, 4-8 seans.

**Maliyet:** Türkiye 500-1500 TL/seans = 2000-12000 TL.

## Hangi Soruna Hangisi?

### Akne Skarı (Atrofik)

1. Microneedling 6 seans (gold standard)
2. + Kimyasal peeling (Jessner, TCA %15-25) ardısı
3. Dirençli vakalar: Fractional CO2 lazer (premium klinik, $3000+)

### Melasma Dirençli

1. SPF + topikal traneksamik %5 (zorunlu öncelik)
2. Mezoterapi traneksamik (klinik, 4-6 seans)
3. Picosecond Q-low fluence (deneyimli klinik)

### Lentigo (Yaş Lekesi)

1. Q-switched veya picosecond lazer **gold standard**
2. IPL hafif vakalar
3. Topikal tretinoin + alpha-arbutin maintenance

### Genel Foto-Aging (40+ Yaş)

1. IPL 3-4 seans (foto-aging, dağınık pigment)
2. + Microneedling RF (kollajen)
3. + Topikal tretinoin + C vit

### Sıkılaşma + Gevşeklik

1. HIFU 1-2 seans (35-50 yaş)
2. RF microneedling (45+)
3. + Topikal peptit + retinol

## Klinik Seçimi 5 Kriter

1. **Dermatolog gözetimi** (kozmetolog değil)
2. **Cihaz markası açık** (Q-switched generic vs Cynosure)
3. **Önce-sonra fotoğraf portföy** (gerçek vakalar)
4. **Hijyen + steril uygulama**
5. **Komplikasyon yönetim planı** (PIH, enfeksiyon protokolü)

## Topikal + Prosedür Sinerjisi

Prosedür **tek başına** yeterli değil. Pre + post topikal eşlik etmeli:

**Pre-prosedür (4-6 hafta):**
- Bariyer hazırlık (ceramide + niasinamid)
- Tretinoin başlatma (deri yenilenmesi)
- SPF + alpha-arbutin (melasma için)

**Post-prosedür (4-12 hafta):**
- Yumuşak cleanser + bariyer kremi
- Ceramide + panthenol + centella (yatıştırıcı)
- 2 hafta SPF + agresif aktif kaçın
- Tretinoin haftada 2 → her gece kademeli geri

## Risk + Yan Etkiler

❌ Koyu cilt (Fitzpatrick IV-VI) — IPL + Q-switched yüksek dozda PIH riski
❌ Hamilelik / emzirme — çoğu prosedür yasak
❌ Aktif akne flare — bariyer çöker, kötüleşir
❌ Aktif egzama — alevlenme
❌ Antibiotik (tetrasiklin) — fotosensitizan, lazer öncesi 2 hafta tatil

## REVELA + Klinik Prosedür

REVELA topikal odaklı — klinik prosedür önerileri için **dermatolog konsültasyonu** zorunlu. REVELA'da:
- Pre + post topikal aktifler önerisi
- "Klinik tedavi gerekli" durumların listesi (sınırlı vaka sayısı)

## Kaynaklar

- Alster & Tanzi 2003 (lazer review)
- Aust 2008 (microneedling)
- Wu 2012 (traneksamik melasma)
- AAD Procedural Dermatology Guidelines`,
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
  console.log(`✓ id=${r.rows[0].article_id} | ${r.rows[0].len} char | ${a.slug}`);
  inserted++;
}

console.log(`\nToplam: ${inserted}/${ARTICLES.length}`);

const total = await c.query(`SELECT COUNT(*) FROM content_articles WHERE status='published'`);
console.log(`content_articles published: ${total.rows[0].count}`);

await c.end();
