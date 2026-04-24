import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import ListModal from '@/components/public/ListModal';
import ProductCarousel from '@/components/public/ProductCarousel';
import { hasSkinProfileCookie } from '@/lib/skin-profile-server';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
  short_description?: string;
  detailed_description?: string;
  user_friendly_label?: string;
  domain_type?: string; // 'cosmetic' | 'supplement' | 'both'
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
    images?: { image_url: string; sort_order?: number }[];
  };
}

// === Data ===

async function getNeed(slug: string): Promise<Need | null> {
  try {
    return await apiFetch<Need>(`/needs/slug/${slug}`, {
      next: { revalidate: 300 },
    } as any);
  } catch {
    return null;
  }
}

async function getMappings(needId: number): Promise<IngredientMapping[]> {
  try {
    return await apiFetch<IngredientMapping[]>(
      `/ingredient-need-mappings/by-need/${needId}`,
      { next: { revalidate: 300 } } as any,
    );
  } catch {
    return [];
  }
}

async function getTopProducts(needId: number, domainType?: string): Promise<ProductScore[]> {
  try {
    const dt = domainType ? `&domain_type=${domainType}` : '';
    return await apiFetch<ProductScore[]>(
      `/scoring/needs/${needId}/top-products?limit=12${dt}`,
      { next: { revalidate: 300 } } as any,
    );
  } catch {
    return [];
  }
}

interface NeedInteraction {
  interaction_id: number;
  severity: string;
  description: string;
  recommendation: string;
  ingredient_a: { inci_name: string; ingredient_slug?: string };
  ingredient_b: { inci_name: string; ingredient_slug?: string };
}

