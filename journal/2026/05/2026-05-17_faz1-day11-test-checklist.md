# Faz 1 — Gün 11 Manuel E2E Test Checklist

**Tarih:** Hedef 27 Mayıs 2026 Çarşamba (bayram sonrası ilk iş günü)
**Süre tahmini:** 60-90 dakika
**Önkoşul:** Render + Vercel deploy başarılı (`862b734` veya sonrası canlı)

> Bu checklist Faz 1'in 10 günlük sprint'ini production'da end-to-end doğrulamak için.
> Her test sonucunu işaretle (✓/✗), hata bulursan **commit hash + senaryo** ile not düş.

## 0. Pre-Flight (5 dk)

- [ ] https://kozmetik-api.onrender.com/api/v1/healthz → 200 OK
- [ ] https://kozmetik-platform.vercel.app/ → SSR render, console temiz (chunk 404 yok)
- [ ] Render Logs → son 1 saat hata yok (ETIMEDOUT, AggregateError, Resend fail)
- [ ] Render env: `GEMINI_API_KEY` + `ANTHROPIC_API_KEY` + `RESEND_API_KEY` + `SITE_URL` set

## 1. KVKK Consent Flow (10 dk)

- [ ] `/cilt-analizi/foto-test` aç → "Kamera Aç" butonu görünür
- [ ] Butona bas → **PhotoConsentModal** açılır, KVKK aydınlatma metni okunabilir
- [ ] 2 checkbox boşken → "Açık Rıza Ver" butonu **disabled**
- [ ] Sadece "okudum" checkbox → buton hâlâ disabled
- [ ] İki checkbox da işaretli → buton aktif olur
- [ ] "Reddet" → idle state'e döner
- [ ] "Açık Rıza Ver & Devam" → kamera başlar (CaptureGuard)
- [ ] Render Logs → `[user_actions] CONSENT_UPDATE scope=skin_analysis_biometric consent_version=v1-2026-05-26` log düştü

## 2. Foto Analiz (5 farklı senaryo + Patron yüzü, 30 dk)

> Her senaryoda: kamera → çek → upload → result. Result'ı not al (analysis_id + overall_score).

### 2.1 Net foto, iyi ışık (Patron yüzü, baseline)
- [ ] guard_score ≥ 70
- [ ] 6 boyut skoru sayısal, 0-100 aralığında
- [ ] RadarChart 6 köşeli, değerler okunabilir
- [ ] **INCI kartları** her sorunlu boyut için top 3 — evidence rozeti + function summary + REVELA ürünleri var
- [ ] Toplam latency: <10s (Gemini), <15s (Claude fallback)
- [ ] Network → smart-analysis Response.recommendations enriched (string[] değil, IngredientRec[])

### 2.2 Karanlık foto (test fixture)
- [ ] Quality skor düşük (~30-50)
- [ ] Reasons: "Çok karanlık" mesajı
- [ ] CaptureGuard ekranında "tekrar çek" CTA görünür

### 2.3 Bulanık foto (test fixture)
- [ ] Quality skor düşük
- [ ] Reasons: "Foto bulanık — telefonu sabit tutun"

### 2.4 Yüz olmayan foto (manzara/obje, test fixture)
- [ ] Vision response `{"error":"face_not_detected"}` → backend 400
- [ ] Frontend error state: "Fotoğraf analiz edilemedi — yüz net görünmüyor olabilir"

### 2.5 Mobile native kamera (telefon, gerçek arka kamera)
- [ ] Browser permission prompt → izin ver → arka kamera açılır
- [ ] Çekim → upload → result aynı flow
- [ ] iOS Safari + Android Chrome ayrı test

## 3. Email Opt-In (10 dk)

- [ ] Result sayfasında **EmailOptInWidget** görünür
- [ ] Geçersiz email (`test`, `test@`) → "Geçerli bir email adresi gir"
- [ ] Geçerli email → "Kaydediliyor…" → success state
- [ ] Render Logs → Resend `to=<email> 200 OK` log
- [ ] Inbox'a **welcome email** geldi (subject: "REVELA cilt analizin kaydedildi 🌿")
- [ ] Welcome mail içinde "Sonucu Tekrar Aç" link → `/cilt-analizi/foto-test?ref=email&analysis=<id>` çalışır
- [ ] Unsubscribe link → `/cilt-analizi/abonelik-iptal?token=<64hex>`
- [ ] Unsubscribe sayfası: "Aboneliğin iptal edildi" success
- [ ] DB doğrulaması: `SELECT subscription_email, unsubscribed_at FROM skin_analysis_results WHERE analysis_id=X;`
  → subscription_email = NULL, unsubscribed_at != NULL

