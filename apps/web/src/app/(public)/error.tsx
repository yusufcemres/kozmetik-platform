'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="curator-section max-w-2xl mx-auto text-center">
      <span
        className="material-icon text-error mb-6 block"
        style={{ fontSize: '80px' }}
        aria-hidden="true"
      >
        error_outline
      </span>
      <h1 className="text-3xl headline-tight text-on-surface mb-3">
        BİR HATA OLUŞTU
      </h1>
      <p className="text-on-surface-variant mb-8">
        Sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar dene.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="curator-btn-primary px-8 py-3 text-xs"
        >
          <span className="material-icon material-icon-sm mr-1" aria-hidden="true">refresh</span>
          Tekrar Dene
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
