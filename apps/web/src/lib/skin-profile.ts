import { SkinType } from 'shared';
import { API_BASE_URL } from './api';

const PROFILE_KEY = 'kozmetik_skin_profile';

export interface SkinProfile {
  anonymousId: string;
  skinType: SkinType | null;
  concerns: number[]; // need_id'ler
  sensitivities: {
    fragrance: boolean;
    alcohol: boolean;
    paraben: boolean;
    essential_oils: boolean;
  };
  ageRange: string | null;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function getProfile(): SkinProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

/**
 * Backend'e profili push'la. Idempotent — yoksa POST, varsa PUT.
 * Fire-and-forget: hata yakalanır ama bloke etmez (localStorage zaten güncel).
 *
 * Backend kontratı (apps/api/src/modules/profiles):
 *   POST /skin-profiles                        body: { anonymous_id, skin_type, concerns, sensitivities, age_range }
 *   PUT  /skin-profiles/:anonymousId           body: aynı
 *   GET  /skin-profiles/:anonymousId
 */
async function pushToBackend(profile: SkinProfile): Promise<void> {
  if (typeof window === 'undefined') return;
  const body = {
    anonymous_id: profile.anonymousId,
    skin_type: profile.skinType,
    concerns: profile.concerns,
    sensitivities: profile.sensitivities,
    age_range: profile.ageRange,
  };
  try {
    const putRes = await fetch(`${API_BASE_URL}/skin-profiles/${profile.anonymousId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (putRes.status === 404) {
      // Profile not yet on backend — create it
      await fetch(`${API_BASE_URL}/skin-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
  } catch (err) {
    // Sessizce yoksay — localStorage source-of-truth kalmaya devam eder
    if (process.env.NODE_ENV !== 'production') {
      console.warn('skin-profile backend sync failed:', err);
    }
  }
}

/**
 * Backend'den ID ile profili çek. Bulunmazsa null.
 * Cross-device veya farklı browser senaryosu için manuel geri yükleme yolu.
 */
export async function loadProfileFromBackend(anonymousId: string): Promise<SkinProfile | null> {
  try {
    const r = await fetch(`${API_BASE_URL}/skin-profiles/${anonymousId}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    return {
      anonymousId: data.anonymous_id,
      skinType: data.skin_type ?? null,
      concerns: data.concerns ?? [],
      sensitivities: data.sensitivities ?? {
        fragrance: false,
        alcohol: false,
        paraben: false,
        essential_oils: false,
      },
      ageRange: data.age_range ?? null,
    };
  } catch {
    return null;
  }
}

function setAnonymousIdCookie(id: string): void {
  if (typeof document === 'undefined') return;
  // 1 yıl, path=/, SameSite=Lax — server-side fetch için kullanılır
  document.cookie = `skin_profile_id=${id}; path=/; max-age=31536000; SameSite=Lax`;
}

function clearAnonymousIdCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'skin_profile_id=; path=/; max-age=0; SameSite=Lax';
}

export function saveProfile(profile: Partial<SkinProfile>): SkinProfile {
  const existing = getProfile();
  const updated: SkinProfile = {
    anonymousId: existing?.anonymousId || generateId(),
    skinType: profile.skinType ?? existing?.skinType ?? null,
    concerns: profile.concerns ?? existing?.concerns ?? [],
    sensitivities: profile.sensitivities ?? existing?.sensitivities ?? {
      fragrance: false,
      alcohol: false,
      paraben: false,
      essential_oils: false,
    },
    ageRange: profile.ageRange ?? existing?.ageRange ?? null,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  setAnonymousIdCookie(updated.anonymousId);
  // Backend'e fire-and-forget push (await yok, hata bloke etmez)
  void pushToBackend(updated);
  return updated;
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
  clearAnonymousIdCookie();
}

export function hasProfile(): boolean {
  return getProfile() !== null;
}
