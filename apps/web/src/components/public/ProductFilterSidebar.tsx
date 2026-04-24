'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface Brand {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  product_count?: number;
}

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  domain_type?: string;
}

interface Ingredient {
  ingredient_id: number;
  inci_name: string;
  common_name?: string;
  ingredient_slug: string;
}

interface Category {
  slug: string;
  label: string;
}

export interface FilterState {
  search: string;
  sort: string;
  kategori: string;
  brand_id: string;
  ingredient_slugs: string[];
  need_ids: number[];
  form: string[];
  certifications: string[];
  target_audience: string[];
  manufacturer_country: string[];
  skorMin: number | null;
  skorMax: number | null;
  fiyatMin: number | null;
  fiyatMax: number | null;
  skin_type: string[];
}

export const EMPTY_FILTER_STATE: FilterState = {
  search: '',
  sort: 'newest',
  kategori: '',
  brand_id: '',
  ingredient_slugs: [],
  need_ids: [],
  form: [],
  certifications: [],
  target_audience: [],
  manufacturer_country: [],
  skorMin: null,
  skorMax: null,
  fiyatMin: null,
  fiyatMax: null,
  skin_type: [],
};

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

const SUPPLEMENT_FORMS = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Kapsül' },
  { value: 'softgel', label: 'Softgel' },
  { value: 'gummy', label: 'Gummy' },
  { value: 'powder', label: 'Toz' },
  { value: 'liquid', label: 'Sıvı' },
  { value: 'spray', label: 'Sprey' },
  { value: 'drop', label: 'Damla' },
];

