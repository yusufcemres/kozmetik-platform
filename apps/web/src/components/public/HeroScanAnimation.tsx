'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Homepage hero animasyonu — 3 sahne arasında otomatik geçiş.
 * Real product + INCI/score data overlay'i — REVELA platformunun yaptığını anlatır.
 *
 * Sahneler:
 *  1) INCI taraması — bileşenler ve konsantrasyonlar
 *  2) REVELA Güvenlik Skoru — bar breakdown
 *  3) Senin İhtiyaçlarına Uyumu — matched needs
 *
 * Data: hardcoded showcase (The Ordinary Niacinamide / CeraVe / BoJ — gerçek değerler).
 * Image source: theordinary.com CDN (whitelist'e eklendi next.config.js'te)
 */

const SCENES = [
  {
    key: 'inci',
    productName: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    image: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png',
    label: 'İçerik Listesi (INCI)',
    icon: 'science',
    chips: [
      { name: 'Niacinamide', band: 'YÜKSEK', color: 'high' },
      { name: 'Zinc PCA', band: 'ORTA', color: 'medium' },
      { name: 'Pentylene Glycol', band: 'YÜKSEK', color: 'high' },
      { name: 'Phenoxyethanol', band: 'DÜŞÜK', color: 'low' },
      { name: 'Chlorphenesin', band: 'ESER', color: 'low' },
    ],
    footer: '11 madde analiz edildi · %100 temiz içerik',
  },
  {
    key: 'safety',
    productName: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    image: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png',
    label: 'REVELA Güvenlik Skoru',
    icon: 'shield',
    score: 86,
    grade: 'A',
    bars: [
      { label: 'Aktif Etkinlik', value: 92 },
      { label: 'Güvenlik Sınıfı', value: 88 },
      { label: 'Konsantrasyon', value: 80 },
      { label: 'Etkileşim', value: 95 },
      { label: 'Şeffaflık', value: 75 },
    ],
    footer: 'CIR/SCCS sınıflandırma — CMR/endokrin/EU yasaklı flag yok',
  },
  {
    key: 'personal',
    productName: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    image: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png',
    label: 'Senin İhtiyaçlarına Uyumu',
    icon: 'person',
    personalScore: 87,
    needs: [
      { name: 'Yağ Kontrolü', score: 92 },
      { name: 'Gözenek Sıkılaştırma', score: 88 },
      { name: 'Cilt Tonu Eşitleme', score: 81 },
    ],
    profile: ['Yağlı cilt', 'Akneye yatkın', 'Hassasiyet'],
    footer: '3 ihtiyacın eşleşti — kişisel skoru gör',
  },
] as const;

const SCENE_DURATION = 5000;

