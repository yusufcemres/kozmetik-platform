/**
 * Faz C — Top 20 ek INCI detailed_description (batch 3).
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
  'azelaic-acid': `**Azelaic Acid (Azelaik Asit)** çok yönlü bir aktif — akne, melasma ve rosacea için.

## Mekanizma
- **Anti-bakteriyel**: Cutibacterium acnes baskılar
- **Tirozinaz inhibisyonu**: Melanin sentezini düzenler (orta düzey aydınlatma)
- **Anti-enflamatuar**: COX-2 + 5-LOX inhibitor
- **Keratolitik**: Hafif eksfolyant — gözenek tıkanıklığını açar

## Etkili Konsantrasyon
- **%5-10**: OTC standart, akne + post-inflamatuar leke
- **%15-20**: Reçeteli, melasma + rosacea (Finacea, Skinoren)

## Avantajlar
- Hassas cilt güvenli (BHA'dan daha az tahriş)
- Hamilelikte güvenli kabul (FDA Pregnancy Cat B)
- Fotosensitivite yapmaz
- Gebelikte yasak olan retinol/hidrokinon yerine alternatif

## Kullanım
- Sabah veya akşam, niasinamid + nemlendirici sandwich
- Bakuchiol + niasinamid ile sinerji
- Hidrokinon + retinoidlerle değiştirilebilir (gebelik)

## Kanıt
- Iraji et al. 2007: %20 azelaik asit melasma'da hidrokinon ile karşılaştırılabilir.
- Webster 2014: Akne tedavisinde benzoyl peroxide alternatifi.`,

  'glycolic-acid': `**Glycolic Acid (Glikolik Asit / AHA)** alfa hidroksi asit grubunun en küçük molekülü.

## Mekanizma
- **Eksfoliyant**: Stratum korneum bağlarını gevşetir
- **Kollajen indüksiyonu**: Yüksek konsantrasyonlarda (>15%) fibroblast aktivasyonu
- **Aydınlatma**: Hızlı hücre yenilenmesi → leke azalma
- **Hidrasyon**: NMF (natural moisturizing factor) sentezini artırır

## Konsantrasyon Bantları
- **%5-7**: Günlük kullanım (toner, esans)
- **%8-10**: Haftada 2-3 kez (serum)
- **%15-30**: Profesyonel peeling (kontrol)
- **%30+**: Reçeteli / dermatolog uygulamalı

## pH Bağımlılığı
pH **3.0-4.0** optimum etki. pH<3 cilt yanma riski; pH>4.5 etkisiz.

## Tüyo: Glycolic vs Lactic vs Mandelic
| Asit | Molekül | Penetrasyon | Tahriş |
|---|---|---|---|
| **Glycolic** | En küçük | Derin | Yüksek |
| **Lactic** | Orta | Orta | Orta |
| **Mandelic** | Büyük | Yüzeysel | Düşük |

Hassas cilt: Mandelic. Yağlı/oily skin: Glycolic. Karma: Lactic.

## Yan Etkiler
- Fotosensitivite (SPF zorunlu)
- İlk 2-4 hafta hafif soyulma normal
- Gebelikte düşük konsantrasyon (5-7%) güvenli kabul

## Kanıt
- Yamamoto et al. 2006: %5 glikolik 4 hafta cilt parlaklık +25%.
- Babilas et al. 2012: AHA peeling photoaging korumasında orta düzey kanıt.`,

  'lactic-acid': `**Lactic Acid (Laktik Asit / AHA)** süt ve fermente bitkiden elde edilen yumuşak AHA.

## Mekanizma
- **Hafif eksfolyant**: Glycolic'ten %30 daha hafif tahriş
- **Hidrasyon**: NMF (doğal nemlendirici faktör) zaten cilt yapı taşı
- **Bariyer destek**: Stratum korneum'u parçalamadan yeniler
- **Mild aydınlatma**: Tirozinaz hafif inhibisyonu

## Etkili Konsantrasyon
- **%5-7**: Günlük (toner, esans)
- **%10**: Haftada 2-3 kez (serum)
- **%12+**: Spot tedavi, hassas cilt için maksimum

## Hassas / Kuru Cilt İçin İdeal
Glikolik tahrişe duyarlı kişiler için tercih. NMF yapısında bulunduğu için cilt nemini artırır (paradoksal — eksfoliyant ama nemlendirici).

## Sun Reactivity
Diğer AHA gibi fotosensitivite yapar — SPF zorunlu.

## Kullanım
- Akşam, retinolden ayrı gece
- Niasinamid + ceramide ile sinerji
- AmLactin (vücut için %12 lactic) → keratoz pilaris ("tavuk derisi") tedavisinde altın standart

## Kanıt
- Smith et al. 1996: %12 laktik vücut keratoz pilarisinde %50+ iyileşme.
- Stiller et al. 1996: %5 laktik 12 hafta yüz cilt elastikiyeti +18%.`,

  'bakuchiol': `**Bakuchiol (Bakuçiol)** hassas cilt + gebelik için "doğal retinol alternatifi".

## Mekanizma
*Psoralea corylifolia* (Babchi) bitkisinden çıkan meroterpene. Retinol gibi RAR/RXR reseptörlerine **dolaylı** bağlanarak benzer gen ifadesini tetikler:
- Kollajen Tip I/III/VII sentezi
- MMP-1 inhibisyonu
- Hücre yenilenmesi
- Antioksidan etki (retinolün yapamadığı)

## Retinol vs Bakuchiol — Klinik
| Parametre | %0.5 Retinol | %0.5 Bakuchiol |
|---|---|---|
| Kollajen | +35% | +28% |
| Kırışık | -23% | -19% |
| Hiperpigmentasyon | -32% | -27% |
| Tahriş | 4.5/10 | 1.2/10 |
| Fotosensitivite | Yüksek | Düşük |

## Etkili Konsantrasyon
- **%0.5**: Standart başlangıç
- **%1-2**: İleri seviye

## Avantajlar
- Hamilelik **güvenli** (retinol yasak)
- Hassas + reaktif cilt
- AHA/BHA ile aynı zaman penceresinde kullanılabilir
- Gündüz fotosensitif değil
- Bakuchiol + niasinamid + peptit kombin sinerjik

## Kanıt
- Dhaliwal et al. 2018 (Br J Dermatol): RCT 12 hafta, %0.5 bakuchiol = %0.5 retinol etki, daha az tahriş.
- Chaudhuri et al. 2014: Topikal kollajen sentezi in vivo kanıtlandı.

## Etiket Tüyosu
"Bakuchiol" + "Babchi Oil" karışıyor — saf bakuchiol etkili, tüm yağ daha az.`,

  'kojic-acid': `**Kojic Acid (Kojik Asit)** mantar (Aspergillus oryzae) fermenti aydınlatıcı.

## Mekanizma
- **Tirozinaz inhibisyonu**: Bakırı şelatlayarak enzim aktivitesini bloke eder
- **Antioksidan**: Hafif ROS süpürücü
- **Antibakteriyel** (orta)

## Etkili Konsantrasyon
- **%1-2**: Standart aydınlatma
- **%2-4**: Yüksek konsantrasyon (melasma kombin formüllerde)

## AB / Türkiye Düzenlemesi
- AB Annex III: maksimum **%1 yüz** (2024 SCCS güncellemesi)
- 2 saatte yıkanıyorsa cilt-on koşulu (rinse-off limit yüksek)

## Yan Etkiler
- Hassas ciltte kontakt dermatit nadir
- Uzun süreli yüksek konsantrasyon ciltte hassasiyet
- Fotosensitivite yapmaz

## Kombin Stratejisi
Hidrokinonun kanıtlanmış alternatifi. Klinik melasma protokolü: kojik %2 + arbutin %2 + traneksamik %3 + niasinamid %5 + SPF 50.

## Kanıt
- Nawarak et al. 2017: %2 kojik asit 8 hafta melasma %25 azalma.
- Verallo-Rowell et al. 2009: Kojik + glikolik kombin retinol ile karşılaştırılabilir.`,

  'tranexamic-acid': `**Tranexamic Acid (Traneksamik Asit)** melasmada altın standartlardan biri.

## Mekanizma
Lizin amino asit türevi:
- **Plasminojen aktivasyon inhibitörü**: UV-induced melanin sentezini sıfırlar
- **Vasküler bileşeni de hedefler**: Melasmadaki inflamasyon + damar genişlemesi
- **Anti-enflamatuar**: COX yolağı baskılar

## Etkili Konsantrasyon
- **Topikal %2-5**: Cilt aydınlatma
- **Oral 250-500 mg/gün**: Reçeteli melasma (klinik)

## Hidrokinon Alternatifi
Hidrokinon kontraendikasyonlarında (hamile, hassas) ilk seçenek. Klinik kanıt güçlü.

## Yan Etkiler
- Topikal: nadiren tahriş
- Oral: pıhtılaşma riski (kalp damar geçmişi varsa kontraendike)

## Kanıt
- Lee et al. 2016: %5 traneksamik 12 hafta melasma %35 azalma.
- Karn et al. 2012: Oral 250mg melasma'da hidrokinon ile karşılaştırılabilir, daha az yan etki.

## Türkiye
Topikal serbest (OTC), oral reçeteli.`,

  'arbutin': `**Arbutin** doğal hidrokinon türevi (dut, ayva, üzüm yaprağı).

## Mekanizma
β-arbutin (en yaygın) cilt enzimleri ile **ağır ağır** hidrokinone dönüşür. Hidrokinonun aksine:
- Yan etki sınırlı (ochronosis riski yok)
- Tirozinaz inhibisyonu daha kontrollü
- Melasma + post-inflamatuar leke + güneş lekesinde etkili

## α-Arbutin vs β-Arbutin
- **α-arbutin**: Daha güçlü, daha pahalı, daha sentetik
- **β-arbutin**: Doğal, daha hafif, daha geniş kullanım

## Etkili Konsantrasyon
- **%2**: Standart serum
- **%4**: Yüksek konsantrasyon (Ordinary Alpha Arbutin %2 ile global)

## AB Limit
Maksimum **%2** (Annex III 2024 update — daha önce belirsizdi).

## Kombinasyon
Klinik leke protokolü: arbutin %2 + niasinamid %5 + traneksamik %3 + SPF 50.

## Kanıt
- Boissy et al. 2005: %1 α-arbutin tirozinaz inhibisyonu hidrokinon %0.5 ile eşit.
- Hori et al. 2003: Alpha-arbutin 12 hafta melasma %30 azalma.`,

  'palmitoyl-pentapeptide-4': `**Palmitoyl Pentapeptide-4 (Matrixyl)** anti-aging peptit.

## Mekanizma
Palmitoil grup + 5 amino asit (Lys-Thr-Thr-Lys-Ser):
- **Kollajen + glikozaminoglikan sentezi** (fibroblast stimülasyon)
- **Elastin sentezi** (ekstraselüler matriks onarımı)
- **MMP inhibisyonu** (yıkıcı enzim baskılar)

Etkin "neopeptide" first-gen — kanıtlanmış orijinal Matrixyl molekülü.

## Etkili Konsantrasyon
- **%3-8**: Standart serum (Matrixyl 3000 = palmitoyl tripeptide-1 + palmitoyl tetrapeptide-7 kombinasyonu)
- **Bakım rutinine 6-12 hafta** sonra fark

## Avantajlar
- Tahrişsiz (retinol alternatifi)
- Gebelikte güvenli
- Hassas ciltler dahil tüm cilt tipleri
- C vitamini, niasinamid, retinol ile sinerji

## Pazarlama vs Bilim
"Botoks alternatifi" pazarlama mit — Argireline (asetil heksapeptit-8) o iddiada (mimik kası gevşetir). Matrixyl daha çok kollajen mimari.

## Kanıt
- Robinson et al. 2005: Pal-KTTKS %5 12 hafta kırışık derinliği -20%.
- Lupo + Cohen 2007: Topikal Matrixyl retinol ile karşılaştırılabilir, daha az tahriş.`,

  'argireline': `**Argireline (Asetil Heksapeptit-8 / Acetyl Hexapeptide-8)** "topikal botoks" peptidi.

## Mekanizma
SNAP-25 proteini mimic — botoks gibi mimik kası gevşetici çalışır:
- Asetilkolin salınımını azaltır
- Mimik kasları gevşetir → mimik kırışıklıkları azalır
- **Statik kırışıklara etkisi yok** (kollajen kaybı, elastosis)

## Etkili Konsantrasyon
- **%5-10**: Anti-aging serum
- **%10**: Maksimum etkili (üzeri toksik etki yok)

## Hangi Bölge?
- ✅ Kaz ayağı, alın çizgileri, kaş arası (mimik)
- ❌ Statik nasolabial fold, marionette lines (kollajen kaybı — botox/filler gerekli)

## Klinik Etki Sınırı
Botoks injeksiyonun ~%30-40'ı kadar etki, ama:
- Cerrahi prosedür gerektirmez
- Yan etkisi yok
- 8-12 hafta sonra fark görünür
- Botoks varsa kombin etkisi destekler

## Kanıt
- Blanes-Mira et al. 2002: %10 argireline 30 gün, mimik çizgi derinliği -30%.
- Wang et al. 2013: Topikal argireline IL-1β + TNF-α düşüşü (anti-enflamatuar bonus).`,

  'allantoin': `**Allantoin** karakafes (Symphytum) bitkisinin yatıştırıcı + onarıcı bileşeni.

## Aktif Bileşenler
Karakafes (Symphytum officinale) doğal kaynak; sentetik üretim de yaygın (saflık nedeniyle).

## Mekanizma
- **Hücre yenilenmesi**: Keratinosit proliferasyonu artırır
- **Yumuşatıcı**: Stratum korneum nemini artırır
- **Anti-enflamatuar**: Hassas ciltlerde kızarıklık azaltır
- **Antioksidan** (orta düzey)
- **Yara iyileşmesi**: Granülasyon dokusu oluşumunu hızlandırır

## Etkili Konsantrasyon
- **%0.1-0.5**: Hafif yatıştırıcı
- **%0.5-2**: Onarıcı (post-prosedür)
- **AB max %2** — Annex III

## Kullanım
- Hassas, reaktif, atopik ciltlerde güvenli
- Bebek ürünleri yaygın (paraben + sülfat-free formülasyonlarda)
- Genelde panthenol, centella, ceramide ile kombin

## Bepanthen + Cicaplast Aktif Maddesi
Bepanthen (panthenol + allantoin) ve La Roche-Posay Cicaplast B5 ürünlerinin temel iyileştirici molekülü.

## Kanıt
- CIR 2010 Final Report: "Safe in cosmetics up to 2%"
- Becker et al. 2010: Topikal yara iyileşmesinde plasebo üstü etki.`,

  'rosa-canina-fruit-oil': `**Kuşburnu Yağı (Rosehip Oil)** doğal retinoid + omega kaynak.

## Aktif İçerik
- **Linoleik asit %44** (Omega-6)
- **α-linolenik asit %35** (Omega-3)
- **Trans-retinoik asit (eser)** — doğal retinoid
- **Tokoferoller (E vitamini)**
- **β-karoten**

## Mekanizma
- **Hücre yenilenmesi**: Doğal A vitamini içeriği — hafif retinol etkisi
- **Bariyer onarımı**: Yüksek omega içeriği, lipid lameller arası dolgu
- **Anti-aging**: Trans-retinoik asit + tokoferol sinerji
- **Yara iyileşmesi**: Kollajen sentez stimülasyonu

## Kullanım
- Akşam, temiz cilde 3-5 damla
- Düşük komedojen skor (1-2)
- Akne için risk düşük
- Hamilelik güvenli (retinol değil, doğal RA eseri)

## Soğuk Sıkım Önemli
- **Cold-pressed organik** > rafine
- Refrigeratorda saklayın (linoleik asit oksitlenmeye yatkın)

## Kombin
- C vitamini + rosehip + SPF (sabah)
- Niasinamid + rosehip (akşam)

## Kanıt
- Kim et al. 2018: Topikal rosehip 8 hafta melasma + cilt elastikiyeti iyileşme.
- Phetcharat et al. 2015: Oral + topikal rosehip artrit ağrısında orta etki.`,

  'cocamidopropyl-betaine': `**Cocamidopropyl Betaine (CAPB)** hindistan cevizi türevi yumuşak yüzey aktif.

## Mekanizma
Amphoter zwitterion molekülü:
- **Köpürtücü** (anyonik SLS/SLES alternatifi)
- **Cilt dostu pH-uyumlu temizleyici**
- **Visco modifier** (kıvam sağlar)

## SLS/SLES vs CAPB
| | SLS | CAPB |
|---|---|---|
| Köpük | Çok | Orta |
| Cilt tahriş | Yüksek | Düşük |
| Maliyet | Çok ucuz | Ucuz-orta |
| Yetişkin yüz | İdeal değil | İdeal |

## Etkili Konsantrasyon
- **%2-15**: Şampuan, jel temizleyici, banyo köpüğü
- Yüz temizleyici %2-5 ideal
- %15+ dudak balsam vb. nadir

## Hassasiyet Notu
Methylchloroisothiazolinone (MCI) kontaminasyonu eski formüllerde alerjik reaksiyona yol açtı. Modern üretim daha saf, alerji nadir.

## Kullanım
- Bebek + hassas cilt sülfat-free formülasyonlar
- Yüz + saç temizliğinde tercih edilen yumuşak alternatif
- Vegan cabacha (hindistan cevizi türevi)

## Kanıt
- CIR 2012: "Safe in cosmetics up to 25% in rinse-off, up to 5% leave-on"`,

  'caprylhydroxamic-acid': `**Caprylhydroxamic Acid (Kaprilhidroksamik Asit)** modern paraben-free koruyucu.

## Mekanizma
- **Antifungal**: Demir şelatlayarak küf gelişimini önler
- **Antimicrobial sinerji**: Glycerin + caprylhydroxamic kombinasyonu (Spectrastat)
- pH 4-7 aralığında etkili

## Avantajlar (paraben alternatif)
- Paraben-free formülasyonlarda standart
- Vegan + clean beauty etiketli ürünlerde sıkça
- Hassas ciltlerde alerji nadir
- AB Annex V'te güvenli kabul

## Etkili Konsantrasyon
- **%0.2-0.6**: Standart koruyucu
- Genelde ethylhexylglycerin ile kombin (Spectrastat G2)

## Kullanım
- Su bazlı serum + jel temizleyici + emülsiyon
- Hassas ürünlerde tercih edilen modern koruyucu

## Kanıt
- CIR 2018: "Safe in cosmetics up to 1%"
- Steinberg 2010: Mikrobiyal stabilite parabenle karşılaştırılabilir.`,

  'ectoin': `**Ectoin (Ektoin)** çevresel stres koruyucu — çöl bakterilerinden esinlenen aktif.

## Mekanizma
*Halomonas elongata* gibi extremophile bakterilerin doğal olarak ürettiği amino asit türevi. Tuz, ısı, kuruluk, UV stresine karşı **hücre membran koruması**:

- **Su yapı stabilizasyonu** (preferential exclusion)
- **Protein denaturasyonu önleyici**
- **UV-induced DNA hasar koruması**
- **Anti-enflamatuar** (TLR4 yolağı modülasyonu)

## Etkili Konsantrasyon
- **%0.3-2**: Standart serum
- **%5+**: Yüksek konsantrasyon (post-prosedür kit)

## Endikasyonlar
- Atopik dermatit (Ektoin %2 krem klinik kanıt)
- Hassas + reaktif cilt
- Şehir kirliliği koruyucu
- Klima/ısı düşük nem yatıştırıcı

## Kullanım
- Hassas cilt + atopik = ana aktif
- HA + niasinamid + ektoin = trinity formül

## Kanıt
- Marini et al. 2014: Ektoin %2 8 hafta atopik %50 iyileşme.
- Heinrich et al. 2007: PM2.5 cilt korumada plasebo üstü.`,

  'asiaticoside': `**Asiaticoside** Centella Asiatica\'nın ana aktif bileşeni.

## Mekanizma
Triterpenoid saponin grubu:
- **Fibroblast aktivasyonu**: Kollajen Tip I + III sentezi
- **TGF-β yolağı**: Yara iyileşmesi
- **Anti-enflamatuar**: TNF-α + IL-6 baskılayıcı
- **Antioksidan** (orta düzey)

## Centella'nın 4 Aktifi
- **Asiaticoside** (en kanıtlanmış)
- **Madecassoside** (anti-enflamatuar dominant)
- **Asiatic acid**
- **Madecassic acid**

Bunların kombini "TIA" (Total Ingredient Asiaticoside) etiketli.

## Etkili Konsantrasyon
- **%0.1-0.5**: Standart krem
- **%2+**: Klinik düzey (post-prosedür kit)

## Endikasyonlar
- Hassas + reaktif cilt
- Post-lazer/peeling/microneedling iyileşme
- Atopik dermatit destek
- Akne sonrası iz
- Yara iyileşme (eski Hint Ayurveda kullanımı)

## Kanıt
- Bonté et al. 1995: Asiaticoside %3 in vitro kollajen +35%.
- Damkier 2018: Topikal asiaticoside klinik atopik dermatit orta düzey iyileşme.

## Markalar
SKIN1004 Madagascar Centella, COSRX Centella, Purito Centella — temel sektör formülasyonları.`,

  'adenosine': `**Adenosine (Adenozin)** hücre enerji + anti-aging molekülü.

## Mekanizma
Tüm hücrelerin kullandığı RNA/ATP yapı taşı:
- **Fibroblast proliferasyonu**: Kollajen + elastin sentez stimülasyon
- **A2A reseptörü aktivasyonu**: Anti-enflamatuar
- **Hücre enerjisi**: Yaşlı hücreleri "uyandırır"
- **Vasküler etkiler**: Mikro dolaşım iyileştirici

## Avantajlar
- Hassas cilt güvenli
- Hamilelikte güvenli
- Tahriş yok
- Kombin için ideal (retinol/peptit ile sinerji)

## Etkili Konsantrasyon
- **%0.1-1**: Standart anti-aging
- AB Annex III max **%0.4**

## Kullanım
- Niasinamid + adenozin + peptit kombin
- Mature cilt rutininde standart
- Profesyonel mezoterapi protokolünde de kullanılır

## Kanıt
- Abella 2006: Topikal adenozin %0.1 60 gün kırışık -10%, esneklik +15%.
- Andre-Frei et al. 1999: Fibroblast proliferasyonu in vitro kanıtlandı.`,

  'centella-asiatica-leaf-extract': `**Centella Asiatica (CICA / Gotu Kola)** anti-enflamatuar ve bariyer onarımı için kanıtlanmış bitki ekstresi.

## Aktif Bileşenler
- **Asiaticoside** — yara iyileşmesi, kollajen sentezi
- **Madecassoside** — anti-enflamatuar, kızarıklık azaltma
- **Asiatic Acid** — antioksidan
- **Madecassic Acid** — bariyer fonksiyonu

## Mekanizma
- Fibroblastları stimüle ederek kollajen sentezini artırır
- TGF-β yolağını aktive eder (yara iyileşmesi)
- TNF-α ve IL-1β gibi enflamatuar sitokinleri baskılar

## Etkili Konsantrasyon
- **%2-5**: Standart, hassas ciltlerde güvenli
- **%5-10**: Yüksek konsantrasyon (TIA — Total Asiaticoside)

## Kullanım Tüyoları
- **Post-prosedür** (lazer, peeling, microneedling sonrası) altın standart
- **Hassas + reaktif** ciltlerde günlük kullanım güvenli
- **Akne sonrası** post-inflamatuar kızarıklığı yatıştırır
- Retinol veya AHA tahriş sonrası "kurtarıcı"

## Kanıt
- Bonté et al. 1995 (Eur J Pharmacol): Asiaticoside %3 kollajen sentezi +35%.
- Damkier 2018: CICA kremi atopik dermatit semptomlarında orta düzey iyileşme.

## Kaynaklar
- [INCI Decoder Centella](https://incidecoder.com/ingredients/centella-asiatica-leaf-extract)`,

  'phenoxyethanol': `**Phenoxyethanol (Fenoksietanol)** AB ve FDA onaylı yaygın koruyucu maddedir.

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
- SCCS/1486/12: Çocuklar dahil %1\'e kadar güvenli`,

  'squalane': `**Squalane (Skualan)** hayvansal/bitkisel kaynaklı emollient yağ.

## Mekanizma
- **Cilt mimik**: Sebumun %12-15'i squalene; squalane (hidrojene formu) cilt benzeri yumuşatıcı
- **Bariyer onarımı**: Lipid lameller arasına yerleşir
- **Anti-enflamatuar**: Hafif, hassas ciltlerde güvenli
- **Antioksidan** (eserlerde)

## Squalane vs Squalene
| | Squalene | Squalane |
|---|---|---|
| Kararlılık | Düşük (oksitlenir) | Yüksek (saturated) |
| Komedojen risk | Orta | Düşük |
| Maliyet | Düşük | Yüksek |
| Kullanım | Sebumda doğal | Topikal kozmetik |

**Squalane** topikal için tercih edilen form.

## Kaynak
- **Köpekbalığı karaciğeri** (eski/etik dışı, yasak çoğunlukla)
- **Zeytin yağı** (en yaygın bitkisel)
- **Şeker kamışı** (fermente, vegan tercih)

## Etkili Konsantrasyon
- **%5-100**: Tek başına yağ olarak kullanılabilir
- Krem içinde %1-10 standart

## Avantajlar
- Tüm cilt tipleri (akne dahil)
- Komedojen skor 1 (çok düşük)
- Hassas + atopik güvenli
- HA + squalane = klasik nem + occlusive kombin

## Kanıt
- Pavicic et al. 2014: Topikal squalane bariyer fonksiyonu iyileşme.
- Kim & Karadeniz 2012: Vegan squalane (sugar cane) köpekbalığı eşdeğeri kalite.`,

  'urea': `**Urea (Üre)** humektant + keratolitik aktif.

## Mekanizma
Konsantrasyona göre çift etki:
- **Düşük (<%10)**: Humektant — su tutar
- **Yüksek (%10-40)**: Keratolitik — hipertrofik stratum korneumu çözer

## Konsantrasyon Bantları
- **%2-5**: Hafif nemlendirici (yüz)
- **%5-10**: Orta (vücut, kuru cilt)
- **%10-20**: Yoğun keratolitik (kuru topuk, dirsek, keratoz pilaris)
- **%20-40**: Reçeteli/profesyonel (psoriasis, hipertrofik nasırlar)

## Avantajlar
- Cilt mimik (NMF yapı taşı)
- Hassas ciltlerde güvenli
- Keratolitik etkisi salisilik aside benzer ama daha hafif
- Hamilelikte güvenli

## Eucerin UreaRepair (Ana Marka)
%5, %10, %30 hatları ile farklı endikasyon segmentleri.

## Kullanım
- Tırnak çevresi sertleşme
- Topuk çatlağı (yoğun%20-40)
- Kuru cilt günlük (%5-10)
- Atopik dermatit destek

## Kanıt
- Pan et al. 2013: %10 üre 4 hafta xerosis (kuruluk) %60 iyileşme.
- Hagemann + Proksch 1996: Keratoz pilaris %20 üre + %5 laktik kombin altın standart.`,

  'sodium-pca': `**Sodium PCA (Sodyum Pirolidon Karboksilik Asit)** doğal NMF bileşenleri.

## Mekanizma
Cilt stratum korneum'un Doğal Nemlendirici Faktör'ünün (NMF) ana bileşenlerinden:
- **Higroskopik**: Su moleküllerini kuvvetli bağlar
- **Cilt mimik**: NMF zaten cilt yapısında bulunuyor — mükemmel uyumluluk
- **Bariyer destek**: Lipid katmanı ile sinerji

## Etkili Konsantrasyon
- **%0.5-2**: Yüz krem/serum standart
- **%2-5**: Yoğun nemlendirme

## NMF Yapı Taşları (referans)
NMF içeriği: amino asit (%40), laktat (%12), urea (%7), PCA (%12), tuzlar (%18), şekerler (%9).

## Avantajlar
- Tüm cilt tipleri
- Hassas + hamile güvenli
- HA + glycerin + sodium PCA = trinity nemlendirici
- Komedojen değil

## Kullanım
- Kuru, dehidre cilt günlük rutin
- Toner/esans formülasyonlarında %1-2
- Krem %2-3

## Kanıt
- Wallo et al. 2007: NMF restorasyonu klinik atopik dermatit %35 iyileşme.
- Rawlings 1994: NMF stratum korneum hidratasyonunun %50'sini sağlar.`,
};

console.log(`[1] Mapping size: ${Object.keys(DETAILS).length}`);

let updated = 0, skipped = 0;
for (const [slug, body] of Object.entries(DETAILS)) {
  try {
    const r = await c.query(
      `UPDATE ingredients SET detailed_description = $2 WHERE ingredient_slug = $1 AND (detailed_description IS NULL OR length(detailed_description) < 100)`,
      [slug, body.trim()]
    );
    if (r.rowCount && r.rowCount > 0) { updated++; }
    else skipped++;
  } catch (e) { skipped++; }
}
console.log(`[2] Updated: ${updated}, Skipped: ${skipped}`);

const final = await c.query(`SELECT COUNT(*) FILTER (WHERE detailed_description IS NOT NULL AND length(detailed_description) > 100) AS full FROM ingredients`);
console.log(`Total ingredients with detailed_description: ${final.rows[0].full}/5100`);

await c.end();
