import { Linking, Platform } from 'react-native';

/**
 * Platform deep link şemaları
 * Kullanıcıyı önce native app'e, yoksa web'e yönlendir
 */
const platformSchemes: Record<string, { ios?: string; android?: string; web: string }> = {
  trendyol: {
    ios: 'trendyol://',
    android: 'trendyol://',
    web: 'https://www.trendyol.com',
  },
  hepsiburada: {
    ios: 'hepsiburada://',
    android: 'hepsiburada://',
    web: 'https://www.hepsiburada.com',
  },
  amazon_tr: {
    ios: 'com.amazon.mobile.shopping://',
    android: 'com.amazon.mShop.android.shopping://',
    web: 'https://www.amazon.com.tr',
  },
  gratis: {
    web: 'https://www.gratis.com',
  },
  dermoeczanem: {
    web: 'https://www.dermoeczanem.com',
  },
};

/**
 * Platform app'i yüklüyse app'e, yoksa web'e yönlendir
 */
export async function openAffiliateLink(platform: string, url: string): Promise<void> {
  const scheme = platformSchemes[platform];

  if (scheme) {
    const nativeScheme = Platform.OS === 'ios' ? scheme.ios : scheme.android;

    if (nativeScheme) {
      try {
        const canOpen = await Linking.canOpenURL(nativeScheme);
        if (canOpen) {
          // App yüklü — deep link ile aç
          await Linking.openURL(url);
          return;
        }
      } catch {
        // canOpenURL başarısız, fallback to web
      }
    }
  }

  // Fallback: web browser'da aç
  await Linking.openURL(url);
}

/**
 * Uygulama içi deep link handler
 * kozmetik://product/niacinamide-serum → ProductDetail screen
 * kozmetik://ingredient/niacinamide → IngredientDetail screen
 * kozmetik://need/sivilce → NeedDetail screen
 * kozmetik://search?q=retinol → Search screen
 */
export interface DeepLinkRoute {
  screen:
    | 'ProductDetail'
    | 'IngredientDetail'
    | 'NeedDetail'
    | 'Search'
    | 'Compare'
    | 'External';
  params: Record<string, string>;
}

const WEB_BASE = 'https://kozmetik-platform.vercel.app';

export function parseDeepLink(url: string): DeepLinkRoute | null {
  try {
    // kozmetik://product/slug veya https://kozmetikplatform.com/urunler/slug
    const cleaned = url
      .replace('kozmetik://', '')
      .replace('https://kozmetikplatform.com/', '');

    const parts = cleaned.split('?');
    const path = parts[0];
    const queryString = parts[1] || '';

    const segments = path.split('/').filter(Boolean);

    if (segments[0] === 'product' || segments[0] === 'urunler' || segments[0] === 'takviyeler') {
      return { screen: 'ProductDetail', params: { slug: segments[1] || '' } };
    }
    if (segments[0] === 'ingredient' || segments[0] === 'icerikler') {
      return { screen: 'IngredientDetail', params: { slug: segments[1] || '' } };
    }
    if (segments[0] === 'need' || segments[0] === 'ihtiyaclar') {
      return { screen: 'NeedDetail', params: { slug: segments[1] || '' } };
    }
    if (segments[0] === 'search' || segments[0] === 'ara') {
      const searchParams = new URLSearchParams(queryString);
      return { screen: 'Search', params: { query: searchParams.get('q') || '' } };
    }
    if (segments[0] === 'karsilastir' || segments[0] === 'compare') {
      return { screen: 'Compare', params: {} };
    }

    // Public web sayfaları — native ekran yok, tarayıcıda aç
    const WEB_ONLY = ['nasil-puanliyoruz', 'markalar', 'keshfet', 'gizlilik', 'kullanim-sartlari'];
    if (WEB_ONLY.includes(segments[0] || '')) {
      return {
        screen: 'External',
        params: { url: `${WEB_BASE}/${segments.join('/')}${queryString ? `?${queryString}` : ''}` },
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * External linkleri tarayıcıda açar.
 */
export async function openExternalLink(url: string): Promise<void> {
  await Linking.openURL(url);
}

/**
 * Uygulama paylaşım linki oluştur
 */
export function generateShareLink(type: 'product' | 'ingredient' | 'need', slug: string): string {
  const pathMap = { product: 'urunler', ingredient: 'icerikler', need: 'ihtiyaclar' };
  return `https://kozmetikplatform.com/${pathMap[type]}/${slug}`;
}
