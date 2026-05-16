/**
 * 6-boyut cilt skoru trend grafiği — multi-line SVG sparkline.
 *
 * 2026-05-17 Faz 2 #2 ile eklendi. 3+ analiz için zaman ekseninde her boyutun
 * mini bir sparkline'ı (3×2 grid). Tek dış kütüphane yok, RadarChart ile uyumlu
 * SVG yaklaşımı — bundle bloat sıfır.
 *
 * Skor "yüksek = daha kötü" → trend aşağı = iyileşme (yeşil, ok aşağı).
 */

export interface TrendDataPoint {
  analysis_id: number;
  created_at: string; // ISO
  overall_score: number;
  scores: {
    t_zone_oil: number;
    pore_visibility: number;
    wrinkles: number;
    pigmentation: number;
    redness: number;
    under_eye_darkness: number;
    acne_count?: number;
    fitzpatrick_type?: number;
  };
}

export interface TrendChartProps {
  /** Geçmiş analizler — eskiden yeniye sıralı OLMASA da çalışır (kendisi sort'lar) */
  analyses: TrendDataPoint[];
}

const DIMENSIONS: Array<{ key: keyof TrendDataPoint['scores']; label: string; color: string }> = [
  { key: 't_zone_oil',          label: 'T-Bölge Yağ',  color: '#f59e0b' }, // amber-500
  { key: 'pore_visibility',     label: 'Gözenek',      color: '#06b6d4' }, // cyan-500
  { key: 'wrinkles',            label: 'Kırışıklık',   color: '#8b5cf6' }, // violet-500
  { key: 'pigmentation',        label: 'Leke',         color: '#ec4899' }, // pink-500
  { key: 'redness',             label: 'Kızarıklık',   color: '#ef4444' }, // red-500
  { key: 'under_eye_darkness',  label: 'Gözaltı',      color: '#6366f1' }, // indigo-500
];

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function Sparkline({
  values,
  color,
  width = 240,
  height = 60,
}: { values: number[]; color: string; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const padding = 4;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const max = 100; // skor üst sınırı sabit
  const stepX = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = padding + h - (Math.max(0, Math.min(100, v)) / max) * h;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  // Trend ok yönü (last - first)
  const delta = values[values.length - 1] - values[0];
  const trendIcon = delta < -5 ? '↓' : delta > 5 ? '↑' : '→';
  const trendColor = delta < -5 ? '#10b981' : delta > 5 ? '#ef4444' : '#9ca3af';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      {/* baseline (50 skor) referans çizgisi */}
      <line
        x1={padding} y1={padding + h * 0.5} x2={width - padding} y2={padding + h * 0.5}
        stroke="currentColor" strokeOpacity={0.08} strokeDasharray="2 2"
        className="text-outline"
      />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={color} />
      ))}
      {/* Trend yön rozeti sağ üst */}
      <text x={width - padding - 4} y={padding + 10} textAnchor="end" fontSize="12" fontWeight="700" fill={trendColor}>
        {trendIcon} {delta > 0 ? '+' : ''}{delta}
      </text>
    </svg>
  );
}

export function TrendChart({ analyses }: TrendChartProps) {
  if (analyses.length < 2) {
    return (
      <div className="curator-card p-6 text-center">
        <span className="material-icon text-outline-variant text-[32px] mb-2 inline-block" aria-hidden="true">timeline</span>
        <p className="text-sm text-on-surface-variant">
          Trend grafiği için en az 2 analiz gerekli. Yeni bir analiz çek, geçmiş otomatik oluşacak.
        </p>
      </div>
    );
  }

  // Eskiden yeniye sırala (chronological)
  const sorted = [...analyses].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const overallValues = sorted.map((a) => a.overall_score);

  return (
    <div className="space-y-6">
      {/* Header: tarih aralığı + analiz sayısı */}
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-outline font-semibold">Toplam analiz</p>
          <p className="text-xl font-bold text-on-surface">{sorted.length}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-outline font-semibold">Tarih aralığı</p>
          <p className="text-xs text-on-surface">
            {formatShortDate(sorted[0].created_at)} → {formatShortDate(sorted[sorted.length - 1].created_at)}
          </p>
        </div>
      </div>

      {/* Genel skor sparkline (büyük) */}
      <div className="curator-card p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-on-surface">Genel Cilt Skoru</h3>
          <span className="text-[10px] text-outline">Düşüş = iyileşme</span>
        </div>
        <Sparkline values={overallValues} color="rgb(59 130 246)" width={560} height={100} />
      </div>

      {/* 6 boyut sparkline grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DIMENSIONS.map(({ key, label, color }) => {
          const values = sorted.map((a) => (a.scores[key] as number | undefined) ?? 0);
          return (
            <div key={key} className="curator-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <h4 className="text-xs font-semibold text-on-surface flex-1 truncate">{label}</h4>
                <span className="text-[10px] text-outline">{values[0]} → {values[values.length - 1]}</span>
              </div>
              <Sparkline values={values} color={color} />
            </div>
          );
        })}
      </div>

      {/* Analiz listesi (her satır karşılaştırma link'i) */}
      <div className="curator-card p-4">
        <h3 className="text-sm font-semibold text-on-surface mb-3">Analiz Listesi</h3>
        <ul className="space-y-1">
          {sorted.slice().reverse().map((a, idx) => (
            <li key={a.analysis_id} className="flex items-center gap-3 text-xs py-1.5 border-b border-outline-variant/10 last:border-0">
              <span className="text-outline w-6 text-right">#{sorted.length - idx}</span>
              <span className="text-on-surface flex-1">{new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="text-on-surface-variant">Genel: <strong className="text-on-surface">{a.overall_score}</strong></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
