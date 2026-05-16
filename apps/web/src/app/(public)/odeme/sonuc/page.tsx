'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

/**
 * PayTR success/fail redirect target (Faz 3).
 *
 * Akış: PayTR ödeme bitince merchant_ok_url veya merchant_fail_url'e yönlendirir
 *   → /odeme/sonuc?oid=<merchant_oid>&status=success|failed
 *
 * UI: status'a göre success/fail card. Backend GET /payments/me/status ile
 * premium_until doğrulama yapılır (IPN bu sırada henüz işlenmemiş olabilir,
 * 2-3 retry ile bekleyebiliriz).
 */
function SonucContent() {
  const params = useSearchParams();
  const status = params.get('status'); // 'success' | 'failed'
  const oid = params.get('oid');
  const [premium, setPremium] = useState<{ premium: boolean; premium_until: string | null } | null>(null);
  const [checkedAt, setCheckedAt] = useState<number>(0);

  // Success ise backend'den premium status'u poll et (IPN henüz işlenmemiş olabilir, ~10s)
  useEffect(() => {
    if (status !== 'success') return;
    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      if (cancelled || attempts >= 5) return;
      attempts++;
      try {
        const res = await apiFetch<{ premium: boolean; premium_until: string | null }>('/payments/me/status');
        if (cancelled) return;
        setPremium(res);
        setCheckedAt(Date.now());
        if (res.premium) return; // IPN işlendi, aktif premium
      } catch {
        // 401 vs — sessiz, kullanıcı manuel /me/status'a bakar
      }
      // 3sn sonra tekrar dene (IPN async olabilir)
      setTimeout(check, 3000);
    };
    check();
    return () => { cancelled = true; };
  }, [status]);

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <span className="material-icon text-score-high text-[56px] mb-3 inline-block" aria-hidden="true">check_circle</span>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Ödeme Başarılı 🎉</h1>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          {premium === null && 'Premium aktivasyonu kontrol ediliyor…'}
          {premium && premium.premium && 'Premium üyeliğin aktif! Tüm feature\'lar açıldı.'}
          {premium && !premium.premium && checkedAt > 0 && 'Ödeme alındı, premium 1-2 dakika içinde aktif olur (PayTR doğrulama). Sayfayı birazdan yenile.'}
        </p>

        {premium?.premium && premium.premium_until && (
          <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 mb-6 text-xs text-on-surface-variant">
            <p>Premium bitiş: <strong className="text-on-surface">
              {new Date(premium.premium_until).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </strong></p>
          </div>
        )}

        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <Link href="/cilt-analizi/foto-test" className="curator-btn-primary text-sm py-3">
            Yeni Analiz Çek
          </Link>
          <Link href="/cilt-analizi/trend" className="text-sm text-primary hover:underline">
            Trend grafiğine git
          </Link>
        </div>

        {oid && (
          <p className="text-[10px] text-outline mt-6">
            Sipariş ID: {oid.slice(0, 16)}…
          </p>
        )}
      </div>
    );
  }

  // status=failed veya yok
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <span className="material-icon text-error text-[48px] mb-3 inline-block" aria-hidden="true">error_outline</span>
      <h1 className="text-2xl font-bold text-on-surface mb-2">Ödeme Tamamlanamadı</h1>
      <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
        İşlem PayTR tarafında başarısız oldu. Kartın çekilmedi — hiçbir ücret alınmadı.
        Tekrar denemek için ödeme sayfasına geri dön.
      </p>
      <div className="flex flex-col gap-2 max-w-xs mx-auto">
        <Link href="/odeme" className="curator-btn-primary text-sm py-3">
          Tekrar Dene
        </Link>
        <Link href="/cilt-analizi" className="text-sm text-on-surface-variant hover:text-on-surface">
          Ücretsiz analiz ile devam
        </Link>
      </div>
      {oid && (
        <p className="text-[10px] text-outline mt-6">
          Sipariş ID: {oid.slice(0, 16)}…
        </p>
      )}
    </div>
  );
}

export default function OdemeSonucPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16">
          <span className="material-icon animate-spin text-primary" aria-hidden="true">progress_activity</span>
        </div>
      }
    >
      <SonucContent />
    </Suspense>
  );
}
