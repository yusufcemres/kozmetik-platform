'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';

const EXPLORE_ITEMS = [
  { href: '/urunler', label: 'Kozmetik Ürünler', icon: 'spa', desc: '1900+ kozmetik ürünü' },
  { href: '/takviyeler', label: 'Takviye Ürünler', icon: 'medication', desc: 'Vitamin, mineral & takviyeler' },
  { href: '/onerilerimiz', label: 'Önerilerimiz', icon: 'auto_awesome', desc: 'AI destekli öneriler', badge: 'AI' },
  { href: '/ihtiyaclar', label: 'İhtiyaçlar', icon: 'healing', desc: 'Cilt ihtiyaçlarına göre' },
  { href: '/markalar', label: 'Markalar', icon: 'storefront', desc: '113+ marka' },
  { href: '/icerikler', label: 'İçerik Maddeleri', icon: 'science', desc: '5000+ INCI analizi' },
  { href: '/rehber', label: 'Rehber', icon: 'menu_book', desc: 'Cilt bakım rehberleri' },
  { href: '/beslenme-analizi', label: 'Beslenme Analizi', icon: 'nutrition', desc: 'Takviye ihtiyacını öğren', badge: 'YENİ' },
  { href: '/sac-analizi', label: 'Saç Analizi', icon: 'face_retouching_natural', desc: 'Kişisel saç bakım planı', badge: 'YENİ' },
  { href: '/cilt-yasi-testi', label: 'Cilt Yaşı Testi', icon: 'timer', desc: 'Cildinin gerçek yaşını öğren', badge: 'YENİ' },
  { href: '/icerik-testi', label: 'İçerik Testi', icon: 'quiz', desc: 'Kozmetik bilgini ölç', badge: 'YENİ' },
];

const NAV_ITEMS = [
  { href: '/takviyeler', label: 'Takviyeler' },
  { href: '/cilt-analizi', label: 'Cilt Analizi' },
  { href: '/karsilastir', label: 'Karşılaştır' },
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

  const isExplorePath = EXPLORE_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  );

  return (
    <>
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
          {/* Keşfet dropdown */}
          <div ref={exploreRef} className="relative">
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              className={`label-caps text-xs transition-colors duration-300 flex items-center gap-1 ${
                isExplorePath || exploreOpen
                  ? 'text-on-surface border-b-2 border-on-surface pb-1'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Keşfet
              <span
                className={`material-icon text-[16px] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                expand_more
              </span>
            </button>

            {/* Dropdown */}
            {exploreOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[420px] bg-surface border border-outline-variant/20 rounded-md shadow-2xl p-2 animate-slide-up">
                {EXPLORE_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-icon text-[20px]" aria-hidden="true">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{item.label}</span>
                          {'badge' in item && item.badge && (
                            <span className="bg-primary text-on-primary text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{item.desc}</p>
                      </div>
                      <span className="material-icon text-[16px] text-outline-variant" aria-hidden="true">arrow_forward</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct nav items */}
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
          {/* Keşfet section */}
          <p className="label-caps text-white/30 px-4 mb-3 tracking-[0.3em]">Keşfet</p>
          {EXPLORE_ITEMS.map((item) => {
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
                {'badge' in item && item.badge && (
                  <span className="bg-primary text-on-primary text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-white/10 my-6" />

          {/* Direct nav */}
          {NAV_ITEMS.map((item) => {
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
