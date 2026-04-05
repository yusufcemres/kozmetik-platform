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

const CONTENT_TYPES: Record<string, { label: string; icon: string }> = {
  guide: { label: 'Rehber', icon: 'menu_book' },
  ingredient_explainer: { label: 'İçerik İnceleme', icon: 'science' },
  need_guide: { label: 'İhtiyaç Rehberi', icon: 'target' },
  label_reading: { label: 'Etiket Okuma', icon: 'label' },
  comparison: { label: 'Karşılaştırma', icon: 'compare' },
  news: { label: 'Haber', icon: 'newspaper' },
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
    <div className="curator-section max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Bilgi</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">REHBER</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          Cilt bakımı rehberleri, içerik incelemeleri ve uzman içerikleri
        </p>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(CONTENT_TYPES).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => handleTypeFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs tracking-wider transition-colors ${
              typeFilter === key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20 hover:border-outline'
            }`}
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">{cfg.icon}</span>
            <span className="uppercase">{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="curator-card p-5 animate-pulse">
              <div className="h-3 bg-surface-container rounded w-1/4 mb-3" />
              <div className="h-5 bg-surface-container rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-container rounded w-full" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">article</span>
          <p className="text-on-surface-variant">
            {typeFilter ? 'Bu kategoride henüz makale yok' : 'Henüz makale yayınlanmamış'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-outline mb-6">{meta.total} makale</p>

          <div className="space-y-4">
            {articles.map((article) => {
              const cfg = CONTENT_TYPES[article.content_type] || CONTENT_TYPES.guide;
              return (
                <Link
                  key={article.article_id}
                  href={`/rehber/${article.slug}`}
                  className="block curator-card p-5 group"
                >
                  <div className="flex items-start gap-4">
                    <span className="material-icon text-outline-variant mt-0.5" aria-hidden="true">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="label-caps text-primary bg-primary/5 px-2 py-0.5 rounded-sm">
                          {cfg.label}
                        </span>
                        {article.published_at && (
                          <span className="label-caps text-outline">
                            {formatDate(article.published_at)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight">
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
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
