'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import ProductCarousel from './ProductCarousel';

interface Product {
  product_id: number;
  product_name: string;
  slug: string;
  image_url: string | null;
}

type Mode = 'together' | 'same-brand' | 'similar';

const LABELS: Record<Mode, string> = {
  together: 'Birlikte iyi gider',
  'same-brand': 'Aynı markadan',
  similar: 'Benzer ciltler beğendi',
};

export function CrossSellBlock({ productId, mode }: { productId: number; mode: Mode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    apiFetch<Product[]>(`/cross-sell/product/${productId}/${mode}`)
      .then((res) => { if (mounted) setItems(res); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [productId, mode]);

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold">{LABELS[mode]}</h2>
      <ProductCarousel>
        {items.map((p) => (
          <Link
            key={p.product_id}
            href={`/urunler/${p.slug}`}
            className="snap-start shrink-0 w-[180px] sm:w-[200px] rounded-xl border border-outline-variant/20 p-4 hover:border-on-surface transition-colors bg-surface"
          >
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url}
                alt={p.product_name}
                className="mb-3 h-28 w-full object-contain"
              />
            ) : (
              <div className="mb-3 h-28 w-full bg-surface-container-low rounded" />
            )}
            <div className="text-sm font-medium line-clamp-2">{p.product_name}</div>
          </Link>
        ))}
      </ProductCarousel>
    </section>
  );
}
