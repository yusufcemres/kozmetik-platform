'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  if (score >= 70) return 'text-score-high';
  if (score >= 40) return 'text-score-medium';
  return 'text-score-low';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-score-high';
  if (score >= 40) return 'bg-score-medium';
  return 'bg-score-low';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get<Category[]>('/categories/tree').then(setCategories).catch(() => {});
    api.get<Brand[]>('/products/popular-brands?limit=50').then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    const catSlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    if (catSlug && categories.length > 0) {
      // Search both parent and child categories
      let found: Category | undefined;
      for (const cat of categories) {
        if (cat.category_slug === catSlug) { found = cat; break; }
        const child = cat.children?.find((c) => c.category_slug === catSlug);
        if (child) { found = child; break; }
      }
      if (found) setCategoryFilter(found.category_id);
    } else if (!catSlug) {
      setCategoryFilter('');
    }
    if (brandSlug && brands.length > 0) {
      const brand = brands.find((b) => b.brand_slug === brandSlug);
      if (brand) setBrandFilter(brand.brand_id);
    } else if (!brandSlug) {
      setBrandFilter('');
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
      setMeta({ total: 0, page: 1, limit: 12, totalPages: 1 });
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
    <div className="curator-section max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Koleksiyon</span>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">ÜRÜNLER</h1>
        </div>
        <Link
          href="/karsilastir"
          className="hidden sm:flex items-center gap-2 curator-btn-outline text-[10px]"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">compare</span>
          Karşılaştır
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ürün adı veya marka ara..."
            className="curator-input flex-1"
          />
          <button type="submit" className="curator-btn-primary text-[10px] px-6 py-3">
            Ara
          </button>
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-md border text-xs transition-all duration-300 ${
            showFilters || hasFilters
              ? 'border-primary text-primary bg-primary-container/30'
              : 'border-outline-variant/30 text-on-surface-variant hover:border-outline'
          }`}
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">tune</span>
          <span className="hidden sm:inline uppercase tracking-widest">Filtre</span>
          {hasFilters && <span className="bg-primary text-on-primary text-[9px] px-1.5 py-0.5 rounded-full">!</span>}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-md p-6 mb-8 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label-caps text-on-surface-variant mb-2 block">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
                className="curator-input"
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
            <div>
              <label className="label-caps text-on-surface-variant mb-2 block">Marka</label>
              <select
                value={brandFilter}
                onChange={(e) => { setBrandFilter(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
                className="curator-input"
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
            <button onClick={clearFilters} className="mt-4 label-caps text-error hover:underline underline-offset-4">
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}

      {/* Results info */}
      {!loading && (
        <p className="text-xs text-outline mb-6">
          {meta.total} ürün bulundu
          {search && <span> &mdash; &ldquo;{search}&rdquo; için sonuçlar</span>}
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="curator-card overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-surface-container" />
              <div className="p-4 space-y-3">
                <div className="h-2 bg-surface-container rounded w-1/3" />
                <div className="h-4 bg-surface-container rounded w-2/3" />
                <div className="h-2 bg-surface-container rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">inventory_2</span>
          <p className="text-on-surface-variant">
            {hasFilters ? 'Filtrelere uygun ürün bulunamadı' : 'Henüz ürün eklenmemiş'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 label-caps text-primary hover:underline underline-offset-4">
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="curator-card overflow-hidden group"
                >
                  <div className="aspect-[4/5] bg-surface-container-low flex items-center justify-center overflow-hidden relative">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={product.product_name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain grayscale-[10%] group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="material-icon material-icon-lg text-outline-variant" aria-hidden="true">inventory_2</span>
                    )}
                  </div>
                  <div className="p-4">
                    {product.brand && (
                      <p className="label-caps text-outline mb-1">{product.brand.brand_name}</p>
                    )}
                    <h3 className="font-semibold text-sm text-on-surface line-clamp-2 tracking-tight">
                      {product.product_name}
                    </h3>
                    {product.category && (
                      <span className="label-caps text-outline-variant mt-1.5 block">
                        {product.category.category_name}
                      </span>
                    )}
                    {avgScore !== null && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(avgScore)}`}
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${getScoreColor(avgScore)}`}>
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
            <div className="flex justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-md text-xs border border-outline-variant/30 disabled:opacity-30 hover:bg-surface-container-low transition-colors"
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">chevron_left</span>
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
                    className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-primary text-on-primary'
                        : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-2 rounded-md text-xs border border-outline-variant/30 disabled:opacity-30 hover:bg-surface-container-low transition-colors"
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">chevron_right</span>
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
    <Suspense fallback={<div className="curator-section text-center text-outline">Yükleniyor...</div>}>
      <ProductsListContent />
    </Suspense>
  );
}
