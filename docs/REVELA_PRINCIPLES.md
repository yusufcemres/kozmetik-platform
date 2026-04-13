# REVELA — Çalışma Prensipleri ve Farklılaşma Referansı

> Yatırımcı sunumları, ekip onboarding ve ürün kararları için master referans.
> Son güncelleme: 2026-04-13

---

## Bölüm 1 — Vizyon ve Misyon

**Vizyon:** Türkiye'de ilk **bilimsel şeffaflık + doğrulanabilir kanıt + niş ihtiyaç eşleşmesi** temelli kozmetik ve yaşam e-ticaret altyapısı olmak.

**Misyon:** Kullanıcıyı fake yorumlara değil, doğrulanabilir kanıta (INCI, sertifika veritabanları, TİTCK kayıtları) ve test bazlı kişisel profiline dayanarak ihtiyacına uygun ürüne yönlendirmek.

**Temel iddialar:**
- Her tag'in arkasında doğrulanabilir bir kaynak var.
- Yasal risk taşıyan tag'ler (vegan, cruelty-free, halal, organik) asla tahminden türetilmez.
- TİTCK doğrulaması yapılmamış kozmetik ürün satışa çıkmaz.
- Kullanıcıya 20 ürün değil, **profiline uygun 3 ürün** önerilir.

---

## Bölüm 2 — Temel Farklılaşma Tablosu

| Rakipler | REVELA |
|---|---|
| Fake yorumlar | Doğrulanmış satın alma + INCI-match skorları |
| Yüzeysel kategori | 3-seviye hiyerarşi + 80+ niş filtre |
| "Organik" denetimsiz | Ecocert / Cosmos / Leaping Bunny resmi DB lookup |
| "Vegan" tahmini | Vegan Society + INCI + marka onay çapraz doğrulama |
| İçerik gizli | Tam INCI + fonksiyon + güvenlik skoru |
| Aktif yüzde gizli | %-bazlı filtreleme |
| Alerji uyarısı yok | Kullanıcı profilinden otomatik alerji uyarısı |
| Cilt tipi sembolik | Cilt tipi × problem × hassasiyet matrisi |
| Hamilelik uyumu yok | Retinoid / yüksek salisilik / hidrokinon otomatik negatif flag |
| TİTCK doğrulaması yok | ✓ TİTCK rozet + yasaklı madde flag |
| Blog / otorite yok | Medical reviewer onaylı uzun-biçim içerik |
| Test sembolik | Çok boyutlu profil + kişisel öneri + retest |

---

## Bölüm 3 — Temel Ürün Özellikleri

- **Smart Scan** — kamera ile INCI çözümleme ve anlık skor
- **Derinleştirilmiş Quiz** — 15-20 soruluk profil çıkarımı
- **Need-Based Öneri** — ihtiyaç skoruna göre filtreleme
- **Niş Filtreleme** — 80+ rakipte olmayan filtre
- **TİTCK Doğrulama** — resmi Sağlık Bakanlığı bildirimi kontrolü
- **Brand Portal** — markalar için self-service panel (Free / Pro / Enterprise SaaS)
- **B2B API** — eczacı / klinik / dermatolog white-label
- **İçerik Detay Sayfaları** — her INCI kendi SEO sayfası
- **Blog & SEO + Medical Reviewer Pattern** — editöryal otorite
- **AI Sohbet Arama** — doğal dilde sorgu → öneri (MVP: 30 shortcut intent)
- **Smart Scan v2** (yol haritası) — cilt yaşı / ton analizi

---

## Bölüm 4 — Tag Kalite Sistemi (6 Katmanlı Mimari, MVP 3 Katman)

### Katman 1 — INCI Deterministik
CosIng + INCI Decoder + Paula's Choice + PubChem seedlemesi ile:
- Parabensiz, silikonsuz, sülfatsız, PEG-free, mineral-oil-free
- Komedojenik skor (0-5)
- EU-26 allergen listesi
- Drying alcohol vs fatty alcohol (cetyl, stearyl) ayrımı

### Katman 2 — Sertifika Veritabanı
Leaping Bunny, PETA, Vegan Society, V-Label, Ecocert, GIMDES, NSF, Informed Sport, Informed Choice. **Yasal risk içeren tag'ler asla INCI'den türetilmez.**

### Katman 3 — Marka Claim Scraping (Faz F içine taşındı)
Sadece resmi marka sitesi (Trendyol / Amazon **asla**). Her claim için ham alıntı + URL + timestamp provenance tablosuna yazılır.

### Katman 4 — LLM Kısıtlı Çıkarım (Dar Kapsam, Faz F)
Claude Sonnet grounded extraction — yalnızca doku ve AM/PM için. Confidence < 0.7 → review queue.

### Katman 5 — Çakışma Tespiti
INCI "lanolin içerir" vs marka "vegan" → ürün otomatik draft + admin queue.

### Katman 6 — Brand Portal Self-Correction (Post-Launch)
Markalar kendi tag'lerini görür, düzeltme isteği açar (audit trail). Onaylanınca public'te "Marka doğrulandı" rozeti. Launch sonrası reactive eklenir.

---

## Bölüm 5 — Publish Gating

