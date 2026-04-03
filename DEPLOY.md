# Deploy Rehberi

## 1. Railway (API + PostgreSQL)

### A. PostgreSQL Oluştur
1. Railway dashboard → New Project → Add PostgreSQL
2. PostgreSQL plugin'den connection string'i kopyala

### B. Database Seed
Railway PostgreSQL shell'de veya pgAdmin ile:
```bash
psql $DATABASE_URL < apps/api/src/database/seeds/full-dump.sql
```

### C. API Deploy
1. Railway dashboard → New Service → GitHub Repo → kozmetik-platform
2. Root Directory: `/` (monorepo root — Dockerfile kullanılacak)
3. Environment Variables:
   ```
   NODE_ENV=production
   DB_HOST=<railway-pg-host>
   DB_PORT=<railway-pg-port>
   DB_USER=<railway-pg-user>
   DB_PASS=<railway-pg-pass>
   DB_NAME=<railway-pg-name>
   JWT_SECRET=<random-64-char-string>
   JWT_EXPIRY=7d
   WEB_URL=https://kozmetik-platform.vercel.app
   PORT=3001
   ```
4. Deploy → API otomatik build edilir

### D. Custom Domain (opsiyonel)
- Railway Settings → Custom Domain → `api.kozmetikplatform.com`

---

## 2. Vercel (Frontend)

### A. Vercel'e Bağla
1. vercel.com → Import Git Repository → kozmetik-platform
2. Root Directory: `apps/web`
3. Framework Preset: Next.js

### B. Environment Variables
```
NEXT_PUBLIC_API_URL=https://<railway-api-url>/api/v1
```

### C. Build Settings
vercel.json zaten yapılandırılmış. Monorepo'da shared package otomatik build edilir.

### D. Custom Domain (opsiyonel)
- Vercel Settings → Domains → `kozmetikplatform.com`

---

## 3. Doğrulama

Deploy sonrası test:
```bash
# API Health
curl https://<railway-url>/api/v1/health

# Products
curl https://<railway-url>/api/v1/products?limit=3

# Frontend
curl -s -o /dev/null -w "%{http_code}" https://<vercel-url>
curl -s -o /dev/null -w "%{http_code}" https://<vercel-url>/urunler/cerave-moisturising-cream
```

---

## Environment Variables Özet

| Variable | Nerede | Değer |
|----------|--------|-------|
| `DB_HOST` | Railway API | Railway PG host |
| `DB_PORT` | Railway API | Railway PG port |
| `DB_USER` | Railway API | Railway PG user |
| `DB_PASS` | Railway API | Railway PG password |
| `DB_NAME` | Railway API | Railway PG database |
| `JWT_SECRET` | Railway API | Random 64 char |
| `NODE_ENV` | Railway API | `production` |
| `WEB_URL` | Railway API | Vercel frontend URL |
| `NEXT_PUBLIC_API_URL` | Vercel Web | Railway API URL + `/api/v1` |
