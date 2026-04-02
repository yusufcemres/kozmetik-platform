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
    natural: 'Doğal',
    synthetic: 'Sentetik',
    semi_synthetic: 'Yarı-sentetik',
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">İçerik Maddeleri</h1>
      <p className="text-gray-500 mb-6">
        A&apos;dan Z&apos;ye kozmetik içerik maddeleri ansiklopedisi
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="İçerik adı ara... (örn. Niacinamide, Retinol)"
            className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
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
              className="border px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
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
            className={`w-8 h-8 rounded text-sm font-medium border transition-colors ${
              search === letter
                ? 'bg-primary text-white border-primary'
                : 'hover:bg-primary hover:text-white'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Results info */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-4">
          {meta.total} içerik maddesi bulundu
          {search && search.length > 1 && (
            <span>
              {' '}
              &mdash; &quot;{search}&quot; için sonuçlar
            </span>
          )}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
      ) : ingredients.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🧪</p>
          <p className="text-gray-400">
            {search
              ? 'Aramanızla eşleşen içerik bulunamadı'
              : 'Henüz içerik maddesi eklenmemiş'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.map((ing) => (
              <Link
                key={ing.ingredient_id}
                href={`/icerikler/${ing.ingredient_slug}`}
                className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors">
                      {ing.inci_name}
                    </h3>
                    {ing.common_name && (
                      <p className="text-xs text-primary mt-0.5">{ing.common_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {ing.allergen_flag && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded" title="Alerjen">
                        Alerjen
                      </span>
                    )}
                    {ing.fragrance_flag && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded" title="Parfüm">
                        Parfüm
                      </span>
                    )}
                  </div>
                </div>
                {ing.function_summary && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {ing.function_summary}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {ing.ingredient_group && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {ing.ingredient_group}
                    </span>
                  )}
                  {ing.origin_type && (
                    <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded">
                      {originLabel(ing.origin_type)}
                    </span>
                  )}
                  {ing.evidence_level && (
                    <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded">
                      {ing.evidence_level.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                    onClick={() => setPage(pageNum)}
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
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
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
