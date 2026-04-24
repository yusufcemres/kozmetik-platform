import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { apiFetch, API_BASE_URL } from '@/lib/api';
import { PLATFORM_INFO, platformLabel as sharedPlatformLabel } from '@/lib/platforms';
import ScoreBadge from '@/components/public/ScoreBadge';
import PriceChart from '@/components/public/PriceChart';
import ReviewsBlock from '@/components/public/ReviewsBlock';
import AccordionSection from '@/components/public/AccordionSection';

// === Types ===

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  short_description?: string;
  domain_type?: 'cosmetic' | 'supplement';
  brand?: { brand_name: string };
  category?: { category_name: string };
  images?: { image_url: string }[];
  affiliate_links?: {
    affiliate_link_id: number;
    platform: string;
    affiliate_url: string;
    price_snapshot: number | null;
    is_active: boolean;
  }[];
  need_scores?: {
    product_need_score_id: number;
    need_id: number;
    need?: { need_id: number; need_name: string; need_slug: string };
    compatibility_score: number | string;
    score_reason_summary?: string;
  }[];
}

interface FoodSource {
  food_name: string;
  amount_per_100g: number;
  unit: string;
  bioavailability?: string;
  note?: string;
}

interface NutritionFact {
  supplement_ingredient_id: number;
  amount_per_serving: number | null;
  unit: string | null;
  daily_value_percentage: number | null;
  is_proprietary_blend: boolean;
  sort_order: number;
  ingredient?: {
    ingredient_id: number;
    inci_name: string;
    ingredient_slug: string;
    common_name?: string;
    function_summary?: string;
    food_sources?: FoodSource[];
    daily_recommended_value?: number;
    daily_recommended_unit?: string;
  };
}

interface SupplementDetail {
  supplement_detail_id: number;
  product_id: number;
  form: string;
  serving_size?: number;
  serving_unit?: string;
  servings_per_container?: number;
  recommended_use?: string;
  warnings?: string;
  requires_prescription: boolean;
  manufacturer_country?: string;
  certification?: string;
  product?: Product;
  nutrition_facts?: NutritionFact[];
}

interface SupplementScore {
  product_id: number;
  algorithm_version: string;
  overall_score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    form_quality: number;
    dose_efficacy: number;
    evidence_grade: number;
    third_party_testing: number;
    interaction_safety: number;
    transparency_and_tier: number;
  };
  explanation: {
    component: string;
    value: number;
    delta: number;
    reason: string;
    citation?: { source: string; url?: string; pmid?: string; year?: number };
  }[];
  flags: { proprietary_blends: string[]; ul_exceeded: string[]; harmful_interactions: string[] };
  floor_cap_applied?: string;
  calculated_at: string;
}

interface Interaction {
  interaction_id: number;
  ingredient_a: { ingredient_id: number; inci_name: string; common_name?: string; ingredient_slug?: string };
  ingredient_b: { ingredient_id: number; inci_name: string; common_name?: string; ingredient_slug?: string };
  severity: string;
  description?: string;
  recommendation?: string;
  domain_type?: string;
}

