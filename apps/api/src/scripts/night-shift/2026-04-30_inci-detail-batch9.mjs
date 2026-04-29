// Faz 5 batch 9 — 5 INCI tam (40 → 45 toplam)
// Kalan top partial: tetrasodium-edta, cetearyl-alcohol, allantoin, sodium-hyaluronate, butylene-glycol

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'tetrasodium-edta': `**Tetrasodium EDTA (Tetrasodyum EDTA)**, etilendiamintetraasetik asit'in sodyum tuzu. Kozmetikte **şelat ajanı** — formülasyondaki metal iyonlarını (kalsiyum, magnezyum, bakır, demir) bağlar ve nötralize eder. Koruyucu sistemin "sessiz kahramanı".

## Mekanizma

- **Metal iyon şelasyonu:** sert su mineralleri + üretim safsızlıklarını bağlar
- **Koruyucu booster:** mikroorganizma metal iyon ihtiyacını engeller → koruyucu etkinliği artar
- **Antioksidan stabilizasyon:** C vit + retinol + diğer hassas aktiflerin oksidlenmesini geciktirir
- **Sabun + temizleyici sertliği azaltma:** köpük + temizlik etkinliği artar (sert su)

## Etkili Konsantrasyon

- **%0.05-0.5:** günlük formülasyon (etiketin son sıralarında)
- **%0.5-1:** koruyucu sistem destekçi
- **%1+:** profesyonel temizleyici

> Etiketin son 3-5 madde arasında olması tipik şelat kullanımı işareti.

## Kullanım Tüyoları

- **Endikasyonlar:** geniş — yüz krem, serum, cleanser, shampoo, makyaj
- **Sıra:** formülasyon yardımcı (kullanıcı için ayrı uygulama yok)
- **Kombinasyon:** sodium-benzoate + potassium-sorbate + EDTA = "natural preservation" trio
- **Çevre:** bazı su arıtma tesislerinde EDTA persistent — alternatif: phytic-acid, sodium-phytate, glutamic acid diacetate
- **Hamilelik:** topikal güvenli

## Kanıt

- **CIR (EDTA Salts Final Report 2002):** kozmetik kullanımda %5'e kadar güvenli
- **AB Annex'te kısıt yok** (gıda + kozmetik geniş kullanım)
- **Hart (1984):** EDTA şelat mekanizması ve koruyucu sinerji review (Cosmet Toilet)

## Çevre

EDTA biyobozunur değil → atık suya geçer, su tesislerinde birikir. Modern kozmetik trend:
- **Tetrasodium GLDA (glutamic acid diacetate):** biyobozunur yeşil alternatif
- **Sodium phytate:** bitkisel kaynaklı şelat
- **Trisodium ethylenediamine disuccinate (EDDS):** biyobozunur yeşil

## Hassasiyet

Çok düşük; kontakt dermatit nadir (%<0.5). Patch test alerji nadir.

## Kaynaklar

CIR (EDTA Salts Final Report 2002), Hart 1984 review, AB Cosmetic Regulation Annex.`,

  'cetearyl-alcohol': `**Cetearyl Alcohol (Setearil Alkol)**, **cetyl alcohol (C16) + stearyl alcohol (C18) karışımı**. Kozmetikte en yaygın yağ alkolü emülsifier. Adında "alcohol" geçer ama **etanol DEĞİL** — yağ alkolü kategorisinde, cilt kurutmaz.

## "Alkol" Karışıklığı (Tekrar)

İki kategori:

| Kategori | Örnek | Cilt Etkisi |
|----------|-------|-------------|
| Kısa zincirli (kurutucu) | Ethanol, SD Alcohol, Denat | Cildi kurutur |
| Yağ alkolü (emolyent) | **Cetearyl Alcohol**, Cetyl, Stearyl, Behenyl | Cildi yumuşatır + bariyer destekçi |

> **"Alcohol-free" iddiası ile cetearyl alkol içerme uyumsuz değil** — yağ alkolü "alcohol" kategorisinde sayılmaz.

## Mekanizma

- **Emolyent:** stratum corneum yumuşatma
- **Emülsifier yardımcı:** yağ + su emülsiyon stabilize
- **Viskozite ayarlayıcı:** krem yapısını dolgun + kayan yapar
- **Bariyer destekçi:** doğal lipid yapı taşı analoğu
- **Saç:** keratin lifine bağlanır, koşullandırıcı

## Cetearyl vs Saf Cetyl/Stearyl

Cetearyl Alcohol = **dengeli karışım** — saf cetyl'den daha kalın, saf stearyl'den daha yumuşak. Üretici tarafında en yaygın (krem yapı + emülsifier birleşik özellikler).

## Etkili Konsantrasyon

- **%2-5:** günlük krem (yumuşatıcı + viskozite)
- **%5-10:** kuru cilt + bariyer formülasyonları
- **%10-20:** saç bakım koşullandırıcı

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt, atopik dermatit, retinol/AHA bariyer destek
- **Sıra:** krem aşaması; yağ bazlı emolyent
- **Komedojenik skor:** 2/5 (orta) — akneye yatkın ciltte yüksek konsantrasyon dikkat
- **Hamilelik:** güvenli
- **Bebek:** pediatrik formülasyonlarda yaygın
- **Saç:** sülfat-free şampuanların ana yapı taşı, koşullandırıcı

## Kanıt

- **CIR (Cetearyl Alcohol Final Report 2008):** kozmetik kullanımda güvenli, AB Annex'te kısıt yok
- **DiNardo (2005):** yağ alkolü komedojenik skor 2/5, akneye yatkın için orta dikkat (Dermatol Surg)
- **Loden (1997):** topikal yağ alkolü emolyent, TEWL azaltma (J Soc Cosmet Chem)

## Hassasiyet

Düşük; **ACDS Allergen of the Year 2007** — atopik dermatit popülasyonunda dikkat. Saflık + üretim kalitesine bağlı (genellikle bitkisel kaynaklı yağ alkolünde alerji nadir).

## Kaynaklar

CIR (Cetearyl Alcohol Final Report 2008), DiNardo 2005, ACDS 2007 atopik dikkat.`,

  'allantoin': `**Allantoin (Allantoin)**, doğal olarak **karakafes otu (Symphytum officinale)** kökünde + bebek idrarında bulunan kimyasal. Kozmetikte **yatıştırıcı + bariyer onarımı + yara iyileşmesi** üçlü etkili klasik aktif. Pediatrik dermatoloji onaylı.

## Mekanizma

- **Keratolitik (hafif):** keratin lifleri arasındaki bağları gevşetir → ölü hücre yenilenmesi
- **Yara iyileşmesi:** keratinosit migrasyonu + fibroblast proliferasyonu hızlanır
- **Anti-enflamatuvar:** TNF-α + sitokin baskılama (zayıf)
- **Yatıştırıcı:** mast hücre stabilize → kaşıntı + kızarıklık azaltma
- **Bariyer destekçi:** stratum corneum nem retansiyonu

## Etkili Konsantrasyon

- **%0.5-2:** günlük formülasyon (yatıştırıcı)
- **%2-5:** atopik dermatit + post-prosedür
- **AB Annex'te kısıt yok:** % limit yok

## Kullanım Tüyoları

- **Endikasyonlar:** rosacea, atopik dermatit, bebek pişiği, post-laser/IPL, retinol/AHA yatıştırıcı, dudak çatlağı
- **Sıra:** serum veya krem aşaması (suya çözünür)
- **Kombinasyon:** panthenol + niacinamide + allantoin = "soothing trio"
- **Hamilelik:** güvenli (FDA Pregnancy Category A)
- **Bebek:** pediatrik formülasyonlarda yaygın (Bepanthen, CeraVe Baby)

## Kanıt

- **Schweikl & Schmalz (2001):** allantoin yara iyileşmesi mekanizma in vitro (J Biomed Mater Res)
- **Savini et al. (2008):** topikal allantoin atopik dermatit, kuruluk + kaşıntı azaltma RCT (J Cosmet Dermatol)
- **Margraf & Covington (1967):** allantoin keratolitik etki klinik (J Cutan Pathol — historical reference)
- **Goldstein (2014):** allantoin pediatrik bariyer destek review (Pediatr Dermatol)

## Karakafes Otu Karışıklığı

Doğal kaynak karakafes otu (comfrey) — pyrrolizidine alkaloid içerir, **oral kullanımda hepatotoksik**. Modern kozmetik allantoin **sentetik olarak üretilir**, bu nedenle alkaloid içermez. Saflaştırılmış formla risk yok.

## Hassasiyet

Çok düşük; nadir kontakt dermatit (%<0.5). Hipoalerjenik. Bebek + atopik formülasyonlarda yaygın.

## Bepanthen Markası

Allantoin + dexpanthenol (provitamin B5) klasik kombinasyonu Bepanthen markasının temel formülü — pediatrik bariyer + yara iyileşmesi standardı.

## Kaynaklar

CIR (Allantoin Final Report 2007), Schweikl 2001, Savini RCT, Goldstein pediatrik review.`,

  'sodium-hyaluronate': `**Sodium Hyaluronate (Sodyum Hyaluronat)**, **hyaluronik asitin sodyum tuzu**. Kozmetik formülasyonlarda HA'nın daha kararlı + suda daha çözünür formu. Etiketlerde "hyaluronik asit" dendiğinde **çoğunlukla sodium hyaluronate kastedilir** — ikisi fonksiyonel olarak benzerdir.

## Saf HA vs Sodium Hyaluronate

| Özellik | Hyaluronic Acid | Sodium Hyaluronate |
|---------|-----------------|---------------------|
| Yapı | Glikozaminoglikan polimer | HA'nın sodyum tuzu |
| Stabilite | Düşük (oksidlenir) | Yüksek (raf ömrü 2+ yıl) |
| Suda çözünürlük | Sınırlı | Yüksek |
| Penetrasyon | Düşük (yüksek molekül ağırlıklı) | Form bazında değişken |
| Formülasyon kullanımı | Sınırlı | Çoğu serum + krem |

> Etiketinde "Sodium Hyaluronate" görüyorsan → **HA'nın endüstriyel standartlı formu**, aynı yatıştırıcı + nemlendirici etkiler.

## Mekanizma

- **Humektant:** suya bağlanma kapasitesi 1g = 6L su (HA gibi)
- **Bariyer destekçi:** stratum corneum nem retansiyonu
- **Anti-enflamatuvar:** UV-indüklenmiş + post-prosedür kızarıklık azaltıcı
- **Yara iyileşmesi:** keratinosit migrasyonu + ECM yenilenmesi

## Molekül Ağırlığı (Önemli)

| MA Aralığı | Penetrasyon | Etki |
|------------|-------------|------|
| **Yüksek MA (>1000 kDa)** | Yüzey | Anlık nemlendirme + bariyer film |
| **Orta MA (100-300 kDa)** | Stratum corneum | Derin hidrasyon |
| **Düşük MA / Mikro-HA (<50 kDa)** | Epidermis | Fibroblast aktivasyon (kollajen sentezi) |
| **Crosspolymer HA** | Yüzey + uzatılmış salım | Yatıştırıcı film + uzun süreli nem |

**Multi-MA serumlar** (3-5 farklı molekül ağırlığı kombinasyonu) en yüksek hidrasyon — örn. The Ordinary Hyaluronic Acid 2% + B5.

## Etkili Konsantrasyon

- **%0.1-2:** günlük formülasyon
- **%1-2 multi-MA:** premium serum
- **Yüksek konsantrasyon ≠ daha iyi:** düşük rutubette ozmotik etki paradoksen kuruluk yapabilir

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt, anti-aging, atopik dermatit, retinol/AHA bariyer destek, post-prosedür
- **Sıra:** serum aşaması (su bazlı)
- **Nemli cilde uygula:** kuru cilde HA havadan değil, alt katmanlardan su çekebilir → kuruluk
- **Mühürle:** üstüne emolyent + okluzif (skualan, shea, vazelin) → su tutar
- **Hamilelik:** güvenli (cilt doğal molekülü)
- **Bebek:** hipoalerjenik

## Kanıt

- **Pavicic et al. (2011):** %0.1 HA serumu, 8 hafta, ince çizgi anlamlı azalma (J Drugs Dermatol)
- **Jegasothy et al. (2014):** nano-HA, kollajen tip III sentezi artışı (Clin Aesthet Dermatol)
- **Bukhari et al. (2018):** topikal HA günlük, atopik dermatit kuruluğunda iyileşme

## Hassasiyet

Çok düşük; HA cildin doğal bileşenidir. Patch test alerji prevalansı %<0.5.

## Kaynaklar

CIR (HA + Sodium Hyaluronate Final Report 2009), Pavicic RCT, INCI Decoder, Bukhari RCT.`,

  'butylene-glycol': `**Butylene Glycol (Butilen Glikol)**, sentetik küçük moleküllü **glikol türevi**. Propylene glycol'a benzer ama **iritan profili daha düşük** — kozmetikte humektant + solvent + penetrasyon enhancer rolünde popüler. "Hassas cilt için propylene glycol alternatifi" olarak öne çıkar.

## Propylene Glycol vs Butylene Glycol

| Özellik | Propylene Glycol (PG) | Butylene Glycol (BG) |
|---------|------------------------|----------------------|
| Molekül | C3 (3 karbon) | C4 (4 karbon) |
| Patch test alerji | %2-5 | %<1 |
| Stinging eşiği | %15+ | %30+ |
| Maliyet | Düşük | Orta |
| ACDS Allergen | Allergen of the Year 2018 | Allergen sınıflandırması yok |
| Etiket trendi | Azalmakta (hassas cilt formüller) | Artmakta |

> **Hassas cilt formülasyonlarında BG > PG** — eşit fonksiyon, daha az iritasyon.

## Mekanizma

- **Humektant:** havadaki nemi cilde çeker (gliserin gibi ama daha küçük molekül + daha hızlı emen)
- **Solvent:** suda + yağda çözünmez aktiflerin çözücüsü (geniş çözünürlük)
- **Penetrasyon enhancer:** stratum corneum lipid yapısına geçici girer → diğer aktiflerin emilimini artırır
- **Anti-mikrobiyal (zayıf):** %15+ konsantrasyonda koruyucu booster
- **Hafif anti-bakteriyel:** kosmetik formülün koruyucu sistemi destekler

## Etkili Konsantrasyon

- **%2-5:** günlük formülasyon (humektant)
- **%5-15:** ekstra nemlendirici + solvent
- **%15-30:** koruyucu sistem destekçi (paraben-free)
- **%30+:** profesyonel medikal (sınırlı kullanım)

## Kullanım Tüyoları

- **Endikasyonlar:** hassas cilt + propylene glycol alerji geçmişi, kuru cilt, formül stabilite
- **Sıra:** serum + krem aşamasında, suya çözünür aktiflerle birlikte
- **Hamilelik:** topikal güvenli
- **Bebek:** orta tolerans (yüksek konsantrasyon kaçınılır)
- **Kombinasyon:** niacinamide + HA + butylene glycol = klasik nemli + yatıştırıcı serum yapısı
- **Saklama:** hijyen-stabil, bozulmaz

## Kanıt

- **CIR (Butylene Glycol Final Report 2018):** kozmetik kullanımda %50'ye kadar güvenli
- **Funk & Maibach (1994):** propylene glycol vs butylene glycol patch test, BG anlamlı az iritasyon (Contact Dermatitis)
- **Lessmann et al. (2005):** glikol grubu kontakt dermatit review (Contact Dermatitis)

## Hassasiyet

Çok düşük; kontakt dermatit nadir (%<1 patch test). Hipoalerjenik kategori. Atopik dermatit hastalarında bile genellikle iyi tolere edilir.

## Doğal Alternatif

- **Pentylene glycol:** %1,5-pentanediol, doğal kaynaklı (şeker pancarından), humektant + koruyucu
- **Propanediol (1,3):** bitki bazlı, sürdürülebilir alternatif
- **Methylpropanediol:** bitki bazlı premium

## Kaynaklar

CIR (Butylene Glycol Final Report 2018), Funk & Maibach 1994 patch test, Lessmann glikol review.`,
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
  }
}

console.log(`\nToplam: ${updated}/${Object.keys(DETAILS).length}`);
await c.end();
