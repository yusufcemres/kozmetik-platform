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
  domain_type?: string;
  short_description?: string;
  category?: { category_name: string; category_slug?: string };
  images?: ProductImage[];
  affiliate_links?: { affiliate_link_id: number; platform: string; affiliate_url: string }[];
  need_scores?: { compatibility_score: number; need?: { need_name: string; need_slug: string } }[];
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

async function getTopScoredByBrand(brandId: number): Promise<Product[]> {
  try {
    return await apiFetch<Product[]>(
      `/products/top-scored?brand_id=${brandId}&limit=3`,
      { next: { revalidate: 3600 } } as RequestInit,
    );
  } catch {
    return [];
  }
}

// === Metadata ===

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: 'Marka Bulunamadı — REVELA' };

  const title = `${brand.brand_name} Ürünleri — REVELA`;
  const description = `${brand.brand_name} markasının tüm kozmetik ürünleri, içerik analizleri ve fiyat karşılaştırmaları.`;

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

  const [{ data: products, meta }, topProducts] = await Promise.all([
    getBrandProducts(brand.brand_id),
    getTopScoredByBrand(brand.brand_id),
  ]);

  // Split by domain, then group by category
  const cosmeticProducts = products.filter((p) => p.domain_type !== 'supplement');
  const supplementProducts = products.filter((p) => p.domain_type === 'supplement');

  const groupByCategory = (items: Product[]) => {
    const grouped = items.reduce<Record<string, Product[]>>((acc, p) => {
      const cat = p.category?.category_name || 'Diğer';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {});
    return Object.keys(grouped).sort().map((name) => ({ name, items: grouped[name] }));
  };

  const cosmeticCategories = groupByCategory(cosmeticProducts);
  const supplementCategories = groupByCategory(supplementProducts);

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
                {meta.total} ürün
              </span>
              {cosmeticProducts.length > 0 && supplementProducts.length > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-sm border border-outline-variant/20 text-xs">
                  {cosmeticProducts.length} Kozmetik · {supplementProducts.length} Takviye
                </span>
              )}
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

      {/* Top Scored Highlight */}
      {topProducts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-icon text-primary" aria-hidden="true">star</span>
            Bu Markadan En Iyiler
          </h2>
          <p className="text-xs text-on-surface-variant mb-4">
            Skorlar en yuksek ihtiyac uyumuna gore hesaplanmistir.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {topProducts.map((tp, rank) => {
              const rawImg = tp.images?.[0]?.image_url;
              const tpImg = rawImg?.includes('placehold.co') || rawImg?.includes('dicebear') ? undefined : rawImg;
              const topNeed = tp.need_scores?.sort((a, b) => Number(b.compatibility_score) - Number(a.compatibility_score))?.[0];
              const avgScore = tp.need_scores?.length
                ? Math.round(tp.need_scores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) / tp.need_scores.length)
                : null;
              return (
                <Link
                  key={tp.product_id}
                  href={`/urunler/${tp.product_slug}`}
                  className="curator-card overflow-hidden group border-primary/10"
                >
                  <div className="aspect-[4/3] bg-surface-container-low relative overflow-hidden">
                    {tpImg ? (
                      <Image
                        src={tpImg}
                        alt={tp.product_name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icon text-outline-variant/30" style={{ fontSize: '48px' }} aria-hidden="true">spa</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">
                      #{rank + 1}
                    </div>
                    {avgScore !== null && (
                      <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-sm px-2 py-1">
                        <span className="text-xs font-bold text-primary">%{avgScore}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                      {tp.product_name}
                    </h3>
                    {topNeed?.need && (
                      <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                        <span className="material-icon material-icon-sm text-primary" aria-hidden="true">target</span>
                        {topNeed.need.need_name} — %{Math.round(Number(topNeed.compatibility_score))}
                      </p>
                    )}
                    {tp.category && (
                      <p className="label-caps text-outline mt-1">{tp.category.category_name}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Products by Domain & Category */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '48px' }} aria-hidden="true">search_off</span>
          <p className="text-on-surface-variant">Bu markaya ait ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-14">
          {[
            { label: 'Kozmetik Ürünler', icon: 'spa', categories: cosmeticCategories, linkPrefix: '/urunler' },
            { label: 'Takviye Ürünler', icon: 'medication', categories: supplementCategories, linkPrefix: '/takviyeler' },
          ].filter((section) => section.categories.length > 0).map((section) => (
            <div key={section.label}>
              {/* Only show section header if both domains exist */}
              {cosmeticProducts.length > 0 && supplementProducts.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-icon text-primary text-[24px]" aria-hidden="true">{section.icon}</span>
                  <h2 className="text-xl font-bold text-on-surface">{section.label}</h2>
                  <span className="label-caps text-outline">({section.categories.reduce((s, c) => s + c.items.length, 0)})</span>
                </div>
              )}
              <div className="space-y-10">
                {section.categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-on-surface">{cat.name}</h3>
                      <div className="flex-1 h-px bg-outline-variant/20" />
                      <span className="text-xs text-on-surface-variant">{cat.items.length} ürün</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {cat.items.map((product) => {
                        const rawImg = product.images?.[0]?.image_url;
                        const imageUrl = rawImg?.includes('placehold.co') || rawImg?.includes('dicebear') ? undefined : rawImg;
                        const href = product.domain_type === 'supplement'
                          ? `/takviyeler/${product.product_slug}`
                          : `/urunler/${product.product_slug}`;
                        return (
                          <Link
                            key={product.product_id}
                            href={href}
                            className="curator-card group overflow-hidden hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="aspect-square bg-surface-container-low relative overflow-hidden">
                              {imageUrl ? (
                                <Image src={imageUrl} alt={product.product_name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-icon text-outline-variant/30" style={{ fontSize: '48px' }} aria-hidden="true">{section.icon}</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="text-xs text-on-surface-variant mb-1 truncate">{brand.brand_name}</p>
                              <h3 className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-tight">{product.product_name}</h3>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
