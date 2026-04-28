'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

/**
 * Hero search bar — Google-style autocomplete
 *
 * - Debounced fetch /search/suggest?q= (300ms)
 * - Dropdown 7 result max (mixed: products + ingredients + brands)
 * - Keyboard nav: ↑↓ Enter Escape
 * - Click outside closes
 * - Empty: popular tags
 *
 * Görsel: dark glassmorphism uyumlu (bg-white/10 + backdrop-blur)
 */

interface Suggestion {
  type: 'product' | 'ingredient' | 'brand' | 'need' | 'category';
  name: string;
  slug: string;
  // Optional product extras
  score?: number;
  grade?: string;
  // Legacy / generic
  label?: string;
  meta?: string;
}

const POPULAR = ['Retinol', 'Niacinamide', 'Vitamin C', 'Hyaluronic Acid', 'SPF', 'Salisilik Asit'];

export default function HeroSearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced fetch
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const data = await api.get<Suggestion[]>(
          `/search/suggest?q=${encodeURIComponent(term)}`,
        );
        setSuggestions(Array.isArray(data) ? data.slice(0, 7) : []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;
      router.push(`/ara?q=${encodeURIComponent(t)}`);
      setOpen(false);
    },
    [router],
  );

  const navigateToSuggestion = useCallback(
    (s: Suggestion) => {
      const routes: Record<Suggestion['type'], string> = {
        product: `/urunler/${s.slug}`,
        ingredient: `/icerikler/${s.slug}`,
        brand: `/markalar/${s.slug}`,
        need: `/ihtiyaclar/${s.slug}`,
        category: `/urunler?kategori=${encodeURIComponent(s.slug)}`,
      };
      const fallback = s.name || s.label || '';
      router.push(routes[s.type] || `/ara?q=${encodeURIComponent(fallback)}`);
      setOpen(false);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        navigateToSuggestion(suggestions[activeIdx]);
      } else {
        submitSearch(query);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  };

  const showDropdown = open && (query.trim().length >= 2 || query.trim().length === 0);
  const showResults = query.trim().length >= 2 && suggestions.length > 0;
  const showEmpty = query.trim().length >= 2 && !loading && suggestions.length === 0;
  const showPopular = query.trim().length === 0;

  const typeMeta: Record<Suggestion['type'], { icon: string; label: string }> = {
    product: { icon: 'inventory_2', label: 'Ürün' },
    ingredient: { icon: 'science', label: 'İçerik' },
    brand: { icon: 'storefront', label: 'Marka' },
    need: { icon: 'healing', label: 'İhtiyaç' },
    category: { icon: 'category', label: 'Kategori' },
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto lg:mx-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
        className="relative"
      >
        <span
          className="material-icon text-outline absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ fontSize: '22px' }}
          aria-hidden="true"
        >
          search
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Ürün, marka veya içerik ara — örn. niacinamide, retinol"
          className="w-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 focus:border-primary rounded-full pl-14 pr-36 sm:pr-44 py-5 sm:py-6 text-base sm:text-lg text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="hero-search-dropdown"
        />

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-primary text-on-primary px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-primary-dim transition-colors active:scale-95"
        >
          <span className="hidden sm:inline">Ara</span>
          <span className="material-icon" style={{ fontSize: '18px' }} aria-hidden="true">
            search
          </span>
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="hero-search-dropdown"
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-2xl overflow-hidden z-50"
          role="listbox"
        >
          {/* Loading */}
          {loading && query.trim().length >= 2 && (
            <div className="px-5 py-4 text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-icon animate-spin" style={{ fontSize: '16px' }} aria-hidden="true">
                progress_activity
              </span>
              Aranıyor...
            </div>
          )}

          {/* Results */}
          {showResults && (
            <ul className="py-2 max-h-[400px] overflow-y-auto">
              {suggestions.map((s, idx) => {
                const meta = typeMeta[s.type];
                const active = idx === activeIdx;
                const displayName = s.name || s.label || '';
                const scoreInfo = s.type === 'product' && s.score != null
                  ? `Skor: %${s.score}${s.grade ? ` · ${s.grade}` : ''}`
                  : s.meta;
                return (
                  <li key={`${s.type}-${s.slug}-${idx}`} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => navigateToSuggestion(s)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                        active ? 'bg-surface-container' : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <span
                        className="material-icon text-primary shrink-0"
                        style={{ fontSize: '18px' }}
                        aria-hidden="true"
                      >
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface font-medium truncate">{displayName}</p>
                        {scoreInfo && (
                          <p className="text-[11px] text-on-surface-variant truncate">{scoreInfo}</p>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-outline shrink-0 font-semibold">
                        {meta.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Empty state for actual query */}
          {showEmpty && (
            <div className="px-5 py-4 text-sm text-on-surface-variant">
              <p>"{query}" için sonuç yok.</p>
              <button
                type="button"
                onClick={() => submitSearch(query)}
                className="text-xs text-primary hover:underline mt-1 font-semibold"
              >
                Yine de aramayı dene →
              </button>
            </div>
          )}

          {/* Popular when empty */}
          {showPopular && (
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-outline mb-2">
                Popüler aramalar
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <Link
                    key={p}
                    href={`/urunler?search=${encodeURIComponent(p)}`}
                    onClick={() => setOpen(false)}
                    className="text-xs bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
