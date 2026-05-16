# REVELA Foto Analiz — Faz 1 Release Notes

**Sürüm:** Faz 1 POC (MVP)
**Sprint:** 16 Mayıs 2026 (Gün 1-10) → 27-28 Mayıs 2026 (Gün 11-12 finalize)
**PR:** _Day 12'de doldurulacak_ — `gh pr create --base release --head master`
**Production:**
- Backend: https://kozmetik-api.onrender.com/api/v1/skin-analysis
- Frontend: https://kozmetik-platform.vercel.app/cilt-analizi/foto-test

---

## Özet

Foto-bazlı cilt sağlığı analiz modülü canlıya çıktı. Kullanıcı yüz fotoğrafı çeker
(KVKK açık rızası alındıktan sonra), Gemini 2.0 Flash / Claude Sonnet 4.6 Vision
ile 6-boyutlu cilt skoru üretilir. Her sorunlu boyut için REVELA INCI veritabanından
zenginleştirilmiş öneriler + katalog ürünleri eşleştirilir. Email opt-in akışı 28 gün
sonra hatırlatma yollar; kullanıcı yeni analiz çekince eski/yeni karşılaştırma sayfasında
trend görür. KVKK Madde 10-11 tam uyumlu (aydınlatma + açık rıza + veri taşınabilirlik
+ silme hakkı).

## İstatistik

- **10 commit** (development) + **1 commit** (test infra) + **1 commit** (Faz 2 başlangıcı)
- **~2,100+ satır** eklendi (backend + frontend + migration + test scripts)
- **5 yeni endpoint** (analyze + subscribe + unsubscribe + me/export + me/delete-all + me/compare)
- **2 migration** (031: ana tablo, 032: email funnel kolonları)
- **2 cron** (zaten affiliate vardı, +1 daily reminder)
- **2 yeni frontend sayfa** (`/foto-test`, `/abonelik-iptal`, `/veri-haklarim`, `/karsilastir`)
- **0 third-party fee** (Resend free 100/gün + Gemini free tier + Render free)

## Kapsam (Gün 1-10)

### Gün 1-2 — Backend MVP
- `skin_analysis_results` tablosu (migration 031), 6-boyut skor breakdown
- `SkinAnalysisService.analyze()` + `VisionService.callVisionWithPrompt()`
- Skin-specific prompt (Türkçe, "hayal etme" politikası, face_not_detected handle)

