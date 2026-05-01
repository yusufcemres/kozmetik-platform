# 🎤 ARDVENTURE TEKMER Q&A Hazırlık Dataset — 4 Mayıs 2026

**Strateji:** Olası 25 yatırımcı/mentor sorusu + hazır cevap + somut data point. Sunum sonrası 5-10 dk Q&A için hazırlık.

---

## A) Pazar + Rakipler

### A1. "Yuka neden Türkiye'ye gelmesin? Rakip risk var mı?"

**Cevap:** Yuka Avrupa odaklı — Fransa merkezli, çoğu içerik İngilizce/Fransızca. Türkçe içerik üretim maliyeti onlar için yüksek, yerel marka kapsama zayıf. REVELA olarak:
- 1.795 Türk pazarındaki ürünü zaten taradık + lokalize ettik
- 475 INCI bileşeninin tamamı **Türkçe karşılıkla** (%100)
- Her INCI için A-E grade + literatür atıfı **Türkçe**
- Yerel markalar (Procsin, Sekate, Nutraxin) detaylı kapsamada

**Pazara giriş bariyeri:** Lokal içerik. Yuka 6+ ay yatırım yapmadan Türkiye'ye gelemez.

### A2. "INCI Decoder'ın Türkçe versiyonu yok mu?"

**Cevap:** INCI Decoder İngilizce, ABD merkezli. Türkiye pazarındaki ürünleri kapsamıyor — La Roche-Posay Türkiye varyantları, Sekate, Procsin, yerel ekzeptliler yok. REVELA bunlar dahil 1.795 ürün **kişisel uyumluluk skoru** ile.

### A3. "Türkiye kozmetik pazarı ne kadar?"

**Cevap:**
- 12 milyar TL+ yıllık ciro (Euromonitor 2026)
- Dermokozmetik segmenti %25 yıllık büyüme
- K-beauty %35 büyüme (online dominant)
- Online satış %40 yıllık büyüme
- Total Addressable Market: ~50M tüketici

### A4. "Niye Türkiye odaklı? Avrupa pazarı çok daha büyük."

**Cevap:** Türkiye'de Türkçe-bilim-temelli kozmetik analizinde **boş niş**. Avrupa'da Yuka, INCI Decoder, Beauty 'n Berries var. Önce Türkiye'de pazar liderliği, sonra Q4 2026'da Avrupa pazarına genişleme — DE + FR Türkçe diasporası başlangıç.

---

## B) Gelir Modeli

### B1. "Gelir modeli ne? Sürdürülebilir mi?"

**Cevap:** İki ana akış + iki yedek:
1. **Affiliate komisyon** — 8 platform (Trendyol, Hepsiburada, N11, PttAVM, Sekate, Amazon TR, Watsons, Gratis), 9.212 link, ortalama %5-8 komisyon
2. **B2B Brand Portal** — markaların kendi ürünlerini yönetmesi için lisans, Q3 pilot
3. **Premium subscription** — kullanıcı ($3.99/ay AI cilt analiz + dermatolog Q&A)
4. **Dermatolog ofis white-label** — Q4 partnership

### B2. "Aylık aktif kullanıcı (MAU) hedefi?"

**Cevap:**
- Q2 2026: 5K MAU (mevcut, lansman aşaması)
- Q3 2026: 25K MAU (mobile app launch + content pazarlama)
- Q4 2026: 75K MAU (Avrupa pilot + sosyal medya)
- 2027: 250K MAU hedef

Her MAU/ortalama affiliate gelir = ~5-8 TL/ay (sektör benchmarklarına göre).

### B3. "Kullanıcı başına ne kadar kazanırsınız (ARPU)?"

**Cevap:**
- Free user: 5-8 TL/ay (affiliate bazlı)
- Premium ($3.99/ay): ~70 TL/ay
- Pro ($9.99/ay): ~175 TL/ay
- B2B brand: 5K-50K TL/yıl per marka

### B4. "Break-even ne zaman?"

