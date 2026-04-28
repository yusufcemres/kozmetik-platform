'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * REVELA Trust Hero — Glassmorphism pattern (referans: 21st.dev glassmorphism-trust-hero)
 *
 * Layout:
 *   SOL (7/12)  — Badge + Big wordmark + tagline + description + 2 CTA
 *   SAĞ (5/12)  — 2 glass card stacked:
 *                  1) Stats card: 1900+ kozmetik + 98% şeffaflık + 4 mini stats + tag pills
 *                  2) "Doğrulanan Otoriteler" marquee: SCCS, CIR, EU 1223, INCI, FDA, NSF
 *
 * Background:
 *   - Ink Blue base (#0E1722)
 *   - Faded ingredient/molecule pattern overlay
 *   - Top→bottom mask gradient (fade in + out)
 *
 * Animation:
 *   - fadeSlideIn (cascade with delays)
 *   - marquee (continuous horizontal scroll)
 *   - active pulse dot
 */

interface Props {
  stats: { kozmetik: number; takviye: number; icerik: number; marka: number };
}

const AUTHORITIES = [
  { code: 'SCCS', label: 'EU Scientific Committee' },
  { code: 'CIR', label: 'Cosmetic Ingredient Review' },
  { code: 'EU 1223', label: 'AB Kozmetik Regülasyonu' },
  { code: 'INCI', label: 'Decoder Database' },
  { code: 'FDA', label: 'US Drug Administration' },
  { code: 'NSF', label: 'Public Health Standards' },
];

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
  return `${n}+`;
}

export default function HeroTrust({ stats }: Props) {
  const cleanPct = 98; // Şeffaflık skoru ortalaması (placeholder — DB aggregate ile gelir)

  return (
    <div className="relative w-full overflow-hidden bg-[#0E1722] text-white font-sans -mt-[57px] sm:-mt-[65px] pt-[57px] sm:pt-[65px]">
      {/* Scoped animations */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        :global(.hero-fade-in) {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        :global(.hero-marquee) {
          animation: marquee 50s linear infinite;
        }
        :global(.hero-delay-100) { animation-delay: 0.1s; }
        :global(.hero-delay-200) { animation-delay: 0.2s; }
        :global(.hero-delay-300) { animation-delay: 0.3s; }
        :global(.hero-delay-400) { animation-delay: 0.4s; }
        :global(.hero-delay-500) { animation-delay: 0.5s; }
      `}</style>

      {/* Background: subtle radial gradient + R icon watermark */}
      <div
        className="absolute inset-0 z-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 75% 30%, rgba(165, 184, 208, 0.35) 0%, transparent 55%), radial-gradient(circle at 25% 80%, rgba(27, 45, 69, 0.6) 0%, transparent 50%)',
          maskImage: 'linear-gradient(180deg, transparent, black 5%, black 75%, transparent)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, black 5%, black 75%, transparent)',
        }}
      />
      {/* Faded REVELA R icon center-back */}
      <div
        className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.04] pointer-events-none"
        aria-hidden="true"
      >
        <Image
          src="/revela-icon.png"
          alt=""
          width={600}
          height={600}
          className="w-[60vw] max-w-[600px] h-auto"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-12 sm:px-6 md:pt-28 md:pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          {/* === SOL KOLON === */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-7 pt-4">
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

            {/* Wordmark + heading */}
            <div className="hero-fade-in hero-delay-200">
              <h1
                className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tighter leading-[0.9] text-white"
                style={{
                  maskImage:
                    'linear-gradient(180deg, white 0%, white 85%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(180deg, white 0%, white 85%, transparent 100%)',
                }}
              >
                REVELA
              </h1>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-zinc-500 mt-3">
                Kozmetik · Takviye · Bakım Analizi
              </p>
            </div>

            {/* Tagline */}
            <p className="hero-fade-in hero-delay-300 max-w-xl text-xl lg:text-2xl text-white/90 leading-snug font-medium">
              Markaların değil, formüllerin konuştuğu platform.
            </p>

            {/* Description */}
            <p className="hero-fade-in hero-delay-300 max-w-xl text-base text-zinc-400 leading-relaxed">
              {formatStat(stats.kozmetik)} kozmetik ve {formatStat(stats.takviye)} takviye ürününün INCI içeriğini SCCS/CIR
              regülasyonu nezaretinde analiz ediyoruz. Bilimsel skor, etken madde etkinliği, alerjen yükü ve senin profiline uyum — tek platformda.
            </p>

            {/* CTAs */}
            <div className="hero-fade-in hero-delay-400 flex flex-col sm:flex-row gap-4">
              <Link
                href="/cilt-analizi"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
              >
                Profilini Oluştur
                <span
                  className="material-icon transition-transform group-hover:translate-x-1"
                  style={{ fontSize: '18px' }}
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </Link>

              <Link
                href="#nasil-calisir"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/20"
              >
                <span className="material-icon" style={{ fontSize: '18px' }} aria-hidden="true">
                  play_circle
                </span>
                Nasıl Çalışır?
              </Link>
            </div>

            {/* Quick search teaser */}
            <form action="/ara" className="hero-fade-in hero-delay-500 max-w-xl pt-2">
              <div className="relative">
                <span
                  className="material-icon text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2"
                  style={{ fontSize: '20px' }}
                  aria-hidden="true"
                >
                  search
                </span>
                <input
                  type="text"
                  name="q"
                  placeholder="Ürün, marka veya içerik ara..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-14 pr-5 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all backdrop-blur-md"
                />
              </div>
            </form>
          </div>

          {/* === SAĞ KOLON === */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">
            {/* === Stats Card === */}
            <div className="hero-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
              {/* Glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <span
                      className="material-icon text-white"
                      style={{ fontSize: '24px' }}
                      aria-hidden="true"
                    >
                      science
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">
                      {formatStat(stats.kozmetik + stats.takviye)}
                    </div>
                    <div className="text-sm text-zinc-400">Analiz Edilmiş Ürün</div>
                  </div>
                </div>

                {/* Şeffaflık skoru */}
                <div className="space-y-3 mb-7">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Şeffaflık Skoru</span>
                    <span className="text-white font-medium">%{cleanPct}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-white to-zinc-400"
                      style={{ width: `${cleanPct}%` }}
                    />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                {/* Mini stats grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white">{formatStat(stats.icerik)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">İçerik</span>
                  </div>
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white">{formatStat(stats.marka)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Marka</span>
                  </div>
                </div>

                {/* Tag pills */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    DAİLY UPDATE
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span className="material-icon text-yellow-500" style={{ fontSize: '12px' }} aria-hidden="true">
                      verified
                    </span>
                    SCCS VERIFIED
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span className="material-icon text-blue-400" style={{ fontSize: '12px' }} aria-hidden="true">
                      shield
                    </span>
                    INDEPENDENT
                  </div>
                </div>
              </div>
            </div>

            {/* === Authority Marquee Card === */}
            <div className="hero-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-zinc-400">
                Doğrulanan Otoriteler
              </h3>

              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage:
                    'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                }}
              >
                <div className="hero-marquee flex gap-10 whitespace-nowrap px-4">
                  {[...AUTHORITIES, ...AUTHORITIES, ...AUTHORITIES].map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-default"
                      title={a.label}
                    >
                      <span
                        className="material-icon text-white"
                        style={{ fontSize: '20px' }}
                        aria-hidden="true"
                      >
                        verified
                      </span>
                      <span className="text-base font-bold text-white tracking-tight">
                        {a.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
