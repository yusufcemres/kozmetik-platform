'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import ThemeToggle from '@/components/public/ThemeToggle';

const TESTS_DROPDOWN = [
  { href: '/cilt-analizi', label: 'Cilt Analizi', icon: 'water_drop', badge: 'AI' },
  { href: '/beslenme-analizi', label: 'Beslenme Analizi', icon: 'nutrition', badge: 'YEN\u0130' },
  { href: '/sac-analizi', label: 'Sa\u00e7 Analizi', icon: 'face_retouching_natural', badge: 'YEN\u0130' },
  { href: '/cilt-yasi-testi', label: 'Cilt Ya\u015f\u0131 Testi', icon: 'timer', badge: 'V\u0130RAL' },
  { href: '/icerik-testi', label: '\u0130\u00e7erik Testi', icon: 'quiz', badge: null },
];

const NAV_ITEMS = [
  { href: '/urunler', label: 'Ke\u015ffet' },
  { href: '/urunler?domain=cosmetic', label: 'D\u0131\u015f Bak\u0131m' },
  { href: '/takviyeler', label: '\u0130\u00e7 Bak\u0131m' },
  { href: '/ihtiyaclar', label: '\u0130htiya\u00e7lar' },
];

const NAV_ITEMS_RIGHT = [
  { href: '/karsilastir', label: 'Kar\u015f\u0131la\u015ft\u0131r' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const pathname = usePathname();
  const exploreRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

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
    setExploreOpen(false);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isTestPath = TESTS_DROPDOWN.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  );

  return (
    <>
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="flex justify-between items-center w-full px-3 sm:px-6 lg:px-12 py-3 sm:py-4 max-w-full">
        {/* Logo */}
        <Link href="/" className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface leading-none">
          REVELA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {/* Direct nav items (left) */}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`label-caps text-xs transition-colors duration-300 ${
                  isActive
                    ? 'text-on-surface border-b-2 border-on-surface pb-1'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Testler dropdown */}
          <div ref={exploreRef} className="relative">
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              className={`label-caps text-xs transition-colors duration-300 flex items-center gap-1 ${
                isTestPath || exploreOpen
                  ? 'text-on-surface border-b-2 border-on-surface pb-1'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Testler
              <span
                className={`material-icon text-[16px] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                expand_more
              </span>
            </button>

            {exploreOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[280px] bg-surface border border-outline-variant/20 rounded-md shadow-2xl p-2 animate-slide-up">
                {TESTS_DROPDOWN.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-icon text-[20px]" aria-hidden="true">{item.icon}</span>
                      <span className="text-sm font-semibold flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-primary text-on-primary text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct nav items (right) */}
          {NAV_ITEMS_RIGHT.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`label-caps text-xs transition-colors duration-300 ${
                  isActive
                    ? 'text-on-surface border-b-2 border-on-surface pb-1'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-300"
            title={resolvedTheme === 'dark' ? 'Aydınlık mod' : 'Karanlık mod'}
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">
              {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Search */}
          <Link
            href="/ara"
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-300"
            title="Ara"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">search</span>
          </Link>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile */}
          <Link
            href="/profilim"
            className="relative text-on-surface-variant hover:text-on-surface transition-colors duration-300"
            title="Profilim"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">person</span>
            {favCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {favCount > 9 ? '9+' : favCount}
              </span>
            )}
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

    </header>

    {/* Mobile overlay menu */}
    {mobileOpen && (
      <div className="md:hidden fixed inset-0 top-[65px] z-[60] bg-[#111111] overflow-y-auto pb-24">
        <nav className="px-6 py-8 space-y-1">
          {/* Main nav */}
          {[...NAV_ITEMS, ...NAV_ITEMS_RIGHT].map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-4 rounded-md transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="uppercase tracking-widest text-xs">{item.label}</span>
                <span className="material-icon material-icon-sm text-white/30" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            );
          })}

          <div className="h-px bg-white/10 my-4" />

          {/* Tests */}
          <p className="label-caps text-white/30 px-4 mb-3 tracking-[0.3em]">Testler</p>
          {TESTS_DROPDOWN.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-md transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-icon text-[20px]" aria-hidden="true">{item.icon}</span>
                <span className="text-xs uppercase tracking-widest flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-primary text-on-primary text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-white/10 my-6" />

          <Link
            href="/profilim"
            className="flex items-center gap-3 px-4 py-4 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">person</span>
            <span className="uppercase tracking-widest text-xs">Profilim</span>
            {favCount > 0 && (
              <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {favCount}
              </span>
            )}
          </Link>

          <div className="h-px bg-white/10 my-4" />

          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors w-full"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">
              {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="uppercase tracking-widest text-xs">
              {resolvedTheme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
            </span>
          </button>
        </nav>
      </div>
    )}
    </>
  );
}
