import { Metadata } from 'next';
import Link from 'next/link';
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
    return { title: 'İçerik Bulunamadı' };
  }

  const title = ingredient.common_name
    ? `${ingredient.inci_name} (${ingredient.common_name})`
    : ingredient.inci_name;
  const description =
    ingredient.function_summary ||
    `${ingredient.inci_name} içerik maddesi hakkında bilimsel bilgi, etkileri ve güvenlik profili.`;

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
      canonical: `/icerikler/${ingredient.ingredient_slug}`,
    },
  };
}

// === Helpers ===

function evidenceLabel(level: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    systematic_review: { label: 'Sistematik Derleme', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    randomized_controlled: { label: 'Randomize Kontrollü', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    cohort_study: { label: 'Kohort Çalışma', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    case_control: { label: 'Vaka-Kontrol', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
    expert_opinion: { label: 'Uzman Görüşü', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    in_vitro: { label: 'In Vitro', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    traditional_use: { label: 'Geleneksel Kullanım', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    anecdotal: { label: 'Anekdotal', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
    strong: { label: 'Güçlü Kanıt', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    moderate: { label: 'Orta Kanıt', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    limited: { label: 'Sınırlı Kanıt', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    insufficient: { label: 'Yetersiz Kanıt', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
  };
  return map[level] || { label: level.replace(/_/g, ' '), color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
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
      `${ingredient.inci_name} kozmetik içerik maddesi hakkında bilgi.`,
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
    ingredient.allergen_flag && { label: 'Alerjen', icon: '⚠️', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    ingredient.fragrance_flag && { label: 'Parfüm/Koku', icon: '🌸', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    ingredient.preservative_flag && { label: 'Koruyucu', icon: '🛡️', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  ].filter(Boolean) as { label: string; icon: string; bg: string; border: string; text: string }[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ingredientJsonLd(ingredient)) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1">
          <Link href="/icerikler" className="hover:text-primary">
            İçerikler
          </Link>
          <span>/</span>
          <span className="text-gray-600">{ingredient.inci_name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white border rounded-xl p-6 md:p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {ingredient.inci_name}
          </h1>
          {ingredient.common_name && (
            <p className="text-lg text-primary font-medium mt-1">
              {ingredient.common_name}
            </p>
          )}

          {/* Aliases */}
          {ingredient.aliases && ingredient.aliases.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              Diğer adları:{' '}
              {ingredient.aliases.map((a) => a.alias_name).join(', ')}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {ingredient.ingredient_group && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                {ingredient.ingredient_group}
              </span>
            )}
            {ingredient.origin_type && (
              <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200">
                {originLabel(ingredient.origin_type)}
              </span>
            )}
            {evidence && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${evidence.bg} ${evidence.color}`}
              >
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${flag.bg} ${flag.border}`}
              >
                <span>{flag.icon}</span>
                <span className={`text-sm font-medium ${flag.text}`}>
                  {flag.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sensitivity Note */}
        {ingredient.sensitivity_note && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm font-semibold text-yellow-800 mb-1">
              Hassasiyet Notu
            </p>
            <p className="text-sm text-yellow-700 leading-relaxed">
              {ingredient.sensitivity_note}
            </p>
          </div>
        )}

        {/* Function Summary */}
        {ingredient.function_summary && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Ne İşe Yarar?</h2>
            <p className="text-gray-600 leading-relaxed">
              {ingredient.function_summary}
            </p>
          </section>
        )}

        {/* Detailed Description */}
        {ingredient.detailed_description && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Detaylı Bilgi</h2>
            <div className="bg-gray-50 rounded-lg p-5">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {ingredient.detailed_description}
              </p>
            </div>
          </section>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Kanıt Seviyesi</p>
            <p className={`text-lg font-bold ${evidence ? evidence.color : 'text-gray-400'}`}>
              {evidence ? evidence.label : 'Belirtilmemiş'}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Grup</p>
            <p className="text-lg font-bold text-gray-800">
              {ingredient.ingredient_group || 'Belirtilmemiş'}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Kaynak</p>
            <p className="text-lg font-bold text-gray-800">
              {ingredient.origin_type ? originLabel(ingredient.origin_type) : 'Belirtilmemiş'}
            </p>
          </div>
        </div>

        {/* Evidence Links */}
        {ingredient.evidence_links && ingredient.evidence_links.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Bilimsel Kaynaklar</h2>
            <div className="space-y-3">
              {ingredient.evidence_links.map((el) => (
                <a
                  key={el.link_id}
                  href={el.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-primary mt-0.5">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 hover:text-primary">
                        {el.source_title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {el.source_type && (
                          <span className="text-xs text-gray-400">
                            {sourceTypeLabel(el.source_type)}
                          </span>
                        )}
                        {el.publication_year && (
                          <span className="text-xs text-gray-400">
                            ({el.publication_year})
                          </span>
                        )}
                      </div>
                      {el.summary_note && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                          {el.summary_note}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-primary shrink-0">Kaynak &rarr;</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Products containing this ingredient */}
        {products.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">
              Bu İçeriği Barındıran Ürünler
              <span className="text-sm font-normal text-gray-400 ml-2">
                {products.length} ürün
              </span>
            </h2>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
                {products.map((p) => {
                  const img = p.images?.[0]?.image_url;
                  return (
                    <Link
                      key={p.product_id}
                      href={`/urunler/${p.product_slug}`}
                      className="flex-shrink-0 w-48 snap-start bg-white border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group"
                    >
                      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                        {img ? (
                          <img
                            src={img}
                            alt={p.product_name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-4xl text-gray-200">📦</span>
                        )}
                      </div>
                      <div className="p-3">
                        {p.brand && (
                          <p className="text-[10px] text-primary font-semibold truncate">
                            {p.brand.brand_name}
                          </p>
                        )}
                        <p className="text-xs font-medium text-gray-800 line-clamp-2 mt-0.5 leading-snug">
                          {p.product_name}
                        </p>
                        {p.category && (
                          <p className="text-[10px] text-gray-400 mt-1 truncate">
                            {p.category.category_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Fade edges */}
              <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="border-t pt-8">
          <Link
            href="/icerikler"
            className="text-primary hover:underline text-sm font-medium"
          >
            &larr; Tüm İçerik Maddeleri
          </Link>
        </div>
      </article>
    </>
  );
}
