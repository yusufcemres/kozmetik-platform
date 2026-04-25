'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BLUR_DATA_URL } from '@/lib/image-placeholder';
import { api } from '@/lib/api';
import ProductFilterSidebar, { FilterState, EMPTY_FILTER_STATE } from '@/components/public/ProductFilterSidebar';

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  product_type_label?: string;
  target_area?: string;
  usage_time_hint?: string;
  short_description?: string;
  top_need_name?: string;
  top_need_score?: number;
  brand?: { brand_id: number; brand_name: string };
  category?: { category_id: number; category_name: string; category_slug?: string };
  images?: { image_url: string; sort_order?: number }[];
}

const TYPE_ICONS: Record<string, string> = {
  serum: 'science',
  krem: 'spa',
  temizleyici: 'water_drop',
  nemlendirici: 'opacity',
  'güneş kremi': 'wb_sunny',
  tonik: 'local_drink',
  maske: 'face_retouching_natural',
  'göz kremi': 'visibility',
  peeling: 'auto_fix_high',
  esans: 'local_florist',
  'dudak bakım': 'mood',
  fondöten: 'palette',
};

interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

const COSMETIC_CATEGORIES = [
  { slug: '', label: 'Tümü' },
  { slug: 'yuz-bakimi', label: 'Yüz Bakımı' },
  { slug: 'vucut-bakimi', label: 'Vücut Bakımı' },
  { slug: 'sac-bakimi', label: 'Saç Bakımı' },
  { slug: 'makyaj', label: 'Makyaj' },
  { slug: 'gunes-koruyucu', label: 'Güneş Koruyucu' },
  { slug: 'parfum', label: 'Parfüm' },
];

function ProductsListContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>(() => {
    const csv = (k: string) => searchParams.get(k)?.split(',').filter(Boolean) || [];
    const csvNum = (k: string) => csv(k).map(Number).filter((n) => Number.isFinite(n));
    const num = (k: string) => {
      const v = searchParams.get(k);
      return v != null && v !== '' ? Number(v) : null;
    };
    return {
      ...EMPTY_FILTER_STATE,
      kategori: searchParams.get('kategori') || searchParams.get('category') || '',
      brand_id: searchParams.get('brand_id') || '',
      sort: searchParams.get('sort') || 'newest',
      search: searchParams.get('q') || '',
      ingredient_slugs: searchParams.get('ingredient') ? [searchParams.get('ingredient')!] : csv('etken'),
      need_ids: csvNum('ihtiyac'),
      product_types: searchParams.get('type') ? [searchParams.get('type')!] : csv('tip'),
      target_areas: searchParams.get('area') ? [searchParams.get('area')!] : csv('bolge'),
      certifications: csv('sertifika'),
      manufacturer_country: csv('ulke'),
      skin_type: csv('cilt'),
      skorMin: num('skor_min'),
      skorMax: num('skor_max'),
      fiyatMin: num('fiyat_min'),
      fiyatMax: num('fiyat_max'),
      // Round 2
      evidence_grade: csv('grade'),
      safety_flags: csv('guvenlik'),
      allergen_count_max: num('alerjen_max'),
    };
  });

  useEffect(() => {
    const qs = new URLSearchParams();
    if (filters.kategori) qs.set('kategori', filters.kategori);
    if (filters.brand_id) qs.set('brand_id', filters.brand_id);
    if (filters.sort !== 'newest') qs.set('sort', filters.sort);
    if (filters.search) qs.set('q', filters.search);
    if (filters.ingredient_slugs.length) qs.set('etken', filters.ingredient_slugs.join(','));
    if (filters.need_ids.length) qs.set('ihtiyac', filters.need_ids.join(','));
    if (filters.product_types.length) qs.set('tip', filters.product_types.join(','));
    if (filters.target_areas.length) qs.set('bolge', filters.target_areas.join(','));
    if (filters.certifications.length) qs.set('sertifika', filters.certifications.join(','));
    if (filters.manufacturer_country.length) qs.set('ulke', filters.manufacturer_country.join(','));
    if (filters.skin_type.length) qs.set('cilt', filters.skin_type.join(','));
    if (filters.skorMin != null) qs.set('skor_min', String(filters.skorMin));
    if (filters.skorMax != null) qs.set('skor_max', String(filters.skorMax));
    if (filters.fiyatMin != null) qs.set('fiyat_min', String(filters.fiyatMin));
    if (filters.fiyatMax != null) qs.set('fiyat_max', String(filters.fiyatMax));
    if (filters.evidence_grade.length) qs.set('grade', filters.evidence_grade.join(','));
    if (filters.safety_flags.length) qs.set('guvenlik', filters.safety_flags.join(','));
    if (filters.allergen_count_max != null) qs.set('alerjen_max', String(filters.allergen_count_max));
    const url = qs.toString() ? `?${qs.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [filters]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      params.set('domain_type', 'cosmetic');
      params.set('sort', filters.sort);
      if (filters.search) params.set('search', filters.search);
      if (filters.kategori) params.set('category_slug', filters.kategori);
      if (filters.brand_id) params.set('brand_id', filters.brand_id);
      if (filters.ingredient_slugs.length) params.set('ingredient_slugs', filters.ingredient_slugs.join(','));
      if (filters.need_ids.length) params.set('need_ids', filters.need_ids.join(','));
      if (filters.product_types.length) params.set('product_types', filters.product_types.join(','));
      if (filters.target_areas.length) params.set('target_areas', filters.target_areas.join(','));
      if (filters.certifications.length) params.set('certifications', filters.certifications.join(','));
      if (filters.manufacturer_country.length) params.set('manufacturer_country', filters.manufacturer_country.join(','));
      if (filters.skin_type.length) params.set('skin_type', filters.skin_type.join(','));
      if (filters.skorMin != null) params.set('score_min', String(filters.skorMin));
      if (filters.skorMax != null) params.set('score_max', String(filters.skorMax));
      if (filters.fiyatMin != null) params.set('price_min', String(filters.fiyatMin));
      if (filters.fiyatMax != null) params.set('price_max', String(filters.fiyatMax));
      if (filters.evidence_grade.length) params.set('evidence_grade', filters.evidence_grade.join(','));
      if (filters.safety_flags.length) params.set('safety_flags', filters.safety_flags.join(','));
      if (filters.allergen_count_max != null) params.set('allergen_count_max', String(filters.allergen_count_max));

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
  }, [page, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const resetFilters = () => setFilters({ ...EMPTY_FILTER_STATE });

  return (
    <div className="curator-section max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Koleksiyon</span>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">ÜRÜNLER</h1>
          <p className="text-on-surface-variant text-sm mt-2">
            Kozmetik ürünlerin INCI analizi, cilt tipine uyumluluğu ve bilimsel kanıtlı etkinliği
          </p>
        </div>
        <Link
          href="/karsilastir"
          className="hidden sm:flex items-center gap-2 curator-btn-outline text-[10px]"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">compare</span>
          Karşılaştır
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <ProductFilterSidebar
          categories={COSMETIC_CATEGORIES}
          domain="cosmetic"
          state={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onReset={resetFilters}
          resultCount={meta.total}
        />

        <div>
          {!loading && (
            <p className="text-xs text-outline mb-4">
              {meta.total} ürün
              {filters.search && <span> &mdash; &ldquo;{filters.search}&rdquo; için sonuçlar</span>}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                {filters.search ? `"${filters.search}" için sonuç bulunamadı` : 'Filtrelere uygun ürün yok'}
              </p>
              <button onClick={resetFilters} className="mt-4 label-caps text-primary hover:underline underline-offset-4">
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => {
                  const primaryImg = product.images?.find(i => i.sort_order === 0)?.image_url || product.images?.[0]?.image_url;
                  const isDiceBear = primaryImg?.includes('dicebear') || primaryImg?.includes('placehold.co');
                  const hoverImg = product.images?.find(i => i.sort_order === 1)?.image_url;
                  const avgScore = product.top_need_score ? Math.round(Number(product.top_need_score)) : null;

                  return (
                    <Link
                      key={product.product_id}
                      href={`/urunler/${product.product_slug}`}
                      className="curator-card overflow-hidden group"
                    >
                      <div className="aspect-[4/5] bg-surface-container-low flex items-center justify-center overflow-hidden relative">
                        {primaryImg && !isDiceBear ? (
                          <>
                            <Image
                              src={primaryImg}
                              alt={product.product_name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              placeholder="blur"
                              blurDataURL={BLUR_DATA_URL}
                              className={`object-contain transition-all duration-500 ${hoverImg ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'}`}
                            />
                            {hoverImg && (
                              <Image
                                src={hoverImg}
                                alt={`${product.product_name} - detay`}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-contain opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                              />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-surface-variant/30 to-surface-variant/10 flex items-center justify-center">
                            <span className="material-icon text-outline-variant/40 group-hover:text-outline-variant/60 transition-colors" style={{ fontSize: '48px' }} aria-hidden="true">
                              {TYPE_ICONS[product.product_type_label || ''] || 'category'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        {product.brand && (
                          <p className="label-caps text-outline mb-1">{product.brand.brand_name}</p>
                        )}
                        <h3 className="font-semibold text-sm text-on-surface line-clamp-2 tracking-tight">
                          {product.product_name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {product.category && (
                            <span className="label-caps text-outline-variant">
                              {product.category.category_name}
                            </span>
                          )}
                          {product.product_type_label && (
                            <span className="label-caps text-primary bg-primary/5 px-1.5 py-0.5 rounded-sm">
                              {product.product_type_label}
                            </span>
                          )}
                        </div>
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
                        {product.top_need_name && (
                          <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-sm text-[10px] font-medium mt-1.5 inline-block truncate">
                            {product.top_need_name}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

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
      </div>
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
