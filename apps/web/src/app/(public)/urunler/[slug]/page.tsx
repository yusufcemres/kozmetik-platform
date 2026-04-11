import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import FavoriteButton from '@/components/public/FavoriteButton';
import PriceChart from '@/components/public/PriceChart';
import ListModal from '@/components/public/ListModal';
import RecentlyViewed from '@/components/public/RecentlyViewed';
import ProductViewTracker from './ProductViewTracker';
import AffiliateLink from '@/components/public/AffiliateLink';
import PriceAlertButton from '@/components/public/PriceAlertButton';

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

interface IngredientInteraction {
  interaction_id: number;
  severity: string;
  description: string;
  recommendation: string;
  ingredient_a: { inci_name: string; ingredient_slug: string };
  ingredient_b: { inci_name: string; ingredient_slug: string };
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
        { next: { revalidate: 3600 } } as any,
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
      { next: { revalidate: 3600 } } as any,
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

  const [similarProducts, interactions] = await Promise.all([
    getSimilarProducts(product.product_id),
    getIngredientInteractions(keyIngredientIds),
  ]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://kozmetik-platform.vercel.app' },
              { '@type': 'ListItem', position: 2, name: 'Ürünler', item: 'https://kozmetik-platform.vercel.app/urunler' },
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

      <article className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8 lg:py-12">
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
          <section className="mb-16" data-analytics-section="scores">
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

        {/* Safety Score */}
        {sortedIngredients.length > 0 && (() => {
          const allergenCount = sortedIngredients.filter(pi => pi.ingredient?.allergen_flag).length;
          const fragranceCount = sortedIngredients.filter(pi => pi.ingredient?.fragrance_flag).length;
          const totalCount = sortedIngredients.length;
          const flaggedCount = allergenCount + fragranceCount;
          const cleanPct = totalCount > 0 ? Math.round(((totalCount - flaggedCount) / totalCount) * 100) : 100;

          let safetyScore = 100;
          safetyScore -= allergenCount * 12;
          safetyScore -= fragranceCount * 5;
          safetyScore = Math.max(0, Math.min(100, safetyScore));

          const grade = safetyScore >= 85 ? 'A' : safetyScore >= 70 ? 'B' : safetyScore >= 50 ? 'C' : safetyScore >= 30 ? 'D' : 'F';
          const gradeColor = { A: 'text-score-high', B: 'text-score-high', C: 'text-score-medium', D: 'text-score-low', F: 'text-error' }[grade];
          const gradeLabel = { A: 'Cok Guvenli', B: 'Guvenli', C: 'Orta', D: 'Dikkatli Ol', F: 'Riskli' }[grade];
          const barColor = { A: 'bg-score-high', B: 'bg-score-high', C: 'bg-score-medium', D: 'bg-score-low', F: 'bg-error' }[grade];

          const highlights: string[] = [];
          if (allergenCount === 0) highlights.push('Alerjen icermiyor');
          if (fragranceCount === 0) highlights.push('Parfumsuz');

          const warnings: string[] = [];
          if (allergenCount > 0) warnings.push(`${allergenCount} alerjen icerik`);
          if (fragranceCount > 0) warnings.push(`${fragranceCount} parfum/koku bileseni`);

          return (
            <section className="mb-16" data-analytics-section="safety">
              <h2 className="text-xl font-bold tracking-tight mb-6 text-on-surface flex items-center gap-2">
                <span className="material-icon text-primary" aria-hidden="true">shield</span>
                Guvenlik Skoru
              </h2>
              <div className="curator-card p-6">
                <div className="flex items-center gap-6 mb-4">
                  <div className="text-center">
                    <div className={`text-4xl font-extrabold ${gradeColor}`}>{safetyScore}</div>
                    <div className="text-xs text-on-surface-variant">/100</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-bold ${gradeColor}`}>Sinif {grade}</span>
                      <span className="text-xs text-on-surface-variant">— {gradeLabel}</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${safetyScore}%` }} />
                    </div>
                  </div>
                </div>

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

                <p className="text-xs text-on-surface-variant">
                  {totalCount} madde analiz edildi · %{cleanPct} temiz icerik
                </p>
              </div>
            </section>
          );
        })()}

        {/* INCI Ingredients */}
        <section className="mb-16" data-analytics-section="inci">
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
              previewCount={5}
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
                  {sortedIngredients.slice(0, 5).map((pi, idx) => {
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
                            <span className="material-icon text-outline-variant group-open:rotate-180 transition-transform" style={{ fontSize: '16px' }} aria-hidden="true">
                              expand_more
                            </span>
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
                        <div className="ml-9 mt-2 bg-surface-container-low border-l-2 border-primary/30 rounded-r-md px-4 py-3 animate-[fadeIn_0.15s_ease-in]">
                          {pi.ingredient ? (
                            <>
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
                            </>
                          ) : (
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                              <span className="font-medium">{pi.ingredient_display_name}</span> — içerik detayları güncelleniyor.
                            </p>
                          )}
                        </div>
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

        {/* Ingredient Interactions */}
        {relevantInteractions.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-bold tracking-tight mb-2 text-on-surface flex items-center gap-2">
              <span className="material-icon text-score-medium" aria-hidden="true">sync_alt</span>
              Icerik Etkilesimleri
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Bu urundeki aktif maddelerin bilinen etkilesimleri.
            </p>
            <div className="space-y-3">
              {relevantInteractions.slice(0, 5).map((inter) => {
                const severityConfig = inter.severity === 'severe'
                  ? { icon: 'block', color: 'border-error/30 bg-error/5', badge: 'bg-error/10 text-error', label: 'Kacinilmali' }
                  : inter.severity === 'moderate'
                  ? { icon: 'warning', color: 'border-score-medium-border bg-score-medium-bg/30', badge: 'bg-score-medium-bg text-score-medium', label: 'Dikkatli Kullanin' }
                  : { icon: 'info', color: 'border-outline-variant/20 bg-surface-container-low', badge: 'bg-surface-container text-on-surface-variant', label: 'Bilgi' };
                return (
                  <div key={inter.interaction_id} className={`rounded-sm border p-4 ${severityConfig.color}`}>
                    <div className="flex items-start gap-3">
                      <span className="material-icon text-on-surface-variant mt-0.5" style={{ fontSize: '20px' }} aria-hidden="true">{severityConfig.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-on-surface">
                            {inter.ingredient_a?.inci_name || '?'}
                          </span>
                          <span className="text-xs text-outline">+</span>
                          <span className="text-sm font-semibold text-on-surface">
                            {inter.ingredient_b?.inci_name || '?'}
                          </span>
                          <span className={`label-caps px-1.5 py-0.5 rounded-sm ${severityConfig.badge}`}>
                            {severityConfig.label}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{inter.description}</p>
                        {inter.recommendation && (
                          <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
                            <span className="material-icon material-icon-sm" aria-hidden="true">lightbulb</span>
                            {inter.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
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
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors duration-300 ${isCheapest ? 'bg-score-high-bg/30' : ''}`}
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
