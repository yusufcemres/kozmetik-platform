import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { apiFetch, API_BASE_URL } from '@/lib/api';

// === Types ===

interface Brand {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  country_of_origin?: string;
  website_url?: string;
  logo_url?: string;
}

interface ProductImage {
  image_url: string;
  alt_text?: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  short_description?: string;
  category?: { category_name: string; category_slug?: string };
  images?: ProductImage[];
  affiliate_links?: { affiliate_link_id: number; platform: string; affiliate_url: string }[];
}

// === Country Maps ===

const COUNTRY_LABELS: Record<string, string> = {
  TR: 'Turkiye', FR: 'Fransa', DE: 'Almanya', US: 'ABD', KR: 'Guney Kore',
  JP: 'Japonya', UK: 'Ingiltere', IT: 'Italya', ES: 'Ispanya', SE: 'Isvec',
  CH: 'Isvicre', CA: 'Kanada', HU: 'Macaristan',
};

const COUNTRY_FLAGS: Record<string, string> = {
  TR: '\u{1F1F9}\u{1F1F7}', FR: '\u{1F1EB}\u{1F1F7}', DE: '\u{1F1E9}\u{1F1EA}',
  US: '\u{1F1FA}\u{1F1F8}', KR: '\u{1F1F0}\u{1F1F7}', JP: '\u{1F1EF}\u{1F1F5}',
  UK: '\u{1F1EC}\u{1F1E7}', IT: '\u{1F1EE}\u{1F1F9}', SE: '\u{1F1F8}\u{1F1EA}',
  CH: '\u{1F1E8}\u{1F1ED}', CA: '\u{1F1E8}\u{1F1E6}', HU: '\u{1F1ED}\u{1F1FA}',
};

// === Data Fetching ===

async function getBrand(slug: string): Promise<Brand | null> {
  try {
    return await apiFetch<Brand>(`/brands/slug/${slug}`, { next: { revalidate: 3600 } } as RequestInit);
  } catch {
    return null;
  }
}

async function getBrandProducts(brandId: number): Promise<{ data: Product[]; meta: { total: number } }> {
  try {
    return await apiFetch<{ data: Product[]; meta: { total: number } }>(
      `/products?brand_id=${brandId}&limit=100&page=1`,
      { next: { revalidate: 3600 } } as RequestInit,
    );
  } catch {
    return { data: [], meta: { total: 0 } };
  }
}

// === Metadata ===

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: 'Marka Bulunamadi — REVELA' };

  const title = `${brand.brand_name} Urunleri — REVELA`;
  const description = `${brand.brand_name} markasinin tum kozmetik urunleri, icerik analizleri ve fiyat karsilastirmalari.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

// === Page ===

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const { data: products, meta } = await getBrandProducts(brand.brand_id);

  // Group products by category
  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category?.category_name || 'Diger';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
  const categoryNames = Object.keys(grouped).sort();

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
        <span className="text-outline">/</span>
        <Link href="/markalar" className="hover:text-primary transition-colors">Markalar</Link>
        <span className="text-outline">/</span>
        <span className="text-on-surface font-medium">{brand.brand_name}</span>
      </nav>

      {/* Brand Header */}
      <div className="curator-card p-8 mb-10">
        <div className="flex items-start gap-6">
          {/* Logo / Initial */}
          <div className="w-20 h-20 rounded-lg bg-surface-container-low border border-outline-variant/15 flex items-center justify-center shrink-0 overflow-hidden">
            {brand.logo_url ? (
              <Image src={brand.logo_url} alt={brand.brand_name} width={64} height={64} className="object-contain" />
            ) : (
              <span className="text-3xl font-bold text-primary/60">
                {brand.brand_name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl headline-tight text-on-surface mb-2">
              {brand.brand_name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
              {brand.country_of_origin && (
                <span className="inline-flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-sm border border-outline-variant/20">
                  {COUNTRY_FLAGS[brand.country_of_origin] && (
                    <span>{COUNTRY_FLAGS[brand.country_of_origin]}</span>
                  )}
                  <span>{COUNTRY_LABELS[brand.country_of_origin] || brand.country_of_origin}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-sm border border-outline-variant/20">
                <span className="material-icon material-icon-sm text-primary" aria-hidden="true">inventory_2</span>
                {meta.total} urun
              </span>
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-sm border border-outline-variant/20 hover:border-primary/40 transition-colors"
                >
                  <span className="material-icon material-icon-sm" aria-hidden="true">language</span>
                  Resmi Site
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products by Category */}
      {categoryNames.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '48px' }} aria-hidden="true">
            search_off
          </span>
          <p className="text-on-surface-variant">Bu markaya ait urun bulunamadi.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categoryNames.map((catName) => (
            <div key={catName}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-on-surface">{catName}</h2>
                <div className="flex-1 h-px bg-outline-variant/20" />
                <span className="text-xs text-on-surface-variant">{grouped[catName].length} urun</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {grouped[catName].map((product) => {
                  const rawImg = product.images?.[0]?.image_url;
                  const imageUrl = rawImg?.includes('placehold.co') || rawImg?.includes('dicebear') ? undefined : rawImg;

                  return (
                    <Link
                      key={product.product_id}
                      href={`/urunler/${product.product_slug}`}
                      className="curator-card group overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-surface-container-low relative overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.product_name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-icon text-outline-variant/30" style={{ fontSize: '48px' }} aria-hidden="true">
                              spa
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="text-xs text-on-surface-variant mb-1 truncate">
                          {brand.brand_name}
                        </p>
                        <h3 className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {product.product_name}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Brand',
            name: brand.brand_name,
            url: brand.website_url || `https://kozmetik-platform.vercel.app/markalar/${brand.brand_slug}`,
            ...(brand.logo_url ? { logo: brand.logo_url } : {}),
          }),
        }}
      />
    </div>
  );
}
