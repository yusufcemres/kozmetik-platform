import { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

// === Types ===

interface Brand {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  country_of_origin?: string;
  website_url?: string;
  product_count?: number;
}

// === SEO ===

export const metadata: Metadata = {
  title: 'Markalar | REVELA',
  description:
    'REVELA platformundaki tüm kozmetik markaları. La Roche-Posay, Vichy, Bioderma, CeraVe ve daha fazlası.',
  openGraph: {
    title: 'Markalar | REVELA',
    description: 'Tüm kozmetik markaları ve ürün portföyleri.',
    type: 'website',
  },
  alternates: { canonical: '/markalar' },
};

// === Data ===

async function getBrands(): Promise<Brand[]> {
  try {
    const res = await apiFetch<{ data: Brand[] }>('/brands?limit=200', {
      next: { revalidate: 3600 },
    } as any);
    return res.data || [];
  } catch {
    return [];
  }
}

// === Helpers ===

const COUNTRY_FLAGS: Record<string, string> = {
  TR: '\u{1F1F9}\u{1F1F7}',
  FR: '\u{1F1EB}\u{1F1F7}',
  DE: '\u{1F1E9}\u{1F1EA}',
  US: '\u{1F1FA}\u{1F1F8}',
  KR: '\u{1F1F0}\u{1F1F7}',
  JP: '\u{1F1EF}\u{1F1F5}',
  UK: '\u{1F1EC}\u{1F1E7}',
  IT: '\u{1F1EE}\u{1F1F9}',
  ES: '\u{1F1EA}\u{1F1F8}',
  SE: '\u{1F1F8}\u{1F1EA}',
  CH: '\u{1F1E8}\u{1F1ED}',
};

const COUNTRY_LABELS: Record<string, string> = {
  TR: 'Türkiye',
  FR: 'Fransa',
  DE: 'Almanya',
  US: 'ABD',
  KR: 'Güney Kore',
  JP: 'Japonya',
  UK: 'İngiltere',
  IT: 'İtalya',
  ES: 'İspanya',
  SE: 'İsveç',
  CH: 'İsviçre',
};

function brandInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// === JSON-LD ===

function brandsJsonLd(brands: Brand[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'REVELA Kozmetik Markaları',
    numberOfItems: brands.length,
    itemListElement: brands.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Brand',
        name: b.brand_name,
        url: `/urunler?brand=${b.brand_slug}`,
      },
    })),
  };
}

// === Page ===

export default async function BrandsPage() {
  const brands = await getBrands();

  // Group by first letter
  const grouped = brands.reduce<Record<string, Brand[]>>((acc, brand) => {
    const letter = brandInitial(brand.brand_name);
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {});
  const sortedLetters = Object.keys(grouped).sort();

  // Country stats
  const countryCounts = brands.reduce<Record<string, number>>((acc, b) => {
    const c = b.country_of_origin || 'OTHER';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(brandsJsonLd(brands)),
        }}
      />

      <div className="curator-section max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="label-caps text-outline block mb-2 tracking-[0.3em]">
            Koleksiyon
          </span>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">
            MARKALAR
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 max-w-lg mx-auto">
            Platformumuzda analiz edilen {brands.length} kozmetik markası
          </p>
        </div>

        {/* Country filter badges */}
        {Object.keys(countryCounts).length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {Object.entries(countryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([country, count]) => (
                <span
                  key={country}
                  className="inline-flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/20 px-3 py-1.5 rounded-sm text-xs text-on-surface-variant"
                >
                  {COUNTRY_FLAGS[country] && (
                    <span>{COUNTRY_FLAGS[country]}</span>
                  )}
                  <span>{COUNTRY_LABELS[country] || country}</span>
                  <span className="text-outline">({count})</span>
                </span>
              ))}
          </div>
        )}

        {/* Alphabet quick nav */}
        <div className="flex flex-wrap justify-center gap-1 mb-10">
          {sortedLetters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded-sm text-xs font-bold text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* Brand grid grouped by letter */}
        {brands.length === 0 ? (
          <div className="text-center py-24">
            <span
              className="material-icon text-outline-variant mb-4 block"
              style={{ fontSize: '64px' }}
              aria-hidden="true"
            >
              storefront
            </span>
            <p className="text-on-surface-variant">
              Marka bilgileri yükleniyor...
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedLetters.map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-extrabold text-primary/20">
                    {letter}
                  </span>
                  <div className="flex-1 h-px bg-outline-variant/20" />
                  <span className="label-caps text-outline">
                    {grouped[letter].length} marka
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {grouped[letter]
                    .sort((a, b) => a.brand_name.localeCompare(b.brand_name))
                    .map((brand) => (
                      <Link
                        key={brand.brand_id}
                        href={`/urunler?brand=${brand.brand_slug}`}
                        className="curator-card p-4 flex items-center gap-4 group hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="w-11 h-11 rounded-sm bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                          <span className="text-lg font-bold text-primary group-hover:text-on-primary">
                            {brandInitial(brand.brand_name)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                            {brand.brand_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {brand.country_of_origin &&
                              COUNTRY_FLAGS[brand.country_of_origin] && (
                                <span className="text-xs">
                                  {COUNTRY_FLAGS[brand.country_of_origin]}
                                </span>
                              )}
                            {brand.country_of_origin && (
                              <span className="label-caps text-outline">
                                {COUNTRY_LABELS[brand.country_of_origin] ||
                                  brand.country_of_origin}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className="material-icon material-icon-sm text-outline-variant group-hover:text-primary transition-colors"
                          aria-hidden="true"
                        >
                          arrow_forward
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16 border-t border-outline-variant/20 pt-10">
          <p className="text-sm text-on-surface-variant mb-4">
            Aradığın markayı bulamadın mı?
          </p>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 curator-btn-primary px-8 py-3 text-xs"
          >
            <span
              className="material-icon material-icon-sm"
              aria-hidden="true"
            >
              search
            </span>
            TÜM ÜRÜNLERİ ARA
          </Link>
        </div>
      </div>
    </>
  );
}
