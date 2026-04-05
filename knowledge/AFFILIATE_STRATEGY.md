# REVELA Affiliate Marketing Gelir Modeli Stratejisi

## 1. Mevcut Durum

### Platform Altyapisi
- **1903 urun**, 113 marka, 57 kategori
- **8866 affiliate link** (7 platform)
- Fiyat takip sistemi aktif (`price_history` tablosu)
- Urun detayda "Satin Al" butonlari affiliate URL'lere yonlendiriyor
- Cilt analizi + AI oneri motoru mevcut

### Platform Dagilimi

| Platform | Link Sayisi | Tahmini Komisyon |
|----------|------------|-----------------|
| Gratis | 1,785 | %5-8 |
| Watsons | 1,769 | %4-7 |
| Rossmann | 1,736 | %4-7 |
| Hepsiburada | 1,168 | %4-10 |
| Trendyol | 1,079 | %3-8 |
| Dermoeczanem | 910 | %5-12 |
| Amazon TR | 419 | %3-7 |

### Avantajlar
- Turkiye'de karsiligi olmayan niched platform (INCIDecoder/CosDNA Turkce versiyonu)
- Bilimsel veri tabani: 5000 ingredient, 38K urun-ingredient eslestirmesi
- AI-powered kisisel oneri (cilt analizi + need scoring)
- Coklu platform fiyat karsilastirma altyapisi hazir

---

## 2. Gelir Kanallari

### Kanal 1: Dogrudan Affiliate Komisyon (Ana Gelir)
Kullanici urune tiklar → platforma yonlendirilir → satin alir → komisyon kazanilir.

**Mevcut akis:**
```
Urun Detay → "Satin Al" buton → affiliate URL → platform → satis → komisyon
```

**Tahmini gelir modeli:**
- Aylik benzersiz ziyaretci: 10K (hedef 6 ay)
- Urun tiklanma orani: %15 (kozmetik nicheinde yuksek intent)
- Donusum orani: %2-4 (affiliate standart)
- Ortalama sepet: 150 TL
- Ortalama komisyon: %5
- **Aylik gelir tahmini: 10K x 0.15 x 0.03 x 150 x 0.05 = 337 TL**
- **50K ziyaretcide: ~1,680 TL/ay**
- **100K ziyaretcide: ~3,375 TL/ay**

### Kanal 2: Fiyat Dusus Bildirimi
Kullanici favori urunune fiyat alarmi kurar → fiyat dustugunde e-posta/push → yuksek donusum.

**Neden etkili:**
- Alim niyeti zaten var (favori eklemis)
- Fiyat dusus tetikleyici — donusum orani %8-15
- Push notification → anlik tiklanma

**Teknik gereksinim:**
- `price_alerts` tablosu (user_id, product_id, target_price)
- Gunluk fiyat kontrol cron job (mevcut price_history altyapisini kullanir)
- E-posta servisi (Resend veya SendGrid)

### Kanal 3: Akilli Fiyat Karsilastirma
Urun detayda tum platformlarin fiyatini goster → en uygun olanini vurgula → tiklama artisi.

**Mevcut altyapi:** `affiliate_links` tablosunda `price_snapshot` + `price_history` tablosu zaten var.

**Ek deger:**
- "En ucuz burada" badge'i → tiklanma orani %30+ artis
- Platform logolari + fiyat gecmisi grafigi (PriceChart componenti mevcut)
- Fiyat degisim trendi (son 30 gun yuzde degisim)

### Kanal 4: Cilt Analizi → Kisisel Oneri → Affiliate
AI analiz sonucunda onerilen urunler direkt affiliate linkiyle sunulur.

**Funnel:**
```
Cilt Analizi (7 adim) → AI Sonuc → "Sana Ozel Urunler" → Affiliate Link → Satis
```

**Donusum avantaji:** Kisisellestirilmis oneri donusum orani genel browsing'den 3-5x yuksek.

### Kanal 5: Marka Sponsorlugu (Gelecek Faz)
- "One Cikan Marka" konumlandirma
- Markalara ozel landing page
- Sponsored product pozisyonlari (arama sonuclarinda ust siralama)
- **Aylik sabit ucret modeli: 2K-10K TL/marka**

---

## 3. Donusum Optimizasyonu

### Click Tracking
Her affiliate tiklama kayit altina alinacak:

