import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="curator-section max-w-2xl mx-auto text-center">
      <span
        className="material-icon text-outline-variant mb-6 block"
        style={{ fontSize: '80px' }}
        aria-hidden="true"
      >
        search_off
      </span>
      <h1 className="text-4xl headline-tight text-on-surface mb-3">
        SAYFA BULUNAMADI
      </h1>
      <p className="text-on-surface-variant mb-8">
        Aradığın sayfa kaldırılmış veya adresi değişmiş olabilir.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="curator-btn-primary px-8 py-3 text-xs"
        >
          <span className="material-icon material-icon-sm mr-1" aria-hidden="true">home</span>
          Ana Sayfa
        </Link>
        <Link
          href="/urunler"
          className="curator-btn-outline px-8 py-3 text-xs"
        >
          <span className="material-icon material-icon-sm mr-1" aria-hidden="true">search</span>
          Ürünleri Ara
        </Link>
        <Link
          href="/cilt-analizi"
          className="curator-btn-outline px-8 py-3 text-xs"
        >
          <span className="material-icon material-icon-sm mr-1" aria-hidden="true">quiz</span>
          Cilt Analizi
        </Link>
      </div>

      <div className="mt-16 bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
        <p className="label-caps text-outline mb-3">Popüler Sayfalar</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { href: '/onerilerimiz', label: 'Önerilerimiz' },
            { href: '/ihtiyaclar', label: 'İhtiyaçlar' },
            { href: '/markalar', label: 'Markalar' },
            { href: '/karsilastir', label: 'Karşılaştır' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-surface text-on-surface-variant px-4 py-2 rounded-sm text-xs font-medium border border-outline-variant/20 hover:border-primary hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
