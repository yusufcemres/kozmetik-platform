'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface SearchResult {
  type: 'product' | 'ingredient' | 'need';
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
  type: 'product' | 'ingredient' | 'need';
  id: number;
  name: string;
  slug: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; path: string }> = {
  product: { label: 'Ürün', icon: '📦', color: 'bg-blue-100 text-blue-700', path: '/urunler' },
  ingredient: { label: 'İçerik', icon: '🧪', color: 'bg-teal-100 text-teal-700', path: '/icerikler' },
  need: { label: 'İhtiyaç', icon: '🎯', color: 'bg-purple-100 text-purple-700', path: '/ihtiyaclar' },
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

  // Initial search from URL param
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, 1);
    }
  }, [initialQuery, doSearch]);

  // Auto-suggest
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

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
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
    const cfg = TYPE_CONFIG[r.type];
    return `${cfg.path}/${r.slug}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Ürün, içerik maddesi veya cilt ihtiyacı ara..."
              className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-primary pr-12"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                {suggestions.map((s, i) => {
                  const cfg = TYPE_CONFIG[s.type];
                  return (
                    <button
                      key={`${s.type}-${s.id}-${i}`}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <span className="text-lg">{cfg.icon}</span>
                      <span className="flex-1 text-sm font-medium text-gray-800">{s.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${cfg.color}`}>
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
            className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Ara
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cfg.icon}</span>
              {cfg.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !meta && !query && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p>Aramak istediğiniz terimi yazın</p>
          <p className="text-sm mt-2">
            Örn: &quot;niacinamide&quot;, &quot;sivilce&quot;, &quot;La Roche-Posay&quot;
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400">Aranıyor...</div>
      )}

      {/* Results */}
      {!loading && meta && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {meta.total} sonuç bulundu
            {meta.intent !== 'mixed' && (
              <span className="text-gray-400"> — algılanan: {meta.intent}</span>
            )}
          </p>

          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🤷</p>
              <p className="text-gray-500">
                &quot;{query}&quot; için sonuç bulunamadı
              </p>
              <p className="text-sm text-gray-400 mt-2">
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
                    className="flex items-center gap-4 bg-white border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all group"
                  >
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors truncate">
                          {r.name}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {r.extra?.brand_name && (
                        <p className="text-xs text-primary mt-0.5">{r.extra.brand_name}</p>
                      )}
                      {r.extra?.common_name && (
                        <p className="text-xs text-gray-500 mt-0.5">{r.extra.common_name}</p>
                      )}
                      {r.extra?.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{r.extra.description}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">
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
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
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
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      pageNum === page
                        ? 'bg-primary text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-400">
          Yükleniyor...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
