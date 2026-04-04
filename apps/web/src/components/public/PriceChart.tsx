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

interface PlatformBrand {
  label: string;
  color: string;
  bg: string;
  textOnBg: string;
  logo: string;
  gridLine: string;
}

const PLATFORMS: Record<string, PlatformBrand> = {
  trendyol: {
    label: 'Trendyol',
    color: '#F27A1A',
    bg: '#FFF4EB',
    textOnBg: '#D4620E',
    logo: '/logos/trendyol.svg',
    gridLine: 'rgba(242,122,26,0.12)',
  },
  hepsiburada: {
    label: 'Hepsiburada',
    color: '#FF6000',
    bg: '#FFF2E8',
    textOnBg: '#CC4D00',
    logo: '/logos/hepsiburada.svg',
    gridLine: 'rgba(255,96,0,0.12)',
  },
  amazon_tr: {
    label: 'Amazon TR',
    color: '#FF9900',
    bg: '#232F3E',
    textOnBg: '#FF9900',
    logo: '/logos/amazon_tr.svg',
    gridLine: 'rgba(255,153,0,0.12)',
  },
  dermoeczanem: {
    label: 'Dermoeczanem',
    color: '#00A99D',
    bg: '#E6F9F7',
    textOnBg: '#008A80',
    logo: '/logos/dermoeczanem.svg',
    gridLine: 'rgba(0,169,157,0.12)',
  },
  gratis: {
    label: 'Gratis',
    color: '#E91E63',
    bg: '#FDE8EF',
    textOnBg: '#C2185B',
    logo: '/logos/gratis.svg',
    gridLine: 'rgba(233,30,99,0.12)',
  },
  rossmann: {
    label: 'Rossmann',
    color: '#D40E14',
    bg: '#FDECEC',
    textOnBg: '#B80C11',
    logo: '/logos/rossmann.svg',
    gridLine: 'rgba(212,14,20,0.12)',
  },
  watsons: {
    label: 'Watsons',
    color: '#00703C',
    bg: '#E6F4ED',
    textOnBg: '#005C31',
    logo: '/logos/watsons.svg',
    gridLine: 'rgba(0,112,60,0.12)',
  },
};

const FALLBACK: PlatformBrand = {
  label: 'Diğer',
  color: '#6B7280',
  bg: '#F3F4F6',
  textOnBg: '#4B5563',
  logo: '',
  gridLine: 'rgba(107,114,128,0.12)',
};

