import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import FavoriteButton from '@/components/public/FavoriteButton';

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
      title: `${title} | Kozmetik Platform`,
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
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-green-50 border-green-200';
  if (score >= 40) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

function getScoreBarWidth(score: number): string {
  return `${Math.min(100, Math.max(0, Math.round(score)))}%`;
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-400';
}

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
    very_high: { label: 'Çok Yüksek', color: 'bg-green-100 text-green-700' },
    high: { label: 'Yüksek', color: 'bg-green-50 text-green-600' },
    medium: { label: 'Orta', color: 'bg-yellow-50 text-yellow-700' },
    low: { label: 'Düşük', color: 'bg-gray-100 text-gray-500' },
    trace: { label: 'Eser', color: 'bg-gray-50 text-gray-400' },
  };
  return map[band] || { label: band, color: 'text-gray-400' };
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
            ratingValue: (avgScore / 20).toFixed(1), // 0-100 → 0-5 scale
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

      <article className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1">
          <Link href="/urunler" className="hover:text-primary">
            Ürünler
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <span>{product.category.category_name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-600">{product.product_name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="relative bg-gray-50 rounded-xl aspect-square flex items-center justify-center overflow-hidden">
            <div className="absolute top-3 right-3 z-10">
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
                className="object-contain w-full h-full"
                priority
              />
            ) : (
              <span className="text-gray-300 text-7xl">📦</span>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && (
              <p className="text-sm font-semibold text-primary mb-1">
                {product.brand.brand_name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.product_name}
            </h1>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.category && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {product.category.category_name}
                </span>
              )}
              {product.product_type_label && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {product.product_type_label}
                </span>
              )}
              {product.target_area && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                  {product.target_area === 'face'
                    ? 'Yüz'
                    : product.target_area === 'body'
                      ? 'Vücut'
                      : product.target_area === 'hair'
                        ? 'Saç'
                        : product.target_area === 'eye'
                          ? 'Göz Çevresi'
                          : product.target_area}
                </span>
              )}
              {product.usage_time_hint && (
                <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full">
                  {product.usage_time_hint === 'morning'
                    ? 'Sabah'
                    : product.usage_time_hint === 'evening'
                      ? 'Akşam'
                      : product.usage_time_hint === 'both'
                        ? 'Sabah & Akşam'
                        : product.usage_time_hint}
                </span>
              )}
              {product.net_content_value && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  {product.net_content_value}
                  {product.net_content_unit || 'ml'}
                </span>
              )}
            </div>

            {product.short_description && (
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.short_description}
              </p>
            )}

            {/* Overall Score */}
            {avgScore !== null && (
              <div
                className={`rounded-xl border p-5 mb-4 ${getScoreBg(avgScore)}`}
              >
                <p className="text-sm text-gray-600 mb-1">Genel Uyum Skoru</p>
                <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                  %{avgScore}
                </p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getScoreBarColor(avgScore)}`}
                    style={{ width: getScoreBarWidth(avgScore) }}
                  />
                </div>
              </div>
            )}

            {/* Personal Score CTA */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-sm text-gray-600">Senin Cildine Uyumu</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                Kişisel skorunu gör
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <Link href="/profilim" className="text-primary hover:underline">
                  Cilt profili oluştur
                </Link>{' '}
                &rarr; sana özel uyumluluk skoru
              </p>
            </div>
          </div>
        </div>

        {/* Need Scores */}
        {product.need_scores && product.need_scores.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Uyumluluk Skorları</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.need_scores.map((ns) => {
                const score = Math.round(Number(ns.compatibility_score));
                return (
                  <div
                    key={ns.product_need_score_id}
                    className="bg-white border rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {ns.need ? (
                          <Link
                            href={`/ihtiyaclar/${ns.need.need_slug}`}
                            className="hover:text-primary"
                          >
                            {ns.need.need_name}
                          </Link>
                        ) : (
                          `İhtiyaç #${ns.need_id}`
                        )}
                      </p>
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getScoreBarColor(score)}`}
                          style={{ width: getScoreBarWidth(score) }}
                        />
                      </div>
                      {ns.score_reason_summary && (
                        <p className="text-xs text-gray-400 mt-1">
                          {ns.score_reason_summary}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-lg font-bold ${getScoreColor(score)}`}
                    >
                      %{score}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* INCI Ingredients */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">
            İçerik Listesi (INCI)
            {sortedIngredients.length > 0 && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                {sortedIngredients.length} madde
              </span>
            )}
          </h2>
          {sortedIngredients.length > 0 ? (
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="divide-y">
                {sortedIngredients.map((pi, idx) => {
                  const isAllergen = pi.ingredient?.allergen_flag;
                  const isFragrance = pi.ingredient?.fragrance_flag;
                  return (
                    <details
                      key={pi.product_ingredient_id}
                      className={`group px-4 py-3 ${
                        isAllergen ? 'bg-red-50/50' : isFragrance ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span className="text-xs text-gray-400 w-6 text-right">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          <span className="text-sm font-medium text-gray-800 group-open:text-primary transition-colors">
                            {pi.ingredient_display_name}
                          </span>
                          {pi.ingredient?.function_summary && (
                            <svg className="w-3.5 h-3.5 text-gray-300 group-open:rotate-180 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                          {pi.is_below_one_percent_estimate && (
                            <span className="text-[10px] text-gray-400">
                              (&lt;1%)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isAllergen && (
                            <span
                              className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded"
                              title="Alerjen"
                            >
                              Alerjen
                            </span>
                          )}
                          {isFragrance && (
                            <span
                              className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded"
                              title="Parfüm"
                            >
                              Parfüm
                            </span>
                          )}
                          {pi.concentration_band !== 'unknown' && (() => {
                            const conc = concentrationLabel(pi.concentration_band);
                            return (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${conc.color}`}>
                                {conc.label}
                              </span>
                            );
                          })()}
                        </div>
                      </summary>
                      {pi.ingredient && (
                        <div className="ml-9 mt-2 bg-gradient-to-r from-primary/5 to-transparent border-l-2 border-primary/30 rounded-r-lg px-3 py-2.5 animate-[fadeIn_0.15s_ease-in]">
                          {pi.ingredient.function_summary && (
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {pi.ingredient.function_summary}
                            </p>
                          )}
                          <Link
                            href={`/icerikler/${pi.ingredient.ingredient_slug}`}
                            className="inline-block mt-1.5 text-[11px] text-primary hover:underline font-medium"
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
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
              INCI analizi henüz yapılmamış
            </div>
          )}
        </section>

        {/* Label Info */}
        {product.label && (
          <section className="mb-12">
            {product.label.usage_instructions && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Kullanım</h2>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-4">
                  {product.label.usage_instructions}
                </p>
              </div>
            )}
            {product.label.claim_texts_json && product.label.claim_texts_json.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Ürün İddiaları</h3>
                <div className="text-gray-600 text-sm leading-relaxed bg-blue-50 rounded-lg p-4">
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
                <h3 className="text-lg font-semibold mb-2">Uyarılar</h3>
                <p className="text-gray-600 text-sm leading-relaxed bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  {product.label.warning_text}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Affiliate Links */}
        {activeLinks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Nereden Alınır?</h2>
            <div className="bg-white border rounded-xl p-6">
              <div className="flex flex-wrap gap-4">
                {activeLinks.map((link) => (
                  <a
                    key={link.affiliate_link_id}
                    href={link.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="border rounded-lg p-4 text-center min-w-[140px] hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <p className="font-semibold text-sm mb-1">
                      {platformLabel(link.platform)}
                    </p>
                    {link.price_snapshot ? (
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(link.price_snapshot)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Fiyat bilgisi yok</p>
                    )}
                    <p className="text-xs text-primary mt-1">Satın Al &rarr;</p>
                  </a>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Bağımsız platformuz, komisyon alınan linkler içerebilir.
              </p>
            </div>
          </section>
        )}

        {/* Compare CTA */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            Bu ürünü başka bir ürünle karşılaştırmak ister misin?
          </p>
          <Link
            href="/ara"
            className="border border-primary text-primary px-6 py-2.5 rounded-lg hover:bg-primary/5 transition-colors text-sm font-semibold"
          >
            Ürünleri Karşılaştır
          </Link>
        </div>
      </article>
    </>
  );
}
