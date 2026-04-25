'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Public route error boundary.
 *
 * Server Component'lerde fetch fail (502/503/timeout) bu boundary'ye düşer.
 * Kullanıcıya bağlam-duyarlı mesaj gösterir:
 *  - DB/API down: "Geçici teknik sorun, kısa sürede dönüyoruz"
 *  - Generic: "Beklenmedik hata"
 *
 * digest: Next.js production'da gerçek mesajı gizler (digest hash döner) —
 * kullanıcı raporlarken biz bu hash'i loglardan eşleştirebiliriz.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  // Heuristic: API/DB down belirtileri
  const msg = String(error?.message || '').toLowerCase();
  const isApiDown =
    msg.includes('fetch failed') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('database') ||
    msg.includes('connection');

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((c) => c + 1);
    // 1 saniye bekle (cold start için süre tanı), sonra reset
    await new Promise((r) => setTimeout(r, 1000));
    reset();
    setIsRetrying(false);
  };

  return (
    <div className="curator-section max-w-2xl mx-auto text-center py-12">
      <span
        className="material-icon mb-6 block"
        style={{ fontSize: '64px' }}
        aria-hidden="true"
      >
        {isApiDown ? 'cloud_off' : 'error_outline'}
      </span>

      <h1 className="text-2xl md:text-3xl headline-tight text-on-surface mb-3">
        {isApiDown ? 'Geçici teknik sorun' : 'Bir hata oluştu'}
      </h1>

      <p className="text-on-surface-variant text-sm leading-relaxed mb-2 max-w-md mx-auto">
        {isApiDown
          ? 'Sunucumuza şu an ulaşılamıyor. Sistem birkaç saniye içinde tekrar açılabilir — "Tekrar Dene" butonuna basabilirsin.'
          : 'Sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar dene.'}
      </p>

      {isApiDown && retryCount >= 2 && (
        <p className="text-[11px] text-outline mb-4 max-w-sm mx-auto">
          Sorun devam ediyorsa birkaç dakika sonra dönmeyi dene. Bakım için
          <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-primary mx-1 hover:underline">
            sosyal hesaplarımızı
          </Link>
          takip edebilirsin.
        </p>
      )}

      {error?.digest && (
        <p className="text-[10px] text-outline mb-6 font-mono">
          Hata kimliği: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="curator-btn-primary px-8 py-3 text-xs disabled:opacity-50"
        >
          <span className={`material-icon material-icon-sm mr-1 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true">
            {isRetrying ? 'autorenew' : 'refresh'}
          </span>
          {isRetrying ? 'Bağlanıyor…' : 'Tekrar Dene'}
        </button>
        <Link
          href="/"
          className="curator-btn-outline px-8 py-3 text-xs"
        >
          <span className="material-icon material-icon-sm mr-1" aria-hidden="true">home</span>
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
