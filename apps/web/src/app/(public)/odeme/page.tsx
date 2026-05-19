'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { getUserToken } from '@/lib/user-auth';

/**
 * Premium ödeme sayfası (Faz 3 başlangıcı, 2026-05-17).
 *
 * Akış:
 *  1. Kullanıcı plan seçer (29 TL one-time, 49 TL/ay, 490 TL/yıl)
 *  2. "Satın Al" → backend POST /payments/checkout → iframe_token + merchant_oid
 *  3. PayTR iframe yüklenir → kullanıcı ödemeyi yapar
 *  4. PayTR success_url ya da fail_url → /odeme/sonuc?oid=X&status=Y
 *
 * PayTR merchant onayı bekliyor → backend 503 dönüyorsa friendly mesaj.
 */

interface PlanCard {
  code: '29_one_time' | '49_monthly' | '490_yearly';
  title: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}

const PLANS: PlanCard[] = [
  {
    code: '29_one_time',
    title: 'Karşılaştırma Lifetime',
    price: 29,
    period: 'tek seferlik',
    description: 'Eski vs yeni analiz detayı + 6 boyut delta her zaman açık.',
    features: [
      'Karşılaştırma sayfası tüm detayı',
      '6 boyut delta tablosu kalıcı açık',
      'Lifetime — yenileme yok',
    ],
  },
  {
    code: '49_monthly',
    title: 'Premium Aylık',
    price: 49,
    period: '/ay',
    description: 'Tüm Premium feature\'lar — istediğin zaman iptal et.',
    features: [
      'Sınırsız Vision analiz',
      'AI Cilt Danışmanı sohbet',
      'Karşılaştırma + Trend grafik',
      'INCI tam ürün önerisi listesi',
      '28-gün hatırlatma + trend mail',
    ],
    badge: 'En esnek',
  },
  {
    code: '490_yearly',
    title: 'Premium Yıllık',
    price: 490,
    period: '/yıl',
    description: '12 aylık paket — %17 indirim, 2 ay bedava.',
    features: [
      'Premium Aylık\'ın tüm özellikleri',
      '12 ay × 49 = 588 TL yerine 490 TL',
      '2 ay bedava (%17 indirim)',
      'Yıllık tek ödeme — yenileme manuel',
    ],
    badge: '%17 indirim',
    highlight: true,
  },
];

export default function OdemePage() {
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null); // hangi planın loading'i
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = !!getUserToken();

  const handleCheckout = async (planCode: PlanCard['code']) => {
    if (!isLoggedIn) {
      setError('Ödeme yapmak için önce giriş yap.');
      return;
    }
    setLoading(planCode);
    setError(null);
    try {
      const res = await apiFetch<{ iframe_token: string; merchant_oid: string }>(
        '/payments/checkout',
        {
          method: 'POST',
          body: JSON.stringify({ plan_code: planCode }),
        },
      );
      setIframeToken(res.iframe_token);
    } catch (err) {
      let msg = err instanceof Error ? err.message : 'Ödeme başlatılamadı';
      if (err instanceof ApiError) {
        if (err.status === 401) msg = 'Giriş yapman gerekiyor.';
        else if (err.status === 503) msg = 'Ödeme servisi henüz aktif değil (PayTR merchant onayı bekleniyor). Birkaç gün içinde açılacak.';
      }
      setError(msg);
    } finally {
      setLoading(null);
    }
  };

  // PayTR iframe açıldıysa onu göster, plan kartlarını gizle
  if (iframeToken) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-on-surface">Güvenli Ödeme</h1>
          <button
            onClick={() => setIframeToken(null)}
            className="text-xs text-on-surface-variant hover:text-on-surface underline"
          >
            Vazgeç
          </button>
        </div>
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
          title="PayTR Güvenli Ödeme"
          className="w-full h-[720px] border border-outline-variant/30 rounded-lg"
          allow="payment"
        />
        <p className="text-[10px] text-outline mt-3 text-center">
          Ödeme PayTR güvenli sayfasında yapılır — REVELA hiç kart bilgisi görmez.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <nav className="text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <span className="mx-2 text-outline">/</span>
        <span className="text-on-surface">Premium</span>
      </nav>

      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-on-surface mb-3">REVELA Premium</h1>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Cilt analiz sonuçlarının tüm detayı + AI Cilt Danışmanı + trend grafiği —
          sade fiyat, istediğin zaman iptal.
        </p>
      </header>

      {!isLoggedIn && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-6 text-center">
          <p className="text-sm text-amber-900 mb-2">Ödeme için önce giriş yapman gerekiyor.</p>
          <Link href="/giris" className="text-sm text-primary hover:underline font-medium">
            Giriş yap →
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-error/5 border border-error/20 rounded-sm p-4 mb-6">
          <p className="text-sm text-error flex items-start gap-2">
            <span className="material-icon text-[18px] shrink-0 mt-0.5" aria-hidden="true">error_outline</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((p) => (
          <div
            key={p.code}
            className={`curator-card p-6 relative flex flex-col ${
              p.highlight ? 'border-primary/50 shadow-md' : ''
            }`}
          >
            {p.badge && (
              <span
                className={`absolute -top-2 right-4 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  p.highlight ? 'bg-primary text-on-primary' : 'bg-score-medium/15 text-score-medium'
                }`}
              >
                {p.badge}
              </span>
            )}
            <h2 className="text-base font-bold text-on-surface mb-1">{p.title}</h2>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-on-surface">{p.price}</span>
              <span className="text-xs text-on-surface-variant">TL {p.period}</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{p.description}</p>
            <ul className="space-y-1.5 mb-6 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-on-surface">
                  <span className="material-icon text-score-high text-[14px] mt-0.5 shrink-0" aria-hidden="true">check</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleCheckout(p.code)}
              disabled={!isLoggedIn || loading !== null}
              className={`text-sm py-2.5 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                p.highlight
                  ? 'bg-primary text-on-primary hover:bg-primary/90'
                  : 'border border-primary/40 text-primary hover:bg-primary/5'
              }`}
            >
              {loading === p.code ? 'Hazırlanıyor…' : 'Satın Al'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low rounded-sm p-5 mb-6">
        <h3 className="text-sm font-semibold text-on-surface mb-2">Güvenli ödeme — PayTR</h3>
        <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside">
          <li>Tüm ödemeler PayTR güvenli iframe'inde yapılır — REVELA kart bilgisi görmez.</li>
          <li>3D Secure, taksit, kapıda ödeme yok (Visa/Mastercard/Troy direkt).</li>
          <li>İade: 14 gün içinde {' '}<a href="mailto:yusufcemresan@gmail.com" className="text-primary hover:underline">yusufcemresan@gmail.com</a> ile talep.</li>
          <li>KVKK + Tüketici Kanunu Madde 48 (mesafeli sözleşme) tam uyum.</li>
        </ul>
      </div>

      <p className="text-[10px] text-outline text-center leading-relaxed">
        Faz 3 dev iskelet hazır, PayTR merchant onayı bekleniyor. Ödeme butonları
        503 verirse "yakında aktif" — backend tarafı çalışıyor.
      </p>
    </div>
  );
}
