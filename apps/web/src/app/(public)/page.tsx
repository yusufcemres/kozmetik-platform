import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import ProductCarousel from '@/components/public/ProductCarousel';
import NewsletterForm from '@/components/public/NewsletterForm';

// === Types ===

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand?: { brand_name: string };
  category?: { category_name: string };
  images?: { image_url: string; sort_order?: number }[];
  need_scores?: { compatibility_score: number }[];
}

interface Category {
  category_id: number;
  category_name: string;
  category_slug: string;
  parent_category_id: number | null;
  children?: Category[];
}

interface Brand {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  product_count: string;
}

// === Data Fetching (ISR) ===

async function getHomeData() {
  const [topProducts, latestRes, categories, brands, ingredientCountRes, supplementsRes] = await Promise.allSettled([
    apiFetch<Product[]>('/products/top-scored?limit=8&domain_type=cosmetic', { next: { revalidate: 300 } } as any),
    apiFetch<{ data: Product[]; meta: { total: number } }>('/products?limit=6&page=1&domain_type=cosmetic', { next: { revalidate: 1800 } } as any),
    apiFetch<Category[]>('/categories/tree', { next: { revalidate: 86400 } } as any),
    apiFetch<Brand[]>('/products/popular-brands?limit=12', { next: { revalidate: 300 } } as any),
    apiFetch<{ data: unknown[]; meta: { total: number } }>('/ingredients?limit=1&page=1', { next: { revalidate: 86400 } } as any),
    apiFetch<{ data: Product[]; meta: { total: number } }>('/products?limit=6&page=1&domain_type=supplement', { next: { revalidate: 300 } } as any),
  ]);

  const FALLBACK_PRODUCT_COUNT = 1903;
  const FALLBACK_INGREDIENT_COUNT = 5200;
  const FALLBACK_BRAND_COUNT = 113;

  const latestData = latestRes.status === 'fulfilled' ? latestRes.value : { data: [], meta: { total: 0 } };
  const brandsData = brands.status === 'fulfilled' ? brands.value : [];
  const ingredientData = ingredientCountRes.status === 'fulfilled' ? ingredientCountRes.value.meta?.total || 0 : 0;
  const supplementData = supplementsRes.status === 'fulfilled' ? supplementsRes.value : { data: [], meta: { total: 0 } };

  return {
    topProducts: topProducts.status === 'fulfilled' ? topProducts.value : [],
    latest: {
      ...latestData,
      meta: { total: latestData.meta?.total || FALLBACK_PRODUCT_COUNT },
    },
    supplementCount: supplementData.meta?.total || 0,
    categories: categories.status === 'fulfilled' ? categories.value : [],
    brands: brandsData,
    brandCount: brandsData.length > 12 ? brandsData.length : FALLBACK_BRAND_COUNT,
    ingredientCount: ingredientData || FALLBACK_INGREDIENT_COUNT,
  };
}

// === Helpers ===

function avgScore(product: Product): number | null {
  if (!product.need_scores?.length) return null;
  return Math.round(
    product.need_scores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) /
      product.need_scores.length,
  );
}

// === Quiz Cards ===

const QUIZ_CARDS = [
  { href: '/cilt-analizi', icon: 'water_drop', title: 'Cilt Analizi', motto: 'Cildini tanı, doğruyu bul. Cilt tipini, ihtiyaçlarını ve hassasiyetlerini analiz ederiz.', detail: '7 soru · AI destekli', duration: '~2 dk', badge: 'AI' },
  { href: '/beslenme-analizi', icon: 'nutrition', title: 'Beslenme Analizi', motto: 'Eksik olan ne? Beden konuşuyor. Takviye ihtiyacını bilimsel yaklaşımla belirle.', detail: '8 soru · Kişiselleştirilmiş', duration: '~3 dk', badge: 'YENİ' },
  { href: '/sac-analizi', icon: 'face_retouching_natural', title: 'Saç Analizi', motto: 'Saçın sana bir şeyler anlatıyor. Kişisel saç bakım planını oluştur.', detail: '6 soru · Kişiselleştirilmiş', duration: '~2 dk', badge: 'YENİ' },
  { href: '/cilt-yasi-testi', icon: 'timer', title: 'Cilt Yaşı Testi', motto: 'Ayna yalan söyler, biz söylemeyiz. Cildinin gerçek yaşını öğren.', detail: '5 soru · 1 dakikada sonuç', duration: '~1 dk', badge: 'VİRAL' },
  { href: '/icerik-testi', icon: 'quiz', title: 'İçerik Bilgi Testi', motto: 'Ne kadar biliyorsun? Kozmetik içerik bilgini eğlenceli bir testle ölç.', detail: '10 soru · Bilgi yarışması', duration: '~2 dk', badge: null },
];

// === Product Card ===

