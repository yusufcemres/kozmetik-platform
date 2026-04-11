'use client';

import Link from 'next/link';

// === Types ===

export interface ResultSection {
  title: string;
  icon?: string;
  items: { label: string; detail?: string; type?: 'positive' | 'negative' | 'neutral' }[];
}

export interface QuizResultData {
  headline: string;
  subheadline?: string;
  score?: { value: number; max: number; label: string };
  gauge?: { value: number; label: string; color: string };
  sections: ResultSection[];
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  shareText?: string;
}

// === Component ===

export default function QuizResult({ data }: { data: QuizResultData }) {
  const handleShare = async () => {
    if (!data.shareText) return;
    if (navigator.share) {
      try {
        await navigator.share({ text: data.shareText, url: window.location.href });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${data.shareText}\n${window.location.href}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-on-surface mb-2">
          {data.headline}
        </h1>
        {data.subheadline && (
          <p className="text-on-surface-variant">{data.subheadline}</p>
        )}
      </div>

      {/* Score / Gauge */}
      {data.score && (
        <div className="curator-card p-8 text-center mb-8">
          <div className="text-5xl font-extrabold text-primary mb-1">
            {data.score.value}/{data.score.max}
          </div>
          <p className="text-sm text-on-surface-variant">{data.score.label}</p>
        </div>
      )}

      {data.gauge && (
        <div className="curator-card p-8 text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={data.gauge.color}
                strokeWidth="8"
                strokeDasharray={`${(data.gauge.value / 100) * 327} 327`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-on-surface">
              {data.gauge.value}
            </span>
          </div>
          <p className="text-sm font-medium text-on-surface">{data.gauge.label}</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6 mb-10">
        {data.sections.map((section, si) => (
          <div key={si} className="curator-card p-6">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              {section.icon && (
                <span className="material-icon text-primary" aria-hidden="true">{section.icon}</span>
              )}
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, ii) => (
                <div key={ii} className="flex items-start gap-2">
                  <span className={`text-sm mt-0.5 ${
                    item.type === 'positive' ? 'text-score-high' :
                    item.type === 'negative' ? 'text-score-low' :
                    'text-on-surface-variant'
                  }`}>
                    {item.type === 'positive' ? '✓' : item.type === 'negative' ? '⚠' : '•'}
                  </span>
                  <div>
                    <p className="text-sm text-on-surface">{item.label}</p>
                    {item.detail && (
                      <p className="text-xs text-on-surface-variant">{item.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {data.cta && (
          <Link href={data.cta.href} className="curator-btn-primary text-sm px-8 py-3 text-center">
            {data.cta.label}
            <span className="material-icon material-icon-sm ml-1" aria-hidden="true">arrow_forward</span>
          </Link>
        )}
        {data.secondaryCta && (
          <Link
            href={data.secondaryCta.href}
            className="px-8 py-3 text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm hover:bg-surface-container-low transition-colors text-center"
          >
            {data.secondaryCta.label}
          </Link>
        )}
        {data.shareText && (
          <button
            type="button"
            onClick={handleShare}
            className="px-8 py-3 text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm hover:bg-surface-container-low transition-colors"
          >
            <span className="material-icon material-icon-sm mr-1" aria-hidden="true">share</span>
            Paylas
          </button>
        )}
      </div>
    </div>
  );
}
