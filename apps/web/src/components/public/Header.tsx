'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/urunler', label: 'Ürünler' },
  { href: '/onerilerimiz', label: 'Önerilerimiz', badge: 'AI' },
  { href: '/cilt-analizi', label: 'Cilt Analizi' },
  { href: '/ihtiyaclar', label: 'İhtiyaçlar' },
  { href: '/markalar', label: 'Markalar' },
  { href: '/karsilastir', label: 'Karşılaştır' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const pathname = usePathname();

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="flex justify-between items-center w-full px-6 lg:px-12 py-4 max-w-full">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface">
            REVELA
          </span>
          <span className="text-[8px] md:text-[9px] uppercase tracking-[0.35em] text-outline mt-0.5">
            Kozmetik Analiz
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`label-caps text-xs transition-colors duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-on-surface border-b-2 border-on-surface pb-1'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {item.label}
                {'badge' in item && item.badge && (
                  <span className="bg-primary text-on-primary text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <Link
            href="/ara"
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-300"
            title="Ara"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">search</span>
          </Link>

          {/* Favorites */}
          <Link
            href="/favorilerim"
            className="relative text-on-surface-variant hover:text-error transition-colors duration-300"
            title="Favorilerim"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">
              {favCount > 0 ? 'favorite' : 'favorite_border'}
            </span>
            {favCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-error text-on-error text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favCount > 9 ? '9+' : favCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link
            href="/profilim"
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-300"
            title="Cilt Profilim"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">person</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Menüyü aç"
          >
            <span className="material-icon" aria-hidden="true">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] z-40 bg-surface">
          <nav className="px-6 py-8 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-4 rounded-md transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="uppercase tracking-widest text-xs">{item.label}</span>
                  <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              );
            })}

            <div className="curator-divider my-6" />

            <Link
              href="/favorilerim"
              className="flex items-center gap-3 px-4 py-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">favorite_border</span>
              <span className="uppercase tracking-widest text-xs">Favorilerim</span>
              {favCount > 0 && (
                <span className="bg-error text-on-error text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {favCount}
                </span>
              )}
            </Link>

            <Link
              href="/profilim"
              className="flex items-center gap-3 px-4 py-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">person</span>
              <span className="uppercase tracking-widest text-xs">Cilt Profilim</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
