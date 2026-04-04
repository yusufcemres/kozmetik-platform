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
  aliases?: IngredientAlias[];
  evidence_links?: EvidenceLink[];
}

interface ProductInCarousel {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand?: { brand_id: number; brand_name: string; brand_slug: string };
  category?: { category_id: number; category_name: string };
  images?: { image_url: string; alt_text?: string }[];
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
    return { title: 'Icerik Bulunamadi' };
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

  const products = await getProductsByIngredient(ingredient.ingredient_id);

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

      <article className="curator-section max-w-4xl mx-auto">
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
                  const img = p.images?.[0]?.image_url;
                  return (
                    <Link
                      key={p.product_id}
                      href={`/urunler/${p.product_slug}`}
                      className="flex-shrink-0 w-48 snap-start curator-card overflow-hidden group"
                    >
                      <div className="aspect-square bg-surface-container-low flex items-center justify-center overflow-hidden relative">
                        {img ? (
                          <Image
                            src={img}
                            alt={p.product_name}
                            fill
                            sizes="192px"
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                          />
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
