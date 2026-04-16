'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import ThemeToggle from '@/components/public/ThemeToggle';

interface DropdownItem {
  href: string;
  label: string;
  icon?: string;
  badge?: string | null;
}

const TESTS_DROPDOWN: DropdownItem[] = [
  { href: '/cilt-analizi', label: 'Cilt Analizi', icon: 'water_drop', badge: 'AI' },
  { href: '/beslenme-analizi', label: 'Beslenme Analizi', icon: 'nutrition', badge: 'YEN\u0130' },
  { href: '/sac-analizi', label: 'Sa\u00e7 Analizi', icon: 'face_retouching_natural', badge: 'YEN\u0130' },
  { href: '/cilt-yasi-testi', label: 'Cilt Ya\u015f\u0131 Testi', icon: 'timer', badge: 'V\u0130RAL' },
  { href: '/icerik-testi', label: '\u0130\u00e7erik Testi', icon: 'quiz', badge: null },
];

const DIS_BAKIM_DROPDOWN: DropdownItem[] = [
  { href: '/urunler', label: 'T\u00fcm\u00fc', icon: 'grid_view' },
  { href: '/urunler?category=yuz-bakim', label: 'Y\u00fcz Bak\u0131m\u0131', icon: 'face' },
  { href: '/urunler?category=temizleme', label: 'Temizleme', icon: 'water_drop' },
  { href: '/urunler?category=gunes-koruma', label: 'G\u00fcne\u015f Koruma', icon: 'wb_sunny' },
  { href: '/urunler?category=goz-bakim', label: 'G\u00f6z Bak\u0131m\u0131', icon: 'visibility' },
  { href: '/urunler?category=dudak-bakim', label: 'Dudak Bak\u0131m\u0131', icon: 'mood' },
  { href: '/urunler?category=vucut-bakim', label: 'V\u00fccut Bak\u0131m\u0131', icon: 'spa' },
  { href: '/urunler?category=sac-bakim', label: 'Sa\u00e7 & Sa\u00e7 Derisi', icon: 'content_cut' },
  { href: '/urunler?category=makyaj', label: 'Makyaj', icon: 'palette' },
];

const IC_BAKIM_DROPDOWN: DropdownItem[] = [
  { href: '/takviyeler', label: 'T\u00fcm\u00fc', icon: 'grid_view' },
  { href: '/takviyeler?kategori=vitamin-mineral', label: 'Vitamin & Mineral', icon: 'medication' },
  { href: '/takviyeler?kategori=probiyotik', label: 'Probiyotik', icon: 'biotech' },
  { href: '/takviyeler?kategori=bitkisel-takviye', label: 'Bitkisel', icon: 'eco' },
  { href: '/takviyeler?kategori=omega-yag-asitleri', label: 'Omega & Ya\u011f Asitleri', icon: 'water_drop' },
];

const IHTIYACLAR_DROPDOWN: DropdownItem[] = [
  { href: '/ihtiyaclar', label: 'T\u00fcm\u00fc', icon: 'grid_view' },
  { href: '/ihtiyaclar?kategori=skin', label: 'Cilt \u0130htiya\u00e7lar\u0131', icon: 'face' },
  { href: '/ihtiyaclar?kategori=hair', label: 'Sa\u00e7 \u0130htiya\u00e7lar\u0131', icon: 'content_cut' },
  { href: '/ihtiyaclar?kategori=body', label: 'Beden \u0130htiya\u00e7lar\u0131', icon: 'self_improvement' },
  { href: '/ihtiyaclar?kategori=general_health', label: 'Genel Sa\u011fl\u0131k', icon: 'health_and_safety' },
];

interface NavSection {
  key: string;
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
  basePath?: string;
}

const KESFET_DROPDOWN: DropdownItem[] = [
  { href: '/markalar', label: 'Markalar', icon: 'storefront' },
  { href: '/icerikler', label: 'İçerik Maddeleri', icon: 'science' },
  { href: '/rehber', label: 'Rehber', icon: 'menu_book' },
];

