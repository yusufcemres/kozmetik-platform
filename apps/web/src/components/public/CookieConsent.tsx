'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from './Toast';

/**
 * KVKK + GDPR uyumlu çerez kategorize consent banner.
 *
 * 2026-05-15 audit (Madde 7) ile yeniden yazıldı: önce binary "Kabul/Reddet" idi,
 * şimdi kategorize seçim sağlıyor (strict / analytics / marketing).
 *
 * - **Strict (zorunlu):** Site çalışsın diye gerekli (giriş, dil, oturum). Kullanıcı reddedemez.
 * - **Analytics:** GA4 + PostHog (ziyaretçi davranışı, sayfa view). Opt-in.
 * - **Marketing:** Ads pixel + remarketing. Opt-in.
 *
 * Storage: localStorage `revela_consent_v2` JSON `{ strict: true, analytics: bool, marketing: bool, ts: number }`.
 * Eski `revela_consent` ('granted'|'denied') backward-compat için okunmaya devam eder ama yeni yazımlar v2 formatında.
 */

const STORAGE_KEY_V2 = 'revela_consent_v2';
const STORAGE_KEY_V1 = 'revela_consent'; // Backward compat

interface ConsentState {
  strict: true; // Her zaman true (zorunlu)
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsent(consent: ConsentState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(consent));
    // Backward compat: eski kod hâlâ 'granted'/'denied' okur
    localStorage.setItem(STORAGE_KEY_V1, consent.analytics ? 'granted' : 'denied');
  } catch {}
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
    });
  }
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'banner' | 'preferences'>('banner');
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const { success, info } = useToast();

  useEffect(() => {
    try {
      // V2 var mı?
      const v2 = localStorage.getItem(STORAGE_KEY_V2);
      if (v2) return;
      // V1 var mı? (eski kullanıcılar)
      const v1 = localStorage.getItem(STORAGE_KEY_V1);
      if (v1 === 'granted' || v1 === 'denied') {
        // V1'i V2'ye migrate et — kullanıcıya tekrar sorma
        applyConsent({
          strict: true,
          analytics: v1 === 'granted',
          marketing: false, // V1'de marketing ayrı değildi, varsayılan kapalı
          ts: Date.now(),
        });
        return;
      }
      // Yeni kullanıcı
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    } catch {}
  }, []);

  const acceptAll = () => {
    applyConsent({ strict: true, analytics: true, marketing: true, ts: Date.now() });
    setShow(false);
    success('Tüm çerezler kabul edildi.');
  };

  const rejectAll = () => {
    applyConsent({ strict: true, analytics: false, marketing: false, ts: Date.now() });
    setShow(false);
    info('Sadece zorunlu çerezler aktif.');
  };

  const savePreferences = () => {
    applyConsent({ strict: true, analytics, marketing, ts: Date.now() });
    setShow(false);
    success('Çerez tercihlerin kaydedildi.');
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-md z-[95] animate-slide-up"
      role="dialog"
      aria-label="Çerez tercihleri"
      aria-modal="false"
    >
      <div className="bg-surface border border-outline-variant/30 rounded-sm shadow-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-icon text-primary text-[20px]" aria-hidden="true">cookie</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface mb-1">Çerez tercihlerin</div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              REVELA çerezleri 3 kategoride kullanır: zorunlu (site işleyişi), analitik (ziyaretçi davranışı), pazarlama (reklamlar). Tercihini istediğin zaman değiştirebilirsin.{' '}
              <Link href="/cerez-politikasi" className="underline hover:text-on-surface">
                Detaylı bilgi
              </Link>
            </p>
          </div>
        </div>

        {mode === 'preferences' && (
          <div className="space-y-2 mb-4 mt-3 border-t border-outline-variant/30 pt-3">
            <label className="flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex flex-col">
                <span className="font-semibold text-on-surface">Zorunlu</span>
                <span className="text-[11px] text-on-surface-variant/80">Oturum, dil, güvenlik</span>
              </span>
              <input type="checkbox" checked disabled aria-label="Zorunlu çerezler (kapatılamaz)" className="accent-primary" />
            </label>
            <label className="flex items-center justify-between text-xs text-on-surface-variant cursor-pointer">
              <span className="flex flex-col">
                <span className="font-semibold text-on-surface">Analitik</span>
                <span className="text-[11px] text-on-surface-variant/80">GA4, PostHog (anonim)</span>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                aria-label="Analitik çerezler"
                className="accent-primary"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-on-surface-variant cursor-pointer">
              <span className="flex flex-col">
                <span className="font-semibold text-on-surface">Pazarlama</span>
                <span className="text-[11px] text-on-surface-variant/80">Reklam pixel + remarketing</span>
              </span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                aria-label="Pazarlama çerezleri"
                className="accent-primary"
              />
            </label>
          </div>
        )}

        {mode === 'banner' ? (
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <button onClick={acceptAll} className="curator-btn-primary text-xs px-4 py-2 flex-1">
              Tümünü Kabul Et
            </button>
            <button
              onClick={rejectAll}
              className="text-xs text-on-surface-variant border border-outline-variant/30 rounded-sm px-4 py-2 hover:bg-surface-container-low transition-colors"
            >
              Sadece Zorunlu
            </button>
            <button
              onClick={() => setMode('preferences')}
              className="text-xs text-primary border border-primary/30 rounded-sm px-4 py-2 hover:bg-primary/5 transition-colors"
            >
              Tercihler
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <button onClick={savePreferences} className="curator-btn-primary text-xs px-4 py-2 flex-1">
              Seçimimi Kaydet
            </button>
            <button
              onClick={() => setMode('banner')}
              className="text-xs text-on-surface-variant border border-outline-variant/30 rounded-sm px-4 py-2 hover:bg-surface-container-low transition-colors"
            >
              Geri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