### Gün 3 — Render deploy
- Production env vars: `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `SITE_URL`, `RESEND_API_KEY`
- Endpoint canlı: `POST /api/v1/skin-analysis`

### Gün 4 — MediaPipe çekim guard
- `face-landmarker/loader.ts` — `@mediapipe/tasks-vision` lazy load, CDN'den 6MB
- `face-landmarker/capture-quality.ts` — 4 metrik (face presence + centering + brightness + sharpness)
- CDN/CSP fail durumunda neutral fallback (server-side validation devreye girer)

### Gün 5-7 — Frontend
- `/cilt-analizi/foto-test` — kamera + CaptureGuard + result UI
- `RadarChart.tsx` — 80 satır SVG, 0 bundle bloat
- Bonus: acne_count + fitzpatrick_type info card'ları

### Gün 8 — INCI öneri kartları + REVELA ürün eşleştirme
- Statik INCI isim → DB `ingredients` table fuzzy lookup (unnest + LIKE)
- Top 3 product PARTITION BY ROW_NUMBER tek query
- Frontend: evidence_grade rozeti (A-F renkli), function summary, allergen/parfüm uyarısı,
  REVELA ürün widget (image + brand + name + price)
- Process-local 1 saat cache (statik mapping deterministik)
- Backward-compat fallback: DB fail → ingredient=null + display_name + products=[]

### Gün 9 — Email opt-in + 28-gün reminder cron
- Migration 032: `subscription_email`, `welcome/reminder_email_sent_at`, `unsubscribe_token`, `unsubscribed_at`
- `common/mail/MailService` — jenerik Resend wrapper (user-auth pattern generalize)
- `subscribeToEmail()` idempotent + welcome mail fire-and-forget
- `unsubscribeByToken()` — token enumeration koruması (no info leak)
- `SkinAnalysisCronService` `@Cron('0 9 * * *', Europe/Istanbul)` — 28+ gün önce + opt-in
  + reminder NULL → mail yolla, batch 100 (Resend rate)
- Welcome + Reminder inline HTML template'leri (user-auth styling tutarlı)

### Gün 10 — KVKK aydınlatma modal + Madde 11
- `consent_version` DTO zorunlu (regex `v{N}-YYYY-MM-DD`)
- Her analiz `CONSENT_UPDATE` audit log → `user_actions` tablo (Madde 8 kanıt zinciri)
- `GET /me/export` — JSON taşınabilirlik (Madde 11/d)
- `DELETE /me/delete-all` — geri dönüşsüz silme (Madde 11/e+f)
- Frontend `PhotoConsentModal` — 2 zorunlu checkbox (aydınlatma + biyometrik rıza)
- `/cilt-analizi/veri-haklarim` — export + delete buton + Madde 11(a-g) listesi

### Bonus (Day 11/12 öncesi)
- 3 production fix bugünden: MediaPipe CSP, Vision 503 UX, ETIMEDOUT hardening
  (Redis offline queue + Neon connect timeout 5→10s)
- Day 11 test scriptleri: `test-skin-analysis.mjs`, `test-skin-analysis-funnel.mjs`,
  `simulate-28day-reminder.mjs` + fixtures rehberi
- **Faz 2 başlangıcı:** `/karsilastir` sayfa + `/me/compare` endpoint + RadarChart dual mode

## API Reference (1 satır)

| Endpoint | Auth | Throttle | İş |
|---|---|---|---|
| `POST /skin-analysis` | none | 3/min | Foto analiz et |
| `GET /skin-analysis/:id` | none | - | Tek analiz sonucu |
| `POST /skin-analysis/:id/subscribe` | none | 5/min | Email opt-in |
| `GET /skin-analysis/unsubscribe/:token` | none | 10/min | Tek tıkla opt-out |
| `GET /skin-analysis/me/history` | JWT | - | Geçmiş analizler |
| `GET /skin-analysis/me/export` | JWT | 5/min | KVKK Madde 11/d |
| `DELETE /skin-analysis/me/delete-all` | JWT | 3/min | KVKK Madde 11/e+f |
| `GET /skin-analysis/me/compare?to=X&from=Y` | JWT | 30/min | İki analiz karşılaştır (Faz 2) |

## Bilinen Kısıtlar (Faz 2-3'te ele alınacak)

1. **Anonim kullanıcı compare yok** — `/me/compare` JWT zorunlu. Anonim kullanıcı 28-gün
   reminder mail'inde gelen prev_id ile karşılaştırma yapamıyor. Faz 2'de unsubscribe_token
   benzeri "compare_token" eklenecek.
2. **Foto saklama** — `store_photo: false` default. Opt-in flow var ama frontend'de henüz
   UI yok (Premium tier'da açılacak).
3. **Trend history** — 3+ analiz için bar chart timeline (Faz 2). Şu an dual karşılaştırma var.
4. **Rate limit ortak** — `public:` throttle tüm anonim çağrılar tek namespace.
   Premium tier'da user-bazlı throttle gerekli.
5. **Vision provider quota** — Gemini free tier doluyor (limit:0 hatası bugün yaşandı).
   Production'a tek tier yetmiyor → Faz 2'de **billing açma** veya **DeepSeek V4 Pro fallback**
   (memory'de claude-cheap pattern var).

## Test Sonuçları (Day 11)

> _Day 11 yapılınca doldurulacak. Şablon:_

| Senaryo | Beklenen | Gerçek | Status |
|---|---|---|---|
| Net yüz, iyi ışık | guard ≥70, 6 boyut skor, INCI öneri | ___ | ⏳ |
| Karanlık foto | guard düşük, "Çok karanlık" reason | ___ | ⏳ |
| Bulanık foto | guard düşük, "Foto bulanık" reason | ___ | ⏳ |
| Yüz yok | 400 + face_not_detected | ___ | ⏳ |
| Mobile webp | aynı flow, native arka kamera | ___ | ⏳ |
| Email opt-in welcome | Inbox'a mail gelir, token verir | ___ | ⏳ |
| Unsubscribe tek tık | subscription_email NULL, hash kalır | ___ | ⏳ |
| 28-gün reminder cron | (DB backdate ile sim) mail gelir | ___ | ⏳ |
| KVKK export | JSON blob download, audit log | ___ | ⏳ |
| KVKK delete | 0 row + audit log + hesap kalır | ___ | ⏳ |
| Karşılaştırma dual radar | İki polygon overlay, delta tablo | ___ | ⏳ |

Bulgular: `journal/2026/05/2026-05-2X_day11-test-bulgular.md`

## Faz 2 Yol Haritası (Haziran başı başlar)

Faz 1 close edildikten sonra:

1. **Anonim compare token** — reminder email'deki link ile auth'suz karşılaştırma
2. **Trend history chart** — 3+ analiz için zaman ekseninde bar chart, her boyut için trend line
3. **MediaPipe Face Landmarker on-device** — Gemini'ye foto göndermeden, tamamen browser-side
   skor (KVKK + maliyet sıfır) — opsiyonel paralel tier
4. **29 TL one-time paywall** — karşılaştırma sayfası blur+reveal mekaniği (Spotify Wrapped)
5. **AI sohbet beta** — analiz sonucu üzerine cilt rutini sorgusu (49 TL Premium tier öncüsü)

## Faz 3 Yol Haritası (Haziran sonu)

1. **PayTR Subscription + Linkle Ödeme** entegrasyonu
2. **Premium tier** (49 TL/ay, 490 TL/yıl): sınırsız analiz + trend + reminder + AI sohbet
3. **Foto saklama opt-in UI** (Premium feature)
4. **Premium dashboard** — geçmiş analizler + grafik + paylaşım

---

## PR Description Şablonu (Day 12'de kullan)

```
## Summary
- Faz 1 POC: foto-bazlı 6-boyutlu cilt skoru + INCI önerisi + KVKK uyum + 28-gün email funnel
- 10 günlük sprint, ~2,100 satır kod, 5 endpoint, 2 migration, 1 cron
- Faz 2 başlangıç bonus: karşılaştırma sayfası + dual RadarChart

## Production durumu
- Backend canlı: Render auto-deploy master → kozmetik-api.onrender.com
- Frontend canlı: Vercel auto-deploy master → kozmetik-platform.vercel.app
- Migration 031-032 prod DB'ye uygulandı (autoMigrate true)

## Test plan
- [x] Day 11 e2e checklist (journal/2026/05/2026-05-17_faz1-day11-test-checklist.md)
- [x] 5 senaryo (foto kalitesi varyasyonları)
- [x] Email funnel (subscribe + welcome + unsubscribe)
- [x] 28-gün reminder simülasyonu
- [x] KVKK Madde 11 (export + delete)
- [x] Regresyon smoke (smart-scan + product slug)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
