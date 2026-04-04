import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import FavoriteButton from '@/components/public/FavoriteButton';
import PriceChart from '@/components/public/PriceChart';
import ListModal from '@/components/public/ListModal';

// === Types ===

interface ProductImage {
  image_url: string;
  alt_text?: string;
  sort_order?: number;
}

interface Brand {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
}

interface Category {
  category_id: number;
  category_name: string;
  category_slug: string;
}

interface NeedScore {
  product_need_score_id: number;
  need_id: number;
  need?: { need_id: number; need_name: string; need_slug: string };
  compatibility_score: number;
  score_reason_summary?: string;
  confidence_level: string;
}

interface ProductIngredient {
  product_ingredient_id: number;
  ingredient_id: number | null;
  ingredient_display_name: string;
  inci_order_rank: number;
  concentration_band: string;
  is_below_one_percent_estimate: boolean;
  ingredient?: {
    ingredient_id: number;
    inci_name: string;
    ingredient_slug: string;
    allergen_flag: boolean;
    fragrance_flag: boolean;
    function_summary?: string;
  };
}

interface AffiliateLink {
  affiliate_link_id: number;
  platform: string;
  affiliate_url: string;
  price_snapshot: number | null;
  is_active: boolean;
}

interface ProductLabel {
  claim_texts_json?: string[];
  warning_text?: string;
  usage_instructions?: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  product_type_label?: string;
  short_description?: string;
  barcode?: string;
  net_content_value?: number;
  net_content_unit?: string;
  target_area?: string;
  usage_time_hint?: string;
  status: string;
  brand?: Brand;
  category?: Category;
  label?: ProductLabel;
  images?: ProductImage[];
  ingredients?: ProductIngredient[];
  need_scores?: NeedScore[];
  affiliate_links?: AffiliateLink[];
}

// === Data fetching ===

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/slug/${slug}`, {
      next: { revalidate: 3600 },
    } as any);
  } catch {
    return null;
  }
}

// === SEO ===

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return { title: 'Ürün Bulunamadı' };
  }

  const title = product.brand
    ? `${product.brand.brand_name} ${product.product_name}`
    : product.product_name;
  const description =
    product.short_description ||
    `${title} ürününün INCI içerik analizi, uyumluluk skorları ve nereden alınır bilgisi.`;
  const imageUrl = product.images?.[0]?.image_url;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | REVELA`,
      description,
      type: 'article',
      ...(imageUrl ? { images: [{ url: imageUrl, width: 600, height: 600, alt: title }] } : {}),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    alternates: {
      canonical: `/urunler/${product.product_slug}`,
    },
  };
}

// === Helpers ===

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-score-high';
  if (score >= 40) return 'text-score-medium';
  return 'text-score-low';
}

function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-score-high-bg border-score-high-border';
  if (score >= 40) return 'bg-score-medium-bg border-score-medium-border';
  return 'bg-score-low-bg border-score-low-border';
}

function getScoreBarWidth(score: number): string {
  return `${Math.min(100, Math.max(0, Math.round(score)))}%`;
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-score-high';
  if (score >= 40) return 'bg-score-medium';
  return 'bg-score-low';
}

const PLATFORM_INFO: Record<string, { label: string; logo: string; color: string }> = {
  trendyol:     { label: 'Trendyol',     logo: '/logos/trendyol.svg',     color: '#F27A1A' },
  hepsiburada:  { label: 'Hepsiburada',  logo: '/logos/hepsiburada.svg',  color: '#FF6000' },
  amazon_tr:    { label: 'Amazon TR',    logo: '/logos/amazon_tr.svg',    color: '#232F3E' },
  dermoeczanem: { label: 'Dermoeczanem', logo: '/logos/dermoeczanem.svg', color: '#00A99D' },
  gratis:       { label: 'Gratis',       logo: '/logos/gratis.svg',       color: '#4A0E78' },
  rossmann:     { label: 'Rossmann',     logo: '/logos/rossmann.svg',     color: '#D40E14' },
  watsons:      { label: 'Watsons',      logo: '/logos/watsons.svg',      color: '#00B0A0' },
};

function platformLabel(platform: string): string {
  const map: Record<string, string> = {
    trendyol: 'Trendyol',
    hepsiburada: 'Hepsiburada',
    amazon_tr: 'Amazon TR',
    dermoeczanem: 'Dermoeczanem',
    gratis: 'Gratis',
    rossmann: 'Rossmann',
    watsons: 'Watsons',
    other: 'Diğer',
  };
  return map[platform] || platform;
}

