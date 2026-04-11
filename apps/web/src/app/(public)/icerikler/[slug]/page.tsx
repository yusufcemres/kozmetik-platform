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
      next: { revalidate: 3600 },
    } as any);
  } catch {
    return null;
  }
}

async function getNeedMappings(ingredientId: number): Promise<NeedMapping[]> {
  try {
    return await apiFetch<NeedMapping[]>(`/ingredient-need-mappings/by-ingredient/${ingredientId}`, {
      next: { revalidate: 3600 },
    } as any);
  } catch {
    return [];
  }
}

async function getProductsByIngredient(ingredientId: number): Promise<ProductInCarousel[]> {
  try {
    return await apiFetch<ProductInCarousel[]>(`/products/by-ingredient/${ingredientId}?limit=20`, {
      next: { revalidate: 3600 },
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
    cohort_study: { label: 'Kohort Calisma', color: 'text-primary' },
    case_control: { label: 'Vaka-Kontrol', color: 'text-primary' },
    expert_opinion: { label: 'Uzman Gorusu', color: 'text-score-medium' },
    in_vitro: { label: 'In Vitro', color: 'text-on-surface-variant' },
    traditional_use: { label: 'Geleneksel Kullanim', color: 'text-on-surface-variant' },
    anecdotal: { label: 'Anekdotal', color: 'text-outline' },
    strong: { label: 'Guclu Kanit', color: 'text-score-high' },
    moderate: { label: 'Orta Kanit', color: 'text-primary' },
    limited: { label: 'Sinirli Kanit', color: 'text-score-medium' },
    insufficient: { label: 'Yetersiz Kanit', color: 'text-outline' },
  };
  return map[level] || { label: level.replace(/_/g, ' '), color: 'text-outline' };
}

function originLabel(type: string): string {
  const map: Record<string, string> = {
    natural: 'Dogal',
    synthetic: 'Sentetik',
    semi_synthetic: 'Yari-sentetik',
    biotechnology: 'Biyoteknoloji',
  };
  return map[type] || type;
}

function safetyClassLabel(cls: string): { label: string; color: string; icon: string } {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    beneficial: { label: 'Faydali', color: 'text-score-high bg-score-high/10', icon: 'verified' },
    neutral: { label: 'Notr', color: 'text-on-surface-variant bg-surface-container-low', icon: 'remove_circle_outline' },
    questionable: { label: 'Tartismali', color: 'text-score-medium bg-score-medium/10', icon: 'help_outline' },
    harmful: { label: 'Riskli', color: 'text-error bg-error/10', icon: 'dangerous' },
  };
  return map[cls] || { label: cls, color: 'text-outline', icon: 'info' };
}

function effectTypeLabel(type: string): string {
  const map: Record<string, string> = {
    direct_support: 'Dogrudan Destek',
    indirect_support: 'Dolayli Destek',
    complementary: 'Tamamlayici',
    caution_related: 'Dikkat',
  };
  return map[type] || type.replace(/_/g, ' ');
}

function sourceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    pubmed: 'PubMed',
    journal: 'Bilimsel Dergi',
    book: 'Kitap',
    fda: 'FDA',
    eu_regulation: 'AB Regulasyonu',
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

// === Page ===

export default async function IngredientDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const ingredient = await getIngredient(params.slug);
  if (!ingredient) notFound();

  const [products, needMappings] = await Promise.all([
    getProductsByIngredient(ingredient.ingredient_id),
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

      <article className="curator-section max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <nav className="label-caps text-outline mb-8 flex items-center gap-2">
          <Link href="/icerikler" className="hover:text-primary transition-colors">
            Icerikler
          </Link>
          <span className="material-icon material-icon-sm" aria-hidden="true">chevron_right</span>
          <span className="text-on-surface-variant">{ingredient.inci_name}</span>
        </nav>

        {/* Header */}
        <div className="curator-card p-6 md:p-8 mb-8">
          <h1 className="text-2xl md:text-3xl headline-tight text-on-surface">
            {ingredient.inci_name}
          </h1>
          {ingredient.common_name && (
            <p className="text-lg text-primary font-medium mt-1">
              {ingredient.common_name}
            </p>
          )}

          {/* Aliases */}
          {ingredient.aliases && ingredient.aliases.length > 0 && (
            <p className="text-sm text-outline mt-2">
              Diger adlari:{' '}
              {ingredient.aliases.map((a) => a.alias_name).join(', ')}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {ingredient.ingredient_group && (
              <span className="label-caps text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-sm border border-outline-variant/20">
                {ingredient.ingredient_group}
              </span>
            )}
            {ingredient.origin_type && (
              <span className="label-caps text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-sm border border-outline-variant/20">
                {originLabel(ingredient.origin_type)}
              </span>
            )}
            {evidence && (
              <span className={`label-caps px-2.5 py-1 rounded-sm bg-surface-container-low border border-outline-variant/20 ${evidence.color}`}>
                {evidence.label}
              </span>
            )}
            {safety && (
              <span className={`label-caps px-2.5 py-1 rounded-sm flex items-center gap-1 ${safety.color}`}>
                <span className="material-icon text-[12px]" aria-hidden="true">{safety.icon}</span>
                {safety.label}
              </span>
            )}
          </div>
        </div>

        {/* Warning Flags */}
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {flags.map((flag) => (
              <div
                key={flag.label}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-sm border ${flag.color}`}
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">{flag.icon}</span>
                <span className="text-sm font-medium">
                  {flag.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sensitivity Note */}
        {ingredient.sensitivity_note && (
          <div className="bg-tertiary-container border border-outline-variant/20 rounded-sm p-4 mb-8">
            <p className="text-sm font-semibold text-on-surface mb-1">
              Hassasiyet Notu
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {ingredient.sensitivity_note}
            </p>
          </div>
        )}

        {/* Function Summary */}
        {ingredient.function_summary && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-3">Ne Ise Yarar?</h2>
            <p className="text-on-surface-variant leading-relaxed">
              {ingredient.function_summary}
            </p>
          </section>
        )}

        {/* Detailed Description */}
        {ingredient.detailed_description && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-3">Detayli Bilgi</h2>
            <div className="bg-surface-container-low rounded-sm p-5">
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                {ingredient.detailed_description}
              </p>
            </div>
          </section>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="curator-card p-4">
            <p className="label-caps text-outline mb-1">Kanit Seviyesi</p>
            <p className={`text-lg font-bold ${evidence ? evidence.color : 'text-outline'}`}>
              {evidence ? evidence.label : 'Belirtilmemis'}
            </p>
          </div>
          <div className="curator-card p-4">
            <p className="label-caps text-outline mb-1">Grup</p>
            <p className="text-lg font-bold text-on-surface">
              {ingredient.ingredient_group || 'Belirtilmemis'}
            </p>
          </div>
          <div className="curator-card p-4">
            <p className="label-caps text-outline mb-1">Kaynak</p>
            <p className="text-lg font-bold text-on-surface">
              {ingredient.origin_type ? originLabel(ingredient.origin_type) : 'Belirtilmemis'}
            </p>
          </div>
        </div>

        {/* Evidence Links */}
        {ingredient.evidence_links && ingredient.evidence_links.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-4">Bilimsel Kaynaklar</h2>
            <div className="space-y-3">
              {ingredient.evidence_links.map((el) => (
                <a
                  key={el.link_id}
                  href={el.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block curator-card p-4 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="material-icon text-primary mt-0.5" aria-hidden="true">description</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                        {el.source_title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {el.source_type && (
                          <span className="label-caps text-outline">
                            {sourceTypeLabel(el.source_type)}
                          </span>
                        )}
                        {el.publication_year && (
                          <span className="label-caps text-outline">
                            ({el.publication_year})
                          </span>
                        )}
                      </div>
                      {el.summary_note && (
                        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                          {el.summary_note}
                        </p>
                      )}
                    </div>
                    <span className="label-caps text-primary shrink-0">
                      Kaynak <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Need Mappings — which needs does this ingredient help? */}
        {sortedMappings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">target</span>
              Hangi Ihtiyaclara Iyi Gelir?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedMappings.slice(0, 8).map((m) => {
                const score = Math.round(m.relevance_score || 0);
                const scoreColor = score >= 70 ? 'text-score-high' : score >= 40 ? 'text-score-medium' : 'text-score-low';
                const barColor = score >= 70 ? 'bg-score-high' : score >= 40 ? 'bg-score-medium' : 'bg-score-low';
                return (
                  <Link
                    key={m.mapping_id}
                    href={`/ihtiyaclar/${m.need!.need_slug}`}
                    className="curator-card p-4 group flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-surface group-hover:text-primary transition-colors">
                        {m.need!.need_name}
                      </p>
                      <p className="label-caps text-outline mt-0.5">{effectTypeLabel(m.effect_type)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, score)}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${scoreColor}`}>%{score}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Safety Note (from new field) */}
        {ingredient.safety_note && (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 mb-8">
            <p className="text-sm font-semibold text-on-surface mb-1 flex items-center gap-1.5">
              <span className="material-icon text-[16px]" aria-hidden="true">shield</span>
              Guvenlik Notu
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">{ingredient.safety_note}</p>
          </div>
        )}

        {/* Food Sources */}
        {ingredient.food_sources && ingredient.food_sources.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">restaurant</span>
              Dogal Kaynaklar
            </h2>
            {ingredient.daily_recommended_value && (
              <p className="text-sm text-on-surface-variant mb-4">
                Gunluk onerilen miktar: <strong>{ingredient.daily_recommended_value} {ingredient.daily_recommended_unit || 'mg'}</strong>
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-2 px-3 label-caps text-outline">Gida</th>
                    <th className="text-right py-2 px-3 label-caps text-outline">100g&apos;da</th>
                    <th className="text-right py-2 px-3 label-caps text-outline">Biyoyararlanim</th>
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
              Gidalardan alinan vitaminlerin biyoyararlanimi genellikle takviyelerden daha yuksektir. Dengeli beslenme takviyeye tercih edilmelidir.
            </p>
          </section>
        )}

        {/* Products containing this ingredient */}
        {products.length > 0 && (
          <section className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-xl font-bold text-on-surface">
                Bu Icerigi Barindiran Urunler
              </h2>
              <span className="label-caps text-outline">
                {products.length} urun
              </span>
            </div>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
                {products.map((p) => {
                  const primaryImg = p.images?.find(i => i.sort_order === 0)?.image_url || p.images?.[0]?.image_url;
                  const hoverImg = p.images?.find(i => i.sort_order === 1)?.image_url;
                  return (
                    <Link
                      key={p.product_id}
                      href={`/urunler/${p.product_slug}`}
                      className="flex-shrink-0 w-48 snap-start curator-card overflow-hidden group"
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
                          <span className="material-icon material-icon-lg text-outline-variant" aria-hidden="true">inventory_2</span>
                        )}
                      </div>
                      <div className="p-3">
                        {p.brand && (
                          <p className="label-caps text-outline truncate">
                            {p.brand.brand_name}
                          </p>
                        )}
                        <p className="text-xs font-medium text-on-surface line-clamp-2 mt-0.5 leading-snug">
                          {p.product_name}
                        </p>
                        {p.category && (
                          <p className="label-caps text-outline-variant mt-1 truncate">
                            {p.category.category_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Fade edge */}
              <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-surface to-transparent pointer-events-none" />
            </div>
            {products.length > 6 && (
              <Link
                href={`/urunler?ingredient=${ingredient.ingredient_slug}`}
                className="inline-flex items-center gap-1 label-caps text-primary mt-3 hover:underline underline-offset-4"
              >
                Tum {products.length} urunu gor <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            )}
          </section>
        )}

        {/* Back Link */}
        <div className="border-t border-outline-variant/20 pt-8">
          <Link
            href="/icerikler"
            className="label-caps text-primary hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">arrow_back</span>
            Tum Icerik Maddeleri
          </Link>
        </div>
      </article>
    </>
  );
}
