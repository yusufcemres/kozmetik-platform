import type { AnalyticsEventType, AnalyticsEventPayload } from './events';
import { getOrCreateVisitorId, getOrCreateSessionId, getDeviceType } from './visitor';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const FLUSH_INTERVAL = 30_000; // 30 seconds
const MAX_BATCH = 20;
const RETRY_KEY = 'rv_event_queue';
const MAX_RETRY_QUEUE = 50;

class RevelaTracker {
  private queue: AnalyticsEventPayload[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private visitorId = '';
  private sessionId = '';
  private deviceType: string = 'desktop';
  private initialized = false;

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    this.visitorId = getOrCreateVisitorId();
    this.sessionId = getOrCreateSessionId();
    this.deviceType = getDeviceType();

    // Restore any failed events from previous page
    this.restoreRetryQueue();

    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flush();
    });
    window.addEventListener('beforeunload', () => this.flush());
  }

  track(
    eventType: AnalyticsEventType,
    props?: { product_id?: number; brand_id?: number; [key: string]: any },
  ) {
    if (!this.initialized) return;

    // Refresh session on activity
    this.sessionId = getOrCreateSessionId();

    const { product_id, brand_id, ...rest } = props || {};
    this.queue.push({
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      event_type: eventType,
      product_id,
      brand_id,
      page_path: window.location.pathname,
      properties: Object.keys(rest).length > 0 ? rest : undefined,
      device_type: this.deviceType,
    });

    if (this.queue.length >= MAX_BATCH) this.flush();
  }

  flush() {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0);
    const payload = JSON.stringify({ events: batch });
    const url = `${API_BASE}/analytics/events`;

    // Try sendBeacon first (survives page unload)
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        url,
        new Blob([payload], { type: 'application/json' }),
      );
      if (sent) return;
    }

    // Fallback: fetch with keepalive
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Save failed events to localStorage for retry on next page load
      this.saveToRetryQueue(batch);
    });
  }

  private saveToRetryQueue(events: AnalyticsEventPayload[]) {
    try {
      const existing = JSON.parse(localStorage.getItem(RETRY_KEY) || '[]');
      const merged = [...existing, ...events].slice(-MAX_RETRY_QUEUE);
      localStorage.setItem(RETRY_KEY, JSON.stringify(merged));
    } catch {
      // localStorage full or unavailable — drop events
    }
  }

  private restoreRetryQueue() {
    try {
      const stored = localStorage.getItem(RETRY_KEY);
      if (stored) {
        const events: AnalyticsEventPayload[] = JSON.parse(stored);
        if (events.length > 0) {
          this.queue.push(...events);
          localStorage.removeItem(RETRY_KEY);
        }
      }
    } catch {
      localStorage.removeItem(RETRY_KEY);
    }
  }

  destroy() {
    this.flush();
    if (this.timer) clearInterval(this.timer);
    this.initialized = false;
  }
}

// Singleton
export const tracker = new RevelaTracker();
