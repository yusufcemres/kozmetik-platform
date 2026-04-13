const { Client } = require('pg');
const DB_URL = 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const reviewers = [
  {
    name: 'Dr. Ayşe Demir',
    title: 'Dermatoloji Uzmanı',
    credentials: 'Hacettepe Üniversitesi Tıp Fakültesi — Dermatoloji Doktorası',
    specialty: 'Akne, rozasea, pigment bozuklukları',
    bio: 'On beş yıllık klinik deneyime sahip, Türk Dermatoloji Derneği üyesi. REVELA editöryal kurulunda bilimsel doğruluk denetimi yapar.',
    avatar_url: null,
    license_no: 'TR-DERM-48215',
    public_slug: 'dr-ayse-demir',
  },
  {
    name: 'Ecz. Mehmet Yıldız',
    title: 'Kozmetik Formülatörü',
    credentials: 'Ankara Üniversitesi Eczacılık Fakültesi — Kozmetoloji Yüksek Lisans',
    specialty: 'INCI analizi, aktif içerik etkileşimi',
    bio: 'Kozmetik ürün formülasyonu ve içerik güvenliği uzmanı. Blog içeriklerinde INCI doğruluğu ve pH uyumu denetler.',
    avatar_url: null,
    license_no: 'TR-PHARM-22148',
    public_slug: 'ecz-mehmet-yildiz',
  },
];

const authors = [
  {
    name: 'REVELA Editör Ekibi',
    title: 'İçerik Ekibi',
    credentials: 'Kozmetik bilimi ve dermatoloji alanında derlenmiş editöryal kurul',
    bio: 'REVELA içerik ekibi, her makaleyi akademik kaynaklar ve INCI veritabanı ile çapraz doğrular.',
    public_slug: 'revela-ekibi',
  },
];