// === Data ===

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/slug/${slug}`, {
      next: { revalidate: 300 },
    } as any);
  } catch {
    return null;
  }
}

async function getSupplementScore(productId: number): Promise<SupplementScore | null> {
  try {
    return await apiFetch<SupplementScore>(`/supplements/${productId}/score`, {
      next: { revalidate: 300 },
    });
  } catch {
    return null;
  }
}

async function getSupplementDetail(productId: number): Promise<SupplementDetail | null> {
  try {
    return await apiFetch<SupplementDetail>(`/supplements/${productId}`, {
      next: { revalidate: 300 },
    } as any);
  } catch {
    return null;
  }
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

async function getInteractionsByIngredient(ingredientId: number): Promise<Interaction[]> {
  try {
    return await apiFetch<Interaction[]>(`/interactions/by-ingredient/${ingredientId}`, {
      next: { revalidate: 300 },
    } as any);
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
  if (!product) return { title: 'Takviye Bulunamadı' };

  const title = product.brand
    ? `${product.brand.brand_name} ${product.product_name}`
    : product.product_name;
  const description =
    product.short_description ||
    `${title} takviye gıda — besin değerleri, içerikler, kullanım ve fiyat karşılaştırması.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | REVELA`,
      description,
      type: 'article',
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `/takviyeler/${product.product_slug}` },
  };
}

// === Helpers ===

function scoreColorClass(v: number): string {
  if (v >= 80) return 'border-green-500 text-green-600';
  if (v >= 60) return 'border-lime-500 text-lime-600';
  if (v >= 40) return 'border-amber-500 text-amber-600';
  return 'border-red-500 text-red-600';
}

function scoreBarColor(v: number): string {
  if (v >= 80) return 'bg-green-500';
  if (v >= 60) return 'bg-lime-500';
  if (v >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function formLabel(form: string): string {
  const map: Record<string, string> = {
    tablet: 'Tablet',
    capsule: 'Kapsül',
    softgel: 'Softgel',
    powder: 'Toz',
    liquid: 'Sıvı',
    gummy: 'Gummy',
    spray: 'Sprey',
    drop: 'Damla',
  };
  return map[form] || form;
}

function platformLabel(p: string): string {
  if (p === 'other') return 'Diğer';
  return sharedPlatformLabel(p);
}

function formatPrice(price: number | null): string {
  if (!price) return '';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}

// === JSON-LD ===

function supplementJsonLd(
  product: Product,
  detail: SupplementDetail | null,
  reviewsAgg: ReviewsAggregate | null,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.product_name,
    description: product.short_description || `${product.product_name} takviye gida.`,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand.brand_name } } : {}),
    ...(product.category ? { category: product.category.category_name } : {}),
    ...(product.images?.[0]?.image_url ? { image: product.images[0].image_url } : {}),
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
    ...(detail
      ? {
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Form', value: formLabel(detail.form) },
            ...(detail.servings_per_container
              ? [{ '@type': 'PropertyValue', name: 'Adet', value: String(detail.servings_per_container) }]
              : []),
          ],
        }
      : {}),
  };
}

// === Page ===

export default async function SupplementDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  // Domain guard: cosmetic products must render at /urunler/<slug>, not /takviyeler
  // Aksi halde takviye şablonu (nutrition facts, takviye skoru) kozmetik ürününde görünür
  if (product.domain_type === 'cosmetic') {
    redirect(`/urunler/${product.product_slug}`);
  }

  const [detail, score, reviewsAgg] = await Promise.all([
    getSupplementDetail(product.product_id),
    getSupplementScore(product.product_id),
    getReviewsAggregate(product.product_id),
  ]);
  const nutritionFacts = (detail?.nutrition_facts || []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const activeLinks = (product.affiliate_links || []).filter((l) => l.is_active);

  // Fetch interactions for all ingredients
  const ingredientIds = nutritionFacts
    .map((nf) => nf.ingredient?.ingredient_id)
    .filter((id): id is number => !!id);

  const allInteractions = await Promise.all(
    ingredientIds.map((id) => getInteractionsByIngredient(id)),
  );

  // Deduplicate interactions
  const interactionMap = new Map<number, Interaction>();
  allInteractions.flat().forEach((int) => {
    if (!interactionMap.has(int.interaction_id)) {
      interactionMap.set(int.interaction_id, int);
    }
  });
  const interactions = Array.from(interactionMap.values());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(supplementJsonLd(product, detail, reviewsAgg)) }}
      />

      <article className="curator-section max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="label-caps text-outline mb-8 flex items-center gap-2">
          <Link href="/takviyeler" className="hover:text-primary transition-colors">
            Takviyeler
          </Link>
          <span className="material-icon material-icon-sm" aria-hidden="true">chevron_right</span>
          <span className="text-on-surface-variant">{product.product_name}</span>
        </nav>

        {/* Header with Image */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Product Image */}
          <div className="w-full md:w-[300px] shrink-0">
            <div className="curator-card overflow-hidden aspect-square flex items-center justify-center bg-surface-container-low p-4">
              {product.images?.[0]?.image_url ? (
                <Image
                  src={product.images[0].image_url}
                  alt={product.product_name}
                  width={280}
                  height={280}
                  className="object-contain w-full h-full"
                  unoptimized
                />
              ) : (
                <span className="material-icon text-outline-variant" style={{ fontSize: '80px' }} aria-hidden="true">medication</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            {product.brand && (
              <p className="label-caps text-outline mb-1">
                {product.brand.brand_name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl headline-tight text-on-surface mb-3">
              {product.product_name}
            </h1>

            {product.short_description && (
              <p className="text-on-surface-variant leading-relaxed mb-4">
                {product.short_description}
              </p>
            )}

            {/* Quick price section */}
            {activeLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {activeLinks.map((link) => {
                  const pInfo = PLATFORM_INFO[link.platform];
                  const branded = !!pInfo;
                  return (
                    <a
                      key={link.affiliate_link_id}
                      href={`${API_BASE_URL}/r/${link.affiliate_link_id}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      aria-label={`${platformLabel(link.platform)}'de aç`}
                      className={
                        branded
                          ? 'inline-flex items-center gap-2 rounded-sm px-4 py-2.5 transition-all hover:brightness-95 shadow-sm'
                          : 'inline-flex items-center gap-2 border border-outline-variant/30 rounded-sm px-4 py-2.5 hover:border-primary hover:bg-primary/5 transition-all'
                      }
                      style={
                        branded
                          ? { backgroundColor: pInfo.color, color: pInfo.textColor }
                          : undefined
                      }
                    >
                      <span className="font-semibold text-sm">{platformLabel(link.platform)}</span>
                      {link.price_snapshot ? (
                        <span className="text-lg font-bold">{formatPrice(link.price_snapshot)}</span>
                      ) : (
                        <span className={branded ? 'text-sm opacity-80' : 'text-sm text-outline'}>
                          Fiyat bilgisi yok
                        </span>
                      )}
                      <span className="material-icon text-[16px]" aria-hidden="true">arrow_forward</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Price history chart (B.11) */}
        <section className="mb-8">
          <PriceChart productId={product.product_id} />
        </section>

        {/* Skor + Takviye Bilgileri (sol stack) | Uyumluluk Skorları (sağ accordion) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4 items-start">
        {/* SOL: Score + Takviye Bilgileri stacked */}
        <div className="space-y-3">
        {/* REVELA Supplement Skoru (v2 — Evidence-Based) */}
        {score && (
          <section className="curator-card p-3 md:p-4">
            <div className="flex items-start gap-3 md:gap-4 flex-col md:flex-row">
              <ScoreBadge score={score.overall_score} grade={score.grade} size="md" />
              <div className="flex-1 w-full">
                <h2 className="label-caps text-on-surface-variant tracking-[0.2em] mb-2 text-[10px]">REVELA Takviye Skoru</h2>
                <div className="space-y-1">
                  {[
                    { label: 'Form Kalitesi',   key: 'form_quality',         desc: 'Emilim kolaylığı ve biyoyararlanım (ör. sitrat > oksit)' },
                    { label: 'Doz Etkinliği',   key: 'dose_efficacy',        desc: 'Kanıta dayalı etkili doz aralığında mı' },
                    { label: 'Kanıt Seviyesi',  key: 'evidence_grade',       desc: 'Sistematik derleme / RCT / vaka-kontrol / uzman görüşü' },
                    { label: 'Bağımsız Test',   key: 'third_party_testing',  desc: 'USP / NSF / Labdoor gibi dış laboratuvar doğrulaması' },
                    { label: 'Etkileşim',       key: 'interaction_safety',   desc: 'Bileşenler arası zararlı etkileşim yok mu' },
                    { label: 'Şeffaflık + Tier',key: 'transparency_and_tier',desc: 'Marka şeffaflığı + üretim sınıfı (pharma > food-grade)' },
                  ].map((row) => {
                    const bd = score.breakdown as Record<string, number>;
                    const val = bd?.[row.key] ?? bd?.[row.key.replace(/_/g, '')] ?? 0;
                    return (
                      <div key={row.key} className="flex items-center gap-2">
                        <span className="w-28 shrink-0 text-[11px] font-medium text-on-surface truncate leading-tight">{row.label}</span>
                        <div className="w-20 shrink-0 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${val >= 70 ? 'bg-score-high' : val >= 50 ? 'bg-score-medium' : 'bg-score-low'}`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="w-7 shrink-0 text-[11px] text-right font-semibold text-on-surface tabular-nums">{val}</span>
                        <span className="flex-1 min-w-0 text-[10px] text-outline truncate leading-tight" title={row.desc}>— {row.desc}</span>
                      </div>
                    );
                  })}
                </div>

                {/* "Bu puan neden?" — Explanation with citations */}
                {score.explanation?.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-[10px] font-semibold text-primary cursor-pointer hover:underline">
                      Bu puan neden?
                    </summary>
                    <ul className="mt-1 space-y-0.5">
                      {score.explanation.filter((e: any) => e.component !== 'floor_cap').map((e: any, i: number) => (
                        <li key={i} className="text-[10px] text-on-surface-variant leading-snug flex items-start gap-1">
                          <span className="material-icon text-[10px] text-outline mt-0.5 shrink-0" aria-hidden="true">
                            {e.delta >= 0 ? 'add_circle_outline' : 'remove_circle_outline'}
                          </span>
                          <span>
                            {e.reason}
                            {e.citation?.url && (
                              <a href={e.citation.url} target="_blank" rel="noopener noreferrer" className="text-primary ml-1 hover:underline">
                                <span className="material-icon text-[10px] align-middle" aria-hidden="true">open_in_new</span>
                              </a>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* Floor cap warning */}
                {score.floor_cap_applied && (
                  <div className="mt-3 flex items-start gap-2 bg-error/5 text-error rounded-sm p-2">
                    <span className="material-icon text-sm mt-0.5 shrink-0" aria-hidden="true">warning</span>
                    <p className="text-[10px] leading-relaxed">
                      {score.explanation?.find((e: any) => e.component === 'floor_cap')?.reason || 'Güvenlik limiti uygulandı.'}
                    </p>
                  </div>
                )}

                <div className="flex justify-end mt-1.5">
                  <Link href="/nasil-puanliyoruz#supplement" className="text-[9px] text-primary hover:underline">
                    Metodoloji
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Takviye Bilgileri — sol stack içinde score altında */}
        {detail && (
          <section className="curator-card p-3 md:p-4">
            <h2 className="label-caps text-on-surface-variant tracking-[0.2em] mb-2 text-[10px]">Takviye Bilgileri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="label-caps text-outline text-[9px]">Form</span>
                <p className="font-semibold text-on-surface text-xs">{formLabel(detail.form)}</p>
              </div>
              <div>
                <span className="label-caps text-outline text-[9px]">Porsiyon</span>
                <p className="font-semibold text-on-surface text-xs">
                  {detail.serving_size
                    ? `${detail.serving_size} ${detail.serving_unit || ''}`
                    : '-'}
                </p>
              </div>
              <div>
                <span className="label-caps text-outline text-[9px]">Adet</span>
                <p className="font-semibold text-on-surface text-xs">
                  {detail.servings_per_container || '-'}
                </p>
              </div>
              <div>
                <span className="label-caps text-outline text-[9px]">Sertifika</span>
                <p className="font-semibold text-on-surface text-xs truncate">{detail.certification || '-'}</p>
              </div>
            </div>
            {detail.recommended_use && (
              <div className="mt-2 pt-2 border-t border-outline-variant/20">
                <span className="label-caps text-outline text-[9px]">Önerilen Kullanım</span>
                <p className="text-xs font-medium text-on-surface mt-0.5 leading-snug">
                  {detail.recommended_use}
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {detail.manufacturer_country && (
                <span className="label-caps text-outline text-[9px]">
                  Üretim: {detail.manufacturer_country}
                </span>
              )}
              {detail.requires_prescription && (
                <span className="label-caps text-error bg-error/10 px-2 py-0.5 rounded-sm text-[9px]">
                  Reçete gerektirebilir
                </span>
              )}
            </div>
          </section>
        )}
        </div>
        {/* /SOL stack */}

        {/* SAĞ: Uyumluluk Skorları — accordion, defaultOpen, sol stack yüksekliğine yakın */}
        {product.need_scores && product.need_scores.length > 0 && (
          <section className="curator-card p-3 md:p-4">
            <details open className="group">
              <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h2 className="label-caps text-on-surface-variant tracking-[0.2em] text-[10px] flex-1">Uyumluluk Skorları</h2>
                <p className="text-[9px] text-on-surface-variant leading-relaxed">
                  <span className="font-medium text-score-high">%70+</span> yüksek
                  <span className="font-medium text-score-medium"> · %40-69</span> orta
                  <span className="font-medium text-score-low"> · %40 altı</span> düşük
                </p>
                <span
                  className="material-icon text-outline-variant group-open:rotate-180 transition-transform shrink-0"
                  style={{ fontSize: '16px' }}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </summary>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
                {product.need_scores
                  .slice()
                  .sort((a, b) => Number(b.compatibility_score) - Number(a.compatibility_score))
                  .map((ns) => {
                    const score = Math.round(Number(ns.compatibility_score));
                    const colorClass = score >= 70 ? 'text-score-high' : score >= 40 ? 'text-score-medium' : 'text-score-low';
                    const barClass = score >= 70 ? 'bg-score-high' : score >= 40 ? 'bg-score-medium' : 'bg-score-low';
                    return (
                      <div key={ns.product_need_score_id} className="border border-outline-variant/15 rounded-sm p-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[10px] font-medium text-on-surface truncate flex-1 leading-tight" title={ns.need?.need_name}>
                            {ns.need ? (
                              <Link href={`/ihtiyaclar/${ns.need.need_slug}`} className="hover:text-primary transition-colors">
                                {ns.need.need_name}
                              </Link>
                            ) : (
                              `İhtiyaç #${ns.need_id}`
                            )}
                          </p>
                          <span className={`text-[10px] font-bold tabular-nums shrink-0 ${colorClass}`}>%{score}</span>
                        </div>
                        <div className="mt-1 h-1 bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </details>
          </section>
        )}
        </div>
        {/* /Skor+Info | Uyumluluk grid */}

        {/* Nutrition Facts — accordion, collapsed */}
        <AccordionSection
          title="Besin Değerleri (Nutrition Facts)"
          icon="science"
          count={nutritionFacts.length > 0 ? `${nutritionFacts.length} madde` : undefined}
          className="mb-4"
        >
          {nutritionFacts.length > 0 ? (
            <div className="curator-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="text-left px-4 py-3 label-caps text-on-surface-variant">İçerik</th>
                    <th className="text-right px-4 py-3 label-caps text-on-surface-variant">Miktar</th>
                    <th className="text-right px-4 py-3 label-caps text-on-surface-variant">% GRD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {nutritionFacts.map((nf) => (
                    <tr key={nf.supplement_ingredient_id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3">
                        {nf.ingredient ? (
                          <Link
                            href={`/icerikler/${nf.ingredient.ingredient_slug}`}
                            className="text-on-surface hover:text-primary font-medium transition-colors"
                          >
                            {nf.ingredient.common_name || nf.ingredient.inci_name}
                          </Link>
                        ) : (
                          <span className="text-on-surface">Bilinmeyen</span>
                        )}
                        {nf.is_proprietary_blend && (
                          <span className="label-caps ml-1.5 text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded-sm">
                            Özel Karışım
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-on-surface-variant">
                        {nf.amount_per_serving != null
                          ? `${Number.isInteger(Number(nf.amount_per_serving)) ? Math.round(Number(nf.amount_per_serving)) : Number(nf.amount_per_serving).toFixed(1)} ${nf.unit || ''}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {nf.daily_value_percentage != null ? (
                          <span
                            className={`font-semibold ${
                              nf.daily_value_percentage >= 100
                                ? 'text-score-high'
                                : nf.daily_value_percentage >= 50
                                  ? 'text-primary'
                                  : 'text-on-surface-variant'
                            }`}
                          >
                            %{Math.round(nf.daily_value_percentage)}
                          </span>
                        ) : (
                          <span className="text-outline">*</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 bg-surface-container-low label-caps text-outline">
                * GRD (Günlük Referans Değer) belirtilmemiş.
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-sm p-4 text-on-surface-variant text-xs">
              Besin bilgileri henüz eklenmemiş.
            </div>
          )}
        </AccordionSection>

        {/* Ingredient Functions — TÜM bileşenler, eksik açıklamada placeholder */}
        {nutritionFacts.some(nf => nf.ingredient) && (() => {
          const cards = nutritionFacts.filter(nf => nf.ingredient);
          const filledCount = cards.filter(nf => nf.ingredient?.function_summary).length;
          return (
            <AccordionSection
              title="Bu Bileşenler Ne İşe Yarar?"
              icon="biotech"
              count={`${filledCount}/${cards.length} bileşen`}
              className="mb-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {cards.map((nf) => {
                  const ing = nf.ingredient!;
                  const hasSummary = !!ing.function_summary;
                  return (
                    <Link
                      key={nf.supplement_ingredient_id}
                      href={`/icerikler/${ing.ingredient_slug}`}
                      className="curator-card p-3 group hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-icon text-primary text-[12px]" aria-hidden="true">biotech</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-on-surface group-hover:text-primary transition-colors">
                            {ing.common_name || ing.inci_name}
                          </p>
                          {hasSummary ? (
                            <p className="text-[10px] text-on-surface-variant leading-relaxed mt-0.5 line-clamp-3">
                              {ing.function_summary}
                            </p>
                          ) : (
                            <p className="text-[10px] text-outline italic mt-0.5">
                              Açıklama yakında eklenecek &mdash; detay için tıkla
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </AccordionSection>
          );
        })()}

        {/* Food Sources — TÜM bileşenler için kart, eksik veride placeholder */}
        {nutritionFacts.length > 0 && (() => {
          const ingredientCards = nutritionFacts.filter(nf => nf.ingredient);
          const filledCount = ingredientCards.filter(
            nf => nf.ingredient?.food_sources && nf.ingredient.food_sources.length > 0 && nf.ingredient.food_sources[0].amount_per_100g > 0,
          ).length;
          if (ingredientCards.length === 0) return null;

          return (
            <AccordionSection
              title="Bu Bileşenleri Hangi Gıdalarda Bulabilirsiniz?"
              icon="restaurant"
              count={`${filledCount}/${ingredientCards.length} bileşen`}
              className="mb-4"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1.5">
                {ingredientCards.map((nf) => {
                  const ing = nf.ingredient!;
                  const dose = Number(nf.amount_per_serving) || 0;
                  const doseUnit = nf.unit || '';
                  const allFoods = ing.food_sources || [];
                  const hasUsableFoods = allFoods.length > 0 && allFoods[0].amount_per_100g > 0;
                  const topFoods = allFoods.slice(0, 3);
                  const restFoods = allFoods.slice(3);
                  const renderFoodRow = (fs: FoodSource, i: number) => {
                    const neededGrams = dose > 0 && fs.amount_per_100g > 0
                      ? Math.round((dose / fs.amount_per_100g) * 100)
                      : null;
                    return (
                      <div key={i} className="flex items-baseline gap-1 py-0.5 text-[10px] leading-tight">
                        <span className="text-on-surface min-w-0 flex-1 break-words" title={fs.food_name}>{fs.food_name}</span>
                        {dose > 0 && neededGrams !== null && (
                          <span className={`tabular-nums font-semibold shrink-0 ml-auto pl-1 ${neededGrams <= 100 ? 'text-score-high' : neededGrams <= 300 ? 'text-primary' : 'text-on-surface-variant'}`}>
                            ~{neededGrams}g
                          </span>
                        )}
                      </div>
                    );
                  };
                  return (
                    <div key={nf.supplement_ingredient_id} className="curator-card p-1.5">
                      <h3 className="font-semibold text-on-surface text-[10px] truncate mb-1 pb-1 border-b border-outline-variant/15">
                        {ing.common_name || ing.inci_name}
                        {dose > 0 && <span className="text-outline font-normal ml-1 text-[9px]">({Number.isInteger(dose) ? dose : dose.toFixed(1)} {doseUnit})</span>}
                      </h3>
                      {hasUsableFoods ? (
                        <>
                          {topFoods.map(renderFoodRow)}
                          {restFoods.length > 0 && (
                            <details className="group/more mt-1">
                              <summary className="text-[9px] text-primary cursor-pointer hover:underline list-none [&::-webkit-details-marker]:hidden">
                                <span className="group-open/more:hidden">+{restFoods.length} gıda</span>
                                <span className="hidden group-open/more:inline">− gizle</span>
                              </summary>
                              <div className="mt-0.5">{restFoods.map(renderFoodRow)}</div>
                            </details>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1 py-0.5 text-[10px] text-outline">
                          <span className="material-icon text-[10px]" aria-hidden="true">hourglass_empty</span>
                          <span className="truncate">Veri yakında</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-outline mt-3 flex items-start gap-1">
                <span className="material-icon text-[12px] mt-0.5" aria-hidden="true">info</span>
                Gıdalardan alınan vitaminlerin biyoyararlanımı genellikle takviyelerden daha yüksektir.
              </p>
            </AccordionSection>
          );
        })()}

        {/* Ingredient Interactions — accordion, 2-col, minimal */}
        {interactions.length > 0 && (
          <AccordionSection
            title="Etkileşim Uyarıları"
            icon="sync_alt"
            count={`${interactions.length} uyarı`}
            className="mb-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
              {interactions.map((int) => {
                const severityConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
                  severe: { color: 'text-error', bg: 'bg-error/10 border-error/20', icon: 'error', label: 'Ciddi' },
                  contraindicated: { color: 'text-error', bg: 'bg-error/10 border-error/20', icon: 'dangerous', label: 'Kontrendike' },
                  moderate: { color: 'text-score-medium', bg: 'bg-score-medium/10 border-score-medium/20', icon: 'warning', label: 'Orta' },
                  mild: { color: 'text-primary', bg: 'bg-primary/5 border-primary/20', icon: 'info', label: 'Hafif' },
                  none: { color: 'text-score-high', bg: 'bg-score-high/10 border-score-high/20', icon: 'check_circle', label: 'Sinerjistik' },
                };
                const cfg = severityConfig[int.severity] || severityConfig.mild;
                return (
                  <details key={int.interaction_id} className={`group border rounded-sm px-2 py-1.5 ${cfg.bg}`}>
                    <summary className="flex items-center gap-1 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <span className={`material-icon ${cfg.color} text-[12px] shrink-0`} aria-hidden="true">{cfg.icon}</span>
                      <div className="flex-1 min-w-0 flex items-center gap-1 text-[10px]">
                        <span className="font-semibold text-on-surface truncate">
                          {int.ingredient_a.common_name || int.ingredient_a.inci_name}
                        </span>
                        <span className={`material-icon text-[10px] shrink-0 ${cfg.color}`} aria-hidden="true">sync_alt</span>
                        <span className="font-semibold text-on-surface truncate">
                          {int.ingredient_b.common_name || int.ingredient_b.inci_name}
                        </span>
                        <span className={`label-caps text-[8px] px-1 py-0 rounded-sm shrink-0 ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <span
                        className="material-icon text-outline-variant group-open:rotate-180 transition-transform shrink-0"
                        style={{ fontSize: '12px' }}
                        aria-hidden="true"
                      >
                        expand_more
                      </span>
                    </summary>
                    {(int.description || int.recommendation) && (
                      <div className="mt-1 pt-1 border-t border-outline-variant/15">
                        {int.description && (
                          <p className="text-[10px] text-on-surface-variant leading-snug">{int.description}</p>
                        )}
                        {int.recommendation && (
                          <p className="text-[9px] text-on-surface-variant mt-0.5 flex items-start gap-0.5">
                            <span className="material-icon text-[9px] mt-0.5 shrink-0" aria-hidden="true">lightbulb</span>
                            <span>{int.recommendation}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          </AccordionSection>
        )}

        {/* Warnings — accordion, kapalı */}
        {detail?.warnings && (
          <AccordionSection title="Uyarılar" icon="warning" className="mb-4">
            <div className="bg-tertiary-container border border-outline-variant/20 rounded-sm p-3">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {detail.warnings}
              </p>
            </div>
          </AccordionSection>
        )}

        {/* Reviews (B.12) */}
        <ReviewsBlock productId={product.product_id} />

        {/* Back */}
        <div className="border-t border-outline-variant/20 pt-8">
          <Link
            href="/takviyeler"
            className="label-caps text-primary hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">arrow_back</span>
            Tüm Takviyeler
          </Link>
        </div>
      </article>
    </>
  );
}
