'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSearchAutocomplete from './HeroSearchAutocomplete';

/**
 * REVELA Hero — Aceternity ContainerScroll inspired
 *
 * Sayfa scroll'a göre 3D tilt → flat (rotateX 20deg → 0deg, scale 1.05 → 1, translateY 0 → -100)
 * İçinde: mobil cihaz mockup + REVELA scan/tara fonksiyonu showcase
 *
 * Slogan: TARA · ARA · ANALİZ ET (3 step storytelling)
 *
 * Tema: BEYAZ arka plan (light mode default), dark mode auto invert
 */

interface Props {
  stats: { kozmetik: number; takviye: number; icerik: number; marka: number };
}

const SCAN_STEPS = [
  {
    key: 'tara',
    icon: 'qr_code_scanner',
    color: 'text-primary',
    title: 'TARA',
    desc: 'Kameranı ürün barkoduna doğrult — INCI listesini saniyeler içinde çek.',
  },
  {
    key: 'ara',
    icon: 'search',
    color: 'text-primary',
    title: 'ARA',
    desc: 'Ürün adı, marka veya bileşen — autocomplete\'le hızlı bul.',
  },
  {
    key: 'analiz',
    icon: 'science',
    color: 'text-primary',
    title: 'ANALİZ ET',
    desc: 'Bilimsel skor, etkinlik, alerjen, kişisel uyumluluk — tek bakışta.',
  },
];

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
  return `${n}+`;
}

