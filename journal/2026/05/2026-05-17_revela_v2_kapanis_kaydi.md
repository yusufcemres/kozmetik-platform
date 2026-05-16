# REVELA Foto Analiz v2 — Kapanış Kaydı (17 Mayıs 2026 01:15)

> Bu doküman bugünkü oturumun tam fotoğrafı + bayram sonrası dönüldüğünde neyle başlanacağı.
> Bayram öncesi 17-18 May (Pazar-Pazartesi), 19 May Salı tatil, 20 May Çarşamba mesai başı.

---

## 📦 BUGÜN YAPILANLAR (20 commit, tek günde Faz 1 + Faz 2 + Faz 3 dev)

### 3 Production Hotfix
| # | Commit | Konu | Açıklama |
|---|---|---|---|
| 1 | `514998d` | MediaPipe CSP | `/cilt-analizi` yüz tespit 0/100 → CSP'ye cdn.jsdelivr.net + storage.googleapis.com eklendi + landmarker fail fallback |
| 2 | `987ff51` | Vision 503 UX | Gemini quota + Claude key invalid silent çökme → açık 503 + frontend friendly mesaj |
| 3 | `c7f5b4b` | ETIMEDOUT hardening | Redis `maxRetriesPerRequest:null` + offlineQueue bloke + Neon 5s connect → ioredis options + 10s timeout |

### Faz 1 (Foto Analiz MVP — Gün 1-12)
| # | Commit | Gün | İş |
|---|---|---|---|
| 4 | `73e9165` | G8 | INCI öneri kartları + REVELA ürün eşleştirme widget (DB enriched) |
| 5 | `45d6bec` | G9 | Email opt-in + 28-gün reminder cron + Migration 032 |
| 6 | `862b734` | G10 | KVKK aydınlatma modal + Madde 11 hakları (export+delete) |
| 7 | `1dc7481` | G11 prep | README + e2e test checklist |
| 8 | `1abb142` | G11 prep | Manuel test scriptleri (funnel + reminder sim + fixtures rehberi) |
| 9 | `baddc75` | G12 prep | RELEASE_NOTES_FAZ1.md + PR description şablonu |

### Faz 2 (Karşılaştırma + Trend + Paywall + AI Chat + On-Device)
| # | Commit | İş |
|---|---|---|
| 10 | `9a73435` | Karşılaştırma sayfası iskeleti — `/karsilastir` + `GET /me/compare` + RadarChart dual mode |
| 11 | `a03e369` | **#1** Anonim compare token (reminder email auth'suz) |
| 12 | `cff230b` | **#2** Trend history chart (`/trend` + sparkline grid + sürpriz: build fail nedeni TS strict null) |
| 13 | `3913f5c` | **#4** Paywall blur+reveal iskelet (`lib/premium` + `PaywallOverlay`) |
| 14 | `5bd2877` | Build fix — TS strict null guard (anonymous_email FindOptionsWhere) |
| 15 | `f505e26` | **#5** AI Cilt Danışmanı sohbet beta (Claude Sonnet 4.6 + `POST /:id/coach`) |
| 16 | `bcad6dd` | **#3** MediaPipe on-device CV skoru — `lib/skin-analysis/on-device-scorer.ts` (8 ROI + 6 boyut klasik CV) |

### Faz 3 (PayTR + Premium Tier)
| # | Commit | İş |
|---|---|---|
| 17 | `c9823e4` | Backend iskelet — Migration 033 + Payment entity + PaymentsService (token+IPN+hash) + PremiumGuard + Controller |
| 18 | `61183e0` | Frontend — `/odeme` 3 plan + iframe + `/odeme/sonuc` + PaywallOverlay backend bind |
| 19 | `3b2fff7` | Premium dashboard — `/premium` + ödeme geçmişi tablosu + iade mailto |

