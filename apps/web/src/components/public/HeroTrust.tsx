'use client';

import Link from 'next/link';
import HeroSearchAutocomplete from './HeroSearchAutocomplete';
import HeroScanAnimation from './HeroScanAnimation';

/**
 * REVELA Hero — bilgi-yoğun trust hero
 *
 * Layout (lg):
 *   SOL (7/12)  — Badge → REVELA wordmark → tagline → description → BÜYÜK ARAMA + AUTOCOMPLETE → 2 CTA
 *   SAĞ (5/12)  — HeroScanAnimation (3-sahne: INCI tarama + Güvenlik Skoru + Senin Skorun)
 *
 * Background: Ink Blue solid + radial gradient mask (R watermark kaldırıldı — gerçek scan demo göründüğü için decorative gerekmiyor)
 *
 * Trust strip: alt çizgi şeklinde stats + otorite marquee compact
 */

interface Props {
  stats: { kozmetik: number; takviye: number; icerik: number; marka: number };
}

const AUTHORITIES = ['SCCS', 'CIR', 'EU 1223', 'INCI Decoder', 'FDA', 'NSF'];

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
  return `${n}+`;
}

export default function HeroTrust({ stats }: Props) {
  return (
    <div className="relative w-full overflow-hidden bg-[#0E1722] text-white font-sans -mt-[57px] sm:-mt-[65px] pt-[57px] sm:pt-[65px]">
      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        :global(.hero-fade-in) { animation: fadeSlideIn 0.8s ease-out forwards; opacity: 0; }
        :global(.hero-marquee) { animation: marquee 50s linear infinite; }
        :global(.hero-delay-100) { animation-delay: 0.1s; }
        :global(.hero-delay-200) { animation-delay: 0.2s; }
        :global(.hero-delay-300) { animation-delay: 0.3s; }
        :global(.hero-delay-400) { animation-delay: 0.4s; }
        :global(.hero-delay-500) { animation-delay: 0.5s; }
      `}</style>

      {/* Background gradient — decorative R watermark kaldırıldı */}
      <div
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 30%, rgba(165, 184, 208, 0.18) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(27, 45, 69, 0.5) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10 items-center">
          {/* === SOL KOLON: 7/12 === */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Trust badge */}
            <div className="hero-fade-in hero-delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  Bilimsel İçerik Analizi
                  <span className="material-icon text-yellow-400" style={{ fontSize: '14px' }} aria-hidden="true">
                    auto_awesome
                  </span>
                </span>
              </div>
            </div>

            {/* Wordmark */}
            <div className="hero-fade-in hero-delay-200">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter leading-[0.9] text-white">
                REVELA
              </h1>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-zinc-500 mt-3">
                Kozmetik · Takviye · Bakım Analizi
              </p>
            </div>

            {/* Tagline + description */}
            <div className="hero-fade-in hero-delay-300 space-y-2">
              <p className="text-lg sm:text-xl lg:text-2xl text-white/95 leading-snug font-medium max-w-xl">
                Markaların değil, formüllerin konuştuğu platform.
              </p>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                {formatStat(stats.kozmetik)} kozmetik ve {formatStat(stats.takviye)} takviye ürününü SCCS/CIR
                regülasyonu nezaretinde analiz ediyoruz. Senin profiline uyum — tek platformda.
              </p>
            </div>

            {/* SEARCH — autocomplete */}
            <div className="hero-fade-in hero-delay-400 pt-2">
              <HeroSearchAutocomplete />
            </div>

            {/* CTAs */}
            <div className="hero-fade-in hero-delay-500 flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/cilt-analizi"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
              >
                <span className="material-icon" style={{ fontSize: '16px' }} aria-hidden="true">person_add</span>
                Profilini Oluştur
                <span
                  className="material-icon transition-transform group-hover:translate-x-1"
                  style={{ fontSize: '16px' }}
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </Link>
              <Link
                href="#nasil-calisir"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-colors"
              >
                <span className="material-icon" style={{ fontSize: '16px' }} aria-hidden="true">play_circle</span>
                Nasıl Çalışır?
              </Link>
            </div>
          </div>

          {/* === SAĞ KOLON: 5/12 — info-rich scan animation === */}
          <div className="lg:col-span-5 hero-fade-in hero-delay-300">
            <div className="[&_.curator-card]:bg-zinc-900/80 [&_.curator-card]:border-white/10 [&_.curator-card]:backdrop-blur-xl">
              <HeroScanAnimation />
            </div>
          </div>
        </div>

        {/* === Trust strip: stats + authority marquee === */}
        <div className="hero-fade-in hero-delay-500 mt-12 sm:mt-16 pt-7 border-t border-white/10 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-7 lg:gap-10 items-center">
          {/* Stats */}
          <div className="flex flex-wrap justify-center lg:justify-start items-baseline gap-x-6 sm:gap-x-8 gap-y-2">
            {[
              { label: 'Kozmetik', value: stats.kozmetik },
              { label: 'Takviye', value: stats.takviye },
              { label: 'İçerik', value: stats.icerik },
              { label: 'Marka', value: stats.marka },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  {formatStat(s.value)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Authorities marquee */}
          <div className="relative overflow-hidden">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 text-center lg:text-left">
              Doğrulanan Otoriteler
            </p>
            <div
              className="relative flex overflow-hidden"
              style={{
                maskImage:
                  'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              }}
            >
              <div className="hero-marquee flex gap-7 whitespace-nowrap">
                {[...AUTHORITIES, ...AUTHORITIES, ...AUTHORITIES].map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default shrink-0"
                  >
                    <span className="material-icon text-white" style={{ fontSize: '14px' }} aria-hidden="true">
                      verified
                    </span>
                    <span className="text-sm font-bold text-white tracking-tight">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
