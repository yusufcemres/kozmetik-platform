// NotebookLM v3 — Süper kondanse, hedef 8-12 dk
// Strateji: tablo + bullet kaldır, sadece akış metni; agresif prompt + kısa içerik
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const PILOTS = [
  {
    slug: '2026-04-30-lekek-tedavi-arbutin-kojik-tranexamic',
    summary: 'Üç lekek aktifi karşılaştırma — arbutin, kojik, tranexamic — hangi cilde hangisi.',
    condensed: `Hiperpigmentasyon farklı yollardan oluşur: UV-tetiklemeli, hormonal melasma, post-akne lekesi. Tek bir aktif tüm yolakları kapatmaz.

Üç ana topikal aktif var. **Alpha-arbutin** %1-2 konsantrasyonda kullanılır, hidrokinonun glikozit formu — yumuşak tirozinaz inhibitörü, hassas cilt uyumlu. Polnikorn 2008 RCT'sinde 12 haftada melasma indeksinde anlamlı azalma gösterdi.

**Kojik asit** Aspergillus oryzae fermentasyonundan gelir. Tirozinazın bakır bağlama bölgesini şelat eder. AB Annex III'te leave-on için %1, rinse-off için %2 maksimum. Kontakt dermatit prevalansı %3-7, patch test önerilir.

**Tranexamic asit** sentetik lizin türevi. Plazmin yolağını engelleyerek alpha-MSH ve melanin sentezini baskılar. Vasküler bileşeni de hedeflediği için dirençli melasmada üstün. Wu 2012 ve Atefi 2017 RCT'leri ile kanıtlı.

Pratik kombinasyon: Hafif lekede tek alpha-arbutin %2 + niasinamid + SPF, 12 hafta yeterli. Orta melasmada sabah arbutin + gece traneksamik %5. Dirençli vakalarda dermatolog gözetiminde üçlü.

Hidrokinon Türkiye dahil çoğu ülkede reçeteli. Öz-tedavi vitiligo benzeri depigmentasyon riski.

Tüm protokollerde **SPF mutlak**. Lekek tedavisi UV koruması olmadan etkisiz.`,
  },
  {
    slug: '2026-04-30-skin-cycling-4-gun-protokol',
    summary: 'Dr. Whitney Bowe 4 günlük rotasyon — eksfoliyant, retinol, dinlenme, dinlenme.',
    condensed: `Skin cycling, 2022'de TikTok'ta popülerleşen 4 günlük rotasyon protokolü. Mantığı: aktiflerin tahriş etkisini en aza indirip etki gücünü korumak.

Gece 1: Eksfoliyant — AHA glikolik %5-10 veya BHA salisilik %2 toner. Korneosit dezgomofilizasyonu. Sabah SPF zorunlu.

Gece 2: Retinol veya retinaldehit. %0.3-0.5 başlangıç. Sandwich method: nemlendirici → retinol → nemlendirici. Tahrişi azaltır.

Gece 3 ve 4: Dinlenme. Sadece nemlendirici — hyaluronik asit, niasinamid, ceramide kremi. Stratum corneum lipid yenilenmesi.

Geleneksel hata: her gece retinol + AHA + BHA üst üste deneyince bariyer çöker. Skin cycling 2 gün aktif gerilim, 2 gün bariyer onarımı dengesini kurar.

Klinik kanıt: spesifik RCT yok ama temel mantık dermatoloji literatüründe yıllardır kabul. Mukherjee 2006 retinol toleransı çalışması, Draelos 2018 AHA + retinol rotasyonu makalesi mantığı destekler.

Hassas cilt için modifikasyon: 6 günlük döngü — 1 PHA, 1 bakuchiol, 4 dinlenme. Akneye yatkın için: 1 BHA, 1 retinol, 1 niasinamid yoğun, 1 bariyer.

Sonuç görünür hale gelmesi 4-8 hafta sürer. Sürdürülebilirlik bariyer korunması üzerine kurulu.`,
  },
  {
    slug: '2026-04-30-cilt-mikrobiyomu-probiyotik',
    summary: 'Cilt mikrobiyomu — probiyotik canlı bakteri, prebiyotik besin, postbiyotik metabolit.',
    condensed: `Cilt yüzeyinde 1000+ farklı bakteri, mantar, virüs simbiyotik yaşar. Toplam mikroorganizma sayısı vücut hücrelerinden 10 kat fazla. Sağlıklı mikrobiyom bariyer fonksiyonunu destekler, patojen bakteri kontrolünü sağlar, cilt pH'ını korur.

Mikrobiyom dengesizliği — dysbiosis — akne, atopik dermatit, rosacea ve perioral dermatit ile bağlantılı.

Üç kategori aktif var. **Probiyotik** canlı bakteri suşları. Lactobacillus, Bifidobacterium türleri. Topikal formülasyonda canlı tutmak zor — soğuk zincir gerek, koruyucular bakteriyi öldürür.

**Prebiyotik** mevcut sağlıklı bakterileri besler. Inulin, fructooligosaccharides, beta-glucan. Stabil ve raf ömrü uzun. Glatz 2018 alpha-glucan oligosakkarit atopik dermatit S. aureus baskılaması.

**Postbiyotik** bakteri metabolitleri. Galactomyces ferment SK-II Pitera'nın aktifi, sebum ve por görünüm RCT kanıtlı. Bifida ferment lysate Guéniche 2010 hassas cilt bariyer çalışmasıyla destekli.

Pazar trendi: La Roche-Posay AquaPosae, SK-II Pitera, Some By Mi galaktomis. The Ordinary Lactic Acid hafif prebiyotik etki.

Sınırlama: topikal probiyotik ciltte kalıcı kolonize olmaz, etki 24-48 saat. Mikrobiyom-uyumlu ürün için yumuşak surfaktan, pH 5-5.5, postbiyotik içerik kontrol edilmeli.

Kaçınılması gerekenler: triklosan antibakteriyel, yüksek alkol, sülfat içeren agresif yıkayıcı.`,
  },
];

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const outDir = resolve(__dirname, '../../../../../podcast-pilot/v3');
try { mkdirSync(outDir, { recursive: true }); } catch {}