async function getInteractionsForIngredients(ingredientIds: number[]): Promise<NeedInteraction[]> {
  if (ingredientIds.length === 0) return [];
  try {
    const results: NeedInteraction[] = [];
    const idsToCheck = ingredientIds.slice(0, 3);
    for (const id of idsToCheck) {
      const data = await apiFetch<NeedInteraction[]>(
        `/interactions/by-ingredient/${id}`,
        { next: { revalidate: 300 } } as any,
      );
      if (data?.length) results.push(...data);
    }
    const seen = new Set<number>();
    return results.filter((r) => {
      if (seen.has(r.interaction_id)) return false;
      seen.add(r.interaction_id);
      return r.severity !== 'none';
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
    direct_support: { label: 'Doğrudan Destek', color: 'text-score-high bg-score-high/10' },
    indirect_support: { label: 'Dolaylı Destek', color: 'text-primary bg-primary/5' },
    complementary: { label: 'Tamamlayıcı', color: 'text-on-surface-variant bg-surface-container-low' },
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

  // Domain affinity: 'cosmetic' → only cosmetic, 'supplement' → only supplement,
  // anything else (null/'both') → both. Supplement-oriented needs (bağışıklık, kalp-damar)
  // gösterdiği kozmetik öneriler semantik olarak anlamsız → gizle.
  const showCosmetic = need.domain_type !== 'supplement';
  const showSupplement = need.domain_type !== 'cosmetic';

  const [mappings, cosmeticScores, supplementScores] = await Promise.all([
    getMappings(need.need_id),
    showCosmetic ? getTopProducts(need.need_id, 'cosmetic') : Promise.resolve([]),
    showSupplement ? getTopProducts(need.need_id, 'supplement') : Promise.resolve([]),
  ]);
  const topScores = cosmeticScores;

  // Sprint 5 (#18): bu ihtiyacın top etken bileşenleri için etkileşim uyarıları
  const sortedMappingsForInteractions = [...mappings].sort(
    (a, b) => (b.relevance_score || 0) - (a.relevance_score || 0),
  );
  const topIngredientIds = sortedMappingsForInteractions
    .map((m) => m.ingredient?.ingredient_id)
    .filter((id): id is number => !!id)
    .slice(0, 3);
  const needInteractions = await getInteractionsForIngredients(topIngredientIds);

  // FAQ for #18 — templated, ihtiyaç-spesifik
  const topIngredientNames = sortedMappingsForInteractions
    .slice(0, 3)
    .map((m) => m.ingredient?.common_name || m.ingredient?.inci_name)
    .filter(Boolean) as string[];
  const faq = [
    {
      q: `${need.need_name} için en etkili içerik nedir?`,
      a: topIngredientNames.length > 0
        ? `En yüksek bilimsel kanıta sahip ilk 3 madde: ${topIngredientNames.join(', ')}. Bu maddelerin uygun konsantrasyonda olduğu ürünleri tercih et.`
        : `Bu ihtiyaç için etkili içerik veritabanı henüz tamamlanmadı. Bilimsel kanıt ekledikçe burada güncellenecek.`,
    },
    {
      q: `Ne kadar sürede sonuç beklemeliyim?`,
      a: `Çoğu cilt bakım aktifi için 4-12 hafta gerekir. Niasinamid 4 hafta, retinol 8 hafta, peptit 12 hafta sonra farkını gösterir. Tutarlılık tek ürünü değiştirmekten daha önemlidir.`,
    },
    {
      q: `Birden fazla aktif maddeyi birlikte kullanabilir miyim?`,
      a: `Bazı kombinasyonlar sinerjik (Niasinamid + Hyaluronik Asit), bazıları tahriş edici (Retinol + AHA). Aşağıdaki etkileşim uyarılarını incele veya REVELA Karşılaştır aracını kullan.`,
    },
    {
      q: `Bu ihtiyaç için ne zaman dermatologa gitmeliyim?`,
      a: `4-6 hafta tutarlı OTC tedavi sonuç vermiyorsa, sorun aniden ağırlaşıyorsa veya yaygınlaşıyorsa, dermatolog kontrolü gerekir. REVELA platformu eğitim amaçlıdır, tıbbi tanı yerine geçmez.`,
    },
  ];

  const sortedMappings = [...mappings].sort(
    (a, b) => (b.relevance_score || 0) - (a.relevance_score || 0),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(needJsonLd(need)) }}
      />

      <article className="curator-section max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="text-outline mb-8 flex items-center gap-2 text-xs uppercase tracking-widest">
          <Link href="/ihtiyaclar" className="hover:text-primary transition-colors">
            İhtiyaçlar
          </Link>
          <span className="material-icon material-icon-sm normal-case" aria-hidden="true">chevron_right</span>
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
            <h2 className="text-xl font-bold text-on-surface mb-3">Detaylı Bilgi</h2>
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
              Bu İhtiyaç İçin Etkili İçerikler
            </h2>
            {sortedMappings.length > 0 && (
              <span className="label-caps text-outline">
                {sortedMappings.length} madde
              </span>
            )}
          </div>
          {sortedMappings.length > 0 ? (
            <ListModal
              title="Etkili İçerikler"
              count={sortedMappings.length}
              previewCount={6}
              allChildren={
                <div className="divide-y divide-outline-variant/20">
                  {sortedMappings.map((m) => {
                    const effect = effectTypeLabel(m.effect_type);
                    const score = Math.round(m.relevance_score || 0);
                    return (
                      <div key={m.mapping_id} className="flex items-center gap-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          {m.ingredient ? (
                            <Link
                              href={`/icerikler/${m.ingredient.ingredient_slug}`}
                              className="text-sm font-medium text-on-surface hover:text-primary transition-colors"
                            >
                              {m.ingredient.inci_name}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-on-surface">
                              İçerik #{m.ingredient_id}
                            </span>
                          )}
                          {m.ingredient?.common_name && (
                            <span className="text-xs text-outline ml-2">
                              {m.ingredient.common_name}
                            </span>
                          )}
                        </div>
                        <span className={`label-caps px-2 py-0.5 rounded-sm shrink-0 ${effect.color}`}>
                          {effect.label}
                        </span>
                        <span className={`text-sm font-bold shrink-0 ${getScoreColor(score)}`}>
                          %{score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {sortedMappings.slice(0, 8).map((m) => {
                  const effect = effectTypeLabel(m.effect_type);
                  const score = Math.round(m.relevance_score || 0);
                  return (
                    <div
                      key={m.mapping_id}
                      className="curator-card p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {m.ingredient ? (
                            <Link
                              href={`/icerikler/${m.ingredient.ingredient_slug}`}
                              className="text-xs font-medium text-on-surface hover:text-primary transition-colors block truncate"
                            >
                              {m.ingredient.inci_name}
                            </Link>
                          ) : (
                            <span className="text-xs font-medium text-on-surface">
                              İçerik #{m.ingredient_id}
                            </span>
                          )}
                          {m.ingredient?.common_name && (
                            <p className="text-[10px] text-outline mt-0.5 truncate">
                              {m.ingredient.common_name}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${getScoreColor(score)}`}>
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

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`label-caps text-[9px] px-1.5 py-0.5 rounded-sm ${effect.color}`}>
                          {effect.label}
                        </span>
                        {m.ingredient?.ingredient_group && (
                          <span className="label-caps text-[9px] text-outline">
                            {m.ingredient.ingredient_group}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ListModal>
          ) : (
            <div className="bg-surface-container-low rounded-sm p-6 text-on-surface-variant text-sm">
              Henüz içerik eşleşmesi tanımlanmamış
            </div>
          )}
        </section>

        {/* Compatible Products — Cosmetics (hidden when supplement-only need or no cosmetic products match) */}
        {showCosmetic && topScores.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-on-surface mb-4">Kozmetik Öneriler</h2>
          {topScores.length > 0 ? (
            <ListModal
              title="Uyumlu Ürünler"
              count={topScores.length}
              previewCount={6}
              allChildren={
                <div className="divide-y divide-outline-variant/20">
                  {topScores.map((score) => {
                    const product = score.product;
                    if (!product) return null;
                    const compat = Math.round(Number(score.compatibility_score));
                    return (
                      <Link
                        key={score.product_need_score_id}
                        href={`/urunler/${product.product_slug}`}
                        className="flex items-center gap-3 py-2.5 hover:bg-surface-container-low transition-colors -mx-5 px-5"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-on-surface">
                            {product.product_name}
                          </span>
                          {product.brand && (
                            <span className="text-xs text-outline ml-2">
                              {product.brand.brand_name}
                            </span>
                          )}
                        </div>
                        <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(compat)}`}
                            style={{ width: `${Math.min(100, compat)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${getScoreColor(compat)}`}>
                          %{compat}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              }
            >
              <ProductCarousel>
                {topScores.slice(0, 6).map((score) => {
                  const product = score.product;
                  if (!product) return null;
                  const primaryImg = product.images?.find(i => i.sort_order === 0)?.image_url || product.images?.[0]?.image_url;
                  const hoverImg = product.images?.find(i => i.sort_order === 1)?.image_url;
                  const compat = Math.round(Number(score.compatibility_score));
                  return (
                    <Link
                      key={score.product_need_score_id}
                      href={`/urunler/${product.product_slug}`}
                      className="curator-card overflow-hidden group snap-start shrink-0 w-[220px] sm:w-[240px]"
                    >
                      <div className="h-32 bg-surface-container-low flex items-center justify-center overflow-hidden relative">
                        {primaryImg ? (
                          <>
                            <Image
                              src={primaryImg}
                              alt={product.product_name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className={`object-contain transition-all duration-500 ${hoverImg ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'}`}
                            />
                            {hoverImg && (
                              <Image
                                src={hoverImg}
                                alt={`${product.product_name} - detay`}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-contain opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                              />
                            )}
                          </>
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
              </ProductCarousel>
            </ListModal>
          ) : (
            <div className="bg-surface-container-low rounded-sm p-6 text-on-surface-variant text-sm">
              Henüz uyumlu ürün bulunamadı
            </div>
          )}
        </section>
        )}

        {/* Compatible Products — Supplements (hidden when cosmetic-only need) */}
        {showSupplement && supplementScores.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-on-surface mb-4">
              <span className="material-icon text-primary align-middle mr-2" aria-hidden="true">medication</span>
              Takviye Önerileri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplementScores.slice(0, 6).map((score) => {
                const product = score.product;
                if (!product) return null;
                const primaryImg = product.images?.[0]?.image_url;
                const compat = Math.round(Number(score.compatibility_score));
                return (
                  <Link
                    key={score.product_need_score_id}
                    href={`/takviyeler/${product.product_slug}`}
                    className="curator-card overflow-hidden group"
                  >
                    <div className="h-32 bg-surface-container-low flex items-center justify-center overflow-hidden relative">
                      {primaryImg ? (
                        <Image
                          src={primaryImg}
                          alt={product.product_name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="material-icon text-outline-variant" style={{ fontSize: '48px' }} aria-hidden="true">medication</span>
                      )}
                    </div>
                    <div className="p-3">
                      {product.brand && (
                        <p className="label-caps text-outline">{product.brand.brand_name}</p>
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
          </section>
        )}

        {/* Sprint 5 (#18): Etkileşim Uyarıları — bu ihtiyacın top etken bileşenlerinden */}
        {needInteractions.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-score-medium" aria-hidden="true">sync_alt</span>
              Bu İhtiyaçla Birlikte Dikkat Edilmesi Gerekenler
            </h2>
            <p className="text-xs text-on-surface-variant mb-4">
              Bu ihtiyaç için kullanılan etken bileşenlerin bilinen etkileşimleri.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {needInteractions.slice(0, 6).map((inter) => {
                const cfg = inter.severity === 'severe'
                  ? { color: 'text-error', bg: 'bg-error/5 border-error/20', icon: 'error', label: 'Ciddi' }
                  : inter.severity === 'moderate'
                  ? { color: 'text-score-medium', bg: 'bg-score-medium/5 border-score-medium/20', icon: 'warning', label: 'Orta' }
                  : { color: 'text-primary', bg: 'bg-primary/5 border-primary/20', icon: 'info', label: 'Hafif' };
                return (
                  <details key={inter.interaction_id} className={`group rounded-sm border px-3 py-2 ${cfg.bg}`}>
                    <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <span className={`material-icon ${cfg.color} shrink-0`} style={{ fontSize: '14px' }} aria-hidden="true">{cfg.icon}</span>
                      <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="font-semibold text-on-surface truncate">
                          {inter.ingredient_a?.inci_name || '?'}
                        </span>
                        <span className="text-outline">+</span>
                        <span className="font-semibold text-on-surface truncate">
                          {inter.ingredient_b?.inci_name || '?'}
                        </span>
                        <span className={`label-caps text-[9px] px-1.5 py-0.5 rounded-sm ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <span className="material-icon text-outline-variant group-open:rotate-180 transition-transform shrink-0" style={{ fontSize: '14px' }} aria-hidden="true">
                        expand_more
                      </span>
                    </summary>
                    <div className="mt-2 pt-2 border-t border-outline-variant/15 space-y-1">
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{inter.description}</p>
                      {inter.recommendation && (
                        <p className="text-[10px] text-primary flex items-start gap-1">
                          <span className="material-icon text-[10px] mt-0.5 shrink-0" aria-hidden="true">lightbulb</span>
                          {inter.recommendation}
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}

        {/* Sprint 5 (#18): Sıkça Sorulan Sorular — templated, ihtiyaca göre dinamik */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-icon text-primary" aria-hidden="true">quiz</span>
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-2">
            {faq.map((item, i) => (
              <details key={i} className="group curator-card px-4 py-3">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-start gap-2">
                  <span
                    className="material-icon text-primary mt-0.5 shrink-0"
                    style={{ fontSize: '16px' }}
                    aria-hidden="true"
                  >
                    help_outline
                  </span>
                  <span className="flex-1 text-sm font-semibold text-on-surface">{item.q}</span>
                  <span
                    className="material-icon text-outline-variant group-open:rotate-180 transition-transform shrink-0 mt-1"
                    style={{ fontSize: '14px' }}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </summary>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-3 pt-3 border-t border-outline-variant/15 ml-6">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Profile CTA — cookie-aware (profil varsa gizlenir) */}
        {!hasSkinProfileCookie() && (
          <div className="curator-card p-8 text-center mb-8">
            <h3 className="text-xl headline-tight text-on-surface mb-2">
              BU İHTİYAÇ SENİNLE İLGİLİ Mİ?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Cilt profilini oluştur ve her üründe sana özel uyum skoru gör.
            </p>
            <Link
              href="/profilim"
              className="curator-btn-primary text-[10px] px-8 py-3 inline-block"
            >
              PROFİLİMİ OLUŞTUR
            </Link>
          </div>
        )}

        {/* Back Link */}
        <div className="border-t border-outline-variant/20 pt-8">
          <Link
            href="/ihtiyaclar"
            className="label-caps text-primary hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">arrow_back</span>
            Tüm İhtiyaçlar
          </Link>
        </div>
      </article>
    </>
  );
}
