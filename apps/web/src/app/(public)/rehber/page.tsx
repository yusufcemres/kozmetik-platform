'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Article {
  article_id: number;
  title: string;
  slug: string;
  content_type: string;
  summary?: string;
  published_at?: string;
}

interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CONTENT_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  guide: { label: 'Rehber', icon: '📖', color: 'bg-blue-100 text-blue-700' },
  ingredient_explainer: { label: 'İçerik İnceleme', icon: '🧪', color: 'bg-teal-100 text-teal-700' },
  need_guide: { label: 'İhtiyaç Rehberi', icon: '🎯', color: 'bg-purple-100 text-purple-700' },
  label_reading: { label: 'Etiket Okuma', icon: '🏷️', color: 'bg-orange-100 text-orange-700' },
  comparison: { label: 'Karşılaştırma', icon: '⚖️', color: 'bg-pink-100 text-pink-700' },
  news: { label: 'Haber', icon: '📰', color: 'bg-gray-100 text-gray-700' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function GuidesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (typeFilter) params.set('content_type', typeFilter);
      const data = await api.get<{ data: Article[]; meta: PageMeta }>(
        `/articles?${params.toString()}`,
      );
      setArticles(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleTypeFilter = (type: string) => {
    setTypeFilter(typeFilter === type ? '' : type);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Rehber</h1>
      <p className="text-gray-500 mb-6">
        Cilt bakımı rehberleri, içerik incelemeleri ve uzman içerikleri
      </p>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(CONTENT_TYPES).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => handleTypeFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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

      {/* Results */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-gray-400">
            {typeFilter ? 'Bu kategoride henüz makale yok' : 'Henüz makale yayınlanmamış'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{meta.total} makale</p>

          <div className="space-y-4">
            {articles.map((article) => {
              const cfg = CONTENT_TYPES[article.content_type] || CONTENT_TYPES.guide;
              return (
                <Link
                  key={article.article_id}
                  href={`/rehber/${article.slug}`}
                  className="block bg-white border rounded-lg p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-1">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {article.published_at && (
                          <span className="text-[10px] text-gray-400">
                            {formatDate(article.published_at)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
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
                      pageNum === page ? 'bg-primary text-white' : 'border hover:bg-gray-50'
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
