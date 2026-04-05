'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecentProduct {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  image_url?: string;
  viewed_at: number;
}

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS = 10;

export function trackRecentlyViewed(product: Omit<RecentProduct, 'viewed_at'>) {
  try {
    const stored: RecentProduct[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]',
    );
    const filtered = stored.filter(
      (p) => p.product_id !== product.product_id,
    );
    filtered.unshift({ ...product, viewed_at: Date.now() });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered.slice(0, MAX_ITEMS)),
    );
    window.dispatchEvent(new Event('recently-viewed-changed'));
  } catch {}
}

export default function RecentlyViewed({
  excludeProductId,
}: {
  excludeProductId?: number;
}) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const stored: RecentProduct[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '[]',
        );
        setItems(
          excludeProductId
            ? stored.filter((p) => p.product_id !== excludeProductId)
            : stored,
        );
      } catch {
        setItems([]);
      }
    };
    load();
    window.addEventListener('recently-viewed-changed', load);
    return () => window.removeEventListener('recently-viewed-changed', load);
  }, [excludeProductId]);

  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold tracking-tight mb-6 text-on-surface flex items-center gap-2">
        <span className="material-icon text-primary" aria-hidden="true">
          history
        </span>
        Son Görüntülenenler
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {items.map((item) => (
          <Link
            key={item.product_id}
            href={`/urunler/${item.product_slug}`}
            className="curator-card overflow-hidden shrink-0 w-36 group"
          >
            <div className="aspect-square bg-surface-container-low overflow-hidden relative">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  fill
                  sizes="144px"
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <span
                  className="material-icon text-outline-variant flex items-center justify-center h-full"
                  aria-hidden="true"
                >
                  inventory_2
                </span>
              )}
            </div>
            <div className="p-2.5">
              {item.brand_name && (
                <p className="label-caps text-outline text-[9px]">
                  {item.brand_name}
                </p>
              )}
              <p className="text-xs font-semibold text-on-surface line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                {item.product_name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
