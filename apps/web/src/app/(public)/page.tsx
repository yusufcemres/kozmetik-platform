import Link from 'next/link';
import { apiFetch } from '@/lib/api';

// === Types ===

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand?: { brand_name: string };
  category?: { category_name: string };
  images?: { image_url: string }[];
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
    apiFetch<Product[]>('/products/top-scored?limit=6', { next: { revalidate: 3600 } } as any),
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
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-500';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-400';
}

function avgScore(product: Product): number | null {
  if (!product.need_scores?.length) return null;
  return Math.round(
    product.need_scores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) /
      product.need_scores.length,
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  'Yüz Bakım': '✨',
  'Temizleme': '🫧',
  'Güneş Koruma': '☀️',
  'Göz Bakım': '👁️',
  'Dudak Bakım': '💋',
  'Vücut Bakım': '🧴',
  'Saç Bakım': '💇',
  'Makyaj': '💄',
};

const NEED_ICONS: Record<string, string> = {
  'Sivilce / Akne': '🔴',
  'Leke / Hiperpigmentasyon': '🎯',
  'Kırışıklık / Yaşlanma': '⏳',
  'Kuruluk / Dehidrasyon': '💧',
  'Yağ Kontrolü': '✋',
  'Hassasiyet / Kızarıklık': '🌸',
  'Gözenek': '🔍',
  'Cilt Tonu Eşitleme': '🌈',
  'Cilt Bariyeri': '🛡️',
  'Bariyer Desteği': '🛡️',
  'Koyu Halka': '👀',
  'Mat Görünüm': '🌿',
};

// === Product Card Component ===

