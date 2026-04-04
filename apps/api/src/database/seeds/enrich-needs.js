const { Client } = require('pg');

const CONNECTION_STRING = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

const needsData = [
  {
    need_id: 1,
    short_description:
      'Sivilce ve akne eğilimli cildin bakımı, sebum dengesinin sağlanması ve iltihaplı lezyonların tedavisi için kapsamlı rehber.',
    user_friendly_label: 'Sivilce ve akneden kurtulma rehberi',
    detailed_description: `Sivilce ve akne, pilosebase ünitenin (kıl folikülü ve yağ bezi) kronik iltihaplanmasıdır. Temel tetikleyiciler arasında aşırı sebum üretimi, Cutibacterium acnes bakterisinin çoğalması, folikül ağzının keratinle tıkanması ve hormonal dalgalanmalar (androjenler) yer alır. Stres, yanlış beslenme alışkanlıkları ve uygun olmayan kozmetik ürün kullanımı da akneyi şiddetlendirebilir.

Etkili aktif bileşenler arasında salisilik asit (BHA) ilk sırada gelir; yağda çözünür yapısı sayesinde gözenek içine nüfuz ederek tıkanıklıkları giderir ve anti-enflamatuar etki gösterir. Benzoil peroksit, antibakteriyel özelliğiyle C. acnes popülasyonunu azaltır. Niasinamid (Vitamin B3) sebum üretimini düzenler, kızarıklığı azaltır ve hiperpigmentasyonu önler. Retinoidler (retinol, adapalen) hücre yenilenmesini hızlandırarak komedonal akneyi tedavi eder. Çay ağacı yağı doğal antiseptik olarak hafif akneye yardımcıdır. Azelaik asit hem antibakteriyel hem de anti-keratinize edici etkisiyle çok yönlü bir seçenektir.

Önerilen ürün tipleri: düşük pH'lı jel veya köpük temizleyici, BHA tonik veya serum, niasinamid serumu, hafif nemlendirici (jel kıvamında), yağsız güneş koruyucu. Kil maskesi haftada 1-2 kez gözenekleri temizlemeye yardımcıdır.

Bakım rutini ipuçları: Cildi günde iki kez nazikçe temizleyin; agresif ovma komedonal aknede lezyonları artırır. Aktif bileşenleri kademeli olarak tanıtın; örneğin salisilik asit ile retinol aynı anda kullanılmamalıdır. Cilde dokunmaktan ve sivilceleri sıkmaktan kaçının; bu durum post-inflamatuar hiperpigmentasyona neden olur. Non-komedojenik ve yağsız ürünler tercih edin. SPF 30+ güneş koruyucu mutlaka kullanın çünkü aktif bileşenler cildi güneşe duyarlı hale getirir.`
  },
  {
    need_id: 2,
    short_description:
      'Cilt lekelerinin, ton eşitsizliğinin ve hiperpigmentasyonun nedenlerini anlama ve etkili aydınlatma stratejileri.',
    user_friendly_label: 'Leke ve hiperpigmentasyon giderme rehberi',
    detailed_description: `Hiperpigmentasyon, melanositlerin aşırı melanin üretmesi sonucu ciltte koyu lekeler oluşmasıdır. Başlıca türleri arasında güneş lekeleri (solar lentigo), melazma (hormon kaynaklı), post-inflamatuar hiperpigmentasyon (PIH, akne veya yara sonrası) ve çiller bulunur. UV maruziyeti tüm leke türlerinin en büyük tetikleyicisidir; güneş melanin sentezini doğrudan uyarır.

En etkili aktif bileşenler şunlardır: C vitamini (askorbik asit, %10-20) güçlü bir antioksidan olup tirozinaz enzimini inhibe ederek melanin üretimini azaltır. Alfa arbutin, hidroquinonun güvenli türevi olarak melanin sentezini baskılar. Niasinamid, melanozomların keratinositlere transferini engelleyerek leke oluşumunu önler. Retinoidler hücre döngüsünü hızlandırarak pigmentli hücrelerin atılmasını sağlar. Traneksamik asit, özellikle melazmada etkili olup plazmin yolağını bloke eder. AHA'lar (glikolik asit, laktik asit) yüzeyel eksfoliasyon ile pigmentli hücreleri uzaklaştırır. Kojik asit ve licorice (meyan kökü) ekstraktı doğal aydınlatıcılardır.

Önerilen ürün tipleri: C vitamini serumu (sabah), aydınlatıcı tonik (arbutin veya niasinamid içeren), retinol serumu (gece), AHA eksfoliant (haftada 2-3 kez), SPF 50+ geniş spektrumlu güneş koruyucu (mutlaka).

Bakım rutini ipuçları: Güneş koruması leke tedavisinin olmazsa olmazıdır; SPF'siz hiçbir aydınlatıcı yeterince etkili olamaz. Aydınlatıcı aktifler sabır gerektirir; sonuçlar genellikle 8-12 hafta sonra belirginleşir. C vitamini ve niasinamid birlikte kullanılabilir. Retinol ile AHA'yı aynı gece kullanmaktan kaçının; cilt bariyerini zayıflatabilir. Melazmada dermatolog kontrolünde traneksamik asit ve hidroquinon kombinasyonu düşünülebilir. Cildi tahriş eden ürünler PIH riskini artırdığından nazik yaklaşım esastır.`
  },
  {
    need_id: 3,
    short_description:
      'Kırışıklık, ince çizgiler ve cilt yaşlanmasının bilimsel nedenleri ile kanıtlanmış anti-aging bakım stratejileri.',
    user_friendly_label: 'Kırışıklık ve yaşlanma karşıtı bakım rehberi',
    detailed_description: `Cilt yaşlanması iki ana mekanizmayla gerçekleşir: içsel yaşlanma (kronolojik, genetik) ve dışsal yaşlanma (fotoyaşlanma, çevresel faktörler). Yaşla birlikte kolajen sentezi azalır, elastin lifleri bozulur ve hyaluronik asit üretimi düşer. UV ışınları, sigara, hava kirliliği ve stres serbest radikal üretimini artırarak bu süreci hızlandırır. Dermisteki kolajen yıkımı ince çizgilere, derin kırışıklıklara ve cilt sarkmasına yol açar.

Altın standart aktif bileşen retinoidlerdir (retinol, retinaldehit, tretinoin). Retinoidler kolajen sentezini uyarır, hücre yenilenmesini hızlandırır ve ince çizgileri belirgin şekilde azaltır. Peptitler (matrikil, bakıciol, palmitoil tripeptit-1) kolajen üretimini destekler. C vitamini kolajen sentezinin kofaktörüdür ve fotokoruyucu etki gösterir. Hyaluronik asit kendi ağırlığının 1000 katı su tutarak cildi doldurur ve dolgunlaştırır. Niasinamid elastikiyet kaybını önler ve bariyer fonksiyonunu güçlendirir. AHA'lar (glikolik asit) yüzey yenilenmesini destekler. Bakuchiol, retinolün bitkisel alternatifi olarak hassas ciltlere uygundur. Koenzim Q10 mitokondriyal enerji üretimini destekleyerek hücre canlılığını korur.

Önerilen ürün tipleri: retinol serumu (gece, kademeli başlangıç), peptit içeren göz kremi, C vitamini serumu (sabah), hyaluronik asit serumu, zengin nemlendirici (seramid ve squalane içeren), SPF 50+ güneş koruyucu.

Bakım rutini ipuçları: Güneş koruyucu yaşlanma karşıtı en önemli üründür; günlük SPF 30+ kullanımı kırışıklık oluşumunu %40'a kadar yavaşlatır. Retinol kullanımına düşük konsantrasyonla (%0.25) başlayıp kademeli artırın. Gece rutini aktif bileşenler için en verimli zamandır çünkü cilt gece onarım moduna geçer. Boyun ve dekolte bölgesini ihmal etmeyin. Yeterli uyku, su tüketimi ve antioksidan zengin beslenme iç destek sağlar.`
  },
  {
    need_id: 4,
    short_description:
      'Kuru ve dehidre cildin nedenlerini anlama, nem kaybını önleme ve yoğun nemlendirme stratejileri.',
    user_friendly_label: 'Kuru ve dehidre cilt için nemlendirme rehberi',
    detailed_description: `Kuruluk ve dehidrasyon birbirinden farklı iki durumdur. Kuru cilt (alipidik) yeterli sebum üretemeyen bir cilt tipidir; genetik yapıya bağlıdır ve yağ bariyeri zayıftır. Dehidrasyon ise her cilt tipinde görülebilen geçici bir su kaybı durumudur; hava koşulları, klimalar, yanlış ürün kullanımı veya yetersiz su tüketimi tetikleyebilir. Her iki durumda da cilt gergin hisseder, pul pul dökülür, mat görünür ve ince çizgiler belirginleşir.

Anahtar aktif bileşenler üç kategoride değerlendirilir. Humektanlar (su çekiciler): hyaluronik asit farklı molekül ağırlıklarında nemı deriye çeker; gliserin ucuz ve etkili bir humektandır; üre (%5-10) hem nemlendirir hem hafif eksfoliye eder; panthenol (B5 vitamini) yatıştırıcı ve nem bağlayıcıdır. Emoliyentler (yumuşatıcılar): squalane, jojoba yağı, shea yağı cilt yüzeyini pürüzsüzleştirir ve su kaybını azaltır. Oklüzifler (nem kilitleyiciler): seramidler cilt bariyerinin temel yapı taşıdır; petrolatum en güçlü oklüziftir; balmumu ve dimetikon de nem kaybını önler.

Önerilen ürün tipleri: kremal veya süt kıvamında temizleyici (SLS/SLES içermeyen), hyaluronik asit serumu, seramid içeren zengin nemlendirici, gece için oklüzif krem veya uyku maskesi, besleyici yüz yağı.

Bakım rutini ipuçları: Yüzünüzü ılık suyla yıkayın; sıcak su lipid bariyeri eritir. Temizleme sonrası 60 saniye içinde serum ve nemlendirici uygulayın; nemli cilt aktif bileşenleri daha iyi emer. Katmanlama tekniği kullanın: önce humektan (hyaluronik asit), sonra emoliyen (nemlendirici), son olarak oklüzif (yağ veya krem). Haftada 1-2 kez nazik enzimatik veya PHA eksfoliyasyon ölü deri tabakasını kaldırarak nemlendirici emilimini artırır. Oda nemini %40-60 arasında tutmak için nemlendirici cihaz kullanmayı düşünün.`
  },
  {
    need_id: 5,
    short_description:
      'Cilt bariyerinin (stratum corneum) güçlendirilmesi, onarılması ve sağlıklı bir koruma kalkanı oluşturulması.',
    user_friendly_label: 'Cilt bariyerini güçlendirme ve onarım rehberi',
    detailed_description: `Cilt bariyeri (stratum corneum), vücudun dış dünyaya karşı ilk savunma hattıdır. "Tuğla-harç" modeline göre korneositler (tuğla) ve lipid matriks (harç: seramidler, kolesterol, yağ asitleri) birlikte çalışır. Bariyer hasarının belirtileri arasında kızarıklık, yanma, batma hissi, aşırı kuruluk, pullanma ve alışılan ürünlere bile reaksiyon gösterme yer alır. Aşırı eksfoliasyon, alkollü tonikler, sert temizleyiciler, retinol ile AHA'nın eş zamanlı agresif kullanımı, soğuk hava ve düşük nem oranı bariyeri zayıflatan başlıca faktörlerdir.

Bariyer onarımında en kritik bileşenler seramidlerdir; özellikle seramid NP, AP ve EOP cildin doğal lipid yapısını taklit eder. Kolesterol ve serbest yağ asitleri (linoleik asit, oleik asit) seramidlerle birlikte 3:1:1 oranında en etkili bariyer restorasyonunu sağlar. Niasinamid seramid sentezini %34'e kadar artırdığı klinik çalışmalarla gösterilmiştir. Panthenol (dekspantenol) iltihap giderici ve yara iyileştirici özellikleriyle bariyer onarımını destekler. Madecassoside ve centella asiatica (gotu kola) kolajen sentezini uyarır ve anti-enflamatuar etki gösterir. Allantoin cilt yatıştırıcı ve rejeneratif bir bileşendir. Squalane, cildin doğal sebumunda bulunan bir yağ olup bariyeri besler.

Önerilen ürün tipleri: nazik misel su veya süt temizleyici (pH 5-5.5), seramid kompleks içeren nemlendirici, centella serumu, panthenol bazlı yatıştırıcı krem, gece için oklüzif balm.

Bakım rutini ipuçları: Bariyer hasar gördüğünde tüm aktif bileşenleri (retinol, AHA, BHA, C vitamini) geçici olarak durdurun ve sadece yatıştırıcı + nemlendirici rutin uygulayın. Bu "cilt diyeti" 2-4 hafta sürebilir. Yüzünüzü günde ikiden fazla yıkamayın. Fiziksel eksfoliyantlardan (scrub) tamamen kaçının. Bariyer iyileştikten sonra aktif bileşenleri tek tek ve düşük dozda geri ekleyin. Güneş koruyucu olarak mineral (çinko oksit) filtreler hassas bariyer için daha uygun olabilir.`
  },
  {
    need_id: 6,
    short_description:
      'Geniş gözeneklerin nedenlerini anlama ve gözenek görünümünü azaltmaya yönelik kanıta dayalı bakım yöntemleri.',
    user_friendly_label: 'Gözenek sıkılaştırma ve küçültme rehberi',
    detailed_description: `Gözenek boyutu büyük ölçüde genetik olarak belirlenir ve fiziksel olarak "küçültülemez"; ancak görünümü önemli ölçüde minimize edilebilir. Geniş gözeneklerin başlıca nedenleri arasında aşırı sebum üretimi (gözeneklerin yağla genişlemesi), elastikiyet kaybı (yaşla birlikte gözenek çevresindeki kolajenin zayıflaması), güneş hasarı (UV kaynaklı elastin dejenerasyonu) ve komedonal tıkanıklık (ölü deri ve sebum birikimi) yer alır. Yağlı ve karma cilt tiplerinde gözenekler genellikle daha belirgindir.

Etkili aktif bileşenler: Salisilik asit (BHA, %0.5-2) yağda çözünür yapısıyla gözenek içini temizler ve tıkanıklığı önler; gözenek bakımının temel taşıdır. Niasinamid (%2-5) sebum üretimini dengeleyerek gözeneklerin daha az genişlemesini sağlar ve cildi sıkılaştırır. Retinol hücre döngüsünü hızlandırarak gözenek çevresindeki kolajeni destekler ve uzun vadede gözenek görünümünü azaltır. AHA'lar (glikolik asit %5-10) yüzey eksfoliasyonu ile gözenek ağızlarındaki ölü deri birikimini temizler. Çinko PCA sebum regülasyonuna yardımcıdır. Kaolin ve bentonit kili fazla yağı emer. Azeloglycine yeni nesil bir gözenek düzenleyicidir.

Önerilen ürün tipleri: köpük veya jel temizleyici, BHA tonik veya eksfoliyant (günlük veya günaşırı), niasinamid serumu, hafif jel nemlendirici, kil maskesi (haftada 1-2 kez), mattifiye edici primer (makyaj öncesi).

Bakım rutini ipuçları: Gözenekleri "açma-kapama" kavramı bir mittir; gözeneklerin kası yoktur. Buz veya soğuk su geçici olarak cildi sıkıştırır ama kalıcı etki yaratmaz. Düzenli BHA kullanımı gözenekleri temiz tutarak görünümü minimalize eder. Makyajı her akşam çift temizleme (yağ bazlı + su bazlı) yöntemiyle tamamen çıkarın. Güneş koruyucu kullanın çünkü UV hasarı kolajen yıkımıyla gözenekleri genişletir. Sıkma ve mekanik müdahale gözenekleri kalıcı olarak genişletebilir.`
  },
  {
    need_id: 7,
    short_description:
      'Solgun, donuk ve eşitsiz cilt tonunun aydınlatılması, parlaklık kazandırılması ve homojen bir görünüm elde edilmesi.',
    user_friendly_label: 'Cilt tonu eşitleme ve aydınlatma rehberi',
    detailed_description: `Eşitsiz cilt tonu; güneş hasarı, akne izleri, hormonal değişimler, çevresel stres ve yetersiz eksfoliasyon gibi nedenlerle oluşur. Donuk ve cansız cilt görünümü genellikle ölü hücre birikimi, yetersiz kan dolaşımı ve melanin dağılımındaki düzensizliklerden kaynaklanır. Aydınlık ve eşit bir cilt tonu, sağlıklı hücre yenilenmesi ve dengeli melanin üretimi ile mümkündür.

Etkili aktif bileşenler: C vitamini (L-askorbik asit, %10-20, pH 3.5 altında en stabil) tirozinaz inhibitörü olarak melanin üretimini azaltır ve kolajeni destekleyerek cildi parlatır. Niasinamid melanozom transferini engelleyerek ton eşitler. AHA'lar (glikolik asit, mandelik asit) kimyasal eksfoliasyonla ölü hücreleri kaldırarak alttaki parlak cildi ortaya çıkarır. Alfa arbutin ve kojik asit melanin sentezini hedefler. Licorice (meyan kökü) ekstraktı glabridin içerir; doğal bir aydınlatıcıdır. Ferülik asit C vitamini ile sinerjik çalışarak antioksidan etkiyi %8 kat artırır. Laktik asit hem eksfoliye hem de nemlendirir, hassas ciltler için uygundur. Traneksamik asit topikal olarak melazma ve hiperpigmentasyonda etkilidir.

Önerilen ürün tipleri: aydınlatıcı serum (C vitamini + ferülik asit), AHA tonik veya peeling pedi, niasinamid + arbutin serumu, aydınlatıcı krem, haftalık enzimatik peeling, SPF 50+ güneş koruyucu.

Bakım rutini ipuçları: C vitamini serumunu sabah temiz cilde uygulayın; güneş koruyucunun etkisini artırır. AHA eksfoliasyonu akşam yapın ve ertesi gün mutlaka SPF kullanın. Aydınlatma sabır ister; 6-12 hafta düzenli kullanımda sonuç görülür. Cilt tonunu bozan en büyük düşman güneştir; korunmasız UV maruziyeti tüm aydınlatma çabasını boşa çıkarır. Fiziksel eksfoliyantlar yerine kimyasal eksfoliyantları tercih edin; daha homojen sonuç verir. Yeterli su tüketimi ve antioksidan zengin beslenme cildin doğal parlaklığını destekler.`
  },
  {
    need_id: 8,
    short_description:
      'UVA ve UVB ışınlarından korunma, güneş koruyucu seçimi ve güneş hasarını önleme stratejileri.',
    user_friendly_label: 'Güneş koruması ve SPF rehberi',
    detailed_description: `Güneş koruması, cilt bakımının en kritik adımıdır ve tek başına erken yaşlanmanın, hiperpigmentasyonun ve cilt kanseri riskinin %80'inden fazlasını önleyebilir. UV ışınları iki ana tipte sınıflandırılır: UVB (280-320 nm) yanık oluşturur ve epidermisin DNA'sına doğrudan zarar verir; UVA (320-400 nm) daha derin nüfuz ederek kolajen yıkımı, elastikiyet kaybı ve pigmentasyona neden olur. UVA yılın her günü, bulutlu havalarda bile etkilidir ve cam yüzeylerden geçer.

Güneş koruyucu filtreleri iki kategoridedir: Kimyasal (organik) filtreler UV'yi emip ısıya dönüştürür; avobenzone, tinosorb S/M, mexoryl, octisalate yaygın örneklerdir. Mineral (inorganik) filtreler UV'yi yansıtır; çinko oksit (geniş spektrum) ve titanyum dioksit (UVB ağırlıklı) en bilinenleridir. Mineral filtreler hassas ciltler, rozasea ve bariyer hasarlı ciltler için daha uygundur.

SPF değeri UVB korumasını ölçer: SPF 30 UVB'nin %97'sini, SPF 50 ise %98'ini filtreler. UVA koruması için PA++++, PPD veya geniş spektrum ifadesine bakılmalıdır. Miktar kritiktir: yüz için yaklaşık 1/4 çay kaşığı (2 mg/cm²) uygulanmalıdır; yetersiz miktar korumayı dramatik şekilde düşürür.

Önerilen ürün tipleri: günlük SPF 50+ geniş spektrum güneş koruyucu (yüz), vücut için SPF 30+ sprey veya losyon, dudak balmı SPF 15+, göz çevresi için mineral stick güneş koruyucu.

Bakım rutini ipuçları: Güneş koruyucuyu evden çıkmadan 15-20 dakika önce uygulayın. Her 2 saatte bir yeniden uygulama yapın; terleme veya su temasında daha sık. Kapalı alanda bile pencere kenarında çalışıyorsanız SPF kullanın (UVA camdan geçer). Güneş koruyucu son bakım adımı, makyajdan önce uygulanır. Retinol, AHA, BHA gibi aktifler kullananlar için SPF zorunludur; bu bileşenler cildi fotosensitize eder. Güneş koruyucu tek başına yeterli değildir; şapka, gölge ve güneş gözlüğü ile fiziksel korumayı da ekleyin.`
  },
  {
    need_id: 9,
    short_description:
      'Aşırı sebum üretiminin kontrol altına alınması, yağlı cilt parlaklığının dengelenmesi ve matlaştırma yöntemleri.',
    user_friendly_label: 'Yağlı cilt kontrolü ve matlaştırma rehberi',
    detailed_description: `Yağlı cilt, sebase bezlerin genetik olarak fazla sebum üretmesiyle karakterizedir. Androjen hormonlar (testosteron, DHT) sebum üretiminin ana düzenleyicisidir; bu nedenle yağlılık ergenlik, adet döngüsü ve stres dönemlerinde artar. Yanlış temizlik alışkanlıkları (aşırı yıkama, alkollü ürünler) cildin nemsiz kalmasına ve kompansatuvar olarak daha fazla yağ üretmesine yol açar; bu "rebound yağlanma" yaygın bir hatadır.

Etkili aktif bileşenler: Niasinamid (%2-5) sebum üretimini klinik olarak kanıtlanmış şekilde azaltır ve gözenek görünümünü iyileştirir. Salisilik asit (BHA) gözenek içi temizlik sağlayarak tıkanıklığı önler. Çinko (PCA veya glukonat) anti-enflamatuar ve sebum düzenleyici etki gösterir. Kaolin ve bentonit kili fazla yağı emer. Yeşil çay ekstraktı (EGCG) antioksidan ve sebum dengeleyicidir. AHA'lar (glikolik asit) yüzey yenilenmesini sağlar. Retinol uzun vadede gözenek boyutunu azaltır ve cilt yapısını düzenler. Hamamelisi (witch hazel, alkolsüz form) doğal bir astrenjan olarak geçici matlaştırma sağlar.

Önerilen ürün tipleri: jel veya köpük temizleyici (SLS-free), BHA eksfoliyant (günlük veya günaşırı), niasinamid + çinko serumu, yağsız jel nemlendirici, kil maskesi (haftada 2 kez), matifiye edici güneş koruyucu, yağ emici kağıtlar (gün içi).

Bakım rutini ipuçları: Yağlı cildi "kurutarak" tedavi etmeye çalışmak en yaygın hatadır; nemlendirme atlamamalıdır. Hafif, su bazlı formüller tercih edin. Sabah ve akşam nazikçe temizleyin; günde ikiden fazla yıkamayın. Alkol oranı yüksek toniklerden kaçının; bunlar bariyeri bozarak yağlanmayı artırır. Makyaj bazı olarak silikon bazlı primer yağ kontrolü sağlar. Non-komedojenik ürün seçimi kritiktir. Düzenli BHA kullanımı hem yağlanmayı hem de akneyi kontrol altında tutar. Yağlı cilt de yaşlanır; anti-aging aktifler ihmal edilmemelidir.`
  },
  {
    need_id: 10,
    short_description:
      'Her cilt tipine uygun nemlendirme yöntemleri, nem dengesini koruma ve cilt bariyerini destekleme stratejileri.',
    user_friendly_label: 'Etkili nemlendirme ve nem dengeleme rehberi',
    detailed_description: `Nemlendirme, sağlıklı cildin temel taşıdır ve her cilt tipinin ihtiyaç duyduğu evrensel bir bakım adımıdır. Cildin su içeriği normalde %20-35 arasındadır; bu oran %10'un altına düştüğünde kuruluk, kaşıntı ve bariyer bozulması başlar. Transepidermal su kaybı (TEWL) ciltten buharlaşan su miktarını ifade eder ve etkili nemlendirme TEWL'yi minimize etmeyi amaçlar.

Nemlendirici bileşenler üç mekanizmayla çalışır. Humektanlar havadan ve dermisin alt katmanlarından su çekerek epidermisi nemlendirir: hyaluronik asit (düşük ve yüksek molekül ağırlıklı kombinasyonu ideal), gliserin, propandiol, betain, aloe vera, bal ve üre. Emoliyentler hücreler arası boşlukları doldurarak cildi yumuşatır: squalane, kaprilik/kaprik trigliserit, jojoba yağı, shea yağı, bisabolol. Oklüzifler cilt yüzeyinde film oluşturarak su kaybını engeller: seramidler (bariyer yapı taşı), petrolatum, balmumu, lanolin, dimetikon, argan yağı.

Önerilen ürün tipleri cilt tipine göre değişir: yağlı ciltler için jel kıvamında hafif nemlendirici; normal/karma ciltler için losyon veya hafif krem; kuru ciltler için zengin krem ve yüz yağı; çok kuru ciltler için oklüzif balm veya uyku maskesi. Hyaluronik asit serumu tüm cilt tipleri için uygundur.

Bakım rutini ipuçları: Nemlendiriciyi nemli cilde uygulayın; temizleme veya tonik sonrası cildiniz henüz ıslakken en iyi emilim sağlanır. Mevsime göre nemlendirici değiştirin; yazın hafif jel, kışın zengin krem kullanın. Katmanlama tekniğinde en ince formülden (serum) en kalın formüle (krem/yağ) doğru ilerleyin. Sadece yüzü değil, boyun, dekolte ve elleri de nemlendirin. Gece uyku maskesi veya oklüzif katman uygulamak "slug method" olarak bilinir ve yoğun nem terapisi sağlar. Oda nemini %40-60 arasında tutmak için nemlendirici cihaz kullanabilirsiniz; özellikle kışın kapalı mekan havası çok kuru olabilir.`
  },
  {
    need_id: 11,
    short_description:
      'Hassas ve reaktif cildin tetikleyicilerini anlama, yatıştırma ve koruma altına alma stratejileri.',
    user_friendly_label: 'Hassas ve reaktif cilt bakım rehberi',
    detailed_description: `Hassas cilt, dış uyaranlara (kozmetik ürünler, sıcaklık değişimi, rüzgar, stres) karşı aşırı tepki gösteren bir cilt durumudur. Kızarıklık, yanma, batma, kaşıntı ve gerginlik hissi başlıca semptomlarıdır. Hassasiyet bir cilt tipi olmaktan çok bir durumdur ve genetik yatkınlık, bariyer zayıflığı, rozasea, egzama veya aşırı aktif bileşen kullanımı sonucu gelişebilir. Cilt bariyerindeki lipid eksikliği ve sinir uçlarının düşük eşik değeri hassasiyetin fizyolojik temelini oluşturur.

Yatıştırıcı aktif bileşenler: Centella asiatica (Cica) madecassoside ve asiatikosid içerir; güçlü anti-enflamatuar ve yara iyileştirici etki gösterir. Allantoin hücre rejenerasyonunu destekler ve cildi yatıştırır. Panthenol (provitamin B5) nem bağlar ve iltihap gidericidir. Bisabolol (papatyadan elde edilen) anti-enflamatuar ve anti-irritandır. Oat (yulaf) beta-glukan içerir; cildi sakinleştirir ve bariyer onarımını destekler. Niasinamid düşük konsantrasyonlarda (%2-3) bariyer güçlendirici ve yatıştırıcıdır. Seramidler bariyer onarımı için vazgeçilmezdir. Termal su mineralleri (selenyum, silisyum) anti-irritan etki gösterir.

Kaçınılması gereken bileşenler: alkol denat, parfüm/fragrance, uçucu yağlar (ökaliptus, nane), SLS/SLES, yüksek konsantrasyonlu AHA/BHA, retinol (bariyer onarılmadan), sentetik boyar maddeler ve formaldehit salıcılar.

Önerilen ürün tipleri: misel su veya süt temizleyici, centella/cica serumu, seramid + panthenol içeren nemlendirici, mineral güneş koruyucu (çinko oksit bazlı), termal su spreyi.

Bakım rutini ipuçları: Minimal rutin prensibi; az ürün, az bileşen. Yeni ürünleri önce kulak arkası veya çene hattında 48 saat test edin (yama testi). Parfümsüz ve hipoalerjenik ürünleri tercih edin. Aktif bileşenler bariyer onarıldıktan sonra ve düşük dozda eklenmelidir. Yüzünüzü ılık suyla yıkayın; sıcak ve soğuk su hassasiyeti tetikler. Fiziksel eksfoliyantlardan (scrub, fırça) kaçının. Temizleme bezi olarak yumuşak mikrofiber bez kullanın.`
  },
  {
    need_id: 12,
    short_description:
      'Serbest radikal hasarına karşı antioksidan savunma, çevresel stres koruması ve hücresel onarım stratejileri.',
    user_friendly_label: 'Antioksidan koruma ve çevresel savunma rehberi',
    detailed_description: `Antioksidanlar, serbest radikallerin neden olduğu oksidatif stresi nötralize eden moleküllerdir. Serbest radikaller UV ışınları, hava kirliliği (PM 2.5, ozon, azot dioksit), sigara dumanı, mavi ışık (ekran) ve stres gibi kaynaklardan üretilir. Bu reaktif oksijen türleri (ROS) hücre zarına, DNA'ya ve kolajen/elastin liflerine zarar vererek erken yaşlanma, hiperpigmentasyon, inflamasyon ve bariyer bozulmasına yol açar. Modern şehir yaşamında oksidatif stres kaçınılmazdır; bu nedenle topikal antioksidan kullanımı koruyucu bakımın temel taşıdır.

En güçlü topikal antioksidanlar: C vitamini (L-askorbik asit %10-20) en çok araştırılmış antioksidandır; kolajen sentezini destekler, melanin üretimini azaltır ve fotokoruyucu etki gösterir. E vitamini (tokoferol) lipid peroksidasyonunu önler ve C vitaminiyle sinerjik çalışır. Ferülik asit C+E kombinasyonuna eklendiğinde antioksidan etkiyi %8 kat artırır (Skinceuticals CE Ferulic formülü). Resveratrol (üzüm çekirdeği) güçlü polifenol antioksidanıdır. Yeşil çay ekstraktı (EGCG) UV hasarını azaltır ve anti-enflamatuar etki gösterir. Koenzim Q10 mitokondriyal antioksidan olup hücre enerji üretimini destekler. Astaksantin karotenoid ailesinin en güçlü antioksidanıdır; C vitamininden 6000 kat daha etkili olduğu belirtilir. Niasinamid oksidatif stres altında NADPH düzeylerini korur. Bakuchiol antioksidan ve anti-aging özellikleri bir arada sunar.

Önerilen ürün tipleri: C vitamini + E vitamini + ferülik asit serumu (sabah, SPF altında), antioksidan kokteyl serumu (gece), resveratrol veya yeşil çay içeren nemlendirici, antioksidan zengin yüz yağı (kuşburnu, argan), anti-pollution primer.

Bakım rutini ipuçları: Antioksidanlar en etkili sabah rutininde kullanılır; gün boyu çevresel saldırılara karşı kalkan oluşturur. C vitamini serumu + güneş koruyucu kombinasyonu fotokorumanın altın standardıdır. C vitamini kararsız bir moleküldür; koyu cam şişede, serin yerde saklayın ve açıldıktan sonra 3 ay içinde tüketin. Beslenmede de antioksidanları destekleyin: bol meyve, sebze, yeşil çay, karanlık çikolata. Gece serumlarında retinol + antioksidan kombinasyonu onarım kapasitesini artırır. Kirliliğe maruz kalan ciltlerde çift temizleme (yağ + su bazlı) partikül kalıntılarını temizler.`
  }
];

