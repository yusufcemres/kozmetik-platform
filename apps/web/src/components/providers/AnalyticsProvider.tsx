'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { tracker } from '@/lib/analytics';
import type { AnalyticsEventType } from '@/lib/analytics';

interface AnalyticsContextValue {
  track: (
    eventType: AnalyticsEventType,
    props?: { product_id?: number; brand_id?: number; [key: string]: any },
  ) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  track: () => {},
});

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    tracker.init();
    return () => tracker.destroy();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (pathname && pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      tracker.track('page_view');
    }
  }, [pathname]);

  return (
    <AnalyticsContext.Provider value={{ track: tracker.track.bind(tracker) }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
