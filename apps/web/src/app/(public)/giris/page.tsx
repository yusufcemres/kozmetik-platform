'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { requestMagicLink } from '@/lib/user-auth';

export default function GirisPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await requestMagicLink(email);
      setStatus('sent');
      if (res.devToken) {
        setDevToken(res.devToken);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Bir hata oluştu');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface mb-2">
            REVELA'ya Giriş
          </h1>
          <p className="text-sm text-on-surface-variant">
            E-posta adresini gir, sana giriş bağlantısı gönderelim.
            <br />Şifre yok.
          </p>
        </div>

        {status !== 'sent' ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-on-surface-variant mb-2 uppercase tracking-wider">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sen@ornek.com"
                disabled={status === 'loading'}
                className="w-full px-4 py-3 bg-surface border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {status === 'error' && (
              <div className="text-sm text-error bg-error/5 border border-error/20 rounded-sm px-4 py-3">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="curator-btn-primary text-sm px-6 py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Gönderiliyor…' : 'Giriş Bağlantısı Gönder'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="material-icon text-primary text-[32px]" aria-hidden="true">mark_email_read</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Bağlantı gönderildi</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <strong>{email}</strong> adresine giriş bağlantısı gönderdik.
              <br />E-postanı kontrol et. 20 dakika geçerli.
            </p>

            {devToken && (
              <div className="mt-4 p-4 bg-surface-container-low border border-outline-variant/20 rounded-sm text-left">
                <div className="text-[10px] uppercase tracking-wider text-outline mb-2">Dev Mode</div>
                <Link
                  href={`/giris/dogrula?token=${devToken}`}
                  className="text-xs text-primary underline break-all"
                >
                  /giris/dogrula?token={devToken.slice(0, 16)}…
                </Link>
              </div>
            )}

            <button
              onClick={() => { setStatus('idle'); setDevToken(null); }}
              className="text-xs text-outline hover:text-on-surface-variant transition-colors"
            >
              Farklı e-posta kullan
            </button>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-outline-variant/20 text-center">
          <p className="text-xs text-outline">
            Giriş yaparak{' '}
            <Link href="/kullanim-kosullari" className="underline hover:text-on-surface-variant">Kullanım Koşulları</Link>
            {' '}ve{' '}
            <Link href="/gizlilik" className="underline hover:text-on-surface-variant">Gizlilik Politikası</Link>
            'nı kabul etmiş olursun.
          </p>
        </div>
      </div>
    </div>
  );
}
