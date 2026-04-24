import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';

// === Types ===

interface IngredientAlias {
  alias_name: string;
  language?: string;
}

interface EvidenceLink {
  link_id: number;
  source_url: string;
  source_title: string;
  source_type?: string;
  publication_year?: number;
  summary_note?: string;
}

interface FoodSource {
  food_name: string;
  amount_per_100g: number;
  unit: string;
  bioavailability?: string;
  note?: string;
}

interface NeedMapping {
  mapping_id: number;
  relevance_score: number;
  effect_type: string;
  need?: {
    need_id: number;
    need_name: string;
    need_slug: string;
  };
}

interface Ingredient {
  ingredient_id: number;
  inci_name: string;
  common_name?: string;
  ingredient_slug: string;
  ingredient_group?: string;
  origin_type?: string;
  function_summary?: string;
  detailed_description?: string;
  sensitivity_note?: string;
  allergen_flag: boolean;
  fragrance_flag: boolean;
  preservative_flag: boolean;
  evidence_level?: string;
  safety_class?: string;
  safety_note?: string;
  // Sprint 5 (#14): tartışmalı içerik narrative + safety flags
  safety_narrative?: string;
  controversy_summary?: string;
  cmr_class?: string;
  iarc_group?: string;
  endocrine_flag?: boolean;
  eu_banned?: boolean;
  eu_restricted?: boolean;
  sccs_opinion_ref?: string;
  cir_status?: string;
  food_sources?: FoodSource[];
  daily_recommended_value?: number;
  daily_recommended_unit?: string;
  aliases?: IngredientAlias[];
  evidence_links?: EvidenceLink[];
}

interface ProductInCarousel {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand?: { brand_id: number; brand_name: string; brand_slug: string };
  category?: { category_id: number; category_name: string };
  images?: { image_url: string; alt_text?: string; sort_order?: number }[];
}

// === Data ===

async function getIngredient(slug: string): Promise<Ingredient | null> {
  try {
    return await apiFetch<Ingredient>(`/ingredients/slug/${slug}`, {
      next: { revalidate: 300 },
    } as any);
  } catch {
    return null;
  }
}

async function getNeedMappings(ingredientId: number): Promise<NeedMapping[]> {
  try {
    return await apiFetch<NeedMapping[]>(`/ingredient-need-mappings/by-ingredient/${ingredientId}`, {
      next: { revalidate: 300 },
    } as any);
  } catch {
    return [];
  }
}

async function getProductsByIngredient(ingredientId: number, domainType?: string): Promise<ProductInCarousel[]> {
  try {
    const domainQuery = domainType ? `&domain_type=${domainType}` : '';
    return await apiFetch<ProductInCarousel[]>(`/products/by-ingredient/${ingredientId}?limit=12${domainQuery}`, {
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
  const ingredient = await getIngredient(params.slug);
  if (!ingredient) {
    return { title: 'İçerik Bulunamadı' };
  }

  const title = ingredient.common_name
    ? `${ingredient.inci_name} (${ingredient.common_name})`
    : ingredient.inci_name;
  const description =
    ingredient.function_summary ||
    `${ingredient.inci_name} icerik maddesi hakkinda bilimsel bilgi, etkileri ve guvenlik profili.`;

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
      canonical: `/icerikler/${ingredient.ingredient_slug}`,
    },
  };
}

// === Helpers ===

function evidenceLabel(level: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    systematic_review: { label: 'Sistematik Derleme', color: 'text-score-high' },
    randomized_controlled: { label: 'Randomize Kontrollu', color: 'text-score-high' },
    cohort_study: { label: 'Kohort Çalışma', color: 'text-primary' },
    case_control: { label: 'Vaka-Kontrol', color: 'text-primary' },
    expert_opinion: { label: 'Uzman Görüşü', color: 'text-score-medium' },
    in_vitro: { label: 'In Vitro', color: 'text-on-surface-variant' },
    traditional_use: { label: 'Geleneksel Kullanım', color: 'text-on-surface-variant' },
    anecdotal: { label: 'Anekdotal', color: 'text-outline' },
    strong: { label: 'Güçlü Kanıt', color: 'text-score-high' },
    moderate: { label: 'Orta Kanıt', color: 'text-primary' },
    limited: { label: 'Sınırlı Kanıt', color: 'text-score-medium' },
    insufficient: { label: 'Yetersiz Kanıt', color: 'text-outline' },
  };
  return map[level] || { label: level.replace(/_/g, ' '), color: 'text-outline' };
}