### Memory + dokümantasyon (commit no önemli değil)
- `project_revela_foto_analiz_v2.md` — Faz 1/2/3 close note 3 kez güncellendi
- `feedback_etimedout_redis_neon_pitfalls.md` — ioredis+Neon tuzak kaydedildi

---

## 🧪 BEKLEYEN TESTLER (kullanıcı tarafı)

### TEST A — Faz 1 G11 E2E Manuel (Bayram sonu 20-21 May)

**Süre:** 60-90 dakika · **Önkoşul:** Render+Vercel canlı (master) + 5 test fotoğrafı hazır

**Detaylı checklist:** `journal/2026/05/2026-05-17_faz1-day11-test-checklist.md`

**Hızlandırıcı otomasyon (scripts/manual-tests/):**
- `test-skin-analysis.mjs` — 5 senaryo API testi
- `test-skin-analysis-funnel.mjs` — subscribe + unsubscribe
- `simulate-28day-reminder.mjs` — DB backdate ile cron simüle
- `fixtures/README.md` — test foto setup rehberi

**Test alanları:**
1. **Pre-flight (5dk):** `/api/v1/healthz` + Vercel render + Render log temiz + env vars (GEMINI/ANTHROPIC/RESEND/SITE_URL/DB) set
2. **KVKK consent flow (10dk):** PhotoConsentModal 2 checkbox + audit log CONSENT_UPDATE
3. **5 foto senaryosu (30dk):** net/karanlık/bulanık/yüz-yok/mobile-webp
4. **Email funnel (10dk):** opt-in → welcome mail → unsubscribe token
5. **28-gün reminder cron (15dk):** SQL backdate + reminder mail
6. **KVKK Madde 11 (10dk):** export JSON download + delete (2-adımlı onay)
7. **Regresyon smoke (10dk):** `/tara` smart-scan + `/urunler/<slug>` 500 yok

### TEST B — Faz 2 Yeni Özellik Smoke (Bayram sonu)

**Süre:** 30 dakika

- [ ] `/cilt-analizi/foto-test` → **"⚡ Lokal Analiz"** toggle ON → foto çek → Vision'a gitmeden ~50ms'de sonuç + mavi rozet
- [ ] Result sayfasında **"Eski Analizimle Karşılaştır"** CTA → `/karsilastir?to=X` → dual radar + delta tablo (paywall blur)
- [ ] **"Tüm Trendi Gör"** → `/trend` → 3+ analiz varsa sparkline grid, 1-2 varsa empty state
- [ ] Karşılaştırma sayfasında **AI Cilt Danışmanı** widget → paywall altı → "Premium ile Aç" → `/odeme`
- [ ] Reminder email link simüle: `/karsilastir?token=<unsub_token>&to=<id>` → auth'suz çalışıyor mu?

### TEST C — Faz 3 PayTR Canlı Test (PayTR onayı geldikten sonra)

**Önkoşul:** PayTR merchant onayı + Render env vars set

```bash
# Render → Environment → Add
PAYTR_MERCHANT_ID=xxxxx
PAYTR_MERCHANT_KEY=xxxxx
PAYTR_MERCHANT_SALT=xxxxx
PAYTR_TEST_MODE=1   # önce test, sonra 0
SITE_URL=https://kozmetik-platform.vercel.app
```

**Adımlar:**
1. **Test modu (PAYTR_TEST_MODE=1):**
   - [ ] Magic link ile giriş yap
   - [ ] `/odeme` → 29 TL plan seç → "Satın Al" → PayTR iframe açılır mı?
   - [ ] PayTR test kart 9792030394440796 / 12/24 / 000 ile ödeme yap
   - [ ] `/odeme/sonuc?status=success&oid=X` redirect olur mu?
   - [ ] IPN backend'e geldi mi (`Render logs | grep IPN`)?
   - [ ] `payments` tablosu status='success' güncellendi mi?
   - [ ] `app_users.premium_until` set edildi mi (lifetime → 2099-12-31)?
   - [ ] `/premium` sayfası "Premium aktif" gösteriyor mu?
   - [ ] `/cilt-analizi/karsilastir` boyut delta tablosu **paywall'sız** açık mı?
