# LOCAL HANDOFF — REVELA / Kozmetik Platform

> Sıfırdan, başka bir geliştiricinin makinesinde projeyi **uçtan uca, gerçek
> özelliklerle** çalıştırması için hazırlanmıştır. Ne mock, ne stub — gerçek
> NestJS API + gerçek PostgreSQL + (opsiyonel) gerçek Redis cache + gerçek
> Next.js frontend.

---

## 0. Stack özeti

| Katman | Teknoloji | Lokal port | Prod |
|--------|-----------|-----------|------|
| Web | Next.js 14 (App Router) | 3000 | Vercel |
| API | NestJS 11 + TypeORM | 3001 | Render (Docker) |
| DB | PostgreSQL 15 + `pg_trgm` | 5432 | Neon (Frankfurt) |
| Cache | Redis 7 (opsiyonel) | 6379 | Upstash (Frankfurt) |
| Mobile | Expo SDK 52 | 8081 | EAS / Expo Go |
| Worker | Cloudflare Workers (OG scraper) | — | wrangler deploy |

- **Package manager:** pnpm 9+ (workspace, `pnpm-workspace.yaml` ile 4 paket)
- **Node:** 20.x (`.nvmrc`)
- **Vercel-spesifik özellik kullanılmıyor** → `vercel dev`'e gerek yok, `next dev` yeter.

---

## 1. Sıfırdan Kurulum (15-20 dk)

### 1.1 Ön gereksinimler

```bash
# Node 20 (nvm önerilir)
nvm install 20
nvm use

# pnpm 9
corepack enable
corepack prepare pnpm@9 --activate

# Docker Desktop kurulu ve çalışıyor olmalı
docker --version
docker compose version
```

### 1.2 Repo + bağımlılıklar

```bash
git clone <repo-url> kozmetik-platform
cd kozmetik-platform
pnpm install        # ~3 dk; lockfile sıkı, --frozen-lockfile gerekli değil
```

### 1.3 Environment dosyalarını oluştur

```bash
# Tek bir root .env (API ve seed scriptleri okur)
cp .env.example .env

# Web app için Next.js'in .env.local'i (NEXT_PUBLIC_* burada da olmalı)
cp apps/web/.env.example apps/web/.env.local
```

`.env` içinde **mutlaka** doldur:

```bash
# Bash ile rastgele JWT secret üret:
openssl rand -hex 32
# Çıktıyı .env içinde JWT_SECRET=... olarak yapıştır.
```

`apps/web/.env.local` zaten lokal default'larla geliyor — Sentry/GA4
kullanmıyorsan dokunma.

### 1.4 Postgres + Redis'i ayağa kaldır

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis

# Hazır mı? (10-15 sn)
docker compose -f docker/docker-compose.yml ps
docker exec kozmetik-postgres pg_isready -U kozmetik -d kozmetik_platform
```

> `docker/init.sql` ilk başlatmada `pg_trgm` extension'ı kuruyor. Eğer
> daha önce çalıştırdıysan ve elle DB sildiysen volume'u da temizle:
> `docker compose -f docker/docker-compose.yml down -v`

### 1.5 Migration + seed (sıralı, **bu sıra önemli**)

API ilk boot'ta migration'ları otomatik çalıştırır (`DB_MIGRATIONS_RUN=true`).
Manuel istersen:

```bash
# 27 migration (000_extensions → 026_affiliate_quarantine)
pnpm db:migrate

