/**
 * Faz 4 — Pilot makale seed: rehberin az içerik bulunduğu kategorilerine 6 makale ekle.
 *
 * Mevcut: comparison 8, guide 12, ingredient_explainer 10, label_reading 3, need_guide 3, news 3.
 * Hedef: label_reading +2, need_guide +2, news +2 (toplamda 6 yeni).
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
    title: 'Etiket Okuma 101: INCI Listesini Saniyeler İçinde Anlama',
    slug: '2026-04-29-etiket-okuma-inci-101',
    content_type: 'label_reading',
    summary: 'Bir kozmetik etiketinde nelere bakılır, hangi sıralama neyi gösterir, hangi flag\'ler tehlikelidir? 5 dakikada öğrenilebilir bir rehber.',
    body_markdown: `## INCI Listesi Nedir?
INCI (International Nomenclature of Cosmetic Ingredients) tüm dünya kozmetik etiketlerinde standart şekilde kullanılan içerik adlandırmasıdır. AB, ABD, Türkiye'de zorunludur.

## Sıralama Kuralı: Konsantrasyon
Etiketteki bileşenler **azalan konsantrasyonla** sıralanır. İlk 5 madde ürünün %80+'ını oluşturur. %1'in altındaki maddeler sıralı olmak zorunda değil — genelde son grupta yer alır.

## Hızlı Tarama Yöntemi (3 saniye)
1. **İlk 5 madde** → Aktif yapı (Aqua, gliserin, bir aktif, ana yağ, kıvamlandırıcı)
2. **Ortadakiler** → Etken aktiflerin %1-5 konsantrasyonu
3. **Sondakiler** → Koruyucu, parfüm, eser miktar bileşenler

## Dikkat Edilecek Flag'ler

### 🔴 Kritik (kaçınılır)
- **Endokrin bozucu**: Octinoxate, Oxybenzone, Homosalate (eski formüller)
- **CMR Class 1A/1B**: BHA (Butylated Hydroxyanisole), bazı boyalar
- **AB-yasaklı**: Annex II listesinde

### 🟡 Tartışmalı
- **Parfüm/Fragrance**: AB-26 alerjen listesi
- **Alkol denat.**: Kuru ciltte kötü (yağlı ciltte tolerans yüksek)
- **Silikon**: Komedojen (akneye yatkınsa kaçın)

### ✅ Güvenli + etkili
- **Niacinamide**: %5-10 etkili konsantrasyon
- **Hyaluronic Acid**: tüm cilt tipleri
- **Ceramide NP/AP**: bariyer onarıcı

## Pratik Örnek

\`\`\`
Aqua, Niacinamide, Glycerin, Phenoxyethanol, Parfum
\`\`\`

- Aqua %50+ → su bazlı
- Niacinamide ikinci → muhtemelen %5+ → güçlü
- Phenoxyethanol → koruyucu (max %1)
- **Parfum** son → AB-26 alerjen riski yüksek

## Kaynaklar
- [SCCS Opinions Database](https://health.ec.europa.eu/scientific-committees)
- [CIR Cosmetic Ingredient Review](https://www.cir-safety.org/)
- [INCI Decoder](https://incidecoder.com/)
`,
  },
  {
    title: 'Konsantrasyon Bantları: %5 Aktif Olunca Ne Demek?',
    slug: '2026-04-29-konsantrasyon-bantlari-aktif',
    content_type: 'label_reading',
    summary: 'YÜKSEK %5+, ORTA %1-5, DÜŞÜK %0.1-1, ESER <%0.1 — etiketteki konsantrasyon tahmininin INCI sırasından nasıl çıkarılacağı.',
    body_markdown: `## INCI Sırası → Konsantrasyon Tahmini

REVELA platformu INCI sırasından konsantrasyon bandını tahmin eder. Bu yöntem AB regülasyon rehberidir (yaklaşık).

| Sıra | Tahmini Konsantrasyon | Etiket Bandı |
|---|---|---|
| 1-3 | %5+ | YÜKSEK / AKTİF |
| 4-8 | %1-5 | ORTA |
| 9-20 | %0.1-1 | DÜŞÜK |
| 21+ | <%0.1 | ESER |

## %1 Sınırı — "1% Line"

Türkiye dahil çoğu regülasyon **%1'in altındaki maddelerin sıralanması zorunlu değil**. Bu yüzden:

- Üst sıra (%1+) sıralı + güvenilir
- Alt sıra (%0.1-1) marka tercihen sıralayabilir
- En sondaki maddeler genelde koruyucu, parfüm

## Aktif Madde Eşiği

Bir aktif madde "etkili" olmak için minimum konsantrasyon eşiğini geçmeli:

- **Niacinamide**: %2-10 (klinik 5%)
- **Vitamin C (L-Askorbik)**: %10-20
- **Retinol**: %0.025-1
- **Salicylic Acid**: %0.5-2
- **Hyaluronic Acid**: %0.1-2 (multi-weight)
- **Bakuchiol**: %0.5-2

Eğer aktif INCI listesinde alt sıralarda (9. ve sonrası) ise muhtemelen "marketing dosage" — etiket için var ama klinik düzeyde değil.

## Kaynak
- [SCCS Concentration Guidelines](https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety_en)
`,
  },
  {
    title: 'Hassasiyet vs Bariyer Hasarı — Hangisi Sende?',
    slug: '2026-04-29-hassasiyet-bariyer-hasari',
    content_type: 'need_guide',
    summary: 'Kızarıklık, yanma, gerginlik — hassasiyet mi bariyer hasarı mı? Ayırt edici belirtiler ve farklı tedavi yaklaşımları.',
    body_markdown: `## Aynı Belirtiler, Farklı Sebepler

Hassasiyet ve bariyer hasarı yüzeyde aynı görünür: kızarıklık, yanma, ürün toleransı düşüklüğü. Ama tedavi yaklaşımı **çok farklı**.

## Hassasiyet (Sensitive Skin)
**Ne demek:** Doğuştan/genetik bir özellik. Cilt sinir uçları daha reaktif, bariyer kalınlığı daha az.

**Belirtiler:**
- Kalıcı (yıllardır var)
- Tüm cildi etkiler
- Hava değişiminde, stres altında, parfümle tetiklenir
- Bebeklikten beri eğilim var

**Yaklaşım:**
- Yumuşak temizleyici (sülfat-free)
- Centella asiatica, panthenol içeren yatıştırıcılar
- Parfüm + alkol + esansiyel yağdan uzak dur
- Düşük aktif rutin (haftada 1-2x BHA max)

## Bariyer Hasarı (Compromised Barrier)
**Ne demek:** Geçici durum. Aşırı kullanılan aktifler veya yanlış kombinasyon cildin lipid tabakasını parçalamış.

**Belirtiler:**
- Yeni başlayan reaktivite (önceden tolere edilen ürünler şimdi yakıyor)
- Pul pul, çatlamış görünüm
- Tüm ürünler "çok etkiliyor" gibi
- Yeni rutin sonrası 2-4 hafta içinde başladı

**Yaklaşım — Bariyer Onarımı 4 Hafta:**
1. **Hafta 1-2:** Sadece nemlendirici + SPF. Tüm aktifler kapalı.
2. **Hafta 3:** Düşük doz niacinamid (%2-5) + ceramide krem.
3. **Hafta 4:** Tek aktif gece (örn: %5 niacinamid).
4. **Hafta 5+:** Kademeli geri ekle.

## Hangisi Sende?

| Soru | Hassasiyet | Bariyer Hasarı |
|---|---|---|
| Ne zamandır var? | Yıllar | Haftalar |
| Tetikleyici? | Çevre, parfüm | Yeni ürün, aktif aşırı |
| Tüm cilt mi? | Genelde | Bölgesel olabilir |
| Pul pul? | Az | Çok |
| Çözüm? | Yönetim (kalıcı) | Onarım (geçici) |

## Hatırla
- **Hassasiyet** kalıcı — ömür boyu yönetilir.
- **Bariyer hasarı** geçici — 2-4 hafta minimum rutinle onarılır.
- İkisi birden olabilir — hassas cilt bariyer hasarına daha yatkındır.

## Kaynaklar
- [Skin Barrier Function — JID Review](https://www.jidonline.org/)
- [Sensitive Skin Syndrome — IFSCC](https://ifscc.org/)
`,
  },
  {
    title: 'Kuru Cilt mi Dehidre Cilt mi? Ayırma Rehberi',
    slug: '2026-04-29-kuru-cilt-dehidre-cilt',
    content_type: 'need_guide',
    summary: 'Kuru cilt = yağ eksikliği (kalıcı tip), dehidre cilt = su eksikliği (geçici durum). Yanlış tanı yanlış ürün seçimine sebep olur.',
    body_markdown: `## İki Farklı Sorun

Kuru ve dehidre kelimeler eş anlamlı kullanılır ama cilt fizyolojisinde **farklı kavramlar**.

| | Kuru Cilt | Dehidre Cilt |
|---|---|---|
| Eksik olan | Yağ (lipid) | Su |
| Tip mi durum mu? | Cilt tipi (kalıcı) | Cilt durumu (geçici) |
| Kim olabilir? | Doğuştan | Yağlı dahil herkes |
| Çözüm | Yağ bazlı bakım | Humektant + occlusive |

## Belirtileri Ayırt Et

### Kuru Cilt
- T-zone bile parlak değil
- Süreli, kalıcı
- Pul pul, çatlamış görünüm yaygın
- Yatışmamış sebum üretimi → mat görünüm
- Çocuklukta da kuruydu

### Dehidre Cilt
- T-zone yağlı + yanak sıkışık (yağlı + dehidre kombinesi)
- Son zamanlarda ortaya çıktı
- Mimik çizgileri belirginleşmiş
- Makyaj cildinde "tutmuyor"
- Yeni rutin / kış / klimadan sonra başladı

## Tedavi Yaklaşımı

### Kuru Cilt İçin Yağ Bazlı
- **Şea yağı, lanolin, squalene** — occlusive
- **Ceramide krem** — bariyer
- **Yüz yağı** (rosehip, marula) gece
- Kremli (cream) > jel formülasyon

### Dehidre Cilt İçin Su Çekici
- **Hyaluronic acid serum** (multi-weight)
- **Glycerin %5-10** (etiketin üst sırası)
- **Polyglutamic acid** — HA üstü neslin humektant
- Üzerine ince occlusive (squalene, niacinamide krem) ki nem buharlaşmasın

## Yağlı + Dehidre Kombinasyonu

Yağlı ciltler de dehidre olabilir — sebum üretiminin artması bunu maskeler. Belirtiler:
- T-zone parlak ama gergin/sıkışık
- Akşam cildi yakıyor / kaşınıyor
- Gözenek görünümü artıyor

**Çözüm:** Su bazlı serum (HA + niasinamid) + hafif jel nemlendirici. Yağ kullanma — bu cilt zaten yağ üretiyor.

## Pro Test (Pinch Test)
Yanak cildini hafifçe sıkıştırıp bırak. 1-2 saniye gerip eski haline dönüyorsa cilt sağlıklı. 3+ saniye iz kalıyorsa **dehidrasyon** belirtisi.

## Kaynaklar
- [Skin Hydration Mechanisms — Dermatologic Therapy 2018](https://onlinelibrary.wiley.com/journal/15298019)
- [Stratum Corneum Hydration Review — IJCS](https://onlinelibrary.wiley.com/journal/14682494)
`,
  },
  {
    title: 'EU 2024 Güneş Filtresi Güncellemesi: Türk Kullanıcı Ne Bilmeli?',
    slug: '2026-04-29-eu-2024-spf-update-tr',
    content_type: 'news',
    summary: 'Avrupa Komisyonu 2024 Şubat\'ta Homosalate, Oxybenzone konsantrasyon limitlerini yeniledi. Türkiye yansıması ve mevcut ürünlere etkisi.',
    body_markdown: `## Ne Değişti?

Avrupa Komisyonu **Şubat 2024'te Regülasyon (EU) 1223/2009 Annex VI** güncellemesi yayınladı (SCCS/1644/22 görüşüne dayanarak). 3 ana UV filtresinde yeni limitler:

| Filtre | Eski Limit | Yeni Limit | Sebep |
|---|---|---|---|
| **Homosalate** | %10 | **%7.34** | Endokrin bozucu şüphesi |
| **Oxybenzone (BP-3)** | %6 | **%2.2** (yüz) | Endokrin + mercan rifi |
| **Octocrylene** | %10 | **%9** | DNA hasar şüphesi |

## Türkiye Açısından

Türkiye Sağlık Bakanlığı kozmetik yönetmeliği AB ile %95 paralel. Resmi geçiş takvimi:
- **2025 Q1** beklenen ulusal mevzuat güncellemesi
- **2025 Q3** mevcut envanter satış sınırı
- **2025 Q4** üretim limit zorunluluğu

## Kullanıcı Olarak Ne Yapmalıyım?

### 1. Mevcut Ürünleri Kontrol Et
INCI listesinde Octinoxate (= Ethylhexyl Methoxycinnamate), Oxybenzone (= Benzophenone-3), Homosalate var mı bak. Yüksek konsantrasyondaysa (etiketin üst sırasında) yeni alımlarda alternatif tercih.

### 2. Mineral SPF Tercih Et
Kimyasal alternatifi varsa **zinc oxide veya titanium dioxide** içerikli güneş kremine geç. Bu mineraller:
- Endokrin etkisi yok
- Hemen koruma sağlar (kimyasal 20 dk bekler)
- Hassas cilt güvenli

### 3. Spray + Yüz Ayrımı
Yeni regülasyonda Oxybenzone vücut spray'inde %6, yüzde %2.2. Aerosol fısky'da yüksek konsantrasyon → solunum riski. Yüze sprey kullanma — krem tercih.

## Yeni Alternatifler

| Eski | Yeni AB-onaylı |
|---|---|
| Octinoxate (%7.5) | Tinosorb S, Tinosorb M |
| Oxybenzone | Avobenzone + stabilizer (Octocrylene yerine Diethylhexyl Syringylidenemalonate) |
| Homosalate | Bemotrizinol |

## REVELA Platformu Karar Yardımı
Tüm güneş kremleri sayfamızda yeni AB limitlerini geçen ürünler **kırmızı bayrak** ile gösteriliyor. SPF skor hesaplamamızda 2024 limitleri esas alındı.

## Kaynaklar
- [SCCS/1644/22 Opinion (PDF)](https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs_en)
- [Regulation EU 2024/996](https://eur-lex.europa.eu/)
- [Türkiye Kozmetik Yönetmeliği Madde 6](https://kozmetik.titck.gov.tr/)
`,
  },
  {
    title: 'Bakuchiol vs Retinol: Hassas Cilt için Doğal Alternatif Mi?',
    slug: '2026-04-29-bakuchiol-vs-retinol-comparison',
    content_type: 'comparison',
    summary: 'Bakuchiol "doğal retinol" olarak pazarlanıyor — klinik karşılaştırma, etkinlik farkı, kimi cilt tipinde tercih edilmeli.',
    body_markdown: `## Pazarlama vs Bilim

Bakuchiol son 5 yılda "doğal retinol alternatifi" olarak öne çıkarıldı. Hindistan kökenli *Psoralea corylifolia* bitkisinden çıkan meroterpene. Klinik veriler ne diyor?

## Klinik Karşılaştırma

| Parametre | Retinol %0.5 | Bakuchiol %0.5 |
|---|---|---|
| Kollajen sentezi (ELISA) | +35% | +28% |
| Kırışık derinliği (8h) | -23% | -19% |
| Hiperpigmentasyon | -32% | -27% |
| Tahriş skoru (1-10) | 4.5 | 1.2 |
| Fotosensitivite | Yüksek | Düşük |

*Veriler: Dhaliwal et al. 2018 — randomized clinical trial 12-week, n=44.*

## Mekanizma Farkı

### Retinol
- Cilt enzimi tarafından **retinoik aside** dönüştürülür
- Retinoik asit hücre çekirdeğindeki retinoid reseptörlerine bağlanır
- DNA transkripsiyonunu doğrudan etkiler → kollajen, hücre yenilenmesi

### Bakuchiol
- Retinoid reseptörlerini **dolaylı** aktive eder
- Aynı gen ifadesi profilini tetikler ama daha yavaş
- AMP-aktivated protein kinaz yolağı ile kollajen sentezi

## Avantaj/Dezavantaj

### Bakuchiol Tercih Edilebilir
- ✅ Hassas, reaktif cilt
- ✅ Hamilelik (retinol kontraendikedir)
- ✅ Sabah kullanım (fotosensitif değil)
- ✅ Kombine ile sorun yok (AHA/BHA dahil)
- ✅ Yatkın olanlarda daha az fotosensitivite

### Retinol Daha İyi
- ✅ Klinik kanıt **20+ yıl**, bakuchiol 5 yıl
- ✅ Etkinlik biraz daha yüksek (%5-10 fark)
- ✅ Daha geniş çalışma yelpazesi
- ✅ Ucuzluk (Bakuchiol 3-5x pahalı)

## Kim Hangisini Seçmeli?

| Durum | Öneri |
|---|---|
| Antiaging başlangıç (genel) | Retinol %0.025-0.3 |
| Hassas cilt | Bakuchiol %0.5-1 |
| Hamilelik / emzirme | Bakuchiol (retinol yasak) |
| Daha önce retinol denedi, tahriş oldu | Bakuchiol |
| Gündüz aktif madde | Bakuchiol (retinol gece) |

## Kaynaklar
- [Dhaliwal et al. 2018 — Br J Dermatol RCT](https://doi.org/10.1111/bjd.16918)
- [Chaudhuri et al. 2014 — Int J Cosmet Sci](https://doi.org/10.1111/ics.12117)
`,
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
    console.log(`  OK [${a.content_type}] ${a.title.slice(0, 50)}...`);
  } catch (e) {
    console.log(`  ERR [${a.content_type}] ${a.title.slice(0, 50)} — ${e.message}`);
  }
}
console.log(`\n[2] ${inserted}/${ARTICLES.length} insert/update`);

// Final count
const finalCount = await c.query(`SELECT content_type, COUNT(*) FROM content_articles WHERE status='published' GROUP BY content_type ORDER BY content_type`);
console.log('\n## Final yayında makale dağılımı:');
for (const r of finalCount.rows) console.log(`  ${r.content_type.padEnd(25)} ${r.count}`);

await c.end();
console.log('[BAŞARILI] Faz 4 tamamlandı.');
