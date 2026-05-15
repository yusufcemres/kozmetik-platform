# Skin Analysis Modülü

Foto-bazlı cilt analizi (REVELA Foto Analiz V2). Yüz fotoğrafından 6-boyut skor + INCI önerisi üretir.

**Durum:** Faz 1 MVP — backend canlı, frontend Gün 5-7'de, paywall Faz 2/3'te (Haziran, arkadaş şirket PayTR ile).

## Endpoint'ler

### `POST /api/v1/skin-analysis`
Yüz fotoğrafı analiz et. Ücretsiz tier, 3 req/min throttle. Anonim veya auth tier.

**Request:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAA...",
  "image_mime": "image/jpeg",
  "store_photo": false,
  "guard_score": 85
}
```

- `image_base64` (zorunlu): Max ~6.7MB (5MB binary). Data URI prefix opsiyonel.
- `image_mime` (zorunlu): `image/jpeg | image/png | image/webp` whitelist.
- `store_photo` (opsiyonel): Foto'yu sunucuda sakla (premium opt-in, default `false`).
- `guard_score` (opsiyonel): MediaPipe çekim guard kalite skoru (0-100).

**Query:**
- `email` (opsiyonel): Anonim kullanıcı için 28-gün reminder. SHA-256 hash'lenir.

**Response (200):**
```json
{
  "scores": {
    "t_zone_oil": 65,
    "pore_visibility": 45,
    "wrinkles": 30,
    "pigmentation": 55,
    "redness": 25,
    "under_eye_darkness": 40,
    "acne_count": 3,
    "fitzpatrick_type": 3
  },
  "overall_score": 43,
  "recommendations": {
    "t_zone_oil": ["Niacinamide", "Salicylic Acid (BHA)", "Zinc PCA"],
    "pigmentation": ["Niacinamide", "Vitamin C", "Alpha Arbutin"],
    "under_eye_darkness": ["Caffeine", "Vitamin K", "Peptides"]
  },
  "model_version": "gemini-2.0-flash-skin-v1",
  "analysis_id": 42,
  "created_at": "2026-05-16T00:45:23.123Z"
}
```

**Error (400):**
- `"Vision servisi yanıt vermedi"` — Gemini/Claude API key set değil veya timeout
- `"Yüz net görünmüyor olabilir"` — Vision face_not_detected veya parse fail
- DTO validation hataları (MIME whitelist, base64 boyut, regex)

### `GET /api/v1/skin-analysis/:id`
Tek analiz sonucu (kayıtlı kullanıcı kendi geçmişini görür).

### `GET /api/v1/skin-analysis/me/history?limit=20`
Kullanıcı analiz geçmişi (JWT zorunlu, premium "trend takibi" için).

## Skor Boyutları

| Boyut | Aralık | Yorum | INCI Önerisi |
|-------|--------|-------|---------------|
| `t_zone_oil` | 0-100 | T-bölge yağlanma | Niacinamide, BHA, Zinc PCA |
| `pore_visibility` | 0-100 | Gözenek görünürlüğü | Niacinamide, BHA, Retinol |
| `wrinkles` | 0-100 | Kırışıklık + ince çizgi | Retinol, Peptide, Vitamin C |
| `pigmentation` | 0-100 | Leke / hiperpigmentasyon | Niacinamide, Vit C, Alpha Arbutin, Tranexamic |
| `redness` | 0-100 | Kızarıklık / inflamasyon | Centella, Allantoin, Panthenol |
| `under_eye_darkness` | 0-100 | Gözaltı moru | Caffeine, Vit K, Peptide |
| `acne_count` | 0-50 | Aktif sivilce sayısı | Salicylic Acid, Niacinamide, Tea Tree |
| `fitzpatrick_type` | 1-6 | Cilt tonu sınıfı | (Sınıflandırma, öneri yok) |

**Genel skor formülü:** `overall = Σ(boyut × ağırlık) / 1.0` — kırışık+leke ağırlığı %20×2, t-bölge+gözenek+kızarıklık+gözaltı %15×4.

**Öneri eşiği:** Skor ≥40 olan boyutlar için top 3 INCI önerisi döner.

## Vision Mimarisi

```
SkinAnalysisService.analyze()
    ↓
VisionService.callVisionWithPrompt(image, mime, prompt)
    ↓
geminiRaw(...) → fallback → claudeRaw(...)
    ↓ (raw JSON text)
parseSkinJSON(raw) → sanitize + clamp
    ↓ (SkinScoreBreakdown)
calculateOverall() + buildRecommendations()
    ↓
DB.save(skin_analysis_results)
    ↓
Response (analysis_id + scores + recommendations)
```

## KVKK + Güvenlik

- **Foto saklama:** Default `null`. Sadece `store_photo=true` (premium opt-in) ile şifreli S3'e yazılır.
- **Email:** SHA-256 hash. Plain email DB'de saklanmaz.
- **Rate limit:** 3 req/min (DTO + vision API maliyet koruması).
- **MIME whitelist:** `image/jpeg | png | webp`. Diğer tipler 400 reject.
- **Boyut:** Max 5MB binary (~6.7MB base64).
- **Disclaimer:** Frontend KVKK modalı + "tıbbi tanı değildir" disclaimer (Gün 8-10 sprint).
- **Audit:** `skin_analysis_results.ip` + `user_agent` log (KVKK Madde 12).

## Render Deploy — Env Vars

```bash
# Zorunlu (en az biri):
GEMINI_API_KEY=AIzaSyC3...     # Birincil (Gemini 2.0 Flash, daha ucuz)
ANTHROPIC_API_KEY=sk-ant-...   # Fallback (Claude Sonnet 4.6, daha pahalı)
```

İkisi de set değilse `POST /api/v1/skin-analysis` 400 "Vision servisi yanıt vermedi" döner.

## Manuel Test

```bash
# Lokal:
API=http://localhost:3001 node scripts/manual-tests/test-skin-analysis.mjs face.jpg

# Production:
API=https://kozmetik-api.onrender.com node scripts/manual-tests/test-skin-analysis.mjs face.jpg
```

## Unit Test

```bash
cd apps/api && pnpm test skin-analysis
```

15 test: parseSkinJSON (8) + calculateOverall (3) + buildRecommendations (3) + setup.

## Plan / Roadmap

- ✅ **Gün 1-2 (16 May):** Backend MVP + Vision adapt + test paketi
- ⏳ **Gün 3 (18 May):** Render deploy + endpoint canlı test
- ⏳ **Gün 4 (20 May):** MediaPipe FaceLandmarker POC (frontend çekim guard)
- ⏳ **Gün 5-7 (21-23 May):** Frontend foto upload UI + radar chart
- ⏳ **Gün 8-10 (24-26 May):** Email kayıt + Resend 28-gün cron + KVKK modal
- ⏳ **Gün 11-12 (27-28 May):** E2e test + Faz 1 POC canlı
- ⏳ **Faz 2/3 (Haziran):** Arkadaş şirketi PayTR + paywall (karşılaştırma + Premium)
