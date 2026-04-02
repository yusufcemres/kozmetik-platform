import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@koz_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * AsyncStorage-based cache with TTL support.
 * Used to provide offline fallback for API responses.
 */
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      const isExpired = Date.now() - entry.timestamp > entry.ttl;

      // Return data even if expired (stale-while-revalidate pattern)
      // Caller decides whether to use stale data
      return entry.data;
    } catch {
      return null;
    }
  },

  async getIfFresh<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp > entry.ttl) return null;

      return entry.data;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Storage full or other error — silently fail
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
    } catch {}
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch {}
  },
};

/**
 * Cache-aware fetch wrapper.
 * Tries API first; on failure, falls back to cached data.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
): Promise<{ data: T; fromCache: boolean }> {
  try {
    const data = await fetcher();
    // Cache the successful response
    await cache.set(key, data, ttl);
    return { data, fromCache: false };
  } catch (error) {
    // Network error — try cache fallback
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }
    // No cache available — rethrow
    throw error;
  }
}

/** TTL presets */
export const TTL = {
  SHORT: 2 * 60 * 1000,       // 2 min — search results
  MEDIUM: 10 * 60 * 1000,     // 10 min — product/ingredient details
  LONG: 60 * 60 * 1000,       // 1 hour — needs list, categories
  DAY: 24 * 60 * 60 * 1000,   // 24 hours — rarely changing data
};
