import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'REVELA — Bilim destekli içerik analizi (Sunum)',
  description:
    "Kozmetik ve takviyelerin gerçek formülünü bilimsel kanıtlarla gösteren bağımsız platform. SCCS/CIR regülasyon takipli, peer-reviewed kaynaklarla. Markaların değil, formüllerin konuştuğu yer.",
  robots: 'noindex, nofollow',
};

const STATS = [
  { value: '1568', label: 'Kozmetik ürün', icon: 'palette' },
  { value: '227', label: 'Gıda takviyesi', icon: 'medication' },
  { value: '5.1K', label: 'INCI bileşeni', icon: 'science' },
  { value: '181', label: 'Marka', icon: 'storefront' },
];

const PROBLEM_POINTS = [
  {
    icon: 'visibility_off',
    title: 'INCI şifre gibi',
    desc: 'Etiketteki bileşenlerin ne anlama geldiğini, hangisi tartışmalı, hangisi etkin — kimse anlamıyor.',
  },
  {
    icon: 'campaign',
    title: 'Marka iddiaları doğrulanmamış',
    desc: '"%50 daha etkili", "klinik kanıtlı", "doğal" — referansı yok, kaynağı belirsiz.',
  },
  {
    icon: 'help',
    title: 'Sana uygun mu, kimse demiyor',
    desc: 'Yağlı + akneli + hassas cilt için aynı ürün çalışmaz. Ama hiçbir yerde kişiselleştirme yok.',
  },
];

const SOLUTIONS = [
  {
    icon: 'qr_code_scanner',
    title: 'TARA',
    desc: 'Mağazadayken kamerayla barkodu çek — INCI listesi, REVELA Skoru ve sana özel uyumluluk ekranında.',
  },
  {
    icon: 'search',
    title: 'ARA',
    desc: 'Ürün adı, marka veya bileşen yaz — autocomplete\'le 1568 kozmetik + 227 takviye arasında anında bul.',
  },
  {
    icon: 'science',
    title: 'ANALİZ ET',
    desc: 'Bilimsel skor (0-100), CIR/SCCS sınıflandırma, alerjen yükü, endokrin/CMR flag — hepsi referanslı.',
  },
];

const METHODOLOGY = [
  { weight: '%25', label: 'Aktif Etkinlik', desc: 'Etken maddenin kanıta dayalı etkisi (retinol/niasinamid gibi)' },
  { weight: '%20', label: 'Güvenlik Sınıfı', desc: 'CIR/SCCS sınıflandırma, CMR, endokrin, AB-yasaklı flag' },
  { weight: '%15', label: 'Konsantrasyon', desc: 'Aktif madde efficacy eşiğinde mi' },
  { weight: '%10', label: 'Etkileşim', desc: 'Bileşenler arası tahriş / etkisizleşme riski' },
  { weight: '%10', label: 'Alerjen Yükü', desc: 'AB 26 alerjen + parfüm/koku bileşen sayısı' },
  { weight: '%10', label: 'CMR / Endokrin', desc: 'Kanserojen, mutajen, endokrin bozucu flag' },
  { weight: '%10', label: 'Şeffaflık', desc: 'INCI listesi açıklığı + konsantrasyon beyanı' },
];

const DIFFERENTIATORS = [
  {
    icon: 'verified',
    title: 'Bağımsız + şeffaf',
    desc: 'Marka iş ortaklığı yok. Skorlama metodolojisi public. Affiliate transparency beyanlı — gelir kaynağımız fiyat karşılaştırmadan komisyon, marka pazarlamasından değil.',
  },
  {
    icon: 'school',
    title: 'Peer-reviewed kaynaklar',
    desc: 'Her güvenlik claim\'i SCCS, CIR, INCI Decoder veya peer-reviewed dergi referanslı. "Doğal", "kimyasalsız" gibi belirsiz iddialar yok.',
  },
  {
    icon: 'person',
    title: 'Kişiselleştirme',
    desc: 'Cilt tipi, hassasiyetler, ihtiyaçlar — kısa profilden sonra her ürünün senin için %0-100 uyumluluk skoru. 25 ihtiyaç, 5 cilt tipi matrisi.',
  },
  {
    icon: 'qr_code_scanner',
    title: 'Mobil tarama',
    desc: 'Eczane veya mağazadayken anında barkod tara, etikette gizlenen tartışmalı bileşenleri kırmızı görerek karar ver.',
  },
];

