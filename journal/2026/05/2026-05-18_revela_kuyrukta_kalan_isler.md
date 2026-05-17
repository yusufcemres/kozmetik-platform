# REVELA — 18 Mayıs Pazartesi Sabah Devraldığım Kuyruk

**Önceki oturum kapanış:** 18 Mayıs 2026 Pazartesi, 00:55 (Türkiye)
**Bayram:** 19 Mayıs Salı (yarın) — Atatürk'ü Anma + Gençlik ve Spor Bayramı

> Bu doküman gece geç sona ulaşan oturumun fotoğrafı ve sabaha bırakılan
> aksiyonların net listesi. Bayram öncesi (18 May Pzt) yarım gün + bayram
> sonrası (20 May Çar) tam gün ile bitirilebilir.

---

## ✅ Bu oturumda biten 6 ana iş (4 commit + arka plan batch'ler)

| # | Commit | İş | Detay |
|---|---|---|---|
| 1 | `ee1ba25` | **Bebek skorlama** | 44 ürün doğru target_audience'a çekildi (33 infant + 10 child + 1 pregnant). Frontend rozet + audience-aware needs filter. CeraVe Baby gibi ürünler artık Sivilce/Akne yerine Bariyer/Nemlendirme/Hassasiyet üzerinden skorlanıyor |
| 2 | `0dadef0` | **INCI kamera/galeri** | `/inci-analiz` sayfasına Foto Çek + Galeriden butonları. smart-scan vision pipeline reuse. Etiketten otomatik INCI okuma. **Plus** `generate-need-faqs.ts` script |
| 3 | `eb8fe7c` | **İçerik DB temizlik** | 10436 → 10419 ingredient. 17 noise silindi: telefon numarası, FR/ES cümle, URL parçaları. 2 ürünle bağlı kayıt manuel review için saklı |
| 4 | `3159bde` | **Saç analizi enrich** | 5 → 10 soru. Yeni: yaş, yıkama sıklığı, saç uzunluğu, stres+uyku, mevcut ürün rutini |

**Arka plan tamamlanan:**
- ✅ **FAQ batch:** 20/24 need × 25 SSS = **512 SSS** production'da. 4 need rerun çalışıyor (kas-performans, inflamasyon-azaltma, uyku-stres-yönetimi, sac-tirnak).

**Toplam bu oturum: ~720 satır kod + 512 SSS içerik üretildi.**

---

## ⏳ KALAN İŞLER (öncelik sırasıyla)

### 🔴 P1 — Çabuk + kolay (30 dk total)

#### a) FAQ batch — 4 eksik need
```powershell
cd c:/Users/Yusuf\ Cemre/OneDrive/Desktop/kozmetik-platform/apps/api
pnpm ts-node src/scripts/content/generate-need-faqs.ts --run
```
Idempotent — sadece <10 SSS olanları yeniden generate eder. ~3-4 dk.

#### b) Drunk Elephant Babyfacial — false positive düzeltme
"Baby" geçtiği için yanlış `infant_0_12m` olarak işaretlendi, ama yetişkin chemical peel. Bir SQL:
```sql
UPDATE products SET target_audience = 'adult'
WHERE product_name ILIKE '%Drunk Elephant%Babyfacial%';
```
Plus Redis cache invalidate:
```bash
node -e "const Redis=require('ioredis');const r=new Redis(process.env.REDIS_URL);(async()=>{const k=await r.keys('product:slug:*');if(k.length)await r.del(...k);console.log('flushed',k.length);await r.quit();})()"
```

#### c) Velavit ürünleri ekleme — 54 ürün
Web'den çekilen Velavit ürün listesi `feedback_lexa_brand_facts.md` yakınında değil; Web search sonucu hazır:
- **V-Serisi** (longevity/vitamin/mineral): V-NR, V-Rapid Vit D, V-Resveratrol, V-AKG Ca, V-Glutathione liposomal, V-Effer D3, V-Iron+C, V-B Complex, V-D3K2 Drop, V-B12 1000, V-Pure C Lipozomal, V-Effer C 1000, V-D3K2 MSM
- **Güzellik:** Viva MNP Collagen, Phytoglow Hair&Nail, V-Collagen Age, V-Biotin 5000, Viva Vital Collagen, Ceramide, Phytoglow Anti-Hair Loss
- **Probiyotik + Özel:** V-Probiotics+Enzymes, V-Firstect+Colostrum, V-CoQ10+Piperine, V-ChondroMax+, V-Colostrum+L-Lysine Lozenges, V-ArginMen, Dim Complex, V-Bromelain 500, V-Gamer Boost, V-GlutenEase, V-Lactase 12000
- **Çocuk:** V-Yummy, V-Firstect Kids+Colostrum, V-ColiFlor Kids Drops
- **Multivitamin:** V-PreMom, V-Women's Daily, V-Men's Daily, V-Mom to be
- **Gummy:** V-Active, V-Focus, V-Happy Kids, V-SambuGuard, V-Vitamin D3, V-MNP, V-Good Night
- **X Ailesi:** Viva AptX, BrnX, ClrX, DetX
- **Esansiyel + Bitkisel:** V-DHA 500, V-St John's Wort+Rhodiola, V-Cranberry+C, V-Curcumin Lipozomal, V-Nattokinase