export default function HeroFeatureShowcase({ stats }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // TARA → ARA → ANALİZ ET animated word-morph (her 2sn'de döner).
  useEffect(() => {
    const t = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % SCAN_STEPS.length);
    }, 2000);
    return () => clearTimeout(t);
  }, [activeStep]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const rotate = useTransform(scrollYProgress, [0, 0.6], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], isMobile ? [0.9, 0.95] : [1.04, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-surface text-on-surface overflow-hidden -mt-[57px] sm:-mt-[65px] pt-[57px] sm:pt-[65px]"
    >
      {/* Subtle decorative grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-on-surface) 1px, transparent 1px), linear-gradient(to bottom, var(--color-on-surface) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16">
        {/* Header — slogan + REVELA */}
        <motion.div
          style={{ y: translate }}
          className="text-center max-w-4xl mx-auto mb-8 sm:mb-12"
        >
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 mb-5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              Bilimsel İçerik Analizi
              <span className="material-icon text-yellow-500" style={{ fontSize: '14px' }} aria-hidden="true">
                auto_awesome
              </span>
            </span>
          </div>

          {/* REVELA wordmark */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tighter text-primary leading-[0.9]">
            REVELA
          </h1>

          {/* Slogan: TARA → ARA → ANALİZ ET — animated word-morph */}
          <div className="flex items-center justify-center mt-5 sm:mt-7">
            <span className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight uppercase text-on-surface">
              Bilim destekli
            </span>
            <span className="relative flex justify-start overflow-hidden h-9 sm:h-10 lg:h-12 w-[180px] sm:w-[230px] lg:w-[280px] ml-2 sm:ml-3">
              {SCAN_STEPS.map((step, idx) => (
                <motion.span
                  key={step.key}
                  className="absolute inset-0 flex items-center justify-start gap-1.5 sm:gap-2 font-extrabold uppercase tracking-tight"
                  initial={{ opacity: 0, y: -60 }}
                  transition={{ type: 'spring', stiffness: 60, damping: 12 }}
                  animate={
                    activeStep === idx
                      ? { y: 0, opacity: 1 }
                      : { y: activeStep > idx ? -60 : 60, opacity: 0 }
                  }
                >
                  <span
                    className={`material-icon ${step.color}`}
                    style={{ fontSize: '22px' }}
                    aria-hidden="true"
                  >
                    {step.icon}
                  </span>
                  <span className="text-base sm:text-lg lg:text-xl text-primary">
                    {step.title}
                  </span>
                </motion.span>
              ))}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant mt-5 sm:mt-6 max-w-2xl mx-auto leading-relaxed">
            {formatStat(stats.kozmetik)} kozmetik ve {formatStat(stats.takviye)} takviye ürününü
            SCCS/CIR regülasyonu nezaretinde analiz ediyoruz. Markaların değil, formüllerin konuştuğu platform.
          </p>

          {/* Search */}
          <div className="mt-7 sm:mt-9">
            <HeroSearchAutocomplete />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Link
              href="/cilt-analizi"
              className="curator-btn-primary text-xs px-7 py-3.5 inline-flex items-center justify-center gap-2"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">person_add</span>
              Profilini Oluştur
            </Link>
            <Link
              href="/tara"
              className="curator-btn-outline text-xs px-7 py-3.5 inline-flex items-center justify-center gap-2"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">qr_code_scanner</span>
              Hemen Tara
            </Link>
          </div>
        </motion.div>

        {/* Mobile scan mockup — 3D scroll-tilt frame */}
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            transformPerspective: 1200,
            boxShadow:
              '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
          }}
          className="relative max-w-5xl mx-auto rounded-[28px] sm:rounded-[36px] border-4 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-3 sm:p-5 mt-4"
        >
          <div className="relative h-[420px] sm:h-[560px] lg:h-[640px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-low via-surface to-surface-container-low">
            {/* Mock browser/app bar */}
            <div className="absolute top-0 left-0 right-0 h-9 bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-sm flex items-center gap-2 px-4 border-b border-outline-variant/20 z-20">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 mx-4 bg-surface rounded-full h-5 flex items-center px-3 text-[10px] text-outline">
                <span className="material-icon mr-1" style={{ fontSize: '11px' }} aria-hidden="true">lock</span>
                revela.com.tr/tara
              </div>
            </div>

            {/* Scan demo content */}
            <div className="absolute inset-0 top-9 grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-4 sm:gap-6 p-5 sm:p-7">
              {/* SOL: Ürün + tara overlay */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[200px] aspect-[3/4] bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden">
                  <Image
                    src="https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png"
                    alt="The Ordinary Niacinamide"
                    width={200}
                    height={280}
                    className="w-full h-full object-contain p-4"
                    unoptimized
                  />
                  {/* Scan corners */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-primary" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-primary" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-primary" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-primary" />
                  {/* Scan line */}
                  <div
                    className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                    style={{ animation: 'scan-line 2s ease-in-out infinite' }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="label-caps text-outline text-[9px]">THE ORDINARY</p>
                  <p className="text-sm font-bold text-on-surface">Niacinamide 10% + Zinc 1%</p>
                </div>
              </div>

              {/* SAĞ: 3 modül stack — INCI, Skor, Senin Skorun */}
              <div className="space-y-3 overflow-y-auto pr-1">
                {/* INCI panel */}
                <div className="bg-surface border border-outline-variant/30 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-icon text-primary" style={{ fontSize: '14px' }} aria-hidden="true">
                      science
                    </span>
                    <h3 className="label-caps text-on-surface-variant tracking-[0.18em] text-[10px]">
                      İçerik Listesi (INCI)
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {[
                      { name: 'Niacinamide', band: 'YÜKSEK', color: 'high' },
                      { name: 'Zinc PCA', band: 'ORTA', color: 'medium' },
                      { name: 'Phenoxyethanol', band: 'DÜŞÜK', color: 'low' },
                    ].map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-1.5 bg-surface-container-low rounded-sm px-2 py-1"
                      >
                        <span className="text-[10px] sm:text-[11px] font-medium text-on-surface flex-1 truncate">
                          {c.name}
                        </span>
                        <span
                          className={`label-caps text-[8px] px-1 py-0.5 rounded-sm ${
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
                </div>

                {/* Score panel */}
                <div className="bg-surface border border-outline-variant/30 rounded-lg p-3 shadow-sm flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-surface-container" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-score-high" strokeWidth="2.5" strokeDasharray="83.7 97.4" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-extrabold text-score-high">86</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="label-caps text-on-surface-variant text-[9px] truncate">REVELA Güvenlik Skoru</p>
                    <p className="text-xs font-bold text-score-high">Sınıf A — Çok Güvenli</p>
                    <div className="mt-1 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-score-high rounded-full" style={{ width: '86%' }} />
                    </div>
                  </div>
                </div>

                {/* Personal score */}
                <div className="bg-score-high/5 border border-score-high/30 rounded-lg p-3 shadow-sm">
                  <p className="label-caps text-on-surface-variant text-[9px] flex items-center gap-1">
                    <span className="material-icon" style={{ fontSize: '10px' }} aria-hidden="true">person</span>
                    Senin İhtiyaçlarına Uyumu
                  </p>
                  <p className="text-2xl headline-tight text-score-high mt-0.5">%87</p>
                  <p className="text-[9px] text-on-surface-variant">3 ihtiyacın eşleşti — Yağ Kontrolü %92, Gözenek %88, Cilt Tonu %81</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats strip */}
        <div className="mt-12 sm:mt-16 flex flex-wrap justify-center items-baseline gap-x-6 sm:gap-x-10 gap-y-3 pb-8">
          {[
            { label: 'Kozmetik', value: stats.kozmetik },
            { label: 'Takviye', value: stats.takviye },
            { label: 'İçerik', value: stats.icerik },
            { label: 'Marka', value: stats.marka },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-on-surface">
                {formatStat(s.value)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-outline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% { top: 12px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: calc(100% - 12px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
