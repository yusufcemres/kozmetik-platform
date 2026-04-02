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
      .get('/supplements', { params: { page, limit: 12 } })
      .then((res: any) => {
        setProducts(res.data || []);
        setTotalPages(res.meta?.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Takviye Gıdalar</h1>
      <p className="text-gray-500 mb-8">
        Vitamin, mineral ve besin takviyelerini karşılaştır, içeriklerini analiz et
      </p>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">💊</p>
          <p className="text-gray-400">Henüz takviye ürün eklenmemiş</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                key={p.product_id}
                href={`/takviyeler/${p.product_slug}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💊</span>
                  <div>
                    {p.brand && (
                      <p className="text-xs text-teal-600 font-semibold">
                        {p.brand.brand_name}
                      </p>
                    )}
                    <h3 className="font-bold text-sm">{p.product_name}</h3>
                  </div>
                </div>
                {p.short_description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{p.short_description}</p>
                )}
                {p.category && (
                  <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {p.category.category_name}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm ${
                    p === page ? 'bg-teal-600 text-white' : 'border hover:bg-gray-50'
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
