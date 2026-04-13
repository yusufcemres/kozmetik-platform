'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.product_id}
            href={`/urunler/${p.slug}`}
            className="rounded-xl border border-neutral-200 p-4 hover:border-neutral-900"
          >
            {p.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt={p.product_name} className="mb-2 h-20 w-20 object-contain" />
            )}
            <div className="text-sm font-medium">{p.product_name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
