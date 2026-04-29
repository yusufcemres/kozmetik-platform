// Faz 5 batch 4 — 5 INCI: lekek trio (arbutin + kojic-acid + tranexamic-acid) + adenosine + urea
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'arbutin': `**Arbutin**, ayı üzümü (*Arctostaphylos uva-ursi*) ve buğday yapraklarında doğal bulunan **hidrokinon glikozididir**. Hidrokinonun hidrolizle ciltte aşamalı olarak salındığı için daha kontrollü, daha az tahriş edici lekek alternatifi.

## Mekanizma

- **Tirozinaz inhibisyonu:** melanin sentezinde anahtar enzimi bloklar
- **Yavaş salım:** glikoz bağlı yapı sayesinde topikal hidrokinonun ani toksik etkisi yoktur
- **Kompetitif inhibitör:** doğal substrat L-DOPA ile rekabet eder
- **Anti-enflamatuvar (zayıf):** post-inflammatory hyperpigmentation döngüsünü kırar

## Form Farkları

| Form | Stabilite | Etki |
|------|-----------|------|
| Alpha-arbutin | Yüksek | Daha güçlü tirozinaz inhibisyonu (10× beta) |
| Beta-arbutin | Orta | Klasik form |
| Deoxyarbutin | Yüksek | Yarı-sentetik, daha güçlü ama AB'de kısıtlı |

**Alpha-arbutin** günümüzde altın standart — iddialara göre 10× beta-arbutin gücü.

## Etkili Konsantrasyon

- **%1-2 alpha-arbutin:** günlük serum (en yaygın)
- **%2-5:** intensif depigmentasyon
- **%7+ deoxyarbutin:** AB Annex II'de **kısıtlı** (bazı formlarda yasak)

## Kullanım Tüyoları

- **Endikasyonlar:** melasma, post-inflammatory hyperpigmentation (akne sonrası), güneş lekesi, çil
- **Sıra:** serum aşaması, sabah ya da akşam
- **Kombinasyon:** niasinamid + C vit + alpha-arbutin = klasik anti-leke trio. AHA/BHA ile sinerji (eksfoliyasyon + pigment azaltma)
- **Güneş:** **SPF zorunlu** — leke tedavisi sırasında UV korunması olmazsa etkisizdir
- **Hamilelik:** topikal güvenli olarak değerlendirilir (hidrokinon yasaklı, arbutin değil)

## Kanıt

- **Boissy et al. (2005):** alpha-arbutin tirozinaz inhibisyonu in vitro, hidrokinona benzer etki + 100× düşük toksisite (Exp Dermatol)
- **Polnikorn (2008):** %2 alpha-arbutin krem, 12 hafta, melasma indeksinde anlamlı azalma (J Cosmet Laser Ther)
- **Sasaki & Yoshida (2006):** alpha-arbutin vs beta-arbutin, eşit konsantrasyonda alpha 10× daha güçlü (J Cosmet Sci)

## Hassasiyet

Düşük; nadir kontakt dermatit. **Hidrokinon serbestleşmesi** kuramsal olarak mümkün ama in vivo kanıtlanmamış (yıllarca topikal kullanımda risk gözlenmedi).

## Kaynaklar

CIR (Arbutin Final Report 2014), SCCS Opinion, Boissy in vitro, Polnikorn RCT.`,

  'kojic-acid': `**Kojic Acid (Kojik Asit)**, *Aspergillus oryzae* küfünün fermantasyon ürünü. Japon tarihçesinden gelen geleneksel depigmentasyon aktifi — hidrokinon yasağı sonrası popülerleşti.

## Mekanizma

- **Tirozinaz inhibisyonu:** bakır bağlama bölgesini şelat eder → enzim inaktif
- **Antioksidan:** UV-indüklenmiş ROS süpürür
- **Anti-bakteriyel/fungal (zayıf):** P. acnes ve Malassezia üzerine ek katkı
- **Pro-melanin agregasyonu:** melanozomların kümelenmesini önler

## Etkili Konsantrasyon

- **%1-2:** günlük serum (en yaygın)
- **%2-4:** yoğun depigmentasyon (Asya'da yaygın)
- **%4+:** **AB'de kısıtlı** — Annex III #99 max %1.0 (yıkamada %2)

> ⚠️ AB regülasyonu: 2019 SCCS opinion → leave-on max %1, rinse-off max %2. Asya pazarındaki %4+ ürünler AB'ye uygun değil.

## Kullanım Tüyoları

- **Endikasyonlar:** melasma, güneş lekesi, post-inflammatory hyperpigmentation
- **Sıra:** serum aşaması, akşam (kararsız bileşik, gündüz kullanımı stabilite kaybı)
- **Kombinasyon:** niasinamid + alpha-arbutin + kojic asit = "depigmentasyon trio". Glikolik asitle sinerji (eksfoliyasyon + pigment).
- **Hamilelik:** topikal kanıt sınırlı, kullanımdan önce hekim önerisi
- **Hassas cilt:** %0.5'ten başla, batma yaygın
- **Saklama:** ışık + ısıdan koruma — sarımsı tonlanma kararsızlık işareti

## Kanıt

- **Garcia & Fulton (1996):** %2 kojic asit + %2 hidrokinon vs %2 hidrokinon, melasma 12 hafta, kombinasyon anlamlı superior (Dermatol Surg)
- **Lim (1999):** topikal kojic asit, 8 hafta, lentigo solaris (J Dermatol Surg Oncol)
- **Battaini et al. (2000):** tirozinaz bakır şelasyon mekanizması (J Biol Inorg Chem)

## Hassasiyet

Orta; **kontakt dermatit prevalans %3-7** (bu listedeki en hassasiyet riski yüksek aktiflerden). Patch test önerilir. Asya pazarında yüksek konsantrasyonlu ürünler (%4+) AB'de iritasyon raporları nedeniyle yasakland.

## Kaynaklar

CIR (Kojic Acid Final Report 2010), SCCS Opinion 2019 (1637/19), EU Annex III #99, Garcia RCT.`,

  'tranexamic-acid': `**Tranexamic Acid (Traneksamik Asit)**, sentetik **lizin türevi** anti-fibrinolitik amino asit. Oral formda kanama tedavisinde kullanılırken topikal/oral yolla **melasma**'da paradigma değiştirici aktif olarak öne çıktı (2010 sonrası).

## Mekanizma

- **Plazmin inhibisyonu:** UV-indüklenmiş plazmin aktivasyonunu engeller → araşidonik asit + alpha-MSH yolu baskılanır → melanin sentezi azalır
- **Vasküler etki:** melasma'nın **vasküler bileşenini** azaltır (telanjektaziyi sıkıştırır)
- **Anti-enflamatuvar:** post-inflammatory hyperpigmentation'da PGE2 azaltır
- **Tirozinaz inhibisyonu (zayıf, dolaylı):** alpha-MSH yolu üzerinden

## Form Farkları

- **Oral (reçeteli):** 250-500mg günde 2 kez, 8-12 hafta — melasma tedavisinde altın standart
- **Topikal (OTC):** %2-5, günde 2 kez, 12 hafta
- **Mikroinjeksiyon:** klinik prosedür, 4-8 mg/ml, 4 haftada bir

## Etkili Konsantrasyon

- **%2-3:** günlük serum (klinik kanıtlı minimum)
- **%5:** intensif tedavi (The Ordinary, Skinceuticals tipi)
- **%5+:** stinging riski + ürün maliyeti

## Kullanım Tüyoları

- **Endikasyonlar:** melasma (özellikle vasküler tip), post-inflammatory hyperpigmentation, dirençli güneş lekesi
- **Sıra:** serum aşaması, sabah + akşam günde 2 kez
- **Kombinasyon:** niasinamid + arbutin + traneksamik asit = "evidence-based melasma trio". Hydroxy asitlerle aynı gece tahriş riski.
- **Güneş:** **SPF mutlak**, melasma tedavisinde UV maruziyetsizlik şart
- **Hamilelik:** topikal kanıt sınırlı, oral form yasaklı — gebelikte kullanımdan kaçın
- **Beklentiler:** 8-12 hafta görülür sonuç, 16-24 hafta optimal

## Kanıt

- **Wu et al. (2012):** %3 traneksamik asit topikal, 12 hafta, melasma indeksi (MASI) anlamlı azalma (J Eur Acad Dermatol Venereol)
- **Kim et al. (2017):** %5 topikal vs oral 250mg, 12 hafta — non-inferior ama topikalde sistemik yan etki yok (Dermatol Surg)
- **Atefi et al. (2017):** %5 topikal vs %4 hidrokinon, 12 hafta, traneksamik non-inferior + daha az tahriş (J Cutan Med Surg)
- **Tan et al. (2017):** mekanizma — plazmin/PA-2 yolağı in vitro (Pigment Cell Melanoma Res)

## Hassasiyet

Düşük; ilk uygulamalarda hafif batma yaygın. Patch test prevalansı %1-2.

## Kaynaklar

CIR (Tranexamic Acid Final Report 2018), SCCS Opinion, Wu RCT, Kim RCT, Atefi RCT.`,

  'adenosine': `**Adenosine (Adenozin)**, ATP/ADP/cAMP zincirinin temel **nükleozidi**. Cilt formülasyonlarında AB onaylı **anti-aging aktif** — Japon kozmetik regülasyonunda (Quasi-Drug) onaylı kıvrım azaltıcı.

## Mekanizma

- **A2A reseptörü aktivasyonu:** fibroblast proliferasyonu + kollajen tip I sentezi
- **cAMP yolak:** elastin + ECM (extracellular matrix) sentezi
- **Mitokondri ATP üretimi:** hücre enerji metabolizması destekler
- **Anti-enflamatuvar:** dermal A2A reseptörü stres yanıtını yatıştırır
- **Wound healing:** keratinosit migrasyonu hızlanır

## Etkili Konsantrasyon

- **%0.04 (Japon Quasi-Drug onaylı):** kıvrım iddiası için minimum standart
- **%0.05-0.1:** günlük anti-aging serum
- **%0.1-0.5:** premium klinik formülasyonlar

> Çok düşük konsantrasyonda etkili — etiketteki sıralamada son 10 madde arasında olmasına rağmen aktif olabilir.

## Kullanım Tüyoları

- **Endikasyonlar:** kıvrım/ince çizgi azaltma, fibroblast yaşlanması, post-prosedür iyileşme, gece serumu anti-aging
- **Sıra:** serum aşaması; suda çözünür
- **Kombinasyon:** retinol + peptit + adenosine = **anti-aging "trifecta"**. Bakuchiol için iyi sinerji.
- **Hamilelik:** güvenli (doğal hücre nükleozidi)
- **Hassas cilt:** retinole alternatif olarak başlayanlara uygun — tahriş eşiği çok düşük

## Kanıt

- **Abella (2006):** %0.1 adenozin krem, 8 hafta, çift-kör RCT — kıvrım derinliği anlamlı azalma (J Cosmet Dermatol)
- **Brown et al. (2008):** topikal adenozin, fibroblast kollajen tip I sentezini in vitro 2× artırır (J Invest Dermatol)
- **Sumiyoshi et al. (2002):** A2A reseptör mekanizması, dermal fibroblast yaşlanmasında rol (Br J Dermatol)
- **Hashizume et al. (2011):** %0.04 adenosine, 8 hafta, Japon Quasi-Drug klinik kanıtı (J Cosmet Sci)

## Hassasiyet

Çok düşük; doğal hücre molekülü. Patch test prevalansı %<0.5.

## Kaynaklar

CIR (Adenosine Final Report 2014), Japon Quasi-Drug onayı, Abella RCT, Brown in vitro.`,

  'urea': `**Urea (Üre)**, doğal nemlendirici faktör (NMF) ailesinin temel bileşeni. Düşük konsantrasyonda **humektant**, yüksek konsantrasyonda **keratolitik** (eksfoliyant). İki yönlü etki nadir bir özellik.

## Mekanizma

- **Humektant:** OH grupları ile su tutar (gliserin gibi)
- **NMF:** stratum corneum'un doğal nem dengesini destekler (cildin doğal bileşenidir)
- **Keratolitik (>%10):** keratin lifleri arasındaki hidrojen bağlarını çözer → ölü hücre yığışmasını azaltır
- **Penetrasyon enhancer:** diğer aktiflerin (örn. salisilik asit) emilimini artırır
- **Anti-mikrobiyal (zayıf):** yüksek konsantrasyonda

## İki Yönlü Etki Tablosu

| % | Etki | Endikasyon |
|---|------|------------|
| %2-5 | Humektant | Genel nemlendirme, hassas cilt |
| %5-10 | Hafif keratolitik | Kuru cilt, atopik dermatit |
| %10-20 | Orta keratolitik | Hyperkeratoz, ihtiyoz, kuru topuk |
| %20-40 | Güçlü keratolitik | Kallus, sert tırnak, fissür |
| %40+ | Maserasyon (medikal) | Tırnak avulsiyon, kornea |

## Etkili Konsantrasyon

- **Yüz:** %5-10 (hassas cilt + kuru cilt)
- **Vücut:** %10-20 (kuru cilt, atopik dermatit, ksiroz)
- **El/Topuk:** %20-40 (kalıcı kuruluk, çatlak)

## Kullanım Tüyoları

- **Endikasyonlar:** atopik dermatit, sedef (psoriasis) destek tedavisi, ihtiyoz, kalkanlı cilt, ksiroz, post-laser kuru cilt
- **Sıra:** krem aşaması; özellikle suya doymuş cilde uygulanırsa daha etkili
- **Kombinasyon:** ceramide + niasinamid + üre = ampul-sınıfı atopik bariyer trio
- **Hamilelik:** güvenli
- **Hassas cilt:** %10 üstü stinging yapabilir, başlangıç düşük
- **AB regülasyon:** Annex'te kısıt yok, vücutta serbest kullanım

## Kanıt

- **Pan et al. (2013):** %10 üre kremi, 4 hafta, kuru ciltte TEWL %35 azalma + bariyer iyileşmesi (Skin Res Technol)
- **Loden (1996):** %10 üre, atopik dermatit, 14 gün, SCORAD ve kaşıntıda anlamlı iyileşme (Acta Derm Venereol)
- **Smith & Tarr (1979):** %10-20 üre, ihtiyozda klasik tedavi protokolü (Arch Dermatol)
- **Williams (2018):** üre + ceramide kombinasyon atopikte sinerji (Pediatr Dermatol)

## Hassasiyet

Düşük; cildin doğal bileşeni. Yüksek konsantrasyonda (%20+) hassas ciltte stinging yaygın. Patch test alerji prevalansı %<1.

## Kaynaklar

CIR (Urea Final Report 2005), SCCS Opinion, Pan RCT, Loden RCT, INCI Decoder.`,
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
    console.log(`✓ ${slug.padEnd(35)} → ${r.rows[0].len} char`);
    updated++;
  } else {
    console.log(`✗ ${slug} → bulunamadı`);
  }
}

console.log(`\nToplam güncellenen: ${updated}/${Object.keys(DETAILS).length}`);
await c.end();