**Cevap:**
- Mevcut maliyet: aylık ~3K TL (Render + Vercel + Neon + ElevenLabs + Suno + ek API'ler)
- 1K aktif user'da affiliate: ~5K-8K TL/ay
- **Q3 2026 break-even** (mobile app + 25K MAU)
- Brand portal Q4 ile ek ölçek

### B5. "Yatırım talebi ne kadar?"

**Cevap:** Pre-seed:
- $50K — mobile app dev (React Native)
- $30K — pazarlama (Instagram/TikTok content + influencer)
- $20K — ekip genişletme (1 frontend + 1 content moderator)
- **Toplam $100K** 12 aylık runway için

Veya alternatif: **TEKMER üyeliği + mentor desteği** ile bootstrap.

---

## C) Ürün + Teknoloji

### C1. "Bu skoru nasıl güvenilir hâle getiriyorsunuz?"

**Cevap:** Her INCI için:
- A-E grade (CIR/SCCS sınıflandırma)
- En az 1 literatür atıfı (peer-reviewed, RCT, AB regülasyon)
- 475/475 (%100) kullanılan INCI'da bu var
- Floor cap kuralları (CMR, endokrin, AB-yasaklı flag → otomatik düşük skor)
- Algorithm versiyonlama + cache invalidation

Şeffaflık: /nasil-puanliyoruz sayfasında metodoloji **public**.

### C2. "AI ne kullanıyorsunuz?"

**Cevap:**
- **Claude API (Anthropic)** — içerik üretim + AI arama (doğal dil cilt sorusu)
- **Google ML Kit** — gelecek mobile barkod + INCI OCR
- Manuel content moderation — kalite kontrol

### C3. "Veriler ne kadar güncel?"

**Cevap:**
- 1.795 ürün **gerçek görsel** (%100 kapsama)
- 475 INCI **Türkçe + grade + atıf** (%100)
- 90+ rehber makale (RCT atıflı)
- 24/24 ihtiyaç matrisi (FAQ + skin type + interaction warnings)
- Affiliate fiyatlar günlük güncellenir

### C4. "Mobile app ne zaman?"

**Cevap:** Q3 2026 — Temmuz pilot, Ağustos beta, Eylül stable. React Native, iOS + Android tek codebase. **Barkod tarama** + offline mod + kişisel cilt profili.

### C5. "Brand portal ne zaman canlı?"

**Cevap:** Q3 2026 pilot (5-10 marka), Q4 2026 ölçeklenme (30+ marka). Markalar:
- Kendi ürünlerinin INCI bilgisini güncelleyebilir
- Marka hikayesi + sertifika ekleyebilir
- Aylık trafik analytics görür
- Premium tier'da push bildirim duyuru

---

## D) Operasyon + Ekip

### D1. "Solo kurucu — risk değil mi?"

**Cevap:** Risk evet, ama hızlı karar avantajı. **6 yıl** kimya doktora + AI/ML + 5+ yıl saha tecrübesi (TUNAP + 5 kimya firması). Kombinasyon Türkiye'de eşsiz. Q3'te ilk hire (frontend dev + content moderator). BİGG kabul edilirse şirket kuruluş + 1-2 takım üyesi.

### D2. "İçerik üretim sürdürülebilir mi?"

**Cevap:**
- 90+ makale **manuel yazılmış** (Türkçe, RCT atıflı)
- 475 INCI bileşeninin tamamında detay
- AI yardımcı ama insan editör kontrolü
- Üretim hızı: haftada 5-10 yeni makale + bileşen güncelleme
- Q3 2026: REVELA Podcast 75 bölüm pipeline

### D3. "Veri kaynağı + güvenilirlik?"

**Cevap:**
- INCI veri: CIR, SCCS, AB Annex II/III/V/VI
- Klinik atıflar: PubMed peer-reviewed RCT'ler
- Affiliate fiyat: gerçek zamanlı 8 platform
- Marka bilgisi: şirket beyanı + üçüncü taraf doğrulama

---

## E) Diğer Sololabs Ürünleri

### E1. "ChemDoc AI ne? REVELA ile sinerjisi?"

**Cevap:** ChemDoc AI Türkiye KKDIK Yönetmeliği uyumluluğu için Güvenlik Bilgi Formu (GBF) hazırlama AI motoru. Pilot 5 müşteri (TUNAP dahil).

**Sinerji:** REVELA INCI veritabanı oluştururken topladığım kimya bilgisi ChemDoc AI'da değer üretiyor. 16 yönetmelik bölümü, 9 GHS piktogram, H-cümleleri + P-cümleleri Türkçe veritabanı ortak.

Sololabs bu sinerji çatısı.

### E2. "ChefMate, Redi neden farklı sektörde?"

**Cevap:** **Sermaye verimliliği** — solo kurucu portföy stratejisi:
- Risk dağılımı (4 sektör)
- Ortak teknoloji altyapı (NestJS + PostgreSQL + AI)
- Çapraz öğrenme (REVELA içerik üretim deneyimi → ChefMate)

Ana odak REVELA. Diğerleri **maintenance + hibe başvurusu** modunda.

### E3. "BİGG 1812 başvurusu ne aşamada?"

**Cevap:** Boğaziçi DreamBigg üzerinden 28 Nisan 2026 gönderildi — ön eleme bekleniyor. Hibe alırsa şirket kurulur + Boğaziçi Teknopark üyelik. Hibe alınmazsa **Ankara TEKMER** (ARDVENTURE) odaklı, REVELA + Redi ana ürün.

---

## F) Risk + Engeller

### F1. "Yasal risk yok mu? Sağlık iddiaları?"

**Cevap:** REVELA **bilim-temelli analiz** — sağlık iddiası değil, **bilgi platformu**. Her INCI için:
- "Tedavi" iddiası yok
- "Önerilen ürün" var ama "doktor reçetesi" değil
- Disclaimers her sayfada
- Dermatolog konsültasyonu önerisi

AB Cosmetic Regulation 1223/2009 + Türkiye Kozmetik Yönetmeliği uyumlu.

### F2. "Marka çelişkisi olur mu? Marka size dava açar mı?"

**Cevap:** Şu ana kadar yok. Stratejimiz:
- **Olgular** (CIR/SCCS) konuşur, **iddialar** değil
- "X marka kötü" demiyoruz, INCI bazlı analiz
- Affiliate transparency açık
- Brand portal lansmanıyla markalar **kendi sayfalarını** yönetebilecek (çelişkiyi önler)

### F3. "Kullanıcı verisi + GDPR/KVKK?"

**Cevap:** KVKK uyumlu:
- Cilt analizi quiz **lokal** (cihazda saklı)
- Profil opsiyonel (anonim kullanım mümkün)
- Veri minimum prensibi
- Avrupa pazarına geçişte GDPR otomatik uyumlu (zaten KVKK)

### F4. "Affiliate iflas riski (Trendyol vb.)?"

**Cevap:** 8 platform diversifikasyonu — tek platforma bağlı değiliz. Trendyol bile %100 kaybetsek HB + N11 + Sekate + Watsons + Gratis kalır. Eczane fiziksel kanal Q4'te eklenecek.

---

## G) Strateji + Vizyon

### G1. "5 yıllık vizyon?"

**Cevap:**
- 2026: Türkiye lider Türkçe kozmetik analiz (250K MAU)
- 2027: Avrupa Türkçe diaspora + DE/FR Türkçe pazarı
- 2028: B2B brand portal 100+ marka, dermatolog network
- 2029: Mobile app top 50 health/beauty TR + DE
- 2030: IPO veya stratejik exit (LVMH, L'Oréal, Beiersdorf değer arar)

### G2. "Exit stratejisi?"

**Cevap:** Açık iki yol:
1. **Stratejik satış** — büyük dermokozmetik firma (L'Oréal, Beiersdorf, Procter & Gamble) Türkiye pazarına girişte
2. **Bağımsız büyüme** — sürdürülebilir SaaS, yıllık ~$2-5M ARR hedefi, 10-20K MAU paying

BİGG yatırım kuralı: 12 yıl şirket ömrü, %3 fon hissesi. Exit zorunluluğu yok.

### G3. "Niye şimdi? Niye sen?"

**Cevap:**
- **Şimdi:** AI + bilim-temelli içerik tüketici talebi 2024-2026'da patladı. Mikrobiyom, peptit, evidence-based bakım Türkçe içerik açığı maximum.
- **Sen:** Kimya doktora + AI/ML + saha. Kombinasyon "sadece sen" testi geçen tek aday. Yan ürünler (ChemDoc AI) sinerji destekçi. Solo kurucu hız avantajı.

---

## H) Demo + Spesifik

### H1. "AI arama nasıl çalışıyor?"

**Cevap:** Doğal dil → Claude API → cilt sorunu/ihtiyaç eşleştir → ürün filter + skor sıralama. Örnek: "rozam var ne iyi gelir" → ihtiyaç: rosacea → uygun INCI'ler (centella, niasinamid, azelaik, ektoin) içeren ürünler.

### H2. "Skor algoritması ne kadar hassas?"

**Cevap:** v1 cosmetic + v2 supplement = 1.942 ürün skor cache. 7 boyut + floor cap.
- Ortalama hesaplama süresi: 50ms
- Redis cache (3600s TTL)
- Algorithm version bump → tüm cache invalidate
- Kullanıcı her bileşen için **breakdown** görebilir

### H3. "Affiliate gelir sürdürülebilir mi yoksa kullanıcıyı sömürü mü?"

**Cevap:** **Şeffaflık beyanlı.** Her sayfada "Bağımsız + şeffaf — affiliate gelir kaynağımız fiyat karşılaştırmadan komisyon, marka pazarlamasından değil" notu. Affiliate sadece sıralamaya etki etmez (skor önce, fiyat sonra).

---

## Sunum Sonrası 24 Saat İçinde

- Teşekkür maili (görüşme sonrası 24 saat içinde, kuralın gerektirdiği)
- 1-2 somut sonraki adım önerisi (mentorlük talebi, takip görüşme, pilot proje)
- Klasör + sunum slaytlarını mail eki olarak gönder

## Yedek Plan (Sorun Çıkarsa)

- Sunum 30 saniye uzun → "Sondaki kısmı atlatabilirim" hazır
- Demo crash → mobile screenshot/video yedek
- Kritik soru cevapsız → "Detay için sonra döneyim, mail atayım"
- Ana ekran çalışmaz → klasördeki PDF'leri sun

İyi şanslar Patron 🚀
