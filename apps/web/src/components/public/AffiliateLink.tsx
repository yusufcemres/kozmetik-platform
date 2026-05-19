'use client';

import { API_BASE_URL as API_BASE } from '@/lib/api';
import { GAEvents } from '@/lib/analytics';

export default function AffiliateLink({
  href,
  affiliateLinkId,
  productId,
  platform,
  price,
  sourcePage = 'product_detail',
  className,
  style,
  'aria-label': ariaLabel,
  children,
}: {
  href: string;
  affiliateLinkId: number;
  /** GA4 event'i için opsiyonel — verirse affiliate_click trigger olur. */
  productId?: number;
  platform?: string;
  price?: number;
  sourcePage?: string;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  children: React.ReactNode;
}) {
  // Redirect endpoint: click tracking + tracking param injection + 302
  const redirectUrl = `${API_BASE}/r/${affiliateLinkId}`;

  const handleClick = () => {
    // LAUNCH_CHECKLIST GA4 affiliate_click event (productId + platform varsa)
    if (productId && platform) {
      GAEvents.affiliateClick(platform, productId, price);
    }
  };

  return (
    <a
      href={redirectUrl}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className={className}
      style={style}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