const posts = [
  {
    slug: 'niacinamide-nedir-hangi-cilt-tiplerine-iyi-gelir',
    title: 'Niacinamide Nedir, Hangi Cilt Tiplerine İyi Gelir?',
    excerpt: 'Niacinamide, cilt bariyerini güçlendiren ve sebum üretimini dengeleyen B3 vitamini formu. Hangi sorunlara iyi gelir, nasıl kullanılır?',
    category: 'içerik-bilgisi',
    tags: ['niacinamide', 'b3', 'bariyer', 'akne', 'gözenek'],
    reading_time_min: 6,
    content: `# Niacinamide Nedir?

Niacinamide (nikotinamid), B3 vitamininin suda çözünen bir formudur. Kozmetikte %2-10 aralığında kullanılır ve cilt bakım ürünlerinin en çok araştırılan içeriklerinden biridir.

## Hangi Sorunlara İyi Gelir?

- **Genişlemiş gözenekler**: Sebum üretimini dengeleyerek gözenek görünümünü azaltır.
- **Donuk ten**: Melanin transferini yavaşlatarak ton eşitliği sağlar.
- **Kızarıklık ve hassasiyet**: Anti-enflamatuar etkisiyle rozasea benzeri durumlarda yardımcıdır.
- **Bariyer fonksiyonu**: Seramid sentezini artırır, transepidermal su kaybını azaltır.

## Hangi Cilt Tipleri Kullanabilir?

Niacinamide hemen hemen tüm cilt tipleri için güvenlidir. Hamilelikte de kullanılabilir. Hassas ciltlerde %5'in altındaki konsantrasyonlarla başlamak önerilir.

## Nasıl Kullanılır?

Temizlik sonrası, serum aşamasında uygulanır. C vitamini ile birlikte kullanım eskiden çelişki olarak bilinse de güncel araştırmalar bunun bir mit olduğunu göstermiştir.

## Dikkat Edilmesi Gerekenler

Çok yüksek konsantrasyonlar (%20+) bazı kullanıcılarda geçici kızarıklık yapabilir. Güvenli aralık %5-10'dur.`,
  },
  {
    slug: 'retinol-kullanim-kilavuzu',
    title: 'Retinol Kullanım Kılavuzu — Başlangıçtan İleri Seviyeye',
    excerpt: 'Retinol, kollajen sentezini uyaran A vitamini türevi. Doğru başlangıç, doz artırımı ve yan etki yönetimi.',
    category: 'içerik-bilgisi',
    tags: ['retinol', 'anti-aging', 'kırışıklık', 'yaşlanma'],
    reading_time_min: 8,
    content: `# Retinol Kullanım Kılavuzu

Retinol, A vitamininin bir türevi olan retinoid ailesinin en çok kullanılan üyesidir. Kollajen sentezini uyarır, hücre yenilenmesini hızlandırır ve ince çizgilerin görünümünü azaltır.

## Başlangıç Aşaması

- **%0.1 ile başlayın**: İlk 4 hafta haftada 2 kez.
- **Retinizasyon dönemi**: Kuruluk, soyulma, hafif kızarıklık ilk 2-4 haftada normaldir.
- **SPF zorunlu**: Retinol cildin UV hassasiyetini artırır. Her sabah geniş spektrumlu SPF kullanılmalıdır.

## Doz Artırımı

Cildiniz toleransı geliştirdikçe %0.3, %0.5 ve %1'e çıkabilirsiniz. Bu geçiş minimum 8-12 hafta sürer.

## Kaçınılması Gerekenler

- **Hamilelik ve emzirme**: Retinoidler kesinlikle kullanılmaz.
- **AHA/BHA ile aynı akşam**: Tahriş riski.
- **Benzoil peroksit**: Retinolü etkisizleştirir.

## Sandviç Tekniği

Hassas ciltler için: nemlendirici → retinol → nemlendirici şeklinde uygulama tahrişi azaltır.`,
  },
  {
    slug: 'rozasea-ile-bas-etme',
    title: 'Rozasea ile Baş Etme — İçerik Seçimi ve Kaçınılması Gerekenler',
    excerpt: 'Rozasea kronik bir cilt durumudur. Doğru içerik seçimi ve tetikleyicilerden kaçınma semptomları hafifletir.',
    category: 'durum-rehberi',
    tags: ['rozasea', 'hassas-cilt', 'azelaic-asit', 'centella'],
    reading_time_min: 7,
    content: `# Rozasea Nedir?

Rozasea; yüzde kızarıklık, görünür damarlar ve bazen akne benzeri kabarcıklarla seyreden kronik bir cilt durumudur. Tam tedavisi olmasa da kontrol altına alınabilir.

## Faydalı İçerikler

- **Azelaic asit (%10-15)**: Anti-enflamatuar ve anti-bakteriyel.
- **Centella asiatica**: Kızarıklığı azaltır, bariyeri güçlendirir.
- **Niacinamide**: Damar kırılganlığını azaltır.
- **Sukralfat ve panthenol**: Onarıcı etkili.

## Kaçınılması Gerekenler

- Parfüm ve esansiyel yağlar
- Yüksek alkol içeren tonikler
- Fiziksel peelingler
- Sıcak duş ve saunalar
- Baharatlı yiyecekler ve alkol

## Güneş Koruması

Rozasea hastalarında UV en büyük tetikleyicilerden biridir. Mineral filtreli (çinko oksit, titanyum dioksit) SPF 50 tercih edilmelidir.`,
  },
  {
    slug: 'hyaluronik-asit-nemlendirmenin-bilimsel-temeli',
    title: 'Hyaluronik Asit: Nemlendirmenin Bilimsel Temeli',
    excerpt: 'Hyaluronik asit, kendi ağırlığının 1000 katı suyu tutabilen bir moleküldür. Düşük ve yüksek moleküler ağırlığın farkı.',
    category: 'içerik-bilgisi',
    tags: ['hyaluronik-asit', 'nem', 'serum', 'kuru-cilt'],
    reading_time_min: 5,
    content: `# Hyaluronik Asit Nedir?

Hyaluronik asit (HA), vücutta doğal olarak bulunan bir glikozaminoglikan molekülüdür. Cildin su bağlama kapasitesini belirleyen ana bileşenlerden biridir.

## Moleküler Ağırlık Farkı

- **Yüksek MA**: Cilt yüzeyinde film oluşturur, anlık nem sağlar.
- **Düşük MA**: Derin katmanlara nüfuz eder, uzun vadeli etki yapar.

İyi bir serum her iki formu da içerir.

## Nasıl Kullanılır?

**Kritik nokta**: HA çevresinden su çeker. Kuru havada, nemli cilde uygulanmalı ve üzerine bir kapatıcı nemlendirici sürülmelidir. Aksi halde cildin kendi suyunu çeker ve kurutur.

## Kimler İçin?

Tüm cilt tipleri güvenle kullanabilir. Hamilelik ve emzirme döneminde de güvenlidir.`,
  },
  {
    slug: 'c-vitamini-serumu-hangi-formlar-cildinize-uygun',
    title: 'C Vitamini Serumu: Hangi Formlar Cildinize Uygun?',
    excerpt: 'L-askorbik asit, SAP, MAP, THD askorbat — hangi C vitamini formu hangi cilt için en uygun?',
    category: 'içerik-bilgisi',
    tags: ['c-vitamini', 'askorbik-asit', 'leke', 'antioksidan'],
    reading_time_min: 7,
    content: `# C Vitamini Formları

C vitamini kozmetikte birçok farklı molekül olarak kullanılır. Hepsinin etkinliği ve stabilitesi farklıdır.

## Yaygın Formlar

- **L-askorbik asit**: Altın standart. En etkili, ancak en az stabil. %10-20 etkin aralığı.
- **SAP (Sodium Ascorbyl Phosphate)**: Daha stabil, akne eğilimli cilt için.
- **MAP (Magnesium Ascorbyl Phosphate)**: Hassas cilt dostu.
- **THD askorbat**: Yağda çözünen, en yeni nesil. Derin nüfuz, en az tahriş.

## Hangi Cilt Tipine Ne?

- **Yağlı/akne**: SAP
- **Hassas**: MAP veya THD
- **Normal/kuru, ileri düzey**: L-askorbik asit

## Stabilite

L-askorbik asit ışık ve hava ile okside olur. Koyu şişe, airless pompa ve 3 ay içinde tüketim önemlidir. Serum sararmaya başladıysa etkinliğini kaybetmiştir.`,
  },
  {
    slug: 'akne-nedenleri-ve-dermokozmetik-tedavisi',
    title: 'Akne Nedenleri ve Dermokozmetik Tedavisi',
    excerpt: 'Akne multifaktöriyel bir durumdur. Sebum, bakteri, tıkanıklık ve enflamasyon arasındaki denge.',
    category: 'durum-rehberi',
    tags: ['akne', 'bha', 'salisilik-asit', 'benzoil-peroksit'],
    reading_time_min: 8,
    content: `# Akne Neden Oluşur?

Akne; aşırı sebum üretimi, ölü hücre birikimi, Cutibacterium acnes bakteri çoğalması ve enflamasyon faktörlerinin birleşimidir.

## Etkili İçerikler

- **Salisilik asit (BHA) %2**: Gözenek içine nüfuz eder, tıkanıklığı açar.
- **Benzoil peroksit %2.5-5**: Bakteriyal etkili.
- **Adapalen %0.1**: Reçetesiz retinoid, Türkiye'de mevcut.
- **Niacinamide %5-10**: Kızarıklığı azaltır.
- **Çay ağacı yağı**: Anti-bakteriyel (hassas ciltte sulandırılmalı).

## Rutin Örneği (akne eğilimli cilt için)

**Sabah:** yumuşak jel temizleyici → niacinamide serum → hafif nemlendirici → SPF
**Akşam:** temizleyici → BHA (haftada 3) veya adapalen → nemlendirici

## Kaçınılması Gerekenler

Komedojenik yağlar (koko yağı, wheat germ), ağır kremler, sık yüz yıkama, agresif ovma.`,
  },
  {
    slug: 'spf-secim-rehberi',
    title: 'SPF Seçim Rehberi: Fiziksel vs Kimyasal Filtreler',
    excerpt: 'Güneş koruyucular iki ana kategoriye ayrılır. Hangisi sizin için doğru?',
    category: 'içerik-bilgisi',
    tags: ['spf', 'güneş-koruma', 'uv', 'fotokoruma'],
    reading_time_min: 6,
    content: `# SPF Filtrelerinin Türleri

## Fiziksel (Mineral) Filtreler

- **Çinko oksit** ve **titanyum dioksit**
- UV'yi yansıtır
- Hemen koruma başlar
- Hassas cilt, çocuk, hamilelik için güvenli
- Beyaz iz bırakma riski vardır

## Kimyasal Filtreler

- Avobenzon, oktinoksat, oktokrilen, tinosorb
- UV'yi emer ve ısıya çevirir
- Daha hafif doku, cilde işlenir
- Uygulamadan 15-20 dk sonra aktif
- Bazı formüller rozaseayı tetikleyebilir

## Ne Seçmeliyim?

- **Rozasea/hassas**: Mineral
- **Günlük kullanım, makyaj altı**: Hibrit veya kimyasal
- **Bebek, çocuk**: Mineral
- **Plaj**: Su geçirmez kimyasal + sık yenileme

## SPF Derecesi

SPF 30 UVB'nin %97'sini, SPF 50 %98'ini engeller. Daha yüksek değerler marjinal fark yaratır. Doğru miktarda (yüze 2 parmak boyu) uygulamak daha kritiktir.`,
  },
  {
    slug: 'hassas-cilt-bariyer-onarimi',
    title: 'Hassas Cilt Bariyer Onarımı Adım Adım',
    excerpt: 'Hasarlı cilt bariyeri kaşıntı, kızarıklık ve kurumaya yol açar. 4 haftalık onarım protokolü.',
    category: 'durum-rehberi',
    tags: ['hassas-cilt', 'bariyer', 'seramid', 'cica'],
    reading_time_min: 7,
    content: `# Bariyer Nedir?

Cilt bariyeri; stratum korneum katmanındaki seramid, kolesterol ve yağ asitlerinden oluşan koruyucu yapıdır. Hasar gördüğünde su kaybı artar ve cilt her şeye reaksiyon vermeye başlar.

## Bariyer Hasarının Belirtileri

- Sürekli kaşıntı ve yanma
- Kızarıklık ve sıcaklık hissi
- Ürünler "batmaya" başlıyor
- Kuruluk ve pul pul dökülme

## Onarım Protokolü (4 Hafta)

**Hafta 1-2: Minimalizm**
- Yumuşak hafif asitli temizleyici
- Nemlendirici (seramid, niacinamide, panthenol)
- SPF
- Tüm aktifleri (retinol, AHA, BHA, C vit) bırak

**Hafta 3-4: Kademeli ekleme**
- Centella, cica ürünleri eklenebilir
- Hâlâ aktif yok

**Hafta 5+**: Bariyer toparladıktan sonra tek tek aktifler düşük doz geri alınır.

## Faydalı İçerikler

Seramid, kolesterol, palmitoil tripeptit, panthenol, madecassoside, Zn PCA.`,
  },
  {
    slug: 'hamilelikte-guvenli-cilt-bakimi',
    title: 'Hamilelikte Güvenli Cilt Bakımı',
    excerpt: 'Hamilelikte hangi içerikler güvenli, hangileri kaçınılmalı? Tıbbi açıdan doğrulanmış liste.',
    category: 'durum-rehberi',
    tags: ['hamilelik', 'güvenli', 'retinoid-free', 'bebek'],
    reading_time_min: 6,
    content: `# Hamilelikte Cilt Bakımı

Hamilelikte birçok içerik sistemik emilim nedeniyle önerilmez. Ancak cilt bakımı tamamen bırakılmalı değildir.

## Kaçınılması Gerekenler

- **Retinoidler**: Retinol, adapalen, tretinoin, izotretinoin
- **Yüksek doz salisilik asit**: %2 üzeri kaçın, düşük yüzde tolere edilebilir
- **Hidrokinon**: Teratojenik risk
- **Benzoil peroksit**: %5 altı oral konsültasyonla
- **Kimyasal SPF filtreler**: Oksibenzon, oktinoksat ihtiyatla

## Güvenli İçerikler

- **Azelaic asit**: Hem akne hem leke için güvenli
- **Niacinamide**: Tam güvenli
- **Hyaluronik asit**: Güvenli
- **Glikolik asit** (düşük %): Kabul edilir
- **Mineral SPF**: Çinko oksit, titanyum dioksit

## Sık Görülen Sorunlar

- **Melazma (gebelik maskesi)**: Azelaic asit + sıkı SPF
- **Akne**: Azelaic asit, düşük doz glikolik
- **Çatlaklar**: Shea butter, cocoa butter, E vit

Her durumda dermatoloğunuza ve jinekoloğunuza danışın.`,
  },
  {
    slug: 'leke-tedavisi-melazma-post-inflamatuar-gunes-lekeleri',
    title: 'Leke Tedavisi: Melazma, Post-İnflamatuar, Güneş Lekeleri',
    excerpt: 'Üç farklı leke türü, üç farklı tedavi yaklaşımı. Doğru teşhis başlangıç noktasıdır.',
    category: 'durum-rehberi',
    tags: ['leke', 'melazma', 'pih', 'c-vitamini', 'azelaic'],
    reading_time_min: 8,
    content: `# Leke Türleri

## 1. Melazma

Hormonal tetikli, genellikle alın, üst dudak ve yanaklarda simetrik. Hamilelik ve doğum kontrol hapı ile ilişkili.

**Tedavi:**
- Sıkı SPF 50 (her gün, kapalı havada bile)
- Azelaic asit %10-20
- Triple combination (hidrokinon + tretinoin + kortizon) — dermatolog reçetesi
- Traneksamik asit (topikal veya oral)

## 2. Post-İnflamatuar Hiperpigmentasyon (PIH)

Akne, yanık, egzama sonrası kahverengi izler. Zamanla solar, ancak hızlandırılabilir.

**Tedavi:**
- Niacinamide %5-10
- Azelaic asit
- C vitamini
- Alfa arbutin
- Düşük doz retinol (tolere edilirse)

## 3. Güneş Lekeleri (Lentigo)

Kronik UV'ye bağlı. Genellikle el sırtı, dekolte ve yanaklarda.

**Tedavi:**
- C vitamini (L-askorbik %15+)
- Retinol
- Glikolik asit peeling
- Profesyonel laser veya IPL

## Ortak Kural

**SPF olmadan hiçbir leke tedavisi işe yaramaz.** Güneş korunması yoksa yeni melanin sürekli üretilir ve tedavi etkisiz kalır.`,
  },
];

