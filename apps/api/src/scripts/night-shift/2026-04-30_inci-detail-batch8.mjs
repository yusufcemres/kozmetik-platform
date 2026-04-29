// Faz 5 batch 8 — 5 INCI: sodium-hydroxide + capryliccapric-triglyceride + sodium-benzoate + glycyrrhiza-glabra + cetyl-alcohol
// "Yanlış kanı çürütücü" grup — şeffaflık temel mesaj

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'sodium-hydroxide': `**Sodium Hydroxide (Sodyum Hidroksit, NaOH)**, kostik soda — kozmetikte **pH ayarlayıcı** olarak kullanılır. "Lye" (sabun yapımı bazı) olduğu için kullanıcılar endişelenir, ama **formül içinde nötralize olur**, son üründe serbest NaOH bulunmaz.

## Yaygın Yanlış Kanı

❌ **"Sodyum hidroksit cildi yakar"** → Saf NaOH evet, kostiktir. Ama kozmetikte **AHA/BHA gibi asitleri nötralize etmek için** çok düşük dozda eklenir. Reaksiyon sonucu pH 4-7'ye getirilir, son üründe **serbest NaOH yok**.

## Mekanizma

- **pH ayarlayıcı:** asidik formülasyonların pH'ını dengeler (örn. AHA serumu pH 3.5'i kontrol etmek için)
- **Nötralizasyon:** karboksilik asitleri (örn. carbomer) tuza çevirir → kıvam oluşturur
- **Sabunlaştırma:** sabun yapımında yağ + NaOH → sabun + gliserin (hot/cold process)
- **Eksfoliyant aktivasyon:** AHA aktif formunun pH'a bağlı olduğu yerlerde

## Kozmetikte Kullanım

| Form | İşlev |
|------|-------|
| Solüsyon (%50) | pH ayarlayıcı (formül %0.01-0.5) |
| Sabunda | Süreç sonrası tamamen tüketilir (saponifikasyon) |
| AHA toner | Asit + NaOH = pH 3.5-4 dengeleme |

## Etkili Konsantrasyon

- **%0.01-0.5:** pH ayarı (etiketin son sıralarında)
- **%0.5+:** karbomer nötralize (jel oluşumu)

> Etiketteki sıralama son 10 madde arasında ise → tipik pH ayar amaçlı, endişe gerektirmez.

## Güvenlik Profili

- **CIR Final Report 2015:** kozmetik kullanımda güvenli, son ürün pH'ı 11'i geçmemeli
- **AB Annex III #15:** maksimum %5 (saç düzleştirici), %2 (tırnak), %0.5 (yüz)
- **Saf NaOH temas:** kostik yanık → ama kozmetik formül içinde **kullanıcı saf NaOH'a maruz kalmaz**
- **Bebek formülasyonu:** bazı bebek banyo ürünlerinde de var (sabun bazı)

## Alternatifler

Aynı işlevi gören "doğal" alternatifler:
- **Triethanolamine (TEA):** klasik, ama nitrosamine endişesi (modern formüllerde azalmakta)
- **Aminomethyl propanol (AMP):** hassas cilt uyumlu
- **Arginine, lysine:** amino asit pH ayarlayıcı (premium formül)
- **Sodium citrate:** zayıf pH tampon

## Hassasiyet

Saf NaOH: **kostik yanık + iritasyon**. Formül içinde nötralize edilmiş NaOH: **sıfır risk**. Patch test alerji yok (zaten serbest molekül kalmaz).

## Kanıt

- **CIR (Sodium Hydroxide Final Report 2015):** kozmetik kullanımda %0.5 leave-on güvenli
- **AB Annex III #15:** kullanım kategorisi + maksimum konsantrasyon
- **Sotomayor & Hadijiosof (2015):** sabun yapımında saponifikasyon kimyası review

## Kaynaklar

CIR Final Report (Sodium Hydroxide), AB Annex III #15, ISO 22716 (kozmetik GMP).`,

  'capryliccapric-triglyceride': `**Caprylic/Capric Triglyceride (Hindistan Cevizi/Palm Yağı Türevi)**, **MCT yağı** (medium chain triglycerides) familyasından bitkisel emolyent. Hindistan cevizi yağı veya palm yağından **fraksiyonel distilasyon** ile elde edilir. "Doğal yağ" alternatifi olarak hindistan cevizi yağına göre daha avantajlı.

## Hindistan Cevizi Yağı vs MCT (Caprylic/Capric)

| Özellik | Saf Hindistan Cevizi Yağı | Caprylic/Capric Triglyceride |
|---------|---------------------------|------------------------------|
| Yapı | Tam yağ asidi spektrumu (C8-C18) | Sadece C8 + C10 zincirleri |
| Komedojenik | 4/5 (yüksek) | 1/5 (düşük) |
| Stabilite | Düşük (oksidlenir) | Yüksek (raf ömrü 2+ yıl) |
| Kıvam | 24°C altında katı | Sıvı (oda sıcaklığında) |
| Cilt Hissi | Yağlı | Hızlı emen, kuru hissi |

> **Akneye yatkın cilt için:** saf hindistan cevizi yağı **kaçınılmalı** (komedojenik). Ama caprylic/capric türevi non-comedogenic — güvenle kullanılabilir.

## Mekanizma

- **Emolyent:** stratum corneum yumuşatır
- **Penetrasyon enhancer (hafif):** orta zincir trigliserit moleküler boyutu cilde geçer
- **Antioksidan dağıtıcı:** yağda çözünür aktiflerin (E vit, retinol, koenzim Q10) çözücüsü
- **Bariyer destekçi:** doğal lipid yapı taşı + TEWL azaltma
- **Anti-mikrobiyal (zayıf):** kaprilik asit (C8) doğal antimikrobiyal etkisi

## Etkili Konsantrasyon

- **%2-10:** günlük krem + serum
- **%10-30:** kuru cilt + bariyer formüller
- **%30-100:** saf yağ ürünleri (The Ordinary stilinde)

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt, bariyer onarımı, akne-uygun nemlendirici, makyaj temizleme yağı
- **Sıra:** krem aşaması; yağ bazlı, suya çözünür aktifler önce
- **Kombinasyon:** squalane + caprylic/capric + ceramide = klasik kuru cilt yağ blend
- **Saç:** uçlara 1-2 damla, frizz azaltma
- **Akne:** komedojenik skor 1/5 → akneye yatkın ciltte güvenli

## Kanıt

- **Lin et al. (2018):** topikal MCT yağı, atopik dermatit bariyer fonksiyonu RCT (Int J Mol Sci)
- **Loden (1997):** topikal trigliserit emolyent kategorisinde TEWL azaltma (J Soc Cosmet Chem)
- **Pazyar et al. (2013):** non-comedogenic doğal yağ kategorisi review (Int J Mol Sci)

## Hassasiyet

Çok düşük; bitkisel kaynaklı, hipoalerjenik. Hindistan cevizi alerjik olanlarda nadir cross-reactivity. Patch test prevalansı %<0.5.

## Çevre

Palm yağı kaynağı sürdürülebilirlik tartışması: RSPO sertifikalı (Roundtable on Sustainable Palm Oil) tercih edilir. Hindistan cevizi kaynaklı versiyon palm-free alternatif.

## Kaynaklar

CIR (Caprylic/Capric Triglyceride Final Report 2014), Lin atopik RCT, Loden emolyent review, Pazyar non-comedogenic review.`,

  'sodium-benzoate': `**Sodium Benzoate (Sodyum Benzoat)**, doğal olarak meyvelerde (kızılcık, erik) bulunan **benzoik asitin sodyum tuzu**. Kozmetik + gıda ortak koruyucu — gıda katkısı E211 olarak da bilinir. Paraben-free formüllerin temel taşı.

## Mekanizma

- **Asidik pH'da aktif:** pH 4 altında benzoik asit form'a geçer → güçlü antimikrobiyal
- **Bakteri + maya + küf:** geniş spektrum
- **AB Annex V #5:** Maksimum %2.5 (rinse-off), **%0.5 (leave-on)**
- **pH bağımlılığı:** pH 5+ formülasyonlarda etkinliği azalır → ek koruyucu booster gerekebilir

## Yaygın Yanlış Kanı

❌ **"Sodyum benzoat C vit ile birleşince benzene yapar (kanserojen)"** → Yanlış, ama detaylı:
- Tek bir araştırma (NRDC 2007) belirli içecek formüllerinde benzene oluşumu rapor etti
- Yanıt: pH + sıcaklık + askorbik asit + bakır iyonları kombinasyonunda **iz miktarda** benzene
- **Modern formülasyonda chelat ajan (EDTA) varsa benzene oluşumu engellenir**
- FDA + EFSA güvenli kullanım onayı sürüyor

## Etkili Konsantrasyon

- **%0.1-0.5:** günlük formülasyon (leave-on)
- **%0.5-2.5:** rinse-off (cleanser, shampoo)
- **%0.1-0.3 + ek koruyucu:** sodium-benzoate + potassium-sorbate kombinasyonu klasik

## "Eko-Cert" / "Doğal" Onay

- **Ecocert + Cosmos:** sodium-benzoate **onaylı doğal koruyucu** (paraben-free formüllerde tercih)
- Doğal olarak meyvede bulunduğu için "natural-derived" iddiasında pazarlama avantajı
- Vegan + cruelty-free + paraben-free etiketle uyumlu

## Kullanım Tüyoları

- **Endikasyonlar:** geniş — yüz krem, serum, cleanser, shampoo, baby wipes
- **pH limit:** pH 5'in üstünde etkinliği düşer → formülasyonda dikkat
- **Kombinasyon:** sodium-benzoate + potassium-sorbate + EDTA = "natural preservation system"
- **Hamilelik:** topikal güvenli kabul edilir
- **Bebek:** pediatrik dermatoloji onaylı (Annex V #5 leave-on max %0.5)

## Kanıt

- **CIR (Sodium Benzoate Final Report 2017):** kozmetik kullanımda %2.5 (rinse) + %0.5 (leave-on) güvenli
- **EFSA Scientific Opinion (2016):** gıda + kozmetik kullanımı güvenli ADI 5 mg/kg
- **NRDC 2007 (benzene konser endişe):** spesifik formülasyon koşullarında — modern üretimde EDTA + ışık kontrolü ile engellenir
- **Türkiye Tarım Bakanlığı + AB EFSA:** kozmetik koruyucu olarak onaylı

## Hassasiyet

Düşük; kontakt dermatit prevalans %<1. Hipersensitif reaksiyon nadir. Sodium benzoate alerji testlerinde negatif kategorisi.

## Alternatifler (paraben-free system)

Sodium benzoate + potassium sorbate kombinasyonu yerine:
- **Phenoxyethanol + ethylhexylglycerin:** klasik yaygın
- **Caprylhydroxamic acid + glikol:** premium (cosmos onaylı)
- **Pentylene glycol + 1,2-hexanediol:** tam glikol bazlı

## Kaynaklar

CIR (Sodium Benzoate Final Report 2017), EFSA Scientific Opinion 2016, AB Annex V #5, FDA GRAS listesi.`,

  'glycyrrhiza-glabra-root-extract': `**Glycyrrhiza Glabra Root Extract (Meyan Kökü Özü)**, geleneksel tıpta yüzlerce yıldır kullanılan bitki kökü. Kozmetik dermatolojide **anti-enflamatuvar + depigmentasyon + antioksidan** üçlü etkisi belgelenmiş. K-beauty + İtalyan dermokozmetik formülasyonlarında popüler.

## Aktif Bileşikler

- **Glabridin:** ana aktif flavonoid, tirozinaz inhibitörü (depigmentasyon)
- **Liquiritin:** flavonoid glikozit, anti-enflamatuvar
- **Licochalcone-A:** chalcone türevi, güçlü anti-enflamatuvar (Eucerin kullanır)
- **Glycyrrhizin:** triterpenoid saponin, anti-viral + anti-enflamatuvar
- **Asparagin, betaine:** ek nemlendirici katkı

Standardize ekstrakt: glabridin %40 (premium), licochalcone-A izole olarak da satılır.

## Mekanizma

- **Tirozinaz inhibisyonu:** glabridin melanin sentezi azaltır (lekek aktif)
- **Anti-enflamatuvar:** licochalcone-A NF-κB + COX-2 baskılar
- **Anti-androjen (zayıf):** seboregulasyon — yağlı/akneli ciltte ek katkı
- **Anti-bakteriyel:** P. acnes üzerine ek katkı
- **Antioksidan:** flavonoid + polifenol → ROS süpürür

## Etkili Konsantrasyon

- **%1-3 standardize özüt:** günlük formülasyon
- **%0.5 glabridin izole:** premium depigmentasyon (klinik kanıtlı)
- **%0.025 licochalcone-A:** Eucerin AntiRedness/Hyaluron HD aktif
- **%5+:** intensif tedavi (rosacea + melasma)

## Kullanım Tüyoları

- **Endikasyonlar:** rosacea, melasma, post-inflammatory hyperpigmentation, perioral dermatit, hassas cilt
- **Sıra:** serum aşaması (suya çözünür)
- **Kombinasyon:** niasinamid + meyan + alpha-arbutin = anti-leke + yatıştırıcı stack. Ektoin + centella ile uyumlu.
- **Hamilelik:** topikal güvenli kabul edilir (oral yüksek doz hipertansiyon riski — topikal değil)
- **Bebek:** Eucerin pediatrik formüllerinde licochalcone-A (rosacea-pron yetişkin)

## Kanıt

- **Yokota et al. (1998):** %0.5 glabridin, hidrokinona benzer pigmentasyon azaltma in vitro (Pigment Cell Res)
- **Saeedi et al. (2003):** topikal meyan kremi melasma, 4 hafta RCT, anlamlı iyileşme (J Dermatolog Treat)
- **Kolbe et al. (2006):** licochalcone-A, UV-indüklenmiş eritem + rosacea iyileşmesi RCT (Skin Pharmacol Physiol)
- **Olbrich (2014):** licochalcone-A topikal antioksidan + anti-enflamatuvar review (Int J Cosmet Sci)
- **Choi et al. (2018):** Korean meyan + niasinamid kombinasyonu, melasma + rosacea RCT (J Cosmet Dermatol)

## Hassasiyet

Çok düşük; nadir kontakt dermatit. Glycyrrhiza ailesinde alerji prevalansı %<0.5. Eucerin uzun yıllar pediatrik formülasyonlarda güvenli kullanım kanıtı.

## Eucerin "Licochalcone-A" Patenti

Beiersdorf (Eucerin) licochalcone-A izolasyonunu patentledi, AntiRedness + AtopiControl + DermoPure ürün serilerinde ana aktif. Patent güçlü klinik kanıt biriktirmesi sağladı.

## Kaynaklar

CIR (Glycyrrhiza Glabra Final Report 2007), Yokota in vitro 1998, Saeedi RCT 2003, Kolbe rosacea 2006, AB Annex'te kısıt yok.`,

  'cetyl-alcohol': `**Cetyl Alcohol (Setil Alkol, C16-OH)**, **yağ alkolü** kategorisinde uzun zincirli emolyent. Adında "alcohol" (alkol) geçer ama **etanol değildir** — kuruma yapan SD alkol/denat alkolden yapısal olarak çok farklı. Kozmetikte yumuşatıcı + emülsifier + viskozite ayarlayıcı.

## "Alkol" Kelimesi Yanıltıcı

Kimyada "alkol" = **OH grubu içeren molekül**. İki farklı kategori vardır:

| Kategori | Örnek | Cilt Etkisi |
|----------|-------|-------------|
| **Kısa zincirli alkol (kurutucu)** | Ethanol, SD Alcohol, Denat Alcohol, Isopropyl Alcohol | Cildi kurutur, bariyer hasarı |
| **Yağ alkolü (emolyent)** | Cetyl Alcohol, Stearyl Alcohol, Cetearyl Alcohol, Behenyl Alcohol | Cildi yumuşatır, **kurutmaz**, bariyer destekçi |

> ⚠️ **"Alcohol-free" iddiası ile Cetyl/Stearyl alkol içerme uyumsuz değil** — yağ alkolü cilt için "alcohol" kategorisinde sayılmaz.

## Mekanizma

- **Emolyent:** stratum corneum yumuşatır, kuruluğu azaltır
- **Emülsifier (yardımcı):** yağ + su emülsiyonunu stabilize eder
- **Viskozite:** krem yapısını dolgun + kayan hâle getirir
- **Bariyer destekçi:** doğal lipid yapı taşı analoğu
- **Saç:** keratin lifine bağlanır, parlaklık + nem retention

## Etkili Konsantrasyon

- **%1-5:** günlük krem (yumuşatıcı + viskozite)
- **%5-10:** kuru cilt + bariyer formülasyonları
- **%10-20:** saç bakım koşullandırıcı

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt, atopik dermatit, retinol/AHA bariyer destek, saç koşullandırıcı
- **Sıra:** krem aşaması; yağ bazlı emolyent
- **Kombinasyon:** cetyl alcohol + glycerin + niasinamid = klasik yumuşatıcı stack
- **Komedojenik skor:** 2/5 (orta) — akneye yatkın ciltte yüksek konsantrasyon dikkat
- **Hamilelik:** güvenli
- **Bebek:** pediatrik formülasyonlarda yaygın

## Kanıt

- **CIR (Cetyl Alcohol Final Report 2008):** kozmetik kullanımda güvenli, AB Annex'te kısıt yok
- **DiNardo (2005):** komedojenik skor 2/5 — akneye yatkın için orta dikkat (Dermatol Surg)
- **Loden (1997):** topikal yağ alkolü emolyent kategorisi, TEWL azaltma (J Soc Cosmet Chem)

## Form Farkları

- **Cetyl Alcohol (C16):** orta zincir, klasik yumuşatıcı
- **Stearyl Alcohol (C18):** uzun zincir, daha kalın yapı
- **Cetearyl Alcohol:** Cetyl + Stearyl karışımı, dengeli özellikler (en yaygın)
- **Behenyl Alcohol (C22):** çok uzun zincir, premium yumuşatıcı

## Hassasiyet

Düşük; nadir kontakt dermatit (<%1 patch test). "Allergen of the Year 2007" — American Contact Dermatitis Society — atopik dermatit popülasyonunda dikkat (saflık + üretim kalitesine bağlı).

## Saç Bakımında Rolü

- Köke uygulanmaz (ağırlık)
- Uçlara odaklı koşullandırıcı
- Frizz azaltma + parlaklık
- Sülfat içermeyen şampuanların ana yapı taşı

## Kaynaklar

CIR (Cetyl Alcohol Final Report 2008), DiNardo komedojenik 2005, Loden review, ACDS 2007 atopik dikkat.`,
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let updated = 0;
for (const [slug, detail] of Object.entries(DETAILS)) {
  const r = await c.query(
    `UPDATE ingredients SET detailed_description = $2, updated_at = NOW()
     WHERE ingredient_slug = $1 RETURNING ingredient_slug, LENGTH(detailed_description) AS len`,
    [slug, detail]
  );
  if (r.rows.length) {
    console.log(`✓ ${slug.padEnd(40)} → ${r.rows[0].len} char`);
    updated++;
  } else {
    console.log(`✗ ${slug} → bulunamadı`);
  }
}

console.log(`\nToplam güncellenen: ${updated}/${Object.keys(DETAILS).length}`);
await c.end();
