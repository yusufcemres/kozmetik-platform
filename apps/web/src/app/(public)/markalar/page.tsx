'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

// === Types ===

interface Brand {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  country_of_origin?: string;
  website_url?: string;
  logo_url?: string;
  product_count?: number;
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
  CA: '\u{1F1E8}\u{1F1E6}',
  HU: '\u{1F1ED}\u{1F1FA}',
};

const COUNTRY_LABELS: Record<string, string> = {
  TR: 'Turkiye',
  FR: 'Fransa',
  DE: 'Almanya',
  US: 'ABD',
  KR: 'Guney Kore',
  JP: 'Japonya',
  UK: 'Ingiltere',
  IT: 'Italya',
  ES: 'Ispanya',
  SE: 'Isvec',
  CH: 'Isvicre',
  CA: 'Kanada',
  HU: 'Macaristan',
};

function brandInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// === Page ===

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: Brand[] }>('/brands?limit=200');
        setBrands(res.data || []);
      } catch {
        setBrands([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    <div className="curator-section max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">
          Koleksiyon
        </span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">
          MARKALAR
        </h1>
        <p className="text-on-surface-variant text-sm mt-3 max-w-lg mx-auto">
          Platformumuzda analiz edilen {brands.length} kozmetik markasi
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="curator-card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-surface-container" />
                <div className="flex-1">
                  <div className="h-4 bg-surface-container rounded w-1/3 mb-2" />
                  <div className="h-3 bg-surface-container rounded w-1/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-24">
          <span
            className="material-icon text-outline-variant mb-4 block"
            style={{ fontSize: '64px' }}
            aria-hidden="true"
          >
            storefront
          </span>
          <p className="text-on-surface-variant">
            Marka bilgileri yukleniyor...
          </p>
        </div>
      ) : (
        <>
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

          {/* Brand list grouped by letter */}
          <div className="space-y-10">
            {sortedLetters.map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-2xl font-extrabold text-primary/20">
                    {letter}
                  </span>
                  <div className="flex-1 h-px bg-outline-variant/20" />
                  <span className="label-caps text-outline">
                    {grouped[letter].length} marka
                  </span>
                </div>

                <div className="curator-card divide-y divide-outline-variant/15 overflow-hidden">
                  {grouped[letter]
                    .sort((a, b) => a.brand_name.localeCompare(b.brand_name))
                    .map((brand) => (
                      <Link
                        key={brand.brand_id}
                        href={`/urunler?brand=${brand.brand_slug}`}
                        className="flex items-center gap-4 px-5 py-4 group hover:bg-surface-container-low transition-colors duration-200"
                      >
                        {/* Logo / Initial */}
                        <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant/15 flex items-center justify-center shrink-0 overflow-hidden">
                          {brand.logo_url ? (
                            <Image
                              src={brand.logo_url}
                              alt={brand.brand_name}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <span className="text-lg font-bold text-primary/60">
                              {brandInitial(brand.brand_name)}
                            </span>
                          )}
                        </div>

                        {/* Brand info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
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
                              <span className="label-caps text-outline text-[10px]">
                                {COUNTRY_LABELS[brand.country_of_origin] ||
                                  brand.country_of_origin}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product count */}
                        {brand.product_count !== undefined && brand.product_count > 0 && (
                          <span className="text-xs text-on-surface-variant whitespace-nowrap">
                            {brand.product_count} urun
                          </span>
                        )}

                        {/* Arrow */}
                        <span
                          className="material-icon material-icon-sm text-outline-variant/50 group-hover:text-primary transition-colors shrink-0"
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
        </>
      )}

      {/* CTA */}
      <div className="text-center mt-16 border-t border-outline-variant/20 pt-10">
        <p className="text-sm text-on-surface-variant mb-4">
          Aradigin markayi bulamadin mi?
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
          TUM URUNLERI ARA
        </Link>
      </div>
    </div>
  );
}
