'use client';

import { useEffect } from 'react';
import { trackRecentlyViewed } from '@/components/public/RecentlyViewed';

export default function ProductViewTracker({
  product_id,
  product_name,
  product_slug,
  brand_name,
  image_url,
}: {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  image_url?: string;
}) {
  useEffect(() => {
    trackRecentlyViewed({ product_id, product_name, product_slug, brand_name, image_url });
  }, [product_id, product_name, product_slug, brand_name, image_url]);

  return null;
}
