import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch, API_BASE_URL } from '@/lib/api';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
  domain_type?: string;
  short_description?: string;
}

interface ProductScore {
  product_need_score_id: number;
  compatibility_score: number;
  confidence_level: string;
  product?: {
    product_id: number;
    product_name: string;
    product_slug: string;
    product_type_label?: string;
    short_description?: string;
    brand?: { brand_name: string };
    images?: { image_url: string; sort_order?: number }[];
    affiliate_links?: {
      affiliate_link_id: number;
      platform: string;
      affiliate_url: string;
      price_snapshot?: number;
    }[];
    ingredients?: {
      is_key_ingredient: boolean;
      ingredient: { inci_name: string; common_name?: string };
    }[];
  };
}

// === SEO ===

export const metadata: Metadata = {
  title: 'Bu Haftanın Önerileri | REVELA',
  description:
    'AI destekli haftalık ürün önerileri. Her cilt ihtiyacı için en uygun, en kaliteli ve en uygun fiyatlı kozmetik ürünleri.',
  openGraph: {
    title: 'Bu Haftanın Önerileri | REVELA',
    description: 'Her cilt ihtiyacı için AI destekli haftalık ürün önerileri.',
    type: 'website',
  },
  alternates: { canonical: '/onerilerimiz' },
};

// === Data ===

async function getRecommendations(): Promise<{ need: Need; topProduct: ProductScore | null }[]> {
  try {
    const needsRes = await apiFetch<{ data: Need[] }>('/needs?limit=50', {
      next: { revalidate: 3600 },
    } as any);
    const needs = needsRes.data || [];

    const results = await Promise.all(
      needs.map(async (need) => {
        try {
          const dt = need.domain_type || 'cosmetic';
          const scores = await apiFetch<ProductScore[]>(
            `/scoring/needs/${need.need_id}/top-products?limit=1&domain_type=${dt}`,
            { next: { revalidate: 3600 } } as any,
          );
          return { need, topProduct: scores?.[0] || null };
        } catch {
          return { need, topProduct: null };
        }
      }),
    );

    return results.filter((r) => r.topProduct?.product);
  } catch {
    return [];
  }
}

// === Helpers ===

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-score-high';
  if (score >= 40) return 'text-score-medium';
  return 'text-score-low';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-score-high';
  if (score >= 40) return 'bg-score-medium';
  return 'bg-score-low';
}

function cheapestLink(links?: { affiliate_link_id: number; platform: string; affiliate_url: string; price_snapshot?: number }[]) {
  if (!links || links.length === 0) return null;
  const active = links.filter((l) => l.price_snapshot && l.price_snapshot > 0);
  if (active.length === 0) return links[0];
  return active.reduce((min, l) => (l.price_snapshot! < min.price_snapshot! ? l : min), active[0]);
}

const PLATFORM_LABELS: Record<string, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  amazon_tr: 'Amazon TR',
  gratis: 'Gratis',
  rossmann: 'Rossmann',
  watsons: 'Watsons',
  dermoeczanem: 'Dermoeczanem',
};

function buildReasonBullets(need: Need, topProduct: ProductScore): string[] {
  const bullets: string[] = [];
  const product = topProduct.product;
  if (!product) return bullets;

  const score = Math.round(Number(topProduct.compatibility_score));
  bullets.push(`${need.need_name} icin %${score} uyumluluk skoru`);

  // Key ingredients
  const keyIngs = product.ingredients
    ?.filter((i) => i.is_key_ingredient)
    .map((i) => i.ingredient?.common_name || i.ingredient?.inci_name)
    .filter(Boolean)
    .slice(0, 3);
  if (keyIngs && keyIngs.length > 0) {
    bullets.push(`Aktif maddeler: ${keyIngs.join(', ')}`);
  }

  // Price
  const link = cheapestLink(product.affiliate_links);
  if (link?.price_snapshot) {
    bullets.push(`${PLATFORM_LABELS[link.platform] || link.platform} üzerinde ₺${Number(link.price_snapshot).toFixed(0)}`);
  }

  // Product type
  if (product.product_type_label) {
    bullets.push(`Ürün tipi: ${product.product_type_label}`);
  }

  return bullets;
}

// === JSON-LD ===

function recommendationsJsonLd(
  recommendations: { need: Need; topProduct: ProductScore | null }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'REVELA Haftalık Ürün Önerileri',
    description: 'AI destekli kozmetik ürün önerileri',
    numberOfItems: recommendations.length,
    itemListElement: recommendations.map((r, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: r.topProduct?.product?.product_name || '',
      url: `/urunler/${r.topProduct?.product?.product_slug || ''}`,
    })),
  };
}