function originLabel(type: string): string {
  const map: Record<string, string> = {
    natural: 'Doğal',
    synthetic: 'Sentetik',
    semi_synthetic: 'Yarı-sentetik',
    biotechnology: 'Biyoteknoloji',
  };
  return map[type] || type;
}

function safetyClassLabel(cls: string): { label: string; color: string; icon: string } {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    beneficial: { label: 'Faydalı', color: 'text-score-high bg-score-high/10', icon: 'verified' },
    neutral: { label: 'Nötr', color: 'text-on-surface-variant bg-surface-container-low', icon: 'remove_circle_outline' },
    questionable: { label: 'Tartışmalı', color: 'text-score-medium bg-score-medium/10', icon: 'help_outline' },
    harmful: { label: 'Riskli', color: 'text-error bg-error/10', icon: 'dangerous' },
  };
  return map[cls] || { label: cls, color: 'text-outline', icon: 'info' };
}

function effectTypeLabel(type: string): string {
  const map: Record<string, string> = {
    direct_support: 'Doğrudan Destek',
    indirect_support: 'Dolaylı Destek',
    complementary: 'Tamamlayıcı',
    caution_related: 'Dikkat',
    positive: 'Olumlu Etki',
    negative: 'Olumsuz Etki',
  };
  return map[type] || type.replace(/_/g, ' ');
}

function sourceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    pubmed: 'PubMed',
    journal: 'Bilimsel Dergi',
    book: 'Kitap',
    fda: 'FDA',
    eu_regulation: 'AB Regülasyonu',
  };
  return map[type] || type;
}

// === JSON-LD ===

function ingredientJsonLd(ingredient: Ingredient) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalEntity',
    name: ingredient.inci_name,
    alternateName: ingredient.common_name || undefined,
    description:
      ingredient.function_summary ||
      `${ingredient.inci_name} kozmetik icerik maddesi hakkinda bilgi.`,
    ...(ingredient.evidence_links && ingredient.evidence_links.length > 0
      ? {
          citation: ingredient.evidence_links.map((el) => ({
            '@type': 'ScholarlyArticle',
            name: el.source_title,
            url: el.source_url,
            ...(el.publication_year ? { datePublished: String(el.publication_year) } : {}),
          })),
        }
      : {}),
  };
}

function ingredientBreadcrumbJsonLd(ingredient: Ingredient) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://revela.com.tr';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: base },
      { '@type': 'ListItem', position: 2, name: 'İçerikler', item: `${base}/icerikler` },
      {
        '@type': 'ListItem',
        position: 3,
        name: ingredient.inci_name,
        item: `${base}/icerikler/${ingredient.ingredient_slug}`,
      },
    ],
  };
}

// === Page ===

