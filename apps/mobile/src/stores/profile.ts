import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSkinProfile, getSkinProfile, updateSkinProfile, SkinProfile } from '../services/api';

const PROFILE_KEY = '@kozmetik_profile';
const ANONYMOUS_ID_KEY = '@kozmetik_anonymous_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getAnonymousId(): Promise<string> {
  let id = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
  if (!id) {
    id = generateUUID();
    await AsyncStorage.setItem(ANONYMOUS_ID_KEY, id);
  }
  return id;
}

export async function getLocalProfile(): Promise<SkinProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveLocalProfile(profile: SkinProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function clearLocalProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}

/**
 * Profil oluştur veya güncelle — local + backend sync
 */
export async function syncProfile(data: {
  skin_type: string;
  concerns: number[];
  sensitivities: {
    fragrance: boolean;
    alcohol: boolean;
    paraben: boolean;
    essential_oils: boolean;
  };
  age_range?: string;
}): Promise<SkinProfile> {
  const anonymousId = await getAnonymousId();

  try {
    // Önce backend'de var mı kontrol et
    const existing = await getSkinProfile(anonymousId);
    if (existing.data) {
      // Güncelle
      const updated = await updateSkinProfile(anonymousId, data);
      await saveLocalProfile(updated.data);
      return updated.data;
    }
  } catch {
    // Profil yok — yeni oluştur
  }

  const created = await createSkinProfile({
    anonymous_id: anonymousId,
    ...data,
  });
  await saveLocalProfile(created.data);
  return created.data;
}

/**
 * Backend'den profili çek ve local'i güncelle
 */
export async function pullProfile(): Promise<SkinProfile | null> {
  const anonymousId = await getAnonymousId();
  try {
    const res = await getSkinProfile(anonymousId);
    await saveLocalProfile(res.data);
    return res.data;
  } catch {
    return getLocalProfile();
  }
}
