import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';

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

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
  short_description?: string;
  user_friendly_label?: string;
}

interface Brand {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  product_count: string;
}

// === Data Fetching (ISR) ===

async function getHomeData() {
  const [topProducts, latestRes, categories, needsRes, brands] = await Promise.allSettled([
    apiFetch<Product[]>('/products/top-scored?limit=8', { next: { revalidate: 3600 } } as any),
    apiFetch<{ data: Product[]; meta: { total: number } }>('/products?limit=6&page=1', { next: { revalidate: 1800 } } as any),
    apiFetch<Category[]>('/categories/tree', { next: { revalidate: 86400 } } as any),
    apiFetch<{ data: Need[] }>('/needs?limit=100', { next: { revalidate: 86400 } } as any),
    apiFetch<Brand[]>('/products/popular-brands?limit=12', { next: { revalidate: 3600 } } as any),
  ]);

  return {
    topProducts: topProducts.status === 'fulfilled' ? topProducts.value : [],
    latest: latestRes.status === 'fulfilled' ? latestRes.value : { data: [], meta: { total: 0 } },
    categories: categories.status === 'fulfilled' ? categories.value : [],
    needs: needsRes.status === 'fulfilled' ? needsRes.value.data || [] : [],
    brands: brands.status === 'fulfilled' ? brands.value : [],
  };
}

// === Helpers ===

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-score-high';
  if (score >= 40) return 'text-score-medium';
  return 'text-score-low';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-score-high';
  if (score >= 40) return 'bg-score-medium';
  return 'bg-score-low';
}

function avgScore(product: Product): number | null {
  if (!product.need_scores?.length) return null;
  return Math.round(
    product.need_scores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) /
      product.need_scores.length,
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  'Yüz Bakım': 'spa',
  'Temizleme': 'water_drop',
  'Güneş Koruma': 'wb_sunny',
  'Göz Bakım': 'visibility',
  'Dudak Bakım': 'mood',
  'Vücut Bakım': 'self_improvement',
  'Saç Bakım': 'content_cut',
  'Makyaj': 'palette',
};

// === Product Card ===

