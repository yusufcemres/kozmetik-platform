// Faz 5 batch 10 — kalan 8 partial INCI tam'a çekme
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DETAILS = {
  'bht': `**BHT (Butylated Hydroxytoluene)**, sentetik antioksidan + koruyucu booster. Kozmetikte ve gıda sanayinde 1970'lerden beri yaygın kullanılır. Lipid peroksidasyonunu engeller — kremlerin oksidlenmesini ve renk değişimini geciktirir.

## Mekanizma

- **Lipid peroksidasyon inhibitörü:** serbest radikalleri yakalar
- **Formülasyon koruyucu:** ürünün raf ömrünü uzatır
- **Aktif madde stabilize edici:** retinol + C vit + esansiyel yağların oksidlenmesini geciktirir
- **Sinerji:** tokoferol (E vit) ile birlikte daha güçlü etki

## Etkili Konsantrasyon

- **%0.01-0.1:** günlük formülasyon (etiketin son 5-10 maddesi arasında)
- **%0.1-0.5:** koruyucu sistem destekçi
- **AB Annex'te kısıt yok** ama **çevresel persistence** nedeniyle modern formüller alternatife geçiyor

## Yaygın Yanlış Kanı

❌ **"BHT kanserojen"** → Tartışmalı. Yüksek doz hayvan çalışmalarında karaciğer tümörü gözlendi (Williams 1993), ama topikal kozmetik konsantrasyonda **insan klinik kanıt yok**. CIR (2002) topikal kullanımda güvenli. SCCS hala onaylı.

❌ **"BHT endokrin bozucu"** → Düşük endişe. Bazı in vitro çalışmalar zayıf östrojenik etki gösterdi, ama topikal seviyede klinik anlam yok.

## Alternatifler

- **Tocopherol (E vit):** doğal antioksidan
- **Mixed tocopherols:** E vit varyant kombinasyonu
- **Rosemary extract:** doğal antioksidan
- **Ascorbyl palmitate:** lipofilik C vit
- **Hydroxyacetophenone:** sentetik antioksidan + koruyucu booster

## Kullanım Tüyoları

- **Endikasyonlar:** ürün stabilite (kullanıcı bilinçli ihtiyaç değil)
- **Sıra:** formülasyon yardımcı, kullanıcı için ayrı uygulama yok
- **Kombinasyon:** tokoferol + BHT klasik antioksidan ikilisi
- **Hassas cilt:** patch test alerji nadir

## Kanıt

- **CIR (BHT Final Report 2002):** topikal kozmetik kullanımda güvenli
- **Williams GM et al. (1993):** yüksek doz hayvan modelinde karaciğer etkileri (Toxicol Appl Pharmacol)
- **Lanigan & Yamarik (2002):** kozmetik güvenlik güncellemesi (Int J Toxicol)

## Hassasiyet

Düşük; kontakt dermatit prevalansı %<1. Patch test'te alerji nadir.

## Çevre

BHT atık suya geçer + biyobozunur değil → modern "clean beauty" formüllerinde azalmakta. Tokoferol veya rosmarinic acid alternatifi eko-sürdürülebilir.

## Kaynaklar

CIR (BHT Final Report 2002), Lanigan & Yamarik 2002 review, AB Cosmetic Regulation Annex IV (renksiz).`,

  'carbomer': `**Carbomer**, sentetik **akrilik asit polimer** ailesi. Kozmetikte **viskozite ayarlayıcı + jel yapıcı + emülsiyon stabilizör**. "Carbopol" ticari ismiyle de bilinir.

## Mekanizma

- **pH-bağımlı şişme:** asidik formda toplu, alkali ile nötralize olunca hidrofilik şişer
- **Jel yapısı:** suya yüzdüğünde 3D ağ oluşturur → şeffaf jel
- **Emülsiyon stabilize:** yağ + su kombinasyonunda fazları birarada tutar
- **Süspansiyon:** pigment + mikropartikül dağılımında

## Carbomer Formları

| Tip | Özellik | Kullanım |
|-----|---------|----------|
| **Carbomer 940/980** | Yüksek viskozite | Saç jeli, krem |
| **Carbomer 934** | Orta viskozite | Yüz krem |
| **Carbomer Crosspolymer** | Daha şeffaf | Premium serum |
| **Acrylates/C10-30 Alkyl Acrylate Crosspolymer** | Yağ-uyumlu | W/O emülsiyon |

## Etkili Konsantrasyon

- **%0.1-1:** günlük formülasyon (jel yapısı için yeterli)
- **%1-3:** kalın krem yapı
- **AB Annex'te kısıt yok**

## Aktivasyon Şartı

Carbomer **nötralize edilmeden çalışmaz**:
- Saf carbomer + su = bulanık dispersiyon
- + NaOH veya Triethanolamine veya Aminomethyl Propanol → şeffaf jel
- pH 5-7 aralığında optimal

## Kullanım Tüyoları

- **Endikasyonlar:** jel formülasyon, krem viskozitesi (kullanıcı için ayrı uygulama yok)
- **Sıra:** formülasyon yardımcı
- **Hassas cilt:** kontakt dermatit nadir
- **Hamilelik:** topikal güvenli

## Kanıt

- **CIR (Carbomer Final Report 2018):** kozmetik kullanımda güvenli
- **Lanigan & Wenninger (2003):** carbomer + crosspolymer güvenlik (Int J Toxicol)

## Hassasiyet

Çok düşük; nadir kontakt dermatit (%<0.5). Hipoalerjenik kategori. Bebek + atopik formülasyonlarda yaygın.

## Çevre

Carbomer biyobozunur değil ama **mikroplastik kategorisinde de değil** — büyük molekül ağırlıklı çapraz-bağlı polimer, suya çözülmez. AB rinse-off kısıtları **yok**.

## Kaynaklar

CIR (Carbomer Final Report 2018), Lanigan 2003 review, INCI Decoder.`,

  'ethylhexylglycerin': `**Ethylhexylglycerin (Etilheksilgliserin)**, gliserol türevi sentetik **koruyucu booster + humektant**. Phenoxyethanol gibi koruyucularla **sinerjik** çalışır — ana koruyucunun etkinliğini artırır, daha düşük dozda kullanım sağlar.

## Mekanizma

- **Koruyucu booster:** mikrobiyal yüzey gerilimini bozar → koruyucu etkinliği artar
- **Humektant (zayıf):** OH grubu nemlendirici katkı
- **Yumuşatıcı:** stratum corneum yumuşatıcı eşlik
- **Deodorant etki (zayıf):** koltuk altı + ayak deodorantlarında yan katkı

## Konsantrasyon

- **%0.3-1:** günlük formülasyon (booster olarak)
- **%1-2:** deodorant katkı
- **AB Annex'te kısıt yok**

## Klasik Kombinasyon

- **Phenoxyethanol + Ethylhexylglycerin:** "EHG sistemi" — paraben-free formüllerin altın standardı
- Ana koruyucuyu **%50-70 azaltır**, hassas cilt için ideal
- Bebek + atopik dermatit formüllerinde yaygın

## Yaygın Yanlış Kanı

❌ **"Sentetik = kötü"** → EHG, doğal gliserolün dallı zincir türevidir. Yapısal olarak güvenli, klinik kanıt geniş.

## Kullanım Tüyoları

- **Endikasyonlar:** geniş — yüz krem, serum, cleanser, baby wipes, deodorant
- **Sıra:** formülasyon yardımcı (kullanıcı için ayrı uygulama yok)
- **Hassas cilt:** **çok iyi tolere edilir**, paraben-free + EHG kombinasyonu hassas cilde önerilir
- **Hamilelik:** topikal güvenli
- **Bebek:** pediatrik formülasyonlarda yaygın

## Kanıt

- **CIR (Ethylhexylglycerin Final Report 2013):** kozmetik kullanımda %5'e kadar güvenli
- **Lubbe et al. (2002):** EHG + phenoxyethanol koruyucu sinerji (Int J Cosmet Sci)
- **Beilfuss et al. (2008):** alternatif koruyucu sistem review (SOFW Journal)

## Hassasiyet

Çok düşük; kontakt dermatit prevalansı %<0.5. Hipoalerjenik. Bebek + atopik dermatit popülasyonunda güvenli.

## Kaynaklar

CIR (Ethylhexylglycerin Final Report 2013), Lubbe sinerji çalışması, INCI Decoder.`,

  'xanthan-gum': `**Xanthan Gum (Ksantan Gam)**, *Xanthomonas campestris* bakterisinin ferment ettiği **doğal polisakarit**. Kozmetik + gıda sanayinde **kıvamlandırıcı + emülsiyon stabilizör**. Vegan + doğal kaynak.

## Mekanizma

- **Polisakarit kıvamlandırıcı:** suya çözüldüğünde yüksek viskoziteli jel yapısı
- **Pseudoplastik:** durağanken kalın, kayma ile incelir → uygulamada kayan ürün hissi
- **Emülsiyon stabilizör:** yağ + su fazlarını birarada tutar
- **Süspansiyon yapıcı:** mikropartikül + pigment uniform dağılım

## Etkili Konsantrasyon

- **%0.1-0.5:** günlük formülasyon (kıvam için yeterli)
- **%0.5-1:** kalın jel yapı
- **AB Annex'te kısıt yok**

## Carbomer vs Xanthan Karşılaştırması

| Özellik | Carbomer | Xanthan Gum |
|---------|----------|-------------|
| Kaynak | Sentetik | Doğal (bakteriyel ferment) |
| Şeffaflık | Yüksek (jel) | Bulanık (krem) |
| pH bağımlılığı | Yüksek (5-7 optimal) | Düşük (3-9 stabil) |
| Vegan | Evet | Evet |
| Eko-sertifika | Hayır | Cosmos onaylı |
| Maliyet | Düşük | Orta |

> **Doğal/clean beauty formüllerde xanthan tercih** — Cosmos sertifikası uyumlu.

## Kullanım Tüyoları

- **Endikasyonlar:** krem + jel kıvamı (kullanıcı için ayrı uygulama yok)
- **Sıra:** formülasyon yardımcı
- **Cosmos Organic onaylı:** doğal kıvamlandırıcı
- **Hamilelik:** topikal güvenli
- **Bebek:** pediatrik formülasyonlarda yaygın

## Kanıt

- **CIR (Xanthan Gum Final Report 2010):** kozmetik kullanımda güvenli
- **EFSA E415:** gıda + kozmetik ortak güvenlik (Avrupa Gıda Güvenlik)
- **FDA GRAS:** Generally Recognized As Safe listesi

## Hassasiyet

Çok düşük; kontakt dermatit nadir. Bakteriyel ferment ürünü olduğu için bazı kişilerde hafif hassasiyet — ama %<0.5 prevalans.

## Çevre

**Tamamen biyobozunur**, ekosistem-uyumlu. Mikroplastik değil. Cosmos + Ecocert sertifikalı.

## Kaynaklar

CIR (Xanthan Gum Final Report 2010), EFSA Scientific Opinion (E415), FDA GRAS.`,

  'pentylene-glycol': `**Pentylene Glycol (Pentilen Glikol)**, küçük moleküllü **glikol türevi** — şeker pancarı veya mısır kökenli olarak da elde edilebilir. Humektant + koruyucu booster + solvent ikili rolü ile öne çıkar.

## Propylene/Butylene/Pentylene Glikol Karşılaştırması

| Özellik | PG (C3) | BG (C4) | Pentylene (C5) |
|---------|---------|---------|----------------|
| Patch test alerji | %2-5 | %<1 | %<0.5 |
| Stinging eşiği | %15+ | %30+ | %50+ |
| Antimikrobiyal etki | Zayıf | Zayıf | **Orta** |
| Maliyet | Düşük | Orta | Yüksek |
| Doğal kaynak alternatifi | Var | Var | **Şeker pancarı, mısır** |

> Pentilen glikol **en hassas** + **en doğal-uyumlu** glikol — premium "clean beauty" formüllerinde tercih.

## Mekanizma

- **Humektant:** havadaki nemi cilde çeker
- **Solvent:** suda + yağda çözünmez aktiflerin çözücüsü
- **Antimikrobiyal:** %2+ konsantrasyonda mikrobiyal büyümeyi sınırlar (koruyucu booster)
- **Penetrasyon enhancer (hafif):** stratum corneum lipid yapısına geçici geçiş

## Etkili Konsantrasyon

- **%2-5:** humektant
- **%5-10:** koruyucu booster (paraben-free formül)
- **%10-15:** ana koruyucu (1,2-hexanediol ile sinerji)

## Klasik Kombinasyon

- **Pentylene Glycol + 1,2-Hexanediol:** premium paraben-free koruyucu sistem
- **+ Caprylhydroxamic Acid:** Cosmos onaylı tam doğal sistem

## Kullanım Tüyoları

- **Endikasyonlar:** geniş — yüz krem, serum, cleanser, baby wipes
- **Sıra:** formülasyon yardımcı
- **Hassas cilt:** **PG'ye alerjisi olanlar için ideal alternatif**
- **Hamilelik:** topikal güvenli
- **Bebek:** pediatrik formülasyonlarda güvenli

## Kanıt

- **CIR (Pentylene Glycol Final Report 2014):** kozmetik kullanımda güvenli
- **Beilfuss et al. (2008):** alternatif koruyucu sistem review (SOFW Journal)
- **Hara & Kobayashi (2005):** pentilen glikol antimikrobiyal etki çalışması

## Hassasiyet

Çok düşük; kontakt dermatit nadir (%<0.5). Hipoalerjenik. PG (Propylene Glycol) alerjisi olan hastalar için **birinci tercih alternatif**.

## Kaynaklar

CIR (Pentylene Glycol Final Report 2014), Beilfuss alternatif koruyucu, INCI Decoder.`,

  'caprylhydroxamic-acid': `**Caprylhydroxamic Acid (Kaprilhidroksamik Asit)**, 8-karbonlu **hidroksamik asit türevi**. Kozmetikte **şelat ajan + koruyucu booster** olarak premium "clean beauty" sistemlerinin temel taşı. Cosmos + Ecocert onaylı doğal alternatif.

## Mekanizma

- **Şelat ajanı:** formülasyondaki demir + bakır + kalsiyum metal iyonlarını bağlar
- **Mikrobiyal etki:** metal iyonlarına bağımlı bakteri/maya büyümesini engeller
- **Koruyucu sinerji:** glikol bazlı sistemlerle çalışınca koruma 3-5× artar
- **EDTA alternatifi:** biyobozunur, eko-sürdürülebilir

## Etkili Konsantrasyon

- **%0.1-0.5:** günlük formülasyon
- **%0.5-1:** koruyucu sistem destekçi
- **AB Annex'te kısıt yok**

## Klasik Kombinasyon (Cosmos Onaylı)

- **Caprylhydroxamic Acid + Caprylyl Glycol + Glycerin:** "Spectrastat" benzeri tam doğal koruyucu sistem
- Ana koruyucu yok, sadece booster + glikol kombinasyonu yeterli
- Atopik dermatit + bebek formülasyonlarında ideal

## EDTA vs Caprylhydroxamic Acid

| Özellik | EDTA | CHA |
|---------|------|-----|
| Şelat gücü | Çok yüksek | Yüksek |
| Biyobozunur | Hayır | **Evet** |
| Çevre | Persistent | Eko-uyumlu |
| Cosmos onayı | Hayır | **Evet** |
| Maliyet | Düşük | Orta |

## Kullanım Tüyoları

- **Endikasyonlar:** premium yüz serum, hassas cilt formül, bebek + atopik
- **Sıra:** formülasyon yardımcı (kullanıcı için ayrı uygulama yok)
- **Hassas cilt:** **çok iyi tolere edilir**, paraben-free + parfümsüz formüllerde tercih
- **Hamilelik:** topikal güvenli

## Kanıt

- **CIR (Caprylhydroxamic Acid Final Report 2017):** kozmetik kullanımda güvenli
- **Krochmal & Krochmal (2010):** hidroksamik asit kozmetik koruyucu rolü (Cosmet Toilet)
- **Cosmos Organic Standard:** sertifikalı doğal şelat

## Hassasiyet

Çok düşük; kontakt dermatit nadir (%<0.5). Hipoalerjenik. Bebek + atopik formülasyonlarda standart.

## Kaynaklar

CIR (Caprylhydroxamic Acid Final Report 2017), Krochmal review, Cosmos Organic Standard.`,

  'isopropyl-myristate': `**Isopropyl Myristate (İzopropil Miristat)**, miristik asit + izopropil alkol esteri. Hafif emolyent + penetrasyon enhancer + ürün dağılım yardımcı. "Hafif yağlı his" verir, hızla emer.

## Mekanizma

- **Emolyent:** stratum corneum yumuşatma
- **Yağlı his hafifletici:** kremlerde yağlı his azaltma
- **Penetrasyon enhancer:** lipofilik aktif maddelerin emilimini artırır
- **Çözücü:** yağda çözünür aktiflerin (E vit, retinol) dağılımı

## Etkili Konsantrasyon

- **%2-10:** günlük krem
- **%10-30:** vücut yağı / makyaj temizleme yağı
- **AB Annex'te kısıt yok**

## Komedojenik Skor

**3-4/5 (orta-yüksek)** — akneye yatkın ciltte **kaçınılmalı** veya düşük konsantrasyon (DiNardo 2005).

## Yağ Karşılaştırması

| Yağ | Komedojenik | Hızlı Emen | Premium |
|-----|-------------|------------|---------|
| Squalane | 0/5 | Evet | Evet |
| Jojoba Oil | 0/5 | Evet | Evet |
| Caprylic/Capric Triglyceride | 1/5 | Evet | Evet |
| **Isopropyl Myristate** | **3-4/5** | Evet | Hayır |
| Coconut Oil (saf) | 4/5 | Hayır | Hayır |

> Akneye yatkın için squalane veya jojoba tercih edilir.

## Kullanım Tüyoları

- **Endikasyonlar:** kuru cilt, makyaj temizleme yağı (rinse-off), saç bakım
- **Akne:** **kaçın** — komedojenik
- **Sıra:** krem aşaması (yağ bazlı)
- **Hamilelik:** topikal güvenli
- **Saç:** uçlara 1-2 damla, frizz azaltma

## Kanıt

- **CIR (Isopropyl Myristate Final Report 2010):** kozmetik kullanımda güvenli
- **DiNardo (2005):** komedojenik skor sınıflandırması (Dermatol Surg)
- **Loden (1997):** ester emolyent kategorisi review (J Soc Cosmet Chem)

## Hassasiyet

Düşük; kontakt dermatit nadir. Akneye yatkın ciltte komedojenik etki birincil endişe.

## Kaynaklar

CIR (Isopropyl Myristate Final Report 2010), DiNardo komedojenik 2005, Loden review.`,

  'aloe-barbadensis-leaf-juice': `**Aloe Barbadensis Leaf Juice (Aloe Vera Özü)**, *Aloe barbadensis* (= Aloe vera) yaprağının iç jelinden elde edilen bitki özü. Geleneksel tıpta yara iyileşmesi + yanık tedavisi için yüzlerce yıldır kullanılır. Modern dermatolojide **anti-enflamatuvar + nemlendirici + bariyer destekçi** kategorisi.

## Aktif Bileşikler

- **Polisakaritler (acemannan):** ana aktif, anti-enflamatuvar + nem retansiyonu
- **Aloin (antrakinon):** keratolitik, ama yüksek doz toksik (modern özütlerde uzaklaştırılır)
- **C, E, B12 vitaminleri:** antioksidan + cilt-koşullandırıcı
- **Aminoasitler (20+):** humektant
- **Salisilik asit (eser):** hafif keratolitik

## Mekanizma

- **Anti-enflamatuvar:** PGE2 + bradikinin baskılar (Hayes 1971)
- **Yara iyileşmesi:** keratinosit migrasyonu + fibroblast proliferasyon
- **Nemlendirici:** acemannan polisakarit suya bağlanma
- **Anti-bakteriyel (zayıf):** S. aureus + P. acnes üzerine ek katkı
- **Antioksidan:** C + E vitamini içeriği

## Etkili Konsantrasyon

- **%5-20:** günlük formülasyon (yatıştırıcı)
- **%20-50:** post-yanık + post-prosedür intensif tedavi
- **%99 saf jel:** Aloe Vera 99% bitki ürünleri (eczane satışı)

## Form Farkları

| Form | Aktif İçerik | Kullanım |
|------|--------------|----------|
| Saf yaprak jeli | %99+ aktif | Yanık + yara |
| Aloe vera özütü | Standardize | Kremler |
| Aloin-free özütü | Aloin uzaklaştırılmış | Bebek formülasyonları |
| Aloe vera tozu | Konsantre | Maske + serum baz |

## Kullanım Tüyoları

- **Endikasyonlar:** güneş yanığı, post-laser, atopik dermatit, post-prosedür yatıştırma, retinol/AHA toleransı
- **Sıra:** serum + krem aşaması
- **Kombinasyon:** centella + niacinamid + aloe = "soothing trio"
- **Hamilelik:** topikal güvenli
- **Bebek:** aloin-free formülasyon güvenli

## Kanıt

- **Maenthaisong et al. (2007):** topikal aloe vera yanık iyileşmesi sistematik review (Burns)
- **Surjushe et al. (2008):** aloe vera kozmetik + medikal review (Indian J Dermatol)
- **Hayes (1971):** acemannan polisakarit anti-enflamatuvar mekanizma
- **CIR (Aloe Barbadensis Final Report 2007):** kozmetik kullanımda güvenli

## Hassasiyet

Düşük; nadir kontakt dermatit. Aloe ailesi alerjisi olanlarda %1-3 patch test pozitif. Aloin içeren ham özütler topikal kullanımda hafif iritasyon olabilir — modern aloin-free özütler güvenli.

## Saf Aloe Jel Markaları (Türkiye)

- Eczane: Aloe Vera %99 jel (Vichy, La Roche-Posay)
- K-beauty: Nature Republic, Holika Holika
- Yerel: Procsin, doğal kozmetik markaları

## Kaynaklar

CIR (Aloe Barbadensis Final Report 2007), Maenthaisong sistematik review, Surjushe review (Indian J Dermatol).`,
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
  }
}

console.log(`\nToplam: ${updated}/${Object.keys(DETAILS).length}`);

const cov = await c.query(`SELECT COUNT(*) FROM ingredients WHERE LENGTH(detailed_description) >= 1500`);
console.log(`Toplam full INCI detail: ${cov.rows[0].count}`);

await c.end();
