'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NeedScore {
  need_id: number;
  need?: { need_id: number; need_name: string; need_slug: string };
  compatibility_score: number;
}

interface SkinProfile {
  skin_type?: string;
  concerns?: number[];
  sensitivities?: Record<string, boolean>;
  gender?: string;
}

interface PersonalScoreInlineProps {
  needScores: NeedScore[];
  hasAllergens?: boolean; // product.ingredients içinde allergen_flag var mı
  hasFragrance?: boolean;
  variant?: 'cosmetic' | 'supplement';
}

export default function PersonalScoreInline({
  needScores,
  hasAllergens = false,
  hasFragrance = false,
  variant = 'cosmetic',
}: PersonalScoreInlineProps) {
  const [profile, setProfile] = useState<SkinProfile | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('skin_profile');
      if (raw) {
        setProfile(JSON.parse(raw));
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  // İlk render hydration sırasında — undefined → boş alan göster (flash önle)
  if (profile === undefined) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-md p-4 animate-pulse">
        <div className="h-3 w-24 bg-surface-container rounded mb-2" />
        <div className="h-6 w-32 bg-surface-container rounded" />
      </div>
    );
  }

  // Profil yok → CTA
  if (!profile || (!profile.concerns?.length && !profile.skin_type)) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-md p-6">
        <p className="label-caps text-on-surface-variant">Senin Cildine Uyumu</p>
        <p className="text-lg font-bold text-primary mt-1">Kişisel skorunu gör</p>
        <p className="text-xs text-outline mt-2">
          <Link href="/profilim" className="text-primary hover:underline underline-offset-4">
            Cilt profili oluştur
          </Link>{' '}
          &rarr; sana özel uyumluluk skoru
        </p>
      </div>
    );
  }

  // Profil var → kişisel skoru hesapla ve göster
  const userConcerns = profile.concerns || [];
  const matchingScores = needScores.filter((ns) => userConcerns.includes(ns.need_id));

  const personalAvg = matchingScores.length > 0
    ? Math.round(
        matchingScores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) /
          matchingScores.length,
      )
    : null;

  // Hassasiyet penaltısı
  let adjusted: number | null = personalAvg;
  const sensitivityPenalties: string[] = [];
  if (adjusted !== null && profile.sensitivities) {
    if (profile.sensitivities.fragrance && hasFragrance) {
      adjusted = Math.max(0, adjusted - 15);
      sensitivityPenalties.push('Parfüm hassasiyetin var, ürün parfümlü');
    }
    if (
      adjusted !== null &&
      (profile.sensitivities.fragrance || profile.sensitivities.essential_oils) &&
      hasAllergens
    ) {
      adjusted = Math.max(0, adjusted - 10);
      sensitivityPenalties.push('Ürün alerjen bileşen içeriyor');
    }
  }

  const finalScore = adjusted;
  const scoreColor =
    finalScore == null
      ? 'text-on-surface-variant'
      : finalScore >= 70
        ? 'text-score-high'
        : finalScore >= 40
          ? 'text-score-medium'
          : 'text-score-low';
  const scoreBg =
    finalScore == null
      ? 'border-outline-variant/20'
      : finalScore >= 70
        ? 'border-score-high/30 bg-score-high/5'
        : finalScore >= 40
          ? 'border-score-medium/30 bg-score-medium/5'
          : 'border-score-low/30 bg-score-low/5';
  const barColor =
    finalScore == null
      ? 'bg-surface-container'
      : finalScore >= 70
        ? 'bg-score-high'
        : finalScore >= 40
          ? 'bg-score-medium'
          : 'bg-score-low';

  return (
    <div className={`rounded-md border p-4 ${scoreBg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="label-caps text-on-surface-variant flex items-center gap-1">
            <span className="material-icon text-[12px]" aria-hidden="true">person</span>
            Senin Cildine Uyumu
          </p>
          {finalScore !== null ? (
            <>
              <p className={`text-3xl headline-tight ${scoreColor} mt-1`}>%{finalScore}</p>
              {sensitivityPenalties.length > 0 && (
                <p className="text-[10px] text-score-medium mt-1">
                  {sensitivityPenalties.join(' · ')}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-on-surface mt-1">
              Bu ürün senin ihtiyaçların için skorlanmamış. Profile yeni ihtiyaç ekleyebilirsin.
            </p>
          )}
        </div>
        <Link
          href="/profilim"
          className="material-icon text-outline-variant hover:text-primary transition-colors text-[16px] shrink-0"
          aria-label="Profilini düzenle"
        >
          edit
        </Link>
      </div>

      {finalScore !== null && (
        <div className="mt-3 h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, finalScore))}%` }}
          />
        </div>
      )}

      {/* Eşleşen ihtiyaçlar */}
      {matchingScores.length > 0 && (
        <details className="mt-3 group">
          <summary className="text-[10px] text-primary cursor-pointer hover:underline list-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-1">
              {matchingScores.length} ihtiyacın eşleşti
              <span
                className="material-icon group-open:rotate-180 transition-transform"
                style={{ fontSize: '12px' }}
                aria-hidden="true"
              >
                expand_more
              </span>
            </span>
          </summary>
          <div className="mt-2 space-y-1.5">
            {matchingScores.map((ns) => {
              const s = Math.round(Number(ns.compatibility_score));
              return (
                <div key={ns.need_id} className="flex items-center gap-2 text-[11px]">
                  <span className="flex-1 text-on-surface truncate">
                    {ns.need?.need_name || `İhtiyaç #${ns.need_id}`}
                  </span>
                  <div className="w-12 h-1 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s >= 70 ? 'bg-score-high' : s >= 40 ? 'bg-score-medium' : 'bg-score-low'
                      }`}
                      style={{ width: `${Math.min(100, s)}%` }}
                    />
                  </div>
                  <span
                    className={`tabular-nums font-semibold ${
                      s >= 70 ? 'text-score-high' : s >= 40 ? 'text-score-medium' : 'text-score-low'
                    }`}
                  >
                    %{s}
                  </span>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {variant === 'supplement' && (
        <p className="text-[9px] text-outline mt-2">
          Takviyelerde kişisel skor henüz beta — supplement need taksonomisi geliştiriliyor.
        </p>
      )}
    </div>
  );
}
