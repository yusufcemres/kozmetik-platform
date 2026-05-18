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
  // LAUNCH_CHECKLIST 5 ana event (2026-05-19 polish)
  quizStart: (quizType: string) =>
    trackGA('quiz_start', { quiz_type: quizType }),
  quizCompleted: (skinType: string, recCount: number) =>
    trackGA('quiz_complete', { skin_type: skinType, rec_count: recCount }),
  aiSearchQuery: (query: string, matchedIntent?: string, resultsCount?: number) =>
    trackGA('ai_search_query', { search_term: query, matched_intent: matchedIntent, results: resultsCount }),
  blogPostView: (slug: string, title?: string) =>
    trackGA('blog_post_view', { post_slug: slug, post_title: title }),
  affiliateClick: (platform: string, productId: number, price?: number) =>
    trackGA('affiliate_click', { platform, product_id: productId, value: price, currency: 'TRY' }),
  favoriteAdd: (productId: number) =>
    trackGA('favorite_add', { product_id: productId }),

  // Ek event'ler (eski + smart-scan)
  scanSuccess: (method: string, confidence: number, productId?: number) =>
    trackGA('scan_success', { method, confidence, product_id: productId }),
  scanFailed: (method: string, reason?: string) =>
    trackGA('scan_failed', { method, reason }),
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
