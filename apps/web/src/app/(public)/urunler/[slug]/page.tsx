import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { apiFetch, SITE_URL } from '@/lib/api';
import FavoriteButton from '@/components/public/FavoriteButton';
import ShareButton from '@/components/public/ShareButton';
import PriceChart from '@/components/public/PriceChart';
import ReviewsBlock from '@/components/public/ReviewsBlock';
import RecentlyViewed from '@/components/public/RecentlyViewed';
import ProductViewTracker from './ProductViewTracker';
import AffiliateLink from '@/components/public/AffiliateLink';
import PriceAlertButton from '@/components/public/PriceAlertButton';
import { TitckBadge } from '@/components/public/TitckBadge';
import { CrossSellBlock } from '@/components/public/CrossSellBlock';
import { AllergyAlertBanner } from '@/components/public/AllergyAlertBanner';
import ScoreBadge from '@/components/public/ScoreBadge';
import { PLATFORM_INFO, platformLabel as sharedPlatformLabel } from '@/lib/platforms';
import AccordionSection from '@/components/public/AccordionSection';
import PersonalScoreInline from '@/components/public/PersonalScoreInline';

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
  titck_status?: 'not_checked' | 'verified' | 'not_found' | 'expired' | 'banned';
  titck_notification_no?: string | null;
}

