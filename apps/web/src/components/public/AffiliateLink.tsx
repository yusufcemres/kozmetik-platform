'use client';

import { API_BASE_URL as API_BASE } from '@/lib/api';

export default function AffiliateLink({
  href,
  affiliateLinkId,
  sourcePage = 'product_detail',
  className,
  children,
}: {
  href: string;
  affiliateLinkId: number;
  sourcePage?: string;
  className?: string;
  children: React.ReactNode;
}) {
  // Redirect endpoint: click tracking + tracking param injection + 302
  const redirectUrl = `${API_BASE}/r/${affiliateLinkId}`;

  return (
    <a
      href={redirectUrl}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className={className}
    >
      {children}
    </a>
  );
}
