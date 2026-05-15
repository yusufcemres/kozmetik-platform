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

export interface RadarChartProps {
  dimensions: RadarDimension[];
  /** SVG boyutu (kare). Default 320. */
  size?: number;
  /** Renk teması — varsayılan primary (M3) */
  fillColor?: string;
  strokeColor?: string;
}

export function RadarChart({
  dimensions,
  size = 320,
  fillColor = 'rgb(59 130 246 / 0.25)', // blue-500 25%
  strokeColor = 'rgb(59 130 246)',
}: RadarChartProps) {
  if (dimensions.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const labelRadius = size * 0.46;
  const N = dimensions.length;

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

  // Veri polygon path
  const dataPath = dimensions
    .map((d, i) => {
      const [x, y] = point(i, d.value);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block mx-auto"
      role="img"
      aria-label={`6-boyut cilt skoru radar grafiği — ${dimensions.map((d) => `${d.label}: ${d.value}`).join(', ')}`}
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
      {dimensions.map((d, i) => {
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

      {/* Veri polygon (dolgu + kontur) */}
      <path d={dataPath} fill={fillColor} stroke={strokeColor} strokeWidth={2} strokeLinejoin="round" />

      {/* Veri noktaları */}
      {dimensions.map((d, i) => {
        const [x, y] = point(i, d.value);
        return <circle key={`pt-${d.key}`} cx={x} cy={y} r={4} fill={strokeColor} />;
      })}

      {/* Etiketler */}
      {dimensions.map((d, i) => {
        const a = angle(i);
        const x = cx + labelRadius * Math.cos(a);
        const y = cy + labelRadius * Math.sin(a);
        // Etiket sağa/sola ortalamak için x koordinatına göre anchor
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        return (
          <g key={`lbl-${d.key}`}>
            <text
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-on-surface text-[11px] font-medium"
            >
              {d.label}
            </text>
            <text
              x={x}
              y={y + 12}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-on-surface-variant text-[10px]"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
