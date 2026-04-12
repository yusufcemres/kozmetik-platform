import { api } from './api';
import { getUserToken } from './user-auth';

const FAVORITES_KEY = 'kozmetik_favorites';
const ROUTINE_KEY = 'kozmetik_routine';
const MIGRATED_KEY = 'kozmetik_favorites_migrated';

export interface FavoriteItem {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  image_url?: string;
  added_at: string;
}

export interface RoutineProduct {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  image_url?: string;
  order: number;
}

export interface Routine {
  morning: RoutineProduct[];
  evening: RoutineProduct[];
}

// === Favorites ===

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function isFavorite(productId: number): boolean {
  return getFavorites().some((f) => f.product_id === productId);
}

export function addFavorite(item: Omit<FavoriteItem, 'added_at'>): FavoriteItem[] {
  const favs = getFavorites();
  if (favs.some((f) => f.product_id === item.product_id)) return favs;
  const next = [...favs, { ...item, added_at: new Date().toISOString() }];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('favorites-changed'));
  return next;
}

export function removeFavorite(productId: number): FavoriteItem[] {
  const next = getFavorites().filter((f) => f.product_id !== productId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('favorites-changed'));
  return next;
}

export function toggleFavorite(item: Omit<FavoriteItem, 'added_at'>): boolean {
  if (isFavorite(item.product_id)) {
    removeFavorite(item.product_id);
    return false;
  }
  addFavorite(item);
  return true;
}

// === Routine ===

export function getRoutine(): Routine {
  if (typeof window === 'undefined') return { morning: [], evening: [] };
  try {
    return JSON.parse(localStorage.getItem(ROUTINE_KEY) || '{"morning":[],"evening":[]}');
  } catch {
    return { morning: [], evening: [] };
  }
}

export function saveRoutine(routine: Routine): void {
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
  window.dispatchEvent(new Event('routine-changed'));
}

export function addToRoutine(
  period: 'morning' | 'evening',
  product: Omit<RoutineProduct, 'order'>,
): Routine {
  const routine = getRoutine();
  const list = routine[period];
  if (list.some((p) => p.product_id === product.product_id)) return routine;
  list.push({ ...product, order: list.length });
  saveRoutine(routine);
  return routine;
}

export function removeFromRoutine(period: 'morning' | 'evening', productId: number): Routine {
  const routine = getRoutine();
  routine[period] = routine[period]
    .filter((p) => p.product_id !== productId)
    .map((p, i) => ({ ...p, order: i }));
  saveRoutine(routine);
  return routine;
}

export function reorderRoutine(period: 'morning' | 'evening', products: RoutineProduct[]): Routine {
  const routine = getRoutine();
  routine[period] = products.map((p, i) => ({ ...p, order: i }));
  saveRoutine(routine);
  return routine;
}

// === Backend sync (auth mode) ===

interface BackendFavorite {
  favorite_id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  brand?: { brand_name: string } | null;
  image_url?: string | null;
  created_at: string;
}

export async function fetchBackendFavorites(): Promise<FavoriteItem[]> {
  const token = getUserToken();
  if (!token) return [];
  try {
    const data = await api.get<BackendFavorite[]>('/favorites', { token });
    return data.map((f) => ({
      product_id: f.product_id,
      product_name: f.product_name,
      product_slug: f.product_slug,
      brand_name: f.brand?.brand_name,
      image_url: f.image_url || undefined,
      added_at: f.created_at,
    }));
  } catch {
    return [];
  }
}

export async function addFavoriteRemote(productId: number): Promise<boolean> {
  const token = getUserToken();
  if (!token) return false;
  try {
    await api.post(`/favorites/${productId}`, {}, { token });
    return true;
  } catch {
    return false;
  }
}

export async function removeFavoriteRemote(productId: number): Promise<boolean> {
  const token = getUserToken();
  if (!token) return false;
  try {
    await api.delete(`/favorites/${productId}`, { token });
    return true;
  } catch {
    return false;
  }
}

export async function migrateLocalFavoritesToBackend(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  const token = getUserToken();
  if (!token) return 0;
  if (localStorage.getItem(MIGRATED_KEY) === '1') return 0;

  const local = getFavorites();
  if (local.length === 0) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return 0;
  }

  try {
    const res = await api.post<{ added: number }>(
      '/favorites/bulk',
      { product_ids: local.map((f) => f.product_id) },
      { token },
    );
    localStorage.setItem(MIGRATED_KEY, '1');
    return res.added || 0;
  } catch {
    return 0;
  }
}

export function clearMigrationFlag(): void {
  try { localStorage.removeItem(MIGRATED_KEY); } catch {}
}