// === Page ===

export default async function RecommendationsPage() {
  const recommendations = await getRecommendations();
  const cosmeticRecs = recommendations.filter((r) => r.need.domain_type !== 'supplement');
  const supplementRecs = recommendations.filter((r) => r.need.domain_type === 'supplement');

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekLabel = monday.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recommendationsJsonLd(recommendations)),
        }}
      />

      <div className="curator-section max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
            <span className="material-icon material-icon-sm" aria-hidden="true">auto_awesome</span>
            AI Destekli
          </div>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">
            BU HAFTANIN ONERILERI
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 max-w-lg mx-auto">
            Guc seninle olsun. Ve dogru serum da. Her ihtiyac icin icerik kalitesi, fiyat performansi ve bilimsel kanita gore sectik.
          </p>
          <p className="label-caps text-outline mt-4">
            <span className="material-icon material-icon-sm align-text-bottom mr-1" aria-hidden="true">update</span>
            {weekLabel} Haftasi
          </p>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">recommend</span>
            <p className="text-on-surface-variant">Öneriler hesaplanıyor, birazdan burada olacak.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12">
          {/* Kozmetik Önerileri */}
          {cosmeticRecs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icon text-primary text-[28px]" aria-hidden="true">spa</span>
                <h2 className="text-2xl font-bold text-on-surface tracking-tight">Kozmetik Önerileri</h2>
                <span className="label-caps text-outline">({cosmeticRecs.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cosmeticRecs.map(({ need, topProduct }, idx) => {
              if (!topProduct?.product) return null;
              const product = topProduct.product;
              const score = Math.round(Number(topProduct.compatibility_score));
              const rawImg =
                product.images?.find((i) => i.sort_order === 0)?.image_url ||
                product.images?.[0]?.image_url;
              const img = rawImg?.includes('placehold.co') || rawImg?.includes('dicebear') ? undefined : rawImg;
              const link = cheapestLink(product.affiliate_links);
              const reasons = buildReasonBullets(need, topProduct);

              return (
                <div key={need.need_id} className="curator-card overflow-hidden group">
                  {/* Image */}
                  <Link href={`/urunler/${product.product_slug}`} className="block">
                    <div className="aspect-[4/3] bg-surface-container-low overflow-hidden relative">
                      {img ? (
                        <Image
                          src={img}
                          alt={product.product_name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="material-icon text-outline-variant flex items-center justify-center h-full" style={{ fontSize: '64px' }} aria-hidden="true">inventory_2</span>
                      )}
                      {/* Rank badge */}
                      <span className="absolute top-3 left-3 bg-on-surface text-surface w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      {/* Need badge */}
                      <span className="absolute top-3 right-3 bg-primary/90 text-on-primary px-3 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm">
                        {need.need_name}
                      </span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    {product.brand && (
                      <p className="label-caps text-outline mb-0.5">{product.brand.brand_name}</p>
                    )}
                    <Link href={`/urunler/${product.product_slug}`}>
                      <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                        {product.product_name}
                      </h3>
                    </Link>

                    {/* Score bar */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="label-caps text-outline shrink-0">{need.need_name}</span>
                      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
                          style={{ width: `${Math.min(100, score)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>%{score}</span>
                    </div>

                    {/* Why this product */}
                    {reasons.length > 0 && (
                      <div className="mt-4 bg-surface-container-low rounded-sm p-4">
                        <p className="label-caps text-primary mb-2 flex items-center gap-1.5">
                          <span className="material-icon text-[14px]" aria-hidden="true">lightbulb</span>
                          Neden bu urun?
                        </p>
                        <ul className="space-y-1">
                          {reasons.map((r, i) => (
                            <li key={i} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        href={`/urunler/${product.product_slug}`}
                        className="flex-1 curator-btn-outline text-[10px] py-2.5 text-center"
                      >
                        Detaylar
                      </Link>
                      {link && (
                        <a
                          href={link.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          className="flex-1 curator-btn-primary text-[10px] py-2.5 text-center flex items-center justify-center gap-1.5"
                        >
                          <span className="material-icon text-[14px]" aria-hidden="true">shopping_bag</span>
                          {link.price_snapshot
                            ? `₺${Number(link.price_snapshot).toFixed(0)} — ${PLATFORM_LABELS[link.platform] || 'Satin Al'}`
                            : PLATFORM_LABELS[link.platform] || 'Satin Al'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          )}

          {/* Takviye Önerileri */}
          {supplementRecs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icon text-primary text-[28px]" aria-hidden="true">medication</span>
                <h2 className="text-2xl font-bold text-on-surface tracking-tight">Takviye Önerileri</h2>
                <span className="label-caps text-outline">({supplementRecs.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {supplementRecs.map(({ need, topProduct }, idx) => {
                  if (!topProduct?.product) return null;
                  const product = topProduct.product;
                  const score = Math.round(Number(topProduct.compatibility_score));
                  const rawImg = product.images?.find((i) => i.sort_order === 0)?.image_url || product.images?.[0]?.image_url;
                  const img = rawImg?.includes('placehold.co') || rawImg?.includes('dicebear') ? undefined : rawImg;
                  const link = cheapestLink(product.affiliate_links);
                  const reasons = buildReasonBullets(need, topProduct);

                  return (
                    <div key={need.need_id} className="curator-card overflow-hidden group">
                      <Link href={`/takviyeler/${product.product_slug}`} className="block">
                        <div className="aspect-[4/3] bg-surface-container-low overflow-hidden relative">
                          {img ? (
                            <Image src={img} alt={product.product_name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <span className="material-icon text-outline-variant flex items-center justify-center h-full" style={{ fontSize: '64px' }} aria-hidden="true">medication</span>
                          )}
                          <span className="absolute top-3 left-3 bg-on-surface text-surface w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                          <span className="absolute top-3 right-3 bg-primary/90 text-on-primary px-3 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm">{need.need_name}</span>
                        </div>
                      </Link>
                      <div className="p-5">
                        {product.brand && <p className="label-caps text-outline mb-0.5">{product.brand.brand_name}</p>}
                        <Link href={`/takviyeler/${product.product_slug}`}>
                          <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight line-clamp-2">{product.product_name}</h3>
                        </Link>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="label-caps text-outline shrink-0">{need.need_name}</span>
                          <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`} style={{ width: `${Math.min(100, score)}%` }} />
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(score)}`}>%{score}</span>
                        </div>
                        {reasons.length > 0 && (
                          <div className="mt-4 bg-surface-container-low rounded-sm p-4">
                            <p className="label-caps text-primary mb-2 flex items-center gap-1.5">
                              <span className="material-icon text-[14px]" aria-hidden="true">lightbulb</span>
                              Neden bu ürün?
                            </p>
                            <ul className="space-y-1">
                              {reasons.map((r, i) => (
                                <li key={i} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5">•</span>{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-4">
                          <Link href={`/takviyeler/${product.product_slug}`} className="flex-1 curator-btn-outline text-[10px] py-2.5 text-center">Detaylar</Link>
                          {link && (
                            <a href={link.affiliate_url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="flex-1 curator-btn-primary text-[10px] py-2.5 text-center flex items-center justify-center gap-1.5">
                              <span className="material-icon text-[14px]" aria-hidden="true">shopping_bag</span>
                              {link.price_snapshot ? `₺${Number(link.price_snapshot).toFixed(0)} — ${PLATFORM_LABELS[link.platform] || 'Satın Al'}` : PLATFORM_LABELS[link.platform] || 'Satın Al'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        )}

        {/* How we choose */}
        <div className="mt-16 bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 md:p-8 max-w-5xl mx-auto">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-icon text-primary" aria-hidden="true">info</span>
            Nasil Seciyoruz?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-on-surface-variant">
            <div>
              <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span className="material-icon material-icon-sm text-score-high" aria-hidden="true">science</span>
                Icerik Kalitesi
              </p>
              <p>Icerik maddelerinin bilimsel kanit duzeyi ve ihtiyaca uygunluk skoru analiz edilir.</p>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span className="material-icon material-icon-sm text-primary" aria-hidden="true">trending_down</span>
                Fiyat Performansi
              </p>
              <p>Fiyat gecmisi takip edilir, fiyati dusen ve uygun fiyatli urunler one cikar.</p>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span className="material-icon material-icon-sm text-score-medium" aria-hidden="true">verified</span>
                Fonksiyonel Fayda
              </p>
              <p>Urunun hedef ihtiyaca uyum skoru, aktif madde konsantrasyonu ve formul gucu degerlendirilir.</p>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span className="material-icon material-icon-sm text-error" aria-hidden="true">shield</span>
                Guvenlik Profili
              </p>
              <p>Alerjen, parfum ve koruyucu bayraklari kontrol edilir, hassas ciltler icin risk analizi yapilir.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-on-surface-variant mb-4">
            Kisisellestirilmis oneriler icin cilt analizini tamamla
          </p>
          <Link href="/cilt-analizi" className="inline-flex items-center gap-2 curator-btn-primary px-8 py-3 text-xs">
            <span className="material-icon material-icon-sm" aria-hidden="true">quiz</span>
            CILT ANALIZI YAP
          </Link>
        </div>
      </div>
    </>
  );
}
