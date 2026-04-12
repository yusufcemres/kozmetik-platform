'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getFavorites,
  addFavorite as addLocal,
  removeFavorite as removeLocal,
  fetchBackendFavorites,
  addFavoriteRemote,
  removeFavoriteRemote,
  migrateLocalFavoritesToBackend,
  type FavoriteItem,
} from '@/lib/favorites';
import { getUserToken } from '@/lib/user-auth';

export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getUserToken();
    if (token) {
      await migrateLocalFavoritesToBackend();
      const remote = await fetchBackendFavorites();
      setItems(remote);
    } else {
      setItems(getFavorites());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, [refresh]);

  const isFav = useCallback(
    (productId: number) => items.some((f) => f.product_id === productId),
    [items],
  );

  const toggle = useCallback(
    async (item: Omit<FavoriteItem, 'added_at'>) => {
      const token = getUserToken();
      const currentlyFav = items.some((f) => f.product_id === item.product_id);

      if (token) {
        if (currentlyFav) {
          await removeFavoriteRemote(item.product_id);
          setItems((prev) => prev.filter((f) => f.product_id !== item.product_id));
          return false;
        }
        await addFavoriteRemote(item.product_id);
        setItems((prev) => [
          { ...item, added_at: new Date().toISOString() },
          ...prev,
        ]);
        window.dispatchEvent(new Event('favorites-changed'));
        return true;
      }

      if (currentlyFav) {
        removeLocal(item.product_id);
        setItems(getFavorites());
        return false;
      }
      addLocal(item);
      setItems(getFavorites());
      return true;
    },
    [items],
  );

  return { items, loading, isFav, toggle, refresh };
}
