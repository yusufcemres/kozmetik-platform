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
  product_types: string[];
  target_areas: string[];
  // Round 2 ek dimension'lar
  evidence_grade: string[]; // A,B,C,D,F
  safety_flags: string[];   // cmr_free, endocrine_free, eu_banned_free, fragrance_free
  allergen_count_max: number | null; // 0 = alerjensiz, null = filtre yok
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
  product_types: [],
  target_areas: [],
  evidence_grade: [],
  safety_flags: [],
  allergen_count_max: null,
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

const COSMETIC_PRODUCT_TYPES = [
  { value: 'serum', label: 'Serum & Ampul' },
  { value: 'krem', label: 'Krem' },
  { value: 'temizleyici', label: 'Temizleyici' },
  { value: 'nemlendirici', label: 'Nemlendirici' },
  { value: 'güneş kremi', label: 'Güneş Koruyucu' },
  { value: 'tonik', label: 'Tonik' },
  { value: 'maske', label: 'Maske' },
  { value: 'göz kremi', label: 'Göz Kremi' },
  { value: 'peeling', label: 'Peeling & Eksfoliyan' },
  { value: 'esans', label: 'Esans' },
  { value: 'dudak bakım', label: 'Dudak Bakımı' },
  { value: 'fondöten', label: 'Fondöten' },
];

