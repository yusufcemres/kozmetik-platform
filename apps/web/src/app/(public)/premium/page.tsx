'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { getUserToken } from '@/lib/user-auth';

/**
 * Premium dashboard (Faz 3, 2026-05-17).
 *
 * - Premium durum rozeti + premium_until tarihi
 * - Ödeme geçmişi tablosu
 * - İade talep linki (mailto)
 *
 * Auth gerekli. Anonim kullanıcı /odeme'ye yönlendirilir.
 */

interface PaymentRow {
  payment_id: number;
  merchant_oid: string;
  plan_code: '29_one_time' | '49_monthly' | '490_yearly';
  amount_kurus: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  created_at: string;
  ipn_received_at: string | null;
  failure_reason: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  '29_one_time': 'Karşılaştırma Lifetime',
  '49_monthly': 'Premium Aylık',
  '490_yearly': 'Premium Yıllık',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-800' },
  success: { label: 'Başarılı', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Başarısız', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'İade edildi', color: 'bg-slate-100 text-slate-800' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PremiumDashboardPage() {
  const [status, setStatus] = useState<{ premium: boolean; premium_until: string | null } | null>(null);
  const [history, setHistory] = useState<PaymentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = !!getUserToken();

  useEffect(() => {
    if (!isLoggedIn) {
      setError('Premium dashboard için giriş yapman gerekiyor.');
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch<{ premium: boolean; premium_until: string | null }>('/payments/me/status'),
      apiFetch<PaymentRow[]>('/payments/me/history'),
    ])
      .then(([s, h]) => {
        setStatus(s);
        setHistory(h);
      })
      .catch((err: any) => {
        const msg = err instanceof ApiError && err.status === 401
          ? 'Giriş süresi dolmuş — tekrar giriş yap.'
          : err?.message || 'Premium bilgisi yüklenemedi';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <nav className="text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <span className="mx-2 text-outline">/</span>
        <span className="text-on-surface">Premium</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">workspace_premium</span>
          Premium Üyelik
        </h1>
        <p className="text-sm text-on-surface-variant">Üyelik durumu, ödeme geçmişi ve iade talepleri.</p>
      </header>

      {loading && (
        <div className="text-center py-12">
          <span className="material-icon animate-spin text-primary text-[32px] inline-block" aria-hidden="true">progress_activity</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 mb-6 text-center">
          <p className="text-sm text-amber-900 mb-3">{error}</p>
          {!isLoggedIn && (
            <Link href="/giris" className="text-sm text-primary hover:underline font-medium">
              Giriş yap →
            </Link>
          )}
        </div>
      )}

      {!loading && !error && status && (
        <>
          {/* Premium status kartı */}
          <div className={`curator-card p-6 mb-6 ${status.premium ? 'border-primary/40 bg-primary/5' : ''}`}>
            <div className="flex items-start gap-3">
              <span
                className={`material-icon text-[28px] shrink-0 ${
                  status.premium ? 'text-primary' : 'text-outline-variant'
                }`}
                aria-hidden="true"
              >
                {status.premium ? 'verified' : 'lock_outline'}
              </span>
              <div className="flex-1">
                <h2 className="text-base font-bold text-on-surface mb-1">
                  {status.premium ? 'Premium üyeliğin aktif 🎉' : 'Henüz Premium değilsin'}
                </h2>
                {status.premium && status.premium_until && (
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Bitiş tarihi:{' '}
                    <strong className="text-on-surface">{formatDate(status.premium_until)}</strong>
                  </p>
                )}
                {!status.premium && (
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                    Premium ile karşılaştırma detayı, trend grafiği, AI Cilt Danışmanı
                    sohbeti ve sınırsız analiz hakkı açılır.
                  </p>
                )}
              </div>
              {!status.premium && (
                <Link href="/odeme" className="curator-btn-primary text-xs px-4 py-2 shrink-0">
                  Plan Seç
                </Link>
              )}
            </div>
          </div>

          {/* Ödeme geçmişi */}
          <div className="curator-card p-5 mb-6">
            <h3 className="text-sm font-semibold text-on-surface mb-3">Ödeme Geçmişi</h3>
            {!history || history.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">
                Henüz ödeme yapmadın.{' '}
                <Link href="/odeme" className="text-primary hover:underline">İlk planı satın al →</Link>
              </p>
            ) : (
              <div className="space-y-1">
                {history.map((p) => {
                  const sLabel = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
                  return (
                    <div
                      key={p.payment_id}
                      className="flex items-center gap-3 py-2 border-b border-outline-variant/10 last:border-0 text-xs"
                    >
                      <span className="text-on-surface flex-1 truncate">
                        {PLAN_LABELS[p.plan_code] || p.plan_code}
                      </span>
                      <span className="text-on-surface-variant whitespace-nowrap">
                        {formatDate(p.created_at)}
                      </span>
                      <span className="text-on-surface font-semibold whitespace-nowrap">
                        ₺{(p.amount_kurus / 100).toFixed(0)}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sLabel.color}`}>
                        {sLabel.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* İade talep */}
          <div className="bg-surface-container-low rounded-sm p-5">
            <h3 className="text-sm font-semibold text-on-surface mb-2">İade Talep / Destek</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
              Tüketici Kanunu Madde 48 kapsamında: hizmetten yararlanmadan
              <strong> 14 gün</strong> içinde tam iade hakkın var. İade ya da soru için aşağıdaki
              maile ulaş — 48 saat içinde yanıt veriyoruz.
            </p>
            <a
              href="mailto:yusufcemresan@gmail.com?subject=REVELA%20Premium%20iade%20talebi"
              className="text-xs text-primary hover:underline"
            >
              📧 yusufcemresan@gmail.com
            </a>
          </div>
        </>
      )}
    </div>
  );
}
