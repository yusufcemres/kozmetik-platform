import { ReactNode } from 'react';

interface AccordionSectionProps {
  title: string;
  icon?: string;
  count?: number | string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export default function AccordionSection({
  title,
  icon,
  count,
  defaultOpen = false,
  children,
  className = 'mb-6',
}: AccordionSectionProps) {
  return (
    <section className={className}>
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
