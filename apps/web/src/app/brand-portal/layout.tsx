'use client';

import { usePathname } from 'next/navigation';

// Auth-free pages that don't need the sidebar layout
const PUBLIC_PATHS = ['/brand-portal/login', '/brand-portal/register'];

export default function BrandPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return <>{children}</>;
  }

  return <BrandPortalShell>{children}</BrandPortalShell>;
}

function BrandPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: '/brand-portal/dashboard', label: 'Özet', icon: 'dashboard' },
    { href: '/brand-portal/products', label: 'Ürünler', icon: 'inventory_2' },
    { href: '/brand-portal/questions', label: 'Sorular', icon: 'forum' },
    { href: '/brand-portal/certificates', label: 'Sertifikalar', icon: 'verified' },
    { href: '/brand-portal/analytics', label: 'Analitik', icon: 'bar_chart' },
    { href: '/brand-portal/settings', label: 'Ayarlar', icon: 'settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('brand_token');
    localStorage.removeItem('brand_account');
    window.location.href = '/brand-portal/login';
  };

  let accountInfo: any = null;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('brand_account');
      if (stored) accountInfo = JSON.parse(stored);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-surface-lowest flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-outline-variant/30 flex flex-col shrink-0">
        <div className="p-4 border-b border-outline-variant/20">
          <a href="/" className="text-lg font-bold text-on-surface">
            REVELA
          </a>
          <p className="text-xs text-on-surface-variant">Marka Portalı</p>
        </div>

        {accountInfo && (
          <div className="px-4 py-3 border-b border-outline-variant/20">
            <p className="text-sm font-medium text-on-surface truncate">
              {accountInfo.brand_name || 'Marka'}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {accountInfo.email}
            </p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
              {accountInfo.plan || 'starter'}
            </span>
          </div>
        )}

        <nav className="flex-1 py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-red-500 transition-colors w-full"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
