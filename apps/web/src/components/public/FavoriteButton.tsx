'use client';

import { useState, useEffect } from 'react';
import { isFavorite, toggleFavorite } from '@/lib/favorites';

interface Props {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  image_url?: string;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ product_id, product_name, product_slug, brand_name, image_url, size = 'md' }: Props) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(product_id));
    const handler = () => setFav(isFavorite(product_id));
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, [product_id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleFavorite({ product_id, product_name, product_slug, brand_name, image_url });
    setFav(result);
  };

  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'material-icon-sm' : '';

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-outline-variant/20 ${
        fav
          ? 'bg-error/10 text-error hover:bg-error/20'
          : 'bg-surface/80 text-outline hover:text-error hover:bg-error/5'
      }`}
      title={fav ? 'Favorilerden kaldır' : 'Favorilere ekle'}
    >
      <span className={`${fav ? 'material-icon-filled' : 'material-icon'} ${iconSize}`} aria-hidden="true">
        {fav ? 'favorite' : 'favorite_border'}
      </span>
    </button>
  );
}
