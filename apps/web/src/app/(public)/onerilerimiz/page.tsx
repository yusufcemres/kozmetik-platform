import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
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
    brand?: { brand_name: string };
    images?: { image_url: string; sort_order?: number }[];
    affiliate_links?: {
      platform: string;
      affiliate_url: string;
      price_snapshot?: number;
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
          const scores = await apiFetch<ProductScore[]>(
            `/scoring/needs/${need.need_id}/top-products?limit=1`,
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

function needGroupIcon(group?: string): string {
  if (group === 'skin_concern') return 'error_outline';
  if (group === 'skin_goal') return 'auto_awesome';
  if (group === 'sensitivity') return 'warning_amber';
  return 'category';
}

function cheapestLink(links?: { platform: string; affiliate_url: string; price_snapshot?: number }[]) {
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

      <div className="curator-section max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
            <span className="material-icon material-icon-sm" aria-hidden="true">
              auto_awesome
            </span>
            AI Destekli
          </div>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">
            BU HAFTANIN ÖNERİLERİ
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 max-w-lg mx-auto">
            Her cilt ihtiyacı için içerik kalitesi, fiyat performansı ve
            bilimsel kanıt düzeyine göre seçtiğimiz en iyi ürünler.
          </p>
          <p className="label-caps text-outline mt-4">
            <span className="material-icon material-icon-sm align-text-bottom mr-1" aria-hidden="true">
              update
            </span>
            {weekLabel} Haftası
          </p>
        </div>

        {/* Recommendations List */}
        {recommendations.length === 0 ? (
          <div className="text-center py-24">
            <span
              className="material-icon text-outline-variant mb-4 block"
              style={{ fontSize: '64px' }}
              aria-hidden="true"
            >
              recommend
            </span>
            <p className="text-on-surface-variant">
              Öneriler hesaplanıyor, birazdan burada olacak.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            {recommendations.map(({ need, topProduct }, idx) => {
              if (!topProduct?.product) return null;
              const product = topProduct.product;
              const score = Math.round(Number(topProduct.compatibility_score));
              const img =
                product.images?.find((i) => i.sort_order === 0)?.image_url ||
                product.images?.[0]?.image_url;
              const link = cheapestLink(product.affiliate_links);

              return (
                <div
                  key={need.need_id}
                  className="curator-card p-4 flex items-center gap-4 group"
                >
                  <span className="text-lg font-bold text-outline w-6 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <Link
                    href={`/urunler/${product.product_slug}`}
                    className="w-16 h-16 bg-surface-container-low rounded-sm overflow-hidden shrink-0 relative"
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={product.product_name}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    ) : (
                      <span className="material-icon text-outline-variant flex items-center justify-center h-full" aria-hidden="true">
                        inventory_2
                      </span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    {product.brand && (
                      <p className="label-caps text-outline">
                        {product.brand.brand_name}
                      </p>
                    )}
                    <Link
                      href={`/urunler/${product.product_slug}`}
                      className="text-sm font-semibold text-on-surface truncate block group-hover:text-primary transition-colors"
                    >
                      {product.product_name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-sm text-[10px] font-medium">
                        {need.need_name}
                      </span>
                      <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className={`h-full rounded-full ${getScoreBarColor(score)}`}
                          style={{ width: `${Math.min(100, score)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${getScoreColor(score)}`}>
                        %{score}
                      </span>
                    </div>
                  </div>
                  {link && (
                    <a
                      href={`${link.affiliate_url}${link.affiliate_url.includes('?') ? '&' : '?'}utm_source=revela&utm_medium=affiliate&utm_campaign=onerilerimiz&utm_content=${product.product_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-primary text-on-primary px-4 py-2 rounded-sm text-xs font-medium hover:bg-primary/90 transition-colors hidden sm:flex items-center gap-1.5"
                    >
                      <span className="material-icon material-icon-sm" aria-hidden="true">
                        shopping_bag
                      </span>
                      {link.price_snapshot
                        ? `₺${Number(link.price_snapshot).toFixed(0)}`
                        : PLATFORM_LABELS[link.platform] || 'Satın Al'}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info section */}
        <div className="mt-16 bg-surface-container-low border border-outline-variant/20 rounded-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-icon text-primary" aria-hidden="true">
              info
            </span>
            Nasıl Seçiyoruz?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-on-surface-variant">
            <div>
              <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span
                  className="material-icon material-icon-sm text-score-high"
                  aria-hidden="true"
                >
                  science
                </span>
                İçerik Kalitesi
              </p>
              <p>
                İçerik maddelerinin bilimsel kanıt düzeyi ve ihtiyaca uygunluk
                skoru analiz edilir.
              </p>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span
                  className="material-icon material-icon-sm text-primary"
                  aria-hidden="true"
                >
                  trending_down
                </span>
                Fiyat Performansı
              </p>
              <p>
                Fiyat geçmişi takip edilir, fiyatı düşen ve uygun fiyatlı
                ürünler öne çıkar.
              </p>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span
                  className="material-icon material-icon-sm text-score-medium"
                  aria-hidden="true"
                >
                  verified
                </span>
                Fonksiyonel Fayda
              </p>
              <p>
                Ürünün hedef ihtiyaca uyum skoru, aktif madde konsantrasyonu ve
                formül gücü değerlendirilir.
              </p>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span
                  className="material-icon material-icon-sm text-error"
                  aria-hidden="true"
                >
                  shield
                </span>
                Güvenlik Profili
              </p>
              <p>
                Alerjen, parfüm ve koruyucu bayrakları kontrol edilir, hassas
                ciltler için risk analizi yapılır.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-on-surface-variant mb-4">
            Kişiselleştirilmiş öneriler için cilt analizini tamamla
          </p>
          <Link
            href="/cilt-analizi"
            className="inline-flex items-center gap-2 curator-btn-primary px-8 py-3 text-xs"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">
              quiz
            </span>
            CİLT ANALİZİ YAP
          </Link>
        </div>
      </div>
    </>
  );
}
