const { Client } = require('pg');
const PGCONN = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

const articles = [
  {
    title: 'Niacinamide Nedir? Cildine Faydaları ve Kullanım Rehberi',
    slug: 'niacinamide-nedir-faydalari-kullanim-rehberi',
    content_type: 'ingredient_explainer',
    summary: 'B3 vitamini formu olan Niacinamide, gözenekleri sıkılaştırır, lekeleri açar ve cilt bariyerini güçlendirir. Kim kullanmalı, nasıl kullanmalı?',
    body_markdown: `## Niacinamide (Vitamin B3) Nedir?\n\nNiacinamide, suda çözünen bir B3 vitamini formudur. Kozmetik dünyasında en çok araştırılan ve kanıtlanmış etkiye sahip aktif maddelerden biridir.\n\n## Cilde Faydaları\n\n### 1. Gözenek Sıkılaştırma\nDüzenli kullanımda gözeneklerin görünümünü küçültür. %5 konsantrasyonda bile etkili olduğu klinik çalışmalarla gösterilmiştir.\n\n### 2. Leke Açma\nMelanin transferini azaltarak lekelerin açılmasına yardımcı olur. Hiperpigmentasyon tedavisinde C vitamini ile birlikte kullanılabilir.\n\n### 3. Yağ Kontrolü\nSebum üretimini dengeleyerek yağlı ciltte parlamayı azaltır.\n\n### 4. Cilt Bariyeri\nSeramid üretimini artırarak cilt bariyerini güçlendirir.\n\n## Nasıl Kullanılmalı?\n\n- **Konsantrasyon:** %2-10 arası etkili, %5 en yaygın\n- **Sıklık:** Günde 1-2 kez\n- **Sıralama:** Temizlik → Tonik → **Niacinamide** → Nemlendirici\n- **Uyarı:** C vitamini ile aynı anda kullanılabilir (eski bilgi yanlış)\n\n## Kimler Kullanmalı?\n\nHer cilt tipine uygun, hassas ciltler dahil. Sivilce, leke, gözenek ve yaşlanma sorunları olan herkes fayda görebilir.`,
  },
  {
    title: 'AHA vs BHA: Hangisi Senin İçin Doğru?',
    slug: 'aha-vs-bha-hangisi-senin-icin-dogru',
    content_type: 'comparison',
    summary: 'Glikolik asit mi, salisilik asit mi? AHA ve BHA arasındaki farkları, cilt tipine göre hangisinin uygun olduğunu öğren.',
    body_markdown: `## Kimyasal Peeling: AHA ve BHA\n\nKimyasal peelingler, ölü hücreleri dökerek cildin yenilenmesini sağlar. İki ana kategori vardır.\n\n## AHA (Alfa Hidroksi Asit)\n\n**Örnekler:** Glikolik Asit, Laktik Asit, Mandelik Asit\n\n**En iyi:** Kuru ve normal ciltler\n\n**Ne yapar:**\n- Cilt yüzeyindeki ölü hücreleri döker\n- Cilt tonunu eşitler\n- İnce çizgileri azaltır\n- Cildi parlaklaştırır\n\n## BHA (Beta Hidroksi Asit)\n\n**Örnekler:** Salisilik Asit\n\n**En iyi:** Yağlı ve akneli ciltler\n\n**Ne yapar:**\n- Gözeneklerin içine girerek temizler\n- Siyah nokta ve beyaz noktaları azaltır\n- Anti-inflamatuar etki gösterir\n- Yağ üretimini dengeler\n\n## Karşılaştırma Tablosu\n\n| Özellik | AHA | BHA |\n|---------|-----|-----|\n| Çözünürlük | Suda | Yağda |\n| Etki derinliği | Yüzey | Gözenek içi |\n| En iyi cilt tipi | Kuru/Normal | Yağlı/Akne |\n| Güneş hassasiyeti | Yüksek | Düşük |\n| Başlangıç konsantrasyonu | %5-8 | %0.5-2 |\n\n## Birlikte Kullanılabilir mi?\n\nEvet, ancak aynı anda değil. Sabah BHA, akşam AHA gibi alternatif kullanım önerilir.`,
  },
  {
    title: 'Kore Cilt Bakım Rutini: 10 Adım Rehberi',
    slug: 'kore-cilt-bakim-rutini-10-adim-rehberi',
    content_type: 'guide',
    summary: 'K-beauty dünyasının ünlü 10 adımlı cilt bakım rutinini Türkçe olarak öğren. Her adımın ne işe yaradığını ve hangi ürünleri kullanman gerektiğini keşfet.',
    body_markdown: `## Kore Cilt Bakım Rutini Nedir?\n\nKore cilt bakımı (K-beauty), katmanlı ürün kullanarak cildin derinlemesine nemlendirmesine ve korunmasına odaklanır.\n\n## 10 Adım\n\n### 1. Yağ Bazlı Temizleyici\nMakyaj ve güneş kremini çıkarır. Çift temizleme yönteminin ilk adımı.\n\n### 2. Su Bazlı Temizleyici\nKalan kiri ve teri temizler.\n\n### 3. Peeling (Haftada 2-3)\nAHA/BHA veya fiziksel peeling ile ölü hücreleri döker.\n\n### 4. Tonik\npH dengesini sağlar, sonraki ürünlerin emilimini artırır.\n\n### 5. Esans\nHidrasyon katmanının ilk adımı. Hafif, sulu formül.\n\n### 6. Serum / Ampul\nYoğun aktif maddeler. Cilt sorununa göre seçilir.\n\n### 7. Maske (Haftada 2-3)\nYoğun nemlendirme veya arındırma.\n\n### 8. Göz Kremi\nHassas göz çevresini besler.\n\n### 9. Nemlendirici\nTüm katmanları kilitler.\n\n### 10. Güneş Kremi (Sabah)\nEN ÖNEMLİ ADIM. SPF 50+ her gün.\n\n## Başlangıç İçin Kısaltılmış Rutin\n\nHer 10 adımı yapmak zorunda değilsin:\n1. Temizleyici\n2. Tonik\n3. Serum\n4. Nemlendirici\n5. Güneş Kremi`,
  },
  {
    title: 'Retinol Rehberi: Başlangıçtan İleri Seviyeye',
    slug: 'retinol-rehberi-baslangictan-ileri-seviyeye',
    content_type: 'ingredient_explainer',
    summary: 'Retinol nedir, nasıl kullanılır, hangi konsantrasyondan başlanır? Retinizasyon dönemi, yan etkileri ve birlikte kullanılmaması gereken aktifler.',
    body_markdown: `## Retinol Nedir?\n\nRetinol, A vitamininin bir formudur. Cilt bakımında en güçlü anti-aging aktif olarak kabul edilir.\n\n## Ne Yapar?\n\n- Hücre yenilenmesini hızlandırır\n- Kolajen üretimini artırır\n- İnce çizgi ve kırışıklıkları azaltır\n- Lekeleri açar\n- Gözenekleri sıkılaştırır\n- Akne tedavisinde etkili\n\n## Başlangıç Rehberi\n\n### Hafta 1-2: Alıştırma\n- %0.025-0.03 konsantrasyon\n- Haftada 2 gece\n- Nemlendirici üzerine\n\n### Hafta 3-4: Artırma\n- Haftada 3-4 gece\n- Doğrudan cilde\n\n### Ay 2+: Tam Kullanım\n- Her gece\n- Konsantrasyon artırılabilir (%0.5)\n\n## Retinizasyon Dönemi\n\nİlk 2-6 hafta soyulma, kızarıklık ve kuruluk normal. Bu dönemde:\n- Nemlendiriciyi artır\n- SPF mutlaka kullan\n- AHA/BHA ile aynı gece kullanma\n\n## Birlikte Kullanma\n\n- **EVET:** Niacinamide, Hyaluronic Acid, Ceramide, Peptide\n- **HAYIR:** AHA/BHA (aynı gece), Benzoyl Peroxide, C Vitamini (dikkatli)`,
  },
  {
    title: 'Güneş Kremi Seçim Rehberi: SPF, PA ve Filtre Tipleri',
    slug: 'gunes-kremi-secim-rehberi-spf-pa-filtre-tipleri',
    content_type: 'guide',
    summary: 'SPF ne anlama gelir? Kimyasal ve mineral filtre farkı nedir? Cilt tipine göre en uygun güneş kremini nasıl seçersin?',
    body_markdown: `## Neden Güneş Kremi?\n\nGüneş kremi, cilt bakımının en önemli adımıdır. UV ışınları:\n- Erken yaşlanmanın %80'inden sorumlu\n- Leke oluşumunun ana nedeni\n- Cilt kanseri riski\n\n## SPF Ne Demek?\n\n**SPF 30:** UVB ışınlarının %97'sini engeller\n**SPF 50:** UVB ışınlarının %98'ini engeller\n**SPF 50+:** UVB ışınlarının %98.5+'ını engeller\n\n**Önemli:** SPF sadece UVB'ye karşı korur. UVA koruması için PA+++ veya Broad Spectrum arayın.\n\n## Filtre Tipleri\n\n### Kimyasal (Organik) Filtreler\n- UV'yi emer ve ısıya dönüştürür\n- Hafif doku, beyaz iz bırakmaz\n- Örnekler: Avobenzone, Tinosorb S, Uvinul A Plus\n\n### Mineral (İnorganik) Filtreler\n- UV'yi yansıtır\n- Hassas ciltler için ideal\n- Beyaz iz bırakabilir\n- Örnekler: Zinc Oxide, Titanium Dioxide\n\n## Cilt Tipine Göre Seçim\n\n| Cilt Tipi | Önerilen Tip |\n|-----------|-------------|\n| Yağlı | Jel veya fluid, mat bitişli |\n| Kuru | Krem formülü, nemlendirici içerikli |\n| Hassas | Mineral filtre, parfümsüz |\n| Akne eğilimli | Oil-free, non-comedogenic |\n| Koyu ten | Beyaz iz bırakmayan kimyasal filtre |`,
  },
  {
    title: 'Cilt Bariyeri Nedir? Hasar Belirtileri ve Onarım',
    slug: 'cilt-bariyeri-nedir-hasar-belirtileri-onarim',
    content_type: 'need_guide',
    summary: 'Cilt bariyerin zarar gördüğünü nasıl anlarsın? Bariyer onarımı için hangi aktifler etkili? Seramid, niacinamide ve squalane hakkında her şey.',
    body_markdown: `## Cilt Bariyeri Nedir?\n\nCilt bariyeri (stratum corneum), cildin en dış koruma katmanıdır. Tuğla-harç modeli ile açıklanır:\n- **Tuğlalar:** Ölü hücreler (korneositler)\n- **Harç:** Lipidler (seramidler, kolesterol, yağ asitleri)\n\n## Bariyer Hasar Belirtileri\n\n- Sürekli gerginlik hissi\n- Kızarıklık ve hassasiyet\n- Ürünler batıyor/yakıyor\n- Aşırı kuruluk veya ters yağlanma\n- Pullanma\n- Akne artışı\n\n## Hasar Nedenleri\n\n- Aşırı temizleme\n- Çok fazla aktif kullanımı\n- Sert surfaktanlar (SLS)\n- Fiziksel peeling abartısı\n- Alkol içerikli tonikler\n- Retinol/AHA/BHA fazlası\n\n## Onarım Aktifler\n\n### Seramidler\nBariyer yapısının %50'sini oluşturur. En önemli onarım maddesi.\n\n### Niacinamide\nSeramid üretimini artırır. %4-5 konsantrasyon ideal.\n\n### Squalane\nDoğal sebuma benzer yağ. Emollient etki.\n\n### Panthenol\nYatıştırıcı ve nemlendirici. Bariyer güçlendirir.\n\n### Centella Asiatica\nAnti-inflamatuar. Cica kremlerin ana maddesi.\n\n## Onarım Rutini\n\n1. Sadece yumuşak temizleyici\n2. Tonik (alkol içermeyen)\n3. Seramidli nemlendirici\n4. Güneş kremi\n5. **TÜM AKTİFLERİ DURDUR** (2-4 hafta)`,
  },
  {
    title: 'Hyaluronic Acid: Kullanım Hataları ve Doğru Yöntem',
    slug: 'hyaluronic-acid-kullanim-hatalari-dogru-yontem',
    content_type: 'ingredient_explainer',
    summary: 'Hyaluronic Acid neden bazen cildi kurutur? Nem çekme prensibi, molekül ağırlıkları ve doğru uygulama teknikleri.',
    body_markdown: `## Hyaluronic Acid Nedir?\n\nHyaluronic Acid (HA), doğal olarak cildimizde bulunan bir humectant'tır. Kendi ağırlığının 1000 katı su tutabilir.\n\n## Yaygın Hata: Kuru Ortamda Kullanmak\n\nHA nem çeker. Ama nereden?\n- **Nemli ortam:** Havadan nem çeker → cilt nemlenir\n- **Kuru ortam:** Cildin alt katmanlarından nem çeker → cilt daha da kurur!\n\n## Doğru Kullanım\n\n1. **Islak cilde uygula** — yüzünü yıkadıktan sonra hafif nemli iken\n2. **Üzerine nemlendirici sür** — nemi kilitlemek için emollient katman şart\n3. **Kuru iklimde dikkat** — kalorifer ortamında nemlendirici ile birlikte\n\n## Molekül Ağırlıkları\n\n| Tip | Boyut | Etki |\n|-----|-------|------|\n| Yüksek molekül | >1000 kDa | Yüzeyde film, anlık dolgunluk |\n| Orta molekül | 100-1000 kDa | Dengeli emilim |\n| Düşük molekül | <100 kDa | Derin penetrasyon, uzun vadeli etki |\n\n## En İyi Kombinasyonlar\n\n- **HA + Niacinamide:** Nem + bariyer desteği\n- **HA + Glycerin:** İkili humectant gücü\n- **HA + Ceramide:** Nem çek + kilitle\n- **HA + Vitamin C:** Antioksidan + hidrasyon`,
  },
  {
    title: 'Sivilce İçin En Etkili 5 Aktif Madde',
    slug: 'sivilce-icin-en-etkili-5-aktif-madde',
    content_type: 'need_guide',
    summary: 'Bilimsel kanıtlarla sivilce tedavisinde en etkili 5 kozmetik aktif madde: salisilik asit, benzoil peroksit, niacinamide, retinol ve çay ağacı yağı.',
    body_markdown: `## Sivilce Neden Oluşur?\n\nSivilce oluşumunun 4 ana nedeni:\n1. Aşırı sebum üretimi\n2. Gözenek tıkanması\n3. P. acnes bakterisi\n4. İltihaplanma\n\n## En Etkili 5 Aktif\n\n### 1. Salisilik Asit (BHA)\n**Kanıt seviyesi:** Güçlü\n- Gözenek içini temizler (yağda çözünür)\n- Anti-inflamatuar\n- %0.5-2 konsantrasyon\n- Her cilt tipine uygun\n\n### 2. Benzoil Peroksit\n**Kanıt seviyesi:** Güçlü\n- Bakterileri öldürür\n- %2.5 bile etkili (yüksek konsantrasyon gerekmez)\n- Kurutucu — nemlendirici ile birlikte\n\n### 3. Niacinamide\n**Kanıt seviyesi:** Güçlü\n- Sebum kontrolü\n- İltihaplanmayı azaltır\n- Sivilce izlerini açar\n- %4-5 konsantrasyon ideal\n\n### 4. Retinol\n**Kanıt seviyesi:** Güçlü\n- Hücre yenilenmesini hızlandırır\n- Gözenek tıkanmasını önler\n- Uzun vadeli en etkili çözüm\n- Yavaş başla, sabırlı ol\n\n### 5. Tea Tree Oil\n**Kanıt seviyesi:** Orta\n- Doğal antibakteriyel\n- %5 konsantrasyon etkili\n- Benzoil peroksit kadar güçlü (daha yavaş)`,
  },
  {
    title: 'INCI Listesi Nasıl Okunur?',
    slug: 'inci-listesi-nasil-okunur',
    content_type: 'label_reading',
    summary: 'Kozmetik ürünlerdeki INCI listesini okumayı öğren. İçerik sıralaması ne anlama gelir? Kaçınılması gereken maddeler hangileri?',
    body_markdown: `## INCI Nedir?\n\nINCI (International Nomenclature of Cosmetic Ingredients), kozmetik ürünlerdeki içerik maddelerinin uluslararası adlandırma sistemidir.\n\n## Temel Kurallar\n\n### 1. Sıralama = Yoğunluk\nİçerikler en yoğun olandan en az olana doğru sıralanır.\n- İlk 5 madde: Ürünün ana yapısı\n- %1 altı maddeler: Herhangi bir sırada olabilir\n\n### 2. Su Her Zaman İlk\nÇoğu üründe "Aqua" (Water) ilk sırada. Susuz formüller (yağlar, balmlar) hariç.\n\n### 3. Latince İsimler\n- Bitki özütleri Latince yazılır: Aloe Barbadensis Leaf Extract\n- Kimyasallar İngilizce: Sodium Hyaluronate\n\n## Dikkat Edilecek Maddeler\n\n### Potansiyel Tahriş Edici\n- Alcohol Denat. (yüksek konsantrasyonda)\n- Sodium Lauryl Sulfate (SLS)\n- Fragrance/Parfum\n\n### Yaygın Alerjenler\n- Linalool, Limonene, Geraniol\n- MI/MCI (koruyucular)\n\n## Pratik İpuçları\n\n1. İlk 5 maddeye odaklan — ürünün ana karakterini belirler\n2. Aktif maddeyi listenin neresinde ara — üstte ise yüksek konsantrasyon\n3. "Parfum" son sıralarda bile hassas cildi tahriş edebilir\n4. Kozmetik Platform'da her maddeyi arayabilirsin!`,
  },
  {
    title: 'Vitamin C Serum Rehberi: Form, Konsantrasyon ve Stabilite',
    slug: 'vitamin-c-serum-rehberi-form-konsantrasyon-stabilite',
    content_type: 'ingredient_explainer',
    summary: 'L-Ascorbic Acid mi, türev mi? Vitamin C serumunda ne aramalısın? pH, konsantrasyon, saklama koşulları ve en iyi kombinasyonlar.',
    body_markdown: `## Vitamin C Neden Önemli?\n\nVitamin C (Ascorbic Acid), cildin en güçlü antioksidanlarından biridir:\n- Serbest radikallere karşı koruma\n- Kolajen sentezini artırma\n- Lekeleri açma\n- Güneş hasarını azaltma (güneş kremi yerine DEĞİL)\n\n## Vitamin C Formları\n\n### L-Ascorbic Acid (LAA)\n- En etkili, en çok araştırılan form\n- pH 3.5 altında aktif\n- Kararsız — ışık ve havadan etkilenir\n- %10-20 konsantrasyon\n\n### Ascorbyl Glucoside\n- Kararlı form\n- Daha az tahriş edici\n- Daha yavaş etki\n\n### Ethyl Ascorbic Acid\n- Kararlı ve etkili\n- pH bağımsız\n- Hassas ciltler için iyi\n\n### MAP (Magnesium Ascorbyl Phosphate)\n- Suda çözünür, kararlı\n- Akne eğilimli ciltler için uygun\n\n## Saklama\n\n- Koyu renkli şişe\n- Buzdolabında saklama önerilir\n- Rengi koyulaştıysa (kahverengi) oksitlenmiş — kullanma\n- 3 ay içinde bitir\n\n## En İyi Sıralama\n\nSabah: Temizlik → Tonik → **Vitamin C** → Nemlendirici → SPF`,
  },
];

async function main() {
  const client = new Client({ connectionString: PGCONN, ssl: false });
  await client.connect();

  let inserted = 0;
  for (const a of articles) {
    try {
      await client.query(
        `INSERT INTO content_articles (title, slug, content_type, summary, body_markdown, status, published_at)
         VALUES ($1, $2, $3, $4, $5, 'published', NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [a.title, a.slug, a.content_type, a.summary, a.body_markdown],
      );
      inserted++;
    } catch (e) {
      console.error(`Error: ${a.slug}`, e.message);
    }
  }

  console.log(`Inserted ${inserted}/${articles.length} articles`);

  const count = await client.query('SELECT COUNT(*) FROM content_articles');
  console.log(`Total articles: ${count.rows[0].count}`);

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
