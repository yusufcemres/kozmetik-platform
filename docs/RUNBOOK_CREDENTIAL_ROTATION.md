# Credential Rotation Runbook

**Tetikleyici:** `.env.local.bak` git geçmişinde (`commit f2bc3cf`, 2026-04-14). 21 satır secret push edilmiş.

**Temel ilke:** Kaynakta iptal (rotate) → yeni credential yay → sonra history temizliği. Rotate edilmiş secret'ın eski hali history'de kalsa da ölü bilgidir.

---

## 1. Neon DB Password Reset

1. https://console.neon.tech → project → **Roles** → `neondb_owner` → **Reset password**
2. Yeni connection string'i kopyala (formatta: `postgresql://neondb_owner:<NEW_PWD>@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require`)
3. Eski şifre ile hâlâ bağlanan pooler var mı kontrol et: Neon → **Monitoring** → Active connections

## 2. Sentry DSN Regenerate

1. https://sentry.io/settings/<org>/projects/<project>/keys/ → **Rotate DSN** (yeni key üret, eski deaktif)
2. Yeni DSN'yi kopyala.

## 3. Render Env Update

Servis: `kozmetik-api` (Docker blueprint)

1. Render dashboard → Service → **Environment**
2. Güncelle:
   - `DATABASE_URL` → yeni Neon connection string
   - `SENTRY_DSN` → yeni DSN
3. **Manual Deploy** (Clear cache & deploy) → healthcheck yeşili bekle (~3 dk).

## 4. Vercel Env Update

Proje: `kozmetik-platform`

1. Vercel → Project → **Settings** → **Environment Variables**
2. Production scope'ta güncelle:
   - `NEXT_PUBLIC_API_URL` değişmez (Render URL aynı)
   - Eğer web'de `DATABASE_URL`/`SENTRY_DSN` varsa (BLOK F16 sonrası olacak) onları da güncelle
3. **Redeploy** (cache'siz).

## 5. Local .env Güncelle

```bash
cd "c:/Users/Yusuf Cemre/OneDrive/Desktop/kozmetik-platform"
# apps/api/.env ve apps/web/.env.local dosyalarındaki DATABASE_URL ve SENTRY_DSN değerlerini güncelle
# (elle editör aç, .env dosyaları zaten .gitignore'da)
```

## 6. Doğrulama

```bash
# API healthcheck
curl -i https://kozmetik-api.onrender.com/api/v1/health
# Yeni DSN ile test event
# (Sentry init çalışıyorsa otomatik heartbeat gelir)
```

## 7. Git History Temizliği (OPSİYONEL — kaynak rotate edildi, artık düşük öncelikli)

**Uyarı:** Destructive. Force-push gerektirir. Başka contributor yoksa yap, varsa koordinasyon iste.

### Seçenek A — BFG Repo-Cleaner (önerilen, hızlı)

```bash
# 1. Bare clone al
cd /tmp
git clone --mirror git@github.com:yusufcemres/kozmetik-platform.git

# 2. BFG indir (https://rtyley.github.io/bfg-repo-cleaner/)
# java -jar bfg.jar --delete-files '.env.local.bak' kozmetik-platform.git

# 3. Reflog + GC
cd kozmetik-platform.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Force push
git push --force
```

### Seçenek B — git filter-repo

```bash
pip install git-filter-repo
cd kozmetik-platform
git filter-repo --invert-paths --path .env.local.bak
git push --force --all
```

### Sonra

- `git log --all -- .env.local.bak` boş olmalı.
- Tüm developer'lar fresh clone alacak (eski clone'lar kirli history içerir).

---

## Kontrol Listesi

- [ ] Neon password reset
- [ ] Sentry DSN rotate
- [ ] Render env güncel + deploy yeşil
- [ ] Vercel env güncel + deploy yeşil
- [ ] Local .env güncel
- [ ] API healthcheck 200
- [ ] (Opsiyonel) Git history temizlendi + force push
- [ ] `MORNING_REPORT_2026-04-14.md` §3 "çözüldü" notu eklendi
