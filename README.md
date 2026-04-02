# Kozmetik Platform

Kozmetik ürünleri, INCI maddeleri ve kullanıcı ihtiyaçlarını birbirine bağlayan arama, filtreleme ve karar destek platformu.

## Gereksinimler

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

## Kurulum

```bash
# 1. Bağımlılıkları kur
pnpm install

# 2. Veritabanı ve Redis'i başlat
docker compose -f docker/docker-compose.yml up -d

# 3. Environment dosyasını oluştur
cp .env.example .env

# 4. Geliştirme sunucularını başlat
pnpm dev
```

API: http://localhost:3001  
Web: http://localhost:3000  
Swagger: http://localhost:3001/api/docs

## Proje Yapısı

```
apps/api/        → NestJS backend (TypeORM + PostgreSQL)
apps/web/        → Next.js frontend (App Router + Tailwind)
apps/mobile/     → Expo React Native (Faz 2.5)
packages/shared/ → Ortak tipler, enum'lar, scoring sabitleri
docker/          → PostgreSQL + Redis compose
docs/            → Teknik dokümantasyon
```

## Ortam Değişkenleri

| Değişken | Varsayılan | Açıklama |
|----------|-----------|----------|
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_USER | kozmetik | DB kullanıcı |
| DB_PASS | kozmetik_dev | DB şifre |
| DB_NAME | kozmetik_platform | DB adı |
| JWT_SECRET | - | JWT imza anahtarı |
| JWT_EXPIRY | 7d | Token süresi |
| REDIS_URL | redis://localhost:6379 | Redis bağlantısı |
| NEXT_PUBLIC_API_URL | http://localhost:3001/api/v1 | Frontend API URL |
| API_PORT | 3001 | Backend port |
| WEB_PORT | 3000 | Frontend port |

## Scriptler

```bash
pnpm dev          # API + Web paralel başlat
pnpm dev:api      # Sadece API
pnpm dev:web      # Sadece Web
pnpm build        # Production build
pnpm db:migrate   # Migration çalıştır
pnpm db:seed      # Seed data yükle
```
