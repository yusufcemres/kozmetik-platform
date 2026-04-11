import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch, API_BASE_URL } from '@/lib/api';

// === Types ===

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  short_description?: string;
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

// === Data ===

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/slug/${slug}`, {
      next: { revalidate: 3600 },
    } as any);
  } catch {
    return null;
  }
}

async function getSupplementDetail(productId: number): Promise<SupplementDetail | null> {
  try {
    return await apiFetch<SupplementDetail>(`/supplements/${productId}`, {
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
  const map: Record<string, string> = {
    trendyol: 'Trendyol',
    hepsiburada: 'Hepsiburada',
    amazon_tr: 'Amazon TR',
    dermoeczanem: 'Dermoeczanem',
    gratis: 'Gratis',
    other: 'Diğer',
  };
  return map[p] || p;
}

function formatPrice(price: number | null): string {
  if (!price) return '';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}

// === JSON-LD ===

function supplementJsonLd(product: Product, detail: SupplementDetail | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.product_name,
    description: product.short_description || `${product.product_name} takviye gida.`,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand.brand_name } } : {}),
    ...(product.category ? { category: product.category.category_name } : {}),
    ...(product.images?.[0]?.image_url ? { image: product.images[0].image_url } : {}),
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

  const detail = await getSupplementDetail(product.product_id);
  const nutritionFacts = (detail?.nutrition_facts || []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const activeLinks = (product.affiliate_links || []).filter((l) => l.is_active);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(supplementJsonLd(product, detail)) }}
      />

      <article className="curator-section max-w-[1200px] mx-auto">
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
                {activeLinks.map((link) => (
                  <a
                    key={link.affiliate_link_id}
                    href={`${API_BASE_URL}/r/${link.affiliate_link_id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="inline-flex items-center gap-2 border border-outline-variant/30 rounded-sm px-4 py-2.5 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <span className="font-semibold text-sm text-on-surface">{platformLabel(link.platform)}</span>
                    {link.price_snapshot ? (
                      <span className="text-lg font-bold text-primary">{formatPrice(link.price_snapshot)}</span>
                    ) : (
                      <span className="text-sm text-outline">Fiyat bilgisi yok</span>
                    )}
                    <span className="material-icon text-primary text-[16px]" aria-hidden="true">arrow_forward</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Supplement Info */}
        {detail && (
          <section className="mb-8 curator-card p-6">
            <h2 className="label-caps text-on-surface-variant tracking-[0.2em] mb-4">Takviye Bilgileri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="label-caps text-outline">Form</span>
                <p className="font-semibold text-on-surface mt-0.5">{formLabel(detail.form)}</p>
              </div>
              <div>
                <span className="label-caps text-outline">Porsiyon</span>
                <p className="font-semibold text-on-surface mt-0.5">
                  {detail.serving_size
                    ? `${detail.serving_size} ${detail.serving_unit || ''}`
                    : '-'}
                </p>
              </div>
              <div>
                <span className="label-caps text-outline">Adet</span>
                <p className="font-semibold text-on-surface mt-0.5">
                  {detail.servings_per_container || '-'}
                </p>
              </div>
              <div>
                <span className="label-caps text-outline">Sertifika</span>
                <p className="font-semibold text-on-surface mt-0.5">{detail.certification || '-'}</p>
              </div>
            </div>
            {detail.recommended_use && (
              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                <span className="label-caps text-outline">Önerilen Kullanım</span>
                <p className="text-sm font-medium text-on-surface mt-0.5">
                  {detail.recommended_use}
                </p>
              </div>
            )}
            {detail.manufacturer_country && (
              <p className="label-caps text-outline mt-3">
                Üretim: {detail.manufacturer_country}
              </p>
            )}
            {detail.requires_prescription && (
              <div className="mt-3 label-caps text-error bg-error/10 px-3 py-1.5 rounded-sm inline-block">
                Reçete gerektirebilir
              </div>
            )}
          </section>
        )}

        {/* Nutrition Facts */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-on-surface mb-4">
            Besin Değerleri (Nutrition Facts)
          </h2>
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
            <div className="bg-surface-container-low rounded-sm p-6 text-on-surface-variant text-sm">
              Besin bilgileri henüz eklenmemiş.
            </div>
          )}
        </section>

        {/* Ingredient Functions */}
        {nutritionFacts.some(nf => nf.ingredient?.function_summary) && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">science</span>
              Bu Bileşenler Ne İşe Yarar?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nutritionFacts
                .filter(nf => nf.ingredient?.function_summary)
                .map((nf) => {
                  const ing = nf.ingredient!;
                  return (
                    <Link
                      key={nf.supplement_ingredient_id}
                      href={`/icerikler/${ing.ingredient_slug}`}
                      className="curator-card p-4 group hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-icon text-primary text-[16px]" aria-hidden="true">biotech</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
                            {ing.common_name || ing.inci_name}
                          </p>
                          <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                            {ing.function_summary}
                          </p>
                        </div>
                        <span className="material-icon text-outline-variant text-[16px] shrink-0 group-hover:text-primary transition-colors" aria-hidden="true">arrow_forward</span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        )}

        {/* Food Sources */}
        {nutritionFacts.some(nf => nf.ingredient?.food_sources && nf.ingredient.food_sources.length > 0) && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">restaurant</span>
              Bu Bileşenleri Hangi Gıdalarda Bulabilirsiniz?
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Takviye yerine veya yanında tüketebileceğiniz doğal gıda kaynakları.
            </p>

            <div className="space-y-6">
              {nutritionFacts
                .filter(nf => nf.ingredient?.food_sources && nf.ingredient.food_sources.length > 0 && nf.ingredient.food_sources[0].amount_per_100g > 0)
                .map((nf) => {
                  const ing = nf.ingredient!;
                  const dose = Number(nf.amount_per_serving) || 0;
                  const doseUnit = nf.unit || '';
                  return (
                    <div key={nf.supplement_ingredient_id} className="curator-card overflow-hidden">
                      <div className="bg-surface-container-low px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="material-icon text-primary text-[18px]" aria-hidden="true">eco</span>
                          <h3 className="font-semibold text-on-surface text-sm">
                            {ing.common_name || ing.inci_name}
                            {dose > 0 && <span className="text-on-surface-variant font-normal ml-1">({Number.isInteger(dose) ? dose : dose.toFixed(1)} {doseUnit})</span>}
                          </h3>
                        </div>
                        {ing.daily_recommended_value && (
                          <span className="label-caps text-outline">
                            Günlük önerilen: {ing.daily_recommended_value} {ing.daily_recommended_unit || 'mg'}
                          </span>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-outline-variant/20">
                              <th className="text-left px-4 py-2 label-caps text-outline">Gıda</th>
                              <th className="text-right px-4 py-2 label-caps text-outline">100g&apos;da</th>
                              {dose > 0 && (
                                <th className="text-right px-4 py-2 label-caps text-outline">
                                  {Number.isInteger(dose) ? dose : dose.toFixed(1)} {doseUnit} için
                                </th>
                              )}
                              <th className="text-center px-4 py-2 label-caps text-outline">Biyoyararlanım</th>
                              <th className="text-left px-4 py-2 label-caps text-outline hidden sm:table-cell">Not</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {ing.food_sources!.map((fs, i) => {
                              const neededGrams = dose > 0 && fs.amount_per_100g > 0
                                ? Math.round((dose / fs.amount_per_100g) * 100)
                                : null;
                              return (
                                <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                                  <td className="px-4 py-2.5 font-medium text-on-surface">{fs.food_name}</td>
                                  <td className="px-4 py-2.5 text-right text-on-surface-variant">
                                    {fs.amount_per_100g > 0 ? `${fs.amount_per_100g} ${fs.unit}` : '-'}
                                  </td>
                                  {dose > 0 && (
                                    <td className="px-4 py-2.5 text-right">
                                      {neededGrams !== null ? (
                                        <span className={`font-semibold ${neededGrams <= 100 ? 'text-score-high' : neededGrams <= 300 ? 'text-primary' : 'text-on-surface-variant'}`}>
                                          ~{neededGrams}g
                                        </span>
                                      ) : '-'}
                                    </td>
                                  )}
                                  <td className="px-4 py-2.5 text-center">
                                    {fs.bioavailability && (
                                      <span className={`label-caps px-2 py-0.5 rounded-sm ${
                                        fs.bioavailability === 'Yüksek' ? 'text-score-high bg-score-high/10' :
                                        fs.bioavailability === 'Orta' ? 'text-score-medium bg-score-medium/10' :
                                        'text-outline bg-surface-container-low'
                                      }`}>{fs.bioavailability}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-xs text-on-surface-variant hidden sm:table-cell">{fs.note || ''}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
            </div>

            <p className="text-xs text-outline mt-4 flex items-start gap-1.5">
              <span className="material-icon text-[14px] mt-0.5" aria-hidden="true">info</span>
              Gıdalardan alınan vitaminlerin biyoyararlanımı genellikle takviyelerden daha yüksektir. Dengeli beslenme takviyeye tercih edilmelidir.
            </p>
          </section>
        )}

        {/* Warnings */}
        {detail?.warnings && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-3">Uyarılar</h2>
            <div className="bg-tertiary-container border border-outline-variant/20 rounded-sm p-4">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {detail.warnings}
              </p>
            </div>
          </section>
        )}

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
