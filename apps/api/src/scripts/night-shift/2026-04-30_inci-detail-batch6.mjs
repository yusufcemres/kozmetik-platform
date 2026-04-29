// Faz 5 batch 6 — 5 INCI: aqua + dimethicone + propylene-glycol + parfum + camellia-sinensis
// Kontroversiyel (silikon, glikol, parfum) + popüler (yeşil çay) içerik

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'aqua': `**Aqua (Su / Water)**, kozmetik ürünlerinin **en temel solventi**. INCI etiketinin başında olması beklenir — formül su bazlıysa %50-90 oranında bulunur. Saf su değil, mutlaka **deiyonize / arıtılmış su** kullanılır.

## Neden Etiketin Başında?

INCI sıralaması **azalan ağırlık oranına göre** zorunludur. Su bazlı formüllerde aqua ilk sırada. **Yağ bazlı serumlarda** (örn. The Ordinary Squalane) aqua olmayabilir.

## Kalite Standartları

- **Deiyonize / arıtılmış (purified water):** Reverse osmoz + UV sterilizasyon
- **Mineralize (kaynak suyu):** mineraller etkin değer katar mı? — pazarlama iddialarına rağmen klinik kanıt sınırlı
- **Termal su (thermal spring):** Eucerin/La Roche-Posay tarzı, anti-enflamatuvar mineral içeriği
- **Çiçek suyu (hidrosol):** gül suyu, lavanta suyu, papatya suyu — bitki uçucu yağı eseri içerir

## Mekanizma

- **Solvent:** suda çözünür aktiflerin (niasinamid, hyaluronik asit, peptit) taşıyıcısı
- **Anlık nemlendirme:** yüzeysel hidrasyon (uçar, kalıcı değil)
- **Form yapıcı:** emülsiyon (yağ + su) için zorunlu
- **Cilt yüzey gerilimi:** yüzey aktiflerin etkisini moderne eder

## Etiket Okuma İpuçları

- **Aqua sırasında 1.:** klasik su bazlı emülsiyon
- **"Aqua/Water/Eau":** AB + ABD + Fransızca etiket çoklu dil zorunluluğu
- **Termal su (örn. La Roche-Posay Thermal Spring Water):** %15-30 oranında, marka iddiası destekçi
- **Çiçek suyu (örn. Rosa Damascena Flower Water):** ürün kategorisini "doğal" konumlandırır, etkisi sınırlı

## Yaygın Yanlış Kanılar

❌ **"Su daha düşük olmalı, az olsun":** su miktarı kaliteyi belirlemez. Aktif konsantrasyonu önemli.

❌ **"Termal su mucize":** termal su anti-enflamatuvar mineral içerir ama tek başına dramatik etki yapmaz. Formülasyondaki diğer aktiflerle birlikte değerlendirilmeli.

❌ **"Çiçek suyu = bitki özü":** hidrosol uçucu yağ eseri içerir, ama özellikle aroma terapötik etkidir. Aktif terapötik etki için **özüt (extract)** gerekir.

## Hassasiyet & Saflık

- **Endotoksin riski:** Bakteriyel safsızlık → büyük üreticilerde otomatize sterilizasyon, küçük üreticilerde test edilmezse risk
- **Mineral yükü:** sert su mineralleri formülasyon stabilitesini bozabilir → deiyonize tercih edilir
- **Klorin / florür:** musluk suyu kullanımı yasak (üretim standardı)

## Kaynaklar

ISO 22716 (cosmetic GMP), AB Cosmetic Regulation 1223/2009 Annex II — su kalite zorunlulukları.`,

  'dimethicone': `**Dimethicone (Dimetikon)**, en yaygın **silikon polimer**. "Silikon kötüdür" miti dermatoloji literatüründe çürütülmüştür — aslında en güvenli emolyent + film oluşturuculardan biri. Akneye yatkın, hassas, post-prosedür ciltte güvenle kullanılır.

## Mekanizma

- **Cilt yüzeyinde nefes-alır film:** korneositler arasında bağlanmaz, üst tabakada kalır
- **Bariyer destekçi (oklusiv):** TEWL azaltır, aktif kayıp kremlerde su tutar
- **Anti-friction:** cilt yüzey kayganlığı → makyaj uygulamasında "primer" etkisi
- **Ürün dağılım:** UV filtreleri + pigmentlerin uniform dağılımı
- **Saç:** uçların düzleşmesi, frizz azaltma, parlaklık

## "Silikon Kötü mü?" Mitleri

❌ **"Silikon poreyi tıkar"** → Yanlış. Dimethicone moleküler ağı **gözenekten büyük**, dolayısıyla içeri girip tıkayamaz. Komedojenik skoru **0/5** (kanıtlanmış).

❌ **"Silikon nefessizleştirir"** → Yanlış. Dimethicone film **gaz geçirgendir** — oksijen + karbondioksit + su buharı belli ölçüde geçer. Klinik bariyer disfonksiyonu gözlenmemiştir.

❌ **"Silikon birikir"** → Yanlış (cilt için). Yıkanan ürünlerde tamamen temizlenir. Saçta birikme olabilir ama bu kullanım metodolojisi sorunu — clarifying shampoo çözer.

❌ **"Silikon biyobozunur değil"** → Doğru ama topikal cilt kullanımı mikroplastik kategorisinde değil. AB **rinse-off mikroplastik yasağı** sadece partikül silikonlar (cyclopentasiloxane vb.) için, dimethicone dışında.

## Form Farkları

| Form | Yapı | Kullanım |
|------|------|----------|
| Dimethicone | Düz zincir polimer | Yüz krem, primer, saç serum |
| Cyclopentasiloxane (D5) | Halka | Daha hızlı uçar, hafif his — AB rinse-off yasaklı (kontrolversiyel mikroplastik) |
| Dimethiconol | Hidroksil sonlu | Daha kalıcı film, saç bakım |
| Phenyl Trimethicone | Aromatik halka | Parlatıcı, kuru saç |

## Etkili Konsantrasyon

- **%1-5:** günlük krem (bariyer destek)
- **%5-15:** primer + makyaj altı (yüksek pürüzsüzlük)
- **%15-30:** profesyonel cilt protezi, post-prosedür kapatma

## Kullanım Tüyoları

- **Endikasyonlar:** rosacea, hassas cilt, post-laser, post-IPL, makyaj altı primer, atopik bariyer
- **Sıra:** **rutinin son katı** (suya çözünür aktif → krem → silikon film → SPF)
- **Sıralama önemli:** suya çözünür aktif (niacinamide, HA, peptit) silikondan ÖNCE — sonra silikon "kapak" oluşturur
- **Saç:** uçlara 1-2 damla, kökleri kaçınılır
- **Hassas cilt:** %100 dimethicone (saf bariyer kremi) post-laser altın standart

## Kanıt

- **DiNardo (2005):** dimethicone non-comedogenic skor 0/5, akneye yatkın ciltte güvenli (Dermatol Surg)
- **Berardesca et al. (2008):** topikal dimethicone, irritan kontakt dermatit modelinde TEWL anlamlı azalma (Skin Pharmacol Physiol)
- **CIR (2003 ve 2018 update):** silikon polimerler güvenlik değerlendirmesi — kozmetik kullanımda risk yok
- **Nair et al. (2003):** dimethicone film gaz geçirgenliği belgelenmiş (J Cosmet Sci)

## Hassasiyet

Çok düşük; alerjik kontakt dermatit nadir (%<0.5 patch test). Hipoalerjenik kategoride. Bebek + atopik formülasyonlarda yaygın.

## Çevre

- **Cilt kullanımı:** mikroplastik kategorisinde değil
- **Yıkanma sonrası:** atık suya geçer, bazı formlar (D4, D5) çevresel persistence sergiler — AB rinse-off yasakları bu nedenle
- **Dimethicone (linear):** çevresel risk minimal

## Kaynaklar

CIR (Dimethicone Final Report 2003 + 2018 update), DiNardo komedojenik skor, AB Annex II/III silikon güncellemeleri, Berardesca RCT.`,

  'propylene-glycol': `**Propylene Glycol (Propilen Glikol, PG)**, sentetik küçük moleküllü **glikol türevi**. Humektant + solvent + penetrasyon enhancer. "Antifriz olduğu için zararlı" miti yıllarca dolaştı — gerçek dermatoloji literatüründe **güvenlik profili genel olarak iyidir**, ama hassas ciltte irritan olabilir.

## Etilen Glikol Karışıklığı (Kritik!)

İki farklı moleküldür:

| Molekül | Toksik mi? | Kullanım |
|---------|-----------|----------|
| **Ethylene glycol** | ✅ TOKSİK (otomotiv antifriz) | Endüstriyel — KOZMETİKTE YASAK |
| **Propylene glycol** | ❌ Güvenli (FDA "GRAS") | Kozmetik humektant + gıda katkısı E1520 |

> ⚠️ **Yanlış bilgi:** "Antifriz olduğu için zararlı" iddiası, etilen glikol ile karıştırmaktan kaynaklanır. PG aslında **propilen glikol antifrizi** (RV antifrizi) gıda-uyumlu olarak satılır, çünkü güvenlidir.

## Mekanizma

- **Humektant:** havadaki nemi cilde çeker (gliserin gibi ama daha küçük molekül)
- **Solvent:** suda + yağda çözünmez bazı aktifleri çözer (geniş çözünürlük)
- **Penetrasyon enhancer:** stratum corneum lipid yapısına geçici olarak girer → diğer aktiflerin emilimini artırır
- **Antimikrobiyal (zayıf):** %15+ konsantrasyonda bakteri büyümesini sınırlar (koruyucu booster)

## Etkili Konsantrasyon

- **%2-5:** günlük formülasyon (humektant)
- **%5-15:** ekstra nemlendirici + solvent
- **%15-30:** koruyucu sistem destekçi (paraben-free)
- **%50+:** profesyonel medikal (örn. peeling solvent)

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt, yağlı cilt nemlendirme (yağsız form), ürün stabilite
- **Hassas cilt:** %20+ konsantrasyonda **stinging** (batma) yaygın → kaçın
- **Atopik dermatit:** patch test pozitifliği %3-5 (American Contact Dermatitis Society "Allergen of the Year 2018") — bariyer hasarlı ciltte irritan
- **Bebek:** %5+ konsantrasyondan kaçın (sistemik penetrasyon konsiderasyonu)
- **Hamilelik:** topikal güvenli kabul edilir
- **Alternatif:** **butylene glycol** (daha az irritan), **pentylene glycol** (koruyucu booster), **propanediol** (bitkisel kaynaklı, daha pahalı)

## Yaygın Yanlış Kanılar

❌ **"PG = antifriz"** → etilen glikol antifrizidir, PG değil. Propilen glikol antifriz formu (RV/gıda) güvenlidir.

❌ **"PG zehirlidir"** → FDA "Generally Recognized As Safe" (GRAS) listesinde. Gıda katkısı E1520 olarak onaylı.

❌ **"PG dehidre eder"** → yanlış: humektanttır, suyu ÇEKER. Ancak çok yüksek konsantrasyonda + düşük rutubette **paradoksen kuruluk** mümkün.

## Kanıt

- **Funk & Maibach (1994):** PG patch test alerji prevalans, %3.8 (irritan + alerjik bileşke) (Contact Dermatitis)
- **Lessmann et al. (2005):** PG topikal kullanımı + kontakt dermatit review (Contact Dermatitis)
- **Final Report on Propylene Glycol (CIR 2012):** kozmetik kullanımda %50'ye kadar güvenli kabul
- **ACDS 2018 Allergen of the Year:** atopik dermatit popülasyonunda dikkat

## Hassasiyet

Orta; %2-5 patch test alerji prevalansı, atopik ciltte daha yüksek. Patch test pozitif kişiler için alternatifler:
- Butylene glycol (genel olarak iyi tolere)
- Pentylene glycol (humektant + koruyucu)
- Propanediol / 1,3-Propanediol (bitki bazlı, premium alternatif)

## Kaynaklar

CIR (Propylene Glycol Final Report 2012), ACDS Allergen of the Year 2018, FDA GRAS listesi, Lessmann patch test review.`,

  'parfum': `**Parfum (Fragrance, Aroma)**, kozmetik etiketlerinde **tek bir kelime altında 100+ farklı bileşen** anlamına gelir. AB regülasyonu fragrance bileşenlerini ayrıntılı listelemeye zorlamaz — bu yüzden **alerjen + irritan en büyük gizli kategori**.

## INCI Listesinde "Parfum" Ne Demek?

- **Kompoze parfüm:** sentetik + doğal aromatik bileşenlerin karışımı
- **AB regülasyon:** **26 listelenmiş alerjen** parfüm bileşeni etiketinde ayrı yazılmalı (linalool, limonene, citronellol, geraniol, citral, eugenol, vb.)
- **Bileşen sayısı:** tek bir parfüm formülasyonu **50-200 farklı moleküler bileşik** içerebilir
- **"Doğal" parfüm:** geleneksel olarak daha az alerjen — ama esansiyel yağlar da güçlü alerjen olabilir (oak moss, lavanta, çay ağacı)

## AB 26 Alerjen Listesi

Etiketin "Parfum" sonrasında ayrı listelenen alerjenler — örnek: linalool, limonene, citronellol, geraniol, citral, eugenol, hexyl cinnamal, isoeugenol, alpha-isomethyl ionone, hydroxycitronellal, butylphenyl methylpropional ("Lilial" — 2022 yasaklandı), evernia prunastri (oak moss), evernia furfuracea (tree moss).

> ⚠️ **Lilial (Butylphenyl Methylpropional)** AB Regulation 2022/692 ile yasaklandı (CMR 2 sınıflandırması). Eski ürün etiketlerinde hala görülebilir, satışı 2022 sonu itibarıyla durdu.

## Hassasiyet Profili

- **Kontakt dermatit prevalans:** %10 (genel popülasyon), atopik dermatit hastalarında %30+
- **Patch test:** "Fragrance Mix I + II" en yaygın pozitif testlerden
- **Rosacea + perioral dermatit + atopik dermatit:** parfümsüz ürün önerisi standart
- **Bebek ürünleri:** parfüm içermeyen seçenekler dermatolog konsensüsü

## "Fragrance-Free" vs "Unscented"

| Etiket | Anlam |
|--------|-------|
| **Fragrance-Free** | Hiç parfüm bileşeni içermez (en güvenli) |
| **Unscented** | Doğal hammaddeden kalan kokuyu maskelemek için **gizli parfüm bileşeni** içerebilir |
| **Hipoalerjenik** | Pazarlama terimi, AB'de regülasyon yok — şirket ölçütüne bağlı |
| **For Sensitive Skin** | Pazarlama terimi, parfümsüz olduğu garanti değil |

> ⚠️ **"Unscented"** etiketli ürünler **gizli maskeler** içerebilir — etikette parfum/fragrance kelimesini ara.

## Esansiyel Yağ Alternatifi mi?

Esansiyel yağlar (lavanta, çay ağacı, ylang-ylang) doğal olduğu için "güvenli" sanılır — ama:

- **Linalool, limonene, geraniol** doğal esansiyel yağ bileşenleridir → AB 26 alerjen listesinde
- **Çay ağacı yağı:** %20 patch test pozitif olabilir (yüksek konsantrasyonda)
- **Oak moss:** geleneksel parfüm bileşeni, **güçlü alerjen** — AB'de kısıt artıyor

Yani: "doğal" ≠ "güvenli". Esansiyel yağ kullanımı dikkatli olmalı.

## Hangi Cilt Profilinde Parfümsüz Şart?

✅ **Parfümsüz öner:**
- Atopik dermatit / aktif egzama
- Rosacea (özellikle papülopüstüler)
- Perioral dermatit
- Kontakt dermatit geçmişi
- Bebek (özellikle <12 ay)
- Hamilelikte hassasiyet artışı varsa
- Post-laser / post-prosedür
- Parfüm patch test pozitif

✅ **Parfümlü tolere edebilir:**
- Sağlam bariyer + non-atopik
- Yıkanan ürünlerde (cleanser, shampoo) — kalış süresi kısa

## Kanıt

- **Buckley et al. (2003):** parfüm kontakt dermatit epidemiyolojisi review (Contact Dermatitis)
- **Heisterberg et al. (2011):** Fragrance Mix patch test prevalans (Contact Dermatitis)
- **Salam & Fowler (2001):** "unscented" ürünlerde gizli parfüm tespit oranı (J Am Acad Dermatol)
- **AB Regulation 1223/2009 Annex III** — 26 alerjen listesi

## Pratik Tavsiyeler

- **Yeni ürün öncesi patch test:** kola iç tarafı, 24-48 saat
- **Ev parfümü ayrı tut:** kozmetik ürün ile parfüm-üstüne-parfüm birleşik alerjen yükünü artırır
- **Çocuk için:** bebek ürünlerinde **fragrance-free** standardı
- **Atopik aktif dönemde:** TÜM parfümlü ürünleri 2 hafta tatil → bariyer iyileşme

## Kaynaklar

CIR (Fragrance ingredients), AB Regulation 1223/2009 Annex III + 2022/692 (Lilial yasak), Buckley 2003 review, ACDS Fragrance Mix data.`,

  'camellia-sinensis-leaf-extract': `**Camellia Sinensis Leaf Extract (Yeşil Çay Özü)**, polifenol bakımından zengin bitki özü. Yeşil çayın oksidlenmemiş yapraklarından elde edilir. Dermatoloji literatüründe **antioksidan + foto-koruma + anti-aging** kategorisinde en çok çalışılmış bitkisel aktiflerden biri.

## Aktif Bileşikler

- **EGCG (Epigallocatechin Gallate):** ana polifenol, antioksidan etkinin %60+'ı
- **EGC, EC, ECG:** diğer kateşin türevleri
- **L-Theanine:** aminoasit, anti-stres
- **Kafein (eser):** vasküler etki
- **Tanen, flavonoid:** antioksidan + anti-enflamatuvar

EGCG konsantrasyonu kalite belirleyicisi — "standardize ekstrakt" %30-50 EGCG içerebilir.

## Mekanizma

- **Antioksidan:** UV-indüklenmiş ROS süpürür (E vit + C vit'ten daha güçlü in vitro)
- **Foto-koruma (yardımcı):** UV-indüklenmiş DNA hasarı + thymine dimer azaltır (Elmets 2001)
- **Anti-enflamatuvar:** NF-κB + COX-2 baskılar
- **Anti-bakteriyel (zayıf):** P. acnes (akne) üzerine ek katkı
- **MMP (matrix metalloproteinase) inhibisyonu:** kollajen yıkımı azaltır → anti-aging
- **Vasküler:** mikrosirkülasyon iyileşmesi (kafein + EGCG)

## Etkili Konsantrasyon

- **%0.5-2 standardize özüt:** günlük antioksidan
- **%2-5:** anti-aging serum + UV adjuvan
- **%5-10:** intensif tedavi formülasyonları

## Kullanım Tüyoları

- **Endikasyonlar:** akne (ek tedavi), rosacea, anti-aging, foto-koruma adjuvanı, post-prosedür antioksidan
- **Sıra:** serum aşaması (suda çözünür)
- **Kombinasyon:** C vit + E vit + EGCG = antioksidan trifecta. Niasinamid ile uyumlu.
- **Saklama:** ışık + ısıdan koruma → renk kararsızlığı (sarımsı tonlanma normal, ama koyu kahveye dönüş aktivite kaybı)
- **SPF değil, adjuvan:** UV korunma için tek başına yetmez, SPF ile birlikte UV koruma toplam etki +%30-40

## Kanıt

- **Elmets et al. (2001):** topikal yeşil çay polifenolleri, UV-indüklenmiş eritem + thymine dimer anlamlı azaltma (J Am Acad Dermatol)
- **Hsu (2005):** EGCG anti-aging mekanizma + topikal kanıt review (J Am Acad Dermatol)
- **Yoon et al. (2007):** %10 yeşil çay özü serumu, 8 hafta, fotodamage skorunda anlamlı iyileşme RCT (J Drugs Dermatol)
- **Saliou et al. (2001):** topikal EGCG, sebum + akne azaltma (Methods Enzymol)
- **Katiyar et al. (2007):** yeşil çay polifenolleri kemoprevantif rol UV indüksiyon (Cancer Res)

## Hassasiyet

Çok düşük; tannin içeriği nedeniyle bazı kişilerde hafif kuruluk olabilir. Patch test prevalansı %<1.

## Kafein Eseri Etkisi

Yeşil çay özü doğal olarak **eser miktar kafein** içerir (%0.5-3 oranında). Göz altı puffiness için ek mikrosirkülasyon katkısı sağlar — bu nedenle göz çevresi formülasyonlarında popüler.

## Kaynaklar

CIR (Camellia Sinensis Leaf Extract Final Report 2014), Elmets RCT, Hsu review, Yoon RCT, Katiyar UV review.`,
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
