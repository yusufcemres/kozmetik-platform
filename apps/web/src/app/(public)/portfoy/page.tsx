import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SoloLabs Portföy — 4 Ürün Tek Çatı',
  description:
    'SoloLabs tarafından geliştirilen 4 ürün: REVELA (kozmetik & takviye INCI analizi), ChefMate (AI tarif jeneratörü), Redi (restoran QR sipariş), ChemDoc AI (KKDIK GBF AI motoru).',
  robots: 'noindex, nofollow',
};

const PRODUCTS = [
  {
    slug: 'revela',
    name: 'REVELA',
    tagline: 'Bilim destekli içerik analiz platformu',
    domain: 'Health & Beauty',
    status: 'Lansmana hazır',
    statusColor: 'bg-score-high text-on-primary',
    icon: 'science',
    color: 'primary',
    description:
      'Kozmetik ve gıda takviyelerinin gerçek formülünü SCCS/CIR regülasyon takipli, peer-reviewed kaynaklarla analiz eden bağımsız platform. Markaların değil, formüllerin konuştuğu yer.',
    metrics: [
      { value: '1.5K+', label: 'Kozmetik' },
      { value: '197+', label: 'Takviye' },
      { value: '5.1K', label: 'INCI bileşen' },
      { value: '163', label: 'Marka' },
    ],
    features: [
      'TARA: Mobil barkod tarama → anında analiz',
      'ARA: 1.7K ürün arası autocomplete',
      'ANALİZ ET: 7-boyut REVELA Skoru (CIR/SCCS uyumlu)',
      'Profil: cilt tipi + ihtiyaç + hassasiyet → kişisel uyumluluk',
      '65 rehber makale, 24 ihtiyaç FAQ + skin type matrisi',
    ],
    differentiator: [
      'Bağımsız + şeffaf (marka iş ortaklığı yok)',
      'Peer-reviewed kaynaklar (SCCS, CIR, NIH)',
      'Tüm INCI flag\'leri kırmızı border ile görsel',
      'Gerçek zamanlı fiyat karşılaştırma (8 platform)',
    ],
    business: 'Affiliate komisyon (Trendyol/Hepsiburada/N11/PttAVM/Sekate) + B2B brand portal lisans',
    url: '/',
    primary: true,
  },
  {
    slug: 'chemdoc-ai',
    name: 'ChemDoc AI',
    tagline: 'KKDIK GBF AI motoru — kimya sektörü için',
    domain: 'B2B Industrial Compliance',
    status: 'BİGG 1812 başvuruda',
    statusColor: 'bg-score-medium text-on-surface',
    icon: 'biotech',
    color: 'primary',
    description:
      'Türkiye KKDIK Yönetmeliği uyumluluğu için Güvenlik Bilgi Formu (GBF) hazırlama AI motoru. Kimya firmalarının saatlerce harcadığı GBF dokümanını dakikalar içinde hazırlar. Kimya + AI + saha tecrübesinin birleşimi.',
    metrics: [
      { value: '16', label: 'Yönetmelik bölümü' },
      { value: '34+', label: 'Kısaltma' },
      { value: '9', label: 'GHS piktogram' },
      { value: '5', label: 'Pilot müşteri' },
    ],
    features: [
      'SDS → GBF otomatik çeviri (Türkçe yönetmelik)',
      '9 GHS piktogram ataması (CMR/endokrin/yanıcı vb.)',
      'H-cümleleri + P-cümleleri Türkçe veritabanı',
      'PPE + risk notları (Not A-S)',
      '14 yönetmelik şablonu (kırmızı kılavuz formatı)',
    ],
    differentiator: [
      'Kimya doktorası + AI + 5+ yıl saha tecrübesi (kurucu)',
      'KKDIK Türkçe + AB CLP standardı çift uyum',
      '5 mevcut müşteri pilot (TUNAP, vb.)',
      '"Sadece sen" testi geçen tek proje',
    ],
    business: 'SaaS aboneliği (kimya firması, ay/yıllık) + tek seferlik GBF revizyonu (KDU)',
    url: 'https://chemdoc.ai',
    external: true,
  },
  {
    slug: 'chefmate',
    name: 'ChefMate',
    tagline: 'AI tarif jeneratörü + akıllı yemek planlayıcı',
    domain: 'Consumer Lifestyle',
    status: 'Production canlı',
    statusColor: 'bg-score-high text-on-primary',
    icon: 'restaurant_menu',
    color: 'primary',
    description:
      '995+ gerçek tarifle eğitilmiş AI tarif jeneratörü. Buzdolabındaki malzemelere göre tarif öner, beslenme tercihine göre filtrele, haftalık menü planla. Mobile-first PWA.',
    metrics: [
      { value: '995+', label: 'Doğrulanmış tarif' },
      { value: '47', label: 'Kategori tag' },
      { value: '3', label: 'Beslenme stili' },
      { value: '4', label: 'Faz tamamlandı' },
    ],
    features: [
      'Malzeme-bazlı tarif önerisi (gerçek tariflerle)',
      'Vegan / vejeteryan / glütensiz filtreler',
      'Beslenme analizi (kalori, makro, vitamin)',
      'M3 (Material You) tema + Apple PM UX',
      'Audit: 44 bulgu, 37 fix yapıldı',
    ],
    differentiator: [
      'Gerçek tarif > AI uydurma (kullanıcı geri bildirimleri)',
      'Mobile-first design (Apple Pay PM tarzı)',
      'Apple Pay + Google Pay entegrasyonu (gelecek)',
      'Premium tier: özel diyet planları',
    ],
    business: 'Freemium (5 tarif/gün) + Premium ($3.99/ay) + Affiliate (yemek malzemeleri)',
    url: 'https://chefmate.app',
    external: true,
  },
  {
    slug: 'redi',
    name: 'Redi',
    tagline: 'Restoran dijitalleştirme — QR sipariş + ödeme PWA',
    domain: 'B2B SaaS Hospitality',
    status: 'Hosting günü bekliyor',
    statusColor: 'bg-score-medium text-on-surface',
    icon: 'point_of_sale',
    color: 'primary',
    description:
      'Restoranlar için QR menü + sipariş + ödeme tek PWA. Bcrypt PIN ile güvenli admin paneli, PayTR entegrasyonu, müşteriye QR ile menü → masada sipariş → masada öde akışı.',
    metrics: [
      { value: '100%', label: 'Sprint tamam' },
      { value: '3', label: 'Güvenlik audit round' },
      { value: 'TECH-032', label: 'Bcrypt PIN' },
      { value: '5', label: 'Push commit hazır' },
    ],
    features: [
      'QR menü → masada sipariş (web app)',
      'PayTR online ödeme entegrasyonu',
      'Admin paneli: ürün/kategori/sipariş yönetimi',
      'Bcrypt PIN auth (güvenli mağaza yönetimi)',
      'PWA: install + offline mode',
    ],
    differentiator: [
      'iyzico değil PayTR (%1.99 daha iyi komisyon)',
      'Apple Pay + Google Pay native iOS/Android',
      'Bcrypt PIN admin (basit ama güvenli)',
      'Türkçe + İngilizce dil desteği',
    ],
    business: 'SaaS aylık (₺149-499/restoran tier) + işlem komisyonu (₺0.50-1/sipariş)',
    url: 'https://redi.app',
    external: true,
  },
];

