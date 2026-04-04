'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-500';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-400';
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
      <div className="bg-white border rounded-xl overflow-hidden relative">
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/80 hover:bg-red-50 border rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          &times;
        </button>
        <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
          {imgUrl ? (
            <img src={imgUrl} alt={product.product_name} className="h-full w-full object-contain" />
          ) : (
            <span className="text-4xl text-gray-300">📦</span>
          )}
        </div>
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-primary font-semibold">{product.brand.brand_name}</p>
          )}
          <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{product.product_name}</h3>
          {score !== null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getScoreBarColor(score)}`} style={{ width: `${score}%` }} />
              </div>
              <span className={`text-xs font-bold ${getScoreColor(score)}`}>%{score}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center min-h-[280px] relative">
      <span className="text-4xl text-gray-300 mb-3">+</span>
      <p className="text-sm text-gray-400 mb-3">Ürün Ekle</p>
      <div className="w-full relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
          onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
          placeholder="Ürün adı ara..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {showSuggest && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={`${s.id}-${i}`}
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
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
    // Prevent duplicate
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

  // Collect all unique need names across selected products
  const allNeeds = new Map<number, { need_id: number; need_name: string; need_slug: string }>();
  selected.forEach((p) => {
    p.need_scores?.forEach((ns) => {
      if (ns.need && !allNeeds.has(ns.need_id)) allNeeds.set(ns.need_id, ns.need);
    });
  });

  // Collect all ingredient display names
  const allIngredientNames = new Set<string>();
  selected.forEach((p) => {
    p.ingredients?.forEach((pi) => allIngredientNames.add(pi.ingredient_display_name.toLowerCase()));
  });

  // Find common and unique ingredients
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Ürün Karşılaştır</h1>
      <p className="text-gray-500 mb-8">
        2-3 ürünü yan yana koy, içerik ve skor farklarını gör.
      </p>

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
            className="border-2 border-dashed rounded-xl p-6 flex items-center justify-center min-h-[280px] text-gray-300 hover:text-primary hover:border-primary/30 transition-colors"
          >
            <span className="text-4xl">+</span>
          </button>
        )}
      </div>

      {/* Comparison tables */}
      {selected.length >= 2 && (
        <div className="space-y-8">
          {/* Score comparison */}
          {allNeeds.size > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Uyumluluk Skorları</h2>
              <div className="bg-white border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">İhtiyaç</th>
                      {selected.map((p) => (
                        <th key={p.product_id} className="text-center px-4 py-3 text-gray-700 font-semibold">
                          {p.brand?.brand_name ? `${p.brand.brand_name} ` : ''}
                          <span className="font-normal text-gray-500 text-xs block truncate max-w-[150px] mx-auto">
                            {p.product_name}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {/* Average row */}
                    <tr className="bg-primary/5 font-semibold">
                      <td className="px-4 py-3">Genel Ortalama</td>
                      {selected.map((p) => {
                        const score = avgScore(p);
                        return (
                          <td key={p.product_id} className="text-center px-4 py-3">
                            {score !== null ? (
                              <span className={`text-lg font-bold ${getScoreColor(score)}`}>%{score}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {[...allNeeds.values()].map((need) => (
                      <tr key={need.need_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5">
                          <Link href={`/ihtiyaclar/${need.need_slug}`} className="text-gray-700 hover:text-primary">
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
                                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${getScoreBarColor(score)}`} style={{ width: `${score}%` }} />
                                  </div>
                                  <span className={`text-xs font-bold ${getScoreColor(score)}`}>%{score}</span>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs">-</span>
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
            <h2 className="text-xl font-bold mb-4">İçerik Karşılaştırması</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common */}
              {commonIngredients.length > 0 && (
                <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-xl p-5">
                  <h3 className="font-semibold text-green-700 mb-3">
                    Ortak İçerikler ({commonIngredients.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {commonIngredients.map((name) => (
                      <span key={name} className="text-xs bg-white border border-green-200 text-green-700 px-2.5 py-1 rounded-full">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unique per product */}
              {selected.map((p, idx) => (
                <div key={p.product_id} className="bg-white border rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                    Sadece {p.brand?.brand_name} {p.product_name.length > 30 ? p.product_name.slice(0, 28) + '..' : p.product_name}
                    <span className="text-gray-400 font-normal ml-1">({uniqueIngredientsPerProduct[idx]?.length || 0})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueIngredientsPerProduct[idx]?.map((name) => (
                      <span key={name} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {name}
                      </span>
                    ))}
                    {!uniqueIngredientsPerProduct[idx]?.length && (
                      <span className="text-xs text-gray-400">Benzersiz içerik yok</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick info comparison */}
          <section>
            <h2 className="text-xl font-bold mb-4">Genel Bilgiler</h2>
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-medium w-40">Marka</td>
                    {selected.map((p) => (
                      <td key={p.product_id} className="px-4 py-3 font-semibold text-center">{p.brand?.brand_name || '-'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-medium">Kategori</td>
                    {selected.map((p) => (
                      <td key={p.product_id} className="px-4 py-3 text-center">{p.category?.category_name || '-'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-medium">İçerik Sayısı</td>
                    {selected.map((p) => (
                      <td key={p.product_id} className="px-4 py-3 text-center font-semibold">{p.ingredients?.length || 0}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-medium">Satış Kanalı</td>
                    {selected.map((p) => (
                      <td key={p.product_id} className="px-4 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {(p.affiliate_links || []).filter((l) => l.is_active).map((l) => (
                            <a
                              key={l.affiliate_link_id}
                              href={l.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer nofollow sponsored"
                              className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-100"
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
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">⚖️</p>
          <p>Karşılaştırmak istediğin en az 2 ürünü seç</p>
          <p className="text-sm mt-2">Yukarıdaki kutulardan ürün ara ve ekle</p>
        </div>
      )}
    </div>
  );
}
