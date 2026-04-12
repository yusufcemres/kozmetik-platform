'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface SupplementProduct {
  product_id: number;
  product_name: string;
  product_slug: string;
  short_description: string;
  brand?: { brand_name: string };
  category?: { category_name: string; category_slug: string };
  images?: { image_url: string }[];
}

const CATEGORIES = [
  { slug: '', label: 'Tümü', icon: 'grid_view' },
  { slug: 'vitamin-mineral', label: 'Vitamin & Mineral', icon: 'medication' },
  { slug: 'probiyotik', label: 'Probiyotik', icon: 'bacteria' },
  { slug: 'bitkisel-takviye', label: 'Bitkisel', icon: 'spa' },
  { slug: 'omega-yag-asitleri', label: 'Omega & Yağ Asitleri', icon: 'water_drop' },
  { slug: 'sporcu-besinleri', label: 'Sporcu', icon: 'fitness_center' },
  { slug: 'kolajen-guzellik', label: 'Kolajen & Güzellik', icon: 'face_retouching_natural' },
];

export default function SupplementsListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <SupplementsListInner />
    </Suspense>
  );
}

function SupplementsListInner() {
  const searchParams = useSearchParams();
  const initialKategori = searchParams.get('kategori') || '';

  const [products, setProducts] = useState<SupplementProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [kategori, setKategori] = useState(initialKategori);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '12');
    if (search) params.set('search', search);

    // Always use products endpoint with domain_type=supplement
    params.set('domain_type', 'supplement');
    if (kategori) params.set('category_slug', kategori);
    const endpoint = `/products?${params.toString()}`;

    api
      .get<{ data: SupplementProduct[]; meta: { totalPages: number } }>(endpoint)
      .then((data) => {
        setProducts(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page, kategori, search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [kategori, search]);

  const getImageUrl = (p: SupplementProduct) => {
    if (p.images && p.images.length > 0) return p.images[0].image_url;
    return null;
  };

  return (
    <div className="curator-section max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Sağlık</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">TAKVİYE GIDALAR</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          Vitamin, mineral ve besin takviyelerini karşılaştır, içeriklerini analiz et
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="material-icon absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none" aria-hidden="true">search</span>
        <input
          type="text"
          placeholder="Takviye ara... (örneğin: omega-3, d vitamini)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="curator-input pl-12"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setKategori(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              kategori === cat.slug
                ? 'bg-on-surface text-surface'
                : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-icon text-[14px]" aria-hidden="true">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="curator-card p-5 animate-pulse">
              <div className="h-32 bg-surface-container rounded mb-3" />
              <div className="h-4 bg-surface-container rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-container rounded w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">medication</span>
          <p className="text-on-surface-variant">
            {search ? `"${search}" için sonuç bulunamadı` : 'Bu kategoride henüz ürün yok'}
          </p>
          {(search || kategori) && (
            <button
              onClick={() => { setSearch(''); setKategori(''); }}
              className="mt-4 text-primary text-sm hover:underline"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const img = getImageUrl(p);
              return (
                <Link
                  key={p.product_id}
                  href={`/takviyeler/${p.product_slug}`}
                  className="curator-card group overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-[16/9] bg-surface-container-low flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={p.product_name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <span className="material-icon text-outline-variant" style={{ fontSize: '48px' }} aria-hidden="true">medication</span>
                    )}
                  </div>

                  <div className="p-5">
                    {p.brand && (
                      <p className="label-caps text-outline truncate mb-1">
                        {p.brand.brand_name}
                      </p>
                    )}
                    <h3 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                      {p.product_name}
                    </h3>
                    {p.short_description && (
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-2">{p.short_description}</p>
                    )}
                    {p.category && (
                      <span className="label-caps text-outline bg-surface-container-low px-2 py-0.5 rounded-sm inline-block mt-3">
                        {p.category.category_name}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-md text-xs border border-outline-variant/30 disabled:opacity-30 hover:bg-surface-container-low transition-colors"
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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
