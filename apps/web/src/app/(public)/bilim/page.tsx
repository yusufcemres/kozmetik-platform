import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bilim Çerçevemiz — REVELA İndeksi (RI) & Kanıt-Temelli Skorlama',
  description:
    'REVELA İndeksi (RI): 0-100 şeffaf, kantitatif kozmetik & takviye skoru. Formül açık, kaynaklı, peer-review yol haritasına bağlı. Bilim Kurulu Q3 2026, peer-reviewed makale 2027 H2.',
  alternates: { canonical: 'https://kozmetik-platform.vercel.app/bilim' },
  openGraph: {
    title: 'REVELA İndeksi (RI) — Şeffaf Kanıt-Temelli Skor',
    description: '0-100 kantitatif kozmetik skoru. Formül açık kaynak, kanıt seviyeli, FDA onay timeline destekli.',
    type: 'article',
  },
};

const FDA_TIMELINE = [
  { year: 2002, tech: 'Mavi LED — akne tedavisi', agency: 'FDA' },
  { year: 2010, tech: 'Kriyolipoliz (yağ donma)', agency: 'FDA' },
  { year: 2012, tech: 'HIFU — yüz germe', agency: 'FDA' },
  { year: 2015, tech: 'RF (radyofrekans) cilt sıkılaştırma', agency: 'FDA' },
  { year: 2023, tech: 'AI ile deri lezyonu sınıflandırma', agency: 'FDA' },
];

const RI_COMPONENTS = [
  {
    code: 'IngredientStrength',
    weight: '35%',
    desc: 'INCI sırası × konsantrasyon bandı × kanıt seviyesi (A-E). Üst sıra + yüksek kanıt = en yüksek katkı.',
  },
  {
    code: 'EvidenceQuality',
    weight: '25%',
    desc: 'Meta-analiz (A) → RCT (B) → kohort (C) → mekanizma (D) → uzman (E). PubMed + Cochrane bağlantılı.',
  },
  {
    code: 'SafetyProfile',
    weight: '20%',
    desc: 'Alerjen + CMR + AB yasaklı + endokrin distrüptör listeleri. Floor-cap mekanizması ile kritik flag → tavan.',
  },
  {
    code: 'FormulationContext',
    weight: '10%',
    desc: 'pH, taşıyıcı sistem, fotosensitivite, kontraendike kombinasyonlar (retinol+AHA gibi).',
  },
  {
    code: 'TransparencyBonus',
    weight: '10%',
    desc: 'Marka tam INCI listesi + klinik test + 3. taraf doğrulama varsa bonus. Patentli karışım gizliyse penaltı.',
  },
];

const ROADMAP = [
  { phase: 'Q3 2026', milestone: 'Bilim Kurulu lansmanı — 3 akademik partner (Yıldız Teknik öncelikli)' },
  { phase: 'Q4 2026', milestone: 'RI v2.0 — Bilim Kurulu geri bildirimi sonrası formül revizyonu' },
  { phase: 'Q1 2027', milestone: 'İlk akademik white paper — preprint yayını (arXiv / OSF)' },
  { phase: 'Q2 2027', milestone: 'Peer-review dergi başvurusu — Journal of Cosmetic Dermatology hedef' },
  { phase: 'Q3 2027', milestone: 'Yayın + bağımsız üçüncü taraf validasyon çalışması başlangıç' },
];