async function main() {
  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();
    console.log('PostgreSQL connected.');

    for (const need of needsData) {
      const result = await client.query(
        `UPDATE needs
         SET short_description = $1,
             detailed_description = $2,
             user_friendly_label = $3,
             updated_at = NOW()
         WHERE need_id = $4
         RETURNING need_id, need_name, user_friendly_label`,
        [need.short_description, need.detailed_description, need.user_friendly_label, need.need_id]
      );

      if (result.rowCount > 0) {
        const row = result.rows[0];
        console.log(`[OK] #${row.need_id} ${row.need_name} => "${row.user_friendly_label}"`);
      } else {
        console.log(`[SKIP] #${need.need_id} not found in database.`);
      }
    }

    // Verify
    const verify = await client.query(
      `SELECT need_id, need_name, user_friendly_label,
              LENGTH(detailed_description) as desc_length,
              short_description
       FROM needs
       WHERE need_id BETWEEN 1 AND 12
       ORDER BY need_id`
    );

    console.log('\n=== Verification ===');
    console.log('ID | Name                         | Label                                          | Desc Length');
    console.log('---|------------------------------|------------------------------------------------|------------');
    for (const row of verify.rows) {
      const id = String(row.need_id).padEnd(2);
      const name = row.need_name.padEnd(28);
      const label = (row.user_friendly_label || '').padEnd(46);
      console.log(`${id} | ${name} | ${label} | ${row.desc_length} chars`);
    }

    console.log('\nAll 12 needs enriched successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

main();