function concentrationLabel(band: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    very_high: { label: 'Çok Yüksek', color: 'bg-score-high-bg text-score-high' },
    high: { label: 'Yüksek', color: 'bg-score-high-bg/50 text-score-high' },
    medium: { label: 'Orta', color: 'bg-score-medium-bg text-score-medium' },
    low: { label: 'Düşük', color: 'bg-surface-container text-on-surface-variant' },
    trace: { label: 'Eser', color: 'bg-surface-container text-outline' },
  };
  return map[band] || { label: band, color: 'text-outline' };
}

function formatPrice(price: number | null): string {
  if (!price) return '';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);
}

// === JSON-LD ===

function productJsonLd(product: Product) {
  const imageUrl = product.images?.[0]?.image_url;
  const avgScore =
    product.need_scores && product.need_scores.length > 0
      ? product.need_scores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) /
        product.need_scores.length
      : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.product_name,
    description:
      product.short_description ||
      `${product.product_name} ürününün INCI analizi ve içerik değerlendirmesi.`,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand.brand_name } } : {}),
    ...(product.category ? { category: product.category.category_name } : {}),
    ...(product.barcode ? { gtin13: product.barcode } : {}),
    ...(avgScore
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: (avgScore / 20).toFixed(1),
            bestRating: '5',
            ratingCount: product.need_scores?.length || 1,
          },
        }
      : {}),
    ...(product.affiliate_links && product.affiliate_links.length > 0
      ? {
          offers: product.affiliate_links
            .filter((l) => l.is_active)
            .map((link) => ({
              '@type': 'Offer',
              url: link.affiliate_url,
              priceCurrency: 'TRY',
              ...(link.price_snapshot ? { price: link.price_snapshot } : {}),
              availability: 'https://schema.org/InStock',
              seller: { '@type': 'Organization', name: platformLabel(link.platform) },
            })),
        }
      : {}),
  };
}