export default function BilimPage() {
  return (
    <article className="curator-section max-w-[1100px] mx-auto">
      {/* Hero */}
      <header className="text-center mb-20">
        <span className="label-caps text-outline block mb-4 tracking-[0.4em]">Bilim Çerçevemiz</span>
        <h1 className="text-4xl lg:text-6xl headline-tight text-on-surface mb-6">
          REVELA İndeksi (RI)
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
          Her ürüne verdiğimiz <strong>0-100 arası kantitatif skor</strong> şeffaf bir formülden çıkar.
          Bu sayfa formülün <em>nasıl</em> hesaplandığını, hangi kanıtlara dayandığını ve
          peer-review yol haritamızı açıklar.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs label-caps">
          <span className="material-icon material-icon-sm" aria-hidden="true">verified</span>
          Versiyon: RI v1.0 · Yayın: 2026-05-19
        </div>
      </header>

      {/* RI Formula breakdown */}
      <section className="mb-20">
        <h2 className="text-2xl lg:text-3xl headline-tight text-on-surface mb-2">Formül</h2>
        <p className="text-on-surface-variant mb-8 max-w-3xl">
          RI = Σ (komponent × ağırlık). 5 bileşen, deterministik hesap, her komponent için
          ayrıntılı açıklama her ürün sayfasında <em>"Bu puan neden?"</em> altında gösterilir.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RI_COMPONENTS.map((c) => (
            <div key={c.code} className="curator-card p-5">
              <div className="flex items-center justify-between mb-3">
                <code className="text-xs font-mono text-primary">{c.code}</code>
                <span className="label-caps text-on-surface">{c.weight}</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-outline mt-4">
          Formül kaynak kodu: <code className="font-mono">apps/api/src/modules/scoring/</code> — açık kaynak, GitHub'da incelenebilir.
        </p>
      </section>

      {/* FDA Timeline */}
      <section className="mb-20">
        <h2 className="text-2xl lg:text-3xl headline-tight text-on-surface mb-2">
          Onaylı Teknolojiler — Zaman Çizgisi
        </h2>
        <p className="text-on-surface-variant mb-8 max-w-3xl">
          Hangi kozmetik &amp; estetik teknolojisinin <em>ne zaman</em> resmi onay aldığını bilmek
          kanıt değerlendirmesinin başlangıcıdır. RI bu onay tarihlerini bir bileşenin
          "olgunluk skoru"na (maturity_score) yansıtır.
        </p>
        <ol className="space-y-4 border-l-2 border-primary/30 pl-6">
          {FDA_TIMELINE.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-[34px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface" />
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-primary tabular-nums">{t.year}</span>
                <span className="text-sm text-outline">{t.agency}</span>
              </div>
              <p className="text-on-surface mt-1">{t.tech}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Roadmap to peer review */}
      <section className="mb-20">
        <h2 className="text-2xl lg:text-3xl headline-tight text-on-surface mb-2">
          Peer-Review Yol Haritası
        </h2>
        <p className="text-on-surface-variant mb-8 max-w-3xl">
          RI v1.0 dahili olarak çalışıyor olsa da akademik doğrulama olmadan
          "bilimsel" iddiası yarım kalır. Aşağıdaki adımlarla RI'yi peer-review
          dergiye taşıyacağız.
        </p>
        <div className="space-y-3">
          {ROADMAP.map((r) => (
            <div key={r.phase} className="flex items-start gap-4 p-4 rounded-md bg-surface-container/40 border border-outline-variant/20">
              <span className="label-caps text-primary shrink-0 w-24">{r.phase}</span>
              <p className="text-sm text-on-surface flex-1">{r.milestone}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bilim Kurulu CTA */}
      <section className="mb-20 curator-card p-8 bg-gradient-to-br from-primary/5 to-surface-container border-primary/20">
        <div className="flex items-start gap-4">
          <span className="material-icon text-primary text-3xl shrink-0" aria-hidden="true">school</span>
          <div>
            <h2 className="text-xl lg:text-2xl headline-tight text-on-surface mb-3">
              Bilim Kurulu &mdash; Akademik Partner Davet
            </h2>
            <p className="text-on-surface-variant mb-4 leading-relaxed">
              REVELA İndeksi'nin akademik geçerlilik kazanması için 3-5 öğretim üyesinden
              oluşan bir Bilim Kurulu kuruyoruz. Dermatoloji, biyokimya, kozmetik formülasyon
              alanlarında çalışan araştırmacıları davet ediyoruz.
              Kurulun sorumluluğu: yıllık RI formül revizyonu + yayın onayı.
              Bütçe: ayda 10-20K TL (mesai bazlı + yayın bonusu).
            </p>
            <Link
              href="/iletisim?konu=bilim-kurulu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition"
            >
              Başvur / İletişime Geç
              <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/metodoloji"
          className="curator-card p-5 hover:border-primary/40 transition-colors block"
        >
          <h3 className="font-semibold text-on-surface mb-1">İçerik Metodolojisi</h3>
          <p className="text-xs text-on-surface-variant">INCI ayrıştırma, ingredient güç skoru, kanıt değerlendirmesi adım adım.</p>
        </Link>
        <Link
          href="/nasil-puanliyoruz"
          className="curator-card p-5 hover:border-primary/40 transition-colors block"
        >
          <h3 className="font-semibold text-on-surface mb-1">Ürün Puanlama</h3>
          <p className="text-xs text-on-surface-variant">Her ürün için 13 bileşen, kanıt hiyerarşisi (A-E), şeffaflık ilkeleri.</p>
        </Link>
      </section>

      {/* JSON-LD: Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'REVELA İndeksi (RI) — Şeffaf Kanıt-Temelli Skorlama',
            description:
              'REVELA İndeksi: 0-100 kantitatif kozmetik & takviye skoru. 5 bileşen, açık formül, peer-review yol haritası.',
            datePublished: '2026-05-19',
            dateModified: '2026-05-19',
            author: { '@type': 'Organization', name: 'REVELA' },
            publisher: { '@type': 'Organization', name: 'REVELA' },
            keywords: [
              'REVELA İndeksi',
              'RI',
              'kanıt temelli kozmetik',
              'cosmetic scoring',
              'INCI analizi',
              'peer review',
              'bilim kurulu',
            ],
          }),
        }}
      />
    </article>
  );
}