// === Data fetching ===

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/slug/${slug}`, {
      next: { revalidate: 300 },
    } as any);
  } catch {
    return null;
  }
}

interface IngredientInteraction {
  interaction_id: number;
  severity: string;
  description: string;
  recommendation: string;
  ingredient_a: { inci_name: string; ingredient_slug: string };
  ingredient_b: { inci_name: string; ingredient_slug: string };
}

type ReviewsAggregate = {
  product_id: number;
  rating_value: number | null;
  review_count: number;
  rating_distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
};

async function getReviewsAggregate(productId: number): Promise<ReviewsAggregate | null> {
  try {
    return await apiFetch<ReviewsAggregate>(`/products/${productId}/reviews/aggregate`, {
      next: { revalidate: 120 },
    } as any);
  } catch {
    return null;
  }
}

async function getIngredientInteractions(ingredientIds: number[]): Promise<IngredientInteraction[]> {
  if (ingredientIds.length === 0) return [];
  try {
    const results: IngredientInteraction[] = [];
    // Fetch interactions for each key ingredient (max 5 to avoid too many requests)
    const idsToCheck = ingredientIds.slice(0, 5);
    for (const id of idsToCheck) {
      const data = await apiFetch<IngredientInteraction[]>(
        `/interactions/by-ingredient/${id}`,
        { next: { revalidate: 300 } } as any,
      );
      if (data?.length) results.push(...data);
    }
    // Deduplicate by interaction_id
    const seen = new Set<number>();
    return results.filter((r) => {
      if (seen.has(r.interaction_id)) return false;
      seen.add(r.interaction_id);
      return true;
    });
  } catch {
    return [];
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

function getLowScoreExplanation(product: Product, avgScore: number): string[] {
  const reasons: string[] = [];
  const needScores = product.need_scores || [];

  // Düşük skorlu ihtiyaçları bul
  const lowNeeds = needScores
    .filter(ns => Number(ns.compatibility_score) < 50)
    .map(ns => ns.need?.need_name || '');
  if (lowNeeds.length > 0)
    reasons.push(`${lowNeeds.join(', ')} ihtiyaçlarında düşük uyumluluk gösteriyor.`);

  // Aktif madde azlığı
  const keyIngredients = (product.ingredients || [])
    .filter(i => i.inci_order_rank <= 5 && !i.is_below_one_percent_estimate);
  if (keyIngredients.length < 3)
    reasons.push('Formülde yeterli sayıda aktif madde tespit edilemedi.');

  // Tartışmalı maddeler
  const questionable = (product.ingredients || [])
    .filter(i => i.ingredient?.fragrance_flag || i.ingredient?.allergen_flag);
  if (questionable.length > 0)
    reasons.push(`${questionable.length} adet alerjen/parfüm bileşeni içeriyor.`);

  // Genel düşük ortalamalı need'ler
  const mediumNeeds = needScores
    .filter(ns => Number(ns.compatibility_score) >= 50 && Number(ns.compatibility_score) < 70);
  if (mediumNeeds.length > 2)
    reasons.push('Birden fazla kategoride orta seviye uyumluluk gösteriyor.');

  if (reasons.length === 0)
    reasons.push('Bu ürünün genel uyum skoru, ihtiyaç bazlı skorların ortalamasına göre hesaplanmıştır.');

  return reasons;
}

function platformLabel(platform: string): string {
  if (platform === 'other') return 'Diğer';
  return sharedPlatformLabel(platform);
}

// INCI order fallback — DB'de concentration_band 'unknown' veya boşsa,
// INCI sırasına göre tahmini bant döndürür. Legend zaten "(INCI sırasına göre tahmini)" diyor.
function bandFromInciRank(rank: number): 'high' | 'medium' | 'low' | 'trace' {
  if (rank <= 3) return 'high';
  if (rank <= 8) return 'medium';
  if (rank <= 20) return 'low';
  return 'trace';
}

function effectiveBand(band: string | null | undefined, rank: number): string {
  if (band && band !== 'unknown') return band;
  return bandFromInciRank(rank);
}

function concentrationLabel(band: string): { label: string; color: string; tooltip: string } {
  const map: Record<string, { label: string; color: string; tooltip: string }> = {
    very_high: {
      label: 'Çok Yüksek',
      color: 'bg-score-high-bg text-score-high',
      tooltip: 'Çok yüksek (tahmini %10+): INCI listesinin ilk sıralarında, formülün büyük bölümünü oluşturur.',
    },
    high: {
      label: 'Yüksek',
      color: 'bg-score-high-bg/50 text-score-high',
      tooltip: 'Yüksek (tahmini %5-10): Formülde ana bileşenlerden biri, INCI sırasında üst sıralarda.',
    },
    medium: {
      label: 'Orta',
      color: 'bg-score-medium-bg text-score-medium',
      tooltip: 'Orta (tahmini %1-5): Orta sıralarda; aktif içerik olarak anlamlı düzeyde.',
    },
    low: {
      label: 'Düşük',
      color: 'bg-surface-container text-on-surface-variant',
      tooltip: 'Düşük (tahmini %0.1-1): Alt sıralarda; destek veya yardımcı bileşen.',
    },
    trace: {
      label: 'Eser',
      color: 'bg-surface-container text-outline',
      tooltip: 'Eser (tahmini <%0.1): INCI listesinin sonunda; çoğunlukla koku, koruyucu veya katkı.',
    },
  };
  return map[band] || { label: band, color: 'text-outline', tooltip: 'Konsantrasyon bilinmiyor' };
}

function formatPrice(price: number | null): string {
  if (!price) return '';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);
}

// === JSON-LD ===

function productJsonLd(product: Product, reviewsAgg: ReviewsAggregate | null) {
  const imageUrl = product.images?.[0]?.image_url;

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
    ...(reviewsAgg && reviewsAgg.review_count > 0 && reviewsAgg.rating_value != null
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewsAgg.rating_value.toFixed(1),
            bestRating: '5',
            worstRating: '1',
            reviewCount: reviewsAgg.review_count,
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

// === Similar products ===

interface SimilarProductResult {
  product: {
    product_id: number;
    product_name: string;
    product_slug: string;
    domain_type: string;
    brand_name: string;
    brand_slug: string;
    image_url: string | null;
    price: number | null;
  };
  similarity_score: number;
  shared_ingredients: string[];
  shared_needs: string[];
  price_comparison: 'cheaper' | 'similar' | 'expensive' | null;
}

async function getSimilarProducts(productId: number): Promise<SimilarProductResult[]> {
  try {
    return await apiFetch<SimilarProductResult[]>(
      `/products/${productId}/similar?limit=4`,
      { next: { revalidate: 300 } } as any,
    );
  } catch {
    return [];
  }
}

// === Page ===

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const keyIngredientIds = (product.ingredients || [])
    .filter((pi: any) => pi.is_key_ingredient || pi.inci_order_rank <= 5)
    .map((pi: any) => pi.ingredient_id)
    .filter(Boolean);

  // Fetch supplement cross-references for highlighted/top ingredients
  const topIngredientIds = (product.ingredients || [])
    .filter((pi) => pi.ingredient_id && (pi.inci_order_rank <= 3))
    .map((pi) => pi.ingredient_id!)
    .slice(0, 5);

  const [similarProducts, interactions, cosmeticScore, supplementCrossRefs, reviewsAgg] = await Promise.all([
    getSimilarProducts(product.product_id),
    getIngredientInteractions(keyIngredientIds),
    apiFetch<any>(`/products/${product.product_id}/cosmetic-score`, { next: { revalidate: 300 } } as any).catch(() => null),
    Promise.all(
      topIngredientIds.map(async (id) => {
        try {
          return await apiFetch<Array<{ product_id: number; product_name: string; product_slug: string; brand?: { brand_name: string }; images?: { image_url: string }[] }>>(
            `/products/by-ingredient/${id}?domain_type=supplement&limit=3`,
            { next: { revalidate: 300 } } as any,
          );
        } catch { return []; }
      }),
    ),
    getReviewsAggregate(product.product_id),
  ]);

  // Deduplicate supplement products
  const supplementMap = new Map<number, { product_id: number; product_name: string; product_slug: string; brand?: { brand_name: string }; images?: { image_url: string }[] }>();
  supplementCrossRefs.flat().forEach((p) => {
    if (!supplementMap.has(p.product_id)) supplementMap.set(p.product_id, p);
  });
  const supplementProducts = Array.from(supplementMap.values()).slice(0, 6);

  // Filter interactions to only those where BOTH ingredients are in this product
  const productIngredientIds = new Set(
    (product.ingredients || []).map((pi) => pi.ingredient_id).filter(Boolean),
  );
  const relevantInteractions = interactions.filter(
    (inter) =>
      inter.severity !== 'none' &&
      // At least one ingredient is in this product — show as educational info
      (productIngredientIds.has((inter.ingredient_a as any)?.ingredient_id) ||
       productIngredientIds.has((inter.ingredient_b as any)?.ingredient_id)),
  );

  const rawImageUrl = product.images?.[0]?.image_url;
  const imageUrl = rawImageUrl?.includes('placehold.co') || rawImageUrl?.includes('dicebear') ? undefined : rawImageUrl;
  const sortedIngredients = [...(product.ingredients || [])].sort(
    (a, b) => a.inci_order_rank - b.inci_order_rank,
  );
  const SEARCH_ONLY_PLATFORMS = new Set(['watsons', 'rossmann']);
  const allActiveLinks = (product.affiliate_links || []).filter((l) => l.is_active);
  const activeLinks = allActiveLinks.filter((l) => !SEARCH_ONLY_PLATFORMS.has(l.platform));
  const searchOnlyLinks = allActiveLinks.filter((l) => SEARCH_ONLY_PLATFORMS.has(l.platform));
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, reviewsAgg)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Ürünler', item: `${SITE_URL}/urunler` },
              ...(product.category
                ? [{ '@type': 'ListItem', position: 3, name: product.category.category_name }]
                : []),
              { '@type': 'ListItem', position: product.category ? 4 : 3, name: product.product_name },
            ],
          }),
        }}
      />

      <ProductViewTracker
        product_id={product.product_id}
        product_name={product.product_name}
        product_slug={product.product_slug}
        brand_name={product.brand?.brand_name}
        brand_id={product.brand?.brand_id}
        image_url={imageUrl}
      />

      <article className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12">
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
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                <FavoriteButton
                  product_id={product.product_id}
                  product_name={product.product_name}
                  product_slug={product.product_slug}
                  brand_name={product.brand?.brand_name}
                  image_url={imageUrl}
                />
                <ShareButton
                  title={product.product_name}
                  text={`${product.product_name}${product.brand?.brand_name ? ' · ' + product.brand.brand_name : ''} — REVELA'da incele`}
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

            {product.titck_status && product.titck_status !== 'not_checked' && (
              <div className="mb-3">
                <TitckBadge status={product.titck_status} notificationNo={product.titck_notification_no} />
              </div>
            )}

            <AllergyAlertBanner productId={product.product_id} ingredients={product.ingredients} />

            {/* Meta badges — clickable filter links */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.category && (
                <Link href={`/urunler?category=${product.category.category_slug || ''}`} className="label-caps bg-surface-container px-3 py-1.5 rounded-md text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors">
                  {product.category.category_name}
                </Link>
              )}
              {product.product_type_label && (
                <Link href={`/urunler?type=${product.product_type_label}`} className="label-caps bg-surface-container px-3 py-1.5 rounded-md text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors">
                  {product.product_type_label}
                </Link>
              )}
              {product.target_area && (
                <Link href={`/urunler?area=${product.target_area}`} className="label-caps bg-tertiary-container px-3 py-1.5 rounded-md text-on-tertiary-container hover:opacity-80 transition-colors">
                  {product.target_area === 'yüz' ? 'Yüz' : product.target_area === 'vücut' ? 'Vücut' : product.target_area === 'saç' ? 'Saç' : product.target_area === 'göz' ? 'Göz Çevresi' : product.target_area === 'dudak' ? 'Dudak' : product.target_area}
                </Link>
              )}
              {product.usage_time_hint && (
                <span className="label-caps bg-surface-container px-3 py-1.5 rounded-md text-on-surface-variant">
                  {product.usage_time_hint === 'sabah' ? 'Sabah' : product.usage_time_hint === 'aksam' ? 'Akşam' : product.usage_time_hint === 'sabah_aksam' ? 'Sabah & Akşam' : product.usage_time_hint}
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

            {/* Low Score Explanation */}
            {avgScore !== null && avgScore < 70 && (
              <div className="rounded-md border border-score-medium-border bg-score-medium-bg p-5 mb-6">
                <div className="flex items-start gap-3">
                  <span className="material-icon text-score-medium text-[20px] mt-0.5" aria-hidden="true">info</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface mb-2">Neden bu skoru aldı?</p>
                    <ul className="space-y-1.5">
                      {getLowScoreExplanation(product, avgScore).map((reason, i) => (
                        <li key={i} className="text-xs text-on-surface-variant flex items-start gap-2">
                          <span className="text-score-medium mt-0.5">&bull;</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Score — inline (Sprint 6 hotfix): localStorage'daki profili
                client-side okuyup ürünün need_scores'undan kişisel skor hesaplar.
                Profil yoksa CTA gösterir. */}
            <PersonalScoreInline
              needScores={(product.need_scores || []).map((ns) => ({
                need_id: ns.need_id,
                need: ns.need,
                compatibility_score: Number(ns.compatibility_score),
              }))}
              hasAllergens={(product.ingredients || []).some((i) => i.ingredient?.allergen_flag)}
              hasFragrance={(product.ingredients || []).some((i) => i.ingredient?.fragrance_flag)}
              variant="cosmetic"
            />
          </div>
        </div>

        {/* Need Scores — 3-col grid, minimal cards */}
        {product.need_scores && product.need_scores.length > 0 && (
          <section className="mb-10" data-analytics-section="scores">
            <h2 className="text-xl font-bold tracking-tight mb-2 text-on-surface">Uyumluluk Skorları</h2>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              <span className="font-medium text-score-high">%70+</span> yüksek,
              <span className="font-medium text-score-medium"> %40-69</span> orta,
              <span className="font-medium text-score-low"> %40 altı</span> düşük uyum.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {product.need_scores.map((ns) => {
                const score = Math.round(Number(ns.compatibility_score));
                return (
                  <div
                    key={ns.product_need_score_id}
                    className="curator-card p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-on-surface truncate">
                        {ns.need ? (
                          <Link href={`/ihtiyaclar/${ns.need.need_slug}`} className="hover:text-primary transition-colors">
                            {ns.need.need_name}
                          </Link>
                        ) : (
                          `İhtiyaç #${ns.need_id}`
                        )}
                      </p>
                      <span className={`text-sm font-bold shrink-0 ${getScoreColor(score)}`}>
                        %{score}
                      </span>
                    </div>
                    <div className="mt-2 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBarColor(score)}`}
                        style={{ width: getScoreBarWidth(score) }}
                      />
                    </div>
                    {ns.score_reason_summary && (
                      <p className="text-[9px] text-outline mt-1 line-clamp-2">{ns.score_reason_summary}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Safety Score — Evidence-Based (cosmetic-v1) */}
        {sortedIngredients.length > 0 && (() => {
          // Fallback inline calc — API skoru varsa o kullanılır
          const allergenCount = sortedIngredients.filter(pi => pi.ingredient?.allergen_flag).length;
          const fragranceCount = sortedIngredients.filter(pi => pi.ingredient?.fragrance_flag).length;
          const totalCount = sortedIngredients.length;
          const flaggedCount = allergenCount + fragranceCount;
          const cleanPct = totalCount > 0 ? Math.round(((totalCount - flaggedCount) / totalCount) * 100) : 100;

          // Use pre-fetched cosmetic score if available
          const score = cosmeticScore ?? {
            overall_score: Math.max(0, Math.min(100, 100 - allergenCount * 12 - fragranceCount * 5)),
            grade: '',
            breakdown: null as any,
            explanation: [] as any[],
            flags: { allergens: [] as string[], fragrances: [] as string[], harmful: [] as string[], cmr: [] as string[], endocrine: [] as string[], eu_banned: [] as string[] },
          };
          const safetyScore = score.overall_score;
          const grade = score.grade || (safetyScore >= 85 ? 'A' : safetyScore >= 70 ? 'B' : safetyScore >= 55 ? 'C' : safetyScore >= 40 ? 'D' : 'F');
          const gradeColor = safetyScore >= 70 ? 'text-score-high' : safetyScore >= 55 ? 'text-score-medium' : 'text-score-low';
          const gradeLabel = ({ A: 'Çok Güvenli', B: 'Güvenli', C: 'Orta', D: 'Dikkatli Ol', F: 'Riskli' } as Record<string, string>)[grade] || 'Bilinmiyor';

          const highlights: string[] = [];
          if (allergenCount === 0) highlights.push('Alerjen içermiyor');
          if (fragranceCount === 0) highlights.push('Parfümsüz');

          const warnings: string[] = [];
          if ((score.flags?.eu_banned?.length ?? 0) > 0) warnings.push(`⚠ AB'de yasaklı: ${score.flags.eu_banned.join(', ')}`);
          if ((score.flags?.cmr?.length ?? 0) > 0) warnings.push(`CMR içerik: ${score.flags.cmr.join(', ')}`);
          if ((score.flags?.endocrine?.length ?? 0) > 0) warnings.push(`Endokrin bozucu: ${score.flags.endocrine.join(', ')}`);
          if (allergenCount > 0) warnings.push(`${allergenCount} alerjen içerik`);
          if (fragranceCount > 0) warnings.push(`${fragranceCount} parfüm/koku bileşeni`);

          const breakdownMeta: Record<string, { label: string; desc: string }> = {
            active_efficacy:    { label: 'Aktif Etkinlik',   desc: 'Etken maddenin kanıta dayalı etkisi (retinol/niasinamid gibi)' },
            safety_class:       { label: 'Güvenlik Sınıfı',  desc: 'CIR/SCCS sınıflandırması — CMR, endokrin, eu-banned flag yok' },
            concentration_fit:  { label: 'Konsantrasyon',    desc: 'Aktif madde efficacy eşiğinde konsantre mi' },
            interaction_safety: { label: 'Etkileşim',        desc: 'Bileşenler arası tahriş / etkisizleşme riski' },
            allergen_load:      { label: 'Alerjen Yükü',     desc: 'AB 26 alerjen parfüm + allergen-flag bileşen sayısı' },
            cmr_endocrine:      { label: 'CMR / Endokrin',   desc: 'Kanserojen / mutajen / endokrin bozucu flag yok' },
            transparency:       { label: 'Şeffaflık',        desc: 'INCI listesi açıklığı + konsantrasyon beyanı' },
          };

          return (
            <section className="mb-6" data-analytics-section="safety">
              <h2 className="text-lg font-bold tracking-tight mb-2 text-on-surface flex items-center gap-2">
                <span className="material-icon text-primary text-[18px]" aria-hidden="true">shield</span>
                REVELA Güvenlik Skoru
              </h2>
              <div className="curator-card p-3 md:p-4">
                <div className="flex items-start gap-3 md:gap-4 flex-col md:flex-row">
                  <ScoreBadge score={safetyScore} grade={grade as any} size="md" />
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-[11px] font-bold ${gradeColor}`}>Sınıf {grade}</span>
                      <span className="text-[10px] text-on-surface-variant">— {gradeLabel}</span>
                    </div>

                    {/* Breakdown bars */}
                    {score.breakdown && (
                      <div className="space-y-1 mb-2">
                        {Object.entries(score.breakdown).map(([key, val]) => {
                          const meta = breakdownMeta[key] || { label: key, desc: '' };
                          return (
                            <div key={key} className="flex items-center gap-2">
                              <span className="w-28 shrink-0 text-[11px] font-medium text-on-surface truncate">{meta.label}</span>
                              <div className="w-20 shrink-0 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${(val as number) >= 70 ? 'bg-score-high' : (val as number) >= 50 ? 'bg-score-medium' : 'bg-score-low'}`}
                                  style={{ width: `${val}%` }}
                                />
                              </div>
                              <span className="w-7 shrink-0 text-[11px] text-right font-semibold text-on-surface tabular-nums">{val as number}</span>
                              <span className="flex-1 min-w-0 text-[10px] text-outline truncate" title={meta.desc}>— {meta.desc}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Flags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {highlights.map((h) => (
                        <span key={h} className="inline-flex items-center gap-1 text-xs bg-score-high/10 text-score-high px-2 py-1 rounded-sm">
                          <span className="material-icon text-sm" aria-hidden="true">check_circle</span>
                          {h}
                        </span>
                      ))}
                      {warnings.map((w) => (
                        <span key={w} className="inline-flex items-center gap-1 text-xs bg-score-low/10 text-score-low px-2 py-1 rounded-sm">
                          <span className="material-icon text-sm" aria-hidden="true">warning</span>
                          {w}
                        </span>
                      ))}
                    </div>

                    {/* Explanation — "Bu puan neden?" */}
                    {score.explanation?.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline">
                          Bu puan neden?
                        </summary>
                        <ul className="mt-2 space-y-1.5">
                          {score.explanation.filter((e: any) => e.component !== 'floor_cap').map((e: any, i: number) => (
                            <li key={i} className="text-xs text-on-surface-variant leading-relaxed flex items-start gap-1.5">
                              <span className="material-icon text-sm text-outline mt-0.5 shrink-0" aria-hidden="true">
                                {e.delta >= 0 ? 'add_circle_outline' : 'remove_circle_outline'}
                              </span>
                              <span>
                                {e.reason}
                                {e.citation?.url && (
                                  <a href={e.citation.url} target="_blank" rel="noopener noreferrer" className="text-primary ml-1 hover:underline">
                                    <span className="material-icon text-[12px] align-middle" aria-hidden="true">open_in_new</span>
                                  </a>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/20">
                      <p className="text-xs text-on-surface-variant">
                        {totalCount} madde analiz edildi · %{cleanPct} temiz içerik
                      </p>
                      <Link href="/nasil-puanliyoruz#cosmetic" className="text-[10px] text-primary hover:underline">
                        Metodoloji
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* INCI Ingredients */}
        <section className="mb-16" data-analytics-section="inci">
          <h2 className="text-xl font-bold tracking-tight mb-3 text-on-surface">
            İçerik Listesi (INCI)
            {sortedIngredients.length > 0 && (
              <span className="text-sm font-normal text-outline ml-2">
                {sortedIngredients.length} madde
              </span>
            )}
          </h2>
          {sortedIngredients.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-on-surface-variant bg-surface-container-low border border-outline-variant/20 rounded-md px-3 py-2">
              <span className="label-caps text-outline">İçerik Yoğunluğu</span>
              <span className="inline-flex items-center gap-1">
                <span className="label-caps bg-score-high-bg text-score-high px-1.5 py-0.5 rounded-sm">Yüksek</span>
                <span>%5+</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="label-caps bg-score-medium-bg text-score-medium px-1.5 py-0.5 rounded-sm">Orta</span>
                <span>%1-5</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="label-caps bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded-sm">Düşük</span>
                <span>%0.1-1</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="label-caps bg-surface-container text-outline px-1.5 py-0.5 rounded-sm">Eser</span>
                <span>&lt;%0.1</span>
              </span>
              <span className="text-outline">(INCI sırasına göre tahmini)</span>
            </div>
          )}
          {sortedIngredients.length > 0 ? (
            // ListModal kaldırıldı: 17 madde tek seferde 4-col grid'de gösteriliyor.
            // Her kart bağımsız accordion, hepsi aynı anda açık kalabilir.
            // Üstteki güvenlik uyarılarındaki ingredient'lar (endokrin/CMR/EU yasaklı) burada
            // KIRMIZI BORDER + ⚠ ünlem ikonu ile flag'leniyor → görsel bağlantı.
            (() => {
              const flaggedNames = new Set<string>([
                ...(cosmeticScore?.flags?.eu_banned ?? []),
                ...(cosmeticScore?.flags?.cmr ?? []),
                ...(cosmeticScore?.flags?.endocrine ?? []),
              ].map((s: string) => s.toLowerCase()));

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {sortedIngredients.map((pi, idx) => {
                    const isAllergen = pi.ingredient?.allergen_flag;
                    const isFragrance = pi.ingredient?.fragrance_flag;
                    const displayName = pi.ingredient_display_name || '';
                    const isCritical =
                      flaggedNames.has(displayName.toLowerCase()) ||
                      (pi.ingredient?.inci_name && flaggedNames.has(pi.ingredient.inci_name.toLowerCase()));

                    // 3 uyarı seviyesi — her biri kendi border + ikon ile üstteki bayraklarla bağlantılı
                    let cardClass = '';
                    let warnIcon: { icon: string; color: string; tooltip: string } | null = null;
                    if (isCritical) {
                      cardClass = 'border-2 border-error bg-error/5';
                      warnIcon = { icon: 'warning', color: 'text-error', tooltip: 'Üstteki güvenlik uyarısı (endokrin/CMR/EU yasaklı)' };
                    } else if (isAllergen) {
                      cardClass = 'border border-error/40 bg-error/5';
                      warnIcon = { icon: 'error', color: 'text-error', tooltip: 'Alerjen — üstteki uyarıda sayılan içerik' };
                    } else if (isFragrance) {
                      cardClass = 'border border-score-medium/40 bg-score-medium/5';
                      warnIcon = { icon: 'spa', color: 'text-score-medium', tooltip: 'Parfüm/koku bileşeni — üstteki uyarıda sayılan içerik' };
                    }

                    const band = effectiveBand(pi.concentration_band, pi.inci_order_rank);
                    const conc = concentrationLabel(band);

                    return (
                      <details
                        key={pi.product_ingredient_id}
                        className={`group curator-card px-3 py-2 ${cardClass}`}
                      >
                        <summary className="flex items-center gap-1.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <span className="label-caps text-outline text-[9px] w-5 text-right shrink-0">
                            {idx + 1}
                          </span>
                          {warnIcon && (
                            <span
                              className={`material-icon shrink-0 ${warnIcon.color}`}
                              style={{ fontSize: '14px' }}
                              aria-hidden="true"
                              title={warnIcon.tooltip}
                            >
                              {warnIcon.icon}
                            </span>
                          )}
                          <span
                            className={`flex-1 min-w-0 text-xs font-medium leading-snug group-open:text-primary transition-colors line-clamp-2 ${
                              isCritical ? 'text-error font-semibold' : isAllergen ? 'text-error' : isFragrance ? 'text-score-medium' : 'text-on-surface'
                            }`}
                          >
                            {displayName}
                          </span>
                          <span
                            className={`label-caps text-[9px] px-1 py-0.5 rounded-sm shrink-0 ${conc.color}`}
                            title={conc.tooltip}
                          >
                            {conc.label}
                          </span>
                          <span
                            className="material-icon text-outline-variant group-open:rotate-180 transition-transform shrink-0"
                            style={{ fontSize: '14px' }}
                            aria-hidden="true"
                          >
                            expand_more
                          </span>
                        </summary>
                        <div className="mt-2 pt-2 border-t border-outline-variant/15">
                          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                            {isCritical && (
                              <span className="label-caps text-[9px] bg-error text-on-error px-1.5 py-0.5 rounded-sm font-bold">
                                UYARI
                              </span>
                            )}
                            {isAllergen && (
                              <span className="label-caps text-[9px] bg-error/10 text-error px-1.5 py-0.5 rounded-sm">Alerjen</span>
                            )}
                            {isFragrance && (
                              <span className="label-caps text-[9px] bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded-sm">Parfüm</span>
                            )}
                            {pi.is_below_one_percent_estimate && (
                              <span className="label-caps text-[9px] text-outline">(&lt;1%)</span>
                            )}
                          </div>
                          {pi.ingredient ? (
                            <>
                              {pi.ingredient.function_summary && (
                                <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-4">
                                  {pi.ingredient.function_summary}
                                </p>
                              )}
                              <Link
                                href={`/icerikler/${pi.ingredient.ingredient_slug}`}
                                className="inline-block mt-1.5 label-caps text-[9px] text-primary hover:underline underline-offset-4"
                              >
                                Detaylı bilgi &rarr;
                              </Link>
                            </>
                          ) : (
                            <p className="text-[11px] text-on-surface-variant">
                              İçerik detayları güncelleniyor.
                            </p>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </div>
              );
            })()
          ) : (
            <div className="bg-surface-container-low rounded-md p-8 text-on-surface-variant text-sm text-center">
              <span className="material-icon material-icon-lg text-outline-variant block mb-2" aria-hidden="true">science</span>
              INCI analizi henüz yapılmamış
            </div>
          )}
        </section>

        {/* Ingredient Interactions — accordion, 2-col, minimal */}
        {relevantInteractions.length > 0 && (
          <AccordionSection
            title="İçerik Etkileşimleri"
            icon="sync_alt"
            count={`${relevantInteractions.length} uyarı`}
            className="mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {relevantInteractions.slice(0, 6).map((inter) => {
                const severityConfig = inter.severity === 'severe'
                  ? { icon: 'block', color: 'border-error/30 bg-error/5', badge: 'bg-error/10 text-error', label: 'Kaçınılmalı' }
                  : inter.severity === 'moderate'
                  ? { icon: 'warning', color: 'border-score-medium-border bg-score-medium-bg/30', badge: 'bg-score-medium-bg text-score-medium', label: 'Dikkatli' }
                  : { icon: 'info', color: 'border-outline-variant/20 bg-surface-container-low', badge: 'bg-surface-container text-on-surface-variant', label: 'Bilgi' };
                return (
                  <details key={inter.interaction_id} className={`group rounded-sm border px-3 py-2 ${severityConfig.color}`}>
                    <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <span className="material-icon text-on-surface-variant shrink-0" style={{ fontSize: '14px' }} aria-hidden="true">{severityConfig.icon}</span>
                      <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="font-semibold text-on-surface truncate">
                          {inter.ingredient_a?.inci_name || '?'}
                        </span>
                        <span className="text-outline">+</span>
                        <span className="font-semibold text-on-surface truncate">
                          {inter.ingredient_b?.inci_name || '?'}
                        </span>
                        <span className={`label-caps px-1.5 py-0.5 rounded-sm text-[9px] ${severityConfig.badge}`}>
                          {severityConfig.label}
                        </span>
                      </div>
                      <span className="material-icon text-outline-variant group-open:rotate-180 transition-transform shrink-0" style={{ fontSize: '14px' }} aria-hidden="true">
                        expand_more
                      </span>
                    </summary>
                    <div className="mt-2 pt-2 border-t border-outline-variant/15">
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{inter.description}</p>
                      {inter.recommendation && (
                        <p className="text-[10px] text-primary mt-1 flex items-start gap-1">
                          <span className="material-icon text-[10px] mt-0.5 shrink-0" aria-hidden="true">lightbulb</span>
                          {inter.recommendation}
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </AccordionSection>
        )}

        {/* Label Info */}
        {product.label && (
          <section className="mb-16" data-analytics-section="claims">
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
        {activeLinks.length === 0 && (
          <section className="mb-10">
            <div className="curator-card p-8 text-center">
              <span className="material-icon text-outline-variant/40 mb-3 block" style={{ fontSize: '40px' }} aria-hidden="true">store</span>
              <p className="text-sm text-on-surface-variant font-medium">Bu ürün için satış linkleri doğrulanıyor...</p>
              <p className="text-xs text-outline mt-1.5">Yakında güncel satış noktaları burada listelenecek.</p>
            </div>
          </section>
        )}
        {activeLinks.length > 0 && (() => {
          const priced = activeLinks.filter((l) => l.price_snapshot && l.price_snapshot > 0);
          const prices = priced.map((l) => Number(l.price_snapshot));
          const minPrice = prices.length ? Math.min(...prices) : 0;
          const maxPrice = prices.length ? Math.max(...prices) : 0;
          const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
          const cheapest = priced.find((l) => Number(l.price_snapshot) === minPrice);
          const mostExpensive = priced.find((l) => Number(l.price_snapshot) === maxPrice);
          const sorted = [...activeLinks].sort((a, b) => {
            if (!a.price_snapshot) return 1;
            if (!b.price_snapshot) return -1;
            return Number(a.price_snapshot) - Number(b.price_snapshot);
          });

          return (
            <section className="mb-16" data-analytics-section="prices">
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
                    {mostExpensive && (
                      <div className="flex items-center justify-center mt-1.5">
                        {PLATFORM_INFO[mostExpensive.platform]?.logo ? (
                          <img src={PLATFORM_INFO[mostExpensive.platform].logo} alt={platformLabel(mostExpensive.platform)} className="h-5 w-auto rounded-sm" style={{ maxWidth: '60px' }} />
                        ) : (
                          <p className="label-caps text-score-low/60">{platformLabel(mostExpensive.platform)}</p>
                        )}
                      </div>
                    )}
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
                    <AffiliateLink
                      key={link.affiliate_link_id}
                      href={link.affiliate_url}
                      affiliateLinkId={link.affiliate_link_id}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors duration-300 border-l-4 ${isCheapest ? 'bg-score-high-bg/30' : ''}`}
                      style={pInfo ? { borderLeftColor: pInfo.color } : { borderLeftColor: 'transparent' }}
                      aria-label={`${platformLabel(link.platform)} sayfasında aç`}
                    >
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
                        {isCheapest && (
                          <span className="label-caps bg-score-high text-white px-2.5 py-1 rounded-md shrink-0">
                            EN UCUZ
                          </span>
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
                    </AffiliateLink>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-outline">
                  Bağımsız platformuz, komisyon alınan linkler içerebilir. Fiyatlar son güncelleme tarihine aittir.
                </p>
                <PriceAlertButton
                  productId={product.product_id}
                  productName={product.product_name}
                  productSlug={product.product_slug}
                  brandName={product.brand?.brand_name}
                  currentPrice={minPrice || undefined}
                />
              </div>
            </section>
          );
        })()}

        {/* Search-only platforms (Watsons, Rossmann) */}
        {searchOnlyLinks.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-bold tracking-tight mb-3 text-on-surface">Diğer Mağazalarda Ara</h2>
            <p className="text-xs text-outline mb-4">
              Bu mağazalarda doğrudan ürün linki henüz mevcut değil. Aşağıdaki butonlar mağaza içinde arama sonuçlarına yönlendirir.
            </p>
            <div className="flex flex-wrap gap-3">
              {searchOnlyLinks.map((link) => {
                const pInfo = PLATFORM_INFO[link.platform];
                const branded = !!pInfo;
                return (
                  <AffiliateLink
                    key={link.affiliate_link_id}
                    href={link.affiliate_url}
                    affiliateLinkId={link.affiliate_link_id}
                    className={
                      branded
                        ? 'flex items-center gap-2 px-5 py-3 rounded-md transition-all duration-300 hover:brightness-95 shadow-sm'
                        : 'flex items-center gap-2 px-5 py-3 rounded-md border border-outline-variant/30 hover:border-on-surface hover:bg-surface-container-low transition-all duration-300'
                    }
                    style={branded ? { backgroundColor: pInfo.color, color: pInfo.textColor } : undefined}
                    aria-label={`${platformLabel(link.platform)} mağazasında ara`}
                  >
                    {pInfo?.logo ? (
                      <img src={pInfo.logo} alt={pInfo.label} className="h-6 w-auto bg-white/90 rounded-sm px-1 py-0.5" style={{ maxWidth: '70px' }} />
                    ) : (
                      <span className="font-semibold text-on-surface">{platformLabel(link.platform)}</span>
                    )}
                    <span className="label-caps" style={branded ? { color: pInfo.textColor } : undefined}>Ara</span>
                    <span className="material-icon material-icon-sm" style={branded ? { color: pInfo.textColor } : undefined} aria-hidden="true">arrow_forward</span>
                  </AffiliateLink>
                );
              })}
            </div>
          </section>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-bold tracking-tight mb-2 text-on-surface flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">swap_horiz</span>
              Benzer Ürünler
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Kategori, aktif içerikler, ihtiyaç uyumu ve fiyat aralığı bazında hesaplanan benzerlik.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarProducts.map((sp) => {
                const spImg = sp.product.image_url?.includes('placehold.co') || sp.product.image_url?.includes('dicebear')
                  ? null : sp.product.image_url;
                const priceLabel = sp.price_comparison === 'cheaper'
                  ? 'Daha Uygun' : sp.price_comparison === 'expensive'
                  ? 'Daha Pahali' : sp.price_comparison === 'similar'
                  ? 'Benzer Fiyat' : null;
                const priceColor = sp.price_comparison === 'cheaper'
                  ? 'text-score-high bg-score-high-bg' : sp.price_comparison === 'expensive'
                  ? 'text-score-low bg-score-low-bg' : 'text-on-surface-variant bg-surface-container';
                return (
                  <Link
                    key={sp.product.product_id}
                    href={`/urunler/${sp.product.product_slug}`}
                    className="curator-card overflow-hidden group"
                  >
                    <div className="aspect-[4/3] bg-surface-container-low overflow-hidden relative">
                      {spImg ? (
                        <Image
                          src={spImg}
                          alt={sp.product.product_name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="material-icon text-outline-variant flex items-center justify-center h-full" style={{ fontSize: '48px' }} aria-hidden="true">inventory_2</span>
                      )}
                      {/* Similarity badge */}
                      <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm rounded-sm px-2 py-1">
                        <span className="text-xs font-bold text-primary">%{sp.similarity_score}</span>
                      </div>
                      {/* Price comparison badge */}
                      {priceLabel && (
                        <div className={`absolute bottom-2 left-2 rounded-sm px-2 py-0.5 ${priceColor}`}>
                          <span className="text-[10px] font-bold">{priceLabel}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="label-caps text-outline text-[9px]">{sp.product.brand_name}</p>
                      <p className="text-sm font-semibold text-on-surface line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                        {sp.product.product_name}
                      </p>
                      {/* Shared ingredients */}
                      {sp.shared_ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sp.shared_ingredients.slice(0, 3).map((ing) => (
                            <span key={ing} className="label-caps bg-primary/5 text-primary px-1.5 py-0.5 rounded-sm text-[9px]">
                              {ing}
                            </span>
                          ))}
                          {sp.shared_ingredients.length > 3 && (
                            <span className="label-caps text-outline text-[9px] px-1">+{sp.shared_ingredients.length - 3}</span>
                          )}
                        </div>
                      )}
                      {/* Shared needs */}
                      {sp.shared_needs.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {sp.shared_needs.slice(0, 2).map((need) => (
                            <span key={need} className="label-caps bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded-sm text-[9px]">
                              {need}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Price */}
                      {sp.product.price && (
                        <p className="text-sm font-bold text-on-surface mt-2">
                          {formatPrice(sp.product.price)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Cross-Reference: Supplement Products */}
        {supplementProducts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">medication</span>
              İçeriden de Destekle
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Bu üründeki aktif bileşenleri takviye olarak da alabilirsin.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {supplementProducts.map((sp) => (
                <Link
                  key={sp.product_id}
                  href={`/takviyeler/${sp.product_slug}`}
                  className="curator-card p-3 group hover:border-primary/30 transition-all"
                >
                  <div className="aspect-square bg-surface-container-low rounded-sm flex items-center justify-center mb-2 overflow-hidden">
                    {sp.images?.[0]?.image_url ? (
                      <Image
                        src={sp.images[0].image_url}
                        alt={sp.product_name}
                        width={100}
                        height={100}
                        className="object-contain w-full h-full p-2"
                        unoptimized
                      />
                    ) : (
                      <span className="material-icon text-outline-variant text-[36px]" aria-hidden="true">medication</span>
                    )}
                  </div>
                  {sp.brand && (
                    <p className="label-caps text-outline text-[8px]">{sp.brand.brand_name}</p>
                  )}
                  <p className="text-xs font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-0.5">
                    {sp.product_name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews (B.12) */}
        <ReviewsBlock productId={product.product_id} />

        {/* Cross-sell blocks */}
        <CrossSellBlock productId={product.product_id} mode="together" />
        <CrossSellBlock productId={product.product_id} mode="similar" />
        <CrossSellBlock productId={product.product_id} mode="same-brand" />

        {/* Recently Viewed */}
        <RecentlyViewed excludeProductId={product.product_id} />

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
