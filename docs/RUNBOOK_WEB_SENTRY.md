# Web Sentry Kurulum Runbook (BLOK F16)

API tarafında Sentry zaten aktif ([apps/api/src/main.ts](../apps/api/src/main.ts)). Web tarafı
henüz bağlı değil — production'da frontend hataları görünmüyor.

Kurulum tek komutla yapılır (wizard otomatik conf yazar):

```bash
cd apps/web
npx @sentry/wizard@latest -i nextjs --saas --org revela --project revela-web
```

Wizard şunları oluşturur:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.js` → `withSentryConfig` ile sarılır
- `.env.sentry-build-plugin` (build time upload token — gitignore'a eklenmeli)
- `/sentry-example-page` (kurulum sonrası silinmeli)

## Sonradan yapılacak ayarlar

1. **DSN env'leri** — Vercel project → Settings → Environment Variables:
   - `NEXT_PUBLIC_SENTRY_DSN` (production + preview)
   - `SENTRY_AUTH_TOKEN` (sadece production build step)
2. **Release tracking** — `next.config.js`'te `withSentryConfig` opts:
   ```ts
   { release: { name: process.env.VERCEL_GIT_COMMIT_SHA } }
   ```
3. **Sample rate** — `sentry.client.config.ts`:
   ```ts
   tracesSampleRate: 0.1,
   replaysSessionSampleRate: 0.1,
   replaysOnErrorSampleRate: 1.0,
   ```
4. **Example page silme** — `rm -rf apps/web/src/app/sentry-example-page`
5. **Smoke test** — Deploy sonrası `throw new Error('sentry smoke')` ile bir test hatası at,
   Sentry dashboard'da görünmeli.

## Neden runbook?

Wizard interactive — Claude Code ortamından doğrudan çalışamaz. Organizasyon seçimi,
OAuth login, proje oluşturma adımlarını kullanıcının manuel yapması gerekir. Install
başladıktan sonra tüm configler otomatik oluşur.

Backlog'dan çıkarıldığında `project_kozmetik_platform.md` memory'sine "Web Sentry: DONE"
olarak işaret koy.
