'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

interface ProductCarouselProps {
  children: ReactNode;
}

export default function ProductCarousel({ children }: ProductCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface/90 backdrop-blur-sm border border-outline-variant/30 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-on-surface shadow-md transition-all opacity-0 group-hover/carousel:opacity-100"
          aria-label="Sola kaydır"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">chevron_left</span>
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
      >
        {children}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface/90 backdrop-blur-sm border border-outline-variant/30 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-on-surface shadow-md transition-all opacity-0 group-hover/carousel:opacity-100"
          aria-label="Sağa kaydır"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">chevron_right</span>
        </button>
      )}
    </div>
  );
}
