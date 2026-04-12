'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/urunler', icon: 'search', activeIcon: 'search', label: 'Keşfet' },
  { href: '/ihtiyaclar', icon: 'healing', activeIcon: 'healing', label: 'İhtiyaçlar' },
  { href: '/tara', icon: 'qr_code_scanner', activeIcon: 'qr_code_scanner', label: 'Tara' },
  { href: '/karsilastir', icon: 'compare_arrows', activeIcon: 'compare_arrows', label: 'Karşılaştır' },
  { href: '/profilim', icon: 'person_outline', activeIcon: 'person', label: 'Profil' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('kozmetik_favorites') || '[]');
        setFavCount(favs.length);
      } catch { setFavCount(0); }
    };
    update();
    window.addEventListener('favorites-changed', update);
    return () => window.removeEventListener('favorites-changed', update);
  }, []);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/20 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const isProfile = tab.href === '/profilim';
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-200 relative ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-icon text-[22px]" aria-hidden="true">
                {isActive ? tab.activeIcon : tab.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
              {isProfile && favCount > 0 && (
                <span className="absolute top-1.5 right-1/2 translate-x-4 bg-error text-on-error text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {favCount > 9 ? '9+' : favCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