export default function HeroScanAnimation() {
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % SCENES.length);
    }, SCENE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[420px] mx-auto select-none">
      {/* Phone-like frame */}
      <div className="relative aspect-[9/16] sm:aspect-[10/14] curator-card overflow-hidden bg-surface-container-low p-3 sm:p-4">
        {SCENES.map((scene, idx) => (
          <div
            key={scene.key}
            className={`absolute inset-0 p-3 sm:p-4 transition-all duration-700 ease-out ${
              idx === activeScene
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            aria-hidden={idx !== activeScene}
          >
            {/* Product image (top half) */}
            <div className="relative w-full h-[42%] flex items-center justify-center bg-surface-container-lowest rounded-md overflow-hidden mb-3">
              <Image
                src={scene.image}
                alt={scene.productName}
                width={200}
                height={200}
                className="w-auto h-[85%] object-contain"
                unoptimized
              />
              {/* Brand + name overlay */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="label-caps text-outline text-[8px] sm:text-[9px]">{scene.brand}</p>
                <p className="text-xs sm:text-sm font-bold text-on-surface leading-tight">
                  {scene.productName}
                </p>
              </div>
            </div>

            {/* Section label */}
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="material-icon text-primary text-[14px] sm:text-[16px]"
                aria-hidden="true"
              >
                {scene.icon}
              </span>
              <h3 className="label-caps text-on-surface-variant tracking-[0.18em] text-[10px] sm:text-xs">
                {scene.label}
              </h3>
            </div>

            {/* Scene 1 — INCI chips */}
            {scene.key === 'inci' && 'chips' in scene && (
              <div className="space-y-1.5">
                {scene.chips.map((chip, i) => (
                  <div
                    key={chip.name}
                    className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/15 rounded-sm px-2 py-1.5 animate-slide-up"
                    style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards' }}
                  >
                    <span className="text-xs font-medium text-on-surface flex-1 truncate">
                      {chip.name}
                    </span>
                    <span
                      className={`label-caps text-[9px] px-1.5 py-0.5 rounded-sm shrink-0 ${
                        chip.color === 'high'
                          ? 'bg-score-high-bg text-score-high'
                          : chip.color === 'medium'
                            ? 'bg-score-medium-bg text-score-medium'
                            : 'bg-surface-container text-outline'
                      }`}
                    >
                      {chip.band}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Scene 2 — Safety score */}
            {scene.key === 'safety' && 'score' in scene && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        className="stroke-surface-container"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        className="stroke-score-high"
                        strokeWidth="2.5"
                        strokeDasharray={`${(scene.score / 100) * 97.4} 97.4`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg sm:text-xl font-extrabold text-score-high">
                        {scene.score}
                      </span>
                      <span className="text-[8px] text-outline">{scene.grade}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-score-high">Sınıf {scene.grade}</p>
                    <p className="text-[10px] sm:text-xs text-on-surface-variant">— Çok Güvenli</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {scene.bars.map((bar, i) => (
                    <div
                      key={bar.label}
                      className="flex items-center gap-2 animate-slide-up"
                      style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                    >
                      <span className="w-20 sm:w-24 shrink-0 text-[10px] sm:text-[11px] font-medium text-on-surface truncate">
                        {bar.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            bar.value >= 70
                              ? 'bg-score-high'
                              : bar.value >= 50
                                ? 'bg-score-medium'
                                : 'bg-score-low'
                          }`}
                          style={{ width: `${bar.value}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-[10px] text-right font-semibold text-on-surface tabular-nums">
                        {bar.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scene 3 — Personal compatibility */}
            {scene.key === 'personal' && 'personalScore' in scene && (
              <div>
                <div className="rounded-md border border-score-high/30 bg-score-high/5 p-3 mb-3">
                  <p className="label-caps text-on-surface-variant text-[9px] sm:text-[10px]">
                    Senin Skorun
                  </p>
                  <p className="text-2xl sm:text-3xl headline-tight text-score-high mt-0.5">
                    %{scene.personalScore}
                  </p>
                  <div className="mt-2 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-score-high rounded-full transition-all duration-1000"
                      style={{ width: `${scene.personalScore}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 mb-2">
                  {scene.needs.map((need, i) => (
                    <div
                      key={need.name}
                      className="flex items-center gap-2 animate-slide-up"
                      style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards' }}
                    >
                      <span className="text-[11px] font-medium text-on-surface flex-1 truncate">
                        {need.name}
                      </span>
                      <div className="w-12 sm:w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-score-high rounded-full"
                          style={{ width: `${need.score}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-score-high tabular-nums w-7 text-right">
                        %{need.score}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {scene.profile.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <p className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-[9px] sm:text-[10px] text-outline text-center leading-tight">
              {scene.footer}
            </p>
          </div>
        ))}

        {/* Scanning sweep effect */}
        <div className="absolute top-0 left-0 right-0 h-[42%] pointer-events-none overflow-hidden mt-3 mx-3 sm:mt-4 sm:mx-4 rounded-md">
          <div
            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-scan"
            style={{ top: 0 }}
          />
        </div>
      </div>

      {/* Scene indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
        {SCENES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveScene(idx)}
            className={`h-1 transition-all duration-300 rounded-full ${
              idx === activeScene
                ? 'w-6 bg-primary'
                : 'w-1 bg-outline-variant hover:bg-outline'
            }`}
            aria-label={`Sahne ${idx + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        :global(.animate-scan) { animation: scan 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
