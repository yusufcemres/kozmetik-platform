'use client';

import { Suspense, useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  requestMagicLink,
  loginWithGoogle,
  loginWithFacebook,
  setUserToken,
  setCachedUser,
} from '@/lib/user-auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || '';
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

declare global {
  interface Window {
    google?: any;
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

function GirisInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/profilim';

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<null | 'google' | 'facebook'>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const googleInitialized = useRef(false);

  const emailValid = EMAIL_REGEX.test(email.trim());
  const emailError = emailTouched && email.length > 0 && !emailValid;

  const finishSocialLogin = useCallback(
    (token: string, user: { user_id: number; email: string; display_name: string | null }) => {
      setUserToken(token);
      setCachedUser(user);
      router.push(nextPath);
    },
    [router, nextPath],
  );

  const handleGoogleCredential = useCallback(
    async (response: any) => {
      const credential: string | undefined = response?.credential;
      if (!credential) {
        setSocialError('Google girişi tamamlanamadı');
        return;
      }
      setSocialLoading('google');
      setSocialError(null);
      try {
        const res = await loginWithGoogle(credential);
        finishSocialLogin(res.token, res.user);
      } catch (err: any) {
        setSocialError(err?.message || 'Google ile giriş başarısız');
        setSocialLoading(null);
      }
    },
    [finishSocialLogin],
  );

  const initGoogle = useCallback(() => {
    if (googleInitialized.current) return;
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id || !googleBtnRef.current) return;
    googleInitialized.current = true;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      ux_mode: 'popup',
      auto_select: false,
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320,
    });
  }, [handleGoogleCredential]);

  useEffect(() => {
    initGoogle();
  }, [initGoogle]);

  const onFacebookClick = useCallback(() => {
    if (!FACEBOOK_APP_ID) {
      setSocialError('Facebook girişi yapılandırılmamış');
      return;
    }
    if (!window.FB) {
      setSocialError('Facebook SDK yüklenmedi, lütfen sayfayı yenile');
      return;
    }
    setSocialError(null);
    setSocialLoading('facebook');
    window.FB.login(
      (response: any) => {
        const accessToken: string | undefined = response?.authResponse?.accessToken;
        if (response?.status !== 'connected' || !accessToken) {
          setSocialError('Facebook girişi iptal edildi');
          setSocialLoading(null);
          return;
        }
        loginWithFacebook(accessToken)
          .then((res) => finishSocialLogin(res.token, res.user))
          .catch((err: any) => {
            setSocialError(err?.message || 'Facebook ile giriş başarısız');
            setSocialLoading(null);
          });
      },
      { scope: 'email,public_profile' },
    );
  }, [finishSocialLogin]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailValid) {
      setEmailTouched(true);
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await requestMagicLink(email.trim());
      setStatus('sent');
      if (res.devToken) {
        setDevToken(res.devToken);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Bir hata oluştu');
    }
  };

  const socialBusy = socialLoading !== null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initGoogle}
          onReady={initGoogle}
        />
      )}
      {FACEBOOK_APP_ID && (
        <Script id="fb-sdk" strategy="afterInteractive">
          {`
            window.fbAsyncInit = function() {
              FB.init({ appId: '${FACEBOOK_APP_ID}', cookie: true, xfbml: false, version: 'v19.0' });
            };
            (function(d, s, id){
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = "https://connect.facebook.net/en_US/sdk.js";
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
          `}
        </Script>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface mb-2">
            REVELA'ya Giriş
          </h1>
          <p className="text-sm text-on-surface-variant">
            Hesabına eriş, geçmişini gör.
            <br />Şifre yok — Google, Facebook veya e-posta ile gir.
          </p>
        </div>

        {status !== 'sent' ? (
          <>
            {(GOOGLE_CLIENT_ID || FACEBOOK_APP_ID) && (
              <div className="space-y-3 mb-6">
                {GOOGLE_CLIENT_ID && (
                  <div className="flex justify-center" aria-busy={socialLoading === 'google'}>
                    <div ref={googleBtnRef} />
                  </div>
                )}

                {FACEBOOK_APP_ID && (
                  <button
                    type="button"
                    onClick={onFacebookClick}
                    disabled={socialBusy}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    {socialLoading === 'facebook' ? 'Bağlanıyor…' : 'Facebook ile devam et'}
                  </button>
                )}

                {socialError && (
                  <div className="text-xs text-error bg-error/5 border border-error/20 rounded-sm px-3 py-2">
                    {socialError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px bg-outline-variant/30" />
                  <span className="text-[10px] uppercase tracking-wider text-outline">veya</span>
                  <div className="flex-1 h-px bg-outline-variant/30" />
                </div>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-on-surface-variant mb-2 uppercase tracking-wider">
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="sen@ornek.com"
                  disabled={status === 'loading' || socialBusy}
                  aria-invalid={emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className={`w-full px-4 py-3 bg-surface border rounded-sm text-on-surface placeholder:text-outline focus:outline-none transition-colors ${
                    emailError ? 'border-error focus:border-error' : 'border-outline-variant/30 focus:border-primary'
                  }`}
                />
                {emailError && (
                  <p id="email-error" className="text-xs text-error mt-2">
                    Geçerli bir e-posta adresi gir (örn. sen@ornek.com)
                  </p>
                )}
              </div>

              {status === 'error' && (
                <div className="text-sm text-error bg-error/5 border border-error/20 rounded-sm px-4 py-3">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !emailValid || socialBusy}
                className="curator-btn-primary text-sm px-6 py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Gönderiliyor…' : 'Giriş Bağlantısı Gönder'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="material-icon text-primary text-[32px]" aria-hidden="true">mark_email_read</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Bağlantı gönderildi</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <strong>{email}</strong> adresine giriş bağlantısı gönderdik.
              <br />E-postanı kontrol et. 10 dakika geçerli.
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

export default function GirisPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <GirisInner />
    </Suspense>
  );
}
