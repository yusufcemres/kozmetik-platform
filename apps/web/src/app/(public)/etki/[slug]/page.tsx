import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getActiveMethodPair,
  getAllActiveMethodSlugs,
  SYNERGY_LABELS,
} from '@/lib/content/active-method-pairs';

export const revalidate = 86400; // 24 saat ISR

export async function generateStaticParams() {
  return getAllActiveMethodSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const pair = getActiveMethodPair(params.slug);
  if (!pair) return { title: 'Sayfa bulunamadı' };
  return {
    title: pair.meta_title,
    description: pair.meta_description,
    openGraph: {
      title: pair.meta_title,
      description: pair.meta_description,
    },
  };
}

export default function EtkiDetailPage({ params }: { params: { slug: string } }) {
  const pair = getActiveMethodPair(params.slug);
  if (!pair) notFound();
  const sLabel = SYNERGY_LABELS[pair.synergy];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: pair.meta_title,
    description: pair.meta_description,
    about: [
      { '@type': 'MedicalEntity', name: pair.active_name },
      { '@type': 'MedicalProcedure', name: pair.method_name },
    ],
    citation: pair.citations.map((c) => ({
      '@type': 'CreativeWork',
      name: c.title,
      datePublished: String(c.year),
      ...(c.url ? { url: c.url } : {}),
    })),
  };

  const evidenceLabel = pair.evidence === 'strong' ? 'Yüksek (RCT)' : pair.evidence === 'moderate' ? 'Orta (Kohort)' : 'Düşük (In-vitro/uzman görüşü)';

  return (
    <article className="curator-section max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <nav className="text-xs text-on-surface-variant mb-4">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <span className="mx-2 text-outline">/</span>
        <Link href="/etki" className="hover:text-primary">Etki Tablosu</Link>
        <span className="mx-2 text-outline">/</span>
        <span className="text-on-surface">{pair.active_name} × {pair.method_name}</span>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`label-caps px-2 py-0.5 rounded-sm bg-${sLabel.color}-50 text-${sLabel.color}-700`}>
            {sLabel.label}
          </span>
          <span className="label-caps text-outline">
            Kanıt: {evidenceLabel}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl headline-tight text-on-surface mb-3">
          {pair.active_name} <span className="text-outline-variant">×</span> {pair.method_name}
        </h1>
        <p className="text-base text-on-surface-variant leading-relaxed">
          {pair.summary}
        </p>
      </header>

      <section className="curator-card p-6 mb-6">
        <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">biotech</span>
          Klinik Etki
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {pair.clinical_effect}
        </p>
      </section>

      <section className="curator-card p-6 mb-6 border-primary/30 bg-primary/5">
        <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">checklist</span>
          Protokol — Sıralama ve Zamanlama
        </h2>
        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
          {pair.protocol}
        </p>
      </section>

      <section className="curator-card p-6 mb-6">
        <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-icon text-amber-700" aria-hidden="true">warning</span>
          Dikkat Edilecekler
        </h2>
        <ul className="text-sm text-on-surface-variant space-y-2">
          {pair.cautions.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-700 mt-0.5">•</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="curator-card p-6 mb-6">
        <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">science</span>
          Kanıt Kaynakları
        </h2>
        <ol className="text-sm text-on-surface-variant space-y-2 list-decimal pl-5">
          {pair.citations.map((c, i) => (
            <li key={i}>
              <strong className="text-on-surface">{c.title}</strong>
              <span className="text-outline"> — {c.source}, {c.year}</span>
              {c.pmid && <span className="text-outline"> · PMID: {c.pmid}</span>}
              {c.url && (
                <>
                  {' · '}
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Kaynak
                  </a>
                </>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* INCI link, varsa */}
      {pair.active_slug && (
        <section className="curator-card p-6 mb-6">
          <h2 className="text-base font-semibold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-icon text-primary" aria-hidden="true">science</span>
            Aktif Bileşen Detayı
          </h2>
          <p className="text-sm text-on-surface-variant mb-3">
            {pair.active_name} ({pair.active_inci}) hakkında REVELA INCI veritabanı
            detayı — kanıt seviyesi, gıda kaynakları, güvenlik notu.
          </p>
          <Link
            href={`/icerikler/${pair.active_slug}`}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
          >
            {pair.active_inci} INCI sayfası
            <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
          </Link>
        </section>
      )}

      <footer className="mt-12 pt-6 border-t border-outline-variant/20">
        <p className="text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface">Yasal uyarı:</strong> Bu sayfa
          bilgilendirme amaçlıdır, tıbbi tavsiye yerine geçmez. Profesyonel
          yöntemler için dermatolog/estetisyen ön muayene + onayı şarttır.
          REVELA üreticilerle bağımsız değerlendirme yapar.
        </p>
        <Link
          href="/etki"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">arrow_back</span>
          Etki Tablosuna dön
        </Link>
      </footer>
    </article>
  );
}
