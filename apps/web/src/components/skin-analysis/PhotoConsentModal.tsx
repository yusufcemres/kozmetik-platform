'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * KVKK aydınlatma + açık rıza modal'ı (Faz 1 Gün 10).
 *
 * Foto analiz kamerası açılmadan ÖNCE gösterilir. Açık rıza alınmadıkça
 * (Madde 6/3 — biyometrik veri için açık rıza şart) analiz başlamaz.
 *
 * Aydınlatma kapsamı (Madde 10):
 *  - Veri sorumlusu (REVELA — SoloLabs Cilt Analiz Hizmeti)
 *  - Veri kategorileri (yüz fotoğrafı = biyometrik)
 *  - İşleme amacı (görsel cilt skoru üretimi)
 *  - Hukuki sebep (açık rıza, Madde 6/3)
 *  - Saklama (foto: opt-in 30 gün; skor: silme talebine kadar)
 *  - Aktarım (Gemini/Claude Vision API — sadece skor için)
 *  - Haklar (Madde 11 — /veri-haklarim)
 */
export const CONSENT_VERSION = 'v1-2026-05-26';

export interface PhotoConsentModalProps {
  open: boolean;
  onAccept: (consentVersion: string) => void;
  onDecline: () => void;
}

export function PhotoConsentModal({ open, onAccept, onDecline }: PhotoConsentModalProps) {
  const [biometricConsent, setBiometricConsent] = useState(false);
  const [readDisclosure, setReadDisclosure] = useState(false);

  if (!open) return null;

  const canAccept = biometricConsent && readDisclosure;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-surface rounded-t-lg sm:rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-outline-variant/20">
          <h2 id="consent-title" className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-icon text-primary" aria-hidden="true">policy</span>
            KVKK Aydınlatma & Açık Rıza
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Foto analiz başlamadan önce kişisel verilerinin nasıl işleneceğini oku ve onayını ver.
          </p>
        </div>

        <div className="p-6 space-y-4 text-sm text-on-surface leading-relaxed">
          <section>
            <h3 className="font-semibold mb-1">Veri Sorumlusu</h3>
            <p className="text-xs text-on-surface-variant">
              REVELA Cilt Analiz Hizmeti (SoloLabs) — yusufcemresan@gmail.com
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">İşlenen Veriler ve Hukuki Sebep</h3>
            <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside">
              <li>
                <strong>Yüz fotoğrafı</strong> (özel nitelikli kişisel veri — biyometrik) —
                KVKK Madde 6/3 uyarınca <strong>açık rıza</strong> gerekiyor.
              </li>
              <li>Cilt skoru (6 boyut) — analiz çıktısı, kişisel veri değil ama analizinle eşleşir.</li>
              <li>IP + tarayıcı bilgisi — abuse koruması (meşru menfaat, Madde 5/2-f).</li>
              <li>Email (opsiyonel) — 28-gün hatırlatma için (açık rıza, opt-in).</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-1">İşleme Amacı</h3>
            <p className="text-xs text-on-surface-variant">
              Yüz fotoğrafın <strong>cilt durumu skorlaması</strong> için Gemini Vision (Google) /
              Claude Vision (Anthropic) API'lerine geçici olarak iletilir. <strong>API yanıtından sonra
              foto silinir</strong> (opt-in ile 30 gün saklama hakkın var). Üçüncü taraflar bu fotoyu
              başka amaçla kullanmaz (Google/Anthropic data-retention policy).
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">Saklama Süresi</h3>
            <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside">
              <li>Foto blob: <strong>varsayılan saklanmaz</strong> (sadece opt-in ile 30 gün).</li>
              <li>Skor + öneri: silme talebine kadar (KVKK Madde 11/e).</li>
              <li>Email (opt-in): opt-out anında <strong>plaintext silinir</strong>, sadece SHA-256 hash kalır.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-1">Haklarınız (Madde 11)</h3>
            <p className="text-xs text-on-surface-variant">
              Veri taşınabilirlik, silme, düzeltme ve itiraz hakkına sahipsin.{' '}
              <Link href="/cilt-analizi/veri-haklarim" className="text-primary hover:underline">
                Veri haklarımı yönet →
              </Link>
            </p>
          </section>

          <div className="space-y-3 pt-2 border-t border-outline-variant/20">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={readDisclosure}
                onChange={(e) => setReadDisclosure(e.target.checked)}
                className="mt-0.5 shrink-0 accent-primary"
              />
              <span className="text-xs text-on-surface">
                Yukarıdaki KVKK <strong>aydınlatma metnini okudum</strong> ve anladım.
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={biometricConsent}
                onChange={(e) => setBiometricConsent(e.target.checked)}
                className="mt-0.5 shrink-0 accent-primary"
              />
              <span className="text-xs text-on-surface">
                Yüz fotoğrafımın <strong>biyometrik veri olarak işlenmesine</strong> açık rıza
                veriyorum (KVKK Madde 6/3). Bu rızayı her zaman geri alabilirim.
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-outline-variant/20 bg-surface-container-lowest">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 text-sm text-on-surface-variant border border-outline-variant/40 rounded-sm px-4 py-3 hover:bg-surface-container-low transition-colors"
          >
            Reddet
          </button>
          <button
            type="button"
            onClick={() => canAccept && onAccept(CONSENT_VERSION)}
            disabled={!canAccept}
            className="flex-1 curator-btn-primary text-sm px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Açık Rıza Ver & Devam
          </button>
        </div>
      </div>
    </div>
  );
}