const NAV_SECTIONS: NavSection[] = [
  { key: 'dis', label: 'Dış Bakım', dropdown: DIS_BAKIM_DROPDOWN, basePath: '/urunler' },
  { key: 'ic', label: 'İç Bakım', dropdown: IC_BAKIM_DROPDOWN, basePath: '/takviyeler' },
  { key: 'ihtiyac', label: 'İhtiyaçlar', dropdown: IHTIYACLAR_DROPDOWN, basePath: '/ihtiyaclar' },
  { key: 'testler', label: 'Testler', dropdown: TESTS_DROPDOWN },
  { key: 'kesfet', label: 'Keşfet', dropdown: KESFET_DROPDOWN },
  { key: 'karsilastir', label: 'Karşılaştır', href: '/karsilastir' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null);
  const [favCount, setFavCount] = useState(0);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
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
    setOpenDropdown(null);
    setMobileOpenSection(null);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isSectionActive = (section: NavSection) => {
    if (section.href) {
      return section.href === '/'
        ? pathname === '/'
        : pathname === section.href || pathname.startsWith(section.href + '/');
    }
    if (section.basePath) {
      return pathname === section.basePath || pathname.startsWith(section.basePath + '/');
    }
    return section.dropdown?.some(
      (item) => {
        const base = item.href.split('?')[0];
        return pathname === base || pathname.startsWith(base + '/');
      },
    ) ?? false;
  };

  return (
    <>
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="flex justify-between items-center w-full px-3 sm:px-6 lg:px-12 py-3 sm:py-4 max-w-full">
        {/* Logo */}
        <Link href="/" className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface leading-none">
          REVELA
        </Link>

        {/* Desktop nav */}
        <nav ref={navRef} className="hidden md:flex items-center gap-7">
          {NAV_SECTIONS.map((section) => {
            const isActive = isSectionActive(section);
            const isOpen = openDropdown === section.key;

            if (section.href) {
              return (
                <Link
                  key={section.key}
                  href={section.href}
                  className={`label-caps text-xs transition-colors duration-300 ${
                    isActive
                      ? 'text-on-surface border-b-2 border-on-surface pb-1'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {section.label}
                </Link>
              );
            }

            return (
              <div key={section.key} className="relative">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : section.key)}
                  className={`label-caps text-xs transition-colors duration-300 flex items-center gap-1 ${
                    isActive || isOpen
                      ? 'text-on-surface border-b-2 border-on-surface pb-1'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {section.label}
                  <span
                    className={`material-icon text-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </button>

                {isOpen && section.dropdown && (
                  <div className="absolute top-full left-0 mt-4 w-[280px] bg-surface border border-outline-variant/20 rounded-md shadow-2xl p-2 animate-slide-up">
                    {section.dropdown.map((item) => {
                      const base = item.href.split('?')[0];
                      const itemActive = pathname === item.href || pathname === base;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 ${
                            itemActive
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
          {NAV_SECTIONS.map((section) => {
            const isActive = isSectionActive(section);

            if (section.href) {
              return (
                <Link
                  key={section.key}
                  href={section.href}
                  className={`flex items-center justify-between px-4 py-4 rounded-md transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="uppercase tracking-widest text-xs">{section.label}</span>
                  <span className="material-icon material-icon-sm text-white/30" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              );
            }

            const isSectionOpen = mobileOpenSection === section.key;
            return (
              <div key={section.key}>
                <button
                  onClick={() => setMobileOpenSection(isSectionOpen ? null : section.key)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-md transition-all duration-300 ${
                    isActive || isSectionOpen
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="uppercase tracking-widest text-xs">{section.label}</span>
                  <span
                    className={`material-icon material-icon-sm text-white/50 transition-transform duration-200 ${isSectionOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </button>
                {isSectionOpen && section.dropdown && (
                  <div className="pl-3 py-1 space-y-0.5">
                    {section.dropdown.map((item) => {
                      const base = item.href.split('?')[0];
                      const itemActive = pathname === item.href || pathname === base;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 ${
                            itemActive
                              ? 'bg-primary text-on-primary font-semibold'
                              : 'text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="material-icon text-[18px]" aria-hidden="true">{item.icon}</span>
                          <span className="text-xs uppercase tracking-widest flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="bg-primary text-on-primary text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
