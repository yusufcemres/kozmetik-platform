'use client';

/**
 * Freemium feature unlock helper'ı (Faz 2 #4 paywall iskelet).
 *
 * Backend entitlement check'i Faz 3'te (PayTR webhook → JWT claim). Şimdilik
 * frontend-only stub: localStorage'a `revela_paywall_<feature>` true yazılır.
 *
 * Production'da bu kontrol bypass edilebilir (DevTools localStorage), bu nedenle
 * gerçek paywall korumasi backend'de yapılacak (Faz 3). Bu modül UX iskeleti.
 */

const STORAGE_KEY_PREFIX = 'revela_paywall_';

export type PremiumFeature =
  | 'compare_delta'      // Karşılaştırma boyut delta tablosu
  | 'product_recommendations' // INCI ürün önerileri tam liste
  | 'trend_history'      // 3+ analiz trend grafiği
  | 'ai_chat';           // Faz 2 #5

export function isUnlocked(feature: PremiumFeature): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY_PREFIX + feature) === 'true';
  } catch {
    return false;
  }
}

/**
 * Stub unlock — Faz 3'te PayTR webhook sonrası backend JWT claim olarak gelecek.
 * Test/demo için: kullanıcı bir kez 29 TL ödemesi simule eder, sonsuza dek açık.
 */
export function unlockStub(feature: PremiumFeature): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + feature, 'true');
    window.dispatchEvent(new CustomEvent('revela-premium-changed', { detail: { feature } }));
  } catch {
    // localStorage kapalıysa sessiz geç
  }
}

export function lockAll(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_KEY_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('revela-premium-changed', { detail: { feature: 'all' } }));
  } catch {
    // ignore
  }
}
