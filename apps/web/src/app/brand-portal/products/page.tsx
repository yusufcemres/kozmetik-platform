'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ProductItem {
  product_id: number;
  product_name: string;
  product_slug: string;
  short_description?: string;
  status: string;
  images?: { image_url: string; is_primary: boolean }[];
}

export default function BrandProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('brand_token');
    if (!token) {
      window.location.href = '/brand-portal/login';
      return;
    }

    setLoading(true);
    fetch(`${API_URL}/brand-portal/products?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const getPrimaryImage = (product: ProductItem) => {
    if (!product.images || product.images.length === 0) return null;
    const primary = product.images.find((i) => i.is_primary);
    return primary?.image_url || product.images[0]?.image_url;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Ürünleriniz</h1>
          <p className="text-sm text-on-surface-variant">{total} ürün</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">
            inventory_2
          </span>
          <p className="text-sm text-on-surface-variant mt-2">
            Bu markaya ait ürün bulunamadı.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-outline-variant/30 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container">
                <th className="text-left text-xs font-medium text-on-surface-variant p-3">
                  Görsel
                </th>
                <th className="text-left text-xs font-medium text-on-surface-variant p-3">
                  Ürün Adı
                </th>
                <th className="text-left text-xs font-medium text-on-surface-variant p-3">
                  Durum
                </th>
                <th className="text-right text-xs font-medium text-on-surface-variant p-3">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = getPrimaryImage(p);
                return (
                  <tr
                    key={p.product_id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors"
                  >
                    <td className="p-3">
                      {img ? (
                        <img
                          src={img}
                          alt={p.product_name}
                          className="w-12 h-12 rounded-lg object-cover bg-surface-container"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant">
                            image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-medium text-on-surface line-clamp-1">
                        {p.product_name}
                      </p>
                      {p.short_description && (
                        <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                          {p.short_description}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          p.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {p.status === 'published' ? 'Yayında' : p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/brand-portal/products/${p.product_id}/edit`}
                        className="text-xs text-primary hover:underline"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-outline-variant/20">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs text-on-surface-variant hover:text-on-surface disabled:opacity-40"
              >
                ← Önceki
              </button>
              <span className="text-xs text-on-surface-variant">
                Sayfa {page} / {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="text-xs text-on-surface-variant hover:text-on-surface disabled:opacity-40"
              >
                Sonraki →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
