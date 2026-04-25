export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
).trim().replace(/\/+$/, '');

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kozmetik-platform.vercel.app'
).trim().replace(/\/+$/, '');

/**
 * Custom error type — kullanıcı dostu mesajları + retry/recovery mantığı için
 * status koduna ulaşmak gerek.
 */
export class ApiError extends Error {
  status: number;
  isNetworkError: boolean;

  constructor(message: string, status: number, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }

  /** API/DB down belirtisi: network hatası veya 5xx */
  get isServerDown(): boolean {
    return this.isNetworkError || (this.status >= 500 && this.status < 600);
  }
}

interface FetchOptions extends RequestInit {
  token?: string;
  /** Otomatik retry sayısı (network/5xx hataları için). Default: GET=2, mutation=0. */
  retries?: number;
  /** Retry'lar arası bekleme (ms) — exponential backoff base. Default: 800ms. */
  retryDelay?: number;
}

/** Retry'ı hak eden HTTP status kodları */
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers, retries, retryDelay = 800, ...rest } = options;
  const method = (rest.method || 'GET').toUpperCase();
  const isGet = method === 'GET' || !rest.method;
  const maxRetries = retries ?? (isGet ? 2 : 0);

  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        ...rest,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ message: res.statusText }));
        const apiErr = new ApiError(
          errBody.message || `API Error: ${res.status}`,
          res.status,
          false,
        );
        // Retry'a değer mi?
        if (RETRYABLE_STATUSES.has(res.status) && attempt < maxRetries) {
          lastError = apiErr;
          await sleep(retryDelay * Math.pow(2, attempt));
          continue;
        }
        throw apiErr;
      }

      return await res.json();
    } catch (err) {
      // ApiError zaten yukarıda fırlatıldı — re-throw
      if (err instanceof ApiError) {
        if (!RETRYABLE_STATUSES.has(err.status) || attempt >= maxRetries) {
          throw err;
        }
        lastError = err;
        await sleep(retryDelay * Math.pow(2, attempt));
        continue;
      }

      // Network/DNS/TLS hatası → ApiError(network)
      const networkErr = new ApiError(
        err instanceof Error ? err.message : 'Network error',
        0,
        true,
      );
      lastError = networkErr;
      if (attempt < maxRetries) {
        await sleep(retryDelay * Math.pow(2, attempt));
        continue;
      }
      throw networkErr;
    }
  }

  // Hiçbir attempt başarılı olmadı (yine de buraya düşmemeli)
  throw lastError ?? new ApiError('Unknown error', 0, true);
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