# Seed: admin user + temel taksonomi (ingredients, brands, needs, kategoriler,
# scoring config, sample skin profile, ingredient interactions)
pnpm db:seed
```

Seed BAŞARILI olduğunda konsola şu yazılır:
```
Admin login: admin@kozmetik.com / SuperAdmin123!
```

> **Not:** Seed sadece şablon/temel data ekler. **Prod'daki 1785 ürün, 113
> marka, 5000+ ingredient datası bu seed'de YOK.** Lokal'de gerçek katalogla
> çalışman gerekiyorsa:
> 1. Prod Neon DB'den `pg_dump` al ve lokal'e restore et (önerilir)
> 2. Veya `apps/api/src/database/seeds/scrape-*.js` scriptlerini çalıştır
>    (TAVILY_API_KEY, GOOGLE_API_KEY vb. gerekir — pahalı + yavaş)

### 1.6 Dev sunucularını başlat

```bash
pnpm dev
```

Bu komut:
- `apps/api` → `nest start --watch` (3001'de)
- `apps/web` → `next dev --port 3000` (3000'de)

İki sunucu da hazır olduğunda:

| URL | Beklenen |
|-----|----------|
| http://localhost:3001/api/v1/health | `{"status":"ok","db":"connected","redis":"connected"}` |
| http://localhost:3001/api/docs | Swagger UI |
| http://localhost:3000 | Anasayfa |
| http://localhost:3000/admin/login | Admin login (admin@kozmetik.com / SuperAdmin123!) |
| http://localhost:3000/brand-portal | Marka paneli |

---

## 2. Production-like lokal çalıştırma

```bash
pnpm build                                    # shared → api → web
NODE_ENV=production pnpm --filter api start:prod
NODE_ENV=production pnpm --filter web start
```

Veya tüm stack docker compose ile (`docker/docker-compose.yml` → `api` ve
`web` servisleri Render/Vercel-benzeri build alır):

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

> Production CORS modu aktif olur (`NODE_ENV=production`); `WEB_URL` env
> değişkenindeki origin'leri allow eder. Lokal'de test ederken
> `WEB_URL=http://localhost:3000` set et yoksa frontend → API CORS hatası.

---

## 3. Hangi env değişkeni ne için (KOD'DA gerçekten kullanılan)

### 3.1 ZORUNLU (gerçek değer şart, dummy çalışmaz)

| Değişken | Nerede | Neden |
|----------|--------|-------|
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASS` `DB_NAME` | `apps/api/src/app.module.ts:52-56` | TypeORM connection — DB olmadan **0 modül yüklenir** (SKIP_DB=true zorlanır) |
| `JWT_SECRET` | `auth.module.ts:19`, `brand-portal.module.ts:36`, `user-auth/app-jwt.strategy.ts:22`, `auth/strategies/jwt.strategy.ts:25` | Üç farklı JWT stratejisi (admin/brand/app-user) aynı secret'ı kullanır. `change-me` default'u sadece dev'de uyarı verir, prod'da güvenlik açığı. |
| `NEXT_PUBLIC_API_URL` | `apps/web/src/lib/api.ts:2` + 14 başka dosya, `next.config.js:37` (rewrite + CSP) | Tüm web → API çağrıları + CSP `connect-src` |

### 3.2 ZORUNLU (lokal default'lar yeterli)

| Değişken | Default | Notlar |
|----------|---------|--------|
| `NODE_ENV` | `development` | `production` set edersen CORS sıkılaşır |
| `PORT` / `API_PORT` | `3001` | API listen portu |
| `WEB_URL` | `http://localhost:3000` | Prod CORS allow listesi |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | sitemap, robots, JSON-LD |
| `DB_MIGRATIONS_RUN` | `true` | API boot'ta TypeORM migrate |
| `DB_SYNC` | `false` | **Asla `true` yapma** — TypeORM auto-sync prod schema'yı bozar |
| `DB_SSL` | `false` | Lokal Postgres için false; Neon için true |
| `SWAGGER_PUBLIC` | `true` | `/api/docs` erişilebilirliği |

### 3.3 OPSİYONEL — yoksa o özellik graceful disable olur

| Değişken | Yoksa ne olur |
|----------|---------------|
| `REDIS_URL` | `cache.service.ts:13` "cache disabled" log'lar; skor cache çalışmaz, sadece daha yavaş olur. **Çalışmasını engellemez.** |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | `sentry.ts:4` no-op döner; error tracking yok |
| `NEXT_PUBLIC_GA4_ID` | `layout.tsx:77` GA tag'i render etmez |
| `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` | `vision.service.ts` smart-scan endpoint'leri "vision unavailable" döner; geri kalan API çalışır |
| `TRENDYOL_AFFILIATE_ID`, `HEPSIBURADA_AFFILIATE_ID`, `AMAZON_ASSOCIATE_TAG` | `affiliate-redirect.controller.ts:86` `/r/:id` redirect URL'lere partner param eklenmez; redirect yine çalışır |
| `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_KEY` | Push notification subscribe başarısız olur; rest çalışır |
| `TAVILY_API_KEY`, `GOOGLE_API_KEY` `GOOGLE_CX`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Sadece manuel scraper/audit scriptleri için. API runtime hiç dokunmaz |
| `MOBILE_URL`, `VERCEL_URL` | Prod CORS'ta opsiyonel ek origin'ler |
| `EXPO_PUBLIC_WEB_URL` | Mobile app deeplink base; mobile'ı çalıştırmıyorsan boşver |

