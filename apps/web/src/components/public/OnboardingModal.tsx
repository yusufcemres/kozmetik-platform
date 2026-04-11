'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'revela_onboarding_seen';

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Delay to let the page load first
        const timer = setTimeout(() => setOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    } catch { /* SSR or storage error */ }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative bg-surface rounded-sm border border-outline-variant/20 shadow-2xl max-w-md w-full p-8 animate-slide-up">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors"
          aria-label="Kapat"
        >
          <span className="material-icon" aria-hidden="true">close</span>
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <span className="material-icon text-primary text-[32px]" aria-hidden="true">waving_hand</span>
          </div>

          <h2 className="text-xl font-bold text-on-surface mb-2">Hos geldin!</h2>
          <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
            REVELA, kozmetik ve gida takviyesi urunlerinin gercek yuzunu gosterir.
            Markalarin degil, iceriklerin konustugu tek platform.
          </p>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href="/cilt-analizi"
              onClick={dismiss}
              className="curator-btn-primary text-sm px-6 py-3 w-full flex items-center justify-center gap-2"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">bolt</span>
              Hizli Cilt Analizi (1dk)
            </Link>
            <Link
              href="/urunler"
              onClick={dismiss}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm hover:bg-surface-container-low transition-colors"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">search</span>
              Urunleri Kesfet
            </Link>
            <button
              onClick={dismiss}
              className="text-xs text-outline hover:text-on-surface-variant transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
