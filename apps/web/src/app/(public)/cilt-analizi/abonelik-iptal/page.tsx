'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

/**
 * 28-gün reminder abonelik iptal sayfası (Faz 1 Gün 9).
 *
 * Akış: email içindeki link → /cilt-analizi/abonelik-iptal?token=XXX
 *  → backend GET /skin-analysis/unsubscribe/:token → subscription_email NULL
 *  → success confirmation.
 *
 * Token enumeration'a karşı: bilinmeyen token da success döner (no info leak).
 */
function UnsubscribeContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }
    apiFetch(`/skin-analysis/unsubscribe/${encodeURIComponent(token)}`)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {state === 'loading' && (
        <>
          <span className="material-icon animate-spin text-primary text-[40px] mb-4 inline-block" aria-hidden="true">
            progress_activity
          </span>
          <p className="text-sm text-on-surface-variant">Aboneliğin iptal ediliyor…</p>
        </>
      )}

      {state === 'success' && (
        <>
          <span className="material-icon text-score-high text-[48px] mb-3 inline-block" aria-hidden="true">
            check_circle
          </span>
          <h1 className="text-xl font-bold text-on-surface mb-2">Aboneliğin iptal edildi</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            Artık 28-gün hatırlatma maili almayacaksın. Email adresin sistemden silindi
            (KVKK: sadece anonim SHA-256 hash kalır).
          </p>
          <Link
            href="/cilt-analizi/foto-test"
            className="curator-btn-primary text-sm px-6 py-3 inline-block"
          >
            Yeni Analiz Çek
          </Link>
        </>
      )}

      {state === 'error' && (
        <>
          <span className="material-icon text-on-surface-variant text-[40px] mb-3 inline-block" aria-hidden="true">
            help_outline
          </span>
          <h1 className="text-lg font-bold text-on-surface mb-2">Bağlantı geçersiz veya kullanılmış</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            Token bulunamadı — daha önce iptal etmiş olabilirsin ya da link geçerli değil.
            Yeni bir analiz yapıp tekrar email opt-in yapabilirsin.
          </p>
          <Link href="/cilt-analizi" className="text-sm text-primary hover:underline">
            Cilt Analizi sayfasına dön
          </Link>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16">
          <span className="material-icon animate-spin text-primary" aria-hidden="true">progress_activity</span>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
