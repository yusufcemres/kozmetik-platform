'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  product_type_label?: string;
  short_description?: string;
  brand?: { brand_id: number; brand_name: string };
  category?: { category_id: number; category_name: string };
  images?: { image_url: string }[];
  need_scores?: { compatibility_score: number }[];
}

interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

function ProductsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [brandFilter, setBrandFilter] = useState<number | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');

  // Ref data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load filter data
  useEffect(() => {
    api.get<Category[]>('/categories/tree').then(setCategories).catch(() => {});
    api.get<Brand[]>('/products/popular-brands?limit=50').then(setBrands).catch(() => {});
  }, []);

  // Read URL params on mount
  useEffect(() => {
    const catSlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    if (catSlug && categories.length > 0) {
      const cat = categories.find((c) => c.category_slug === catSlug);
      if (cat) setCategoryFilter(cat.category_id);
    }
    if (brandSlug && brands.length > 0) {
      const brand = brands.find((b) => b.brand_slug === brandSlug);
      if (brand) setBrandFilter(brand.brand_id);
    }
  }, [searchParams, categories, brands]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (search) params.set('search', search);
      if (brandFilter) params.set('brand_id', String(brandFilter));
      if (categoryFilter) params.set('category_id', String(categoryFilter));

      const data = await api.get<{ data: Product[]; meta: PageMeta }>(
        `/products?${params.toString()}`,
      );
      setProducts(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, brandFilter, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setBrandFilter('');
    setCategoryFilter('');
    setPage(1);
    router.push('/urunler');
  };

  const parentCats = categories.filter((c) => !c.parent_category_id);
  const hasFilters = !!search || !!brandFilter || !!categoryFilter;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ürünler</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kozmetik ürünleri incele, içeriklerini analiz et
          </p>
        </div>
        <Link
          href="/karsilastir"
          className="hidden sm:flex items-center gap-2 border rounded-lg px-4 py-2 text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors"
        >
          <span>⚖️</span> Karşılaştır
        </Link>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2 mb-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ürün adı veya marka ara..."
            className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ara
          </button>
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`border rounded-lg px-4 py-2.5 text-sm transition-colors ${
            showFilters || hasFilters ? 'border-primary text-primary bg-primary/5' : 'text-gray-500 hover:border-gray-400'
          }`}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtre
          {hasFilters && <span className="ml-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">!</span>}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-xl p-5 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Tüm Kategoriler</option>
                {parentCats.map((cat) => (
                  <optgroup key={cat.category_id} label={cat.category_name}>
                    <option value={cat.category_id}>{cat.category_name} (Tümü)</option>
                    {cat.children?.map((sub) => (
                      <option key={sub.category_id} value={sub.category_id}>
                        {sub.category_name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Brand filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Marka</label>
              <select
                value={brandFilter}
                onChange={(e) => { setBrandFilter(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Tüm Markalar</option>
                {brands.map((b) => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.brand_name} ({b.product_count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-red-500 hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}

      {/* Results info */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-4">
          {meta.total} ürün bulundu
          {search && <span> &mdash; &quot;{search}&quot; için sonuçlar</span>}
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-xl overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-2 bg-gray-100 rounded w-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-400">
            {hasFilters ? 'Filtrelere uygun ürün bulunamadı' : 'Henüz ürün eklenmemiş'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-primary hover:underline text-sm">
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const imgUrl = product.images?.[0]?.image_url;
              const avgScore =
                product.need_scores && product.need_scores.length > 0
                  ? Math.round(
                      product.need_scores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) /
                        product.need_scores.length,
                    )
                  : null;

              return (
                <Link
                  key={product.product_id}
                  href={`/urunler/${product.product_slug}`}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
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
                    <div className="flex items-center gap-2 mt-2">
                      {product.category && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {product.category.category_name}
                        </span>
                      )}
                    </div>
                    {avgScore !== null && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(avgScore)}`}
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${getScoreColor(avgScore)}`}>
                          %{avgScore}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded text-sm border disabled:opacity-30 hover:bg-gray-50"
              >
                &larr; Önceki
              </button>
              {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (meta.totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= meta.totalPages - 3) {
                  pageNum = meta.totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      pageNum === page ? 'bg-primary text-white' : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1.5 rounded text-sm border disabled:opacity-30 hover:bg-gray-50"
              >
                Sonraki &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsListPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-400">Yükleniyor...</div>}>
      <ProductsListContent />
    </Suspense>
  );
}
