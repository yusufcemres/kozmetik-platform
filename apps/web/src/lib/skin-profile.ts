import { SkinType } from 'shared';

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
  return updated;
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export function hasProfile(): boolean {
  return getProfile() !== null;
}
