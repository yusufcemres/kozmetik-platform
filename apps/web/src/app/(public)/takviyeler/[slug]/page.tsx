import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';

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
      title: `${title} | Kozmetik Platform`,
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
    description: product.short_description || `${product.product_name} takviye gıda.`,
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

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1">
          <Link href="/takviyeler" className="hover:text-primary">
            Takviyeler
          </Link>
          <span>/</span>
          <span className="text-gray-600">{product.product_name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">💊</span>
          <div>
            {product.brand && (
              <p className="text-sm text-primary font-semibold">
                {product.brand.brand_name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {product.product_name}
            </h1>
          </div>
        </div>

        {product.short_description && (
          <p className="text-gray-600 leading-relaxed mb-8">
            {product.short_description}
          </p>
        )}

        {/* Supplement Info */}
        {detail && (
          <section className="mb-8 bg-blue-50 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Takviye Bilgileri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Form</span>
                <p className="font-semibold">{formLabel(detail.form)}</p>
              </div>
              <div>
                <span className="text-gray-500">Porsiyon</span>
                <p className="font-semibold">
                  {detail.serving_size
                    ? `${detail.serving_size} ${detail.serving_unit || ''}`
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Adet</span>
                <p className="font-semibold">
                  {detail.servings_per_container || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Sertifika</span>
                <p className="font-semibold">{detail.certification || '-'}</p>
              </div>
            </div>
            {detail.recommended_use && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <span className="text-xs text-gray-500">Önerilen Kullanım</span>
                <p className="text-sm font-medium mt-0.5">
                  {detail.recommended_use}
                </p>
              </div>
            )}
            {detail.manufacturer_country && (
              <p className="text-xs text-gray-400 mt-2">
                Üretim: {detail.manufacturer_country}
              </p>
            )}
            {detail.requires_prescription && (
              <div className="mt-3 bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-full inline-block font-medium">
                Reçete gerektirebilir
              </div>
            )}
          </section>
        )}

        {/* Nutrition Facts */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Besin Değerleri (Nutrition Facts)
          </h2>
          {nutritionFacts.length > 0 ? (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">İçerik</th>
                    <th className="text-right px-4 py-3 font-semibold">Miktar</th>
                    <th className="text-right px-4 py-3 font-semibold">% GRD</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {nutritionFacts.map((nf) => (
                    <tr key={nf.supplement_ingredient_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {nf.ingredient ? (
                          <Link
                            href={`/icerikler/${nf.ingredient.ingredient_slug}`}
                            className="text-gray-800 hover:text-primary font-medium"
                          >
                            {nf.ingredient.common_name || nf.ingredient.inci_name}
                          </Link>
                        ) : (
                          <span className="text-gray-800">Bilinmeyen</span>
                        )}
                        {nf.is_proprietary_blend && (
                          <span className="text-[10px] ml-1.5 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                            Özel Karışım
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {nf.amount_per_serving != null
                          ? `${nf.amount_per_serving} ${nf.unit || ''}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {nf.daily_value_percentage != null ? (
                          <span
                            className={`font-semibold ${
                              nf.daily_value_percentage >= 100
                                ? 'text-green-600'
                                : nf.daily_value_percentage >= 50
                                  ? 'text-blue-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            %{Math.round(nf.daily_value_percentage)}
                          </span>
                        ) : (
                          <span className="text-gray-400">*</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 bg-gray-50 text-[10px] text-gray-400">
                * GRD (Günlük Referans Değer) belirtilmemiş
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
              Besin bilgileri henüz eklenmemiş
            </div>
          )}
        </section>

        {/* Warnings */}
        {detail?.warnings && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Uyarılar</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 leading-relaxed">
                {detail.warnings}
              </p>
            </div>
          </section>
        )}

        {/* Affiliate Links */}
        {activeLinks.length > 0 && (
          <section className="mb-8">
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

        {/* Back */}
        <div className="border-t pt-8">
          <Link
            href="/takviyeler"
            className="text-primary hover:underline text-sm font-medium"
          >
            &larr; Tüm Takviyeler
          </Link>
        </div>
      </article>
    </>
  );
}
