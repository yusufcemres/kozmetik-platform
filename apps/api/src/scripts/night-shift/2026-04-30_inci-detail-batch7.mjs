// Faz 5 batch 7 — 5 INCI: papatya + cyclopentasiloxane + octinoxate + sodium-pca + asiaticoside
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'matricaria-chamomilla-flower-extract': `**Matricaria Chamomilla Flower Extract (Alman Papatyası)**, hassas cilt + atopik dermatit + bebek bakımının klasik bitkisel aktifi. Geleneksel Avrupa fitoterapisinde yüzlerce yıldır kullanılır; modern dermatoloji literatüründe **anti-enflamatuvar + yatıştırıcı** kategorisinde kanıtlı.

## Aktif Bileşikler

- **Bisabolol (alpha-bisabolol):** ana terpenoid alkol, anti-enflamatuvar
- **Chamazulene:** mavi-yeşil renkli sesquiterpen, antioksidan + anti-enflamatuvar
- **Apigenin:** flavonoid, COX-2 inhibisyonu
- **Matrikin:** glikozidi peptit, yara iyileşmesi
- **Esansiyel yağ (eser):** uçucu, çoğu özütlerde minimal

Saf bisabolol (%95+) ayrı INCI olarak da satılır; daha yüksek konsantrasyonda anti-enflamatuvar etki için.

## Mekanizma

- **Anti-enflamatuvar:** COX-2 + LOX yolakları + NF-κB baskılar (Srivastava 2010)
- **Anti-enflamatuvar (mast hücre):** histamin salımını azaltır → ürtiker + atopik kaşıntı
- **Yara iyileşmesi:** keratinosit migrasyonu + fibroblast aktivasyonu
- **Anti-bakteriyel (zayıf):** S. aureus üzerine ek katkı (atopik dermatitte yararlı)
- **Yatıştırıcı:** topikal kullanımda hafif vazokonstriktör → kızarıklık azaltır

## Etkili Konsantrasyon

- **%0.5-2 standardize özüt:** günlük yatıştırıcı
- **%2-5:** atopik dermatit + post-prosedür
- **Bisabolol izole %0.1-0.5:** premium anti-enflamatuvar formüller

## Kullanım Tüyoları

- **Endikasyonlar:** rosacea, atopik dermatit, perioral dermatit, retinol/AHA yatıştırıcı, bebek bakımı, post-laser
- **Sıra:** serum aşaması (suya çözünür özüt)
- **Kombinasyon:** centella + niacinamid + papatya = "soothing trio"
- **Hamilelik:** topikal güvenli kabul edilir
- **Bebek (>6 ay):** hassas cilt için tercih edilen aktif

## Kanıt

- **Patzelt-Wenczler & Ponce-Pöschl (2000):** %3 papatya kremi vs %0.5 hidrokortizon, atopik dermatit, non-inferior etki RCT (Eur J Med Res)
- **Srivastava et al. (2010):** matricaria flavonoid + terpenoid review, anti-enflamatuvar mekanizma (Mol Med Rep)
- **Glowania et al. (1987):** topikal papatya yara iyileşmesi RCT (Z Hautkr)
- **Charousaei et al. (2011):** atopik egzama topikal papatya, 8 hafta SCORAD anlamlı azalma (Ostomy Wound Manage)

## Hassasiyet

Düşük-orta; **Asteraceae (papatya/krizantem) ailesine alerjisi olanlarda kontakt dermatit**. Patch test prevalans %1-3. Patch test pozitif kişilerde alternatif: centella, panthenol, ektoin.

## Roman Papatyası (Anthemis Nobilis) Karışıklığı

Roman papatya farklı bitki — daha yüksek kontakt dermatit prevalansı. Etiketlerde dikkat:
- ✅ Matricaria chamomilla / Matricaria recutita = Alman papatya, daha güvenli
- ⚠️ Anthemis nobilis = Roman papatya, daha alerjenik

## Kaynaklar

CIR (Matricaria Final Report 2017), Patzelt-Wenczler RCT (Eur J Med Res), Srivastava review (Mol Med Rep), AB Annex II Asteraceae kategorisi.`,

  'cyclopentasiloxane': `**Cyclopentasiloxane (D5, Siklopentasiloksan)**, halka yapılı **siklik silikon**. Dimethicone'dan farkı: çok hızlı uçar (volatile silicone), cilt yüzeyinde yüksek kayganlık ama kalıcılık az. AB rinse-off ürünlerde **mikroplastik yasağı** kapsamında.

## Mekanizma

- **Volatile carrier:** ürün uygulandıktan sonra uçar → **"hafif his"** (saç + makyaj primer için ideal)
- **Çözücü:** yağda çözünür aktiflerin uniform dağılımı
- **Cilt yüzey kayganlığı:** anti-friction
- **Hızlı emülsiyon kırma:** krem yapıyı bozmadan kayan formül

## D4 / D5 / D6 Karışıklığı

| Form | Halka Üye | AB Durum |
|------|-----------|----------|
| **D4** (Octamethylcyclotetrasiloxane) | 4 | **AB'de yasak** (PBT — biriken toksik, REACH 2018) |
| **D5** (Cyclopentasiloxane) | 5 | **Rinse-off >%0.1 yasak** (REACH 2020), leave-on izinli |
| **D6** (Cyclohexasiloxane) | 6 | Leave-on izinli, rinse-off kısıtlı |

> ⚠️ **D5 yasağı detay:** Sadece **yıkanan ürünlerde** (cleanser, shampoo, vücut yıkama) %0.1 üzerinde yasak. **Leave-on (yüz krem, primer, saç styling)** ürünlerde devam izinli.

## Mikroplastik mi?

**Tartışmalı:**
- Plastik tanımına dar anlamda uymaz (polimer değil, küçük halka)
- Çevresel persistence + biyobirikim sergileyen "plastik benzeri" molekül
- AB Komisyonu 2020'de "deniz kirliliği" gerekçesiyle rinse-off yasakladı
- Linear silikon (dimethicone) bu kapsamda **değil**

## Etkili Konsantrasyon

- **%5-15:** primer, makyaj altı (saf D5 ürünler)
- **%15-30:** saç styling spray
- **%30-70:** profesyonel makyaj (ön koruma)

## Kullanım Tüyoları

- **Endikasyonlar:** primer (makyaj altı), yağlı cilt makyaj sabitleyici, saç frizz azaltma
- **Sıra:** rutinin son katmanı (krem üstü), makyaj öncesi
- **Kombinasyon:** dimethicone + D5 = uzun ömürlü film + hafif his
- **Hassas cilt:** çok düşük alerji riski
- **Cevreye duyarlı kullanıcı:** dimethicone'a geç (rinse-off ürünlerde özellikle)

## Kanıt

- **Mojsiewicz-Pieńkowska et al. (2014):** D5 dermal güvenlik review, sistemik penetrasyon minimum (Polim Med)
- **CIR (2003 ve 2018 update):** kozmetik kullanımda güvenli, sistemik biyobirikim insan kullanımında gözlenmemiş
- **REACH 2020 Restriction:** çevresel risk gerekçesiyle rinse-off >%0.1 yasak
- **EU Commission Regulation 2018/35:** D4 PBT (Persistent, Bioaccumulative, Toxic) sınıflandırması

## Çevre Endişesi

D5 atık suya geçer, çamur biriktirir. Avrupa dış ortamda çamurun %1-3 oranında siloksan birikimi var. Cilt için risk **yok**, ekosistem için **var**.

## Hassasiyet

Çok düşük; alerjik kontakt dermatit nadir. Patch test prevalans %<0.1. Hipoalerjenik kategoride.

## Kaynaklar

CIR (Cyclopentasiloxane Final Report 2018 update), REACH Annex XVII Entry 70, EU Commission 2018/35, Mojsiewicz-Pieńkowska review.`,

  'ethylhexyl-methoxycinnamate': `**Ethylhexyl Methoxycinnamate (Octinoxate / Oktinoksat)**, en yaygın kimyasal **UVB filtresi**. AB onaylı (Annex VI #12 max %10) ama 2010 sonrası **endokrin etki tartışmaları + çevresel riskler** nedeniyle kullanımı azalmakta. Türkiye'de hala yaygın, AB'de daha çok yenilenmiş alternatiflere geçiş.

## Mekanizma

- **UVB emici:** 280-320 nm, peak 311 nm
- **UVA II zayıf:** UVA için yetersiz → kombinasyon zorunlu (avobenzone + Tinosorb)
- **Foto-isomerizasyon:** UV altında trans → cis dönüşüm (aktivite kaybı yavaş)
- **Mekanizma sınırı:** UV enerjisini ısıya çevirir, sonra IR olarak yayınlar

## Konsantrasyon

- **AB Annex VI #12:** maksimum **%10**
- **FDA OTC monograph:** maksimum %7.5
- **Yaygın formül:** %5-7.5 günlük SPF

## Sorunlar

### 1. Endokrin Tartışması

- **Hayvan çalışmaları:** östrojen reseptörü zayıf bağlanma (Schlumpf 2001, Environ Health Perspect)
- **İnsan çalışmaları:** sistemik emilim sonrası serum konsantrasyonu ölçülebilir (Janjua 2008)
- **FDA 2019:** günlük yüksek SPF kullanımı serum seviyesini "endokrin endişe" eşiği üstü çıkarabilir (JAMA)
- **Sonuç:** **AB SCCS hala onaylı**, ama hassas grup (hamile, çocuk) için alternatif öner

### 2. Çevresel Risk (Mercan)

- **Hawaii 2021 yasağı:** Octinoxate + Oxybenzone deniz korunma alanlarında satışı yasak
- **Florida 2023:** Key West yasakı geçti
- **Türkiye + AB:** çevresel yasak yok ama bilinçli tercih artıyor

### 3. Fotokarasız (Tek Başına)

UV altında zaman zamanla aktivite kaybı: 2 saatte ~%50 düşer. Bu yüzden:
- Yenileme zorunlu
- Avobenzone + Octocrylene + Tinosorb ile **stabilize edilmesi** önerilir

## Kullanım Tüyoları

- **Endikasyonlar:** günlük SPF, makyaj altı SPF, geniş yetişkin kullanımı
- **Hassas grup için kaçın:** hamile, emziren, bebek, melasma
- **Alternatifler:**
  - **Mineral:** ZnO + TiO2 (en güvenli)
  - **Yeni nesil:** Tinosorb S/M, Uvinul T 150 (fotostabil + sistemik emilim minimum)
  - **Avobenzone + Octocrylene:** kombinasyon UVA + UVB tam spektrum
- **Sıra:** rutinin **EN SON aşaması**
- **Miktar:** yüz için ~1.25 ml (yarım çay kaşığı)
- **Yenileme:** 2 saatte bir, terleme/yıkama sonrası

## Kanıt

- **Schlumpf et al. (2001):** Octinoxate + diğer UV filtreleri östrojen aktivite hayvan modeli (Environ Health Perspect)
- **Janjua et al. (2008):** topikal SPF sonrası serum seviyeleri (Toxicology)
- **Matta et al. (2019, JAMA):** FDA günlük SPF kullanımı endokrin endişe eşiği aşımı
- **SCCS Opinion 1383/10:** AB güvenlik değerlendirmesi — hala onaylı

## Hassasiyet

Düşük; kontakt dermatit prevalans %<1. Foto-allerji nadir. Hassas cildin kimyasal SPF tolerans testinde Octinoxate genellikle iyi tolere edilir.

## Trend

Türkiye + AB pazarında **azalmakta**:
- Premium SPF (La Roche-Posay Anthelios, Avene, ISDIN) Tinosorb S + Uvinul T 150 kombinasyonuna geçiyor
- ABD pazarı OTC monograph reform bekliyor (FDA inceleme süreci)
- Mineral SPF (TiO2 + ZnO) hassas grup için altın standart

## Kaynaklar

CIR (Octinoxate / Ethylhexyl Methoxycinnamate Final Report 2014), SCCS Opinion 1383/10, Schlumpf endokrin review, FDA 2019 JAMA, AB Annex VI #12.`,

  'sodium-pca': `**Sodium PCA (Sodyum Pirolidon Karboksilik Asit)**, ciltte doğal olarak bulunan **NMF (Natural Moisturizing Factor)** ailesinin temel bileşeni. Glutamik asitten türetilir; humektant kategorisinde gliserine alternatif, daha hızlı emilen + non-yağlı seçenek.

## NMF Bileşimi (Stratum Corneum'da Doğal)

Cildin doğal nemlendirici faktörü:
- **PCA (%12):** Sodium PCA olarak topikal kullanılır
- **Laktik asit (%12):** AHA + humektant
- **Üre (%7):** humektant + hafif keratolitik
- **Sodyum + potasyum + magnezyum tuzları (%18):** elektrolit denge
- **Aminoasitler (%40):** serine, glycine, alanine, vd.

NMF eksikliği = atopik dermatit + ksiroz (kuru cilt) klinik tablosunun temeli.

## Mekanizma

- **Higroskopik:** suya bağlanma kapasitesi gliserinden yüksek
- **Hızlı emilim:** moleküler boyutu küçük, stratum corneum'a hızlı geçer
- **Bariyer destekçi:** doğal NMF yenilemesi → TEWL azalır
- **Anti-mikrobiyal (zayıf):** PCA pH düşürücü etki

## Etkili Konsantrasyon

- **%0.5-2:** günlük formülasyon (humektant)
- **%2-5:** atopik dermatit + kuru cilt
- **%5-10:** intensif NMF restorasyon
- Genel olarak gliserinden **çok daha düşük dozajda etkili**

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt, atopik dermatit, retinol/AHA bariyer destek, hassas cilt
- **Sıra:** serum aşaması, suda çözünür
- **Kombinasyon:** Sodium PCA + HA + niasinamid = klasik nemli + bariyer trio
- **Yağsız tercih:** gliserin yapışkan hissini sevmeyenlerde alternatif
- **Hamilelik:** güvenli (cilt doğal bileşeni)

## Kanıt

- **Rawlings & Harding (2004):** NMF stratum corneum review, PCA + laktik asit + üre humektant rolü (Dermatol Ther)
- **Pellizzaro et al. (2019):** topikal Sodium PCA, atopik dermatit kuruluk + kaşıntıda anlamlı azalma RCT (Skin Pharmacol Physiol)
- **Choi et al. (2020):** %3 Sodium PCA serumu, 4 hafta, TEWL %25 azalma + bariyer fonksiyonu (J Cosmet Dermatol)

## Form Farkları

- **Sodium PCA:** sodyum tuzu, en yaygın
- **Saf PCA:** dengesiz, formülasyonda nadiren
- **Magnesium PCA, Zinc PCA:** mineral tuzları, ek aktif (Zn-PCA akneye yatkın için ek katkı)

## Hassasiyet

Çok düşük; cilt doğal bileşeni. Patch test alerji prevalansı %<0.5. Bebek formülasyonlarında yaygın.

## Kaynaklar

CIR (PCA / Sodium PCA Final Report 2010), Rawlings NMF review, Pellizzaro RCT, Choi RCT.`,

  'asiaticoside': `**Asiaticoside (Asiatikozit)**, *Centella asiatica* (Cica) bitkisinin ana **triterpenoid saponini**. Centella'nın anti-aging + bariyer onarımı + yara iyileşmesi etkisinin büyük bölümünü taşıyan izole aktif. Standardize centella özütlerinde "centellosides" toplamının major bileşeni.

## Centella Aktif Üçlüsü

- **Asiatikozit (asiaticoside):** glikozit form, ana aktif
- **Madekassosid (madecassoside):** glikozit form, anti-enflamatuvar daha güçlü
- **Asiatik asit + madekassik asit:** glikozit olmayan asit formlar

Bu dördünün toplamı **TECA (Titre Estratto Centella Asiatica)** veya **CTFA** standardı ile ölçülür.

## Mekanizma

- **Kollajen tip I + III sentezi:** fibroblast modülasyonu (Bonté 1994 in vitro 5× artış)
- **TGF-β yolak aktivasyonu:** yara iyileşmesi + ECM yenileme
- **Anti-enflamatuvar:** TNF-α + NF-κB baskılama (madekassosid'den biraz zayıf)
- **Antioksidan:** ROS süpürür
- **Mikrosirkülasyon:** kapiller geçirgenliği iyileştirir → kızarıklık azaltır

## Etkili Konsantrasyon

- **%0.1-0.5 izole:** premium anti-aging formüller
- **%1-5 standardize centella özütü:** günlük (asiatikozit %30-50 standardı)
- **%5-10 özüt:** atopik dermatit + post-prosedür intensif

## Kullanım Tüyoları

- **Endikasyonlar:** anti-aging, yara iyileşmesi, atopik dermatit, post-laser/IPL, retinol yatıştırıcı, ince çizgi
- **Sıra:** serum aşaması
- **Kombinasyon:** retinol + asiatikozit = anti-aging sinerji (retinol hücre yenilenme + asiatikozit ECM sentezi). Niasinamid + ektoin ile uyumlu.
- **Hamilelik:** topikal görece güvenli kabul edilir (oral kullanımda yüksek doz dikkat)
- **Hassas cilt:** retinole alternatif başlangıç olarak ideal

## Kanıt

- **Bonté et al. (1994):** %5 asiatikozit, fibroblast kollajen tip I sentezi 5× artış in vitro (Eur J Pharmacol)
- **Maquart et al. (1999):** asiatikozit dermal yara iyileşmesi mekanizma (Eur J Dermatol)
- **Liu et al. (2008):** topikal asiatikozit, kelloid skar tedavisi RCT (Dermatol Surg)
- **Park (2021):** UV-indüklenmiş eritem + foto-aging modeli, asiatikozit anti-enflamatuvar (Skin Pharmacol Physiol)

## Hassasiyet

Çok düşük; rare contact dermatitis (%<0.5). Centella ailesi kontakt dermatit oranı genel olarak düşük. Hamilelik + bebek (>6 ay) topikal güvenli kabul edilir.

## Kaynaklar

CIR (Centella Asiatica + asiaticoside, Final Report 2014), Bonté in vitro 1994, Maquart wound healing, Park UV review.`,
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
