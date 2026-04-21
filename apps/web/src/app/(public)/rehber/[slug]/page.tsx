import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface RelatedProduct {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name?: string;
}
interface RelatedIngredient {
  ingredient_id: number;
  inci_name: string;
  ingredient_slug: string;
  common_name?: string;
}
interface RelatedNeed {
  need_id: number;
  need_name: string;
  need_slug: string;
  user_friendly_label?: string;
}

interface Article {
  article_id: number;
  title: string;
  slug: string;
  content_type: string;
  summary?: string;
  body_markdown?: string;
  published_at?: string;
  related_products?: RelatedProduct[];
  related_ingredients?: RelatedIngredient[];
  related_needs?: RelatedNeed[];
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    return await apiFetch<Article>(`/articles/slug/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Makale bulunamadı' };

  return {
    title: article.title,
    description: article.summary || `${article.title} — REVELA Rehber`,
    openGraph: {
      title: article.title,
      description: article.summary || '',
      type: 'article',
      publishedTime: article.published_at,
    },
  };
}

const CONTENT_TYPES: Record<string, { label: string; icon: string }> = {
  guide: { label: 'Rehber', icon: 'menu_book' },
  ingredient_explainer: { label: 'İçerik İnceleme', icon: 'science' },
  need_guide: { label: 'İhtiyaç Rehberi', icon: 'target' },
  label_reading: { label: 'Etiket Okuma', icon: 'label' },
  comparison: { label: 'Karşılaştırma', icon: 'compare' },
  news: { label: 'Haber', icon: 'newspaper' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Simple markdown-to-HTML: supports ## headings, **bold**, - lists, | tables |, paragraphs
function renderMarkdown(md: string): string {
  return md
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // Headings
      if (trimmed.startsWith('### '))
        return `<h3 class="text-lg font-bold text-on-surface mt-6 mb-2">${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith('## '))
        return `<h2 class="text-xl font-bold text-on-surface mt-8 mb-3">${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith('# '))
        return `<h1 class="text-2xl font-bold text-on-surface mt-8 mb-3">${trimmed.slice(2)}</h1>`;
      // Table block (GFM pipe tables)
      if (trimmed.startsWith('|')) {
        const rows = trimmed.split('\n').filter((r) => r.trim().startsWith('|'));
        if (rows.length >= 2 && /^\|\s*:?-+/.test(rows[1])) {
          const parseCells = (row: string) =>
            row
              .replace(/^\||\|$/g, '')
              .split('|')
              .map((c) => c.trim());
          const header = parseCells(rows[0]);
          const bodyRows = rows.slice(2).map(parseCells);
          const th = header
            .map(
              (c) =>
                `<th class="border border-outline-variant/30 px-3 py-2 text-left font-semibold text-on-surface bg-surface-container-low">${inlineFormat(c)}</th>`,
            )
            .join('');
          const tbody = bodyRows
            .map(
              (cells) =>
                `<tr>${cells
                  .map(
                    (c) =>
                      `<td class="border border-outline-variant/30 px-3 py-2 text-on-surface-variant align-top">${inlineFormat(c)}</td>`,
                  )
                  .join('')}</tr>`,
            )
            .join('');
          return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse text-sm"><thead><tr>${th}</tr></thead><tbody>${tbody}</tbody></table></div>`;
        }
      }
      // List block
      if (trimmed.startsWith('- ')) {
        const items = trimmed
          .split('\n')
          .filter((l) => l.startsWith('- '))
          .map((l) => `<li class="ml-4">${inlineFormat(l.slice(2))}</li>`)
          .join('');
        return `<ul class="list-disc space-y-1 my-3 text-on-surface-variant">${items}</ul>`;
      }
      // Paragraph
      return `<p class="text-on-surface-variant leading-relaxed my-3">${inlineFormat(trimmed.replace(/\n/g, '<br/>'))}</p>`;
    })
    .join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function inlineFormat(text: string): string {
  const safe = escapeHtml(text);
  return safe
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-on-surface">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-surface-container-low px-1 rounded-sm text-sm">$1</code>');
}

