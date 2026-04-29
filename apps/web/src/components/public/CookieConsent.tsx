'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from './Toast';

const STORAGE_KEY = 'revela_consent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function updateConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied'); } catch {}
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const { success, info } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const timer = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const accept = () => {
    updateConsent(true);
    setShow(false);
    success('Çerez tercihi kaydedildi — analitik aktif.');
  };

  const reject = () => {
    updateConsent(false);
    setShow(false);
    info('Çerez tercihi kaydedildi — analitik kapalı.');
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-md z-[95] animate-slide-up"
      role="dialog"
      aria-label="Çerez tercihleri"
    >
      <div className="bg-surface border border-outline-variant/30 rounded-sm shadow-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-icon text-primary text-[20px]" aria-hidden="true">cookie</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface mb-1">Çerezler</div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              REVELA'yı iyileştirmek için analitik çerezler kullanıyoruz. İsteğe bağlıdır, dilediğin zaman kapatabilirsin.{' '}
              <Link href="/cerez-politikasi" className="underline hover:text-on-surface">
                Detaylı bilgi
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={accept}
            className="curator-btn-primary text-xs px-4 py-2 flex-1"
          >
            Kabul Et
          </button>
          <button
            onClick={reject}
            className="text-xs text-on-surface-variant border border-outline-variant/30 rounded-sm px-4 py-2 hover:bg-surface-container-low transition-colors"
          >
            Reddet
          </button>
        </div>
      </div>
    </div>
  );
}
