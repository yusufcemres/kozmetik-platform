// Faz 5 batch 5 — 5 INCI: Matrixyl (palmitoyl-pentapeptide-4) + lactic-acid + shea-butter + titanium-dioxide + cocamidopropyl-betaine
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'palmitoyl-pentapeptide-4': `**Palmitoyl Pentapeptide-4 (Matrixyl)**, kollajen tip I parçalanma fragmanını model alan **biyomimetik anti-aging peptit**. Sederma firmasının patentli aktifi olarak 2000 sonrası anti-aging serumlarda altın standart hâline geldi.

## Mekanizma

- **Subfragment biyomimetik:** kollajen tip I'in parçalanma ürünü olan KTTKS pentapeptidini taklit eder
- **Geri-besleme döngüsü kandırma:** dermal fibroblastı "kollajen yıkımı oldu, yeniden sentez gerek" sinyaline aldatır → tip I + III kollajen + fibronektin + GAG sentezi artar
- **Palmitoil zincir:** N-terminale eklenen yağ asidi penetrasyonu artırır (lipofilik) → stratum corneum bariyerini geçer
- **Anti-glikasyon:** ileri glikasyon ürünleri (AGE) oluşumunu hafif baskılar

## Form Farkları

| Form | Yapı | Özellik |
|------|------|---------|
| Matrixyl (Pal-KTTKS) | KTTKS pentapeptit + palmitoil | Klasik, geniş kanıt |
| Matrixyl 3000 | Pal-GHK + Pal-GQPR kombinasyon | Bakır peptit + yara iyileşmesi sinerjisi |
| Matrixyl Synthe'6 (Pal-Lys-Val-Lys) | Lizin temelli tripeptit | 6 ana ECM bileşeni hedefler |

## Etkili Konsantrasyon

- **%3-8 ppm Matrixyl çözeltisi:** günlük serum (Sederma standart konsantrasyon)
- **Etiket sıralamasında son 5-10 madde:** uygun aktif konsantrasyonu işareti
- Bu peptitler **çok düşük dozajda etkili** — etiket sıralaması yanıltıcı olabilir

## Kullanım Tüyoları

- **Endikasyonlar:** ince çizgi/kıvrım azaltma, fotodamage, post-laser bariyer onarımı
- **Sıra:** serum aşaması (suda çözünür peptit)
- **Kombinasyon:** retinol + Matrixyl = "anti-aging dynamic duo" — retinol hücre yenileme + Matrixyl ECM sentezi sinerjisi
- **Bakır peptit (GHK-Cu) ile uyumsuzluk:** aynı serumda bakır iyonları peptitleri inaktive edebilir → ayrı kullan
- **Sıklık:** günde 2 kez (sabah + akşam), 8-12 hafta görünür sonuç
- **Hamilelik:** topikal güvenli (sentetik amino asit dizisi, sistemik penetrasyon minimum)

## Kanıt

- **Robinson et al. (2005):** %3 ppm Matrixyl, 12 hafta, çift-kör RCT — kıvrım derinliği %44 azalma + cilt pürüzlülük iyileşmesi (Int J Cosmet Sci)
- **Lintner & Peschard (2000):** in vitro fibroblast kültür, kollajen tip I sentezi 117% artış (Int J Cosmet Sci)
- **Trookman et al. (2009):** %4 Matrixyl 3000 + retinol kombinasyonu, 8 hafta, anti-aging skor RCT (J Drugs Dermatol)
- **Schagen (2017):** topikal peptit sınıflandırması ve klinik kanıt review (Cosmetics)

## Hassasiyet

Çok düşük; biyomimetik peptit, alerjik kontakt dermatit nadir. Patch test prevalans %<0.5.

## Kaynaklar

CIR (Palmitoyl Pentapeptide-4), Robinson RCT (Int J Cosmet Sci 2005), Sederma teknik dosyası, INCI Decoder.`,

  'lactic-acid': `**Lactic Acid (Laktik Asit)**, AHA grubunun "yumuşak" üyesi. Süt ürünlerinden ya da mikrobiyal fermantasyondan elde edilir. Ciltte doğal NMF (natural moisturizing factor) bileşeni — bu yüzden glikolik aside göre **daha az tahriş edici** kabul edilir.

## Mekanizma

- **Korneosit dezgomofilizasyonu:** desmosom bağlarını çözer → eksfoliasyon
- **Hidrasyon:** nem çekici (humektant) — glikolikten farklı olarak hem eksfoliyant hem nemlendirici
- **Bariyer destekçi:** ceramide sentezini artırır (Rawlings et al. 1996) — diğer AHA'lardan ayrışan özellik
- **Pigmentasyon:** keratinosit yenilenmesi → leke azalma (uzun vadeli)
- **Antibakteriyel (zayıf):** pH düşürücü etki

## Konsantrasyon Bantları

| Form | % | Kullanım |
|------|---|----------|
| Toner / cleanser | %2-5 | Günlük başlangıç |
| Serum (ev) | %5-10 | Geceleri, AHA toleransı olan |
| Serum (gelişmiş) | %10-15 | The Ordinary tipi, profesyonel ev kullanımı |
| Profesyonel peeling | %30-70 | Klinik, 2-4 haftada bir |

## pH Bağımlılığı

LA aktif formu **pH 3.5-4.5** aralığında. pH 5+ formülasyonlar nemlendirici özelliği koruyup eksfoliyant gücü azalmış olur. Etiketin pH bilgisi vermesi tercih edilir.

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt eksfoliyasyon (glikolike yumuşak alternatif), atopik bariyer onarımı, ince çizgi, leke
- **Sıra:** toner/serum aşaması, krem öncesi
- **Kombinasyon:** niasinamid + LA = nemli + eksfoliyant kombo. Retinole alternatif veya retinolle 1 gün arası.
- **Güneş:** UV duyarlılığını artırır → SPF zorunlu (AHA kullanımı sırasında 7 gün)
- **Hassas cilt:** %5'ten başla — glikolikten daha tolere edilebilir
- **Hamilelik:** topikal güvenli kabul edilir (sistemik penetrasyon minimum)
- **AB regülasyon:** Annex'te kısıt yok, glikolikten daha esnek

## Kanıt

- **Smith (1996):** %12 LA, 12 hafta, fotodamage + ince çizgi anlamlı iyileşme (Cutis)
- **Rawlings et al. (1996):** %10 LA, ceramide sentezi artışı + bariyer fonksiyonu iyileşmesi (Arch Dermatol Res)
- **Stiller et al. (1996):** %12 LA + %4 hidrokinon, melasma 6 hafta, anlamlı pigmentasyon azalma (Arch Dermatol)
- **Tang & Yang (2018):** AHA topikal review, LA glikolike non-inferior + daha az tahriş (Clin Cosmet Investig Dermatol)

## Hassasiyet

Düşük-orta; ilk uygulamalarda hafif batma yaygın. Glikolike göre tolerans daha iyi. Patch test prevalans %1-3.

## Kaynaklar

CIR (Lactic Acid Final Report 2017), SCCS Opinion, Smith RCT, Rawlings ceramide sentezi.`,

  'shea-butter': `**Shea Butter (Butyrospermum Parkii / Shea Yağı)**, Batı Afrika kökenli *Vitellaria paradoxa* ağacının meyvesinden çıkarılan **trigliserid + triterpen** bakımından zengin bitki yağı. Kuru cilt + atopik dermatit + hassas bariyer için en yumuşak emolyentlerden.

## Bileşim

- **Trigliseridler (~%95):** stearik + oleik + linoleik + palmitik asit — bariyer destekçi
- **Triterpen alkoller (%3-12):** lupeol, alpha-amyrin, beta-amyrin — anti-enflamatuvar
- **Tokoferol (E vit):** doğal antioksidan
- **Allantoin (eser):** yatıştırıcı katkı
- **Karetinoidler:** beta-karoten, doğal sarı renk

Refined ("rafine") shea ile **unrefined** ("ham") farkı: ham daha fazla biyoaktif triterpen içerir ama daha güçlü kokulu olabilir.

## Mekanizma

- **Oklusiv emolyent:** stratum corneum yüzeyinde film → TEWL azalır
- **Anti-enflamatuvar:** triterpen alkoller NF-κB ve COX-2 baskılar (Verma 2012)
- **Bariyer destekçi:** stearik + oleik kombinasyonu cilt yağ asit profilini iyileştirir
- **Antioksidan:** UV-indüklenmiş ROS hafif baskılar
- **Yara iyileşmesi:** keratinosit migrasyonu in vitro hızlanır

## Etkili Konsantrasyon

- **%2-5:** günlük krem (yardımcı emolyent)
- **%5-15:** kuru cilt + atopik formüller
- **%15-100:** saf yağ (vücut, dirsek, topuk)
- **Yüz için %5-10:** komedojenik skoru 0/5 (sebum benzeri)

## Kullanım Tüyoları

- **Endikasyonlar:** atopik dermatit, kuru cilt, post-prosedür bariyer, kış kuruluğu, gebelikte güvenli, bebek bakımı
- **Sıra:** krem aşaması; yağ bazlı, suya çözünür aktiflerin üstünde
- **Kombinasyon:** seramid + niasinamid + shea = klasik bariyer trio
- **Akneye yatkın cilt:** linoleik asit içeriği yağlanma riski olanlarda yararlı (oleik:linoleik oranı önemli)
- **Hamilelik:** güvenli (Afrika kültüründe asırlardır kullanılır)

## Kanıt

- **Lin et al. (2018):** topikal shea butter, atopik dermatit, 28 gün — TEWL %35 azalma + kaşıntıda anlamlı iyileşme (Int J Mol Sci)
- **Verma et al. (2012):** lupeol triterpen anti-enflamatuvar mekanizma in vivo (Inflammopharmacology)
- **Hon et al. (2015):** shea içerikli formülasyon vs petrolatum, çocuk atopik dermatit non-inferior (Pediatr Dermatol)
- **Tholstrup et al. (2004):** shea butter yağ asit profili + cilt bariyer fonksiyonu (Br J Nutr)

## Hassasiyet

Çok düşük; ağaç fındığı (tree nut) kategorisinde olsa da fıstık alerjik proteinleri içermez (yapısal fark). Patch test alerji prevalansı %<0.5. Saf shea AB Annex'te kısıt yok.

## Kaynaklar

CIR (Shea Butter Final Report 2017), Lin RCT (Int J Mol Sci), Verma triterpen, INCI Decoder.`,

  'titanium-dioxide': `**Titanium Dioxide (Titanyum Dioksit, TiO2)**, mineral kökenli **inorganik UV filtresi**. Kimyasal filtre değil — UV ışığı **fiziksel olarak yansıtır + saçar + emer**. Hassas cilt + bebek + hamilelikte tercih edilen güneş koruma aktif.

## Mekanizma

- **UV reflektörü (geleneksel anlayış):** UV ışığı saçar/yansıtır
- **Modern anlayış:** %95 emici + %5 yansıtıcı (Cole et al. 2016) — tıpkı kimyasal filtre gibi enerjiyi emer ve ısı/IR olarak salar
- **UVB protect:** 290-320 nm güçlü
- **UVA protect (kısa):** 320-340 nm orta — pigmentasyon ve fotoyaşlanma için yetersiz olabilir → **avobenzone veya iron oxide ile kombinasyon gerek**

## Form Farkları

| Form | Boyut | Cilt Görünümü | Etki |
|------|-------|----------------|------|
| Konvansiyonel TiO2 | 200-400 nm | Beyaz cast (özellikle koyu ciltte) | Geniş spektrum reflektör |
| Nano-TiO2 (uncoated) | <100 nm | Şeffaf, görünmez | UV emici + serbest radikal riski |
| Coated nano-TiO2 (silica/alumina) | <100 nm | Şeffaf | Güvenli (AB Annex VI #27 onaylı) |

> ⚠️ **Uncoated nano-TiO2 + sıkmalı sprey** AB'de **yasak** (akciğer absorpsiyon riski). Coated nano krem/serumda izinli.

## AB Limit

**Annex VI #27 — Maksimum %25** (toplam veya nano formla birlikte). Gıda renklendirici E171 olarak 2022'den itibaren AB'de **yasak** (sadece topikal kullanım onaylı).

## Etkili Konsantrasyon

- **%3-7:** hafif tonlu güneş kremleri, makyaj BB krem
- **%7-15:** günlük yüz SPF 30-50
- **%15-25:** hassas cilt + bebek + plaj kremi (mineral-only formüller)

## Kullanım Tüyoları

- **Endikasyonlar:** hassas cilt, rosacea, bebek/çocuk, hamilelik, melasma (kimyasal filtreye alternatif), post-laser
- **Sıra:** rutinin **EN SON** aşaması (krem üstü, makyaj öncesi)
- **Miktar:** yüz için ~1.25 ml (yarım çay kaşığı), her 2 saatte yenile
- **Kombinasyon:** Iron oxide ile birlikte UVA + visible light (HEV) koruması, melasma için ideal
- **Beyaz cast:** koyu ciltlerde sorun — tinted (renkli) TiO2 ürünler veya iron oxide kombinasyonu çözüm
- **Hamilelik:** **en güvenli güneş filtresi tercihi** — sistemik emilim sıfır

## Kanıt

- **Cole et al. (2016):** TiO2 UV koruma mekanizması, %95 emici aslen + reflektör miti yıkıldı (Photodermatol Photoimmunol Photomed)
- **Smijs & Pavel (2011):** nano-TiO2 cilt penetrasyonu, sağlam stratum corneum'da sıfır sistemik emilim (Nanotechnol Sci Appl)
- **SCCS/1516/13:** nano-TiO2 kozmetik güvenlik değerlendirmesi
- **Schneider & Lim (2019):** physical UV filtreleri klinik review (J Am Acad Dermatol)

## Hassasiyet

Çok düşük; hipoalerjenik. AB hassas cilt + bebek formülasyonlarının altın standartı. Patch test prevalans %<0.1.

## Kaynaklar

CIR (Titanium Dioxide Final Report 2017), SCCS/1516/13, EU Annex VI #27, Cole 2016 mekanizma review.`,

  'cocamidopropyl-betaine': `**Cocamidopropyl Betaine (CAPB)**, hindistan cevizi yağından elde edilen **amfoterik yüzey aktif**. SLES (sodium laureth sulfate) gibi sülfatların yumuşak alternatifi olarak shampoo + cleanser + body wash'larda yaygın.

## Mekanizma

- **Amfoterik:** hem pozitif hem negatif yük → cilt pH'ında nötr davranış
- **Köpük + temizlik:** orta-düşük güçte (sülfattan az kuruluk)
- **Sülfat booster:** sertçe sülfat içeren formülasyonların sertliğini hafifletir
- **pH 5.5-7'de en aktif** — cilt-uyumlu pH aralığı

## Form Farkları

- **Saf CAPB (USP):** %30-35 sulu çözelti, formülasyon hammaddesi
- **Coco-Betaine ("ultra mild" form):** AS değişimli amino asit modifikasyonu, daha hassas
- **Lauramidopropyl betaine:** uzun zincir analoğu, biraz daha güçlü temizlik

## Etkili Konsantrasyon

- **%2-8:** yüz cleanser, baby shampoo (yumuşak)
- **%8-15:** vücut yıkama, bulaşık deterjan formülleri
- **%15+:** profesyonel temizlik (cilde değil)

## Kullanım Tüyoları

- **Endikasyonlar:** hassas cilt cleanser, bebek şampuanı, atopik bariyere uygun yıkama
- **Sıra:** yıkanan ürün — durulanır
- **Kombinasyon:** sodium-cocoyl-isethionate + glucoside-based yumuşak surfaktanlarla birlikte "sülfat-free" temizleyiciler
- **Kombinasyon (tehlike):** SLES yüksek konsantrasyonla beraber CAPB'nin yumuşatıcı etkisi sınırlı
- **Hassas cilt:** **kontakt dermatit** prevalansı orta — saf CAPB değil, içeriğindeki **DMAPA (3-dimethylaminopropylamine)** ve **amidoamine** safsızlıkları suçlu (üretim safsızlığı, kalite şirkete bağlı)

## Kanıt

- **Foti et al. (2003):** CAPB kontakt dermatit vakalarında DMAPA + amidoamine sorumlu, saf molekül değil (Contact Dermatitis)
- **Goossens & Asarch (2010):** CAPB allergen of the year sonrası epidemiyoloji review (Dermatitis)
- **Korting et al. (1991):** sülfat vs amfoterik yüzey aktif karşılaştırma, CAPB cilt iritasyonu daha az (Acta Derm Venereol)
- **CIR (2012):** CAPB güvenlik değerlendirmesi — saflaştırılmış formda güvenli, yüksek %DMAPA içerikli formlarda risk

## Hassasiyet

Orta; **kontakt dermatit prevalansı %3-7** (American Contact Dermatitis Society "Allergen of the Year 2004"). Patch test pozitifliğinde alternatif: decyl-glucoside, lauryl-glucoside, sodium-cocoyl-isethionate. Yüksek kalite üretim (DMAPA <%0.05) ile risk azalır.

## Kaynaklar

CIR (Cocamidopropyl Betaine Final Report 2012), Foti DMAPA review, Goossens 2010, INCI Decoder.`,
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
