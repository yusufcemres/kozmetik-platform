'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface SupplementProduct {
  product_id: number;
  product_name: string;
  product_slug: string;
  short_description: string;
  brand?: { brand_name: string };
  category?: { category_name: string };
}

export default function SupplementsListPage() {
  const [products, setProducts] = useState<SupplementProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api
      .get<{ data: SupplementProduct[]; meta: { totalPages: number } }>(`/supplements?page=${page}&limit=12`)
      .then((data) => {
        setProducts(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="curator-section max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Saglik</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">TAKVIYE GIDALAR</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          Vitamin, mineral ve besin takviyelerini karsilastir, iceriklerini analiz et
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="curator-card p-5 animate-pulse">
              <div className="h-4 bg-surface-container rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-container rounded w-full mb-2" />
              <div className="h-3 bg-surface-container rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">medication</span>
          <p className="text-on-surface-variant">Henuz takviye urun eklenmemis</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <Link
                key={p.product_id}
                href={`/takviyeler/${p.product_slug}`}
                className="curator-card p-5 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-icon text-primary" aria-hidden="true">medication</span>
                  <div className="min-w-0 flex-1">
                    {p.brand && (
                      <p className="label-caps text-outline truncate">
                        {p.brand.brand_name}
                      </p>
                    )}
                    <h3 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors tracking-tight">
                      {p.product_name}
                    </h3>
                  </div>
                </div>
                {p.short_description && (
                  <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">{p.short_description}</p>
                )}
                {p.category && (
                  <span className="label-caps text-outline bg-surface-container-low px-2 py-0.5 rounded-sm inline-block mt-3">
                    {p.category.category_name}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
