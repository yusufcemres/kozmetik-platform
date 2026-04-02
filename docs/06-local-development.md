# Lokal Geliştirme Kılavuzu

## Gereksinimler

- Node.js 18+
- pnpm 8+
- Docker Desktop (PostgreSQL + Redis için) veya SKIP_DB modu
- Git

## Kurulum

```bash
# 1. Repo'yu klonla
git clone <repo-url>
cd kozmetik-platform

# 2. Bağımlılıkları yükle
pnpm install

# 3. Environment dosyasını oluştur
cp .env.example .env
```

## Environment Değişkenleri

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=kozmetik
DB_PASS=kozmetik123
DB_NAME=kozmetik_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
API_PORT=3001
API_PREFIX=api/v1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Docker ile Çalıştırma

```bash
# PostgreSQL + Redis başlat
docker compose -f docker/docker-compose.yml up -d

# Migration çalıştır
pnpm --filter api migration:run

# Seed data yükle
pnpm --filter api seed

# API başlat
pnpm --filter api dev

# Frontend başlat (ayrı terminal)
pnpm --filter web dev
```

## Docker Olmadan (SKIP_DB Modu)

Docker yoksa API'yi veritabanı olmadan başlatabilirsiniz:

```bash
# API (DB-dependent modüller devre dışı)
SKIP_DB=true pnpm --filter api dev

# Frontend
pnpm --filter web dev
```

> SKIP_DB=true modunda tüm DB-dependent modüller (Auth, Products, Search, vb.) yüklenmez. Sadece health check çalışır.

## Port Bilgileri

| Servis | Port | URL |
|--------|------|-----|
| API | 3001 | http://localhost:3001/api/v1 |
| Swagger | 3001 | http://localhost:3001/api/docs |
| Frontend | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | — |
| Redis | 6379 | — |

## Proje Komutları

```bash
# Tüm paketleri derle
pnpm build

# API type check
pnpm --filter api exec tsc --noEmit

# Web type check
pnpm --filter web exec tsc --noEmit

# Shared package type check
pnpm --filter shared exec tsc --noEmit

# API dev (watch mode)
pnpm --filter api dev

# Web dev
pnpm --filter web dev

# Lint
pnpm lint
```

## Monorepo Yapısı

```
kozmetik-platform/
├── apps/api/        → NestJS backend (port 3001)
├── apps/web/        → Next.js frontend (port 3000)
├── apps/mobile/     → Expo (Faz 2.5, henüz boş)
├── packages/shared/ → Ortak tipler, enum'lar, sabitler
└── docker/          → docker-compose.yml
```

### Shared Package Kullanımı

`packages/shared` modülü API ve Web projeleri tarafından doğrudan import edilir:

```typescript
import { DomainType, SkinType, getBaseOrderScore } from '@kozmetik/shared';
```

## TypeORM Path Aliases

API projesi `tsconfig.json`'da path alias kullanır:

```json
{
  "@database/*": ["src/database/*"],
  "@common/*": ["src/common/*"],
  "@modules/*": ["src/modules/*"]
}
```

## Sorun Giderme

### "Cannot find module" hatası
```bash
pnpm install
```

### .next cache sorunu
```bash
rm -rf apps/web/.next
pnpm --filter web dev
```

### Port çakışması
```bash
# Linux/Mac
lsof -i :3001
kill -9 <PID>

# Windows
netstat -ano | findstr 3001
taskkill /PID <PID> /F
```
