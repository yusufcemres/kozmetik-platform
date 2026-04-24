'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface Brand {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  product_count?: number;
}

interface Category {
  slug: string;
  label: string;
}

export interface FilterState {
  kategori: string;
  brand_id: string;
  sort: string;
  skorMin: number | null;
  skorMax: number | null;
  search: string;
}

interface ProductFilterSidebarProps {
  categories: Category[];
  domain: 'supplement' | 'cosmetic';
  state: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  resultCount?: number;
}

const SCORE_BUCKETS = [
  { label: '90+', min: 90, max: null as number | null },
  { label: '80-89', min: 80, max: 89 },
  { label: '70-79', min: 70, max: 79 },
  { label: '<70', min: null as number | null, max: 69 },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'En yeni' },
  { value: 'score', label: 'Skora göre (yüksek → düşük)' },
  { value: 'name', label: 'İsme göre (A → Z)' },
];

export default function ProductFilterSidebar({
  categories,
  domain,
  state,
  onChange,
  onReset,
  resultCount,
}: ProductFilterSidebarProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    api
      .get<{ data: Brand[] }>(`/brands?limit=200`)
      .then((res) => setBrands(res.data || []))
      .catch(() => setBrands([]));
  }, []);

  const activeCount = [
    state.kategori,
    state.brand_id,
    state.skorMin != null || state.skorMax != null ? '1' : '',
    state.search,
  ].filter(Boolean).length;

  const filteredBrands = brandSearch
    ? brands.filter((b) => b.brand_name.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands;

  const toggleScoreBucket = (bucket: typeof SCORE_BUCKETS[number]) => {
    if (state.skorMin === bucket.min && state.skorMax === bucket.max) {
      onChange({ skorMin: null, skorMax: null });
    } else {
      onChange({ skorMin: bucket.min, skorMax: bucket.max });
    }
  };

  const content = (
    <div className="space-y-5">
      {/* Reset bar */}
      {activeCount > 0 && (
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <span className="text-xs text-on-surface-variant">
            {activeCount} filtre aktif
            {resultCount != null && (
              <span className="text-outline ml-1">· {resultCount} sonuç</span>
            )}
          </span>
          <button
            onClick={onReset}
            className="text-[10px] text-primary hover:underline label-caps"
          >
            Temizle
          </button>
        </div>
      )}

      {/* Search */}
      <div>
        <label className="label-caps text-outline block mb-2">Ara</label>
        <div className="relative">
          <span className="material-icon absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[14px] pointer-events-none" aria-hidden="true">search</span>
          <input
            type="text"
            placeholder={domain === 'supplement' ? 'omega-3, d vitamini...' : 'retinol, niasinamid...'}
            value={state.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-outline-variant/30 rounded-sm bg-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="label-caps text-outline block mb-2">Sırala</label>
        <select
          value={state.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className="w-full text-xs py-1.5 px-2 border border-outline-variant/30 rounded-sm bg-surface"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* REVELA Skoru */}
      <div>
        <label className="label-caps text-outline block mb-2">REVELA Skoru</label>
        <div className="flex flex-wrap gap-1.5">
          {SCORE_BUCKETS.map((bucket) => {
            const active = state.skorMin === bucket.min && state.skorMax === bucket.max;
            return (
              <button
                key={bucket.label}
                onClick={() => toggleScoreBucket(bucket)}
                className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                  active
                    ? 'bg-primary text-on-primary border-primary'
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                }`}
              >
                {bucket.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kategori */}
      {categories.length > 1 && (
        <div>
          <label className="label-caps text-outline block mb-2">Kategori</label>
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => {
              const active = state.kategori === cat.slug;
              return (
                <button
                  key={cat.slug || 'all'}
                  onClick={() => onChange({ kategori: active ? '' : cat.slug })}
                  className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                    active
                      ? 'bg-on-surface text-surface border-on-surface'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Marka */}
      <div>
        <label className="label-caps text-outline block mb-2">Marka</label>
        <input
          type="text"
          placeholder="Marka ara..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          className="w-full text-xs py-1 px-2 mb-2 border border-outline-variant/30 rounded-sm bg-surface"
        />
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          <button
            onClick={() => onChange({ brand_id: '' })}
            className={`w-full text-left text-[10px] px-2 py-1 rounded-sm transition-colors ${
              !state.brand_id
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Tüm markalar
          </button>
          {filteredBrands.slice(0, 60).map((b) => {
            const active = state.brand_id === String(b.brand_id);
            return (
              <button
                key={b.brand_id}
                onClick={() => onChange({ brand_id: active ? '' : String(b.brand_id) })}
                className={`w-full text-left text-[10px] px-2 py-1 rounded-sm transition-colors flex items-center justify-between ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="truncate">{b.brand_name}</span>
                {b.product_count !== undefined && b.product_count > 0 && (
                  <span className="text-outline text-[9px] shrink-0 ml-1">
                    {b.product_count}
                  </span>
                )}
              </button>
            );
          })}
          {filteredBrands.length > 60 && (
            <p className="text-[9px] text-outline px-2 py-1">
              +{filteredBrands.length - 60} marka daha. Aramayı daraltın.
            </p>
          )}
        </div>
      </div>

      {/* Notlar */}
      <p className="text-[9px] text-outline leading-relaxed border-t border-outline-variant/15 pt-3">
        İpucu: Etken madde, ihtiyaç, sertifika, cilt tipi gibi ek filtreler sonraki sürümde eklenecek.
      </p>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 curator-card p-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <h2 className="label-caps text-on-surface mb-4 tracking-[0.2em] flex items-center gap-2">
            <span className="material-icon text-[14px]" aria-hidden="true">filter_list</span>
            Filtrele
            {activeCount > 0 && (
              <span className="ml-auto bg-primary text-on-primary text-[9px] px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </h2>
          {content}
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 curator-btn-primary shadow-lg flex items-center gap-2 text-xs px-4 py-3 rounded-full"
      >
        <span className="material-icon text-[16px]" aria-hidden="true">filter_list</span>
        Filtrele
        {activeCount > 0 && (
          <span className="bg-surface text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-xl max-h-[85vh] overflow-y-auto p-5 pb-8">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-outline-variant/20 sticky top-0 bg-surface">
              <h2 className="label-caps text-on-surface tracking-[0.2em] flex items-center gap-2">
                <span className="material-icon text-[14px]" aria-hidden="true">filter_list</span>
                Filtrele
              </h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-xs text-primary flex items-center gap-1"
              >
                <span className="material-icon text-[14px]" aria-hidden="true">close</span>
                Kapat
              </button>
            </div>
            {content}
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full curator-btn-primary mt-5 py-3 text-xs"
            >
              {resultCount != null ? `${resultCount} ürünü göster` : 'Sonuçları göster'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
