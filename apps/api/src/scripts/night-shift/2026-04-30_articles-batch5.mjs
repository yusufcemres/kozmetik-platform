// Articles batch 5 — 5 yeni pratik rehber. Hedef: 70 → 75 published
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ARTICLES = [
  {
    title: 'Akneye Yatkın Cilt İçin Doğru Aktif Stack: Adım Adım 12 Haftalık Plan',
    slug: '2026-04-30-akne-aktif-stack-12-hafta',
    content_type: 'guide',
    summary: 'Akneye yatkın ciltte salisilik asit + niasinamid + azelaik + BHA rotasyonu. 12 haftalık tolerans + sonuç planı, kombinasyon kuralları, kaçınılacak hatalar.',
    body_markdown: `## Akne Tedavisi Tek Aktifle Yetmez

Akne çok-faktörlü: hipekkeratoz (gözenek tıkanması) + sebum + bakteri (P. acnes) + enflamasyon. Tek bir aktif tüm yolakları kapatamaz; **kombinasyon + zaman** gerektirir.

## Hafta 1-2: Bariyer + Adaptasyon

**Hedef:** cildi tahriş etmeden temel kurma.

- **Sabah:** yumuşak cleanser → niasinamid %5 serum → nemlendirici → SPF
- **Akşam:** yumuşak cleanser → nemlendirici (ceramide + glycerin)
- **Aktif YOK** — bariyer önce hazırlanmalı

**Niasinamid:** sebum normalleştirir, anti-enflamatuvar, **ilk gün rahatlıkla** kullanılır.

## Hafta 3-4: Salisilik Asit Eklenir

**Hedef:** komedolitik etki başlatma.

- **Akşam:** cleanser → **%2 salisilik toner haftada 3 gece** → niasinamid → nemlendirici
- Tolerans gelişince haftada 5'e, sonra her gece

**Salisilik (BHA):** lipofilik — gözenek içine penetre eder, sebum ile karışır. pH 3.5-4 aralığında etkin.

## Hafta 5-6: Azelaik Asit Sabaha Eklenir

**Hedef:** anti-bakteriyel + post-inflammatory hyperpigmentation (akne lekesi).

- **Sabah:** cleanser → niasinamid → **azelaik %10** → nemlendirici → SPF
- **Akşam:** cleanser → salisilik (her gece) → nemlendirici

**Azelaik:** P. acnes baskılar + komedolitik + tirozinaz inhibitörü (leke azaltır).

## Hafta 7-8: Sonuç Değerlendirme

- Lezyon sayısı %30+ azaldı mı?
- Yeni komedon görülüyor mu?
- Bariyer sağlam mı (yanma, soyulma yok mu)?

**Sonuç yoksa:** dermatolog konsültasyonu — reçeteli adapalene (Differin 0.1%) veya tretinoin gerekir.

**Sonuç varsa:** stack stabilize, devam.

## Hafta 9-12: Stabilize + Anti-Aging

**Hedef:** akne kontrolü + leke iyileştirme.

- **Sabah:** niasinamid + azelaik + SPF
- **Akşam:** salisilik (haftada 5) + nemlendirici
- **Haftada 1-2 gece:** lekek tedavisi (alpha-arbutin + traneksamik) — eski akne lekeleri için

## Aktif Kombinasyon Kuralları

✅ **UYUMLU (aynı rutin):**
- Niasinamid + Salisilik
- Niasinamid + Azelaik
- Niasinamid + Retinol
- Salisilik + Hyaluronik
- Azelaik + AHA (rotasyon)

❌ **KAÇININ (aynı gün):**
- Salisilik + Retinol (tahriş kaskadı) → ayrı geceler
- AHA + BHA aynı gün (eksfoliyasyon overdose)
- Saf C vit + Niasinamid (eski miti — modern formülasyonda sorun değil ama aktif denge için ayrı zaman tercih)
- Benzoyl peroxide + Retinol (BPO retinolü inaktive eder)

## Akneye Uygun Olmayan İçerikler

❌ **Kaçının:**
- **Saf hindistan cevizi yağı** (komedojenik 4/5)
- **Kakao butter** (komedojenik 4/5)
- **Wheat germ oil** (komedojenik 5/5)
- **Algae extract** (bazı tipler komedojenik)
- **Yüksek lanolin**

✅ **Güvenli:**
- Squalane (0/5)
- Jojoba (0/5)
- Hyaluronik asit
- Niasinamid
- Caprylic/Capric Triglyceride (1/5)

## Beklentiler

| Faz | Süre | Beklenen |
|-----|------|----------|
| Adaptasyon | 2 hafta | Bariyer sağlam, tahriş yok |
| Komedolitik etki | 4-6 hafta | Yeni komedon azalır |
| Enflamatuvar lezyon | 6-8 hafta | Kızarık papülpüler azalır |
| PIH (leke) iyileşme | 12-16 hafta | Eski akne izleri yumuşar |

> ⚠️ İlk 4 hafta "purging" (mevcut komedonların yüzeye çıkması) görünebilir — endişelenme. 6 haftadan sonra hala aktif kötüleşme varsa **dermatologa danış**.

## Kaynaklar

- Hayashi N et al. *J Dermatol* 2008 (acne treatment guidelines)
- Schulte BC et al. *Br J Dermatol* 2015 (azelaik acid RCT)
- Babamiri K & Nassab R. *J Drugs Dermatol* 2010 (salisilik asit)
- Draelos ZD et al. *Cutis* 2006 (niasinamid + clindamisin)
- AAD Acne Guidelines 2024 update`,
  },

  {
    title: 'Hamilelikte Güvenli ve Yasak Aktifler: Trimester Bazlı Rehber',
    slug: '2026-04-30-hamilelik-guvenli-yasak-aktifler',
    content_type: 'guide',
    summary: 'Hamilelikte topikal aktiflerin güvenlik kategorileri. Retinol/AHA/BHA/SPF/anti-leke aktifler için trimester rehberi, alternatif öneriler. Dermatolog onaylı liste.',
    body_markdown: `## Hamilelik + Cilt = Hassas Konu

Hamilelikte hormon değişiklikleri cilt sorunlarını **artırır**: melasma (gebelik maskesi), akne flare, hassasiyet, kuruluk. Aynı zamanda bazı aktifler **yasaklanır** çünkü sistemik emilim teorik bebek riski oluşturabilir.

> ⚠️ **Bu rehber genel bilgidir** — kendi gebeliğinde her ürün için kadın doğum doktoruna ve dermatologa danış.

## ❌ KESİNLİKLE YASAK

### Oral Retinoidler
- **Isotretinoin (Roaccutane):** **kategori X** — şiddetli teratojenik, gebelikten 1 ay önce + tüm hamilelik + emzirme yasak
- **Asitretin:** kategori X
- **Adapalene oral:** uygulanmaz (zaten topikal)

### Topikal Retinoidler
- **Tretinoin (Retin-A):** kategori C — vakalar nadir ama önerilmiyor
- **Adapalene (Differin) topikal:** kategori C — sınırlı veri, kaçınma önerilir
- **Retinol + Retinaldehit + Retinyl Esterler:** topikal düşük penetrasyon ama **şüpheli avantaj/risk → kaçın**

### Yüksek Konsantre Salisilik Asit
- **%2+ leave-on:** kategori C — düşük doz topikal güvenli sayılır ama yüksek konsantre + büyük alan kullanımı kaçın
- **Reçeteli salisilik peeling (%20+):** **yasak**
- **Yıkanan ürünlerde (cleanser):** %0.5-2 genelde tolere edilir

### Hidrokinon
- **%2+ topikal:** sistemik emilim **%30-45** (tüm topikal aktifler içinde en yüksek)
- **Yasak** — alternatif: alpha-arbutin, traneksamik asit, niasinamid

### Diğer Yasaklar
- **Phthalate** (parfümlerde gizli) → parfümsüz ürünler tercih
- **Endokrin bozucu UV filtreleri:** Octinoxate + Oxybenzone (mineral SPF'ye geç)

## ✅ GÜVENLİ AKTİFLER

### Genel Bakım
- **Niasinamid (B3):** kategori A — geniş güvenlik
- **Hyaluronik asit:** doğal molekül, sıfır risk
- **Glycerin, Panthenol, Centella, Allantoin:** klasik güvenli grup
- **Ceramide + Cholesterol:** bariyer onarımı

### Anti-Aging Alternatif
- **Bakuchiol:** retinol alternatifi (Dhaliwal 2019 RCT) — topikal güvenli kabul
- **Adenosine:** Japon Quasi-Drug onaylı, sıfır risk
- **Peptit kompleksleri (Matrixyl, GHK-Cu):** sentetik amino asit, sistemik penetrasyon minimum

### Lekek Tedavisi
- **Alpha-Arbutin:** hidrokinon yerine güvenli alternatif
- **Traneksamik asit topikal:** sınırlı veri, **2. + 3. trimester** kullanım önerilebilir (oral yasak)
- **Niasinamid + Vit C:** güvenli + sinerjik

### SPF
- **Mineral filtreler (Zinc Oxide + TiO2):** **altın standart hamilelik**
- **Avobenzone:** sistemik emilim minimum, kategori orta
- **Tinosorb S/M:** AB modern filtre, güvenli
- **Octinoxate + Oxybenzone:** **kaçın** (endokrin tartışma)

### Akne
- **Azelaik asit:** **kategori B** — hamilelikte tercih edilen aktif
- **Glycolic acid (AHA) %5-10:** sınırlı topikal kullanım güvenli
- **Salisilik %0.5-2 yıkanan ürünlerde:** tolere edilir
- **Benzoyl peroxide %2.5-5:** sınırlı topikal güvenli

## Trimester Bazlı Stratejiler

### 1. Trimester (0-12 hafta) — En Hassas Dönem

- **Hormon yoğun, cilt değişken**
- **Kaçın:** retinoidler, salisilik %2+, hidrokinon, oral akne ilaçları
- **Tercih:** mineral SPF + niasinamid + bariyer + parfümsüz nemlendirici

### 2. Trimester (13-27 hafta) — Stabil Dönem

- **Cilt değişiklikleri belirginleşir** (melasma, stretch marks)
- **Önerilebilir:** alpha-arbutin + niasinamid (melasma), centella + bakuchiol (anti-aging), azelaik (akne)
- **Hala kaçın:** retinoidler, hidrokinon

### 3. Trimester (28-40 hafta) — Hazırlık

- **Hassasiyet artar, melasma pik**
- **Tercih:** mineral SPF (her gün, dışarı çıkmasanız bile pencere UV)
- **Stretch mark:** shea butter + cocoa butter + bademle masaj (klinik kanıt sınırlı ama zarar yok)

## Emzirme Dönemi

- Hamilelikten farklı — sistemik emilim bebek anne sütüne geçebilir
- **Retinoidler hala yasak**
- Salisilik + AHA topikal düşük doz tolere edilir
- Mama beslemesi sırasında uygulamada **göğüs bölgesi temiz tut**

## Pratik Tavsiyeler

- **Yeni ürün öncesi:** hekim + dermatolog onayı
- **Ürün etiketini kontrol:** "Pregnancy safe" iddiası AB regülasyonunda yok, marka claim'i
- **Patch test 24 saat:** her yeni ürün
- **"Doğal" ≠ güvenli:** esansiyel yağlar (özellikle hamilelik aromaterapisi) bazı türlerde teratojenik

## Klinik Hamilelik Cilt Sorunları

| Sorun | Yaklaşım |
|-------|----------|
| Melasma | SPF + alpha-arbutin + niasinamid (hidrokinon yasak) |
| Akne flare | Azelaik %10 + benzoyl %2.5 + topikal eritromisin (reçeteli) |
| Stretch marks | Shea + cocoa butter + masaj (önleme > tedavi) |
| Atopik dermatit | Ceramide + niasinamid + topikal düşük-orta steroid (hekim) |
| Kaşıntı (PUPPP) | Soğuk kompres + colloidal oatmeal — şiddetliyse hekim |

## Kaynaklar

- Putra IB et al. *Indian J Dermatol Venereol Leprol* 2016 (cosmetic in pregnancy review)
- Bozzo P et al. *Can Fam Physician* 2011 (safety of skincare during pregnancy)
- ACOG Guidelines (American College of Obstetricians and Gynecologists)
- AAD Pregnancy Skincare Guidelines 2023
- FDA Pregnancy Categories (mevcut)`,
  },

  {
    title: 'Bebek Cilt Bakımı: Pediatrik Dermatoloji Onaylı Aktifler ve Yaklaşımlar',
    slug: '2026-04-30-bebek-cilt-bakimi-pediatrik',
    content_type: 'guide',
    summary: 'Yenidoğan ve infant cilt bakımı protokolü. Bebek cilt bariyerinin gelişim aşamaları, atopik dermatit önlem, beşik kapsülü ve bebek akneleri yaklaşımı. Pediatrik dermatoloji rehberi.',
    body_markdown: `## Bebek Cildi Erişkinden Farklı

Yenidoğan stratum corneum **%30 daha ince**, transepidermal su kaybı (TEWL) **2-3 kat fazla**, mikrobiyom henüz yerleşmemiş. Bu yüzden:

- Aktif penetrasyonu yüksek (sistemik risk)
- Bariyer hasarı kolay
- Atopik dermatit prevalans %15-20 (genetik + çevre)

## Yenidoğan (0-1 ay)

### Banyo Kuralları

- **İlk 7-10 gün:** sünger silme, banyo değil (göbek bağı düşene kadar)
- **Sonra:** **2-3 banyo / hafta** yeterli — daha sık bariyere zarar verir
- **Su sıcaklığı:** 37°C (vücut sıcaklığı)
- **Süre:** 5-10 dk, 15+ dk maserasyon riski
- **Sabun yok:** fragrance-free + sülfat-free yıkayıcı (örn. CeraVe Baby, Mustela)

### Topikal Bakım

- **Nemlendirici:** her banyo sonrası 3 dk içinde nemli cilde
- **İçerik:** ceramide + glycerin + petrolatum
- **Kaçın:** parfüm, esansiyel yağ, paraben (atopik tetikleyici)
- **Marka önerisi:** CeraVe Baby Cream, La Roche-Posay Lipikar Baby, Aveeno Baby Eczema, Mustela Stelatopia

### Pişik (Diaper Rash)

- **Bariyer kremi:** %20-40 zinc oxide + %10-15 petrolatum
- **Sıkı bezleme yapma**
- **Hava temizleme** (5-10 dk açık bırak)
- **Şiddetli:** kandidiazis (mantar) düşün, hekim

## İnfant (1-12 ay)

### Beşik Kapsülü (Cradle Cap, Seborrheic Dermatitis)

**Sebep:** Malassezia maya + sebum üretimi.

**Tedavi:**
1. Banyodan önce **bebek yağı** (mineral oil veya jojoba) → 15-30 dk bekle
2. **Yumuşak fırça veya parmak** ile dairesel masaj
3. Bebek şampuanı ile yıka
4. Hafif → 2-4 hafta geçer
5. Şiddetli → ketokonazol %2 şampuan (hekim onayı)

### Atopik Dermatit (Bebek Egzaması)

**Risk faktörleri:**
- Aile öyküsü (atopik triad: egzama + astım + alerjik rinit)
- Filaggrin gen mutasyonu
- Erken bariyer hasarı

**Önlem stratejisi (PEBBLES çalışması, JAMA 2014):**
- Yenidoğandan itibaren **günlük emolyent kullanımı** atopik gelişme riskini %50 azaltır
- Düşük maliyet + yüksek etki

**Tedavi:**
- **Hafif-orta:** ceramide + colloidal oatmeal kremi
- **Şiddetli:** hidrokortizon %1 (hekim onayı, 1 hafta max yüze)
- **Tacrolimus + pimecrolimus:** 2 yaş altı off-label, hekim takipte

### Bebek Akneneri

**Yenidoğan akne (neonatal acne):** 0-3 ay arası, anne hormonu kalıntısı. **Kendi kendine geçer**, müdahale yok.

**İnfant akne (3-6 ay):** dermatolog konsültasyonu — bazen cinsel hormon dengesizliği işareti.

## Toddler (1-3 yaş)

### Güneş Koruması

- **6 ay altı:** SPF kullanımı **önerilmiyor** (gölge + kıyafet öncelik)
- **6 ay+:** **mineral SPF (ZnO + TiO2)** günlük, dışarı çıkmasanız bile dolaylı UV
- **Kimyasal SPF:** 6 ay altı yasak, 6+ ay tartışmalı (Octinoxate + Oxybenzone kaçın)

### Tırnak Bakımı + Saç

- Tırnak: yenidoğanda yumuşak, kolay yırtılır → her 3-5 gün özel bebek tırnak makası
- Saç şampuan: haftada 2-3, "no tear" formülasyon (göz pH-uyumlu)

## Yaygın Bebek Cilt Sorunları

| Sorun | Yaklaşım |
|-------|----------|
| Pişik (diaper rash) | %20+ zinc oxide bariyer, hava + bez değişim |
| Beşik kapsülü | Yağ + masaj + şampuan, 4 hafta sabır |
| Atopik dermatit | Günlük emolyent (tedavi + önlem), tetikleyici tespit |
| Yenidoğan akne | Müdahale yok, kendi geçer |
| Süt kabuğu (milia) | Müdahale yok, 1-2 ayda geçer |
| Eritema toxicum | Müdahale yok, 1-2 haftada geçer |

## ❌ Kaçınılması Gerekenler (Bebek)

- **Parfümlü ürünler** (alerji + atopik tetikleyici)
- **Esansiyel yağlar** (özellikle çay ağacı, lavanta, ökaliptus — solunum riski)
- **Pudra** (talc) — solunum yolu pneumonisi riski
- **Antibakteriyel sabun** (mikrobiyom bozar)
- **Yetişkin ürünleri** (parabens + sülfatlar + kimyasal SPF)
- **Saf shea butter** (ağaç fındığı alerji riski varsa dikkat)
- **Yağlı ev yapımı çözümler** ("anneanne tarifleri") — kontaminasyon riski

## ✅ Güvenli Bebek Aktifleri

- Ceramide NP, AP, EOP
- Glycerin, panthenol
- Centella asiatica
- Colloidal oatmeal (FDA OTC monograph)
- Allantoin
- Squalane
- Hyaluronik asit
- Madecassoside
- Petrolatum (USP Pharmaceutical)
- Mineral SPF (ZnO, TiO2)

## Pediatrik Dermatolojik Onay

Türkiye'de **TPDD (Türk Pediatrik Dermatoloji Derneği)** ve uluslararası **AAP + ESPD** kılavuzları:
- Günlük emolyent atopik önlem
- Mineral SPF 6+ ay
- Parfümsüz baby skincare
- Atopik dermatit erken müdahale (kortikosteroid + ceramide)

## Kaynaklar

- Simpson EL et al. *J Allergy Clin Immunol* 2014 (PEBBLES — emolyent atopik önlem)
- Eichenfield LF et al. *Pediatrics* 2014 (atopik dermatit guidelines)
- Stamatas GN et al. *Pediatr Dermatol* 2011 (infant skin development)
- AAP Skincare Recommendations
- ESPD (European Society for Pediatric Dermatology)`,
  },

  {
    title: 'Skin Cycling: 4 Günlük Aktif Rotasyon Protokolü',
    slug: '2026-04-30-skin-cycling-4-gun-protokol',
    content_type: 'guide',
    summary: 'TikTok kaynaklı viral skin cycling protokolü dermatolog Whitney Bowe tarafından popülerleştirildi. 4 günlük rotasyon: eksfoliyasyon, retinol, dinlenme, dinlenme. Kanıt seviyesi + pratik uygulama.',
    body_markdown: `## Skin Cycling Nedir?

**Skin Cycling**, dermatolog Dr. Whitney Bowe tarafından 2022'de TikTok'ta popülerleştirilen 4 günlük döngüsel rutin. Mantığı: **aktiflerin tahriş etkisini en aza indirip etki güçünü korumak**.

### 4 Günlük Döngü

| Gece | Aktif | Hedef |
|------|-------|-------|
| **1** | Eksfoliyant (AHA / BHA / PHA) | Eksfoliyasyon + ölü hücre temizleme |
| **2** | Retinol veya Retinaldehit | Hücre yenileme + anti-aging + akne |
| **3** | Dinlenme (sadece nemlendirici) | Bariyer onarımı |
| **4** | Dinlenme (sadece nemlendirici) | Bariyer onarımı |
| 5. gün → 1. geceye dön | | |

## Mantık ve Bilim

### Geleneksel Hata: "Daha Çok Aktif = Daha Çok Sonuç"

Birçok kullanıcı her gece retinol + AHA + BHA üst üste dener → bariyer çöker → tahriş + kuruluk + retinol toleransı kaybolur. **Sonuç: aktif kullanılamaz hale gelir**.

### Skin Cycling Çözümü

- 2 gün **aktif gerilim** (eksfoliyasyon + retinol)
- 2 gün **bariyer onarımı**
- Net etki: **aktif kullanım sürdürülebilir**, tahriş minimum

## Kanıt Seviyesi

**Skin Cycling spesifik klinik RCT yoktur.** Ama temel mantık (aktif rotasyonu + bariyer dinlenmesi) dermatoloji literatüründe yıllardır kabul gören prensiplerdir:

- **Mukherjee et al. (2006):** retinol kullanımında haftada 3-4 gece, bariyer toleransı (Clin Interv Aging)
- **Draelos (2018):** AHA + retinol rotasyonu, kombine eksfoliyasyon (J Drugs Dermatol)
- **Bowe (2022):** TikTok video sonrası popülerleşme + dermatolog konsensüsü

## Detaylı 4 Gün Protokolü

### Gece 1: Eksfoliyasyon

**Sabah:**
- Yumuşak cleanser
- Niasinamid serumu
- SPF mineral

**Akşam:**
- Yumuşak cleanser
- **AHA serumu (%5-10 glikolik veya laktik)** veya **BHA toner (%2 salisilik)**
- 5-10 dk bekle
- Hafif nemlendirici

> ⚠️ AHA / BHA aynı gece **birlikte değil**. Tek aktif seç.

### Gece 2: Retinol

**Sabah:**
- Aynı temel rutin

**Akşam:**
- Yumuşak cleanser
- **Retinol %0.3-0.5** (başlangıç) veya **%0.5-1** (tolerans gelişmiş)
- Yoğun nemlendirici (ceramide + niasinamid)
- "Sandwich method": nemlendirici → retinol → nemlendirici (tahriş azaltma)

### Gece 3 + 4: Dinlenme

**Akşam:**
- Yumuşak cleanser
- Hyaluronik asit + niasinamid serum
- Yoğun bariyer kremi (ceramide + cholesterol)
- İsteğe bağlı: oklusiv (squalane veya petrolatum)

**Hedef:** stratum corneum lipid yenilenmesi, fibroblast onarım sinyali, irritasyon düşüşü.

## Skin Cycling Kim İçin?

✅ **Uygun:**
- Anti-aging başlangıç (retinol toleransı kuran)
- Akneye yatkın + hassas cilt kombinasyonu
- AHA/BHA kullanmak isteyen ama tahriş yaşayan
- Retinol-AHA kombinasyon araştıran ama protokolsüz kalan

❌ **Uygun değil:**
- Aktif akne flare (dermatolog yönetimi gerek)
- Şiddetli atopik dermatit (önce bariyer onarım)
- Reçeteli tretinoin / adapalene kullanan (zaten klinik protokol mevcut)
- Hamilelik (retinol yasak)

## Modifikasyonlar

### Hassas Cilt Cycling

- 6 günlük döngü: 1 AHA, 1 retinol, **4 dinlenme**
- AHA'yı **PHA**'ya çevir (yumuşak)
- Retinol'ü **bakuchiol**'e çevir (hassas alternatif)

### Anti-Aging Yoğunlaştırılmış

- 3 günlük döngü: 1 AHA, 1 retinol, 1 dinlenme
- Sadece bariyer toleransı yüksek olanlar için

### Akneye Yatkın Cycling

- 1: BHA (salisilik) — komedolitik
- 2: Retinol veya Adapalene
- 3: Niasinamid yoğun
- 4: Bariyer dinlenme

## Yaygın Hatalar

❌ **Aktif gece nemlendirici atlanması** — bariyer kapatma şart
❌ **Sabah SPF unutma** — AHA/retinol UV duyarlılığı artırır
❌ **Tüm geceleri aktif yapma** — protokol amacına aykırı
❌ **Çok güçlü konsantrasyonla başlama** — %10 AHA + %1 retinol başlangıç bariyer hasarı
❌ **Saf C vit aynı gece** — retinol veya AHA ile aktif yığılması

## Sürdürülebilirlik

- 4-8 hafta sonra:
  - Bariyer toleransı: cycling **3 günlük döngüye sıkıştırılabilir**
  - Aktif konsantrasyonu **artırılabilir** (retinol %0.5 → %1)
  - Ek aktif eklenebilir (peptit, antioksidan)

## Skin Cycling vs Klasik Kombinasyon

| Yaklaşım | Avantaj | Dezavantaj |
|----------|---------|------------|
| Skin Cycling | Bariyer korunur, tahriş minimum, sürdürülebilir | İlk 4-8 hafta sonuç yavaş |
| Klasik (her gece) | Hızlı sonuç | Tahriş + bariyer hasarı + bırakma riski |

## Kaynaklar

- Bowe WP. *Skincare Routines* (2023, popular media)
- Draelos ZD. *J Drugs Dermatol* 2018 (cosmeceutical rotation)
- Mukherjee S et al. *Clin Interv Aging* 2006 (retinol tolerance)
- Babamiri K. *J Drugs Dermatol* 2010 (AHA/BHA strategies)`,
  },

  {
    title: 'Doğal vs Sentetik Kozmetik: Etik, Bilim, Pazarlama Tuzakları',
    slug: '2026-04-30-dogal-sentetik-karsilastirma',
    content_type: 'comparison',
    summary: 'Doğal kozmetik mitleri vs sentetik gerçekleri. "Clean beauty" pazarlama tuzakları, paraben + sülfat + silikon korkusu, kanıt-temelli karşılaştırma. Sürdürülebilirlik vs etkililik dengesi.',
    body_markdown: `## "Doğal" Kelimesi Yanıltıcı

Kozmetikte **"doğal"** kelimesi hukuki tanımı olmayan pazarlama terimidir. AB regülasyonu **doğal/organik kozmetik için resmi tanım vermez** — sadece üçüncü taraf sertifikalar (Ecocert, Cosmos, Natrue) standardize eder.

> ⚠️ "Doğal" ≠ güvenli, "sentetik" ≠ zararlı. Bilim molekülün davranışına bakar, kaynağına değil.

## Yaygın Yanlış Kanıların Çürütülmesi

### "Sentetik = kanserojen"

❌ **Yanlış.** Sentetik moleküllerin çoğu (niasinamid, hyaluronik asit, peptit, retinol) **fizyolojik olarak doğal moleküllerin kopyası**. Niasinamid laboratuvarda ya bitkiden ya sentezle elde edilir — molekül **tıpatıp aynı**.

### "Paraben kanserojen"

❌ **Yanlış (modern kanıt).** 2004 Darbre çalışması meme tümör dokusunda paraben tespit etti — ama nedensellik yok. Sonraki çalışmalar (FDA, AB SCCS) **kanserojen kanıtı bulamadı**. Methylparaben + ethylparaben **AB Annex V'de güvenli onaylı**.

❌ **Çevre riski:** parabenin doğal olarak meyve + zeytinde bulunduğu unutulmamalı.

### "Sülfat saç dökülmesi yapar"

❌ **Yanlış.** SLES (Sodium Laureth Sulfate) **bariyeri zorlar**, kuruluk yapabilir — ama saç **dökülmez**, sadece kuru görünür. Yumuşak alternatif (CAPB, lauryl-glucoside) eşit temizlik yapar daha az kuruluk verir.

### "Silikon nefessizleştirir"

❌ **Yanlış.** Dimethicone film **gaz geçirgendir**, oksijen + karbondioksit + su buharı geçer. Komedojenik skor **0/5** (DiNardo 2005). Cilt için risk **yok**.

### "Mineral SPF her zaman daha güvenli"

⚠️ **Kısmen doğru.** Mineral filtreler hipoalerjenik + hamilelik güvenli — ama **uncoated nano-TiO2 sprey** AB'de yasak (akciğer absorpsiyon riski). "Doğal" kelimesi mineral SPF'i otomatik en iyi yapmaz; her formül bağlamında değerlendirilmeli.

## Doğal Aktiflerin "Sınırları"

### Esansiyel Yağ Riski

- **Linalool, limonene, citronellol** = doğal esansiyel yağ bileşenleri
- AB **26 alerjen** listesinde
- "Doğal" olduğu için güvenli sanılır → **kontakt dermatit prevalansı %10**

### Bitki Özleri Standardizasyon Sorunu

- Hasat yılı + bölge + ekstraksiyon yöntemi → **aktif madde miktarı %50+ değişir**
- Centella asiatica özütleri %10-50 aralığında asiatikozit içerebilir
- Sentetik aktif **standardize** (her batchte aynı) — doğal extract değil

### Sürdürülebilirlik Çelişkisi

- **Argan yağı:** Fas'ta ağaç-popülasyonu sınırlı, talep 10× arttı → sürdürülemez
- **Palm yağı:** orman tahribatı (RSPO sertifikası önemli)
- **Bakuchiol:** *Psoralea corylifolia* aşırı toplandı, IUCN endişe kategorisinde
- **Sentetik analog:** lab'da sürdürülebilir, üretim eseri minimum

## Sentetik Aktiflerin Avantajları

✅ **Saflık ve Standardizasyon**
- Niasinamid %99+ saf, batch-to-batch eşit
- Bitki özünden çıkarımda %1-50 aktif madde değişkenliği

✅ **Klinik Kanıt Yoğunluğu**
- Retinol: 50+ yıl RCT birikimi
- Niasinamid: çift-kör + kontrollü onlarca çalışma
- Doğal aktifler: çoğu in vitro + sınırlı klinik

✅ **Maliyet Erişilebilir**
- The Ordinary niasinamid serumu $5-8 — herkesin alabileceği klinik kanıt
- "Doğal" niş ürünler $50-200 (pazarlama maliyeti, fiili etki sınırlı)

## "Clean Beauty" Pazarlama Tuzakları

### "Free From" Etiketler

- "Paraben-free" → başka koruyucu var mı? (phenoxyethanol, sodium-benzoate)
- "Sulfate-free" → yumuşak surfaktan kullanıldı mı?
- "Silicone-free" → ne ile değiştirildi?
- "Cruelty-free" → hayvan testi yapmadığı bilgisi (hayvan içeriği farklı kategori — vegan ile karıştırılmamalı)

### "Doğal" Sertifikalar Karşılaştırması

| Sertifika | Standart | Sınır |
|-----------|----------|-------|
| **Ecocert** | %95+ doğal kaynaklı, %10 organik | Bazı sentetik koruyucu izinli |
| **Cosmos Organic** | %20+ organik tarım, %95 doğal | Sıkı liste |
| **Natrue** | %75+ doğal kategorisinde | Üç seviye |
| **USDA Organic** | %95+ organik | ABD odaklı |

> "Cruelty-free" + "Vegan" + "Organic" üçü farklı şey — etiketleri ayrı oku.

## Bilim Açısından Doğru Yaklaşım

### "Etken madde + Konsantrasyon + pH + Formülasyon"

Bu dört faktör **etkililiği belirler**, kaynak değil:
- Niasinamid %5'te etkin (sentetik veya bitki özü)
- Salisilik asit pH 3.5-4'te etkin (doğal söğüt veya sentetik)
- Retinol %0.5'te etkin (sentetik veya retinaldehit)

### Etiket Okuma Önerisi

1. İlk 5 INCI: ürün omurgası
2. Aktif madde sırası: düşük sıralarda olabilir, etkin olabilir (peptit %0.05'te aktif)
3. Koruyucu: paraben-free/var olduğu önemli değil — **sistem dengeli mi?**
4. Parfüm: alerjen profilim için uygun mu?
5. SPF: filtre kombinasyonu UVA + UVB dengeli mi?

## Hangi Profilde Hangi Yaklaşım?

| Profil | Öneri |
|--------|-------|
| Atopik / hassas cilt | Parfümsüz + minimal koruyucu, doğal/sentetik karışım |
| Anti-aging odaklı | Kanıt-yoğun sentetik aktifler (retinol, niasinamid, peptit) |
| Sürdürülebilirlik öncelik | RSPO + organik sertifikalı, doğal aktif odaklı |
| Hamilelik | Trimester rehberi (mineral SPF + niasinamid + bakuchiol) |
| Bütçe sıkı | Minimal aktifler — niasinamid + ceramide + SPF |
| Premium deneyim | Çoklu aktif + premium formülasyon (sentetik dominant) |

## REVELA Yaklaşımı

REVELA platform'unda **doğal/sentetik ayrımı yapmıyoruz** — her INCI'nin:
- Mekanizması
- Etkili konsantrasyonu
- Klinik kanıt seviyesi (A-E grade)
- Hassasiyet profili

Bilim-temelli değerlendirilir. "Doğal" iddiasına değil, **kanıta** bakar.

## Kaynaklar

- Darbre PD et al. *J Appl Toxicol* 2004 (paraben tartışma başlangıç)
- FDA Paraben Safety Review 2015
- Goossens A. *Curr Probl Dermatol* 2005 (doğal allergen profili)
- Cosmos Organic Standard 2024
- Ecocert Cosmetics Standard
- DiNardo JC. *Dermatol Surg* 2005 (silikon non-comedogenic)`,
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
