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
| Mobil | Expo (React Native) + TypeScript |
| Monorepo | pnpm workspaces |
| Cron | @nestjs/schedule |
| Rate Limit | @nestjs/throttler |
| Shared | TypeScript interfaces + enums + scoring constants |

## Fazlar

| Faz | Kapsam | Durum |
|-----|--------|-------|
| Faz 1 | Web MVP (17 prompt) | ✅ Tamamlandı |
| Faz 2 | Supplement domain genişleme | ✅ Tamamlandı |
| Faz 2.5 | Mobil uygulama (Expo) | ✅ Tamamlandı |
| Faz 3 | E-ticaret (Affiliate + Fiyat Takip) | ✅ Tamamlandı |
| Faz 4 | B2B API (Key, Rate Limit, Webhook, Export) | ✅ Tamamlandı |

## Temel Kavramlar

- **Product**: Kozmetik ürün (ProductMaster → ProductVariant → Product hiyerarşisi)
- **Ingredient**: INCI içerik maddesi (alias'lar, kanıt bağlantıları)
- **Need**: Kullanıcı cilt ihtiyacı (sivilce, kuruluk, yaşlanma karşıtı vb.)
- **Scoring Engine**: Ürün-ihtiyaç uyumluluk skorları + kişisel profil skoru
- **INCI Ingestion**: Ham INCI text → parse → fuzzy match → DB eşleştirme pipeline'ı
- **Skin Profile**: Anonim kullanıcı profili (localStorage + backend sync)
- **Supplement**: Takviye ürünleri (besin içeriği, etkileşim kontrolü)
- **Affiliate Provider**: Platform bazlı fiyat çekme (Trendyol, Hepsiburada, Amazon TR)
- **Price Tracking**: Otomatik fiyat güncelleme (cron) + fiyat düşüş tespiti
- **B2B API**: API key auth, rate limiting, webhook, bulk data export