const ROADMAP = [
  {
    period: '2026 Q2 — Şu an',
    items: [
      '✅ REVELA lansmana hazır (1735 ürün published)',
      '✅ ChefMate production canlı (995 tarif)',
      '🟡 ChemDoc AI BİGG 1812 başvurusu süreci',
      '🟡 Redi hosting day (5 commit push bekliyor)',
    ],
  },
  {
    period: '2026 Q3 — Yaz',
    items: [
      '🎯 REVELA mobile native app (iOS + Android)',
      '🎯 ChemDoc AI 5 müşteri pilot → SaaS prod',
      '🎯 Redi 10 restoran pilot deployment',
      '🎯 ChefMate Premium subscription başlat',
    ],
  },
  {
    period: '2026 Q4 — Sonbahar',
    items: [
      '🚀 REVELA Avrupa pazarı (DE, FR önce)',
      '🚀 ChemDoc AI uluslararası genişleme',
      '🚀 Redi 50 restoran + işlem komisyonu',
      '🚀 ChefMate B2B (otel/yurt/şirket yemekhane)',
    ],
  },
];

const ABOUT = {
  name: 'Yusuf Cemre Şan',
  role: 'Kurucu, SoloLabs',
  background: [
    'Kimya doktora — KKDIK regülasyon + AI motorlarında uzmanlık',
    'AI/ML — Anthropic Claude, OpenAI GPT-4 çoklu projeler',
    'Saha tecrübesi — TUNAP Kimya ve 5+ kimya firması',
    'Tam zamanlı girişimci (2026 Nisan\'dan itibaren)',
  ],
  contact: 'yusufcemresan@gmail.com',
};

