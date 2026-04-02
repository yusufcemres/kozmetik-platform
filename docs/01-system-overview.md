# Sistem Genel Bakış

## Platform Amacı

Kozmetik Platform, kozmetik ürünleri, INCI içerik maddeleri ve kullanıcı cilt ihtiyaçlarını birbirine bağlayan bir **arama, filtreleme ve karar destek platformu**dur. Türkiye'de INCIDecoder/CosDNA karşılığı olarak konumlanmaktadır.

## Mimari

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Next.js     │     │  NestJS      │     │  PostgreSQL   │
│  Frontend    │────→│  API         │────→│  15 + pg_trgm │
│  (SSR/ISR)   │     │  (REST)      │     │               │
└─────────────┘     └─────────────┘     └──────────────┘
       │                   │                    │
       │                   ▼                    │
       │            ┌─────────────┐             │
       │            │  Redis 7    │             │
       │            │  (Cache)    │             │
       │            └─────────────┘             │
       ▼                                        │
┌─────────────┐                                 │
│  Expo Mobile │ ← Faz 2.5 (aynı API)          │
└─────────────┘                                 │
```

## Monorepo Yapısı

```
kozmetik-platform/
├── apps/
│   ├── api/          NestJS backend
│   ├── web/          Next.js frontend
│   └── mobile/       Expo (Faz 2.5)
├── packages/
│   └── shared/       Enums, constants, interfaces
├── docker/           Docker Compose
└── docs/             Bu dokümanlar
```

**Paket yöneticisi:** pnpm workspaces

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript + TypeORM |
| Veritabanı | PostgreSQL 15 + pg_trgm |
| Cache | Redis 7 |
| Auth | JWT (passport-jwt) + bcrypt |
| Monorepo | pnpm workspaces |
| Shared | TypeScript interfaces + enums + scoring constants |

## Fazlar

| Faz | Kapsam | Durum |
|-----|--------|-------|
| Faz 1 | Web MVP (17 prompt) | ✅ Tamamlandı |
| Faz 2 | Supplement domain genişleme | Planlı |
| Faz 2.5 | Mobil uygulama (Expo) | Planlı |
| Faz 3 | E-ticaret entegrasyonu | Planlı |
| Faz 4 | B2B API | Planlı |

## Temel Kavramlar

- **Product**: Kozmetik ürün (ProductMaster → ProductVariant → Product hiyerarşisi)
- **Ingredient**: INCI içerik maddesi (alias'lar, kanıt bağlantıları)
- **Need**: Kullanıcı cilt ihtiyacı (sivilce, kuruluk, yaşlanma karşıtı vb.)
- **Scoring Engine**: Ürün-ihtiyaç uyumluluk skorları + kişisel profil skoru
- **INCI Ingestion**: Ham INCI text → parse → fuzzy match → DB eşleştirme pipeline'ı
- **Skin Profile**: Anonim kullanıcı profili (localStorage + backend sync)
