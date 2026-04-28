/**
 * Skin profile persistence helper — localStorage + cookie + backend tek ses.
 *
 * Tüm profile create/update giriş noktalarından (cilt-analizi, profilim) çağrılır.
 *
 * Yan etkiler:
 *  - localStorage 'skin_profile' key'ine yazar (frontend source-of-truth)
 *  - has_skin_profile=1 cookie set eder (Server Component CTA gating)
 *  - skin_profile_id={anonymous_id} cookie set eder (server-side fetch için)
 *  - Backend'e POST/PUT — fire-and-forget (hata bloke etmez)
 *  - 'skin-profile-changed' event dispatch eder (sayfalar dinlesin)
 */
import { API_BASE_URL } from './api';

export interface SkinProfilePayload {
  anonymous_id: string;
  skin_type: string | null;
  concerns: number[];
  sensitivities: Record<string, boolean>;
  age_range?: string | null;
  gender?: string | null;
  updated_at?: string;
  // Cilt analizi quiz extra fields — esnek pass-through
  [key: string]: unknown;
}

async function pushToBackend(profile: SkinProfilePayload): Promise<void> {
  if (typeof window === 'undefined') return;
  const body = {
    anonymous_id: profile.anonymous_id,
    skin_type: profile.skin_type,
    concerns: profile.concerns,
    sensitivities: profile.sensitivities,
    age_range: profile.age_range,
    gender: profile.gender,
  };
  try {
    const putRes = await fetch(`${API_BASE_URL}/skin-profiles/${profile.anonymous_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (putRes.status === 404) {
      await fetch(`${API_BASE_URL}/skin-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[profile-sync] backend push failed:', err);
    }
  }
}

/**
 * Tek giriş noktası — localStorage + cookie + backend sync.
 *
 * Çağıran kod: profil objesini ham haliyle ver (anonymous_id eksikse otomatik üretilir).
 * Hata fırlatmaz. localStorage source-of-truth kalır.
 */
export function saveSkinProfile(profile: Partial<SkinProfilePayload> & { skin_type: string | null; concerns: number[]; sensitivities: Record<string, boolean> }): SkinProfilePayload {
  const anonymousId = profile.anonymous_id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const updated: SkinProfilePayload = {
    ...profile,
    anonymous_id: anonymousId,
    skin_type: profile.skin_type,
    concerns: profile.concerns || [],
    sensitivities: profile.sensitivities || {},
    age_range: profile.age_range,
    gender: profile.gender,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('skin_profile', JSON.stringify(updated));
    } catch {}
    // Cookie'ler — SSR sayfaları okuyacak
    if (typeof document !== 'undefined') {
      document.cookie = 'has_skin_profile=1; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = `skin_profile_id=${anonymousId}; path=/; max-age=31536000; SameSite=Lax`;
    }
    // Backend sync — fire-and-forget
    void pushToBackend(updated);
    // Event — diğer component'ler reload etsin
    window.dispatchEvent(new Event('skin-profile-changed'));
  }

  return updated;
}

/**
 * Eski kullanıcı için migration shim — localStorage'da profil var ama cookie/backend yoksa
 * cookie + backend'e senkron eder. profilim/page.tsx ilk load'unda çağrılır.
 */
export function migrateExistingProfile(stored: SkinProfilePayload): void {
  if (typeof window === 'undefined' || !stored?.anonymous_id) return;
  if (typeof document === 'undefined') return;
  const hasIdCookie = document.cookie.includes('skin_profile_id=');
  const hasFlagCookie = document.cookie.includes('has_skin_profile=1');
  if (!hasIdCookie || !hasFlagCookie) {
    document.cookie = 'has_skin_profile=1; path=/; max-age=31536000; SameSite=Lax';
    document.cookie = `skin_profile_id=${stored.anonymous_id}; path=/; max-age=31536000; SameSite=Lax`;
    void pushToBackend(stored);
  }
}

/**
 * Cross-device profile load — backend'den ID ile profili çeker.
 * Kullanım: kullanıcı farklı cihazda anonymous_id'sini biliyorsa restore.
 */
export async function loadProfileFromBackend(anonymousId: string): Promise<SkinProfilePayload | null> {
  try {
    const r = await fetch(`${API_BASE_URL}/skin-profiles/${anonymousId}`, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as SkinProfilePayload;
  } catch {
    return null;
  }
}

/**
 * Logout / clear — tüm yerleri temizler.
 */
export function clearSkinProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('skin_profile');
  } catch {}
  if (typeof document !== 'undefined') {
    document.cookie = 'has_skin_profile=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'skin_profile_id=; path=/; max-age=0; SameSite=Lax';
  }
  window.dispatchEvent(new Event('skin-profile-changed'));
}
