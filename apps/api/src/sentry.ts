import * as Sentry from '@sentry/nestjs';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release:
      process.env.SENTRY_RELEASE ||
      process.env.RENDER_GIT_COMMIT ||
      undefined,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations: [],
  });
}
