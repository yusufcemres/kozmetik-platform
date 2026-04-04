'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

// === Types ===

interface Ingredient {
  ingredient_id: number;
  inci_name: string;
  ingredient_slug: string;
  allergen_flag: boolean;
  fragrance_flag: boolean;
  function_summary?: string;
}

interface ProductIngredient {
  product_ingredient_id: number;
  ingredient_id: number | null;
  ingredient_display_name: string;
  inci_order_rank: number;
  concentration_band: string;
  ingredient?: Ingredient;
}

interface NeedScore {
  product_need_score_id: number;
  need_id: number;
  need?: { need_id: number; need_name: string; need_slug: string };
  compatibility_score: number;
}

interface AffiliateLink {
  affiliate_link_id: number;
  platform: string;
  affiliate_url: string;
  price_snapshot: number | null;
  is_active: boolean;
}

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand?: { brand_name: string };
  category?: { category_name: string };
  images?: { image_url: string }[];
  ingredients?: ProductIngredient[];
  need_scores?: NeedScore[];
  affiliate_links?: AffiliateLink[];
}

interface Suggestion {
  type: string;
  id: number;
  name: string;
  slug: string;
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

function avgScore(p: Product): number | null {
  if (!p.need_scores?.length) return null;
  return Math.round(
    p.need_scores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) / p.need_scores.length,
  );
}

function platformLabel(platform: string): string {
  const map: Record<string, string> = {
    trendyol: 'Trendyol', hepsiburada: 'Hepsiburada', amazon_tr: 'Amazon TR',
    dermoeczanem: 'Dermoeczanem', gratis: 'Gratis', rossmann: 'Rossmann', watsons: 'Watsons',
  };
  return map[platform] || platform;
}

// === Search Slot Component ===

