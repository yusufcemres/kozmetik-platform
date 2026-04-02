'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  product_type_label?: string;
  short_description?: string;
  brand?: { brand_id: number; brand_name: string };
  category?: { category_id: number; category_name: string };
  images?: { image_url: string }[];
  need_scores?: { compatibility_score: number }[];
}

interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (search) params.set('search', search);

      const data = await api.get<{ data: Product[]; meta: PageMeta }>(
        `/products?${params.toString()}`,
      );
      setProducts(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Ürünler</h1>
      <p className="text-gray-500 mb-6">
        Kozmetik ürünleri incele, içeriklerini analiz et
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ürün adı veya marka ara..."
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

      {/* Results info */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-4">
          {meta.total} ürün bulundu
          {search && (
            <span>
              {' '}
              &mdash; &quot;{search}&quot; için sonuçlar
            </span>
          )}
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-400">
            {search ? 'Aramanızla eşleşen ürün bulunamadı' : 'Henüz ürün eklenmemiş'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const imgUrl = product.images?.[0]?.image_url;
              const avgScore =
                product.need_scores && product.need_scores.length > 0
                  ? Math.round(
                      product.need_scores.reduce(
                        (s, ns) => s + Number(ns.compatibility_score),
                        0,
                      ) / product.need_scores.length,
                    )
                  : null;

              return (
                <Link
                  key={product.product_id}
                  href={`/urunler/${product.product_slug}`}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.product_name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-4xl text-gray-300">📦</span>
                    )}
                  </div>
                  <div className="p-4">
                    {product.brand && (
                      <p className="text-xs text-primary font-semibold mb-0.5">
                        {product.brand.brand_name}
                      </p>
                    )}
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.product_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {product.category && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {product.category.category_name}
                        </span>
                      )}
                      {product.product_type_label && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {product.product_type_label}
                        </span>
                      )}
                    </div>
                    {avgScore !== null && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              avgScore >= 70
                                ? 'bg-green-500'
                                : avgScore >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-red-400'
                            }`}
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            avgScore >= 70
                              ? 'text-green-600'
                              : avgScore >= 40
                                ? 'text-yellow-600'
                                : 'text-red-500'
                          }`}
                        >
                          %{avgScore}
                        </span>
                      </div>
                    )}
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
