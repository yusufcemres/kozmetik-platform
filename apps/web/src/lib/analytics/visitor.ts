const VISITOR_KEY = 'rv_visitor_id';
const SESSION_KEY = 'rv_session_id';
const SESSION_TS_KEY = 'rv_session_ts';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const now = Date.now();
  const lastActivity = Number(sessionStorage.getItem(SESSION_TS_KEY) || '0');
  let sid = sessionStorage.getItem(SESSION_KEY);

  // Expire session after 30min inactivity
  if (!sid || now - lastActivity > SESSION_TIMEOUT_MS) {
    sid = Math.random().toString(36).slice(2, 14);
    sessionStorage.setItem(SESSION_KEY, sid);
  }

  sessionStorage.setItem(SESSION_TS_KEY, String(now));
  return sid;
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}