export default function PortfolioPage() {
  return (
    <main className="bg-surface text-on-surface">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-outline-variant/20 -mt-[57px] sm:-mt-[65px] pt-[57px] sm:pt-[65px]">
        <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(to right, var(--color-on-surface) 1px, transparent 1px), linear-gradient(to bottom, var(--color-on-surface) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 mb-6">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              SoloLabs Portföy · Q2 2026
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter text-primary leading-[0.9]">
            SoloLabs
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            Tek kurucudan, <span className="text-on-surface font-semibold">4 farklı sektörde</span> üretim:
            sağlık & güzellik analiz platformu, AI tarif jeneratörü, restoran dijitalleştirme PWA, ve KKDIK GBF AI motoru.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#products" className="curator-btn-primary text-xs px-7 py-3.5 inline-flex items-center justify-center gap-2">
              <span className="material-icon material-icon-sm" aria-hidden="true">arrow_downward</span>
              Ürünleri İncele
            </a>
            <a href="#contact" className="curator-btn-outline text-xs px-7 py-3.5 inline-flex items-center justify-center gap-2">
              <span className="material-icon material-icon-sm" aria-hidden="true">mail</span>
              İletişim
            </a>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="border-b border-outline-variant/20 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { value: '4', label: 'Aktif ürün', icon: 'rocket_launch' },
              { value: '5+', label: 'Pilot müşteri', icon: 'verified_user' },
              { value: '4', label: 'Sektör', icon: 'category' },
              { value: '2026', label: 'BİGG başvurusu', icon: 'workspace_premium' },
            ].map((s) => (
              <div key={s.label} className="curator-card p-5 text-center">
                <span className="material-icon text-primary text-[22px]" aria-hidden="true">{s.icon}</span>
                <p className="text-3xl font-extrabold tracking-tighter text-on-surface mt-1">{s.value}</p>
                <p className="label-caps text-on-surface-variant text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-on-surface-variant text-center mb-2 text-[10px]">4 ürün, tek çatı</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-12">
            Portföy
          </h2>
          <div className="space-y-6">
            {PRODUCTS.map((p, idx) => (
              <article key={p.slug} className="curator-card p-6 sm:p-8 border-l-4 border-l-primary">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
                  {/* Left: Identity */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-extrabold text-outline-variant tabular-nums">0{idx + 1}</span>
                      <span className="material-icon text-primary text-[28px]" aria-hidden="true">{p.icon}</span>
                    </div>
                    <h3 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">{p.name}</h3>
                    <p className="text-sm text-primary font-medium italic mb-3">"{p.tagline}"</p>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-surface-container-low text-on-surface-variant px-2 py-1 rounded-sm">
                        {p.domain}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${p.statusColor}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{p.description}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {p.metrics.map((m) => (
                        <div key={m.label} className="bg-surface-container-low p-3 rounded-sm">
                          <p className="text-2xl font-extrabold text-on-surface">{m.value}</p>
                          <p className="text-[10px] uppercase tracking-wider text-outline">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    {p.external ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
                        Web sitesini gör
                        <span className="material-icon text-[14px]" aria-hidden="true">open_in_new</span>
                      </a>
                    ) : (
                      <Link href={p.url} className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
                        Canlı demoyu aç
                        <span className="material-icon text-[14px]" aria-hidden="true">arrow_forward</span>
                      </Link>
                    )}
                  </div>

                  {/* Right: Features + Differentiators */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Özellikler</h4>
                      <ul className="space-y-1.5">
                        {p.features.map((f) => (
                          <li key={f} className="text-sm text-on-surface flex items-start gap-2">
                            <span className="material-icon text-primary text-[14px] mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Ayrıştırıcı</h4>
                      <ul className="space-y-1.5">
                        {p.differentiator.map((d) => (
                          <li key={d} className="text-sm text-on-surface flex items-start gap-2">
                            <span className="material-icon text-primary text-[14px] mt-0.5 shrink-0" aria-hidden="true">stars</span>
                            <span className="leading-snug">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-outline-variant/20">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Gelir Modeli</h4>
                      <p className="text-sm text-on-surface">{p.business}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="border-y border-outline-variant/20 py-14 sm:py-20 bg-surface-container-low/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-on-surface-variant text-center mb-2 text-[10px]">3 çeyreklik vizyon</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-12">
            Yol Haritası
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROADMAP.map((r, idx) => (
              <div key={r.period} className={`curator-card p-6 ${idx === 0 ? 'border-l-2 border-l-primary bg-primary/5' : ''}`}>
                <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface mb-3">{r.period}</p>
                <ul className="space-y-2">
                  {r.items.map((it) => (
                    <li key={it} className="text-sm text-on-surface leading-snug">{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-on-surface-variant text-center mb-2 text-[10px]">Kurucu</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-12">
            {ABOUT.name}
          </h2>
          <p className="text-center text-base text-on-surface-variant mb-8">{ABOUT.role}</p>
          <ul className="space-y-3 max-w-xl mx-auto">
            {ABOUT.background.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-on-surface">
                <span className="material-icon text-primary text-[18px] mt-0.5 shrink-0" aria-hidden="true">arrow_right</span>
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-outline-variant/20 py-16 sm:py-24 text-center bg-surface-container-low/40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface mb-4">
            Konuşalım mı?
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed mb-8">
            Yatırım, ortaklık veya teknik diyalog için iletişime geç. Hızlıca cevaplıyoruz.
          </p>
          <a
            href={`mailto:${ABOUT.contact}`}
            className="curator-btn-primary text-xs px-8 py-4 inline-flex items-center justify-center gap-2"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">mail</span>
            {ABOUT.contact}
          </a>
        </div>
      </section>
    </main>
  );
}
