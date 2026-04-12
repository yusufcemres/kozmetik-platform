// GA4 custom event helper with consent gate.
// Consent is managed by CookieConsent (localStorage 'revela_consent' = 'granted'|'denied').

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('revela_consent') === 'granted';
  } catch {
    return false;
  }
}

export function trackGA(name: string, params?: GtagParams): void {
  if (typeof window === 'undefined') return;
  if (!hasConsent()) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params || {});
}

export const GAEvents = {
  quizCompleted: (skinType: string, recCount: number) =>
    trackGA('quiz_completed', { skin_type: skinType, rec_count: recCount }),
  scanSuccess: (method: string, confidence: number, productId?: number) =>
    trackGA('scan_success', { method, confidence, product_id: productId }),
  scanFailed: (method: string, reason?: string) =>
    trackGA('scan_failed', { method, reason }),
  affiliateClick: (platform: string, productId: number, price?: number) =>
    trackGA('affiliate_click', { platform, product_id: productId, value: price, currency: 'TRY' }),
  shareClick: (contentType: string, itemId: string | number) =>
    trackGA('share_click', { content_type: contentType, item_id: String(itemId) }),
  favoriteToggle: (productId: number, added: boolean) =>
    trackGA('favorite_toggle', { product_id: productId, action: added ? 'add' : 'remove' }),
  productView: (productId: number, brand?: string) =>
    trackGA('product_view', { product_id: productId, brand }),
  searchSubmit: (query: string, resultsCount?: number) =>
    trackGA('search_submit', { search_term: query, results: resultsCount }),
  pushSubscribe: () => trackGA('push_subscribe'),
};
