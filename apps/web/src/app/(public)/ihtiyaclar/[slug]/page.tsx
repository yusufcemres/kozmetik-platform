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

async function getTopProducts(needId: number): Promise<ProductScore[]> {
  try {
    return await apiFetch<ProductScore[]>(
      `/scoring/needs/${needId}/top-products?limit=12`,
      { next: { revalidate: 3600 } } as any,
    );
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
  const need = await getNeed(params.slug);
  if (!need) {
    return { title: 'Ihtiyac Bulunamadi' };
  }

  const title = need.user_friendly_label || need.need_name;
  const description =
    need.short_description ||
    `${need.need_name} ihtiyaci icin en etkili kozmetik icerik maddeleri ve uyumlu urunler.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | REVELA`,
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
    direct_support: { label: 'Dogrudan Destek', color: 'text-score-high bg-score-high/10' },
    indirect_support: { label: 'Dolayli Destek', color: 'text-primary bg-primary/5' },
    complementary: { label: 'Tamamlayici', color: 'text-on-surface-variant bg-surface-container-low' },
    caution_related: { label: 'Dikkat', color: 'text-error bg-error/10' },
  };
  return map[type] || { label: type.replace(/_/g, ' '), color: 'text-outline bg-surface-container-low' };
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
  if (score >= 70) return 'text-score-high';
  if (score >= 40) return 'text-score-medium';
  return 'text-score-low';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-score-high';
  if (score >= 40) return 'bg-score-medium';
  return 'bg-score-low';
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
      `${need.need_name} cilt ihtiyaci icin bilimsel bilgi ve urun onerileri.`,
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

  const [mappings, topScores] = await Promise.all([
    getMappings(need.need_id),
    getTopProducts(need.need_id),
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

      <article className="curator-section max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="label-caps text-outline mb-8 flex items-center gap-2">
          <Link href="/ihtiyaclar" className="hover:text-primary transition-colors">
            Ihtiyaclar
          </Link>
          <span className="material-icon material-icon-sm" aria-hidden="true">chevron_right</span>
          <span className="text-on-surface-variant">{need.need_name}</span>
        </nav>

        {/* Header */}
        <div className="curator-card p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-3">
            {need.need_group && (
              <span className="label-caps text-primary bg-primary/5 px-2.5 py-1 rounded-sm">
                {groupLabel(need.need_group)}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl headline-tight text-on-surface mb-2">
            {need.need_name}
          </h1>
          {need.user_friendly_label && (
            <p className="text-primary font-medium">
              {need.user_friendly_label}
            </p>
          )}
          {need.short_description && (
            <p className="text-on-surface-variant mt-3 leading-relaxed">
              {need.short_description}
            </p>
          )}
        </div>

        {/* Detailed Description */}
        {need.detailed_description && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-on-surface mb-3">Detayli Bilgi</h2>
            <div className="bg-surface-container-low rounded-sm p-5">
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                {need.detailed_description}
              </p>
            </div>
          </section>
        )}

        {/* Effective Ingredients */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-bold text-on-surface">
              Bu Ihtiyac Icin Etkili Icerikler
            </h2>
            {sortedMappings.length > 0 && (
              <span className="label-caps text-outline">
                {sortedMappings.length} madde
              </span>
            )}
          </div>
          {sortedMappings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedMappings.map((m) => {
                const effect = effectTypeLabel(m.effect_type);
                const score = Math.round(m.relevance_score || 0);
                return (
                  <div
                    key={m.mapping_id}
                    className="curator-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {m.ingredient ? (
                          <Link
                            href={`/icerikler/${m.ingredient.ingredient_slug}`}
                            className="font-medium text-on-surface hover:text-primary transition-colors"
                          >
                            {m.ingredient.inci_name}
                          </Link>
                        ) : (
                          <span className="font-medium text-on-surface">
                            Icerik #{m.ingredient_id}
                          </span>
                        )}
                        {m.ingredient?.common_name && (
                          <p className="text-xs text-outline mt-0.5">
                            {m.ingredient.common_name}
                          </p>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                        %{score}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="mt-2 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBarColor(score)}`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`label-caps px-2 py-0.5 rounded-sm ${effect.color}`}>
                        {effect.label}
                      </span>
                      {m.ingredient?.ingredient_group && (
                        <span className="label-caps text-outline">
                          {m.ingredient.ingredient_group}
                        </span>
                      )}
                      {m.evidence_level && (
                        <span className="label-caps text-outline">
                          {m.evidence_level.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-sm p-6 text-on-surface-variant text-sm">
              Henuz icerik eslesmesi tanimlanmamis
            </div>
          )}
        </section>

        {/* Compatible Products */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-on-surface mb-4">Uyumlu Urunler</h2>
          {topScores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topScores.map((score) => {
                const product = score.product;
                if (!product) return null;
                const imgUrl = product.images?.[0]?.image_url;
                const compat = Math.round(Number(score.compatibility_score));
                return (
                  <Link
                    key={score.product_need_score_id}
                    href={`/urunler/${product.product_slug}`}
                    className="curator-card overflow-hidden group"
                  >
                    <div className="h-32 bg-surface-container-low flex items-center justify-center overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.product_name}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <span className="material-icon material-icon-lg text-outline-variant" aria-hidden="true">inventory_2</span>
                      )}
                    </div>
                    <div className="p-3">
                      {product.brand && (
                        <p className="label-caps text-outline">
                          {product.brand.brand_name}
                        </p>
                      )}
                      <p className="text-sm font-medium text-on-surface line-clamp-2 tracking-tight">
                        {product.product_name}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(compat)}`}
                            style={{ width: `${Math.min(100, compat)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${getScoreColor(compat)}`}>
                          %{compat}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-sm p-6 text-on-surface-variant text-sm">
              Henuz uyumlu urun bulunamadi
            </div>
          )}
        </section>

        {/* Profile CTA */}
        <div className="curator-card p-8 text-center mb-8">
          <h3 className="text-xl headline-tight text-on-surface mb-2">
            BU IHTIYAC SENINLE ILGILI MI?
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Cilt profilini olustur ve her urunde sana ozel uyum skoru gor.
          </p>
          <Link
            href="/profilim"
            className="curator-btn-primary text-[10px] px-8 py-3 inline-block"
          >
            PROFILIMI OLUSTUR
          </Link>
        </div>

        {/* Back Link */}
        <div className="border-t border-outline-variant/20 pt-8">
          <Link
            href="/ihtiyaclar"
            className="label-caps text-primary hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">arrow_back</span>
            Tum Ihtiyaclar
          </Link>
        </div>
      </article>
    </>
  );
}