### 3.4 SADECE DEPLOY ortamında set edilen (lokal'de set ETME)

| Değişken | Kim set eder |
|----------|--------------|
| `RENDER_GIT_COMMIT`, `RENDER_GIT_BRANCH` | Render runtime — `health.controller.ts:35-37` build SHA göstermek için |
| `VERCEL_GIT_COMMIT_SHA` | Vercel runtime — Sentry release tag'i |
| `BUILD_SHA`, `BUILD_TIME` | CI/CD pipeline opsiyonu |

---

## 4. Sana manuel iletmem gereken şeyler (sahibinden iste)

> Lokal'de **dummy değerle çalışacak** olan env'leri bu listeye **EKLEMEDİM**.
> Aşağıdakiler sadece prod'la birebir aynı veriyle çalışmak istersen lazım.

### 4.1 Lokal kurulum için ZORUNLU değil ama eğer prod'a benzer test istiyorsan:

| İsim | Ne | Risk |
|------|------|------|
| `DATABASE_URL` (Neon prod) | Tüm 1785 ürün + 8.8k affiliate + kullanıcı verisi | **PROD'A YAZAR** — read-only ROL kullan veya pg_dump al |
| `JWT_SECRET` (prod ile aynı) | Prod admin token forge edebilir | Lokal'de **kendi secret'ını üret**, prod'unkini kullanma |
| `REDIS_URL` (Upstash prod) | Skor cache'ini paylaşır | Lokal'de docker redis veya boş bırak |

### 4.2 Eğer şu özellikleri test edeceksen:

