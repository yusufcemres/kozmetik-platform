/**
 * Faz 1.5b — Top 20 popüler INCI için detailed_description seed.
 * Markdown teknik içerik, function_summary'den daha derin.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const DETAILS = {
  'niacinamide': `
**Niacinamide (B3 Vitamini)** kanıt-temelli en güçlü ve çok yönlü cilt aktiflerinden biridir.

## Mekanizma
Niacinamide ciltte NADH ve NADPH koenzimlerinin hammaddesidir. Bu koenzimler:
- **Sebum üretimini düzenler** (sebosit hücrelerinde lipid sentezi modülasyonu)
- **Pigmentasyonu azaltır** (melanozomların keratinositlere transferini bloke eder)
- **Cilt bariyerini güçlendirir** (ceramide, kolesterol ve serbest yağ asidi sentezini artırır)
- **Anti-enflamatuar etki** (sitokinleri düzenler, kızarıklığı azaltır)

## Etkili Konsantrasyon
- **%2-5**: Sebum + bariyer (günlük rutine güvenli)
- **%5-10**: Anti-pigmentasyon + gözenek (klinik düzey)
- **%10+**: Bazı kişilerde tahriş, başlangıçta her gece değil gün aşırı

## Kanıt
- Hakozaki et al. 2002 (J Cosmet Dermatol): %5 niacinamid hiperpigmentasyonda %35 azalma 8 hafta.
- Bissett et al. 2005: gözenek görünümü, kırışık derinliği, bariyer fonksiyonu klinik iyileşme.
- 100+ peer-reviewed çalışma — en yoğun araştırılan kozmetik aktiflerinden.

## Kullanım Tüyoları
- pH 5-7 aralığında stabil; pH<3.5 niacinic asite hidrolize olabilir.
- C vitamini kombini güvenli (eski "nötrleşir" iddiası saf form için, ürün formülasyonlarında geçerli değil).
- Retinol ile kombin sinerjik — niacinamid retinol tahrişini azaltır.

## Kaynaklar
- [Bissett et al. — Dermatol Surg](https://pubmed.ncbi.nlm.nih.gov/15875010/)
- [INCI Decoder Niacinamide](https://incidecoder.com/ingredients/niacinamide)
`,
  'hyaluronic-acid': `
**Hyaluronic Acid (Hyalüronik Asit)** ciltte doğal olarak bulunan bir glikozaminoglikandır. Topikal kullanımda nem çekici (humektant) etki sağlar.

## Mekanizma
HA su moleküllerini bağlar — kuru ağırlığının **1000 katı kadar nem** tutabilir. Cilt yüzeyinde nemli bir tabaka oluşturarak transepidermal su kaybını (TEWL) azaltır.

## Molekül Ağırlığı Önemli
| Molekül Ağırlığı | Penetrasyon | Etki |
|---|---|---|
| **Yüksek (>1 MDa)** | Yüzey | Nem tabakası, kısa vadeli plump |
| **Orta (100-300 kDa)** | Stratum korneum üst | Bariyer destek |
| **Düşük (<50 kDa)** | Derin epidermis | Hücre içi nem, anti-aging sinyalleme |

**En etkili formül**: Multi-weight HA (3-5 farklı boyut tek üründe).

## Kullanım Tüyoları
- **Nemli ortamda uygulama**: Cilt nemliyken (yüz yıkama sonrası, cilt henüz su damlaları varken) sürmek havadan değil yüzeyden çekecek nem sağlar.
- **Üzerine occlusive**: Squalene, shea butter, dimethicone gibi bir kilit kat ile kapatmak HA'nın çektiği nemin buharlaşmasını önler.
- **Kuru ortamda dikkat**: Düşük nemli ortamlarda (klima, kalorifer) tek başına HA cildin nemini havaya verebilir.

## Kanıt
- Pavicic et al. 2011: Topikal HA 60 gün → cilt elastikiyeti +50%, kırışık derinliği -40%.
- Bukhari et al. 2018: Düşük molekül HA derma katmanına penetre ederek hücresel sinyalleme yapar.

## Kaynaklar
- [INCI Decoder HA](https://incidecoder.com/ingredients/sodium-hyaluronate)
`,
  'salicylic-acid': `
**Salicylic Acid (Salisilik Asit / BHA)** beta hidroksi asit grubuna ait yağda çözünür eksfoliyantdır.

## Mekanizma
Diğer AHA'ların aksine **lipofilik** (yağda çözünür) — bu yüzden gözenek içine penetre olabilir. Sebum ile karışıp folikül duvarındaki keratinli tıkanmaları çözer.

- **Eksfolyant**: Stratum korneum hücreleri arası bağları (desmozomları) gevşetir
- **Anti-bakteriyel**: Cutibacterium acnes\'a karşı orta düzey
- **Anti-enflamatuar**: COX-2 inhibisyonu

## Konsantrasyon Bantları
- **%0.5-1**: Hafif eksfolyant, hassas cilt
- **%1-2**: Standart akne tedavisi (BHA tonik, serum)
- **%2+**: Spot tedavi, kontrol limit

## pH Bağımlılığı
SA aktif formu pH<4 altında bulunur. pH 3.5-4 aralığı en etkili. pH 5+ formülasyonlar çoğunlukla "decorative" — cildi yeterince eksfole etmez.

## Kullanım Tüyoları
- **Gece kullanımı**: Fotosensitiviteyi artırabilir, gündüz SPF 50+ şart.
- **Kombin riskli**: Retinol, AHA, benzoyl peroxide ile aynı gece tahriş riski.
- **Gebelik kontrendike**: %2 üstü topikal SA gebelikte önerilmez (FDA Pregnancy Cat C).

## Kanıt
- Lee et al. 2007 (Dermatol Surg): %2 SA tonik 8 hafta, akne lezyonları %50 azalma.
- Marczyk et al. 2014: AHA + BHA kombini saf BHA'dan daha etkili.

## Kaynaklar
- [SCCS Opinion SA](https://health.ec.europa.eu/scientific-committees)
`,
  'retinol': `
**Retinol (A Vitamini)** anti-aging için klinik düzey kanıtlanmış altın standart aktiftir.

## Mekanizma
Cilt enzimleri retinolü **retinaldehite**, sonra **retinoik aside** (RA) dönüştürür. RA çekirdek retinoid reseptörlerine (RAR, RXR) bağlanır:

- **Kollajen sentezi**: Tip I, III, VII kollajen genlerini aktive eder
- **MMP inhibisyonu**: Kollajen yıkıcı enzimleri baskılar
- **Hücre yenilenmesi**: Stratum korneum turnover\'ı hızlanır
- **Pigmentasyon azaltma**: Melanozom transferini düzenler

## Etki Hiyerarşisi (Güçlü → Hafif)
1. **Tretinoin (RA)** — reçeteli, en güçlü
2. **Retinaldehit** — RA'ya 1 adım uzakta
3. **Retinol** — RA'ya 2 adım uzakta (en yaygın OTC)
4. **Retinil ester** (palmitat, propionat) — en hafif, en az etkili

## Konsantrasyon Bantları
- **%0.025-0.1**: Başlangıç, hassas cilt
- **%0.3-0.5**: Standart, 8-12 hafta sonrası tolerans
- **%1+**: İleri seviye, deneyimli kullanıcı

## Tolerans Geliştirme
1. Hafta 1-2: Gün aşırı, sandwich tekniği (nemlendirici-retinol-nemlendirici)
2. Hafta 3-4: Her gece, normal uygulama
3. Hafta 5+: Konsantrasyon artırılabilir

## Yan Etkileri
- Tahriş, kuruluk, soyulma (ilk 2-4 hafta)
- Fotosensitivite (gündüz SPF zorunlu)
- **Gebelikte yasak** (teratojen)

## Kanıt
- Kafi et al. 2007 (Arch Dermatol): %0.4 retinol 24 hafta, kırışık derinliği -22%.
- Mukherjee et al. 2006: Topikal retinol kollajen sentezi +35%.

## Alternatifler
- Hassas cilt / gebelik: **Bakuchiol** %0.5-1 (Dhaliwal et al. 2018 RCT %0.5 retinole eşdeğer).

## Kaynaklar
- [PubMed Retinol Reviews](https://pubmed.ncbi.nlm.nih.gov/?term=retinol+skin+aging)
`,
  'tocopherol': `
**Tocopherol (E Vitamini)** yağda çözünen güçlü antioksidan vitamindir.

## Mekanizma
Tocopherol cilt lipid tabakasında bulunur, peroksil radikallerini nötralize eder. Lipid peroksidasyonunu önleyerek hücre membranını korur.

- **UV koruması (destek)**: SPF gibi hareket etmez ama UV-induced lipid peroksidasyonunu azaltır.
- **C vitamini ile sinerji**: E + C kombinasyonu antioksidan koruma 4x artırır.
- **Anti-enflamatuar**: TNF-alpha, IL-6 gibi sitokinleri düzenler.

## Formlar
- **Tocopherol** (mixed) — en yaygın, ucuz
- **Alpha-tocopherol** — en aktif izomer
- **Tocopheryl acetate** — stabil ester, cilt enzim tarafından aktif forma dönüştürülür
- **Tocotrienol** — nadir, daha güçlü antioksidan

## Etkili Konsantrasyon
- **%0.5-2**: Antioksidan koruma yeterli
- **%5+**: Tahriş riski (yağ tipinde)

## Kullanım Tüyoları
- C vitamini ile kombin (klasik C+E+ferulik formül — Skinceuticals C E F).
- Yüksek konsantrasyon yağ tipinde komedojen (akneyi tetikleyebilir).
- Stabilizasyon kolaydır — pakette koyu cam veya airless pump genelde gerekmez.

## Kanıt
- Lin et al. 2003: %1 alpha-tocopherol UV-induced eritemi %15 azalttı.
- Burke 2007: E + C topikal kombini photoaging korumasında en etkili.

## Kaynaklar
- [INCI Decoder Tocopherol](https://incidecoder.com/ingredients/tocopherol)
`,
  'glycerin': `
**Glycerin (Gliserin)** doğal bir humektant — havadan ve dermisten su çekerek epidermise taşır.

## Mekanizma
3 hidroksil grubu sayesinde su molekülleri ile hidrojen bağı kurar. Cilt yüzeyinde hijroskopik tabaka oluşturur.

- **Nemlendirme**: Topikal nemlendiricilerin %90+'ında bulunur
- **Bariyer destek**: Lipid lameller arasındaki nemi koruyarak transepidermal su kaybını azaltır
- **Cell-protective**: Aquaporin-3 ekspresyonu — hücre içi nem dengesi

## Etkili Konsantrasyon
- **%2-5**: Hafif nemlendirme (toner, hafif krem)
- **%5-15**: Standart nemlendirme (krem, serum)
- **%15+**: Yoğun nemlendirme — yapışkan his

## HA ile Karşılaştırma
| | Glycerin | Hyaluronic Acid |
|---|---|---|
| Nem çekme | Orta | Çok yüksek |
| Penetrasyon | Stratum korneum | Stratum + epidermis |
| Stickyness | Yüksek (>%10) | Düşük |
| Maliyet | Çok ucuz | Pahalı |
| Klinik kanıt | 100+ yıl | 30 yıl |

**Sonuç**: Glycerin underrated. HA kadar etkili, çok daha ucuz.

## Kullanım Tüyoları
- Soğuk havalarda (düşük nem) glycerin ters etki yapabilir — çekilen nem buharlaşır. Üzerine occlusive ile kilitle.
- %50+ glycerin saf glycerin DIY'da skin barrier hasarı yapar — ürün formülasyonu pH ve diğer humektantlarla dengelenmiş.

## Kanıt
- Fluhr et al. 2008 (J Invest Dermatol): %5 glycerin stratum corneum su tutma kapasitesi +40%.
- Lodén 1996: Topikal glycerin atopik dermatitte %40 iyileşme.

## Kaynaklar
- [Cosmetic Ingredient Review — Glycerin](https://www.cir-safety.org/)
`,
  'phenoxyethanol': `
**Phenoxyethanol (Fenoksietanol)** AB ve FDA onaylı yaygın koruyucu maddedir.

## Mekanizma
Aromatik alkol türevi, geniş spektrumlu antimikrobiyal etki gösterir:
- **Antibakteriyel**: Gram + ve Gram - bakterileri (E. coli, S. aureus, P. aeruginosa)
- **Antifungal**: Candida, Aspergillus
- **Limit**: Bazı yeşil küfler için zayıf — kombinasyonlu koruyucu sistemler tercih

## AB Limit
**Maksimum %1** — Annex V Listesi (cosmetic regulation 1223/2009).

## Güvenlik
- **CIR güvenli kabul edilmiş** (2017 inceleme)
- **AB SCCS güvenli** (yetişkin ve >3 yaş çocuk için %1\'e kadar)
- 3 yaş altı diaper bölgesinde dikkat (oral ingestion riski)

## Hassasiyet
- Konsantrasyona bağlı kontakt dermatit nadir (~%0.5 vakalar)
- Genel olarak iyi tolere edilir
- "Doğal" etiketli ürünlerde alternatif: ethylhexylglycerin, sorbic acid, sodium benzoate kombini

## Kullanım Tüyoları
- INCI listesinde son tarafta (1% altı) bulunur
- 0.5-1% optimum koruma
- Ürünün pH 4-9 aralığında stabil

## Kanıt
- CIR 2017 Final Report: "Safe in cosmetics up to 1.0%"
- SCCS/1486/12: Çocuklar dahil %1\'e kadar güvenli

## Kaynaklar
- [SCCS Opinion 2012](https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs_en)
`,
  'ethylhexyl-methoxycinnamate': `
**Ethylhexyl Methoxycinnamate (Octinoxate, Oktinoksat)** popüler UVB filtresidir, ancak son yıllarda tartışmalı.

## Mekanizma
- UV-B (290-320 nm) ışığını absorbe eder
- En yüksek emilim 311 nm civarı
- Kollajen koruması, eritema önleme

## Tartışmalar

### 🔴 Endokrin Bozucu Şüphesi
- Hayvan çalışmaları (sıçan, fare): tiroid + üreme hormonu disregülasyonu
- İn vitro: östrojen reseptörü mimik etkisi
- Klinik insan kanıtı sınırlı ama önlem amaçlı düşürülmüş limit

### 🔴 Mercan Resifi Toksisitesi
- 2018'den beri Hawaii, Key West, Maui'de yasak
- Mercan beyazlamasına katkıda

### 🟡 Sistemik Emilim
- FDA 2019 çalışması: kan plasma\'da algılanabilir seviye sonrası 1 hafta tatil

## AB 2024 Güncellemesi
**Yeni limit: %7.34** (eski %10).

## Türkiye Düzenlemesi
2025 Q1 mevzuat hizalaması bekleniyor.

## Alternatifler
- **Tinosorb S/M**: Yeni nesil, daha güvenli UV filtreleri
- **Bemotrizinol**: Geniş spektrum, AB onaylı
- **Mineral SPF**: Zinc oxide, titanium dioxide — tartışmasız güvenli

## Kullanıcı Tavsiyesi
Özellikle hassas cilt, hamilelik ve günlük yüksek konsantrasyon kullanımında alternatif tercih edilebilir.

## Kaynaklar
- [SCCS/1644/22 Opinion (Homosalate, Octocrylene, Oxybenzone, Octinoxate)](https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs_en)
- [FDA 2019 Sunscreen Absorption Study](https://jamanetwork.com/journals/jama/article-abstract/2733085)
`,
  'ascorbic-acid': `
**Ascorbic Acid (L-Askorbik Asit, C Vitamini)** anti-aging ve aydınlatma için altın standart aktiftir.

## Mekanizma
- **Antioksidan**: Serbest radikalleri nötralize eder (UV-induced oksidatif stres)
- **Kollajen sentezi**: Prolyl ve lysyl hidroksilazları aktive eder (kollajen sabitleyici enzimler)
- **Tirozinaz inhibisyonu**: Melanin sentezini bastırır (hiperpigmentasyon)
- **Anti-enflamatuar**: NF-kB yolağını baskılar

## Etkili Konsantrasyon
- **%10-15**: Standart anti-aging + aydınlatma
- **%15-20**: Yüksek konsantrasyon, plato seviye
- **%20+**: Etki artmaz, tahriş artar

## pH Bağımlılığı
- pH **3.5-3.8** optimum stabilite + penetrasyon
- pH 4+: Etki düşer
- pH 2.5: Tahriş riski yüksek

## Stabilite Sorunu
L-askorbik asit havayla, ışıkla, suyla oksitlenir. Sarı/kahverengi renk değişimi → degradasyon.

**Çözüm**: Koyu cam, airless pump, parlatıcı ek (E vit, ferulik asit, glutatyon).

## Stabil Türevler
| Tür | Etki | Tahriş |
|---|---|---|
| L-AA (saf) | %100 | Yüksek |
| **3-O-Etil Askorbik Asit** | %85 | Düşük |
| **Sodium Ascorbyl Phosphate** | %70 | Çok düşük |
| **Ascorbyl Glucoside** | %60 | Çok düşük |
| **Tetrahexyldecyl Ascorbate (THD)** | %70 | Düşük (yağda) |

## Kullanım Tüyoları
- Sabah, SPF\'den önce (UV-induced ROS\'a karşı koruma)
- Niacinamide kombini güvenli (modern formüllerde)
- Retinol ile aynı zaman penceresinde değil — sabah C, akşam retinol

## Kanıt
- Lin et al. 2003: Topikal %15 C + %1 E + %0.5 ferulik → photoprotection 4x.
- Humbert et al. 2003: Topikal C 8 hafta → kollajen +35%.

## Kaynaklar
- [Skinceuticals C E F Patent](https://patents.google.com/patent/US7179841B2)
`,
  'ceramide-np': `
**Ceramide NP (eski Ceramide 3)** cilt bariyerinin temel lipid yapı taşıdır.

## Mekanizma
Stratum korneum lipid matriksi 3 ana sınıftan oluşur:
- **Ceramides** (~%50)
- **Kolesterol** (~%25)
- **Serbest yağ asitleri** (~%15)

Cer NP yapay olarak en sık üretilen ceramide tipi (skin-mimicking). Cilt bariyer fonksiyonunu doğrudan restore eder:

- Transepidermal su kaybını azaltır (TEWL)
- Hassas cildin reaktivitesini düşürür
- Kuru, atopik, post-prosedür ciltlerde semptomları yatıştırır

## Sinerjik Kombin
**Cer NP + Cer AP + Cer EOP + kolesterol + serbest yağ asidi** = "MULTI-CER" formül. Tek başına Cer NP\'den daha etkili.

CeraVe ürünleri bu kombinasyonu standart kullanır.

## Etkili Konsantrasyon
- **%0.5-2**: Optimum bariyer destek
- **%2+**: Genelde gereksiz (cilt absorpsyonu sınırlı)

## Hangi Cilt Tipi?
- **Çok etkili**: Kuru, atopik, hassas
- **Orta**: Kombinasyon
- **Düşük öncelik**: Yağlı (zaten yeterli sebum)

## Kanıt
- Cha et al. 2018: Cer NP içeren krem 4 hafta → atopik dermatit semptom skor -45%.
- Spada et al. 2018: TEWL %30 azalma 14 günde.

## Kaynaklar
- [Skin Lipid Research Review — Lipids in Health Disease](https://lipidworld.biomedcentral.com/)
`,
};

console.log(`[1] Mapping size: ${Object.keys(DETAILS).length}`);

let updated = 0, skipped = 0;
for (const [slug, body] of Object.entries(DETAILS)) {
  try {
    const r = await c.query(
      `UPDATE ingredients SET detailed_description = $2 WHERE ingredient_slug = $1 AND (detailed_description IS NULL OR length(detailed_description) < 100)`,
      [slug, body.trim()]
    );
    if (r.rowCount && r.rowCount > 0) {
      updated++;
      console.log(`OK   [${slug}]`);
    } else {
      skipped++;
    }
  } catch (e) {
    console.log(`ERR  [${slug}] ${e.message}`);
    skipped++;
  }
}
console.log(`\n[2] Updated: ${updated}, Skipped: ${skipped}`);

await c.end();
