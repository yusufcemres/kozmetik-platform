// Articles batch 4 — 5 yeni makale (3 comparison + 2 guide)
// Hedef: content_articles 65 → 70 published

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ARTICLES = [
  {
    title: 'Anti-Aging Karşılaştırma: Retinol, Bakuchiol, Adenosine — Hangisi Senin İçin?',
    slug: '2026-04-30-retinol-bakuchiol-adenosine-karsilastirma',
    content_type: 'comparison',
    summary: 'Üç popüler anti-aging aktif karşılaştırma — retinol klasik altın standart, bakuchiol bitkisel + hamilelikte güvenli, adenosine ECM destekçi. Cilt tipine göre seçim rehberi.',
    body_markdown: `## Üç Aktif, Üç Hedef

Anti-aging serum rafının başında üç ana aktif var. Hepsi farklı mekanizmayla kollajen sentezi tetikler — ama tahriş profili, hamilelik uyumu ve fotostabilite çok farklı.

### Retinol — Klasik Altın Standart

**Mekanizma:** Hücre içinde retinoik aside dönüştürülür → keratinosit yenilenmesini hızlandırır + kollajen sentezi tetikler + melanin transferini bloklar.

**Etkili konsantrasyon:** %0.1-0.5 (günlük), %1+ ileri seviye.

**Avantaj:** 50+ yıllık kanıt birikimi, çoğul randomize çalışmada anti-aging etkisi belgelenmiş (Kligman 1986; Kafi 2007).

**Dezavantaj:** ilk 4-6 hafta tahriş, kuruluk, soyulma yaygın. **Hamilelikte yasak**. Fotostabil değil — gece kullanım zorunlu, gündüz SPF.

### Bakuchiol — Bitkisel Eş-Değer

**Mekanizma:** *Psoralea corylifolia* tohumundan elde edilen fitokimyasal. Yapısal olarak retinole benzemez, ama benzer transkripsiyonel cevap verir → aynı kollajen sentezi yolağı.

**Etkili konsantrasyon:** %0.5-2.

**Avantaj:** **Fotostabil** (gündüz uyumlu), tahriş eşiği çok düşük, hamilelikte topikal görece güvenli kabul edilir.

**Dezavantaj:** etki süresi retinole göre biraz daha yavaş (8-16 hafta vs 6-12), uzun vadeli kanıt birikimi sınırlı.

**Kanıt:** Dhaliwal et al. 2019 (Br J Dermatol) — %0.5 bakuchiol vs %0.5 retinol, 12 hafta, fotodamage skorunda non-inferior + bakuchiol grubunda anlamlı az tahriş.

### Adenosine — Sessiz ECM Destekçi

**Mekanizma:** A2A reseptörü aktivasyonu → fibroblast proliferasyonu + ATP üretimi + kollajen sentezi. Japon Quasi-Drug onaylı (kıvrım iddia için resmi onay).

**Etkili konsantrasyon:** %0.04-0.1 (çok düşük dozda etkili).

**Avantaj:** **sıfır tahriş**, retinole alternatif başlangıç aktifi, hamilelikte güvenli.

**Dezavantaj:** etkisi diğer ikisinden daha hafif — tek başına dramatik kıvrım azaltma sağlamaz.

## Senin İçin Hangisi?

| Profil | Öneri |
|--------|-------|
| Hassas / rosacea / atopik | Bakuchiol veya adenosine |
| Hamile / emziren | Bakuchiol (topikal, hekim onayı) veya adenosine |
| Klasik anti-aging deneyim | Retinol — kanıtlı |
| Retinole tahriş kasıyor | Bakuchiol veya adenosine'a geç |
| Maksimal sonuç + tolerans | Retinol gece + adenosine sabah kombinasyonu |

## Kombinasyon İpuçları

- **Retinol + adenosine:** sabah-akşam ayır, sinerji yüksek
- **Bakuchiol + niasinamid + peptit:** gece serumu kombosu, hassas cildin "anti-aging stack"i
- **Asla aynı serumda:** retinol + AHA/BHA aynı gün → tahriş kaskadı

## Kaynaklar

- Dhaliwal S et al. *Br J Dermatol* 2019
- Kligman AM et al. *J Am Acad Dermatol* 1986
- Hashizume H et al. *J Cosmet Sci* 2011 (adenosine)
- CIR Final Reports: Retinol, Bakuchiol, Adenosine`,
  },

  {
    title: 'Lekek Tedavi Yol Haritası: Arbutin, Kojik, Tranexamic — Birlikte mi Ayrı mı?',
    slug: '2026-04-30-lekek-tedavi-arbutin-kojik-tranexamic',
    content_type: 'comparison',
    summary: 'Üç lekek aktifinin mekanizma farkları, etkili konsantrasyonu, kombinasyon protokolü. Melasma, post-akne lekesi, güneş lekesi için uygun rotasyon önerisi.',
    body_markdown: `## Lekek Tek Aktifle Çözülmez

Hiperpigmentasyon farklı yollardan oluşur — UV-tetiklemeli, hormonal (melasma), enflamasyon sonrası (akne lekesi). Tek bir aktif tüm yolakları kapatmaz; klinik altın standart **kombinasyon**.

### Arbutin — Yumuşak Tirozinaz İnhibitörü

**Mekanizma:** Hidrokinon glikozidi. Ciltte yavaş hidrolize olur → kontrollü tirozinaz inhibisyonu, melanin sentezi azalır.

**Etkili konsantrasyon:** %1-2 alpha-arbutin (10× beta-arbutin gücü).

**Profil:** günlük, hassas cilt uyumlu, hamilelikte topikal görece güvenli.

**Endikasyon:** melasma, post-inflammatory hyperpigmentation, çil — geniş spektrum.

### Kojic Acid — Bakır Şelat Yolu

**Mekanizma:** Tirozinazın bakır bağlama bölgesini şelat eder → enzim inaktif. *Aspergillus oryzae* fermentasyon ürünü.

**Etkili konsantrasyon:** AB Annex III #99 max **%1** (leave-on), **%2** (rinse-off).

**Profil:** orta hassasiyetli — kontakt dermatit prevalans %3-7. Patch test öncesi önerilir.

**Endikasyon:** melasma, post-akne lekesi. Kojic + arbutin kombinasyonu klasik Asya formülü.

### Tranexamic Acid — Vasküler + Plazmin Yolu

**Mekanizma:** UV-indüklenmiş plazmin aktivasyonunu engeller → araşidonik asit + alpha-MSH yolu baskılanır → melanin sentezi azalır. **Vasküler bileşeni de hedefler** (telanjektaziyi sıkıştırır).

**Etkili konsantrasyon:** %2-5 topikal (klinik kanıtlı).

**Profil:** çift-yönlü etki (pigment + vasküler) sayesinde **dirençli melasma**'da diğer iki aktife üstün.

**Endikasyon:** vasküler tip melasma, dirençli güneş lekesi, post-prosedür hiperpigmentasyon.

## Kombinasyon Protokolü

### Hafif Lekede Tek Aktif

%2 alpha-arbutin günlük + niasinamid + SPF — 12 hafta. Hafif post-akne lekesi için yeterli.

### Orta Melasmada İkili

%2 alpha-arbutin sabah + %5 traneksamik asit gece. SPF mutlak. 12-16 hafta görülür sonuç.

### Dirençli Melasmada Üçlü

- Sabah: %2 alpha-arbutin + niasinamid + Iron Oxide içeren SPF (HEV koruması)
- Gece: %5 traneksamik asit
- Haftada 2 gece: %1 kojic asit + AHA (rotasyon)

> ⚠️ Üçlü protokol için **dermatolog takibi önerilir** — vitiligo benzeri depigmentasyon yan etkisi nadir ama izlenmeli.

## Hangi Lekede Hangisi?

| Lekek tipi | Birinci tercih | İkinci ekle |
|------------|----------------|-------------|
| Güneş lekesi (foto) | Alpha-arbutin %2 | Niasinamid %5 |
| Post-akne lekesi (PIH) | Niasinamid %5 + Azelaik %10 | Alpha-arbutin %2 |
| Melasma (hormonal) | Traneksamik %5 | Alpha-arbutin %2 + dermatolog kojik %1 |
| Lentigo (yaşa bağlı) | Retinol gece + alpha-arbutin sabah | Glikolik %5 (haftada 2) |

## Kaçınılması Gerekenler

- **Kojik + AHA aynı gün** → güçlü tahriş + UV duyarlılığı
- **Hidrokinon serbest satış** — Türkiye dahil çoğu ülkede reçeteli, öz-tedavi tehlikeli
- **C vit + arbutin yüksek doz** → bazı formülasyonlarda stabilite kaybı

## Kaynaklar

- Polnikorn N. *J Cosmet Laser Ther* 2008 (alpha-arbutin)
- Wu S et al. *J Eur Acad Dermatol Venereol* 2012 (traneksamik)
- Atefi N et al. *J Cutan Med Surg* 2017
- Garcia A & Fulton JE. *Dermatol Surg* 1996 (kojik)
- SCCS Opinion 2019 (kojic acid)`,
  },

  {
    title: 'Bariyer Onarımı 101: Seramid + Kolesterol + Yağ Asit Trio',
    slug: '2026-04-30-bariyer-onarimi-seramid-kolesterol-yag-asit',
    content_type: 'guide',
    summary: 'Stratum corneum bariyeri seramid + kolesterol + serbest yağ asidi 1:1:1 oranında çalışır. Bariyer hasarının belirtileri, atopik dermatit + retinol/AHA toleransı için trio yaklaşımı.',
    body_markdown: `## Cilt Bariyeri Nedir?

Cildin en üst tabakası **stratum corneum** — ölü hücre + lipid matriksinden oluşur. "Tuğla-harç modeli": korneositler tuğla, lipidler harç. Lipid bileşimi:
- ~%50 **seramid**
- ~%25 **kolesterol**
- ~%15 **serbest yağ asidi**
- ~%10 diğer lipitler

Bu üç ana bileşen **1:1:1 oranında** çalışır (Man et al. 1996, J Invest Dermatol — bariyer onarımı altın standardı).

## Bariyer Hasarının Belirtileri

- Çekme + sıkışma hissi (TEWL artmış)
- Pul pul soyulma
- Ürün uygulamada batma
- Kızarıklık + hassasiyet
- Akne dışı lokalize iritasyon
- Retinol/AHA toleransı kaybolması

## Trio'nun Her Bileşeni Ne Yapar?

### Seramid (NP / AP / EOP)

Stratum corneum lipid bariyerinin **yapı taşı**. Atopik dermatit, kuru cilt, retinol/AHA hassasiyetinde seramid oranı düşer.

**Topikal seramid avantajı:** kayıp lipidi doğrudan yerine koyar (lipid replacement therapy). En çok kullanılan tip **Ceramide NP** (önceki adı Ceramide-3).

### Kolesterol

Lameller body yapısını stabilize eder. Tek başına kolesterol etkisi sınırlıdır — seramid + yağ asit ile birlikte çalışır.

**Klinik kanıt:** Man 1996 — kolesterol ekleme oranı yanlış olursa (örn. seramid baskın), bariyer onarımı **gecikmeli** olabilir.

### Serbest Yağ Asitleri (Linoleik, Oleik, Stearik)

- **Linoleik asit:** EFA (esansiyel yağ asidi). Eksikliğinde bariyer çöker. Topikal en iyi kanıt.
- **Oleik asit:** penetrasyon enhancer ama yüksek dozda bariyer aksini bozabilir
- **Stearik asit:** stratum corneum doğal bileşeni, emolyent

## Pratik Trio Stack

### Hafif Bariyer Hasarı

%1 ceramide krem + günlük niasinamid serum. 4 hafta yeterli.

### Orta-Ağır (atopik / retinol-induced)

- Sabah: %5 niasinamid serum + ceramide krem + SPF
- Gece: hyaluronik asit serum + ceramide + cholesterol kremi
- Haftada 2 gece: lokalize üre %10 (kuru topuk/dirsek)
- Retinol/AHA **2 hafta tatil**

### Premium Bariyer Stack (klinik)

- Su bazlı serum: hyaluronik + niasinamid + ektoin
- Yağ bazlı krem: ceramide NP %1 + kolesterol %0.5 + linoleik asit %0.5 (1:0.5:0.5 modifiyé Man trio)
- Üst kapak: skualan veya shea butter (oklusiv)

## Hangi Ürün Etiketine Bakmalı?

Sıralama önemli. Etiketin ilk yarısında:
- **CeraVe Bariyer Krem:** Ceramide NP/AP/EOP + kolesterol + niasinamid
- **La Roche-Posay Lipikar:** Niasinamid + shea + bariyer lipitleri
- **Eucerin Atopikontrol:** Licochalcone-A + ceramide
- **Skinceuticals Triple Lipid:** %2 ceramide + %4 kolesterol + %2 yağ asit (klinik 1:2:1 modifiye Man)

## Kaçınılacaklar (Bariyer Hasarındayken)

- Yüksek alkol (denat alkol etiketin üst sırasında)
- Esansiyel yağ + parfüm
- AHA/BHA günlük (eksfoliyasyon **erteleyin**)
- Sülfat içeren temizleyici (yumuşak surfaktana geç: cocamidopropyl-betaine, lauryl-glucoside)
- Yüksek pH temizleyici (hedef pH 4.5-5.5)

## Toparlanma Süresi

- Hafif hasar: 1-2 hafta
- Atopik dermatit aktif: 4-8 hafta + dermatolog konsültasyonu
- Retinol-induced: aktivi 2 hafta tatil + bariyer stack → tolerans yeniden kurulur

## Kaynaklar

- Man MQ et al. *J Invest Dermatol* 1996 (1:1:1 trio)
- Spada F et al. *Dermatol Ther* 2018 (ceramide RCT)
- Lin TK et al. *Int J Mol Sci* 2018 (atopik bariyer)
- Rawlings AV et al. *Arch Dermatol Res* 1996 (lactic acid + ceramide)`,
  },

  {
    title: 'UV Filtreleri Karşılaştırma: Mineral vs Kimyasal Sunscreen',
    slug: '2026-04-30-mineral-vs-kimyasal-sunscreen',
    content_type: 'comparison',
    summary: 'Çinko oksit, titanyum dioksit, avobenzon, octinoxate, octocrylen, Tinosorb — her bir UV filtresi mekanizma + güvenlik + fotostabilite farkları. Cilt tipine göre seçim.',
    body_markdown: `## "Mineral" vs "Kimyasal" Yanıltıcı

Geleneksel anlayış: mineral filtreler UV'yi yansıtır, kimyasal filtreler emer. **Modern bilim:** her ikisi de %95 emici, %5 reflektör (Cole et al. 2016, Photodermatol Photoimmunol Photomed). Asıl fark **molekül kimyası + fotostabilite**.

## Mineral (İnorganik) Filtreler

### Titanium Dioxide (TiO2)

- **Spektrum:** UVB güçlü, UVA II orta, UVA I zayıf
- **AB max:** %25 (Annex VI #27)
- **Avantaj:** hipoalerjenik, hassas cilt + bebek + hamilelikte güvenli, sıfır sistemik emilim
- **Dezavantaj:** beyaz cast (özellikle koyu ciltte), avobenzone/iron oxide ile kombinasyon UVA için gerekli
- **Form:** coated nano-TiO2 günümüzde standart (uncoated nano spray AB'de yasak)

### Zinc Oxide (ZnO)

- **Spektrum:** UVB + UVA II + UVA I geniş spektrum (TiO2'den iyi)
- **AB max:** %25 (Annex VI #30)
- **Avantaj:** geniş spektrum tek başına, hipoalerjenik, akneye yatkın ciltte non-comedogenic
- **Dezavantaj:** beyaz cast, formülasyonda film hissi
- **Hamilelik:** **en güvenli filtre** (Türkiye + AB dermatolog ortak görüşü)

## Kimyasal (Organik) Filtreler

### Avobenzone (Butyl Methoxydibenzoylmethane)

- **Spektrum:** UVA I (320-400 nm) — tek başına en güçlü UVA filtresi
- **AB max:** %5 (Annex VI #74)
- **Sorun:** **fotokarasız** — UV altında 30 dk içinde aktivitenin %50'si kaybolur. Octocrylene veya Tinosorb ile **stabilize edilmesi şart**.

### Octocrylene

- **Spektrum:** UVB + UVA II
- **AB max:** %10 (Annex VI #59)
- **Rolü:** avobenzone fotostabilize edici (kombinasyonda zorunlu)
- **Tartışma:** SCCS/1627/21 — yüksek konsantrasyonda benzofenon-3 oluşumu (eser miktar). Genel kabul: %10 altında güvenli.

### Octinoxate (Ethylhexyl Methoxycinnamate)

- **Spektrum:** UVB
- **AB max:** %10 (Annex VI #12)
- **Tartışma:** SCCS endokrin tartışması — Hawaii'de mercan zararı nedeniyle yasaklandı. Hamilelikte kaçınılır.
- **Trend:** kullanımı azalmakta

### Tinosorb S (Bemotrizinol)

- **Spektrum:** UVB + UVA tam spektrum
- **AB max:** %10 (Annex VI #28)
- **Avantaj:** **fotostabil**, geniş spektrum tek başına, hassas cilt uyumlu
- **Dezavantaj:** premium filtre (maliyetli), ABD'de FDA onayı yok

### Tinosorb M (Methylene Bis-Benzotriazolyl Tetramethylbutylphenol)

- **Spektrum:** UVB + UVA I + UVA II
- **AB max:** %10 (Annex VI #23)
- **Avantaj:** mikropartikül form, fizikokimyasal melez, fotostabil

### Uvinul T 150 (Ethylhexyl Triazone)

- **Spektrum:** UVB güçlü
- **AB max:** %5 (Annex VI #18)
- **Avantaj:** sistemik emilim minimum, fotostabil

### Tris-Biphenyl Triazine (Tinosorb A2B)

- **Spektrum:** UVB + UVA II tam
- **AB max:** %10 (Annex VI #29)
- **Avantaj:** geniş spektrum + photostable + mikropartikül form

## Hangi Cilde Hangisi?

| Cilt Profili | Önerilen Filtre |
|--------------|-----------------|
| Hassas / rosacea / atopik | %10 Zinc Oxide tek başına |
| Hamile / emziren | Mineral-only (ZnO + TiO2) |
| Bebek (6 ay+) | Mineral-only, %10-15 ZnO |
| Akneye yatkın | ZnO + non-comedogenic baz (squalane) |
| Melasma + Hiperpigmentasyon | Mineral + iron oxide (HEV koruması) |
| Günlük yüz | Tinosorb S + Avobenzone + Octocrylene (geniş spektrum) |
| Yağlı cilt + makyaj altı | Hafif kimyasal kombinasyon |
| Su sporu / plaj | %20 ZnO + uzun zincirli ester (water resistant) |

## "Reef-Safe" Tartışması

**Hawaii + AB bazı filtreler:** Octinoxate + oxybenzon mercan zararı için yasaklı. Türkiye'de yasal kısıt yok ama bilinçli tercih:
- ✅ **Reef-safe:** ZnO, TiO2, Tinosorb S/M, Uvinul T 150
- ❌ **Reef-unsafe:** Octinoxate, Oxybenzone, Octocrylene (orta tartışmalı)

## Pratik Öneriler

- **Spektrum doğrulaması:** etiketin "Broad Spectrum" yazılı olması yeterli değil — UVA-PF değeri **SPF/3'ten yüksek olmalı** (AB regülasyonu)
- **Miktar:** yüz için 1.25 ml (yarım çay kaşığı) — çoğu kişi yarısını kullanır → SPF gerçek olarak %50 düşer
- **Yenileme:** 2 saatte bir, terleme/yıkama sonrası mutlaka
- **PA derecesi (Asya):** PA++++ = en yüksek UVA koruması (Japon PPD standardı)

## Kaynaklar

- Cole C et al. *Photodermatol Photoimmunol Photomed* 2016 (mineral mekanizma yenileme)
- SCCS Opinions: Octocrylene 2021, Homosalate 2021, Octinoxate 2018
- AB Annex VI complete list (Cosmetic Regulation 1223/2009)
- FDA Sunscreen OTC Monograph 2021`,
  },

  {
    title: 'K-Beauty Aktifleri Rehberi: Cica, Snail, Pitera, Houttuynia',
    slug: '2026-04-30-k-beauty-aktifler-cica-snail-pitera',
    content_type: 'guide',
    summary: 'Kore kozmetik kültürünün öne çıkan 4 aktif: Centella Asiatica, salyangoz salgısı, Galaktomis (Pitera), Houttuynia Cordata. Bilimsel temel, etki profili, hassas cilt için seçim.',
    body_markdown: `## Kore Kozmetik Devrimi

2010 sonrası K-beauty (Kore kozmetik) küresel pazarın yönünü değiştirdi. Ana özellik: **bariyer + yatıştırıcı odaklı** rutin (8-10 katmanlı), tahriş edici aktiflere alternatif fitokimyasallar. Kanıt seviyeleri farklı — bazıları RCT'li, bazıları sadece geleneksel kullanım.

## Centella Asiatica (Cica)

**Bitki:** *Centella asiatica*, Asya'da yüzyıllardır yara iyileşmesi için kullanılır.

**Aktif bileşikler:**
- Asiatikozit, madekassosid (triterpenoid saponin)
- Asiatik + madekassik asit
- TECA / CTFA standardize özler

**Mekanizma:** kollajen tip I + III sentezi tetikler, NF-κB yolağını baskılar (anti-enflamatuvar), TEWL azaltır.

**Klinik kanıt:** Bylka et al. 2013 (Postepy Dermatol Alergol) — TECA topikal, atopik dermatit 12 hafta, SCORAD anlamlı azalma.

**Kullanım:** rosacea, atopik dermatit, post-prosedür kızarıklık, retinol/AHA yatıştırıcı.

**Kombinasyon:** niasinamid + panthenol + cica = "soothing trio".

## Snail Secretion Filtrate (Salyangoz Mukini)

**Kaynak:** *Helix aspersa* salyangoz mukininin filtrelenmiş özü (etik üretim önemli — salyangoz öldürülmez).

**Aktif bileşikler:**
- Glikoprotein, glikozaminoglikan (GAG)
- Allantoin (doğal yatıştırıcı)
- Hyaluronik asit
- Bakır peptit eseri

**Mekanizma:** in vitro fibroblast aktivasyonu, kollajen sentezi, ECM destekleme.

**Klinik kanıt:** Tribó-Boixareu et al. 2009 (J Drugs Dermatol) — salyangoz mukini in vitro aktif fibroblast yanıtı, sınırlı insan klinik kanıtı.

**Profil:** humektant + hafif aktif, hassas cilt uyumlu, alerji nadir.

**Kullanım:** kuru cilt, akne lekesi, post-laser bariyer.

> ⚠️ Etik: "cruelty-free snail" sertifikası olmayan ürünlerde üretim yöntemi belirsiz.

## Galactomyces Ferment Filtrate (Pitera)

**Kaynak:** *Galactomyces* maya türünün fermentasyon ürünü. SK-II markasının patentli bileşeni "Pitera" olarak ünlü.

**Aktif bileşikler:**
- B vitaminleri (folik asit, niasin)
- Aminoasitler (16+ tür)
- Mineraller, organik asitler
- Pyruvic + lactic asit (eksfoliyant etki)

**Mekanizma:** sebum normalleştirir + por görünüm + mikrobiyom dengesi.

**Klinik kanıt:** Lee et al. 2013 (J Cosmet Dermatol) — Galaktomis ferment, sebum + por görünüm 8-hafta RCT.

**Kullanım:** karma + yağlı cilt, gözenek + tonal düzensizlik.

## Houttuynia Cordata (Heartleaf)

**Bitki:** Asya bataklık otu, Korece *eo seong cho*. Geleneksel tıpta anti-enflamatuvar olarak kullanılır.

**Aktif bileşikler:**
- Quercitrin, hyperin (flavonoid)
- Esansiyel yağ (decanoyl-asetaldehit)
- Polifenoller

**Mekanizma:** anti-mikrobiyal (S. aureus + P. acnes), anti-enflamatuvar (COX-2 + iNOS baskılar).

**Klinik kanıt:** Lu et al. 2013 (Phytother Res) — topikal Houttuynia anti-enflamatuvar + akne lezyon azaltma.

**Kullanım:** akneye yatkın hassas cilt, rosacea, post-prosedür yatıştırma.

**K-Beauty'de yaygın:** Some By Mi, Anua, Manyo Factory ürünlerinde ana bileşen.

## Diğer K-Beauty Yıldızları (Kısa)

- **Propolis:** arı reçinesi → anti-mikrobiyal + bariyer onarım
- **Mugwort (Yavşan):** anti-enflamatuvar (atopik için)
- **Rice Extract:** B vit + aminoasit nemlendirici
- **Ginseng:** Kim 2014 (J Med Food) — kıvrım azaltıcı RCT, niş aktif

## Hangi Cilde Hangisi?

| Cilt Profili | Birinci Tercih |
|--------------|----------------|
| Rosacea + hassas | Cica (centella) |
| Atopik dermatit | Cica + Houttuynia |
| Karma / yağlı + por | Galaktomis (Pitera) |
| Akneye yatkın | Houttuynia + propolis |
| Kuru cilt + bariyer | Snail mucin + ginseng |
| Anti-aging hafif başlangıç | Ginseng + niasinamid |

## Kanıt Sınıflandırması

| Aktif | Kanıt Sınıfı | Ana RCT |
|-------|--------------|---------|
| Centella asiatica | B (RCT'li) | Bylka 2013 (atopik) |
| Galactomyces | B | Lee 2013 (sebum/por) |
| Houttuynia | B | Lu 2013 (akne) |
| Snail mucin | C (in vitro + sınırlı klinik) | Tribó 2009 |
| Mugwort | C (klinik az) | Lee 2017 |
| Propolis | B | Pereira 2015 |

## Pratik İpuçları

- **Trend ≠ kanıt:** "viral" K-beauty aktifler her zaman kanıt seviyesi yüksek değil. Cica + Galaktomis + Houttuynia güçlü, snail/mugwort/lotus gibi diğerleri bireysel deneyime bağlı.
- **Katmanlama:** K-beauty 8-10 katman önerir, ama **5-6 katman** çoğu kişi için yeterli (toner → essence → serum → ampoule → krem → SPF/sleeping mask).
- **Hamilelik:** Cica + niasinamid + panthenol güvenli. Salisilik içeren BHA toner dikkatli kullanılmalı.

## Kaynaklar

- Bylka W et al. *Postepy Dermatol Alergol* 2013 (centella RCT)
- Lee SH et al. *J Cosmet Dermatol* 2013 (galaktomis)
- Lu HM et al. *Phytother Res* 2013 (houttuynia)
- Tribó-Boixareu MJ et al. *J Drugs Dermatol* 2009 (snail)
- Kim JH et al. *J Med Food* 2014 (ginseng)`,
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
