'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * İlk ziyarette gösterilir — 7 sayfalık tanıtım flow.
 * localStorage'da 'revela_onboarding_seen' flag'ı varsa render etmez.
 *
 * Mobile: full-screen
 * Desktop: modal overlay 640px (büyütüldü)
 *
 * Flow: Welcome → INCI → Skor → QR Tara → Profil → İstatistik → Trust → CTA
 * Son ekranda "Atla" + "Profilini Oluştur" yan yana — profil zorunlu değil.
 */

type OnboardingStep = {
  key: string;
  icon: string;
  title: string;
  description: string;
  visual:
    | 'logo'
    | 'inci-cards'
    | 'score-card'
    | 'qr-scan'
    | 'profile-card'
    | 'stats-grid'
    | 'trust-badges';
};

const STEPS: OnboardingStep[] = [
  {
    key: 'welcome',
    icon: 'auto_awesome',
    title: "REVELA'ya hoş geldin",
    description:
      'Kozmetik ve takviyelerin gerçek formülünü bilimsel kanıtlarla gösteriyoruz. Markaların değil, içeriklerin konuştuğu platform.',
    visual: 'logo',
  },
  {
    key: 'inci',
    icon: 'science',
    title: 'INCI artık şifre değil',
    description:
      'Her ürünün tüm bileşenlerini, tahmini konsantrasyonlarını ve risk flag\'lerini açıkça gösteriyoruz. Endokrin bozucu, alerjen, parfüm — hepsi kırmızı.',
    visual: 'inci-cards',
  },
  {
    key: 'score',
    icon: 'shield',
    title: 'Tek skor, tüm gerçek',
    description:
      'CIR/SCCS sınıflandırma, AB regülasyonu, alerjen yükü ve aktif madde etkinliğine göre 0-100 arası bilimsel skor. Sınıf A=Çok Güvenli, F=Riskli.',
    visual: 'score-card',
  },
  {
    key: 'qr',
    icon: 'qr_code_scanner',
    title: 'Barkodu tara, anında analiz',
    description:
      'Mağazadayken kamerayla ürün barkodunu çek — INCI listesi, REVELA Skoru ve sana özel uyumluluk saniyeler içinde ekranında.',
    visual: 'qr-scan',
  },
  {
    key: 'personal',
    icon: 'person',
    title: 'Senin profilin, senin önerin',
    description:
      'Kısa bir cilt analiziyle profilini oluştur — cilt tipi, ihtiyaçlar, hassasiyetler. Her ürünün senin için ne kadar uygun olduğunu hesaplıyoruz.',
    visual: 'profile-card',
  },
  {
    key: 'discover',
    icon: 'explore',
    title: 'Geniş veritabanı',
    description:
      '1.9K+ kozmetik · 283+ takviye · 5.1K+ içerik ansiklopedisi · 113+ marka. Filtre, karşılaştırma, AI arama ve ihtiyaç rehberleri hazır.',
    visual: 'stats-grid',
  },
  {
    key: 'trust',
    icon: 'verified',
    title: 'Bağımsız bilim, açık kaynak',
    description:
      'Marka iş ortaklığı yok. Skorlama metodolojimiz public, kaynaklarımız (SCCS, CIR, peer-reviewed) referans verilmiş. Affiliate transparency beyanlı.',
    visual: 'trust-badges',
  },
];

