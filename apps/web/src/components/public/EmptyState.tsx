import Link from 'next/link';

/**
 * Paylaşımlı boş durum component (Madde 25a).
 *
 * Liste/sonuç sayfalarında 0 kayıt durumunda kullanılır.
 * - icon: Material symbol adı (örn. 'inbox', 'search_off', 'favorite_border')
 * - title: 1 satır başlık
 * - description: açıklama, 1-2 satır
 * - cta: opsiyonel buton — sayfayı ileri taşır (örn. /urunler'e döndür)
 */
export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  cta,
  size = 'md',
}: EmptyStateProps) {
  const padding = size === 'sm' ? 'py-8' : size === 'lg' ? 'py-20' : 'py-14';
  const iconSize = size === 'sm' ? 'text-[36px]' : size === 'lg' ? 'text-[64px]' : 'text-[48px]';

  return (
    <div className={`text-center ${padding} px-4`}>
      <span
        className={`material-icon text-outline-variant ${iconSize} inline-block mb-3`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <h3 className="text-base font-semibold text-on-surface mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed mb-5">
          {description}
        </p>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="inline-block text-sm text-primary hover:underline font-medium"
        >
          {cta.label} →
        </Link>
      )}
    </div>
  );
}
