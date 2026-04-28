/**
 * Faz 3 — Need (24 ihtiyaç) FAQ + skin_type_affinity + interaction_warnings + confused_with seed.
 * Hardcoded TR içerik — her ihtiyaç için 3 FAQ, 5 cilt tipi affinity, 1-3 etkileşim, 1-2 karışan.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Skin type affinity skala: 0-100 (cilt tipi için ihtiyaç ne kadar relevan)
// Cilt tipleri: dry, oily, combination, sensitive, normal

const NEED_SEED = {
  'sivilce-akne': {
    faq: [
      { q: 'Sivilceyi tetikleyen başlıca bileşenler hangileri?', a: 'Komedojen yağlar (mineral oil, izopropil miristat), bazı silikonlar tıkanmaya yol açabilir. Yüksek konsantrasyonda alkol denat., aşırı eksfolyantlar tahrişe ve reaktif sivilceye sebep olur. Etiketinde "non-comedogenic" yazsa bile bireysel hassasiyet farklı olabilir.' },
      { q: 'Salisilik asit (BHA) günde kaç defa kullanılır?', a: 'Günde 1 kere yeterlidir, tercihen akşam. %1-2 konsantrasyonu genel kullanım. Hassasiyet varsa ilk 2 hafta gün aşırı başla, deri toleransına göre artır. SPF zorunlu; salisilik asit fotosensiviteyi artırabilir.' },
      { q: 'Niasinamid ve C vitamini birlikte kullanılır mı?', a: 'Evet, modern formülasyonlar ikisini birlikte güvenle kullanır. Eski "ikisi nötrleşir" iddiası saf askorbik asit + saf niasinamid karışımı için geçerliydi; ürün formülasyonlarında stabilize formlar bu sorunu yaşamaz. AM (sabah) C vitamini, PM (akşam) niasinamid pratik bir kombin.' },
    ],
    skin_type_affinity: { dry: 30, oily: 95, combination: 80, sensitive: 60, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Salisilik Asit', ingredient_b: 'Retinol', warning: 'Aynı gece kullanılırsa tahriş riski yüksek — gün aşırı dönüşümlü ya da AM-PM ayrı.' },
      { ingredient_a: 'Benzoyl Peroxide', ingredient_b: 'Retinol', warning: 'BPO retinolü oksitleyip etkisini düşürür. Sabah BPO, akşam retinol ayrı kullan.' },
    ],
    confused_with: [
      { name: 'Akne izi', difference: 'Akne aktif iltihaplı süreç; iz yara sonrası kalan koyuluk veya çukur. İz için niasinamide + retinoid + SPF, akne için salisilik + benzoyl peroxide.' },
    ],
  },
  'leke-hiperpigmentasyon': {
    faq: [
      { q: 'Lekeler ne kadar sürede açılır?', a: 'Yüzeysel epidermal lekeler 4-8 hafta. Dermal/melasma 3-6 ay, bazen daha uzun. C vitamini, niasinamid, alpha-arbutin, traneksamik asit ve retinoid kombinasyonu en etkili. SPF 50+ olmadan hiçbir lekemarama protokolü çalışmaz.' },
      { q: 'C vitamini hangi formu en etkili?', a: 'L-askorbik asit %10-20 altın standart ama oksitlenmesi hızlı. Ester-C, MAP (Magnesium Ascorbyl Phosphate), Tetrahexyldecyl Ascorbate (THD) daha stabil. Pakette koyu cam + airless pump şart.' },
      { q: 'Hidrokinon Türkiye\'de yasal mı?', a: 'Reçetesiz satışı yasak (SCCS rehberi). Dermatologumuz reçete edebilir (genelde %2-4). Yan etki riski yüksek (ochronosis, beyazlatma); yerine alpha-arbutin, traneksamik asit, kojik asit gibi alternatifler tercih edilir.' },
    ],
    skin_type_affinity: { dry: 70, oily: 70, combination: 75, sensitive: 60, normal: 75 },
    interaction_warnings: [
      { ingredient_a: 'L-Askorbik Asit', ingredient_b: 'Niacinamide', warning: 'Saf formlar pH çakışması yaşayabilir — ürün formülasyonu stabilizeyse sorun yok. Sıralı kullanmak en güvenli.' },
      { ingredient_a: 'Retinol', ingredient_b: 'AHA/BHA', warning: 'Aynı gece kullanma — bariyer hasarı + iritasyon. Dönüşümlü kullan.' },
    ],
    confused_with: [
      { name: 'Akne izi', difference: 'Akne sonrası post-inflamatuar hiperpigmentasyon (PIH) ile melasma/güneş lekesi farklı kaynaklı. PIH 3-6 ay kendiliğinden açılır; melasma kronik.' },
    ],
  },
  'kirisiklik-yaslanma': {
    faq: [
      { q: 'Retinol ne zaman başlanır?', a: '25 yaş üstü kanıt-temelli antiaging başlangıç noktası. %0.1-0.3 retinol veya %0.025 retinaldehit ile başla, gün aşırı kullan, 4 hafta sonra her gün. Tahriş varsa "sandwich" tekniği (nemlendirici-retinol-nemlendirici).' },
      { q: 'Peptidler retinol kadar etkili mi?', a: 'Hayır, ama tamamlayıcı. Retinol/retinaldehit klinik düzeyde kollajen sentezi kanıtlı tek molekül grubu. Peptidler (Matrixyl, Argireline) destek; tek başına yeterli değil. Hassas ciltler için retinol alternatifi: bakuchiol.' },
      { q: 'Kollajen takviyesi cilt için işe yarar mı?', a: 'Hidrolize kolajen peptidlerinin (10g/gün, en az 8 hafta) cilt elastikiyeti ve nemini artırdığı meta-analizlerle kanıtlandı. Topical kolajen daha az etkili — molekül büyük, deriye geçemez. Oral peptid daha güvenilir.' },
    ],
    skin_type_affinity: { dry: 90, oily: 70, combination: 80, sensitive: 60, normal: 85 },
    interaction_warnings: [
      { ingredient_a: 'Retinol', ingredient_b: 'Vitamin C', warning: 'Aynı zaman penceresinde değil — sabah C vitamini, akşam retinol.' },
    ],
    confused_with: [
      { name: 'Mimik çizgileri', difference: 'Statik kırışık (kalıcı) ile dinamik kırışık (yüz ifadesi) farklı. Dinamik için botoks/peptid, statik için retinoid + nemlendirici.' },
    ],
  },
  'kuruluk-dehidrasyon': {
    faq: [
      { q: 'Kuru cilt mi dehidre cilt mi?', a: 'Kuru cilt = yağ eksikliği (kalıcı tip), dehidre cilt = su eksikliği (geçici durum). Kuru cilt yağ bazlı (kerasin, şea, lanolin); dehidrasyon HA, gliserin, sodium PCA gibi humektanlarla çözülür.' },
      { q: 'Hyaluronik asit nemli ortamda nasıl kullanılır?', a: 'HA havadan nem çeker. Çok kuru/düşük nemli ortamda (klima, kalorifer) tek başına HA kullanmak cildin nemini buharlaştırarak ters etki yapabilir. Üzerine occlusive (squalene, shea butter) ile kilitle.' },
      { q: 'Yüz yağı tipi nasıl seçilir?', a: 'Kuru cilde nemlendirici desteği için: rosehip, marula, jojoba (sebum benzeri). Squalene tüm cilt tiplerinde uygun. Hindistan cevizi yağı yüzde komedojen — saçta tercih.' },
    ],
    skin_type_affinity: { dry: 100, oily: 30, combination: 60, sensitive: 80, normal: 65 },
    interaction_warnings: [],
    confused_with: [
      { name: 'Bariyer hasarı', difference: 'Kuruluk ürünle çözülür; bariyer hasarı (kızarıklık + reaktivite) ceramide + niasinamid ile cilt yenilenir.' },
    ],
  },
  'bariyer-destegi': {
    faq: [
      { q: 'Bariyer hasarı belirtileri neler?', a: 'Yanma, kızarıklık, gerginlik, reaktif tepki (ürünleri tolere edememe), gözle görülür kuruluk, parlaklık kaybı. 2-6 hafta minimal aktif rutin (sadece nemlendirici + SPF) çoğu vakada düzeltir.' },
      { q: 'Ceramide ne yapar?', a: 'Cilt bariyerinin ana lipid tabakası. Eksildiğinde cilt nemi tutamaz, dış uyaranlardan korunamaz. Topikal ceramide (özellikle Cer NP, Cer AP) cilt tabakasının doğal yapısını taklit ederek bariyeri restore eder.' },
      { q: 'Bariyer onarımı süresince hangi ürünler bırakılır?', a: 'Tüm aktif (retinol, AHA/BHA, C vitamini), parfüm, denatüre alkol, eksfolyan içeren ürünler. Sadece nazik temizleyici + ceramide nemlendirici + SPF kullan. 2-6 hafta sonra kademe kademe geri ekle.' },
    ],
    skin_type_affinity: { dry: 95, oily: 70, combination: 80, sensitive: 100, normal: 75 },
    interaction_warnings: [
      { ingredient_a: 'Aktif eksfoliantlar', ingredient_b: 'Bariyer hasarı', warning: 'Bariyer hasarı sürecinde aktif kullanma — cildin kendini onarması için minimum müdahale.' },
    ],
    confused_with: [
      { name: 'Hassasiyet', difference: 'Hassasiyet doğuştan/genetik; bariyer hasarı ürün kötü kullanımı sonucu — hasar onarılır, hassasiyet yönetilir.' },
    ],
  },
  'gozenek-sikilastirma': {
    faq: [
      { q: 'Gözenekler küçültülebilir mi?', a: 'Gözenek boyutu büyük oranda genetik. "Küçültmek" mümkün değil ama görünümü azaltılabilir: niasinamid sebum üretimini düzenler, salisilik asit (BHA) tıkanıklıkları açar, retinoid kollajeni güçlendirip gözenek çevresini sıkılaştırır.' },
      { q: 'Buhar ve buhar maskesi etkili mi?', a: 'Buhar gözenekleri "açmaz" — bu mit. Sebum sıvılaştırarak temizleme öncesi kolaylaştırır, ama gözenek boyutuna kalıcı etki yapmaz. Aşırı sıcak buhar bariyer hasarı yapabilir.' },
      { q: 'Kil maskesi ne sıklıkla?', a: 'Yağlı/karma cilt için haftada 1-2. Bentonit/kaolin sebum çekiyor ama aşırı kullanım kuruluk + reaktif sebum üretimine yol açar. Hassas/kuru ciltlerde sadece T-bölge spot uygulama.' },
    ],
    skin_type_affinity: { dry: 30, oily: 90, combination: 80, sensitive: 50, normal: 60 },
    interaction_warnings: [],
    confused_with: [
      { name: 'Sebum kontrolü', difference: 'Gözenek görünümü ≠ sebum üretimi. Niasinamid ikisini de hedefler; salisilik sadece tıkanıklığı açar.' },
    ],
  },
  'cilt-tonu-esitleme': {
    faq: [
      { q: 'Aydınlatma ile beyazlatma aynı mı?', a: 'Hayır. Aydınlatma cildin doğal canlılığını ve tonunu eşitler (C vitamini, niasinamide). Beyazlatma melanin üretimini bastırır (hidrokinon, kojik). Türkiye\'de aydınlatma serumları yasal/güvenli; beyazlatma reçeteli.' },
      { q: 'C vitamini en iyi hangi saatte kullanılır?', a: 'Sabah, SPF\'den önce. Antioksidan olarak gün içi UV+kirlilik hasarına karşı koruma sağlar. Akşam kullanılabilir ama gece çıkan serbest radikal düşük; sabah tercih daha mantıklı.' },
      { q: 'Niasinamide etkisi ne kadar sürede görünür?', a: '%5-10 niasinamid 8-12 hafta düzenli kullanımda cilt tonu eşitlemesi, gözenek görünümü ve sebum kontrolünde ölçülebilir fark sağlar. Klinik kanıt güçlü.' },
    ],
    skin_type_affinity: { dry: 70, oily: 75, combination: 80, sensitive: 60, normal: 80 },
    interaction_warnings: [],
    confused_with: [
      { name: 'Lekenin tedavisi', difference: 'Genel ton eşitleme + spot leke tedavisi farklı yaklaşım. Geneel ton için niasinamid + C vit + SPF; spot leke için yüksek konsantrasyon arbutin/traneksamik.' },
    ],
  },
  'gunes-korumasi': {
    faq: [
      { q: 'SPF kaç olmalı?', a: 'Türkiye için minimum SPF 30, yaz/açık tenli için SPF 50+. PA+++ veya PA++++ (UVA koruma) zorunlu — sadece SPF UVB\'ye karşı, UVA için PA gerekir. Avrupa standardında SPF 50+ = PA++++ genelde.' },
      { q: 'Kimyasal mı mineral mi SPF?', a: 'Kimyasal (avobenzone, oxinoxate vb.): hafif doku, beyaz iz yok ama bazı bileşenler (oksinoksat) tartışmalı/endokrin riskli. Mineral (zinc oxide, titanium dioxide): bebek/hassas cilt güvenli, beyaz iz daha yoğun. Hibrit formüller iyi denge.' },
      { q: 'SPF günde kaç kere?', a: 'Sabah 1 kere yeterli ANCAK aşırı güneşte (yaz açık alan, plaj, kayak) her 2 saatte bir. Kapalı ofis/gece dışarı çıkmıyorsanız tek uygulama yeter — UVA pencereden geçer ama kümülatif etki minimal.' },
    ],
    skin_type_affinity: { dry: 100, oily: 100, combination: 100, sensitive: 100, normal: 100 },
    interaction_warnings: [
      { ingredient_a: 'AHA/BHA/Retinol', ingredient_b: 'SPF eksikliği', warning: 'Bu aktifler kullanırken SPF olmazsa olmaz — yoksa lekelenme + bariyer hasarı.' },
    ],
    confused_with: [],
  },
  'yag-kontrolu': {
    faq: [
      { q: 'Yağlı cilt nemlendirici kullanmamalı mı?', a: 'Yanlış mit. Yağlı ciltte SU eksikliği olabilir — sebum üretimi dehidrasyona reaktif olabilir. Hafif jel/su bazlı nemlendirici (HA + niasinamid) kullan; yağlı krem değil.' },
      { q: 'Niasinamid sebumu nasıl düzenler?', a: '%5-10 niasinamid sebum üretimini regüle eder, gözenek görünümünü azaltır, anti-enflamatuar etki gösterir. 8-12 hafta sonra sebum dengesi gözle görülür.' },
      { q: 'Çinko ağızdan alındığında yağlı cilde iyi gelir mi?', a: 'Klinik kanıt orta. Çinko bisglisinat 15-30 mg/gün sebumu hafif düzenler, akneye karşı orta etkili. Topikal çinko PCA daha hedefli.' },
    ],
    skin_type_affinity: { dry: 10, oily: 100, combination: 75, sensitive: 50, normal: 40 },
    interaction_warnings: [],
    confused_with: [
      { name: 'Akne', difference: 'Yağlı cilt = trait, akne = active condition. Yağlı cilt herkeste akne çıkarmaz; akne formülünde bakteri + iltihap da var.' },
    ],
  },
  'nemlendirme': {
    faq: [
      { q: 'Hangi nemlendirici tipi cildime uygun?', a: 'Kuru cilt: krem (yağ bazlı), kuru-dehidre kombin için lipid + humektant. Yağlı cilt: jel veya hafif emülsiyon (su bazlı). Karma cilt: bölgeye özel — T-zone hafif, yanaklar zengin.' },
      { q: 'Hyaluronik asit molekül ağırlığı önemli mi?', a: 'Evet. Yüksek molekül HA (>1MDa) yüzeyde nem tutar; düşük molekül (<0.05MDa) deriye penetre olur. Multi-weight HA serumlar (3-5 farklı boyut) en etkili.' },
      { q: 'Glycerin tek başına yeterli mi?', a: 'Bütçe-dostu güçlü humektant; tüketicide eskiden moda olmasa da kanıt-temelli olarak HA kadar etkili. Tek başına yetebilir; kombo daha iyi.' },
    ],
    skin_type_affinity: { dry: 100, oily: 60, combination: 80, sensitive: 90, normal: 75 },
    interaction_warnings: [],
    confused_with: [
      { name: 'Yağlandırma', difference: 'Nem (su) ile yağ farklı. Cildin ihtiyacı önce nem (humektant), sonra kilit (occlusive).' },
    ],
  },
  'hassasiyet': {
    faq: [
      { q: 'Hassas cilt için hangi bileşenler kaçınılır?', a: 'Parfüm, denatüre alkol, esansiyel yağlar (lavanta, çay ağacı), yüksek konsantrasyon AHA/BHA, retinol, sodyum lauril sülfat. Patch test 24-48 saat şart.' },
      { q: 'Centella asiatica (CICA) nasıl çalışır?', a: 'Asiaticoside ve madecassoside aktif bileşenleri anti-enflamatuar + bariyer onarıcı + yara iyileştirici. Hassas, reaktif, post-prosedür ciltlerde altın standart yatıştırıcı.' },
      { q: 'Allerjen test (patch test) nasıl yapılır?', a: 'Yeni ürünü kulak arkası veya iç kola küçük miktarda 24-48 saat boyunca uygula. Kızarıklık, kaşıntı, yanma yoksa yüzde dene. Hassas ciltler 2-3 gün test eder.' },
    ],
    skin_type_affinity: { dry: 90, oily: 60, combination: 70, sensitive: 100, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Esansiyel yağ', ingredient_b: 'Hassas cilt', warning: 'Lavanta, çay ağacı, narenciye yağları hassas ciltte alerjik dermatit riski.' },
    ],
    confused_with: [
      { name: 'Bariyer hasarı', difference: 'Genetik hassasiyet kalıcı; bariyer hasarı ürün kötü kullanımı sonucu — onarılır.' },
    ],
  },
  'anti-oksidan-koruma': {
    faq: [
      { q: 'Antioksidan serum gerçekten gerekli mi?', a: 'Evet — günlük UV + kirlilik + mavi ışık kümülatif serbest radikal hasarı yaratır. C vitamini + ferulik asit + E vitamini kombinasyonu klinik düzeyde kanıtlı koruma sağlar (Skinceuticals C E F formülü standart).' },
      { q: 'Yeşil çay özü çalışıyor mu?', a: 'EGCG (epigallocatechin gallate) güçlü antioksidan + anti-enflamatuar. Topikal %1-3 etkili. Oral yeşil çay extract de cilt sağlığına dolaylı katkı.' },
      { q: 'Resveratrol cilde nasıl etki eder?', a: 'Üzüm/şarap fenolik bileşeni, sirtüin yolağı aktivasyonuyla yaşlanma karşıtı. Topikal C vitamini ile sinerjik. Tek başına anti-aging için yetersiz, kompleks formülde destek.' },
    ],
    skin_type_affinity: { dry: 80, oily: 80, combination: 85, sensitive: 70, normal: 90 },
    interaction_warnings: [],
    confused_with: [],
  },
  'enerji-canlilik': {
    faq: [
      { q: 'B12 eksikliği yorgunluk yapar mı?', a: 'Evet, klasik belirti. Vegan/vegetariyan diyette B12 eksikliği yaygın. Methylcobalamin (aktif form) > cyanocobalamin tercih. Test ettir, normal aralık 200-900 pg/mL ama 400+ optimal.' },
      { q: 'Demir takviyesi ne zaman alınır?', a: 'Aç karna (yemekten 1 saat önce/2 saat sonra) emilim yüksek. C vitamini ile birlikte emilim 2-3x artar; süt ürünü, çay, kahve emilimi düşürür. Kabızlık yan etkisi varsa heme demir veya bisglisinat formuna geç.' },
      { q: 'Magnezyum yorgunluk için işe yarar mı?', a: 'Magnezyum eksikliği yaygın (toprak yoksulluğu) ve yorgunluk + kas krampı + uyku kalitesi düşüklüğüyle ilişkili. Magnesium glycinate veya threonate 200-400mg/gün, akşam.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Kalsiyum', ingredient_b: 'Demir', warning: 'Kalsiyum demirin emilimini bloke eder — 4 saat ara ver.' },
    ],
    confused_with: [
      { name: 'Adrenal yorgunluk', difference: 'Klinik tanı değil. Kortizol düzensizliği ile karıştırılır. Endokrinolog kontrolü gerek.' },
    ],
  },
  'bagisiklik-destegi': {
    faq: [
      { q: 'C vitamini soğuk algınlığını önler mi?', a: 'Önler kanıtı zayıf, ama süre/şiddet azaltıcı etkisi orta düzeyde kanıtlı. 500-1000 mg/gün rutinde, hastalıkta 2-3g\'a çıkılabilir (kısa süre). Yüksek doz mide rahatsızlığı yapar.' },
      { q: 'D vitamini ve bağışıklık?', a: 'D vitamini reseptörleri immün hücrelerinde — eksiklik (>%70 popülasyon Türkiye\'de) bağışıklığı zayıflatır. 25-OH D testinde 30-60 ng/mL hedef. Eksiklikte 4000-5000 IU/gün, normal aralıkta 1000-2000 IU/gün idame.' },
      { q: 'Çinko ne zaman alınır?', a: 'Soğuk algınlığı belirtilerinde ilk 24 saat içinde 75 mg/gün (4-7 gün). Önleme için 15-30 mg/gün rutin. Aç karna emilim iyi ama mide rahatsızlığı varsa yemekle.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Çinko', ingredient_b: 'Bakır', warning: 'Yüksek doz uzun süreli çinko bakırı tüketir — 25mg üstü için bakır da ekle.' },
    ],
    confused_with: [],
  },
  'sindirim-sagligi': {
    faq: [
      { q: 'Probiyotik hangi türler önemli?', a: 'Lactobacillus rhamnosus (immün), Bifidobacterium longum (sindirim), Saccharomyces boulardii (ishal). Ürün etiketinde CFU sayısı (≥10 milyar) ve raf ömrünün başında değil sonunda garanti edilen miktar olmalı.' },
      { q: 'Prebiyotik nedir?', a: 'Probiyotik mikroorganizmaların besini — inülin, FOS, GOS gibi çözünmez lifler. Soğan, sarımsak, pırasa, muz doğal kaynak. Sentetik prebiyotik suplemante hassasiyet yaratabilir.' },
      { q: 'IBS\'de probiyotik işe yarar mı?', a: 'Karışık kanıtlar. Bifidobacterium infantis 35624 IBS\'de orta düzeyde etkili. 4-8 hafta dene, fark yoksa farklı suşa geç. Bağırsak florası kişiseldir.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Antibiyotik', ingredient_b: 'Probiyotik', warning: 'Antibiyotikten 2-3 saat sonra al. Antibiyotik tedavisi süresince + 2 hafta sonra rutin probiyotik faydalı.' },
    ],
    confused_with: [],
  },
  'kemik-eklem': {
    faq: [
      { q: 'Kalsiyum + D3 dozajı?', a: '50 yaş üstü kadın 1200 mg kalsiyum, 1000-2000 IU D3. Erkekler 1000 mg. Aşırı kalsiyum (>2500mg) damar kireçlenmesi riski — K2 (MK-7 100-180 mcg) kalsiyumu doğru yere yönlendirir.' },
      { q: 'Glukozamin diz ağrısı için işe yarar mı?', a: 'Karışık kanıtlar. Glukozamin sülfat 1500 mg/gün osteoartrit ağrısında orta etkili (NIH meta-analiz). Kondroitin ile kombine etki artar. 2-3 ay denemeden değerlendirme yapma.' },
      { q: 'Kolajen eklem için yeterli mi?', a: 'Hidrolize tip-II kolajen 40 mg/gün eklem ağrısında plasebo üstü etki gösterdi (klinik). Hidrolize tip-I+III cilt için. 8-12 hafta sonra fark beklenir.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [],
    confused_with: [
      { name: 'Kas ağrısı', difference: 'Eklem ağrısı kıkırdak/sinovyum; kas ağrısı kreatin/magnezyum/elektrolit dengesi.' },
    ],
  },
  'kalp-damar-sagligi': {
    faq: [
      { q: 'Omega-3 ne kadar önemli?', a: 'EPA + DHA 1000-2000 mg/gün trigliserid düşürücü, anti-enflamatuar. Yağlı balık (somon, sardalya) haftada 2-3 porsiyon ya da takviye. Vegan: alg yağı.' },
      { q: 'CoQ10 statin kullananlara şart mı?', a: 'Statinler CoQ10 üretimini bastırır — 100-200 mg/gün ubiquinol formu (yaşlılarda) takviye yorgunluk + kas ağrısı yan etkilerini azaltır. Kanıt orta düzey.' },
      { q: 'Sarımsak takviyesi tansiyon düşürür mü?', a: 'Allicin standardize sarımsak ekstresi (600-1200 mg) hafif kan basıncı düşüşü gösterir (klinik meta). İlaç yerine geçmez, destek niteliğinde.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Omega-3', ingredient_b: 'Kan sulandırıcı', warning: 'Yüksek doz omega-3 (>3g) + warfarin/aspirin kanama riski artırır — doktor takibi.' },
    ],
    confused_with: [],
  },
  'beyin-bilissel-fonksiyon': {
    faq: [
      { q: 'Omega-3 hafıza için işe yarar mı?', a: 'DHA beyin omega-3\'ün %30\'u. 1000 mg DHA/gün (özellikle yaşlılarda) bilişsel düşüşü yavaşlatır. Genç sağlıklı yetişkinde fark daha az.' },
      { q: 'Bacopa monnieri çalışıyor mu?', a: 'Adaptojenik bitki, hafıza ve öğrenmede plasebo üstü etki (8-12 hafta). 300-600 mg/gün standardize ekstre. Mide hassasiyeti olabilir.' },
      { q: 'L-theanine kahveyle alınmalı mı?', a: 'L-theanine + kafein klasik kombinasyon. Theanine kafeinin sinirsel ucunu yumuşatır, odaklanmayı artırır. 100-200 mg theanine + 80-100 mg kafein ideal.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [],
    confused_with: [],
  },
  'goz-sagligi': {
    faq: [
      { q: 'Lutein ve zeaksantin?', a: 'Maküla pigmentleri. Lutein 10 mg + zeaksantin 2 mg/gün maküla dejenerasyonu (AMD) riskini azaltır (AREDS2 çalışması). Yumurta sarısı, yeşil yapraklı sebzeler doğal kaynak.' },
      { q: 'Mavi ışık filtresi gözlüğü işe yarar mı?', a: 'Klinik kanıt sınırlı. Uyku kalitesinde marjinal etki. Göz yorgunluğu için 20-20-20 kuralı (her 20 dk\'da 20 saniye 20 fitlik mesafeye bak) daha kanıtlı.' },
      { q: 'Bilberry göz için?', a: 'Antosiyaninler antioksidan; gece görüşü iddiası II.DSö efsanesi. Klinik etki orta düzey. Lutein + zeaksantin daha kanıt-temelli.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [],
    confused_with: [],
  },
  'sac-tirnak': {
    faq: [
      { q: 'Biotin saç dökülmesi için yeter mi?', a: 'Biotin eksikliği nadirdir; sağlıklı bireylerde fazla biotin saç çıkarmaz. Saç dökülmesi nedenleri: demir/D3 eksikliği, tiroid, hormonal, stres. Önce kan testi.' },
      { q: 'Kolajen saç için işe yarar mı?', a: 'Hidrolize kolajen amino asit kaynağı — keratin sentezine destek. Doğrudan saç çıkarmaz ama kalitesini artırır. 5-10 g/gün, 8-12 hafta.' },
      { q: 'Tırnak kırılganlığında ne işe yarar?', a: 'Biotin 2.5-5 mg/gün klinik kanıtla tırnak kırılmasında orta etki. Demir, çinko, B12 eksiklikleri de tırnak kalitesini etkiler. Multivitamin temel.' },
    ],
    skin_type_affinity: { dry: 60, oily: 60, combination: 60, sensitive: 60, normal: 60 },
    interaction_warnings: [],
    confused_with: [],
  },
  'kas-performans': {
    faq: [
      { q: 'Kreatin neden monohidrat?', a: 'Kreatin monohidrat 30+ yıl en kanıtlı form. Diğer formlar (HCl, etil ester) pazarlama trick — aynı etki, daha pahalı. 3-5 g/gün, sürekli alım, "yükleme" şart değil.' },
      { q: 'Whey protein vs bitkisel protein?', a: 'Whey full amino asit profili, BCAA yüksek, hızlı emilim. Bitkisel (pea + rice + hemp kombin) yavaş emilim, vegan uygun. Toplam protein hedefi 1.6-2 g/kg vücut ağırlığı.' },
      { q: 'BCAA gerçekten gerekli mi?', a: 'Whey protein zaten BCAA içerir — ayrı takviye genelde gereksiz. Antrenman içi açlık halinde alınırsa katabolizmi azaltır. Whey alıyorsan BCAA ekstra harcama.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [],
    confused_with: [],
  },
  'uyku-stres-yonetimi': {
    faq: [
      { q: 'Melatonin nasıl alınır?', a: 'Yatmadan 30 dk önce 0.5-3 mg. Çok yüksek doz (5-10mg) ertesi gün uyuşukluk yapar. Düşük doz daha etkili — fizyolojik aralıkta. Kısa vadeli kullan, 2-4 hafta üstü doktor takibi.' },
      { q: 'Magnezyum stres için?', a: 'Magnesium glycinate, threonate (beyne geçer) anksiyete ve uyku kalitesinde etkili. 200-400 mg akşam yatmadan 1 saat önce. Magnezyum oksit ucuz ama emilim düşük.' },
      { q: 'L-theanine ne kadar etkili?', a: '100-400 mg sakinleştirici (sedasyon yok). Yeşil çay temelli; alfa beyin dalgaları aktivasyonu kanıtlı. Magnezyum + L-theanine kombin uyku kalitesinde sinerjik.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Melatonin', ingredient_b: 'Tansiyon ilacı', warning: 'Hipertansiyon ilaçlarını etkileyebilir — doktora danış.' },
    ],
    confused_with: [],
  },
  'hormonal-denge': {
    faq: [
      { q: 'Maca kökü ne yapar?', a: 'Adaptojen kabul edilir. Klinik kanıt orta — libido, enerji, hafif hormonal denge. 1500-3000 mg/gün, 8-12 hafta. Hormon replasmanı değildir.' },
      { q: 'Ashwagandha kortizolü düşürür mü?', a: 'Standardize ekstre (KSM-66, Sensoril) kortizol seviyelerinde anlamlı düşüş gösterir (klinik). 300-600 mg/gün, 8-12 hafta. Stres ve uyku kalitesi iyileştirir.' },
      { q: 'Bitkisel östrojen menopoz için?', a: 'Soya isoflavonları, kara cohosh menopoz semptomlarında orta düzeyde kanıtlı. Hormona duyarlı kanser geçmişi varsa kullanma — fitoöstrojenler bile hassas.' },
    ],
    skin_type_affinity: { dry: 50, oily: 50, combination: 50, sensitive: 50, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Soya', ingredient_b: 'Tiroid ilacı', warning: 'Soya isoflavonları tiroid ilaç emilimini bozabilir — 4 saat ara.' },
    ],
    confused_with: [],
  },
  'inflamasyon-azaltma': {
    faq: [
      { q: 'Zerdeçal (curcumin) nasıl alınır?', a: 'Kurkumin biyoyararlanımı düşük. Piperin (siyah biber) ile alındığında %2000 emilim artışı. 500-1000 mg/gün curcumin + piperin. Yağlı yemeklerle al.' },
      { q: 'Omega-3 inflamasyon için ne kadar?', a: 'EPA + DHA 2-3 g/gün anti-enflamatuar. Trigliserid bazlı omega-3 etil ester forma göre %70 daha iyi emilim. Saf balık yağı + yüksek EPA tercih.' },
      { q: 'CRP yüksekse ne yapılmalı?', a: 'CRP > 3 mg/L kronik enflamasyon. Önce yaşam tarzı: işlenmiş gıda azalt, omega-3 artır, uyku düzene koy. Sonra zerdeçal, omega-3, magnezyum takviyesi. 8-12 hafta sonra tekrar test.' },
    ],
    skin_type_affinity: { dry: 60, oily: 70, combination: 60, sensitive: 80, normal: 50 },
    interaction_warnings: [
      { ingredient_a: 'Zerdeçal', ingredient_b: 'Kan sulandırıcı', warning: 'Yüksek doz curcumin + warfarin/aspirin kanama riski.' },
    ],
    confused_with: [],
  },
};

// ── 1) Tüm needs'i al ────────────────────────────────────────────
const needs = await c.query(`SELECT need_id, need_slug, need_name FROM needs ORDER BY need_id`);
console.log(`[1] Needs: ${needs.rowCount}`);

// ── 2) Update with seed ──────────────────────────────────────────
let updated = 0, skipped = 0;
for (const n of needs.rows) {
  const seed = NEED_SEED[n.need_slug];
  if (!seed) {
    skipped++;
    console.log(`SKIP [${n.need_slug}] — seed yok`);
    continue;
  }
  try {
    await c.query(
      `UPDATE needs
       SET faq_json = $2,
           skin_type_affinity = $3,
           interaction_warnings = $4,
           confused_with_json = $5
       WHERE need_id = $1`,
      [
        n.need_id,
        JSON.stringify(seed.faq),
        JSON.stringify(seed.skin_type_affinity),
        JSON.stringify(seed.interaction_warnings),
        JSON.stringify(seed.confused_with),
      ]
    );
    updated++;
    console.log(`OK   [${n.need_slug}] — ${seed.faq.length} FAQ, ${seed.interaction_warnings.length} interaction`);
  } catch (e) {
    skipped++;
    console.log(`ERR  [${n.need_slug}] — ${e.message}`);
  }
}
console.log(`[2] updated=${updated}, skipped=${skipped}`);

// Rapor
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_need-enrichment-seed.md');
writeFileSync(reportPath, `# Need Enrichment Seed — 2026-04-29 Faz 3\n\n- Total needs: ${needs.rowCount}\n- Updated: ${updated}\n- Skipped: ${skipped}\n\nHer ihtiyaç için: 3 FAQ + 5 cilt tipi affinity + 0-3 etkileşim + 0-1 karışan ihtiyaç.\n`);

await c.end();
console.log('[BAŞARILI] Faz 3 tamamlandı.');