| Özellik | Gereken |
|---------|---------|
| Smart-scan (kamera ile ürün okuma) | `GEMINI_API_KEY` veya `ANTHROPIC_API_KEY` |
| Affiliate gerçek redirect | `TRENDYOL_AFFILIATE_ID`, `HEPSIBURADA_AFFILIATE_ID`, `AMAZON_ASSOCIATE_TAG` |
| Push notifications | `VAPID_PRIVATE_KEY` + `NEXT_PUBLIC_VAPID_KEY` (lokal'de `npx web-push generate-vapid-keys`) |
| Sentry error tracking | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` |
| GA4 analytics | `NEXT_PUBLIC_GA4_ID` |
| OG image scraper worker | Cloudflare API token (`workers/og-image-scraper/wrangler.toml`) |
| Image scraping seeds | `TAVILY_API_KEY`, `GOOGLE_API_KEY` + `GOOGLE_CX` |
| Telegram alerts (audit scripts) | `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` |

### 4.3 Erişim/hesap bilgisi (sahip ayrıca paylaşmalı)

- Neon dashboard erişimi (eğer prod DB'ye okuma izni verecekse)
- Vercel projesi (eğer deploy görmek isteyecekse) — `kozmetik-platform.vercel.app`
- Render servisi (`kozmetik-api`) erişimi — opsiyonel
- Upstash dashboard — opsiyonel
- Sentry projesi — opsiyonel
- GitHub repo erişimi (zaten clone ettiyse OK)

---

## 5. Operasyon Sırası (cheat sheet)

```bash
# Sıfırdan, ilk kez:
nvm use && corepack enable
pnpm install
cp .env.example .env && cp apps/web/.env.example apps/web/.env.local
# .env içinde JWT_SECRET'ı doldur
docker compose -f docker/docker-compose.yml up -d postgres redis
pnpm db:migrate              # opsiyonel — pnpm dev ilk boot'ta da yapar
pnpm db:seed                 # admin user + taksonomi
pnpm dev

# Sonraki günler:
docker compose -f docker/docker-compose.yml up -d postgres redis
pnpm dev

# Reset (DB'yi temiz başlat):
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d postgres redis
pnpm db:migrate && pnpm db:seed

# Production-like lokal:
pnpm build
NODE_ENV=production pnpm --filter api start:prod &
NODE_ENV=production pnpm --filter web start
```

---

## 6. Local URLs / Webhooks / Callbacks

| Tür | URL |
|-----|-----|
| Web anasayfa | http://localhost:3000 |
| Web admin | http://localhost:3000/admin |
| Web brand portal | http://localhost:3000/brand-portal |
| Web api proxy | http://localhost:3000/api/proxy/* → API |
| API root | http://localhost:3001/api/v1 |
| API health | http://localhost:3001/api/v1/health |
| API swagger | http://localhost:3001/api/docs |
| API affiliate redirect | http://localhost:3001/api/v1/r/:linkId |
| Postgres | localhost:5432 (kozmetik / kozmetik_dev / kozmetik_platform) |
| Redis | localhost:6379 |

**Auth callback yok** — JWT tabanlı, OAuth/SAML/OIDC entegrasyonu yok.
**Webhook receiver yok** — gelen webhook endpoint yok. (Affiliate
redirect tek dış-yönlü tracking.)

---

## 7. Vercel-spesifik davranış

**TL;DR:** Lokal'de `next dev` yeter. `vercel dev` GEREKMİYOR.

Repo'da Vercel-spesifik şu özellikler **kullanılmıyor**:
- Edge Functions yok (`runtime: 'edge'` hiçbir route'da yok)
- `middleware.ts` yok
- Vercel KV / Vercel Blob / Vercel Postgres yok
- Vercel Cron yok (Cron Render'da `@nestjs/schedule` üzerinden)
- Image Optimization standart Next.js (`next/image`) — `next.config.js`'te
  `remotePatterns` whitelist mevcut

`apps/web/vercel.json` sadece monorepo install/build path'lerini ayarlıyor:

```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm --filter shared build && cd apps/web && pnpm next build"
}
```

Lokal'de bu zaten `pnpm install` + `pnpm build` ile aynı sonucu verir.

`next.config.js` rewrites/headers (CSP, cache-control, ISR) **lokal'de de
geçerli** — `next dev` bunları çalıştırır. Yani arkadaşının lokal'de
gördüğü davranış prod ile birebir aynıdır (CDN cache hariç).

---

## 8. Sık karşılaşılan hatalar ve çözümler

| Hata | Sebep | Çözüm |
|------|-------|-------|
| `pnpm install` çok yavaş veya `EBADENGINE` | Node 18 kullanıyor | `nvm use` (`.nvmrc`'de 20 yazıyor) |
| API boot: `password authentication failed for user "kozmetik"` | Postgres henüz hazır değil veya DB_USER eski volume'la uyuşmuyor | `docker compose down -v && up -d postgres` ile temiz başlat |
| API boot: `relation "..." does not exist` | Migration çalışmadı | `DB_MIGRATIONS_RUN=true` mi? Manuel: `pnpm db:migrate` |
| API boot: `Redis: ECONNREFUSED 127.0.0.1:6379` | Redis container yok | Cache opsiyonel — `REDIS_URL`'i `.env`'den sil; veya `docker compose up -d redis` |
| Web → API `CORS` hatası | `NODE_ENV=production` set edilmiş, `WEB_URL` boş | Dev'de `NODE_ENV=development` kalsın, prod-like test'te `WEB_URL=http://localhost:3000` |
| Web build/dev "Module not found: shared" | `packages/shared` build edilmemiş | `pnpm --filter shared build` |
| `pnpm dev:web` 3000 dolu | Eski next process | Windows: `netstat -ano \| findstr :3000` → `taskkill /F /PID <pid>`. mac/linux: `lsof -ti:3000 \| xargs kill` |
| Migration `pg_trgm extension not available` | `init.sql` çalışmamış (volume eski) | `docker compose down -v && up -d postgres` |
| Admin paneline giriş 401 | Seed çalışmamış veya `JWT_SECRET` middleware'de farklı | Seed'i çalıştır + her iki tarafta aynı `JWT_SECRET` |
| Smart-scan endpoint 503 | `GEMINI_API_KEY` ve `ANTHROPIC_API_KEY` ikisi de yok | İkisinden birini set et |
| Next.js `Image optimization` 500 (lokal) | Hostname `next.config.js` whitelist'te değil | Yeni hostname ekle veya `unoptimized` ile geç |
| `pnpm db:seed` "permission denied" | DB'de `admin_users` tablosu yok | Önce `pnpm db:migrate` çalıştır |
| Mobile (Expo) build "Cannot find module 'shared'" | Shared `react-native` field'ı `src/index.ts` veriyor; build gerekmez | `apps/mobile`'da metro config OK olmalı; sorun olursa `pnpm --filter shared build` |