(async () => {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  try {
    console.log('=== Reviewers ===');
    const revIds = {};
    for (const r of reviewers) {
      const res = await c.query(
        `INSERT INTO reviewers (name, title, credentials, specialty, bio, avatar_url, license_no, verified_at, public_slug)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8)
         ON CONFLICT (public_slug) DO UPDATE SET name=EXCLUDED.name
         RETURNING reviewer_id`,
        [r.name, r.title, r.credentials, r.specialty, r.bio, r.avatar_url, r.license_no, r.public_slug],
      );
      revIds[r.public_slug] = res.rows[0].reviewer_id;
      console.log(`  ✓ ${r.name} (id=${res.rows[0].reviewer_id})`);
    }

    console.log('=== Authors ===');
    const authorIds = {};
    for (const a of authors) {
      const res = await c.query(
        `INSERT INTO authors (name, title, credentials, bio, public_slug)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (public_slug) DO UPDATE SET name=EXCLUDED.name
         RETURNING author_id`,
        [a.name, a.title, a.credentials, a.bio, a.public_slug],
      );
      authorIds[a.public_slug] = res.rows[0].author_id;
      console.log(`  ✓ ${a.name} (id=${res.rows[0].author_id})`);
    }

    const authorId = authorIds['revela-ekibi'];
    const reviewerIds = Object.values(revIds);

    console.log('=== Blog Posts ===');
    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      const reviewerId = reviewerIds[i % reviewerIds.length];
      await c.query(
        `INSERT INTO blog_posts (slug, title, excerpt, content_mdx, author_id, medical_reviewer_id,
                                  category, tags, reading_time_min, published_at, status, seo_meta)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),'published','{}'::jsonb)
         ON CONFLICT (slug) DO UPDATE SET
           title=EXCLUDED.title,
           excerpt=EXCLUDED.excerpt,
           content_mdx=EXCLUDED.content_mdx,
           medical_reviewer_id=EXCLUDED.medical_reviewer_id,
           tags=EXCLUDED.tags,
           status='published',
           published_at=COALESCE(blog_posts.published_at, NOW())`,
        [p.slug, p.title, p.excerpt, p.content, authorId, reviewerId, p.category, p.tags, p.reading_time_min],
      );
      console.log(`  ✓ ${p.slug}`);
    }

    const count = await c.query(`SELECT COUNT(*)::int AS n FROM blog_posts WHERE status='published'`);
    console.log(`\nTotal published blog posts: ${count.rows[0].n}`);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  } finally {
    await c.end();
  }
})();