function getPlatform(key: string): PlatformBrand {
  return PLATFORMS[key] || FALLBACK;
}

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

  // Area fill path (line + close to bottom)
  const areaForPlatform = (platform: PlatformData) => {
    if (platform.points.length < 2) return '';
    const first = platform.points[0];
    const last = platform.points[platform.points.length - 1];
    const linePts = platform.points
      .map((pt) => `${xScale(pt.date).toFixed(1)},${yScale(pt.price).toFixed(1)}`)
      .join(' L');
    return `M${linePts} L${xScale(last.date).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L${xScale(first.date).toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;
  };

  const handleMouseMove = (
    e: React.MouseEvent<SVGSVGElement>,
    platform: string,
    points: PricePoint[],
  ) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;

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
        <h3 className="label-caps text-on-surface-variant tracking-[0.2em]">Fiyat Takip</h3>
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
          <p className="label-caps text-score-high mb-1">En Düşük</p>
          <p className="text-base font-bold text-score-high">{formatTL(data.global_min)}</p>
        </div>
        <div className="bg-surface-container-low rounded-sm p-3 text-center">
          <p className="label-caps text-score-low mb-1">En Yüksek</p>
          <p className="text-base font-bold text-score-low">{formatTL(data.global_max)}</p>
        </div>
        <div className="bg-surface-container-low rounded-sm p-3 text-center">
          <p className="label-caps text-on-surface-variant mb-1">Ortalama</p>
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

          {/* Platform area fills + lines */}
          {data.platforms.map((platform) => {
            const brand = getPlatform(platform.platform);
            const isHovered = hoveredPlatform === platform.platform;
            const isDimmed = hoveredPlatform && !isHovered;

            return (
              <g key={platform.platform}>
                {/* Gradient area fill */}
                <defs>
                  <linearGradient id={`grad-${platform.platform}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={brand.color} stopOpacity={isHovered ? 0.2 : 0.08} />
                    <stop offset="100%" stopColor={brand.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path
                  d={areaForPlatform(platform)}
                  fill={`url(#grad-${platform.platform})`}
                  opacity={isDimmed ? 0.05 : 1}
                  className="transition-opacity duration-200"
                />
                {/* Line */}
                <polyline
                  points={pathForPlatform(platform)}
                  fill="none"
                  stroke={brand.color}
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
                {/* End dot */}
                {platform.points.length > 0 && (
                  <circle
                    cx={xScale(platform.points[platform.points.length - 1].date)}
                    cy={yScale(platform.points[platform.points.length - 1].price)}
                    r={isHovered ? 5 : 3.5}
                    fill={brand.color}
                    stroke="#fff"
                    strokeWidth={2}
                    opacity={isDimmed ? 0.2 : 1}
                    className="transition-all duration-200"
                  />
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltip && (() => {
            const brand = getPlatform(tooltip.platform);
            const boxW = 130;
            const boxH = 48;
            const tx = tooltip.x < W / 2 ? tooltip.x + 14 : tooltip.x - boxW - 14;
            const ty = Math.max(8, Math.min(H - boxH - 8, tooltip.y - boxH / 2));
            return (
              <g>
                <circle cx={tooltip.x} cy={tooltip.y} r={6} fill={brand.color} stroke="#fff" strokeWidth={2.5} />
                {/* Vertical guide line */}
                <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + chartH} stroke={brand.color} strokeWidth={1} opacity={0.2} strokeDasharray="4 3" />
                {/* Tooltip box */}
                <rect x={tx} y={ty} width={boxW} height={boxH} rx={6} fill={brand.bg} stroke={brand.color} strokeWidth={1} opacity={0.95} />
                <text x={tx + 10} y={ty + 18} className="text-[11px] font-bold" style={{ fontFamily: 'Manrope, sans-serif' }} fill={brand.textOnBg}>
                  {brand.label}
                </text>
                <text x={tx + 10} y={ty + 36} className="text-[12px] font-bold" style={{ fontFamily: 'Manrope, sans-serif' }} fill={brand.color}>
                  {formatTL(tooltip.price)}
                </text>
                <text x={tx + boxW - 10} y={ty + 36} textAnchor="end" className="text-[9px]" style={{ fontFamily: 'Manrope, sans-serif' }} fill={brand.textOnBg} opacity={0.7}>
                  {new Date(tooltip.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Platform legend with logos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4 pt-4 border-t border-outline-variant/20">
        {data.platforms.map((platform) => {
          const brand = getPlatform(platform.platform);
          const isHovered = hoveredPlatform === platform.platform;
          return (
            <button
              key={platform.platform}
              className="flex items-center gap-2.5 p-2 rounded-md border transition-all duration-200"
              style={{
                borderColor: isHovered ? brand.color : 'transparent',
                backgroundColor: isHovered ? brand.bg : 'transparent',
              }}
              onMouseEnter={() => setHoveredPlatform(platform.platform)}
              onMouseLeave={() => setHoveredPlatform(null)}
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.label}
                  className="h-5 w-auto shrink-0 rounded-sm"
                  style={{ maxWidth: '60px' }}
                />
              ) : (
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: brand.color }}
                />
              )}
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] font-bold truncate" style={{ color: brand.color }}>
                  {formatTL(platform.current)}
                </span>
                {platform.min !== platform.max && (
                  <span className="text-[8px] text-outline truncate">
                    {formatTL(platform.min)} — {formatTL(platform.max)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