## 4. 28-Gün Reminder Cron (manuel trigger ile simüle, 15 dk)

> Cron `0 9 * * *` Europe/Istanbul'da çalışır. 27 May test gününde gerçek cron'u beklemek yerine
> bir analiz kaydının `created_at`'ini 29 gün geriye çekip elle trigger et:

```sql
-- Test analiz hazırla
UPDATE skin_analysis_results
SET created_at = NOW() - INTERVAL '29 days',
    reminder_email_sent_at = NULL
WHERE analysis_id = <test_id> AND subscription_email IS NOT NULL;
```

- [ ] Render shell veya migration runner ile `SkinAnalysisService.sendDueReminders()` elle çağrılabilir mi? (eğer yoksa: pencerede beklemek lazım)
- [ ] Reminder email inbox'a geldi (subject: "28 gün geçti — cildin nasıl değişti? 📸")
- [ ] Mail içinde "Yeni Analiz Çek" link → `/cilt-analizi/foto-test?ref=reminder&prev=<id>`
- [ ] DB: `reminder_email_sent_at` doldu, idempotent (cron tekrar çalışınca aynı analiz reminder yollamaz)

## 5. KVKK Madde 11 — Veri Hakları (10 dk)

- [ ] Magic link ile giriş yap (auth user gerekli)
- [ ] `/cilt-analizi/veri-haklarim` aç → JWT'siz "Giriş gerekli" banner
- [ ] Login sonrası → 2 kart görünür (Export + Delete)

### 5.1 Export
- [ ] "JSON Olarak İndir" → blob download → `revela-cilt-analiz-export-YYYY-MM-DD.json`
- [ ] JSON içeriği: user_id + exported_at + analyses[] (her birinde scores, overall, recommendations)
- [ ] Render Logs → `DATA_EXPORT scope=skin_analysis exported_count=N` audit log

### 5.2 Delete
- [ ] "Silme talebi başlat" → 2-adımlı onay
- [ ] "Evet, geri dönüşsüz sil" → success "N kayıt silindi"
- [ ] DB doğrulama: `SELECT COUNT(*) FROM skin_analysis_results WHERE user_id = <id>;` → 0
- [ ] Render Logs → `ACCOUNT_DELETE scope=skin_analysis deleted_count=N` audit log
- [ ] Soruna yol açmayan: kullanıcı hesabı kapanmadı (`SELECT user_id FROM app_users WHERE user_id=<id>` → 1 satır)

## 6. Regresyon Smoke Test (10 dk)

- [ ] `/tara` smart-scan barkod tarama → matched product → ürün sayfası ✓
- [ ] `/urunler/<slug>` ürün detay → 200 OK (ETIMEDOUT yok, Postgres cold start aşılıyor)
- [ ] `/cilt-analizi` (eski quiz akışı) → form submit → /sonuc → ürün önerileri ✓
- [ ] Console → strict CSP ihlali yok, chunk 404 yok

## 7. Sonuç / Sign-off

- [ ] Tüm test geçti → Day 12 final pass için `feat(skin-analysis): Faz 1 POC release` commit hazırlığı
- [ ] Bulunan hata sayısı: ____
- [ ] Kritik regresyon (deploy blocker): ____
- [ ] Cosmetic/minor (Faz 2 backlog): ____

**Bulgular journal'ı:** `journal/2026/05/2026-05-2X_day11-test-bulgular.md` — her hata için:
- Hangi adım (örn. 2.3 Bulanık foto)
- Beklenen vs gerçek
- Network/console log ekran görüntüsü
- Önerilen fix

---

**Bu checklist Faz 1 deliverable kapsamında.** Day 12'de release notes/PR description'a ek olarak bu sonuçlar referans gösterilir.
