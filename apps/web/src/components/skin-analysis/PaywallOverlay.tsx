'use client';

import { useEffect, useState } from 'react';
import { isUnlocked, unlockStub, type PremiumFeature } from '@/lib/premium';
import { apiFetch } from '@/lib/api';
import { getUserToken } from '@/lib/user-auth';

/**
 * Blur+reveal paywall overlay (Faz 2 #4 iskelet — Spotify Wrapped mekaniği).
 *
 * Üst kullanım: <PaywallOverlay feature="compare_delta">{children}</PaywallOverlay>
 *   - Premium ise children'ı normal render eder
 *   - Değilse children'ı blur eder + üstüne CTA card overlay
 *
 * Backend entitlement Faz 3'te gelecek (PayTR webhook → JWT claim). Şimdi iskelet:
 * "29 TL ile Aç" butonu PayTR yerine localStorage flag set ediyor (demo/test).
 */

export interface PaywallOverlayProps {
  feature: PremiumFeature;
  title?: string;
  description?: string;
  price?: number;
  /** Force unlock — örn. login user'a free trial vermek için */
  forceUnlock?: boolean;
  children: React.ReactNode;
}

const DEFAULT_TITLES: Record<PremiumFeature, { title: string; description: string; price: number }> = {
  compare_delta: {
    title: 'Boyut Karşılaştırma Detayı',
    description: '6 boyutta tek tek delta + INCI önerisi etkisi — Premium ile aç.',
    price: 29,
  },
  product_recommendations: {
    title: 'Tam Ürün Önerisi Listesi',
    description: 'Her INCI için top 5 REVELA ürünü + fiyat + bağlantı.',
    price: 29,
  },
  trend_history: {
    title: 'Tüm Geçmiş Trend Grafiği',
    description: 'Sınırsız analiz geçmişi + 6 boyut sparkline + trend yön rozeti.',
    price: 29,
  },
  ai_chat: {
    title: 'AI Cilt Danışmanı',
    description: 'Analiz sonucuna özel cilt rutini sorgusu — kişisel AI sohbet.',
    price: 49,
  },
};

export function PaywallOverlay({
  feature,
  title,
  description,
  price,
  forceUnlock = false,
  children,
}: PaywallOverlayProps) {
  const [unlocked, setUnlocked] = useState<boolean>(forceUnlock || false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (forceUnlock) {
      setUnlocked(true);
      return;
    }
    // 1) Hızlı check: localStorage stub (offline UX, anlık)
    setUnlocked(isUnlocked(feature));

    // 2) Backend check: kullanıcı login ise gerçek entitlement (Faz 3 PaymentsService)
    // premium_until aktifse tüm feature'lar açık (Premium tier all-in).
    if (getUserToken()) {
      apiFetch<{ premium: boolean; premium_until: string | null }>('/payments/me/status')
        .then((res) => {
          if (res.premium) setUnlocked(true);
        })
        .catch(() => {
          // 401/503 → sessiz, localStorage stub'a güven
        });
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.feature === feature || detail?.feature === 'all') {
        setUnlocked(isUnlocked(feature));
      }
    };
    window.addEventListener('revela-premium-changed', handler);
    return () => window.removeEventListener('revela-premium-changed', handler);
  }, [feature, forceUnlock]);

  if (unlocked) return <>{children}</>;

  const defaults = DEFAULT_TITLES[feature];
  const finalTitle = title || defaults.title;
  const finalDesc = description || defaults.description;
  const finalPrice = price ?? defaults.price;

  const handleUnlock = () => {
    setSubmitting(true);
    // Login ise /odeme sayfasına yönlendir (gerçek PayTR akışı). Login değilse magic
    // link giriş sayfasına yönlendir, query'de ref=odeme ile dönüş hatırlanır.
    if (getUserToken()) {
      window.location.href = `/odeme?feature=${feature}`;
    } else {
      window.location.href = `/giris?ref=/odeme`;
    }
    // Fallback: localStorage stub (sadece dev/test, login değilse veya redirect bloklanırsa)
    setTimeout(() => {
      if (!getUserToken()) {
        unlockStub(feature);
        setSubmitting(false);
      }
    }, 1500);
  };

  return (
    <div className="relative">
      {/* Blur edilmiş içerik — pointer-events-none ile etkileşim kapalı */}
      <div className="filter blur-[4px] pointer-events-none select-none opacity-60" aria-hidden="true">
        {children}
      </div>

      {/* CTA card — overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-surface border border-primary/30 rounded-lg shadow-xl max-w-sm w-full p-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <span className="material-icon text-primary text-[24px]" aria-hidden="true">lock</span>
          </div>
          <h3 className="text-base font-bold text-on-surface mb-1">{finalTitle}</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{finalDesc}</p>
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="text-2xl font-bold text-on-surface">{finalPrice} TL</span>
            <span className="text-[10px] text-outline uppercase tracking-wider">tek seferlik</span>
          </div>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={submitting}
            className="curator-btn-primary w-full text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Yönlendiriliyor…' : 'Premium ile Aç'}
          </button>
          <p className="text-[10px] text-outline mt-3 leading-relaxed">
            PayTR güvenli iframe → /odeme sayfasında plan seç. PayTR merchant onayı
            beklerken 503 dönerse "yakında" mesajı görünür.
          </p>
        </div>
      </div>
    </div>
  );
}
