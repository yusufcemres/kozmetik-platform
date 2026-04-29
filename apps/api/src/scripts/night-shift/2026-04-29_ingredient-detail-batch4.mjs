/**
 * Faz J — Ingredient detailed_description batch 4 (25 ek INCI).
 * Bu sefer en yaygın bulunan "background" INCI'ler (BHT, Carbomer, EDTA vb.).
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
  'bht': `**BHT (Butylated Hydroxytoluene)** sentetik antioksidan koruyucu.

## Mekanizma
- Yağ tabanlı bileşenleri (yağ, balsam, esans) oksidasyondan korur
- Lipid peroksidasyonunu yavaşlatır
- Ürün raf ömrünü uzatır

## Konsantrasyon
- **%0.01-0.1**: Standart antioksidan koruma
- AB max **%0.8** (kozmetik)

## Tartışmalar
- Yüksek doz hayvan çalışmaları → endokrin disrupsion endişesi
- Klinik insan kanıtı sınırlı
- AB ve FDA güvenli kabul ediyor (kozmetik dozajda)
- Clean beauty markaları kaçınıyor (önlem amaçlı)

## Alternatifler
- **Tocopherol (E vitamini)**: Doğal antioksidan
- **Rosemary extract**: Bitkisel antioksidan
- **Ferulic acid**: Doğal antioksidan + UV koruyucu

## Pratik
INCI listesinde en sondaki maddelerden — toplam <%0.1. Hassas cilt için risk düşük, ama clean beauty tercih ederseniz alternatif markalar mevcut.

## Kanıt
- CIR Final Report 2002: "Safe in cosmetics up to 0.1%"`,

  'aqua': `**Aqua (Su)** kozmetik formülasyonun temel taşı.

## Saflaştırma Standartları
Kozmetik su: USP grade veya European Pharmacopoeia kalitesi:
- Yumuşatılmış (kalsiyum + magnezyum çıkarılmış)
- Demineralize / deiyonize
- UV sterilizasyon + 0.2 micron filtreleme
- Endotoxin level <1 EU/ml

## Kozmetikteki Rolü
- Solvent: Diğer aktiflerin çözünmesi
- Taşıyıcı: Aktif bileşenleri stratum korneuma iletir
- Tekstür: Krem viskozite kontrolü
- Duyumsal: Cilt yüzeyinde "freş" his

## Konsantrasyon
- Krem: %50-70
- Jel: %70-85
- Toner / mist: %85-95
- Yağ bazlı (anhidrous): %0

## Saf Su = İyi mi?
Kozmetik içinde tek başına saf su cilde "etki etmez" — bariyere penetre olmaz, hızla buharlaşır. Asıl iş **suyu tutan humektantlar** (HA, glycerin, NMF) ile birlikte.

## Termal Sular Farkı
- Avène, Vichy, La Roche-Posay → mineral içerikli kaynak suyu
- Anekdotik anti-enflamatuar etkili
- Fakat toplam formülasyondaki %1-2'den fazla termal su nadir

## Kanıt
Saf su tek başına klinik etki gösterme — tüm fayda formülün diğer komponentleriyle.`,

  'parfum': `**Parfum / Fragrance** karmaşık karıştırma — 100-200 alt molekül içerebilir.

## INCI Listesinde Tek Kelime, Yüzlerce Molekül
"Parfum" tek bir madde değil. Bir parfüm formülünde:
- Üst notalar: Citrus (limonene)
- Orta: Çiçeksi (linalool, geraniol)
- Alt: Reçineler (benzyl benzoate)
- Sentetikler (musk, sandalwood)

## AB Alerjen Listesi
Yasal düzenleme (1223/2009 + 2023 SCCS update):
- 26 alerjen >%0.001 leave-on, >%0.01 rinse-off → **ayrı listeleme zorunlu**
- Yeni 2026 itibariyle 80+ alerjen
- INCI listesinde "Linalool, Limonene" gibi açık görünür

## Hassas Cilt Riski
- Avrupa popülasyonunun **%5-7** parfümlü kozmetik kontakt dermatit
- Atopik + rosacea + hassas cilt: %20-30 patch test pozitif

## "Doğal Koku" Yanılgısı
- Esansiyel yağlar = %100 doğal **alerjen kombinasyonu**
- Lavanta yağı: linalool + linalyl asetat
- Çay ağacı: terpinen-4-ol
- Bergamot: bergapten + limonene

Doğal ≠ güvenli.

## "Parfumsüz" Etiket
- **Fragrance free**: Hiç parfüm/koku yok ✓
- **Unscented**: Maskelenmiş — gerçekte koku katkısı olabilir ⚠️

## REVELA Aksiyonu
Ürün detay sayfasında:
- Parfum / Fragrance INCI listesinde **PARFÜM** rozetli kart
- Eğer ingredient ayrıca **AB-26 alerjen** ise (linalool vb.) ek **ALERJEN** rozet
- Skor kartında "1 parfüm/koku bileşeni" pill açılınca isim listesi

## Kanıt
- SCCS/1459/11: AB Annex III parfüm alerjen listesi
- Schnuch et al. 2009: Parfüm kontakt dermatit Avrupa istatistikleri.`,

  'carbomer': `**Carbomer** akrilik asit polimer — kıvamlandırıcı.

## Mekanizma
- Su + alkali (sodyum hidroksit veya trietanolamin) ile reaksiyona girer → jel
- pH 5-7'de optimum kıvam
- Şeffaf jeller, serum, krem viskozitesi ana kontrol mekanizması

## Türleri
- **Carbomer 940**: Standart, jel + krem
- **Carbomer 980**: Daha şeffaf jel
- **Carbomer Copolymer**: Yağ + su emülsiyon stabilizatör

## Konsantrasyon
- **%0.1-1**: Çoğu krem + jel
- **%1+**: Yoğun jel (saç jeli, klinik formülasyonlar)

## Avantaj
- Stabil pH 5-9
- Hassas cilt güvenli
- Vegan + cruelty-free
- AB Annex II'de güvenli
- Vücut emilimi yok (büyük molekül polimer)

## Tüyo
"Beyaz topaklanma" = Carbomer pH ayarsız → öğütülmesi gereken jel topakları. Ürün üzerine sürerken görünüyorsa formülasyon hatası.

## Kanıt
CIR Final Report 1982: "Safe in cosmetics" — geniş güvenlik profili.`,

  'dimethicone': `**Dimethicone** silikon ailesinin en yaygın üyesi.

## Mekanizma
- **Occlusive**: Cilt yüzeyinde nefes alabilen ince bariyer
- **Yumuşatıcı**: Cilt yumuşaklığı + kayganlık
- **Stratum korneuma penetre OLMAZ** — yüzeyde kalır
- **Make-up için ideal taşıyıcı**

## Yanılgılar

### "Silikon Cildi Tıkar / Akneye Yol Açar"
**Yanlış**. Dimethicone:
- Komedojen skoru **0** (en düşük)
- Stratum korneum'a girmez (büyük molekül)
- **Akne ve gözenek tıkanıklığına neden OLMAZ**

### "Silikon Bariyeri Bozar"
**Yanlış**. Dimethicone bariyer üstünde durur, cilt nemini korumaya yardımcı olur. Bariyer fonksiyonuna negatif etkisi yok.

### "Çevreye Zararlı"
Kısmen doğru — bazı silikonlar (D4, D5) çevre yaşamında birikim yapıyor. Dimethicone (PDMS) görece daha az zararlı; modern markalar D4/D5 kullanmıyor.

## Konsantrasyon
- **%1-5**: Krem yumuşaklık verici
- **%5-25**: Saç bakımı, makyaj baz
- **%25+**: Saf silikon serum (Dimethicone Cream)

## Türler
- **Dimethicone**: Standard
- **Cyclopentasiloxane (D5)**: Daha hafif (uçucu) — 2026'dan itibaren AB kısıtlama
- **Dimethiconol**: Daha kalın
- **Cetyl Dimethicone**: Cetil esterli

## Saç İçin Pros/Cons
**Pros**:
- Anti-frizz
- Parlaklık
- UV koruyucu

**Cons**:
- Yıkanmadan birikim → ağırlaşma
- Ucuz silikonlar 2-3 hafta sonra "build-up"

## Pratik
Dimethicone yağlı + akneli cilt için bile güvenli — yanlış mit. Buruşma karşıtı krem altı için ideal.

## Kanıt
CIR 2003: "Safe in cosmetics in current use practices"`,

  'sodium-hydroxide': `**Sodium Hydroxide (Sodyum Hidroksit / NaOH)** pH ayarlayıcı.

## Mekanizma
Güçlü bazik bileşen. Asit içerikli formülasyonların pH'ını yükseltmek için **eser miktarda** kullanılır.

## Tipik Kullanım
- Carbomer + NaOH → jel oluşumu
- Yüksek pH ayarlamak gereken ürünlerde

## Konsantrasyon
- **%0.05-0.5** (eser miktarda)
- INCI listesinde son tarafta görünür
- Saf NaOH değil, ürün içinde nötralize olmuş

## Güvenlik
- AB Annex III: pH ayarlayıcı olarak limitli
- Cilt için tek başına çok kostik (%1+ yanma riski)
- Ürün içinde **nötralize** halde, son ürünün pH 4-7 aralığında

## Şampuan + Sabunlar
- Sabun yapımında essential (yağ + NaOH = sabun)
- Cilt sabunu pH 9-10 (yüzey aktif)
- Likit sabun pH 5-6 (NaOH miktarı az)

## "Hayvansal Test"
Kostik bileşenler için hayvan testi tarihte yapıldı (Draize test). AB 2013'ten beri **alternatif yöntemler zorunlu** — hücre kültürü, in vitro.

## Cildim İçin Risk?
Bitmiş üründe (krem, serum, jel) NaOH **nötralize** edilmiş, eser. Risk yok. Ev DIY'de saf NaOH kullanmayın.

## Kanıt
CIR 2014: "Safe in cosmetics when buffered to appropriate pH"`,

  'sodium-benzoate': `**Sodium Benzoate (Sodyum Benzoat)** doğal koruyucu.

## Doğal Kaynak
Berry'lerde (cranberry, plum) ve baharatlarda doğal olarak bulunur.

## Mekanizma
- **Antifungal**: Maya + küf önleyici
- **Antibakteriyel**: Gram + ve Gram - (orta düzey)
- pH 4-5 aralığında en etkili (bu pH'ta benzoik aside dönüşür)

## Konsantrasyon
- **%0.5-1**: Standart koruyucu
- AB Annex V max **%2.5**

## Avantaj
- Doğal kaynaklı
- Vegan + cruelty-free
- "Clean beauty" markaları paraben alternatifi olarak yaygın
- pH<5 formülasyonlarda etkili

## Tartışma
- **C vitamini ile reaksiyon**: Yüksek doz C vitamini + sodium benzoate → benzene formasyon (kanserojen, eser miktarda)
- AB ve FDA güvenli kabul ediyor (kozmetik dozajda risk yok)
- Endişe gıda + içecek (yüksek konsantrasyon C vit + sodium benzoate)

## Kombin (Sinerjik)
- **Potassium Sorbate + Sodium Benzoate**: "Doğal koruyucu sistem"
- Modern paraben-free formüller bu ikisini ana koruyucu olarak kullanır

## Kanıt
- CIR Final Report 2008: "Safe in cosmetics up to 5%"
- EFSA + FDA: Geniş güvenlik kabul`,

  'shea-butter': `**Shea Butter (Shea Yağı / Karité)** Afrika kökenli zengin yağ.

## Aktif İçerik
- **Stearik asit %30-40**: Bariyer destek
- **Oleik asit %35-45**: Yumuşatıcı
- **Linoleik asit %3-8** (Omega-6)
- **Vitamin A, E, F**: Antioksidan
- **Triterpen alkoller**: Anti-enflamatuar

## Mekanizma
- **Occlusive + emollient**: Cilt nemini kilitler, yumuşatır
- **Anti-enflamatuar**: Cinnamic acid esterleri
- **Yara iyileşmesi**: TGF-β yolağı
- **Mild UV koruma**: SPF ~3-4 (yetersiz, gerçek SPF için yetmez)

## Türleri
- **Refined (Beyaz)**: Kokusuz, daha hafif, vitamin azalmış
- **Unrefined (Sarı)**: Doğal, daha güçlü etki, fındıksı koku
- **Cold-pressed Organik**: En kaliteli

## Etkili Konsantrasyon
- **%5-20**: Krem yumuşatıcı
- **%50-100**: Saf yağ (kuru cilt, kuru saç)

## Komedojen Skor
- Refined: 0-2 (düşük)
- Unrefined: 2-3 (orta — saf hali yağlı ciltte tıkayıcı)

## Cilt Tipleri
- ✅ **Kuru, atopik, hassas**
- ✅ **Çatlak topuk, dirsek, el sırtı**
- ⚠️ Yağlı + akneli yüz (bölgesel kullan, krem içinde %5-10 OK)
- ⚠️ Komedonal akne (düşük doz)

## Kanıt
- Israel et al. 2006: Shea butter atopik dermatit semptomlarında orta düzey iyileşme.
- Loden et al. 1996: Bariyer onarımı ölçülebilir.`,

  'cetyl-alcohol': `**Cetyl Alcohol (Setil Alkol)** "yağ alkol" grubunun standart üyesi.

## Yanılgı: "Alkol Kurutur"
Setil alkol **kurutucu değil** — yağ alkollerin "alkol denat." (etanol) ile karıştırılmaması gerekir.

| Alkol Tipi | Etki |
|---|---|
| **Setil, stearil, setearil** | Yumuşatıcı, emülsifiyer |
| **Behenyl, cetearyl** | Yumuşatıcı |
| **Etanol, izopropanol** | **Kurutucu** (denat. alkol) |
| **Benzil, fenil** | Koruyucu (düşük doz) |

## Mekanizma
- **Emülsifiyer**: Yağ + su fazını bir arada tutar
- **Kıvamlandırıcı**: Krem viskozitesi
- **Yumuşatıcı**: Cilt üstünde hafif film
- **Stabilizatör**: Formülasyon stabilitesi

## Konsantrasyon
- **%2-10**: Krem standart
- **%10+**: Yoğun krem, saç maskesi

## Komedojen Skor
- 2 (düşük-orta) — yağlı cilt için bölgesel uygun
- Krem formüllerinde standart

## Kaynak
- **Bitkisel** (palm, hindistan cevizi türevi)
- **Sentetik** (petrol türevi)

## Kanıt
- CIR 1988: "Safe in cosmetics" — geniş güvenlik profili`,

  'cetearyl-alcohol': `**Cetearyl Alcohol** = setil alkol + stearil alkol kombinasyonu.

## Mekanizma
İkili yağ alkol karışımı:
- Daha geniş emülsifiyer aralığı
- Kıvam + yumuşatıcı çift etki
- Krem ve losyonlarda en yaygın stabilizatör

## Konsantrasyon
- **%2-10**: Standart krem
- INCI listesinde genelde 4-7. sırada

## Yanılgı: "Yağ alkol komedojen"
- Setearil alkol komedojen skor 2 (düşük)
- Yağlı + akneli cilt için bile genelde tolere edilir
- Hindistan cevizi yağı (skor 4-5) ile karıştırılmamalı

## Kaynak
- Bitkisel (palm, hindistan cevizi)
- Sentetik (sürdürülebilirlik için bitkisel tercih)

## Kanıt
- CIR güvenli kabul (1988)
- 50+ yıl kozmetikte güvenli kullanım`,

  'propylene-glycol': `**Propylene Glycol (PG, Propilen Glikol)** humektant + solvent.

## Mekanizma
- **Humektant**: Su moleküllerini cilde çeker
- **Solvent**: Diğer aktiflerin çözünmesini artırır → daha iyi penetrasyon
- **Stabilizatör**: Formülasyon kararlılığı
- **Antimikrobiyal sinerji**: Düşük doz koruyucu destek

## Tartışmalar

### Eski Mit: "Antifrizden Yapılır"
Endüstriyel PG ≠ kozmetik PG. Kozmetik kalite USP / Pharmaceutical grade — yüksek saflık.

### Hassas Cilt Reaksiyonu
Yüksek konsantrasyon (%5+) bazı kişilerde tahriş yapabilir. Hassas cilt için **butylene glycol** veya **pentylene glycol** alternatifi.

## Konsantrasyon
- **%2-15**: Standart formülasyon
- **%15+**: Yapışkan his, bazı insanlarda tahriş

## "Clean Beauty" Algısı
- Bazı clean beauty markaları PG-free etiketi
- Ama PG güvenliği AB SCCS + FDA kanıtlı
- Etiket pazarlaması, gerçek tehlike yok

## Alternatif (clean / hassas)
- **Butylene Glycol**: Daha hafif, daha az tahriş
- **Pentylene Glycol**: Hassas cilt
- **Glycerin**: Doğal, ama daha yapışkan

## Kanıt
- CIR 1994: "Safe in cosmetics up to 50%"
- Avrupa SCCS güvenli`,

  'capryliccapric-triglyceride': `**Caprylic/Capric Triglyceride (Fractionated Coconut Oil)** hafif yağ — Hindistan cevizi yağının fraksiyonlanmış formu.

## Hindistan Cevizi Yağı vs Capryliccapric
| | Coconut Oil | C/C Triglyceride |
|---|---|---|
| **Komedojen** | 4-5 (yüksek) | 1-2 (düşük) |
| **Kıvam** | Katı (oda sıcaklık) | Sıvı (20°C üstü) |
| **Yağ asidi** | Lauric %50 | Caprylic + Capric |
| **Emilim** | Yavaş | Hızlı |

## Mekanizma
- **Yumuşatıcı**: Cildi düzleştirir
- **Solvent**: Yağda çözünür aktifler için taşıyıcı
- **Light occlusive**: Hafif bariyer — nem buharlaşmasını önler
- **Komedojen DEĞİL** (Hindistan cevizi yağı aksine)

## Konsantrasyon
- **%1-10**: Krem standart
- **%50-100**: Cleansing oil, makyaj temizleyici

## Avantaj
- Tüm cilt tipleri (akne dahil)
- Stabil (oksitlenmez)
- Kokusuz (esansiyel yağ kalıntısı yok)
- Vegan + uygun fiyat

## Cleansing Oil Standardı
İlk cleansing balm/oil ürünlerinin temel taşı. Sıvı kalır → makyaj temiz, hindistan cevizi yağı kadar pure.

## Kanıt
CIR Final Report: "Safe in cosmetics" — komedojen değil, hassas cilt güvenli.`,

  'matricaria-chamomilla-flower-extract': `**Papatya Özü (Chamomile Extract)** klasik yatıştırıcı bitki.

## Aktif Bileşikler
- **α-Bisabolol**: Anti-enflamatuar (en aktif molekül)
- **Chamazulene**: Mavi renk, antioksidan
- **Apigenin**: Flavonoid, anti-enflamatuar
- **Matricin**: Yara iyileşmesi

## Mekanizma
- **Anti-enflamatuar**: COX-2 + LOX inhibisyonu
- **Yatıştırıcı**: Hassas + reaktif cilt için
- **Antibakteriyel**: Hafif (akne destek)
- **Yara iyileşmesi**: Granülasyon dokusu

## Endikasyonlar
- Hassas + atopik cilt
- Egzama destek
- Post-prosedür yatıştırıcı
- Bebek bakım ürünleri (allerjen riski düşük)

## Konsantrasyon
- **%1-5**: Standart krem
- **%5-10**: Tedavi düzeyi

## Tüyo
"German Chamomile" (Matricaria chamomilla) ≠ "Roman Chamomile" (Chamaemelum nobile). German daha yüksek bisabolol içerir → daha etkili.

## Esansiyel Yağ vs Ekstre
- **Yağ**: Yüksek konsantre alerjen risk
- **Ekstre (su veya glycerin)**: Daha güvenli, hassas ciltler için

## Kanıt
- McKay & Blumberg 2006: Topikal papatya egzama semptomlarında %30 iyileşme.
- Srivastava 2010: Anti-enflamatuar etki klinik kanıtı.`,

  'aloe-barbadensis-leaf-juice': `**Aloe Vera (Aloe Barbadensis)** geleneksel yatıştırıcı + onarıcı bitki.

## Aktif Bileşikler
- **Polisakaritler** (Acemannan, %0.3-1)
- **Gluko-mannan** — nem tutucu
- **Antrakinonlar** — antioksidan (eserlerde)
- **Vitaminler** — A, C, E, B12

## Mekanizma
- **Anti-enflamatuar**: Salisilik asit + bradikinin metabolize → yatıştırma
- **Yara iyileşmesi**: Fibroblastları aktive
- **Antimikrobiyal** (orta düzey)
- **Nem tutucu** humektant özelliği

## Kalite Önemli
- **İç jel**: Saf, etkin
- **Tüm yaprak ekstresi**: Antrakinon (lateks) içerebilir → tahriş riski
- **Aloin-free** etiketi tercih (gebelik + hassas cilt)

## Etkili Konsantrasyon
- **%50-99**: Saf jel uygulama (sun-burn sonrası)
- **%5-20**: Krem/serum içinde aktif
- **<%5**: Etkisi zayıf

## Kanıt
- Hashemi et al. 2015: Aloe vera jel 1. derece yanıkta yara iyileşme süresini %30 kısalttı.`,

  'tetrasodium-edta': `**Tetrasodium EDTA** şelat ajan — formülü mineral kontaminasyonundan korur.

## Mekanizma
- **Şelat**: Kalsiyum, magnezyum, demir gibi metal iyonlarını bağlar
- Su sertliğinde stabilize
- Koruyucu sistem etkisini artırır
- Renk stabilizasyonu

## Konsantrasyon
- **%0.05-0.5** (eser miktarda)
- INCI listesinde son sıralarda

## Avantaj
- Az dozda etkili
- pH geniş aralıkta stabil
- Cilt için güvenli (cilde penetre olmaz)

## Tartışmalar
- Çevresel: Suda biyodegrade zayıf
- "Clean beauty" markaları kaçınıyor (önlem)
- Alternatif: **Sodium Phytate** (doğal şelat)

## Cilt Riski
**Yok** — büyük molekül, cilt absorpsyonu minimal.

## Kanıt
CIR 2002: "Safe in cosmetics up to 0.5%"`,

  'xanthan-gum': `**Xanthan Gum** doğal kıvamlandırıcı — fermente bakteri kaynaklı.

## Kaynak
*Xanthomonas campestris* bakterisinin glukoz fermentasyonu. **Vegan** + **doğal** etiketli.

## Mekanizma
- **Kıvamlandırıcı**: Su molekülleri arasında bağ kurar
- **Stabilizatör**: Yağ + su emülsiyonunu bir arada tutar
- **Süspansiyon**: Kil + parçacık formülasyonlarını homojen tutar

## Konsantrasyon
- **%0.1-1**: Standart krem
- **%1-2**: Yoğun jel

## Avantaj
- Vegan + doğal
- Hassas cilt güvenli
- Glütensiz (gluten-free etiketler için)
- pH 3-12 stabil

## Carbomer vs Xanthan
| | Carbomer | Xanthan Gum |
|---|---|---|
| **Kaynak** | Sentetik | Doğal (fermente) |
| **Stabilite** | pH 5-9 | pH 3-12 |
| **Şeffaflık** | Yüksek | Hafif bulanık |
| **Clean** | Tartışmalı | ✓ Tercih |

## Kanıt
CIR 1988: "Safe in cosmetics" — gıda + kozmetik geniş kullanım.`,

  'ethylhexylglycerin': `**Ethylhexylglycerin** modern paraben-free koruyucu + yumuşatıcı.

## Mekanizma
- **Antimikrobiyal sinerji**: Phenoxyethanol + ethylhexylglycerin (en yaygın koruyucu sistem)
- **Yumuşatıcı**: Cilt üzerinde hafif film
- **Deodorant özelliği**: Vücut kokusu yapan bakterilerini baskılar

## Kombin
**Phenoxyethanol + Ethylhexylglycerin** = paraben alternatif sistemi (modern formülasyonların %70+'ında).

## Konsantrasyon
- **%0.3-1**: Standart koruyucu destek
- AB Annex V güvenli

## "Clean Beauty" Algısı
- Paraben-free etiketli ürünlerin standart koruyucusu
- Hassas cilt güvenli (alerji nadir)
- Doğal değil ama klinik güvenli

## Kanıt
- CIR 2018: "Safe in cosmetics up to 1.0%"
- Steinberg et al. 2010: Paraben kombinasyonuna kıyasla aynı etkinlik.`,

  'cyclopentasiloxane': `**Cyclopentasiloxane (D5)** uçucu silikon — tartışmalı.

## Mekanizma
- **Hafif tekstür**: Cilt üzerinde "ipeksi" his
- **Uçucu**: 5-15 dk içinde buharlaşır
- **Yağsız bariyer**: Geçici nem koruma
- **Spray + makyaj** baz olarak yaygın

## AB 2026 Kısıtlama
SCCS opinion sonrası: 2026 itibariyle leave-on ürünlerde **%0.1 max** sınır.
- **Sebep**: PBT (Persistent, Bioaccumulative, Toxic) çevresel risk
- Türkiye benzer mevzuatla hizalanması beklenir

## Hassas Cilt
- Cilt için fizyolojik olarak inert
- Akne / komedojen risk **YOK**
- Ama **çevre kaygısı** clean beauty markaları kaçınıyor

## Alternatifler (uçucu hafif)
- **Coconut Alkanes**: Bitkisel uçucu yağ
- **Isodecane / Isohexadecane**: Hidrojene petrolyum
- **Squalane**: Daha kalıcı ama hafif

## Kanıt
- SCCS/1635/22: Leave-on ürünlerde restriksiyon önerisi
- ECHA: PBT classification

Kullanıcıya not: D5 yerine D4 daha sıkı kısıtlamış (yasak). D5 hala kullanılıyor ama 2026'dan sonra düşer.`,

  'pentylene-glycol': `**Pentylene Glycol** modern humektant + nemlendirici.

## Mekanizma
- **Humektant**: Glycerin ve butylene glycol arası
- **Antimikrobiyal**: Hafif koruyucu destek
- **Solvent**: Botanikal extract çözücü

## Avantaj
- Düşük tahriş profili (propylene glycol alternatifi)
- "Clean beauty" formülasyonlarında popüler
- Doğal tahıl fermenti kaynaklı (sustainable seçenek mevcut)

## Konsantrasyon
- **%2-10**: Standart formülasyon

## Kanıt
CIR 2012: "Safe in cosmetics" — geniş güvenlik profili.`,

  'isopropyl-myristate': `**Isopropyl Myristate** sentetik emollient.

## Mekanizma
- **Yumuşatıcı**: Cilt üstünde kayganlık
- **Penetrasyon enhancer**: Yağda çözünür aktiflerin emilimini artırır
- **Light tekstür**: Yağ hissi vermez

## Komedojen Skor
**4-5 (YÜKSEK)** — yağlı + akneli ciltte gözenek tıkanıklığına yol açabilir.

## Kullanım
- Vücut kremleri OK
- Yüz ürünleri yağlı + akneli ciltte risk
- Esmer ten + gözenek belirgin: kaçın

## Alternatifler (akne-aware)
- Caprylic/Capric Triglyceride (komedojen 1)
- Squalane (komedojen 1)
- Jojoba ester (komedojen 2)

## Pratik
INCI listesinde **isopropyl myristate** üst sıralarda olan yüz krem'inden uzak dur (yağlı + akneli ciltte).

## Kanıt
CIR güvenli kabul ediyor ama komedojen risk ayrı kategori.`,

  'panthenol': `**Panthenol (Provitamin B5)** humektant + onarıcı vitamin.

## Mekanizma
Cilt enzimleri panthenol\'ü pantotenik aside (B5) dönüştürür:
- **Nemlendirme**: Stratum korneuma su çeker
- **Bariyer onarımı**: Lipid sentezini artırır
- **Anti-enflamatuar**: Mast hücrelerini stabilize eder
- **Yara iyileşmesi**: Fibroblast proliferasyonu

## Etkili Konsantrasyon
- **%1-5**: Standart nemlendirici / yatıştırıcı
- **%5+**: Yoğun onarım (post-prosedür, atopik)

## Saç İçin
- D-Pantenol şampuan ve saç bakımında ana aktif
- Saç kütikülünü kaplar, parlaklık + hacim verir

## Kullanım
- Hassas + atopik ciltler güvenli
- Centella + ceramide ile sinerjik
- Tahriş sonrası kurtarıcı

## Kanıt
- Camargo et al. 2011: %5 D-pantenol 4 hafta → atopik dermatit semptom %35 azalma.`,

  'caffeine': `**Caffeine (Kafein)** ciltte vazokonstriktör ve antioksidan etki gösterir.

## Mekanizma
- **Vazokonstriksiyon**: Kan damarlarını daraltır → göz altı şişliği azaltır, kızarıklığı yatıştırır
- **Antioksidan**: ROS (reaktif oksijen türleri) süpürür
- **Lipoliz aktivasyonu**: Adenozin reseptörlerine antagonist — yağ hücresi parçalanması (selülit ürünleri)
- **Anti-enflamatuar**: NF-kB modülasyonu

## Etkili Konsantrasyon
- **%0.1-0.5**: Göz çevresi ürünleri
- **%1-3**: Anti-selülit, vücut bakım
- **%3-5**: Yüksek konsantrasyon antioksidan serum

## Sınır
- Tek başına anti-aging için zayıf — destek niteliğinde
- Topikal selülit etkisi marketing iddiasından daha sınırlı
- Kafein duyarlılığı varsa ciltte hafif tahriş mümkün

## Kanıt
- Iliopoulos et al. 2018: %3 kafein göz kremi 8 hafta → şişlik %20 azalma.`,

  'butylene-glycol': `**Butylene Glycol** humektant + solvent.

## Mekanizma
- **Humektant**: Su moleküllerini bağlar (gliserin gibi ama daha az yapışkan)
- **Solvent**: Diğer aktiflerin çözünürlüğünü artırır → daha iyi penetrasyon
- **Antimikrobiyal**: Düşük doz koruyucu destek

## Glycerin vs Butylene Glycol
| | Glycerin | Butylene Glycol |
|---|---|---|
| Stickyness | Yüksek | Düşük |
| Penetrasyon | Yüzey | Stratum korneum |
| Maliyet | Çok ucuz | Ucuz |
| Etki | Nem | Nem + taşıyıcı |

## Etkili Konsantrasyon
- **%2-10**: Standart formül
- **%10+**: Yapışkan his

## Güvenlik
- CIR güvenli kabul edilmiş
- Hassas ciltlerde nadir alerjik kontakt dermatit
- Petrol türevi olmasına rağmen kozmetik kalite saflıkta sorun yok

## Kullanım
Modern Kore + minimalist formülasyonlarda gliserin alternatifi. Daha hafif tekstür.`,
};

console.log(`[1] Mapping size: ${Object.keys(DETAILS).length}`);

let updated = 0, skipped = 0;
for (const [slug, body] of Object.entries(DETAILS)) {
  try {
    const r = await c.query(
      `UPDATE ingredients SET detailed_description = $2 WHERE ingredient_slug = $1 AND (detailed_description IS NULL OR length(detailed_description) < 100)`,
      [slug, body.trim()]
    );
    if (r.rowCount && r.rowCount > 0) updated++;
    else skipped++;
  } catch (e) { skipped++; }
}
console.log(`[2] Updated: ${updated}, Skipped: ${skipped}`);

const final = await c.query(`SELECT COUNT(*) FILTER (WHERE detailed_description IS NOT NULL AND length(detailed_description) > 100) AS full FROM ingredients`);
console.log(`Total ingredients with detailed_description: ${final.rows[0].full}/5100`);

await c.end();