function ProductCard({ product }: { product: Product }) {
  const primaryImg = product.images?.find(i => i.sort_order === 0)?.image_url || product.images?.[0]?.image_url;
  const hoverImg = product.images?.find(i => i.sort_order === 1)?.image_url;
  const score = avgScore(product);

  return (
    <Link
      href={`/urunler/${product.product_slug}`}
      className="flex flex-col curator-card p-3 group min-w-[180px] w-[180px] lg:min-w-[200px] lg:w-[200px] snap-start shrink-0"
    >
      <div className="aspect-[3/4] bg-surface-container-low mb-3 overflow-hidden rounded-sm relative">
        {primaryImg ? (
          <>
            <Image
              src={primaryImg}
              alt={product.product_name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className={`object-contain transition-all duration-500 ${hoverImg ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'}`}
            />
            {hoverImg && (
              <Image
                src={hoverImg}
                alt={`${product.product_name} - detay`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-contain opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-icon material-icon-lg text-outline-variant">inventory_2</span>
          </div>
        )}
      </div>
      <div className="space-y-1 min-w-0">
        {product.brand && (
          <p className="label-caps text-outline truncate">{product.brand.brand_name}</p>
        )}
        <h4 className="text-sm font-semibold tracking-tight text-on-surface line-clamp-2 leading-tight">
          {product.product_name}
        </h4>
        {product.category && (
          <p className="text-[10px] text-on-surface-variant truncate">
            {product.category.category_name}
          </p>
        )}
        {score !== null && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${score >= 70 ? 'bg-score-high' : score >= 40 ? 'bg-score-medium' : 'bg-score-low'}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold ${score >= 70 ? 'text-score-high' : score >= 40 ? 'text-score-medium' : 'text-score-low'}`}>
              %{score}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// === Page ===

export default async function HomePage() {
  const { topProducts, latest, supplementCount, brands, brandCount, ingredientCount } = await getHomeData();
  const featuredProducts = topProducts.length > 0 ? topProducts : (latest.data || []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'REVELA',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kozmetik-platform.vercel.app',
    description: 'Kozmetik ve takviye ürünlerinin INCI içeriklerini analiz et, fiyatları karşılaştır, sana en uygun ürünleri bilimsel kanıtlarla keşfet.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kozmetik-platform.vercel.app'}/urunler?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero — Google style */}
      <section className="min-h-[calc(100vh-57px)] sm:min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        {/* Logo */}
        <div className="mb-2">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter text-on-surface leading-none">
            REVELA
          </h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-outline mt-2">
            Kozmetik · Takviye · Bakım Analizi
          </p>
        </div>

        {/* Search bar */}
        <form action="/ara" className="w-full max-w-xl mt-10">
          <div className="relative">
            <span className="material-icon text-outline absolute left-5 top-1/2 -translate-y-1/2 text-[22px]" aria-hidden="true">search</span>
            <input
              type="text"
              name="q"
              placeholder="Ürün, marka veya içerik ara..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full pl-14 pr-5 py-4 text-sm sm:text-base text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 focus:shadow-lg transition-all"
            />
          </div>
        </form>

        {/* Popular searches */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-5">
          <span className="text-xs text-outline">Popüler:</span>
          {['Retinol', 'Niacinamide', 'Vitamin C', 'Hyaluronic Acid', 'SPF'].map((term) => (
            <Link
              key={term}
              href={`/urunler?search=${encodeURIComponent(term)}`}
              className="text-xs text-on-surface-variant hover:text-primary transition-colors underline underline-offset-2"
            >
              {term}
            </Link>
          ))}
        </div>

        {/* Stats — compact inline */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-10 gap-y-3 mt-16 text-center">
          {[
            { label: 'Kozmetik', value: latest.meta?.total || 0 },
            { label: 'Takviye', value: supplementCount || 0 },
            { label: 'İçerik', value: ingredientCount || 0 },
            { label: 'Marka', value: brandCount || 0 },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-on-surface">
                {s.value > 999 ? `${(s.value / 1000).toFixed(1)}K` : s.value}+
              </span>
              <span className="text-[10px] uppercase tracking-wider text-outline">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Seni Taniyalim — Katalog Kartlar */}
      <section id="seni-taniyalim" className="py-14 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-16 bg-surface-container-low scroll-mt-16">
        <div className="text-center mb-8 sm:mb-12">
          <span className="label-caps text-outline mb-3 block tracking-[0.4em]">Seni Tanıyalım</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl headline-tight text-on-surface">
            KİŞİSEL ANALİZLERLE<br />
            <span className="text-outline-variant">İHTİYACINI KEŞFET.</span>
          </h2>
          <p className="text-on-surface-variant text-sm mt-4 max-w-lg mx-auto">
            Kişisel testlerle ihtiyaçlarını keşfet, sana özel önerilere ulaş.
          </p>
        </div>
        <ProductCarousel>
          {QUIZ_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="curator-card p-8 sm:p-10 group hover:border-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 snap-start shrink-0 w-[280px] sm:w-[320px]"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-icon text-primary text-[32px]" aria-hidden="true">{card.icon}</span>
                </div>
                {card.badge && (
                  <span className="bg-primary text-on-primary text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide">
                    {card.badge}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-on-surface text-xl mb-2 group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              <p className="text-base text-on-surface-variant leading-relaxed mb-3">
                {card.motto}
              </p>
              <p className="text-xs text-outline mb-5 tracking-wide">{card.detail}</p>
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Teste Başla
                </span>
                <span className="material-icon text-outline-variant text-[20px] group-hover:text-primary group-hover:translate-x-1 transition-all" aria-hidden="true">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </ProductCarousel>
      </section>

      {/* 5. En Uyumlu Urunler — Tek Carousel */}
      {featuredProducts.length > 0 && (
        <section className="py-14 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-16 bg-surface">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="label-caps text-outline mb-3 block tracking-[0.4em]">Bilimsel Analiz</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl headline-tight text-on-surface">EN UYUMLU ÜRÜNLER</h2>
            </div>
            <Link href="/urunler" className="label-caps text-on-surface-variant hover:text-on-surface underline-offset-8 hover:underline transition-all hidden sm:block">
              Tümünü Gör
            </Link>
          </div>
          <ProductCarousel>
            {featuredProducts.slice(0, 12).map((p: Product) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </ProductCarousel>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/urunler" className="label-caps text-primary hover:underline underline-offset-4">
              Tüm Ürünleri Gör
              <span className="material-icon material-icon-sm ml-1" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>
      )}

      {/* 6. Neden REVELA — Güven + Nasıl Çalışıyor birleşik */}
      <section className="py-14 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-16 bg-surface-container-low">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="label-caps text-outline mb-3 block tracking-[0.4em]">Neden REVELA?</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl headline-tight text-on-surface">
              BAĞIMSIZ.<br />
              <span className="text-outline-variant">BİLİMSEL.</span>
            </h2>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {[
              {
                icon: 'verified',
                title: `${(latest.meta?.total || 0) + (supplementCount || 0)}+ Ürün Analizi`,
                desc: 'Kozmetik ve takviye ürünleri INCI bazlı bilimsel verilerle değerlendirildi.',
              },
              {
                icon: 'block',
                title: 'Sponsorlu Sıralama Yok',
                desc: 'Hiçbir marka ödeme ile öne çıkarılmaz. Skorlar tamamen veri odaklı.',
              },
              {
                icon: 'menu_book',
                title: `${ingredientCount || 0}+ İçerik Maddesi`,
                desc: 'Her içerik maddesi bilimsel kaynaklardan derlenen verilerle açıklanır.',
              },
            ].map((item) => (
              <div key={item.title} className="curator-card p-6 text-center">
                <span className="material-icon text-primary text-[32px] mb-4 block" aria-hidden="true">{item.icon}</span>
                <h3 className="text-base font-bold text-on-surface mb-2">{item.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Steps — Nasıl Çalışıyor */}
          <div className="border-t border-outline-variant/20 pt-10 sm:pt-12">
            <p className="label-caps text-outline text-center mb-8 tracking-[0.4em]">Nasıl Çalışıyor?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {[
                { step: '01', title: 'Ara veya Analiz Yap', desc: 'Ürünü ara ya da kişisel testi çöz.' },
                { step: '02', title: 'İçeriğini İncele', desc: 'INCI analizini ve skorları gör.' },
                { step: '03', title: 'Karşılaştır & Seç', desc: 'Senin için en uygununu bul.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <span className="text-3xl font-extrabold text-primary/40 tracking-tighter block mb-2">{item.step}</span>
                  <h3 className="text-base font-bold text-on-surface mb-1">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/urunler" className="curator-btn-primary inline-flex items-center gap-2">
                Keşfetmeye Başla
                <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Newsletter */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-16 bg-surface text-center">
        <span className="label-caps text-outline mb-3 block tracking-[0.4em]">Güncel Kal</span>
        <h2 className="text-xl sm:text-2xl headline-tight text-on-surface mb-3">
          YENİLİKLERDEN HABERDAR OL
        </h2>
        <p className="text-sm text-on-surface-variant mb-6 max-w-md mx-auto">
          Yeni ürün analizleri, içerik rehberleri ve kampanyalardan ilk sen haberdar ol.
        </p>
        <NewsletterForm />
        <p className="text-[11px] text-outline mt-3">Spam yok, istediğin zaman çık.</p>
      </section>

      {/* 8. Populer Markalar */}
      {brands.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-16 border-t border-outline-variant/10">
          <p className="label-caps text-outline text-center mb-6 sm:mb-8 tracking-[0.4em]">Popüler Markalar</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-12 opacity-50 hover:opacity-80 transition-all duration-700">
            {brands.slice(0, 8).map((b: Brand) => (
              <Link
                key={b.brand_id}
                href={`/urunler?brand=${b.brand_slug}`}
                className="text-sm sm:text-lg lg:text-xl font-bold tracking-tight text-on-surface hover:text-primary transition-colors"
              >
                {b.brand_name.toUpperCase()}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 9. Disclosure */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <p className="text-xs text-outline text-center leading-relaxed">
          REVELA bağımsız bir bilgi platformudur. Sunduğumuz bilgiler tıbbi tavsiye
          niteliğinde değildir. Ürün sayfalarındaki satın alma linkleri komisyon içerebilir.{' '}
          <Link href="/hakkimizda" className="underline hover:text-on-surface-variant transition-colors">
            Daha fazla bilgi.
          </Link>
        </p>
      </section>
    </div>
  );
}
