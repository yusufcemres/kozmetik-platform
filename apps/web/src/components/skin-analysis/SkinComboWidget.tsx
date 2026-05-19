'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

/**
 * Modül J — Senin Cildine Combo (2026-05-19).
 *
 * Backend skin-combo.service'ten gelen recommendCombo() sonucunu render eder.
 * - Foto analiz: analysisId varsa GET /skin-analysis/:id/combo
 * - Quiz: scores ve fitzpatrick prop'larıyla POST /skin-analysis/combo/from-scores
 *
 * On-device ephemeral analizde (analysis_id=0) scores prop'u doğrudan
 * geçilir, backend POST çağrısı yapılır.
 */

const DIMENSION_LABELS: Record<string, string> = {
  t_zone_oil: 'T-Bölge Yağ',
  pore_visibility: 'Gözenek',
  wrinkles: 'Kırışıklık',
  pigmentation: 'Leke',
  redness: 'Kızarıklık',
  under_eye_darkness: 'Gözaltı',
};

interface ComboPick {
  slug: string;
  display_name: string;
  dimension: string;
  dimension_score: number;
  time_of_day: 'AM' | 'PM';
  function_summary?: string | null;
  evidence_grade?: string | null;
  product?: {
    product_id: number;
    product_name: string;
    product_slug: string;
    brand_name: string | null;
  } | null;
}

interface ComboResult {
  morning: ComboPick | null;
  evening: ComboPick | null;
  synergy: boolean;
  note: string;
  contraindication_warning: string | null;
}

export interface SkinComboWidgetProps {
  /** Foto analiz ID — varsa GET, yoksa scores POST */
  analysisId?: number;
  /** Quiz veya on-device skorları — analysisId yoksa zorunlu */
  scores?: Record<string, number>;
  fitzpatrick?: number | null;
}

export function SkinComboWidget({ analysisId, scores, fitzpatrick }: SkinComboWidgetProps) {
  const [combo, setCombo] = useState<ComboResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCombo = async () => {
      setLoading(true);
      setErr(null);
      try {
        let result: ComboResult;
        if (analysisId && analysisId > 0) {
          result = await apiFetch<ComboResult>(`/skin-analysis/${analysisId}/combo`);
        } else if (scores) {
          result = await apiFetch<ComboResult>('/skin-analysis/combo/from-scores', {
            method: 'POST',
            body: JSON.stringify({ scores, fitzpatrick_type: fitzpatrick }),
          });
        } else {
          if (!cancelled) setCombo(null);
          return;
        }
        if (!cancelled) setCombo(result);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Combo yüklenemedi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchCombo();
    return () => { cancelled = true; };
  }, [analysisId, scores, fitzpatrick]);

  if (loading) {
    return (
      <div className="curator-card p-5 mb-8 animate-pulse">
        <div className="h-4 bg-surface-container rounded w-48 mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-32 bg-surface-container rounded" />
          <div className="h-32 bg-surface-container rounded" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="curator-card p-4 mb-8 border-error/30 bg-error/5">
        <p className="text-xs text-error">Combo yüklenemedi: {err}</p>
      </div>
    );
  }

  if (!combo || (!combo.morning && !combo.evening)) {
    return null;
  }

  const renderPick = (pick: ComboPick | null, timeLabel: string) => {
    if (!pick) return null;
    return (
      <div className="curator-card p-4 border-primary/40 bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <span className="label-caps text-primary">
            {timeLabel} · {DIMENSION_LABELS[pick.dimension] || pick.dimension}
          </span>
          <span className="text-xs font-bold text-primary">Skor {pick.dimension_score}</span>
        </div>
        <Link
          href={`/icerikler/${pick.slug}`}
          className="text-base font-bold text-on-surface hover:text-primary transition-colors block mb-1"
        >
          {pick.display_name}
          {pick.evidence_grade && (
            <span className="ml-2 inline-block px-1.5 py-0.5 rounded-sm bg-primary/10 text-[10px] text-primary font-medium align-middle">
              {pick.evidence_grade}
            </span>
          )}
        </Link>
        {pick.function_summary && (
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {pick.function_summary}
          </p>
        )}
        {pick.product && (
          <div className="mt-3 pt-3 border-t border-outline-variant/20">
            <Link
              href={`/urunler/${pick.product.product_slug}`}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">shopping_bag</span>
              {pick.product.brand_name} {pick.product.product_name}
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <span className="material-icon text-primary" aria-hidden="true">auto_awesome</span>
        <h3 className="text-base font-semibold text-on-surface">Senin Cildine Combo</h3>
        {combo.synergy && (
          <span className="label-caps px-2 py-0.5 rounded-sm bg-green-50 text-green-700">
            Sinerjik
          </span>
        )}
      </div>
      <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
        {combo.note}
      </p>

      {combo.contraindication_warning && (
        <div className="mb-3 p-3 rounded-sm bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-900 flex items-start gap-2">
            <span className="material-icon text-amber-700 text-[14px] mt-0.5" aria-hidden="true">warning</span>
            <span>{combo.contraindication_warning}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {renderPick(combo.morning, 'Sabah')}
        {renderPick(combo.evening, 'Akşam')}
      </div>
      <p className="text-[10px] text-outline mt-3 text-center">
        Bu combo cilt tipine + skor sırasına göre seçilmiş kanıt-temelli 2 aktif öneri.
        Aşağıdaki detaylı liste tüm boyutlar için top 3 INCI verir.
      </p>
    </div>
  );
}
