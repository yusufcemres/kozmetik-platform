'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'revela_install_dismissed';
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS Safari non-standard
    window.navigator.standalone === true
  );
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (Number.isNaN(ts)) return false;
    const ageMs = Date.now() - ts;
    return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function InstallPWAButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosModal, setIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    const ios = isIOS();
    setIsIos(ios);

    if (ios) {
      // iOS: no beforeinstallprompt — show manual instruction banner
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installed = () => {
      setShow(false);
      setDeferred(null);
    };
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    setIosModal(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  };

  const handleInstall = async () => {
    if (isIos) {
      setIosModal(true);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      setShow(false);
      setDeferred(null);
    } else {
      dismiss();
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Bottom banner */}
      <div
        className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[90] animate-slide-up"
        role="dialog"
        aria-label="Uygulamayı yükle"
      >
        <div className="bg-surface border border-outline-variant/30 rounded-sm shadow-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-icon text-primary text-[20px]" aria-hidden="true">
              download
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface mb-0.5">
              REVELA'yı yükle
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
              Ana ekranına ekle, tek dokunuşla aç. Offline çalışır, hızlıdır.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="curator-btn-primary text-xs px-3 py-1.5"
              >
                {isIos ? 'Nasıl?' : 'Yükle'}
              </button>
              <button
                onClick={dismiss}
                className="text-xs text-outline hover:text-on-surface-variant transition-colors px-2"
              >
                Şimdi değil
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-outline hover:text-on-surface transition-colors"
            aria-label="Kapat"
          >
            <span className="material-icon text-[18px]" aria-hidden="true">close</span>
          </button>
        </div>
      </div>

      {/* iOS instruction modal */}
      {iosModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm" onClick={() => setIosModal(false)} />
          <div className="relative bg-surface rounded-sm border border-outline-variant/20 shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <button
              onClick={() => setIosModal(false)}
              className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors"
              aria-label="Kapat"
            >
              <span className="material-icon" aria-hidden="true">close</span>
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="material-icon text-primary text-[28px]" aria-hidden="true">ios_share</span>
              </div>
              <h2 className="text-lg font-bold text-on-surface mb-1">Safari'de ekle</h2>
              <p className="text-xs text-on-surface-variant">
                REVELA'yı ana ekranına eklemek için:
              </p>
            </div>

            <ol className="space-y-3 mb-5">
              <li className="flex items-start gap-3 text-sm text-on-surface">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>
                  Alttaki <span className="material-icon text-[16px] align-middle mx-1">ios_share</span>
                  <strong>Paylaş</strong> butonuna dokun
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>
                  <strong>"Ana Ekrana Ekle"</strong> seçeneğini bul
                  <span className="material-icon text-[16px] align-middle ml-1">add_box</span>
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>
                  Sağ üstten <strong>"Ekle"</strong> ile onayla
                </span>
              </li>
            </ol>

            <button
              onClick={dismiss}
              className="curator-btn-primary text-sm px-4 py-2.5 w-full"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
