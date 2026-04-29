// Faz 5 batch 2 — 5 popüler aktif INCI tam'a getirme
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'tocopherol': `**Tocopherol (E Vitamini)**, lipofilik antioksidan ailesi (alpha, beta, gamma, delta tokoferol). Cilt formülasyonlarında **alpha-tocopherol** ve esteri **tocopheryl acetate** yaygın kullanılır.

## Mekanizma

- **Lipid peroksidasyonu inhibitörü:** UV ve metabolik kaynaklı serbest radikallere bağlanır, hücre membran lipidlerini korur
- **C vitamini ile sinerji:** oksidlenmiş E vit. C vit. tarafından rejenere edilir → kombine antioksidan etki tek ürünlerden 4× daha güçlü (Lin et al. 2003)
- **UV koruması (yardımcı):** UVB sonrası DNA mutasyon ve eritem azaltıcı (SPF değil, **adjuvan**)
- **Bariyer destekçi:** stratum corneum lipid yapısını stabilize eder

## Form Farkları

| Form | Stabilite | Aktif mi |
|------|-----------|----------|
| Tocopherol (saf) | Düşük (oksidlenir) | Direkt aktif |
| Tocopheryl acetate | Yüksek (depolama dostu) | Cilt esterazlarınca açılır → aktif |
| Tocopheryl linoleate | Orta | Aktif + ek emolyent |

Saf tokoferolün ürün ömrü kısa olduğu için ester formları yaygındır. Aktivite biyodönüşüme bağlı (saf > ester).

## Etkili Konsantrasyon

- **%0.5-1:** günlük antioksidan (yaygın aralık)
- **%1-5:** anti-aging + UV adjuvan formülasyonlar
- **%5+:** yağlanma riski + ürün renginin sararması

## Kanıt

- **Lin et al. (2003):** %1 alpha-tocopherol + %15 askorbik asit, UVB sonrası eritem ve thymin dimer oluşumunu domuz cilt modelinde anlamlı azaltır (J Invest Dermatol)
- **Thiele et al. (2005):** topikal E vit. epidermal antioksidan rezervini 10× artırır (Mol Aspects Med)
- **Keen & Hassan (2016):** topikal tokoferol yara iyileşmesinde, dermatit yönetiminde rolü (Indian Dermatol Online J)

## Kullanım Tüyoları

- **Kombinasyon:** C vitaminiyle aynı serumda → sinerji. Retinolle gece, niasinamidle gündüz uyumlu.
- **Sıra:** serum aşaması (suya ek yağda çözünür antioksidan ihtiyacı)
- **Saklama:** ışık + ısıdan koruma (saf form). Ester formlar daha dayanıklı.

## Hassasiyet

Çok düşük; alerjik kontakt dermatit nadir (%1 patch test prevalans). Doğal kaynaklı tokoferol (soy, palm) bazlı ürünlerde alerji riski biraz daha yüksek.

## Kaynaklar

CIR (Tocopherol Final Report 2002), SCCS Opinion, Lin RCT, Thiele review.`,

  'glycolic-acid': `**Glycolic Acid (Glikolik Asit)**, alpha hidroksi asit (AHA) ailesinin en küçük moleküllüsü. Şeker kamışı kökenli ya da sentetik üretim. AHA'lar arasında en derin penetrasyona sahip.

## Mekanizma

- **Korneosit dezgomofilizasyonu:** üst tabakadaki ölü hücreleri tutan desmosom bağlarını çözer → eksfoliasyon
- **Kolajen sentezi:** dermal fibroblastları stimüle eder (Bernstein et al.)
- **Hyalüronik asit sentezi:** epidermisteki HA üretimini artırır → nemli ve dolgun cilt
- **Pigment azaltma:** keratinosit yenilenmesi hızlanır → leke + kahverengi pigment yumuşar

## Konsantrasyon Bantları

| Form | % | Kullanım |
|------|---|----------|
| Toner / cleanser | %2-5 | Her gece veya gece aşırı |
| Serum / krem (ev) | %5-10 | Geceleri, başlangıç haftada 2-3 |
| Profesyonel peeling | %20-70 | Klinik, 2-4 haftada bir |
| Medikal peeling | %70+ | Sadece dermatologda |

## pH Bağımlılığı

GA aktif formu pH 3-4 aralığında. pH 5+ formülasyonlar hafif eksfoliyant (yatıştırıcıya yakın). Etiketin **"free acid value"** veya pH bilgisi vermesi tercih edilir; sadece konsantrasyon yetersiz bilgidir.

## Kullanım Tüyoları

- **Sıklık:** başlangıç haftada 2 gece, tolerans gelişince her gece
- **Kombinasyon:** retinol ile **aynı gece kullanmayın** — tahriş eşiği aşılır. Alternatif: retinol bir gece, GA bir gece.
- **Güneş:** UV duyarlılığını **artırır** → SPF mutlak. AHA kullanımı sırasında güneş yanığı riski 7 gün boyunca yüksek.
- **Sıra:** temiz cilde, kremden önce (toner sonrası serum aşamasında)
- **AB regülasyonu:** Annex III'te bırakılan ürünler için kısıt var (genellikle %4 üstü kısıtlı)

## Kanıt

- **Bernstein et al. (2001):** %20 GA + %15 laktik asit, 6 ay, kollajen tip III artışı (Dermatol Surg)
- **Thueson et al. (1998):** %8 GA serum, 3 ay, fotodamage, ince çizgi, leke iyileşmesi (Plast Reconstr Surg)
- **Bernstein (2010):** AHA topikal kullanımının ışık duyarlılığını anlamlı artırdığı kanıtlandı

## Hassasiyet

- İlk kullanımlarda **stinging (batma)** + hafif kızarıklık yaygın
- Hassas / rosacea / atopik ciltte alternatif: laktik asit (PHA) veya mandelik asit
- Eksfoliyant + retinol + C vit + retinaldehit aynı gün → **tahriş kaskadı**

## Kaynaklar

SCCS Opinion (Glycolic Acid 2018), CIR Final Report, Bernstein RCT, EU Annex III.`,

  'centella-asiatica-leaf-extract': `**Centella Asiatica (Cica / Asya Pennywort)** Asyalı geleneksel tıpta yaralanma ve cilt iyileşmesi için yüzyıllardır kullanılan otsu bir bitkidir. Modern dermatolojide **bariyer onarımı + anti-enflamatuvar** aktif olarak öne çıktı.

## Aktif Bileşikler

- **Asiatikozit (asiaticoside):** triterpenoid saponin, kollajen sentezi tetikleyicisi
- **Madekassosid (madecassoside):** anti-enflamatuvar + antioksidan
- **Asiatik asit + madekassik asit:** triterpenoid asit formları

Bu bileşiklerin toplamı **TECA (Titre Estratto Centella Asiatica)** veya **CTFA** olarak standardize edilmiş özlerde belirlenir. Modern formüllerde "centellosides" toplamı %30-50 arası.

## Mekanizma

- **Kollajen tip I + III sentezi:** fibroblast modulasyonu → yara iyileşmesi + anti-aging
- **Anti-enflamatuvar:** TNF-α, NF-κB yolağını baskılar
- **Bariyer fonksiyonu:** TEWL azalır, atopik dermatit kuru cilt iyileşir
- **Mikrosirkülasyon:** kapiller geçirgenliği iyileştirir → kızarıklık azalır

## Etkili Konsantrasyon

- **Standart yaprak özü:** %1-5 (günlük formüller)
- **Madekassosid izole:** %0.1-0.2
- **Asiatikozit izole:** %0.5-2

## Kullanım Tüyoları

- **Endikasyonlar:** rosacea, post-prosedür kızarıklık, atopik dermatit, anti-aging
- **Sıra:** serum aşaması, retinol/AHA gibi tahriş edici aktiflerin **yatıştırıcısı** olarak kullanılabilir
- **Kombinasyon:** niasinamid + panthenol + ceramid ile rosacea için klasik kombo
- **Hamilelik:** topikal güvenli olarak değerlendirilir, ancak yüksek konsantre triterpenoid izolasyonlar (oral kullanımdaki kadar) için literatür sınırlı

## Kanıt

- **Bylka et al. (2013):** topikal TECA, 12 hafta, atopik dermatitte SCORAD anlamlı azalma (Postepy Dermatol Alergol)
- **Bonté et al. (1994):** %5 centella özü, kollajen sentezi 5× artış (Eur J Pharmacol)
- **Park (2021):** topikal madekassosid, UV-indüklenmiş eritemde anti-enflamatuvar etki (Skin Pharmacol Physiol)

## Hassasiyet

Çok düşük; nadir kontakt dermatit (%0.5-1 patch test). Hamilelikte topikal güvenli sınıflandırılır.

## Kaynaklar

CIR (Centella Asiatica Final Report 2014), Bylka 2013 RCT, Bonté in vitro, Park 2021.`,

  'panthenol': `**Panthenol (B5 Vitamini Provitamini / Pantenol)**, suda çözünür humektant + bariyer destekçi. Ciltte enzimle **pantothenik asite** (B5 vitamini) dönüşür. Saç bakımında film oluşturucu, ciltte hafif yatıştırıcı.

## Mekanizma

- **Humektant:** moleküler yapısında 4 OH grubu → su tutar
- **Bariyer destekçi:** epitelin lipid sentezini destekler, TEWL azalır
- **Anti-enflamatuvar:** sitokin (IL-6, IL-8) salınımı baskılar
- **Yara iyileşmesi:** keratinosit migrasyonu ve fibroblast proliferasyonu artar
- **Saç:** keratin lifine bağlanır, film + parlaklık + nemlilik

## Form Farkları

| Form | Cilt | Saç | Suda |
|------|------|-----|------|
| D-panthenol (alpha) | Aktif | Aktif | Yüksek |
| DL-panthenol (rasemik) | Yarı aktif | Aktif | Yüksek |
| Panthenyl ethyl ether | Yağda | Aktif | Düşük |

D-panthenol biyolojik aktif izomer; ürün etiketinde "D-panthenol" veya "Provitamin B5" yazılı olanlar tercih edilir.

## Etkili Konsantrasyon

- **%1-2:** günlük cilt formülasyonları (yatıştırıcı)
- **%2-5:** atopik dermatit + post-prosedür iyileşme + güneş yanığı sonrası
- **%5-10:** saç bakımında (klinik araştırmalarda)

## Kullanım Tüyoları

- **Endikasyonlar:** dermatit yatıştırma, retinol/AHA sonrası bariyer, post-laser iyileşme, kuru cilt nemlendirme
- **Kombinasyon:** allantoin + niasinamid + centella ile yatıştırıcı stack
- **Sıra:** serum veya krem
- **Bebek bakımında yaygın:** hassas + non-irritant profilden dolayı bezayağı kremi vb. ürünlerde

## Kanıt

- **Ebner et al. (2002):** %5 panthenol topikal, deneysel cilt tahrişinde TEWL ve eritem azalır (Am J Clin Dermatol)
- **Camargo et al. (2011):** atopik dermatit, %5 panthenol bariyer onarımı + kaşıntı azalması (Dermatitis)
- **Kapadia et al. (2013):** post-laser %5 panthenol günlük, iyileşme süresi anlamlı kısalır

## Hassasiyet

Çok düşük; B vitamini grubu, doğal cilt bileşeni. Nadir alerji prevalansı (%<1).

## Kaynaklar

CIR (Panthenol Final Report 2017), SCCS Opinion, Ebner RCT, Camargo RCT.`,

  'caffeine': `**Caffeine (Kafein)**, lipofilik metilksantin. Topikal kozmetikte özellikle **göz çevresi** + **selülit / drenaj** ürünlerinde kullanılır. Vazokonstriktör + antioksidan ikili rolü.

## Mekanizma

- **Vazokonstriksiyon:** adenozin reseptörlerini bloklar → kapiler daralır → göz altı şişlik (puffiness) ve morluk azalır
- **Lipoliz:** fosfodiesteraz enzimini inhibe eder → cAMP artar → yağ hücresinde lipoliz tetiklenir (selülit ürünlerinde rasyonel)
- **Antioksidan:** ROS (reaktif oksijen türleri) süpürür, polifenol benzeri etki
- **UV koruyucu (yardımcı):** UVB sonrası DNA hasarı azaltıcı (Conney 2003)

## Etkili Konsantrasyon

- **%0.1-3:** göz çevresi formülasyonları
- **%2-5:** selülit + vücut serumu
- **%5+:** stinging riski + sarı renk pigmentasyonu

## Kullanım Tüyoları

- **Endikasyonlar:** göz altı puffiness, dark circle (vasküler tip), saç (hafif anti-androjen etki), vücut firming
- **Kombinasyon:** peptit + niasinamid (göz çevresi), karnitin + teobromin (selülit ürünlerinde)
- **Sıra:** göz serumu — krem öncesi
- **Saklama:** suya çözündüğünde sarı tonlanma normal, etkinlik düşmez

## Kanıt

- **Conney et al. (2003):** topikal kafein, UV-indüklenmiş cilt tümör modelinde kemoprevantif (Mutat Res)
- **Vogelgesang et al. (2011):** %3 kafein göz serumu, 8 hafta, dark circle ve puffiness anlamlı azalma (J Cosmet Sci)
- **Herman & Herman (2013):** transdermal absorpsiyon ve sellulit etkililik review (Skin Res Technol)

## Hassasiyet

Çok düşük; oral kafeine alerjisi olanlarda topikal de tetikleyici **olabilir** ama nadir. Patch test prevalans %<1.

## Kaynaklar

CIR (Caffeine Final Report 2010), Conney UV review, Vogelgesang RCT, INCI Decoder.`,
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
