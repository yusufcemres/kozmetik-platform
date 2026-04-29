/**
 * Faz H — Articles batch 3 (10 yeni makale, 55 → 65).
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const ARTICLES = [
  {
    title: 'Hyaluronik Asit: Multi-Weight Formülasyonun Önemi',
    slug: '2026-04-29-hyaluronic-acid-multi-weight',
    content_type: 'ingredient_explainer',
    summary: 'HA tek tip değil — 2 MDa\'dan 10 kDa\'ya farklı moleküller. Ama "düşük molekül" bazen anti-enflamatuar olmadan tahriş yapabilir.',
    body_markdown: `## HA Tek Bir Şey Değil

Hyaluronik asit (HA), molekül ağırlığına göre farklı davranır. Tek konsantrasyon değil, **molekül boyutu spektrumu** önemli.

## Molekül Ağırlığı Tablosu

| Tip | Molekül Ağırlığı | Penetrasyon | Etki |
|---|---|---|---|
| **Yüksek (HMW)** | >1 MDa | Yüzey | Film, anlık plump |
| **Orta** | 100-300 kDa | Stratum korneum | Bariyer destek |
| **Düşük (LMW)** | <50 kDa | Derin epidermis | Hücresel sinyalleme |
| **Ultra-low** | <10 kDa | Dermis (bazı) | Anti-aging gen ifadesi |

## Ultra-Low MW Kontroversi

<10 kDa HA bazı çalışmalarda enflamatuar sinyalleme yapabilir (TLR2 aktivasyonu). Marka claim "deeper penetration" olarak satılır ama bilimsel olarak nüanslı.

**Pratik öneri**: Multi-weight formülasyon (3-5 farklı boyut) > saf ultra-low

## En İyi Multi-Weight Markalar

- **The Ordinary Hyaluronic Acid 2% + B5** (Sodium Hyaluronate Crosspolymer + 3 farklı MW)
- **L'Oréal Revitalift 1.5% Pure HA** (3 MW — 2 MDa, 200 kDa, 50 kDa)
- **Vichy Mineral 89** (HA + termal su)
- **Cosrx HA Intensive Cream** (5 MW)

## Kullanım Tüyoları

### Düşük Nem Ortamı (klima, kalorifer, soğuk hava)
HA havadan değil cildin içinden nem çekebilir → ters etki. Üzerine occlusive (squalene, shea, dimethicone) kilitle.

### Nemli Ortam (Türkiye yaz)
HA serum + jel nemlendirici yeterli, occlusive opsiyonel.

## Topikal vs Oral HA

### Topikal
Hızlı sonuç (saatler içinde plump), yüzeysel etki.

### Oral
- Hidrolize HA 120-240 mg/gün, 8-12 hafta
- Cilt elastikiyet + nem klinik kanıt orta
- Eklem desteği bazı çalışmalarda

## Kanıt
- Pavicic et al. 2011 (J Drugs Dermatol): Multi-weight HA 60 gün, kırışık derinliği -40%.
- Bukhari et al. 2018 (Int J Biol Macromol): LMW HA derma penetrasyonu in vivo.

## Kaynaklar
- [INCI Decoder Sodium Hyaluronate](https://incidecoder.com/ingredients/sodium-hyaluronate)`,
  },
  {
    title: 'Kuru Kış Cildi: 7 Adımlık Acil Onarım Protokolü',
    slug: '2026-04-29-kuru-kis-cildi-protokol',
    content_type: 'guide',
    summary: 'Kalorifer + soğuk hava bariyeri parçalar. 4 hafta içinde cildini eski haline getiren protokol.',
    body_markdown: `## Kış Cildinin Sorunları

- Düşük dış nem (~%30) + kalorifer (%20) → cilt nemini buharlaştırır
- Sıcak duş → lipid bariyeri çözer
- UVB azalır ama UVA hala aktif (pencere geçer)
- Hareketsizlik → mikrosirkülasyon azalır

Sonuç: pul pul, çatlamış, hassas, reaktif cilt — özellikle yanak + dudak çevresi + el sırtı.

## 4 Haftalık Onarım Protokolü

### Hafta 1-2: Bariyer Resetleme

**SABAH:**
1. **Sadece ılık su** ile yüz yıka (temizleyici **YOK** ilk hafta)
2. **HA serum** (Multi-weight, %0.5-2)
3. **Ceramide krem** zengin (CeraVe Moisturizing Cream, La Roche-Posay Toleriane)
4. **Mineral SPF 50+** (zinc oxide tercih)

**AKŞAM:**
1. **Krem cleansing** veya **balm cleansing** (yağ bazlı, sülfat-free)
2. **Niasinamid %5** (sebum dengesi)
3. **Ceramide + peptit krem** zengin
4. **(Opsiyonel)** rosehip yağı 3-5 damla

**KAPALI**: Tüm aktifler (retinol, AHA, BHA, C vitamini)

### Hafta 3: Aktif Reintegrasyonu

- Niasinamid %10 (gece eklenebilir)
- C vitamini sabah (low concentration %5-8)
- Hala AHA/BHA/retinol kapalı

### Hafta 4: Tam Rutin

- Retinol gece dönüşümlü (haftada 2-3 gece)
- BHA spot tedavi
- Sandwich tekniği zorunlu (nemlendirici-aktif-nemlendirici)

## Yardımcı Trükler

### Humidifier
Yatak odasında %50 nem hedefi. Ucuz ultrasonic humidifier (~500 TL).

### Sıcak Duş Yerine Ilık
Bariyer için 38°C max, 5-10 dk. Cilt kırmızıysa zaten çok sıcak.

### Slugging
**Vaseline (saf petrolatum)** veya **Aquaphor** son kat — uyku boyunca nem kilitler. Yağlı ciltte kullanma; kuru/atopik için altın standart.

## "Bana Uygun" Aktif Listesi (Kış)

| Aktif | Konsantrasyon | Sıklık |
|---|---|---|
| **Hyaluronik Asit** | %2 | Her gece + sabah |
| **Niacinamide** | %5 | Her gece |
| **Ceramide** | %1-3 | Her uygulama |
| **Peptit (Matrixyl)** | %5 | Her gece |
| **Bakuchiol** | %0.5 | Hassas alternatif retinol |
| **Centella** | %5+ | Yatıştırıcı |

## Kaçın

- **AHA/BHA**: Bariyer hasarı tetikler
- **Retinol** (ilk 2 hafta): Tahriş
- **Parfüm**: Hassas reaktif
- **Alkol denat.**: Kuruluk
- **SLS**: Sülfat bariyer çözer

## Kanıt
- Engelhart-Pinto et al. 2018: Kış bariyer hasarı tipik %30 cilt nemi düşüşü.
- Spada et al. 2018: Ceramide kremi 4 hafta TEWL %30 azalma.

## Kaynaklar
- [DermNet — Winter Skin Care](https://dermnetnz.org/)`,
  },
  {
    title: 'Akne Skarları: PIH, PIE, Atrofik — Hangisi Sende?',
    slug: '2026-04-29-akne-skar-tipleri',
    content_type: 'need_guide',
    summary: 'Akne sonrası kalan iz tek tip değil. Doğru tanı doğru tedavi getirir — hidrokinon her ize uygun değil.',
    body_markdown: `## Akne ≠ Akne Sonrası

Akne aktif iltihap. Akne sonrası kalan iz **3 farklı tip**:

## 1. PIH (Post-Inflamatuar Hiperpigmentasyon)
**Belirti**: Koyu kahverengi/siyah leke
**Sebep**: Aknenin enflamasyonu melanositi tetikler
**Cilt**: Esmer + Akdeniz tipi cilt %70+ vakada
**Süre**: 3-12 ay (kendiliğinden açılır ama yavaş)

### Tedavi
- **Niasinamide %10**: Melanozom transferini bloke eder
- **C vitamini %10-20**: Tirozinaz inhibisyonu
- **Alpha arbutin %2**: Hidrokinon türevi
- **Traneksamik asit %3-5**: Vasküler + melanin
- **SPF 50+ ZORUNLU**: Yoksa lekeler kalıcılaşır
- **Süre**: 3-6 ay tutarlı

## 2. PIE (Post-Inflamatuar Eritem)
**Belirti**: Pembe/kırmızı leke (damarsı)
**Sebep**: Aknenin enflamasyonu kılcal damar genişlemesi
**Cilt**: Açık ten + yüzeysel kılcal damarlar
**Süre**: 3-6 ay

### Tedavi
- **Centella asiatica %5+**: Anti-enflamatuar
- **Niasinamide %5-10**: Vasküler + leke
- **Azelaik asit %10**: Anti-enflamatuar + aydınlatma
- **Lazer (V-beam, BBL)**: Kalıcı çözüm
- **C vitamini orta düzeyde etkili**

## 3. Atrofik Skar (Çukur)
**Belirti**: Cildin yüzeyinde **fiziksel** çöküntü
**Sebep**: Akne kollajen yıkımı, dokusal hasar
**Tip**:
- **Ice pick**: Derin ince çukurlar
- **Boxcar**: Kenarları keskin geniş çukurlar
- **Rolling**: Yumuşak dalgalı çukurlar

### Tedavi (Topikal Limited)
- **Retinol/tretinoin**: Kollajen sentez (2-12 ay)
- **Peptit (Matrixyl)**: Destek
- **C vitamini**: Kollajen sentezi

### Profesyonel Tedavi (Etkili)
- **Microneedling (Dermapen)**: Kontrollü mikro yara → kollajen
- **PRP** (kendi kanından plasma)
- **Subcision**: İğne ile çukur tabanını kesme
- **Lazer** (Fraxel, CO2): En etkili, geri çekilme süresi uzun
- **Filler**: Hyaluronik asit dolgu (geçici çözüm)

## Karışım Vakalar

Çoğu kişide **PIH + PIE + atrofik** beraber. Tedavi sıralaması:

1. **PIH/PIE topikal** ile başla (3-6 ay)
2. Aktif aknenin tamamen geçtiğinden emin ol
3. **Atrofik için profesyonel** (microneedling/lazer)

## Yanlış Yaklaşımlar

- **Tüm izlere hidrokinon**: PIE ve atrofik için işe yaramaz
- **Sadece SPF**: Yetersiz, ama olmadan başarısızlık garanti
- **Asıl"natural lemon"**: Cilt yanığı + PIH artırır
- **Erken peeling**: Akne aktifken yapma — yeni leke tetikler

## REVELA Profil Mapping

\`/cilt-analizi\` quizine "Akne sonrası iz" işaretlersen:
- PIH için sodyum askorbil fosfat + arbutin önerilir
- PIE için centella + niasinamid
- Atrofik için "dermatologa danış" notu

## Kanıt
- Bagatin et al. 2014: Microneedling atrofik skar %50+ iyileşme 3 seans.
- Rivera 2008: Topikal retinoid PIH için hidrokinon eşdeğeri.

## Kaynaklar
- [DermNet NZ — Acne Scars](https://dermnetnz.org/topics/acne-scarring)`,
  },
  {
    title: 'Magnezyum Eksikliği: Stres, Uyku ve Cildin Bağlantısı',
    slug: '2026-04-29-magnezyum-eksikligi',
    content_type: 'ingredient_explainer',
    summary: 'Magnezyum 300+ enzim için eş-faktör. Toprak yoksulluğu nedeniyle popülasyonun %50+\'ı eksik. Cildine de etkisi var.',
    body_markdown: `## Magnezyum Eksikliği — Sessiz Salgın

Modern tarım toprak magnezyumunu tüketti. Klinik çalışmalar Türkiye dahil çoğu ülkede %50+ yetersiz seviye gösteriyor. Belirtiler:

## Eksiklik Belirtileri

### Sinir Sistemi
- Anksiyete, sinirlilik
- Uykusuzluk, yorgunluk
- Migren, baş ağrısı
- Kaşıntı, restless legs syndrome

### Kas
- Kramplar (özellikle gece)
- Spasmlar
- Egzersiz sonrası uzun toparlanma
- Tikler

### Cilt (İlginç Bağlantı)
- Atopik dermatit aktivasyonu
- Yara iyileşmesi yavaş
- Hassas + reaktif cilt
- Bariyer fonksiyon zayıflığı

### Kalp
- Çarpıntı
- Yüksek tansiyon
- Aritmi

## Magnezyum Formları

| Form | Emilim | En İyi Kullanım |
|---|---|---|
| **Magnezyum Bisglisinat** | %85 | Uyku + anksiyete |
| **Magnezyum Threonat** | %75 (beyne geçer) | Bilişsel, hafıza |
| **Magnezyum Sitrat** | %80 | Sindirim + genel |
| **Magnezyum Malat** | %75 | Yorgunluk + kas |
| **Magnezyum Taurat** | %70 | Kalp |
| **Magnezyum L-Threonate** | %75 | Beyin |
| **Magnezyum Oksit** | %30 (ucuz, mide) | Kabızlık (yan etki ile) |
| **Magnezyum Sülfat** | Topikal (Epsom Salt) | Banyo, kas ağrısı |

## Doğru Form Seçimi

### Uyku + stres
**Magnezyum Bisglisinat** 200-400 mg akşam yatmadan 1 saat önce

### Egzersiz + kas
**Magnezyum Malat** 400 mg/gün (bölünmüş)

### Bilişsel
**Magnezyum Threonat** 1.5-2 g/gün

## Etkili Doz

- **RDA**: 400 mg/gün erkek, 310 mg/gün kadın
- **Optimum**: Çoğu uzman 400-600 mg/gün önerir
- **Üst limit**: 350 mg/gün takviye (yemekten gelen üst yok)

## Test Etmeli mi?

- Serum magnezyum %1 hücre içi yansıtmaz (kandaki)
- **RBC magnezyum** (eritrosit) daha doğru gösterge
- Belirti varsa ve test normal ise: **subklinik eksiklik** mümkün — takviyeyi dene

## Kullanım Tüyoları

- **Akşam tercih**: Sakinleştirici, uyku destekler
- **Aç karna**: Bisglisinat sorunsuz
- **Kalsiyum + magnezyum oranı 2:1** ideal
- **Magnezyum + B6 (P5P)** sinerjik
- **Magnezyum + D vitamini**: D vit metabolizması için magnezyum gerekli

## Cilt İçin Topikal

**Magnezyum yağı (Magnesium Chloride)** topikal:
- Atopik dermatitte yatıştırıcı
- Kas ağrısı bölgesel
- Cilt minor reaksiyon (yanma) — küçük doz başla

**Epsom Salt banyosu**:
- 1-2 fincan 20 dk
- Stres + kas ağrısı destek
- Anekdotik kanıt güçlü, klinik orta

## Kaynaklar
- [De Baaij et al. 2015 — Physiol Rev](https://pubmed.ncbi.nlm.nih.gov/25540137/)
- [Boyle et al. 2017 — Nutrients](https://www.mdpi.com/2072-6643/9/5/429)`,
  },
  {
    title: 'INCI Listesinde Top 5 Kırmızı Bayrak: Hassas Cilt İçin Kaçın',
    slug: '2026-04-29-inci-kirmizi-bayrak',
    content_type: 'label_reading',
    summary: 'Hassas cildiniz varsa etiketinde gördüğünüzde "geç" diyeceğiniz 5 bileşen. Bunlar zorunlu kötü değil ama hassas cilt için yüksek risk.',
    body_markdown: `## Hassas Cilt Trigerlanları

"Hassas cilt" demek **bariyer fonksiyon zayıflığı + sinir uçlarının reaktivitesi**. Bu kişilerde bazı bileşenler:
- Kontakt dermatit yapabilir
- Bariyer hasarı tetikler
- Yanma + kızarıklık + reaktivite

## #1: Parfüm / Fragrance

**Neden risk**: 26 (yeni 80+) AB alerjen listesinde olan moleküller. Linalool, limonene, citronellol gibi.

**Kontakt dermatit oranı**: Hassas + atopik popülasyonda %20-30 pozitif patch test.

**"Doğal koku" ≠ güvenli**: Esansiyel yağlar (lavanta, çay ağacı, narenciye) bu listenin çoğunu içerir.

**REVELA aksiyonu**: Etikette **PARFÜM** rozetli kart kırmızı border ile işaretlenir.

## #2: Alkol Denat. (Denatured Alcohol)

**INCI**: Alcohol Denat., SD Alcohol, Ethyl Alcohol

**Neden risk**:
- Cilt lipid bariyerini çözer
- TEWL (transepidermal su kaybı) artırır
- Kuru + hassas ciltlerde reaktif

**İstisna**:
- Setil alkol, stearil alkol = yağ alkol = OK
- Benzil alkol = koruyucu (düşük doz OK)

**Kabul edilebilir kullanım**: Toner ve serumlarda %5+ → kaçın. Trace amount (son INCI) genelde sorun yok.

## #3: Sülfatlar (SLS / SLES)

**INCI**: Sodium Lauryl Sulfate, Sodium Laureth Sulfate

**Neden risk**:
- Çok güçlü deterjan
- Lipid bariyerini parçalar
- Hassas ciltte yanma + kuruluk

**SLS vs SLES**:
- SLS daha agresif (saf)
- SLES (etoksilatlanmış) biraz hafif ama 1,4-dioxan kontaminasyon riski

**Alternatif**: Cocamidopropyl Betaine, Sodium Cocoyl Isethionate, Decyl Glucoside.

## #4: Esansiyel Yağlar (Bazıları)

**Yüksek riskli esansiyel yağlar**:
- Lavanta (Lavandula angustifolia oil) — linalool yüksek
- Çay ağacı (Melaleuca alternifolia oil) — terpinen-4-ol oksidasyon
- Bergamot (Citrus bergamia oil) — bergapten fototoksik
- Limon, portakal kabuk yağları — limonene oksidasyon

**Düşük riskli**:
- Squalane (yağ değil saf)
- Glycerin (alkol grup ama humektant)

**Klinik gerçek**: Esansiyel yağlar sıkça **alerjen** kategorisinde sorun. "100% doğal" pazarlamasına aldanma.

## #5: Methylisothiazolinone (MIT)

**INCI**: Methylisothiazolinone, MI, Methylchloroisothiazolinone (MCI)

**Neden risk**:
- AB Annex V'te kısıtlı (rinse-off only)
- Yıllar 2010-2014 boyunca leave-on ürünlerde alerjen patlaması yarattı
- Hassas cilt %5-10 patch test pozitif

**Mevcut kullanım**: Şampuan, jel temizleyici (rinse-off OK düşük doz).

**Etikette gör → kaçın** eğer leave-on ürün (krem, serum).

## Kaçınma Stratejisi

### Hassas Cilt Etiket Filtresi
1. Parfüm-free / Parfümsüz / Fragrance-free
2. Sülfat-free
3. Alkol denat. yok
4. Esansiyel yağ yok / minimal
5. Paraben + MIT yok

### Onaylı Hassas Markalar
- **Avène Tolérance Extreme**
- **Bioderma Sensibio**
- **La Roche-Posay Toleriane**
- **Eucerin Sensitive Skin**
- **CeraVe Hydrating** (sülfat-free, parfümsüz)
- **Vichy Mineral 89** (parfümsüz)

## REVELA Filter

Ürün listemizde bu filtre seçilebilir:
- ✅ Parfümsüz
- ✅ Sülfat-free
- ✅ Alkol-free
- ✅ Esansiyel yağ-free

## Kaynaklar
- [SCCS Opinion on Fragrance Allergens](https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety_en)
- [European Society of Contact Dermatitis Guidelines](https://www.escd.org/)`,
  },
  {
    title: 'Yağlı Cilt Yanılgıları: 5 Yaygın Hata',
    slug: '2026-04-29-yagli-cilt-yanılgıları',
    content_type: 'guide',
    summary: 'Yağlı cilt için yapılan yaygın hatalar — ve bilim destekli doğru yaklaşımlar.',
    body_markdown: `## Yağlı Cilt Bilimi

Sebum üretimi:
- **Genetik** (en büyük faktör)
- **Hormonal** (androjenler, özellikle puberte + premenstrüel)
- **Diyet** (yüksek glisemik indeks, süt ürünleri — sınırlı kanıt)
- **Stres** (kortizol → sebum)

Tedavi olmaz, **yönetilir**.

## Yanılgı 1: "Daha Sık Yıka, Daha Az Yağlı Olur"

### Hata
Günde 4-5 kere yüz yıkama, agresif sülfat içerikli temizleyici.

### Neden Yanlış
- Aşırı temizlik bariyer çözer
- Cilt **rebound** sebum üretir (kuruluk algıladığı için)
- Reaktif yağlanma + akne tetikleyici

### Doğru Yaklaşım
- Günde **2 kez** yıka (sabah, akşam)
- Salisilik asit %0.5-2 içeren temizleyici (ama her gün değil)
- pH 5-6 dengeli, sülfat-free

## Yanılgı 2: "Nemlendirici Bana Lazım Değil"

### Hata
"Yağlı zaten, nemlendirici ekstra yağ" mantığı.

### Neden Yanlış
- Yağ ≠ nem
- Dehidrasyon (su eksikliği) sebumu **uyarır**
- Cilt nem azaldığında "kuru" zanneder, daha çok yağ üretir

### Doğru Yaklaşım
- **Hafif jel nemlendirici** (su bazlı)
- HA + niasinamid + gliserin
- Krem değil, jel/emülsiyon

## Yanılgı 3: "SPF Yağ + Akne Yapar"

### Hata
"Yağlı cilde SPF surmek tıkar, akne yapar."

### Neden Yanlış
- Mineral SPF (zinc oxide) komedojen değil
- Modern kimyasal SPF formülasyonları akne-aware
- SPF olmadan post-akne lekelenme katlanır

### Doğru Yaklaşım
- **Mineral SPF + niasinamid** kombinasyonu (La Roche-Posay Anthelios Mat, Avène Cleanance Solaire)
- Yağsız SPF formülasyonları
- Etiketinde "non-comedogenic" varsa güven

## Yanılgı 4: "Astrenjant + Toner Pozelerini Sıkıştırır"

### Hata
Yüksek konsantrasyon alkol içerikli toner günlük rutinde.

### Neden Yanlış
- Gözenek boyutu **fiziksel olarak değişmez** (genetik)
- Alkol bariyer çözer
- Hassasiyet + reaktif yağlanma

### Doğru Yaklaşım
- **BHA tonik** (salisilik asit %0.5-2) gözenek tıkanıklığını açar — boyutu küçültmez
- **Niasinamid serum** sebum + görünüm
- Buz + sıcak su açma-kapama mit

## Yanılgı 5: "Hindistan Cevizi Yağı Doğal, Hep Faydalı"

### Hata
Yüze hindistan cevizi yağı sürmek "doğal" olduğu için iyidir mantığı.

### Neden Yanlış
- Komedojen skor **5/5** (en yüksek)
- Yüz gözeneklerini tıkar
- Yağlı + akneli ciltte sivilce patlaması

### Doğru Yaklaşım
- Yüz için: squalane (komedojen skor 1), jojoba (skor 2), rosehip (skor 1)
- Hindistan cevizi yağı: vücut + saç için OK

## Yağlı Cilt Doğru Rutin

### Sabah
1. **Hafif jel temizleyici** (sülfat-free)
2. **Niasinamid %5-10**
3. **Hafif jel nemlendirici** (HA + niasinamid)
4. **Mineral SPF 50+** (mat formülasyon)

### Akşam
1. **Çift temizleme** (yağ bazlı + jel)
2. **Salisilik %0.5-2** (haftada 3-4 gece) VEYA **Retinol %0.025-0.3**
3. **Hafif jel nemlendirici**

### Haftada
- **Kil maskesi** (kaolin) 1-2x: Sebum kontrolü
- **AHA** spot tedavi (komedonal alanlarda)

## Kaynaklar
- [Cosmetic Ingredient Comedogenicity](https://www.cir-safety.org/)
- [JAAD Acne Treatment Guidelines](https://www.jaad.org/article/S0190-9622)`,
  },
  {
    title: 'Vegan vs Cruelty-Free vs Clean: Etiket Terimleri Açıklaması',
    slug: '2026-04-29-vegan-clean-cruelty-free',
    content_type: 'label_reading',
    summary: 'Vegan, cruelty-free, clean beauty, organik — kozmetik etiketinde bu terimler ne anlama gelir? Hangileri sertifikalı, hangileri pazarlama?',
    body_markdown: `## Etiket Çalışması

Kozmetik markaları "vegan", "natural", "clean" gibi terimleri pazarlama için sıkça kullanır. Bunların yasal tanımı **çok az** veya **hiç yok**. Bilelim ki ne ne demek.

## Vegan

### Tanım
Hayvansal kaynak içermeyen ürün:
- Bal, balmumu YOK
- Lanolin (koyun yağı) YOK
- Karmin (böcek boyası) YOK
- Salyangoz salgısı YOK
- Kolajen (hayvan kemiği) YOK

### Sertifika
- **Vegan Society** (İngiltere)
- **PETA Beauty Without Bunnies**
- **Leaping Bunny + Vegan**

### Türkiye Düzenleme
Yasal vegan sertifikasyonu **yok**. Marka kendi iddia eder; bağımsız doğrulama yok.

### Yaygın Hayvansal İçerikler
- Lanolin → bitkisel squalane alternatifi
- Karmin → mineral pigment
- Bal/balmumu → bitkisel sümük (mucilage)
- Kolajen → hidrolize bitki proteini

## Cruelty-Free

### Tanım
Hayvan üzerinde test edilmemiş ürün.

### Önemli Nüans
- **AB**: 2013'ten beri kozmetik için hayvan testi YASAK
- **Çin**: Yasal olarak hayvan testi gerekli (yerel pazara giriş için)
- **ABD**: Federal yasak yok (çoğu eyalet yasakladı)

### Sertifika
- **Leaping Bunny** (Cruelty Free International) — **altın standart**
- **PETA Cruelty Free**
- **Choose Cruelty Free** (CCF)

### "Çin'e Satıyor mu?" Testi
Eğer marka Çin pazarına yerel mağazadan satıyorsa, hayvan testi reddetmiş olamaz. Sınır ötesi e-ticaret + sınırlı online satış yeni Çin yönetmeliklerinde muaf.

## Clean Beauty

### Tanım — Standardize Yok
"Clean" tanımı **markaya göre değişir**. Genelde:
- Paraben yok
- Sülfat yok
- Phthalates yok
- Sentetik parfüm yok
- Silikon (bazı markalarda) yok
- "Toksin yok" iddiası

### Sorun
- "Toksin" tanımı belirsiz
- Doğal ≠ güvenli (lavanta = alerjen)
- Yapay ≠ tehlikeli (sentetik C vit = aktif)
- "Chemical" terimi yanıltıcı (her şey kimyasaldır)

### Marka Listesi
- **Drunk Elephant**: "Suspicious 6" (esansiyel yağ, parfüm, alkol vb.)
- **Beautycounter**: 1800+ "Never List"
- **Credo Beauty**: Multi-brand standard

### Sertifika
- **EWG Verified** (Environmental Working Group)
- **Whole Foods Premium Body Care**

## Doğal / Natural

### Tanım — Standart Yok
- ABD: FDA yasal tanımı **yok**
- AB: Belirsiz
- Türkiye: Yasal yok

### Sertifika
- **NATRUE** (Avrupa) — minimum %75 doğal kaynak
- **COSMOS Natural** (Avrupa) — daha katı
- **Ecocert Natural** (Fransa)

## Organik

### Tanım — Sertifikasyon Var
Organik tarımdan elde edilen ham madde.

### Sertifika
- **USDA Organic** (ABD) — minimum %95 organik
- **COSMOS Organic** (Avrupa) — minimum %95 organik
- **Ecocert Organic**
- **NATRUE Organic** — daha katı

### Türkiye
TGRS (Tarımsal Üretim ve Geliştirme Genel Müdürlüğü) sertifikalı, ama kozmetik için spesifik yasa azaltılmış.

## Sürdürülebilir / Sustainable

### Tanım
- Sürdürülebilir kaynaklı ham madde
- Çevre dostu paketleme (cam, geri dönüşümlü)
- Karbon nötr üretim
- Refill / refillable

### Sertifika
- **B Corp Certified**
- **1% for the Planet**
- **Climate Pledge**
- **Cradle to Cradle**

## REVELA Filtreleri

Ürün arama sayfasında filtre çekirdeğini geçmek için:
- ✅ Vegan (marka iddiasıyla)
- ✅ Cruelty-Free (Leaping Bunny veya benzeri sertifika)
- ✅ Parfümsüz
- ✅ Sülfat-free
- ✅ Paraben-free
- ✅ Alkol-free

## Pratik Tüyo

"Clean" kelimesine takılma. Asıl önemli:
1. **INCI listesini oku** (REVELA bunu kolaylaştırır)
2. **Bilimsel kanıtlı aktif** ara (niasinamid, retinol, HA)
3. **Hassasiyetin varsa kanıtlı tetikleyicilerden kaçın**
4. **Sertifika varsa güven** (Leaping Bunny, COSMOS)

## Kaynaklar
- [EU Cosmetics Regulation 1223/2009](https://eur-lex.europa.eu/)
- [FDA Cosmetic Labels](https://www.fda.gov/cosmetics/cosmetics-labeling)`,
  },
  {
    title: 'Probiyotik Tipolojisi: Suşa Göre Hangi Sorun?',
    slug: '2026-04-29-probiyotik-sus-tipolojisi',
    content_type: 'ingredient_explainer',
    summary: 'Probiyotik suş bazlı çalışır. Aynı tür (örn L. acidophilus) farklı suşlar = farklı etki. Klinik kanıtlı suşlar listesi.',
    body_markdown: `## "Probiyotik Probiyotiktir" — Mit

L. acidophilus NCFM ≠ L. acidophilus DDS-1. **Suş** (strain) seviyesinde klinik kanıt aranmalı.

## En Çok Çalışılmış Suşlar

### Sindirim Sağlığı

| Suş | Endikasyon | Doz |
|---|---|---|
| **L. rhamnosus GG** (LGG) | Genel sindirim, akut ishal | 10 milyar CFU/gün |
| **Saccharomyces boulardii** (CNCM I-745) | C. difficile, antibiyotik sonrası ishal | 250-500 mg/gün |
| **B. infantis 35624** | IBS-D | 1 milyar CFU/gün |
| **L. plantarum 299v** | IBS, sindirim rahatsızlığı | 10 milyar CFU/gün |
| **L. casei Shirota** | Bağırsak hareketi | 6.5 milyar CFU/gün (Yakult) |

### İmmün Destek

| Suş | Endikasyon |
|---|---|
| **L. casei DN-114001** | Üst solunum yolu enfeksiyonu (Actimel) |
| **L. rhamnosus HN001** | İmmün yanıt çocuklarda |
| **B. lactis BB-12** | Soğuk algınlığı süresi |
| **L. plantarum HEAL9 + L. paracasei 8700:2** | Soğuk algınlığı önleme |

### Kadın Sağlığı

| Suş | Endikasyon |
|---|---|
| **L. rhamnosus GR-1 + L. reuteri RC-14** | Vajinal mikrobiyom |
| **L. crispatus** | Üriner sağlık |
| **L. acidophilus LA-14** | Genel kadın sağlığı |

### Cilt (Bağırsak-Cilt Aksı)

| Suş | Endikasyon |
|---|---|
| **L. rhamnosus + L. paracasei** | Atopik dermatit |
| **L. plantarum** | UV koruma |
| **B. lactis** | Akne |
| **Lactobacillus rhamnosus GG** | Atopik dermatit erken yaş |

### Ruhsal (Psikobiyotik)

| Suş | Endikasyon |
|---|---|
| **L. rhamnosus + L. helveticus** | Anksiyete |
| **B. longum 1714** | Stres yanıtı |
| **L. casei Shirota** | Mood, kortizol |

## Suş İsimlendirme

Doğru etiket örneği:
**Lactobacillus rhamnosus GG (LGG)** — 10 milyar CFU

- **Cins (genus)**: Lactobacillus
- **Tür (species)**: rhamnosus
- **Suş (strain)**: GG

Eksik etiket: "Lactobacillus" — hangi tür/suş bilinmiyor → klinik anlamı yok.

## CFU vs Süre

- **Üretim anında 50 milyar** ≠ **Raf ömrü sonunda 50 milyar**
- Etiketinde **"expiry date'te garanti edilen miktar"** olmalı
- Soğuk zincir önemli (canlı bakteri)
- Spor formu (B. coagulans, L. sporogenes) oda sıcaklığı dayanıklı

## Multi-Strain vs Single-Strain

### Single-Strain
Spesifik klinik kanıt için (LGG, S. boulardii, BB-12)

### Multi-Strain (4-10 farklı suş)
Genel sağlık desteği, çeşitlilik

**Visbiome / VSL#3**: 8 suş, 450-900 milyar CFU — IBS + ülseratif kolit klinik kanıt güçlü.

## Antibiyotik + Probiyotik

- Antibiyotikten **2-3 saat sonra** probiyotik
- Antibiyotik bittikten sonra **2 hafta daha** devam
- **Saccharomyces boulardii** antibiyotikle **birlikte** alınabilir (maya, antibiyotikten etkilenmez)

## Türkiye Eczane Markaları

| Marka | İçerik | Endikasyon |
|---|---|---|
| **Florastor** | S. boulardii CNCM I-745 | Antibiyotik sonrası ishal |
| **Probiotik Plus** | Multi-strain | Genel |
| **Solgar Advanced 40+** | Multi-strain | Yetişkin |
| **Now Probiotic-10** | 10 farklı suş, 25 milyar CFU | Genel |
| **Pharmaton Probiyotik** | LGG | Genel sağlık |

## Pratik Reçete

### Genel sağlık (rutin)
- 10-20 milyar CFU/gün
- 4-6 farklı suş
- 8-12 hafta dene

### Spesifik durum
- **IBS**: B. infantis 35624 (Symprove)
- **Antibiyotik sonrası**: S. boulardii (Florastor)
- **Akne destek**: L. rhamnosus + L. paracasei

## Kaynaklar
- [WGO Global Guidelines — Probiotics](https://www.worldgastroenterology.org/)
- [ISAPP Position Statement](https://isappscience.org/)`,
  },
  {
    title: 'AHA vs BHA vs PHA: Asit Eksfolyantlarını Karşılaştırma',
    slug: '2026-04-29-aha-bha-pha-eksfoliyant',
    content_type: 'comparison',
    summary: 'AHA, BHA, PHA — moleküler farklar, hangi cilt tipinde, ne sıklıkta kullanılmalı? Eksfolyantların kapsamlı kıyaslaması.',
    body_markdown: `## 3 Asit Sınıfı

Cilt eksfolyantı asitlerinin 3 ana sınıfı:

### AHA (Alpha Hydroxy Acid)
- Suda çözünür
- Yüzey eksfoliyasyonu
- Glikolik, laktik, mandelik, malik

### BHA (Beta Hydroxy Acid)
- Yağda çözünür
- **Gözenek içine penetre** olur
- Tek molekül: Salisilik asit

### PHA (Poly Hydroxy Acid)
- Yeni nesil, daha hafif AHA
- Büyük molekül → yavaş penetrasyon
- Glukonolakton, laktobiyonik asit

## Detaylı Karşılaştırma

| Özellik | AHA (Glikolik) | BHA (Salisilik) | PHA (Glukonolakton) |
|---|---|---|---|
| **Çözünürlük** | Su | Yağ | Su |
| **Penetrasyon** | Yüzey | Gözenek + yüzey | Yüzeysel |
| **Tahriş** | Yüksek | Orta | Düşük |
| **Hassas cilt** | Mandelik tercih | Düşük doz OK | İdeal |
| **Akne** | Hafif | Etkili | Hafif |
| **Anti-aging** | Yüksek | Orta | Düşük-orta |
| **Hidrasyon** | Orta | Düşük | Yüksek |
| **Fotosensitivite** | Yüksek | Orta | Çok düşük |

## AHA Türleri

### Glikolik Asit (en küçük molekül)
- Penetrasyon: en derin
- Etki: en güçlü (yüksek konsantrasyon)
- Tahriş: en yüksek
- pH 3-4 optimum
- Konsantrasyon: %5-30

### Laktik Asit (orta molekül)
- Daha yumuşak
- NMF (doğal nemlendirici) yapı taşı → hidrasyon
- Hassas cilt için tercih
- Konsantrasyon: %5-12

### Mandelik Asit (büyük molekül)
- En yumuşak AHA
- Esmer ten için en güvenli (PIH riski düşük)
- Akne + leke kombin
- Konsantrasyon: %5-10

### Malik Asit (orta)
- Elma türevi
- Genelde AHA blendlerde
- Tek başına nadir

## BHA Salisilik Asit

### Avantaj
- Lipofilik → gözenek içine penetre
- Akne + komedonal akne ana tedavi
- Anti-enflamatuar (aspirin akrabası)

### pH Bağımlılığı
- pH 3-4 aktif
- pH>5 etkisi azalır

### Konsantrasyon
- **%0.5-1**: Günlük (toner, esans)
- **%2**: Standart serum
- **%2+**: Spot tedavi

### Gebelik
**%2 üstü topikal SA gebelikte kontraendike** (FDA Cat C).

## PHA — Yeni Nesil

### Glukonolakton
- Büyük molekül, yavaş penetrasyon
- Anti-enflamatuar + antioksidan
- Diyabet hastalarında bile güvenli

### Laktobiyonik Asit
- Glukonolaktondan da büyük
- Çok yumuşak
- Hassas + reaktif cilt

### Avantaj
- Fotosensitivite minimal
- Gebelikte güvenli
- Atopik + rosacea kabul edilebilir

## Hangi Cilt Hangi Asit?

### Yağlı + Akneli
- **BHA %1-2** (akşam, gün aşırı)
- AHA opsiyonel ek
- Sebum kontrolü için niasinamid kombin

### Kuru + Yaşlanan
- **AHA Laktik %5-10**
- Hassas başlangıç: PHA
- Bariyer destek için ceramide kombin

### Hassas
- **PHA %4-10**
- Veya **Mandelik %5**
- Glikolik kaçın

### Karma
- T-zone: BHA
- Yanak: AHA Laktik veya PHA
- Bölgesel uygulama

### Esmer Ten / Akdeniz
- **Mandelik %5-10** (PIH riski en düşük)
- Glikolik kaçın
- SPF 50+ zorunlu

## Kombin Stratejisi

### Aynı Gece Kullanma
- AHA + Retinol → tahriş
- BHA + Retinol → tahriş
- PHA + Retinol → genelde OK

### Dönüşümlü
- Pazartesi: AHA
- Çarşamba: Retinol
- Cuma: BHA
- Salı/Perşembe/Cumartesi: nemlendirici only

### Sabah-Akşam Ayrı
- Sabah: PHA (yatıştırıcı)
- Akşam: BHA veya retinol

## Yan Etki Yönetimi

### "Purging" vs "Breakouts"
- **Purging** (yeni aktif): mevcut komedonların hızla yüzeye çıkması, **cilde yeni**, 4-6 hafta
- **Breakouts**: tahriş + yeni sivilce, **bariyer hasarı**, hemen durdur

### Soyulma Protokolü
- İlk hafta: gün aşırı
- 2. hafta: 3 gece
- 3. hafta: her gece
- 4. hafta+: konsantrasyon artırılabilir

## Markalar

### AHA
- The Ordinary Glycolic Acid 7% Toning Solution
- Pixi Glow Tonic (Glikolik %5)
- Sunday Riley Good Genes (Laktik)

### BHA
- Paula's Choice 2% BHA Liquid Exfoliant
- COSRX BHA Blackhead Power Liquid
- Naturium 2% BHA

### PHA
- The Inkey List PHA Toner
- Naturium PHA Topical Acid 12%

## Kaynaklar
- [Fartasch et al. 2003 — Br J Dermatol](https://pubmed.ncbi.nlm.nih.gov/12932223/)
- [Sharad 2013 — Clin Cosmet Investig Dermatol](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3875240/)`,
  },
  {
    title: 'Kafein Takviyesi vs Kahve: Cilt + Sağlık Etkileri',
    slug: '2026-04-29-kafein-kahve-takviye',
    content_type: 'guide',
    summary: 'Kafein günlük rutindeki en yaygın aktif. Kahve, çay, takviye — farkları nedir? Cilt ve sağlık üzerine etkileri?',
    body_markdown: `## Kafein — Yaygın Stimülan

Türkiye yetişkinlerin %85+'i günde kafein tüketiyor. Çoğu kahveden, kalanı çay + enerji içeceği + takviye.

## Kafein Kaynakları

| Kaynak | Tipik Doz |
|---|---|
| **Espresso shot** | 60-80 mg |
| **Filtre kahve (250ml)** | 90-120 mg |
| **Çay (250ml)** | 30-50 mg |
| **Yeşil çay** | 25-40 mg |
| **Energy drink (250ml)** | 80-150 mg |
| **Çikolata bar** | 10-30 mg |
| **Pre-workout (1 scoop)** | 200-400 mg |
| **Kafein takviye tablet** | 100-200 mg |

## Faydalar

### Bilişsel
- Uyanıklık, odaklanma
- Reaksiyon süresi
- Bellek konsolidasyonu

### Fiziksel
- Egzersiz performansı (3-6 mg/kg vücut ağırlığı)
- Yağ oksidasyonu
- Kas yorgunluğu geciktirme

### Sağlık
- Tip 2 diyabet riski azalma (3-4 fincan/gün)
- Karaciğer + Parkinson koruması
- Mortalite azalma (orta tüketim)

## Cilt Üzerine Etkiler

### Topikal Kafein
- Vasokonstriksiyon (göz altı şişlik)
- Anti-selülit (lipoliz aktivasyon)
- Antioksidan koruma

### Oral Kafein vs Cilt
- Aşırı tüketim (>500mg/gün) → dehidrasyon → cilt nemini azaltabilir
- Uyku kalitesinin düşmesi → cilt onarımı zayıflar
- Stres + kortizol artışı → akne tetikleyici

## Doğru Doz

- **Optimum**: 200-400 mg/gün (yetişkin)
- **Üst limit**: 400 mg/gün (Avrupa Gıda Güvenliği)
- **Hamilelik**: 200 mg/gün (FDA)
- **Çocuk + ergen**: 100 mg/gün

## Kafein + L-Theanine Sinerji

L-theanine (yeşil çay amino asidi) kafeinle sinerjik:
- Kafein: alertness
- L-theanine: anksiyete azaltma + odak

**Optimal oran**: 100-200 mg L-theanine + 100 mg kafein.

Yeşil çay zaten doğal kombinasyon (1 fincan ~30 mg theanine + 30 mg kafein).

## Yan Etkiler

- Anksiyete + sinirlilik
- Uyku bozukluğu (yarı ömür 5-6 saat)
- Kalp çarpıntı
- Sindirim hassasiyeti
- Dehidrasyon (hafif diüretik)

## Tolerans + Bağımlılık

- 7-10 gün düzenli kullanım = tolerans
- Aniden bırakma = baş ağrısı, yorgunluk (1-3 gün)
- "Reset" için 2 hafta kafein-free kürü

## Kafein Hassasiyeti (Genetik)

CYP1A2 enzimi varyantı:
- **Hızlı metabolize** (%10 popülasyon): Az etkilenir
- **Yavaş metabolize** (%50+): 1 fincanda bile etkilenir
- **23andMe / Mygenes** testi ile öğrenilebilir

## Cilt İçin Kafein Stratejisi

### Optimum Yaklaşım
- 1-2 fincan kahve (200-300 mg toplam)
- L-theanine takviye veya yeşil çay kombin
- 14:00 sonrası kahve YOK (uyku için)
- Su tüketimi 2-2.5 L/gün

### Topikal Kafein
- Göz kremi (kafein %3+) — şişlik
- Anti-selülit krem (orta etki)
- Saç dökülme tedavisi (Caffeine shampoo, Plantur 39)

## Türkiye Marketi

### Takviye
- **Now Foods Caffeine 200mg**
- **Solgar Caffeine + L-Theanine**
- Pre-workout ürünleri (300+ mg)

### Yeşil Çay Ekstra (Daha Yumuşak)
- **Solgar Green Tea Extract**
- **Now Foods EGCG**

## Kaynaklar
- [EFSA Caffeine Safety Opinion 2015](https://www.efsa.europa.eu/en/efsajournal/pub/4102)
- [Goldstein et al. 2010 — JISSN](https://jissn.biomedcentral.com/articles/10.1186/1550-2783-7-5)`,
  },
];

console.log(`[1] ${ARTICLES.length} pilot makale insert ediliyor...`);
let inserted = 0;
for (const a of ARTICLES) {
  try {
    await c.query(
      `INSERT INTO content_articles (title, slug, content_type, summary, body_markdown, status, published_at)
       VALUES ($1, $2, $3, $4, $5, 'published', NOW())
       ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             summary = EXCLUDED.summary,
             body_markdown = EXCLUDED.body_markdown,
             status = 'published',
             updated_at = NOW()`,
      [a.title, a.slug, a.content_type, a.summary, a.body_markdown]
    );
    inserted++;
  } catch (e) {
    console.log(`  ERR [${a.slug}] ${e.message.slice(0, 60)}`);
  }
}
console.log(`\n${inserted}/${ARTICLES.length} insert/update`);

const final = await c.query(`SELECT content_type, COUNT(*) FROM content_articles WHERE status='published' GROUP BY content_type ORDER BY content_type`);
console.log('\n## Final yayında:');
for (const r of final.rows) console.log(`  ${r.content_type.padEnd(25)} ${r.count}`);

await c.end();
