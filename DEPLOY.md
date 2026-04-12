# REVELA Deploy Rehberi

**Canlı mimari:** Neon (Postgres) + Render (API) + Vercel (Web)

---

## 1. Neon (PostgreSQL)

- Project: `kozmetik-platform`
- Extensions: `pg_trgm` (Smart Scan için migration 005'te kurulur)
- Backup: Neon otomatik — 7 gün point-in-time recovery (free tier)
- Manual dump (haftalık önerilen):
  ```bash
  pg_dump "$DATABASE_URL" > backups/$(date +%Y-%m-%d).sql
  ```

---

## 2. Render (API)

**Service type:** Web Service · Docker · Root: `/`

### Migrations
Her deploy'da otomatik çalışır (`npm run migration:run`). Manuel tetikleme için:
```bash
# Render shell
cd apps/api && npm run migration:run
```
Gerekli migration dosyaları:
- `001_initial.ts` — ana şema
- `002_analytics.ts`
- `003_affiliate_clicks.ts`
- `004_app_users_magic_link.ts` — magic link auth (FAZ 2.5)
- `005_smart_scan.ts` — pg_trgm + unknown_scans + scan_history (FAZ 3)
- `006_push_subscriptions.ts` — web push (FAZ 4)

### Environment Variables

| Variable | Değer | Faz |
|----------|-------|-----|
| `NODE_ENV` | `production` | — |
| `PORT` | `3001` | — |
| `DATABASE_URL` | Neon connection string (`sslmode=require`) | — |
| `JWT_SECRET` | 64-char random | — |
| `JWT_EXPIRY` | `7d` | — |
| `ADMIN_JWT_SECRET` | 64-char random | — |
| `WEB_URL` | `https://revela.com.tr` | — |
| **Magic Link (FAZ 2.5)** | | |
| `APP_JWT_SECRET` | 64-char random (admin JWT'den farklı) | 2.5 |
| `RESEND_API_KEY` | `re_...` — resend.com | 2.5 |
| `MAIL_FROM` | `REVELA <no-reply@revela.com.tr>` | 2.5 |
| **Smart Scan (FAZ 3)** | | |
| `GEMINI_API_KEY` | Google AI Studio key | 3 |
| `ANTHROPIC_API_KEY` | Claude fallback (opsiyonel) | 3 |
| **Push (FAZ 4)** | | |
| `VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` | 4 |
| `VAPID_PRIVATE_KEY` | ↑ aynı komutun çıktısı | 4 |
| `VAPID_SUBJECT` | `mailto:hello@revela.com.tr` | 4 |

### VAPID Üretimi
```bash
npx web-push generate-vapid-keys
# Public key → Vercel NEXT_PUBLIC_VAPID_PUBLIC_KEY + Render VAPID_PUBLIC_KEY
# Private key → sadece Render VAPID_PRIVATE_KEY
```

---

## 3. Vercel (Web)

**Root directory:** `apps/web` · **Framework:** Next.js

### Environment Variables

| Variable | Değer | Faz |
|----------|-------|-----|
| `NEXT_PUBLIC_API_URL` | `https://api.revela.com.tr/api/v1` | — |
| `NEXT_PUBLIC_SITE_URL` | `https://revela.com.tr` | — |
| `NEXT_PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | 6 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Render'daki VAPID_PUBLIC_KEY ile aynı | 4 |

---

## 4. Custom Domain (FAZ 8)

### Domain: `revela.com.tr`
1. **Registrar** (GoDaddy/Namecheap/TurkNic) → alan adı al
2. **Vercel** → Settings → Domains → `revela.com.tr` ekle
   - DNS: A `76.76.21.21` + CNAME `www` → `cname.vercel-dns.com`
3. **Render** → Settings → Custom Domain → `api.revela.com.tr`
   - DNS: CNAME `api` → Render verilen hedef
4. Env güncelle: `WEB_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `MAIL_FROM` domain'ini
5. Manifest `start_url` otomatik (relative)

### SSL
Vercel ve Render otomatik Let's Encrypt sertifikası verir — ek işlem yok.

---

## 5. Backup Stratejisi

| Tür | Yöntem | Sıklık | Retention |
|-----|--------|--------|-----------|
| Point-in-time | Neon built-in | sürekli | 7 gün |
| Manual dump | `pg_dump` → local/Backblaze | haftalık | 3 ay |
| Schema snapshot | git (migrations dosyaları) | her deploy | sınırsız |

Restore testi: ayda bir, local Postgres'e son dump'ı yükle ve migration çalıştır.

---

## 6. Doğrulama

```bash
# API health
curl https://api.revela.com.tr/api/v1/health

# Smart scan (auth'suz, rate-limited)
curl -X POST https://api.revela.com.tr/api/v1/smart-scan \
  -H "Content-Type: application/json" \
  -d '{"barcode":"8690826032556"}'

# Magic link request
curl -X POST https://api.revela.com.tr/api/v1/user-auth/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Web
curl -s -o /dev/null -w "%{http_code}\n" https://revela.com.tr
curl -s -o /dev/null -w "%{http_code}\n" https://revela.com.tr/tara
curl -s -o /dev/null -w "%{http_code}\n" https://revela.com.tr/sitemap.xml
```

### PWA Kontrolü
- Chrome DevTools → Application → Manifest: hata yok, icon'lar yüklü
- Lighthouse → PWA 100/100
- iOS Safari → Paylaş → Ana Ekrana Ekle → standalone açılıyor
