'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyMagicLink, setUserToken, setCachedUser } from '@/lib/user-auth';

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Bağlantı geçersiz');
      return;
    }
    verifyMagicLink(token)
      .then((res) => {
        setUserToken(res.token);
        setCachedUser(res.user);
        setStatus('success');
        setTimeout(() => router.push('/profilim'), 1200);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Bağlantı doğrulanamadı');
      });
  }, [token, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="material-icon text-primary text-[32px]" aria-hidden="true">hourglass_empty</span>
            </div>
            <h1 className="text-xl font-bold text-on-surface mb-2">Doğrulanıyor…</h1>
            <p className="text-sm text-on-surface-variant">Bir saniye sürüyor.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-icon text-primary text-[32px]" aria-hidden="true">check_circle</span>
            </div>
            <h1 className="text-xl font-bold text-on-surface mb-2">Giriş başarılı</h1>
            <p className="text-sm text-on-surface-variant">Profilim sayfasına yönlendiriliyorsun…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-icon text-error text-[32px]" aria-hidden="true">error</span>
            </div>
            <h1 className="text-xl font-bold text-on-surface mb-2">Giriş yapılamadı</h1>
            <p className="text-sm text-on-surface-variant mb-6">{message}</p>
            <Link href="/giris" className="curator-btn-primary text-sm px-6 py-3 inline-block">
              Tekrar Dene
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function DogrulaPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <VerifyInner />
    </Suspense>
  );
}