function ProductSlot({
  product,
  onSelect,
  onRemove,
}: {
  product: Product | null;
  onSelect: (p: Product) => void;
  onRemove: () => void;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const data = await api.get<Suggestion[]>(`/search/suggest?q=${encodeURIComponent(q)}`);
      setSuggestions((data || []).filter((s) => s.type === 'product'));
    } catch { setSuggestions([]); }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    clearTimeout(timer.current);
    if (val.length >= 2) {
      setShowSuggest(true);
      timer.current = setTimeout(() => fetchSuggestions(val), 250);
    } else {
      setShowSuggest(false);
    }
  };

  const handleSelect = async (s: Suggestion) => {
    setShowSuggest(false);
    setQuery('');
    try {
      const full = await api.get<Product>(`/products/slug/${s.slug}`);
      onSelect(full);
    } catch {}
  };

  if (product) {
    const imgUrl = product.images?.[0]?.image_url;
    const score = avgScore(product);
    return (
      <div className="curator-card overflow-hidden relative">
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-surface/80 hover:bg-error/10 border border-outline-variant/20 rounded-full flex items-center justify-center text-outline hover:text-error transition-colors backdrop-blur-sm"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
        </button>
        <div className="h-40 bg-surface-container-low flex items-center justify-center overflow-hidden relative">
          {imgUrl ? (
            <Image src={imgUrl} alt={product.product_name} fill sizes="300px" className="object-contain" />
          ) : (
            <span className="material-icon material-icon-lg text-outline-variant" aria-hidden="true">inventory_2</span>
          )}
        </div>
        <div className="p-4">
          {product.brand && (
            <p className="label-caps text-outline">{product.brand.brand_name}</p>
          )}
          <h3 className="font-semibold text-sm text-on-surface line-clamp-2 tracking-tight">{product.product_name}</h3>
          {score !== null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getScoreBarColor(score)}`} style={{ width: `${score}%` }} />
              </div>
              <span className={`text-[10px] font-bold ${getScoreColor(score)}`}>%{score}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-outline-variant/30 rounded-sm p-6 flex flex-col items-center justify-center min-h-[280px] relative">
      <span className="material-icon text-outline-variant mb-3" style={{ fontSize: '40px' }} aria-hidden="true">add_circle_outline</span>
      <p className="label-caps text-outline-variant mb-3">Urun Ekle</p>
      <div className="w-full relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
          onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
          placeholder="Urun adi ara..."
          className="curator-input w-full"
        />
        {showSuggest && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant/20 rounded-sm shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={`${s.id}-${i}`}
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === Main Page ===

export default function ComparePage() {
  const [products, setProducts] = useState<(Product | null)[]>([null, null]);

  const addProduct = (index: number, product: Product) => {
    if (products.some((p) => p?.product_id === product.product_id)) return;
    const next = [...products];
    next[index] = product;
    setProducts(next);
  };

  const removeProduct = (index: number) => {
    const next = [...products];
    next[index] = null;
    setProducts(next);
  };

  const addSlot = () => {
    if (products.length < 3) setProducts([...products, null]);
  };

  const selected = products.filter(Boolean) as Product[];

  const allNeeds = new Map<number, { need_id: number; need_name: string; need_slug: string }>();
  selected.forEach((p) => {
    p.need_scores?.forEach((ns) => {
      if (ns.need && !allNeeds.has(ns.need_id)) allNeeds.set(ns.need_id, ns.need);
    });
  });

  const allIngredientNames = new Set<string>();
  selected.forEach((p) => {
    p.ingredients?.forEach((pi) => allIngredientNames.add(pi.ingredient_display_name.toLowerCase()));
  });

  const commonIngredients = selected.length >= 2
    ? [...allIngredientNames].filter((name) =>
        selected.every((p) => p.ingredients?.some((pi) => pi.ingredient_display_name.toLowerCase() === name)),
      )
    : [];

  const uniqueIngredientsPerProduct = selected.map((p) =>
    (p.ingredients || [])
      .filter((pi) => !commonIngredients.includes(pi.ingredient_display_name.toLowerCase()))
      .map((pi) => pi.ingredient_display_name),
  );

  return (
    <div className="curator-section max-w-7xl mx-auto">
      <div className="mb-10">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Analiz</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">URUN KARSILASTIR</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          2-3 urunu yan yana koy, icerik ve skor farklarini gor.
        </p>
      </div>

      {/* Product slots */}
      <div className={`grid gap-6 mb-8 ${products.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {products.map((p, idx) => (
          <ProductSlot
            key={idx}
            product={p}
            onSelect={(prod) => addProduct(idx, prod)}
            onRemove={() => removeProduct(idx)}
          />
        ))}
        {products.length < 3 && (
          <button
            onClick={addSlot}
            className="border-2 border-dashed border-outline-variant/30 rounded-sm p-6 flex items-center justify-center min-h-[280px] text-outline-variant hover:text-primary hover:border-primary/30 transition-colors"
          >
            <span className="material-icon" style={{ fontSize: '40px' }} aria-hidden="true">add_circle_outline</span>
          </button>
        )}
      </div>

      {/* Comparison tables */}
      {selected.length >= 2 && (
        <div className="space-y-8">
          {/* Score comparison */}
          {allNeeds.size > 0 && (
            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">Uyumluluk Skorlari</h2>
              <div className="curator-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/20">
                      <th className="text-left px-4 py-3 label-caps text-on-surface-variant">Ihtiyac</th>
                      {selected.map((p) => (
                        <th key={p.product_id} className="text-center px-4 py-3 text-on-surface font-semibold">
                          {p.brand?.brand_name ? `${p.brand.brand_name} ` : ''}
                          <span className="font-normal text-outline text-xs block truncate max-w-[150px] mx-auto">
                            {p.product_name}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {/* Average row */}
                    <tr className="bg-primary/5 font-semibold">
                      <td className="px-4 py-3 text-on-surface">Genel Ortalama</td>
                      {selected.map((p) => {
                        const score = avgScore(p);
                        return (
                          <td key={p.product_id} className="text-center px-4 py-3">
                            {score !== null ? (
                              <span className={`text-lg font-bold ${getScoreColor(score)}`}>%{score}</span>
                            ) : (
                              <span className="text-outline">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {[...allNeeds.values()].map((need) => (
                      <tr key={need.need_id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-2.5">
                          <Link href={`/ihtiyaclar/${need.need_slug}`} className="text-on-surface-variant hover:text-primary transition-colors">
                            {need.need_name}
                          </Link>
                        </td>
                        {selected.map((p) => {
                          const ns = p.need_scores?.find((s) => s.need_id === need.need_id);
                          const score = ns ? Math.round(Number(ns.compatibility_score)) : null;
                          return (
                            <td key={p.product_id} className="text-center px-4 py-2.5">
                              {score !== null ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${getScoreBarColor(score)}`} style={{ width: `${score}%` }} />
                                  </div>
                                  <span className={`text-xs font-bold ${getScoreColor(score)}`}>%{score}</span>
                                </div>
                              ) : (
                                <span className="text-outline text-xs">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Ingredient diff */}
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Icerik Karsilastirmasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common */}
              {commonIngredients.length > 0 && (
                <div className="md:col-span-2 bg-score-high/5 border border-score-high/20 rounded-sm p-5">
                  <h3 className="font-semibold text-score-high mb-3">
                    Ortak Icerikler ({commonIngredients.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {commonIngredients.map((name) => (
                      <span key={name} className="label-caps bg-surface border border-score-high/20 text-score-high px-2.5 py-1 rounded-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unique per product */}
              {selected.map((p, idx) => (
                <div key={p.product_id} className="curator-card p-5">
                  <h3 className="font-semibold text-on-surface mb-3 text-sm">
                    Sadece {p.brand?.brand_name} {p.product_name.length > 30 ? p.product_name.slice(0, 28) + '..' : p.product_name}
                    <span className="text-outline font-normal ml-1">({uniqueIngredientsPerProduct[idx]?.length || 0})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueIngredientsPerProduct[idx]?.map((name) => (
                      <span key={name} className="label-caps bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-sm">
                        {name}
                      </span>
                    ))}
                    {!uniqueIngredientsPerProduct[idx]?.length && (
                      <span className="label-caps text-outline">Benzersiz icerik yok</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick info comparison */}
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">Genel Bilgiler</h2>
            <div className="curator-card overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-outline-variant/20">
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant font-medium w-40">Marka</td>
                    {selected.map((p) => (
                      <td key={p.product_id} className="px-4 py-3 font-semibold text-on-surface text-center">{p.brand?.brand_name || '-'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant font-medium">Kategori</td>
                    {selected.map((p) => (
                      <td key={p.product_id} className="px-4 py-3 text-on-surface text-center">{p.category?.category_name || '-'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant font-medium">Icerik Sayisi</td>
                    {selected.map((p) => (
                      <td key={p.product_id} className="px-4 py-3 text-on-surface font-semibold text-center">{p.ingredients?.length || 0}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant font-medium">Satis Kanali</td>
                    {selected.map((p) => (
                      <td key={p.product_id} className="px-4 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {(p.affiliate_links || []).filter((l) => l.is_active).map((l) => (
                            <a
                              key={l.affiliate_link_id}
                              href={l.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer nofollow sponsored"
                              className="label-caps bg-primary/5 text-primary px-2 py-0.5 rounded-sm hover:bg-primary/10 transition-colors"
                            >
                              {platformLabel(l.platform)}
                            </a>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Empty state */}
      {selected.length < 2 && (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">compare</span>
          <p className="text-on-surface-variant">Karsilastirmak istedigin en az 2 urunu sec</p>
          <p className="text-sm text-outline mt-2">Yukaridaki kutulardan urun ara ve ekle</p>
        </div>
      )}
    </div>
  );
}
