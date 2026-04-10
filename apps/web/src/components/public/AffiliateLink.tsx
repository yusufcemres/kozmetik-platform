'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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
