'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Ingredient {
  ingredient_id: number;
  inci_name: string;
  common_name?: string;
  ingredient_slug: string;
  ingredient_group?: string;
  origin_type?: string;
  function_summary?: string;
  allergen_flag: boolean;
  fragrance_flag: boolean;
  preservative_flag: boolean;
  evidence_level?: string;
}

interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function originLabel(type: string): string {
  const map: Record<string, string> = {
    natural: 'Dogal',
    synthetic: 'Sentetik',
    semi_synthetic: 'Yari-sentetik',
    biotechnology: 'Biyoteknoloji',
  };
  return map[type] || type;
}

export default function IngredientsListPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, limit: 24, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '24');
      if (search) params.set('search', search);

      const data = await api.get<{ data: Ingredient[]; meta: PageMeta }>(
        `/ingredients?${params.toString()}`,
      );
      setIngredients(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 24, totalPages: 1 });
    } catch {
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleLetterFilter = (letter: string) => {
    setSearchInput(letter);
    setSearch(letter);
    setPage(1);
  };

  return (
    <div className="curator-section max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Ansiklopedi</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">ICERIK MADDELERI</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          A&apos;dan Z&apos;ye kozmetik icerik maddeleri ansiklopedisi
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Icerik adi ara... (orn. Niacinamide, Retinol)"
            className="curator-input flex-1"
          />
          <button
            type="submit"
            className="curator-btn-primary text-[10px] px-6 py-3"
          >
            Ara
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setPage(1);
              }}
              className="curator-btn-outline text-[10px] px-4 py-3"
            >
              Temizle
            </button>
          )}
        </div>
      </form>

      {/* Alphabet filter */}
      <div className="flex flex-wrap gap-1 mb-8">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterFilter(letter)}
            className={`w-8 h-8 rounded-sm text-xs font-medium border transition-colors ${
              search === letter
                ? 'bg-primary text-on-primary border-primary'
                : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:border-outline'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Results info */}
      {!loading && (
        <p className="text-xs text-outline mb-6">
          {meta.total} icerik maddesi bulundu
          {search && search.length > 1 && (
            <span>
              {' '}
              &mdash; &quot;{search}&quot; icin sonuclar
            </span>
          )}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="curator-card p-5 animate-pulse">
              <div className="h-4 bg-surface-container rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-container rounded w-1/3 mb-2" />
              <div className="h-3 bg-surface-container rounded w-full" />
            </div>
          ))}
        </div>
      ) : ingredients.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">science</span>
          <p className="text-on-surface-variant">
            {search
              ? 'Aramanizla eslesen icerik bulunamadi'
              : 'Henuz icerik maddesi eklenmemis'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.map((ing) => (
              <Link
                key={ing.ingredient_id}
                href={`/icerikler/${ing.ingredient_slug}`}
                className="curator-card p-5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors tracking-tight">
                      {ing.inci_name}
                    </h3>
                    {ing.common_name && (
                      <p className="text-xs text-primary mt-0.5">{ing.common_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {ing.allergen_flag && (
                      <span className="label-caps text-error bg-error/10 px-1.5 py-0.5 rounded-sm" title="Alerjen">
                        Alerjen
                      </span>
                    )}
                    {ing.fragrance_flag && (
                      <span className="label-caps text-on-surface-variant bg-tertiary-container px-1.5 py-0.5 rounded-sm" title="Parfum">
                        Parfum
                      </span>
                    )}
                  </div>
                </div>
                {ing.function_summary && (
                  <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                    {ing.function_summary}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {ing.ingredient_group && (
                    <span className="label-caps text-outline bg-surface-container-low px-2 py-0.5 rounded-sm">
                      {ing.ingredient_group}
                    </span>
                  )}
                  {ing.origin_type && (
                    <span className="label-caps text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-sm">
                      {originLabel(ing.origin_type)}
                    </span>
                  )}
                  {ing.evidence_level && (
                    <span className="label-caps text-outline bg-surface-container-low px-2 py-0.5 rounded-sm">
                      {ing.evidence_level.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
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
  );
}
