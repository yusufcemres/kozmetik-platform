import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../services/api';

const FAVORITES_KEY = '@kozmetik_favorites';

export interface FavoriteItem {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  image_url?: string;
  added_at: string;
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    return [];
  }
}

export async function addFavorite(product: Product): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();

  if (favorites.some((f) => f.product_id === product.product_id)) {
    return favorites; // already exists
  }

  const item: FavoriteItem = {
    product_id: product.product_id,
    product_name: product.product_name,
    product_slug: product.product_slug,
    brand_name: product.brand?.brand_name,
    image_url: product.images?.[0]?.image_url,
    added_at: new Date().toISOString(),
  };

  const updated = [item, ...favorites];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeFavorite(productId: number): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();
  const updated = favorites.filter((f) => f.product_id !== productId);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export async function isFavorite(productId: number): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.product_id === productId);
}

export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_KEY);
}