2. **49 TL aylık + 490 TL yıllık** için 1-2 ve 3 tekrarla
3. **PaywallOverlay** backend bind testi: AI Coach widget premium kullanıcıda direkt açık mı?
4. **Idempotent IPN test:** Render shell'den aynı IPN'i 2x çağır, payment status değişmemeli, premium_until uzatılmamalı
5. **Production'a geçiş:** `PAYTR_TEST_MODE=0` set + 1 TL gerçek kart testi

### TEST D — Build/Deploy Sağlık (Sürekli izleme)

- [ ] Vercel: `kozmetik-platform.vercel.app` deploys, son 5 commit hepsi yeşil
- [ ] Render API: `kozmetik-api.onrender.com/api/v1/healthz` 200
- [ ] Render API logs: `Vision: brand=...` + `Reminder cron run` + `Coach Claude 200` görünüyor mu?
- [ ] Hiç `ETIMEDOUT` / `AggregateError` yok son 24 saat

---

## 📋 KALAN İŞLER (öncelik sırasıyla)

### KRİTİK — PayTR canlıya çıkış (kullanıcı evrak işi)

1. **PayTR merchant başvuru evrak**
   - Vergi levhası, banka hesabı (IBAN), şirket kuruluş belgesi
   - PayTR onay süresi 3-5 iş günü
   - Onay gelince merchant_id + merchant_key + merchant_salt panelden al
2. **Render env vars set** (5 dakika)
3. **TEST C** çalıştır → canlı

### YÜKSEK — Faz 1 finalize (kullanıcı yapacak)

4. **Faz 1 Gün 11 manuel test** (TEST A yukarıda)
5. **Faz 1 Gün 12 PR aç**
   - Test sonuçlarını `RELEASE_NOTES_FAZ1.md` tablosuna doldur
   - `gh pr create --title "feat: REVELA Foto Analiz Faz 1 POC" --body "$(cat apps/api/src/modules/skin-analysis/RELEASE_NOTES_FAZ1.md)"`
   - Şu an master'a doğrudan push'lanıyor, PR şart değil ama tarihsel kayıt için iyi

### ORTA — Faz 2-3 polish (PayTR sonrası)

6. **Admin panel — Payment audit log + manuel iade** (~2 saat)
   - `apps/web/src/app/admin/payments/page.tsx`
   - Tüm payment listesi + filtre (status, plan, kullanıcı)
   - Manuel iade butonu (status=refunded + audit log)
   - Manuel premium_until grant override
7. **AI Coach streaming + çoklu turn** (~3 saat)
   - SSE (Server-Sent Events) yanıt akışı
   - Mesaj geçmişini Claude'a context olarak yansıtmak
   - Karakterlere göre maliyet hesabı/quota
8. **Auto-renew subscription** (~4 saat)
   - PayTR Subscription API farklı endpoint (`/odeme-tekrar/api`)
   - Her ay premium_until -7 gün öncesi auto-charge
   - Kullanıcı iptal etmediyse otomatik yenilenir
9. **Aylık plan reminder mail** (~1 saat)
   - premium_until -7 gün yaklaştığında "Yakında bitiyor" maili
   - skin-analysis.cron.ts içine yeni cron eklenir