function ProductCard({ product, index }: { product: Product; index: number }) {
  const primaryImg = product.images?.find(i => i.sort_order === 0)?.image_url || product.images?.[0]?.image_url;
  const hoverImg = product.images?.find(i => i.sort_order === 1)?.image_url;
  const score = avgScore(product);
  const stars = score !== null ? Math.round(score / 20) : 0;

  return (
    <Link
      href={`/urunler/${product.product_slug}`}
      className={`flex flex-col curator-card p-4 -m-0 group ${index % 2 !== 0 ? 'mt-0 lg:mt-12' : ''}`}
    >
      <div className="aspect-[4/5] bg-surface-container-low mb-6 overflow-hidden rounded-sm relative">
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
      <div className="space-y-1.5">
        {product.brand && (
          <p className="label-caps text-outline">{product.brand.brand_name}</p>
        )}
        {score !== null && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-[14px] ${i <= stars ? 'material-icon-filled' : 'material-icon'} text-outline-variant`}
                style={{ fontSize: '14px' }}
                aria-hidden="true"
              >
                {i <= stars ? 'star' : (i - 0.5 <= stars ? 'star_half' : 'star')}
              </span>
            ))}
            <span className="label-caps text-outline-variant ml-1">%{score}</span>
          </div>
        )}
        <h4 className="text-lg font-semibold tracking-tight text-on-surface line-clamp-2">
          {product.product_name}
        </h4>
        {product.category && (
          <p className="text-xs text-on-surface-variant font-light">
            {product.category.category_name}
          </p>
        )}
      </div>
      <span className="mt-4 label-caps text-primary border-b border-primary/20 hover:border-primary pb-1 self-start transition-all duration-300">
        İncele
      </span>
    </Link>
  );
}

// === Page ===

export default async function HomePage() {
  const { topProducts, latest, categories, needs, brands } = await getHomeData();
  // Fallback: if top-scored fails, use latest products
  const featuredProducts = topProducts.length > 0 ? topProducts : (latest.data || []);
  const cosmNeeds = needs.filter((n: Need) => n.need_group !== 'supplement');
  const parentCats = categories.filter((c: Category) => !c.parent_category_id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'REVELA',
    url: 'https://revela.com.tr',
    description: 'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri bilimsel kanıtlarla keşfet.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://revela.com.tr/urunler?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 py-16 lg:py-24 mb-16 lg:mb-24">
        <div className="editorial-grid gap-8 items-end">
          <div className="col-span-12 lg:col-span-7 mb-12 lg:mb-0">
            <h1 className="text-6xl lg:text-8xl xl:text-9xl headline-tight leading-[0.85] mb-8 text-on-surface">
              CİLDİNİ<br />
              <span className="text-outline-variant">ANLA.</span>
            </h1>
            <p className="max-w-md text-lg text-on-surface-variant mb-10 leading-relaxed">
              INCI listesini analiz et, bilimsel kanıtlarla cildine en uygun ürünleri keşfet.
              Bağımsız, Türkçe, bilime dayalı.
            </p>
            <Link
              href="/ara"
              className="curator-btn-primary"
            >
              Koleksiyonu Keşfet
              <span className="material-icon material-icon-sm group-hover:translate-x-1 transition-transform" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
          <div className="col-span-12 lg:col-span-5 relative">
            {featuredProducts[0] ? (
              <>
                <Link href={`/urunler/${featuredProducts[0].product_slug}`} className="block">
                  <div className="aspect-[4/5] bg-surface-container-low overflow-hidden rounded-sm relative">
                    {featuredProducts[0].images?.[0]?.image_url ? (
                      <Image
                        src={featuredProducts[0].images[0].image_url}
                        alt={featuredProducts[0].product_name}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-contain transition-transform duration-700 hover:scale-105"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icon text-outline-variant" style={{ fontSize: '80px' }}>spa</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="absolute -bottom-6 -left-6 bg-tertiary-container p-6 hidden md:block max-w-[220px] rounded-sm">
                  <span className="label-caps text-on-tertiary-container block mb-3">Onerilen</span>
                  <p className="text-sm italic font-light text-on-tertiary-container">
                    &ldquo;{featuredProducts[0].product_name}&rdquo;
                  </p>
                </div>
              </>
            ) : (
              <div className="aspect-[4/5] bg-surface-container-low rounded-sm flex items-center justify-center">
                <span className="material-icon text-outline-variant" style={{ fontSize: '80px' }}>spa</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-start gap-12 mt-16 lg:mt-20">
          {[
            { label: 'Ürün Analizi', value: latest.meta?.total || 1785 },
            { label: 'İçerik Maddesi', value: 5000 },
            { label: 'Marka', value: 113 },
            { label: 'Kategori', value: categories.length || 57 },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl headline-tight text-on-surface">
                {s.value > 999 ? `${(s.value / 1000).toFixed(1)}K` : s.value}
              </p>
              <p className="label-caps text-outline mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Categories */}
      {parentCats.length > 0 && (
        <section className="bg-surface-container-low py-24 lg:py-32 px-6 lg:px-16">
          <div className="mb-16 flex justify-between items-end">
            <div>
              <h2 className="text-3xl lg:text-4xl headline-tight mb-2">KATEGORİLER</h2>
              <p className="label-caps text-on-surface-variant">Disipline göre keşfet</p>
            </div>
            <div className="h-px flex-grow mx-8 bg-outline-variant/20 hidden md:block" />
            <Link href="/urunler" className="label-caps hover:underline underline-offset-8 transition-all text-on-surface">
              Tümünü Gör
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {parentCats.slice(0, 8).map((cat: Category) => (
              <Link
                key={cat.category_id}
                href={`/urunler?category=${cat.category_slug}`}
                className="group relative bg-surface-container-lowest rounded-sm p-8 hover:shadow-lg transition-all duration-500 border border-outline-variant/10 hover:border-outline-variant/30"
              >
                <span
                  className="material-icon material-icon-lg text-primary/60 group-hover:text-primary transition-colors duration-500 block mb-4"
                  aria-hidden="true"
                >
                  {CATEGORY_ICONS[cat.category_name] || 'category'}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-on-surface">{cat.category_name}</h3>
                {cat.children && cat.children.length > 0 && (
                  <p className="label-caps text-on-surface-variant mt-2">
                    {cat.children.length} alt kategori
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Scored Products — New Arrivals style */}
      {featuredProducts.length > 0 && (
        <section className="py-24 lg:py-32 px-6 lg:px-16 bg-surface">
          <div className="text-center mb-16 lg:mb-20">
            <span className="label-caps text-outline mb-4 block tracking-[0.4em]">Bilimsel Analiz</span>
            <h2 className="text-4xl lg:text-5xl headline-tight text-on-surface">EN UYUMLU ÜRÜNLER</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {featuredProducts.slice(0, 8).map((p: Product, i: number) => (
              <ProductCard key={p.product_id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Brands */}
      {brands.length > 0 && (
        <section className="py-16 px-6 lg:px-16 border-t border-outline-variant/10">
          <div className="flex flex-wrap justify-between items-center gap-8 lg:gap-12 opacity-40 grayscale hover:opacity-60 hover:grayscale-0 transition-all duration-700">
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

      {/* How It Works */}
      <section className="py-24 lg:py-32 px-6 lg:px-16 bg-surface-container-low">
        <div className="editorial-grid gap-12 lg:gap-16">
          <div className="col-span-12 lg:col-span-5">
            <span className="label-caps text-outline mb-6 block tracking-[0.3em]">Sürecimiz</span>
            <h2 className="text-4xl lg:text-5xl headline-tight leading-tight mb-8 text-on-surface">
              BİLİMSEL<br />TİTİZLİK.
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              Her ürünün INCI listesini moleküler düzeyde analiz ediyor,
              bilimsel literatürle çapraz kontrol yapıyor ve cilt ihtiyaçlarına
              göre uyumluluk skoru üretiyoruz.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {[
              { icon: 'science', title: 'İçerik Laboratuvarı', desc: 'Her aktif bileşenin moleküler dökümü, etkinlik ve cilt uyumluluğu doğrulaması.' },
              { icon: 'verified_user', title: 'Kanıt Değerlendirme', desc: 'Sistematik derleme, klinik çalışma ve uzman görüşü bazında kanıt seviyesi atanır.' },
              { icon: 'eco', title: 'Kaynak İzleme', desc: 'Doğal, sentetik veya biyoteknoloji kaynaklı her içerik maddesinin kökeni takip edilir.' },
              { icon: 'auto_awesome', title: 'Uyum Skoru', desc: 'Cilt tipine ve ihtiyaçlarına özel, kişiselleştirilmiş uyumluluk skoru hesaplanır.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-4">
                <span className="material-icon material-icon-lg text-primary" aria-hidden="true">{item.icon}</span>
                <h4 className="text-lg font-bold tracking-tight uppercase text-on-surface">{item.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skin Needs */}
      {cosmNeeds.length > 0 && (
        <section className="py-24 lg:py-32 px-6 lg:px-16 bg-surface">
          <div className="text-center mb-16">
            <span className="label-caps text-outline mb-4 block tracking-[0.4em]">Cilt Analizi</span>
            <h2 className="text-4xl lg:text-5xl headline-tight text-on-surface">CİLT İHTİYAÇLARI</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cosmNeeds.map((need: Need) => (
              <Link
                key={need.need_id}
                href={`/ihtiyaclar/${need.need_slug}`}
                className="curator-card p-6 group"
              >
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors tracking-tight">
                  {need.need_name}
                </h3>
                {need.short_description && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">
                    {need.short_description}
                  </p>
                )}
                <span className="label-caps text-primary/60 group-hover:text-primary mt-3 block transition-colors">
                  Keşfet &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Skin Profiling CTA */}
      <section className="py-32 lg:py-48 px-6 lg:px-16 text-center bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto">
          <span className="label-caps text-outline mb-8 block tracking-[0.5em]">Kişiselleştirilmiş Analiz</span>
          <h2 className="text-5xl lg:text-7xl xl:text-8xl headline-tight leading-[0.9] mb-10 text-on-surface">
            CİLDİN,<br />SENİN TASARIMIN.
          </h2>
          <p className="text-lg text-on-surface-variant mb-12 max-w-xl mx-auto">
            Cilt tipini, ihtiyaçlarını ve hassasiyetlerini belirle.
            Her ürün sayfasında sana özel uyumluluk skoru al.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profilim" className="curator-btn-primary">
              Profilimi Oluştur
            </Link>
            <Link href="/karsilastir" className="curator-btn-outline">
              Ürünleri Karşılaştır
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-6 lg:px-16 bg-surface">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { href: '/karsilastir', icon: 'compare', title: 'Ürün Karşılaştır', desc: '2-3 ürünü yan yana koy, ingredient farklarını gör.' },
            { href: '/rehber', icon: 'menu_book', title: 'Rehber & Blog', desc: 'Cilt bakımı rehberleri, içerik incelemeleri ve uzman içerikleri.' },
            { href: '/favorilerim', icon: 'favorite_border', title: 'Favorilerim & Rutin', desc: 'Beğendiğin ürünleri kaydet, sabah/akşam rutinini oluştur.' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="curator-card p-8 group"
            >
              <span className="material-icon material-icon-lg text-primary/50 group-hover:text-primary transition-colors mb-4 block" aria-hidden="true">
                {item.icon}
              </span>
              <h3 className="text-lg font-bold tracking-tight mb-2 text-on-surface">{item.title}</h3>
              <p className="text-sm text-on-surface-variant">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Disclosure */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-xs text-outline text-center leading-relaxed">
          REVELA bağımsız bir bilgi platformudur. Sunduğumuz bilgiler tıbbi tavsiye
          niteliğinde değildir. Ürün sayfalarındaki satın alma linkleri komisyon içerebilir.{' '}
          <Link href="/rehber" className="underline hover:text-on-surface-variant transition-colors">
            Daha fazla bilgi
          </Link>
        </p>
      </section>
    </div>
  );
}
