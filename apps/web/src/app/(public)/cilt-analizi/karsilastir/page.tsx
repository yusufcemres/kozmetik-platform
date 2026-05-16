'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { RadarChart } from '@/components/skin-analysis/RadarChart';

/**
 * Faz 2 başlangıcı — eski analiz vs yeni analiz karşılaştırma sayfası.
 *
 * 28-gün reminder email'in landing destination'ı: kullanıcı yeni analiz çeker,
 * sonra `?to=<new_id>&from=<old_id>` ile bu sayfaya gelir, trend görür.
 *
 * Skor "yüksek = daha kötü" konvansiyonu — delta < 0 iyileşme demek.
 */

interface ScoreBreakdown {
  t_zone_oil: number;
  pore_visibility: number;
  wrinkles: number;
  pigmentation: number;
  redness: number;
  under_eye_darkness: number;
  acne_count?: number;
  fitzpatrick_type?: number;
}

interface CompareResponse {
  from: { analysis_id: number; created_at: string; scores: ScoreBreakdown; overall_score: number } | null;
  to: { analysis_id: number; created_at: string; scores: ScoreBreakdown; overall_score: number };
  delta: {
    overall: number;
    by_dimension: Partial<Record<keyof ScoreBreakdown, number>>;
  } | null;
  days_between: number | null;
}

const DIMENSION_LABELS: Record<string, string> = {
  t_zone_oil: 'T-Bölge',
  pore_visibility: 'Gözenek',
  wrinkles: 'Kırışıklık',
  pigmentation: 'Leke',
  redness: 'Kızarıklık',
  under_eye_darkness: 'Gözaltı',
};