Ürün `status = 'published'` olmadan otomatik validator:
- ≥ 1 görsel
- INCI parse edilmiş
- ≥ 3 deterministik tag
- Kategori + alt kategori atanmış
- Need score hesaplanmış
- Çakışma yok
- Yasal risk tag'leri kaynak doğrulamalı
- TİTCK kontrolü (varsa rozet / yasaklı madde varsa otomatik draft + admin flag)

---

## Bölüm 6 — Özel Durum Kuralları

- **Aktif yüzde**: yalnızca marka resmi sitesi / ürün ismi / klinik çalışma — INCI'den **asla**
- **Hamilelik uyumu**: retinoid / yüksek salisilik / hidrokinon → otomatik NEGATİF; POZİTİF claim yalnızca sertifikalı
- **Takviye aktif miktar**: etiket + marka sitesi, RDA % otomatik, biyoyararlanım formu (sitrat / bisglisinat / oksit)
- **Bebek yaş aralığı**: yalnızca marka resmi sayfası, tahmin yok
- **TİTCK yasaklı madde**: Sağlık Bakanlığı listesi ile otomatik çapraz kontrol, varsa ürün otomatik draft + admin flag

---

## Bölüm 7 — Kategori Taksonomisi

### Ana Kategoriler
- **Yüz Bakımı** (9 alt: Temizlik, Tonik & Esans, Serum & Ampul, Nemlendirici, Göz, Dudak, Maske, SPF, Peeling)
- **Vücut Bakımı** (8 alt)
- **Saç & Saç Derisi** (6 alt)
- **Erkek Bakımı** (4 alt)
- **Bebek & Çocuk** (9 alt: Yıkama, Nemlendirici, Pişik, SPF, Atopik, Saç, Masaj Yağı, Diş / Ağız, Çocuk Takviyesi)
- **Gıda Takviyesi** (Vitamin, Mineral, Omega, Protein & Aminoasit, Probiyotik, Bitkisel, Hedef-odaklı)

### Niş Filtreler (80+, rakiplerde yok)
- **Ortak**: INCI-free rozetleri, etik rozetler, sertifika rozetleri, ambalaj, fiyat/mL, **TİTCK rozeti**
- **Dermokozmetik**: cilt tipi × problem, komedojenik < 2, pH 4.5-5.5, aktif yüzdesi, hamilelik, rosacea / atopi / kuperoz, prosedür sonrası, layering, etki başlangıcı, doku, finiş, AM/PM, mevsim, yaş
- **Takviye**: form, kapsül boyutu, günlük doz, biyoyararlı form, RDA %, kaynak, alerjen-free, 3. taraf test, dopingsiz, katkısız, kür süresi, kombinasyon uyumu
- **Bebek**: yaş ay, göz yakmaz, prematüre, parfümsüz, ağız güvenli

---

## Bölüm 8 — Data Provenance

```sql
CREATE TABLE product_tag_provenance (
  id bigserial PRIMARY KEY,
  product_id int NOT NULL,
  tag_key text NOT NULL,
  tag_value text,
  source_type text, -- inci_deterministic | certification_db | brand_claim | llm_extracted | brand_portal | admin | titck
  source_url text,
  source_quote text,
  created_at timestamp DEFAULT now()
);
```

Marka itirazında kanıt gösterilir:
> _"İçerik listesinde Dimethicone, 3. sırada (marka resmi sayfa, 2026-04-13)"_.

İleri şema alanları (`confidence`, `verified_by`, `verified_at`) ihtiyaç oluştuğunda `ALTER TABLE` ile eklenir.

---

## Bölüm 9 — Yatırımcı Pitch Özeti

- **Güven krizi** — Türkiye kozmetik e-ticaretinde fake yorumlar ve denetimsiz claim'ler. REVELA kaynak-garantili tag sistemi ve TİTCK doğrulaması ile güveni geri veriyor.
- **Niş filtreleme** — 20 ürün değil, ihtiyaca uyan 3 ürün → conversion sektör ortalamasının üstünde.
- **Smart Scan** — mağaza ↔ e-ticaret köprüsü (offline-online).
- **Brand Portal** — ücretli SaaS (Free / Pro / Enterprise) → reklama bağımsız gelir.
- **B2B API** — klinik / eczacı / dermatolog white-label → enterprise gelir.
- **Blog + SEO + Medical Reviewer** — organik büyüme + otorite inşası (E-E-A-T).
- **Tag kalite mimarisi** — marka davalarına karşı savunma kalkanı (her tag kaynaklı).
- **TİTCK rozeti** — sahte / kaçak ürün tespiti, Türkiye'de ilk.

---

## Bölüm 10 — Hukuki ve Etik Garantiler

- Yasal risk tag'leri (vegan, cruelty-free, halal, organik) **yalnızca** sertifika DB onayıyla atanır.
- KVKK uyum: hesap silme + veri export mevcut.
- Güvenlik: CSP, HSTS, IP + email rate limit, Brand Portal audit trail.
- TİTCK mevzuat uyumu: yasaklı madde içeren ürün publish olmaz.
- Dermatolog ürün endorsement **yok** — TTB Hekim Tanıtım Kuralları nedeniyle. Onun yerine **Medical Reviewer pattern** (editöryal bilgi doğrulama, WebMD / Healthline standardı).

---

## Referanslar
- İlgili dokümanlar: `VALUE_PROPOSITIONS.md`, `ROADMAP.md`
- Teknik mimari: `01-system-overview.md`, `02-database-schema.md`