// === Page ===

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const imageUrl = product.images?.[0]?.image_url;
  const sortedIngredients = [...(product.ingredients || [])].sort(
    (a, b) => a.inci_order_rank - b.inci_order_rank,
  );
  const activeLinks = (product.affiliate_links || []).filter((l) => l.is_active);
  const avgScore =
    product.need_scores && product.need_scores.length > 0
      ? Math.round(
          product.need_scores.reduce((s, ns) => s + Number(ns.compatibility_score), 0) /
            product.need_scores.length,
        )
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />

      <article className="max-w-6xl mx-auto px-6 lg:px-16 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="label-caps text-outline mb-8 flex items-center gap-2">
          <Link href="/urunler" className="hover:text-on-surface transition-colors">
            Ürünler
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <span className="text-on-surface-variant">{product.category.category_name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-on-surface">{product.product_name}</span>
        </nav>

        <div className="editorial-grid gap-8 lg:gap-12 mb-16">
          {/* Image */}
          <div className="col-span-12 md:col-span-6 relative">
            <div className="aspect-square bg-surface-container-low rounded-sm flex items-center justify-center overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <FavoriteButton
                  product_id={product.product_id}
                  product_name={product.product_name}
                  product_slug={product.product_slug}
                  brand_name={product.brand?.brand_name}
                  image_url={imageUrl}
                />
              </div>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.product_name}
                  width={600}
                  height={600}
                  className="object-contain w-full h-full transition-transform duration-700 hover:scale-105"
                  priority
                />
              ) : (
                <span className="material-icon text-outline-variant" style={{ fontSize: '80px' }} aria-hidden="true">inventory_2</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="col-span-12 md:col-span-6">
            {product.brand && (
              <p className="label-caps text-primary mb-2 tracking-[0.2em]">
                {product.brand.brand_name}
              </p>
            )}
            <h1 className="text-2xl lg:text-3xl headline-tight text-on-surface mb-4">
              {product.product_name}
            </h1>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.category && (
                <span className="label-caps bg-surface-container px-3 py-1.5 rounded-md text-on-surface-variant">
                  {product.category.category_name}
                </span>
              )}
              {product.product_type_label && (
                <span className="label-caps bg-surface-container px-3 py-1.5 rounded-md text-on-surface-variant">
                  {product.product_type_label}
                </span>
              )}
              {product.target_area && (
                <span className="label-caps bg-tertiary-container px-3 py-1.5 rounded-md text-on-tertiary-container">
                  {product.target_area === 'face' ? 'Yüz' : product.target_area === 'body' ? 'Vücut' : product.target_area === 'hair' ? 'Saç' : product.target_area === 'eye' ? 'Göz Çevresi' : product.target_area}
                </span>
              )}
              {product.usage_time_hint && (
                <span className="label-caps bg-surface-container px-3 py-1.5 rounded-md text-on-surface-variant">
                  {product.usage_time_hint === 'morning' ? 'Sabah' : product.usage_time_hint === 'evening' ? 'Akşam' : product.usage_time_hint === 'both' ? 'Sabah & Akşam' : product.usage_time_hint}
                </span>
              )}
              {product.net_content_value && (
                <span className="label-caps bg-surface-container px-3 py-1.5 rounded-md text-outline">
                  {product.net_content_value}{product.net_content_unit || 'ml'}
                </span>
              )}
            </div>

            {product.short_description && (
              <p className="text-on-surface-variant leading-relaxed mb-8">
                {product.short_description}
              </p>
            )}

            {/* Overall Score */}
            {avgScore !== null && (
              <div className={`rounded-md border p-6 mb-6 ${getScoreBg(avgScore)}`}>
                <p className="label-caps text-on-surface-variant mb-1">Genel Uyum Skoru</p>
                <p className={`text-4xl headline-tight ${getScoreColor(avgScore)}`}>
                  %{avgScore}
                </p>
                <div className="mt-3 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getScoreBarColor(avgScore)}`}
                    style={{ width: getScoreBarWidth(avgScore) }}
                  />
                </div>
              </div>
            )}

            {/* Personal Score CTA */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-md p-6">
              <p className="label-caps text-on-surface-variant">Senin Cildine Uyumu</p>
              <p className="text-lg font-bold text-primary mt-1">
                Kişisel skorunu gör
              </p>
              <p className="text-xs text-outline mt-2">
                <Link href="/profilim" className="text-primary hover:underline underline-offset-4">
                  Cilt profili oluştur
                </Link>{' '}
                &rarr; sana özel uyumluluk skoru
              </p>
            </div>
          </div>
        </div>

        {/* Need Scores */}
        {product.need_scores && product.need_scores.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-bold tracking-tight mb-2 text-on-surface">Uyumluluk Skorları</h2>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Skorlar, ürünün INCI listesindeki her bir etken maddenin bilimsel kanıt seviyesi,
              konsantrasyon sıralaması ve ilgili cilt ihtiyacına katkısı analiz edilerek hesaplanır.
              <span className="font-medium text-score-high"> %70+</span> yüksek uyum,
              <span className="font-medium text-score-medium"> %40-69</span> orta uyum,
              <span className="font-medium text-score-low"> %40 altı</span> düşük uyum anlamına gelir.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.need_scores.map((ns) => {
                const score = Math.round(Number(ns.compatibility_score));
                return (
                  <div
                    key={ns.product_need_score_id}
                    className="curator-card p-5 flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">
                        {ns.need ? (
                          <Link href={`/ihtiyaclar/${ns.need.need_slug}`} className="hover:text-primary transition-colors">
                            {ns.need.need_name}
                          </Link>
                        ) : (
                          `İhtiyaç #${ns.need_id}`
                        )}
                      </p>
                      <div className="mt-2 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getScoreBarColor(score)}`}
                          style={{ width: getScoreBarWidth(score) }}
                        />
                      </div>
                      {ns.score_reason_summary && (
                        <p className="text-[10px] text-outline mt-1.5">{ns.score_reason_summary}</p>
                      )}
                    </div>
                    <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                      %{score}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* INCI Ingredients */}
        <section className="mb-16">
          <h2 className="text-xl font-bold tracking-tight mb-6 text-on-surface">
            İçerik Listesi (INCI)
            {sortedIngredients.length > 0 && (
              <span className="text-sm font-normal text-outline ml-2">
                {sortedIngredients.length} madde
              </span>
            )}
          </h2>
          {sortedIngredients.length > 0 ? (
            <ListModal
              title="İçerik Listesi (INCI)"
              count={sortedIngredients.length}
              previewCount={10}
              allChildren={
                <div className="divide-y divide-outline-variant/15">
                  {sortedIngredients.map((pi, idx) => {
                    const isAllergen = pi.ingredient?.allergen_flag;
                    const isFragrance = pi.ingredient?.fragrance_flag;
                    return (
                      <div
                        key={pi.product_ingredient_id}
                        className={`flex items-center gap-3 py-2.5 ${
                          isAllergen ? 'bg-error/5' : isFragrance ? 'bg-tertiary-container/30' : ''
                        }`}
                      >
                        <span className="label-caps text-outline w-6 text-right shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          {pi.ingredient ? (
                            <Link
                              href={`/icerikler/${pi.ingredient.ingredient_slug}`}
                              className="text-sm font-medium text-on-surface hover:text-primary transition-colors"
                            >
                              {pi.ingredient_display_name}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-on-surface">
                              {pi.ingredient_display_name}
                            </span>
                          )}
                          {pi.is_below_one_percent_estimate && (
                            <span className="label-caps text-outline ml-1">(&lt;1%)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isAllergen && (
                            <span className="label-caps bg-error/10 text-error px-2 py-0.5 rounded-md">Alerjen</span>
                          )}
                          {isFragrance && (
                            <span className="label-caps bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-md">Parfüm</span>
                          )}
                          {pi.concentration_band !== 'unknown' && (() => {
                            const conc = concentrationLabel(pi.concentration_band);
                            return (
                              <span className={`label-caps px-2 py-0.5 rounded-md ${conc.color}`}>
                                {conc.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            >
              <div className="curator-card overflow-hidden">
                <div className="divide-y divide-outline-variant/15">
                  {sortedIngredients.slice(0, 10).map((pi, idx) => {
                    const isAllergen = pi.ingredient?.allergen_flag;
                    const isFragrance = pi.ingredient?.fragrance_flag;
                    return (
                      <details
                        key={pi.product_ingredient_id}
                        className={`group px-5 py-3.5 ${
                          isAllergen ? 'bg-error/5' : isFragrance ? 'bg-tertiary-container/30' : ''
                        }`}
                      >
                        <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <span className="label-caps text-outline w-6 text-right">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-sm font-medium text-on-surface group-open:text-primary transition-colors">
                              {pi.ingredient_display_name}
                            </span>
                            {pi.ingredient?.function_summary && (
                              <span className="material-icon text-outline-variant group-open:rotate-180 transition-transform" style={{ fontSize: '16px' }} aria-hidden="true">
                                expand_more
                              </span>
                            )}
                            {pi.is_below_one_percent_estimate && (
                              <span className="label-caps text-outline">(&lt;1%)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isAllergen && (
                              <span className="label-caps bg-error/10 text-error px-2 py-0.5 rounded-md">Alerjen</span>
                            )}
                            {isFragrance && (
                              <span className="label-caps bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-md">Parfüm</span>
                            )}
                            {pi.concentration_band !== 'unknown' && (() => {
                              const conc = concentrationLabel(pi.concentration_band);
                              return (
                                <span className={`label-caps px-2 py-0.5 rounded-md ${conc.color}`}>
                                  {conc.label}
                                </span>
                              );
                            })()}
                          </div>
                        </summary>
                        {pi.ingredient && (
                          <div className="ml-9 mt-2 bg-surface-container-low border-l-2 border-primary/30 rounded-r-md px-4 py-3 animate-[fadeIn_0.15s_ease-in]">
                            {pi.ingredient.function_summary && (
                              <p className="text-xs text-on-surface-variant leading-relaxed">
                                {pi.ingredient.function_summary}
                              </p>
                            )}
                            <Link
                              href={`/icerikler/${pi.ingredient.ingredient_slug}`}
                              className="inline-block mt-2 label-caps text-primary hover:underline underline-offset-4"
                            >
                              Detaylı bilgi &rarr;
                            </Link>
                          </div>
                        )}
                      </details>
                    );
                  })}
                </div>
              </div>
            </ListModal>
          ) : (
            <div className="bg-surface-container-low rounded-md p-8 text-on-surface-variant text-sm text-center">
              <span className="material-icon material-icon-lg text-outline-variant block mb-2" aria-hidden="true">science</span>
              INCI analizi henüz yapılmamış
            </div>
          )}
        </section>

        {/* Label Info */}
        {product.label && (
          <section className="mb-16">
            {product.label.usage_instructions && (
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight mb-3 text-on-surface">Kullanım</h2>
                <p className="text-on-surface-variant text-sm leading-relaxed bg-surface-container-low rounded-md p-5">
                  {product.label.usage_instructions}
                </p>
              </div>
            )}
            {product.label.claim_texts_json && product.label.claim_texts_json.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-on-surface">Ürün İddiaları</h3>
                <div className="text-on-surface-variant text-sm leading-relaxed bg-tertiary-container/30 rounded-md p-5">
                  <ul className="list-disc list-inside space-y-1">
                    {product.label.claim_texts_json.map((claim, i) => (
                      <li key={i}>{claim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {product.label.warning_text && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-on-surface">Uyarılar</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed bg-error/5 rounded-md p-5 border border-error/20">
                  {product.label.warning_text}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Affiliate Links */}
        {activeLinks.length > 0 && (() => {
          const priced = activeLinks.filter((l) => l.price_snapshot && l.price_snapshot > 0);
          const prices = priced.map((l) => Number(l.price_snapshot));
          const minPrice = prices.length ? Math.min(...prices) : 0;
          const maxPrice = prices.length ? Math.max(...prices) : 0;
          const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
          const cheapest = priced.find((l) => Number(l.price_snapshot) === minPrice);
          const sorted = [...activeLinks].sort((a, b) => {
            if (!a.price_snapshot) return 1;
            if (!b.price_snapshot) return -1;
            return Number(a.price_snapshot) - Number(b.price_snapshot);
          });

          return (
            <section className="mb-16">
              <h2 className="text-xl font-bold tracking-tight mb-6 text-on-surface">Nereden Alınır?</h2>

              {/* Price summary */}
              {prices.length >= 2 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-score-high-bg border border-score-high-border rounded-md p-4 text-center">
                    <p className="label-caps text-score-high">En Ucuz</p>
                    <p className="text-lg font-bold text-score-high mt-1">{formatPrice(minPrice)}</p>
                    {cheapest && (
                      <div className="flex items-center justify-center mt-1.5">
                        {PLATFORM_INFO[cheapest.platform]?.logo ? (
                          <img src={PLATFORM_INFO[cheapest.platform].logo} alt={platformLabel(cheapest.platform)} className="h-5 w-auto rounded-sm" style={{ maxWidth: '60px' }} />
                        ) : (
                          <p className="label-caps text-score-high/60">{platformLabel(cheapest.platform)}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="bg-score-low-bg border border-score-low-border rounded-md p-4 text-center">
                    <p className="label-caps text-score-low">En Pahalı</p>
                    <p className="text-lg font-bold text-score-low mt-1">{formatPrice(maxPrice)}</p>
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-md p-4 text-center">
                    <p className="label-caps text-on-surface-variant">Ortalama</p>
                    <p className="text-lg font-bold text-on-surface mt-1">{formatPrice(avgPrice)}</p>
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-md p-4 text-center">
                    <p className="label-caps text-on-surface-variant">Platform</p>
                    <p className="text-lg font-bold text-on-surface mt-1">{priced.length}</p>
                  </div>
                </div>
              )}

              {/* Price chart */}
              <PriceChart productId={product.product_id} />

              {/* Vertical price list */}
              <div className="curator-card overflow-hidden divide-y divide-outline-variant/15">
                {sorted.map((link) => {
                  const isCheapest = link.price_snapshot && Number(link.price_snapshot) === minPrice && prices.length >= 2;
                  const pInfo = PLATFORM_INFO[link.platform];
                  return (
                    <a
                      key={link.affiliate_link_id}
                      href={link.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors duration-300 ${isCheapest ? 'bg-score-high-bg/30' : ''}`}
                    >
                      {isCheapest && (
                        <span className="label-caps bg-score-high text-white px-2.5 py-1 rounded-md shrink-0">
                          EN UCUZ
                        </span>
                      )}
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        {pInfo?.logo ? (
                          <img
                            src={pInfo.logo}
                            alt={pInfo.label}
                            className="h-7 w-auto shrink-0 rounded-sm"
                            style={{ maxWidth: '80px' }}
                          />
                        ) : (
                          <p className="font-semibold text-on-surface">{platformLabel(link.platform)}</p>
                        )}
                      </div>
                      {link.price_snapshot ? (
                        <p className="text-lg font-bold shrink-0" style={{ color: pInfo?.color || '#2f3331' }}>
                          {formatPrice(Number(link.price_snapshot))}
                        </p>
                      ) : (
                        <p className="text-sm text-outline shrink-0">Fiyat bilgisi yok</p>
                      )}
                      <span className="material-icon shrink-0" style={{ color: pInfo?.color || '#1a1a1a' }} aria-hidden="true">arrow_forward</span>
                    </a>
                  );
                })}
              </div>
              <p className="text-xs text-outline mt-4">
                Bağımsız platformuz, komisyon alınan linkler içerebilir. Fiyatlar son güncelleme tarihine aittir.
              </p>
            </section>
          );
        })()}

        {/* Compare CTA */}
        <div className="border-t border-outline-variant/20 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-on-surface-variant text-sm">
            Bu ürünü başka bir ürünle karşılaştırmak ister misin?
          </p>
          <Link href="/karsilastir" className="curator-btn-outline">
            <span className="material-icon material-icon-sm" aria-hidden="true">compare</span>
            Ürünleri Karşılaştır
          </Link>
        </div>
      </article>
    </>
  );
}
