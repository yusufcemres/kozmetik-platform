# Day 11 E2E Test — Foto Fixtures Rehberi

Gerçek face foto'ları repo'ya commit edilmez (KVKK + git LFS gerekli olur).
Bu dosya kullanıcının kendi cihazından test foto'larını nasıl hazırlayacağını anlatır.

## 5 Senaryo

| # | Foto tipi | Nasıl hazırlanır | Beklenen sonuç |
|---|-----------|------------------|----------------|
| 1 | **Net yüz, iyi ışık** (baseline) | Patron yüzü, gün ışığında, kameraya bakarken | guard_score ≥70, 6 boyut skoru, INCI öneriler dolu |
| 2 | **Karanlık** | Aynı yüz, ışıkları kapat ya da gece çek | guard_score düşük, "Çok karanlık" reason |
| 3 | **Bulanık** | Çekim sırasında telefonu hafifçe salla (motion blur) | guard_score düşük, "Foto bulanık" reason |
| 4 | **Yüz yok** | Manzara, eşya ya da boş duvar fotoğrafı | Vision `face_not_detected` → backend 400 |
| 5 | **Mobile native** | Telefon arka kamerasından gerçek webp/jpeg | Hem `/foto-test` hem direkt API ile |

## Hazırlık (5 dk)

```
# Klasör yapısı:
scripts/manual-tests/fixtures/
  ├── README.md                    (bu dosya)
  ├── 1-net-yuz.jpg                (~500KB, JPEG)
  ├── 2-karanlik.jpg               (~500KB)
  ├── 3-bulanik.jpg                (~500KB)
  ├── 4-manzara.jpg                (~500KB, yüz yok)
  └── 5-mobile-webp.webp           (~300KB, telefondan)
```

**Not:** Bu dosyalar git'te değil — `.gitignore`'a `scripts/manual-tests/fixtures/*.jpg` + `*.webp` zaten ekli olmalı.
Kullanıcı kendi yüz fotoğraflarıyla test eder, repo'ya commit etmez (KVKK biyometrik veri).

## Otomatik test çalıştırma

```bash
# Setup
export API=https://kozmetik-api.onrender.com
cd /c/Users/Yusuf\ Cemre/OneDrive/Desktop/kozmetik-platform

# 1. Net yüz (baseline)
node scripts/manual-tests/test-skin-analysis.mjs scripts/manual-tests/fixtures/1-net-yuz.jpg
# → Analysis ID kaydet (örn. 42)

# 2. Karanlık
node scripts/manual-tests/test-skin-analysis.mjs scripts/manual-tests/fixtures/2-karanlik.jpg

# 3. Bulanık
node scripts/manual-tests/test-skin-analysis.mjs scripts/manual-tests/fixtures/3-bulanik.jpg

# 4. Yüz yok (400 bekleniyor)
node scripts/manual-tests/test-skin-analysis.mjs scripts/manual-tests/fixtures/4-manzara.jpg

# 5. Mobile webp
node scripts/manual-tests/test-skin-analysis.mjs scripts/manual-tests/fixtures/5-mobile-webp.webp
```

## Email funnel testi

```bash
# Senaryo 1'den dönen analysis_id'yi kullan
ANALYSIS_ID=42 EMAIL=yusufcemresan+test@gmail.com \
  node scripts/manual-tests/test-skin-analysis-funnel.mjs

# Inbox kontrol → unsubscribe link tıkla → token al → ikinci adım:
UNSUB_TOKEN=<copy_from_email_link> ANALYSIS_ID=42 EMAIL=yusufcemresan+test@gmail.com \
  node scripts/manual-tests/test-skin-analysis-funnel.mjs unsubscribe
```

## 28-gün reminder simülasyonu (production'da DB erişimi gerekli)

```bash
# Render dashboard → Service → Connect → External connection string
export DATABASE_URL='postgres://...neon.tech/...'

# Önce yeni analiz + subscribe yap (senaryo 1 → funnel script)
# Sonra simulator created_at'i 29 gün geriye çek:
ANALYSIS_ID=42 node scripts/manual-tests/simulate-28day-reminder.mjs

# Render Logs'ta cron'un 09:00 TR'da çalışmasını bekle (ya da elle trigger)
# Inbox'a reminder mail bekle (subject: "28 gün geçti — cildin nasıl değişti? 📸")
```

## Frontend smoke test (browser)

`scripts/manual-tests` API katmanını test eder, frontend ayrı:

1. https://kozmetik-platform.vercel.app/cilt-analizi/foto-test → Kamera Aç
2. KVKK modal → 2 checkbox → Açık Rıza Ver
3. CaptureGuard kamera → foto çek
4. Result sayfası → EmailOptInWidget'a email gir
5. Inbox kontrol + /cilt-analizi/abonelik-iptal token doğrula
6. /cilt-analizi/veri-haklarim → export JSON + delete (auth user)

## Bulgular log'u

Test sırasında hata varsa `journal/2026/05/2026-05-2X_day11-test-bulgular.md`'a not düş:
- Hangi senaryo (1-5 + funnel + reminder + KVKK)
- Beklenen vs gerçek
- HTTP status + response body (jq pipe)
- Önerilen fix + commit önceliği
