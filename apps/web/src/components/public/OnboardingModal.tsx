'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * İlk ziyarette gösterilir — 6 sayfalık tanıtım flow.
 * localStorage'da 'revela_onboarding_seen' flag'ı varsa render etmez.
 *
 * Mobile: full-screen
 * Desktop: modal overlay 480x720
 *
 * Tasarım Oasis app onboarding pattern'inden esinlendi:
 * Welcome → INCI analizi → REVELA Skoru → Senin profilin → İstatistikler → Trust → Get Started
 */

const STEPS = [
  {
    key: 'welcome',
    icon: 'auto_awesome',
    title: 'REVELA\'ya Hoşgeldin',
    description: 'Kozmetik ve takviyelerin gerçek içeriğini bilimsel kanıtlarla gösteriyoruz. Markaların değil, formüllerin konuştuğu platform.',
    visual: 'logo',
  },
  {
    key: 'inci',
    icon: 'science',
    title: 'INCI içeriği analiz ediyoruz',
    description: 'Her ürünün tüm bileşenlerini, konsantrasyonlarını ve güvenlik flag\'lerini gözüne seriyoruz. Endokrin bozucu, alerjen, parfüm — hepsi işaretli.',
    visual: 'inci-cards',
  },
  {
    key: 'score',
    icon: 'shield',
    title: 'REVELA Güvenlik Skoru',
    description: 'CIR/SCCS sınıflandırma, AB regülasyonu, alerjen yükü ve aktif madde etkinliğine göre 1-100 arası bilimsel kanıtlı skor.',
    visual: 'score-card',
  },
  {
    key: 'personal',
    icon: 'person',
    title: 'Sana özel uyumluluk',
    description: 'Kısa bir profil oluştur — cilt tipin, ihtiyaçların, hassasiyetlerin. Her ürünün senin için ne kadar uygun olduğunu hesaplıyoruz.',
    visual: 'profile-card',
  },
  {
    key: 'discover',
    icon: 'explore',
    title: '1500+ ürün, 113 marka',
    description: 'Kozmetik, takviye, INCI ansiklopedisi, ihtiyaç rehberleri. Filtre, karşılaştırma ve AI arama hazır.',
    visual: 'stats-grid',
  },
  {
    key: 'trust',
    icon: 'verified',
    title: 'Bağımsız ve şeffaf',
    description: 'Marka iş ortaklığı yok. Skorlama metodolojimiz public, kaynaklarımız (SCCS, CIR, peer-reviewed) referans verilmiş. Affiliate transparancy beyanlı.',
    visual: 'trust-badges',
  },
] as const;

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
      <div className="w-full max-w-[480px] h-full sm:h-auto sm:max-h-[calc(100vh-3rem)] bg-surface rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header — progress + close */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
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
        <div className="flex-1 px-6 py-8 sm:py-10 flex flex-col items-center justify-center text-center overflow-y-auto">
          {/* Visual */}
          <div className="mb-7 sm:mb-9 w-full max-w-[300px]">
            {current.visual === 'logo' && (
              <div className="flex flex-col items-center gap-4">
                <Image
                  src="/revela-icon.png"
                  alt=""
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain"
                />
                <p className="text-3xl font-extrabold tracking-tight text-primary">REVELA</p>
              </div>
            )}

            {current.visual === 'inci-cards' && (
              <div className="space-y-1.5 text-left">
                {[
                  { name: 'Niacinamide', band: 'YÜKSEK', color: 'high' },
                  { name: 'Salicylic Acid', band: 'ORTA', color: 'medium', warn: true },
                  { name: 'Phenoxyethanol', band: 'DÜŞÜK', color: 'low' },
                  { name: 'Parfum', band: 'ORTA', color: 'medium', warn: true },
                ].map((c) => (
                  <div
                    key={c.name}
                    className={`flex items-center gap-2 bg-surface-container-low border rounded-sm px-3 py-2 ${
                      c.warn ? 'border-error/40' : 'border-outline-variant/15'
                    }`}
                  >
                    {c.warn && (
                      <span className="material-icon text-error text-[14px]" aria-hidden="true">
                        warning
                      </span>
                    )}
                    <span className="text-sm font-medium text-on-surface flex-1">{c.name}</span>
                    <span
                      className={`label-caps text-[9px] px-1.5 py-0.5 rounded-sm ${
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
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-surface-container" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-score-high" strokeWidth="2.5" strokeDasharray="83.7 97.4" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-score-high">86</span>
                      <span className="text-[10px] text-outline">A</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-score-high">Sınıf A</p>
                    <p className="text-xs text-on-surface-variant">Çok Güvenli</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Aktif Etkinlik', value: 92 },
                    { label: 'Güvenlik Sınıfı', value: 88 },
                    { label: 'Şeffaflık', value: 75 },
                  ].map((bar) => (
                    <div key={bar.label} className="flex items-center gap-2">
                      <span className="w-24 text-[11px] font-medium text-on-surface truncate">{bar.label}</span>
                      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-score-high rounded-full" style={{ width: `${bar.value}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-on-surface tabular-nums w-7 text-right">{bar.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {current.visual === 'profile-card' && (
              <div className="curator-card p-5 text-left">
                <p className="label-caps text-on-surface-variant mb-2 text-[10px]">Senin Profilin</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Yağlı cilt', 'Akneye yatkın', 'Hassasiyet', 'Anti-aging'].map((c) => (
                    <span key={c} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-medium">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="rounded-md border border-score-high/30 bg-score-high/5 p-3">
                  <p className="label-caps text-on-surface-variant text-[9px]">Bu ürüne uyumun</p>
                  <p className="text-3xl headline-tight text-score-high mt-0.5">%87</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">3 ihtiyacın eşleşti</p>
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
                    <span className="material-icon text-primary text-[20px]" aria-hidden="true">{s.icon}</span>
                    <p className="text-xl font-extrabold text-on-surface mt-1">{s.value}</p>
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
                  { icon: 'campaign', text: 'Affiliate transparancy beyanı' },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-3 bg-surface-container-low rounded-md px-3 py-2.5 text-left">
                    <span className="material-icon text-primary text-[18px] shrink-0" aria-hidden="true">{b.icon}</span>
                    <span className="text-sm text-on-surface">{b.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title + description */}
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icon text-primary text-[20px]" aria-hidden="true">{current.icon}</span>
            <h2 id="onboarding-title" className="text-xl sm:text-2xl headline-tight text-on-surface">
              {current.title}
            </h2>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-[360px]">
            {current.description}
          </p>
        </div>

        {/* Footer — navigation */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-outline-variant/15">
          <button
            onClick={step === 0 ? close : prev}
            className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2"
          >
            {step === 0 ? 'Geç' : 'Geri'}
          </button>
          {isLast ? (
            <Link
              href="/cilt-analizi"
              onClick={close}
              className="curator-btn-primary text-xs px-6 py-3 inline-flex items-center gap-2"
            >
              <span>Profilini Oluştur</span>
              <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
            </Link>
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
    </div>
  );
}