const STORAGE_KEY = 'revela_onboarding_seen';

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        const t = setTimeout(() => setOpen(true), 1500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      close();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/60 backdrop-blur-sm p-0 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-[640px] h-full sm:h-auto sm:max-h-[calc(100vh-3rem)] bg-surface rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header — progress + close */}
        <div className="flex items-center gap-3 px-6 sm:px-8 pt-6 pb-3">
          <div className="flex items-center gap-1.5 flex-1">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 transition-all duration-300 rounded-full ${
                  idx === step
                    ? 'flex-1 bg-primary'
                    : idx < step
                      ? 'w-3 bg-primary/50'
                      : 'w-3 bg-outline-variant'
                }`}
              />
            ))}
          </div>
          <button
            onClick={close}
            className="text-outline hover:text-on-surface transition-colors shrink-0"
            aria-label="Kapat"
          >
            <span className="material-icon" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 sm:px-8 py-6 sm:py-10 flex flex-col items-center justify-center text-center overflow-y-auto">
          {/* Visual */}
          <div className="mb-7 sm:mb-9 w-full max-w-[420px]">
            {current.visual === 'logo' && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Image
                    src="/revela-icon.png"
                    alt=""
                    width={128}
                    height={128}
                    className="w-32 h-32 object-contain"
                  />
                  <span className="absolute -right-2 -top-2 material-icon text-yellow-500 animate-pulse" style={{ fontSize: '24px' }} aria-hidden="true">
                    auto_awesome
                  </span>
                </div>
                <p className="text-4xl font-extrabold tracking-tighter text-primary">REVELA</p>
                <p className="label-caps text-on-surface-variant text-[10px]">Bilimsel İçerik Analizi</p>
              </div>
            )}

            {current.visual === 'inci-cards' && (
              <div className="space-y-1.5 text-left">
                {[
                  { name: 'Niacinamide', band: 'YÜKSEK', color: 'high', critical: false, allergen: false },
                  { name: 'Salicylic Acid', band: 'ORTA', color: 'medium', critical: false, allergen: false },
                  { name: 'Ethylhexyl Methoxycinnamate', band: 'YÜKSEK', color: 'high', critical: true, allergen: false },
                  { name: 'Phenoxyethanol', band: 'DÜŞÜK', color: 'low', critical: false, allergen: false },
                  { name: 'Parfum', band: 'ORTA', color: 'medium', critical: false, allergen: true, fragrance: true },
                ].map((c) => (
                  <div
                    key={c.name}
                    className={`flex items-center gap-2 bg-surface-container-low border-2 rounded-md px-3 py-2 ${
                      c.critical || c.allergen ? 'border-error' : 'border-outline-variant/15'
                    }`}
                  >
                    {(c.critical || c.allergen) && (
                      <span className="material-icon text-error text-[14px] shrink-0" aria-hidden="true">
                        warning
                      </span>
                    )}
                    <span className="text-sm font-medium text-on-surface flex-1 truncate">{c.name}</span>
                    {c.critical && (
                      <span className="label-caps text-[9px] bg-error text-on-error px-1.5 py-0.5 rounded-sm font-bold shrink-0">
                        UYARI
                      </span>
                    )}
                    {c.allergen && (
                      <span className="label-caps text-[9px] bg-error/10 text-error border border-error/30 px-1.5 py-0.5 rounded-sm shrink-0">
                        {c.fragrance ? 'PARFÜM·ALERJEN' : 'ALERJEN'}
                      </span>
                    )}
                    <span
                      className={`label-caps text-[9px] px-1.5 py-0.5 rounded-sm shrink-0 ${
                        c.color === 'high'
                          ? 'bg-score-high-bg text-score-high'
                          : c.color === 'medium'
                            ? 'bg-score-medium-bg text-score-medium'
                            : 'bg-surface-container text-outline'
                      }`}
                    >
                      {c.band}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {current.visual === 'score-card' && (
              <div className="curator-card p-5 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-surface-container" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-score-high" strokeWidth="2.5" strokeDasharray="83.7 97.4" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-score-high">86</span>
                      <span className="text-[11px] text-outline">A</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-bold text-score-high">Sınıf A · Çok Güvenli</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">CIR/SCCS · AB Annex II uyumlu</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Aktif Etkinlik', value: 92, color: 'high' },
                    { label: 'Güvenlik Sınıfı', value: 88, color: 'high' },
                    { label: 'Alerjen Yükü', value: 78, color: 'high' },
                    { label: 'Şeffaflık', value: 75, color: 'high' },
                    { label: 'Konsantrasyon', value: 60, color: 'medium' },
                  ].map((bar) => (
                    <div key={bar.label} className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-medium text-on-surface truncate">{bar.label}</span>
                      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bar.color === 'high' ? 'bg-score-high' : 'bg-score-medium'}`} style={{ width: `${bar.value}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-on-surface tabular-nums w-7 text-right">{bar.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {current.visual === 'qr-scan' && (
              <div className="flex flex-col items-center gap-3">
                {/* Mobil cihaz mockup */}
                <div className="relative w-[200px] h-[280px] bg-on-surface rounded-[28px] p-2 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-on-surface rounded-b-lg z-10" />
                  {/* Screen */}
                  <div className="relative w-full h-full bg-surface rounded-[20px] overflow-hidden">
                    {/* Camera viewport */}
                    <div className="relative w-full h-[170px] bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 overflow-hidden">
                      {/* Scan corners */}
                      <span className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl" />
                      <span className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr" />
                      <span className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl" />
                      <span className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br" />
                      {/* Animated scan line */}
                      <div
                        className="absolute left-6 right-6 h-0.5 bg-primary shadow-[0_0_8px_var(--color-primary)]"
                        style={{ animation: 'scanline 2s ease-in-out infinite', top: '50%' }}
                      />
                      {/* QR code mock */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <span className="material-icon text-white" style={{ fontSize: '48px' }} aria-hidden="true">qr_code_2</span>
                      </div>
                    </div>
                    {/* Result preview */}
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-wider text-outline">Bulundu</p>
                      <p className="text-xs font-bold text-on-surface mt-0.5 truncate">CeraVe Daily Moisturizer</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[10px] font-extrabold text-score-high">86</span>
                        <span className="text-[9px] text-outline">/A</span>
                        <span className="ml-auto text-[9px] text-on-surface-variant">19 madde</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-outline">Kamerayı barkoda doğrult — gerisi bizde</p>
              </div>
            )}

            {current.visual === 'profile-card' && (
              <div className="curator-card p-5 text-left">
                <p className="label-caps text-on-surface-variant mb-2 text-[10px]">Senin Profilin</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Yağlı cilt', 'Akneye yatkın', 'Hassasiyet', 'Anti-aging', 'Leke', 'Bariyer'].map((c) => (
                    <span key={c} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-medium">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="rounded-md border border-score-high/30 bg-score-high/5 p-4">
                  <p className="label-caps text-on-surface-variant text-[9px]">Bu ürüne uyumun</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <p className="text-4xl headline-tight text-score-high">%87</p>
                    <p className="text-xs text-score-high font-semibold">Çok Uyumlu</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {['Akne', 'Sebum', 'Bariyer'].map((n) => (
                      <span key={n} className="text-[9px] bg-score-high/15 text-score-high px-1.5 py-0.5 rounded-sm font-medium">
                        ✓ {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {current.visual === 'stats-grid' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '1.9K+', label: 'Kozmetik', icon: 'palette' },
                  { value: '283+', label: 'Takviye', icon: 'medication' },
                  { value: '5.1K+', label: 'İçerik', icon: 'science' },
                  { value: '113+', label: 'Marka', icon: 'storefront' },
                ].map((s) => (
                  <div key={s.label} className="curator-card p-4 text-center">
                    <span className="material-icon text-primary text-[24px]" aria-hidden="true">{s.icon}</span>
                    <p className="text-2xl font-extrabold text-on-surface mt-1">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-outline mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {current.visual === 'trust-badges' && (
              <div className="space-y-2">
                {[
                  { icon: 'gavel', text: 'AB SCCS regülasyon takipli' },
                  { icon: 'school', text: 'Peer-reviewed kaynaklar' },
                  { icon: 'visibility', text: 'Açık metodoloji + skorlama' },
                  { icon: 'campaign', text: 'Affiliate transparency beyanı' },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-3 bg-surface-container-low rounded-md px-3 py-2.5 text-left">
                    <span className="material-icon text-primary text-[20px] shrink-0" aria-hidden="true">{b.icon}</span>
                    <span className="text-sm text-on-surface">{b.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title + description */}
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icon text-primary text-[22px]" aria-hidden="true">{current.icon}</span>
            <h2 id="onboarding-title" className="text-2xl sm:text-3xl headline-tight text-on-surface">
              {current.title}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-[440px]">
            {current.description}
          </p>
        </div>

        {/* Footer — navigation */}
        <div className="px-6 sm:px-8 pb-6 pt-3 flex items-center justify-between gap-3 border-t border-outline-variant/15">
          <button
            onClick={step === 0 ? close : prev}
            className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2"
          >
            {step === 0 ? 'Geç' : 'Geri'}
          </button>
          {isLast ? (
            <div className="flex items-center gap-2">
              {/* Atla — profil oluşturmadan kapat */}
              <button
                onClick={close}
                className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors px-4 py-3 rounded-sm border border-outline-variant/40 hover:bg-surface-container-low"
              >
                Atla
              </button>
              <Link
                href="/cilt-analizi"
                onClick={close}
                className="curator-btn-primary text-xs px-6 py-3 inline-flex items-center gap-2"
              >
                <span>Profilini Oluştur</span>
                <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={next}
              className="curator-btn-primary text-xs px-6 py-3 inline-flex items-center gap-2"
            >
              <span>{step === STEPS.length - 2 ? 'Devam' : 'İleri'}</span>
              <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* Scan line keyframe */}
      <style jsx>{`
        @keyframes scanline {
          0% { top: 15%; opacity: 0.3; }
          50% { top: 75%; opacity: 1; }
          100% { top: 15%; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
