/**
 * Faz 1.5c — Top 20 ek popüler INCI için detailed_description seed (batch 2).
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
  'centella-asiatica-leaf-extract': `**Centella Asiatica (CICA / Gotu Kola)** anti-enflamatuar ve bariyer onarımı için kanıtlanmış bitki ekstresidir.

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
- Iliopoulos et al. 2018: %3 kafein göz kremi 8 hafta → şişlik %20 azalma.
- Herman 2013: Topikal kafein selülitte plasebodan az iyi.`,

  'allantoin': `**Allantoin** yatıştırıcı ve onarıcı etki gösteren küçük molekül.

## Doğal Kaynak
- Karakafes (Symphytum officinale) bitkisi
- Sentetik üretim de yaygın (saflık nedeniyle)

## Mekanizma
- **Hücre yenilenmesi**: Keratinosit proliferasyonu artırır
- **Yumuşatıcı**: Stratum korneum nemini artırır
- **Anti-enflamatuar**: Hassas ciltlerde kızarıklık azaltır
- **Antioksidan** (orta düzey)

## Etkili Konsantrasyon
- **%0.1-0.5**: Hafif yatıştırıcı
- **%0.5-2**: Onarıcı (post-prosedür)
- **AB max %2** — Annex III

## Kullanım
- Hassas, reaktif, atopik ciltlerde güvenli
- Bebek ürünleri yaygın (paraben + sülfat-free formülasyonlarda)
- Genelde panthenol, centella, ceramide ile kombin

## Kanıt
- CIR 2010 Final Report: "Safe in cosmetics up to 2%"`,

  'panthenol': `**Panthenol (Provitamin B5)** humektant + onarıcı vitamin.

## Mekanizma
Cilt enzimleri panthenol'ü pantotenik aside (B5) dönüştürür:
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

  'aloe-barbadensis-leaf-juice': `**Aloe Vera (Aloe Barbadensis)** geleneksel yatıştırıcı + onarıcı bitki.

## Aktif Bileşenler
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

  'glycyrrhiza-glabra-root-extract': `**Meyan Kökü (Licorice Root)** aydınlatıcı + anti-enflamatuar bitki.

## Aktif Bileşenler
- **Licorice extract**: Glabridin (ana aydınlatıcı)
- **Glycyrrhizin**: Anti-enflamatuar
- **Liquiritin**: Antioksidan

## Mekanizma
- **Tirozinaz inhibisyonu**: Hidrokinondan farklı yolak ile melanin azaltır
- **Anti-enflamatuar**: 11β-HSD enzim modülasyonu
- **UV koruyucu** (zayıf, SPF değil)
- **Antioksidan**: ROS süpürücü

## Etkili Konsantrasyon
- **Glabridin %0.05-0.5**: Klinik aydınlatma
- **Toplam meyan ekstresi %1-5**: Standart

## Hidrokinon Alternatifi
Hidrokinon yan etkiler nedeniyle reçeteli. Glabridin daha güvenli ama 1/2 etkin. Kombinasyon: glabridin + niasinamid + arbutin = sinerjik aydınlatma.

## Kullanım
- Melasma, post-inflamatuar hiperpigmentasyon
- Hassas ciltlerde güvenli (rosacea hariç)
- Topikal SPF gerekli

## Kanıt
- Yokota et al. 1998: %0.5 glabridin tirozinaz inhibisyonu hidrokinon ile karşılaştırılabilir (in vitro).`,

  'camellia-sinensis-leaf-extract': `**Yeşil Çay Özü (Camellia Sinensis)** güçlü antioksidan polifenol kaynağı.

## Aktif Bileşenler
- **EGCG** (Epigallocatechin Gallate) — en güçlü
- **EGC** (Epigallocatechin)
- **ECG** (Epicatechin Gallate)
- **Kafein** (~%3)

## Mekanizma
- **Antioksidan**: ROS süpürme — UV-induced hasar koruma
- **Anti-enflamatuar**: COX-2 + iNOS inhibisyonu
- **MMP inhibisyonu**: Kollajen yıkıcı enzimleri baskılar
- **Anti-androjenik** (sebum kontrolü hafif)

## Etkili Konsantrasyon
- **%0.5-3**: Standart antioksidan formül
- **%3-5**: Yüksek konsantrasyon, klinik düzey

## Stabilite
- Oksitlenmeye yatkın → kahverengi → koyu cam, airless pump
- E vitamini + ferulik asit ile kombin stabilizasyon

## Kanıt
- Hsu 2005 (J Am Acad Dermatol): Topikal EGCG UV-induced hasar 8 hafta ölçülebilir azalma.
- Mahmood et al. 2011: %3 yeşil çay kremi 8 hafta → cilt elastikiyeti +25%.

## Kullanım
- Yağlı cilt + akne (sebum + anti-enflamatuar)
- Anti-aging serum kombinasyonları`,

  'sodium-hyaluronate': `**Sodium Hyaluronate** hyalüronik asidin tuz formu.

## HA vs Sodium Hyaluronate
| | HA (Asit) | Na-Hyaluronate (Tuz) |
|---|---|---|
| Çözünürlük | Düşük | Yüksek |
| Penetrasyon | Daha iyi | Yüzey ağırlıklı |
| Stabilite | Düşük pH | Geniş pH aralığı |
| Maliyet | Daha pahalı | Daha ucuz |

Modern serum etiketlerinde "Hyaluronic Acid" yazsa da çoğu zaman gerçek molekül **Sodium Hyaluronate**.

## Multi-Weight Formülasyon
En etkili HA serumlar 3-5 farklı molekül ağırlığı içerir:
- 2000 kDa: Yüzey film, anlık plump
- 500 kDa: Üst stratum korneum
- 100 kDa: Orta epidermis
- 30 kDa: Derin epidermis
- 10 kDa: Hücre içi sinyalleme

## Etkili Konsantrasyon
- **%0.1-2**: Standart serum/krem
- **%2+**: Yoğun, "sticky" his

## Kanıt
- Pavicic et al. 2011: Multi-weight HA 60 gün, kırışık derinliği -40%.`,

  'titanium-dioxide': `**Titanium Dioxide** mineral UV filtresi (UVB + UVA-2).

## Mekanizma
İnert, beyaz pigment partikülleri UV ışınlarını **yansıtır + absorbe eder** (kimyasal reaksiyon yerine fiziksel bariyer):
- UVB (290-320 nm): Yüksek koruma
- UVA-2 (320-340 nm): Orta koruma
- UVA-1 (340-400 nm): Zayıf — Zinc Oxide ile kombin gerekli

## Avantajlar
- **Hemen koruma**: Kimyasal SPF 20 dk beklerken Ti-O ürün uygulandığı an aktif
- **Endokrin etki yok**
- **Hassas + bebek + gebelik güvenli**
- Hawaii / Key West ban'ından muaf

## Dezavantajlar
- **Beyaz iz**: Geleneksel partikül boyutu beyaz cilt hatta sürerse
- **Nano** versiyon (boyut <100 nm): Beyaz iz minimal ama sistemik emilim tartışmalı

## Etkili Konsantrasyon
- **%5-10**: Genel kullanım, SPF 20-30
- **%10-25**: Yüksek SPF 50+
- **AB max %25** (Annex VI)

## Kullanım
- Mineral SPF formülleri (zinc oxide ile kombin standart)
- Pediatrik + post-prosedür altın standart
- "Reef-safe" güneş kremi etiketi genelde Ti-O + Zn-O içerir`,
};

console.log(`[1] Mapping size: ${Object.keys(DETAILS).length}`);

let updated = 0, skipped = 0;
for (const [slug, body] of Object.entries(DETAILS)) {
  try {
    const r = await c.query(
      `UPDATE ingredients SET detailed_description = $2 WHERE ingredient_slug = $1 AND (detailed_description IS NULL OR length(detailed_description) < 100)`,
      [slug, body.trim()]
    );
    if (r.rowCount && r.rowCount > 0) { updated++; console.log(`OK ${slug}`); }
    else skipped++;
  } catch (e) { console.log(`ERR ${slug}: ${e.message}`); skipped++; }
}
console.log(`\n[2] Updated: ${updated}, Skipped: ${skipped}`);

const final = await c.query(`SELECT COUNT(*) FILTER (WHERE detailed_description IS NOT NULL AND length(detailed_description) > 100) AS full FROM ingredients`);
console.log(`Total ingredients with detailed_description: ${final.rows[0].full}/5100`);

await c.end();
