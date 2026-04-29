// Faz 5 — Top 5 popüler INCI detailed_description tamamlama
// Mevcut partial'lar 800-1400 char, başlıklar boş veya çok kısa.
// Hedef: ≥1500 char, her bölüm anlamlı içerik dolu.

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'niacinamide': `**Niacinamide (B3 Vitamini)**, dermatoloji literatüründe kanıt-temelli en güçlü ve çok yönlü cilt aktiflerinden biridir. Kuru-yağlı her cilt tipi için tolere edilebilir.

## Mekanizma

Niasinamid ciltte **NADH ve NADPH koenzimlerinin hammaddesidir**. Bu koenzimler keratinosit enerji metabolizmasını düzenler ve birden fazla yolla etki eder:

- **Bariyer onarımı:** seramid ve serbest yağ asidi sentezini artırır → trans-epidermal su kaybı (TEWL) azalır
- **Sebum regülasyonu:** sebumun sıkıntılı olabilen yağ asidi profilini iyileştirir, gözeneği görünmez kılar
- **Anti-pigmentasyon:** melanozomların keratinositlere transferini bloke eder (melanin üretimini değil — bu yüzden hidrokinon/arbutin kombinasyonuyla sinerji)
- **Anti-enflamatuvar:** sitokin (IL-1, TNF-α) salınımını baskılar, rosacea/akne kızarıklığını dindirir

## Etkili Konsantrasyon

- **%2-5:** bariyer + nemlendirici etki (genel)
- **%4-5:** sebum + gözenek görünümü iyileşmesi (8-12 hafta)
- **%5-10:** hiperpigmentasyon + post-inflammatory hyperpigmentation (PIH) tedavisi

%10 üstü konsantrasyonlarda flushing (kızarıklık) görülebilir, gerekli değildir.

## Kanıt

- **Hakozaki et al. (2002):** %5 niasinamid, 12 hafta, melasma şiddetinde anlamlı azalma (J Cosmet Dermatol)
- **Bissett et al. (2005):** %5 niasinamid, sarkma + gözenek + ince çizgi, çift-kör RCT (Dermatol Surg)
- **Draelos et al. (2006):** akne lezyonunda %4 niasinamid jel %2 klindamisine non-inferior (Cutis)

## Kullanım Tüyoları

- **Kombinasyon:** Hyaluronik asit, retinol, peptit ile uyumlu. Saf C vitaminiyle (askorbik asit) düşük pH'ta nikotinik asite dönüşebilir mitinin güncel literatürde geçersiz olduğu gösterilmiştir.
- **Sıra:** serum aşamasında (toner sonrası, krem öncesi)
- **Alerjenik:** çok düşük; B3 hassasiyeti olan kişilerde flushing
- **Hamilelik:** güvenli (retinol gibi yasaklarda yok)

## Kaynaklar

CIR (Cosmetic Ingredient Review 2005), SCCS Opinion, NIH PubMed niacinamide topical reviews, INCI Decoder.`,

  'salicylic-acid': `**Salicylic Acid (Salisilik Asit / BHA)**, beta hidroksi asit grubuna ait yağda çözünür eksfoliyantdır. AHA'lardan farkı: gözenek içine penetre olabilmesidir.

## Mekanizma

- **Lipofilik:** AHA'ların aksine yağda çözünür → sebum ile karışıp folikül duvarındaki keratinli tıkanmaları çözer
- **Komedolitik:** açık ve kapalı komedonu çözer, yenisini bloklar
- **Anti-enflamatuvar:** aspirinin (asetilsalisilik asit) ham hammaddesi; siklooksijenaz (COX) enzimini baskılar
- **Antibakteriyel (zayıf):** P. acnes üzerine ek katkı

## Konsantrasyon Bantları

| Form | % | Kullanım |
|------|---|----------|
| Yıkanan (cleanser) | %0.5-2 | Günlük, hafif |
| Bırakılan (toner/serum) | %0.5-2 | Geceleri |
| Spot tedavisi | %2 | Lokal |
| Profesyonel peeling | %20-30 | Klinik, yılda 1-2 kez |

## pH Bağımlılığı

SA aktif formu **pH<4** altında bulunur. pH 3.5-4 aralığı en etkili. pH 5+ formülasyonlar çoğunlukla "decorative" — cildi yeterince eksfole etmez. Etiketteki konsantrasyon kadar pH da kritiktir.

## Kullanım Tüyoları

- **Sıklık:** günde 1, geceleri (özellikle yağlı/akneli)
- **Kombinasyon:** retinol ile aynı gece kullanmayın (tahriş riski) — retinol 1 gün, BHA 1 gün
- **Güneş:** eksfoliyant olduğu için **SPF zorunlu** (UV duyarlılığı artar)
- **Hassas cilt:** %0.5'ten başla, haftada 2 kez

## Kanıt

- **Babamiri & Nassab (2010):** %2 SA günlük, 12 hafta, akne lezyon sayısında %47 azalma (J Drugs Dermatol)
- **Draelos (2006):** %2 SA cleanser ile aktif komedolitik etki, irritasyon eşik altında
- **Kornhauser (2010):** lipofilik özelliği gözenek tıkanmasında AHA'dan daha etkili (Clin Cosmet Investig Dermatol)

## Hassasiyet & AB Limit

- AB Annex III'te bırakılan formlar için **maksimum %2** (yüz)
- Aspirin alerjisi olanlarda topikal SA **kullanılmamalı**
- Gebelikte günlük topikal kullanım önerilmez (sistemik emilim düşük olsa da)

## Kaynaklar

SCCS Opinion (Salicylic Acid 2018), CIR final report, EU Annex III #98, Babamiri RCT.`,

  'hyaluronic-acid': `**Hyaluronic Acid (Hyaluronik Asit / HA)**, ciltte doğal olarak bulunan glikozaminoglikandır. Suya bağlanma kapasitesi 1g HA = 6L su (in vitro). Cilt nemlendiriciler arasında en güçlü hidrate edicilerden biri.

## Mekanizma

HA molekülü, polar (hidrofilik) yapısıyla cildin granüler tabakasında ve dermisinde su tutar. Hücreler arası matrikste hücre proliferasyonu ve dokusal su dengesini düzenler.

- **Yüksek MA (>1000 kDa):** cilt yüzeyinde film, anlık nemlendirme + bariyer desteği
- **Orta MA (100-300 kDa):** stratum corneum penetrasyonu, derin hidrasyon
- **Düşük MA / Mikro-HA (<50 kDa):** epidermise penetre, fibroblast aktivasyonu (kollajen sentezi)
- **Sodium Hyaluronate:** HA'nın sodyum tuzu, daha kararlı, formülasyonlarda yaygın

## Etkili Konsantrasyon

- **%0.1-2:** ürünlerde tipik aralık
- **%1-2 multi-MA serumu:** çoklu molekül ağırlığında HA = katmanlı hidrasyon
- **Yüksek konsantrasyon ≠ daha iyi:** düşük rutubette aşırı HA cildi kurutabilir (osmotik etki)

## Kullanım Tüyoları

- **Nemli cilde uygula:** kuru cilde HA havadan değil, cildin alt katmanlarından su çekebilir → daha fazla kuruluk. Tonerin üstüne ya da ıslak yüze ince katman.
- **Mühürle:** üstüne emolyent (yağ) ya da occlusiv (vazelin/skualan) → suyu hapseder
- **Düşük rutubette:** kış/klima ortamında alternatif nemlendirici (gliserin + skualan) ekle

## Kanıt

- **Pavicic et al. (2011):** %0.1 HA serumu, 8 hafta, yüz çevresinde ince çizgide anlamlı azalma (J Drugs Dermatol)
- **Jegasothy et al. (2014):** nano-HA, kollajen tip III sentezi artışı (Clin Aesthet Dermatol)
- **Bukhari et al. (2018):** topikal HA günlük, atopik dermatit kuruluğunda iyileşme

## Hassasiyet

Çok düşük; HA cildin doğal bileşenidir. Çapraz-bağlı (hyaluronic crosspolymer) ve modifiye HA'larda nadiren tahriş.

## Kaynaklar

CIR (HA Final Report 2009), SCCS Opinion, INCI Decoder, Pavicic RCT.`,

  'glycerin': `**Glycerin (Gliserin)**, kozmetik formülasyonlarda en yaygın **humektant** (nem çekici). Üç hidroksil grubu sayesinde havadaki su buharını ve cildin alt katmanlarındaki nemi yüzeye çeker.

## Mekanizma

- **Humektant:** nemi cilde çeker (hidrofilik OH grupları)
- **Bariyer destekçi:** stratum corneum lipidleriyle çapraz etkileşim, su dengesi
- **Akuapor (AQP-3) modulatörü:** hücreler arası su transport kanallarını destekler
- **Yardımcı solvent:** yağsız yapıya su bazlı aktif çözündürür (niacinamid, peptit vb.)

## Etkili Konsantrasyon

- **%2-10:** günlük formülasyonlar
- **%5-15:** yoğun nemlendirici / kış kremleri
- **%20+:** ozmotik etki, lekenin altındaki su konsantrasyonu yüksek olabilir; kuru ortamda **paradoksen kuruluğa** yol açabilir

Optimal aralık çoğu cilt için %3-7'dir.

## Kullanım Tüyoları

- **Mühürle:** üstüne emolyent + okluzif (skualan, shea, vazelin) → su buharlaşmasın
- **Düşük rutubet:** %20+ saf gliserin nemli cilde değil, **doğrudan kullanılmamalı** — distile su ile %50/50 sulandır
- **Kombinasyon:** HA + niasinamid + skualan üçlüsü ideal nemlendirici stack

## Kanıt

- **Fluhr et al. (2008):** topikal gliserin, atopik dermatitte stratum corneum hidrasyonunu anlamlı artırır (Skin Pharmacol Physiol)
- **Atrux-Tallau et al. (2010):** %20 gliserin yer değişimi (humektant) bariyere kollajen değil, lipid biosentezi tetikler (Int J Cosmet Sci)
- **Loden (2012):** gliserin içerikli ürünler kuru ciltte TEWL'i %30+ azaltır (Skin Res Technol)

## Hassasiyet

Çok düşük; cilt + AB regülasyonu nokta sınırı yok (Annex'te kısıt yok). Çocuk ve hassas formülasyonlarda da yaygın.

## Kaynaklar

CIR (Glycerin Final Report 2014), SCCS Opinion, EU Annex IV (renksiz), Fluhr et al.`,

  'phenoxyethanol': `**Phenoxyethanol (Fenoksietanol)**, AB ve FDA onaylı geniş spektrumlu sentetik koruyucudur. Klorotalik asit veya parabenlerin yerini alan en yaygın "paraben-free" formül koruyucu seçimidir.

## Mekanizma

Aromatik alkol türevi; mikroorganizma membran proteinlerini denatüre eder ve hücre içi enzim aktivitesini bloklar:

- **Bakteri (Gram +/-):** S. aureus, P. aeruginosa, E. coli karşı etkili
- **Maya/küf:** C. albicans, A. niger
- **Spektrum:** geniş, ancak bazı küfler için yeterli olmayabilir → ethylhexylglycerin ile sinerji (booster) yaygın

## AB Limit

**Annex V #29 — Maksimum %1** (yüz, vücut, çocuk dahil). 3 yaş altı yıkanan ürünlerde ek tartışma var (SCCS 2016 opinion'da %0.4 önerildi, sonra %1'e güncellendi).

## Güvenlik

- **CIR (2007 ve 2017):** %1'e kadar güvenli
- **SCCS (2016, 2020):** %1'e kadar güvenli; bebek ve hamile nüfuz çalışmalarında sınır içinde sistemik risk yok
- **Cilt iritasyon:** çok düşük
- **Allerji:** patch test prevalansı %0.5-2 (dermatoloji literatürü)

## Hassasiyet & Alternatifler

- Hassas / atopik ciltte alternatifler: ethylhexylglycerin, caprylhydroxamic acid, sorbic acid
- Bebek ürünlerinde tercih edilmiyor (genelde paraben-free + naturel sistemler)
- Tek başına yetmez; %0.5 phenoxyethanol + %0.3 ethylhexylglycerin kombinasyonu yaygındır

## Kullanım Tüyoları

- Etiketin INCI listesinde son 5 üye arasında olması, %0.5-1 aralığını işaret eder
- Beraber gözüken EHG (etilhekgliserin) booster — daha düşük phenoxy konsantrasyonu yeterli olur
- Alkol bazlı ürünlerde (tonik) ek koruyucu gerekmeyebilir

## Kanıt

- **Steinberg (2010):** geniş spektrum koruyucu etkililiği değerlendirme (Int J Toxicol)
- **Sarpe et al. (2018):** dermatit hastalarında topikal phenoxyethanol patch test sonuçları (Contact Dermatitis)
- **SCCS/1575/16:** AB güvenlik değerlendirmesi

## Kaynaklar

CIR (Phenoxyethanol Final Report 2017), SCCS Opinion 1575/16, EU Annex V #29, INCI Decoder.`,
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
    console.log(`✓ ${slug.padEnd(20)} → ${r.rows[0].len} char`);
    updated++;
  } else {
    console.log(`✗ ${slug} → bulunamadı`);
  }
}

console.log(`\nToplam güncellenen: ${updated}/${Object.keys(DETAILS).length}`);
await c.end();
