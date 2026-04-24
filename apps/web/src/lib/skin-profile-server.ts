import { cookies } from 'next/headers';
import { API_BASE_URL } from './api';

/**
 * Server-side profile probe.
 *
 * Root layout'taki inline script localStorage'daki `skin_profile` varlığını
 * `has_skin_profile=1` cookie'sine senkronize ediyor. Server Components bu
 * cookie'yi kontrol ederek "Cilt profili oluştur" CTA'sını gizler ya da
 * kişiselleştirilmiş bir prompt gösterir.
 *
 * İlk ziyaret: cookie yok → CTA gösterilir, script cookie set eder.
 * Sonraki ziyaretler / navigation: cookie var → CTA gizli.
 */
export function hasSkinProfileCookie(): boolean {
  try {
    return cookies().get('has_skin_profile')?.value === '1';
  } catch {
    return false;
  }
}

export interface ServerSkinProfile {
  anonymous_id: string;
  skin_type: string | null;
  concerns: number[];
  sensitivities: Record<string, boolean>;
  age_range?: string | null;
  gender?: string | null;
}

/**
 * Server-side full profile fetch.
 *
 * skin_profile_id cookie'sinden anonymous_id okur, backend'den profili çeker.
 * Cookie yoksa veya backend 404 dönerse null. Server Components bunu
 * kullanarak personal score'u SSR'de render edebilir → CTA flash'ı yok.
 *
 * Dikkat: cookie sadece saveProfile() ilk başarıyla çalıştığında set edilir.
 * Eski kullanıcıların ilk client-side load'da cookie'si yok → migration shim
 * profilim/page.tsx'de var (localStorage → cookie + backend sync).
 */
export async function getServerSkinProfile(): Promise<ServerSkinProfile | null> {
  try {
    const id = cookies().get('skin_profile_id')?.value;
    if (!id) return null;
    const r = await fetch(`${API_BASE_URL}/skin-profiles/${id}`, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as ServerSkinProfile;
  } catch {
    return null;
  }
}