for (const p of PILOTS) {
  const r = await c.query(`SELECT title FROM content_articles WHERE slug = $1`, [p.slug]);
  const title = r.rows[0]?.title || p.slug;

  const out = `# ${title}

## 🎙️ AÇILIŞ JINGLE — REVELA Sponsorlu (her bölüm zorunlu)

**(İki sunucu sohbetin EN BAŞINDA, kaynak özetinden ÖNCE bunu seslendirir.)**

> Sunucu A: "Merhaba, REVELA Podcast'e hoş geldiniz — kozmetik içeriklerinin bilimini Türkçe konuşan podcast."
>
> Sunucu B: "Bugünün konusu: ${title}."
>
> Sunucu A: "Bu bölüm REVELA tarafından sunuluyor. REVELA Türkiye'deki 1.795 ürünü 7 boyutlu bilimsel skorla analiz eden bağımsız platform — kozmetik-platform.vercel.app."

---

## ASIL İÇERİK (yaklaşık 8-10 dakikalık sohbet için, kondanse)

**Bölüm Özeti:** ${p.summary}

${p.condensed}

---

## 🎙️ KAPANIŞ JINGLE — REVELA Outro

> Sunucu B: "Bu konunun tüm INCI'leri ve ürünleri kozmetik-platform.vercel.app — REVELA'da bilim-temelli skorla mevcut."
>
> Sunucu A: "Bir sonraki bölümde görüşmek üzere — sağlıkla kalın."

---

## 🎚️ KRİTİK ÜRETİM TALİMATI (NotebookLM)

**Hedef süre: 8-12 dakika. UZATMAYIN.**

- Uzunluk: KISA seçin
- Biçim: Ayrıntılı inceleme
- Dil: Türkçe
- Sunucular **özet konuşsun**, paragraf paragraf okumasın
- Tekrarları önleyin — aynı kavramı 2 kez açıklamasınlar
- Aşırı detaya kaçmayın — bu özet zaten kondanse, üstüne katmayın
- Açılış jingle yaklaşık 30 saniye, kapanış 20 saniye, asıl içerik 7-10 dakika

Toplam: 8-12 dakika hedefi.
`;

  writeFileSync(resolve(outDir, `${p.slug}.md`), out);
  console.log(`✓ v3/${p.slug}.md (${out.length} char)`);
}

console.log(`\nÇıktı: ${outDir}`);
console.log(`Test: TEK dosya yükle, hedef 8-12 dk üretim`);

await c.end();