export default async function GuideDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const cfg = CONTENT_TYPES[article.content_type] || CONTENT_TYPES.guide;

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <nav className="label-caps text-outline mb-8 flex items-center gap-2">
        <Link href="/rehber" className="hover:text-primary transition-colors">
          Rehber
        </Link>
        <span className="material-icon material-icon-sm" aria-hidden="true">chevron_right</span>
        <span className="text-on-surface-variant truncate">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-icon text-outline-variant" aria-hidden="true">{cfg.icon}</span>
          <span className="label-caps text-primary bg-primary/5 px-2 py-0.5 rounded-sm">
            {cfg.label}
          </span>
          {article.published_at && (
            <span className="label-caps text-outline">
              {formatDate(article.published_at)}
            </span>
          )}
        </div>
        <h1 className="text-3xl headline-tight text-on-surface mb-3">{article.title}</h1>
        {article.summary && (
          <p className="text-lg text-on-surface-variant leading-relaxed">{article.summary}</p>
        )}
      </header>

      <div className="curator-divider mb-8" />

      {/* Body */}
      {article.body_markdown ? (
        <article
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body_markdown) }}
        />
      ) : (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">article</span>
          <p className="text-on-surface-variant">Makale içeriği henüz eklenmemiş</p>
        </div>
      )}

      {/* Related entities */}
      {((article.related_ingredients?.length ?? 0) > 0 ||
        (article.related_needs?.length ?? 0) > 0 ||
        (article.related_products?.length ?? 0) > 0) && (
        <section className="mt-12 pt-8 border-t border-outline-variant/20 space-y-8">
          {(article.related_ingredients?.length ?? 0) > 0 && (
            <div>
              <h3 className="label-caps text-outline mb-3 flex items-center gap-1.5">
                <span className="material-icon material-icon-sm" aria-hidden="true">science</span>
                İlgili İçerikler
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.related_ingredients!.map((ing) => (
                  <Link
                    key={ing.ingredient_id}
                    href={`/icerikler/${ing.ingredient_slug}`}
                    className="curator-card px-3 py-2 text-xs text-on-surface hover:text-primary transition-colors"
                  >
                    <span className="font-medium">{ing.inci_name}</span>
                    {ing.common_name && (
                      <span className="text-outline ml-1.5">{ing.common_name}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(article.related_needs?.length ?? 0) > 0 && (
            <div>
              <h3 className="label-caps text-outline mb-3 flex items-center gap-1.5">
                <span className="material-icon material-icon-sm" aria-hidden="true">target</span>
                İlgili İhtiyaçlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.related_needs!.map((need) => (
                  <Link
                    key={need.need_id}
                    href={`/ihtiyaclar/${need.need_slug}`}
                    className="curator-card px-3 py-2 text-xs text-on-surface hover:text-primary transition-colors"
                  >
                    {need.user_friendly_label || need.need_name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(article.related_products?.length ?? 0) > 0 && (
            <div>
              <h3 className="label-caps text-outline mb-3 flex items-center gap-1.5">
                <span className="material-icon material-icon-sm" aria-hidden="true">inventory_2</span>
                İlgili Ürünler
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {article.related_products!.map((p) => (
                  <Link
                    key={p.product_id}
                    href={`/urunler/${p.product_slug}`}
                    className="curator-card p-3 group hover:bg-surface-container-low transition-colors"
                  >
                    {p.brand_name && (
                      <p className="label-caps text-outline mb-0.5">{p.brand_name}</p>
                    )}
                    <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                      {p.product_name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Back link */}
      <div className="mt-12 pt-8 border-t border-outline-variant/20">
        <Link
          href="/rehber"
          className="label-caps text-primary hover:underline underline-offset-4 flex items-center gap-1"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">arrow_back</span>
          Tum rehberler
        </Link>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.summary || '',
            datePublished: article.published_at,
            publisher: {
              '@type': 'Organization',
              name: 'REVELA',
              url: 'https://kozmetikplatform.com',
            },
          }),
        }}
      />
    </div>
  );
}
