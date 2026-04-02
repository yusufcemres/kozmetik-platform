import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
  short_description?: string;
  detailed_description?: string;
  user_friendly_label?: string;
}

interface IngredientMapping {
  mapping_id: number;
  ingredient_id: number;
  need_id: number;
  relevance_score: number;
  effect_type: string;
  evidence_level?: string;
  ingredient?: {
    ingredient_id: number;
    inci_name: string;
    ingredient_slug: string;
    common_name?: string;
    ingredient_group?: string;
    origin_type?: string;
  };
}

interface ProductScore {
  product_need_score_id: number;
  product_id: number;
  need_id: number;
  compatibility_score: number;
  confidence_level: string;
  product?: {
    product_id: number;
    product_name: string;
    product_slug: string;
    brand?: { brand_name: string };
    images?: { image_url: string }[];
  };
}

// === Data ===

async function getNeed(slug: string): Promise<Need | null> {
  try {
    return await apiFetch<Need>(`/needs/slug/${slug}`, {
      next: { revalidate: 3600 },
    } as any);
  } catch {
    return null;
  }
}

async function getMappings(needId: number): Promise<IngredientMapping[]> {
  try {
    return await apiFetch<IngredientMapping[]>(
      `/ingredient-need-mappings/by-need/${needId}`,
      { next: { revalidate: 3600 } } as any,
    );
  } catch {
    return [];
  }
}

async function getTopProducts(needName: string): Promise<{
  data: ProductScore['product'][];
  meta: { total: number };
}> {
  try {
    return await apiFetch<{ data: ProductScore['product'][]; meta: { total: number } }>(
      `/products?search=${encodeURIComponent(needName)}&limit=12&page=1`,
      { next: { revalidate: 3600 } } as any,
    );
  } catch {
    return { data: [], meta: { total: 0 } };
  }
}

// === SEO ===

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const need = await getNeed(params.slug);
  if (!need) {
    return { title: 'İhtiyaç Bulunamadı' };
  }

  const title = need.user_friendly_label || need.need_name;
  const description =
    need.short_description ||
    `${need.need_name} ihtiyacı için en etkili kozmetik içerik maddeleri ve uyumlu ürünler.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Kozmetik Platform`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/ihtiyaclar/${need.need_slug}`,
    },
  };
}

// === Helpers ===

function effectTypeLabel(type: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    direct_support: { label: 'Doğrudan Destek', color: 'text-green-600 bg-green-50' },
    indirect_support: { label: 'Dolaylı Destek', color: 'text-blue-600 bg-blue-50' },
    complementary: { label: 'Tamamlayıcı', color: 'text-purple-600 bg-purple-50' },
    caution_related: { label: 'Dikkat', color: 'text-red-600 bg-red-50' },
  };
  return map[type] || { label: type.replace(/_/g, ' '), color: 'text-gray-600 bg-gray-50' };
}

function groupLabel(group: string): string {
  const map: Record<string, string> = {
    skin_concern: 'Cilt Sorunu',
    skin_goal: 'Cilt Hedefi',
    sensitivity: 'Hassasiyet',
  };
  return map[group] || group;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-500';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-400';
}

// === JSON-LD ===

function needJsonLd(need: Need) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: need.need_name,
    alternateName: need.user_friendly_label || undefined,
    description:
      need.short_description ||
      `${need.need_name} cilt ihtiyacı için bilimsel bilgi ve ürün önerileri.`,
  };
}

// === Page ===

export default async function NeedDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const need = await getNeed(params.slug);
  if (!need) notFound();

  const [mappings, productResults] = await Promise.all([
    getMappings(need.need_id),
    getTopProducts(need.need_name),
  ]);

  const sortedMappings = [...mappings].sort(
    (a, b) => (b.relevance_score || 0) - (a.relevance_score || 0),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(needJsonLd(need)) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1">
          <Link href="/ihtiyaclar" className="hover:text-primary">
            İhtiyaçlar
          </Link>
          <span>/</span>
          <span className="text-gray-600">{need.need_name}</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-2">
            {need.need_group && (
              <span className="text-xs bg-white/80 text-primary px-2.5 py-1 rounded-full font-medium">
                {groupLabel(need.need_group)}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {need.need_name}
          </h1>
          {need.user_friendly_label && (
            <p className="text-primary font-medium">
              {need.user_friendly_label}
            </p>
          )}
          {need.short_description && (
            <p className="text-gray-600 mt-3 leading-relaxed">
              {need.short_description}
            </p>
          )}
        </div>

        {/* Detailed Description */}
        {need.detailed_description && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-3">Detaylı Bilgi</h2>
            <div className="bg-white border rounded-lg p-5">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {need.detailed_description}
              </p>
            </div>
          </section>
        )}

        {/* Effective Ingredients */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            Bu İhtiyaç İçin Etkili İçerikler
            {sortedMappings.length > 0 && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                {sortedMappings.length} madde
              </span>
            )}
          </h2>
          {sortedMappings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedMappings.map((m) => {
                const effect = effectTypeLabel(m.effect_type);
                const score = Math.round(m.relevance_score || 0);
                return (
                  <div
                    key={m.mapping_id}
                    className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {m.ingredient ? (
                          <Link
                            href={`/icerikler/${m.ingredient.ingredient_slug}`}
                            className="font-medium text-gray-800 hover:text-primary"
                          >
                            {m.ingredient.inci_name}
                          </Link>
                        ) : (
                          <span className="font-medium text-gray-800">
                            İçerik #{m.ingredient_id}
                          </span>
                        )}
                        {m.ingredient?.common_name && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {m.ingredient.common_name}
                          </p>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                        %{score}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBarColor(score)}`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${effect.color}`}>
                        {effect.label}
                      </span>
                      {m.ingredient?.ingredient_group && (
                        <span className="text-[10px] text-gray-400">
                          {m.ingredient.ingredient_group}
                        </span>
                      )}
                      {m.evidence_level && (
                        <span className="text-[10px] text-gray-400">
                          {m.evidence_level.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
              Henüz içerik eşleşmesi tanımlanmamış
            </div>
          )}
        </section>

        {/* Compatible Products */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Uyumlu Ürünler</h2>
          {productResults.data && productResults.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productResults.data.map((product: any) => {
                const imgUrl = product.images?.[0]?.image_url;
                return (
                  <Link
                    key={product.product_id}
                    href={`/urunler/${product.product_slug}`}
                    className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-32 bg-gray-50 flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.product_name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-3xl text-gray-300">📦</span>
                      )}
                    </div>
                    <div className="p-3">
                      {product.brand && (
                        <p className="text-xs text-primary font-semibold">
                          {product.brand.brand_name}
                        </p>
                      )}
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {product.product_name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
              Henüz uyumlu ürün bulunamadı
            </div>
          )}
        </section>

        {/* Profile CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Bu İhtiyaç Seninle İlgili mi?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Cilt profilini oluştur ve her üründe sana özel uyum skoru gör.
          </p>
          <Link
            href="/profilim"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
          >
            Profilimi Oluştur
          </Link>
        </div>

        {/* Back Link */}
        <div className="border-t mt-8 pt-8">
          <Link
            href="/ihtiyaclar"
            className="text-primary hover:underline text-sm font-medium"
          >
            &larr; Tüm İhtiyaçlar
          </Link>
        </div>
      </article>
    </>
  );
}
