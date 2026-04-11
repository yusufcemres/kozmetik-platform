import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import ProductCarousel from '@/components/public/ProductCarousel';

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
  const [topProducts, latestRes, categories, brands, ingredientCountRes] = await Promise.allSettled([
    apiFetch<Product[]>('/products/top-scored?limit=8', { next: { revalidate: 3600 } } as any),
    apiFetch<{ data: Product[]; meta: { total: number } }>('/products?limit=6&page=1', { next: { revalidate: 1800 } } as any),
    apiFetch<Category[]>('/categories/tree', { next: { revalidate: 86400 } } as any),
    apiFetch<Brand[]>('/products/popular-brands?limit=12', { next: { revalidate: 3600 } } as any),
    apiFetch<{ data: unknown[]; meta: { total: number } }>('/ingredients?limit=1&page=1', { next: { revalidate: 86400 } } as any),
  ]);

  // Fallback stats when API is down (last known values)
  const FALLBACK_PRODUCT_COUNT = 1903;
  const FALLBACK_INGREDIENT_COUNT = 5200;
  const FALLBACK_BRAND_COUNT = 113;

  const latestData = latestRes.status === 'fulfilled' ? latestRes.value : { data: [], meta: { total: 0 } };
  const brandsData = brands.status === 'fulfilled' ? brands.value : [];
  const ingredientData = ingredientCountRes.status === 'fulfilled' ? ingredientCountRes.value.meta?.total || 0 : 0;

  return {
    topProducts: topProducts.status === 'fulfilled' ? topProducts.value : [],
    latest: {
      ...latestData,
      meta: { total: latestData.meta?.total || FALLBACK_PRODUCT_COUNT },
    },
    categories: categories.status === 'fulfilled' ? categories.value : [],
    brands: brandsData,
    brandCount: brandsData.length || FALLBACK_BRAND_COUNT,
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
  const { topProducts, latest, categories, brands, brandCount, ingredientCount } = await getHomeData();
  const featuredProducts = topProducts.length > 0 ? topProducts : (latest.data || []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'REVELA',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kozmetik-platform.vercel.app',
    description: 'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri bilimsel kanıtlarla keşfet.',
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

      {/* Hero — Full viewport, centered like a search engine */}
      <section className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] headline-tight leading-[0.85] mb-4 text-on-surface">
          CİLDİNİ<br />
          <span className="text-outline-variant">ANLA.</span>
        </h1>
        <p className="text-lg lg:text-xl text-on-surface-variant/50 font-medium tracking-wide mb-6">
          Bilinçli alışveriş deneyimi.
        </p>
        <p className="max-w-md text-base lg:text-lg text-on-surface-variant mb-10 leading-relaxed">
          30 saniyede cilt tipini öğren, sana özel ürünleri bilimsel kanıtlarla keşfet.
        </p>
        <Link
          href="/cilt-analizi"
          className="curator-btn-primary text-sm px-10 py-4"
        >
          Cilt Analizini Başlat
          <span className="material-icon material-icon-sm ml-1" aria-hidden="true">arrow_forward</span>
        </Link>
        <Link
          href="/urunler"
          className="mt-4 text-sm text-on-surface-variant hover:text-on-surface underline underline-offset-4 transition-colors"
        >
          veya ürünleri keşfet
        </Link>

        {/* Stats — bottom of hero */}
        <div className="flex flex-wrap justify-center gap-8 lg:gap-14 mt-16 lg:mt-20">
          {[
            { label: 'Ürün', value: latest.meta?.total || 0 },
            { label: 'İçerik', value: ingredientCount || 0 },
            { label: 'Marka', value: brandCount || 0 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
                {s.value > 999 ? `${(s.value / 1000).toFixed(1)}K` : s.value}+
              </p>
              <p className="label-caps text-outline mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Products Carousel */}
      {featuredProducts.length > 0 && (
        <section className="py-16 lg:py-24 px-6 lg:px-16 bg-surface-container-low">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="label-caps text-outline mb-3 block tracking-[0.4em]">Bilimsel Analiz</span>
              <h2 className="text-3xl lg:text-4xl headline-tight text-on-surface">EN UYUMLU ÜRÜNLER</h2>
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
        </section>
      )}

      {/* Son Eklenenler — Grid */}
      {latest.data && latest.data.length > 0 && (
        <section className="py-16 lg:py-24 px-6 lg:px-16 bg-surface">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="label-caps text-outline mb-3 block tracking-[0.4em]">Yeni Keşifler</span>
              <h2 className="text-3xl lg:text-4xl headline-tight text-on-surface">SON EKLENENLER</h2>
            </div>
            <Link href="/urunler" className="label-caps text-on-surface-variant hover:text-on-surface underline-offset-8 hover:underline transition-all hidden sm:block">
              Tümünü Gör
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {latest.data.slice(0, 6).map((p: Product) => {
              const img = p.images?.find(i => i.sort_order === 0)?.image_url || p.images?.[0]?.image_url;
              const score = avgScore(p);
              return (
                <Link
                  key={p.product_id}
                  href={`/urunler/${p.product_slug}`}
                  className="curator-card p-3 group"
                >
                  <div className="aspect-square bg-surface-container-low mb-2 overflow-hidden rounded-sm relative">
                    {img ? (
                      <Image
                        src={img}
                        alt={p.product_name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icon text-outline-variant/30" style={{ fontSize: '32px' }} aria-hidden="true">spa</span>
                      </div>
                    )}
                    {score !== null && (
                      <div className="absolute top-1.5 right-1.5 bg-surface/90 backdrop-blur-sm rounded-sm px-1.5 py-0.5">
                        <span className={`text-[10px] font-bold ${score >= 70 ? 'text-score-high' : score >= 40 ? 'text-score-medium' : 'text-score-low'}`}>
                          %{score}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {p.brand && (
                      <p className="label-caps text-outline truncate text-[9px]">{p.brand.brand_name}</p>
                    )}
                    <h4 className="text-xs font-semibold text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {p.product_name}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* How It Works — 3 Steps */}
      <section className="py-20 lg:py-28 px-6 lg:px-16 bg-surface">
        <div className="text-center mb-14">
          <span className="label-caps text-outline mb-3 block tracking-[0.4em]">Nasıl Çalışıyor?</span>
          <h2 className="text-3xl lg:text-4xl headline-tight text-on-surface">3 ADIMDA KEŞFET</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {[
            { step: '01', icon: 'quiz', title: 'Cilt Analizi Yap', desc: '7 kısa soruyla cilt tipini, ihtiyaçlarını ve hassasiyetlerini belirle.' },
            { step: '02', icon: 'science', title: 'Sonuçları Gör', desc: 'INCI bazlı bilimsel analiz ile sana en uyumlu ürünleri keşfet.' },
            { step: '03', icon: 'shopping_bag', title: 'Satın Al', desc: 'Güvenceli affiliate linklerle en uygun fiyatlı platformu seç.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-icon text-primary text-[28px]" aria-hidden="true">{item.icon}</span>
              </div>
              <span className="label-caps text-outline block mb-2">{item.step}</span>
              <h3 className="text-lg font-bold tracking-tight text-on-surface mb-2">{item.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/cilt-analizi" className="curator-btn-primary text-sm px-8 py-3">
            Hemen Başla
            <span className="material-icon material-icon-sm ml-1" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Popular Brands */}
      {brands.length > 0 && (
        <section className="py-16 px-6 lg:px-16 border-t border-outline-variant/10">
          <p className="label-caps text-outline text-center mb-8 tracking-[0.4em]">Popüler Markalar</p>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-12 opacity-50 hover:opacity-80 transition-all duration-700">
            {brands.slice(0, 8).map((b: Brand) => (
              <Link
                key={b.brand_id}
                href={`/urunler?brand=${b.brand_slug}`}
                className="text-lg lg:text-xl font-bold tracking-tight text-on-surface hover:text-primary transition-colors"
              >
                {b.brand_name.toUpperCase()}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Disclosure — minimal */}
      <section className="max-w-[1200px] mx-auto px-6 py-8">
        <p className="text-xs text-outline text-center leading-relaxed">
          REVELA bağımsız bir bilgi platformudur. Sunduğumuz bilgiler tıbbi tavsiye
          niteliğinde değildir. Ürün sayfalarındaki satın alma linkleri komisyon içerebilir.{' '}
          <Link href="/hakkimizda" className="underline hover:text-on-surface-variant transition-colors">
            Daha fazla bilgi
          </Link>
        </p>
      </section>
    </div>
  );
}