function ProductCard({ product }: { product: Product }) {
  const imgUrl = product.images?.[0]?.image_url;
  const score = avgScore(product);

  return (
    <Link
      href={`/urunler/${product.product_slug}`}
      className="bg-white border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group"
    >
      <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.product_name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl text-gray-300">📦</span>
        )}
      </div>
      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-primary font-semibold mb-0.5">
            {product.brand.brand_name}
          </p>
        )}
        <h3 className="font-bold text-sm text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
          {product.product_name}
        </h3>
        {score !== null && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getScoreBarColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${getScoreColor(score)}`}>
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
  const { topProducts, latest, categories, needs, brands } = await getHomeData();
  const cosmNeeds = needs.filter((n: Need) => n.need_group !== 'supplement');
  const parentCats = categories.filter((c: Category) => !c.parent_category_id);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-primary/10 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kozmetik Ürünlerini Anla
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            INCI listesini analiz et, cildine uygun ürünleri keşfet.
            Bilimsel kanıta dayalı, bağımsız ve Türkçe.
          </p>

          <div className="max-w-xl mx-auto">
            <Link
              href="/ara"
              className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-4 text-gray-400 hover:border-primary hover:shadow-md transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Ürün, içerik veya cilt ihtiyacı ara...
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10">
            {[
              { label: 'Ürün', value: latest.meta?.total || 1785 },
              { label: 'İçerik', value: 5000 },
              { label: 'Marka', value: 113 },
              { label: 'Kategori', value: categories.length || 57 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {s.value > 999 ? `${(s.value / 1000).toFixed(1)}K` : s.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      {parentCats.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Kategoriler</h2>
            <Link href="/urunler" className="text-sm text-primary hover:underline font-medium">
              Tümünü Gör &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {parentCats.map((cat: Category) => (
              <Link
                key={cat.category_id}
                href={`/urunler?category=${cat.category_slug}`}
                className="bg-white border rounded-xl p-4 text-center hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <span className="text-2xl block mb-2">{CATEGORY_ICONS[cat.category_name] || '📂'}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors">
                  {cat.category_name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* En Uyumlu Ürünler */}
      {topProducts.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">En Uyumlu Ürünler</h2>
                <p className="text-sm text-gray-500 mt-1">Cilt ihtiyaçlarına en yüksek uyum skoru alan ürünler</p>
              </div>
              <Link href="/urunler" className="text-sm text-primary hover:underline font-medium">
                Tümünü Gör &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topProducts.map((p: Product) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cilt İhtiyaçları */}
      {cosmNeeds.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Cilt İhtiyaçları</h2>
              <p className="text-sm text-gray-500 mt-1">İhtiyacına göre en etkili içerikleri ve ürünleri bul</p>
            </div>
            <Link href="/ihtiyaclar" className="text-sm text-primary hover:underline font-medium">
              Tümünü Gör &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cosmNeeds.map((need: Need) => (
              <Link
                key={need.need_id}
                href={`/ihtiyaclar/${need.need_slug}`}
                className="bg-white border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{NEED_ICONS[need.need_name] || '💎'}</span>
                  <h3 className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors">
                    {need.need_name}
                  </h3>
                </div>
                {need.short_description && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {need.short_description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Yeni Eklenenler */}
      {latest.data && latest.data.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Yeni Eklenenler</h2>
                <p className="text-sm text-gray-500 mt-1">Son eklenen ürünler</p>
              </div>
              <Link href="/urunler" className="text-sm text-primary hover:underline font-medium">
                Tümünü Gör &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.data.map((p: Product) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popüler Markalar */}
      {brands.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-6">Popüler Markalar</h2>
          <div className="flex flex-wrap gap-3">
            {brands.map((b: Brand) => (
              <Link
                key={b.brand_id}
                href={`/urunler?brand=${b.brand_slug}`}
                className="bg-white border rounded-full px-5 py-2.5 hover:shadow-md hover:border-primary/30 transition-all group flex items-center gap-2"
              >
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                  {b.brand_name}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                  {b.product_count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nasıl Çalışır */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Ürünü Bul', desc: 'İsmini yaz veya kategoriden seç. INCI listesini otomatik analiz ediyoruz.' },
              { step: '2', title: 'İçerikleri Anla', desc: 'Her içerik maddesinin ne işe yaradığını, kanıt seviyesini ve olası etkilerini gör.' },
              { step: '3', title: 'Uygunluğunu Gör', desc: 'Cilt profilini oluştur, her ürün için kişisel uyum skorunu al.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/karsilastir"
            className="bg-white border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-2xl mb-3">⚖️</div>
            <h3 className="text-lg font-bold mb-1 group-hover:text-primary">Ürün Karşılaştır</h3>
            <p className="text-gray-500 text-sm">2-3 ürünü yan yana koy, ingredient farklarını gör.</p>
          </Link>
          <Link
            href="/profilim"
            className="bg-white border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-2xl mb-3">👤</div>
            <h3 className="text-lg font-bold mb-1 group-hover:text-primary">Cilt Profilim</h3>
            <p className="text-gray-500 text-sm">Cilt tipini belirle, kişisel uyum skorlarını gör.</p>
          </Link>
          <Link
            href="/rehber"
            className="bg-white border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-2xl mb-3">📝</div>
            <h3 className="text-lg font-bold mb-1 group-hover:text-primary">Rehber & Blog</h3>
            <p className="text-gray-500 text-sm">Cilt bakımı rehberleri, içerik incelemeleri ve uzman içerikleri.</p>
          </Link>
        </div>
      </section>

      {/* Profile CTA */}
      <section className="bg-primary/5 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Cilt Profilini Oluştur</h2>
          <p className="text-gray-600 mb-6">
            Cilt tipini, ihtiyaçlarını ve hassasiyetlerini belirle.
            Her ürün sayfasında sana özel uyum skoru gör.
          </p>
          <Link
            href="/profilim"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Profilimi Oluştur
          </Link>
        </div>
      </section>

      {/* Disclosure */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Kozmetik Platform bağımsız bir bilgi platformudur. Sunduğumuz bilgiler tıbbi tavsiye
          niteliğinde değildir. Ürün sayfalarındaki satın alma linkleri komisyon içerebilir.{' '}
          <Link href="/rehber" className="underline hover:text-gray-600">
            Daha fazla bilgi
          </Link>
        </p>
      </section>
    </div>
  );
}
