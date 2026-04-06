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
  const handleClick = () => {
    fetch(`${API_BASE}/products/affiliate-clicks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliate_link_id: affiliateLinkId,
        source_page: sourcePage,
      }),
    }).catch(() => {}); // fire-and-forget
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