const CERTIFICATIONS = [
  { value: 'GMP', label: 'GMP' },
  { value: 'NSF', label: 'NSF' },
  { value: 'USP', label: 'USP' },
  { value: 'Halal', label: 'Helal' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Gluten', label: 'Glutensiz' },
  { value: 'Non-GMO', label: 'Non-GMO' },
  { value: 'Organic', label: 'Organik' },
];

const TARGET_AUDIENCE = [
  { value: 'adult', label: 'Yetişkin' },
  { value: 'child_4_12y', label: 'Çocuk (4-12)' },
  { value: 'pregnant', label: 'Hamile' },
  { value: 'breastfeeding', label: 'Emziren' },
];

const COUNTRIES = [
  { value: 'TR', label: '🇹🇷 Türkiye' },
  { value: 'US', label: '🇺🇸 ABD' },
  { value: 'DE', label: '🇩🇪 Almanya' },
  { value: 'FR', label: '🇫🇷 Fransa' },
  { value: 'KR', label: '🇰🇷 Kore' },
  { value: 'JP', label: '🇯🇵 Japonya' },
  { value: 'IT', label: '🇮🇹 İtalya' },
  { value: 'ES', label: '🇪🇸 İspanya' },
  { value: 'CH', label: '🇨🇭 İsviçre' },
];

const SKIN_TYPES = [
  { value: 'oily', label: 'Yağlı' },
  { value: 'dry', label: 'Kuru' },
  { value: 'combination', label: 'Karma' },
  { value: 'normal', label: 'Normal' },
  { value: 'sensitive', label: 'Hassas' },
];

const POPULAR_INGREDIENTS_SUPPLEMENT = [
  { slug: 'ascorbic-acid', label: 'C Vitamini' },
  { slug: 'cholecalciferol', label: 'D3 Vitamini' },
  { slug: 'omega-3', label: 'Omega-3' },
  { slug: 'magnesium', label: 'Magnezyum' },
  { slug: 'zinc', label: 'Çinko' },
  { slug: 'methylcobalamin', label: 'B12' },
  { slug: 'hydrolyzed-collagen', label: 'Kolajen' },
  { slug: 'biotin', label: 'Biotin' },
];

const POPULAR_INGREDIENTS_COSMETIC = [
  { slug: 'niacinamide', label: 'Niasinamid' },
  { slug: 'retinol', label: 'Retinol' },
  { slug: 'hyaluronic-acid', label: 'Hyaluronik Asit' },
  { slug: 'salicylic-acid', label: 'BHA (Salisilik)' },
  { slug: 'glycolic-acid', label: 'AHA (Glikolik)' },
  { slug: 'ceramide-np', label: 'Seramid' },
  { slug: 'centella-asiatica-extract', label: 'Centella' },
  { slug: 'panthenol', label: 'Panthenol' },
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
  const [needs, setNeeds] = useState<Need[]>([]);
  const [ingredientResults, setIngredientResults] = useState<Ingredient[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [needSearch, setNeedSearch] = useState('');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const fetchedBrands = useRef(false);
  const fetchedNeeds = useRef(false);

  useEffect(() => {
    if (fetchedBrands.current) return;
    fetchedBrands.current = true;
    api
      .get<{ data: Brand[] }>(`/brands?limit=200`)
      .then((res) => setBrands(res.data || []))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (fetchedNeeds.current) return;
    fetchedNeeds.current = true;
    const dt = domain === 'supplement' ? '?domain_type=supplement' : '?domain_type=cosmetic';
    api
      .get<{ data: Need[] }>(`/needs${dt}&limit=50`)
      .then((res) => setNeeds(res.data || []))
      .catch(() => setNeeds([]));
  }, [domain]);

  // Etken madde arama (debounced)
  useEffect(() => {
    if (ingredientSearch.length < 2) {
      setIngredientResults([]);
      return;
    }
    const t = setTimeout(() => {
      api
        .get<{ data: Ingredient[] }>(`/ingredients?search=${encodeURIComponent(ingredientSearch)}&limit=20`)
        .then((res) => setIngredientResults(res.data || []))
        .catch(() => setIngredientResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [ingredientSearch]);

  const popularIngredients = domain === 'supplement' ? POPULAR_INGREDIENTS_SUPPLEMENT : POPULAR_INGREDIENTS_COSMETIC;

  const activeCount = [
    state.kategori,
    state.brand_id,
    state.skorMin != null || state.skorMax != null ? '1' : '',
    state.fiyatMin != null || state.fiyatMax != null ? '1' : '',
    state.search,
    ...state.ingredient_slugs,
    ...state.need_ids.map(String),
    ...state.form,
    ...state.certifications,
    ...state.target_audience,
    ...state.manufacturer_country,
    ...state.skin_type,
  ].filter(Boolean).length;

  const filteredBrands = brandSearch
    ? brands.filter((b) => b.brand_name.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands;

  const filteredNeeds = needSearch
    ? needs.filter((n) => n.need_name.toLowerCase().includes(needSearch.toLowerCase()))
    : needs;

  const toggleScoreBucket = (b: typeof SCORE_BUCKETS[number]) => {
    if (state.skorMin === b.min && state.skorMax === b.max) {
      onChange({ skorMin: null, skorMax: null });
    } else {
      onChange({ skorMin: b.min, skorMax: b.max });
    }
  };

  const toggleArrayItem = <T extends string | number>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const Section = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => (
    <details open={defaultOpen} className="group border-b border-outline-variant/15 last:border-b-0">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between py-2.5">
        <span className="label-caps text-on-surface">{title}</span>
        <span
          className="material-icon text-outline-variant group-open:rotate-180 transition-transform"
          style={{ fontSize: '14px' }}
          aria-hidden="true"
        >
          expand_more
        </span>
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  );

  const content = (
    <div className="space-y-1">
      {activeCount > 0 && (
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <span className="text-xs text-on-surface-variant">
            {activeCount} filtre
            {resultCount != null && <span className="text-outline ml-1">· {resultCount} sonuç</span>}
          </span>
          <button onClick={onReset} className="text-[10px] text-primary hover:underline label-caps">
            Tümünü Temizle
          </button>
        </div>
      )}

      <Section title="Ara" defaultOpen>
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
      </Section>

      <Section title="Sırala" defaultOpen>
        <select
          value={state.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className="w-full text-xs py-1.5 px-2 border border-outline-variant/30 rounded-sm bg-surface"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </Section>

      <Section title="REVELA Skoru" defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          {SCORE_BUCKETS.map((b) => {
            const active = state.skorMin === b.min && state.skorMax === b.max;
            return (
              <button
                key={b.label}
                onClick={() => toggleScoreBucket(b)}
                className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                  active ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Etken Madde">
        {/* Popüler chip'ler */}
        <div className="flex flex-wrap gap-1 mb-2">
          {popularIngredients.map((ing) => {
            const active = state.ingredient_slugs.includes(ing.slug);
            return (
              <button
                key={ing.slug}
                onClick={() => onChange({ ingredient_slugs: toggleArrayItem(state.ingredient_slugs, ing.slug) })}
                className={`text-[9px] px-1.5 py-0.5 rounded-sm border transition-colors ${
                  active ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                }`}
              >
                {ing.label}
              </button>
            );
          })}
        </div>
        {/* Autocomplete */}
        <input
          type="text"
          placeholder="Madde ara..."
          value={ingredientSearch}
          onChange={(e) => setIngredientSearch(e.target.value)}
          className="w-full text-xs py-1 px-2 border border-outline-variant/30 rounded-sm bg-surface mb-1"
        />
        {ingredientResults.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-0.5 border border-outline-variant/15 rounded-sm">
            {ingredientResults.slice(0, 15).map((i) => {
              const active = state.ingredient_slugs.includes(i.ingredient_slug);
              return (
                <button
                  key={i.ingredient_id}
                  onClick={() => {
                    onChange({ ingredient_slugs: toggleArrayItem(state.ingredient_slugs, i.ingredient_slug) });
                    setIngredientSearch('');
                  }}
                  className={`w-full text-left text-[10px] px-2 py-1 transition-colors ${
                    active ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {i.common_name || i.inci_name}
                </button>
              );
            })}
          </div>
        )}
        {state.ingredient_slugs.length > 0 && (
          <p className="text-[9px] text-outline mt-1">{state.ingredient_slugs.length} madde seçili</p>
        )}
      </Section>

      <Section title="İhtiyaç">
        {needs.length > 10 && (
          <input
            type="text"
            placeholder="İhtiyaç ara..."
            value={needSearch}
            onChange={(e) => setNeedSearch(e.target.value)}
            className="w-full text-xs py-1 px-2 mb-1.5 border border-outline-variant/30 rounded-sm bg-surface"
          />
        )}
        <div className="max-h-44 overflow-y-auto space-y-0.5">
          {filteredNeeds.slice(0, 30).map((n) => {
            const active = state.need_ids.includes(n.need_id);
            return (
              <button
                key={n.need_id}
                onClick={() => onChange({ need_ids: toggleArrayItem(state.need_ids, n.need_id) })}
                className={`w-full text-left text-[10px] px-2 py-1 rounded-sm transition-colors ${
                  active ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {n.need_name}
              </button>
            );
          })}
        </div>
      </Section>

      {categories.length > 1 && (
        <Section title="Kategori">
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => {
              const active = state.kategori === c.slug;
              return (
                <button
                  key={c.slug || 'all'}
                  onClick={() => onChange({ kategori: active ? '' : c.slug })}
                  className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                    active ? 'bg-on-surface text-surface border-on-surface' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {domain === 'supplement' && (
        <Section title="Form">
          <div className="flex flex-wrap gap-1">
            {SUPPLEMENT_FORMS.map((f) => {
              const active = state.form.includes(f.value);
              return (
                <button
                  key={f.value}
                  onClick={() => onChange({ form: toggleArrayItem(state.form, f.value) })}
                  className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                    active ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Marka">
        <input
          type="text"
          placeholder="Marka ara..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          className="w-full text-xs py-1 px-2 mb-1 border border-outline-variant/30 rounded-sm bg-surface"
        />
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          <button
            onClick={() => onChange({ brand_id: '' })}
            className={`w-full text-left text-[10px] px-2 py-1 rounded-sm transition-colors ${
              !state.brand_id ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
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
                  active ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="truncate">{b.brand_name}</span>
                {b.product_count !== undefined && b.product_count > 0 && (
                  <span className="text-outline text-[9px] shrink-0 ml-1">{b.product_count}</span>
                )}
              </button>
            );
          })}
          {filteredBrands.length > 60 && (
            <p className="text-[9px] text-outline px-2 py-1">+{filteredBrands.length - 60} marka. Aramayı daralt.</p>
          )}
        </div>
      </Section>

      <Section title="Sertifika">
        <div className="flex flex-wrap gap-1">
          {CERTIFICATIONS.map((c) => {
            const active = state.certifications.includes(c.value);
            return (
              <button
                key={c.value}
                onClick={() => onChange({ certifications: toggleArrayItem(state.certifications, c.value) })}
                className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                  active ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Fiyat (₺)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="min"
            value={state.fiyatMin ?? ''}
            onChange={(e) => onChange({ fiyatMin: e.target.value === '' ? null : Number(e.target.value) })}
            className="w-full text-xs py-1 px-2 border border-outline-variant/30 rounded-sm bg-surface"
            min="0"
          />
          <span className="text-outline text-[10px]">—</span>
          <input
            type="number"
            placeholder="max"
            value={state.fiyatMax ?? ''}
            onChange={(e) => onChange({ fiyatMax: e.target.value === '' ? null : Number(e.target.value) })}
            className="w-full text-xs py-1 px-2 border border-outline-variant/30 rounded-sm bg-surface"
            min="0"
          />
        </div>
      </Section>

      {domain === 'supplement' && (
        <Section title="Hedef Kitle">
          <div className="flex flex-wrap gap-1">
            {TARGET_AUDIENCE.map((ta) => {
              const active = state.target_audience.includes(ta.value);
              return (
                <button
                  key={ta.value}
                  onClick={() => onChange({ target_audience: toggleArrayItem(state.target_audience, ta.value) })}
                  className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                    active ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {ta.label}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {domain === 'cosmetic' && (
        <Section title="Cilt Tipi">
          <div className="flex flex-wrap gap-1">
            {SKIN_TYPES.map((st) => {
              const active = state.skin_type.includes(st.value);
              return (
                <button
                  key={st.value}
                  onClick={() => onChange({ skin_type: toggleArrayItem(state.skin_type, st.value) })}
                  className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                    active ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Üretim Ülkesi">
        <div className="flex flex-wrap gap-1">
          {COUNTRIES.map((c) => {
            const active = state.manufacturer_country.includes(c.value);
            return (
              <button
                key={c.value}
                onClick={() => onChange({ manufacturer_country: toggleArrayItem(state.manufacturer_country, c.value) })}
                className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                  active ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-20 curator-card p-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <h2 className="label-caps text-on-surface mb-3 tracking-[0.2em] flex items-center gap-2 pb-2 border-b border-outline-variant/20">
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

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 curator-btn-primary shadow-lg flex items-center gap-2 text-xs px-4 py-3 rounded-full"
      >
        <span className="material-icon text-[16px]" aria-hidden="true">filter_list</span>
        Filtrele
        {activeCount > 0 && (
          <span className="bg-surface text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">{activeCount}</span>
        )}
      </button>

      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-xl max-h-[85vh] overflow-y-auto p-5 pb-8">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-outline-variant/20 sticky top-0 bg-surface">
              <h2 className="label-caps text-on-surface tracking-[0.2em] flex items-center gap-2">
                <span className="material-icon text-[14px]" aria-hidden="true">filter_list</span>
                Filtrele
              </h2>
              <button onClick={() => setMobileOpen(false)} className="text-xs text-primary flex items-center gap-1">
                <span className="material-icon text-[14px]" aria-hidden="true">close</span>
                Kapat
              </button>
            </div>
            {content}
            <button onClick={() => setMobileOpen(false)} className="w-full curator-btn-primary mt-5 py-3 text-xs">
              {resultCount != null ? `${resultCount} ürünü göster` : 'Sonuçları göster'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
