'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function KarsilastirError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[karsilastir] boundary caught:', error);
  }, [error]);

  return (
    <div className="curator-section max-w-[720px] mx-auto py-20 text-center">
      <span
        className="material-icon text-outline-variant mb-4 block"
        style={{ fontSize: '64px' }}
        aria-hidden="true"
      >
        compare_arrows
      </span>
      <h1 className="text-2xl headline-tight text-on-surface mb-2">
        Karşılaştırma yüklenemedi
      </h1>
      <p className="text-on-surface-variant text-sm mb-6">
        Ürün karşılaştırma ekranında beklenmedik bir hata oluştu. Tekrar denemek
        veya takviye listesine dönmek ister misiniz?
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-full text-xs font-medium bg-primary text-on-primary hover:opacity-90 transition-opacity"
        >
          Tekrar Dene
        </button>
        <Link
          href="/takviyeler"
          className="px-5 py-2.5 rounded-full text-xs font-medium border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          Takviye Listesine Dön
        </Link>
      </div>
      {error?.digest && (
        <p className="mt-6 text-[10px] text-outline font-mono">
          error id: {error.digest}
        </p>
      )}
    </div>
  );
}
