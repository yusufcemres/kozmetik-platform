import { ReactNode } from 'react';

interface AccordionSectionProps {
  title: string;
  icon?: string;
  count?: number | string;
  defaultOpen?: boolean;
  /**
   * Compact mode — kompakt detay sayfası 2-col stack için.
   * - Daha küçük başlık (text-base)
   * - Daha az padding (py-2)
   * - mb-2 (mb-6 yerine)
   * - curator-card (border'lı kart)
   */
  compact?: boolean;
  children: ReactNode;
  className?: string;
}

export default function AccordionSection({
  title,
  icon,
  count,
  defaultOpen = false,
  compact = false,
  children,
  className,
}: AccordionSectionProps) {
  if (compact) {
    return (
      <section className={className ?? ''}>
        <details open={defaultOpen} className="group curator-card overflow-hidden">
          <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden px-3 py-2 hover:bg-surface-container-low/50 transition-colors">
            {icon && (
              <span className="material-icon text-primary text-[14px]" aria-hidden="true">
                {icon}
              </span>
            )}
            <h2 className="text-sm font-semibold text-on-surface flex-1 truncate">{title}</h2>
            {count !== undefined && (
              <span className="label-caps text-outline text-[10px]">{count}</span>
            )}
            <span
              className="material-icon text-outline-variant group-open:rotate-180 transition-transform shrink-0"
              style={{ fontSize: '16px' }}
              aria-hidden="true"
            >
              expand_more
            </span>
          </summary>
          <div className="px-3 pb-3 pt-1 border-t border-outline-variant/15">{children}</div>
        </details>
      </section>
    );
  }

  return (
    <section className={className ?? 'mb-6'}>
      <details open={defaultOpen} className="group">
        <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden py-3 border-b border-outline-variant/20 hover:border-outline-variant/40 transition-colors">
          {icon && (
            <span className="material-icon text-primary text-[18px]" aria-hidden="true">
              {icon}
            </span>
          )}
          <h2 className="text-lg font-semibold text-on-surface flex-1">{title}</h2>
          {count !== undefined && (
            <span className="label-caps text-outline">{count}</span>
          )}
          <span
            className="material-icon text-outline-variant group-open:rotate-180 transition-transform"
            style={{ fontSize: '20px' }}
            aria-hidden="true"
          >
            expand_more
          </span>
        </summary>
        <div className="pt-4">{children}</div>
      </details>
    </section>
  );
}