const COSMETIC_TARGET_AREAS = [
  { value: 'yüz', label: 'Yüz' },
  { value: 'göz', label: 'Göz Çevresi' },
  { value: 'vücut', label: 'Vücut' },
  { value: 'dudak', label: 'Dudak' },
  { value: 'saç', label: 'Saç' },
  { value: 'el', label: 'El' },
  { value: 'yüz_vücut', label: 'Yüz & Vücut' },
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
  { slug: 'vitamin-k2', label: 'K2 Vitamini' },
  { slug: 'coq10', label: 'CoQ10' },
  { slug: 'beta-glucan', label: 'Beta-Glukan' },
  { slug: 'lactobacillus-acidophilus', label: 'Probiyotik' },
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

/** Alt-alta checkbox satırı — multi-select dimension'lar için ortak render. */
/**
 * File-scope component — DEPENDS ON THIS olmasi cunku kullanici filtreleme arama
 * input'una her tus vurusunda parent re-render oluyor. Eger Section parent
 * fonksiyon icinde tanimli olursa her render'da yeni reference uretir, React
 * native <details>'i unmount/remount eder ve open state kaybolur.
 *
 * Patron: 'aramada harfe basinca kapaniyor tekrar tiklayarak aciyorum' (2026-04-24)
 * Cozum: dosya kapsaminda tanimli kal, prop ile state al.
 */
function Section({
  title,
  children,
  defaultOpen = false,
  count,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-outline-variant/15 last:border-b-0">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between py-2.5">
        <span className="label-caps text-on-surface flex items-center gap-1.5">
          {title}
          {count !== undefined && count > 0 && (
            <span className="bg-primary text-on-primary text-[9px] px-1.5 py-0.5 rounded-full tabular-nums">
              {count}
            </span>
          )}
        </span>
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
}

function CheckboxRow({ label, active, onToggle, count }: { label: string; active: boolean; onToggle: () => void; count?: number }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-left transition-colors ${
        active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
      }`}
    >
      <span
        className={`w-3.5 h-3.5 border rounded-sm shrink-0 flex items-center justify-center ${
          active ? 'bg-primary border-primary' : 'border-outline-variant/50'
        }`}
      >
        {active && (
          <span className="material-icon text-on-primary" style={{ fontSize: '10px' }} aria-hidden="true">
            check
          </span>
        )}
      </span>
      <span className={`flex-1 text-[11px] truncate ${active ? 'font-semibold' : ''}`}>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-outline text-[9px] shrink-0 tabular-nums">{count}</span>
      )}
    </button>
  );
}

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

  useEffect(() => {
    if (ingredientSearch.length < 2) {
      setIngredientResults([]);
      return;
    }
    const t = setTimeout(() => {
      api
        .get<{ data: Ingredient[] }>(`/ingredients?search=${encodeURIComponent(ingredientSearch)}&limit=30`)
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
    ...state.product_types,
    ...state.target_areas,
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

  // Etken madde render — popüler + arama sonuçları birleşik, alt alta list
  const ingredientListItems = (() => {
    const items = new Map<string, { slug: string; label: string; popular?: boolean }>();
    // Popüler önce
    for (const p of popularIngredients) items.set(p.slug, { slug: p.slug, label: p.label, popular: true });
    // Arama sonuçları + seçili olanlar (ki seçim listeden kaybolmasın)
    for (const i of ingredientResults) {
      if (!items.has(i.ingredient_slug)) {
        items.set(i.ingredient_slug, { slug: i.ingredient_slug, label: i.common_name || i.inci_name });
      }
    }
    // Seçili ama listede yoksa (rare, başka slug'lardan sonra) → ekle
    for (const slug of state.ingredient_slugs) {
      if (!items.has(slug)) items.set(slug, { slug, label: slug });
    }
    return Array.from(items.values());
  })();

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

      <Section title="Harf Notu" count={state.evidence_grade.length}>
        <div className="flex flex-wrap gap-1">
          {[
            { value: 'A', color: 'text-score-high' },
            { value: 'B', color: 'text-score-high' },
            { value: 'C', color: 'text-score-medium' },
            { value: 'D', color: 'text-score-low' },
            { value: 'F', color: 'text-score-low' },
          ].map((g) => {
            const active = state.evidence_grade.includes(g.value);
            return (
              <button
                key={g.value}
                onClick={() => onChange({ evidence_grade: toggleArrayItem(state.evidence_grade, g.value) })}
                className={`text-xs font-bold w-7 h-7 rounded-sm border transition-colors ${
                  active
                    ? 'bg-primary text-on-primary border-primary'
                    : `border-outline-variant/30 ${g.color} hover:border-primary/50`
                }`}
              >
                {g.value}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Güvenlik" count={state.safety_flags.length}>
        <div className="space-y-0.5">
          {[
            { value: 'cmr_free', label: 'CMR-free (kanserojen/mutajen yok)' },
            { value: 'endocrine_free', label: 'Endokrin bozucu yok' },
            { value: 'eu_banned_free', label: 'AB yasaklı içerik yok' },
            { value: 'fragrance_free', label: 'Parfümsüz' },
          ].map((f) => (
            <CheckboxRow
              key={f.value}
              label={f.label}
              active={state.safety_flags.includes(f.value)}
              onToggle={() => onChange({ safety_flags: toggleArrayItem(state.safety_flags, f.value) })}
            />
          ))}
        </div>
      </Section>

      {domain === 'cosmetic' && (
        <Section title="Alerjen Yükü" count={state.allergen_count_max != null ? 1 : 0}>
          <div className="flex flex-wrap gap-1">
            {[
              { value: 0, label: '0 (alerjensiz)' },
              { value: 2, label: '≤ 2' },
              { value: 5, label: '≤ 5' },
            ].map((b) => {
              const active = state.allergen_count_max === b.value;
              return (
                <button
                  key={b.value}
                  onClick={() => onChange({ allergen_count_max: active ? null : b.value })}
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
      )}

      <Section title="Etken Madde" count={state.ingredient_slugs.length}>
        <div className="relative mb-1.5">
          <span className="material-icon absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[12px] pointer-events-none" aria-hidden="true">search</span>
          <input
            type="text"
            placeholder="Madde ara..."
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1 text-xs border border-outline-variant/30 rounded-sm bg-surface"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {ingredientSearch.length >= 2 && ingredientResults.length > 0 && (
            <p className="text-[9px] text-outline px-2 py-0.5 sticky top-0 bg-surface">
              {ingredientResults.length} sonuç
            </p>
          )}
          {ingredientSearch.length < 2 && (
            <p className="text-[9px] text-outline px-2 py-0.5 sticky top-0 bg-surface">
              Popüler maddeler
            </p>
          )}
          {ingredientListItems.map((ing) => (
            <CheckboxRow
              key={ing.slug}
              label={ing.label}
              active={state.ingredient_slugs.includes(ing.slug)}
              onToggle={() => onChange({ ingredient_slugs: toggleArrayItem(state.ingredient_slugs, ing.slug) })}
            />
          ))}
          {ingredientSearch.length >= 2 && ingredientResults.length === 0 && (
            <p className="text-[10px] text-outline px-2 py-2">Sonuç yok — farklı arama dene</p>
          )}
        </div>
      </Section>

      <Section title="İhtiyaç" count={state.need_ids.length}>
        {needs.length > 10 && (
          <input
            type="text"
            placeholder="İhtiyaç ara..."
            value={needSearch}
            onChange={(e) => setNeedSearch(e.target.value)}
            className="w-full text-xs py-1 px-2 mb-1.5 border border-outline-variant/30 rounded-sm bg-surface"
          />
        )}
        <div className="max-h-64 overflow-y-auto">
          {filteredNeeds.map((n) => (
            <CheckboxRow
              key={n.need_id}
              label={n.need_name}
              active={state.need_ids.includes(n.need_id)}
              onToggle={() => onChange({ need_ids: toggleArrayItem(state.need_ids, n.need_id) })}
            />
          ))}
        </div>
      </Section>

      {categories.length > 1 && (
        <Section title="Kategori" count={state.kategori ? 1 : 0}>
          <div>
            {categories.map((c) => (
              <CheckboxRow
                key={c.slug || 'all'}
                label={c.label}
                active={state.kategori === c.slug}
                onToggle={() => onChange({ kategori: state.kategori === c.slug ? '' : c.slug })}
              />
            ))}
          </div>
        </Section>
      )}

      {domain === 'supplement' && (
        <Section title="Form" count={state.form.length}>
          <div>
            {SUPPLEMENT_FORMS.map((f) => (
              <CheckboxRow
                key={f.value}
                label={f.label}
                active={state.form.includes(f.value)}
                onToggle={() => onChange({ form: toggleArrayItem(state.form, f.value) })}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Marka" count={state.brand_id ? 1 : 0}>
        <input
          type="text"
          placeholder="Marka ara..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          className="w-full text-xs py-1 px-2 mb-1 border border-outline-variant/30 rounded-sm bg-surface"
        />
        <div className="max-h-64 overflow-y-auto">
          <CheckboxRow
            label="Tüm markalar"
            active={!state.brand_id}
            onToggle={() => onChange({ brand_id: '' })}
          />
          {filteredBrands.slice(0, 80).map((b) => (
            <CheckboxRow
              key={b.brand_id}
              label={b.brand_name}
              active={state.brand_id === String(b.brand_id)}
              onToggle={() => onChange({ brand_id: state.brand_id === String(b.brand_id) ? '' : String(b.brand_id) })}
              count={b.product_count}
            />
          ))}
          {filteredBrands.length > 80 && (
            <p className="text-[9px] text-outline px-2 py-1">+{filteredBrands.length - 80} marka. Aramayı daralt.</p>
          )}
        </div>
      </Section>

      <Section title="Sertifika" count={state.certifications.length}>
        <div>
          {CERTIFICATIONS.map((c) => (
            <CheckboxRow
              key={c.value}
              label={c.label}
              active={state.certifications.includes(c.value)}
              onToggle={() => onChange({ certifications: toggleArrayItem(state.certifications, c.value) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Fiyat (₺)" count={state.fiyatMin != null || state.fiyatMax != null ? 1 : 0}>
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
        <Section title="Hedef Kitle" count={state.target_audience.length}>
          <div>
            {TARGET_AUDIENCE.map((ta) => (
              <CheckboxRow
                key={ta.value}
                label={ta.label}
                active={state.target_audience.includes(ta.value)}
                onToggle={() => onChange({ target_audience: toggleArrayItem(state.target_audience, ta.value) })}
              />
            ))}
          </div>
        </Section>
      )}

      {domain === 'cosmetic' && (
        <Section title="Ürün Tipi" count={state.product_types.length}>
          <div>
            {COSMETIC_PRODUCT_TYPES.map((pt) => (
              <CheckboxRow
                key={pt.value}
                label={pt.label}
                active={state.product_types.includes(pt.value)}
                onToggle={() => onChange({ product_types: toggleArrayItem(state.product_types, pt.value) })}
              />
            ))}
          </div>
        </Section>
      )}

      {domain === 'cosmetic' && (
        <Section title="Bölge" count={state.target_areas.length}>
          <div>
            {COSMETIC_TARGET_AREAS.map((ta) => (
              <CheckboxRow
                key={ta.value}
                label={ta.label}
                active={state.target_areas.includes(ta.value)}
                onToggle={() => onChange({ target_areas: toggleArrayItem(state.target_areas, ta.value) })}
              />
            ))}
          </div>
        </Section>
      )}

      {domain === 'cosmetic' && (
        <Section title="Cilt Tipi" count={state.skin_type.length}>
          <div>
            {SKIN_TYPES.map((st) => (
              <CheckboxRow
                key={st.value}
                label={st.label}
                active={state.skin_type.includes(st.value)}
                onToggle={() => onChange({ skin_type: toggleArrayItem(state.skin_type, st.value) })}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Üretim Ülkesi" count={state.manufacturer_country.length}>
        <div>
          {COUNTRIES.map((c) => (
            <CheckboxRow
              key={c.value}
              label={c.label}
              active={state.manufacturer_country.includes(c.value)}
              onToggle={() => onChange({ manufacturer_country: toggleArrayItem(state.manufacturer_country, c.value) })}
            />
          ))}
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
