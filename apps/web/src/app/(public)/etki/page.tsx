import { Metadata } from 'next';
import Link from 'next/link';
import { ACTIVE_METHOD_PAIRS, SYNERGY_LABELS } from '@/lib/content/active-method-pairs';

export const metadata: Metadata = {
  title: 'Etki Tablosu — Aktif × Yöntem Sinerji Rehberi',
  description: 'Retinol+RF, Vitamin C+HIFU, Bakuchiol+Microneedling gibi 10 kanıt-temelli aktif × profesyonel yöntem kombinasyonu. Sıralama, kontrendikasyon, klinik kaynak.',
  openGraph: {
    title: 'Etki Tablosu — Aktif INCI × Profesyonel Yöntem',
    description: '10 kanıt-temelli kombinasyon: sıralama, dinlenme, kontrendikasyon.',
  },
};

export const revalidate = 86400; // 24 saat — statik içerik, sık değişmez

export default function EtkiListPage() {
  return (
    <article className="curator-section max-w-[1200px] mx-auto">
      <nav className="text-xs text-on-surface-variant mb-4">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <span className="mx-2 text-outline">/</span>
        <span className="text-on-surface">Etki Tablosu</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl headline-tight text-on-surface mb-3">
          Aktif × Yöntem Etki Tablosu
        </h1>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">
          Topikal aktif INCI'ler (retinol, vitamin C, niacinamide, bakuchiol,
          AHA, BHA, azelaik asit, peptit, hiyalüronik asit) profesyonel yöntemlerle
          (RF, HIFU, LED, microneedling, kimyasal peeling, lazer) birlikte nasıl
          kullanılır? Klinik kanıtla 10 kombinasyon — sıralama, dinlenme süresi,
          kontrendikasyon.
        </p>
        <p className="text-xs text-outline mt-3">
          Bu sayfa bilgilendirme amaçlıdır. Tıbbi tavsiye değildir; profesyonel
          işlemler için dermatolog onayı alınız.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACTIVE_METHOD_PAIRS.map((p) => {
          const sLabel = SYNERGY_LABELS[p.synergy];
          return (
            <Link
              key={p.slug}
              href={`/etki/${p.slug}`}
              className="curator-card p-5 hover:border-primary transition-colors group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`label-caps px-2 py-0.5 rounded-sm bg-${sLabel.color}-50 text-${sLabel.color}-700`}>
                  {sLabel.label}
                </span>
                <span className="label-caps text-outline">
                  Kanıt: {p.evidence === 'strong' ? 'Yüksek' : p.evidence === 'moderate' ? 'Orta' : 'Düşük'}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                {p.active_name} <span className="text-outline">×</span> {p.method_name}
              </h2>
              <p className="text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                {p.summary}
              </p>
              <div className="flex items-center gap-1 text-xs text-primary mt-3 group-hover:underline">
                Detayı oku <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="mt-12 pt-6 border-t border-outline-variant/20">
        <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
          <strong className="text-on-surface">Modül I pilot</strong> — Bu 10 sayfa
          REVELA aktif × yöntem etki tablosunun ilk grubu. Performans iyi olursa
          Q3 2026'da 100 kombinasyona ölçeklenir. Önerilerin için{' '}
          <Link href="/iletisim" className="text-primary hover:underline">iletişim</Link> sayfası.
        </p>
      </footer>
    </article>
  );
}