**Onboarding pattern (memory'de var):**
`apps/api/src/database/seeds/products-queue/_ready/*.json` formatında her ürün için JSON oluştur, sonra onboarding pipeline ile DB'ye yükle. ~1-2 saat (her ürün için INCI listesi + fiyat + image URL gerek — Velavit sitesinden scrape).

### 🟡 P2 — Orta kolay (1-2 saat)

#### d) Test enrich — 4 test daha
Şu an sadece **saç analizi** 10 soruya çıkarıldı. Aynı pattern'i uygula:
- `/cilt-analizi` (skin profile quiz) — şu an çok adımlı, 5-7 ek soru ekle (yaşam tarzı: stres/uyku/spor/diyet)
- `/beslenme-analizi` — 5-10 soru genişlet
- `/cilt-yasi-testi` — 5 ek soru (genetik+güneş+sigara+stres+uyku)
- `/icerik-testi` — INCI hassasiyet quiz, 5-10 ek soru
- `/inci-analiz` — analiz odaklı, foto ekledim zaten, soru ekleme yok

#### e) `/icerikler` ek temizlik
Mevcut audit'in tespit ettiği 365 "EN sentence" + 45 "parantez yarım" kategorileri. Çoğu meşru INCI ama içinden Spanish/EN açıklama cümleleri (örn. "Generalmente seguro para su uso en cosméticos") silinmeli. Daha akıllı pattern script.

### 🟢 P3 — Büyük scope (2-3 saat)

#### f) Google + Facebook social login
- **Önkoşul:** Google Cloud Console → OAuth Client ID (kullanıcı oluşturacak)
- **Önkoşul:** Facebook for Developers → App ID + Secret
- **Yöntem:** NextAuth.js extend etmek yerine, mevcut UserAuthService'e Google/FB token verify ekle (magic link ile uyumlu)
- Backend: `POST /auth/google` + `POST /auth/facebook` — Google `id_token` veya FB `access_token` doğrula → AppUser oluştur/getir → JWT döndür
- Frontend `/giris` sayfası: e-posta input üstüne 2 buton (Google + FB)
- Memory'de `reference_lexa_brand_facts.md` Lisam pattern yok, basit OAuth implementation

---

## 🚀 SABAH İLK İŞ SIRASI (18 May Pzt)

**08:00-09:00 (P1 hızlı):**
1. FAQ rerun → 24/24 doldur (3-5 dk)
2. Drunk Elephant SQL düzelt (1 dk)
3. Cache invalidate (1 dk)
4. **Doğrulama:** `/ihtiyaclar/bariyer-destegi` sayfasında 25 SSS render olur mu? + `/urunler/drunk-elephant-tlc-sukari-babyfacial` "adult" gösterir mi?

**09:00-12:00 (P2 + P3):**
5. Test enrich 4 quiz (cilt, beslenme, yaş, içerik) — 1.5 saat
6. /icerikler ek temizlik script — 30 dk
7. Velavit ürün scrape + JSON üret + onboarding (1-2 saat, opsiyonel paralel)

**Öğleden sonra (13:00-17:00):**
8. Google OAuth setup (Cloud Console credentials + backend endpoint + frontend buton) — 2 saat
9. FB OAuth aynı pattern — 1 saat

**Bayram (19 May Salı):** mola, sadece Day 11 manuel test (foto + inbox + DB) eğer cinli ise

**20 May Çarşamba:**
10. Day 12 PR aç (RELEASE_NOTES_FAZ1.md sonuçları doldur)
11. Velavit ürün ekleme finalize (eğer Pzt yetişmediyse)

---

## 📊 Production state (commit `3159bde` itibarıyla)

**DB:**
- 10419 ingredient (17 noise silindi)
- 24 need (20 × 25 SSS = 512, 4 rerun)
- 44 ürün doğru target_audience (bebek/çocuk/hamile)

**Endpoints:**
- `/inci-analiz` kamera/galeri foto upload aktif
- `/urunler/[slug]` audience-aware uyumluluk skoru
- `/ihtiyaclar/[slug]` 25 SSS render
- `/sac-analizi` 10 soruluk quiz

**Bekleyen production canlı doğrulamaları:**
- Vercel deploy `3159bde` master için ~3 dk içinde
- ISR revalidate=60 sayfa-level

---

## 🔧 ENV VARS DURUMU (Render)

✅ Set: DB_*, ANTHROPIC_API_KEY, GEMINI_API_KEY, RESEND_API_KEY, REDIS_URL, JWT_SECRET, SITE_URL
⏳ Bekliyor: PAYTR_MERCHANT_* (merchant onayı), GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET (Cloud Console), FACEBOOK_APP_ID + FACEBOOK_APP_SECRET

---

## 💡 Bayram sonrası açış cümlesi

> "Sabah ilk iş P1 zincirini bitir, sonra Test enrich 4 quiz'i pattern'le çoğalt."

İyi geceler, iyi bayramlar 🌷🇹🇷
