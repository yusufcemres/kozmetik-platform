'use client';

import { useEffect, useRef } from 'react';
import { trackRecentlyViewed } from '@/components/public/RecentlyViewed';
import { useAnalytics } from '@/components/providers/AnalyticsProvider';

export default function ProductViewTracker({
  product_id,
  product_name,
  product_slug,
  brand_name,
  brand_id,
  image_url,
}: {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
  brand_id?: number;
  image_url?: string;
}) {
  const { track } = useAnalytics();
  const startTime = useRef(Date.now());
  const scrollMilestones = useRef(new Set<number>());

  useEffect(() => {
    trackRecentlyViewed({ product_id, product_name, product_slug, brand_name, image_url });

    // Track product view
    track('product_view', { product_id, brand_id });

    // Scroll depth tracking
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.round((scrollTop / docHeight) * 100);
      for (const milestone of [25, 50, 75, 100]) {
        if (pct >= milestone && !scrollMilestones.current.has(milestone)) {
          scrollMilestones.current.add(milestone);
          track('product_scroll', { product_id, brand_id, depth: milestone });
        }
      }
    };

    // Section visibility tracking
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = (entry.target as HTMLElement).dataset.analyticsSection;
            if (section) {
              track('product_section_view', { product_id, brand_id, section });
              sectionObserver.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.3 },
    );

    // Find and observe sections with data-analytics-section attribute
    setTimeout(() => {
      document.querySelectorAll('[data-analytics-section]').forEach((el) => {
        sectionObserver.observe(el);
      });
    }, 500);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Time-on-page tracking on leave
    const handleLeave = () => {
      const duration_ms = Date.now() - startTime.current;
      track('product_view', { product_id, brand_id, duration_ms, is_leave: true });
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleLeave();
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sectionObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product_id]);

  return null;
}
