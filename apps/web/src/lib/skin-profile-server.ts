import { cookies } from 'next/headers';

/**
 * Server-side profile probe.
 *
 * Root layout'taki inline script localStorage'daki `skin_profile` varlığını
 * `has_skin_profile=1` cookie'sine senkronize ediyor. Server Components bu
 * cookie'yi kontrol ederek "Cilt profili oluştur" CTA'sını gizler ya da
 * kişiselleştirilmiş bir prompt gösterir.
 *
 * Dikkat: Bu sadece profilin VAR olup olmadığını söyler. Gerçek profil
 * içeriği (skin_type, concerns) için client-side fetch (localStorage → API)
 * gerekir. Kişisel skor render'ı client component'te yapılmalı.
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