---

## 9. GÜVENLİK UYARILARI (handoff yapmadan önce oku)

### 9.1 Repo'da plaintext duran prod credential'lar

| Dosya | Değer | Risk |
|-------|-------|------|
| [`render.yaml:20`](./render.yaml) | Neon DB password | **prod DB write erişimi** |
| [`render.yaml:28`](./render.yaml) | JWT_SECRET | **prod admin token forge** |
| `apps/api/src/database/seeds/*.js` (27 dosya) | Neon DB URL fallback | seed scripti yanlışlıkla prod'a yazar |
| `apps/api/src/database/seeds/scrape-missing-tavily.js:13` | Tavily API key | abuse / quota |
| `apps/api/src/database/seeds/seed.ts:37` | `SuperAdmin123!` admin şifresi | tahmin edilebilir |

### 9.2 Handoff öncesi yapılması gereken (sahip)

1. **Repo private mi?** Public ise:
   - Neon password → ROTATE (Neon dashboard → reset)
   - JWT_SECRET → ROTATE (Render env)
   - Tavily key → ROTATE
   - Git history'den temizle (`git-filter-repo` veya BFG)
2. **Arkadaşa prod credential VERME.** LOCAL_HANDOFF talimatlarına göre
   docker compose ile lokal Postgres kursun. Prod-benzer test gerekirse
   Neon **branch** aç (Neon free tier branch'leme destekler — prod'dan
   izole edilmiş read-only kopya).
3. **Arkadaş'ın oluşturacağı `.env`'ler `.gitignore`'da** (✓ doğrulandı).
4. **Default admin şifresini** lokal'de hemen değiştirsin
   (`admin@kozmetik.com / SuperAdmin123!`).

### 9.3 Lokal'de güvenli minimum

```bash
# Lokal'de güvenli config:
DB_HOST=localhost                 # docker'a bağlan, prod'a değil
DATABASE_URL=                     # boş bırak
JWT_SECRET=$(openssl rand -hex 32) # kendi rastgele secret
REDIS_URL=redis://localhost:6379  # docker redis veya boş
NODE_ENV=development              # CORS gevşek olsun
```

---

## 10. Bonus: prod DB'ye salt okunur erişim (eğer gerekirse)

Sahip Neon dashboard'dan read-only role oluşturup
`DATABASE_URL=postgresql://readonly_user:xxx@host/neondb?sslmode=require`
verebilir. Lokal API'yi bu URL ile başlatırsan:

- Tüm GET endpoint'ler 1785 ürün gerçek datasıyla cevaplar
- Migration boot'ta hata verir (read-only) → `DB_MIGRATIONS_RUN=false` set et
- Admin write endpoint'leri 403 alır → bu zaten istediğin davranış

---

## 11. Checklist: arkadaşa neyi gönderiyorsun

- [x] Repo (clone link veya zip)
- [x] Bu `LOCAL_HANDOFF.md`
- [x] `.env.example` (zaten repo'da)
- [x] `apps/web/.env.example` (zaten repo'da)
- [x] `.nvmrc` (zaten repo'da)
- [ ] Sözlü/mesajla: kendi JWT_SECRET'ını üretmesi gerektiği uyarısı
- [ ] (Opsiyonel) Neon read-only `DATABASE_URL`
- [ ] (Opsiyonel) `GEMINI_API_KEY` — sadece smart-scan test edecekse
- [ ] (Opsiyonel) `pg_dump` snapshot — gerçek katalogla çalışacaksa

---

**Son test:** Bu dosyayı yazdıktan sonra **temiz bir klasörde** sıfırdan
adım adım izleyerek doğrula. `pnpm dev` sonrası `http://localhost:3000`
açılıp ürün listesinin (en azından seed datasıyla) render olduğunu gör.
