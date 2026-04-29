// Faz 5 batch 3 — 5 INCI tam: ceramide-np, bakuchiol, squalane, azelaic-acid, ectoin
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'ceramide-np': `**Ceramide NP (Seramid NP / Ceramide-3)**, ciltteki **stratum corneum lipid bariyerinin** doğal yapı taşı. Toplam 12+ seramid alt tipi vardır; NP (formerly Ceramide-3) en yaygın kullanılanlardan biridir. Bariyer onarımı için en iyi belgelenmiş aktif.

## Bariyer Bilimi

Stratum corneum lipid bariyeri ~%50 seramid + %25 kolesterol + %15 serbest yağ asidinden oluşur. Atopik dermatit, kuru cilt, retinol/AHA hassasiyetinde bu oran bozulur → **TEWL artar, irritasyon kapısı açılır**.

## Mekanizma

- **Lipid replacement therapy:** kayıp bariyer lipidini doğrudan yerine koyar
- **Multilamellar yapı:** kolesterol + yağ asidi + seramid 1:1:1 oranında **lameller body** oluşturur (Man et al. 1996)
- **Anti-enflamatuvar (dolaylı):** sağlam bariyer = düşük allergen geçişi
- **Anti-aging (dolaylı):** bariyer sağlığı + nem dolgunluğu

## Form Farkları

- **Ceramide NP** (formerly Ceramide 3): yaygın, sentetik kaynaklı, stabil
- **Ceramide AP, EOP, NS** (formerly 6-II, 1, 2): daha az kullanılır
- **Bitkisel "phytoceramide":** pirinç/buğday, oral takviye olarak kullanılır
- **Pseudoceramide:** yapısal olarak benzer ama tam olarak seramid değil; etiket karışıklığı yapar

## Etkili Konsantrasyon

- **%0.1-1:** günlük formülasyon
- **%1-3:** atopik dermatit + bariyer onarımı kremi
- **%3+:** tıbbi cilt (CeraVe / La Roche-Posay Lipikar)

Konsantrasyondan çok **kolesterol + yağ asidi ile dengeli oran** önemlidir. Sadece seramid yetmez.

## Kullanım Tüyoları

- **Endikasyonlar:** atopik dermatit, retinol/AHA sonrası bariyer hasarı, kuru cilt, postpartum cilt, perioral dermatit
- **Sıra:** krem aşaması (su bazlı serumun üstü); seramid yağda çözünür
- **Kombinasyon:** niasinamid (ceramide sentezi tetikler) + cholesterol + skualan = klasik bariyer trio

## Kanıt

- **Man et al. (1996):** topikal seramid + kolesterol + yağ asidi 1:1:1, atopik bariyer iyileşmesi (J Invest Dermatol)
- **Spada et al. (2018):** %1 ceramide kremi, 28 gün, atopik dermatitte SCORAD anlamlı azalma + TEWL %40 düşüş (Dermatol Ther)
- **Lin et al. (2021):** topikal seramid + niasinamid kombinasyon, retinol toleransını anlamlı artırır (J Cosmet Dermatol)

## Hassasiyet

Çok düşük; insan cildinin doğal bileşeni. Patch test prevalansı %<0.5.

## Kaynaklar

CIR (Ceramides Final Report 2020), SCCS Opinion, Man bariyer review, Spada RCT.`,

  'bakuchiol': `**Bakuchiol**, *Psoralea corylifolia* (Babchi tohumu) kökenli **fitokimyasal**. 2010'lardan sonra "bitkisel retinol alternatifi" olarak öne çıktı. Yapısal olarak retinole benzemez ama benzer transkripsiyonel cevap üretir.

## Mekanizma

- **Retinol benzeri gen ekspresyonu:** kollajen tip I + III ve elastin sentezi (Chaudhuri & Bojanowski 2014)
- **Antioksidan:** UV-indüklenmiş ROS süpürür
- **Anti-enflamatuvar:** TNF-α ve NF-κB yolağı baskılar
- **Anti-bakteriyel:** P. acnes (Cutibacterium acnes) üzerine etkili → akne için ek katkı

## Retinol Karşılaştırması

| Özellik | Retinol | Bakuchiol |
|---------|---------|-----------|
| Fotostabilite | Düşük (gece kullanım) | Yüksek (gündüz uyumlu) |
| Tahriş | Yüksek (kuruluk, soyulma) | Çok düşük |
| Hamilelik | Yasak | Görece güvenli (oral fitoöstrojen var, topikal yeterli kanıt yok) |
| Etki süresi | 6-12 hafta | 8-16 hafta |
| Pigmentasyon iyileşmesi | Çok iyi | İyi |
| Kollajen artışı | Çok iyi | İyi |

## Etkili Konsantrasyon

- **%0.5-1:** günlük başlangıç
- **%1-2:** anti-aging serumu (klinik çalışmalarda standart)
- **%2+:** hassas cilt için tahriş riski artmaya başlar

## Kullanım Tüyoları

- **Sıra:** serum aşaması, sabah veya akşam (fotostabil)
- **Kombinasyon:** niasinamid + peptit + HA ile dengeli stack. Saf C vitamini ile **aynı serumda kullan**ma (rakip antioksidan, ortak pH değil)
- **Hamilelik:** topikal kanıt sınırlı; kullanımdan önce hekim onayı önerilir
- **Hassas cilt:** retinole alternatif olarak ideal — rosacea + atopik geçmişte tolere edilir

## Kanıt

- **Dhaliwal et al. (2019):** %0.5 bakuchiol vs %0.5 retinol, 12 hafta, çift-kör RCT — fotodamage skorunda non-inferior + bakuchiol grubunda anlamlı az tahriş (Br J Dermatol)
- **Chaudhuri & Bojanowski (2014):** 1 µM bakuchiol, kollajen tip I sentezini retinole benzer artırır (Int J Cosmet Sci)
- **Bluemke et al. (2022):** %1 bakuchiol, 12 hafta, hiperpigmentasyonda anlamlı azalma (J Cosmet Dermatol)

## Hassasiyet

Çok düşük; nadir kontakt dermatit. Babchi'nin oral kullanımı **fototoksik** — ama topikal saflaştırılmış bakuchiolde bu risk yoktur (psoralen ayrılmış).

## Kaynaklar

CIR (Bakuchiol Final Report 2018), Dhaliwal RCT (Br J Dermatol 2019), Chaudhuri review, INCI Decoder.`,

  'squalane': `**Squalane (Skualan)**, balık karaciğeri yağında, zeytinde ve insan sebumunda doğal olarak bulunan **squalene** molekülünün hidrojenize formu. Cilt için "yağsız yağ" — çünkü çok hızlı emilir, yağlı his bırakmaz.

## Squalene vs Squalane

| Bileşen | Doymamışlık | Stabilite | Kullanım |
|---------|-------------|-----------|----------|
| Squalene | 6 çift bağ | Düşük (oksidlenir) | Doğal cilt sebumu |
| Squalane | 0 (hidrojenize) | Yüksek (raf ömrü ~2 yıl) | Topikal ürün |

Squalane oksidlenmediği için ürün ömrü uzar; doğal squalene'nin avantajlarını korur.

## Mekanizma

- **Bariyer destekçi:** stratum corneum lipid yapısına entegre olur
- **Emolyent:** kuruluğu yumuşatır, cildi kaygan tutar
- **Antioksidan (zayıf):** lipid peroksidasyonunu yavaşlatır
- **Non-comedogenic (akneye yol açmaz):** komedojenik skorda 0/5
- **Hızlı emilim:** fingerprint test'te <5 dk

## Kaynak Farkları

- **Bitkisel (zeytin / şeker kamışı):** vegan, sürdürülebilir, en yaygın
- **Hayvansal (köpek balığı karaciğeri):** etik sorun, AB'de azalmış kullanım
- **Sentetik:** kimyasal sentez, saflık yüksek

Etiketteki "100% Plant-Derived Squalane" güvenli tercih.

## Etkili Konsantrasyon

- **%1-5:** serum / hafif yağlı krem
- **%5-100:** saf yağ (The Ordinary tipi)
- **Vücut yağı:** %50-100 saf squalane yaygın

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt, bariyer onarımı, retinol/AHA sonrası kuruluk, anti-aging
- **Sıra:** krem aşamasından önce; nemli cilde 2-3 damla, sonra emolyent krem
- **Kombinasyon:** HA + niasinamid + squalane = klasik nemlendirici trio
- **Saç:** kuru saç uçlarına 1-2 damla, frizz azaltıcı
- **Akne:** komedojenik değil, yağlı/akneli ciltte de güvenli

## Kanıt

- **Huang et al. (2009):** topikal squalane, atopik dermatitte stratum corneum lipid bileşimini iyileştirir (Skin Pharmacol Physiol)
- **Kim & Karadeniz (2012):** squalane antioksidan kapasite, in vitro UV koruması (Adv Food Nutr Res)
- **Sethi et al. (2016):** non-comedogenic, akneye eğilimli ciltte tolerans çalışması (Indian Dermatol Online J)

## Hassasiyet

Çok düşük; sebum benzeri non-comedogenic. Patch test alerji prevalansı %<0.5.

## Kaynaklar

CIR (Squalane Final Report 2017), SCCS Opinion, Huang RCT, INCI Decoder.`,

  'azelaic-acid': `**Azelaic Acid (Azelaik Asit)**, doğal olarak buğday/çavdar/arpa kabuğunda bulunan **dikarboksilik asit**. Reçeteli (%15-20) ve OTC formlarında (%5-10) kullanılır. Akne + rosacea + pigmentasyon üçlüsünde aynı anda etkili nadir aktiflerden.

## Mekanizma

- **Anti-bakteriyel:** P. acnes (Cutibacterium acnes) hücre büyümesini bloklar
- **Komedolitik:** keratinosit hiperkeratozunu azaltır → komedon önleme
- **Anti-enflamatuvar:** kallikrein-5 ve TLR-2 inhibe eder (rosacea mekanizmasında)
- **Tirozinaz inhibitörü:** melanin üretimi azaltır (post-inflammatory hyperpigmentation)
- **Antioksidan:** ROS süpürür

## Etkili Konsantrasyon

| Form | % | Endikasyon |
|------|---|------------|
| OTC krem/jel (kozmetik) | %5-10 | Akne, hafif rosacea, leke |
| Reçeteli (Finacea, Skinoren) | %15-20 jel/krem | Orta-ağır rosacea, akne |
| Hibrit serum (The Ordinary tipi) | %10 suspension | Günlük kullanım |

%5+ üzerinde etkin; %10 çoğu kullanıcı için sweet spot.

## Kullanım Tüyoları

- **Endikasyonlar:** akne (komedonal + enflamatuvar), rosacea papülopüstüler, melasma, post-inflammatory hyperpigmentation
- **Sıklık:** günde 1-2, başlangıçta her gece
- **Sıra:** serum / treatment aşaması, nemlendiriciden önce
- **Kombinasyon:** niasinamid + AHA/BHA ile uyumlu (rakip değil, sinerjik). Retinolle aynı gece kullanım tolerans gerektirir
- **Hamilelik:** topikal **görece güvenli** (Kategori B) — gebelikte rosacea/akne için tercih edilen aktif
- **Güneş:** UV duyarlılığını anlamlı artırmaz, ama SPF her zaman önerilir
- **Stinging:** ilk 1-2 hafta hafif batma normal

## Kanıt

- **Schulte et al. (2015):** %15 azelaik asit jel vs %5 BPO, akne lezyon sayısı non-inferior + daha az tahriş (Br J Dermatol)
- **Liu et al. (2006):** %20 krem, melasma 12 hafta, anlamlı pigmentasyon azalması (J Drugs Dermatol)
- **Thiboutot et al. (2008):** rosacea papülopüstüler, %15 jel günde 2 kez, 12 hafta, lezyon sayısı %58 azalma (J Drugs Dermatol)
- **Sieber & Hegel (2014):** tirozinaz inhibisyonu mekanizması in vitro (Skin Pharmacol Physiol)

## Hassasiyet

Düşük-orta; ilk uygulamalarda **stinging + hafif kızarıklık** yaygın (%5-15 prevalans, çoğu 1-2 hafta sonra geçer). Vitiligo riski abartılı — yalnızca yanlış kullanımda nadir.

## Kaynaklar

CIR (Azelaic Acid Final Report 2017), SCCS Opinion, Schulte RCT, Thiboutot RCT.`,

  'ectoin': `**Ectoin (Ektoin)**, halofilik bakterilerin (özellikle *Halomonas elongata*) ekstrem ortamlardan kendini korumak için sentezlediği **doğal koruyucu amino asit türevi**. Cilt formülasyonlarında çevresel stres + kuruluk + UV koruması için kullanılan premium aktif.

## Mekanizma

- **Hidrojen bağlı su tabakası:** her ektoin molekülü etrafında **4-6 su molekülü** organize eder → "ekstremalif" denir
- **Protein + lipid stabilizasyonu:** UV/ısı/kuruluk stresinde hücre membranlarını korur
- **Bariyer fonksiyonu:** TEWL azalır, stratum corneum su retansiyonu artar
- **Anti-enflamatuvar:** UVA-indüklenmiş Langerhans hücre depoplasyonunu engeller (Bünger 2009)
- **Antioksidan (dolaylı):** DNA hasarı azaltır

## Form

- **Saf ektoin:** suda %1-2 çözünür, su bazlı serumlara entegre
- **Hydroxyectoine:** daha güçlü hidroksil türevi, yüksek konsantrasyonda
- Etiketteki "Ectoin" çoğunlukla saf ektoin formunda

## Etkili Konsantrasyon

- **%0.5-2:** günlük kuru cilt + nemlendirici
- **%2-7:** tıbbi sınıf (atopik / rosacea / post-tedavi)

## Kullanım Tüyoları

- **Endikasyonlar:** atopik dermatit, hassas cilt, kış kuruluğu, çevresel kirlilik (PM2.5, ozon), UV pre-/post-koruma, post-laser/peel
- **Sıra:** su bazlı serum aşaması, krem öncesi
- **Kombinasyon:** HA + panthenol + niasinamid ile sinerjik bariyer trio
- **Hamilelik:** güvenli (doğal bakteriyel kaynaklı, sistemik penetrasyon yok)
- **Hassas cilt:** retinole/AHA'ya tolerans için "boost" olarak kullanılabilir

## Kanıt

- **Bünger et al. (2009):** %2 ektoin, UVA sonrası Langerhans hücre koruması in vivo (Skin Pharmacol Physiol)
- **Heinrich et al. (2007):** topikal ektoin, atopik dermatit, 28 gün — TEWL ve eritem anlamlı azalma (Hautarzt)
- **Marini et al. (2014):** %1 ektoin + UV filtresi, fotodamage azaltma sinerjisi (J Cosmet Dermatol)

## Hassasiyet

Çok düşük; bakteriyel koruyucu metabolit, insan vücudu için inert. Patch test prevalans %<0.5. AB'de hassas cilt + bebek formülasyonlarında onaylı.

## Kaynaklar

CIR (Ectoin), Bünger UVA review, Heinrich atopik RCT, Marini in vitro.`,
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