```sql
CREATE TABLE affiliate_clicks (
  click_id SERIAL PRIMARY KEY,
  affiliate_link_id INT REFERENCES affiliate_links(affiliate_link_id),
  user_id INT REFERENCES users(user_id),  -- nullable (anonim)
  source_page VARCHAR(100),                -- 'product_detail', 'search', 'recommendation', 'skin_analysis'
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_hash VARCHAR(64),                     -- privacy-safe
  user_agent TEXT
);
```

**Raporlama metrikleri:**
- Toplam tiklanma / gun
- Platform bazli donusum
- Sayfa bazli CTR (hangi sayfa en cok donusturuyor)
- Urun bazli popularite

### UTM + Sub ID Tracking
```
affiliate_url?utm_source=revela&utm_medium=affiliate&utm_campaign={page_type}&sub_id={click_id}
```
Bu sayede platformlarin kendi panelinden hangi tiklama satis donusturdugu izlenebilir.

### A/B Test Plani
1. "Satin Al" buton rengi: Primary vs Error (kirmizi) vs Success (yesil)
2. Buton pozisyonu: Fiyat altinda vs sabit sticky bar
3. Fiyat gosterim: Sadece fiyat vs "En ucuz: X TL" karsilastirma
4. CTA metni: "Satin Al" vs "Fiyati Gor" vs "Mağazaya Git"

---

## 4. Teknik Gereksinimler

### Faz 1 (Hemen)
- [ ] `affiliate_clicks` tablosu olustur
- [ ] Affiliate link tiklandiginda click kaydi at (API endpoint)
- [ ] Frontend: "Satin Al" butonuna onClick tracking ekle
- [ ] Basit admin dashboard: gunluk/haftalik tiklama raporu

### Faz 2 (1-2 Ay)
- [ ] `price_alerts` tablosu + kullanici fiyat alarmi UI
- [ ] Gunluk fiyat kontrol cron (price_history'den oku)
- [ ] E-posta servisi entegrasyonu (fiyat dusus bildirimi)
- [ ] Urun detayda "Fiyat Alarmi Kur" butonu

### Faz 3 (3-6 Ay)
- [ ] Marka sponsorluk modulu (admin panelinde)
- [ ] Sponsored product pozisyonlari
- [ ] Aylik gelir raporu dashboard
- [ ] Affiliate performans analitigi (hangi marka/urun en cok kazandiriyor)

---

## 5. Gelir Projeksiyonu

| Metrik | 3. Ay | 6. Ay | 12. Ay |
|--------|-------|-------|--------|
| Aylik ziyaretci | 5K | 25K | 100K |
| Affiliate tiklama | 750 | 3,750 | 15,000 |
| Donusum | 23 | 113 | 450 |
| Komisyon geliri | 170 TL | 845 TL | 3,375 TL |
| Fiyat alarmi geliri | - | 200 TL | 1,000 TL |
| Sponsorluk | - | - | 5,000 TL |
| **Toplam** | **170 TL** | **1,045 TL** | **9,375 TL** |

> Not: Bu projeksiyonlar konservatif. Kozmetik nichei yuksek intent trafik cekerr — organik SEO + sosyal medya ile buyume hizi artabilir.

---

## 6. SEO + Organik Buyume Stratejisi (Affiliate Destekli)

### Icerik Stratejisi
- "En iyi [urun tipi] 2026" listicle yazilar (affiliate linkli)
- "X vs Y karsilastirma" yazilari (her iki urune affiliate link)
- "Cilt tipine gore [urun onerisi]" rehberleri
- Ingredient bazli icerikler ("Niacinamide iceren en iyi serumlar")

### Teknik SEO
- Urun sayfalari: structured data (Product schema + AggregateOffer)
- Kategori sayfalari: breadcrumb + pagination
- Ingredient sayfalari: FAQ schema
- Marka sayfalari: Organization schema

---

## 7. Onemli Notlar

1. **Yasal:** Affiliate linkler acikca belirtilmeli ("Bu link uzerinden yapacaginiz alimlardan komisyon kazanabiliriz")
2. **Guvenilirlik:** Oneri motoru tamamen bilimsel verilere dayali — sponsorlu urunler ayri etiketlenmeli
3. **Platform sozlesmeleri:** Her platform icin ayri affiliate basvurusu gerekli
4. **Odeme:** Cogu platform 100 TL minimum odeme esigi uyguluyor
5. **Cookie suresi:** Trendyol 30 gun, Hepsiburada 30 gun, Amazon 24 saat — bu donusum hesabini etkiler
