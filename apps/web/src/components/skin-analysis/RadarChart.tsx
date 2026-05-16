/**
 * Custom SVG radar chart — cilt analizi 6-boyut skoru için.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 5 ile eklendi. Recharts veya başka 3rd party
 * yerine ~80 satır SVG — bundle bloat yok, tasarım kontrolü tam, theme tokens
 * (text-on-surface, primary, vd.) direkt çalışır.
 *
 * Boyutlar 0-100 (yüksek = daha şiddetli). Polygon merkezde 0, kenarda 100.
 */

export interface RadarDimension {
  /** İç key (örn. "wrinkles") — debugging ve a11y için */
  key: string;
  /** Görünür etiket (örn. "Kırışıklık") */
  label: string;
  /** Skor 0-100 */
  value: number;
}

/**
 * Tek bir veri katmanı — multi-overlay için (örn. eski analiz vs yeni analiz).
 * Day 11 sonrası Faz 2 karşılaştırma sayfası için eklendi.
 */
export interface RadarDataset {
  dimensions: RadarDimension[];
  fillColor?: string;
  strokeColor?: string;
  /** Etiket (legend için, opsiyonel). Örn. "Eski analiz (5 Mayıs)" */
  label?: string;
}

export interface RadarChartProps {
  /** Tek dataset modu (legacy). datasets verilirse yok sayılır. */
  dimensions?: RadarDimension[];
  /** Çoklu overlay modu — eski/yeni karşılaştırma vs. */
  datasets?: RadarDataset[];
  /** SVG boyutu (kare). Default 320. */
  size?: number;
  /** Single mode renk override (legacy) */
  fillColor?: string;
  strokeColor?: string;
}

const DEFAULT_FILL = 'rgb(59 130 246 / 0.25)';
const DEFAULT_STROKE = 'rgb(59 130 246)';

export function RadarChart(props: RadarChartProps) {
  const size = props.size ?? 320;

  // Normalize: dual mode (datasets) ya da single mode (dimensions)
  const layers: RadarDataset[] = props.datasets ?? [
    {
      dimensions: props.dimensions ?? [],
      fillColor: props.fillColor ?? DEFAULT_FILL,
      strokeColor: props.strokeColor ?? DEFAULT_STROKE,
    },
  ];

  const baseDims = layers[0]?.dimensions ?? [];
  if (baseDims.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const labelRadius = size * 0.46;
  const N = baseDims.length;

  // Her boyut için açı (üst noktadan başla, saat yönü)
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;

  // Skor değerinden polygon noktası
  const point = (i: number, v: number): [number, number] => {
    const r = (Math.max(0, Math.min(100, v)) / 100) * radius;
    const a = angle(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  // Konsantrik grid (20-40-60-80-100)
  const gridLevels = [20, 40, 60, 80, 100];

  // Her dataset için path üret
  const buildPath = (dims: RadarDimension[]) =>
    dims
      .map((d, i) => {
        const [x, y] = point(i, d.value);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  const ariaSummary = layers
    .map((ds, idx) => {
      const prefix = ds.label ? `${ds.label}: ` : layers.length > 1 ? `Set ${idx + 1}: ` : '';
      return prefix + ds.dimensions.map((d) => `${d.label} ${d.value}`).join(', ');
    })
    .join(' | ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block mx-auto"
      role="img"
      aria-label={`Cilt skoru radar grafiği — ${ariaSummary}`}
    >
      {/* Grid: konsantrik daire/polygon */}
      {gridLevels.map((lvl) => {
        const path = Array.from({ length: N })
          .map((_, i) => {
            const r = (lvl / 100) * radius;
            const a = angle(i);
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ') + ' Z';
        return (
          <path
            key={lvl}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={1}
            className="text-outline"
          />
        );
      })}

      {/* Eksen çizgileri (her boyut için merkezden kenara) */}
      {baseDims.map((d, i) => {
        const a = angle(i);
        const x = cx + radius * Math.cos(a);
        const y = cy + radius * Math.sin(a);
        return (
          <line
            key={`axis-${d.key}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1}
            className="text-outline"
          />
        );
      })}

      {/* Her dataset için polygon + noktalar (multi-overlay) */}
      {layers.map((ds, idx) => {
        const fill = ds.fillColor ?? DEFAULT_FILL;
        const stroke = ds.strokeColor ?? DEFAULT_STROKE;
        return (
          <g key={`layer-${idx}`}>
            <path d={buildPath(ds.dimensions)} fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
            {ds.dimensions.map((d, i) => {
              const [x, y] = point(i, d.value);
              return <circle key={`pt-${idx}-${d.key}`} cx={x} cy={y} r={4} fill={stroke} />;
            })}
          </g>
        );
      })}

      {/* Etiketler — baseDims temel alınır, dual modda her dataset için değer satırı */}
      {baseDims.map((d, i) => {
        const a = angle(i);
        const x = cx + labelRadius * Math.cos(a);
        const y = cy + labelRadius * Math.sin(a);
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        // Dual modda: aynı index'teki tüm dataset değerlerini yan yana göster (eski → yeni)
        const valueLine = layers.length === 1
          ? String(d.value)
          : layers.map((ds) => ds.dimensions[i]?.value ?? '-').join(' → ');
        return (
          <g key={`lbl-${d.key}`}>
            <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="fill-on-surface text-[11px] font-medium">
              {d.label}
            </text>
            <text x={x} y={y + 12} textAnchor={anchor} dominantBaseline="middle" className="fill-on-surface-variant text-[10px]">
              {valueLine}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