export default async function IngredientDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const ingredient = await getIngredient(params.slug);
  if (!ingredient) notFound();

  const [cosmeticProducts, supplementProducts, needMappings] = await Promise.all([
    getProductsByIngredient(ingredient.ingredient_id, 'cosmetic'),
    getProductsByIngredient(ingredient.ingredient_id, 'supplement'),
    getNeedMappings(ingredient.ingredient_id),
  ]);

  const sortedMappings = [...needMappings]
    .filter((m) => m.need)
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

  const safety = ingredient.safety_class ? safetyClassLabel(ingredient.safety_class) : null;

  const evidence = ingredient.evidence_level
    ? evidenceLabel(ingredient.evidence_level)
    : null;

  const flags = [
    ingredient.allergen_flag && { label: 'Alerjen', icon: 'warning', color: 'text-error bg-error/10 border-error/20' },
    ingredient.fragrance_flag && { label: 'Parfum/Koku', icon: 'spa', color: 'text-on-surface-variant bg-tertiary-container border-tertiary-container' },
    ingredient.preservative_flag && { label: 'Koruyucu', icon: 'shield', color: 'text-primary bg-primary/5 border-primary/20' },
  ].filter(Boolean) as { label: string; icon: string; color: string }[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ingredientJsonLd(ingredient)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ingredientBreadcrumbJsonLd(ingredient)) }}
      />

      <article className="curator-section max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="label-caps text-outline mb-4 flex items-center gap-2">
          <Link href="/icerikler" className="hover:text-primary transition-colors">
            İçerikler
          </Link>
          <span className="material-icon material-icon-sm" aria-hidden="true">chevron_right</span>
          <span className="text-on-surface-variant">{ingredient.inci_name}</span>
        </nav>

        {/* Header */}
        <div className="curator-card p-4 md:p-5 mb-4">
          <h1 className="text-2xl md:text-3xl headline-tight text-on-surface">
            {ingredient.inci_name}
          </h1>
          {ingredient.common_name && (
            <p className="text-base text-primary font-medium mt-0.5">
              {ingredient.common_name}
            </p>
          )}

          {/* Aliases */}
          {ingredient.aliases && ingredient.aliases.length > 0 && (
            <p className="text-xs text-outline mt-1.5">
              Diğer adları:{' '}
              {ingredient.aliases.map((a) => a.alias_name).join(', ')}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ingredient.ingredient_group && (
              <span className="label-caps text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-sm border border-outline-variant/20">
                {ingredient.ingredient_group}
              </span>
            )}
            {ingredient.origin_type && (
              <span className="label-caps text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-sm border border-outline-variant/20">
                {originLabel(ingredient.origin_type)}
              </span>
            )}
            {evidence && (
              <span className={`label-caps px-2 py-0.5 rounded-sm bg-surface-container-low border border-outline-variant/20 ${evidence.color}`}>
                {evidence.label}
              </span>
            )}
            {safety && (
              <span className={`label-caps px-2 py-0.5 rounded-sm flex items-center gap-1 ${safety.color}`}>
                <span className="material-icon text-[10px]" aria-hidden="true">{safety.icon}</span>
                {safety.label}
              </span>
            )}
          </div>
        </div>

        {/* Warning Flags */}
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {flags.map((flag) => (
              <div
                key={flag.label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border ${flag.color}`}
              >
                <span className="material-icon" style={{ fontSize: '14px' }} aria-hidden="true">{flag.icon}</span>
                <span className="text-xs font-medium">
                  {flag.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sensitivity Note */}
        {ingredient.sensitivity_note && (
          <div className="bg-tertiary-container border border-outline-variant/20 rounded-sm p-3 mb-4">
            <p className="text-xs font-semibold text-on-surface mb-0.5">
              Hassasiyet Notu
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {ingredient.sensitivity_note}
            </p>
          </div>
        )}

        {/* Function Summary */}
        {ingredient.function_summary && (
          <section className="mb-4">
            <h2 className="text-lg font-bold text-on-surface mb-2">Ne İşe Yarar?</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {ingredient.function_summary}
            </p>
          </section>
        )}

        {/* Detailed Description */}
        {ingredient.detailed_description && (
          <section className="mb-4">
            <h2 className="text-lg font-bold text-on-surface mb-2">Detaylı Bilgi</h2>
            <div className="bg-surface-container-low rounded-sm p-4">
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                {ingredient.detailed_description}
              </p>
            </div>
          </section>
        )}

        {/* Info Cards — inline compact */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          <div className="curator-card p-2">
            <p className="label-caps text-outline text-[9px]">Kanıt</p>
            <p className={`text-xs font-bold leading-tight mt-0.5 ${evidence ? evidence.color : 'text-outline'}`}>
              {evidence ? evidence.label : '—'}
            </p>
          </div>
          <div className="curator-card p-2">
            <p className="label-caps text-outline text-[9px]">Grup</p>
            <p className="text-xs font-bold text-on-surface leading-tight mt-0.5 truncate" title={ingredient.ingredient_group || ''}>
              {ingredient.ingredient_group || '—'}
            </p>
          </div>
          <div className="curator-card p-2">
            <p className="label-caps text-outline text-[9px]">Kaynak</p>
            <p className="text-xs font-bold text-on-surface leading-tight mt-0.5 truncate">
              {ingredient.origin_type ? originLabel(ingredient.origin_type) : '—'}
            </p>
          </div>
        </div>

        {/* Evidence Links */}
        {ingredient.evidence_links && ingredient.evidence_links.length > 0 && (
          <section className="mb-4">
            <h2 className="text-lg font-bold text-on-surface mb-2">Bilimsel Kaynaklar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {ingredient.evidence_links.map((el) => (
                <a
                  key={el.link_id}
                  href={el.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block curator-card p-2 group"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="material-icon text-primary mt-0.5 text-[14px]" aria-hidden="true">description</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-on-surface group-hover:text-primary transition-colors leading-snug">
                        {el.source_title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {el.source_type && (
                          <span className="label-caps text-[9px] text-outline">
                            {sourceTypeLabel(el.source_type)}
                          </span>
                        )}
                        {el.publication_year && (
                          <span className="label-caps text-[9px] text-outline">
                            ({el.publication_year})
                          </span>
                        )}
                      </div>
                      {el.summary_note && (
                        <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                          {el.summary_note}
                        </p>
                      )}
                    </div>
                    <span className="material-icon text-primary shrink-0 text-[14px]" aria-hidden="true">arrow_forward</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Need Mappings — which needs does this ingredient help? */}
        {sortedMappings.length > 0 && (
          <section className="mb-4">
            <h2 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-icon text-primary text-[18px]" aria-hidden="true">target</span>
              Hangi İhtiyaçlara İyi Gelir?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
              {sortedMappings.slice(0, 12).map((m) => {
                const score = Math.round(m.relevance_score || 0);
                const scoreColor = score >= 70 ? 'text-score-high' : score >= 40 ? 'text-score-medium' : 'text-score-low';
                const barColor = score >= 70 ? 'bg-score-high' : score >= 40 ? 'bg-score-medium' : 'bg-score-low';
                return (
                  <Link
                    key={m.mapping_id}
                    href={`/ihtiyaclar/${m.need!.need_slug}`}
                    className="curator-card p-2 group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-[11px] font-medium text-on-surface group-hover:text-primary transition-colors leading-tight truncate flex-1" title={m.need!.need_name}>
                        {m.need!.need_name}
                      </p>
                      <span className={`text-[11px] font-bold tabular-nums shrink-0 ${scoreColor}`}>%{score}</span>
                    </div>
                    <div className="mt-1 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, score)}%` }} />
                    </div>
                    <p className="label-caps text-outline text-[8px] mt-1 truncate">{effectTypeLabel(m.effect_type)}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Safety Note (from new field) */}
        {ingredient.safety_note && (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 mb-4">
            <p className="text-xs font-semibold text-on-surface mb-0.5 flex items-center gap-1">
              <span className="material-icon text-[14px]" aria-hidden="true">shield</span>
              Güvenlik Notu
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">{ingredient.safety_note}</p>
          </div>
        )}

        {/* Sprint 5 (#14): Güvenlik & Tartışma — disputed/regulated içerikler */}
        {(ingredient.safety_narrative ||
          ingredient.controversy_summary ||
          ingredient.endocrine_flag ||
          ingredient.cmr_class ||
          ingredient.iarc_group ||
          ingredient.eu_banned ||
          ingredient.eu_restricted) && (
          <section className="mb-4">
            <div className="curator-card border-l-4 border-score-medium overflow-hidden">
              <div className="bg-score-medium/5 px-4 py-2 flex items-center gap-2">
                <span className="material-icon text-score-medium text-[18px]" aria-hidden="true">
                  warning
                </span>
                <h2 className="text-base font-bold text-on-surface">
                  Güvenlik & Tartışma
                </h2>
              </div>

              <div className="p-4">
                {/* Regulatory flags */}
                {(ingredient.endocrine_flag ||
                  ingredient.cmr_class ||
                  ingredient.iarc_group ||
                  ingredient.eu_banned ||
                  ingredient.eu_restricted) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ingredient.endocrine_flag && (
                      <span className="label-caps text-[10px] px-2 py-1 rounded-sm bg-error/10 text-error">
                        Endokrin Bozucu Şüphesi
                      </span>
                    )}
                    {ingredient.cmr_class && (
                      <span className="label-caps text-[10px] px-2 py-1 rounded-sm bg-error/10 text-error">
                        CMR {ingredient.cmr_class}
                      </span>
                    )}
                    {ingredient.iarc_group && (
                      <span className="label-caps text-[10px] px-2 py-1 rounded-sm bg-score-medium/10 text-score-medium">
                        IARC Grup {ingredient.iarc_group}
                      </span>
                    )}
                    {ingredient.eu_banned && (
                      <span className="label-caps text-[10px] px-2 py-1 rounded-sm bg-error/10 text-error">
                        AB Yasaklı
                      </span>
                    )}
                    {ingredient.eu_restricted && (
                      <span className="label-caps text-[10px] px-2 py-1 rounded-sm bg-score-medium/10 text-score-medium">
                        AB Kısıtlı
                      </span>
                    )}
                    {ingredient.sccs_opinion_ref && (
                      <span className="label-caps text-[10px] px-2 py-1 rounded-sm bg-surface-container-low text-on-surface-variant">
                        SCCS {ingredient.sccs_opinion_ref}
                      </span>
                    )}
                    {ingredient.cir_status && (
                      <span className="label-caps text-[10px] px-2 py-1 rounded-sm bg-surface-container-low text-on-surface-variant">
                        CIR: {ingredient.cir_status}
                      </span>
                    )}
                  </div>
                )}

                {/* Short summary */}
                {ingredient.controversy_summary && (
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4 font-medium">
                    {ingredient.controversy_summary}
                  </p>
                )}

                {/* Narrative — markdown body */}
                {ingredient.safety_narrative && (
                  <details open className="group">
                    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                        Detaylı Bilgi
                      </span>
                      <span
                        className="material-icon text-outline-variant group-open:rotate-180 transition-transform"
                        style={{ fontSize: '16px' }}
                        aria-hidden="true"
                      >
                        expand_more
                      </span>
                    </summary>
                    <div className="prose prose-sm max-w-none text-on-surface-variant whitespace-pre-line text-xs leading-relaxed">
                      {ingredient.safety_narrative}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Food Sources */}
        {ingredient.food_sources && ingredient.food_sources.length > 0 && (
          <section className="mb-4">
            <h2 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
              <span className="material-icon text-primary text-[18px]" aria-hidden="true">restaurant</span>
              Doğal Kaynaklar
            </h2>
            {ingredient.daily_recommended_value && (
              <p className="text-xs text-on-surface-variant mb-2">
                Günlük önerilen miktar: <strong>{ingredient.daily_recommended_value} {ingredient.daily_recommended_unit || 'mg'}</strong>
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-2 px-3 label-caps text-outline">Gıda</th>
                    <th className="text-right py-2 px-3 label-caps text-outline">100g&apos;da</th>
                    <th className="text-right py-2 px-3 label-caps text-outline">Biyoyararlanım</th>
                    <th className="text-left py-2 px-3 label-caps text-outline">Not</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredient.food_sources.map((fs, i) => (
                    <tr key={i} className="border-b border-outline-variant/10">
                      <td className="py-2.5 px-3 font-medium text-on-surface">{fs.food_name}</td>
                      <td className="py-2.5 px-3 text-right text-on-surface-variant">{fs.amount_per_100g} {fs.unit}</td>
                      <td className="py-2.5 px-3 text-right">
                        {fs.bioavailability && (
                          <span className={`label-caps px-2 py-0.5 rounded-sm ${
                            fs.bioavailability === 'Yuksek' ? 'text-score-high bg-score-high/10' :
                            fs.bioavailability === 'Orta' ? 'text-score-medium bg-score-medium/10' :
                            'text-outline bg-surface-container-low'
                          }`}>{fs.bioavailability}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-on-surface-variant">{fs.note || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-outline mt-3">
              Gıdalardan alınan vitaminlerin biyoyararlanımı genellikle takviyelerden daha yüksektir. Dengeli beslenme takviyeye tercih edilmelidir.
            </p>
          </section>
        )}

        {/* Products containing this ingredient — Cosmetics */}
        {cosmeticProducts.length > 0 && (
          <section className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-icon text-primary text-[18px]" aria-hidden="true">spa</span>
                Kozmetik Ürünler
              </h2>
              <span className="label-caps text-outline">
                {cosmeticProducts.length} ürün
              </span>
            </div>
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
                {cosmeticProducts.map((p) => {
                  const primaryImg = p.images?.find(i => i.sort_order === 0)?.image_url || p.images?.[0]?.image_url;
                  const hoverImg = p.images?.find(i => i.sort_order === 1)?.image_url;
                  return (
                    <Link
                      key={p.product_id}
                      href={`/urunler/${p.product_slug}`}
                      className="flex-shrink-0 w-36 snap-start curator-card overflow-hidden group"
                    >
                      <div className="aspect-square bg-surface-container-low flex items-center justify-center overflow-hidden relative">
                        {primaryImg ? (
                          <>
                            <Image
                              src={primaryImg}
                              alt={p.product_name}
                              fill
                              sizes="192px"
                              className={`object-contain transition-all duration-500 ${hoverImg ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'}`}
                            />
                            {hoverImg && (
                              <Image
                                src={hoverImg}
                                alt={`${p.product_name} - detay`}
                                fill
                                sizes="192px"
                                className="object-contain opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                              />
                            )}
                          </>
                        ) : (
                          <span className="material-icon material-icon-lg text-outline-variant" aria-hidden="true">spa</span>
                        )}
                      </div>
                      <div className="p-2">
                        {p.brand && (
                          <p className="label-caps text-outline text-[9px] truncate">
                            {p.brand.brand_name}
                          </p>
                        )}
                        <p className="text-[11px] font-medium text-on-surface line-clamp-2 leading-tight">
                          {p.product_name}
                        </p>
                        {p.category && (
                          <p className="label-caps text-outline-variant text-[9px] mt-0.5 truncate">
                            {p.category.category_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-surface to-transparent pointer-events-none" />
            </div>
          </section>
        )}

        {/* Products containing this ingredient — Supplements */}
        {supplementProducts.length > 0 && (
          <section className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-icon text-primary text-[18px]" aria-hidden="true">medication</span>
                Takviye Ürünler
              </h2>
              <span className="label-caps text-outline">
                {supplementProducts.length} ürün
              </span>
            </div>
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
                {supplementProducts.map((p) => {
                  const primaryImg = p.images?.find(i => i.sort_order === 0)?.image_url || p.images?.[0]?.image_url;
                  return (
                    <Link
                      key={p.product_id}
                      href={`/takviyeler/${p.product_slug}`}
                      className="flex-shrink-0 w-36 snap-start curator-card overflow-hidden group"
                    >
                      <div className="aspect-square bg-surface-container-low flex items-center justify-center overflow-hidden relative">
                        {primaryImg ? (
                          <Image
                            src={primaryImg}
                            alt={p.product_name}
                            fill
                            sizes="192px"
                            className="object-contain transition-all duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="material-icon material-icon-lg text-outline-variant" aria-hidden="true">medication</span>
                        )}
                      </div>
                      <div className="p-2">
                        {p.brand && (
                          <p className="label-caps text-outline text-[9px] truncate">
                            {p.brand.brand_name}
                          </p>
                        )}
                        <p className="text-[11px] font-medium text-on-surface line-clamp-2 leading-tight">
                          {p.product_name}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-surface to-transparent pointer-events-none" />
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="border-t border-outline-variant/20 pt-4">
          <Link
            href="/icerikler"
            className="label-caps text-primary hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">arrow_back</span>
            Tüm İçerik Maddeleri
          </Link>
        </div>
      </article>
    </>
  );
}