10. **On-device scorer doğruluk iyileştirme** (~3 saat)
    - Skin tone normalization (Fitzpatrick'e göre eşik kaydırma)
    - ROI dinamik (yüz açısına göre rotate)
    - Premium "vision karşılaştırma"da on-device ↔ vision skor uyumsuzluğu metriği

### DÜŞÜK — Sonraki sprint (Haziran sonu)

11. **Brand Portal Q1 2027 dev sprint başlangıcı** (memory'de planlı)
12. **RI (REVELA İndeksi) açık kaynak formül** (Modül G)
13. **Niche INCI veritabanı genişletme** (Modül H, ~20 yeni INCI, 1 gün SQL)
14. **Akademik partnership outreach** (Yıldız Teknik, Boğaziçi vb.)
15. **Çoklu dil EN+DE** — memory'de Q2 2028'e ertelendi, hatırlatma

### İZLEME — Süregelen

16. **Vercel/Render mail izleme** — production build fail her commit'te mail gelir
17. **Vision API quota** — Gemini free tier doluyor, Claude key rotate gerekiyor (bugün limit:0 yaşandı, kullanıcı rotate etmedi)
18. **Neon Postgres** — free tier auto-suspend, ETIMEDOUT 10s timeout ile geçti ama izlemek lazım
19. **Resend free 100/gün** — günlük ortalama email sayısını izle

---

## 🔧 ENV VARS DURUMU (Render API)

### ✅ Set olan
- `DB_HOST/PORT/USER/PASS/NAME/SSL` (Neon)
- `ANTHROPIC_API_KEY` (geçersiz, rotate beklenebilir)
- `GEMINI_API_KEY` (free tier quota dolmuş)
- `RESEND_API_KEY`, `MAIL_FROM`
- `JWT_SECRET`, `REDIS_URL` (Upstash)

### ⏳ Set edilecek (PayTR onayı sonrası)
- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYTR_TEST_MODE` (önce 1, sonra 0)
- `SITE_URL` — zaten var muhtemelen, doğrula

### 🔄 Rotate önerilir
- `ANTHROPIC_API_KEY` — bugün 401 invalid_x_api_key alındı, ekran görüntüsünde sızmıştı

---

## 📌 BAYRAM SONRASI İLK İŞ (20 May Çarşamba)

**Sıra:**
1. (5dk) Production sağlık check — `kozmetik-api/healthz` + Vercel deploys yeşil + Render logs temiz
2. (60dk) **TEST A — Faz 1 G11 E2E** (checklist'e göre, 5 foto + funnel + KVKK)
3. (30dk) Bulguları `journal/2026/05/2026-05-2X_day11-test-bulgular.md`'a yaz
4. (30dk) Hızlı bug fix'ler (varsa, hot patch)
5. (30dk) **TEST B — Faz 2 smoke** (on-device + compare + trend + AI chat)
6. (15dk) **Faz 1 Gün 12 PR** — release notes + sonuçlar tabloya
7. Paralel: PayTR onayı geldiyse → env vars + **TEST C — PayTR canlı**

**Tahmini süre:** Yarım gün (3-4 saat) — bayram sonu enerjik bir günde rahat biter.

---

## 🎯 BAŞARI METRİKLERİ

**Bugün başarılan (development time):**
- 20 commit master push
- ~5,500 satır eklendi (backend + frontend + migration + test scripts + docs)
- 7 endpoint yeni (skin-analysis + payments)
- 3 migration (031 ana, 032 email funnel, 033 payments)
- 7 frontend sayfa (foto-test + karsilastir + trend + veri-haklarim + abonelik-iptal + odeme + premium)
- 0 prod outage (3 hotfix mevcut sorunları çözdü)

**Hedef (bayram sonrası tamamlanması):**
- Faz 1 PR merge edildi
- TEST A bulguları sıfır kritik bug
- PayTR canlı + en az 1 gerçek ödeme test (1 TL)

**Hedef (Haziran sonu):**
- Premium tier'da minimum 10 ödeme yapan kullanıcı
- AI Coach beta'da minimum 50 soru
- 28-gün reminder akışında minimum 5 unsubscribe (funnel metric)

---

**Bu dokümana bayram sonu döndüğünde tek paragrafla başla:**
> "TEST A'dan başlıyorum, journal/2026/05/2026-05-17_faz1-day11-test-checklist.md ile."

İyi bayramlar 🌷