const RADAR_KEYS: (keyof ScoreBreakdown)[] = [
  't_zone_oil', 'pore_visibility', 'wrinkles', 'pigmentation', 'redness', 'under_eye_darkness',
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function CompareContent() {
  const params = useSearchParams();
  const to = params.get('to');
  const from = params.get('from');
  const token = params.get('token'); // reminder email'den gelen anonim token (64 hex)
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!to && !token) {
      setError('"to" query parametresi gerekli (yeni analiz ID).');
      setLoading(false);
      return;
    }
    // Token modu (anonim): reminder email link'inden geldi → /compare-by-token
    // JWT modu: kayıtlı kullanıcı → /me/compare
    const endpoint = token
      ? `/skin-analysis/compare-by-token/${encodeURIComponent(token)}${to ? `?to=${to}` : ''}`
      : (() => {
          const qs = new URLSearchParams({ to: to! });
          if (from) qs.set('from', from);
          return `/skin-analysis/me/compare?${qs.toString()}`;
        })();

    apiFetch<CompareResponse>(endpoint)
      .then(setData)
      .catch((err: any) => {
        let msg = err?.message || 'Karşılaştırma yüklenemedi';
        if (err instanceof ApiError) {
          if (err.status === 401) {
            msg = 'Giriş yapman gerekiyor (karşılaştırma sadece kayıtlı kullanıcılar için).';
          } else if (err.status === 404 && token) {
            msg = 'Bağlantı geçersiz veya iptal edilmiş. Yeni analiz çekip sonuç sayfasında karşılaştır.';
          }
        }
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [to, from, token]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <span className="material-icon animate-spin text-primary text-[40px]" aria-hidden="true">progress_activity</span>
        <p className="text-sm text-on-surface-variant mt-3">Karşılaştırma hazırlanıyor…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-16 text-center px-4">
        <span className="material-icon text-on-surface-variant text-[40px] mb-3 inline-block" aria-hidden="true">error_outline</span>
        <h1 className="text-lg font-bold text-on-surface mb-2">Karşılaştırma yapılamadı</h1>
        <p className="text-sm text-on-surface-variant mb-6">{error || 'Veri yok'}</p>
        <Link href="/cilt-analizi/foto-test" className="curator-btn-primary text-sm px-6 py-3 inline-block">
          Yeni Analiz Çek
        </Link>
      </div>
    );
  }

  // Önceki analiz yoksa "bu ilk analiz" mesajı
  if (!data.from || !data.delta) {
    return (
      <div className="max-w-md mx-auto py-16 text-center px-4">
        <span className="material-icon text-primary text-[40px] mb-3 inline-block" aria-hidden="true">timeline</span>
        <h1 className="text-lg font-bold text-on-surface mb-2">Karşılaştırılacak eski analiz yok</h1>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          Bu senin ilk analiz çekimin. 28 gün sonra yeni bir analiz daha çekersen, ikisini
          burada karşılaştırıp INCI önerilerinin etkisini göreceksin.
        </p>
        <Link href="/cilt-analizi/foto-test" className="curator-btn-primary text-sm px-6 py-3 inline-block">
          Sonuçları Gör
        </Link>
      </div>
    );
  }

  const overallDelta = data.delta.overall;
  const verdictColor = overallDelta < -5 ? 'text-score-high' : overallDelta > 5 ? 'text-error' : 'text-on-surface-variant';
  const verdictIcon = overallDelta < -5 ? 'trending_down' : overallDelta > 5 ? 'trending_up' : 'trending_flat';
  const verdictLabel = overallDelta < -5 ? 'İyileşme' : overallDelta > 5 ? 'Kötüleşme' : 'Sabit';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <span className="mx-2 text-outline">/</span>
        <Link href="/cilt-analizi" className="hover:text-primary">Cilt Analizi</Link>
        <span className="mx-2 text-outline">/</span>
        <span className="text-on-surface">Karşılaştırma</span>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-on-surface mb-2 flex items-center justify-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">compare_arrows</span>
          Cilt Trend Karşılaştırması
        </h1>
        <p className="text-sm text-on-surface-variant">
          {formatDate(data.from.created_at)} → {formatDate(data.to.created_at)}
          {data.days_between != null && ` · ${data.days_between} gün`}
        </p>
      </header>

      {/* Overall verdict */}
      <div className="curator-card p-6 mb-8 text-center">
        <span className={`material-icon ${verdictColor} text-[40px] inline-block mb-2`} aria-hidden="true">
          {verdictIcon}
        </span>
        <p className={`text-xs uppercase tracking-wider ${verdictColor} font-semibold mb-1`}>{verdictLabel}</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-xs text-on-surface-variant">Genel skor:</span>
          <span className="text-2xl font-bold text-on-surface">{data.from.overall_score}</span>
          <span className="material-icon text-outline text-[18px]" aria-hidden="true">arrow_forward</span>
          <span className="text-2xl font-bold text-on-surface">{data.to.overall_score}</span>
          <span className={`text-sm font-bold ${verdictColor}`}>
            ({overallDelta > 0 ? '+' : ''}{overallDelta})
          </span>
        </div>
        <p className="text-[10px] text-outline mt-2">
          Skor düşmesi (negatif delta) = iyileşme. Yüksek skor daha şiddetli sorun.
        </p>
      </div>

      {/* Dual RadarChart */}
      <div className="curator-card p-5 mb-8">
        <h2 className="text-base font-semibold text-on-surface mb-4 text-center">6-Boyut Karşılaştırma</h2>
        <RadarChart
          datasets={[
            {
              dimensions: RADAR_KEYS.map((k) => ({
                key: k,
                label: DIMENSION_LABELS[k],
                value: data.from!.scores[k] as number,
              })),
              fillColor: 'rgb(148 163 184 / 0.20)', // slate-400 20%
              strokeColor: 'rgb(100 116 139)',      // slate-500
              label: `Eski (${formatDate(data.from.created_at)})`,
            },
            {
              dimensions: RADAR_KEYS.map((k) => ({
                key: k,
                label: DIMENSION_LABELS[k],
                value: data.to.scores[k] as number,
              })),
              fillColor: 'rgb(59 130 246 / 0.25)',  // blue-500 25%
              strokeColor: 'rgb(59 130 246)',       // blue-500
              label: `Yeni (${formatDate(data.to.created_at)})`,
            },
          ]}
          size={340}
        />
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: 'rgb(100 116 139)' }} />
            <span className="text-on-surface-variant">Eski</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: 'rgb(59 130 246)' }} />
            <span className="text-on-surface-variant">Yeni</span>
          </span>
        </div>
      </div>

      {/* Boyut bazlı delta tablo */}
      <div className="curator-card p-5 mb-8">
        <h2 className="text-base font-semibold text-on-surface mb-4">Boyut Değişimleri</h2>
        <div className="space-y-2">
          {RADAR_KEYS.map((k) => {
            const fromVal = data.from!.scores[k] as number;
            const toVal = data.to.scores[k] as number;
            const delta = data.delta!.by_dimension[k] ?? 0;
            const color = delta < -3 ? 'text-score-high' : delta > 3 ? 'text-error' : 'text-on-surface-variant';
            const icon = delta < -3 ? 'arrow_downward' : delta > 3 ? 'arrow_upward' : 'remove';
            return (
              <div key={k} className="flex items-center gap-3 py-2 border-b border-outline-variant/15 last:border-0">
                <span className="text-sm text-on-surface flex-1">{DIMENSION_LABELS[k]}</span>
                <span className="text-xs text-on-surface-variant w-10 text-right">{fromVal}</span>
                <span className="material-icon text-outline text-[14px]" aria-hidden="true">arrow_forward</span>
                <span className="text-xs text-on-surface w-10 text-right font-medium">{toVal}</span>
                <span className={`flex items-center gap-1 ${color} font-semibold text-xs w-16 justify-end`}>
                  <span className="material-icon text-[14px]" aria-hidden="true">{icon}</span>
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-outline mt-3 leading-relaxed">
          💡 Skor azalan boyutlarda INCI önerilerinin etkisi gözleniyor. Artan boyutlar için
          mevcut bakım rutinin yeterli olmayabilir — yeni öneriler için son analiz sonuç sayfana dön.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/cilt-analizi/foto-test?ref=compare&prev=${data.to.analysis_id}${token ? `&token=${token}` : ''}`}
          className="curator-btn-primary flex-1 text-sm py-3 text-center"
        >
          Yeni Analiz Çek
        </Link>
        <Link
          href={token ? `/cilt-analizi/trend?token=${token}` : '/cilt-analizi/trend'}
          className="flex-1 text-sm text-center text-on-surface border border-primary/40 bg-primary/5 rounded-sm py-3 hover:bg-primary/10 transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">timeline</span>
          Tüm Trendi Gör
        </Link>
        <Link
          href="/cilt-analizi/veri-haklarim"
          className="flex-1 text-sm text-center text-on-surface-variant border border-outline-variant/30 rounded-sm py-3 hover:bg-surface-container-low transition-colors"
        >
          Veri Haklarımı Yönet
        </Link>
      </div>
    </div>
  );
}

export default function CompareSkinAnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16">
          <span className="material-icon animate-spin text-primary" aria-hidden="true">progress_activity</span>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
