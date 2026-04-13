# REVELA — Sonraki Değer Önerileri ve İyileştirmeler

Bu dosya, mevcut sprint'te bilinçli olarak ertelenen özelliklerin kaydıdır.
Her madde için: **Ne / Neden ertelendi / Tetikleyici / Tahmini süre / Değer**.
Son güncelleme: 2026-04-13

---

## 1. Skin Journal (Cilt Günlüğü)
- **Ne**: Haftalık foto + not → 6 hafta sonra before/after progression raporu.
- **Neden ertelendi**: Başlangıçta kullanıcı aktif içerik üretmez, boş feature efekti.
- **Tetikleyici**: > 5000 MAU + quiz completion rate %40+.
- **Tahmini**: 10 saat.
- **Değer**: Yüksek retention + switching cost.

## 2. User Routines (Topluluk Rutinleri)
- **Ne**: Kullanıcılar kendi rutinlerini paylaşır — Pinterest × INCI.
- **Neden ertelendi**: Kritik kullanıcı kütlesi gerekir.
- **Tetikleyici**: > 5000 MAU.
- **Tahmini**: 8 saat.
- **Değer**: Viral büyüme + topluluk.

## 3. Fiyat Düşüşü Bildirimi
- **Ne**: Favori ürünlerin fiyatı düşünce push / email.
- **Neden ertelendi**: Affiliate data henüz birikmedi, fiyat history boş.
- **Tetikleyici**: Launch'tan 30 gün sonra + affiliate link stability.
- **Tahmini**: 3 saat (Faz O'da `product_price_history` tohumlaması yapıldı).
- **Değer**: Retention + tekrar ziyaret.

## 4. Refill / Bitiş Tahmini
- **Ne**: Ürün ambalaj ml + kullanım sıklığı → bitiş tahmini + yenileme push.
- **Neden ertelendi**: Düşük ROI, kullanım verisi yok.
- **Tetikleyici**: Direkt satış altyapısı aktif olunca.
- **Tahmini**: 3 saat.
- **Değer**: Yenileme conversion.

## 5. Dermatolog Ürün Endorsement + Randevu Platformu
- **Ne**: Dermatolog onay rozeti, ürün incelemeleri, randevu + ödeme.
- **Neden ertelendi**: **CİDDİ MEVZUAT RİSKİ** — TTB Hekim Tanıtım Kuralları hekimlerin ticari ürün onayını yasaklıyor.
- **Tetikleyici**: Sağlık hukukçusu danışmanlığı + netleşmiş yasal çerçeve.
- **Alternatif (şu an aktif)**: Medical Reviewer pattern (Faz K) — editöryal bilgi doğrulama, reklam değil.
- **Tahmini**: 15 saat + hukuki danışmanlık süresi.
- **Değer**: Otorite + gelir (randevu komisyonu).

## 6. Partner Eczane Paneli
- **Ne**: Yakın eczane stok / fiyat bilgisi, online + offline köprü.
- **Neden ertelendi**: Eczane network kurulumu operasyonel zaman.
- **Tetikleyici**: Şirket kurulumu + partnership ekibi.
- **Tahmini**: 20+ saat.
- **Değer**: Büyük rekabet avantajı, lokal SEO.

## 7. Bundle / Rutin Satışı
- **Ne**: 3-5 ürünlük rutin paketleri, otomatik indirim.
- **Neden ertelendi**: Affiliate model, direkt satış altyapısı yok.
- **Tetikleyici**: E-ticaret dönüşüm kararı (ödeme + stok + kargo).
- **Tahmini**: 40+ saat.
- **Değer**: AOV artışı.

## 8. Subscription Modeli
- **Ne**: "Her 2 ayda X ürün otomatik" — öngörülebilir MRR.
- **Neden ertelendi**: Bundle ile birlikte direkt satış gerekli.
- **Tetikleyici**: Bundle sonrası.
- **Tahmini**: 15 saat (bundle üstüne).
- **Değer**: MRR, yatırımcı metric'i.

## 9. Video Review + Before/After Upload
- **Ne**: Doğrulanmış satın alma sonrası kullanıcı video review.
- **Neden ertelendi**: Moderation yükü + storage maliyeti + kritik kullanıcı kütlesi.
- **Tetikleyici**: > 10k MAU + moderation ekibi.
- **Tahmini**: 20 saat.
- **Değer**: Sosyal kanıt maksimum.

## 10. Gamification & Rozetler
- **Ne**: "İlk Review", "10 Smart Scan" gibi kullanıcı rozetleri.
- **Neden ertelendi**: Aktif user content gerektirir.
- **Tetikleyici**: User engagement %20+.
- **Tahmini**: 8 saat.
- **Değer**: Retention + topluluk hissi.

## 11. Review Incentive
- **Ne**: Satın alma sonrası review yaz → kupon.
- **Neden ertelendi**: Direkt satış yoksa kupon işlemez.
- **Tetikleyici**: Bundle / subscription aktif.
- **Tahmini**: 5 saat.
- **Değer**: Review volume + sosyal kanıt.

## 12. Smart Scan v2 — Cilt Yaşı / Ton Analizi
- **Ne**: Yüz fotoğrafından AI ile cilt yaşı tahmini (viral potansiyel).
- **Neden ertelendi**: AI vision model kalibrasyonu + veri toplama.
- **Tetikleyici**: > 5000 quiz tamamlayan (baseline data).
- **Tahmini**: 12 saat + model fine-tuning.
- **Değer**: Viral pazarlama hook.

## 13. A/B Test Altyapısı
- **Ne**: GrowthBook self-host veya custom, öneri ve layout testleri.
- **Neden ertelendi**: Launch sonrası trafik birikmesi gerekli.
- **Tetikleyici**: > 500 DAU.
- **Tahmini**: 6 saat.
- **Değer**: Growth optimization.

## 14. Multi-language (i18n)
- **Ne**: AR (GCC ihracatı) + EN (expat) dil desteği.
- **Neden ertelendi**: TR pazarı önce oturmalı.
- **Tetikleyici**: TR launch + stable.
- **Tahmini**: 4 saat altyapı + 2-3 hafta çeviri.
- **Değer**: Pazar genişleme.

## 15. Ürün Memnuniyetsizlik Raporu (Anonim Insight)
- **Ne**: Kullanıcı "bu ürün iyi gelmedi" + sebep → anonim dataset → Brand Portal'da markalara insight.
- **Neden ertelendi**: Kullanıcı kütlesi gerekli.
- **Tetikleyici**: > 5000 MAU.
- **Tahmini**: 6 saat.
- **Değer**: Enterprise tier Brand Portal değeri + sektör insight'ı.

## 16. Dermatolog Randevu + PayTR Entegrasyonu
- **Ne**: Randevu takvimi + ödeme + %15 komisyon.
- **Neden ertelendi**: 5. madde ile bağlı (mevzuat).
- **Tetikleyici**: Sağlık hukuk çerçevesi net.
- **Tahmini**: 12 saat (FinansKoç PayTR patternı taşınabilir).
- **Değer**: Yeni gelir kanalı.

---

## Faz 2 Planından Aggressive Trim ile Ertelenenler (2026-04-13)

Aşağıdaki özellikler **Faz 2 planındaydı**, launch yükünü hafifletmek için ertelendi. Hepsi launch sonrası reactive eklenecek.

### 17. Brand Portal Tag Düzeltme Akışı (eski Faz H)
- **Ne**: Markaların kendi tag'lerini görmesi + düzeltme isteği + admin review + public "Marka doğrulandı" rozeti.
- **Neden ertelendi**: Launch'ta henüz marka itirazı / davası yok, ölü kod olur.
- **Tetikleyici**: İlk 5 marka itirazı gelir gelmez.
- **Tahmini**: 2 saat.

### 18. Ürün Karşılaştırma (`/karsilastir`)
- **Ne**: 4 ürüne kadar yan yana karşılaştırma — marka, fiyat/mL, INCI ortak / farklı / risk renkleri, aktif yüzde, rozet matrisi, komedojenik, pH, need score radar, profil uygunluğu, hamilelik uyumu, doku / finiş, puan + review. Dinamik SEO + schema.org ComparisonTable.
- **Neden ertelendi**: Kullanıcı henüz katalogu tanımıyor, launch'ta compare tool düşük kullanım; cross-sell + need score önce değer üretir.
- **Tetikleyici**: Cross-sell CTR > %5, favori listesi ortalaması > 3.
- **Tahmini**: 4 saat.

### 19. Full AI Search (pgvector + Gemini + Embedding Seed)
- **Ne**: `pgvector` + Google `text-embedding-004` + Gemini 1.5 Flash reranker + Groq / Haiku fallback zinciri. ~1820 entity embedding seed. İnjection filter + tıbbi disclaimer.
- **Neden ertelendi**: Launch'ta 30-intent static shortcut map yeterli. Embedding + LLM rerank Q3 2026'da kullanım verisi birikince eklenir.
- **Tetikleyici**: AI search günlük sorgu > 100 + shortcut miss rate > %40.
- **Tahmini**: 8 saat (MVP üstüne delta).

### 20. Quiz v2 — Compatibility Score + Routine Generator
- **Ne**: `compatibility-checker` servisi (ürün × profil 0-100 skor), `routine-generator` servisi (profile'dan otomatik AM/PM rutin üretimi — cleanser + serum + moisturizer + SPF).
- **Neden ertelendi**: Quiz v1 (profil hesap + recommendation feed + basit alerji banner) launch için yeterli. Skorlu uygunluk ve otomatik rutin quiz completion data birikince rafine edilmeli.
- **Tetikleyici**: > 1000 quiz tamamlayan + cross-sell CTR baseline.
- **Tahmini**: 3 saat.

### 21. Blog Makaleleri 11-20
- **Ne**: AHA/BHA/PHA, Atopik Dermatit, Gözenek, Yaşa Göre Rutin, Göz Çevresi, D Vitamini, Omega-3, Magnezyum, Kolajen, Bebek Cildi Bakımı.
- **Neden ertelendi**: Launch için 10 evergreen yeterli. Kalan 10 post-launch Q2 boyunca haftalık tempo ile yazılır — içerik taze tutma stratejisi.
- **Tetikleyici**: Launch + 1 hafta stabilizasyon.
- **Tahmini**: 10 saat (makale başı ~1 saat).
