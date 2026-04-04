'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface PricePoint {
  date: string;
  price: number;
}

interface PlatformData {
  platform: string;
  min: number;
  max: number;
  avg: number;
  current: number;
  points: PricePoint[];
}

interface PriceHistoryData {
  period_days: number;
  global_min: number;
  global_max: number;
  global_avg: number;
  platforms: PlatformData[];
}

const PLATFORM_COLORS: Record<string, string> = {
  trendyol: '#F27A1A',
  hepsiburada: '#FF6000',
  amazon_tr: '#FF9900',
  dermoeczanem: '#00A99D',
  gratis: '#E91E63',
  rossmann: '#D40E14',
  watsons: '#00703C',
  other: '#6B7280',
};

const PLATFORM_LABELS: Record<string, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  amazon_tr: 'Amazon TR',
  dermoeczanem: 'Dermoeczanem',
  gratis: 'Gratis',
  rossmann: 'Rossmann',
  watsons: 'Watsons',
  other: 'Diğer',
};

function formatTL(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PriceChart({ productId }: { productId: number }) {
  const [data, setData] = useState<PriceHistoryData | null>(null);
  const [days, setDays] = useState(30);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    platform: string;
    date: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    api
      .get<PriceHistoryData>(`/products/${productId}/price-history?days=${days}`)
      .then(setData)
      .catch(() => setData(null));
  }, [productId, days]);

  if (!data || data.platforms.length === 0) return null;

  // SVG chart dimensions
  const W = 700;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 30, left: 55 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Price range with 5% padding
  const priceRange = data.global_max - data.global_min;
  const yMin = Math.max(0, data.global_min - priceRange * 0.05);
  const yMax = data.global_max + priceRange * 0.05;

  // Date range
  const allDates = data.platforms
    .flatMap((p) => p.points.map((pt) => pt.date))
    .filter((d, i, a) => a.indexOf(d) === i)
    .sort();
  const dateMin = allDates[0];
  const dateMax = allDates[allDates.length - 1];
  const timeMin = new Date(dateMin).getTime();
  const timeMax = new Date(dateMax).getTime();
  const timeSpan = timeMax - timeMin || 1;

  const xScale = (date: string) =>
    PAD.left + ((new Date(date).getTime() - timeMin) / timeSpan) * chartW;
  const yScale = (price: number) =>
    PAD.top + chartH - ((price - yMin) / (yMax - yMin)) * chartH;

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) =>
    yMin + ((yMax - yMin) * i) / 4,
  );

  // X-axis ticks (5-6 dates)
  const xTickCount = Math.min(6, allDates.length);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const idx = Math.round((i * (allDates.length - 1)) / (xTickCount - 1));
    return allDates[idx];
  });

  // Build polyline paths
  const pathForPlatform = (platform: PlatformData) => {
    const pts = platform.points
      .map((pt) => `${xScale(pt.date).toFixed(1)},${yScale(pt.price).toFixed(1)}`)
      .join(' ');
    return pts;
  };

  const handleMouseMove = (
    e: React.MouseEvent<SVGSVGElement>,
    platform: string,
    points: PricePoint[],
  ) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;

    // Find nearest point
    let nearest = points[0];
    let minDist = Infinity;
    for (const pt of points) {
      const px = xScale(pt.date);
      const dist = Math.abs(px - mouseX);
      if (dist < minDist) {
        minDist = dist;
        nearest = pt;
      }
    }

    setTooltip({
      x: xScale(nearest.date),
      y: yScale(nearest.price),
      platform,
      date: nearest.date,
      price: nearest.price,
    });
  };

  return (
    <div className="curator-card p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="label-caps text-on-surface-variant tracking-[0.2em]">Fiyat Takip Grafiği</h3>
        <div className="flex gap-1">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-[10px] px-3 py-1.5 rounded-sm tracking-wider uppercase transition-colors ${
                days === d
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {d} gün
            </button>
          ))}
        </div>
      </div>

      {/* Period stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-container-low rounded-sm p-3 text-center">
          <p className="label-caps text-score-high mb-1">Dönem En Düşük</p>
          <p className="text-base font-bold text-score-high">{formatTL(data.global_min)}</p>
        </div>
        <div className="bg-surface-container-low rounded-sm p-3 text-center">
          <p className="label-caps text-score-low mb-1">Dönem En Yüksek</p>
          <p className="text-base font-bold text-score-low">{formatTL(data.global_max)}</p>
        </div>
        <div className="bg-surface-container-low rounded-sm p-3 text-center">
          <p className="label-caps text-on-surface-variant mb-1">Dönem Ortalama</p>
          <p className="text-base font-bold text-on-surface">{formatTL(data.global_avg)}</p>
        </div>
      </div>

      {/* SVG chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[500px]"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={yScale(tick)}
                x2={W - PAD.right}
                y2={yScale(tick)}
                stroke="#e8e5e0"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={yScale(tick) + 4}
                textAnchor="end"
                className="text-[10px] fill-outline"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {formatTL(tick)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {xTicks.map((date, i) => (
            <text
              key={i}
              x={xScale(date)}
              y={H - 5}
              textAnchor="middle"
              className="text-[10px] fill-outline"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
            </text>
          ))}

          {/* Platform lines */}
          {data.platforms.map((platform) => {
            const color = PLATFORM_COLORS[platform.platform] || '#6B7280';
            const isHovered = hoveredPlatform === platform.platform;
            const isDimmed = hoveredPlatform && !isHovered;

            return (
              <g key={platform.platform}>
                <polyline
                  points={pathForPlatform(platform)}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isDimmed ? 0.15 : 1}
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoveredPlatform(platform.platform)}
                  onMouseMove={(e) =>
                    handleMouseMove(
                      e as unknown as React.MouseEvent<SVGSVGElement>,
                      platform.platform,
                      platform.points,
                    )
                  }
                  onMouseLeave={() => {
                    setHoveredPlatform(null);
                    setTooltip(null);
                  }}
                  style={{ cursor: 'crosshair' }}
                />
              </g>
            );
          })}

          {/* Tooltip dot */}
          {tooltip && (
            <g>
              <circle cx={tooltip.x} cy={tooltip.y} r={5} fill={PLATFORM_COLORS[tooltip.platform] || '#6B7280'} stroke="white" strokeWidth={2} />
              <g transform={`translate(${tooltip.x < W / 2 ? tooltip.x + 12 : tooltip.x - 120}, ${Math.max(20, tooltip.y - 30)})`}>
                <rect x={0} y={0} width={108} height={40} rx={6} fill="rgba(0,0,0,0.85)" />
                <text x={8} y={16} className="text-[10px] fill-white font-medium" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {PLATFORM_LABELS[tooltip.platform] || tooltip.platform}
                </text>
                <text x={8} y={32} className="text-[11px] fill-white font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {formatTL(tooltip.price)} — {new Date(tooltip.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-outline-variant/20">
        {data.platforms.map((platform) => {
          const color = PLATFORM_COLORS[platform.platform] || '#6B7280';
          return (
            <button
              key={platform.platform}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-sm border transition-all ${
                hoveredPlatform === platform.platform
                  ? 'border-outline bg-surface-container-low'
                  : 'border-transparent hover:border-outline-variant/30'
              }`}
              onMouseEnter={() => setHoveredPlatform(platform.platform)}
              onMouseLeave={() => setHoveredPlatform(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-on-surface-variant font-medium">
                {PLATFORM_LABELS[platform.platform] || platform.platform}
              </span>
              <span className="text-outline">{formatTL(platform.current)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