const ROADMAP = [
  { period: '2026 Q2', status: 'active', items: ['Lansman canlı', 'Mobil PWA', 'Affiliate ağı (8 platform)', 'Cilt analizi quizi'] },
  { period: '2026 Q3', status: 'planned', items: ['IOS + Android native', 'Brand portal (B2B)', 'AI etiket okuma (foto)', 'Topluluk yorumları'] },
  { period: '2026 Q4', status: 'planned', items: ['Dermatolog onayı', 'Avrupa pazarı', 'Karşılaştırmalı klinik veri', 'Doctor referral programı'] },
];

export default function SunumLandingPage() {
  return (
    <main className="bg-surface text-on-surface">
      {/* ─────────────── HERO ─────────────── */}
      <section className="relative overflow-hidden border-b border-outline-variant/20 -mt-[57px] sm:-mt-[65px] pt-[57px] sm:pt-[65px]">
        <div
          className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--color-on-surface) 1px, transparent 1px), linear-gradient(to bottom, var(--color-on-surface) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 mb-6">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              Yatırımcı Sunumu · 2026 Q2
              <span className="material-icon text-yellow-500" style={{ fontSize: '14px' }} aria-hidden="true">
                auto_awesome
              </span>
            </span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Image
              src="/revela-icon.png"
              alt=""
              width={88}
              height={88}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-2"
            />
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-extrabold tracking-tighter text-primary leading-[0.9]">
              REVELA
            </h1>
            <p className="mt-3 text-base sm:text-lg lg:text-xl text-on-surface-variant max-w-3xl leading-relaxed">
              Kozmetik ve gıda takviyelerinin gerçek formülünü{' '}
              <span className="text-on-surface font-semibold">bilimsel kanıtlarla</span> gösteren bağımsız analiz platformu.{' '}
              Markaların değil, <span className="text-primary font-semibold">formüllerin konuştuğu yer.</span>
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="curator-btn-primary text-xs px-7 py-3.5 inline-flex items-center justify-center gap-2"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">launch</span>
              Canlı Demoyu Aç
            </Link>
            <Link
              href="/cilt-analizi"
              className="curator-btn-outline text-xs px-7 py-3.5 inline-flex items-center justify-center gap-2"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">person_add</span>
              Profil Quizini Dene
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────── ÖLÇEK ─────────────── */}
      <section className="border-b border-outline-variant/20 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-on-surface-variant text-center mb-2 text-[10px]">Mevcut veritabanı</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-12">Ölçeği konuşalım</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="curator-card p-5 sm:p-7 text-center">
                <span className="material-icon text-primary text-[28px] sm:text-[32px]" aria-hidden="true">
                  {s.icon}
                </span>
                <p className="text-3xl sm:text-5xl font-extrabold tracking-tighter text-on-surface mt-2">{s.value}</p>
                <p className="label-caps text-on-surface-variant mt-1 text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-icon text-score-high text-[16px]" aria-hidden="true">verified</span>
              Yayındaki <span className="font-semibold text-on-surface">1795 ürünün tamamında</span> gerçek görsel — <span className="font-semibold text-score-high">%100 kapsama</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icon text-score-high text-[16px]" aria-hidden="true">verified</span>
              Kullanılan <span className="font-semibold text-on-surface">437 INCI bileşeninin tamamında</span> Türkçe karşılık — <span className="font-semibold text-score-high">%100 kapsama</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icon text-score-high text-[16px]" aria-hidden="true">science</span>
              <span className="font-semibold text-on-surface">313 INCI bileşeninde</span> bilimsel kanıt derecelendirmesi (A-E) + literatür atıfı — <span className="font-semibold text-score-high">%72 kapsama</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── SORUN ─────────────── */}
      <section className="border-b border-outline-variant/20 py-14 sm:py-20 bg-surface-container-low/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-error text-center mb-2 text-[10px]">Şu anki durum</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-3">
            Tüketici 3 sorunla baş başa
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant text-center max-w-2xl mx-auto leading-relaxed mb-12">
            Türkiye\'de kozmetik ve takviye pazarı 12 milyar TL+ yıllık ciroya ulaştı, ama tüketicinin bilgi asimetrisi
            tarihsel olarak hiç kapatılamadı.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROBLEM_POINTS.map((p) => (
              <div key={p.title} className="curator-card p-6 border-l-2 border-l-error">
                <span className="material-icon text-error text-[26px] mb-2 block" aria-hidden="true">
                  {p.icon}
                </span>
                <h3 className="font-bold text-on-surface text-lg mb-2">{p.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── ÇÖZÜM (3 STEP) ─────────────── */}
      <section className="border-b border-outline-variant/20 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-primary text-center mb-2 text-[10px]">REVELA çözümü</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-3">
            TARA · ARA · ANALİZ ET
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant text-center max-w-2xl mx-auto leading-relaxed mb-12">
            3 saniyelik tüketici akışı: telefon, web veya uygulama — aynı bilimsel skor, aynı kişiselleştirme.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SOLUTIONS.map((s, idx) => (
              <div key={s.title} className="curator-card p-7 border-l-2 border-l-primary">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-extrabold text-outline-variant tracking-tight">0{idx + 1}</span>
                  <span className="material-icon text-primary text-[28px]" aria-hidden="true">
                    {s.icon}
                  </span>
                </div>
                <h3 className="font-extrabold text-on-surface text-2xl uppercase tracking-tight mb-3">{s.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── METODOLOJİ ─────────────── */}
      <section className="border-b border-outline-variant/20 py-14 sm:py-20 bg-surface-container-low/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-on-surface-variant text-center mb-2 text-[10px]">Skorlama metodolojisi (public)</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-3">
            REVELA Skoru — 7 boyut, ağırlıklı
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant text-center max-w-2xl mx-auto leading-relaxed mb-12">
            Her ürün 0-100 arası skorlanır. AB SCCS sınırlarını aşan içerik varsa otomatik tavan (max 20-55) uygulanır.{' '}
            Skor değil, <span className="font-semibold text-on-surface">açıklamalı skor</span> — her bileşen için hangi
            kriterin neyi etkilediği gösterilir.
          </p>
          <div className="curator-card p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="space-y-3">
              {METHODOLOGY.map((m) => (
                <div key={m.label} className="flex items-start gap-3 sm:gap-4">
                  <span className="text-base sm:text-lg font-extrabold text-primary tabular-nums w-12 sm:w-14 shrink-0">
                    {m.weight}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm sm:text-base">{m.label}</p>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center gap-3">
              <span className="material-icon text-primary" aria-hidden="true">verified</span>
              <p className="text-xs text-on-surface-variant">
                Kaynaklar: SCCS Opinion Database, CIR Cosmetic Ingredient Review, EU Annex II/III, peer-reviewed
                dermatoloji literatürü.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── DİFERANSİYATÖR ─────────────── */}
      <section className="border-b border-outline-variant/20 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-primary text-center mb-2 text-[10px]">Neden REVELA</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-3">
            4 ayrıştırıcı feature
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant text-center max-w-2xl mx-auto leading-relaxed mb-12">
            INCI Decoder ve Yuka var — ama Türkçe içerik, lokal markalar, ve kişiselleştirme açısından REVELA tek.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="curator-card p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-icon text-primary text-[22px]" aria-hidden="true">
                      {d.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-surface text-lg mb-2">{d.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── EKRAN GÖRÜNTÜLERİ ─────────────── */}
      <section className="border-b border-outline-variant/20 py-14 sm:py-20 bg-surface-container-low/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-on-surface-variant text-center mb-2 text-[10px]">Ürünü gör</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-12">
            Canlı tarama akışı
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Mockup 1: INCI listesi */}
            <div className="curator-card p-5">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant/15">
                <span className="material-icon text-primary text-[18px]" aria-hidden="true">science</span>
                <h3 className="font-bold text-on-surface text-sm">İçerik Listesi (INCI)</h3>
                <span className="ml-auto text-[10px] text-outline">19 madde</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { name: 'Aqua', band: 'AKTİF', critical: false, allergen: false },
                  { name: 'Niacinamide', band: 'YÜKSEK', critical: false, allergen: false },
                  { name: 'Ethylhexyl Methoxycinnamate', band: 'YÜKSEK', critical: true, allergen: false },
                  { name: 'Phenoxyethanol', band: 'DÜŞÜK', critical: false, allergen: false },
                  { name: 'Parfum', band: 'ORTA', critical: false, allergen: true },
                ].map((c) => (
                  <div
                    key={c.name}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs border ${
                      c.critical || c.allergen
                        ? 'border-error bg-error/5'
                        : 'border-outline-variant/15 bg-surface-container-lowest'
                    }`}
                  >
                    {(c.critical || c.allergen) && (
                      <span className="material-icon text-error text-[12px]" aria-hidden="true">warning</span>
                    )}
                    <span className="text-on-surface font-medium flex-1 truncate">{c.name}</span>
                    {c.critical && (
                      <span className="text-[8px] bg-error text-on-error px-1 py-0.5 rounded font-bold">UYARI</span>
                    )}
                    {c.allergen && (
                      <span className="text-[8px] bg-error/10 text-error border border-error/30 px-1 py-0.5 rounded">
                        PARFÜM·ALERJEN
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup 2: Skor */}
            <div className="curator-card p-5">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant/15">
                <span className="material-icon text-primary text-[18px]" aria-hidden="true">shield</span>
                <h3 className="font-bold text-on-surface text-sm">REVELA Güvenlik Skoru</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-surface-container" strokeWidth="2.5" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      className="stroke-score-high"
                      strokeWidth="2.5"
                      strokeDasharray="83.7 97.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-score-high">86</span>
                    <span className="text-[10px] text-outline">A</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-score-high">Sınıf A</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Çok Güvenli</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { l: 'Aktif Etkinlik', v: 92 },
                  { l: 'Güvenlik Sınıfı', v: 88 },
                  { l: 'Alerjen Yükü', v: 78 },
                  { l: 'Şeffaflık', v: 75 },
                ].map((b) => (
                  <div key={b.l} className="flex items-center gap-2">
                    <span className="w-24 text-[10px] font-medium text-on-surface truncate">{b.l}</span>
                    <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-score-high rounded-full" style={{ width: `${b.v}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-on-surface tabular-nums w-6 text-right">{b.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup 3: Kişisel uyumluluk */}
            <div className="curator-card p-5">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant/15">
                <span className="material-icon text-primary text-[18px]" aria-hidden="true">person</span>
                <h3 className="font-bold text-on-surface text-sm">Senin Uyumluluğun</h3>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {['Yağlı cilt', 'Akneye yatkın', 'Hassasiyet', 'Anti-aging'].map((c) => (
                  <span
                    key={c}
                    className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="rounded-md border border-score-high/30 bg-score-high/5 p-3">
                <p className="label-caps text-on-surface-variant text-[9px]">Bu ürüne uyumun</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <p className="text-3xl headline-tight text-score-high">%87</p>
                  <p className="text-[10px] text-score-high font-semibold">Çok Uyumlu</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {['Akne', 'Sebum', 'Bariyer'].map((n) => (
                    <span
                      key={n}
                      className="text-[8px] bg-score-high/15 text-score-high px-1 py-0.5 rounded font-medium"
                    >
                      ✓ {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── ROADMAP ─────────────── */}
      <section className="border-b border-outline-variant/20 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-caps text-on-surface-variant text-center mb-2 text-[10px]">Yol haritası</p>
          <h2 className="text-3xl sm:text-4xl headline-tight text-on-surface text-center mb-12">
            Önümüzdeki 9 ay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROADMAP.map((r) => (
              <div
                key={r.period}
                className={`curator-card p-6 ${r.status === 'active' ? 'border-l-2 border-l-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="label-caps text-on-surface-variant text-[10px]">{r.period}</p>
                  {r.status === 'active' && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-on-primary px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {r.items.map((it) => (
                    <li key={it} className="text-sm text-on-surface flex items-start gap-2">
                      <span
                        className="material-icon text-primary text-[14px] mt-0.5 shrink-0"
                        aria-hidden="true"
                      >
                        {r.status === 'active' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="leading-snug">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── CTA ─────────────── */}
      <section className="py-16 sm:py-24 text-center bg-surface-container-low/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl headline-tight text-on-surface mb-4">
            REVELA ile içerik artık şifre değil
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed mb-8">
            1568 kozmetik · 227 takviye · 5.1K bileşen · 24 ihtiyaç matrisi — hepsi canlı, hepsi referanslı.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="curator-btn-primary text-xs px-8 py-4 inline-flex items-center justify-center gap-2"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">launch</span>
              Canlı Demoyu Aç
            </Link>
            <Link
              href="/cilt-analizi"
              className="curator-btn-outline text-xs px-8 py-4 inline-flex items-center justify-center gap-2"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">person_add</span>
              Profil Quizini Dene
            </Link>
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-outline">
            Bağımsız · şeffaf · peer-reviewed
          </p>
        </div>
      </section>
    </main>
  );
}
