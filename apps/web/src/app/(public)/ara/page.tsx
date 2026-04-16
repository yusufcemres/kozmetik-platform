'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import ScoreBadge from '@/components/public/ScoreBadge';

interface SearchResult {
  type: 'product' | 'ingredient' | 'need' | 'brand';
  id: number;
  name: string;
  slug: string;
  score: number;
  extra?: Record<string, any>;
}

interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  intent: string;
}

interface Suggestion {
  type: 'product' | 'ingredient' | 'need' | 'brand';
  id?: number;
  name: string;
  slug: string;
  score?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; path: string }> = {
  product: { label: 'Ürün', icon: 'inventory_2', path: '/urunler' },
  ingredient: { label: 'İçerik', icon: 'science', path: '/icerikler' },
  need: { label: 'İhtiyaç', icon: 'target', path: '/ihtiyaclar' },
  brand: { label: 'Marka', icon: 'storefront', path: '/markalar' },
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const suggestTimer = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string, p: number, type?: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const params = new URLSearchParams({ q, page: String(p), limit: '20' });
      if (type) params.set('type', type);
      const data = await api.get<{ data: SearchResult[]; meta: SearchMeta }>(
        `/search?${params.toString()}`,
      );
      setResults(data.data || []);
      setMeta(data.meta || null);
    } catch {
      setResults([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, 1);
    }
  }, [initialQuery, doSearch]);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const data = await api.get<Suggestion[]>(`/search/suggest?q=${encodeURIComponent(term)}`);
      setSuggestions(data || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    clearTimeout(suggestTimer.current);
    if (value.length >= 2) {
      setShowSuggestions(true);
      suggestTimer.current = setTimeout(() => fetchSuggestions(value), 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setPage(1);
    setShowSuggestions(false);
    router.push(`/ara?q=${encodeURIComponent(query.trim())}`, { scroll: false });
    doSearch(query.trim(), 1, typeFilter || undefined);
  };

  const handleSuggestionClick = (suggestion: Suggestion & { extra?: Record<string, any> }) => {
    setShowSuggestions(false);
    if (suggestion.type === 'product' && (suggestion as any).domain_type === 'supplement') {
      router.push(`/takviyeler/${suggestion.slug}`);
      return;
    }
    const cfg = TYPE_CONFIG[suggestion.type];
    router.push(`${cfg.path}/${suggestion.slug}`);
  };

  const handleTypeFilter = (type: string) => {
    const newFilter = typeFilter === type ? '' : type;
    setTypeFilter(newFilter);
    setPage(1);
    if (query.trim()) {
      doSearch(query.trim(), 1, newFilter || undefined);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    doSearch(query.trim(), newPage, typeFilter || undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resultLink = (r: SearchResult) => {
    if (r.type === 'product' && r.extra?.domain_type === 'supplement') {
      return `/takviyeler/${r.slug}`;
    }
    const cfg = TYPE_CONFIG[r.type];
    return `${cfg.path}/${r.slug}`;
  };

  return (
    <div className="curator-section max-w-[1600px] mx-auto">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Ürün, içerik maddesi veya cilt ihtiyacı ara..."
              className="w-full border border-outline-variant/30 rounded-sm px-6 py-4 text-lg focus:outline-none focus:border-primary bg-surface text-on-surface pr-12"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setResults([]);
                  setMeta(null);
                  inputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
              </button>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant/20 rounded-sm shadow-lg z-50 overflow-hidden">
                {suggestions.map((s, i) => {
                  const cfg = TYPE_CONFIG[s.type];
                  return (
                    <button
                      key={`${s.type}-${s.id}-${i}`}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low text-left transition-colors"
                    >
                      <span className="material-icon text-outline-variant" aria-hidden="true">{cfg.icon}</span>
                      <span className="flex-1 text-sm font-medium text-on-surface">{s.name}</span>
                      {s.type === 'product' && s.score != null && (
                        <ScoreBadge score={s.score} grade={s.grade} size="sm" />
                      )}
                      <span className="label-caps text-primary bg-primary/5 px-2 py-0.5 rounded-sm">
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="curator-btn-primary px-8 py-4 text-sm"
          >
            ARA
          </button>
        </div>
      </form>

      {/* Type filter pills */}
      {(results.length > 0 || typeFilter) && (
        <div className="flex gap-2 mb-6">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleTypeFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs tracking-wider uppercase transition-colors ${
                typeFilter === key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20 hover:border-outline'
              }`}
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">{cfg.icon}</span>
              {cfg.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !meta && !query && (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">search</span>
          <p className="text-on-surface-variant">Aramak istediğiniz terimi yazın</p>
          <p className="text-sm text-outline mt-2">
            Örn: &quot;niacinamide&quot;, &quot;sivilce&quot;, &quot;La Roche-Posay&quot;
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-24 text-outline">Aranıyor...</div>
      )}

      {/* Results */}
      {!loading && meta && (
        <>
          <p className="text-xs text-outline mb-6">
            {meta.total} sonuç bulundu
            {meta.intent !== 'mixed' && (
              <span className="text-outline"> — algılanan: {meta.intent}</span>
            )}
          </p>

          {results.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">search_off</span>
              <p className="text-on-surface-variant">
                &quot;{query}&quot; için sonuç bulunamadı
              </p>
              <p className="text-sm text-outline mt-2">
                Farklı anahtar kelimeler deneyin veya yazımı kontrol edin
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => {
                const cfg = TYPE_CONFIG[r.type];
                return (
                  <Link
                    key={`${r.type}-${r.id}`}
                    href={resultLink(r)}
                    className="flex items-center gap-4 curator-card p-4 group"
                  >
                    <span className="material-icon text-outline-variant" aria-hidden="true">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate tracking-tight">
                          {r.name}
                        </h3>
                        <span className="label-caps text-primary bg-primary/5 px-2 py-0.5 rounded-sm shrink-0">
                          {cfg.label}
                        </span>
                        {r.type === 'product' && r.extra?.domain_type && (
                          <span className={`label-caps px-2 py-0.5 rounded-sm shrink-0 ${
                            r.extra.domain_type === 'supplement'
                              ? 'text-score-high bg-score-high/10'
                              : 'text-primary bg-primary/5'
                          }`}>
                            {r.extra.domain_type === 'supplement' ? 'Takviye' : 'Kozmetik'}
                          </span>
                        )}
                      </div>
                      {r.extra?.brand_name && (
                        <p className="label-caps text-primary mt-0.5">{r.extra.brand_name}</p>
                      )}
                      {r.extra?.common_name && (
                        <p className="text-xs text-on-surface-variant mt-0.5">{r.extra.common_name}</p>
                      )}
                      {r.extra?.product_count != null && (
                        <p className="text-xs text-on-surface-variant mt-0.5">{r.extra.product_count} ürün</p>
                      )}
                      {r.extra?.description && (
                        <p className="text-xs text-outline mt-1 line-clamp-1">{r.extra.description}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                        <span className="text-xs font-bold text-on-surface-variant">
                          {Math.round(r.score * 100)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(page - 1)}
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
                    onClick={() => handlePageChange(pageNum)}
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
                onClick={() => handlePageChange(page + 1)}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="curator-section max-w-4xl mx-auto text-center text-outline">
          Yükleniyor...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
